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
  stubOutboundFetch, providerRes, openaiReply, stubSecretsStoreSecret,
} from './helpers/env.js';
import { resolveSecret, founderKeyBound } from '../src/index.js';

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

// FOUNDER_KEY moved to Cloudflare's Secrets Store 2026-08-08 — a binding shaped
// as { get: async () => value } rather than a plain string. Every test above
// this point uses the classic string shape; these prove the new object shape
// works identically, since resolveSecret() is what makes both shapes equivalent
// everywhere this file reads env.FOUNDER_KEY.
describe('resolveSecret() — classic string secret vs. Secrets Store object binding', () => {
  test('a plain string secret resolves to itself', async () => {
    assert.equal(await resolveSecret('real-key'), 'real-key');
  });

  test('a Secrets Store binding resolves via its async .get()', async () => {
    assert.equal(await resolveSecret(stubSecretsStoreSecret('real-key')), 'real-key');
  });

  test('an empty string secret resolves to null', async () => {
    assert.equal(await resolveSecret(''), null);
  });

  test('a Secrets Store binding whose .get() resolves empty resolves to null', async () => {
    assert.equal(await resolveSecret(stubSecretsStoreSecret('')), null);
  });

  test('a missing binding resolves to null', async () => {
    assert.equal(await resolveSecret(undefined), null);
  });

  test('a Secrets Store binding whose .get() throws resolves to null, not a crash', async () => {
    const bad = { get: async () => { throw new Error('store unreachable'); } };
    assert.equal(await resolveSecret(bad), null);
  });

  test('founderKeyBound() is true for a bound Secrets Store binding', async () => {
    assert.equal(await founderKeyBound({ FOUNDER_KEY: stubSecretsStoreSecret('real-key') }), true);
  });

  test('founderKeyBound() is false when the Secrets Store binding is absent', async () => {
    assert.equal(await founderKeyBound({}), false);
  });

  // 2026-08-09: real incident — the founder pasted a rotated FOUNDER_KEY that
  // carried a trailing newline into the GitHub secret, which corrupted the CI
  // curl request enough to fail before it was even sent, and separately into
  // this panel's key field, which produced a confusing "invalid or missing
  // founder key". Both were the same root cause: invisible whitespace. These
  // prove it can never again be the difference between a matching and
  // non-matching key.
  test('a plain string secret with a trailing newline is trimmed', async () => {
    assert.equal(await resolveSecret('real-key\n'), 'real-key');
  });

  test('a Secrets Store binding whose value has a trailing newline is trimmed', async () => {
    assert.equal(await resolveSecret(stubSecretsStoreSecret('real-key\n')), 'real-key');
  });

  test('a secret that is whitespace-only resolves to null, not an empty-string match', async () => {
    assert.equal(await resolveSecret('   \n'), null);
  });

  test('founderAuthOk accepts a Bearer token when the stored secret has trailing whitespace', async () => {
    const env = makeEnv({ FOUNDER_KEY: 'real-key\r\n' });
    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { Authorization: 'Bearer real-key' },
    }), env);
    assert.notEqual(r.status, 401,
      'a trailing newline on the stored secret must not make an otherwise-correct key fail');
  });
});

describe('the founder gate under a Secrets Store FOUNDER_KEY binding', () => {
  test('the right key, via a Secrets Store binding, is accepted', async () => {
    const env = makeEnv({
      FOUNDER_KEY: stubSecretsStoreSecret('real-key'),
      DB: stubDB({ 'SELECT kind, body FROM hive_proposals': { kind: 'suggestion', body: '{}' } }),
    });

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { Authorization: 'Bearer real-key' },
    }), env);

    assert.notEqual(r.status, 401,
      'a Secrets Store binding must authenticate exactly like a classic string secret');
  });

  test('a wrong key, via a Secrets Store binding, is still refused', async () => {
    const env = makeEnv({ FOUNDER_KEY: stubSecretsStoreSecret('real-key') });

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { Authorization: 'Bearer wrong-key' },
    }), env);

    assert.equal(r.status, 401);
  });

  test('/debug/env reports FOUNDER_KEY present when bound via Secrets Store', async () => {
    const env = makeEnv({ FOUNDER_KEY: stubSecretsStoreSecret('real-key') });

    const r = await call(req('/debug/env'), env);
    const b = await r.json();

    assert.ok(b.secrets_present.includes('FOUNDER_KEY'),
      'a Secrets Store binding must not silently regress to permanently-absent (the task 35 class of bug)');
  });

  test('/debug/env does not report FOUNDER_KEY present when its Secrets Store .get() resolves empty', async () => {
    const env = makeEnv({ FOUNDER_KEY: stubSecretsStoreSecret('') });

    const r = await call(req('/debug/env'), env);
    const b = await r.json();

    assert.ok(!b.secrets_present.includes('FOUNDER_KEY'));
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
