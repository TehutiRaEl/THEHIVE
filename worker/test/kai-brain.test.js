// worker/test/kai-brain.test.js
//
// Drives Kai El's brain (2026-08-10) against the real exported functions, not a
// reimplementation. Three things here are security-relevant rather than merely
// functional, and each is asserted in BOTH directions on purpose:
//
//   1. switchOn() must fail CLOSED — a typo, an empty string, or 'off' must never
//      read as a granted capability.
//   2. logDecision() must refuse a high-risk row with no reason/handling, because
//      the founder asked for that explanation by name and a prompt-only rule is one
//      bad generation away from losing it.
//   3. fourDBrain() must stay inert while 4DBRAIN is unhosted, and must report a
//      colony that answered 500 differently from a colony that does not exist.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  KAI_SWITCHES, switchOn, autonomyState, kaiBrainOk,
  kaiRecall, recencyWeight, RECENCY_HALF_LIFE_DAYS, RECENCY_FLOOR,
  logDecision, logTrainingSample, fourDBrain, kaiRemember,
} from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// A KAI_BRAIN stub that records every bound statement so a test can assert what
// would really have been written, rather than trusting a return value.
function stubBrain({ fail = false, rows = [] } = {}) {
  const writes = [];
  return {
    writes,
    prepare(sql) {
      return {
        bind: (...args) => ({
          run: async () => {
            if (fail) throw new Error('d1 down');
            writes.push({ sql, args });
            return { meta: { last_row_id: writes.length } };
          },
        }),
        all: async () => ({ results: rows }),
        first: async () => rows[0] ?? null,
        run: async () => ({ meta: { last_row_id: 0 } }),
      };
    },
  };
}

const ON = (extra = {}) => ({ KAI_BRAIN: stubBrain(), KAI_BRAIN_WRITE: 'on', ...extra });

describe('switchOn — fails closed', () => {
  const on = ['on', 'ON', 'true', 'TRUE', '1', 'yes', ' on '];
  const off = [undefined, null, '', ' ', 'off', 'false', '0', 'no', 'enabled', 'onn', 'o n', 'On!', 2, 'disabled'];

  for (const v of on) {
    test(`grants on ${JSON.stringify(v)}`, () => {
      assert.equal(switchOn({ K: v }, 'K'), true);
    });
  }
  for (const v of off) {
    test(`denies on ${JSON.stringify(v)}`, () => {
      assert.equal(switchOn({ K: v }, 'K'), false);
    });
  }
  test('boolean true is honoured (a var set programmatically, not from a string env)', () => {
    assert.equal(switchOn({ K: true }, 'K'), true);
  });
  test('an absent env object does not throw', () => {
    assert.equal(switchOn(undefined, 'K'), false);
  });
});

describe('autonomyState — every switch reported, all off by default', () => {
  test('an empty env reports every switch as false', () => {
    const st = autonomyState({});
    assert.deepEqual(Object.keys(st).sort(), [...KAI_SWITCHES].sort());
    assert.equal(Object.values(st).every(v => v === false), true);
  });
  test('financial autonomy is present in the ladder but off', () => {
    assert.ok(KAI_SWITCHES.includes('KAI_FINANCIAL_AUTONOMY'));
    assert.equal(autonomyState({}).KAI_FINANCIAL_AUTONOMY, false);
  });
  test('one switch on does not turn on any other', () => {
    const st = autonomyState({ KAI_BRAIN_WRITE: 'on' });
    assert.equal(st.KAI_BRAIN_WRITE, true);
    assert.equal(Object.entries(st).filter(([, v]) => v).length, 1);
  });
});

describe('recencyWeight — discounts age without letting it dominate', () => {
  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  test('a brand-new memory keeps its full score', () => {
    assert.ok(Math.abs(recencyWeight(daysAgo(0), now) - 1) < 1e-6);
  });
  test('one half-life lands exactly halfway between the floor and 1', () => {
    const w = recencyWeight(daysAgo(RECENCY_HALF_LIFE_DAYS), now);
    assert.ok(Math.abs(w - (RECENCY_FLOOR + (1 - RECENCY_FLOOR) * 0.5)) < 1e-6);
  });
  test('an ancient memory decays toward the floor but never below it', () => {
    const w = recencyWeight(daysAgo(3650), now);
    assert.ok(w >= RECENCY_FLOOR, `${w} >= ${RECENCY_FLOOR}`);
    assert.ok(w < RECENCY_FLOOR + 0.001);
  });
  test('weight decreases monotonically with age', () => {
    const ws = [0, 1, 7, 14, 60, 365].map(d => recencyWeight(daysAgo(d), now));
    for (let i = 1; i < ws.length; i++) assert.ok(ws[i] < ws[i - 1], `${ws[i]} < ${ws[i - 1]}`);
  });
  test('an unparseable or missing ts is not penalised (no silent demotion)', () => {
    assert.equal(recencyWeight('', now), 1);
    assert.equal(recencyWeight('not-a-date', now), 1);
    assert.equal(recencyWeight(undefined, now), 1);
  });
  test('a future timestamp is clamped, never rewarded above 1', () => {
    const future = new Date(now + 86400000 * 30).toISOString();
    assert.equal(recencyWeight(future, now), 1);
  });
});

