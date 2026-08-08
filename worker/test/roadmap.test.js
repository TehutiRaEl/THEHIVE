// worker/test/roadmap.test.js
//
// Drives the REAL fetch handler for GET/POST /v11/roadmap/development.
//
// Why this suite exists (2026-08-08): the panel that shows the founder "what's the
// plan" had two real, coupled bugs, both found by running the code, not reading it.
//
// 1. roadmap-digest.yml has posted the P0-P7 project ledger every 6 hours since
//    2026-08-06 (parses correctly, confirmed via its own job logs — 8 real
//    projects, real status tags). The GET handler pulled every row from
//    roadmap_items with no WHERE clause, then only re-exposed decisions/
//    in_progress/backlog via bySection() — 'projects' rows were fetched into
//    memory and never once returned to the frontend.
// 2. Even if fixed, roadmap-digest.yml's own POST body — {section, items:[...]}
//    — would have been rejected outright: the POST handler only ever accepted a
//    single-item {section, title, ...} shape, and its whitelist covered exactly
//    three sections, none of them 'projects'. A live GitHub Actions job log
//    (run 31259485957) confirms this was moot in practice for an unrelated
//    reason — the FOUNDER_KEY repository secret was never set, so the workflow's
//    own early-exit fired before the POST was ever attempted — but the shape
//    mismatch is a real, separate bug that would surface the moment that secret
//    is added, and is fixed here independently of that founder action.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { stubDB, installCaches, stubCtx, makeEnv, req } from './helpers/env.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const call = (request, env, ctx = stubCtx()) => worker.fetch(request, env, ctx);

// seedRoadmapOnce() short-circuits on any non-zero count — every test routes this
// so the stub is never asked to implement DB.batch(), which it doesn't have.
const seeded = { 'SELECT COUNT(*) AS n': { n: 999 } };

describe('GET /roadmap/development returns every real section, including projects/campaign', () => {
  test('projects and campaign rows reach the response, not just decisions/in_progress/backlog', async () => {
    const rows = [
      { section: 'decisions', title: 'D1', status: 'decision', statusLabel: 'your call', body: 'b', sort_order: 0 },
      { section: 'in_progress', title: 'IP1', status: 'active', statusLabel: 'active', body: 'b', sort_order: 0 },
      { section: 'backlog', title: 'BL1', status: 'backlog', statusLabel: 'backlog', body: 'b', sort_order: 0 },
      { section: 'projects', title: 'P0 · Infrastructure', status: 'blocked', statusLabel: 'blocked', body: 'NEXT: provision', sort_order: 0 },
      { section: 'projects', title: 'P2 · Truth', status: 'live', statusLabel: 'live', body: 'shipped', sort_order: 1 },
      { section: 'campaign', title: 'Live Task Queue', status: 'active', statusLabel: '41 done / 60', body: 'summary', sort_order: 0 },
    ];
    const DB = stubDB({ ...seeded, 'SELECT section, title': rows });
    const env = makeEnv({ DB });

    const r = await call(req('/roadmap/development'), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.projects.length, 2, 'both real project-ledger rows must reach the response');
    assert.deepEqual(b.projects.map((p) => p.title), ['P0 · Infrastructure', 'P2 · Truth']);
    assert.equal(b.campaign.length, 1);
    assert.equal(b.campaign[0].title, 'Live Task Queue');
    assert.equal(b.snapshot.projects, 2, 'snapshot count must match the real row count');
    assert.equal(b.snapshot.campaignItems, 1);
    // the pre-existing sections must still work — this fix must not regress them
    assert.equal(b.decisionsPending.length, 1);
    assert.equal(b.inProgress.length, 1);
    assert.equal(b.backlog.length, 1);
  });

  test('empty projects/campaign sections return empty arrays, not undefined or an error', async () => {
    const DB = stubDB({ ...seeded, 'SELECT section, title': [] });
    const r = await call(req('/roadmap/development'), makeEnv({ DB }));
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.deepEqual(b.projects, []);
    assert.deepEqual(b.campaign, []);
  });
});

