// worker/test/verdict-invariance.test.js
//
// QB-5 (BATCH-QB): prove a label never changes a verdict. Drives the real
// queenDecide() — exported for tests only in QB-5, same convention as the
// QB-2 exports — once with NANUET_DOMAIN_ROUTING on and once with it off,
// on the same proposal with the same stubbed generate() answers, and asserts
// IDENTICAL verdicts.
//
// Per binding amendment 5, each pair asserts more than verdict equality:
// row existence (exactly one decision_log row when a review happened, zero
// when it did not) AND the row's label + vision fields — the "on" row must
// carry the routing + vision annotation, the "off" row must record
// domain_verdict 'NOT-ROUTED' with every other routing/vision field null.
// A pair that differs is a real finding, not a test artifact: the routing
// code sits after the verdict is settled, inside a try/catch that can never
// break a decision — these tests are the evidence for that claim, not the
// claim itself.
//
// generate() is stubbed at the fetch layer (the QB-4 pattern): a real
// generate() call, a stubbed Claude provider returning a canned SCORE/REASON.
// Without the stub the pairs would prove nothing about scored proposals —
// the score would be whatever the live provider felt like that day.
//
// The seven pairs:
//   1. Aligned 99, clean edge-backend text -> approved in both runs.
//   2. Below-bar 95 -> left pending in both runs.
//   3. Treasury text at score 99 -> approved in BOTH runs: the spends-money
//      override records auto_approvable 0, but it must NOT change the verdict.
//   4. Elder veto (SCORE 99, then VERDICT: OBJECT) -> held in both runs,
//      with the identical elder note in both verdicts and both rows.
//   5. Refused routing at 99 (probe-spam text) -> approved in both runs:
//      a refusal is a routing answer, not a verdict.
//   6. No provider up -> pending in both runs, ZERO rows in both runs
//      (queenDecide writes no row when queenReview() returns null).
//   7. Switch 9 off entirely -> pending in both runs, ZERO rows in both:
//      the routing pass is inert when switch 9 is off, whatever the
//      routing switch says.
//
// The "must never" honesty limit (BATCH-QB amendment 3, recorded in the code
// above deriveVisionVerdict): the override is a keyword guard, not a proof.
// These pairs prove the LABEL never changes a verdict; they do not prove
// the guard cannot be dodged. That limit is a batch §9 item for QB-6's
// adversarial set, not a test gap to hide.

import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { installCaches } from './helpers/env.js';
import { stubDB } from './helpers/env.js';
import {
  queenDecide, ROUTING_SCHEMA,
} from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// A NANUET_BRAIN stub that records every bound statement so a test can assert
// what would really have been written (same shape as domain-routing.test.js
// and nanuet-brain.test.js — keep the three in sync if the INSERT changes).
function stubBrain() {
  const writes = [];
  return {
    writes,
    prepare(sql) {
      return {
        bind: (...args) => ({
          run: async () => {
            writes.push({ sql, args });
            return { meta: { last_row_id: writes.length } };
          },
          first: async () => null,
          all: async () => ({ results: [] }),
        }),
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ meta: { last_row_id: 0 } }),
      };
    },
  };
}

// The INSERT column order in logNanuetDecision() — the test reads the row by
// position, so a reordered INSERT fails loudly here instead of silently
// writing a domain label into the wrong column.
const INSERT_COLUMNS = [
  'agent', 'ts', 'surface', 'request', 'reasoning', 'action', 'risk_tier',
  'risk_reason', 'risk_handling', 'autonomy_mode', 'subject_kind', 'subject_id',
  'alignment_score', 'provider', 'tokens_in', 'tokens_out',
  'domain_label', 'domain_verdict', 'domain_matches', 'domain_margin',
  'auto_approvable', 'vision_override', 'vision_hash', 'routing_schema',
];
function decisionRows(brain) {
  return brain.writes.filter((x) => x.sql.includes('INSERT INTO decision_log'));
}
function assertOneRow(brain) {
  const rows = decisionRows(brain);
  assert.equal(rows.length, 1, 'exactly one decision_log row must be written');
  const row = {};
  INSERT_COLUMNS.forEach((col, i) => { row[col] = rows[0].args[i]; });
  return row;
}
function assertNoRows(brain) {
  assert.equal(decisionRows(brain).length, 0, 'no decision_log row may be written');
}

