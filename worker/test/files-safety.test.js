// worker/test/files-safety.test.js
//
// Founder decision S-5 (2026-11-22). Two halves:
//  1) SAFE SERVING: GET /v11/files/get must never serve a stored file as a page. It lives on the
//     same origin as the Command Center (where the founder key is kept in the browser), so an
//     uploaded HTML file running as a page could have read that key.
//  2) FOUNDER-ONLY UPLOAD: POST /v11/files/upload needs the founder key (it used to need only the
//     free visitor token, so any stranger could fill the 9 GB store).

import { test, describe, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

globalThis.caches = { default: { match: async () => undefined, put: async () => {} } };
const ctx = { waitUntil: (p) => p };
const stubDB = () => {
  const mk = () => ({ run: async () => ({ success: true }), first: async () => null, all: async () => ({ results: [] }) });
  return { prepare: () => ({ ...mk(), bind: () => mk() }), batch: async () => [] };
};

// An R2 bucket stub that records writes and serves what is stored, content type as the uploader set it.
const bucket = (initial = {}) => {
  const store = new Map(Object.entries(initial));
  const puts = [];
  return {
    puts,
    list: async () => ({ objects: [...store.keys()].map((k) => ({ key: k, size: 10 })), truncated: false }),
    get: async (k) => (store.has(k) ? { body: store.get(k).body, httpMetadata: { contentType: store.get(k).type } } : null),
    put: async (k, body, opts) => { puts.push({ key: k, type: opts?.httpMetadata?.contentType }); store.set(k, { body: 'x', type: opts?.httpMetadata?.contentType }); },
  };
};
const KEY = 'secret-founder-key';
const get = (key) => new Request(`https://thehive.sovereignhive.workers.dev/v11/files/get?key=${encodeURIComponent(key)}`, { headers: { 'CF-Connecting-IP': '7.7.7.7' } });
const up = (headers = {}, name = 'notes.txt') => new Request(`https://thehive.sovereignhive.workers.dev/v11/files/upload?key=${encodeURIComponent(name)}`, {
  method: 'POST', headers: { 'CF-Connecting-IP': '7.7.7.7', 'content-type': 'text/plain', ...headers }, body: 'hello',
});

describe('GET /v11/files/get never serves a file as a page', () => {
  test('an uploaded HTML file comes back as a download with a harmless type', async () => {
    const FILES = bucket({ 'evil.html': { body: '<script>steal(localStorage)</script>', type: 'text/html' } });
    const r = await worker.fetch(get('evil.html'), { DB: stubDB(), FILES }, ctx);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('content-type'), 'application/octet-stream', 'the uploader-chosen text/html must be ignored');
    assert.match(r.headers.get('content-disposition'), /^attachment;/);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.match(r.headers.get('content-security-policy'), /^sandbox/);
  });

  test('an SVG (which can carry script) is treated the same way', async () => {
    const FILES = bucket({ 'x.svg': { body: '<svg onload=alert(1)>', type: 'image/svg+xml' } });
    const r = await worker.fetch(get('x.svg'), { DB: stubDB(), FILES }, ctx);
    assert.equal(r.headers.get('content-type'), 'application/octet-stream');
    assert.match(r.headers.get('content-disposition'), /^attachment;/);
  });

  test('a hostile file name cannot break out of the Content-Disposition header', async () => {
    const nasty = 'a"; filename*=UTF-8\'\'x.html; "b.html';
    const FILES = bucket({ [nasty]: { body: 'x', type: 'text/html' } });
    const r = await worker.fetch(get(nasty), { DB: stubDB(), FILES }, ctx);
    const cd = r.headers.get('content-disposition');
    assert.equal((cd.match(/"/g) || []).length, 2, `quotes in the name must be neutralised: ${cd}`);
    assert.equal(cd.includes('filename*'), false);
  });

  test('a missing file is still a clean 404', async () => {
    const r = await worker.fetch(get('nope.txt'), { DB: stubDB(), FILES: bucket() }, ctx);
    assert.equal(r.status, 404);
  });
});

describe('POST /v11/files/upload is founder-only', () => {
  test('no key: 401 and nothing is stored', async () => {
    const FILES = bucket();
    const r = await worker.fetch(up(), { DB: stubDB(), FILES, FOUNDER_KEY: KEY }, ctx);
    assert.equal(r.status, 401);
    assert.equal(FILES.puts.length, 0);
  });

  test('a free visitor token is not enough', async () => {
    const FILES = bucket();
    const r = await worker.fetch(up({ Authorization: 'Bearer a-free-visitor-token' }), { DB: stubDB(), FILES, FOUNDER_KEY: KEY }, ctx);
    assert.equal(r.status, 401);
    assert.equal(FILES.puts.length, 0);
  });

  test('fails CLOSED when no FOUNDER_KEY is bound', async () => {
    const FILES = bucket();
    const r = await worker.fetch(up({ Authorization: 'Bearer anything' }), { DB: stubDB(), FILES }, ctx);
    assert.equal(r.status, 401);
    assert.match((await r.json()).detail, /no FOUNDER_KEY bound/);
    assert.equal(FILES.puts.length, 0);
  });

  test('the founder key stores the file', async () => {
    const FILES = bucket();
    const r = await worker.fetch(up({ Authorization: `Bearer ${KEY}`, 'content-length': '5' }), { DB: stubDB(), FILES, FOUNDER_KEY: KEY }, ctx);
    assert.equal(r.status, 200);
    assert.equal(FILES.puts.length, 1);
    assert.equal(FILES.puts[0].key, 'notes.txt');
  });
});
