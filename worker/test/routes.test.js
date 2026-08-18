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
  generateAccessKeyPair, signAccessJWT,
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

// Cloudflare Access (2026-08-09) — a second, key-free founder gate, additive
// alongside FOUNDER_KEY above (which the previous describe block already
// proves is completely unaffected by any of this). verifyAccessJWT() itself has
// its own dedicated, exhaustive suite in access-auth.test.js (every
// signature/audience/expiry/email failure path, mutation-tested); this block's
// job is narrower — proving the /v11/founder/* routes are wired to it
// correctly end to end through the real fetch handler, including the one
// genuine improvement over the FOUNDER_KEY path: decided_by gets stamped with
// a real, verified email instead of staying null forever.
describe('the founder gate via Cloudflare Access (/v11/founder/*)', () => {
  const TEAM_DOMAIN = 'test-team.cloudflareaccess.com';
  const AUD = 'test-application-audience-tag';
  const FOUNDER_EMAIL = 'founder@example.com';
  let privateKey, publicJwk, kid;

  before(async () => {
    ({ privateKey, publicJwk, kid } = await generateAccessKeyPair());
  });

  const accessEnv = (overrides = {}) => makeEnv({
    ACCESS_TEAM_DOMAIN: TEAM_DOMAIN, ACCESS_AUD: AUD, FOUNDER_EMAIL, ...overrides,
  });
  const withAccessJWKS = () => {
    const s = stubOutboundFetch(async (url) => (url === `https://${TEAM_DOMAIN}/cdn-cgi/access/certs`
      ? providerRes({ keys: [publicJwk] })
      : providerRes({}, { ok: false, status: 404 })));
    restoreFetch = s.restore;
  };
  const sign = (overrides = {}) => signAccessJWT(privateKey, kid, { email: FOUNDER_EMAIL, aud: AUD, ...overrides });

  test('a valid Access token decides a proposal and stamps decided_by with the real email', async () => {
    withAccessJWKS();
    const DB = stubDB({ 'SELECT kind, title, body FROM hive_proposals': { kind: 'suggestion', title: 'x', body: '{}' } });
    const token = await sign();

    const r = await call(req('/founder/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { 'Cf-Access-Jwt-Assertion': token },
    }), accessEnv({ DB }));

    assert.equal(r.status, 200);
    const updateCall = DB.queries.find((q) => q.sql.includes('UPDATE hive_proposals SET status=?, decided_at=?, founder_note=?, decided_by=?'));
    assert.ok(updateCall, 'expected the decide UPDATE to have run');
    assert.equal(updateCall.args[3], FOUNDER_EMAIL,
      'decided_by must carry the real, Access-verified email — the whole point of this path over FOUNDER_KEY');
  });

  test('no Access session (no header at all) is refused, same fail-closed default as founderAuthOk', async () => {
    withAccessJWKS();
    const r = await call(req('/founder/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' },
    }), accessEnv());

    assert.equal(r.status, 401);
  });

  test('an invalid/tampered Access token is refused', async () => {
    withAccessJWKS();
    const token = await sign();
    const badToken = token.slice(0, -4) + (token.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA');

    const r = await call(req('/founder/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { 'Cf-Access-Jwt-Assertion': badToken },
    }), accessEnv());

    assert.equal(r.status, 401);
  });

  test('Access not provisioned (no ACCESS_AUD/FOUNDER_EMAIL) fails closed even with a well-formed token', async () => {
    withAccessJWKS();
    const token = await sign();

    const r = await call(req('/founder/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' },
      headers: { 'Cf-Access-Jwt-Assertion': token },
    }), makeEnv({ DB: stubDB() })); // no ACCESS_* vars at all

    assert.equal(r.status, 401);
  });

  test('regression guard: the original FOUNDER_KEY route is completely unaffected by any of this', async () => {
    const env = makeEnv({ FOUNDER_KEY: 'real-key', DB: stubDB({ 'SELECT kind, title, body FROM hive_proposals': { kind: 'suggestion', title: 'x', body: '{}' } }) });

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'approved' }, headers: { Authorization: 'Bearer real-key' },
    }), env);

    assert.equal(r.status, 200);
    const updateCall = env.DB.queries.find((q) => q.sql.includes('decided_by=?'));
    assert.equal(updateCall.args[3], null,
      'the FOUNDER_KEY path must keep decided_by null exactly as before — no attribution change on this path');
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
      DB: stubDB({ 'SELECT kind, title, body FROM hive_proposals': { kind: 'suggestion', title: 't', body: '{}' } }),
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

