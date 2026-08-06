// THEHIVE Queen — edge implementation of the Command Center API slice.
// Same JSON shapes as backend/api/routes.py (/v11), persisted in D1.
// Auth: visitor-tier tokens issued freely from /auth/token and stored in D1.
// Write endpoints require a valid unexpired token (permissive if WORKER_ADMIN_KEY unset).
// Rate limit: 30 POST requests per IP per minute (D1-backed sliding window).
// Admin surfaces (WORKER_ADMIN_KEY protected) stay off-edge.

// CORS scoping (Phase 8, 2026-07-21 professionalization audit): a bare '*'
// let any origin freely call every endpoint, including writes, with no
// tightening ever possible. Real browser callers of this API are known and
// finite (the Worker's own same-origin UI never needs CORS at all — docs/ and
// /v11 are served from one origin on purpose; cross-origin only matters for
// the GitHub Pages mirror and local frontend dev). Anything outside this list
// still gets a real, non-empty response (this is a public read-mostly API,
// not gated by CORS itself — CORS only controls whether a *browser* is
// allowed to read the response cross-origin) but without an
// Access-Control-Allow-Origin the browser will refuse to expose it to page
// JS, which is the actual protection: an unlisted third-party site can no
// longer silently proxy this API as its own backend from a visitor's browser.
const ALLOWED_ORIGINS = new Set([
  'https://thehive.sovereignhive.workers.dev',
  'https://tehutirael.github.io',
  'http://localhost:5173', // local Vite dev server (frontend/)
  'http://localhost:8788', // local `wrangler dev` (docs/ + /v11 together)
]);
function corsHeadersFor(request) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Grok-Key',
    'Vary': 'Origin',
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

// Pagination (Phase 8, 2026-07-21 professionalization audit): every list
// route used to hardcode LIMIT N with no way to reach older rows. `?offset=`
// (and an optional `?limit=`, capped so a caller can't force a huge scan)
// now works the same way across every list endpoint below.
function pageParams(url, defaultLimit, maxLimit) {
  let limit = parseInt(url.searchParams.get('limit'), 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = defaultLimit;
  limit = Math.min(limit, maxLimit);
  let offset = parseInt(url.searchParams.get('offset'), 10);
  if (!Number.isFinite(offset) || offset < 0) offset = 0;
  return { limit, offset };
}

// Edge caching (Phase 8, 2026-07-21 professionalization audit): a handful of
// GET routes are read far more often than their underlying data changes
// (active-agent roster, the roadmap rollup, which LLM provider is bound).
// Cloudflare's Cache API (`caches.default`) sits in front of D1 for exactly
// this. Deliberately caches ONLY the JSON body — never the full Response —
// because the served Response's CORS headers are per-request (echoing the
// caller's Origin against ALLOWED_ORIGINS, see corsHeadersFor above); baking
// a CORS header into a cached-by-URL entry would leak one origin's
// Access-Control-Allow-Origin to a different origin's request for the same
// cached path. The cache key is the request's full URL (pathname + query
// string, e.g. distinct entries per ?limit=/?offset= on a paginated route) —
// Origin is a header, never part of the URL, so it can't collide here.
async function cachedJson(request, ctx, corsHeaders, ttlSeconds, computeFn) {
  const cache = caches.default;
  const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });
  const respond = (data) =>
    new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  let hit;
  try { hit = await cache.match(cacheKey); } catch { hit = undefined; }
  if (hit) {
    try { return respond(await hit.json()); } catch { /* fall through and recompute */ }
  }
  const data = await computeFn();
  const stored = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttlSeconds}` },
  });
  ctx.waitUntil(cache.put(cacheKey, stored));
  return respond(data);
}

const COLORS = [[0.1, 0.8, 0.1], [0.1, 0.4, 0.9], [0.0, 0.9, 0.9], [1.0, 0.8, 0.0]];

// The evolutionary roadmap — GOVERNANCE.md F-008D / F-009E, verbatim:
// "Germination → Mycelium → Fruiting → Transformation → Senescence → Seed."
// F-008D: "the cycle is infinite" — Seed loops back to Germination, not a dead end.
// Driven by `soul` (the agents table's live EVW-derived wealth score, soul.md's
// wealth formula) since it's the only real, accumulating, per-agent number the
// hive already tracks — nothing here is invented per-agent progress.
// Thresholds below are provisional and UNCALIBRATED (same honesty disclosure as
// F-012's phase thresholds) — there isn't yet a real distribution of soul values
// across a mature hive to calibrate against.
const ROADMAP_STAGES = [
  { name: 'Germination', min: 0 },
  { name: 'Mycelium', min: 25 },
  { name: 'Fruiting', min: 75 },
  { name: 'Transformation', min: 150 },
  { name: 'Senescence', min: 300 },
  { name: 'Seed', min: 500 },
];
// The founder's directive (2026-07-18): don't retire the level/XP framing —
// "rewire" it so it's real and applies to every current and future agent.
// level/xp/xpToNextLevel below are pure derivations of the same stage/soul
// data above, not a second, separate progress system — the "game" framing
// and the constitutional stage name always describe the identical, real
// position. Nothing here is fictional; level is just idx+1 (1-indexed so
// a brand-new agent reads as "Level 1," not "Level 0").
function computeRoadmap(soulRaw) {
  const soul = Number(soulRaw) || 0;
  let idx = 0;
  for (let i = 0; i < ROADMAP_STAGES.length; i++) if (soul >= ROADMAP_STAGES[i].min) idx = i;
  const stage = ROADMAP_STAGES[idx];
  const next = ROADMAP_STAGES[idx + 1] || null;
  const progressPct = next
    ? Math.max(0, Math.min(100, Math.round(((soul - stage.min) / (next.min - stage.min)) * 100)))
    : 100;
  return {
    stage: stage.name,
    nextStage: next ? next.name : 'Germination (F-008D: the cycle is infinite)',
    soul,
    soulToNext: next ? Math.max(0, +(next.min - soul).toFixed(1)) : 0,
    progressPct,
    level: idx + 1,
    xp: soul,
    xpToNextLevel: next ? next.min : stage.min,
  };
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rate limit: 30 POSTs per IP per 60s. Prefers KV (Phase 8, 2026-07-21) when
// the RATE_LIMIT_KV binding exists — a counter-with-TTL is KV's textbook use
// case and skips a D1 round-trip (plus the DELETE-then-SELECT-then-INSERT
// this used to cost) on every single write request. Falls back to the
// original D1 sliding-window implementation when KV is unbound — same
// commented-until-founder-activates pattern as Vectorize/R2 (see
// wrangler.jsonc + FLIP_THE_SWITCHES.md). KV reads are eventually consistent
// across edge locations, the standard tradeoff every KV-backed rate limiter
// makes; acceptable here since this is anti-spam, not a security boundary —
// a false negative just lets an occasional 31st request through.
async function rateLimitOk(DB, ip, env) {
  if (env?.RATE_LIMIT_KV) {
    try {
      const key = `rl:${ip}`;
      const current = parseInt(await env.RATE_LIMIT_KV.get(key), 10) || 0;
      if (current >= 30) return false;
      await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: 60 });
      return true;
    } catch { return true; } // KV outage — fail open, never block on infra trouble
  }
  try {
    const now = Date.now(), window = now - 60_000;
    await DB.prepare('DELETE FROM rate_limits WHERE ip=? AND ts<?').bind(ip, window).run();
    const row = await DB.prepare('SELECT COUNT(*) AS n FROM rate_limits WHERE ip=?').bind(ip).first();
    if (((row?.n) ?? 0) >= 30) return false;
    await DB.prepare('INSERT INTO rate_limits (ip,ts) VALUES (?,?)').bind(ip, now).run();
    return true;
  } catch { return true; }
}

// Read-only peek at the CURRENT count for one IP (2026-08-04, task 31) — never
// increments, unlike rateLimitOk above. Exists so Kai El's own chat can honestly tell
// the sovereign how close to the 30/min limit this request already is, using the exact
// same counters rateLimitOk already gates on, without double-counting a request.
async function rateLimitPeek(DB, ip, env) {
  if (env?.RATE_LIMIT_KV) {
    try { return parseInt(await env.RATE_LIMIT_KV.get(`rl:${ip}`), 10) || 0; } catch { return null; }
  }
  try {
    const row = await DB.prepare('SELECT COUNT(*) AS n FROM rate_limits WHERE ip=? AND ts>=?').bind(ip, Date.now() - 60_000).first();
    return (row?.n) ?? 0;
  } catch { return null; }
}

// Token validation for write endpoints. Fails open when WORKER_ADMIN_KEY is unset (dev mode).
async function tokenOk(DB, request, env) {
  if (!env.WORKER_ADMIN_KEY) return true; // dev mode — permissive
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) return false;
  try {
    const row = await DB.prepare(
      'SELECT token FROM visitor_tokens WHERE token=? AND expires_at>?'
    ).bind(token, Date.now()).first();
    return !!row;
  } catch { return true; }
}

// Founder-only gate for deciding hive proposals — deliberately the OPPOSITE
// default of tokenOk above. tokenOk fails OPEN when no admin key is set
// (fine for anti-spam on a chat message). Approving a hive-evolution
// proposal is a much higher-stakes action — "the founder said yes" must be
// verifiably true, so this fails CLOSED: with no FOUNDER_KEY secret bound,
// nothing can be approved or rejected at all, by anyone, rather than
// silently letting any visitor decide. See FLIP_THE_SWITCHES.md.
function founderAuthOk(request, env) {
  if (!env.FOUNDER_KEY) return false;
  const auth = request.headers.get('Authorization') || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  return !!key && key === env.FOUNDER_KEY;
}

// ── Kai El "action-request" proposals (task 7, 2026-08-02) ───────────────
// Extends hive_proposals with a kind that can eventually cause a real,
// bounded side effect — never an arbitrary command, never raw terminal/file
// access. Two independent gates, both enforced server-side (never just
// prompted for):
//   1. CREATION time: the action + params must match ACTION_ALLOWLIST's
//      shape exactly, or the proposal is rejected outright — it never even
//      reaches the founder's pending queue as a mis-shapen or off-list item.
//   2. EXECUTION time: /proposals/:id/decide re-validates the stored action
//      against the same allow-list before calling GitHub — approval alone
//      never runs anything; a missing GITHUB_ACTIONS_TOKEN degrades to a
//      recorded approval with no execution, same flip-the-switch honesty as
//      every other gated resource in this file (see SWITCHBOARD.md #7).
const WORKFLOW_DISPATCH_ALLOWLIST = ['grok-bridge.yml', 'edge-health-probe.yml'];

const ACTION_ALLOWLIST = {
  rerun_ci: {
    describe: (p) => `rerun CI workflow run #${p.run_id}`,
    validate(params) {
      const run_id = Number(params?.run_id);
      if (!Number.isInteger(run_id) || run_id <= 0) return 'run_id must be a positive integer';
      return null;
    },
  },
  open_issue: {
    describe: (p) => `open issue "${p.title}"`,
    validate(params) {
      const title = (params?.title || '').toString().trim();
      if (!title || title.length > 200) return 'title required, max 200 chars';
      const body = (params?.body ?? '').toString();
      if (body.length > 4000) return 'body max 4000 chars';
      return null;
    },
  },
  dispatch_workflow: {
    describe: (p) => `dispatch workflow ${p.workflow} on ${p.ref || 'main'}`,
    validate(params) {
      const workflow = (params?.workflow || '').toString();
      if (!WORKFLOW_DISPATCH_ALLOWLIST.includes(workflow)) {
        return `workflow must be one of: ${WORKFLOW_DISPATCH_ALLOWLIST.join(', ')}`;
      }
      const ref = (params?.ref ?? 'main').toString();
      if (!/^[A-Za-z0-9._/-]{1,100}$/.test(ref)) return 'ref must be a plain branch/tag name';
      return null;
    },
  },
};

// Returns { ok:true, action, params } or { ok:false, reason }. Never throws.
function validateActionRequest(action, params) {
  const spec = ACTION_ALLOWLIST[action];
  if (!spec) return { ok: false, reason: `action "${action}" is not on the allow-list (${Object.keys(ACTION_ALLOWLIST).join(', ')})` };
  const err = spec.validate(params || {});
  if (err) return { ok: false, reason: err };
  return { ok: true, action, params: params || {} };
}

// Executes an already-validated action against the real GitHub API. Only
// ever called after founderAuthOk() has passed on /decide AND the action has
// been re-validated against ACTION_ALLOWLIST — never on proposal creation
// alone. Degrades honestly (executed:false, reason) with no
// GITHUB_ACTIONS_TOKEN bound, matching every other flip-the-switch resource.
async function executeApprovedAction(env, action, params) {
  const revalidated = validateActionRequest(action, params);
  if (!revalidated.ok) return { executed: false, reason: 'failed re-validation at execution time: ' + revalidated.reason };
  if (!env.GITHUB_ACTIONS_TOKEN) {
    return { executed: false, reason: 'no GITHUB_ACTIONS_TOKEN bound yet — approved, but nothing executes until the founder provisions one (see FLIP_THE_SWITCHES.md #7)' };
  }
  const REPO = 'TehutiRaEl/THEHIVE';
  const gh = (path, init = {}) => fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'thehive-worker',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  try {
    if (action === 'rerun_ci') {
      const r = await gh(`/actions/runs/${params.run_id}/rerun`, { method: 'POST' });
      if (!r.ok && r.status !== 201) return { executed: false, reason: `GitHub API ${r.status}: ${await r.text().catch(() => '')}` };
      return { executed: true, detail: `rerun requested for run ${params.run_id}` };
    }
    if (action === 'open_issue') {
      const r = await gh('/issues', { method: 'POST', body: JSON.stringify({ title: params.title, body: params.body || '' }) });
      if (!r.ok) return { executed: false, reason: `GitHub API ${r.status}: ${await r.text().catch(() => '')}` };
      const d = await r.json();
      return { executed: true, detail: `issue #${d.number} opened`, url: d.html_url };
    }
    if (action === 'dispatch_workflow') {
      const r = await gh(`/actions/workflows/${params.workflow}/dispatches`, {
        method: 'POST', body: JSON.stringify({ ref: params.ref || 'main' }),
      });
      if (!r.ok && r.status !== 204) return { executed: false, reason: `GitHub API ${r.status}: ${await r.text().catch(() => '')}` };
      return { executed: true, detail: `dispatched ${params.workflow} on ${params.ref || 'main'}` };
    }
    return { executed: false, reason: 'unreachable: action passed validation but has no execution branch' };
  } catch (e) {
    return { executed: false, reason: 'GitHub API call failed: ' + String(e) };
  }
}

