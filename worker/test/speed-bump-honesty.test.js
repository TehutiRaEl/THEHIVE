// worker/test/speed-bump-honesty.test.js
//
// Founder decision S-3 (2026-11-22): the visitor-token check was called tokenOk, which sounds like a
// lock. It is an anti-spam speed bump: GET /v11/auth/token gives a token to ANYONE, and the check
// lets everything through when WORKER_ADMIN_KEY is unset or the database errors. These tests keep
// the name, the warning and the facts from drifting apart again.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';

const SRC = fs.readFileSync(new URL('../src/index.js', import.meta.url), 'utf8');
const DOC = fs.readFileSync(new URL('../../docs/SECURITY_DEEP_PASS.md', import.meta.url), 'utf8');
globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };

describe('the visitor speed bump is named and documented for what it is', () => {
  test('nothing calls the old, lock-sounding name any more', () => {
    assert.equal(/\btokenOk\s*\(/.test(SRC), false, 'a call to tokenOk( is back');
    assert.ok((SRC.match(/visitorSpeedBumpOk\(/g) || []).length >= 10);
  });

  test('the function says, next to its definition, that it is not a lock', () => {
    const i = SRC.indexOf('async function visitorSpeedBumpOk');
    const header = SRC.slice(Math.max(0, i - 900), i);
    assert.match(header, /NOT a lock/);
    assert.match(header, /ANYONE/);
    assert.match(header, /founderAuthOk/);
  });

  test('the security doc says the same', () => {
    assert.match(DOC, /Anti-spam only, NOT a lock/);
  });

  test('the fact it rests on holds: /auth/token gives a token to a caller with no credentials', async () => {
    const DB = { prepare: () => ({ bind: () => ({ run: async () => ({ success: true }) }) }) };
    const r = await worker.fetch(
      new Request('https://thehive.sovereignhive.workers.dev/v11/auth/token', { headers: { 'CF-Connecting-IP': '8.8.8.8' } }),
      { DB }, { waitUntil: (p) => p });
    assert.equal(r.status, 200);
    const body = await r.json();
    assert.ok(body.access_token && body.tier === 'visitor');
  });
});
