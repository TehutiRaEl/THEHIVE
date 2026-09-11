// worker/test/nanuet-brain.test.js
//
// Drives Nanuet's brain (Phase Q-A, 2026-08-19) against the real exported
// functions, not a reimplementation. Mirrors kai-brain.test.js deliberately —
// same stub shape, same zero-dependency node:test style — because the code it
// covers is deliberately a mirror of Kai El's.
//
// Five things here are security- or correctness-relevant rather than merely
// functional, and each is asserted in BOTH directions on purpose:
//
//   1. Every switch must default OFF, and switchOn() must fail CLOSED. Nanuet is
//      the one agent with no superior (reports_to IS NULL), so a switch that
//      reads as granted on a typo has nothing above it to catch the mistake.
//   2. An UNPROVISIONED database must degrade honestly — a clear reason, never a
//      throw. This is the state production is actually in today.
//   3. "Database missing" and "switch off" must stay DISTINCT reasons. Collapsing
//      two different facts into one answer is the bug task 45 already cost this
//      repo once.
//   4. nanuetRecall() must be recency-weighted FROM THE START (Kai El's shipped
//      without it and needed a follow-up fix) AND must not return another agent's
//      memories from the shared Vectorize index.
//   5. logQueenReview() must add nothing to what the Queen may decide — it is a
//      record of a decision that already happened, gated three ways.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';
import { installCaches, stubCtx, req } from './helpers/env.js';
import {
  NANUET_SWITCHES, NANUET_PREEXISTING_SWITCHES,
  nanuetBrainOk, nanuetAutonomyState, nanuetWriteBlockedReason,
  nanuetRemember, nanuetRecall, logNanuetDecision, logQueenReview,
  switchOn, recencyWeight, RECENCY_HALF_LIFE_DAYS, RECENCY_FLOOR,
} from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

// A NANUET_BRAIN stub that records every bound statement so a test can assert
// what would really have been written, rather than trusting a return value.
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
          first: async () => rows[0] ?? null,
          all: async () => ({ results: rows }),
        }),
        all: async () => ({ results: rows }),
        first: async () => { if (fail) throw new Error('d1 down'); return rows[0] ?? null; },
        run: async () => ({ meta: { last_row_id: 0 } }),
      };
    },
  };
}

// Bound + stage-1 on. The default state in production is neither of these.
const ON = (extra = {}) => ({ NANUET_BRAIN: stubBrain(), NANUET_BRAIN_WRITE: 'on', ...extra });