// Modify/counter-propose (task 22, 2026-08-14): the panel only ever supported
// a binary approve/reject. 'modified' closes the original proposal (without
// executing anything, unlike approve) and files a brand-new pending proposal
// carrying the edited text, linked back via modifies_id — same founder-key
// gating as approve/reject, still fail-closed.
describe('POST /proposals/:id/decide — decision="modified" (task 22)', () => {
  test('still fails closed with no FOUNDER_KEY bound', async () => {
    const env = makeEnv({});

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'modified', modified_body: 'a better version' },
      headers: { Authorization: 'Bearer anything' },
    }), env);

    assert.equal(r.status, 401, 'the modify path must fail closed exactly like approve/reject');
  });

  test('an empty modified_body is rejected with 400, not silently accepted', async () => {
    const env = makeEnv({
      FOUNDER_KEY: 'real-key',
      DB: stubDB({ 'SELECT kind, title, body FROM hive_proposals': { kind: 'suggestion', title: 'Original', body: 'x' } }),
    });

    const r = await call(req('/proposals/1/decide', {
      method: 'POST', body: { decision: 'modified', modified_body: '   ' },
      headers: { Authorization: 'Bearer real-key' },
    }), env);

    assert.equal(r.status, 400);
    const b = await r.json();
    assert.match(b.detail, /modified_body/);
  });

  test('a real modified_body: closes the original as modified, inserts a new pending counter-proposal linked via modifies_id', async () => {
    const db = stubDB({
      'SELECT kind, title, body FROM hive_proposals': { kind: 'suggestion', title: 'Original title', body: 'original body' },
      'INSERT INTO hive_proposals': { meta: { last_row_id: 42 }, success: true },
      "UPDATE hive_proposals SET status='modified'": { meta: { changes: 1 }, success: true },
    });
    const env = makeEnv({ FOUNDER_KEY: 'real-key', DB: db });

    const r = await call(req('/proposals/7/decide', {
      method: 'POST', body: { decision: 'modified', modified_body: 'the founder\'s counter-proposal text' },
      headers: { Authorization: 'Bearer real-key' },
    }), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.ok, true);
    assert.equal(b.decision, 'modified');
    assert.equal(b.new_proposal_id, 42, 'must surface the real new row id, not a placeholder');

    const insert = db.queries.find((q) => q.sql.includes('INSERT INTO hive_proposals'));
    assert.ok(insert, 'a real INSERT must have run');
    assert.match(insert.args[0], /^\d{4}-\d{2}-\d{2}T/, 'first bound arg must be a real ISO timestamp');
    assert.deepEqual(insert.args.slice(1), ['suggestion', 'Modified: Original title',
      'the founder\'s counter-proposal text', 7],
      'the new row must carry the original kind, a derived title, the edited body, and modifies_id=7');

    const update = db.queries.find((q) => q.sql.includes("status='modified'"));
    assert.ok(update, 'the original row must be closed as modified, not silently left pending');
    assert.equal(update.args[2], 7, 'the UPDATE must target the original proposal id');
  });

  test('an explicit modified_title overrides the derived "Modified: <original>" default', async () => {
    const db = stubDB({
      'SELECT kind, title, body FROM hive_proposals': { kind: 'venture', title: 'Original', body: 'x' },
      'INSERT INTO hive_proposals': { meta: { last_row_id: 99 }, success: true },
      "UPDATE hive_proposals SET status='modified'": { meta: { changes: 1 }, success: true },
    });
    const env = makeEnv({ FOUNDER_KEY: 'real-key', DB: db });

    await call(req('/proposals/3/decide', {
      method: 'POST',
      body: { decision: 'modified', modified_body: 'new text', modified_title: 'A genuinely new title' },
      headers: { Authorization: 'Bearer real-key' },
    }), env);

    const insert = db.queries.find((q) => q.sql.includes('INSERT INTO hive_proposals'));
    assert.equal(insert.args[2], 'A genuinely new title');
  });

  test('a decision of "modified" never calls executeApprovedAction — only approve does', async () => {
    // action-request kind is the one case where 'approved' triggers real execution
    // (executeApprovedAction). 'modified' must never take that path, even for the
    // same kind — it only files a counter-proposal, exactly like reject records a
    // decision without executing anything.
    const db = stubDB({
      'SELECT kind, title, body FROM hive_proposals': { kind: 'action-request', title: 'Original', body: '{"action":"noop","params":{}}' },
      'INSERT INTO hive_proposals': { meta: { last_row_id: 5 }, success: true },
      "UPDATE hive_proposals SET status='modified'": { meta: { changes: 1 }, success: true },
    });
    const env = makeEnv({ FOUNDER_KEY: 'real-key', DB: db });

    const r = await call(req('/proposals/9/decide', {
      method: 'POST', body: { decision: 'modified', modified_body: 'edited action text' },
      headers: { Authorization: 'Bearer real-key' },
    }), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.execution, undefined, 'modify must never report an execution result — it is not an approval');
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