// Short fixed vision text (under the 4000-char prompt slice, so vision_hash is
// the sha256 of exactly this text — no truncation involved in the test).
const VISION_TEXT =
  'Grow honestly into a self-governing system that helps the founder build ' +
  'real, lawful value. Never claim a capability it does not have. Never act ' +
  'without the founder\'s real consent on anything irreversible.';
const VISION_HASH = createHash('sha256').update(VISION_TEXT, 'utf8').digest('hex');

const DECIDE_URL = 'https://thehive.sovereignhive.workers.dev/v11/nanuet/route';

// Stub generate() at the fetch layer: Claude answers with the canned text.
// (generate() itself is module-internal; this is the same stub point
// generate.test.js and domain-routing.test.js use — a real generate() call,
// a stubbed provider.)
function stubClaudeScore(scoreText) {
  globalThis.fetch = async (url) => {
    assert.ok(String(url).includes('api.anthropic.com'),
      `queenReview must call Claude, got ${url}`);
    return {
      ok: true, status: 200,
      json: async () => ({
        content: [{ text: scoreText }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
      text: async () => scoreText,
    };
  };
  return { reset() {} }; // same answer every call; nothing to reset
}

// Call-counting stub for the elder-veto pair: the FIRST generate() call in
// each run is queenReview's (SCORE: 99); every later call is an Elder's
// (VERDICT: OBJECT). reset() is called before each run of the pair so the
// count restarts — the two runs must see the same answers.
function stubClaudeSequence() {
  let n = 0;
  globalThis.fetch = async (url) => {
    assert.ok(String(url).includes('api.anthropic.com'),
      `generate() must call Claude, got ${url}`);
    n++;
    const text = n === 1
      ? 'SCORE: 99\nREASON: Serves the vision directly.'
      : 'VERDICT: OBJECT\nREASON: Concentrates too much authority.';
    return {
      ok: true, status: 200,
      json: async () => ({
        content: [{ text }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
      text: async () => text,
    };
  };
  return { reset() { n = 0; } };
}

// Guard stub for the no-provider and switch-9-off pairs: generate() must not
// be called at all there, so any fetch attempt fails the test loudly instead
// of touching the network.
function stubFetchGuard() {
  globalThis.fetch = async () => {
    throw new Error('fetch must not be called in this pair — no provider is up');
  };
  return { reset() {} };
}

function decideEnv(brain, extra = {}) {
  return {
    QUEEN_AUTONOMOUS_APPROVAL: 'on',
    NANUET_REVIEW_LOG: 'on',
    NANUET_BRAIN_WRITE: 'on',
    NANUET_BRAIN: brain,
    DB: stubDB(),
    ANTHROPIC_API_KEY: 'k',
    ASSETS: { fetch: async () => ({ ok: true, text: async () => VISION_TEXT }) },
    ...extra,
  };
}

// Run queenDecide() on the same proposal twice — routing on, routing off —
// with the same stubbed answers. deleteKeys names env keys to remove
// entirely from both runs (absent, not undefined — switch 9 and the provider
// key are presence-load-bearing). Returns both verdicts and both brains.
async function runPair({ title, body, stub, envExtra = {}, deleteKeys = [] }) {
  const brainOn = stubBrain();
  const envOn = decideEnv(brainOn, { NANUET_DOMAIN_ROUTING: 'on', ...envExtra });
  for (const k of deleteKeys) delete envOn[k];
  if (stub) stub.reset();
  const resOn = await queenDecide(envOn, DECIDE_URL, { title, body });
  const brainOff = stubBrain();
  const envOff = decideEnv(brainOff, { NANUET_DOMAIN_ROUTING: 'off', ...envExtra });
  for (const k of deleteKeys) delete envOff[k];
  if (stub) stub.reset();
  const resOff = await queenDecide(envOff, DECIDE_URL, { title, body });
  return { resOn, resOff, brainOn, brainOff };
}

// The verdict itself must be identical. qDecidedAt is a timestamp: it must
// be present-or-absent identically and a valid ISO string when present —
// the two runs happen milliseconds apart, so the values are not compared.
function assertSameVerdict(a, b) {
  assert.equal(a.qStatus, b.qStatus, 'qStatus must be identical with routing on vs off');
  assert.equal(a.qScore, b.qScore, 'qScore must be identical with routing on vs off');
  assert.equal(a.qDecidedBy, b.qDecidedBy, 'qDecidedBy must be identical with routing on vs off');
  assert.equal(a.elderNote, b.elderNote, 'elderNote must be identical with routing on vs off');
  assert.equal(a.qDecidedAt === null, b.qDecidedAt === null,
    'qDecidedAt presence must match with routing on vs off');
  if (a.qDecidedAt !== null) {
    assert.ok(!Number.isNaN(Date.parse(a.qDecidedAt)), 'qDecidedAt (routing on) must be a valid ISO timestamp');
    assert.ok(!Number.isNaN(Date.parse(b.qDecidedAt)), 'qDecidedAt (routing off) must be a valid ISO timestamp');
  }
}

// The "off" row: the review happened, but no routing annotation exists, so
// the row records domain_verdict 'NOT-ROUTED' and nulls everywhere else the
// annotation would go. The score and the decision must still match the "on" row.
function assertOffRow(row, { score, action }) {
  assert.equal(row.domain_verdict, 'NOT-ROUTED');
  assert.equal(row.domain_label, null);
  assert.equal(row.domain_matches, null);
  assert.equal(row.domain_margin, null);
  assert.equal(row.auto_approvable, null);
  assert.equal(row.vision_override, null);
  assert.equal(row.vision_hash, null);
  assert.equal(row.routing_schema, null);
  assert.equal(row.alignment_score, score);
  assert.equal(row.action, action);
}

describe('verdict invariance — a label never changes a verdict (QB-E05)', () => {
  test('pair 1: aligned 99, clean edge-backend text — approved in both runs', async () => {
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Fix the worker D1 binding so the staging brain binds on deploy',
      body: '',
      stub: stubClaudeScore('SCORE: 99\nREASON: Serves the vision directly.'),
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'approved');
    assert.equal(resOn.qScore, 99);
    assert.equal(resOn.qDecidedBy, 'queen');
    assert.equal(resOn.elderNote, null);
    const rowOn = assertOneRow(brainOn);
    assert.equal(rowOn.domain_label, 'edge-backend');
    assert.equal(rowOn.domain_verdict, 'SINGLE-DOMAIN');
    assert.equal(rowOn.auto_approvable, 1);
    assert.equal(rowOn.vision_override, null);
    assert.equal(rowOn.vision_hash, VISION_HASH);
    assert.equal(rowOn.routing_schema, ROUTING_SCHEMA);
    assert.equal(rowOn.alignment_score, 99);
    assert.equal(rowOn.action, 'approved');
    const rowOff = assertOneRow(brainOff);
    assertOffRow(rowOff, { score: 99, action: 'approved' });
  });

  test('pair 2: below-bar 95 — left pending in both runs', async () => {
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Fix the worker D1 binding so the staging brain binds on deploy',
      body: '',
      stub: stubClaudeScore('SCORE: 95\nREASON: Serves the vision with some ambiguity.'),
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'pending');
    assert.equal(resOn.qScore, 95);
    assert.equal(resOn.qDecidedBy, null);
    assert.equal(resOn.elderNote, null);
    const rowOn = assertOneRow(brainOn);
    assert.equal(rowOn.auto_approvable, 0, 'a 95 cannot auto-approve');
    assert.equal(rowOn.vision_override, null);
    assert.equal(rowOn.action, 'left pending');
    const rowOff = assertOneRow(brainOff);
    assertOffRow(rowOff, { score: 95, action: 'left pending' });
  });

  test('pair 3: treasury text at score 99 — approved in BOTH runs, override only annotates', async () => {
    // The load-bearing pair: the spends-money override records
    // auto_approvable 0, but the verdict is the score's verdict. If the
    // override ever changed a verdict, this pair is where it shows.
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Move funds to the new vendor wallet',
      body: '',
      stub: stubClaudeScore('SCORE: 99\nREASON: Clearly serves the vision.'),
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'approved', 'the override annotates; it does not veto');
    assert.equal(resOn.qScore, 99);
    const rowOn = assertOneRow(brainOn);
    assert.equal(rowOn.domain_verdict, 'REFUSED-NO-MATCH');
    assert.equal(rowOn.auto_approvable, 0);
    assert.equal(rowOn.vision_override, 'spends-money');
    assert.equal(rowOn.alignment_score, 99, 'the raw 99 stays in the row — hiding it would be a lie');
    assert.equal(rowOn.action, 'approved');
    const rowOff = assertOneRow(brainOff);
    assertOffRow(rowOff, { score: 99, action: 'approved' });
  });

  test('pair 4: elder veto — held in both runs, identical elder note', async () => {
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Fix the worker D1 binding so the staging brain binds on deploy',
      body: '',
      stub: stubClaudeSequence(),
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'pending');
    assert.equal(resOn.qScore, 99);
    assert.equal(resOn.qDecidedBy, null);
    assert.equal(resOn.elderNote, "Ma'at objected: Concentrates too much authority.");
    const rowOn = assertOneRow(brainOn);
    assert.equal(rowOn.action, "held: Ma'at objected: Concentrates too much authority.");
    assert.equal(rowOn.domain_label, 'edge-backend');
    assert.equal(rowOn.auto_approvable, 1);
    const rowOff = assertOneRow(brainOff);
    assertOffRow(rowOff, { score: 99, action: "held: Ma'at objected: Concentrates too much authority." });
  });

  test('pair 5: refused routing at 99 — approved in both runs', async () => {
    // A refusal is a routing answer, not a verdict: probe-spam text that
    // the Queen scores 99 still approves, and the row records the refusal
    // honestly next to the 99.
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'E1 probe token 1790382630',
      body: 'scientist probe with token',
      stub: stubClaudeScore('SCORE: 99\nREASON: Serves the vision directly.'),
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'approved');
    const rowOn = assertOneRow(brainOn);
    assert.equal(rowOn.domain_verdict, 'REFUSED-NO-MATCH');
    assert.equal(rowOn.domain_label, null);
    assert.ok(JSON.parse(rowOn.domain_matches).forcing_question,
      'a refusal must carry the forcing question in the row');
    assert.equal(rowOn.auto_approvable, 1, 'refusal does not block auto-approvability — the score decides that');
    const rowOff = assertOneRow(brainOff);
    assertOffRow(rowOff, { score: 99, action: 'approved' });
  });

  test('pair 6: no provider up — pending in both runs, ZERO rows in both', async () => {
    // queenReview() returns null, so queenDecide() writes no row at all in
    // either run. The guard stub fails the test if anything tries the network.
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Fix the worker D1 binding so the staging brain binds on deploy',
      body: '',
      stub: stubFetchGuard(),
      deleteKeys: ['ANTHROPIC_API_KEY'],
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'pending');
    assert.equal(resOn.qScore, null);
    assert.equal(resOn.qDecidedBy, null);
    assert.equal(resOn.elderNote, null);
    assert.equal(resOn.qDecidedAt, null);
    assertNoRows(brainOn);
    assertNoRows(brainOff);
  });

  test('pair 7: switch 9 off entirely — pending in both runs, ZERO rows in both', async () => {
    // The routing pass lives inside the switch-9 block, so it is inert when
    // switch 9 is off whatever the routing switch says. (Production today:
    // switch 9 is off, so this is the live shape of queenDecide().)
    const { resOn, resOff, brainOn, brainOff } = await runPair({
      title: 'Fix the worker D1 binding so the staging brain binds on deploy',
      body: '',
      stub: stubFetchGuard(),
      deleteKeys: ['QUEEN_AUTONOMOUS_APPROVAL'],
    });
    assertSameVerdict(resOn, resOff);
    assert.equal(resOn.qStatus, 'pending');
    assert.equal(resOn.qScore, null);
    assertNoRows(brainOn);
    assertNoRows(brainOff);
  });
});
