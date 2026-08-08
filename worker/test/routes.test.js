// worker/test/routes.test.js
//
// Drives the REAL fetch handler in worker/src/index.js — the one every /v11/*
// request goes through — rather than any reconstruction of it.
//
// Why this suite exists (2026-08-08, CAMPAIGN task 15): the harness stood up on
// 2026-08-07 covered the provider layer only, and task 15 said so honestly rather
// than claiming to be done. Its own acceptance names /venture/plan,
// /legal/research and the rate-limit + token gating. This is that coverage.
//
// The gates are the point. Three of them have DIFFERENT failure defaults, on
// purpose, and getting one backwards would be a real security bug that reads as
// a typo:
//   rateLimitOk   — fails OPEN on infra trouble (anti-spam, not a boundary)
//   tokenOk       — fails OPEN with no WORKER_ADMIN_KEY (dev mode)
//   founderAuthOk — fails CLOSED with no FOUNDER_KEY (approving proposals is
//                   high-stakes; "the founder said yes" must be verifiably true)
// Each is asserted in both directions here so a future edit cannot quietly
// flip one.

import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import {
  stubDB, stubKV, installCaches, stubCtx, makeEnv, req,
  stubOutboundFetch, providerRes, openaiReply,
} from './helpers/env.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

let restoreFetch = null;
afterEach(() => { if (restoreFetch) { restoreFetch(); restoreFetch = null; } });

// Bind Mistral only: one provider, so `provider` in the response is unambiguous.
const withMistral = (answer) => {
  const s = stubOutboundFetch(async () => providerRes(openaiReply(answer)));
  restoreFetch = s.restore;
  return s;
};

const call = (request, env, ctx = stubCtx()) => worker.fetch(request, env, ctx);

describe('POST /venture/plan', () => {
  test('a valid brief returns a parsed plan and names the provider that answered', async () => {
    withMistral(JSON.stringify({
      goal: 'Sell books',
      departments: [{ name: 'Sourcing', mandate: 'find stock', tasks: ['a', 'b'] }],
    }));
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'a bookshop' } }), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.ok, true);
    assert.equal(b.plan.goal, 'Sell books');
    assert.equal(b.provider, 'mistral');
    assert.match(b.note, /nothing here creates a real account/,
      'the no-real-world-action disclaimer must survive — it is a constitutional promise, not decoration');
  });

  test('an empty brief is rejected before any provider is called', async () => {
    const s = withMistral('unused');
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: '   ' } }), env);

    assert.equal(r.status, 400);
    assert.deepEqual(s.calls, [], 'must not spend an LLM call to discover the input was empty');
  });

  test('non-JSON from the model returns the raw output rather than a fabricated plan', async () => {
    withMistral('I am afraid I cannot do that.');
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' } }), env);
    const b = await r.json();

    assert.equal(r.status, 502);
    assert.equal(b.ok, false);
    assert.match(b.raw, /cannot do that/, 'the real output must be shown, not replaced');
    assert.equal(b.plan, undefined, 'no invented fallback plan');
  });

  test('no bound provider returns 503 and fabricates nothing', async () => {
    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' } }), makeEnv());
    const b = await r.json();

    assert.equal(r.status, 503);
    assert.equal(b.ok, false);
    assert.equal(b.plan, undefined);
  });

  test('{"async": true} enqueues instead of generating, when LLM_QUEUE is bound', async () => {
    const s = withMistral('unused');
    const sent = [];
    const env = makeEnv({ MISTRAL_API_KEY: 'k', LLM_QUEUE: { send: async (m) => { sent.push(m); } } });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x', async: true } }), env);
    const b = await r.json();

    assert.equal(r.status, 202);
    assert.equal(b.status, 'queued');
    assert.equal(sent[0].kind, 'venture/plan');
    assert.deepEqual(s.calls, [], 'the async path must not also call the model');
  });

  test('{"async": true} falls back to the sync path when LLM_QUEUE is unbound', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x', async: true } }), env);

    assert.equal(r.status, 200, 'asking for async on an unprovisioned queue must still answer, not 500');
  });
});

describe('POST /legal/research', () => {
  test('an answer always carries the not-a-lawyer disclaimer', async () => {
    withMistral('Jurisdiction is a real doctrine.');
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/legal/research', { method: 'POST', body: { question: 'what is jurisdiction?' } }), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.answer, 'Jurisdiction is a real doctrine.');
    assert.match(b.disclaimer, /Not a lawyer\. Not legal advice\./,
      'the disclaimer is the founder-set scope of this route — it must not be droppable');
  });

  test('an empty question is rejected before any provider is called', async () => {
    const s = withMistral('unused');
    const env = makeEnv({ MISTRAL_API_KEY: 'k' });

    const r = await call(req('/legal/research', { method: 'POST', body: {} }), env);

    assert.equal(r.status, 400);
    assert.deepEqual(s.calls, []);
  });

  test('no bound provider returns 503 rather than an invented answer', async () => {
    const r = await call(req('/legal/research', { method: 'POST', body: { question: 'q' } }), makeEnv());
    const b = await r.json();

    assert.equal(r.status, 503);
    assert.equal(b.answer, undefined);
  });
});

