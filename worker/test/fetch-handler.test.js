// worker/test/fetch-handler.test.js
//
// Task 15, continued. The Worker's `fetch` handler — every /v11/* route the founder
// actually hits — had ZERO test coverage until this file. The two existing suites cover
// the provider layer (providerOrder, generate); nothing exercised routing, the rate limit,
// or the token gate.
//
// Task 15's own acceptance names the targets: /venture/plan, /legal/research, and the
// rate-limit + token gating. Those are what this file covers.
//
// The real work here is the D1 stub. The handler needs an `env` with bindings that do not
// exist in a test process, and building an honest one is most of the job — it unlocks
// every future route test. Deliberately no dependencies: Node 22 ships Request/Response/
// crypto.randomUUID natively (verified), matching automaton/'s zero-dependency precedent.

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// `caches` is a Cloudflare Workers global with no Node equivalent, and cachedJson()
// reaches for `caches.default` unconditionally. Without this stub every cached route
// (/agents, /llm/status, /roadmap…) throws ReferenceError in tests — which is a gap in
// the test environment, not a bug in the Worker, since the global genuinely exists in
// production. Always-miss: each test computes fresh, so no cross-test bleed.
globalThis.caches = {
  default: {
    match: async () => undefined,
    put: async () => {},
  },
};

// ── D1 stub ──────────────────────────────────────────────────────────────
// Matches queries by SQL substring, because the handler builds SQL inline and a test
// should not have to reproduce it exactly (that would break on any harmless rewording).
// Records every bind() so a test can assert what was really written, not just that the
// route returned 200 — the difference between testing behaviour and testing a status code.
function stubDB(responses = {}) {
  const calls = [];
  const match = (sql) => Object.keys(responses).find((k) => sql.includes(k));
  return {
    calls,
    prepare(sql) {
      const mk = (args) => ({
        run: async () => { calls.push({ sql, args }); return { success: true }; },
        first: async () => {
          calls.push({ sql, args });
          const k = match(sql);
          return k ? responses[k] : null;
        },
        all: async () => {
          calls.push({ sql, args });
          const k = match(sql);
          return { results: k ? responses[k] : [] };
        },
      });
      return { ...mk([]), bind: (...args) => mk(args) };
    },
    batch: async () => [],
  };
}

const ctx = { waitUntil: (p) => p };

const req = (path, { method = 'GET', body, headers = {} } = {}) =>
  new Request(`https://thehive.sovereignhive.workers.dev/v11${path}`, {
    method,
    headers: { 'CF-Connecting-IP': '1.2.3.4', 'Content-Type': 'application/json', ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

const call = (path, opts, env) => worker.fetch(req(path, opts), env, ctx);

// A provider response so /venture/plan and /legal/research can reach their own logic
// instead of dying at "no provider bound".
const stubProvider = (text) => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: text } }], usage: { prompt_tokens: 1, completion_tokens: 1 } }),
    text: async () => text,
  });
};

describe('routing basics', () => {
  test('/health answers without touching D1 at all', async () => {
    const DB = stubDB();
    const r = await call('/health', {}, { DB });
    assert.equal(r.status, 200);
    assert.equal((await r.json()).status, 'healthy');
    assert.equal(DB.calls.length, 0, 'health must not depend on the database');
  });

  test('an unknown path 404s rather than falling through to something else', async () => {
    const r = await call('/definitely-not-a-route', {}, { DB: stubDB() });
    assert.equal(r.status, 404);
  });

  test('OPTIONS preflight returns 204 with the always-on CORS headers', async () => {
    const r = await call('/venture/plan', { method: 'OPTIONS' }, { DB: stubDB() });
    assert.equal(r.status, 204);
    assert.equal(r.headers.get('Access-Control-Allow-Methods'), 'GET,POST,OPTIONS');
    assert.equal(r.headers.get('Vary'), 'Origin');
  });

  // These two encode the real security decision in corsHeadersFor(): Allow-Origin is
  // echoed ONLY for an origin on the allowlist. A first draft of this file asserted the
  // header was always present and failed — the test was wrong, the Worker was right.
  // Worth keeping both directions so a future change that starts echoing arbitrary
  // origins fails loudly instead of silently widening access.
  test('an allowlisted Origin gets Allow-Origin echoed back', async () => {
    const r = await call('/venture/plan',
      { method: 'OPTIONS', headers: { Origin: 'https://tehutirael.github.io' } },
      { DB: stubDB() });
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://tehutirael.github.io');
  });

  test('an unknown Origin is NOT echoed back', async () => {
    const r = await call('/venture/plan',
      { method: 'OPTIONS', headers: { Origin: 'https://evil.example.com' } },
      { DB: stubDB() });
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), null,
      'echoing an arbitrary origin would defeat the allowlist entirely');
  });

  test('/auth/token issues a token and persists it', async () => {
    const DB = stubDB();
    const r = await call('/auth/token', {}, { DB });
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.token_type, 'bearer');
    assert.match(d.access_token, /^[0-9a-f-]{36}$/, 'must be a real UUID');
    assert.ok(DB.calls.some((c) => c.sql.includes('visitor_tokens')), 'token must be stored');
  });
});

