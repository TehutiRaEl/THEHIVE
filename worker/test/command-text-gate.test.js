// worker/test/command-text-gate.test.js
//
// Founder decision S-4 (2026-11-22), executing FQ-Q-011's in-handler lock: POST /v11/command_text
// (Commune with Kai El) is founder-only. It used to be open to everyone with only a 30/min/IP limit,
// and every message runs the language model. Each test counts real model calls, so "no money was
// spent" is a fact.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };

const stubDB = ({ recentCalls = 0 } = {}) => {
  const mk = (sql) => ({
    run: async () => ({ success: true }),
    first: async () => (sql.includes('COUNT(*)') ? { n: recentCalls } : null),
    all: async () => ({ results: [] }),
  });
  return { prepare: (sql) => ({ ...mk(sql), bind: () => mk(sql) }), batch: async () => [] };
};
const ctx = { waitUntil: (p) => p };
const post = (headers = {}) => new Request('https://thehive.sovereignhive.workers.dev/v11/command_text', {
  method: 'POST',
  headers: { 'CF-Connecting-IP': '9.9.9.9', 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify({ command: 'Who are you, Kai El?' }),
});
const modelCalls = () => {
  const state = { n: 0 };
  globalThis.fetch = async () => {
    state.n += 1;
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'I am Kai El.' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }), text: async () => 'I am Kai El.' };
  };
  return state;
};
const ENV = (extra = {}) => ({ DB: stubDB(), GROQ_API_KEY: 'x', ...extra });
const KEY = 'secret-founder-key';

describe('POST /v11/command_text is founder-only', () => {
  test('no Authorization header: 401, marked founder_only, and the model is never called', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post(), ENV({ FOUNDER_KEY: KEY }), ctx);
    assert.equal(r.status, 401);
    const body = await r.json();
    assert.equal(body.founder_only, true);
    assert.match(body.detail, /founder-only/);
    assert.equal(m.n, 0);
  });

  test('a visitor token is not enough', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer a-free-visitor-token' }), ENV({ FOUNDER_KEY: KEY }), ctx);
    assert.equal(r.status, 401);
    assert.equal(m.n, 0);
  });

  test('a wrong key: 401, no model call', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: 'Bearer wrong' }), ENV({ FOUNDER_KEY: KEY }), ctx);
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

  test('the founder key reaches Kai El and gets an answer', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: `Bearer ${KEY}` }), ENV({ FOUNDER_KEY: KEY }), ctx);
    assert.equal(r.status, 200);
    assert.ok(typeof (await r.json()).result === 'string');
    assert.ok(m.n >= 1);
  });

  test('the founder is still held to the 30/min/IP cap', async () => {
    const m = modelCalls();
    const r = await worker.fetch(post({ Authorization: `Bearer ${KEY}` }), ENV({ FOUNDER_KEY: KEY, DB: stubDB({ recentCalls: 30 }) }), ctx);
    assert.equal(r.status, 429);
    assert.equal(m.n, 0);
  });
});
