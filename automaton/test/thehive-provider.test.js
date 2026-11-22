// automaton/test/thehive-provider.test.js
// S-2 (2026-11-22): the Worker's /v11/automaton/infer is founder-only. The provider must send
// the key it is given, and must NOT call the Worker at all when it has none.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTheHiveProvider } from '../src/inference/thehive-provider.js';

const realFetch = globalThis.fetch;
const withFetch = async (impl, fn) => { globalThis.fetch = impl; try { return await fn(); } finally { globalThis.fetch = realFetch; } };

test('sends the key as a Bearer token', async () => {
  let seen;
  const provider = createTheHiveProvider({ baseUrl: 'http://x', apiKey: 'k-123' });
  const out = await withFetch(async (url, init) => { seen = { url, init }; return { ok: true, status: 200, json: async () => ({ ok: true, text: 'hi', provider: 'groq' }) }; },
    () => provider.generate({ prompt: 'p', maxTokens: 5 }));
  assert.equal(seen.url, 'http://x/v11/automaton/infer');
  assert.equal(seen.init.headers.Authorization, 'Bearer k-123');
  assert.deepEqual(out, { text: 'hi', provider: 'thehive:groq' });
});

test('with no key it never calls the Worker, says so once, and returns null (router falls back)', async () => {
  let called = 0; const warnings = [];
  const provider = createTheHiveProvider({ baseUrl: 'http://x', apiKey: '', warn: (m) => warnings.push(m) });
  await withFetch(async () => { called += 1; return { ok: true, json: async () => ({}) }; }, async () => {
    assert.equal(await provider.generate({ prompt: 'p' }), null);
    assert.equal(await provider.generate({ prompt: 'p' }), null);
  });
  assert.equal(called, 0);
  assert.equal(warnings.length, 1, 'warn once, not on every turn');
  assert.match(warnings[0], /AUTOMATON_THEHIVE_API_KEY/);
});

test('a 401 from the Worker returns null and warns once', async () => {
  const warnings = [];
  const provider = createTheHiveProvider({ baseUrl: 'http://x', apiKey: 'bad', warn: (m) => warnings.push(m) });
  await withFetch(async () => ({ ok: false, status: 401, json: async () => ({}) }), async () => {
    assert.equal(await provider.generate({ prompt: 'p' }), null);
    assert.equal(await provider.generate({ prompt: 'p' }), null);
  });
  assert.equal(warnings.length, 1);
});
