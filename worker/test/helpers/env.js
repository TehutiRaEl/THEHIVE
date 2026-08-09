// worker/test/helpers/env.js
//
// Shared stubs for driving the real `fetch` handler in worker/src/index.js.
//
// Why this file exists (2026-08-08, CAMPAIGN task 15): the two existing suites
// (provider-routing.test.js, generate.test.js) cover the provider layer only —
// providerOrder() and generate(). The fetch handler itself, which is every
// /v11/* route the founder actually calls, had zero coverage. Task 15's own
// acceptance names /venture/plan, /legal/research and the rate-limit + token
// gating, and none of it was testable because there were no stubs for D1,
// ASSETS, Vectorize or the Workers cache API.
//
// These deliberately extend generate.test.js's thin-stub style rather than
// introducing a second pattern: record what was called so a test can assert a
// gate genuinely fired, and keep the surface no wider than the code really
// uses. Zero dependencies, matching automaton/'s precedent.

/**
 * D1 stub.
 *
 * Covers exactly the three shapes worker/src/index.js uses:
 *   DB.prepare(sql).bind(...).run()
 *   DB.prepare(sql).bind(...).first()
 *   DB.prepare(sql).all()          -> { results }
 *
 * `routes` maps a substring of the SQL to a canned result, so a test says what
 * a query returns without reimplementing SQL. Every statement is recorded in
 * `queries` so a test can prove a write happened (or, just as usefully, did not).
 */
export function stubDB(routes = {}) {
  const queries = [];

  const match = (sql) => {
    for (const [needle, value] of Object.entries(routes)) {
      if (sql.includes(needle)) return value;
    }
    return undefined;
  };

  // run()'s default return matches real D1: {success, meta:{changes,...}}. A
  // fixture can still override this (e.g. `{ meta: { changes: 0 } }` to
  // simulate "nothing matched"); default is `changes: 1`, i.e. "the write
  // affected a row" — the common case, and the one every existing caller of
  // run() before 2026-08-09 happened to not depend on (this default was
  // missing entirely until decideProposal()'s `result.meta?.changes` check
  // caught it: a plain {success:true} with no meta made every real decide
  // look like "proposal not found", found via a real test failure, not
  // inferred from reading the stub).
  const runResult = (v) => ({ success: true, meta: { changes: 1 }, ...(v || {}) });

  return {
    queries,
    prepare(sql) {
      const exec = (args) => {
        queries.push({ sql, args });
        return match(sql);
      };
      return {
        bind: (...args) => ({
          run: async () => runResult(exec(args)),
          first: async () => { const v = exec(args); return v === undefined ? null : v; },
          all: async () => { const v = exec(args); return { results: v ?? [] }; },
        }),
        run: async () => runResult(exec([])),
        first: async () => { const v = exec([]); return v === undefined ? null : v; },
        all: async () => { const v = exec([]); return { results: v ?? [] }; },
      };
    },
  };
}

/**
 * KV stub for RATE_LIMIT_KV — a real in-memory counter, not a no-op, because
 * rateLimitOk()'s whole behaviour is read-increment-compare. `expirationTtl` is
 * accepted and ignored on purpose: these tests drive the 30/min boundary, not
 * TTL expiry, and pretending to implement expiry would be stub theatre.
 */
export function stubKV(initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, String(v)]));
  return {
    store,
    get: async (k) => (store.has(k) ? store.get(k) : null),
    put: async (k, v) => { store.set(k, String(v)); },
    delete: async (k) => { store.delete(k); },
  };
}

/**
 * The Workers cache API. `caches.default` is a global in the Workers runtime and
 * is `undefined` in Node — cachedJson() (src/index.js:62) reads it on every
 * cached route, so without this, /agents and friends throw before a single
 * assertion is reached. Install once per suite, restore afterwards.
 */
export function installCaches() {
  const previous = globalThis.caches;
  const store = new Map();
  globalThis.caches = {
    default: {
      match: async (req) => store.get(String(req.url)),
      put: async (req, res) => { store.set(String(req.url), res); },
    },
  };
  return () => { globalThis.caches = previous; };
}

/** ctx.waitUntil records promises so a test can await background work. */
export function stubCtx() {
  const pending = [];
  return {
    pending,
    waitUntil: (p) => { pending.push(p); },
    settle: () => Promise.allSettled(pending),
  };
}

/**
 * Build an env. Bindings are absent unless asked for, because presence itself is
 * load-bearing all over this Worker — founderAuthOk() fails CLOSED with no
 * FOUNDER_KEY, tokenOk() fails OPEN with no WORKER_ADMIN_KEY, rateLimitOk()
 * falls back from KV to D1, and the async job path only exists when LLM_QUEUE is
 * bound. A stub env that silently binds everything would hide all four.
 */
export function makeEnv(overrides = {}) {
  return { DB: stubDB(), ...overrides };
}

/**
 * A Cloudflare Secrets Store binding stub — an object with an async .get(),
 * NOT a plain string like a classic `wrangler secret put` secret. FOUNDER_KEY
 * moved to this shape 2026-08-08; resolveSecret() in src/index.js must accept
 * both shapes, so tests need to be able to produce this one specifically.
 */
export function stubSecretsStoreSecret(value) {
  return { get: async () => value };
}

/** A Request against the live route shape (/v11 prefix, CF-Connecting-IP). */
export function req(path, { method = 'GET', body, headers = {}, ip = '1.2.3.4' } = {}) {
  const h = { 'CF-Connecting-IP': ip, ...headers };
  const init = { method, headers: h };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
    h['Content-Type'] = 'application/json';
  }
  return new Request(`https://thehive.sovereignhive.workers.dev/v11${path}`, init);
}

/** Stub global fetch for outbound LLM calls; returns the recorded call list. */
export function stubOutboundFetch(handler) {
  const calls = [];
  const previous = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push(String(url));
    return handler(String(url), init);
  };
  return { calls, restore: () => { globalThis.fetch = previous; } };
}

/**
 * Cloudflare Access test JWTs (2026-08-09) — a real RSA keypair + real signing,
 * not a mock, so tests exercise the exact crypto.subtle path verifyAccessJWT()
 * itself uses. Shared here (rather than duplicated per test file) so any suite
 * that needs a request carrying a valid Access identity can get one in two
 * calls: generateAccessKeyPair() once, then signAccessJWT() per token.
 */
export async function generateAccessKeyPair(kid = 'test-key-1') {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
  return { privateKey: pair.privateKey, publicJwk, kid };
}

function base64UrlEncode(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signAccessJWT(privateKey, kid, payloadOverrides = {}) {
  const header = { alg: 'RS256', typ: 'JWT', kid };
  const payload = {
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    ...payloadOverrides,
  };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, signingInput);
  return `${headerB64}.${payloadB64}.${base64UrlEncode(new Uint8Array(sig))}`;
}

/** A minimal fetch Response-alike for provider replies. */
export function providerRes(body, { ok = true, status = 200 } = {}) {
  return {
    ok, status,
    json: async () => body,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

/** An OpenAI-shaped completion, which is what Groq and Mistral both return. */
export const openaiReply = (text) => ({
  choices: [{ message: { content: text } }],
  usage: { prompt_tokens: 5, completion_tokens: 2 },
});