describe('rate limiting — the gate, not just the happy path', () => {
  test('at the limit the request is refused with 429 before any LLM call', async () => {
    let providerCalled = false;
    globalThis.fetch = async () => { providerCalled = true; throw new Error('should never run'); };
    // 30 is the documented cap; COUNT(*) returning it means this IP is already at it.
    const DB = stubDB({ 'COUNT(*) AS n': { n: 30 } });

    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } },
      { DB, MISTRAL_API_KEY: 'k' });

    assert.equal(r.status, 429);
    assert.match((await r.json()).detail, /rate limit/i);
    assert.equal(providerCalled, false, 'a rate-limited request must not cost a provider call');
  });

  test('under the limit the request proceeds past the gate', async () => {
    const DB = stubDB({ 'COUNT(*) AS n': { n: 3 } });
    const r = await call('/venture/plan', { method: 'POST', body: {} }, { DB });
    assert.notEqual(r.status, 429, 'must get past the rate limiter');
  });

  test('KV backend is preferred over D1 when bound, and enforces the same cap', async () => {
    const DB = stubDB();
    const env = {
      DB,
      RATE_LIMIT_KV: { get: async () => '30', put: async () => {} },
    };
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } }, env);
    assert.equal(r.status, 429);
    assert.equal(DB.calls.filter((c) => c.sql.includes('rate_limits')).length, 0,
      'with KV bound, the D1 rate-limit path must not be used');
  });

  test('a KV outage fails OPEN — infra trouble must never block the hive', async () => {
    const env = {
      DB: stubDB(),
      RATE_LIMIT_KV: { get: async () => { throw new Error('KV down'); }, put: async () => {} },
    };
    const r = await call('/venture/plan', { method: 'POST', body: {} }, env);
    assert.notEqual(r.status, 429, 'a KV failure must not be treated as rate-limited');
  });
});

describe('token gating — fails open without an admin key, closed with one', () => {
  test('no WORKER_ADMIN_KEY set means dev mode: no token required', async () => {
    const DB = stubDB({ 'COUNT(*) AS n': { n: 0 } });
    const r = await call('/venture/plan', { method: 'POST', body: {} }, { DB });
    assert.notEqual(r.status, 401, 'must not demand a token when no admin key is bound');
  });

  test('with WORKER_ADMIN_KEY set, a missing token is rejected 401', async () => {
    const DB = stubDB({ 'COUNT(*) AS n': { n: 0 } });
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } },
      { DB, WORKER_ADMIN_KEY: 'admin' });
    assert.equal(r.status, 401);
    assert.match((await r.json()).detail, /token required/i);
  });

  test('with WORKER_ADMIN_KEY set, an unknown token is rejected 401', async () => {
    // visitor_tokens lookup returns null => token not found / expired
    const DB = stubDB({ 'COUNT(*) AS n': { n: 0 } });
    const r = await call('/venture/plan',
      { method: 'POST', body: { brief: 'x' }, headers: { Authorization: 'Bearer nope' } },
      { DB, WORKER_ADMIN_KEY: 'admin' });
    assert.equal(r.status, 401);
  });

  test('a valid unexpired token is accepted', async () => {
    const DB = stubDB({ 'COUNT(*) AS n': { n: 0 }, 'FROM visitor_tokens': { token: 'good' } });
    const r = await call('/venture/plan',
      { method: 'POST', body: {}, headers: { Authorization: 'Bearer good' } },
      { DB, WORKER_ADMIN_KEY: 'admin' });
    assert.notEqual(r.status, 401, 'a valid token must pass the gate');
  });
});