describe('POST /roadmap/development — whitelist now includes projects/campaign', () => {
  test('a single-item POST to section=projects is accepted, not rejected as invalid', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': undefined });
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'projects', title: 'P0 · Infra', status: 'blocked', statusLabel: 'blocked', body: 'b' },
      headers: { Authorization: 'Bearer k' },
    }), env);

    assert.equal(r.status, 200, 'projects must be a valid section now, not rejected with the old 3-section whitelist');
    assert.equal((await r.json()).created, true);
  });

  test('an unknown section is still rejected — the whitelist is extended, not removed', async () => {
    const env = makeEnv({ DB: stubDB(seeded), FOUNDER_KEY: 'k' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'not-a-real-section', title: 'x' },
      headers: { Authorization: 'Bearer k' },
    }), env);

    assert.equal(r.status, 400);
    assert.match((await r.json()).detail, /section must be one of/);
  });
});

describe('POST /roadmap/development — batch upsert (the real digest-workflow shape)', () => {
  test('a batch of new items is inserted, one INSERT per item, and reported back', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': undefined }); // nothing pre-exists
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: {
        section: 'projects',
        items: [
          { title: 'P0 · Infra', status: 'blocked', statusLabel: 'blocked', body: 'b0' },
          { title: 'P2 · Truth', status: 'live', statusLabel: 'live', body: 'b2' },
        ],
      },
      headers: { Authorization: 'Bearer k' },
    }), env);
    const b = await r.json();

    assert.equal(r.status, 200);
    assert.equal(b.ok, true);
    assert.equal(b.upserted, 2);
    const inserts = DB.queries.filter((q) => q.sql.startsWith('INSERT INTO roadmap_items'));
    assert.equal(inserts.length, 2, 'each new item must be its own real INSERT');
    assert.equal(inserts[0].args[0], 'projects');
    assert.equal(inserts[0].args[1], 'P0 · Infra');
  });

  test('a batch of already-existing items is UPDATEd, never re-INSERTed', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': { id: 7 } }); // every title "exists"
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'projects', items: [{ title: 'P0', status: 'blocked', statusLabel: 'blocked', body: 'b' }] },
      headers: { Authorization: 'Bearer k' },
    }), env);

    const inserts = DB.queries.filter((q) => q.sql.startsWith('INSERT INTO roadmap_items'));
    const updates = DB.queries.filter((q) => q.sql.startsWith('UPDATE roadmap_items'));
    assert.equal(inserts.length, 0, 'an existing row must never be duplicated via INSERT');
    assert.equal(updates.length, 1);
    assert.equal(updates[0].args[updates[0].args.length - 1], 7, 'the UPDATE must target the real existing row id');
  });

  test('items no longer present in the batch are pruned via a real DELETE ... NOT IN', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': undefined });
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'projects', items: [{ title: 'P0', status: 'blocked', statusLabel: 'blocked', body: 'b' }] },
      headers: { Authorization: 'Bearer k' },
    }), env);

    const prune = DB.queries.find((q) => q.sql.startsWith('DELETE FROM roadmap_items') && q.sql.includes('NOT IN'));
    assert.ok(prune, 'a digest replace must prune stale rows from the same section, or D1 accumulates forever');
    assert.equal(prune.args[0], 'projects');
    assert.deepEqual(prune.args.slice(1), ['P0'], 'only the titles genuinely in this batch may be kept');
  });

  test('an item with an empty title is skipped, not inserted as junk', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': undefined });
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'campaign', items: [{ title: '   ', status: 'active' }, { title: 'Real one', status: 'active' }] },
      headers: { Authorization: 'Bearer k' },
    }), env);
    const b = await r.json();

    assert.equal(b.upserted, 1, 'the blank-title item must not count as upserted');
    const inserts = DB.queries.filter((q) => q.sql.startsWith('INSERT INTO roadmap_items'));
    assert.equal(inserts.length, 1);
  });

  test('the single-item path still works unchanged — this must not regress the founder\'s own manual edits', async () => {
    const DB = stubDB({ ...seeded, 'SELECT id FROM roadmap_items': undefined });
    const env = makeEnv({ DB, FOUNDER_KEY: 'k' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'decisions', title: 'A manual decision', status: 'decision', body: 'b' },
      headers: { Authorization: 'Bearer k' },
    }), env);

    assert.equal(r.status, 200);
    assert.equal((await r.json()).created, true);
  });

  test('founderAuthOk still gates the batch path exactly like the single-item path', async () => {
    const env = makeEnv({ DB: stubDB(seeded), FOUNDER_KEY: 'real-key' });

    const r = await call(req('/roadmap/development', {
      method: 'POST',
      body: { section: 'projects', items: [{ title: 'x' }] },
      headers: { Authorization: 'Bearer wrong-key' },
    }), env);

    assert.equal(r.status, 401, 'the batch path must not bypass the same founder gate the single-item path uses');
  });
});
