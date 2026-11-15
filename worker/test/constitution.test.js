// worker/test/constitution.test.js
//
// Drives the canonical constitution path (P2, halt prerequisite, 2026-11-14,
// issue #243) against the real function and the real fetch handler — not a
// reimplementation.
//
// The change, in the order it was built:
//   1. scripts/generate-constitution-view.py generates docs/CONSTITUTION.md
//      from soul.md — soul.md VERBATIM, plus a generated header that says, in
//      plain words, that it is a view of soul.md and not the constitution
//      itself (XR-Q29, decided 2026-11-12).
//   2. constitutionSummary() reads docs/CONSTITUTION.md instead of
//      docs/GOVERNANCE.md, and parses soul.md's "### F-001: ..." headings.
//   3. GET /v11/constitution serves the canonical constitution.
//
// Three things here are correctness-relevant rather than merely functional,
// and each is asserted in BOTH directions on purpose:
//
//   1. The served content must be the canonical constitution — F-001–F-006
//      from soul.md, never F-007–F-013 from GOVERNANCE.md.
//   2. The derived view must be fresh — its body byte-identical to soul.md
//      and its header hash matching soul.md — so a hand-edit or a stale view
//      fails loudly instead of serving silently wrong law.
//   3. The old parser is GONE, not bypassed — GOVERNANCE.md-shaped text
//      yields no titles, so the function cannot be pointed back at the
//      non-canonical file and produce law from it.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import worker from '../src/index.js';
import { installCaches, stubCtx, makeEnv, req } from './helpers/env.js';
import { constitutionSummary } from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const call = (request, env, ctx = stubCtx()) => worker.fetch(request, env, ctx);
const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

// ── Fixtures ──────────────────────────────────────────────────────────────

