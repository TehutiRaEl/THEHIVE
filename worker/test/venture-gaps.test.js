// worker/test/venture-gaps.test.js
//
// Drives the REAL fetch handler for the new venture capability-gap and
// sandbox-run routes (2026-08-18) — same discipline as routes.test.js: the
// gates are the point. Two boundaries matter here, each asserted in both
// directions so a future edit cannot quietly flip one:
//   tokenOk       — fails OPEN with no WORKER_ADMIN_KEY (creating a gap/run
//                   is Tier 1, anti-spam only)
//   founderAuthOk — fails CLOSED with no FOUNDER_KEY (deciding a gap or a
//                   sandbox run is the founder's real approval)
// Also covers the idempotency guards that make venture-gap-mirror.yml and
// kai-sandbox-run.yml safe to re-run: a gap already carrying a
// github_issue_url must never be re-mirrored, and a run already carrying a
// branch/pr_url must never be re-opened.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { stubDB, installCaches, stubCtx, makeEnv, req } from './helpers/env.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const call = (request, env, ctx = stubCtx()) => worker.fetch(request, env, ctx);

describe('POST /ventures/gaps', () => {
  test('with WORKER_ADMIN_KEY set, a request with no token is rejected', async () => {
    const env = makeEnv({ WORKER_ADMIN_KEY: 'admin-key' });
    const r = await call(req('/ventures/gaps', {
      method: 'POST',
      body: { venture: 'svfg', title: 'need X', capability_needed: 'X', needed_for: 'Y' },
    }), env);
    assert.equal(r.status, 401);
  });

  test('with no WORKER_ADMIN_KEY bound, dev mode lets the request through', async () => {
    const DB = stubDB();
    const env = makeEnv({ DB });
    const r = await call(req('/ventures/gaps', {
      method: 'POST',
      body: { venture: 'svfg', title: 'need X', capability_needed: 'X', needed_for: 'Y' },
    }), env);
    assert.equal(r.status, 200);
    const insertCall = DB.queries.find((q) => q.sql.includes('INSERT INTO venture_capability_gaps'));
    assert.ok(insertCall, 'must actually write the gap row');
  });

  test('missing required fields is rejected before any write', async () => {
    const DB = stubDB();
    const env = makeEnv({ DB });
    const r = await call(req('/ventures/gaps', {
      method: 'POST',
      body: { venture: 'svfg', title: 'need X' }, // no capability_needed/needed_for
    }), env);
    assert.equal(r.status, 400);
    assert.equal(DB.queries.find((q) => q.sql.includes('INSERT INTO venture_capability_gaps')), undefined);
  });
});

describe('POST /ventures/gaps/:id/decide', () => {
  test('fails closed with no FOUNDER_KEY bound at all', async () => {
    const r = await call(req('/ventures/gaps/1/decide', {
      method: 'POST', body: { decision: 'granted' }, headers: { Authorization: 'Bearer whatever' },
    }), makeEnv());
    assert.equal(r.status, 401);
  });

  test('fails closed with a wrong key even when one is bound', async () => {
    const r = await call(req('/ventures/gaps/1/decide', {
      method: 'POST', body: { decision: 'granted' }, headers: { Authorization: 'Bearer wrong' },
    }), makeEnv({ FOUNDER_KEY: 'real-key' }));
    assert.equal(r.status, 401);
  });

  test('a valid decision with the real key updates the row', async () => {
    const DB = stubDB({ 'SELECT id FROM venture_capability_gaps': { id: 1 } });
    const env = makeEnv({ FOUNDER_KEY: 'real-key', DB });
    const r = await call(req('/ventures/gaps/1/decide', {
      method: 'POST', body: { decision: 'granted', note: 'go ahead' },
      headers: { Authorization: 'Bearer real-key' },
    }), env);
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.status, 'granted');
    const updateCall = DB.queries.find((q) => q.sql.includes('UPDATE venture_capability_gaps SET status=?'));
    assert.ok(updateCall);
  });

  test('an invalid decision value is rejected', async () => {
    const r = await call(req('/ventures/gaps/1/decide', {
      method: 'POST', body: { decision: 'maybe' }, headers: { Authorization: 'Bearer real-key' },
    }), makeEnv({ FOUNDER_KEY: 'real-key' }));
    assert.equal(r.status, 400);
  });
});