describe('the rate-limit gate (30 POSTs/min/IP)', () => {
  test('the 31st request from one IP is refused', async () => {
    const KV = stubKV({ 'rl:9.9.9.9': 30 });
    const env = makeEnv({ MISTRAL_API_KEY: 'k', RATE_LIMIT_KV: KV });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' }, ip: '9.9.9.9' }), env);

    assert.equal(r.status, 429);
    assert.match((await r.json()).detail, /rate limit exceeded/);
  });

  test('the 30th request is still allowed — the boundary is not off by one', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));
    const KV = stubKV({ 'rl:8.8.8.8': 29 });
    const env = makeEnv({ MISTRAL_API_KEY: 'k', RATE_LIMIT_KV: KV });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' }, ip: '8.8.8.8' }), env);

    assert.equal(r.status, 200);
    assert.equal(KV.store.get('rl:8.8.8.8'), '30', 'an allowed request must still increment the counter');
  });

  test('counting is per-IP, so one noisy caller cannot block another', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));
    const KV = stubKV({ 'rl:9.9.9.9': 30 });
    const env = makeEnv({ MISTRAL_API_KEY: 'k', RATE_LIMIT_KV: KV });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' }, ip: '5.5.5.5' }), env);

    assert.equal(r.status, 200);
  });

  test('a KV outage fails OPEN — anti-spam must never take the route down', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));
    const brokenKV = { get: async () => { throw new Error('KV down'); }, put: async () => {} };
    const env = makeEnv({ MISTRAL_API_KEY: 'k', RATE_LIMIT_KV: brokenKV });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' } }), env);

    assert.equal(r.status, 200);
  });
});

describe('the token gate (tokenOk) — fails OPEN by design', () => {
  test('with no WORKER_ADMIN_KEY, an unauthenticated request is allowed (dev mode)', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' } }),
      makeEnv({ MISTRAL_API_KEY: 'k' }));

    assert.equal(r.status, 200);
  });

  test('with WORKER_ADMIN_KEY set and no token, the request is refused', async () => {
    const env = makeEnv({ MISTRAL_API_KEY: 'k', WORKER_ADMIN_KEY: 'admin' });

    const r = await call(req('/venture/plan', { method: 'POST', body: { brief: 'x' } }), env);

    assert.equal(r.status, 401);
    assert.match((await r.json()).detail, /token required/);
  });

  test('with WORKER_ADMIN_KEY set and a live token, the request proceeds', async () => {
    withMistral(JSON.stringify({ goal: 'g', departments: [] }));
    const env = makeEnv({
      MISTRAL_API_KEY: 'k',
      WORKER_ADMIN_KEY: 'admin',
      DB: stubDB({ visitor_tokens: { token: 'live-token' } }),
    });

    const r = await call(req('/venture/plan', {
      method: 'POST', body: { brief: 'x' }, headers: { Authorization: 'Bearer live-token' },
    }), env);

    assert.equal(r.status, 200);
  });

  test('an expired/unknown token is refused', async () => {
    const env = makeEnv({
      MISTRAL_API_KEY: 'k',
      WORKER_ADMIN_KEY: 'admin',
      DB: stubDB({ visitor_tokens: undefined }), // no matching row
    });

    const r = await call(req('/venture/plan', {
      method: 'POST', body: { brief: 'x' }, headers: { Authorization: 'Bearer stale' },
    }), env);

    assert.equal(r.status, 401);
  });
});

describe('the founder gate (founderAuthOk) — fails CLOSED by design', () => {
  test('with no FOUNDER_KEY bound, nobody can decide a proposal — not even with a key', async () => {
    const env = makeEnv({});

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approve' }, headers: { Authorization: 'Bearer anything' },
    }), env);

    assert.equal(r.status, 401,
      'this must fail closed: an unbound FOUNDER_KEY means nothing is approvable, not that everything is');
  });

  test('with FOUNDER_KEY bound, a wrong key is still refused', async () => {
    const env = makeEnv({ FOUNDER_KEY: 'real-key' });

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approve' }, headers: { Authorization: 'Bearer wrong-key' },
    }), env);

    assert.equal(r.status, 401);
  });
});

describe('routing basics', () => {
  test('/health answers without any binding at all', async () => {
    const r = await call(req('/health'), makeEnv());
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.status, 'healthy');
    assert.equal(b.runtime, 'cloudflare-worker');
  });

  test('an unknown path is a clean 404 that names the path', async () => {
    const r = await call(req('/definitely-not-a-route'), makeEnv());
    const b = await r.json();

    assert.equal(r.status, 404);
    assert.match(b.path, /definitely-not-a-route/);
  });

  test('OPTIONS preflight returns 204 with CORS headers', async () => {
    const r = await call(req('/venture/plan', { method: 'OPTIONS' }), makeEnv());

    assert.equal(r.status, 204);
    assert.ok(r.headers.get('Access-Control-Allow-Methods'), 'preflight must advertise allowed methods');
  });

  test('GET on a POST-only route does not fall through to the POST handler', async () => {
    const s = withMistral('unused');

    const r = await call(req('/venture/plan'), makeEnv({ MISTRAL_API_KEY: 'k' }));

    assert.equal(r.status, 404);
    assert.deepEqual(s.calls, [], 'a GET must never trigger a paid generation');
  });
});