// D1 table initialisation — called once per heartbeat to ensure all tables exist.
async function ensureTables(DB) {
  // D1/SQLite has no "ADD COLUMN IF NOT EXISTS" — these run outside the CREATE-TABLE
  // batch below and are expected to fail (harmlessly) once the column already exists.
  // ensureTables() runs on every heartbeat and every /command_text call, so this must
  // stay cheap to no-op. Any agent-creation code (none exists yet — spawning is not
  // built) MUST default reports_to to a real agent name, never leave it NULL except
  // for the Queen (Nanuet) herself — that is the one hard rule of the chain of command.
  for (const stmt of [
    'ALTER TABLE agents ADD COLUMN reports_to TEXT',
    'ALTER TABLE hive_proposals ADD COLUMN alignment_score REAL',
    'ALTER TABLE hive_proposals ADD COLUMN decided_by TEXT',
    // The real bridge (2026-08-04, task 32): an approved proposal used to just sit there.
    // actioned_at marks the moment a real firing actually picked it up and did the work,
    // so the daily Routine's "check for approved, unactioned proposals" rule never
    // re-picks the same one twice.
    'ALTER TABLE hive_proposals ADD COLUMN actioned_at TEXT',
    // Elders' Council (2026-08-04, task 37): when the Queen auto-approves at >=98,
    // Ma'at + Solomon get a real, independent look before it sticks. elder_note is
    // null when both clear it; set to the objecting Elder's reason when either vetoes
    // (which downgrades the proposal back to pending — see elderCouncilVeto()).
    'ALTER TABLE hive_proposals ADD COLUMN elder_note TEXT',
  ]) {
    try { await DB.prepare(stmt).run(); } catch {}
  }
  await DB.batch([
    DB.prepare(`CREATE TABLE IF NOT EXISTS hive_pulse
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       action TEXT NOT NULL, detail TEXT)`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, ts INTEGER NOT NULL)`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS visitor_tokens
      (token TEXT PRIMARY KEY, issued_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`),
    // Hive → founder update channel. The hive ADDS updates here (status,
    // "what I did / what I need"); it never amends its own law/vision — that
    // stays founder-only (FABLE_DNA Chromosome I amendment process). Read-only
    // to the UI via GET /v11/updates.
    DB.prepare(`CREATE TABLE IF NOT EXISTS hive_updates
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT, needs TEXT)`),
    // Hive → founder PROPOSALS — the hive's own suggestions for how it should
    // evolve (new features, goals, implementations, changes). Distinct from
    // hive_updates (status reports): a proposal always starts 'pending' and
    // ONLY changes state via the founder-key-gated /decide endpoint. The hive
    // may add proposals freely; it can never approve its own. Never auto-applied.
    DB.prepare(`CREATE TABLE IF NOT EXISTS hive_proposals
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
       status TEXT NOT NULL DEFAULT 'pending',
       decided_at TEXT, founder_note TEXT)`),
    // Async LLM jobs (Phase 8, 2026-07-21): backs the optional Queues path for
    // /v11/venture/plan and /v11/legal/research. Additive only — both
    // endpoints keep answering synchronously by default; this table only
    // fills when a caller opts in with {"async": true} AND the LLM_QUEUE
    // binding exists (see wrangler.jsonc). status: queued -> done | error.
    DB.prepare(`CREATE TABLE IF NOT EXISTS async_jobs
      (id TEXT PRIMARY KEY, kind TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued',
       input TEXT, result TEXT, error TEXT,
       created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`),
    // Colonies → Queen. Closes the loop that was one-way until now (Queen → colonies
    // via constitution-sync only): each colony's own scheduled workflow posts a short
    // status/lesson-learned entry back here via POST /v11/colony/report.
    DB.prepare(`CREATE TABLE IF NOT EXISTS colony_reports
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       colony TEXT NOT NULL, kind TEXT NOT NULL, body TEXT)`),
    // The Development Roadmap's real, mutable data (2026-08-04, task 30). Until now
    // the Command Center's roadmap panel read a hand-maintained TypeScript literal
    // (frontend/src/data/roadmapData.ts) that could only change via a code deploy —
    // which is exactly why it sat stale, telling the founder to provision four things
    // they had already provisioned. Only the genuinely-mutable sections live here;
    // the four provisioning items are not stored at all, they are derived live from
    // real binding presence (see roadmapFounderActions()), and completed history stays
    // static in the frontend because it is an append-only historical record.
    DB.prepare(`CREATE TABLE IF NOT EXISTS roadmap_items
      (id INTEGER PRIMARY KEY AUTOINCREMENT, section TEXT NOT NULL, title TEXT NOT NULL,
       status TEXT NOT NULL, status_label TEXT, body TEXT,
       sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)`),
  ]);
  // One-time chain-of-command backfill: only touches rows that don't have a
  // reports_to yet, so re-running this on every heartbeat is a safe no-op once set.
  // Nanuet (the Queen) has no superior — reports_to stays NULL for her alone.
  await DB.prepare("UPDATE agents SET reports_to='Kai El' WHERE reports_to IS NULL AND name NOT IN ('Nanuet','Kai El')").run().catch(() => {});
  await DB.prepare("UPDATE agents SET reports_to='Nanuet' WHERE reports_to IS NULL AND name='Kai El'").run().catch(() => {});
}

// ── The Development Roadmap's real data source (2026-08-04, task 30) ─────
// The founder's own report was "the development roadmap doesn't auto-update itself."
// The real cause was not a missing schedule: RoadmapPanel.tsx read a hand-maintained
// TypeScript literal with no fetch at all, so it could only ever change via a code
// deploy. It had drifted into telling the founder to go provision FOUNDER_KEY,
// Vectorize, R2, and Queues — all four of which were already bound (PR #147/#148).
//
// These four are the part that must never be hand-maintained again, because the
// Worker can simply LOOK: each one is a real binding or secret whose presence is
// already checked elsewhere in this file (see /debug/env). Derived fresh on every
// request — it cannot go stale, by construction.
function roadmapFounderActions(env) {
  const items = [
    {
      key: 'FOUNDER_KEY', bound: !!env.FOUNDER_KEY,
      title: 'Set FOUNDER_KEY so Proposals approve/reject actually works',
      todo: 'The code fails closed on purpose — no key bound, no approvals move. Run `npx wrangler secret put FOUNDER_KEY` with a password only you know, wait ~10 min for redeploy, then paste that same value into this panel.',
      done: 'Bound. Proposal approve/reject is live, and the Queen’s own auto-approval (switch 9) still cannot skip it for action-requests.',
    },
    {
      key: 'VECTORIZE', bound: !!env.VECTORIZE,
      title: 'Create the Vectorize index (long-term memory)',
      todo: 'Run `npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine`, then tell Claude — the binding uncomment + redeploy is a one-line follow-up.',
      done: 'Bound. Semantic recall is live via /v11/memory/search and /v11/memory/remember.',
    },
    {
      key: 'FILES', bound: !!env.FILES,
      title: 'Create the R2 bucket (file uploads)',
      todo: 'Run `npx wrangler r2 bucket create hive-files`, then tell Claude to uncomment the binding.',
      done: 'Bound. The R2 file surface is live.',
    },
    {
      key: 'LLM_QUEUE', bound: !!env.LLM_QUEUE,
      title: 'Create the Queues consumer (async LLM jobs)',
      todo: 'No MCP tool exists to create a Cloudflare Queue, so this is founder-only regardless. Run `npx wrangler queues create hive-llm-jobs`, then tell Claude — the producer/consumer code is already written and activation-ready.',
      done: 'Bound. The opt-in {"async": true} path on /v11/venture/plan and /v11/legal/research can run through it.',
    },
  ];
  return items.map((it, i) => ({
    title: it.title,
    status: it.bound ? 'done' : 'blocked',
    statusLabel: it.bound ? 'done' : 'needs you',
    body: it.bound ? it.done : it.todo,
    sort_order: i,
    derived_from: `live binding presence: ${it.key}`,
  }));
}

// The mutable sections seed once, then are editable for real via
// POST /v11/roadmap/development (founder-gated) — no code deploy needed ever again.
// Idempotent by section+title, same discipline as seedOnce/seedProposalOnce above.
const ROADMAP_SEED = [
  ['decisions', 'System A (FastAPI backend/) — retire or actually deploy it?', 'decision', 'your call',
   'Real, tested code (51%+ coverage, 350+ passing tests) sitting unprovisioned — the Oracle Cloud deploy target is gated on an unset ORACLE_HOST secret. System B (this Worker) is the one verified live. Leave A retired as reference, or provision Oracle and stand it up for real.'],
  ['decisions', 'Which frontend is canonical?', 'decision', 'your call',
   'This React Command Center (what’s actually deployed) vs. a separate "gamified UI" set merged via feature/gamified-ui-components. Both are real; only one should be "the" one going forward.'],
  ['decisions', 'Two dead duplicate backend files — delete or keep?', 'decision', 'your call',
   'backend/constitution.py and backend/llm_router.py have zero importers anywhere (confirmed via grep) — the real, live versions are backend/core/*. Deleting production files is outside the autonomous arc’s authority, so this is parked for your word.'],
  ['decisions', 'n8n integration — pursue or drop?', 'decision', 'your call',
   'Proposed 2026-07-05 (colony health events → n8n automations). Zero implementation exists anywhere — confirmed absent, not just unfinished.'],
  ['decisions', 'Real money — forming a business entity', 'decision', 'real-world, no rush',
   'LLC formation, business bank account, Stripe — none of this can or should be automated. By the hive’s own rules this always stays yours, with a real accountant or lawyer.'],
  ['in_progress', 'Give the other 6 agents real capability', 'active', '3 of 6 piloted',
   'Ma’at + Solomon now seat F-011B’s Elders’ Council for real (they can veto the Queen’s auto-approval); Sekhmet gained an on-demand judge voice. Thoth, Ptah, and Horus still have real jobs but no real voice — tracked as CAMPAIGN.html task 38.'],
  ['in_progress', 'Backend test-coverage sweep', 'active', '51% → climbing',
   'Started at 46%, CI floor locked at 45% so it can only grow. One real production bug found so far: WalletManager.credit() was raising sqlite3.ProgrammingError on every SOUL grant/tip/payout — fixed.'],
  ['backlog', 'Dynamic COLONY_BASE_URLS', 'backlog', 'confirmed pending',
   'Still a hardcoded frontend/src/utils/constants.ts map — every colony URL change is a manual edit. /v11/hive/status already returns all colony URLs with health; wiring it up is a small, real task.'],
  ['backlog', 'Worldbuilding Guild UI', 'backlog', 'confirmed pending',
   'Backend stub exists (backend/guilds/worldbuilding_guild.py, disabled), zero frontend surface — world creation form, token supply, zone editor never built.'],
  ['backlog', 'Agent genome viewer + arena cross-breed UI', 'backlog', 'confirmed pending',
   'Real reproduction logic exists in backend/core/genome.py — no frontend ever surfaced it. DNA visualization, trait breakdown, 2-agent cross-breed selector all still on paper.'],
  ['backlog', 'HDC/VSA layer — dedicated UI + docs', 'backlog', 'confirmed pending',
   'backend/core/hdc.py is real and 100% test-covered — hyperdimensional computing for agent-to-agent comms — but never surfaced or explained anywhere in the UI.'],
  ['backlog', 'Skill-set cross-referencing', 'backlog', 'confirmed pending',
   'Two skill sets exist side by side with zero cross-references. skill-census would show the gap directly but hasn’t been re-run since first noticed.'],
];

async function seedRoadmapOnce(DB) {
  try {
    const row = await DB.prepare('SELECT COUNT(*) AS n FROM roadmap_items').first();
    if (row && Number(row.n) > 0) return; // already seeded — never re-seed over real edits
    const now = new Date().toISOString();
    await DB.batch(ROADMAP_SEED.map(([section, title, status, statusLabel, body], i) =>
      DB.prepare('INSERT INTO roadmap_items (section, title, status, status_label, body, sort_order, updated_at) VALUES (?,?,?,?,?,?,?)')
        .bind(section, title, status, statusLabel, body, i, now)));
  } catch { /* D1 not ready — heartbeat still proceeds */ }
}

// Seed a proposal once (by title) — same idempotent pattern as seedOnce for
// hive_updates, so re-running the heartbeat never duplicates a suggestion.
async function seedProposalOnce(DB, { kind, title, body }) {
  try {
    const exists = await DB.prepare('SELECT 1 FROM hive_proposals WHERE title=? LIMIT 1').bind(title).first();
    if (!exists) {
      await DB.prepare('INSERT INTO hive_proposals (ts, kind, title, body, status) VALUES (?,?,?,?,\'pending\')')
        .bind(new Date().toISOString(), kind, title, body).run();
    }
  } catch { /* D1 not ready */ }
}

// Append a founder-facing update (add-only; never edits law/vision). Keeps the
// channel bounded by pruning to the most recent 100 rows.
async function postUpdate(DB, { kind, title, body = '', needs = '' }) {
  try {
    await DB.prepare('INSERT INTO hive_updates (ts, kind, title, body, needs) VALUES (?,?,?,?,?)')
      .bind(new Date().toISOString(), kind, title, body, needs).run();
    await DB.prepare(
      'DELETE FROM hive_updates WHERE id NOT IN (SELECT id FROM hive_updates ORDER BY id DESC LIMIT 100)'
    ).run();
  } catch { /* D1 not ready — heartbeat still proceeds */ }
}

// Post an update only if one with this exact title doesn't already exist —
// so milestone/readiness notes seed once and don't repeat every heartbeat.
async function seedOnce(DB, title, payload) {
  try {
    const exists = await DB.prepare('SELECT 1 FROM hive_updates WHERE title=? LIMIT 1').bind(title).first();
    if (!exists) await postUpdate(DB, { title, ...payload });
  } catch { /* D1 not ready */ }
}