describe('POST /ventures/gaps/:id/issue-linked — idempotent mirror', () => {
  test('a gap with no github_issue_url yet gets linked', async () => {
    const DB = stubDB({ 'SELECT id, github_issue_url FROM venture_capability_gaps': { id: 1, github_issue_url: null } });
    const r = await call(req('/ventures/gaps/1/issue-linked', {
      method: 'POST', body: { issue_url: 'https://github.com/TehutiRaEl/venture/issues/1' },
    }), makeEnv({ DB }));
    assert.equal(r.status, 200);
    const updateCall = DB.queries.find((q) => q.sql.includes('UPDATE venture_capability_gaps SET github_issue_url=?'));
    assert.ok(updateCall);
  });

  test('a gap already linked is never re-mirrored — 409, no second write', async () => {
    const DB = stubDB({
      'SELECT id, github_issue_url FROM venture_capability_gaps': { id: 1, github_issue_url: 'https://github.com/TehutiRaEl/venture/issues/1' },
    });
    const r = await call(req('/ventures/gaps/1/issue-linked', {
      method: 'POST', body: { issue_url: 'https://github.com/TehutiRaEl/venture/issues/2' },
    }), makeEnv({ DB }));
    assert.equal(r.status, 409);
    assert.equal(DB.queries.find((q) => q.sql.includes('UPDATE venture_capability_gaps SET github_issue_url=?')), undefined);
  });

  test('an unknown gap id is a 404, not a silent success', async () => {
    const DB = stubDB({ 'SELECT id, github_issue_url FROM venture_capability_gaps': undefined });
    const r = await call(req('/ventures/gaps/999/issue-linked', {
      method: 'POST', body: { issue_url: 'https://example.com/1' },
    }), makeEnv({ DB }));
    assert.equal(r.status, 404);
  });
});

describe('POST /ventures/sandbox-runs — token-gated create', () => {
  test('records a real row and returns its id', async () => {
    const DB = stubDB();
    const env = makeEnv({ DB });
    const r = await call(req('/ventures/sandbox-runs', {
      method: 'POST', body: { venture: 'svfg', task: 'wire ColonyCard to real data' },
    }), env);
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.ok, true);
    const insertCall = DB.queries.find((q) => q.sql.includes('INSERT INTO venture_sandbox_runs'));
    assert.ok(insertCall);
  });
});

describe('POST /ventures/sandbox-runs/:id/opened — the branch-not-main proposal step', () => {
  test('sets branch, pr_url, and status pr_open', async () => {
    const DB = stubDB({ 'SELECT id FROM venture_sandbox_runs': { id: 1 } });
    const r = await call(req('/ventures/sandbox-runs/1/opened', {
      method: 'POST', body: { branch: 'kai/svfg-colony-card', pr_url: 'https://github.com/TehutiRaEl/SVFG/pull/1' },
    }), makeEnv({ DB }));
    assert.equal(r.status, 200);
    const updateCall = DB.queries.find((q) => q.sql.includes("status='pr_open'"));
    assert.ok(updateCall, 'must move the run to pr_open, never to merged/main directly');
  });
});

describe('POST /ventures/sandbox-runs/:id/decide', () => {
  test('fails closed with no FOUNDER_KEY bound', async () => {
    const r = await call(req('/ventures/sandbox-runs/1/decide', {
      method: 'POST', body: { decision: 'merged' },
    }), makeEnv());
    assert.equal(r.status, 401);
  });

  test('a real merge decision with the right key updates status', async () => {
    const DB = stubDB({ 'SELECT id FROM venture_sandbox_runs': { id: 1 } });
    const r = await call(req('/ventures/sandbox-runs/1/decide', {
      method: 'POST', body: { decision: 'merged', note: 'looks good' },
      headers: { Authorization: 'Bearer real-key' },
    }), makeEnv({ FOUNDER_KEY: 'real-key', DB }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.status, 'merged');
  });
});
