// worker/test/absorption.test.js
//
// Drives the absorption mechanism (2026-11-13, issue #243) against the real
// functions and the real fetch handler — not a reimplementation.
//
// The mechanism, in the order it was built:
//   1. The two live routes — GET /v11/founder/decisions (serves
//      docs/FOUNDER_ANSWERED via ASSETS) and GET /v11/ventures (serves the
//      venture manifest + plans inventory from docs/ventures/manifest.json).
//   2. The Queen Digest — queen_digest in nanuet-brain, written by
//      writeQueenDigest(), read by readQueenDigest().
//   3. FOUNDER_ANSWERED as structured data — founder_decisions in
//      nanuet-brain, parsed by parseFounderDecisions() and written by
//      syncFounderDecisions().
//
// Four things here are security- or correctness-relevant rather than merely
// functional, and each is asserted in BOTH directions on purpose:
//
//   1. A write to Nanuet's brain must be blocked — with the reason stated,
//      never a throw — when the brain is not bound OR when
//      NANUET_BRAIN_WRITE is off. Nothing here bypasses a switch.
//   2. "Database missing" and "switch off" must stay DISTINCT reasons.
//   3. A missing D1 table (the migration not yet applied) must degrade
//      honestly — a clear note, never a 500 and never an empty list that
//      reads as "she has learned nothing" when the truth is "the table was
//      never created".
//   4. The parser must quote what FOUNDER_ANSWERED says, never invent a
//      summary — the answer is the '**Founder decision:**' line when the
//      entry has one, else the entry's own first 500 chars.

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';
import { installCaches, stubCtx, makeEnv, req, stubSecretsStoreSecret } from './helpers/env.js';
import {
  fetchAssetsText,
  parseFounderDecisions,
  parseVentureManifest,
  writeQueenDigest,
  readQueenDigest,
  syncFounderDecisions,
} from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const call = (request, env, ctx = stubCtx()) => worker.fetch(request, env, ctx);

// ── Fixtures ──────────────────────────────────────────────────────────────

// A small FOUNDER_ANSWERED in the real file's shape: one '## ' header per
// decision, a '**Founder decision:**' line in two entries, none in the third
// (so the answer falls back to the entry's own first 500 chars), a '# '
// title and preamble text before the first header (skipped), and '---'
// separators (harmless body lines).
const FOUNDER_FIXTURE = `# FOUNDER_ANSWERED.md — Decided Founder Questions

Entries move here from FOUNDER_QUEUE.md when decided. Chronological. Permanent.

## Q-001 — DECIDED 2026-11-04

**Question (as queued):** Oracle box — provision or retire System A?
**Founder decision:** PROVISION — repurposed. NOT retire.
**What this means:** Cloudflare Worker remains the public system of record.

---

## XR-Q8 — DECIDED 2026-11-12

**Question (as queued):** Biosystem — Worker data or System A?
**Founder decision:** Worker data is ENOUGH; System A is NOT needed.
**What this means:** Keep the way the biosystem tab looked, just make it work live.

---

## Truth hierarchy — RATIFIED 2026-11-11

Production beats code beats plan beats narrative. When levels disagree, the higher wins and the lower gets corrected.
`;

const QUEUE_FIXTURE = `# FOUNDER_QUEUE.md — Open Founder Questions

## FQ-Q-011 — Commune gating
## FQ-Q-012 — Switch-9 truthiness fix
`;

// A NANUET_BRAIN stub that records every bound statement so a test can assert
// what would really have been written, rather than trusting a return value.
// `rows` is what first()/all() return; `fail` makes every statement throw,
// which is how a missing table (migration not yet applied) is simulated.
function stubBrain({ rows = [], fail = false } = {}) {
  const writes = [];
  const prepare = (sql) => {
    if (fail) throw new Error('no such table: founder_decisions');
    return {
      bind: (...args) => ({
        run: async () => { writes.push({ sql, args }); return { success: true, meta: { last_row_id: writes.length } }; },
        first: async () => rows[0] ?? null,
        all: async () => ({ results: rows }),
      }),
      run: async () => { writes.push({ sql, args: [] }); return { success: true, meta: { last_row_id: writes.length } }; },
      first: async () => rows[0] ?? null,
      all: async () => ({ results: rows }),
    };
  };
  return { writes, prepare };
}

