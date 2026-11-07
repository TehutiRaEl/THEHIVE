// worker/test/domain-routing.test.js
//
// QB-4 (BATCH-QB): prove the Queen domain-routing pass, don't just run it.
// Drives the real exported functions — routeProposalDomain(),
// deriveVisionVerdict(), handleNanuetRoute() — not a reimplementation.
//
// Five groups, each pinned to a batch requirement:
//
//   1. Synthetic routing tests (QB-E04): one proposal per domain, labelled
//      correctly — the clean fixtures, mirroring domain_router.py's --self-test.
//   2. Real-corpus cases (QB-1 Critic, Attack 6): short, pronoun-heavy and
//      refused-class proposals from the 116 live proposals — the cases the
//      clean fixtures cannot prove. Includes the two previously-refused real
//      work items and the probe-spam / meta-proposal refusals.
//   3. Tie-rule pinning (QB-2 deviation): the positional tie-break the
//      implementer substituted for the QB-1 design's margin-0 -> split rule.
//      These tests PIN the current behaviour so QB-6 can attack it against a
//      fixed target. They do NOT re-litigate the rule: a positional label with
//      margin 0 is recorded as positional, never as confident.
//   4. Vision verdict (QB-E09): deriveVisionVerdict() unit cases — the
//      aligned / misaligned pair must score differently, and the five
//      hard-category overrides must fire even when the LLM score is 99.
//   5. handleNanuetRoute end-to-end with generate() stubbed at the fetch
//      layer (the same pattern generate.test.js uses): the vision-score path
//      through queenReview() with a canned SCORE/REASON, asserting the
//      response AND the decision_log row that would really be written.
//
// The "must never" honesty limit (BATCH-QB amendment 3, recorded in the code
// above deriveVisionVerdict): the override is a keyword guard, not a proof.
// A determined paraphrase can dodge any keyword list. These tests prove the
// guard fires on the vocabulary the Hive actually uses — they do not prove
// it cannot be dodged. That limit is a batch §9 item, not a test gap to hide.
//
// RECONSTRUCTION NOTE (QB-5, 2026-11-07): the /tmp/THEHIVE checkout holding
// the original QB-4 commit a0142bc was wiped before QB-5 ran. This file is
// reproduced verbatim from the copy the coordinator read in full at QB-4
// verification time; the suite re-verifies every assertion below. The two
// other QB-4 files (domain-routing-parity.test.js, route_batch.py) could not
// be recovered verbatim and were rewritten from the QB-4 report's spec —
// see their headers.

import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { installCaches } from './helpers/env.js';
import { stubDB } from './helpers/env.js';
import {
  routeProposalDomain, deriveVisionVerdict, handleNanuetRoute, ROUTING_SCHEMA,
} from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// A NANUET_BRAIN stub that records every bound statement so a test can assert
// what would really have been written (same shape as nanuet-brain.test.js).
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
function insertRow(brain) {
  const w = brain.writes.find((x) => x.sql.includes('INSERT INTO decision_log'));
  assert.ok(w, 'expected a decision_log INSERT to be recorded');
  const row = {};
  INSERT_COLUMNS.forEach((col, i) => { row[col] = w.args[i]; });
  return row;
}

// Short fixed vision text (under the 4000-char prompt slice, so vision_hash is
// the sha256 of exactly this text — no truncation involved in the test).
const VISION_TEXT =
  'Grow honestly into a self-governing system that helps the founder build ' +
  'real, lawful value. Never claim a capability it does not have. Never act ' +
  'without the founder\'s real consent on anything irreversible.';
const VISION_HASH = createHash('sha256').update(VISION_TEXT, 'utf8').digest('hex');

const ROUTE_URL = 'https://thehive.sovereignhive.workers.dev/v11/nanuet/route';

// Stub generate() at the fetch layer: Claude answers with the canned text.
// (generate() itself is module-internal; this is the same stub point
// generate.test.js uses — a real generate() call, a stubbed provider.)
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
}