// An ASSETS binding stub: maps a site-root pathname to the text it serves.
// A pathname with no entry is a 404, the same shape a real missing file has.
function stubAssets(files = {}) {
  return {
    fetch: async (request) => {
      const pathname = new URL(request.url).pathname;
      if (Object.prototype.hasOwnProperty.call(files, pathname)) {
        return new Response(files[pathname], { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response('not found', { status: 404 });
    },
  };
}

// The real files, read from the repo — the route and the function are tested
// against what is actually committed, not a fixture that could drift from it.
const realView = () => readFileSync(new URL('../../docs/CONSTITUTION.md', import.meta.url), 'utf8');
const realSoul = () => readFileSync(new URL('../../soul.md', import.meta.url), 'utf8');

// GOVERNANCE.md's shape: "## ARTICLE F‑001: ..." headings (note the
// non-breaking hyphen U+2011 in the F-numbers) and F-007–F-013 articles the
// canonical text does not contain. This is what constitutionSummary() used to
// parse — it must parse to nothing now.
const GOVERNANCE_SHAPED = `# THE SOVEREIGN HIVE — FULL CONSTITUTION

## 🏛️ ARTICLE F‑001: DATA SOVEREIGNTY & TIME WEALTH

### Core Principle
> *"The user may delete all personal data and workflow history within 5 minutes."*

## 🏛️ ARTICLE F‑007: AGENT VALUATION & ECONOMIC ECOSYSTEM

### Core Principle
> *"Every agent has the capability to evolve into a new spore once it reaches this potential state."*
`;

const CANONICAL_TITLES = [
  'F-001: Data Sovereignty & Time Wealth',
  'F-002: Value-Weighted Wealth',
  'F-003: Autonomy & Alternatives',
  'F-004: Explainability',
  'F-005: Conflict Priority',
  'F-006: Cross-Law Non-Penalization',
];

// ─────────────────────────────────────────────────────────────────────────
describe('GET /v11/constitution — the route', () => {
  test('serves the real derived view: F-001–F-006, no F-007, hash matches the file', async () => {
    const r = await call(req('/constitution'), makeEnv({ ASSETS: stubAssets({ '/CONSTITUTION.md': realView() }) }));
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.available, true);
    assert.equal(body.source, 'docs/CONSTITUTION.md');
    assert.equal(body.canonical_source, 'soul.md');
    assert.equal(body.bytes, realView().length);
    assert.equal(body.hash, sha256(realView()));
    assert.equal(body.content, realView());
    for (const n of ['F-001', 'F-002', 'F-003', 'F-004', 'F-005', 'F-006']) {
      assert.ok(body.content.includes(`### ${n}:`), `expected ${n} in the served content`);
    }
    assert.ok(!body.content.includes('F-007'), 'no unratified article may be served as constitution');
    assert.ok(!body.content.includes('F-012'), 'no unratified article may be served as constitution');
  });

  test('the served content, after the generated header, is soul.md byte-for-byte', async () => {
    const r = await call(req('/constitution'), makeEnv({ ASSETS: stubAssets({ '/CONSTITUTION.md': realView() }) }));
    const body = await r.json();
    assert.ok(body.content.endsWith(realSoul()), 'the view body must be soul.md verbatim');
  });

  test('a missing derived view fails closed — available:false, never a 500', async () => {
    const r = await call(req('/constitution'), makeEnv({ ASSETS: stubAssets({}) }));
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.equal(body.available, false);
    assert.ok(body.reason);
  });

  test('no ASSETS binding fails closed the same way', async () => {
    const r = await call(req('/constitution'), makeEnv());
    const body = await r.json();
    assert.equal(body.available, false);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('constitutionSummary — the repointed function', () => {
  test('returns exactly the six canonical titles from the real derived view', async () => {
    const out = await constitutionSummary(
      { ASSETS: stubAssets({ '/CONSTITUTION.md': realView() }) },
      'https://thehive.sovereignhive.workers.dev/v11/constitution',
    );
    assert.deepEqual(out.titles, CANONICAL_TITLES);
    assert.equal(out.hash, sha256(realView()));
  });

  test('returns null when the ASSETS binding is absent', async () => {
    assert.equal(await constitutionSummary({}, 'https://example.com/'), null);
  });

  test('returns null for a missing derived view', async () => {
    const out = await constitutionSummary(
      { ASSETS: stubAssets({}) },
      'https://example.com/',
    );
    assert.equal(out, null);
  });

  test('GOVERNANCE.md-shaped text yields no titles — the old parser is gone, not bypassed', async () => {
    const out = await constitutionSummary(
      { ASSETS: stubAssets({ '/CONSTITUTION.md': GOVERNANCE_SHAPED }) },
      'https://example.com/',
    );
    assert.equal(out, null);
  });

  test('a file with no fixed-law headings yields null', async () => {
    const out = await constitutionSummary(
      { ASSETS: stubAssets({ '/CONSTITUTION.md': '# Notes\n\nNothing here is law.\n' }) },
      'https://example.com/',
    );
    assert.equal(out, null);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('the derived view is fresh (repo-level invariant)', () => {
  test('the committed view carries the XR-Q29 declaration and the true soul.md hash', () => {
    const view = realView();
    const soul = realSoul();
    assert.ok(view.startsWith('> **GENERATED FILE — DO NOT HAND-EDIT.**'), 'the view must open with the generated-file notice');
    assert.ok(view.includes('It is NOT the constitution itself. `soul.md` is the ONE constitution (XR-Q29, decided 2026-11-12).'));
    assert.ok(view.includes('Fixed laws in this view: F-001, F-002, F-003, F-004, F-005, F-006.'));
    const hashInHeader = view.match(/from `soul\.md` \(sha256: ([0-9a-f]{64})\)/);
    assert.ok(hashInHeader, 'the header must carry the source sha256');
    assert.equal(hashInHeader[1], sha256(soul), 'the header hash must match the committed soul.md');
  });

  test('the committed view body is the committed soul.md, byte-for-byte', () => {
    assert.ok(realView().endsWith(realSoul()));
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('no live fetch of GOVERNANCE.md remains', () => {
  test('worker/src/index.js never fetches /GOVERNANCE.md via ASSETS', () => {
    const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
    assert.ok(!src.includes("new URL('/GOVERNANCE.md'"), 'no ASSETS fetch of GOVERNANCE.md may remain');
    assert.ok(src.includes("new URL('/CONSTITUTION.md'"), 'constitutionSummary must fetch the derived view');
  });
});