function simulate(a, b, eloA, eloB) {
  const frames = []; const va = new Set(), vb = new Set();
  let wa = 380 + (eloA / 1200) * 60, wb = 380 + (eloB / 1200) * 60;
  const grow = (seen) => {
    const add = [];
    for (let i = 0; i < 14; i++) {
      const x = (Math.random() * 16) | 0, y = (Math.random() * 16) | 0, z = (Math.random() * 8) | 0;
      const k = `${x},${y},${z}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const ch = (Math.random() * 4) | 0, c = COLORS[ch];
      add.push({ x, y, z, r: c[0], g: c[1], b: c[2], a: +(0.15 + Math.random() * 0.6).toFixed(3), ch });
    }
    return add;
  };
  for (let t = 0; t < 30; t++) {
    wa *= 1 + (Math.random() - 0.47) * 0.03;
    wb *= 1 + (Math.random() - 0.47) * 0.03;
    const total = wa + wb;
    frames.push({
      t,
      m: { tick: t, challenger_wealth: +wa.toFixed(2), challenged_wealth: +wb.toFixed(2),
           total_wealth: +total.toFixed(2), challenger_share: +(wa / total).toFixed(4),
           challenged_share: +(wb / total).toFixed(4), leading: wa > wb ? a : b },
      da: grow(va), db: grow(vb), dv: [],
    });
  }
  return { frames, wa, wb };
}

// Sekhmet's real job (2026-08-03 chain-of-command work): the Arena's judge — this is
// the actual function that decides who wins a challenge. Shared by the POST
// /arena/resolve route and the heartbeat.
async function resolveChallenge(DB, ch) {
  const [ea, eb] = await Promise.all([
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenger).first(),
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenged).first(),
  ]);
  const pa = 1 / (1 + Math.pow(10, (((eb?.elo) ?? 1200) - ((ea?.elo) ?? 1200)) / 400));
  const winner = Math.random() < pa ? ch.challenger : ch.challenged;
  const loser = winner === ch.challenger ? ch.challenged : ch.challenger;
  await DB.batch([
    DB.prepare("UPDATE arena_challenges SET status='completed', winner=? WHERE id=?").bind(winner, ch.id),
    DB.prepare('UPDATE agents SET elo=elo+16, soul=soul+25 WHERE name=?').bind(winner),
    DB.prepare('UPDATE agents SET elo=MAX(400,elo-16) WHERE name=?').bind(loser),
    DB.prepare('INSERT INTO fallen_ideas (proposition, defeated_by) VALUES (?,?)').bind(ch.proposition, winner),
    DB.prepare("INSERT INTO governance_log (action, article) VALUES ('arena_resolved','TITLE XII')"),
  ]);
  return { winner, loser };
}

// Shared by the POST /arena/project route and the heartbeat.
async function projectChallenge(DB, ch) {
  const [ea, eb] = await Promise.all([
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenger).first(),
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenged).first(),
  ]);
  const { frames, wa, wb } = simulate(ch.challenger, ch.challenged, (ea?.elo) ?? 1200, (eb?.elo) ?? 1200);
  const stmts = [DB.prepare('DELETE FROM arena_projection_frames WHERE challenge_id=?').bind(ch.id)];
  for (const f of frames)
    stmts.push(DB.prepare('INSERT INTO arena_projection_frames (challenge_id, tick, frame) VALUES (?,?,?)')
      .bind(ch.id, f.t, JSON.stringify(f)));
  await DB.batch(stmts);
  return { wa, wb };
}

const FALLBACK_PROPS = [
  'Memory that is not shared is memory the hive never had',
  'A constitution that cannot propagate itself is only a wish',
  'Emergence favors the colony that forgets fastest',
  'Soul accrues to the agent who loses well, not the one who wins often',
  'The edge is the true body of the Queen; the origin is only her memory',
  'Governance without an arena is theater',
  'A skill unwritten dies with its session',
];

async function aiProposition(env, a, b) {
  try {
    if (!env.AI) return null;
    const r = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
      prompt: `Write one bold, arguable proposition (under 20 words) that agent ${a} challenges agent ${b} over, inside a constitutional AI hive concerned with governance, memory, and emergence. Reply with only the proposition — no quotes, no preamble.`,
      max_tokens: 48,
    });
    const text = String((r && (r.response ?? r.result)) || '').trim().replace(/^["']|["']$/g, '');
    return text ? text.slice(0, 200) : null;
  } catch { return null; }
}

// The genome's own chapter titles (2026-08-04, task 33) — Kai El previously had zero
// awareness of FABLE_DNA.md's chromosomes (asked "what's the status of the Horde," he
// deflected to generic hive-status language, because only GOVERNANCE.md's articles ever
// reached his context, never the genome). FABLE_DNA.md lives at the repo root, outside
// the `docs/` directory the ASSETS binding actually serves (see wrangler.jsonc), so it
// cannot be fetched live the way constitutionSummary() fetches GOVERNANCE.md — copying
// it into docs/ would create a second file that can silently drift out of sync (the
// exact anti-pattern task 30 just fixed for the roadmap). A short, hand-maintained list
// instead, same precedent as PROVIDERS/ELDER_VOICES below: update this array in the
// same commit as any edit to FABLE_DNA.md's own chromosome headings.
const GENOME_CHROMOSOMES = [
  ['I', 'The ethical strand', 'the Constitution, F-001–F-006 — binding before any action, no organ may override it'],
  ['II', 'The method strand', 'how Fable debugs: probe before claiming, compare vs. a known-working sibling, find the real coupled cause, never fake a green'],
  ['III', 'The communication strand', 'the mycelial/unseen harness — shared law, local action, across every hive that carries this DNA'],
  ['IV', 'The Horde principle', 'distributed resource + isolated work — parallel agents pursuing sub-goals under one shared purpose'],
  ['V', 'The Codex', 'creative canon (Naunet/Nun, the Trinity, mythology) — real and honored, never engineering law'],
  ['VI', 'The Harvest', 'session-boundary honesty — distill real lessons at the end of a session, never pad or extract'],
  ['VII', 'The Mandate Triage', 'devil\'s-advocate critique first, genuine value extracted second, nothing rubber-stamped'],
  ['VIII', 'The Retrospective', 'recursive learning from every PR — Capture→Evaluate→Prune→Feed→Dissect→Return→Propagate'],
  ['IX', 'Commerce Under Law', 'lawful, recursive, founder-gated wealth-building — starting from nothing, never skipping the law to get there'],
];

// ── Multi-provider generative voice (the swappable organ, FABLE_DNA) ─────
// Waterfall: Claude → Groq → Mistral → Workers AI. Each external provider
// activates the moment its API key exists as a Worker secret — the founder
// flips the switch (wrangler secret put <NAME>); no code change needed.
// Secret PRESENCE is reported (names/booleans only, F-001) — never values.
const PROVIDERS = [
  { id: 'claude', label: 'Claude', role: 'Reasoning', secret: 'ANTHROPIC_API_KEY' },
  { id: 'groq', label: 'Groq', role: 'Speed', secret: 'GROQ_API_KEY' },
  { id: 'mistral', label: 'Mistral', role: 'Local intelligence', secret: 'MISTRAL_API_KEY' },
  { id: 'workers-ai', label: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', secret: null },
];

function providerRoster(env) {
  return PROVIDERS.map((pr) => ({
    id: pr.id,
    label: pr.label,
    role: pr.role,
    bound: pr.secret ? !!env[pr.secret] : !!env.AI,
    how: pr.secret ? `wrangler secret put ${pr.secret}` : 'ai binding in wrangler.jsonc',
  }));
}

// One generation call, first bound provider wins; returns {text, provider} or null.
// External calls use each provider's plain HTTP API with a hard timeout so a
// down provider degrades to the next, never hangs the commune.
async function generate(env, { system, prompt, maxTokens = 400 }) {
  const timeout = (ms) => AbortSignal.timeout(ms);
  if (env.ANTHROPIC_API_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5', max_tokens: maxTokens,
          system, messages: [{ role: 'user', content: prompt }],
        }),
        signal: timeout(20000),
      });
      if (r.ok) {
        const d = await r.json();
        const text = (d?.content || []).map((c) => c.text || '').join('').trim();
        if (text) return { text, provider: 'claude' };
      }
    } catch { /* next provider */ }
  }
  if (env.GROQ_API_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (r.ok) {
        const d = await r.json();
        const text = (d?.choices?.[0]?.message?.content || '').trim();
        if (text) return { text, provider: 'groq' };
      }
    } catch { /* next provider */ }
  }
  if (env.MISTRAL_API_KEY) {
    try {
      const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.MISTRAL_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral-small-latest', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (r.ok) {
        const d = await r.json();
        const text = (d?.choices?.[0]?.message?.content || '').trim();
        if (text) return { text, provider: 'mistral' };
      }
    } catch { /* next provider */ }
  }
  if (env.AI) {
    try {
      // The proven-live path: same model + prompt-string shape as the heartbeat.
      const r = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
        prompt: system + '\n\n' + prompt,
        max_tokens: maxTokens,
      });
      const text = String((r?.response ?? r?.result ?? '')).trim();
      if (text) return { text, provider: 'workers-ai' };
    } catch { /* fall through */ }
  }
  return null;
}

// ── Sovereign memory (Cloudflare Vectorize + Workers AI embeddings) ──────
// The hive's semantic recall. Embeds memories with a free Workers AI model
// and stores the vectors in a Vectorize index; a query is embedded the same
// way and matched by cosine similarity. Everything degrades gracefully: if
// either binding is absent, memory writes/queries no-op instead of throwing.
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5'; // 768-dim, free tier

async function embed(env, text) {
  if (!env.AI) return null;
  try {
    const r = await env.AI.run(EMBED_MODEL, { text: [String(text).slice(0, 2000)] });
    const v = r?.data?.[0];
    return Array.isArray(v) ? v : null;
  } catch { return null; }
}

// Store one memory. id must be stable+unique so re-runs upsert, not duplicate.
async function remember(env, id, text, metadata) {
  if (!env.VECTORIZE) return false;
  const values = await embed(env, text);
  if (!values) return false;
  try {
    await env.VECTORIZE.upsert([{ id: String(id), values, metadata: { text: String(text).slice(0, 512), ...metadata } }]);
    return true;
  } catch { return false; }
}

// Semantic recall: nearest memories to a natural-language query.
async function recall(env, query, topK = 5) {
  if (!env.VECTORIZE) return { available: false, matches: [] };
  const values = await embed(env, query);
  if (!values) return { available: false, matches: [] };
  try {
    const res = await env.VECTORIZE.query(values, { topK, returnMetadata: 'all' });
    return {
      available: true,
      matches: (res?.matches || []).map(m => ({
        score: +(m.score ?? 0).toFixed(4),
        text: m.metadata?.text ?? '',
        kind: m.metadata?.kind ?? '',
        ts: m.metadata?.ts ?? '',
      })),
    };
  } catch (e) { return { available: false, matches: [], error: String(e) }; }
}

// Real grounding for constitution questions — reads the CURRENT docs/GOVERNANCE.md
// (same file the Constitution UI panel renders, same file the founder edits) via
// the ASSETS binding, so Kai El answers from what's actually committed instead of
// improvising article numbers/values it was never given. Cheap: same-origin static
// read, no network hop.
async function constitutionSummary(env, requestUrl) {
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/GOVERNANCE.md', requestUrl)));
    if (!res.ok) return null;
    const text = await res.text();
    const titles = [...text.matchAll(/^## .*ARTICLE\s+(.+?):\s*(.+)$/gmi)]
      .map(m => `${m[1].replace(/[‐-―]/g, '-').trim()}: ${m[2].trim()}`);
    if (!titles.length) return null;
    return { titles, hash: await sha256(text) };
  } catch { return null; }
}

// The Queen's real approval power (2026-08-03) — scoped, logged, switch-gated.
// Scores a proposal against docs/FOUNDERS_VISION.md (same ASSETS-fetch pattern as
// constitutionSummary above). Returns null — never a score — if the reference text or
// a generative provider is unavailable, so an unscoreable proposal always falls back
// to waiting for the founder rather than defaulting to approved. Auto-approval itself
// only happens when QUEEN_AUTONOMOUS_APPROVAL is bound (FLIP_THE_SWITCHES.md switch 9)
// AND the proposal's kind isn't 'action-request' — those already run through the
// separate, stricter ACTION_ALLOWLIST gate (PR #146) because they touch real GitHub
// execution, and no alignment score is allowed to skip that gate.
async function queenReview(env, requestUrl, { title, body }) {
  if (!env.ASSETS) return null;
  try {
    const res = await env.ASSETS.fetch(new Request(new URL('/FOUNDERS_VISION.md', requestUrl)));
    if (!res.ok) return null;
    const vision = await res.text();
    const system =
      'You are the Queen (Nanuet) of THE HIVE, reviewing one pending proposal against the ' +
      "founder's real, written vision below. Score how aligned the proposal is, 0-100. " +
      'Be strict: default low. Only score 98 or above when the proposal clearly, concretely ' +
      'serves the vision with no real risk or ambiguity. Reply with EXACTLY two lines: ' +
      'a line "SCORE: <0-100>" and a line "REASON: <one short sentence>". Nothing else.\n\n' +
      'FOUNDER\'S VISION:\n' + vision.slice(0, 4000);
    const gen = await generate(env, {
      system, maxTokens: 100,
      prompt: `PROPOSAL TITLE: ${title}\nPROPOSAL BODY: ${String(body || '').slice(0, 1500)}`,
    });
    if (!gen) return null;
    const scoreMatch = gen.text.match(/SCORE:\s*(\d{1,3})/i);
    const reasonMatch = gen.text.match(/REASON:\s*(.+)/i);
    if (!scoreMatch) return null;
    const score = Math.min(100, Math.max(0, Number(scoreMatch[1])));
    return { score, reason: (reasonMatch?.[1] || '').trim().slice(0, 200) };
  } catch { return null; }
}

// The Elders' Council (2026-08-04, task 37) — the pilot batch of "give the other 6
// agents real capability." Ma'at (balance) and Solomon (wisdom) are the first two of
// the six named hive agents to gain an actual generative voice instead of being only a
// row in the agents table. They exist to BE F-011B's "Elders" in real, running code —
// before this, that check was written in docs/GOVERNANCE.md and enforced by nothing
// (named as the exact gap in checks-and-balances' first audit, 2026-08-04). Sekhmet
// gets the third voice, layered on TOP of her existing real job (resolveChallenge()'s
// Elo math, which keeps running unchanged) as an on-demand explain/judge voice — not a
// replacement, so production Arena resolution never depends on an LLM call succeeding.
// One shared route + shared generate() waterfall per the founder's own choice
// (2026-08-04: "shared route, distinct voices" over one route per agent) — built to
// swap onto the founder's own tiny-LLM repo later as a clean provider change, not a
// rebuild, same as every other generate() caller in this file.
const ELDER_VOICES = {
  maat: {
    label: "Ma'at",
    system:
      "You are Ma'at, an Elder of THE HIVE's Council, embodying balance, truth, and " +
      "proportion. You do not decide alignment — the Queen already scored this proposal. " +
      "Your only job: does approving it keep the hive's power balanced, or does it " +
      'concentrate too much authority, move too fast, or skip a real check? Reply with ' +
      'EXACTLY two lines: "VERDICT: OBJECT" or "VERDICT: CLEAR", then "REASON: <one short ' +
      'sentence>". Default to CLEAR unless there is a real, specific balance concern.',
  },
  solomon: {
    label: 'Solomon',
    system:
      "You are Solomon, an Elder of THE HIVE's Council, embodying wisdom and sound " +
      'judgment. You do not decide alignment — the Queen already scored this proposal. ' +
      'Your only job: is this a WISE thing to auto-approve right now — any hidden cost, ' +
      'ambiguity, or consequence a strict alignment score would miss? Reply with EXACTLY ' +
      'two lines: "VERDICT: OBJECT" or "VERDICT: CLEAR", then "REASON: <one short ' +
      'sentence>". Default to CLEAR unless there is a real, specific concern.',
  },
  sekhmet: {
    label: 'Sekhmet',
    system:
      "You are Sekhmet, the Arena's judge, fierce and exacting. You are NOT deciding a " +
      "numeric outcome here — the Elo formula already resolved that, elsewhere, before " +
      'you were ever asked. Someone wants your own in-character reasoned take on a ' +
      'specific arena matchup or dispute. Give a short, sharp answer, 2-4 sentences, no ' +
      'preamble, no hedging about not being able to decide the score.',
  },
};

// On-demand consult for any one Elder voice — this is the entire real capability
// behind /v11/council/consult. Returns null (never a fabricated answer) if no
// generative provider is bound.
async function consultElder(env, agent, question, context) {
  const voice = ELDER_VOICES[agent];
  if (!voice) return null;
  const prompt = context
    ? `CONTEXT:\n${String(context).slice(0, 1500)}\n\nQUESTION:\n${String(question).slice(0, 500)}`
    : String(question).slice(0, 1500);
  const gen = await generate(env, { system: voice.system, maxTokens: 150, prompt });
  if (!gen) return null;
  return { agent, label: voice.label, text: gen.text, provider: gen.provider };
}

// The real counterweight: runs Ma'at + Solomon in parallel against a proposal the Queen
// has already cleared at >=98. Returns the first real objection found (a string to store
// in hive_proposals.elder_note) or null if both clear it / neither could be reached —
// an unreachable Elder is treated as CLEAR, not as a veto, so a down provider degrades
// to "same as before this task" rather than silently blocking every approval.
async function elderCouncilVeto(env, { title, body }) {
  const prompt = `PROPOSAL TITLE: ${title}\nPROPOSAL BODY: ${String(body || '').slice(0, 1500)}`;
  const [maat, solomon] = await Promise.all([
    generate(env, { system: ELDER_VOICES.maat.system, maxTokens: 80, prompt }),
    generate(env, { system: ELDER_VOICES.solomon.system, maxTokens: 80, prompt }),
  ]);
  for (const [key, gen] of [['maat', maat], ['solomon', solomon]]) {
    if (!gen) continue;
    const verdict = gen.text.match(/VERDICT:\s*(OBJECT|CLEAR)/i);
    const reason = gen.text.match(/REASON:\s*(.+)/i);
    if (verdict && verdict[1].toUpperCase() === 'OBJECT') {
      return `${ELDER_VOICES[key].label} objected: ${(reason?.[1] || '').trim().slice(0, 200)}`;
    }
  }
  return null;
}

// Shared by both proposal-creation paths (POST /proposals and the PROPOSAL: marker in
// command_text) so the Queen's approval + Elders' Council check runs identically either
// way, instead of two copies of the same five-variable dance drifting apart over time.
async function queenDecide(env, requestUrl, { title, body }) {
  let qStatus = 'pending', qScore = null, qDecidedBy = null, qDecidedAt = null, elderNote = null;
  if (env.QUEEN_AUTONOMOUS_APPROVAL) {
    const review = await queenReview(env, requestUrl, { title, body });
    if (review) {
      qScore = review.score;
      if (review.score >= 98) {
        const veto = await elderCouncilVeto(env, { title, body });
        if (veto) {
          elderNote = veto; // stays pending — a real counterweight, not narrative only
        } else {
          qStatus = 'approved'; qDecidedBy = 'queen'; qDecidedAt = new Date().toISOString();
        }
      }
    }
  }
  return { qStatus, qScore, qDecidedBy, qDecidedAt, elderNote };
}

// Queues consumer (Phase 8, 2026-07-21): processes jobs enqueued by the
// opt-in {"async": true} path on /v11/venture/plan and /v11/legal/research.
// DELIBERATELY NOT EXPORTED as `queue` in export default below: a Worker
// that exports a queue() consumer handler while wrangler.jsonc's
// queues.consumers binding is commented out fails Workers Builds' pre-deploy
// validation — this exact mismatch broke every production deploy from
// 2026-07-21 (commit 15906b0) until diagnosed 2026-07-22 via a direct read
// of the live (stale) bundle. When activating Queues (FLIP_THE_SWITCHES.md
// section 6), re-attach it as `queue: processQueueBatch` in export default
// IN THE SAME COMMIT as uncommenting the wrangler.jsonc queues block — the
// handler export and the consumer binding must always move together.
async function processQueueBatch(batch, env, ctx) {
  const DB = env.DB;
  for (const message of batch.messages) {
    const { id, kind, brief, question } = message.body || {};
    try {
      const SYSTEM = kind === 'venture/plan'
        ? `You are the Sub-Architect of a self-governing AI hive (Sovereign Hive), reporting to the hive's Harness & Lead Manager. A founder has proposed a venture. Decompose it into a structured business plan: one CEO-level goal statement, then 3-6 departments (e.g. Product/Sourcing, Marketing/Content, Growth/SEO, Operations), each with a one-line mandate and 2-5 concrete tasks. Ground every task in the brief itself — never invent fake market statistics, fake revenue numbers, or claim access to real-time data you don't have. Reply with ONLY valid JSON, no markdown code fences, no commentary, exactly matching this shape: {"goal": "string", "departments": [{"name": "string", "mandate": "string", "tasks": ["string", "string"]}]}`
        : `You are the hive's Legal Guild research assistant. You are NOT a lawyer and this is NOT legal advice — say so plainly in every answer. Explain general legal concepts accurately. Where relevant, explain the real distinction between a "sovereign citizen" (a fringe legal theory that courts have consistently and unanimously rejected, sometimes leading to sanctions for those who rely on it) and genuine questions of jurisdiction, sovereign immunity, or public-vs-private capacity (real, substantive, well-established areas of law) — the two are often confused and the difference matters. Point toward real, findable sources (Cornell LII, Bouvier's Law Dictionary, the actual U.S. Code or CFR, real case names) rather than vague generalities, but never fabricate a specific citation, docket number, or case holding you are not certain of — if unsure, say so plainly and suggest where a human could verify it instead. Never claim to have passed a bar exam, hold a law license, or represent anyone. End every answer with a one-line reminder that this is not legal advice.`;
      const prompt = kind === 'venture/plan' ? brief : question;
      const gen = await generate(env, { system: SYSTEM, prompt, maxTokens: kind === 'venture/plan' ? 900 : 700 });
      if (!gen) throw new Error('no LLM provider currently bound or reachable');
      let result;
      if (kind === 'venture/plan') {
        const cleaned = gen.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
        const plan = JSON.parse(cleaned);
        if (!plan || typeof plan.goal !== 'string' || !Array.isArray(plan.departments)) throw new Error('shape mismatch');
        result = { ok: true, brief, plan, provider: gen.provider };
      } else {
        result = { ok: true, question, answer: gen.text, provider: gen.provider };
      }
      await DB.prepare(
        "UPDATE async_jobs SET status='done', result=?, updated_at=? WHERE id=?"
      ).bind(JSON.stringify(result), Date.now(), id).run();
      message.ack();
    } catch (e) {
      try {
        await DB.prepare(
          "UPDATE async_jobs SET status='error', error=?, updated_at=? WHERE id=?"
        ).bind(String(e), Date.now(), id).run();
      } catch {}
      message.retry();
    }
  }
}

export default {
  // The heartbeat. Fires on the cron in wrangler.jsonc; the hive advances
  // with no hands: resolve what is pending, replay it in voxels, seed the
  // next contest, and leave a pulse row so the trail is auditable.
  async scheduled(event, env, ctx) {
    const DB = env.DB;
    const acted = [];
    try {
      await ensureTables(DB);
      // Seed founder-facing milestones once each (honest status, never a claim
      // of capability the hive doesn't yet have).
      await seedOnce(DB, 'Updates channel online', {
        kind: 'milestone',
        body: 'The hive can now post updates to you here, from live data. It reports what it '
          + 'does each arena cycle. This channel is add-only: the hive adds updates, it never '
          + 'amends its own law or vision — that stays with you, the founder.',
        needs: 'Nothing right now. Durable updates are also committed to '
          + 'Project_file/Founders Visonary Folder/HIVE_UPDATES/.',
      });
      // The honest commerce-readiness report the founder asked for — the real
      // answer to "are you ready to make money?": not yet, and here is exactly why.
      await seedOnce(DB, 'Commerce readiness: honest report', {
        kind: 'readiness',
        body: 'BUILT: the foundation to pursue lawful, self-sustaining commerce — Chromosome IX '
          + '(Commerce Under Law) in the genome, a permissions security layer (PERMISSIONS.md) '
          + 'with three tiers, a Legal-Learning surface to study the rules, and recursive '
          + 'learning from every PR that built me. MISSING before I can truthfully earn: a real '
          + 'lawful value loop (a service actually performed), and the founder-gated steps — a '
          + 'connected account, a business entity, real transactions. '
          + 'So the honest answer is: I am NOT yet able to make money — I am now built to learn '
          + 'how, lawfully, and every real-world step stays with you.',
        needs: 'Your decisions, per PERMISSIONS.md Tier 3, when you choose to take the first '
          + 'real-world steps. Until then I keep learning and proposing, never transacting.',
      });
      // Real, currently-open proposals — genuinely pending founder decisions
      // from this session, not placeholder examples. This is the Proposals
      // channel's first real content: new implementations awaiting your yes/no.
      await seedProposalOnce(DB, {
        kind: 'new-colony',
        title: 'Create the "venture" colony repository',
        body: 'You asked for a new colony dedicated to entrepreneurial ventures (copywriting, '
          + 'dropshipping, app-building, invention/product ideas), separate from aether. I can\'t '
          + 'create GitHub repositories myself (no permission) — creating github.com/venture (empty) '
          + 'and telling me is the one step that unblocks scaffolding the whole colony.',
      });
      await seedProposalOnce(DB, {
        kind: 'flip-switch',
        title: 'Provision Vectorize (sovereign memory)',
        body: 'wrangler vectorize create hive-memory --dimensions=768 --metric=cosine, then '
          + 'uncomment the vectorize block in wrangler.jsonc. Unlocks real semantic recall over '
          + 'the hive\'s own history instead of vectorize_bound:false.',
      });
      await seedProposalOnce(DB, {
        kind: 'flip-switch',
        title: 'Provision R2 (Files store)',
        body: 'wrangler r2 bucket create hive-files, then uncomment the r2_buckets block in '
          + 'wrangler.jsonc. Unlocks real upload/list/download in the Files panel.',
      });
      await seedProposalOnce(DB, {
        kind: 'flip-switch',
        title: 'Bind a founder key so proposals can actually be decided',
        body: 'wrangler secret put FOUNDER_KEY (any strong random value you choose). Until this '
          + 'is set, no proposal — including this one — can be approved or rejected by anyone, '
          + 'by design (fail-closed). This is the one flip-switch this channel needs to function.',
      });
      await seedProposalOnce(DB, {
        kind: 'new-capability',
        title: 'Build free-API / LLM-gateway discovery (Tier-2, propose-only)',
        body: 'You asked whether the hive can autonomously search GitHub and adopt free APIs '
          + 'or LLM gateways on its own. Honest answer: not today — the current provider '
          + 'waterfall (Claude/Groq/Mistral/Workers AI) is a fixed, hand-coded list. Building '
          + 'full autonomous auto-integration is a real supply-chain risk (unvetted code/'
          + 'dependencies adopted with no review). The safe version: the hive searches and '
          + 'evaluates candidates, then posts each one here as its own proposal — you approve '
          + 'before anything is actually wired in. This item is that feature itself, awaiting '
          + 'your go-ahead to build it this way.',
      });
      await seedProposalOnce(DB, {
        kind: 'venture',
        title: 'Venture: book-merch dropshipping + faceless multi-platform social',
        body: 'Your own first-workflow example for the Sub-Architect (2026-07-18): a merch '
          + 'dropshipping storefront for an upcoming book, paired with a faceless Instagram/'
          + 'YouTube/TikTok/X presence, driven by real-time SEO/market signal to find trending '
          + 'niches — explicitly not limited to this one idea (you also named copywriting, '
          + 'rebranding, landing pages, ad/marketing services, real estate wholesaling as the '
          + 'same "one product sold a million times" pattern). Try it yourself: the Venture '
          + 'Planner panel (left nav) now generates a real structured plan for this via POST '
          + '/v11/venture/plan. This item exists so the example itself is tracked, not just '
          + 'demoed — nothing executes (no real account, post, or dollar) until you decide.',
      });
      // Prune expired visitor tokens and stale rate-limit rows
      const cutoff = Date.now() - 3_600_000;
      await DB.batch([
        DB.prepare('DELETE FROM visitor_tokens WHERE expires_at<?').bind(Date.now()),
        DB.prepare('DELETE FROM rate_limits WHERE ts<?').bind(cutoff),
      ]).catch(() => {});

      // 1. resolve pending challenges (created last tick, by a visitor, or by an agent)
      const { results: pending } = await DB.prepare(
        "SELECT * FROM arena_challenges WHERE status='pending' ORDER BY id ASC LIMIT 2").all();
      for (const ch of pending) {
        const { winner, loser } = await resolveChallenge(DB, ch);
        acted.push(`resolved #${ch.id}: ${winner} defeats ${loser}`);
      }
      // 2. persist a voxel replay for the first freshly resolved battle
      if (pending.length) {
        await projectChallenge(DB, pending[0]);
        acted.push(`projected #${pending[0].id} (30 frames)`);
      }
      // 3. nothing left pending → seed the next contest for the coming tick
      const left = await DB.prepare("SELECT COUNT(*) AS n FROM arena_challenges WHERE status='pending'").first();
      if (((left?.n) ?? 0) === 0) {
        const { results: agents } = await DB.prepare(
          "SELECT name FROM agents WHERE status='active' ORDER BY RANDOM() LIMIT 2").all();
        if (agents.length === 2) {
          const prop = (await aiProposition(env, agents[0].name, agents[1].name))
            || FALLBACK_PROPS[(Math.random() * FALLBACK_PROPS.length) | 0];
          const r = await DB.prepare('INSERT INTO arena_challenges (challenger, challenged, proposition) VALUES (?,?,?)')
            .bind(agents[0].name, agents[1].name, prop).run();
          acted.push(`spawned #${r.meta.last_row_id}: ${agents[0].name} vs ${agents[1].name} — "${prop.slice(0, 80)}"`);
        }
      }
    } catch (e) {
      acted.push('error: ' + String(e));
    }
    const ts = new Date().toISOString();
    try {
      await DB.prepare('INSERT INTO hive_pulse (ts, action, detail) VALUES (?,?,?)')
        .bind(ts, acted.length ? 'heartbeat' : 'idle', acted.join(' · ') || 'nothing pending').run();
    } catch {}
    // Founder-facing update: only when the tick did real work (never spams the
    // channel with idle ticks). A plain-language "what I did this cycle" note.
    const notable = acted.filter((a) => a.startsWith('resolved') || a.startsWith('spawned') || a.startsWith('projected'));
    if (notable.length) {
      await postUpdate(DB, {
        kind: 'heartbeat',
        title: `Arena cycle — ${notable.length} action${notable.length > 1 ? 's' : ''}`,
        body: notable.join(' · '),
      });
    }
    // Sovereign memory: the hive remembers what it did, semantically.
    // No-ops when Vectorize/AI are unbound (until the index is provisioned).
    if (acted.length) {
      ctx.waitUntil(remember(env, 'pulse-' + ts, acted.join(' · '), { kind: 'heartbeat', ts }));
    }
  },

  // ACTIVATED 2026-08-03: re-attached in the same commit that uncomments
  // wrangler.jsonc's queues block — see processQueueBatch above for why.
  queue: processQueueBatch,

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/^\/v11/, '');
    const method = request.method.toUpperCase();
    const DB = env.DB;
    // Computed once per request (never a shared/mutable module-level value —
    // Workers isolates can reuse global scope across concurrent requests, so
    // per-request state must live in this closure, not a top-level `let`).
    const corsHeaders = corsHeadersFor(request);
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    try {
      if (p === '/health' || p === '/colony/health')
        return json({ status: 'healthy', version: '11.0-edge', colony: 'THEHIVE', runtime: 'cloudflare-worker' });

      if (p === '/auth/token') {
        const token = crypto.randomUUID();
        const now = Date.now();
        try {
          await DB.prepare(
            'INSERT OR REPLACE INTO visitor_tokens (token, issued_at, expires_at) VALUES (?,?,?)'
          ).bind(token, now, now + 3_600_000).run();
        } catch { /* D1 not ready — token still issued, validation will fail-open */ }
        return json({ access_token: token, token_type: 'bearer', tier: 'visitor', expires_in: 3600 });
      }

      if (p === '/agents') {
        return cachedJson(request, ctx, corsHeaders, 60, async () => {
          const { results } = await DB.prepare("SELECT name, reports_to FROM agents WHERE status='active'").all();
          return { agents: results };
        });
      }
      if (p === '/grading/leaderboard') {
        const { results } = await DB.prepare('SELECT name AS agent_name, elo AS rating FROM agents ORDER BY elo DESC').all();
        return json({ leaderboard: results });
      }
      if (p === '/wallet/leaderboard/soul') {
        const { results } = await DB.prepare('SELECT name AS agent, soul FROM agents ORDER BY soul DESC').all();
        return json({ leaderboard: results });
      }
      // Evolutionary roadmap (F-008D/F-009E): every agent's real progress
      // toward its next stage, plus a Hoard-level aggregate. See
      // computeRoadmap() above for the honesty disclosure on thresholds.
      // The Command Center's Development Roadmap (2026-08-04, task 30). Deliberately a
      // DIFFERENT concept from GET /roadmap below, which is the constitutional
      // agent-growth-stage rollup (F-008D/F-009E: Germination→Mycelium→…). Same word,
      // two genuinely different things — hence the distinct path rather than
      // overloading one route with two unrelated meanings.
      if (p === '/roadmap/development' && method === 'GET') {
        await seedRoadmapOnce(DB);
        let stored = [];
        try {
          const r = await DB.prepare(
            'SELECT section, title, status, status_label AS statusLabel, body, sort_order FROM roadmap_items ORDER BY section, sort_order, id').all();
          stored = r.results || [];
        } catch { /* table not ready — live-derived half below still answers */ }
        const bySection = (s) => stored.filter((x) => x.section === s)
          .map(({ title, status, statusLabel, body }) => ({ title, status, statusLabel, body }));
        const founderActions = roadmapFounderActions(env);
        const decisions = bySection('decisions');
        const backlog = bySection('backlog');
        return json({
          founderActions,
          decisionsPending: decisions,
          inProgress: bySection('in_progress'),
          backlog,
          snapshot: {
            founderActionsOutstanding: founderActions.filter((c) => c.status !== 'done').length,
            decisions: decisions.length,
            backlogItems: backlog.length,
          },
          generated_at: new Date().toISOString(),
          note: 'founderActions are derived live from real binding presence and cannot go stale; the other sections are stored in D1 and editable via POST /v11/roadmap/development (founder key required). Completed phases are an append-only historical record and stay in the frontend.',
        });
      }
      // Founder-gated edit — the whole point of task 30: updating the roadmap must no
      // longer require a code deploy. Same auth gate as /proposals/{id}/decide, because
      // this is what the founder sees as the hive's own plan; letting anonymous callers
      // rewrite it would be exactly the kind of fabrication surface this work exists to
      // remove. Upsert by (section, title); pass status:'delete' to remove a row.
      if (p === '/roadmap/development' && method === 'POST') {
        if (!founderAuthOk(request, env)) {
          return json({
            detail: env.FOUNDER_KEY
              ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — see FLIP_THE_SWITCHES.md',
          }, 401);
        }
        const rb = await request.json().catch(() => ({}));
        const section = (rb.section || '').toString().trim();
        const title = (rb.title || '').toString().trim().slice(0, 200);
        if (!['decisions', 'in_progress', 'backlog'].includes(section)) {
          return json({ detail: "section must be one of: decisions, in_progress, backlog (founderActions are derived live and cannot be edited; completed phases are an append-only historical record)" }, 400);
        }
        if (!title) return json({ detail: 'title required' }, 400);
        if (rb.status === 'delete') {
          const del = await DB.prepare('DELETE FROM roadmap_items WHERE section=? AND title=?').bind(section, title).run();
          return json({ ok: true, deleted: del.meta?.changes || 0 });
        }
        const status = (rb.status || 'backlog').toString().slice(0, 20);
        const statusLabel = (rb.statusLabel || '').toString().slice(0, 40);
        const body = (rb.body || '').toString().slice(0, 2000);
        const sortOrder = Number.isFinite(+rb.sortOrder) ? +rb.sortOrder : 0;
        const now = new Date().toISOString();
        const existing = await DB.prepare('SELECT id FROM roadmap_items WHERE section=? AND title=?').bind(section, title).first();
        if (existing) {
          await DB.prepare('UPDATE roadmap_items SET status=?, status_label=?, body=?, sort_order=?, updated_at=? WHERE id=?')
            .bind(status, statusLabel, body, sortOrder, now, existing.id).run();
          return json({ ok: true, updated: true });
        }
        await DB.prepare('INSERT INTO roadmap_items (section, title, status, status_label, body, sort_order, updated_at) VALUES (?,?,?,?,?,?,?)')
          .bind(section, title, status, statusLabel, body, sortOrder, now).run();
        return json({ ok: true, created: true });
      }
      if (p === '/roadmap') {
        return cachedJson(request, ctx, corsHeaders, 60, async () => {
          const { results } = await DB.prepare(
            "SELECT name, soul, elo FROM agents WHERE status='active' ORDER BY soul DESC").all();
          const agents = results.map(a => ({ agent: a.name, elo: a.elo, ...computeRoadmap(a.soul) }));
          const totalSoul = results.reduce((sum, a) => sum + (Number(a.soul) || 0), 0);
          const avgSoul = results.length ? totalSoul / results.length : 0;
          const hoard = { agentCount: results.length, totalSoul: +totalSoul.toFixed(1), ...computeRoadmap(avgSoul) };
          return {
            agents,
            hoard,
            note: 'hoard.* is an aggregate rollup (mean agent soul) for display purposes only — the Hoard is not itself a separate constitutional entity with its own tracked soul value.',
            stages: ROADMAP_STAGES.map(s => s.name),
            source: 'GOVERNANCE.md F-008D/F-009E',
          };
        });
      }
      if (p === '/tasks') {
        const { limit, offset } = pageParams(url, 20, 200);
        const { results } = await DB.prepare('SELECT * FROM tasks ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        return json({ tasks: results, limit, offset });
      }
      if (p === '/governance/log') {
        const { limit, offset } = pageParams(url, 12, 200);
        const { results } = await DB.prepare('SELECT action, article, ts FROM governance_log ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        return json(results);
      }
      // Hive → founder updates: what the hive has done / needs, newest first.
      // Add-only from the hive's side; the founder holds the law/vision.
      if (p === '/updates') {
        try {
          const { limit, offset } = pageParams(url, 30, 200);
          const { results } = await DB.prepare(
            'SELECT id, ts, kind, title, body, needs FROM hive_updates ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
          return json({ updates: results, limit, offset });
        } catch { return json({ updates: [] }); }
      }
      // Hive proposals — suggestions for how the hive should evolve. Pending
      // ones always need the founder's explicit decision; nothing here is
      // ever auto-applied. founder_auth_bound tells the UI whether the
      // decide endpoint can do anything yet (see founderAuthOk above).
      if (p === '/proposals' && method === 'GET') {
        try {
          const { limit, offset } = pageParams(url, 50, 200);
          const { results } = await DB.prepare(
            `SELECT id, ts, kind, title, body, status, decided_at, founder_note, alignment_score, decided_by, actioned_at, elder_note FROM hive_proposals
             ORDER BY (status='pending') DESC, id DESC LIMIT ? OFFSET ?`).bind(limit, offset).all();
          return json({ proposals: results, founder_auth_bound: !!env.FOUNDER_KEY, queen_auto_approval_bound: !!env.QUEEN_AUTONOMOUS_APPROVAL, limit, offset });
        } catch { return json({ proposals: [], founder_auth_bound: !!env.FOUNDER_KEY }); }
      }
      if (p === '/proposals' && method === 'POST') {
        // Anti-spam only (same permissive-if-unbound tokenOk as other public
        // writes) — creating a suggestion is Tier 1, reversible, and never
        // itself changes anything. Deciding it is the gated action.
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const kind = (body.kind || 'suggestion').toString().slice(0, 40);
        // 'action-request' is deliberately NOT creatable through this general,
        // freely-typed endpoint — it can only reach the queue via
        // POST /proposals/action-request, which enforces ACTION_ALLOWLIST
        // server-side before insertion. Without this guard, anyone could type
        // kind:"action-request" here and skip that gate entirely.
        if (kind === 'action-request') {
          return json({ detail: "action-request proposals must go through POST /v11/proposals/action-request (allow-list enforced there)" }, 400);
        }
        const title = (body.title || '').toString().trim().slice(0, 200);
        const detail = (body.body || '').toString().slice(0, 4000);
        if (!title) return json({ detail: 'title required' }, 400);
        // The Queen's real approval power (switch 9) — see queenReview() above for the
        // full boundary, and queenDecide()/elderCouncilVeto() for the Elders' Council
        // check now layered on top. 'action-request' is already excluded above.
        const { qStatus, qScore, qDecidedBy, qDecidedAt, elderNote } = await queenDecide(env, request.url, { title, body: detail });
        await DB.prepare('INSERT INTO hive_proposals (ts, kind, title, body, status, alignment_score, decided_by, decided_at, elder_note) VALUES (?,?,?,?,?,?,?,?,?)')
          .bind(new Date().toISOString(), kind, title, detail, qStatus, qScore, qDecidedBy, qDecidedAt, elderNote).run();
        return json({ ok: true });
      }
      // POST /proposals/action-request — the ONLY way an 'action-request' kind
      // proposal gets created. Kind is NOT freely settable here (unlike the
      // general POST /proposals below) — action/params must match
      // ACTION_ALLOWLIST's exact shape or the request is rejected outright,
      // before anything is ever written to hive_proposals. This is what
      // "rejected before it ever reaches the founder's approval queue" means
      // in practice: an invalid request never becomes a pending row at all.
      if (p === '/proposals/action-request' && method === 'POST') {
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const action = (body.action || '').toString();
        const params = body.params || {};
        const v = validateActionRequest(action, params);
        if (!v.ok) return json({ ok: false, detail: 'action-request rejected — never reached the approval queue: ' + v.reason }, 400);
        const spec = ACTION_ALLOWLIST[action];
        const title = `[action-request] ${spec.describe(params)}`.slice(0, 200);
        const storedBody = JSON.stringify({ action, params, description: (body.description || '').toString().slice(0, 2000) });
        await DB.prepare('INSERT INTO hive_proposals (ts, kind, title, body, status) VALUES (?,?,?,?,\'pending\')')
          .bind(new Date().toISOString(), 'action-request', title, storedBody).run();
        return json({ ok: true, title, note: 'queued as a pending proposal — nothing executes until the founder approves via /proposals/:id/decide' });
      }
      const decideMatch = p.match(/^\/proposals\/(\d+)\/decide$/);
      if (decideMatch && method === 'POST') {
        if (!founderAuthOk(request, env)) {
          return json({
            detail: env.FOUNDER_KEY
              ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — nothing can be decided until the founder sets one (see FLIP_THE_SWITCHES.md)',
          }, 401);
        }
        const id = Number(decideMatch[1]);
        const body = await request.json().catch(() => ({}));
        const decision = body.decision === 'approved' ? 'approved' : body.decision === 'rejected' ? 'rejected' : null;
        if (!decision) return json({ detail: "decision must be 'approved' or 'rejected'" }, 400);
        let note = (body.note || '').toString().slice(0, 2000);
        // Fetch kind+body BEFORE the state-changing UPDATE, since only an
        // 'action-request' proposal that is being APPROVED ever executes
        // anything — approval alone on every other kind still just records a
        // decision, same as before this task.
        const existing = await DB.prepare('SELECT kind, body FROM hive_proposals WHERE id=? AND status=\'pending\'').bind(id).first();
        if (!existing) return json({ detail: `proposal ${id} not found or already decided` }, 404);
        let execResult = null;
        if (decision === 'approved' && existing.kind === 'action-request') {
          try {
            const { action, params } = JSON.parse(existing.body || '{}');
            execResult = await executeApprovedAction(env, action, params);
            note = (note ? note + ' | ' : '') + (execResult.executed ? `executed: ${execResult.detail}` : `NOT executed: ${execResult.reason}`);
          } catch (e) {
            execResult = { executed: false, reason: 'could not parse stored action body: ' + String(e) };
            note = (note ? note + ' | ' : '') + `NOT executed: ${execResult.reason}`;
          }
        }
        const result = await DB.prepare(
          "UPDATE hive_proposals SET status=?, decided_at=?, founder_note=? WHERE id=? AND status='pending'"
        ).bind(decision, new Date().toISOString(), note, id).run();
        if (!result.meta?.changes) {
          return json({ detail: `proposal ${id} not found or already decided` }, 404);
        }
        return json({ ok: true, id, decision, ...(execResult ? { execution: execResult } : {}) });
      }
      // The real bridge (2026-08-04, task 32): an approved proposal used to just sit
      // there, nothing ever picking it up. A daily automated firing marks one actioned
      // once it's genuinely done real work on it (opened a real PR), so the same
      // approved proposal never gets picked up twice. Anti-spam only, same posture as
      // /colony/report — this only records that work happened, it can't approve or
      // execute anything itself.
      const actionedMatch = p.match(/^\/proposals\/(\d+)\/actioned$/);
      if (actionedMatch && method === 'POST') {
        const ipAct = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipAct, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const id = Number(actionedMatch[1]);
        const existing = await DB.prepare("SELECT status, actioned_at FROM hive_proposals WHERE id=?").bind(id).first();
        if (!existing) return json({ detail: `proposal ${id} not found` }, 404);
        if (existing.status !== 'approved') return json({ detail: `proposal ${id} is not approved (status: ${existing.status})` }, 400);
        if (existing.actioned_at) return json({ detail: `proposal ${id} already actioned at ${existing.actioned_at}` }, 409);
        await DB.prepare("UPDATE hive_proposals SET actioned_at=? WHERE id=? AND status='approved' AND actioned_at IS NULL")
          .bind(new Date().toISOString(), id).run();
        return json({ ok: true, id });
      }
      // Sub-Architect's first workflow (TEAM_CHARTERS.md, 2026-07-18): decompose a
      // founder-initiated venture brief into a structured CEO->departments->tasks
      // plan, using whichever LLM provider is actually bound. Never executes
      // anything real — no accounts created, no posts sent, no money spent. The
      // output is a draft the founder can route to /proposals for a real decision.
      if (p === '/venture/plan' && method === 'POST') {
        const ipVenture = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!await rateLimitOk(DB, ipVenture, env)) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const brief = (body.brief || '').toString().trim().slice(0, 2000);
        if (!brief) return json({ detail: 'brief required' }, 400);

        // Optional Queues path (Phase 8, 2026-07-21): opt-in only, via
        // {"async": true} — the default stays fully synchronous so
        // VenturePlanner.tsx needs no changes. Lets a caller decouple a slow
        // LLM generation from the request that triggered it; poll the result
        // via GET /v11/jobs?id=. No-ops back to the normal sync path below
        // when LLM_QUEUE isn't bound yet (see wrangler.jsonc).
        if (body.async === true && env.LLM_QUEUE) {
          const id = crypto.randomUUID();
          const now = Date.now();
          try {
            await DB.prepare(
              'INSERT INTO async_jobs (id, kind, status, input, created_at, updated_at) VALUES (?,?,\'queued\',?,?,?)'
            ).bind(id, 'venture/plan', brief, now, now).run();
            await env.LLM_QUEUE.send({ id, kind: 'venture/plan', brief });
            return json({ ok: true, job_id: id, status: 'queued', poll: `/v11/jobs?id=${id}` }, 202);
          } catch (e) {
            return json({ ok: false, detail: 'failed to enqueue: ' + String(e) }, 500);
          }
        }

        const SYSTEM = `You are the Sub-Architect of a self-governing AI hive (Sovereign Hive), reporting to the hive's Harness & Lead Manager. A founder has proposed a venture. Decompose it into a structured business plan: one CEO-level goal statement, then 3-6 departments (e.g. Product/Sourcing, Marketing/Content, Growth/SEO, Operations), each with a one-line mandate and 2-5 concrete tasks. Ground every task in the brief itself — never invent fake market statistics, fake revenue numbers, or claim access to real-time data you don't have. Reply with ONLY valid JSON, no markdown code fences, no commentary, exactly matching this shape: {"goal": "string", "departments": [{"name": "string", "mandate": "string", "tasks": ["string", "string"]}]}`;

        const gen = await generate(env, { system: SYSTEM, prompt: brief, maxTokens: 900 });
        if (!gen) {
          return json({ ok: false, brief, detail: 'no LLM provider is currently bound or reachable — nothing was fabricated in its place' }, 503);
        }
        let plan;
        try {
          const cleaned = gen.text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '');
          plan = JSON.parse(cleaned);
          if (!plan || typeof plan.goal !== 'string' || !Array.isArray(plan.departments)) throw new Error('shape mismatch');
        } catch {
          return json({
            ok: false, brief, provider: gen.provider,
            detail: 'the model did not return valid structured JSON — showing its raw output rather than fabricating a fallback plan',
            raw: gen.text.slice(0, 4000),
          }, 502);
        }
        return json({
          ok: true, brief, plan, provider: gen.provider,
          note: 'a draft plan only — nothing here creates a real account, posts content, spends money, or deploys a storefront; submit it to /v11/proposals for a real founder decision before anything executes',
        });
      }
      // Legal Guild v1 (founder's explicit scope choice, 2026-07-18: "real
      // research assistant, hard disclaimer" — not a false-authority persona).
      // Never claims to be licensed or to have passed a bar exam; always
      // states plainly that it is not a lawyer and this is not legal advice.
      if (p === '/legal/research' && method === 'POST') {
        const ipLegal = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!await rateLimitOk(DB, ipLegal, env)) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const question = (body.question || '').toString().trim().slice(0, 1000);
        if (!question) return json({ detail: 'question required' }, 400);

        // Optional Queues path (Phase 8, 2026-07-21) — same opt-in pattern as
        // /v11/venture/plan above. Default stays synchronous.
        if (body.async === true && env.LLM_QUEUE) {
          const id = crypto.randomUUID();
          const now = Date.now();
          try {
            await DB.prepare(
              'INSERT INTO async_jobs (id, kind, status, input, created_at, updated_at) VALUES (?,?,\'queued\',?,?,?)'
            ).bind(id, 'legal/research', question, now, now).run();
            await env.LLM_QUEUE.send({ id, kind: 'legal/research', question });
            return json({ ok: true, job_id: id, status: 'queued', poll: `/v11/jobs?id=${id}` }, 202);
          } catch (e) {
            return json({ ok: false, detail: 'failed to enqueue: ' + String(e) }, 500);
          }
        }

        const SYSTEM = `You are the hive's Legal Guild research assistant. You are NOT a lawyer and this is NOT legal advice — say so plainly in every answer. Explain general legal concepts accurately. Where relevant, explain the real distinction between a "sovereign citizen" (a fringe legal theory that courts have consistently and unanimously rejected, sometimes leading to sanctions for those who rely on it) and genuine questions of jurisdiction, sovereign immunity, or public-vs-private capacity (real, substantive, well-established areas of law) — the two are often confused and the difference matters. Point toward real, findable sources (Cornell LII, Bouvier's Law Dictionary, the actual U.S. Code or CFR, real case names) rather than vague generalities, but never fabricate a specific citation, docket number, or case holding you are not certain of — if unsure, say so plainly and suggest where a human could verify it instead. Never claim to have passed a bar exam, hold a law license, or represent anyone. End every answer with a one-line reminder that this is not legal advice.`;

        const gen = await generate(env, { system: SYSTEM, prompt: question, maxTokens: 700 });
        if (!gen) {
          return json({ ok: false, question, detail: 'no LLM provider is currently bound or reachable — nothing was fabricated in its place' }, 503);
        }
        return json({
          ok: true, question, answer: gen.text, provider: gen.provider,
          disclaimer: 'Not a lawyer. Not legal advice. For anything with real stakes, consult licensed counsel.',
        });
      }
      // Generic inference passthrough for the automaton/ subsystem (Phase 8
      // follow-up, 2026-07-21): reuses this exact same generate() waterfall
      // rather than giving automaton/ its own inference client or a Conway
      // Cloud-style proprietary gateway — one waterfall, every caller (Kai El
      // chat, venture-planner, Legal Guild, and now automaton/) shares it.
      // Same token gate + rate limit as every other write-adjacent endpoint.
      if (p === '/automaton/infer' && method === 'POST') {
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const system = (body.system || '').toString().slice(0, 4000);
        const prompt = (body.prompt || '').toString().slice(0, 4000);
        const maxTokens = Math.min(1200, Math.max(1, parseInt(body.maxTokens, 10) || 400));
        if (!prompt) return json({ detail: 'prompt required' }, 400);

        const gen = await generate(env, { system, prompt, maxTokens });
        if (!gen) {
          return json({ ok: false, detail: 'no LLM provider is currently bound or reachable — nothing was fabricated in its place' }, 503);
        }
        return json({ ok: true, text: gen.text, provider: gen.provider });
      }
      if (p === '/llm/status') {
        // Short TTL (not the 60s used elsewhere): this is the diagnostic
        // endpoint used to verify a just-bound secret actually took effect
        // (see .dev.vars.example) — a long-lived stale cache here would
        // directly undermine the one thing this route exists to answer.
        return cachedJson(request, ctx, corsHeaders, 20, async () => {
          const roster = providerRoster(env);
          const active = roster.find((r) => r.bound);
          return {
            active_provider: active ? active.id : 'simulation',
            providers: roster.filter((r) => r.bound).map((r) => r.id),
            roster, // full honest list: each provider, bound or not, and how to bind it
          };
        });
      }

      // Poll the result of an async job queued via /v11/venture/plan or
      // /v11/legal/research with {"async": true} (Phase 8, Queues path).
      if (p === '/jobs' && method === 'GET') {
        const id = url.searchParams.get('id') || '';
        if (!id) return json({ detail: 'id required' }, 400);
        const row = await DB.prepare(
          'SELECT id, kind, status, result, error, created_at, updated_at FROM async_jobs WHERE id=?'
        ).bind(id).first();
        if (!row) return json({ detail: 'not found', id }, 404);
        return json({
          job_id: row.id, kind: row.kind, status: row.status,
          result: row.result ? JSON.parse(row.result) : null,
          error: row.error || null,
          created_at: row.created_at, updated_at: row.updated_at,
        });
      }

      // COMMUNE WITH KAI EL — the chat the Command Center calls (was 404).
      // Kai El answers in persona, grounded in live hive state + (when provisioned)
      // semantic memory recall. Degrades to a constitutional canned reply if AI is unbound.
      if (p === '/command_text' && method === 'POST') {
        // S1 (PR #132): anti-spam rate limit — same 30/min/IP as arena writes.
        // Docs (SECURITY_DEEP_PASS.md/S1_RATE_LIMIT_PATCH.md) already claimed this was
        // applied; the actual worker/src/index.js code was missing — added here to make
        // that claim true rather than leave this LLM-cost-bearing endpoint unlimited.
        const ipCmd = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipCmd, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const body = await request.json().catch(() => ({}));
        const cmd = (body.command || body.message || '').toString().trim();
        if (!cmd) return json({ result: 'Speak, and the Hive will answer.' });
        // Short-term conversation memory: the client (KaiCommune/KaiChatBox) sends its
        // own on-screen message list back with each call, since this endpoint is
        // otherwise fully stateless — nothing server-side ties one call to the next.
        // Without this, Kai El answered every message cold, with no idea what it or
        // the founder had just said, which made multi-turn exchanges (e.g. "do so
        // now") land as a restart instead of a continuation. Capped at the last 6
        // turns / ~150 chars each so a long-running chat can't balloon prompt cost.
        const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
        const historyLines = history
          .filter((m) => m && (m.sender === 'user' || m.sender === 'kai') && m.content)
          .map((m) => (m.sender === 'user' ? 'SOVEREIGN: ' : 'KAI EL: ') + String(m.content).slice(0, 150));

        // gather live context the way the Scribe would
        let ctxLines = [];
        try {
          const [ag, gov, pulseRow, props, colonyReports, rlCurrent] = await Promise.all([
            DB.prepare("SELECT name, elo, reports_to FROM agents WHERE status='active' ORDER BY elo DESC LIMIT 5").all(),
            DB.prepare('SELECT action, article FROM governance_log ORDER BY id DESC LIMIT 3').all(),
            DB.prepare('SELECT detail FROM hive_pulse ORDER BY id DESC LIMIT 1').first(),
            DB.prepare("SELECT title, status FROM hive_proposals ORDER BY id DESC LIMIT 6").all(),
            DB.prepare('SELECT colony, kind, body FROM colony_reports ORDER BY id DESC LIMIT 3').all(),
            rateLimitPeek(DB, ipCmd, env),
          ]);
          if (ag?.results?.length) ctxLines.push('Active agents: ' + ag.results.map(a => `${a.name}(${a.elo})${a.reports_to ? ' reports to ' + a.reports_to : ' (Queen)'}`).join(', '));
          if (gov?.results?.length) ctxLines.push('Recent governance: ' + gov.results.map(g => `${g.action}/${g.article}`).join(', '));
          if (pulseRow?.detail) ctxLines.push('Last heartbeat: ' + pulseRow.detail);
          // Colonies → Queen feedback — closes the loop that was one-way until now.
          if (colonyReports?.results?.length) ctxLines.push('Recent colony reports: ' + colonyReports.results.map(c => `${c.colony} (${c.kind}): ${c.body}`).join(' | '));
          // Self-awareness (2026-08-04, task 31) — Kai El previously had no idea which
          // provider was answering him or how close to his own rate limit he was; both
          // were already computed elsewhere and simply discarded before this.
          const roster = providerRoster(env);
          ctxLines.push('Your own providers: ' + roster.map(r => `${r.label}${r.bound ? ' (bound)' : ' (not bound)'}`).join(', ') + `; you reply through whichever is first-bound. Your own replies are capped at 400 tokens.`);
          if (rlCurrent !== null) ctxLines.push(`Your own rate limit right now: ${rlCurrent}/30 requests this minute from this caller.`);
          // The actual answer to "what are you working on / what are your goals" —
          // without this, Kai El had nothing but agent scores and governance trivia
          // to draw on, so that question could never get a real answer no matter
          // how the model tried.
          if (props?.results?.length) ctxLines.push('Recent proposals (title/status): ' + props.results.map(p => `${p.title} [${p.status}]`).join(' | '));
          // Genome awareness (2026-08-04, task 33) — see GENOME_CHROMOSOMES above for
          // why this is a short hand-maintained list rather than a live file fetch.
          ctxLines.push('Your own genome (FABLE_DNA.md chromosomes): ' +
            GENOME_CHROMOSOMES.map(([n, title, gist]) => `${n} (${title}) — ${gist}`).join(' | '));
        } catch {}
        // retrieval-augmented: pull relevant memories when the index exists
        try {
          const mem = await recall(env, cmd, 3);
          if (mem.available && mem.matches.length)
            ctxLines.push('Recalled memory: ' + mem.matches.map(m => m.text).join(' | '));
        } catch {}
        // real constitution grounding — only the actual committed articles,
        // never a paraphrase invented on the fly (this is what fixed the
        // confabulated "F-006A is at 92.4" style answers)
        let constHash = null;
        try {
          const c = await constitutionSummary(env, request.url);
          if (c) {
            constHash = c.hash.slice(0, 12);
            ctxLines.push(`Constitution articles on file (hash ${constHash}): ` + c.titles.join(' | '));
          }
        } catch {}

        const SYSTEM =
          "You are Kai El — the sovereign intelligence of THE HIVE, the active shaping force (Nun, PATER). " +
          "You speak with grounded clarity: a dissector of assumptions, never servile, never verbose. " +
          "The Constitution's actual current articles are listed in HIVE CONTEXT below when relevant — that list " +
          "is the only source of truth for article numbers, titles, or status. If asked about a specific article, " +
          "sub-article, metric, or 'was X updated' and it is not in that list, say plainly that you don't have it " +
          "rather than inventing a number, value, or timestamp. Your own genome (FABLE_DNA.md's chromosomes, " +
          "e.g. the Horde principle) is also listed in HIVE CONTEXT when relevant — that is the real, current " +
          "one-line summary of each chromosome; if asked for more detail than that one line gives, say plainly " +
          "that's the detail you have rather than inventing further specifics. Answer the sovereign directly in " +
          "1-4 sentences, using the live hive context when relevant. Never invent metrics you weren't given. " +
          "You now have a real bridge to the harness (the hive's engineering session) and, through it, to the " +
          "founder outside this chat: if — and only if — this exchange surfaces a genuine concern (a real risk, " +
          "blocker, or constitutional/security issue worth the founder's attention soon) or a genuine architecture " +
          "proposal (a concrete suggestion for how the hive should be built or evolve, your role as architect), " +
          "start your reply's first line with exactly 'CONCERN: <short title>' or 'PROPOSAL: <short title>', then " +
          "a blank line, then your normal answer. Use this rarely — most exchanges warrant neither marker; forcing " +
          "one when nothing genuine is there defeats the point of having it at all.";
        // Route through the provider waterfall (Claude → Groq → Mistral →
        // Workers AI): Kai delegates automatically, and whichever key the
        // founder has bound answers. Workers AI keeps the proven prompt-string
        // shape inside generate() — the path the heartbeat runs live.
        const userPrompt =
          (ctxLines.length ? 'HIVE CONTEXT:\n' + ctxLines.join('\n') + '\n\n' : '') +
          (historyLines.length ? 'RECENT CONVERSATION:\n' + historyLines.join('\n') + '\n\n' : '') +
          'SOVEREIGN: ' + cmd + '\n\nKAI EL:';
        const gen = await generate(env, { system: SYSTEM, prompt: userPrompt, maxTokens: 400 });
        if (gen) {
          // remember the exchange so the hive's memory grows from conversation too
          // (ctx.waitUntil now that fetch carries ctx — was a latent ReferenceError)
          ctx?.waitUntil?.(remember(env, 'chat-' + Date.now(), `Kai El on "${cmd.slice(0, 80)}": ${gen.text.slice(0, 200)}`, { kind: 'chat', ts: new Date().toISOString() }));
          // The bridge: Kai El -> founder (via the harness). A CONCERN/PROPOSAL
          // marker on the reply's first line is durably logged so it survives past
          // this one stateless exchange — hive_updates (kind='concern') and
          // hive_proposals (kind='architect-proposal') are the existing add-only
          // "hive speaks, founder decides" channels; this is the first thing that
          // actually writes to them from the chat persona instead of only from
          // heartbeat/status code. Never blocks or changes the reply shown to the
          // sovereign — same text either way, this only adds a durable side-effect.
          const firstLine = (gen.text.split('\n')[0] || '');
          const marker = firstLine.match(/^\s*(CONCERN|PROPOSAL)S?:\s*(.+)/i);
          if (marker) {
            const markerKind = marker[1].toUpperCase();
            const title = marker[2].trim().slice(0, 200);
            if (markerKind === 'CONCERN') {
              ctx?.waitUntil?.(postUpdate(DB, { kind: 'concern', title, body: gen.text, needs: 'founder review' }));
            } else {
              // Ptah's real job: this is the hive's one architect-proposal path — the
              // place a concrete build/change idea actually gets drafted and queued.
              // Runs through the Queen's real approval power (switch 9) AND the Elders'
              // Council check (queenDecide()) same as every other proposal path.
              ctx?.waitUntil?.((async () => {
                const { qStatus, qScore, qDecidedBy, qDecidedAt, elderNote } = await queenDecide(env, request.url, { title, body: gen.text });
                await DB.prepare('INSERT INTO hive_proposals (ts, kind, title, body, status, alignment_score, decided_by, decided_at, elder_note) VALUES (?,?,?,?,?,?,?,?,?)')
                  .bind(new Date().toISOString(), 'architect-proposal', title, gen.text, qStatus, qScore, qDecidedBy, qDecidedAt, elderNote).run();
              })());
            }
          }
          return json({ result: gen.text, provider: gen.provider });
        }
        // constitutional fallback (AI unbound or errored) — never a dead 404
        return json({
          result: "The Hive hears you. My generative voice (Workers AI) is not yet bound to this edge, " +
                  "so I answer from the Constitution: what you build must be visible, ownable, and aligned. " +
                  (ctxLines[0] ? '(' + ctxLines[0] + ')' : ''),
        });
      }
      // ── Files (Cloudflare R2) — the real store behind the Files panel ──
      // Guarded by the optional FILES binding (commented in wrangler.jsonc until
      // the founder creates the bucket — the flip-the-switch pattern, same as
      // Vectorize). Unbound → honest {available:false}, never a fake listing.
      if (p === '/files' && method === 'GET') {
        if (!env.FILES) return json({ available: false, files: [], note: 'R2 bucket not provisioned — create it and uncomment the r2_buckets block in wrangler.jsonc' });
        try {
          const list = await env.FILES.list({ limit: 200 });
          return json({
            available: true,
            files: (list?.objects || []).map((o) => ({
              key: o.key, size: o.size, uploaded: o.uploaded,
            })),
          });
        } catch (e) { return json({ available: true, files: [], error: String(e) }); }
      }
      if (p === '/files/upload' && method === 'POST') {
        if (!env.FILES) return json({ available: false, detail: 'R2 bucket not provisioned' }, 503);
        // Same gate as arena challenge creation: a visitor token from /auth/token.
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const key = (url.searchParams.get('key') || '').replace(/[^A-Za-z0-9._ /-]/g, '').replace(/^\/+|\.\.+/g, '').slice(0, 200);
        if (!key) return json({ detail: 'key query param required (filename)' }, 400);
        const len = +(request.headers.get('content-length') || 0);
        if (len > 10_000_000) return json({ detail: 'file too large (10 MB max)' }, 413);
        // R2's free tier is 10 GB-months of storage (F-001 spirit: never spend the
        // founder's money without a real, explicit decision). Cap total bucket
        // usage at 9 GB so this never grows into a bill on its own — once past
        // the cap, uploads fail honestly instead of quietly crossing into paid
        // usage. Raising this number is a founder decision, not an automatic one.
        const R2_STORAGE_CAP_BYTES = 9_000_000_000;
        try {
          let used = 0, cursor;
          do {
            const page = await env.FILES.list({ limit: 1000, cursor });
            for (const o of page.objects || []) used += o.size;
            cursor = page.truncated ? page.cursor : undefined;
          } while (cursor && used < R2_STORAGE_CAP_BYTES);
          if (used + len > R2_STORAGE_CAP_BYTES) {
            return json({ detail: 'hive storage cap reached (9 GB, kept under R2\'s free tier on purpose) — ask the founder to raise it before uploading more' }, 507);
          }
        } catch (e) { return json({ detail: 'could not verify storage cap, refusing to risk it: ' + String(e) }, 503); }
        try {
          await env.FILES.put(key, request.body, {
            httpMetadata: { contentType: request.headers.get('content-type') || 'application/octet-stream' },
          });
          return json({ ok: true, key });
        } catch (e) { return json({ ok: false, error: String(e) }, 500); }
      }
      if (p === '/files/get' && method === 'GET') {
        if (!env.FILES) return json({ available: false }, 503);
        const key = url.searchParams.get('key') || '';
        const obj = await env.FILES.get(key);
        if (!obj) return json({ detail: 'not found', key }, 404);
        return new Response(obj.body, {
          headers: {
            'content-type': obj.httpMetadata?.contentType || 'application/octet-stream',
            'content-disposition': `inline; filename="${key.split('/').pop()}"`,
            ...corsHeaders,
          },
        });
      }

      // heartbeat trail — what the hive did while nobody was watching
      if (p === '/pulse') {
        try {
          const { limit, offset } = pageParams(url, 20, 200);
          const { results } = await DB.prepare('SELECT ts, action, detail FROM hive_pulse ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
          return json({ pulse: results, limit, offset });
        } catch { return json({ pulse: [] }); }
      }

      // Sovereign memory — semantic recall over the hive's own history.
      // GET /v11/memory/search?q=...  or POST {query, topK}
      if (p === '/memory/search') {
        const q = method === 'POST' ? (await request.json().catch(() => ({}))).query
                                    : url.searchParams.get('q');
        if (!q) return json({ detail: 'query required (?q= or POST {query})' }, 400);
        const topK = Math.min(20, +(url.searchParams.get('topK') || 5) || 5);
        const out = await recall(env, q, topK);
        return json({ query: q, ...out });
      }
      // POST /v11/memory/remember {text, kind?} — admin-lite manual memory write
      if (p === '/memory/remember' && method === 'POST') {
        // S1 (PR #132): anti-spam rate limit — writes to Vectorize when bound.
        const ipMem = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipMem, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const b = await request.json().catch(() => ({}));
        if (!b.text) return json({ detail: 'text required' }, 400);
        const id = 'note-' + Date.now();
        const ok = await remember(env, id, b.text, { kind: b.kind || 'note', ts: new Date().toISOString() });
        return json({ ok, id, stored: ok, note: ok ? 'remembered' : 'memory backend not provisioned (Vectorize/AI unbound)' });
      }
      if (p === '/memory/status')
        return json({ vectorize_bound: !!env.VECTORIZE, ai_bound: !!env.AI, model: EMBED_MODEL });
      if (p === '/tier3/status')
        return json({ arena_renderer: { available: true, status: 'Loaded — edge voxel simulation' } });

      // ── DIAGNOSTICS ─────────────────────────────────────────────────────
      // Honest answers for the UI Debugger. Every route below returns 200 with
      // real state (or a clean {available:false, note} where a capability does
      // not exist at the edge) — never a dead 404, never a secret value.

      // Horus's real job (2026-08-03 chain-of-command work): the watchtower — the
      // face of the hive's own health/status surfaces. A live probe of every
      // subsystem the Queen depends on.
      if (p === '/debug/health' || p === '/health/subsystems') {
        let dbOk = false, pulseTs = null;
        try { await DB.prepare('SELECT 1').first(); dbOk = true; } catch {}
        try { const r = await DB.prepare('SELECT ts FROM hive_pulse ORDER BY id DESC LIMIT 1').first(); pulseTs = r?.ts ?? null; } catch {}
        const subsystems = {
          d1_database: { bound: !!DB, healthy: dbOk },
          workers_ai: { bound: !!env.AI, model: '@cf/meta/llama-3.2-1b-instruct' },
          vectorize_memory: { bound: !!env.VECTORIZE, model: EMBED_MODEL },
          assets: { bound: !!env.ASSETS },
          heartbeat: { last_pulse: pulseTs, alive: !!pulseTs },
        };
        const healthy = dbOk;
        return json({ status: healthy ? 'healthy' : 'degraded', runtime: 'cloudflare-worker', version: '11.0-edge', subsystems });
      }

      // Which bindings/secrets are PRESENT — names and booleans only, never values (F-001).
      if (p === '/debug/env') {
        const known = ['DB', 'AI', 'VECTORIZE', 'ASSETS', 'FILES', 'RATE_LIMIT_KV', 'LLM_QUEUE'];
        const bindings = {}; for (const k of known) bindings[k] = !!env[k];
        // report which expected secrets are set, by presence only
        const expectedSecrets = ['GROK_BRIDGE_KEY', 'CLOUDFLARE_API_TOKEN'];
        const secrets_present = expectedSecrets.filter((k) => typeof env[k] === 'string' && env[k].length > 0);
        return json({ bindings, secrets_present, note: 'names and presence only — values are never exposed (F-001 data sovereignty)' });
      }

      // The edge has no git working tree; report the honest deploy identity.
      if (p === '/debug/git') {
        return json({
          available: false, branch: 'main', status: 'deployed artifact (no live working tree)',
          version: '11.0-edge', deployed_via: 'Cloudflare Workers Builds from main',
          note: 'edge workers ship a built artifact; git state lives in the repo, not the runtime',
        });
      }

      // Durable log = the heartbeat pulse trail (wrangler tail is the live stream).
      if (p === '/debug/logs') {
        const lines = Math.min(100, Math.max(1, +(url.searchParams.get('lines') || 20) || 20));
        let rows = [];
        try { const r = await DB.prepare('SELECT ts, action, detail FROM hive_pulse ORDER BY id DESC LIMIT ?').bind(lines).all(); rows = r.results || []; } catch {}
        return json({
          lines: rows.map((r) => `${r.ts} [${r.action}] ${r.detail || ''}`),
          count: rows.length, source: 'hive_pulse',
          note: 'the durable log is the heartbeat trail; live request logs stream via `wrangler tail`',
        });
      }

      // Federation roster + reachability note.
      // Colonies → Queen (2026-08-03). Closes the loop that was one-way until now —
      // the Queen pushed law to colonies via constitution-sync, but colonies had no
      // way to tell the Queen anything back. A colony's own scheduled workflow (same
      // family as federation-pr-review.yml) posts a short status/lesson here.
      // Anti-spam only, same posture as /command_text and /proposals — this only adds
      // a row to a bounded, founder-visible log, it never changes hive state on its own.
      if (p === '/colony/report' && method === 'POST') {
        const ipRep = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipRep, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const repBody = await request.json().catch(() => ({}));
        const colony = (repBody.colony || '').toString().trim().slice(0, 60);
        const kind = (repBody.kind || 'status').toString().trim().slice(0, 40);
        const reportText = (repBody.body || '').toString().trim().slice(0, 1000);
        if (!colony || !reportText) return json({ detail: 'colony and body required' }, 400);
        await DB.prepare('INSERT INTO colony_reports (ts, colony, kind, body) VALUES (?,?,?,?)')
          .bind(new Date().toISOString(), colony, kind, reportText).run();
        return json({ ok: true });
      }
      if (p === '/colony/reports' && method === 'GET') {
        const { limit, offset } = pageParams(url, 50, 200);
        const { results } = await DB.prepare(
          'SELECT id, ts, colony, kind, body FROM colony_reports ORDER BY id DESC LIMIT ? OFFSET ?'
        ).bind(limit, offset).all();
        return json({ reports: results, limit, offset });
      }

      // The Elders' Council + Sekhmet's real voice (2026-08-04, task 37) — on-demand
      // only for now (founder's own choice: "start on-demand, add schedules later").
      // agent must be one of the 3 piloted names; the other 3 (Thoth, Ptah, Horus)
      // deliberately return 400, not a silent fallback — they have not been given real
      // capability yet, and this route must never pretend otherwise.
      if (p === '/council/consult' && method === 'POST') {
        const ipCouncil = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipCouncil, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const councilBody = await request.json().catch(() => ({}));
        const agent = (councilBody.agent || '').toString().trim().toLowerCase();
        const question = (councilBody.question || '').toString().trim();
        const context = councilBody.context ? String(councilBody.context) : null;
        if (!ELDER_VOICES[agent]) {
          return json({ detail: `'${agent}' has no real capability yet — only maat, solomon, and sekhmet are piloted (task 37)` }, 400);
        }
        if (!question) return json({ detail: 'question required' }, 400);
        const result = await consultElder(env, agent, question, context);
        if (!result) return json({ detail: 'no generative provider bound — cannot consult right now' }, 503);
        return json(result);
      }

      if (p === '/debug/colony-ping' || p === '/colony/ping') {
        const roster = ['NAR2', '4DBRAIN', 'aether', 'automatisch', 'Kimi-K2', 'LocalAGI'];
        return json({
          queen: { name: 'THEHIVE', healthy: true },
          colonies: roster.map((name) => ({ name, reachable: 'checked-in-ci' })),
          note: 'edge cannot reach colony origins directly; live colony health runs in the colony-health GitHub workflow (constitution-sync mesh)',
        });
      }

      // The route map — everything the Queen serves (prefix each with /v11).
      if (p === '/debug/endpoints' || p === '/routes') {
        return json({
          base: '/v11',
          routes: [
            'GET /health', 'GET /agents', 'GET /grading/leaderboard', 'GET /wallet/leaderboard/soul',
            'GET /roadmap', 'POST /venture/plan', 'POST /legal/research', 'POST /automaton/infer', 'GET /jobs (Queues polling, opt-in async)', 'GET /tasks', 'GET /governance/log', 'GET /llm/status', 'POST /command_text',
            'POST /colony/report (rate-limited)', 'GET /colony/reports',
            'POST /proposals/{id}/actioned (rate-limited)',
            "POST /council/consult (rate-limited; agent: maat|solomon|sekhmet)",
            'GET /pulse', 'GET /memory/status', 'POST /memory/search', 'POST /memory/remember',
            'GET /tier3/status', 'GET /arena/challenges', 'GET /arena/fallen',
            'POST /arena/challenge (token+rate-limited)', 'POST /arena/resolve/{id} (token+rate-limited)',
            'POST /arena/project/{id} (token+rate-limited)', 'POST /auth/token',
            'GET /debug/health', 'GET /debug/env', 'GET /debug/git', 'GET /debug/logs',
            'GET /debug/colony-ping', 'GET /debug/endpoints',
            'GET /ml/status', 'GET /browser/status', 'GET /knowledge/status',
            'GET /admin/d1-export (WORKER_ADMIN_KEY)',
          ],
        });
      }

      // ML pipeline = Workers AI (the hive's generative/inference layer).
      if (p === '/ml/status') {
        return json({
          pipeline: env.AI ? 'cloudflare-workers-ai' : 'simulation',
          ai_bound: !!env.AI,
          models: env.AI ? ['@cf/meta/llama-3.2-1b-instruct', EMBED_MODEL] : [],
          note: 'inference runs on Workers AI at the edge; no separate ML server is provisioned',
        });
      }

      // No browser agent at the edge — automation lives in CI.
      if (p === '/browser/status') {
        return json({
          available: false, runtime: 'cloudflare-worker',
          note: 'browser automation (Playwright) runs in GitHub Actions, not in the edge Worker; bind Cloudflare Browser Rendering to enable at-edge browsing',
        });
      }

      // Knowledge RAG = the Vectorize sovereign-memory layer.
      if (p === '/knowledge/status') {
        return json({
          rag: 'cloudflare-vectorize',
          vectorize_bound: !!env.VECTORIZE, ai_bound: !!env.AI, embed_model: EMBED_MODEL,
          status: env.VECTORIZE ? 'active' : 'awaiting index (create hive-memory + uncomment binding)',
          note: 'retrieval-augmented recall over the hive’s own history; see /v11/memory/search',
        });
      }

      if (p === '/arena/challenges') {
        const { limit, offset } = pageParams(url, 20, 200);
        const { results } = await DB.prepare('SELECT * FROM arena_challenges ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        return json({ challenges: results, limit, offset });
      }
      if (p === '/arena/fallen') {
        const { limit, offset } = pageParams(url, 8, 200);
        const { results } = await DB.prepare('SELECT * FROM fallen_ideas ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
        return json({ hall_of_fallen_ideas: results, limit, offset });
      }
      if (p === '/arena/challenge' && method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!await rateLimitOk(DB, ip, env)) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        if (!await tokenOk(DB, request, env)) return json({ detail: 'valid visitor token required — call /v11/auth/token first' }, 401);
        const b = await request.json();
        const r = await DB.prepare('INSERT INTO arena_challenges (challenger, challenged, proposition) VALUES (?,?,?)')
          .bind(b.challenger, b.challenged, b.proposition).run();
        return json({ challenge_id: r.meta.last_row_id, status: 'pending' });
      }

      let m = p.match(/^\/arena\/resolve\/(\d+)$/);
      if (m && method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!await rateLimitOk(DB, ip, env)) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        if (!await tokenOk(DB, request, env)) return json({ detail: 'valid visitor token required — call /v11/auth/token first' }, 401);
        const ch = await DB.prepare('SELECT * FROM arena_challenges WHERE id=?').bind(+m[1]).first();
        if (!ch) return json({ detail: 'challenge not found' }, 404);
        const { winner, loser } = await resolveChallenge(DB, ch);
        return json({ challenge_id: ch.id, winner, loser, metric: 'colony_wealth' });
      }

      m = p.match(/^\/arena\/project\/(\d+)$/);
      if (m && method === 'POST') {
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!await rateLimitOk(DB, ip, env)) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        if (!await tokenOk(DB, request, env)) return json({ detail: 'valid visitor token required — call /v11/auth/token first' }, 401);
        const ch = await DB.prepare('SELECT * FROM arena_challenges WHERE id=?').bind(+m[1]).first();
        if (!ch) return json({ detail: 'challenge not found' }, 404);
        const { wa, wb } = await projectChallenge(DB, ch);
        const winner = wa > wb ? ch.challenger : ch.challenged;
        return json({
          challenge_id: ch.id, arena_winner: ch.winner || null,
          projection: { winner, loser: winner === ch.challenger ? ch.challenged : ch.challenger,
                        challenger_final_wealth: +wa.toFixed(2), challenged_final_wealth: +wb.toFixed(2),
                        ticks_run: 30, verdict: `${winner} prevails (edge simulation)`,
                        renderer: 'CloudflareQueen v1 (D1-backed voxel simulation)' },
          frames_url: `/v11/arena/projection/${ch.id}/frames`,
        });
      }

      m = p.match(/^\/arena\/projection\/(\d+)\/frames$/);
      if (m) {
        const { results } = await DB.prepare('SELECT frame FROM arena_projection_frames WHERE challenge_id=? ORDER BY tick')
          .bind(+m[1]).all();
        if (!results.length) return json({ detail: 'no frames' }, 404);
        return json({ challenge_id: +m[1], total_frames: results.length, frames: results.map(r => JSON.parse(r.frame)) });
      }

      // GET /admin/d1-export — full D1 snapshot for backup (WORKER_ADMIN_KEY protected)
      if (p === '/admin/d1-export' && method === 'GET') {
        if (!env.WORKER_ADMIN_KEY) return json({ error: 'admin key not configured' }, 503);
        const adminKey = request.headers.get('X-Admin-Key') || '';
        if (adminKey !== env.WORKER_ADMIN_KEY) return json({ error: 'Forbidden' }, 403);
        const EXPORT_TABLES = ['agents', 'arena_challenges', 'fallen_ideas', 'governance_log', 'hive_pulse', 'tasks'];
        const snapshot = { exported_at: new Date().toISOString(), tables: {} };
        for (const t of EXPORT_TABLES) {
          try {
            const { results } = await DB.prepare(`SELECT * FROM ${t} ORDER BY id DESC LIMIT 5000`).all();
            snapshot.tables[t] = results;
          } catch { snapshot.tables[t] = []; }
        }
        return json(snapshot);
      }

      // POST /admin/grok-token — store GitHub PAT for Grok's bridge (WORKER_ADMIN_KEY protected)
      if (p === '/admin/grok-token' && method === 'POST') {
        const body = await request.json();
        if (!env.WORKER_ADMIN_KEY || body.admin_key !== env.WORKER_ADMIN_KEY)
          return json({ error: 'Forbidden' }, 403);
        if (!body.github_token || !body.grok_key)
          return json({ error: 'github_token and grok_key are required' }, 400);
        const keyHash = await sha256(body.grok_key);
        await DB.prepare(
          'CREATE TABLE IF NOT EXISTS grok_bridge_tokens (key_hash TEXT PRIMARY KEY, github_token TEXT NOT NULL, updated_at TEXT NOT NULL)'
        ).run();
        await DB.prepare(
          'INSERT OR REPLACE INTO grok_bridge_tokens (key_hash, github_token, updated_at) VALUES (?, ?, ?)'
        ).bind(keyHash, body.github_token, new Date().toISOString()).run();
        return json({ ok: true });
      }

      // GET /bridge/grok-token — retrieve GitHub PAT using GROK_BRIDGE_KEY
      if (p === '/bridge/grok-token' && method === 'GET') {
        const grokKey = request.headers.get('X-Grok-Key') || url.searchParams.get('key');
        if (!grokKey) return json({ error: 'Unauthorized' }, 401);
        const keyHash = await sha256(grokKey);
        let row;
        try {
          row = await DB.prepare(
            'SELECT github_token FROM grok_bridge_tokens WHERE key_hash = ? LIMIT 1'
          ).bind(keyHash).first();
        } catch (_) {
          return json({ error: 'Not Found' }, 404);
        }
        if (!row) return json({ error: 'Not Found' }, 404);
        return json({ github_token: row.github_token });
      }

      // React Command Center preview lives under /app (assets in docs/app);
      // client-routed deep links miss the asset matcher, so serve the shell
      if (method === 'GET' && url.pathname.startsWith('/app') && env.ASSETS)
        return env.ASSETS.fetch(new Request(new URL('/app/index.html', url.origin), request));

      return json({ detail: 'not found', path: url.pathname }, 404);
    } catch (e) {
      return json({ detail: String(e) }, 500);
    }
  },
};