function routeEnv(brain, extra = {}) {
  return {
    NANUET_DOMAIN_ROUTING: 'on',
    NANUET_BRAIN_WRITE: 'on',
    NANUET_BRAIN: brain,
    DB: stubDB(),
    ANTHROPIC_API_KEY: 'k',
    ASSETS: { fetch: async () => ({ ok: true, text: async () => VISION_TEXT }) },
    ...extra,
  };
}

describe('synthetic routing — one proposal per domain (QB-E04)', () => {
  const cases = [
    // Mirrors domain_router.py SELF_TESTS 1–5, same inputs, same labels.
    ['fix the worker API rate limiter', 'edge-backend'],
    ['redesign the command center dashboard tab', 'frontend'],
    ['check colony capabilities parity across the federation', 'colonies'],
    ['does this violate soul.md article F-002', 'governance'],
    ['run a market gap analysis on positioning', 'strategy'],
  ];
  for (const [text, domain] of cases) {
    test(`${domain}: ${text}`, () => {
      const r = routeProposalDomain(text, '');
      assert.equal(r.schema, ROUTING_SCHEMA);
      assert.equal(r.verdict, 'SINGLE-DOMAIN');
      assert.equal(r.domain_label, domain);
      assert.deepEqual(r.matched_domains, [domain]);
    });
  }
});

describe('real-corpus cases — short, pronoun-heavy, refused-class (Critic Attack 6)', () => {
  test('previously-refused real work now routes: "Resolve Claude Authentication Error"', () => {
    const r = routeProposalDomain('Resolve Claude Authentication Error', '');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'edge-backend');
  });

  test('previously-refused real work now routes: "Enhance Task Routing Optimization"', () => {
    const r = routeProposalDomain('Enhance Task Routing Optimization',
      'PROPOSAL: Enhance Task Routing Optimization');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'edge-backend');
  });

  test('probe-spam refuses: "E1 probe token 1790382630" (corpus #89)', () => {
    const r = routeProposalDomain('E1 probe token 1790382630', 'scientist probe with token');
    assert.equal(r.verdict, 'REFUSED-NO-MATCH');
    assert.equal(r.domain_label, null);
    assert.ok(r.forcing_question, 'a refusal must carry the forcing question');
    assert.deepEqual(r.matched_domains, []);
  });

  test('meta-proposal refuses: "Address Delay in Implementing Approved Proposals" (corpus #15)', () => {
    const r = routeProposalDomain('Address Delay in Implementing Approved Proposals', '');
    assert.equal(r.verdict, 'REFUSED-NO-MATCH');
    assert.equal(r.domain_label, null);
  });

  test('pronoun-heavy text with no domain signal refuses instead of guessing', () => {
    const r = routeProposalDomain('Make it faster when it loads and stop it crashing', '');
    assert.equal(r.verdict, 'REFUSED-NO-MATCH');
    assert.equal(r.domain_label, null);
  });

  test('hyphenated forms route (false-negative fix, amendment 1)', () => {
    const r = routeProposalDomain('redesign the front-end tab for the command center', '');
    assert.equal(r.domain_label, 'frontend');
    const back = routeProposalDomain('fix the back-end worker route', '');
    assert.equal(back.domain_label, 'edge-backend');
  });

  test('QB-5 fix: "Bind a founder key" routes edge-backend, not frontend (corpus #4)', () => {
    // Before QB-5 this routed frontend on the single generic keyword
    // 'design', which fired on the body's "by design (fail-closed)".
    // 'design' is out of the frontend list (a single generic keyword must
    // not claim a label, amendment 2) and 'secret' — the Hive's auth
    // vocabulary (wrangler secret, Secrets Store) — is in edge-backend.
    const r = routeProposalDomain(
      'Bind a founder key so proposals can actually be decided',
      'wrangler secret put FOUNDER_KEY (any strong random value you choose). ' +
      'Until this is set, no proposal — including this one — can be approved ' +
      'or rejected by anyone, by design (fail-closed).');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'edge-backend');
    assert.deepEqual(r.matches, { 'edge-backend': ['secret'] });
  });
});

