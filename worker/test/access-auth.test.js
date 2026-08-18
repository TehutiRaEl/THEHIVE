// worker/test/access-auth.test.js
//
// Cloudflare Access — the founder's key-free browser login (2026-08-09),
// additive alongside FOUNDER_KEY. verifyAccessJWT() in src/index.js is the whole
// trust boundary for the new /v11/founder/* routes, so it gets the same
// discipline every other founder gate in this suite already has: real signature
// verification (a throwaway RSA keypair, not a mock — see
// helpers/env.js:generateAccessKeyPair/signAccessJWT, shared with
// routes.test.js's /v11/founder/* coverage so the crypto setup exists once),
// every failure path asserted, and mutation-tested afterward.
//
// Zero dependencies — Node's built-in crypto.subtle (Web Crypto, global as of
// the Node version this repo requires) both signs the test tokens and is the
// exact same API verifyAccessJWT() itself uses in production, so this suite is
// testing the real verification path, not a re-implementation of it.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { verifyAccessJWT } from '../src/index.js';
import {
  installCaches, stubOutboundFetch, providerRes, stubCtx,
  generateAccessKeyPair, signAccessJWT,
} from './helpers/env.js';

const TEAM_DOMAIN = 'test-team.cloudflareaccess.com';
const AUD = 'test-application-audience-tag';
const FOUNDER_EMAIL = 'founder@example.com';

function reqWithToken(token) {
  const headers = token ? { 'Cf-Access-Jwt-Assertion': token } : {};
  return new Request('https://thehive.sovereignhive.workers.dev/v11/founder/proposals/1/decide', {
    method: 'POST', headers,
  });
}

let privateKey, publicJwk, kid;
let restoreCaches;
let restoreFetch;

// One real keypair for the whole suite — regenerating per test would only slow
// things down for no extra coverage, since the tests vary the TOKEN/env, not
// the key material itself (the one exception, a genuinely different key, is
// its own dedicated test below).
const setupKeys = (async () => {
  ({ privateKey, publicJwk, kid } = await generateAccessKeyPair());
})();

beforeEach(async () => {
  await setupKeys;
  restoreCaches = installCaches();
  const s = stubOutboundFetch(async (url) => {
    if (url === `https://${TEAM_DOMAIN}/cdn-cgi/access/certs`) {
      return providerRes({ keys: [publicJwk] });
    }
    return providerRes({}, { ok: false, status: 404 });
  });
  restoreFetch = s.restore;
});

afterEach(() => {
  restoreCaches();
  restoreFetch();
});

const fullEnv = () => ({ ACCESS_TEAM_DOMAIN: TEAM_DOMAIN, ACCESS_AUD: AUD, FOUNDER_EMAIL });
const sign = (overrides = {}) => signAccessJWT(privateKey, kid, { email: FOUNDER_EMAIL, aud: AUD, ...overrides });

describe('verifyAccessJWT() — accepts a real, valid, correctly-signed token', () => {
  test('valid token, matching email and audience, is accepted', async () => {
    const token = await sign();
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, FOUNDER_EMAIL);
  });

  test('email comparison is case-insensitive and trims whitespace (same lesson as resolveSecret)', async () => {
    const token = await sign({ email: '  Founder@Example.com  ' });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, 'founder@example.com');
  });
});

describe('verifyAccessJWT() — fails CLOSED on every real failure path', () => {
  test('no Cf-Access-Jwt-Assertion header at all', async () => {
    const email = await verifyAccessJWT(reqWithToken(null), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('malformed token (not three dot-separated parts)', async () => {
    const email = await verifyAccessJWT(reqWithToken('not-a-real-jwt'), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('wrong audience is rejected', async () => {
    const token = await sign({ aud: 'some-other-application' });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('expired token is rejected', async () => {
    const token = await sign({ exp: Math.floor(Date.now() / 1000) - 60 });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('tampered signature is rejected', async () => {
    const token = await sign();
    const [h, p, sig] = token.split('.');
    const tamperedSig = sig.slice(0, -4) + (sig.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA');
    const email = await verifyAccessJWT(reqWithToken(`${h}.${p}.${tamperedSig}`), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('signed by a DIFFERENT key than the one in the JWKS is rejected', async () => {
    const other = await generateAccessKeyPair(kid); // same kid, wrong actual key
    const token = await signAccessJWT(other.privateKey, kid, { email: FOUNDER_EMAIL, aud: AUD });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('email mismatch is rejected', async () => {
    const token = await sign({ email: 'not-the-founder@example.com' });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('no FOUNDER_EMAIL configured — fails closed, same as an unbound FOUNDER_KEY', async () => {
    const token = await sign();
    const env = { ACCESS_TEAM_DOMAIN: TEAM_DOMAIN, ACCESS_AUD: AUD };
    const email = await verifyAccessJWT(reqWithToken(token), env, stubCtx());
    assert.equal(email, null);
  });

  test('no ACCESS_AUD configured — fails closed', async () => {
    const token = await sign();
    const env = { ACCESS_TEAM_DOMAIN: TEAM_DOMAIN, FOUNDER_EMAIL };
    const email = await verifyAccessJWT(reqWithToken(token), env, stubCtx());
    assert.equal(email, null);
  });

  test('no ACCESS_TEAM_DOMAIN configured — the JWKS fetch has nowhere to go, fails closed', async () => {
    const token = await sign();
    const env = { ACCESS_AUD: AUD, FOUNDER_EMAIL };
    const email = await verifyAccessJWT(reqWithToken(token), env, stubCtx());
    assert.equal(email, null);
  });

  test('kid in the token header matches no key in the JWKS', async () => {
    const token = await signAccessJWT(privateKey, 'some-unknown-kid', { email: FOUNDER_EMAIL, aud: AUD });
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('JWKS endpoint unreachable (network failure) fails closed, not a crash', async () => {
    restoreFetch();
    const s = stubOutboundFetch(async () => { throw new Error('network down'); });
    restoreFetch = s.restore;
    const token = await sign();
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });

  test('JWKS endpoint returns a non-200 fails closed', async () => {
    restoreFetch();
    const s = stubOutboundFetch(async () => providerRes({}, { ok: false, status: 500 }));
    restoreFetch = s.restore;
    const token = await sign();
    const email = await verifyAccessJWT(reqWithToken(token), fullEnv(), stubCtx());
    assert.equal(email, null);
  });
});