describe('kaiRecall — re-ranks, and does not let recency override relevance', () => {
  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  // env with a Vectorize stub returning fixed matches in similarity order
  const envWith = (matches) => ({
    AI: { run: async () => ({ data: [[0.1, 0.2, 0.3]] }) },
    VECTORIZE: { query: async () => ({ matches }) },
  });

  test('a fresh, near-equal match overtakes a stale one', async () => {
    const out = await kaiRecall(envWith([
      { score: 0.90, metadata: { text: 'STALE', kind: 'chat', ts: daysAgo(400) } },
      { score: 0.86, metadata: { text: 'FRESH', kind: 'chat', ts: daysAgo(0) } },
    ]), 'q', 2);
    assert.equal(out.available, true);
    assert.equal(out.reranked, true);
    assert.equal(out.matches[0].text, 'FRESH', 'a 0.86 today should beat a 0.90 from 400 days ago');
  });

  test('a decisively better old match still wins — recency discounts, it does not replace', async () => {
    const out = await kaiRecall(envWith([
      { score: 0.99, metadata: { text: 'OLD-BUT-RIGHT', kind: 'chat', ts: daysAgo(400) } },
      { score: 0.20, metadata: { text: 'NEW-BUT-IRRELEVANT', kind: 'chat', ts: daysAgo(0) } },
    ]), 'q', 2);
    assert.equal(out.matches[0].text, 'OLD-BUT-RIGHT',
      'ranking purely by recency would be exactly as broken as ranking purely by similarity');
  });

  test('the original similarity is preserved alongside the adjusted score', async () => {
    const out = await kaiRecall(envWith([
      { score: 0.80, metadata: { text: 'A', kind: 'chat', ts: daysAgo(400) } },
    ]), 'q', 1);
    assert.equal(out.matches[0].similarity, 0.8);
    assert.ok(out.matches[0].score < out.matches[0].similarity);
    assert.ok(out.matches[0].recency_weight < 1);
  });

  test('it over-fetches before truncating, so re-ranking can actually promote', async () => {
    let askedTopK = null;
    const env = {
      AI: { run: async () => ({ data: [[0.1]] }) },
      VECTORIZE: { query: async (_v, opts) => { askedTopK = opts.topK; return { matches: [] }; } },
    };
    await kaiRecall(env, 'q', 3);
    assert.ok(askedTopK > 3, `asked Vectorize for ${askedTopK}, must exceed the requested 3`);
  });

  test('no Vectorize binding degrades cleanly instead of throwing', async () => {
    const out = await kaiRecall({}, 'q', 3);
    assert.equal(out.available, false);
    assert.equal(out.reranked, false);
    assert.deepEqual(out.matches, []);
  });
});

describe('logDecision — the high-risk explanation is enforced in code, not just prompted', () => {
  test('a high-risk row WITHOUT reason and handling is refused', async () => {
    const r = await logDecision(ON(), { surface: 'roadmap', request: 'delete prod', risk_tier: 'high' });
    assert.equal(r.logged, false);
    assert.match(r.error, /risk_reason and risk_handling/);
  });
  test('a high-risk row missing only handling is still refused', async () => {
    const r = await logDecision(ON(), {
      surface: 'roadmap', request: 'delete prod', risk_tier: 'high', risk_reason: 'destroys data',
    });
    assert.equal(r.logged, false);
  });
  test('a high-risk row WITH both is accepted', async () => {
    const env = ON();
    const r = await logDecision(env, {
      surface: 'roadmap', request: 'delete prod', risk_tier: 'high',
      risk_reason: 'irreversible data loss', risk_handling: 'founder runs it manually after a backup',
    });
    assert.equal(r.logged, true);
    assert.equal(env.KAI_BRAIN.writes.length, 1);
  });
  test('an unrecognised risk tier falls back to normal, never to low', async () => {
    const env = ON();
    await logDecision(env, { surface: 'chat', request: 'x', risk_tier: 'trivial' });
    assert.equal(env.KAI_BRAIN.writes[0].args[6], 'normal');
  });
  test('nothing is written when the write switch is off', async () => {
    const env = { KAI_BRAIN: stubBrain() };  // bound, but KAI_BRAIN_WRITE unset
    const r = await logDecision(env, { surface: 'chat', request: 'x' });
    assert.equal(r.logged, false);
    assert.equal(env.KAI_BRAIN.writes.length, 0);
  });
  test('nothing is written when the brain is unbound', async () => {
    assert.equal((await logDecision({ KAI_BRAIN_WRITE: 'on' }, { request: 'x' })).logged, false);
  });
  test('a D1 failure is reported, never thrown into the caller', async () => {
    const r = await logDecision(
      { KAI_BRAIN: stubBrain({ fail: true }), KAI_BRAIN_WRITE: 'on' },
      { surface: 'chat', request: 'x' },
    );
    assert.equal(r.logged, false);
    assert.match(r.error, /d1 down/);
  });
});

