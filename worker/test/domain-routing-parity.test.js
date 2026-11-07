// worker/test/domain-routing-parity.test.js
//
// QB-4 (BATCH-QB): the committed rebuild of QB-2's throwaway /tmp parity
// harness. The JS port (worker/src/index.js DOMAIN_KEYWORDS /
// routeProposalDomain) and the Python router
// (.claude/skills/hive-conductor/scripts/domain_router.py) must agree on
// every case — a drift in either table fails here instead of silently
// misrouting a real proposal.
//
// One python3 invocation routes all cases (12 self-test fixtures + 116
// corpus = 128 directives); the JS side runs routeProposalDomain() on the
// byte-identical text (title + "\n" + body slice 1500 — the same
// construction queenDecide() uses). Compares verdict + domain_label +
// matched_domains (exact order) + matches (deep equal) + domain_margin
// (derived from the Python matches: top count minus second count, null with
// fewer than two domains — Python route() computes no margin, so the
// derivation is the comparison).
//
// A second test pins the corpus totals (110 single / 0 split / 6 refused),
// so a table revision that changes the corpus outcome names itself. A third
// test pins the fixture (116 entries, unique ids, string title/body), so a
// truncated fixture fails loudly.
//
// python3 dependency, stated here: the test shells out to `python3` once.
// ubuntu-latest (the CI worker job's runner) ships python3, and the repo's
// CI already runs Python 3.11 in the test job — a system tool, not a new
// node dependency. If python3 is absent the test FAILS with an explicit
// message rather than skipping: a silently-skipped parity test would let
// the tables drift undetected, which is the exact failure this test exists
// to catch.
//
// RECONSTRUCTION NOTE (QB-5, 2026-11-07): the /tmp/THEHIVE checkout holding
// the original QB-4 commit a0142bc was wiped before QB-5 ran. This file is
// rewritten from the QB-4 report's spec (3 tests, 128 cases compared per
// run, same assertions and failure modes). It is NOT byte-identical to the
// lost original — but the parity property it enforces is the same, and this
// run re-verifies it from scratch.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { routeProposalDomain } from '../src/index.js';

const ROUTE_BATCH = fileURLToPath(new URL(
  '../../.claude/skills/hive-conductor/scripts/route_batch.py', import.meta.url));
const CORPUS = JSON.parse(fs.readFileSync(
  new URL('./fixtures/domain-routing-corpus.json', import.meta.url), 'utf8'));

// Run route_batch.py once. If python3 is absent (or the script fails) the
// test FAILS with an explicit message — never skips.
function runPython(args, stdin) {
  try {
    const out = execFileSync('python3', [ROUTE_BATCH, ...args], {
      input: stdin, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(out);
  } catch (e) {
    assert.fail(`parity harness could not run python3 ${ROUTE_BATCH}: ${e.message} — ` +
      'the parity test must fail, not skip, when python3 is absent');
  }
}

// Python route() computes no margin; derive it from the matches the same
// way the JS side does (top count minus second count, null with fewer than
// two matched domains).
function deriveMargin(matches) {
  const ranked = Object.entries(matches)
    .sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1));
  if (ranked.length < 2) return null;
  return ranked[0][1].length - ranked[1][1].length;
}

describe('JS/Python parity — routeProposalDomain vs domain_router.py (QB-4)', () => {
  test('128/128 match: 12 self-test fixtures + 116 corpus proposals', () => {
    const selfTests = runPython(['--self-test-cases']);
    assert.equal(selfTests.length, 12, 'expected 12 SELF_TESTS directives from Python');
    // The Python text is built exactly as routeProposalDomain() builds it:
    // title + "\n" + body slice 1500 (self-tests are a bare directive, so
    // the JS side's routeProposalDomain(text, '') builds text + "\n").
    const directives = [
      ...selfTests.map((text, i) => ({
        id: `self-test-${i + 1}`, text: `${text}\n`, title: text, body: '',
      })),
      ...CORPUS.map((p) => ({
        id: `corpus-${p.id}`,
        text: `${p.title}\n${(p.body ?? '').slice(0, 1500)}`,
        title: p.title, body: p.body ?? '',
      })),
    ];
    const py = runPython([], JSON.stringify(
      directives.map(({ id, text }) => ({ id, text }))));
    assert.equal(py.length, 128, 'expected 128 Python results');
    const byId = new Map(py.map((r) => [r.id, r]));
    const mismatches = [];
    for (const d of directives) {
      const js = routeProposalDomain(d.title, d.body);
      const p = byId.get(d.id);
      assert.ok(p, `Python returned no result for ${d.id}`);
      const problems = [];
      if (js.verdict !== p.verdict) problems.push(`verdict js=${js.verdict} py=${p.verdict}`);
      if (js.domain_label !== p.domain_label) {
        problems.push(`label js=${js.domain_label} py=${p.domain_label}`);
      }
      try {
        assert.deepEqual(js.matched_domains, p.matched_domains);
      } catch {
        problems.push(`matched_domains js=${JSON.stringify(js.matched_domains)} py=${JSON.stringify(p.matched_domains)}`);
      }
      try {
        assert.deepEqual(js.matches, p.matches);
      } catch {
        problems.push(`matches js=${JSON.stringify(js.matches)} py=${JSON.stringify(p.matches)}`);
      }
      if (js.domain_margin !== deriveMargin(p.matches)) {
        problems.push(`margin js=${js.domain_margin} py-derived=${deriveMargin(p.matches)}`);
      }
      if (problems.length) mismatches.push(`${d.id}: ${problems.join('; ')}`);
    }
    assert.deepEqual(mismatches, [],
      `${mismatches.length} parity mismatches:\n${mismatches.join('\n')}`);
  });

  test('corpus totals pinned: 110 single / 0 split / 6 refused', () => {
    const totals = { 'SINGLE-DOMAIN': 0, 'MULTI-DOMAIN-SPLIT': 0, 'REFUSED-NO-MATCH': 0 };
    for (const p of CORPUS) {
      totals[routeProposalDomain(p.title, p.body ?? '').verdict]++;
    }
    assert.deepEqual(totals,
      { 'SINGLE-DOMAIN': 110, 'MULTI-DOMAIN-SPLIT': 0, 'REFUSED-NO-MATCH': 6 });
  });

  test('fixture is complete: 116 entries, unique ids, string title/body', () => {
    assert.equal(CORPUS.length, 116, 'expected 116 corpus entries');
    const ids = CORPUS.map((p) => p.id);
    assert.equal(new Set(ids).size, 116, 'fixture ids must be unique');
    for (const p of CORPUS) {
      assert.equal(typeof p.title, 'string', `corpus ${p.id} title must be a string`);
      assert.equal(typeof p.body, 'string', `corpus ${p.id} body must be a string`);
    }
  });
});