// An ASSETS binding stub: maps a site-root pathname to the text it serves.
// A pathname with no entry is a 404, the same shape a real missing file has.
function stubAssets(files = {}) {
  return {
    fetch: async (request) => {
      const pathname = new URL(request.url).pathname;
      if (Object.prototype.hasOwnProperty.call(files, pathname)) {
        return new Response(files[pathname], { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }
      return new Response('not found', { status: 404 });
    },
  };
}

// Bound + stage-1 on. The default state in production is neither of these.
const BRAIN_ON = (extra = {}) => ({ NANUET_BRAIN: stubBrain(), NANUET_BRAIN_WRITE: 'on', ...extra });

const founderKeyEnv = (extra = {}) => ({
  FOUNDER_KEY: stubSecretsStoreSecret('founder-key-123'), ...extra,
});
const founderHeaders = { Authorization: 'Bearer founder-key-123' };

// ─────────────────────────────────────────────────────────────────────────
describe('parseFounderDecisions — the parser', () => {
  test('parses ids, dates, and the Founder decision line from a fixture', () => {
    const out = parseFounderDecisions(FOUNDER_FIXTURE);
    assert.equal(out.length, 3);
    assert.deepEqual(out.map((d) => d.id), ['Q-001', 'XR-Q8', 'Truth hierarchy']);
    assert.deepEqual(out.map((d) => d.decided_at), ['2026-11-04', '2026-11-12', '2026-11-11']);
    assert.equal(out[0].answer, 'PROVISION — repurposed. NOT retire.');
    assert.equal(out[1].answer, 'Worker data is ENOUGH; System A is NOT needed.');
    // No '**Founder decision:**' line in the third entry — the answer is the
    // entry's own text, not an invention.
    assert.match(out[2].answer, /^Production beats code beats plan beats narrative/);
    assert.equal(out[0].title, 'Q-001 — DECIDED 2026-11-04');
  });

  test('skips the preamble and a header with no em dash keeps the whole header as its id', () => {
    const out = parseFounderDecisions('# Title only\n\nSome intro.\n\n## Just a name\n\nBody here.\n');
    assert.equal(out.length, 1);
    assert.equal(out[0].id, 'Just a name');
    assert.equal(out[0].decided_at, null);
    assert.equal(out[0].answer, 'Body here.');
  });

  test('an empty file parses to zero decisions, never a throw', () => {
    assert.deepEqual(parseFounderDecisions(''), []);
    assert.deepEqual(parseFounderDecisions(null), []);
  });

  test('parses the real local docs/FOUNDER_ANSWERED and finds Q-001 among its entries', () => {
    const text = readFileSync(new URL('../../docs/FOUNDER_ANSWERED', import.meta.url), 'utf8');
    const out = parseFounderDecisions(text);
    // The local copy is stale (20 entries) against main (62 after PR #242);
    // the bound is a minimum so this passes on either.
    assert.ok(out.length >= 20, `expected >= 20 entries, got ${out.length}`);
    assert.ok(out.some((d) => d.id === 'Q-001'));
    assert.ok(out.every((d) => d.id && d.title));
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('parseVentureManifest — the mirror validator', () => {
  test('the real docs/ventures/manifest.json validates: 7 ventures, 23 plans', () => {
    const text = readFileSync(new URL('../../docs/ventures/manifest.json', import.meta.url), 'utf8');
    const { ok, manifest } = parseVentureManifest(text);
    assert.equal(ok, true);
    assert.equal(manifest.ventures.length, 7);
    assert.equal(manifest.plans.length, 23);
    assert.equal(manifest.source.repo, 'TehutiRaEl/venture');
    assert.ok(manifest.ventures.every((v) => v.id && Array.isArray(v.repos) && v.status));
    assert.ok(manifest.plans.every((p) => p.slug && typeof p.words === 'number' && p.path));
  });

  test('invalid JSON, a missing ventures array, and a venture with no id all fail closed', () => {
    assert.equal(parseVentureManifest('not json').ok, false);
    assert.equal(parseVentureManifest(JSON.stringify({ plans: [] })).ok, false);
    assert.equal(parseVentureManifest(JSON.stringify({
      ventures: [{ repos: [], status: 'x' }], plans: [],
    })).ok, false);
    assert.equal(parseVentureManifest(JSON.stringify({
      ventures: [{ id: 'a', repos: [], status: 'x' }], plans: [],
    })).ok, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('writeQueenDigest / readQueenDigest — the Digest', () => {
  test('an unbound brain blocks the write with the provisioning reason and the read reports it', async () => {
    const w = await writeQueenDigest({}, { kind: 'note', summary: 'x' });
    assert.equal(w.stored, false);
    assert.match(w.reason, /not provisioned/);
    const r = await readQueenDigest({});
    assert.deepEqual(r.entries, []);
    assert.equal(r.provisioned, false);
  });

  test('a bound brain with the switch off blocks the write with the switch reason and writes nothing', async () => {
    const brain = stubBrain();
    const w = await writeQueenDigest({ NANUET_BRAIN: brain }, { kind: 'note', summary: 'x' });
    assert.equal(w.stored, false);
    assert.match(w.reason, /NANUET_BRAIN_WRITE is off/);
    assert.equal(brain.writes.length, 0);
  });

  test('with the brain on, a write stores and records the kind and summary; a missing kind or summary is refused', async () => {
    const brain = stubBrain();
    const env = { NANUET_BRAIN: brain, NANUET_BRAIN_WRITE: 'on' };
    const w = await writeQueenDigest(env, {
      kind: 'work_completed', subject_kind: 'route', subject_id: '/v11/ventures',
      summary: 'Built GET /v11/ventures.', wisdom: 'A route that serves the manifest is a route the Queen can actually use.',
    });
    assert.equal(w.stored, true);
    assert.equal(w.id, 1);
    assert.equal(brain.writes.length, 1);
    assert.match(brain.writes[0].sql, /INSERT INTO queen_digest/);
    assert.equal(brain.writes[0].args[2], 'work_completed');
    assert.equal(brain.writes[0].args[5], 'Built GET /v11/ventures.');
    assert.equal((await writeQueenDigest(env, { summary: 'x' })).stored, false);
    assert.equal((await writeQueenDigest(env, { kind: 'note' })).stored, false);
    assert.equal(brain.writes.length, 1);
  });

  test('a missing table is reported as table_missing, never as an empty list', async () => {
    const env = { NANUET_BRAIN: stubBrain({ fail: true }), NANUET_BRAIN_WRITE: 'on' };
    const r = await readQueenDigest(env);
    assert.deepEqual(r.entries, []);
    assert.equal(r.table_missing, true);
    assert.match(r.note, /nanuet-brain-absorption\.sql/);
    const w = await writeQueenDigest(env, { kind: 'note', summary: 'x' });
    assert.equal(w.stored, false);
    assert.match(w.error, /no such table/);
  });

  test('read returns the rows it is given, newest first as stored', async () => {
    const rows = [
      { id: 2, ts: '2026-11-13T22:00:00.000Z', kind: 'work_completed', summary: 'second' },
      { id: 1, ts: '2026-11-13T21:00:00.000Z', kind: 'decision_absorbed', summary: 'first' },
    ];
    const r = await readQueenDigest({ NANUET_BRAIN: stubBrain({ rows }) });
    assert.equal(r.provisioned, true);
    assert.deepEqual(r.entries.map((e) => e.id), [2, 1]);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('syncFounderDecisions — absorbing the file into the brain', () => {
  test('dry run parses and reports without writing anything', async () => {
    const brain = stubBrain();
    const env = { ...BRAIN_ON(), NANUET_BRAIN: brain, ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) };
    const r = await syncFounderDecisions(env, 'https://thehive.sovereignhive.workers.dev/v11/founder/decisions/sync', { dryRun: true });
    assert.equal(r.synced, false);
    assert.equal(r.dry_run, true);
    assert.equal(r.would_sync, 3);
    assert.deepEqual(r.ids, ['Q-001', 'XR-Q8', 'Truth hierarchy']);
    assert.equal(brain.writes.length, 0);
  });

  test('a missing ASSETS binding fails closed with the reason stated', async () => {
    const r = await syncFounderDecisions({}, 'https://thehive.sovereignhive.workers.dev/v11/x');
    assert.equal(r.synced, false);
    assert.match(r.reason, /ASSETS/);
  });

  test('with the brain on, a real sync writes one row per decision plus a Digest receipt', async () => {
    const brain = stubBrain();
    const env = { ...BRAIN_ON(), NANUET_BRAIN: brain, ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) };
    const r = await syncFounderDecisions(env, 'https://thehive.sovereignhive.workers.dev/v11/founder/decisions/sync');
    assert.equal(r.synced, true);
    assert.equal(r.written, 3);
    assert.equal(r.parsed, 3);
    assert.equal(r.digest.stored, true);
    const decisionWrites = brain.writes.filter((w) => /INSERT OR REPLACE INTO founder_decisions/.test(w.sql));
    const digestWrites = brain.writes.filter((w) => /INSERT INTO queen_digest/.test(w.sql));
    assert.equal(decisionWrites.length, 3);
    assert.equal(digestWrites.length, 1);
    assert.equal(decisionWrites[0].args[0], 'Q-001');
    assert.equal(digestWrites[0].args[2], 'decision_absorbed');
  });

  test('with the switch off, the sync writes nothing and says why', async () => {
    const brain = stubBrain();
    const env = { NANUET_BRAIN: brain, ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) };
    const r = await syncFounderDecisions(env, 'https://thehive.sovereignhive.workers.dev/v11/founder/decisions/sync');
    assert.equal(r.synced, false);
    assert.match(r.reason, /NANUET_BRAIN_WRITE is off/);
    assert.equal(brain.writes.length, 0);
  });

  test('a missing founder_decisions table fails the sync, not silently zero rows', async () => {
    const env = { NANUET_BRAIN: stubBrain({ fail: true }), NANUET_BRAIN_WRITE: 'on', ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) };
    const r = await syncFounderDecisions(env, 'https://thehive.sovereignhive.workers.dev/v11/founder/decisions/sync');
    assert.equal(r.synced, false);
    assert.match(r.reason, /no such table/);
  });
});

// ─────────────────────────────────────────────────────────────────────────
describe('routes — GET /v11/founder/decisions', () => {
  const assets = () => stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE, '/FOUNDER_QUEUE': QUEUE_FIXTURE });

  test('serves the file live with its hash, entry count, and ids', async () => {
    const r = await call(req('/founder/decisions'), makeEnv({ ASSETS: assets() }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, true);
    assert.equal(b.source, 'docs/FOUNDER_ANSWERED');
    assert.equal(b.entries, 3);
    assert.deepEqual(b.ids, ['Q-001', 'XR-Q8', 'Truth hierarchy']);
    assert.equal(b.content, FOUNDER_FIXTURE);
    assert.match(b.hash, /^[0-9a-f]{64}$/);
  });

  test('without ASSETS it reports unavailable, never a throw', async () => {
    const r = await call(req('/founder/decisions'), makeEnv());
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, false);
    assert.match(b.reason, /ASSETS/);
  });
});

describe('routes — GET /v11/founder/queue', () => {
  test('serves the queue file live', async () => {
    const r = await call(req('/founder/queue'), makeEnv({ ASSETS: stubAssets({ '/FOUNDER_QUEUE': QUEUE_FIXTURE }) }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, true);
    assert.equal(b.source, 'docs/FOUNDER_QUEUE');
    assert.equal(b.content, QUEUE_FIXTURE);
  });
});

describe('routes — GET /v11/founder/decisions/:id', () => {
  test('returns one structured decision by id', async () => {
    const row = { id: 'Q-001', title: 'Q-001 — DECIDED 2026-11-04', decided_at: '2026-11-04', answer: 'PROVISION — repurposed. NOT retire.', body: '...', source: 'docs/FOUNDER_ANSWERED', synced_at: '2026-11-13T00:00:00.000Z' };
    const r = await call(req('/founder/decisions/Q-001'), makeEnv({ NANUET_BRAIN: stubBrain({ rows: [row] }) }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, true);
    assert.equal(b.decision.id, 'Q-001');
    assert.equal(b.decision.answer, 'PROVISION — repurposed. NOT retire.');
  });

  test('an unknown id is a 404 that names the sync step', async () => {
    const r = await call(req('/founder/decisions/Q-999'), makeEnv({ NANUET_BRAIN: stubBrain() }));
    assert.equal(r.status, 404);
    const b = await r.json();
    assert.match(b.detail, /Q-999 not found/);
    assert.match(b.detail, /decisions\/sync/);
  });

  test('an unbound brain reports unavailable, never a throw', async () => {
    const r = await call(req('/founder/decisions/Q-001'), makeEnv());
    assert.equal(r.status, 200);
    assert.equal((await r.json()).available, false);
  });
});

describe('routes — POST /v11/founder/decisions/sync', () => {
  test('without a founder key it is a 401, closed', async () => {
    const r = await call(req('/founder/decisions/sync', { method: 'POST', body: {} }), makeEnv({ ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) }));
    assert.equal(r.status, 401);
  });

  test('with a founder key, dry run parses and reports without writing', async () => {
    const brain = stubBrain();
    const env = { ...makeEnv({ ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) }), ...founderKeyEnv(), NANUET_BRAIN: brain, NANUET_BRAIN_WRITE: 'on' };
    const r = await call(req('/founder/decisions/sync', { method: 'POST', body: { dry_run: true }, headers: founderHeaders }), env);
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.dry_run, true);
    assert.equal(b.would_sync, 3);
    assert.equal(brain.writes.length, 0);
  });

  test('with a founder key and the brain on, a real sync writes the rows', async () => {
    const brain = stubBrain();
    const env = { ...makeEnv({ ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) }), ...founderKeyEnv(), NANUET_BRAIN: brain, NANUET_BRAIN_WRITE: 'on' };
    const r = await call(req('/founder/decisions/sync', { method: 'POST', body: {}, headers: founderHeaders }), env);
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.synced, true);
    assert.equal(b.written, 3);
    assert.equal(brain.writes.filter((w) => /founder_decisions/.test(w.sql)).length, 3);
  });
});

describe('routes — GET /v11/ventures', () => {
  test('serves the manifest and the plans inventory live', async () => {
    const mirror = readFileSync(new URL('../../docs/ventures/manifest.json', import.meta.url), 'utf8');
    const r = await call(req('/ventures'), makeEnv({ ASSETS: stubAssets({ '/ventures/manifest.json': mirror }) }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, true);
    assert.equal(b.source.repo, 'TehutiRaEl/venture');
    assert.equal(b.ventures.length, 7);
    assert.equal(b.plans.length, 23);
    assert.equal(b.ventures[0].id, 'svfg');
    assert.ok(b.ventures.every((v) => v.id && Array.isArray(v.repos) && v.status));
    assert.match(b.hash, /^[0-9a-f]{64}$/);
  });

  test('a mirror that fails validation is reported, not served half-parsed', async () => {
    const r = await call(req('/ventures'), makeEnv({ ASSETS: stubAssets({ '/ventures/manifest.json': '{"ventures": "nope"}' }) }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.available, false);
    assert.match(b.reason, /ventures array/);
  });

  test('without ASSETS it reports unavailable, never a throw', async () => {
    const r = await call(req('/ventures'), makeEnv());
    assert.equal(r.status, 200);
    assert.equal((await r.json()).available, false);
  });
});

describe('routes — GET /v11/nanuet/digest', () => {
  test('an unbound brain reports provisioned:false with an empty list', async () => {
    const r = await call(req('/nanuet/digest'), makeEnv());
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.deepEqual(b.entries, []);
    assert.equal(b.provisioned, false);
    assert.equal(b.write_enabled, false);
  });

  test('a bound brain returns its entries with pagination fields', async () => {
    const rows = [{ id: 1, ts: '2026-11-13T22:00:00.000Z', kind: 'work_completed', summary: 'did a thing' }];
    const r = await call(req('/nanuet/digest?limit=10'), makeEnv({ NANUET_BRAIN: stubBrain({ rows }), NANUET_BRAIN_WRITE: 'on' }));
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.entries.length, 1);
    assert.equal(b.entries[0].summary, 'did a thing');
    assert.equal(b.write_enabled, true);
    assert.equal(b.limit, 10);
  });
});

describe('routes — POST /v11/nanuet/digest', () => {
  test('with the brain on (dev mode, no admin key) a digest entry stores', async () => {
    const brain = stubBrain();
    const env = { ...makeEnv(), NANUET_BRAIN: brain, NANUET_BRAIN_WRITE: 'on' };
    const r = await call(req('/nanuet/digest', { method: 'POST', body: { kind: 'route_verified', subject_kind: 'route', subject_id: '/v11/ventures', summary: 'Verified GET /v11/ventures live.', wisdom: 'A route that serves the manifest is a route the Queen can actually use.' } }), env);
    assert.equal(r.status, 200);
    const b = await r.json();
    assert.equal(b.ok, true);
    assert.equal(brain.writes.length, 1);
    assert.match(brain.writes[0].sql, /INSERT INTO queen_digest/);
  });

  test('with the switch off the write is a 409 and nothing is written', async () => {
    const brain = stubBrain();
    const env = { ...makeEnv(), NANUET_BRAIN: brain };
    const r = await call(req('/nanuet/digest', { method: 'POST', body: { kind: 'note', summary: 'x' } }), env);
    assert.equal(r.status, 409);
    assert.equal((await r.json()).stored, false);
    assert.equal(brain.writes.length, 0);
  });

  test('a missing summary is a 400, not a stored empty row', async () => {
    const brain = stubBrain();
    const env = { ...makeEnv(), NANUET_BRAIN: brain, NANUET_BRAIN_WRITE: 'on' };
    const r = await call(req('/nanuet/digest', { method: 'POST', body: { kind: 'note' } }), env);
    assert.equal(r.status, 400);
    assert.equal(brain.writes.length, 0);
  });
});

describe('fetchAssetsText — the shared ASSETS reader', () => {
  test('returns ok:true with the text for a served file, ok:false for a 404', async () => {
    const env = { ASSETS: stubAssets({ '/FOUNDER_ANSWERED': FOUNDER_FIXTURE }) };
    const hit = await fetchAssetsText(env, 'https://thehive.sovereignhive.workers.dev/v11/x', 'FOUNDER_ANSWERED');
    assert.equal(hit.ok, true);
    assert.equal(hit.text, FOUNDER_FIXTURE);
    const miss = await fetchAssetsText(env, 'https://thehive.sovereignhive.workers.dev/v11/x', 'NOPE.md');
    assert.equal(miss.ok, false);
    assert.match(miss.reason, /404/);
    assert.equal((await fetchAssetsText({}, 'https://example.com/', 'FOUNDER_ANSWERED')).ok, false);
  });
});