describe('logTrainingSample — accumulates, but never self-promotes to training data', () => {
  test('the INSERT does not set eligible, leaving the schema default of 0', async () => {
    const env = ON();
    await logTrainingSample(env, { user_input: 'a', assistant_output: 'b' });
    assert.equal(env.KAI_BRAIN.writes.length, 1);
    assert.equal(/eligible/i.test(env.KAI_BRAIN.writes[0].sql), false,
      'a logged exchange must not silently become training material');
  });
  test('respects the write switch', async () => {
    const env = { KAI_BRAIN: stubBrain() };
    assert.equal((await logTrainingSample(env, { user_input: 'a', assistant_output: 'b' })).logged, false);
    assert.equal(env.KAI_BRAIN.writes.length, 0);
  });
});

describe('kaiRemember — writes the full text, not the 512-char slice', () => {
  test('the complete text reaches D1 even when it is far past Vectorize metadata limits', async () => {
    const env = ON({ AI: null, VECTORIZE: null });
    const long = 'x'.repeat(5000);
    const r = await kaiRemember(env, { id: 'm1', kind: 'chat', text: long });
    assert.equal(r.stored, true);
    assert.equal(env.KAI_BRAIN.writes[0].args[3].length, 5000);
  });
  test('a failed vector write still stores the memory, with vector_id null', async () => {
    const env = ON({ AI: null, VECTORIZE: null });
    const r = await kaiRemember(env, { id: 'm2', kind: 'chat', text: 'hello' });
    assert.equal(r.stored, true);
    assert.equal(r.vector, false);
    assert.equal(env.KAI_BRAIN.writes[0].args[8], null, 'vector_id must be null when no vector was stored');
  });
  test('off by default — no write switch means no write', async () => {
    const env = { KAI_BRAIN: stubBrain() };
    assert.equal((await kaiRemember(env, { id: 'm', kind: 'chat', text: 't' })).stored, false);
  });
});

describe('fourDBrain — inert while the colony is unhosted, honest when it answers', () => {
  test('the switch being off short-circuits before any network call', async () => {
    globalThis.fetch = () => { throw new Error('must not be called'); };
    const r = await fourDBrain({ FOURDBRAIN_URL: 'https://example.invalid' }, '/api/tesseract/status');
    assert.equal(r.available, false);
    assert.match(r.reason, /KAI_4DBRAIN_BRIDGE is off/);
  });
  test('switch on but no URL reports the real reason: 4DBRAIN is not deployed', async () => {
    globalThis.fetch = () => { throw new Error('must not be called'); };
    const r = await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on' }, '/api/tesseract/status');
    assert.equal(r.available, false);
    assert.match(r.reason, /not deployed anywhere yet/);
  });
  test('a 500 from a real colony is NOT collapsed into "no colony"', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => '{"detail":"boom"}' });
    const r = await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on', FOURDBRAIN_URL: 'https://four.example' }, '/x');
    assert.equal(r.available, false);
    assert.equal(r.status, 500, 'the real status must survive — "answered 500" and "does not exist" are different facts');
    assert.equal(r.data.detail, 'boom');
  });
  test('a successful call returns parsed data', async () => {
    globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => '{"rotation":"ok"}' });
    const r = await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on', FOURDBRAIN_URL: 'https://four.example/' }, '/api/tesseract/status');
    assert.equal(r.available, true);
    assert.equal(r.data.rotation, 'ok');
  });
  test('a trailing slash on the URL does not produce a doubled slash', async () => {
    let seen = null;
    globalThis.fetch = async (u) => { seen = u; return { ok: true, status: 200, text: async () => '{}' }; };
    await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on', FOURDBRAIN_URL: 'https://four.example/' }, '/api/x');
    assert.equal(seen, 'https://four.example/api/x');
  });
  test('non-JSON is returned as raw text rather than crashing the caller', async () => {
    globalThis.fetch = async () => ({ ok: true, status: 200, text: async () => '<html>nope</html>' });
    const r = await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on', FOURDBRAIN_URL: 'https://four.example' }, '/x');
    assert.equal(r.available, true);
    assert.match(r.data.raw, /nope/);
  });
  test('a network error is reported, never thrown', async () => {
    globalThis.fetch = async () => { throw new Error('ECONNREFUSED'); };
    const r = await fourDBrain({ KAI_4DBRAIN_BRIDGE: 'on', FOURDBRAIN_URL: 'https://four.example' }, '/x');
    assert.equal(r.available, false);
    assert.match(r.reason, /ECONNREFUSED/);
  });
});

describe('kaiBrainOk', () => {
  test('false without the binding, true with it', () => {
    assert.equal(kaiBrainOk({}), false);
    assert.equal(kaiBrainOk(undefined), false);
    assert.equal(kaiBrainOk({ KAI_BRAIN: stubBrain() }), true);
  });
});