// ─────────────────────────────────────────────────────────────────────────
describe('NANUET_SWITCHES — every switch reported, all off by default', () => {
  test('an empty env reports every switch as false', () => {
    const st = nanuetAutonomyState({});
    assert.deepEqual(Object.keys(st).sort(), [...NANUET_SWITCHES].sort());
    assert.equal(Object.values(st).every(v => v === false), true);
  });

  test('the ladder contains the two built stages and the four unbuilt destinations', () => {
    assert.deepEqual(NANUET_SWITCHES, [
      'NANUET_BRAIN_WRITE',
      'NANUET_REVIEW_LOG',
      'NANUET_DOMAIN_ROUTING',
      'NANUET_CAMPAIGN_OBSERVE',
      'NANUET_CAMPAIGN_ADVISE',
      'NANUET_DELEGATE_AKOSHA',
    ]);
  });

  test('no financial switch was invented — the founder never asked for one for Nanuet', () => {
    assert.equal(NANUET_SWITCHES.some(k => /FINANC|PAY|SPEND|WALLET|MONEY/i.test(k)), false);
  });

  test('turning one switch on does not turn on any other', () => {
    const st = nanuetAutonomyState({ NANUET_BRAIN_WRITE: 'on' });
    assert.equal(st.NANUET_BRAIN_WRITE, true);
    assert.equal(Object.entries(st).filter(([, v]) => v).length, 1);
  });

  test('the ladder never silently absorbs the pre-existing Queen switch', () => {
    // QUEEN_AUTONOMOUS_APPROVAL is reported next to the ladder, never inside it.
    // If it ever appeared in NANUET_SWITCHES, this phase would be claiming to own
    // a power that predates it.
    assert.ok(NANUET_PREEXISTING_SWITCHES.includes('QUEEN_AUTONOMOUS_APPROVAL'));
    assert.equal(NANUET_SWITCHES.includes('QUEEN_AUTONOMOUS_APPROVAL'), false);
  });

  test('switchOn fails closed for every Nanuet switch, on every near-miss value', () => {
    for (const k of NANUET_SWITCHES) {
      for (const v of [undefined, '', ' ', 'off', 'false', '0', 'no', 'onn', 'On!', 'enabled']) {
        assert.equal(switchOn({ [k]: v }, k), false, `${k}=${JSON.stringify(v)} must be OFF`);
      }
      assert.equal(switchOn({ [k]: 'on' }, k), true, `${k}='on' must be ON`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('nanuetBrainOk / nanuetWriteBlockedReason — unprovisioned is a first-class state', () => {
  test('false without the binding, true with it', () => {
    assert.equal(nanuetBrainOk({}), false);
    assert.equal(nanuetBrainOk(undefined), false);
    assert.equal(nanuetBrainOk({ NANUET_BRAIN: stubBrain() }), true);
  });

  test('an absent database is reported as NOT PROVISIONED, not as a switch problem', () => {
    const reason = nanuetWriteBlockedReason({ NANUET_BRAIN_WRITE: 'on' });
    assert.match(reason, /not provisioned/i);
    assert.match(reason, /does not exist/i);
  });

  test('a bound database with the switch off names the SWITCH, not the database', () => {
    const reason = nanuetWriteBlockedReason({ NANUET_BRAIN: stubBrain() });
    assert.match(reason, /NANUET_BRAIN_WRITE is off/);
    assert.equal(/not provisioned/i.test(reason), false,
      '"no database" and "switch off" are different facts and must not collapse into one');
  });

  test('bound AND switched on is not blocked at all', () => {
    assert.equal(nanuetWriteBlockedReason(ON()), null);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('nanuetRemember — writes the full text, degrades honestly when unprovisioned', () => {
  test('the complete text reaches D1 even when far past Vectorize metadata limits', async () => {
    const env = ON({ AI: null, VECTORIZE: null });
    const long = 'x'.repeat(5000);
    const r = await nanuetRemember(env, { id: 'n1', kind: 'proposal-review', text: long });
    assert.equal(r.stored, true);
    assert.equal(env.NANUET_BRAIN.writes[0].args[3].length, 5000);
  });

  test('a failed vector write still stores the memory, with vector_id null', async () => {
    const env = ON({ AI: null, VECTORIZE: null });
    const r = await nanuetRemember(env, { id: 'n2', kind: 'chat', text: 'hello' });
    assert.equal(r.stored, true);
    assert.equal(r.vector, false);
    assert.equal(env.NANUET_BRAIN.writes[0].args[8], null);
  });

  test("the row is written as Nanuet's, not Kai El's", async () => {
    const env = ON({ AI: null, VECTORIZE: null });
    await nanuetRemember(env, { id: 'n3', kind: 'chat', text: 't' });
    assert.equal(env.NANUET_BRAIN.writes[0].args[1], 'Nanuet');
  });

  test('off by default — no write switch means no write', async () => {
    const env = { NANUET_BRAIN: stubBrain() };
    const r = await nanuetRemember(env, { id: 'n', kind: 'chat', text: 't' });
    assert.equal(r.stored, false);
    assert.equal(env.NANUET_BRAIN.writes.length, 0);
  });

  test('an unprovisioned database does not throw — it explains', async () => {
    const r = await nanuetRemember({ NANUET_BRAIN_WRITE: 'on' }, { id: 'n', kind: 'chat', text: 't' });
    assert.equal(r.stored, false);
    assert.match(r.reason, /not provisioned/i);
  });

  test('called with no argument object at all, it still does not throw', async () => {
    const r = await nanuetRemember({});
    assert.equal(r.stored, false);
  });

  test('a D1 failure is reported, never thrown into the caller', async () => {
    const env = { NANUET_BRAIN: stubBrain({ fail: true }), NANUET_BRAIN_WRITE: 'on', AI: null, VECTORIZE: null };
    const r = await nanuetRemember(env, { id: 'n', kind: 'chat', text: 't' });
    assert.equal(r.stored, false);
    assert.match(r.error, /d1 down/);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('nanuetRecall — recency-weighted from the start, and scoped to her own memories', () => {
  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();
  const envWith = (matches) => ({
    AI: { run: async () => ({ data: [[0.1, 0.2, 0.3]] }) },
    VECTORIZE: { query: async () => ({ matches }) },
  });
  const m = (text, score, days, agent = 'Nanuet') =>
    ({ score, metadata: { text, kind: 'chat', ts: daysAgo(days), agent } });

  test('a fresh, near-equal match overtakes a stale one', async () => {
    const out = await nanuetRecall(envWith([m('STALE', 0.90, 400), m('FRESH', 0.86, 0)]), 'q', 2);
    assert.equal(out.available, true);
    assert.equal(out.reranked, true);
    assert.equal(out.matches[0].text, 'FRESH',
      'the known Kai El bug — pure cosine similarity ignoring ts — must not be inherited');
  });

  test('a decisively better old match still wins — recency discounts, it does not replace', async () => {
    const out = await nanuetRecall(envWith([m('OLD-BUT-RIGHT', 0.99, 400), m('NEW-BUT-IRRELEVANT', 0.20, 0)]), 'q', 2);
    assert.equal(out.matches[0].text, 'OLD-BUT-RIGHT');
  });

  test('the original similarity is preserved alongside the adjusted score', async () => {
    const out = await nanuetRecall(envWith([m('A', 0.80, 400)]), 'q', 1);
    assert.equal(out.matches[0].similarity, 0.8);
    assert.ok(out.matches[0].score < out.matches[0].similarity);
    assert.ok(out.matches[0].recency_weight < 1);
  });

  test("Kai El's memories are excluded — a brain that answers with someone else's is not her own", async () => {
    const out = await nanuetRecall(envWith([
      m('KAI-TOP-HIT', 0.99, 0, 'Kai El'),
      m('NANUET-ROW', 0.40, 0, 'Nanuet'),
    ]), 'q', 5);
    assert.equal(out.matches.length, 1);
    assert.equal(out.matches[0].text, 'NANUET-ROW');
    assert.equal(out.filtered_to, 'Nanuet');
  });

  test('an untagged memory is excluded — the filter fails closed, never open', async () => {
    const out = await nanuetRecall(envWith([m('UNTAGGED', 0.99, 0, '')]), 'q', 5);
    assert.deepEqual(out.matches, []);
  });

  test('it over-fetches before filtering and truncating, so re-ranking can actually promote', async () => {
    let askedTopK = null;
    const env = {
      AI: { run: async () => ({ data: [[0.1]] }) },
      VECTORIZE: { query: async (_v, opts) => { askedTopK = opts.topK; return { matches: [] }; } },
    };
    await nanuetRecall(env, 'q', 3);
    assert.ok(askedTopK > 3, `asked Vectorize for ${askedTopK}, must exceed the requested 3`);
    assert.ok(askedTopK <= 100, "must not exceed Vectorize's own topK ceiling");
  });

  test('the over-fetch is capped even for an absurd topK', async () => {
    let askedTopK = null;
    const env = {
      AI: { run: async () => ({ data: [[0.1]] }) },
      VECTORIZE: { query: async (_v, opts) => { askedTopK = opts.topK; return { matches: [] }; } },
    };
    await nanuetRecall(env, 'q', 500);
    assert.ok(askedTopK <= 100, `asked for ${askedTopK}`);
  });

  test('topK is honoured after filtering', async () => {
    const out = await nanuetRecall(envWith([
      m('a', 0.9, 0), m('b', 0.8, 0), m('c', 0.7, 0), m('d', 0.6, 0),
    ]), 'q', 2);
    assert.equal(out.matches.length, 2);
  });

  test('no Vectorize binding degrades cleanly instead of throwing', async () => {
    const out = await nanuetRecall({}, 'q', 3);
    assert.equal(out.available, false);
    assert.equal(out.reranked, false);
    assert.deepEqual(out.matches, []);
  });

  test('it uses the same decay curve as Kai El, not a second one that can drift', async () => {
    const out = await nanuetRecall(envWith([m('A', 1.0, RECENCY_HALF_LIFE_DAYS)]), 'q', 1);
    const expected = RECENCY_FLOOR + (1 - RECENCY_FLOOR) * 0.5;
    assert.ok(Math.abs(out.matches[0].recency_weight - expected) < 1e-3);
    assert.ok(Math.abs(recencyWeight(daysAgo(RECENCY_HALF_LIFE_DAYS), now) - expected) < 1e-6);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('logNanuetDecision — the high-risk explanation is enforced in code, not just prompted', () => {
  test('a high-risk row WITHOUT reason and handling is refused', async () => {
    const r = await logNanuetDecision(ON(), { surface: 'governance', request: 'amend soul.md', risk_tier: 'high' });
    assert.equal(r.logged, false);
    assert.match(r.error, /risk_reason and risk_handling/);
  });

  test('a high-risk row missing only handling is still refused', async () => {
    const r = await logNanuetDecision(ON(), {
      surface: 'governance', request: 'amend soul.md', risk_tier: 'high', risk_reason: 'constitutional',
    });
    assert.equal(r.logged, false);
  });

  test('a high-risk row WITH both is accepted', async () => {
    const env = ON();
    const r = await logNanuetDecision(env, {
      surface: 'governance', request: 'amend soul.md', risk_tier: 'high',
      risk_reason: 'changes immutable law', risk_handling: 'founder ratifies via the amendment process',
    });
    assert.equal(r.logged, true);
    assert.equal(env.NANUET_BRAIN.writes.length, 1);
  });

  test('an unrecognised risk tier falls back to normal, never to low', async () => {
    const env = ON();
    await logNanuetDecision(env, { surface: 'chat', request: 'x', risk_tier: 'trivial' });
    assert.equal(env.NANUET_BRAIN.writes[0].args[6], 'normal');
  });

  test('the row is attributed to Nanuet by default', async () => {
    const env = ON();
    await logNanuetDecision(env, { request: 'x' });
    assert.equal(env.NANUET_BRAIN.writes[0].args[0], 'Nanuet');
  });

  test('an alignment score is stored as a real number, clamped to 0-100', async () => {
    const env = ON();
    await logNanuetDecision(env, { request: 'a', alignment_score: 98 });
    await logNanuetDecision(env, { request: 'b', alignment_score: 140 });
    await logNanuetDecision(env, { request: 'c', alignment_score: -7 });
    await logNanuetDecision(env, { request: 'd', alignment_score: 61.6 });
    const scores = env.NANUET_BRAIN.writes.map(w => w.args[12]);
    assert.deepEqual(scores, [98, 100, 0, 62]);
  });

  test('a missing or non-numeric score is stored as NULL, never as 0', async () => {
    const env = ON();
    await logNanuetDecision(env, { request: 'a' });
    await logNanuetDecision(env, { request: 'b', alignment_score: 'high' });
    assert.equal(env.NANUET_BRAIN.writes[0].args[12], null,
      'storing 0 for "no score" would make an unscored proposal read as maximally misaligned');
    assert.equal(env.NANUET_BRAIN.writes[1].args[12], null);
  });

  test('the subject is recorded so a decision is traceable to what it decided', async () => {
    const env = ON();
    await logNanuetDecision(env, { request: 'x', subject_kind: 'proposal', subject_id: 42 });
    assert.equal(env.NANUET_BRAIN.writes[0].args[10], 'proposal');
    assert.equal(env.NANUET_BRAIN.writes[0].args[11], '42');
  });

  test('outcome is NOT written at decision time — it is unknown and must stay NULL', async () => {
    const env = ON();
    await logNanuetDecision(env, { request: 'x', action: 'approved' });
    assert.equal(/\boutcome\b/i.test(env.NANUET_BRAIN.writes[0].sql), false,
      'a decision log that pre-fills its own outcomes is a log of intentions');
  });

  test('nothing is written when the write switch is off', async () => {
    const env = { NANUET_BRAIN: stubBrain() };
    const r = await logNanuetDecision(env, { surface: 'chat', request: 'x' });
    assert.equal(r.logged, false);
    assert.equal(env.NANUET_BRAIN.writes.length, 0);
  });

  test('nothing is written when the database does not exist', async () => {
    const r = await logNanuetDecision({ NANUET_BRAIN_WRITE: 'on' }, { request: 'x' });
    assert.equal(r.logged, false);
    assert.match(r.reason, /not provisioned/i);
  });

  test('a D1 failure is reported, never thrown into the caller', async () => {
    const r = await logNanuetDecision(
      { NANUET_BRAIN: stubBrain({ fail: true }), NANUET_BRAIN_WRITE: 'on' },
      { surface: 'chat', request: 'x' },
    );
    assert.equal(r.logged, false);
    assert.match(r.error, /d1 down/);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('logQueenReview — records a decision that already happened, three gates deep', () => {
  const REVIEW = { title: 'T', body: 'B', score: 99, reason: 'clearly serves the vision', decision: 'approved' };

  test('stage 2 off means nothing is written, even with stage 1 on', async () => {
    const env = ON();
    const r = await logQueenReview(env, REVIEW);
    assert.equal(r.logged, false);
    assert.match(r.reason, /NANUET_REVIEW_LOG is off/);
    assert.equal(env.NANUET_BRAIN.writes.length, 0);
  });

  test('stage 2 on without stage 1 still writes nothing', async () => {
    const env = { NANUET_BRAIN: stubBrain(), NANUET_REVIEW_LOG: 'on' };
    const r = await logQueenReview(env, REVIEW);
    assert.equal(r.logged, false);
    assert.match(r.reason, /NANUET_BRAIN_WRITE is off/);
    assert.equal(env.NANUET_BRAIN.writes.length, 0);
  });

  test('both stages on but no database still writes nothing', async () => {
    const r = await logQueenReview({ NANUET_BRAIN_WRITE: 'on', NANUET_REVIEW_LOG: 'on' }, REVIEW);
    assert.equal(r.logged, false);
    assert.match(r.reason, /not provisioned/i);
  });

  test('all three gates open: the score, the reason and the verdict are all recorded', async () => {
    const env = ON({ NANUET_REVIEW_LOG: 'on' });
    const r = await logQueenReview(env, { ...REVIEW, proposalId: 7 });
    assert.equal(r.logged, true);
    const args = env.NANUET_BRAIN.writes[0].args;
    assert.equal(args[2], 'proposal-review');       // surface
    assert.match(args[3], /T/);                     // request carries the title
    assert.equal(args[4], 'clearly serves the vision'); // reasoning
    assert.equal(args[5], 'approved');              // action / verdict
    assert.equal(args[10], 'proposal');             // subject_kind
    assert.equal(args[11], '7');                    // subject_id
    assert.equal(args[12], 99);                     // alignment_score
  });

  test('a review is never logged as low-risk — it can approve a proposal outright', async () => {
    const env = ON({ NANUET_REVIEW_LOG: 'on' });
    await logQueenReview(env, REVIEW);
    assert.equal(env.NANUET_BRAIN.writes[0].args[6], 'normal');
    assert.notEqual(env.NANUET_BRAIN.writes[0].args[6], 'low');
  });

  test('a very long proposal body is truncated in the log rather than dropped', async () => {
    const env = ON({ NANUET_REVIEW_LOG: 'on' });
    await logQueenReview(env, { ...REVIEW, body: 'y'.repeat(50000) });
    assert.ok(env.NANUET_BRAIN.writes[0].args[3].length < 2000);
    assert.match(env.NANUET_BRAIN.writes[0].args[3], /^T/);
  });

  test('called with no argument object at all, it does not throw', async () => {
    const r = await logQueenReview(ON({ NANUET_REVIEW_LOG: 'on' }));
    assert.equal(r.logged, true, 'an empty review still logs a row rather than crashing the decision path');
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('GET /v11/nanuet/brain — honest about an unprovisioned database', () => {
  test('unprovisioned answers 200 with provisioned:false and the real founder steps', async () => {
    const res = await worker.fetch(req('/nanuet/brain'), { DB: null }, stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.provisioned, false);
    assert.equal(b.write_enabled, false);
    assert.equal(b.review_log_enabled, false);
    assert.equal(b.counts, null);
    assert.match(b.note, /wrangler d1 create nanuet-brain/);
    assert.match(b.note, /nanuet-brain\.sql/);
  });

  test('it never 404s or 500s just because the database is missing', async () => {
    const res = await worker.fetch(req('/nanuet/brain'), {}, stubCtx());
    assert.equal(res.status, 200);
  });

  test('provisioned reports real counts and drops the not-provisioned notice', async () => {
    const env = {
      NANUET_BRAIN: stubBrain({ rows: [{ memories: 3, decisions: 2, training_samples: 0, training_eligible: 0 }] }),
    };
    const res = await worker.fetch(req('/nanuet/brain'), env, stubCtx());
    const b = await res.json();
    assert.equal(b.provisioned, true);
    assert.equal(b.counts.memories, 3);
    assert.equal(b.counts.decisions, 2);
    assert.equal(b.note, undefined);
  });

  test('a broken database is reported as an error, not as unprovisioned', async () => {
    const env = { NANUET_BRAIN: stubBrain({ fail: true }) };
    const res = await worker.fetch(req('/nanuet/brain'), env, stubCtx());
    const b = await res.json();
    assert.equal(b.provisioned, true, 'the binding exists — that is a different fact from the query failing');
    assert.match(b.error, /d1 down/);
  });

  test('the phase scope is stated in the response itself', async () => {
    const res = await worker.fetch(req('/nanuet/brain'), {}, stubCtx());
    const b = await res.json();
    assert.match(b.phase, /Q-A/);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('GET /v11/nanuet/autonomy — the ladder, with nothing on', () => {
  test('with nothing configured, every switch reports off and nothing is enabled', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), {}, stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.agent, 'Nanuet');
    assert.equal(b.provisioned, false);
    assert.deepEqual(b.enabled_now, []);
    assert.equal(Object.values(b.switches).every(v => v === false), true);
    assert.deepEqual(Object.keys(b.switches).sort(), [...NANUET_SWITCHES].sort());
  });

  test('the pre-existing Queen switch is reported separately, never inside the ladder', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), {}, stubCtx());
    const b = await res.json();
    assert.equal(b.pre_existing.QUEEN_AUTONOMOUS_APPROVAL, false);
    assert.equal('QUEEN_AUTONOMOUS_APPROVAL' in b.switches, false);
    assert.match(b.pre_existing_note, /does not change, gate, or depend on it/);
  });

  test('a switch that is actually set shows as enabled', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), { NANUET_BRAIN_WRITE: 'on' }, stubCtx());
    const b = await res.json();
    assert.deepEqual(b.enabled_now, ['NANUET_BRAIN_WRITE']);
  });

  test('the registry rows are joined with live env state and dependency blocking', async () => {
    const env = {
      NANUET_BRAIN: stubBrain({
        rows: [
          { key: 'NANUET_BRAIN_WRITE', stage: 1, title: 'a', description: 'd', turn_on_steps: 's', risk_note: 'r', requires: null },
          { key: 'NANUET_REVIEW_LOG', stage: 2, title: 'b', description: 'd', turn_on_steps: 's', risk_note: 'r', requires: 'NANUET_BRAIN_WRITE' },
        ],
      }),
    };
    const res = await worker.fetch(req('/nanuet/autonomy'), env, stubCtx());
    const b = await res.json();
    assert.equal(b.ladder.length, 2);
    assert.equal(b.ladder[0].enabled, false);
    assert.equal(b.ladder[1].blocked_by, 'NANUET_BRAIN_WRITE');
    assert.equal(b.next_stage.key, 'NANUET_BRAIN_WRITE');
  });

  test('a dependency stops blocking once its prerequisite is really on', async () => {
    const env = {
      NANUET_BRAIN_WRITE: 'on',
      NANUET_BRAIN: stubBrain({
        rows: [{ key: 'NANUET_REVIEW_LOG', stage: 2, title: 'b', description: 'd', turn_on_steps: 's', risk_note: 'r', requires: 'NANUET_BRAIN_WRITE' }],
      }),
    };
    const res = await worker.fetch(req('/nanuet/autonomy'), env, stubCtx());
    const b = await res.json();
    assert.equal(b.ladder[0].blocked_by, null);
  });

  test('the route works with no database at all — the ladder falls back to the switches', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), {}, stubCtx());
    const b = await res.json();
    assert.deepEqual(b.ladder, []);
    assert.ok(b.switches, 'the truth (everything off) is still reported without the registry');
  });

  test('the response never leaks a secret value, only names and booleans', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), { NANUET_BRAIN_WRITE: 'on', FOUNDER_KEY: 'super-secret' }, stubCtx());
    const text = await res.text();
    assert.equal(text.includes('super-secret'), false);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// The stubs above cannot catch this class of bug, and that is the point.
//
// nanuet-brain does not exist, so not one statement in this build has ever run
// against a real database. A D1 stub accepts any SQL and any number of bound
// arguments, so a column that the schema does not have, or a bind() arity that
// does not match its placeholders, would pass every test above and fail only on
// the founder's first real request — after the truth-level claim was already
// made. These read the real source and the real schema and compare them.
describe('code/schema agreement — the check a stub cannot make', () => {
  const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
  const schema = readFileSync(new URL('../schema/nanuet-brain.sql', import.meta.url), 'utf8');

  // Columns declared by one CREATE TABLE in the schema file.
  const schemaColumns = (table) => {
    const m = new RegExp(`CREATE TABLE IF NOT EXISTS ${table} \\(([\\s\\S]*?)\\n\\);`).exec(schema);
    assert.ok(m, `no CREATE TABLE for ${table} in nanuet-brain.sql`);
    return m[1]
      .split('\n')
      .map(l => l.replace(/--.*$/, '').trim())
      .filter(Boolean)
      .map(l => l.split(/\s+/)[0].replace(/,$/, ''))
      .filter(c => /^[a-z_]+$/.test(c));
  };

  // The INSERT inside one function in the real source.
  const insert = (fnName, table) => {
    const start = src.indexOf(`async function ${fnName}`);
    assert.ok(start > -1, `${fnName} not found`);
    const blk = src.slice(start, start + 2500);
    const cols = new RegExp(`INSERT (?:OR REPLACE )?INTO ${table} \\(([^)]*)\\)`).exec(blk);
    const vals = /VALUES \(([^)]*)\)/.exec(blk);
    assert.ok(cols && vals, `no INSERT INTO ${table} inside ${fnName}`);
    return {
      columns: cols[1].split(',').map(c => c.trim()).filter(Boolean),
      placeholders: (vals[1].match(/\?/g) || []).length,
    };
  };

  for (const [fn, table] of [['nanuetRemember', 'memories'], ['logNanuetDecision', 'decision_log']]) {
    test(`${fn}: every column it writes really exists in ${table}`, () => {
      const declared = schemaColumns(table);
      for (const c of insert(fn, table).columns) {
        assert.ok(declared.includes(c), `${fn} writes ${table}.${c}, which nanuet-brain.sql does not declare`);
      }
    });

    test(`${fn}: placeholder count matches column count for ${table}`, () => {
      const { columns, placeholders } = insert(fn, table);
      assert.equal(placeholders, columns.length,
        `${columns.length} columns but ${placeholders} placeholders — D1 would reject this on the first real call`);
    });
  }

  test('the Queen-specific columns are present in the schema, not just in the code', () => {
    const cols = schemaColumns('decision_log');
    for (const c of ['subject_kind', 'subject_id', 'alignment_score']) assert.ok(cols.includes(c), c);
  });

  test('autonomy_registry has NO enabled column — an agent that writes its own permissions has none', () => {
    const cols = schemaColumns('autonomy_registry');
    assert.equal(cols.includes('enabled'), false,
      'enablement must live only in deploy-time env vars Nanuet cannot write');
  });

  test('training_samples.eligible defaults to 0 — logging never self-promotes to training data', () => {
    assert.match(schema, /eligible\s+INTEGER NOT NULL DEFAULT 0/);
  });

  test('every switch in NANUET_SWITCHES has a seeded row in the autonomy ladder', () => {
    for (const k of NANUET_SWITCHES) {
      assert.ok(schema.includes(`'${k}'`), `${k} is a real switch with no row in autonomy_registry`);
    }
  });

  test('the ladder seed marks stages 3-6 as NOT BUILT rather than as working switches', () => {
    for (const k of ['NANUET_DOMAIN_ROUTING', 'NANUET_CAMPAIGN_OBSERVE', 'NANUET_CAMPAIGN_ADVISE', 'NANUET_DELEGATE_AKOSHA']) {
      const row = new RegExp(`'${k}'[\\s\\S]{0,600}?NOT BUILT`).test(schema);
      assert.ok(row, `${k}'s seeded description must say NOT BUILT`);
    }
  });

  test('wrangler.jsonc does NOT bind NANUET_BRAIN — the database does not exist and a live binding would fail the deploy', () => {
    const wrangler = readFileSync(new URL('../../wrangler.jsonc', import.meta.url), 'utf8');
    const uncommented = wrangler
      .split('\n')
      .filter(l => !l.trim().startsWith('//'))
      .join('\n');
    assert.equal(uncommented.includes('NANUET_BRAIN'), false,
      'an active D1 binding to a database that does not exist fails the deploy and takes the live Queen down');
    assert.ok(wrangler.includes('NANUET_BRAIN'), 'the commented block with the founder steps must still be there');
  });
});