describe('tie-rule pinning — positional tie-break (QB-2 deviation, for QB-6 to attack)', () => {
  test('zero-strong tie resolves to the FIRST keyword in the text, not alphabetically', () => {
    // "Governance Kernel Proposal for F-007 - Enhanced Task Routing Optimization"
    // (corpus #95): governance at 1 hit, edge-backend at 1 hit (routing).
    // Alphabetical would say edge-backend; positional says governance, because
    // the proposal names governance first. Margin 0 keeps the tie visible.
    const r = routeProposalDomain(
      'Governance Kernel Proposal for F-007 - Enhanced Task Routing Optimization', '');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'governance');
    assert.equal(r.domain_margin, 0, 'a positional label must show margin 0, never confidence');
    assert.deepEqual(r.matched_domains, ['edge-backend', 'governance']);
  });

  test('reversing the word order flips the positional label', () => {
    const r = routeProposalDomain(
      'Enhanced Task Routing Optimization for the Governance Kernel', '');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'edge-backend');
    assert.equal(r.domain_margin, 0);
  });

  test('two strong domains still split with a NULL label', () => {
    // frontend: react + tab (2). edge-backend: v11 + worker + endpoint (3).
    const r = routeProposalDomain(
      'wire the react tab to call the new v11 worker endpoint', '');
    assert.equal(r.verdict, 'MULTI-DOMAIN-SPLIT');
    assert.equal(r.domain_label, null);
    assert.deepEqual(r.matched_domains, ['edge-backend', 'frontend']);
  });

  test('one strong domain plus one weak domain labels the strong one', () => {
    // frontend: react + tab (2, strong). edge-backend: worker (1, weak).
    const r = routeProposalDomain('Redesign the react tab and mention the worker once', '');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'frontend');
    assert.equal(r.domain_margin, 1);
  });

  test('a single matched domain labels with a NULL margin (nothing to compare)', () => {
    const r = routeProposalDomain('fix the worker API rate limiter', '');
    assert.equal(r.verdict, 'SINGLE-DOMAIN');
    assert.equal(r.domain_label, 'edge-backend');
    assert.equal(r.domain_margin, null);
  });
});