describe('/venture/plan', () => {
  const baseEnv = () => ({ DB: stubDB({ 'COUNT(*) AS n': { n: 0 } }), MISTRAL_API_KEY: 'k' });

  test('an empty brief is rejected 400 before any provider call', async () => {
    let called = false;
    globalThis.fetch = async () => { called = true; throw new Error('nope'); };
    const r = await call('/venture/plan', { method: 'POST', body: { brief: '   ' } }, baseEnv());
    assert.equal(r.status, 400);
    assert.match((await r.json()).detail, /brief required/i);
    assert.equal(called, false);
  });

  test('no provider bound returns 503 and fabricates nothing', async () => {
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'sell books' } },
      { DB: stubDB({ 'COUNT(*) AS n': { n: 0 } }) }); // no provider keys at all
    assert.equal(r.status, 503);
    const d = await r.json();
    assert.equal(d.ok, false);
    assert.equal(d.plan, undefined, 'must not invent a plan when no provider answered');
  });

  test('valid model JSON produces a structured plan', async () => {
    stubProvider(JSON.stringify({
      goal: 'Launch the store',
      departments: [{ name: 'Product', mandate: 'source', tasks: ['find supplier'] }],
    }));
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'sell books' } }, baseEnv());
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.equal(d.ok, true);
    assert.equal(d.plan.goal, 'Launch the store');
    assert.ok(d.note.includes('nothing here creates a real account'),
      'the no-real-action disclaimer must ship with every plan');
  });

  test('markdown-fenced JSON is still parsed — a real model behaviour', async () => {
    stubProvider('```json\n{"goal":"G","departments":[]}\n```');
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } }, baseEnv());
    assert.equal(r.status, 200);
    assert.equal((await r.json()).plan.goal, 'G');
  });

  test('malformed model output returns 502 with the raw text, never a fabricated plan', async () => {
    stubProvider('I am afraid I cannot do that.');
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } }, baseEnv());
    const d = await r.json();
    assert.equal(r.status, 502);
    assert.equal(d.ok, false);
    assert.equal(d.plan, undefined);
    assert.ok(d.raw.includes('cannot do that'), 'the real output must be shown, not hidden');
  });

  test('right-shaped-but-wrong-typed JSON is rejected, not passed through', async () => {
    stubProvider(JSON.stringify({ goal: 42, departments: 'not-an-array' }));
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x' } }, baseEnv());
    assert.equal(r.status, 502, 'shape validation must actually validate types');
  });

  test('async:true with a queue bound enqueues and returns 202 without calling a provider', async () => {
    let providerCalled = false;
    globalThis.fetch = async () => { providerCalled = true; throw new Error('nope'); };
    const DB = stubDB({ 'COUNT(*) AS n': { n: 0 } });
    const sent = [];
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x', async: true } },
      { DB, MISTRAL_API_KEY: 'k', LLM_QUEUE: { send: async (m) => sent.push(m) } });
    const d = await r.json();
    assert.equal(r.status, 202);
    assert.equal(d.status, 'queued');
    assert.match(d.poll, /^\/v11\/jobs\?id=/);
    assert.equal(sent.length, 1, 'the job must actually reach the queue');
    assert.equal(providerCalled, false, 'the async path must not also run inference inline');
    assert.ok(DB.calls.some((c) => c.sql.includes('async_jobs')), 'the job must be persisted');
  });

  test('async:true with NO queue bound falls back to the sync path', async () => {
    stubProvider(JSON.stringify({ goal: 'G', departments: [] }));
    const r = await call('/venture/plan', { method: 'POST', body: { brief: 'x', async: true } }, baseEnv());
    assert.equal(r.status, 200, 'must degrade to sync rather than 500 when LLM_QUEUE is absent');
  });
});

describe('/legal/research', () => {
  const baseEnv = () => ({ DB: stubDB({ 'COUNT(*) AS n': { n: 0 } }), MISTRAL_API_KEY: 'k' });

  test('an empty question is rejected 400', async () => {
    const r = await call('/legal/research', { method: 'POST', body: { question: '' } }, baseEnv());
    assert.equal(r.status, 400);
  });

  test('no provider bound returns 503 rather than a made-up legal answer', async () => {
    const r = await call('/legal/research', { method: 'POST', body: { question: 'what is jurisdiction' } },
      { DB: stubDB({ 'COUNT(*) AS n': { n: 0 } }) });
    assert.equal(r.status, 503);
    const d = await r.json();
    assert.equal(d.answer, undefined, 'must never fabricate a legal answer');
  });

  test('a real answer comes back with the provider named', async () => {
    stubProvider('General information only. This is not legal advice.');
    const r = await call('/legal/research', { method: 'POST', body: { question: 'what is jurisdiction' } }, baseEnv());
    const d = await r.json();
    assert.equal(r.status, 200);
    assert.ok(d.answer.includes('not legal advice'));
    assert.equal(d.provider, 'mistral', 'the answering provider must be reported');
  });

  test('it is rate-limited and token-gated on the same terms as /venture/plan', async () => {
    const r = await call('/legal/research', { method: 'POST', body: { question: 'q' } },
      { DB: stubDB({ 'COUNT(*) AS n': { n: 30 } }), MISTRAL_API_KEY: 'k' });
    assert.equal(r.status, 429, 'the legal route must not be an unguarded back door');
  });
});

describe('failure containment', () => {
  test('a thrown D1 error becomes a 500, not an unhandled crash', async () => {
    const DB = { prepare() { throw new Error('D1 exploded'); } };
    const r = await call('/agents', {}, { DB });
    assert.equal(r.status, 500);
    assert.match((await r.json()).detail, /D1 exploded/);
  });

  test('malformed JSON in the request body is tolerated, not fatal', async () => {
    const request = new Request('https://x/v11/venture/plan', {
      method: 'POST',
      headers: { 'CF-Connecting-IP': '1.2.3.4', 'Content-Type': 'application/json' },
      body: '{not valid json',
    });
    const r = await worker.fetch(request, { DB: stubDB({ 'COUNT(*) AS n': { n: 0 } }) }, ctx);
    assert.equal(r.status, 400, 'a bad body should read as a missing brief, not a crash');
  });
});
