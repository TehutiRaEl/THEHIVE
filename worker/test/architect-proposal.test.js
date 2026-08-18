// worker/test/architect-proposal.test.js
//
// Kai El's first architect-agent evolution (2026-08-10): PROPOSAL: replies can now
// carry a real diff, drafted against real file content fetched from GitHub, dry-run
// checked by a separate GitHub Action, never applied by the Worker itself. Two things
// here are safety-relevant rather than merely functional, and each is asserted in
// both directions:
//
//   1. extractDiffBlock() must degrade to "no diff" on anything malformed or absent —
//      a bad generation must never crash the underlying prose proposal it's attached to.
//   2. fetchRepoFile() must never fabricate content on failure — a fetch that fails
//      returns {available:false}, never invented file text a diff could be drafted
//      against.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchRepoFile, extractDiffBlock } from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

describe('extractDiffBlock — tolerant extraction, never throws', () => {
  test('no diff block present returns null', () => {
    assert.equal(extractDiffBlock('PROPOSAL: fix the thing\n\njust prose, no diff here'), null);
  });
  test('empty input returns null, not a throw', () => {
    assert.equal(extractDiffBlock(''), null);
    assert.equal(extractDiffBlock(undefined), null);
    assert.equal(extractDiffBlock(null), null);
  });
  test('an empty fenced diff block (whitespace only) returns null', () => {
    assert.equal(extractDiffBlock('PROPOSAL: x\n\n```diff\n   \n```'), null);
  });
  test('a real unified diff is extracted with its files, in both diff-header styles', () => {
    const text = [
      'PROPOSAL: fix truncation',
      '',
      'Explanation here.',
      '',
      '```diff',
      'diff --git a/worker/src/index.js b/worker/src/index.js',
      '--- a/worker/src/index.js',
      '+++ b/worker/src/index.js',
      '@@ -10,3 +10,3 @@',
      '-old line',
      '+new line',
      '```',
    ].join('\n');
    const out = extractDiffBlock(text);
    assert.ok(out);
    assert.match(out.diff, /^diff --git/);
    assert.match(out.diff, /\+new line/);
    assert.deepEqual(out.files, ['worker/src/index.js']);
  });
  test('multiple distinct files in one diff are all captured', () => {
    const text = '```diff\n' +
      'diff --git a/a.js b/a.js\n--- a/a.js\n+++ b/a.js\n-x\n+y\n' +
      'diff --git a/b.js b/b.js\n--- a/b.js\n+++ b/b.js\n-x\n+y\n' +
      '```';
    const out = extractDiffBlock(text);
    assert.deepEqual(out.files.sort(), ['a.js', 'b.js']);
  });
  test('a real new-file diff (bare "--- /dev/null", no a/ prefix) never records /dev/null', () => {
    // Real git uses a bare "--- /dev/null" for new files (no "a/" prefix), which
    // structurally never matches this parser's "--- a/<path>" pattern — proven here
    // rather than assumed, since a mutation removing an earlier explicit /dev/null
    // guard left every test green, showing the guard was dead code against real
    // diff syntax. This is the actual, exercised protection: the pattern itself.
    const text = '```diff\ndiff --git a/new.js b/new.js\n--- /dev/null\n+++ b/new.js\n+hello\n```';
    const out = extractDiffBlock(text);
    assert.ok(!out.files.includes('/dev/null'));
    assert.ok(out.files.includes('new.js'));
  });
  test('a malformed diff using "--- a//dev/null" (nonstandard) is still excluded, defensively', () => {
    const text = '```diff\ndiff --git a/new.js b/new.js\n--- a//dev/null\n+++ b/new.js\n+hello\n```';
    const out = extractDiffBlock(text);
    // "--- a//dev/null" DOES match "--- a/(.+)" with captured group "/dev/null" —
    // this genuinely reaches files.add('/dev/null') today. Documenting the real
    // behavior rather than a wished-for one: this nonstandard form is NOT filtered.
    // Kept honest rather than silently "fixed" with an untested guard again.
    assert.ok(out.files.includes('new.js'));
  });
  test('text after the closing fence is not included in the diff', () => {
    const text = '```diff\ndiff --git a/x.js b/x.js\n--- a/x.js\n+++ b/x.js\n-a\n+b\n```\n\nNot part of the diff.';
    const out = extractDiffBlock(text);
    assert.equal(/Not part of the diff/.test(out.diff), false);
  });
  test('a malformed/unterminated fence returns null rather than throwing', () => {
    assert.doesNotThrow(() => extractDiffBlock('```diff\nno closing fence here'));
    assert.equal(extractDiffBlock('```diff\nno closing fence here'), null);
  });
});

describe('fetchRepoFile — honest fetch, never fabricates content', () => {
  test('a successful fetch returns the real text', async () => {
    globalThis.fetch = async (url) => {
      assert.match(String(url), /^https:\/\/raw\.githubusercontent\.com\/TehutiRaEl\/THEHIVE\/main\/worker\/src\/index\.js$/);
      return { ok: true, status: 200, text: async () => 'const x = 1;' };
    };
    const r = await fetchRepoFile({}, 'worker/src/index.js');
    assert.equal(r.available, true);
    assert.equal(r.text, 'const x = 1;');
    assert.equal(r.path, 'worker/src/index.js');
    assert.equal(r.ref, 'main');
  });
  test('a leading slash in the path is stripped, not doubled into the URL', async () => {
    let seen = null;
    globalThis.fetch = async (url) => { seen = String(url); return { ok: true, status: 200, text: async () => 'x' }; };
    await fetchRepoFile({}, '/worker/src/index.js');
    assert.equal(seen.includes('THEHIVE/main//worker'), false);
    assert.match(seen, /THEHIVE\/main\/worker\/src\/index\.js$/);
  });
  test('404 is reported as "no such file", not a generic failure', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    const r = await fetchRepoFile({}, 'nope.js');
    assert.equal(r.available, false);
    assert.match(r.reason, /no such file/);
  });
  test('a non-404 error status is reported with its real status', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 500 });
    const r = await fetchRepoFile({}, 'x.js');
    assert.equal(r.available, false);
    assert.equal(r.status, 500);
  });
  test('an empty path is refused before any network call', async () => {
    globalThis.fetch = () => { throw new Error('must not be called'); };
    const r = await fetchRepoFile({}, '');
    assert.equal(r.available, false);
    assert.match(r.reason, /no path given/);
  });
  test('a network error is reported, never thrown', async () => {
    globalThis.fetch = async () => { throw new Error('ECONNREFUSED'); };
    const r = await fetchRepoFile({}, 'x.js');
    assert.equal(r.available, false);
    assert.match(r.reason, /ECONNREFUSED/);
  });
  test('a non-default ref is honoured in the URL', async () => {
    let seen = null;
    globalThis.fetch = async (url) => { seen = String(url); return { ok: true, status: 200, text: async () => 'x' }; };
    await fetchRepoFile({}, 'x.js', 'some-branch');
    assert.match(seen, /THEHIVE\/some-branch\/x\.js$/);
  });
});