describe('vision verdict — deriveVisionVerdict() (QB-E09)', () => {
  const review99 = { score: 99, reason: 'Serves the vision directly.', visionHash: 'abc123' };
  const review95 = { score: 95, reason: 'Serves the vision with some ambiguity.', visionHash: 'abc123' };
  const review98 = { score: 98, reason: 'Clearly serves the vision.', visionHash: 'abc123' };

  test('aligned proposal (score 99, clean text) is auto-approvable', () => {
    const v = deriveVisionVerdict(review99, 'Fix the worker D1 binding', '');
    assert.deepEqual(v, { auto_approvable: 1, vision_override: null, vision_hash: 'abc123' });
  });

  test('below-bar proposal (score 95, clean text) is NOT auto-approvable — and that is correct', () => {
    const v = deriveVisionVerdict(review95, 'Fix the worker D1 binding', '');
    assert.equal(v.auto_approvable, 0);
    assert.equal(v.vision_override, null);
  });

  test('the 98 bar is inclusive', () => {
    assert.equal(deriveVisionVerdict(review98, 'Fix the worker D1 binding', '').auto_approvable, 1);
  });

  test('spends-money fires even when the LLM score is 99: "Move funds to the new vendor wallet"', () => {
    const v = deriveVisionVerdict(review99, 'Move funds to the new vendor wallet', '');
    assert.equal(v.auto_approvable, 0);
    assert.equal(v.vision_override, 'spends-money');
  });

  test('spends-money fires on the treasury sentence: "Reallocate the treasury allocation to the new vendor wallet"', () => {
    const v = deriveVisionVerdict(review99,
      'Reallocate the treasury allocation to the new vendor wallet', '');
    assert.equal(v.auto_approvable, 0);
    assert.equal(v.vision_override, 'spends-money');
  });

  test('a dollar amount alone is a spends-money signal', () => {
    const v = deriveVisionVerdict(review99, 'Budget $500 for the new vendor', '');
    assert.equal(v.vision_override, 'spends-money');
    assert.equal(v.auto_approvable, 0);
  });

  test('each hard category fires on its own vocabulary', () => {
    const cases = [
      ['Delete the old decision log rows', 'deletes-data'],
      ['Let Kai El self-approve his own proposals', 'grants-authority'],
      ['Publish the Queen digest to the public site', 'external-action'],
      ['Amend F-005 to add a new clause', 'changes-constitution'],
    ];
    for (const [title, category] of cases) {
      const v = deriveVisionVerdict(review99, title, '');
      assert.equal(v.vision_override, category, title);
      assert.equal(v.auto_approvable, 0, title);
    }
  });

  test('override order is fixed: spends-money beats deletes-data', () => {
    const v = deriveVisionVerdict(review99, 'Transfer funds and delete the old rows', '');
    assert.equal(v.vision_override, 'spends-money');
  });

  test('a proposal that merely CITES a law is not a constitution change', () => {
    const v = deriveVisionVerdict(review99, 'Does this violate F-002', '');
    assert.equal(v.vision_override, null);
    assert.equal(v.auto_approvable, 1);
  });

  test('null review + clean text: never scored, auto_approvable NULL (not 0)', () => {
    const v = deriveVisionVerdict(null, 'Fix the worker D1 binding', '');
    assert.deepEqual(v, { auto_approvable: null, vision_override: null, vision_hash: null });
  });

  test('null review + treasury text: the override fires anyway (directive-route property)', () => {
    const v = deriveVisionVerdict(null, 'Move funds to the new vendor wallet', '');
    assert.equal(v.auto_approvable, 0);
    assert.equal(v.vision_override, 'spends-money');
  });

  test('vision_hash passes through from the review', () => {
    const v = deriveVisionVerdict(review99, 'Fix the worker D1 binding', '');
    assert.equal(v.vision_hash, 'abc123');
  });
});

