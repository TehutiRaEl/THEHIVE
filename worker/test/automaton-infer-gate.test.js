// worker/test/automaton-infer-gate.test.js
//
// Founder decision S-2 (2026-11-22): POST /v11/automaton/infer spends AI money, so it is
// founder-only AND rate-limited. Before: a free visitor token (anyone can mint one) and no
// per-minute limit. Each test counts the calls that reach the language model, so "no money was
// spent" is a fact, not a hope.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };

// D1 stub whose rate_limits row count is controllable (rateLimitOk reads SELECT COUNT(*) AS n).
const stubDB = ({ recentCalls = 0 } = {}) => {
  const mk = (sql) => ({
    run: async () => ({ success: true }),
    first: async () => (sql.includes('COUNT(*)') ? { n: recentCalls } : null),
    all: async () => ({ results: [] }),
  });
  return { prepare: (sql) => ({ ...mk(sql), bind: () => mk(sql) }), batch: async () => [] };
};
const ctx = { waitUntil: (p) => p };
const post = (headers = {}) => new Request('https://thehive.sovereignhive.workers.dev/v11/automaton/infer', {
  method: 'POST',
  headers: { 'CF-Connecting-IP': '9.9.9.9', 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ prompt: 'hello', maxTokens: 10 }),
});

// A bound provider that counts how many times the model is really called.
const modelCalls = () => {
  const state = { n: 0 };
  globalThis.fetch = async () => {
    state.n += 1;
    return {
      ok: true, status: 200,
      json: async () => ({ choices: [{ message: { content: 'hi' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }),
      text: async () => 'hi',
    };
  };
  return state;
};
const ENV = (extra = {}) => ({ DB: stubDB(), GROQ_API_KEY: 'x', ...extra });

describe('POST /v11/automaton/infer is founder-only and rate-limited', () => {
  test('no Authorization header: 401 and the model is never called', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post(), ENV({ FOUNDER_KEY: 'secret-founder-key' }), ctx);
    assert.equal(r.status, 401);
    assert.equal(m.n, 0);
  });

  test('a visitor token is not enough (anyone can mint one)', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer a-free-visitor-token' }), ENV({ FOUNDER_KEY: 'secret-founder-key' }), ctx);
    assert.equal(r.status, 401);
    assert.equal(m.n, 0);
  });

  test('a wrong key: 401, no model call', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer wrong' }), ENV({ FOUNDER_KEY: 'secret-founder-key' }), ctx);
    assert.equal(r.status, 401);
    assert.equal(m.n, 0);
  });

  test('fails CLOSED when no FOUNDER_KEY is bound', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer anything' }), ENV(), ctx);
    assert.equal(r.status, 401);
    assert.match((await r.json()).detail, /no FOUNDER_KEY bound/);
    assert.equal(m.n, 0);
  });

  test('the founder key reaches the model', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer secret-founder-key' }), ENV({ FOUNDER_KEY: 'secret-founder-key' }), ctx);
    assert.equal(r.status, 200);
    assert.equal((await r.json()).ok, true);
    assert.ok(m.n >= 1);
  });

  test('even the founder key is capped at 30 calls a minute per IP', async () => {
    const m = modelCalls();
    const env = ENV({ FOUNDER_KEY: 'secret-founder-key', DB: stubDB({ recentCalls: 30 }) });
    const r = await worker.fetch(post({ Authorization: 'Bearer secret-founder-key' }), env, ctx);
    assert.equal(r.status, 429);
    assert.equal(m.n, 0, 'a rate-limited call must not spend money');
  });
});