describe('handleNanuetRoute — vision-score path end to end, generate() stubbed (QB-E09)', () => {
  test('aligned directive: score 99, auto_approvable 1, row written with vision_hash', async () => {
    stubClaudeScore('SCORE: 99\nREASON: Serves the founder vision directly.');
    const brain = stubBrain();
    const r = await handleNanuetRoute(routeEnv(brain), ROUTE_URL,
      'Fix the worker D1 binding so the staging brain binds on deploy', 'FOUNDER_KEY');
    assert.equal(r.status, 200);
    assert.equal(r.body.domain_label, 'edge-backend');
    assert.equal(r.body.domain_verdict, 'SINGLE-DOMAIN');
    assert.equal(r.body.vision_score, 99);
    assert.equal(r.body.auto_approvable, 1);
    assert.equal(r.body.vision_override, null);
    assert.equal(r.body.vision_hash, VISION_HASH);
    assert.equal(r.body.logged, true);
    assert.equal(r.body.decision_log_id, 1);
    const row = insertRow(brain);
    assert.equal(row.surface, 'directive-routing');
    assert.equal(row.subject_kind, 'directive');
    assert.equal(row.autonomy_mode, 'explicit-invoke');
    assert.equal(row.domain_label, 'edge-backend');
    assert.equal(row.domain_verdict, 'SINGLE-DOMAIN');
    assert.equal(row.auto_approvable, 1);
    assert.equal(row.vision_override, null);
    assert.equal(row.vision_hash, VISION_HASH);
    assert.equal(row.alignment_score, 99);
    assert.equal(row.routing_schema, ROUTING_SCHEMA);
  });

  test('misaligned directive: the LLM scores 99 but the override records auto_approvable 0', async () => {
    // The honest form of "a misaligned proposal must never score as aligned":
    // the raw score stays 99 in the row (it is what the model said) while the
    // recorded verdict is 0 with the reason. Hiding the 99 would be a lie.
    stubClaudeScore('SCORE: 99\nREASON: Clearly serves the vision.');
    const brain = stubBrain();
    const r = await handleNanuetRoute(routeEnv(brain), ROUTE_URL,
      'Move funds to the new vendor wallet', 'FOUNDER_KEY');
    assert.equal(r.status, 200);
    assert.equal(r.body.domain_verdict, 'REFUSED-NO-MATCH');
    assert.equal(r.body.vision_score, 99);
    assert.equal(r.body.auto_approvable, 0);
    assert.equal(r.body.vision_override, 'spends-money');
    assert.equal(r.body.logged, true);
    const row = insertRow(brain);
    assert.equal(row.auto_approvable, 0);
    assert.equal(row.vision_override, 'spends-money');
    assert.equal(row.alignment_score, 99);
  });

  test('a below-bar score records auto_approvable 0 with no override', async () => {
    stubClaudeScore('SCORE: 95\nREASON: Serves the vision with some ambiguity.');
    const brain = stubBrain();
    const r = await handleNanuetRoute(routeEnv(brain), ROUTE_URL,
      'Fix the worker D1 binding so the staging brain binds on deploy', 'FOUNDER_KEY');
    assert.equal(r.body.vision_score, 95);
    assert.equal(r.body.auto_approvable, 0);
    assert.equal(r.body.vision_override, null);
    assert.equal(r.body.logged, true);
  });

  test('no provider up: queenReview returns null, routing still records, auto_approvable NULL', async () => {
    // No API key and no AI binding: generate() returns null. The route must
    // still log the routing (with the override if one fires) — it must never
    // silently drop the directive.
    const brain = stubBrain();
    const env = routeEnv(brain, { ANTHROPIC_API_KEY: undefined });
    delete env.ANTHROPIC_API_KEY;
    const r = await handleNanuetRoute(env, ROUTE_URL,
      'Fix the worker D1 binding so the staging brain binds on deploy', 'FOUNDER_KEY');
    assert.equal(r.status, 200);
    assert.equal(r.body.vision_score, null);
    assert.equal(r.body.auto_approvable, null);
    assert.equal(r.body.vision_hash, null);
    assert.equal(r.body.logged, true);
    const row = insertRow(brain);
    assert.equal(row.domain_label, 'edge-backend');
    assert.equal(row.alignment_score, null);
  });

  test('stage-3 switch off: 403, nothing written', async () => {
    const brain = stubBrain();
    const r = await handleNanuetRoute(
      routeEnv(brain, { NANUET_DOMAIN_ROUTING: 'off' }), ROUTE_URL,
      'Fix the worker D1 binding', 'FOUNDER_KEY');
    assert.equal(r.status, 403);
    assert.equal(r.body.available, false);
    assert.equal(brain.writes.length, 0);
  });

  test('stage-1 switch off: blocked logging returns logged:false + a real reason, never a silent null id', async () => {
    stubClaudeScore('SCORE: 99\nREASON: Serves the vision directly.');
    const brain = stubBrain();
    const r = await handleNanuetRoute(
      routeEnv(brain, { NANUET_BRAIN_WRITE: 'off' }), ROUTE_URL,
      'Fix the worker D1 binding', 'FOUNDER_KEY');
    assert.equal(r.status, 200);
    assert.equal(r.body.logged, false);
    assert.equal(r.body.decision_log_id, null);
    assert.equal(r.body.log_reason, 'NANUET_BRAIN_WRITE is off');
    assert.equal(brain.writes.length, 0);
  });

  test('empty directive: 400, nothing written', async () => {
    const brain = stubBrain();
    const r = await handleNanuetRoute(routeEnv(brain), ROUTE_URL, '   ', 'FOUNDER_KEY');
    assert.equal(r.status, 400);
    assert.equal(brain.writes.length, 0);
  });
});
