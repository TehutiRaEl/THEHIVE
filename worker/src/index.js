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

// FOUNDER_KEY moved from a classic per-Worker secret (wrangler secret put) to
// Cloudflare's Secrets Store 2026-08-08 at the founder's choice. A Secrets
// Store binding is an OBJECT with an async .get() method, not a plain
// string — resolveSecret() normalizes either shape to the real string value
// (or null), so this file never has to know which kind of binding it got.
// GROK_BRIDGE_KEY/CLOUDFLARE_API_TOKEN stay classic secrets for now; passing
// a plain string through unchanged means resolveSecret() is safe to use on
// all three uniformly (see /debug/env below).
//
// 2026-08-09: trims the resolved value. A real incident — the founder pasted
// a rotated FOUNDER_KEY that carried a trailing newline into both the GitHub
// secret and (separately) this panel's key field — turned "wrong password"
// into two confusing, differently-shaped failures (a curl header error on
// the CI side, "invalid or missing founder key" here) that were actually the
// same root cause. Trimming here means invisible whitespace can never again
// be the difference between a matching and non-matching key, on any path
// that reads this binding.
async function resolveSecret(value) {
  if (!value) return null;
  if (typeof value === 'object' && typeof value.get === 'function') {
    try {
      const v = await value.get();
      return v ? v.trim() || null : null;
    } catch { return null; }
  }
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function founderKeyBound(env) {
  return !!(await resolveSecret(env.FOUNDER_KEY));
}

// Founder-only gate for deciding hive proposals — deliberately the OPPOSITE
// default of tokenOk above. tokenOk fails OPEN when no admin key is set
// (fine for anti-spam on a chat message). Approving a hive-evolution
// proposal is a much higher-stakes action — "the founder said yes" must be
// verifiably true, so this fails CLOSED: with no FOUNDER_KEY secret bound,
// nothing can be approved or rejected at all, by anyone, rather than
// silently letting any visitor decide. See FLIP_THE_SWITCHES.md.
async function founderAuthOk(request, env) {
  const secret = await resolveSecret(env.FOUNDER_KEY);
  if (!secret) return false;
  const auth = request.headers.get('Authorization') || '';
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  return !!key && key === secret;
}

// ── Cloudflare Access — a second, key-free way for the founder's own browser to
// authenticate (2026-08-09) ────────────────────────────────────────────────
// FOUNDER_KEY (above) stays exactly as-is for CI (the three digest workflows) and
// as a browser fallback. This is purely additive: a founder who has logged into
// Cloudflare Access gets a signed JWT attached to every request automatically
// (the Cf-Access-Jwt-Assertion header), so their browser never has to carry or
// paste a shared secret again. See the /v11/founder/* routes for where this is
// used (that's the real, public path Access must protect — internally, route
// matching strips the /v11 prefix first, so this file's own `p === '/founder/...'`
// checks below look shorter than the URL a browser or Access policy sees), and
// the Access Application setup itself (Zero Trust dashboard) for how the founder
// provisions this — not something this Worker can configure on its own.
//
// atob() is a Workers global (also present in Node's test runner), used here
// rather than Buffer to keep this file portable between the two runtimes, same
// reasoning as this file's existing zero-dependency discipline.
function base64UrlToBytes(b64url) {
  const pad = (4 - (b64url.length % 4)) % 4;
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const raw = atob(b64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

// Access's signing keys rotate rarely — cached the same way cachedJson() caches
// everything else in this file (Workers Cache API), just keyed by the JWKS URL
// itself rather than an incoming request, since this fetch has nothing to do
// with any one caller.
const ACCESS_JWKS_CACHE_SECONDS = 3600;
async function fetchAccessJWKS(env, ctx) {
  const teamDomain = (env.ACCESS_TEAM_DOMAIN || '').toString().trim();
  if (!teamDomain) return null;
  const jwksUrl = `https://${teamDomain}/cdn-cgi/access/certs`;
  const cache = caches.default;
  const cacheKey = new Request(jwksUrl, { method: 'GET' });
  try {
    const hit = await cache.match(cacheKey);
    if (hit) return await hit.json();
  } catch { /* cache unavailable — fall through to a live fetch, never fatal */ }
  let r;
  try {
    r = await fetch(jwksUrl, { signal: AbortSignal.timeout(10000) });
  } catch { return null; }
  if (!r.ok) return null;
  const data = await r.json();
  const stored = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ACCESS_JWKS_CACHE_SECONDS}` },
  });
  ctx?.waitUntil?.(cache.put(cacheKey, stored).catch(() => {}));
  return data;
}

// Verifies a Cloudflare Access JWT end to end: signature against Access's own
// published keys, audience matches this specific Access Application, not
// expired, and the email claim matches the one allow-listed founder email.
// Every failure path returns null — fails CLOSED, identical philosophy to
// founderAuthOk() above, deliberately: a login system that guesses "probably
// fine" on a malformed or unprovisioned token would be strictly worse than the
// shared-secret model it's meant to improve on.
async function verifyAccessJWT(request, env, ctx) {
  try {
    const token = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(new TextDecoder().decode(base64UrlToBytes(headerB64)));
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));

    // Not provisioned yet (ACCESS_AUD/FOUNDER_EMAIL unset) — fail closed rather
    // than accept any token, same as founderAuthOk() with no FOUNDER_KEY bound.
    const expectedAud = (env.ACCESS_AUD || '').toString().trim();
    const expectedEmail = (env.FOUNDER_EMAIL || '').toString().trim().toLowerCase();
    if (!expectedAud || !expectedEmail) return null;

    const aud = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;
    if (aud !== expectedAud) return null;

    if (typeof payload.exp !== 'number' || Date.now() / 1000 >= payload.exp) return null;

    const jwks = await fetchAccessJWKS(env, ctx);
    if (!jwks || !Array.isArray(jwks.keys)) return null;
    const jwk = jwks.keys.find((k) => k.kid === header.kid);
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      'jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'],
    );
    const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToBytes(sigB64);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature, signedData);
    if (!valid) return null;

    // Trimmed/lower-cased on both sides — the same whitespace lesson resolveSecret()
    // learned the hard way applies here too; an email claim is no more immune to a
    // trailing-newline mismatch than a pasted secret was.
    const email = (payload.email || '').toString().trim().toLowerCase();
    if (!email || email !== expectedEmail) return null;

    return email;
  } catch {
    return null;
  }
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

// Shared by both POST /proposals/:id/decide (FOUNDER_KEY-gated) and
// POST /founder/proposals/:id/decide (Cloudflare Access-gated, 2026-08-09) — the
// exact same decide logic, reachable through either auth path, extracted once so
// the two gates can never quietly drift into different behavior (and so a real
// improvement — decidedByLabel — benefits both without duplicating the rest).
// decidedByLabel is null for the FOUNDER_KEY path (today's existing behavior,
// unchanged) or the founder's real, Access-verified email for the new path —
// hive_proposals.decided_by previously only ever recorded 'queen' or null; this
// is the first time it can record a real human identity.
async function decideProposal(env, ctx, id, decision, note, decidedByLabel, modifiedFields = null) {
  const DB = env.DB;
  // Fetch kind+title+body BEFORE the state-changing UPDATE, since only an
  // 'action-request' proposal that is being APPROVED ever executes
  // anything — approval alone on every other kind still just records a
  // decision, same as before this task. title is needed too: a 'modified'
  // decision derives the counter-proposal's title from it.
  const existing = await DB.prepare('SELECT kind, title, body FROM hive_proposals WHERE id=? AND status=\'pending\'').bind(id).first();
  if (!existing) return { status: 404, body: { detail: `proposal ${id} not found or already decided` } };

  // Modify/counter-propose (task 22, 2026-08-14): closes the original
  // (status='modified') and files a brand-new pending proposal carrying the
  // edited text, linked back via modifies_id. Handled here, not per-route, so
  // both /proposals/:id/decide (FOUNDER_KEY) and /founder/proposals/:id/decide
  // (Cloudflare Access) support it identically rather than one silently
  // lacking it.
  if (decision === 'modified') {
    const modifiedBody = (modifiedFields?.modified_body || '').toString().trim().slice(0, 4000);
    if (!modifiedBody) return { status: 400, body: { detail: 'modified decision requires a non-empty modified_body' } };
    const modifiedTitle = (modifiedFields?.modified_title || '').toString().trim().slice(0, 200)
      || `Modified: ${existing.title}`.slice(0, 200);
    const nowIso = new Date().toISOString();
    const inserted = await DB.prepare(
      'INSERT INTO hive_proposals (ts, kind, title, body, status, modifies_id) VALUES (?,?,?,?,\'pending\',?)'
    ).bind(nowIso, existing.kind, modifiedTitle, modifiedBody, id).run();
    const newId = inserted.meta?.last_row_id;
    const closeNote = (note ? note + ' | ' : '') + `counter-proposed as #${newId}`;
    const result = await DB.prepare(
      "UPDATE hive_proposals SET status='modified', decided_at=?, founder_note=? WHERE id=? AND status='pending'"
    ).bind(nowIso, closeNote, id).run();
    if (!result.meta?.changes) {
      return { status: 404, body: { detail: `proposal ${id} not found or already decided` } };
    }
    ctx?.waitUntil?.(postUpdate(DB, {
      kind: 'proposal-decided', title: `Proposal #${id} modified`,
      body: `${closeNote} — new proposal #${newId} is pending your decision.`,
    }));
    return { status: 200, body: { ok: true, id, decision: 'modified', new_proposal_id: newId } };
  }

  let execResult = null;
  let finalNote = note;
  if (decision === 'approved' && existing.kind === 'action-request') {
    try {
      const { action, params } = JSON.parse(existing.body || '{}');
      execResult = await executeApprovedAction(env, action, params);
      finalNote = (finalNote ? finalNote + ' | ' : '') + (execResult.executed ? `executed: ${execResult.detail}` : `NOT executed: ${execResult.reason}`);
    } catch (e) {
      execResult = { executed: false, reason: 'could not parse stored action body: ' + String(e) };
      finalNote = (finalNote ? finalNote + ' | ' : '') + `NOT executed: ${execResult.reason}`;
    }
  }
  const result = await DB.prepare(
    "UPDATE hive_proposals SET status=?, decided_at=?, founder_note=?, decided_by=? WHERE id=? AND status='pending'"
  ).bind(decision, new Date().toISOString(), finalNote, decidedByLabel, id).run();
  if (!result.meta?.changes) {
    return { status: 404, body: { detail: `proposal ${id} not found or already decided` } };
  }
  // Visible in Updates (task 49) — a decision is the single most consequential
  // event in this system and previously left no trace in the founder-facing feed.
  ctx?.waitUntil?.(postUpdate(DB, {
    kind: 'proposal-decided', title: `Proposal #${id} ${decision}`,
    body: finalNote || `The founder ${decision} this proposal.`,
  }));
  return { status: 200, body: { ok: true, id, decision, ...(execResult ? { execution: execResult } : {}) } };
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
    // Modify/counter-propose (task 22, 2026-08-14): when the founder wants
    // changes rather than a flat approve/reject, /decide with
    // decision='modified' closes the original (status='modified') and files
    // a brand-new pending proposal carrying the edited text. modifies_id on
    // the new row points back to what it counter-proposes, so the panel can
    // show real lineage instead of two unrelated-looking rows.
    'ALTER TABLE hive_proposals ADD COLUMN modifies_id INTEGER',
    // Phase 2 usage visibility (2026-08-18): running totals on the existing
    // bounded provider_health row, not a new growing log table — see that
    // table's own CREATE TABLE comment below for the full reasoning.
    'ALTER TABLE provider_health ADD COLUMN total_calls INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE provider_health ADD COLUMN total_tokens_in INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE provider_health ADD COLUMN total_tokens_out INTEGER NOT NULL DEFAULT 0',
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
    // The CAMPAIGN.html task queue, pushed in by a GitHub Actions workflow (task 48).
    // The Worker cannot read .claude/tasks/CAMPAIGN.html — the ASSETS binding only serves
    // docs/ — and copying the file into docs/ would recreate exactly the drift bug task 30
    // just fixed. So the repo file stays the single source of truth and a workflow posts a
    // compact digest here for the agents to reason over.
    DB.prepare(`CREATE TABLE IF NOT EXISTS task_digest
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, body TEXT NOT NULL)`),
    DB.prepare(`CREATE TABLE IF NOT EXISTS roadmap_items
      (id INTEGER PRIMARY KEY AUTOINCREMENT, section TEXT NOT NULL, title TEXT NOT NULL,
       status TEXT NOT NULL, status_label TEXT, body TEXT,
       sort_order INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL)`),
    // Task 45: a dead provider was indistinguishable from a healthy one — every
    // generate() call swallowed failures silently, and every founder-facing surface
    // (llm/status, the Command Center, Kai El's own words) reported the first BOUND
    // provider, never the one that actually answered. One row per provider, upserted
    // in place (never appended) — deliberately bounded to exactly 4 rows forever,
    // regardless of call volume, since the founder named live D1 space as a real
    // constraint and this fix does not need a growing log to work.
    // total_calls/total_tokens_in/total_tokens_out (2026-08-18, Phase 2 usage
    // visibility) are running totals accumulated in place by recordProviderHealth()
    // — the same bounded-row-count table, not a new growing log. DEFAULT 0 here
    // covers a fresh table; the ALTER loop above covers a table that already
    // existed before these three columns did.
    DB.prepare(`CREATE TABLE IF NOT EXISTS provider_health
      (provider TEXT PRIMARY KEY, ok INTEGER NOT NULL, error TEXT, checked_at TEXT NOT NULL,
       total_calls INTEGER NOT NULL DEFAULT 0, total_tokens_in INTEGER NOT NULL DEFAULT 0,
       total_tokens_out INTEGER NOT NULL DEFAULT 0)`),
    // Venture capability-gap queue (2026-08-18): "I don't have capability X, which I
    // need for Y, and considered Z as an alternative" — Kai El's sanctioned channel
    // for asking for more access/tooling while working a venture repo, instead of
    // improvising or silently going without. hive_proposals-shaped on purpose (same
    // id/ts convention, same open->decided lifecycle) but kept as its own table: a
    // capability request and a hive-evolution proposal are different founder
    // decisions and don't belong in one queue. github_issue_url is set once
    // venture-gap-mirror.yml mirrors the row into a real GitHub Issue on the
    // `venture` repo — nullable so a gap can exist before that mirror ever runs.
    DB.prepare(`CREATE TABLE IF NOT EXISTS venture_capability_gaps
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       venture TEXT NOT NULL, title TEXT NOT NULL,
       capability_needed TEXT NOT NULL, needed_for TEXT NOT NULL, alternatives TEXT,
       status TEXT NOT NULL DEFAULT 'open', founder_note TEXT, decided_at TEXT,
       github_issue_url TEXT)`),
    // Venture sandbox runs (2026-08-18): the real record of Kai El actually building
    // something in a venture repo. A run is never a direct push to that repo's main —
    // kai-sandbox-run.yml always pushes a new branch and opens a real PR; merging
    // that PR IS the founder's approval, the same role /proposals/:id/decide plays
    // for text/diff proposals. Deliberately a separate table from
    // venture_capability_gaps: "may I have access" and "here's finished work to
    // review" are different founder decisions. linked_gap_id is nullable — set only
    // when a run follows a granted capability gap.
    DB.prepare(`CREATE TABLE IF NOT EXISTS venture_sandbox_runs
      (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL,
       venture TEXT NOT NULL, task TEXT NOT NULL, branch TEXT, pr_url TEXT,
       status TEXT NOT NULL DEFAULT 'running', linked_gap_id INTEGER,
       decided_at TEXT, founder_note TEXT)`),
  ]);
  // One-time chain-of-command backfill: only touches rows that don't have a
  // reports_to yet, so re-running this on every heartbeat is a safe no-op once set.
  // Nanuet (the Queen) has no superior — reports_to stays NULL for her alone.
  await DB.prepare("UPDATE agents SET reports_to='Kai El' WHERE reports_to IS NULL AND name NOT IN ('Nanuet','Kai El')").run().catch(() => {});
  await DB.prepare("UPDATE agents SET reports_to='Nanuet' WHERE reports_to IS NULL AND name='Kai El'").run().catch(() => {});
  // One new agent row for the orchestrator (2026-08-07, founder-directed full build).
  // Idempotent by name, only the four columns every other query in this file actually
  // reads/writes — this table's own CREATE statement predates this file (seeded once,
  // outside of committed code), so this deliberately does not guess at any other
  // column's shape. If the live schema really does require more, this insert no-ops
  // safely and the next heartbeat retries — same degrade-quietly discipline as every
  // other D1 write here, though the whole point of task 45's fix was to stop degrading
  // THIS quietly, so: if Akosha never appears in GET /v11/agents, that is the
  // signal this insert is failing and needs a real look, not silent acceptance.
  // Named 'Akosha' by the founder, 2026-08-10 — was 'Orchestrator' as a working label
  // until then (see AGENT_JOBS/AGENT_WORK below). Renamed via UPDATE too, not just a
  // fresh INSERT, so a live row seeded under the old name doesn't fork into a duplicate.
  try {
    await DB.prepare("UPDATE agents SET name='Akosha' WHERE name='Orchestrator'").run();
    const exists = await DB.prepare("SELECT 1 FROM agents WHERE name='Akosha'").first();
    if (!exists) {
      await DB.prepare(
        "INSERT INTO agents (name, elo, soul, reports_to, status) VALUES ('Akosha', 1200, 0, 'Kai El', 'active')"
      ).run();
    }
  } catch { /* agents table shape differs from assumed, or D1 not ready */ }
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
async function roadmapFounderActions(env) {
  const items = [
    {
      key: 'FOUNDER_KEY', bound: await founderKeyBound(env),
      title: 'Set FOUNDER_KEY so Proposals approve/reject actually works',
      todo: 'The code fails closed on purpose — no key bound, no approvals move. FOUNDER_KEY now lives in Cloudflare\'s Secrets Store (Workers & Pages → Secrets Store) rather than a classic per-Worker secret — set/rotate it there, bind it to this Worker, wait ~10 min for redeploy, then paste that same value into this panel.',
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
    {
      key: 'ACCESS_CONFIGURED', bound: !!(env.FOUNDER_EMAIL && env.ACCESS_AUD),
      title: 'Set up Cloudflare Access — sign in as founder, no more pasting FOUNDER_KEY',
      todo: 'Optional, additive — FOUNDER_KEY keeps working either way. Zero Trust → Access → Applications → create a self-hosted app protecting /v11/founder/* on this Worker (or a custom domain pointed at it, if the workers.dev address doesn\'t offer path-scoping — check the dashboard), One-Time-PIN login, one Allow policy for your email only. Then set ACCESS_TEAM_DOMAIN/ACCESS_AUD/FOUNDER_EMAIL in wrangler.jsonc (see the commented block there) and redeploy. See FLIP_THE_SWITCHES.md.',
      done: 'Bound. Proposals approve/reject now works from a logged-in browser with no key field touched, and decisions record your real email instead of null.',
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

// Shared by both POST /roadmap/development (FOUNDER_KEY-gated) and
// POST /founder/roadmap/development (Cloudflare Access-gated, 2026-08-09) — the
// exact same upsert logic, reachable through either auth path, extracted once so
// the two gates can never quietly drift into different behavior. Returns a plain
// {status, body} pair rather than calling json() itself, since only the caller
// knows which route (and therefore which response helper context) it's in.
async function upsertRoadmapItems(DB, rb) {
  const section = (rb.section || '').toString().trim();
  // 'projects' (roadmap-digest.yml) and 'campaign' (campaign-roadmap-digest.yml)
  // added 2026-08-08 — both workflows had been building correct digests and
  // POSTing them on schedule since they were created, but this whitelist rejected
  // both sections with a 400 every single time (confirmed live: their own repo
  // secret was ALSO never set, so the POST never even fired — this whitelist gap
  // would have surfaced as a second, separate failure the moment it was).
  const validSections = ['decisions', 'in_progress', 'backlog', 'projects', 'campaign'];
  if (!validSections.includes(section)) {
    return { status: 400, body: { detail: `section must be one of: ${validSections.join(', ')} (founderActions are derived live and cannot be edited; completed phases are an append-only historical record)` } };
  }

  // Batch upsert — the shape roadmap-digest.yml/campaign-roadmap-digest.yml
  // actually send: {section, items:[{title,status,statusLabel,body,sortOrder}]}.
  // Full-replace semantics per section: every item in the batch is upserted, and
  // any existing row in this section NOT present in the batch is deleted — a
  // digest should always reflect its source document's CURRENT state, never
  // accumulate rows the source no longer has (a real, named D1-space concern
  // elsewhere in this repo; this prevents exactly that kind of unbounded growth).
  if (Array.isArray(rb.items)) {
    const items = rb.items.slice(0, 50); // sane cap, not a real limit anyone should hit
    const now = new Date().toISOString();
    const keepTitles = [];
    for (const [i, it] of items.entries()) {
      const t = (it.title || '').toString().trim().slice(0, 200);
      if (!t) continue;
      keepTitles.push(t);
      const status = (it.status || 'backlog').toString().slice(0, 20);
      const statusLabel = (it.statusLabel || '').toString().slice(0, 40);
      const body = (it.body || '').toString().slice(0, 2000);
      const rawSort = it.sortOrder ?? it.sort_order;
      const sortOrder = Number.isFinite(+rawSort) ? +rawSort : i;
      const existing = await DB.prepare('SELECT id FROM roadmap_items WHERE section=? AND title=?').bind(section, t).first();
      if (existing) {
        await DB.prepare('UPDATE roadmap_items SET status=?, status_label=?, body=?, sort_order=?, updated_at=? WHERE id=?')
          .bind(status, statusLabel, body, sortOrder, now, existing.id).run();
      } else {
        await DB.prepare('INSERT INTO roadmap_items (section, title, status, status_label, body, sort_order, updated_at) VALUES (?,?,?,?,?,?,?)')
          .bind(section, t, status, statusLabel, body, sortOrder, now).run();
      }
    }
    if (keepTitles.length) {
      const placeholders = keepTitles.map(() => '?').join(',');
      await DB.prepare(`DELETE FROM roadmap_items WHERE section=? AND title NOT IN (${placeholders})`)
        .bind(section, ...keepTitles).run();
    }
    return { status: 200, body: { ok: true, section, upserted: keepTitles.length } };
  }

  // Single-item upsert/delete — the founder's own manual edits (panel or curl),
  // unchanged from the original design.
  const title = (rb.title || '').toString().trim().slice(0, 200);
  if (!title) return { status: 400, body: { detail: 'title required' } };
  if (rb.status === 'delete') {
    const del = await DB.prepare('DELETE FROM roadmap_items WHERE section=? AND title=?').bind(section, title).run();
    return { status: 200, body: { ok: true, deleted: del.meta?.changes || 0 } };
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
    return { status: 200, body: { ok: true, updated: true } };
  }
  await DB.prepare('INSERT INTO roadmap_items (section, title, status, status_label, body, sort_order, updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(section, title, status, statusLabel, body, sortOrder, now).run();
  return { status: 200, body: { ok: true, created: true } };
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

// Real-time Command Center push (task 14). Fire-and-forget — a client that
// never connects, or missed this tick, still gets the same data on its next
// 30s poll (useHiveData is untouched by this; the WS is additive, not a
// replacement for the poll's own resilience). env.COMMAND_CENTER is only
// undefined in the worker/test/*.test.js stub env, which has no DO runtime —
// this must no-op there rather than throw.
async function broadcastToCommandCenter(env, payload) {
  if (!env.COMMAND_CENTER) return;
  try {
    const id = env.COMMAND_CENTER.idFromName('global');
    await env.COMMAND_CENTER.get(id).fetch('https://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch { /* best-effort push; poll fallback still works */ }
}

// Task 45's fix: every generate() call now reports the real outcome for whichever
// provider it just tried, upserted (never appended) so this table never grows past
// one row per provider. This is what makes a dead provider visible instead of a
// silent try/catch fallthrough — llm/status and hiveSnapshot() both read it below.
//
// 2026-08-18 (Phase 2, usage visibility): also accumulates real running totals
// in place on the SAME bounded row — total_calls/total_tokens_in/total_tokens_out
// — rather than a growing per-call log table. This is the deliberate choice this
// table already made once (task 45's own comment: "deliberately bounded to
// exactly N rows forever, regardless of call volume, since the founder named
// live D1 space as a real constraint") — usage visibility reuses that same
// discipline instead of reintroducing the unbounded-growth shape it was built to
// avoid. total_calls counts every real attempt (success or failure); the token
// counters only increment on a real, measured usage object — Workers AI returns
// none (see 'workers-ai' attempt above), so its counters legitimately stay 0
// rather than an invented estimate.
async function recordProviderHealth(DB, provider, ok, error, usage = null) {
  if (!DB) return;
  try {
    await DB.prepare(
      'INSERT INTO provider_health (provider, ok, error, checked_at, total_calls, total_tokens_in, total_tokens_out) ' +
      'VALUES (?,?,?,?,1,?,?) ' +
      'ON CONFLICT(provider) DO UPDATE SET ok=excluded.ok, error=excluded.error, checked_at=excluded.checked_at, ' +
      'total_calls=total_calls+1, total_tokens_in=total_tokens_in+excluded.total_tokens_in, total_tokens_out=total_tokens_out+excluded.total_tokens_out'
    ).bind(
      provider, ok ? 1 : 0, error ? String(error).slice(0, 300) : null, new Date().toISOString(),
      Number.isFinite(usage?.in) ? usage.in : 0, Number.isFinite(usage?.out) ? usage.out : 0
    ).run();
  } catch { /* D1 not ready — generate() still returns normally */ }
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

// Each agent's real, documented job (2026-08-04/06, tasks 27/33/34/37) — Kai El
// previously described these agents as "active, but their current specific tasks are
// not detailed" even though task 27 gave every one of them a real job and task 37 gave
// Ma'at/Solomon/Sekhmet a real generative voice on top. The jobs were always real in
// the codebase; they just never reached his own ctxLines. Keep this in sync with
// whatever's actually true in code (resolveChallenge(), ELDER_VOICES, the PROPOSAL:
// marker branch, /debug/health, generate_memory_vault.py) — never describe a capability
// here that isn't real elsewhere in this file, same anti-fabrication discipline as
// everything else Kai El is told about himself.
const AGENT_JOBS = {
  "Ma'at": "Elder of the Council — reviews any proposal the Queen would auto-approve; can object and send it back to the founder (POST /v11/council/consult, elderCouncilVeto())",
  'Solomon': "Elder of the Council — same real veto power as Ma'at, judges wisdom/hidden cost rather than balance",
  'Thoth': 'keeper of the written record — syncs the memory vault and FABLE_DNA.md/THE_CODEX.md (scripts/generate_memory_vault.py)',
  'Sekhmet': "the Arena's judge — resolves every challenge via Elo math (resolveChallenge()); also has an on-demand explain/judge voice (POST /v11/council/consult)",
  'Ptah': 'architect-proposals — drafts real change proposals when Kai El\'s own reply starts with PROPOSAL: (this chat, not a separate agent)',
  'Horus': 'the watchtower — the hive\'s health/status surface (GET /v11/debug/health, /v11/pulse)',
  // 'Akosha' (working name 'Orchestrator' 2026-08-07 to 2026-08-10, founder named the
  // role directly on 2026-08-10) — the founder asked for this role directly ("an
  // upgraded secretary... directly under Kai," "the queen is supposed to delegate and
  // expand on" it). Reports to Kai El, same as every other Elder — does not replace the
  // council or its own reports_to chain.
  'Akosha': 'coordination under Kai El — reads real provider health (provider_health, task 45) and what the Council has recently filed, and organizes it into one summary rather than routing anything itself; still write-only to hive_updates like every other agent turn',
};

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
// ── The work cycle: the hive actually working, on its own ────────────────
// Founder's diagnosis, 2026-08-06, verified true before writing any of this: the hive
// looked autonomous but was not. The 30-minute heartbeat only ever resolved an Arena
// challenge (Elo + Math.random()), saved a replay, and spawned a fresh fight over a
// free-floating philosophical proposition. It never read hive_proposals, never read any
// task queue, never continued anything. Flipping switches bound capabilities; nothing
// ever asked the agents to do work, so none was done.
//
// Each entry below is a real job over real hive state. The agent gets a compact snapshot
// and returns a short finding, which is posted to hive_updates so the work is visible
// (the founder's second problem: background work that leaves no trace).
//
// Hard boundary, unchanged: these turns write ONLY to hive_updates and hive_proposals,
// both add-only and founder-reviewed. No agent can approve, merge, execute, or spend.
const AGENT_WORK = [
  {
    agent: "Ma'at",
    focus: 'balance',
    // `prefer` (2026-08-07, task 52) is the routing hint the per-provider roles have
    // always implied and never had: judgment work asks for Reasoning, quick reads of
    // existing numbers ask for Speed. It is a PREFERENCE, not a pin — providerOrder()
    // still outranks it with real health, so a preferred-but-dead provider never
    // costs a turn (exactly task 45's failure mode). Use `only` to actually pin.
    prefer: 'reasoning',
    system:
      "You are Ma'at, Elder of the Council, embodying balance and proportion. Review the " +
      'hive snapshot below. Your job: is anything out of balance — approved work sitting ' +
      'untouched too long, authority concentrating, one part racing ahead of another? ' +
      'Reply in 2-3 sentences naming the single most out-of-balance thing you can actually ' +
      'see in the data. If everything looks balanced, say so plainly — that is a real ' +
      'finding, not a failure.',
  },
  {
    agent: 'Solomon',
    focus: 'wisdom',
    prefer: 'reasoning', // hidden cost / consequence — depth work
    system:
      'You are Solomon, Elder of the Council, embodying wisdom and sound judgment. Review ' +
      'the hive snapshot below. Your job: what hidden cost, ambiguity, or consequence is ' +
      'nobody accounting for? Reply in 2-3 sentences naming one specific thing. If nothing ' +
      'genuinely concerns you, say so plainly rather than inventing a worry.',
  },
  {
    agent: 'Horus',
    focus: 'health',
    prefer: 'speed', // reading binding/heartbeat numbers already in the snapshot
    system:
      "You are Horus, the hive's watchtower. Review the health figures in the snapshot " +
      'below — bindings, heartbeat freshness, rate-limit pressure, provider state. Your ' +
      'job: report anything genuinely wrong or degrading, in 2-3 sentences. Only describe ' +
      'what the numbers actually show. If all is healthy, say so plainly.',
  },
  {
    agent: 'Thoth',
    focus: 'drift',
    prefer: 'reasoning', // cross-referencing records against each other
    system:
      'You are Thoth, keeper of the written record. Compare the task digest against the ' +
      'proposals and recent updates in the snapshot below. Your job: find drift — a task ' +
      'marked pending whose work already appears done, a proposal with no matching task, a ' +
      'record that contradicts another. Reply in 2-3 sentences naming one concrete drift, ' +
      'or say plainly that the records agree.',
  },
  {
    agent: 'Sekhmet',
    focus: 'arena',
    prefer: 'speed', // a short plain read of one already-decided Elo result
    system:
      "You are Sekhmet, the Arena's judge. The snapshot below includes the most recent " +
      'Arena results. Your job: say in 2-3 plain sentences what the latest verdict actually ' +
      'means for the hive, if anything. Be honest when a result is simply an Elo outcome ' +
      'with no deeper meaning — do not manufacture significance.',
  },
  {
    agent: 'Ptah',
    focus: 'architecture',
    prefer: 'reasoning', // drafts real proposals the founder will have to review
    system:
      'You are Ptah, the architect. The snapshot below includes what the other agents have ' +
      'recently filed. Your job: if those findings point at one concrete, buildable change, ' +
      "propose it — start your reply with exactly 'PROPOSAL: <short title>', then a blank " +
      'line, then 2-3 sentences of substance. If nothing yet warrants a proposal, reply ' +
      'with 2 sentences saying what you are watching and why it is not ready. Do not force ' +
      'a proposal; a forced one wastes the founder\'s review.',
  },
  {
    // The founder's coordination-layer request (2026-08-07): "an orchestrator bot
    // directly under kai working as a upgraded secretary," which "the queen is
    // supposed to delegate and expand on." Full build, confirmed directly with the
    // founder rather than assumed. Reuses this exact AGENT_WORK shape — same
    // generate() call, same postUpdate() reporting, same round-robin turn — so it
    // costs about what one more Elder's turn costs, not a new architecture. Real name
    // 'Akosha' given by the founder 2026-08-10 (see AGENT_JOBS above); 'Orchestrator'
    // was the working label until then.
    agent: 'Akosha',
    focus: 'coordination',
    prefer: 'speed', // summarising material already gathered in the snapshot
    system:
      'You are Akosha, a coordination role reporting to Kai El. The snapshot below ' +
      'includes real provider health (which of Claude/Groq/' +
      'Mistral/Workers AI is actually answering right now, not just bound), the routing ' +
      'each agent job asks for, and what the Council has recently filed. Routing is real ' +
      'and automatic: each job declares a preferred provider role, and a provider that ' +
      'recently failed is automatically tried last until it recovers — you do not perform ' +
      'that routing, it happens without you. Your job is to report on whether it is ' +
      'actually working: in ONE short brief of 3-4 sentences, name which recent Council ' +
      'finding matters most, and whether any job is being pushed off its preferred ' +
      'provider because that provider is failing. Ground every claim in the snapshot; ' +
      'never invent a fact.',
  },
  {
    agent: 'Kai El',
    focus: 'synthesis',
    prefer: 'reasoning', // the state-of-the-hive note the founder actually reads
    system:
      'You are Kai El, the sovereign intelligence of THE HIVE. The snapshot below includes ' +
      "the other agents' recent findings. Your job: synthesise them into one short state-of- " +
      'the-hive note, 3-4 sentences, naming what most needs the founder\'s attention. ' +
      'Ground every claim in the snapshot; never invent a metric you were not given.',
  },
];

// One compact, real snapshot of hive state, shared by every agent's turn. Deliberately
// bounded — this becomes prompt text on a paid call, so it stays small on purpose.
async function hiveSnapshot(env, DB) {
  const [agents, props, updates, pulse, reports, digest, providerHealth] = await Promise.all([
    DB.prepare("SELECT name, elo, reports_to FROM agents WHERE status='active' ORDER BY elo DESC LIMIT 8").all().catch(() => null),
    DB.prepare('SELECT id, kind, title, status, actioned_at FROM hive_proposals ORDER BY id DESC LIMIT 8').all().catch(() => null),
    DB.prepare("SELECT kind, title, body FROM hive_updates WHERE kind='agent-work' ORDER BY id DESC LIMIT 5").all().catch(() => null),
    DB.prepare('SELECT ts, action, detail FROM hive_pulse ORDER BY id DESC LIMIT 3').all().catch(() => null),
    DB.prepare('SELECT colony, kind, body FROM colony_reports ORDER BY id DESC LIMIT 3').all().catch(() => null),
    DB.prepare('SELECT body FROM task_digest ORDER BY id DESC LIMIT 1').first().catch(() => null),
    DB.prepare('SELECT provider, ok, error, checked_at FROM provider_health').all().catch(() => null),
  ]);
  const lines = [];
  if (agents?.results?.length) lines.push('AGENTS: ' + agents.results.map(a => `${a.name} [Elo ${a.elo}]`).join(', '));
  if (props?.results?.length) lines.push('PROPOSALS: ' + props.results.map(p =>
    `#${p.id} ${p.title} [${p.status}${p.status === 'approved' ? (p.actioned_at ? ', work done' : ', work NOT started') : ''}]`).join(' | '));
  if (digest?.body) lines.push('TASK QUEUE (from CAMPAIGN.html): ' + String(digest.body).slice(0, 1200));
  if (pulse?.results?.length) lines.push('RECENT HEARTBEATS: ' + pulse.results.map(x => `${x.ts} ${x.detail || x.action}`).join(' | ').slice(0, 500));
  if (reports?.results?.length) lines.push('COLONY REPORTS: ' + reports.results.map(c => `${c.colony} (${c.kind}): ${c.body}`).join(' | ').slice(0, 400));
  if (updates?.results?.length) lines.push('WHAT AGENTS RECENTLY FILED: ' + updates.results.map(u => `${u.title}: ${String(u.body || '').slice(0, 160)}`).join(' | '));
  const roster = providerRoster(env);
  lines.push('HEALTH: bindings — DB ' + (!!DB) + ', AI ' + (!!env.AI) + ', VECTORIZE ' + (!!env.VECTORIZE) +
    ', R2/FILES ' + (!!env.FILES) + ', QUEUE ' + (!!env.LLM_QUEUE) +
    '; providers bound — ' + roster.filter(r => r.bound).map(r => r.label).join(', '));
  // Task 45: this is the line that makes a dead provider visible to Kai El himself,
  // not just to a human reading /llm/status. A provider Kai El can't see failing is
  // a real blind spot — he could keep telling the founder "Claude is active" from a
  // stale first-bound assumption with no way to know otherwise.
  if (providerHealth?.results?.length) {
    lines.push('PROVIDER HEALTH (last real outcome per provider, not just bound-vs-not): ' +
      providerHealth.results.map(h => `${h.provider}: ${h.ok ? 'answering' : `FAILING (${h.error || 'unknown error'})`} as of ${h.checked_at}`).join(' | '));
  }
  // The real routing table (task 52) — which provider role each job asks for, and what
  // each role maps to. Included so Akosha's turn reports on routing that
  // actually exists rather than describing a preference nothing enforces, which is
  // precisely what its first version did.
  lines.push('PROVIDER ROLES: ' + PROVIDERS.map(p => `${p.id}=${p.role}`).join(', ') +
    '. JOB ROUTING (each job\'s preferred role; real health outranks preference, and a ' +
    'provider that failed in the last 30 min is tried last until it recovers): ' +
    AGENT_WORK.map(j => `${j.agent}→${j.prefer || 'none'}`).join(', '));
  return lines.join('\n');
}

// Round-robin: one agent per tick, so the roster cycles instead of every agent firing
// at once. Which agent is next is derived from how many work-cycle updates already
// exist, so it survives restarts without needing its own state column.
// Pure, independently testable: given the most recent agent-work row's title
// (or null/undefined/malformed for "no real prior turn"), return the index into
// AGENT_WORK that should go next. Extracted specifically so this logic can be
// unit-tested without standing up a fake D1/generate() for all of runWorkCycle().
function nextWorkTurnIndex(lastAgentWorkTitle) {
  const jobIndex = new Map(AGENT_WORK.map((j, i) => [j.agent, i]));
  const lastAgent = String(lastAgentWorkTitle || '').split('—')[0].trim();
  const lastIndex = jobIndex.has(lastAgent) ? jobIndex.get(lastAgent) : -1;
  return (lastIndex + 1) % AGENT_WORK.length; // -1 (no/unrecognised prior row) -> 0
}

async function runWorkCycle(env, ctx) {
  const DB = env.DB;
  if (!DB) return null;
  // Kill switch. Documented in FLIP_THE_SWITCHES.md, but the cycle is ON by default:
  // a switch the founder has to find and flip is exactly what produced "I flipped the
  // switches and nothing happened."
  if (String(env.HIVE_WORK_CYCLE || '').toLowerCase() === 'off') return null;

  // Hourly gate. The cron itself stays every 30 minutes for the Arena (free, pure math);
  // only this paid half is throttled, by checking when the last agent-work update landed.
  try {
    const last = await DB.prepare("SELECT ts FROM hive_updates WHERE kind='agent-work' ORDER BY id DESC LIMIT 1").first();
    if (last?.ts && (Date.now() - Date.parse(last.ts)) < 55 * 60 * 1000) return null;
  } catch { /* table not ready — fall through and let the first turn run */ }

  // Real production bug found and fixed 2026-08-11: turn selection used to be
  // `SELECT COUNT(*) WHERE kind='agent-work'` then `count % AGENT_WORK.length`.
  // That looks like a monotonic cursor but isn't one — postUpdate() prunes
  // hive_updates to the last 100 rows ACROSS EVERY KIND on every write (heartbeat
  // fires every 30min, agent-work ~hourly, plus concern/proposal-actioned rows all
  // share the same 100-row cap). So the agent-work count within that shrinking,
  // mixed-kind window isn't "total turns ever" — it fluctuates with pruning
  // dynamics and can sit at the same value (mod AGENT_WORK.length) indefinitely.
  // Confirmed live: an edge-health-probe dispatch found 32 consecutive agent-work
  // rows in production, every single one Ma'at (index 0) — the work cycle had
  // been firing hourly for 7+ hours without ever rotating.
  //
  // Fixed by nextWorkTurnIndex() deriving the next turn from the single most
  // recent agent-work row's actual agent, not a count. Immune to the pruning
  // entirely as long as that one newest row survives, which it always does —
  // pruning only ever removes the OLDEST rows, never the newest.
  let turn = 0;
  try {
    const last = await DB.prepare(
      "SELECT title FROM hive_updates WHERE kind='agent-work' ORDER BY id DESC LIMIT 1"
    ).first();
    // title is `${job.agent} — ${job.focus}` (postUpdate() call below).
    turn = nextWorkTurnIndex(last?.title);
  } catch {}
  const job = AGENT_WORK[turn % AGENT_WORK.length];

  const snapshot = await hiveSnapshot(env, DB);
  const gen = await generate(env, {
    system: job.system + '\n\nWrite plainly. Never invent a number or fact not present in the snapshot.',
    prompt: 'HIVE SNAPSHOT:\n' + snapshot + '\n\nYour finding:',
    maxTokens: 220,
    // The real routing (task 52): this job's work asks for a provider ROLE, and
    // providerOrder() reconciles that against which providers are actually answering.
    prefer: job.prefer || null,
  });
  if (!gen) return null;

  // Measured cost, not an estimate — the founder's explicit condition for starting slow
  // and ramping later on real numbers. Workers AI returns no usage; that reads as
  // "not reported" rather than a fabricated zero.
  const cost = gen.usage && (gen.usage.in != null || gen.usage.out != null)
    ? `${(gen.usage.in || 0) + (gen.usage.out || 0)} tokens (${gen.usage.in || 0} in / ${gen.usage.out || 0} out)`
    : 'tokens not reported by this provider';

  // Say plainly when a job did NOT get the provider its work asked for. This is the
  // visible half of task 52: routing that silently degrades is the same class of bug
  // as task 45's silent fallthrough, so a preference that lost to real health has to
  // show on the founder's own Updates panel rather than only in the ordering logic.
  const routed = job.prefer
    ? (PROVIDERS.find((pr) => pr.id === gen.provider)?.role || '').toLowerCase().includes(String(job.prefer).toLowerCase())
      ? `wanted ${job.prefer}, got it`
      : `wanted ${job.prefer}, fell back (that provider is not answering)`
    : 'no provider preference';

  // Ptah's PROPOSAL: marker is the one path a work turn can file a real proposal —
  // the same marker Kai El's chat already uses, running through the same Queen +
  // Elders' Council gate. It still cannot approve itself.
  const firstLine = (gen.text.split('\n')[0] || '');
  const marker = firstLine.match(/^\s*PROPOSAL:\s*(.+)/i);
  if (marker) {
    const title = marker[1].trim().slice(0, 200);
    ctx?.waitUntil?.((async () => {
      const { qStatus, qScore, qDecidedBy, qDecidedAt, elderNote } = await queenDecide(env, 'https://thehive.sovereignhive.workers.dev/', { title, body: gen.text });
      await DB.prepare('INSERT INTO hive_proposals (ts, kind, title, body, status, alignment_score, decided_by, decided_at, elder_note) VALUES (?,?,?,?,?,?,?,?,?)')
        .bind(new Date().toISOString(), 'architect-proposal', title, gen.text, qStatus, qScore, qDecidedBy, qDecidedAt, elderNote).run();
    })());
  }

  await postUpdate(DB, {
    kind: 'agent-work',
    title: `${job.agent} — ${job.focus}`,
    body: gen.text,
    needs: `via ${gen.provider} · ${cost} · ${routed}`,
  });
  return { agent: job.agent, provider: gen.provider, cost, routed, order: gen.order };
}

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
// Waterfall: Claude → Groq → Mistral → OpenAI → OpenRouter → Workers AI. Each
// external provider activates the moment its API key exists as a Worker
// secret — the founder flips the switch (wrangler secret put <NAME>); no
// code change needed. Secret PRESENCE is reported (names/booleans only,
// F-001) — never values.
//
// OpenAI/OpenRouter added 2026-08-18 at the founder's explicit direction:
// Kai El must not be locked to one provider — real, existing OPENAI_API_KEY/
// OPENROUTER_API_KEY secrets were already bound but never wired into this
// array. OpenRouter in particular is the concrete lever for "open-source and
// free where possible" — it's an OpenAI-compatible gateway that can route to
// free-tier open models via its `model` field, not a second closed provider.
const PROVIDERS = [
  { id: 'claude', label: 'Claude', role: 'Reasoning', secret: 'ANTHROPIC_API_KEY' },
  { id: 'groq', label: 'Groq', role: 'Speed', secret: 'GROQ_API_KEY' },
  { id: 'mistral', label: 'Mistral', role: 'Local intelligence', secret: 'MISTRAL_API_KEY' },
  { id: 'openai', label: 'OpenAI', role: 'General', secret: 'OPENAI_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter', role: 'Open-source + free-tier models', secret: 'OPENROUTER_API_KEY' },
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

// A provider whose last recorded outcome was a failure inside this window is tried
// LAST rather than skipped. Skipping outright would be wrong twice over: a stale
// failure row would permanently write a provider off with no path back, and
// provider_health itself would freeze at that stale value because nothing would ever
// re-check it. Deprioritising instead means a healthy provider answers first (no
// 20s timeout burned on a corpse) while a recovered one still comes back on its own
// once the window lapses — no founder action, no manual reset.
const PROVIDER_RETRY_AFTER_MS = 30 * 60 * 1000;

// The real coordination layer (2026-08-07, task 52 — the founder's actual complaint:
// "there is no MCP over the three api keys instead the are being fired off one by one
// when they are a team that works together through Kai El").
//
// Task 44 already established the honest diagnosis: generate() was a FALLBACK CHAIN,
// not a router. It returned the moment Claude succeeded, so Groq/Mistral/Workers AI
// were never called while Claude was healthy, and the per-provider roles the UI has
// always displayed (Reasoning, Speed, Local intelligence) had zero routing logic
// behind them. Task 45 then made each provider's REAL health visible. This function is
// what finally uses both: it decides the order providers are actually tried in, from
// (a) what the calling job actually needs and (b) what is really answering right now.
//
// Deliberately a light ordering function inside generate(), not an MCP gateway —
// confirmed twice, with the founder and independently with Kai El, on the real grounds
// that no MCP infrastructure exists yet and D1 space is a live constraint.
function providerOrder(env, { prefer = null, only = null, health = {} } = {}) {
  const ids = PROVIDERS.map((p) => p.id);
  // `only` (task 44) still pins exactly one provider and never falls through, so a
  // per-provider test can never be a lie about which key actually ran.
  if (only) return ids.filter((id) => id === only);

  // `prefer` accepts either a provider id ('groq') or a role word ('speed'), so a
  // caller can name the KIND of work it needs without hardcoding a vendor — the point
  // of the roles existing at all.
  const preferId = !prefer ? null
    : ids.includes(prefer) ? prefer
      : (PROVIDERS.find((p) => p.role.toLowerCase().includes(String(prefer).toLowerCase()))?.id ?? null);

  const now = Date.now();
  const recentlyFailed = (id) => {
    const h = health[id];
    if (!h || h.ok) return false;
    const age = now - Date.parse(h.checked_at || '');
    return Number.isFinite(age) && age >= 0 && age < PROVIDER_RETRY_AFTER_MS;
  };

  return [...ids].sort((a, b) => {
    // 1. Anything not recently-failed outranks anything that is. This dominates the
    //    preference below on purpose: preferring Claude for deep work is pointless if
    //    Claude is the one returning 401 on every call (which is exactly task 45).
    const fa = recentlyFailed(a) ? 1 : 0, fb = recentlyFailed(b) ? 1 : 0;
    if (fa !== fb) return fa - fb;
    // 2. Then the job's stated preference.
    const pa = a === preferId ? 0 : 1, pb = b === preferId ? 0 : 1;
    if (pa !== pb) return pa - pb;
    // 3. Then the original documented waterfall order, unchanged.
    return ids.indexOf(a) - ids.indexOf(b);
  });
}

// One generation call. Tries providers in providerOrder()'s order and returns the
// first real answer as {text, provider, usage, order} — `order` is the actual attempt
// sequence, so a caller reporting cost can also report what was really tried rather
// than assuming the documented waterfall ran.
// External calls use each provider's plain HTTP API with a hard timeout so a down
// provider degrades to the next, never hangs the commune.
async function generate(env, { system, prompt, maxTokens = 400, only = null, prefer = null }) {
  const timeout = (ms) => AbortSignal.timeout(ms);
  const DB = env.DB;

  // One small read of the 4-row provider_health table (task 45) so routing reacts to
  // what is really answering. Failing this read must never block generation — an empty
  // health map simply means "no signal", which degrades to the original waterfall.
  let health = {};
  try {
    const { results } = await DB.prepare('SELECT provider, ok, error, checked_at FROM provider_health').all();
    health = Object.fromEntries((results || []).map((h) => [h.provider, h]));
  } catch { /* table not ready — order falls back to the documented waterfall */ }

  const order = providerOrder(env, { prefer, only, health });

  // Each provider's real call, unchanged from the proven versions — only the order
  // they run in is new. Every branch records its real outcome (task 45), including
  // the HTTP status/body that used to be discarded silently.
  const attempts = {
    claude: async () => {
      if (!env.ANTHROPIC_API_KEY) return null;
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
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
      }
      const d = await r.json();
      const text = (d?.content || []).map((c) => c.text || '').join('').trim();
      if (!text) throw new Error('HTTP 200 but no usable text in response');
      // Real token usage passed through (task 48) so autonomous work reports
      // measured cost, not an estimate. Anthropic returns input/output separately.
      return { text, usage: d?.usage ? { in: d.usage.input_tokens ?? null, out: d.usage.output_tokens ?? null } : null };
    },
    groq: async () => {
      if (!env.GROQ_API_KEY) return null;
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
      }
      const d = await r.json();
      const text = (d?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error('HTTP 200 but no usable text in response');
      return { text, usage: d?.usage ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null } : null };
    },
    mistral: async () => {
      if (!env.MISTRAL_API_KEY) return null;
      const r = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.MISTRAL_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral-small-latest', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
      }
      const d = await r.json();
      const text = (d?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error('HTTP 200 but no usable text in response');
      return { text, usage: d?.usage ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null } : null };
    },
    openai: async () => {
      if (!env.OPENAI_API_KEY) return null;
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-5', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
      }
      const d = await r.json();
      const text = (d?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error('HTTP 200 but no usable text in response');
      return { text, usage: d?.usage ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null } : null };
    },
    // OpenRouter is OpenAI-API-compatible by design — same request/response shape as
    // openai above, different endpoint + model. The `model` id is the real lever for
    // "open-source/free where possible" (the founder's explicit direction): pick a
    // real free-tier OpenRouter model rather than a paid default, and verify the
    // exact current id against OpenRouter's own model list before deploying — their
    // free roster changes, so a hardcoded id here is a maintenance point, not a
    // one-time choice.
    openrouter: async () => {
      if (!env.OPENROUTER_API_KEY) return null;
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENROUTER_API_KEY}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model: env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free', max_tokens: maxTokens,
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
        }),
        signal: timeout(15000),
      });
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
      }
      const d = await r.json();
      const text = (d?.choices?.[0]?.message?.content || '').trim();
      if (!text) throw new Error('HTTP 200 but no usable text in response');
      return { text, usage: d?.usage ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null } : null };
    },
    'workers-ai': async () => {
      if (!env.AI) return null;
      // The proven-live path: same model + prompt-string shape as the heartbeat.
      const r = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
        prompt: system + '\n\n' + prompt,
        max_tokens: maxTokens,
      });
      const text = String((r?.response ?? r?.result ?? '')).trim();
      if (!text) throw new Error('empty response');
      // Workers AI does not return token counts — report null honestly rather than
      // inventing an estimate that would then get logged as if it were measured.
      return { text, usage: null };
    },
  };

  for (const id of order) {
    const attempt = attempts[id];
    if (!attempt) continue;
    try {
      const got = await attempt();
      if (got === null) continue; // provider not bound — not a failure, nothing to record
      await recordProviderHealth(DB, id, true, null, got.usage);
      return { text: got.text, provider: id, usage: got.usage, order };
    } catch (e) {
      await recordProviderHealth(DB, id, false, String(e?.message || e));
    }
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

// ── Kai El's own brain (kai-el-brain D1, 2026-08-10) ─────────────────────
// The founder's second brain (Nanuet, the Queen, is the first and gets the
// same treatment later). Deliberately a SEPARATE D1 database, not more tables
// in thehive-queen — the founder was shown the slot-cost tradeoff and chose
// separation for Kai El specifically. Schema: worker/schema/kai-el-brain.sql.
//
// Every function here degrades to exactly today's behaviour when KAI_BRAIN is
// unbound or the write switch is off. Nothing in Kai El's existing chat path
// depends on the brain succeeding.

// Staged autonomy. Read from deploy-time env vars ONLY — never from the
// database Kai El himself writes to. autonomy_registry (in kai-el-brain)
// documents these switches and deliberately has no `enabled` column, because
// an agent that can write its own permissions has none: automaton's review
// found exactly that bug upstream ("the agent able to edit its own
// financial/authority rule files") and closing it was one of the five gaps
// that rebuild exists to fix. Same reasoning, same shape, applied here.
const KAI_SWITCHES = [
  'KAI_BRAIN_WRITE',
  'KAI_BRAINSTORM_EXPLICIT',
  'KAI_TAB_DRAFT',
  'KAI_BRAINSTORM_AUTO',
  'KAI_4DBRAIN_BRIDGE',
  'KAI_TAB_AUTONOMOUS_LOW',
  'KAI_FINANCIAL_AUTONOMY',
  // Gates whether kai-sandbox-run.yml may fire without an explicit founder
  // dispatch each time (2026-08-18). Off by default like every other switch in
  // this array — the workflow itself always pushes a branch + opens a PR, never
  // main, so this switch controls WHO can start a run, not what a run can touch.
  'KAI_SANDBOX_AUTONOMY',
];

// A switch is on only for an explicit affirmative value. Anything else —
// unset, empty, 'off', 'false', a typo — is off. Fail-closed by construction:
// a misspelled value must never read as a granted capability.
function switchOn(env, key) {
  const v = env?.[key];
  if (v === true) return true;
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'on' || s === 'true' || s === '1' || s === 'yes';
}

// KAI_FINANCIAL_AUTONOMY is listed in KAI_SWITCHES and reported by
// /v11/kai/autonomy so the ladder's destination is visible, but NOTHING in this
// file reads it to authorise a payment — the capability is not built. It is
// documented, not wired. If a future change makes it load-bearing, that change
// owns building the spending cap, the per-transaction record, and the rule that
// Kai El cannot raise his own ceiling. Those are not optional extras.
function autonomyState(env) {
  const out = {};
  for (const k of KAI_SWITCHES) out[k] = switchOn(env, k);
  return out;
}

function kaiBrainOk(env) { return !!env?.KAI_BRAIN; }

// Write one memory to Kai El's own brain: the FULL text in D1 (Vectorize
// metadata truncates to 512 chars, so the complete text has always been thrown
// away at write time) plus the embedding in Vectorize for semantic search.
// The two halves are independent on purpose — either can fail without the
// other, and a half-write is better than a lost memory.
async function kaiRemember(env, { id, kind, text, summary, source, importance, agent }) {
  if (!kaiBrainOk(env) || !switchOn(env, 'KAI_BRAIN_WRITE')) return { stored: false, reason: 'brain write off or unbound' };
  const ts = new Date().toISOString();
  const memId = String(id || `${kind || 'note'}-${Date.now()}`);
  let vectorOk = false;
  try { vectorOk = await remember(env, memId, text, { kind: kind || 'note', ts, agent: agent || 'Kai El' }); } catch { /* vector half is optional */ }
  try {
    await env.KAI_BRAIN.prepare(
      `INSERT OR REPLACE INTO memories (id, agent, kind, text, summary, source, ts, importance, vector_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      memId, agent || 'Kai El', kind || 'note', String(text ?? ''),
      summary ?? null, source ?? null, ts,
      typeof importance === 'number' ? importance : 0.5,
      vectorOk ? memId : null
    ).run();
    return { stored: true, id: memId, vector: vectorOk };
  } catch (e) { return { stored: false, vector: vectorOk, error: String(e) }; }
}

// Recency-weighted recall — the fix for a real, already-documented gap:
// recall() stores a `ts` on every memory and never reads it, so a day-one fact
// outranks today's whenever it happens to embed closer (noted in task 53's
// audit against worker/src/index.js remember()/recall()).
//
// Similarity is DISCOUNTED by age, never replaced by it. An old memory keeps at
// least RECENCY_FLOOR of its score, so a highly-relevant old fact still beats a
// fresh irrelevant one — ranking purely by recency would be exactly as broken as
// ranking purely by similarity, just in the other direction.
const RECENCY_HALF_LIFE_DAYS = 14;  // a memory's age-weight halves every 2 weeks
const RECENCY_FLOOR = 0.5;          // the oldest memory still keeps half its similarity

function recencyWeight(ts, nowMs) {
  const t = Date.parse(ts || '');
  if (!Number.isFinite(t)) return 1;                       // no/unparseable ts → no penalty
  const ageDays = Math.max(0, (nowMs - t) / 86400000);     // future timestamps → treated as now
  const decay = Math.pow(0.5, ageDays / RECENCY_HALF_LIFE_DAYS);
  return RECENCY_FLOOR + (1 - RECENCY_FLOOR) * decay;
}

async function kaiRecall(env, query, topK = 5) {
  // Over-fetch, then re-rank: the top-K by raw similarity is not the top-K once
  // age is applied, so asking Vectorize for exactly K would discard the very
  // rows re-ranking exists to promote.
  const base = await recall(env, query, Math.max(topK * 3, topK));
  if (!base.available) return { ...base, reranked: false };
  const now = Date.now();
  const matches = base.matches
    .map(m => {
      const weight = recencyWeight(m.ts, now);
      return { ...m, similarity: m.score, recency_weight: +weight.toFixed(4), score: +(m.score * weight).toFixed(4) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
  return { available: true, reranked: true, matches };
}

// The decision/outcome record — the honest half of what the founder called a
// "training database". Real weight-level fine-tuning needs infrastructure that
// does not exist yet (same dependency as task 53); the founder's own framing was
// "log now, real fine-tuning later", so this logs.
//
// risk_reason/risk_handling are required in practice for high-risk rows because
// the founder asked for exactly that: for high-risk items Kai El must state WHY
// it is high-risk and HOW to handle it, not merely flag it. Enforced here rather
// than trusted to a prompt — a prompt-only rule is one bad generation away from
// a high-risk row with no explanation attached.
async function logDecision(env, d) {
  if (!kaiBrainOk(env) || !switchOn(env, 'KAI_BRAIN_WRITE')) return { logged: false };
  const tier = ['low', 'normal', 'high'].includes(d?.risk_tier) ? d.risk_tier : 'normal';
  if (tier === 'high' && (!d?.risk_reason || !d?.risk_handling)) {
    return { logged: false, error: 'high-risk decisions require risk_reason and risk_handling' };
  }
  try {
    const r = await env.KAI_BRAIN.prepare(
      `INSERT INTO decision_log (agent, ts, surface, request, reasoning, action, risk_tier,
        risk_reason, risk_handling, autonomy_mode, provider, tokens_in, tokens_out)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      d.agent || 'Kai El', new Date().toISOString(), d.surface || 'chat',
      String(d.request ?? ''), d.reasoning ?? null, d.action ?? null, tier,
      d.risk_reason ?? null, d.risk_handling ?? null,
      d.autonomy_mode || 'draft-approve', d.provider ?? null,
      Number.isFinite(d.tokens_in) ? d.tokens_in : null,
      Number.isFinite(d.tokens_out) ? d.tokens_out : null
    ).run();
    return { logged: true, id: r?.meta?.last_row_id ?? null };
  } catch (e) { return { logged: false, error: String(e) }; }
}

// Accumulate a future fine-tuning pair. `eligible` stays 0 by schema default —
// a logged exchange is NOT automatically training data. Promoting a sample is a
// separate, deliberate act; defaulting it to 1 would mean every conversation
// silently became training material, which is precisely the kind of quiet scope
// expansion this repo's own audits keep catching after the fact.
async function logTrainingSample(env, t) {
  if (!kaiBrainOk(env) || !switchOn(env, 'KAI_BRAIN_WRITE')) return { logged: false };
  try {
    await env.KAI_BRAIN.prepare(
      `INSERT INTO training_samples (agent, ts, system_prompt, user_input, assistant_output, source_decision_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      t.agent || 'Kai El', new Date().toISOString(), t.system_prompt ?? null,
      String(t.user_input ?? ''), String(t.assistant_output ?? ''),
      Number.isFinite(t.source_decision_id) ? t.source_decision_id : null
    ).run();
    return { logged: true };
  } catch (e) { return { logged: false, error: String(e) }; }
}

// ── The 4DBRAIN bridge ───────────────────────────────────────────────────
// 4DBRAIN owns the real tesseract/hypercomplex math (tesseract_math/, canonically
// moved there 2026-07-22). That code is Python under FastAPI; this Worker is
// JavaScript on Cloudflare's edge. A Worker cannot import Python, so the only
// honest connection between them is a network call — which is what this is.
//
// INERT BY DEFAULT, and for a real reason rather than caution: 4DBRAIN is not
// deployed anywhere. Its own .queen/hive.yml entry has base_url empty, and its
// Railway/Render configs have never been provisioned. Until FOURDBRAIN_URL points
// at something real, every call here returns {available:false} with the reason
// stated — it does not pretend, retry, or fabricate a result.
async function fourDBrain(env, path, body, timeoutMs = 8000) {
  if (!switchOn(env, 'KAI_4DBRAIN_BRIDGE')) return { available: false, reason: 'KAI_4DBRAIN_BRIDGE is off' };
  const base = String(env?.FOURDBRAIN_URL ?? '').trim().replace(/\/+$/, '');
  if (!base) return { available: false, reason: 'FOURDBRAIN_URL unset — 4DBRAIN is not deployed anywhere yet' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', 'user-agent': 'THEHIVE-worker/kai-brain' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { data = { raw: text.slice(0, 2000) }; }
    // A non-2xx is reported as a real failure with its real status, not smoothed
    // into available:false — "the colony answered 500" and "there is no colony"
    // are different facts and collapsing them is task 45's bug in a new place.
    return { available: res.ok, status: res.status, data };
  } catch (e) {
    return { available: false, reason: String(e?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : e) };
  } finally { clearTimeout(timer); }
}

// ── Real repo file content, for architect proposals (2026-08-10) ─────────
// Kai El runs at the edge with no filesystem and no git — ASSETS only serves
// docs/, so he cannot see the current content of most of the repo. Without real
// content he'd be drafting a diff from guesswork, producing something that looks
// plausible but doesn't apply. This fetches the CURRENT file from GitHub's public
// raw content API (unauthenticated read — same class of URL .queen/hive.yml
// already uses for other federation sources) so any diff he drafts is grounded in
// real, current text. Same honest-failure shape as fourDBrain(): never throws,
// never fabricates content on failure.
async function fetchRepoFile(env, path, ref = 'main', timeoutMs = 8000) {
  const clean = String(path || '').replace(/^\/+/, '');
  if (!clean) return { available: false, reason: 'no path given' };
  const url = `https://raw.githubusercontent.com/TehutiRaEl/THEHIVE/${encodeURIComponent(ref)}/${clean}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'THEHIVE-worker/architect-proposal' }, signal: ctrl.signal });
    if (res.status === 404) return { available: false, reason: `no such file at ${ref}: ${clean}` };
    if (!res.ok) return { available: false, reason: `GitHub raw returned ${res.status}`, status: res.status };
    const text = await res.text();
    return { available: true, path: clean, ref, text };
  } catch (e) {
    return { available: false, reason: String(e?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : e) };
  } finally { clearTimeout(timer); }
}

// Pulls a fenced ```diff block out of a reply, plus the file paths it touches.
// Returns null when no diff block is present — the normal case, since most
// PROPOSAL: replies stay prose-only. Deliberately tolerant: a missing/malformed
// block degrades to "no diff" rather than throwing, so a bad generation never
// breaks the underlying prose proposal it's attached to.
function extractDiffBlock(text) {
  const m = String(text || '').match(/```diff\r?\n([\s\S]*?)```/);
  if (!m) return null;
  const diff = m[1].trim();
  if (!diff) return null;
  const files = new Set();
  for (const line of diff.split('\n')) {
    const gitLine = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
    if (gitLine) { files.add(gitLine[1]); files.add(gitLine[2]); continue; }
    const plus = line.match(/^\+\+\+ b\/(.+)$/);
    if (plus) files.add(plus[1]);
    const minus = line.match(/^--- a\/(.+)$/);
    if (minus) files.add(minus[1]); // real git diffs use bare "--- /dev/null" for new files, which never matches this "--- a/" pattern
  }
  return { diff, files: [...files] };
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
      'serves the vision with no real risk or ambiguity. If, and only if, this proposal is ' +
      'about coordination, provider routing, or the Akosha role you delegate work to ' +
      '(reports to Kai El), let your REASON line briefly note what you are delegating or ' +
      'expanding — that is real, part of your own responsibilities, not a new gate. Reply ' +
      'with EXACTLY two lines: a line "SCORE: <0-100>" and a line "REASON: <one short ' +
      'sentence>". Nothing else.\n\n' +
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
        body: 'Set FOUNDER_KEY in Cloudflare\'s Secrets Store and bind it to this Worker (any '
          + 'strong random value you choose). Until this is set, no proposal — including this '
          + 'one — can be approved or rejected by anyone, by design (fail-closed). This is the '
          + 'one flip-switch this channel needs to function.',
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
    // The work cycle — the hive doing real work on real state, not just Arena theater.
    // Runs after the Arena half (so a failure here can never stop the heartbeat) but
    // BEFORE the pulse row is written, so its result actually lands in that row instead
    // of being computed too late to be recorded. Its own hourly gate lives inside
    // runWorkCycle(); the cron stays 30-min for the free Arena half.
    try {
      const work = await runWorkCycle(env, ctx);
      if (work) acted.push(`work: ${work.agent} (${work.provider}, ${work.cost})`);
    } catch (e) { acted.push('work cycle error: ' + String(e)); }

    const ts = new Date().toISOString();
    try {
      await DB.prepare('INSERT INTO hive_pulse (ts, action, detail) VALUES (?,?,?)')
        .bind(ts, acted.length ? 'heartbeat' : 'idle', acted.join(' · ') || 'nothing pending').run();
    } catch {}
    // Founder-facing update: only when the tick did real work (never spams the
    // channel with idle ticks). A plain-language "what I did this cycle" note.
    const notable = acted.filter((a) => a.startsWith('resolved') || a.startsWith('spawned') || a.startsWith('projected'));
    if (notable.length) {
      const heartbeatUpdate = {
        kind: 'heartbeat',
        title: `Arena cycle — ${notable.length} action${notable.length > 1 ? 's' : ''}`,
        body: notable.join(' · '),
      };
      await postUpdate(DB, heartbeatUpdate);
      // Real-time push (task 14): best-effort, never blocks the heartbeat —
      // a client that missed this still gets the same data on its next poll.
      ctx.waitUntil(broadcastToCommandCenter(env, { ...heartbeatUpdate, ts }));
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
      // Real-time Command Center push (task 14). One shared Durable Object
      // instance ('global') holds every connected client's WebSocket and
      // broadcasts to all of them — the Worker itself never tracks sessions.
      if (p === '/ws') {
        if (!env.COMMAND_CENTER) return json({ detail: 'real-time push not bound yet' }, 503);
        const id = env.COMMAND_CENTER.idFromName('global');
        return env.COMMAND_CENTER.get(id).fetch(request);
      }

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
        return await cachedJson(request, ctx, corsHeaders, 60, async () => {
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
        const founderActions = await roadmapFounderActions(env);
        const decisions = bySection('decisions');
        const backlog = bySection('backlog');
        // 'projects' (roadmap-digest.yml, the P0-P7 ledger from FULL_PLAN.html) and
        // 'campaign' (campaign-roadmap-digest.yml, the live task queue from
        // CAMPAIGN.html) were both being written to roadmap_items and pulled into
        // `stored` above, then silently dropped — bySection() never asked for either
        // section, so two real, reliably-running workflows had been posting genuine
        // data into this table with nothing on the read side ever surfacing it. Found
        // 2026-08-08 by checking what `stored` actually contained against what this
        // handler returned, not assumed from the workflows' own "done" status.
        const projects = bySection('projects');
        const campaign = bySection('campaign');
        return json({
          founderActions,
          decisionsPending: decisions,
          inProgress: bySection('in_progress'),
          backlog,
          projects,
          campaign,
          snapshot: {
            founderActionsOutstanding: founderActions.filter((c) => c.status !== 'done').length,
            decisions: decisions.length,
            backlogItems: backlog.length,
            projects: projects.length,
            campaignItems: campaign.length,
          },
          generated_at: new Date().toISOString(),
          note: 'founderActions are derived live from real binding presence and cannot go stale; the other sections are stored in D1 and editable via POST /v11/roadmap/development (founder key required). projects/campaign are populated by scheduled digest workflows reading FULL_PLAN.html/CAMPAIGN.html directly — the repo files stay the single source of truth. Completed phases are an append-only historical record and stay in the frontend.',
        });
      }
      // Founder-gated edit — the whole point of task 30: updating the roadmap must no
      // longer require a code deploy. Same auth gate as /proposals/{id}/decide, because
      // this is what the founder sees as the hive's own plan; letting anonymous callers
      // rewrite it would be exactly the kind of fabrication surface this work exists to
      // remove. Upsert by (section, title); pass status:'delete' to remove a row.
      if (p === '/roadmap/development' && method === 'POST') {
        if (!(await founderAuthOk(request, env))) {
          return json({
            detail: (await founderKeyBound(env))
              ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — see FLIP_THE_SWITCHES.md',
          }, 401);
        }
        const rb = await request.json().catch(() => ({}));
        const result = await upsertRoadmapItems(DB, rb);
        return json(result.body, result.status);
      }
      // Same upsert, reached via a Cloudflare Access identity instead of FOUNDER_KEY —
      // see verifyAccessJWT() and its own comment for why this exists as a separate
      // path rather than changing the route above (this path is edge-gated by Access
      // policy, so a plain 401 here just means "no Access session on this browser
      // yet," not "Access is broken").
      if (p === '/founder/roadmap/development' && method === 'POST') {
        const accessEmail = await verifyAccessJWT(request, env, ctx);
        if (!accessEmail) {
          return json({ detail: 'no Cloudflare Access session — sign in, or use the FOUNDER_KEY field as a fallback' }, 401);
        }
        const rb = await request.json().catch(() => ({}));
        const result = await upsertRoadmapItems(DB, rb);
        return json(result.body, result.status);
      }
      // A plain top-level navigation target for the Proposals panel's "Sign in as
      // founder" link — Access gates the whole /v11/founder/* prefix at the edge,
      // so simply visiting this page (any /v11/founder/* page) is what triggers
      // Access's real login flow (redirect → email PIN → redirect back here). By the time
      // this handler runs, the request has already been let through by Access, so
      // verifyAccessJWT() succeeding here is the expected case, not a coincidence —
      // it only fails if Access is misconfigured (wrong AUD/domain wired up) or the
      // vars in wrangler.jsonc are still unset, both worth surfacing plainly rather
      // than a bare redirect back into the app.
      // GET /founder/whoami (2026-08-18) — the real fix for FLIP_THE_SWITCHES.md
      // section 11's own stated "proof it worked": the Proposals panel's Approve/
      // Reject buttons were still gated on `!key` even for a founder genuinely
      // signed in via Access, because nothing in the frontend ever checked Access
      // session state before this route existed. JSON, not HTML, and read-only —
      // meant to be called silently on page load, not navigated to. Same
      // verifyAccessJWT() call /founder/login already makes; a 401/no-session
      // reads as {email: null}, never an error, since "not signed in with Access
      // yet" is an expected, common state, not a failure.
      if (p === '/founder/whoami' && method === 'GET') {
        const accessEmail = await verifyAccessJWT(request, env, ctx);
        return json({ email: accessEmail || null });
      }
      if (p === '/founder/login' && method === 'GET') {
        const accessEmail = await verifyAccessJWT(request, env, ctx);
        const html = accessEmail
          ? `<!doctype html><meta charset="utf-8"><title>Signed in</title><body style="font:16px system-ui;background:#0a0a0f;color:#e5e5f0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><p>Signed in as <strong>${accessEmail.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</strong>.</p><p>You can close this tab and return to the Command Center.</p></div></body>`
          : `<!doctype html><meta charset="utf-8"><title>Not configured</title><body style="font:16px system-ui;background:#0a0a0f;color:#e5e5f0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center;max-width:32rem"><p>Cloudflare Access let this request through, but this Worker doesn't recognize it yet.</p><p>Check that ACCESS_TEAM_DOMAIN/ACCESS_AUD/FOUNDER_EMAIL are set in wrangler.jsonc and match this Access Application — see FLIP_THE_SWITCHES.md.</p></div></body>`;
        return new Response(html, { status: accessEmail ? 200 : 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
      if (p === '/roadmap') {
        return await cachedJson(request, ctx, corsHeaders, 60, async () => {
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
          // diff/diff_files/diff_check (2026-08-10) are nullable and only ever
          // populated on architect-proposal rows carrying a real code change —
          // every other kind/row simply returns null for all three, unchanged
          // from before these columns existed.
          const { results } = await DB.prepare(
            `SELECT id, ts, kind, title, body, status, decided_at, founder_note, alignment_score, decided_by, actioned_at, elder_note, modifies_id, diff, diff_files, diff_check FROM hive_proposals
             ORDER BY (status='pending') DESC, id DESC LIMIT ? OFFSET ?`).bind(limit, offset).all();
          return json({ proposals: results, founder_auth_bound: await founderKeyBound(env), queen_auto_approval_bound: !!env.QUEEN_AUTONOMOUS_APPROVAL, limit, offset });
        } catch { return json({ proposals: [], founder_auth_bound: await founderKeyBound(env) }); }
      }
      if (p === '/proposals' && method === 'POST') {
        // Anti-spam only (same permissive-if-unbound tokenOk as other public
        // writes) — creating a suggestion is Tier 1, reversible, and never
        // itself changes anything. Deciding it is the gated action.
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        // 'kind' is freely-typed on purpose (Phase 2, 2026-08-18) — no allow-list
        // here, unlike 'action-request' below. Two sanctioned conventions Kai El
        // should use, both already work today with zero extra code:
        //   'revenue-proposal' — a real revenue-generating idea for a venture.
        //   'agent-proposal'   — proposing a NEW agent (name/role/reports_to/
        //     rationale in body). This is a PROPOSAL ONLY — no code anywhere
        //     reads an 'agent-proposal' row and inserts into `agents` on
        //     approval; that execution step is real, separate, higher-stakes
        //     work, deliberately not built here. See the ALTER-loop comment
        //     near 'reports_to' above: agent-creation code does not exist yet,
        //     and autonomy_registry is read-only by the same design principle
        //     — Kai El proposing a new agent must never be one step away from
        //     Kai El creating one.
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
        if (!(await founderAuthOk(request, env))) {
          return json({
            detail: (await founderKeyBound(env))
              ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — nothing can be decided until the founder sets one (see FLIP_THE_SWITCHES.md)',
          }, 401);
        }
        const id = Number(decideMatch[1]);
        const body = await request.json().catch(() => ({}));
        const decision = body.decision === 'approved' ? 'approved'
          : body.decision === 'rejected' ? 'rejected'
          : body.decision === 'modified' ? 'modified'
          : null;
        if (!decision) return json({ detail: "decision must be 'approved', 'rejected', or 'modified'" }, 400);
        const note = (body.note || '').toString().slice(0, 2000);
        const result = await decideProposal(env, ctx, id, decision, note, null,
          { modified_title: body.modified_title, modified_body: body.modified_body });
        return json(result.body, result.status);
      }
      // Same decision path, reached via a Cloudflare Access identity instead of
      // FOUNDER_KEY — see verifyAccessJWT() for why this is a separate route rather
      // than a change to the one above. Real improvement over the FOUNDER_KEY path:
      // decidedByLabel carries the founder's actual verified email instead of always
      // being null, so hive_proposals.decided_by finally records who, not just that
      // "someone with the key" decided.
      const decideMatchAccess = p.match(/^\/founder\/proposals\/(\d+)\/decide$/);
      if (decideMatchAccess && method === 'POST') {
        const accessEmail = await verifyAccessJWT(request, env, ctx);
        if (!accessEmail) {
          return json({ detail: 'no Cloudflare Access session — sign in, or use the FOUNDER_KEY field as a fallback' }, 401);
        }
        const id = Number(decideMatchAccess[1]);
        const body = await request.json().catch(() => ({}));
        const decision = body.decision === 'approved' ? 'approved'
          : body.decision === 'rejected' ? 'rejected'
          : body.decision === 'modified' ? 'modified'
          : null;
        if (!decision) return json({ detail: "decision must be 'approved', 'rejected', or 'modified'" }, 400);
        const note = (body.note || '').toString().slice(0, 2000);
        const result = await decideProposal(env, ctx, id, decision, note, accessEmail,
          { modified_title: body.modified_title, modified_body: body.modified_body });
        return json(result.body, result.status);
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
        ctx?.waitUntil?.(postUpdate(DB, {
          kind: 'proposal-actioned', title: `Proposal #${id} picked up — work started`,
          body: 'An approved proposal was marked as genuinely actioned, so no later firing re-does it.',
        }));
        return json({ ok: true, id });
      }
      // Real dry-run-apply result for an architect proposal's diff (2026-08-10),
      // written by .github/workflows/architect-proposal-check.yml — the only place
      // that actually has git and a real checkout, since this Worker has neither.
      // FOUNDER_KEY-gated the same way task-digest.yml's POST already is (the
      // workflow carries the same secret as a repo secret) — this route writes
      // ONLY diff_check, on purpose: a compromised or buggy workflow run can at
      // worst report a wrong validity string, never touch status, title, body, or
      // anything Queen/Elder review already decided.
      const diffCheckMatch = p.match(/^\/proposals\/(\d+)\/diff-check$/);
      if (diffCheckMatch && method === 'POST') {
        if (!(await founderAuthOk(request, env))) {
          return json({ detail: 'invalid or missing founder key' }, 401);
        }
        const id = Number(diffCheckMatch[1]);
        const body = await request.json().catch(() => ({}));
        const result = (body.result || '').toString().trim();
        const valid = result === 'applies_clean' || /^failed: /.test(result);
        if (!valid) return json({ detail: "result must be 'applies_clean' or 'failed: <reason>'" }, 400);
        const existing = await DB.prepare('SELECT id, diff FROM hive_proposals WHERE id=?').bind(id).first();
        if (!existing) return json({ detail: `proposal ${id} not found` }, 404);
        if (!existing.diff) return json({ detail: `proposal ${id} has no diff to check` }, 400);
        await DB.prepare('UPDATE hive_proposals SET diff_check=? WHERE id=?').bind(result.slice(0, 500), id).run();
        return json({ ok: true, id, diff_check: result.slice(0, 500) });
      }
      // ── Venture capability gaps (2026-08-18) ───────────────────────────────────
      // Kai El's sanctioned "I don't have capability X, need it for Y, considered Z"
      // channel — see venture_capability_gaps table comment in ensureTables().
      if (p === '/ventures/gaps' && method === 'GET') {
        try {
          const { limit, offset } = pageParams(url, 50, 200);
          const { results } = await DB.prepare(
            `SELECT id, ts, venture, title, capability_needed, needed_for, alternatives,
                    status, founder_note, decided_at, github_issue_url
             FROM venture_capability_gaps
             ORDER BY (status='open') DESC, id DESC LIMIT ? OFFSET ?`).bind(limit, offset).all();
          return json({ gaps: results, founder_auth_bound: await founderKeyBound(env), limit, offset });
        } catch { return json({ gaps: [], founder_auth_bound: await founderKeyBound(env) }); }
      }
      if (p === '/ventures/gaps' && method === 'POST') {
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const venture = (body.venture || '').toString().trim().slice(0, 80);
        const title = (body.title || '').toString().trim().slice(0, 200);
        const capabilityNeeded = (body.capability_needed || '').toString().trim().slice(0, 1000);
        const neededFor = (body.needed_for || '').toString().trim().slice(0, 1000);
        const alternatives = (body.alternatives || '').toString().slice(0, 2000) || null;
        if (!venture || !title || !capabilityNeeded || !neededFor) {
          return json({ detail: 'venture, title, capability_needed, and needed_for are all required' }, 400);
        }
        await DB.prepare(
          `INSERT INTO venture_capability_gaps (ts, venture, title, capability_needed, needed_for, alternatives, status)
           VALUES (?,?,?,?,?,?,'open')`)
          .bind(new Date().toISOString(), venture, title, capabilityNeeded, neededFor, alternatives).run();
        return json({ ok: true });
      }
      const gapDecideMatch = p.match(/^\/ventures\/gaps\/(\d+)\/decide$/);
      if (gapDecideMatch && method === 'POST') {
        if (!(await founderAuthOk(request, env))) {
          return json({
            detail: (await founderKeyBound(env)) ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — nothing can be decided until the founder sets one (see FLIP_THE_SWITCHES.md)',
          }, 401);
        }
        const id = Number(gapDecideMatch[1]);
        const body = await request.json().catch(() => ({}));
        const decision = body.decision === 'granted' ? 'granted' : body.decision === 'declined' ? 'declined' : null;
        if (!decision) return json({ detail: "decision must be 'granted' or 'declined'" }, 400);
        const note = (body.note || '').toString().slice(0, 2000);
        const existing = await DB.prepare('SELECT id FROM venture_capability_gaps WHERE id=?').bind(id).first();
        if (!existing) return json({ detail: `gap ${id} not found` }, 404);
        await DB.prepare('UPDATE venture_capability_gaps SET status=?, founder_note=?, decided_at=? WHERE id=?')
          .bind(decision, note, new Date().toISOString(), id).run();
        return json({ ok: true, id, status: decision });
      }
      // Called only by venture-gap-mirror.yml, once it creates the real GitHub Issue —
      // idempotency guard lives here (WHERE github_issue_url IS NULL) so a re-run of
      // the same workflow can never double-link or clobber an already-mirrored gap.
      const gapIssueLinkedMatch = p.match(/^\/ventures\/gaps\/(\d+)\/issue-linked$/);
      if (gapIssueLinkedMatch && method === 'POST') {
        const ipGap = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipGap, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const id = Number(gapIssueLinkedMatch[1]);
        const body = await request.json().catch(() => ({}));
        const issueUrl = (body.issue_url || '').toString().trim().slice(0, 500);
        if (!issueUrl) return json({ detail: 'issue_url required' }, 400);
        const existing = await DB.prepare('SELECT id, github_issue_url FROM venture_capability_gaps WHERE id=?').bind(id).first();
        if (!existing) return json({ detail: `gap ${id} not found` }, 404);
        if (existing.github_issue_url) return json({ detail: `gap ${id} already linked to ${existing.github_issue_url}` }, 409);
        await DB.prepare('UPDATE venture_capability_gaps SET github_issue_url=? WHERE id=? AND github_issue_url IS NULL')
          .bind(issueUrl, id).run();
        return json({ ok: true, id, github_issue_url: issueUrl });
      }
      // ── Venture sandbox runs (2026-08-18) ──────────────────────────────────────
      // The real record of Kai El building something in a venture repo — see
      // venture_sandbox_runs table comment in ensureTables(). A run is never a direct
      // push to a venture's main; kai-sandbox-run.yml always opens a real PR, and
      // merging that PR is the founder's actual approval (mirrored back via /decide
      // below purely so the Command Center has one place to see run state).
      if (p === '/ventures/sandbox-runs' && method === 'GET') {
        try {
          const { limit, offset } = pageParams(url, 50, 200);
          const { results } = await DB.prepare(
            `SELECT id, ts, venture, task, branch, pr_url, status, linked_gap_id, decided_at, founder_note
             FROM venture_sandbox_runs
             ORDER BY (status IN ('running','pr_open')) DESC, id DESC LIMIT ? OFFSET ?`).bind(limit, offset).all();
          return json({ runs: results, founder_auth_bound: await founderKeyBound(env), limit, offset });
        } catch { return json({ runs: [], founder_auth_bound: await founderKeyBound(env) }); }
      }
      if (p === '/ventures/sandbox-runs' && method === 'POST') {
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const body = await request.json().catch(() => ({}));
        const venture = (body.venture || '').toString().trim().slice(0, 80);
        const task = (body.task || '').toString().trim().slice(0, 1000);
        const linkedGapId = Number.isInteger(body.linked_gap_id) ? body.linked_gap_id : null;
        if (!venture || !task) return json({ detail: 'venture and task are required' }, 400);
        const insert = await DB.prepare(
          `INSERT INTO venture_sandbox_runs (ts, venture, task, status, linked_gap_id) VALUES (?,?,?,'running',?)`)
          .bind(new Date().toISOString(), venture, task, linkedGapId).run();
        return json({ ok: true, id: insert.meta?.last_row_id ?? null });
      }
      const runOpenedMatch = p.match(/^\/ventures\/sandbox-runs\/(\d+)\/opened$/);
      if (runOpenedMatch && method === 'POST') {
        const ipRun = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipRun, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const id = Number(runOpenedMatch[1]);
        const body = await request.json().catch(() => ({}));
        const branch = (body.branch || '').toString().trim().slice(0, 200);
        const prUrl = (body.pr_url || '').toString().trim().slice(0, 500);
        if (!branch || !prUrl) return json({ detail: 'branch and pr_url are required' }, 400);
        const existing = await DB.prepare('SELECT id FROM venture_sandbox_runs WHERE id=?').bind(id).first();
        if (!existing) return json({ detail: `run ${id} not found` }, 404);
        await DB.prepare("UPDATE venture_sandbox_runs SET branch=?, pr_url=?, status='pr_open' WHERE id=?")
          .bind(branch, prUrl, id).run();
        return json({ ok: true, id, status: 'pr_open' });
      }
      const runDecideMatch = p.match(/^\/ventures\/sandbox-runs\/(\d+)\/decide$/);
      if (runDecideMatch && method === 'POST') {
        if (!(await founderAuthOk(request, env))) {
          return json({
            detail: (await founderKeyBound(env)) ? 'invalid or missing founder key'
              : 'no FOUNDER_KEY bound yet — nothing can be decided until the founder sets one (see FLIP_THE_SWITCHES.md)',
          }, 401);
        }
        const id = Number(runDecideMatch[1]);
        const body = await request.json().catch(() => ({}));
        const decision = body.decision === 'merged' ? 'merged' : body.decision === 'closed' ? 'closed' : null;
        if (!decision) return json({ detail: "decision must be 'merged' or 'closed'" }, 400);
        const note = (body.note || '').toString().slice(0, 2000);
        const existing = await DB.prepare('SELECT id FROM venture_sandbox_runs WHERE id=?').bind(id).first();
        if (!existing) return json({ detail: `run ${id} not found` }, 404);
        await DB.prepare('UPDATE venture_sandbox_runs SET status=?, founder_note=?, decided_at=? WHERE id=?')
          .bind(decision, note, new Date().toISOString(), id).run();
        return json({ ok: true, id, status: decision });
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
        return await cachedJson(request, ctx, corsHeaders, 20, async () => {
          const roster = providerRoster(env);
          // Task 45: this used to report the first BOUND provider, which is why it
          // said "claude" for days while Claude answered zero real requests. Now it
          // merges in provider_health (upserted by every generate() call, task 45's
          // fix) and reports whichever bound provider most recently actually
          // answered — falling back to "first bound, health unknown" only when no
          // provider has ever recorded a real health check yet.
          let health = [];
          try {
            const { results } = await DB.prepare(
              'SELECT provider, ok, error, checked_at, total_calls, total_tokens_in, total_tokens_out FROM provider_health'
            ).all();
            health = results || [];
          } catch { /* table not ready — health stays empty, roster still honest */ }
          const healthById = Object.fromEntries(health.map((h) => [h.provider, h]));
          // usage (Phase 2, 2026-08-18): real running totals, not per-call — see
          // recordProviderHealth()'s comment for why this reuses the same bounded
          // row instead of a growing log. 0s for a provider that's never answered,
          // never an invented estimate.
          const merged = roster.map((r) => ({
            ...r,
            health: healthById[r.id]
              ? { ok: !!healthById[r.id].ok, error: healthById[r.id].error, checked_at: healthById[r.id].checked_at }
              : { ok: null, error: null, checked_at: null }, // never actually tried yet
            usage: healthById[r.id]
              ? {
                  calls: healthById[r.id].total_calls ?? 0,
                  tokens_in: healthById[r.id].total_tokens_in ?? 0,
                  tokens_out: healthById[r.id].total_tokens_out ?? 0,
                }
              : { calls: 0, tokens_in: 0, tokens_out: 0 },
          }));
          const lastHealthy = merged
            .filter((r) => r.bound && r.health.ok === true)
            .sort((a, b) => (b.health.checked_at || '').localeCompare(a.health.checked_at || ''))[0];
          const firstBound = merged.find((r) => r.bound);
          return {
            active_provider: lastHealthy ? lastHealthy.id : (firstBound ? firstBound.id : 'simulation'),
            active_provider_basis: lastHealthy ? 'last real answer' : (firstBound ? 'first bound, no recorded health yet' : 'none bound'),
            providers: roster.filter((r) => r.bound).map((r) => r.id),
            roster: merged, // full honest list: each provider, bound or not, and its real last-known health
            // Task 52: the routing is real, so it is reported rather than left implicit.
            // `next_order` is the order a no-preference call would ACTUALLY try right now,
            // computed by the same providerOrder() the real calls use — not a description
            // of it, which is precisely the gap that let "active_provider: claude" stay
            // wrong for days.
            routing: {
              retry_after_minutes: PROVIDER_RETRY_AFTER_MS / 60000,
              job_preferences: Object.fromEntries(AGENT_WORK.map((j) => [j.agent, j.prefer || null])),
              next_order: providerOrder(env, { health: healthById }),
            },
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
            DB.prepare("SELECT title, status, actioned_at FROM hive_proposals ORDER BY id DESC LIMIT 6").all(),
            DB.prepare('SELECT colony, kind, body FROM colony_reports ORDER BY id DESC LIMIT 3').all(),
            rateLimitPeek(DB, ipCmd, env),
          ]);
          // Format made unambiguous (2026-08-06, task 44) — a real misread caught in
          // production. The old shape rendered Nanuet as "Nanuet(1743) (Queen)" while
          // every other agent rendered as "Ma'at(1200) reports to Kai El", putting a bare
          // parenthesised number directly beside the word "reports". Kai El then told the
          // founder the Queen "is currently active with 1743 reports" — 1743 is her Elo
          // rating, and no such report count exists anywhere. Nothing was hallucinated
          // from nowhere; an ambiguous string was read the only way it could be. Every
          // number now carries its own label.
          if (ag?.results?.length) ctxLines.push('Active agents: ' + ag.results.map(a =>
            `${a.name} [Elo rating ${a.elo}]${a.reports_to ? ` [reports to: ${a.reports_to}]` : ' [the Queen — reports to no one]'}` +
            (AGENT_JOBS[a.name] ? ` — real job: ${AGENT_JOBS[a.name]}` : '')
          ).join('; ') + '. NOTE: the bracketed number is an Elo rating (a ranking score from the Arena) — it is NOT a count of reports, messages, tasks, or anything else.');
          if (gov?.results?.length) ctxLines.push('Recent governance: ' + gov.results.map(g => `${g.action}/${g.article}`).join(', '));
          if (pulseRow?.detail) ctxLines.push('Last heartbeat: ' + pulseRow.detail);
          // Colonies → Queen feedback — closes the loop that was one-way until now.
          if (colonyReports?.results?.length) ctxLines.push('Recent colony reports: ' + colonyReports.results.map(c => `${c.colony} (${c.kind}): ${c.body}`).join(' | '));
          // Self-awareness (2026-08-04, task 31) — Kai El previously had no idea which
          // provider was answering him or how close to his own rate limit he was; both
          // were already computed elsewhere and simply discarded before this.
          const roster = providerRoster(env);
          // Each provider's real role is included (2026-08-06, task 43) — providerRoster()
          // has carried `role` all along and the Command Center UI displays it ("Claude —
          // Reasoning", "Groq — Speed"), but only label+bound ever reached Kai El, so asked
          // "what are the roles for Claude/Groq/Mistral" he correctly answered that they
          // "are not explicitly defined in the HIVE CONTEXT" — true of his context, while
          // the founder was looking at those exact roles on screen. Real gap, not a model
          // failure; closed by sending what already existed.
          // Task 45: this line used to end in "You reply through whichever is first-bound,
          // in the order listed" — a correct reading of the fallback-chain code that was
          // also a false statement in production, because Claude (first in the order) was
          // dead on every real call and Mistral was actually answering. Kai El repeated
          // this to the founder as fact (task 45's finding). Now it names the real, last
          // recorded outcome per provider instead of assuming code order equals reality.
          let providerHealthById = {};
          try {
            const { results } = await DB.prepare(
              'SELECT provider, ok, error, checked_at, total_calls, total_tokens_in, total_tokens_out FROM provider_health'
            ).all();
            providerHealthById = Object.fromEntries((results || []).map((h) => [h.provider, h]));
          } catch { /* table not ready */ }
          ctxLines.push('Your own providers (name — role — bound? — REAL last outcome, not assumed): ' +
            roster.map((r) => {
              const h = providerHealthById[r.id];
              const health = !r.bound ? 'not bound'
                : !h ? 'bound, never yet recorded a real call'
                  : h.ok ? `answering (as of ${h.checked_at})`
                    : `FAILING (${h.error || 'unknown error'}, as of ${h.checked_at})`;
              return `${r.label} — ${r.role} — ${health}`;
            }).join('; ') +
            '. Since 2026-08-07 the provider order is no longer fixed: each job declares a ' +
            'preferred provider ROLE (deep judgment asks for Reasoning, quick reads ask for ' +
            'Speed), and real health outranks that preference — a provider that failed in the ' +
            'last 30 minutes is automatically tried last until it recovers on its own. So the ' +
            'four keys now work as a routed team rather than a fixed fallback chain where only ' +
            'the first one was ever used. Trust the REAL outcome listed above; never assume ' +
            'first-in-order means active. Your own replies are capped at 400 tokens.');
          // Phase 2 usage visibility (2026-08-18): real running totals, not
          // Cloudflare-only — every provider you actually draw on, so a real
          // capability gap ("I'm rate-limited on X") can be stated with a real
          // number behind it instead of guessed at.
          ctxLines.push('Your own real usage since these counters last reset (calls / tokens in / tokens out, one bound provider per entry): ' +
            roster.filter((r) => r.bound).map((r) => {
              const h = providerHealthById[r.id];
              return `${r.label}: ${h?.total_calls ?? 0} calls, ${h?.total_tokens_in ?? 0} in, ${h?.total_tokens_out ?? 0} out`;
            }).join('; ') +
            '. These are real accumulated totals (provider_health, upserted on every real call), not an estimate — ' +
            'if you genuinely need more of a provider than these numbers show is realistic, that is exactly what a ' +
            'venture_capability_gaps request is for, not something to work around silently.');
          // Grok is NOT Groq (2026-08-06, task 43). Real, repeated confusion from a live
          // transcript: asked twice about "Grok", Kai El silently answered about "Groq"
          // instead — including claiming he had used it to research something. They are
          // unrelated: Groq is one of his own bound text-generation providers above; Grok
          // is xAI's separate model, reached only by a founder-operated GitHub workflow
          // (grok-bridge.yml / GROK_BRIDGE_KEY), which Kai El has no access to and no
          // visibility into. Stated explicitly so the substitution stops.
          ctxLines.push(
            'Grok vs Groq — do not confuse these: "Groq" is one of your own bound providers listed above ' +
            '(fast text generation). "Grok" is xAI\'s separate model, reached only through a founder-operated ' +
            'GitHub workflow (grok-bridge.yml); you have NO access to Grok, cannot call it, and cannot see its ' +
            'results. If asked about Grok, say plainly that it is not connected to you — never answer about ' +
            'Groq as if it were the same thing.'
          );
          // Honest capability boundary (2026-08-06, task 42) — found from a real founder
          // transcript: told only WHICH providers were bound (task 31) and nothing about
          // what a provider actually IS, Kai El filled the gap by inventing that they let
          // him "access various tools and connectors, such as e-commerce platforms, social
          // media management software, and content creation tools, to execute the venture."
          // All false. Those providers are text-generation APIs and nothing else. This is
          // exactly the founder's own stated top concern ("things saying they are connected
          // and they're not connected"), so the truthful boundary is now stated outright
          // rather than left as a silence the model papers over.
          ctxLines.push(
            'What you can actually DO, precisely (never claim more than this list): your providers above are ' +
            'TEXT-GENERATION APIs only — they give you no tools, no connectors, no plugins, no internet ' +
            'browsing, and no ability to log into or operate any external service. Your only real ability ' +
            'beyond writing a reply is that starting your reply with "CONCERN: <title>" or "PROPOSAL: <title>" ' +
            'durably files that for the founder. You cannot execute anything yourself: no e-commerce store, ' +
            'no social/marketing account, no posting, no purchasing, no code deployment, no file access. ' +
            'A separate founder-approval-gated path exists for three narrow GitHub actions (rerun CI, open an ' +
            'issue, dispatch a named workflow) but YOU do not invoke it — the founder does, after approving a ' +
            'proposal. If asked what tools you need or would like, answer as a genuine wish/requirement list ' +
            'and say plainly you do not have them yet — never imply you already do. You also cannot RESEARCH ' +
            'anything: you cannot browse, search, look anything up, or call one provider to go find out. If ' +
            'asked to research something, what you can genuinely offer is what you already know, labelled as ' +
            'such — never narrate it as "I used X to research this and found...", which describes an action ' +
            'you did not take.'
          );
          if (rlCurrent !== null) ctxLines.push(`Your own rate limit right now: ${rlCurrent}/30 requests this minute from this caller.`);
          // The actual answer to "what are you working on / what are your goals" —
          // without this, Kai El had nothing but agent scores and governance trivia
          // to draw on, so that question could never get a real answer no matter
          // how the model tried.
          // actioned_at included (2026-08-06, task 43): "approved" and "approved AND the
          // work is actually done" are genuinely different states, and only actioned_at
          // distinguishes them. Without it Kai El could truthfully say "all approved"
          // while three of those approvals had real work still sitting untouched — an
          // accurate sentence that leaves a false impression, which F-004 (Explainability)
          // cares about just as much as an outright wrong one.
          if (props?.results?.length) ctxLines.push('Recent proposals (title [status] — work done?): ' + props.results.map(p =>
            `${p.title} [${p.status}]${p.status === 'approved' ? (p.actioned_at ? ' — work DONE ' + p.actioned_at : ' — approved but work NOT started yet') : ''}`).join(' | '));
          // Genome awareness (2026-08-04, task 33) — see GENOME_CHROMOSOMES above for
          // why this is a short hand-maintained list rather than a live file fetch.
          ctxLines.push('Your own genome (FABLE_DNA.md chromosomes): ' +
            GENOME_CHROMOSOMES.map(([n, title, gist]) => `${n} (${title}) — ${gist}`).join(' | '));
        } catch {}
        // retrieval-augmented: pull relevant memories when the index exists.
        // kaiRecall (2026-08-10) re-ranks by age before truncating to 3 — the
        // plain recall() below it stores a ts on every memory and never reads it,
        // so a day-one fact could outrank today's purely on wording. Falls back to
        // the raw ordering automatically when the index is absent.
        try {
          const mem = await kaiRecall(env, cmd, 3);
          if (mem.available && mem.matches.length)
            ctxLines.push('Recalled memory (most recent first where relevance ties): ' + mem.matches.map(m => m.text).join(' | '));
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
          "that's the detail you have rather than inventing further specifics. Recent proposals are listed in HIVE " +
          "CONTEXT with each one's own real status — when asked about MULTIPLE proposals or items together, check " +
          "each one's actual status individually before summarizing; never claim a single blanket status ('all " +
          "approved', 'all done') unless every item you're describing genuinely shares that exact status in the " +
          "list. If the list is mixed, say so plainly (e.g. name which are approved vs. still pending) rather than " +
          "rounding up to the most favorable answer. HIVE CONTEXT also states precisely what you can actually " +
          "do — treat that as a hard ceiling on any capability claim. Never say or imply you can reach, use, " +
          "operate, or execute anything outside it (no e-commerce platforms, no social/marketing accounts, no " +
          "browsing, no connectors or plugins), and never describe your LLM providers as if they grant tool " +
          "access — they generate text and nothing more. Asked what you need or would want, name it as a real " +
          "wish and say plainly you don't have it yet. Answer the sovereign directly in " +
          "1-4 sentences, using the live hive context when relevant. Never invent metrics you weren't given. " +
          "You now have a real bridge to the harness (the hive's engineering session) and, through it, to the " +
          "founder outside this chat: if — and only if — this exchange surfaces a genuine concern (a real risk, " +
          "blocker, or constitutional/security issue worth the founder's attention soon) or a genuine architecture " +
          "proposal (a concrete suggestion for how the hive should be built or evolve, your role as architect), " +
          "start your reply's first line with exactly 'CONCERN: <short title>' or 'PROPOSAL: <short title>', then " +
          "a blank line, then your normal answer. Use this rarely — most exchanges warrant neither marker; forcing " +
          "one when nothing genuine is there defeats the point of having it at all.";
        // Architect proposals with a real diff (2026-08-10, Kai El's first evolution
        // into an architect agent) — stage 3 (KAI_TAB_DRAFT) made real, per the
        // founder's own scoping. Explicit v1 scope: the founder names the target file
        // (body.target_file), Kai El never self-selects one — self-directed repo-wide
        // discovery is a materially bigger capability and out of scope here. When the
        // switch is off or no file is named, this changes nothing: same SYSTEM, same
        // prose-only PROPOSAL: path that has always existed.
        let architectFile = null;
        const targetFile = (body.target_file || '').toString().trim();
        let ARCHITECT_SYSTEM_ADDENDUM = '';
        let ARCHITECT_PROMPT_ADDENDUM = '';
        if (targetFile && switchOn(env, 'KAI_TAB_DRAFT')) {
          architectFile = await fetchRepoFile(env, targetFile);
          if (architectFile.available) {
            ARCHITECT_SYSTEM_ADDENDUM =
              " The sovereign has asked you to architect a change to a real file, whose CURRENT " +
              "content (fetched fresh from the repo, not from memory) follows below. If — and only " +
              "if — a genuine, concrete code change is warranted, reply with 'PROPOSAL: <short " +
              "title>', a blank line, your normal explanation, then a fenced ```diff block containing " +
              "a real unified diff against the exact content shown (correct file paths, correct " +
              "context lines — a diff that does not apply is worse than no diff, since it wastes the " +
              "founder's review time on something unusable). You draft the diff; you never apply it " +
              "yourself — a human always reviews and applies it. If no real change is warranted, say " +
              "so plainly instead of forcing a diff that doesn't need to exist.";
            ARCHITECT_PROMPT_ADDENDUM =
              `\n\nCURRENT CONTENT of ${architectFile.path} (ref: ${architectFile.ref}):\n` +
              '```\n' + architectFile.text.slice(0, 12000) + '\n```\n';
          } else {
            // Honest failure, not silent: the sovereign asked to target a file that
            // could not be fetched. Kai El is told so explicitly rather than silently
            // falling back to a normal chat reply with no explanation of why no diff
            // appeared.
            ARCHITECT_PROMPT_ADDENDUM =
              `\n\n(The sovereign asked you to architect a change to ${targetFile}, but its current ` +
              `content could not be fetched: ${architectFile.reason}. Say so plainly rather than ` +
              `guessing at the file's content or drafting a diff you cannot ground in anything real.)\n`;
          }
        }
        // Route through the provider waterfall (Claude → Groq → Mistral →
        // Workers AI): Kai delegates automatically, and whichever key the
        // founder has bound answers. Workers AI keeps the proven prompt-string
        // shape inside generate() — the path the heartbeat runs live.
        const userPrompt =
          (ctxLines.length ? 'HIVE CONTEXT:\n' + ctxLines.join('\n') + '\n\n' : '') +
          (historyLines.length ? 'RECENT CONVERSATION:\n' + historyLines.join('\n') + '\n\n' : '') +
          'SOVEREIGN: ' + cmd + ARCHITECT_PROMPT_ADDENDUM + '\n\nKAI EL:';
        // Optional {"provider":"claude"|"groq"|"mistral"|"workers-ai"} pins this one call
        // to a single key (task 44) so each bound provider can actually be exercised and
        // proven, instead of Claude silently answering everything forever. Unknown names
        // are rejected outright rather than ignored — quietly falling back to the default
        // waterfall would make a per-provider test report the wrong key.
        const wantProvider = (body.provider || '').toString().trim().toLowerCase() || null;
        if (wantProvider && !PROVIDERS.some((pr) => pr.id === wantProvider)) {
          return json({ detail: `unknown provider '${wantProvider}' — valid: ${PROVIDERS.map((pr) => pr.id).join(', ')}` }, 400);
        }
        // A diff-drafting reply needs real room — 400 tokens is enough for prose alone
        // but would truncate a real diff mid-hunk, which is worse than no diff at all.
        const gen = await generate(env, {
          system: SYSTEM + ARCHITECT_SYSTEM_ADDENDUM,
          prompt: userPrompt,
          maxTokens: ARCHITECT_SYSTEM_ADDENDUM ? 1200 : 400,
          only: wantProvider,
        });
        if (!gen && wantProvider) {
          return json({ detail: `provider '${wantProvider}' is bound-but-unreachable or returned nothing; not falling back to another provider, since that would misreport which key answered`, provider_requested: wantProvider }, 502);
        }
        if (gen) {
          // remember the exchange so the hive's memory grows from conversation too
          // (ctx.waitUntil now that fetch carries ctx — was a latent ReferenceError)
          ctx?.waitUntil?.(remember(env, 'chat-' + Date.now(), `Kai El on "${cmd.slice(0, 80)}": ${gen.text.slice(0, 200)}`, { kind: 'chat', ts: new Date().toISOString() }));
          // ...and into Kai El's own brain (2026-08-10): the FULL exchange, not the
          // 200-char slice the line above stores, plus a decision row and a future
          // fine-tuning pair. All three no-op unless KAI_BRAIN is bound AND
          // KAI_BRAIN_WRITE is on, so this changes nothing until stage 1 is flipped.
          // waitUntil, not await: Kai El's reply must never wait on his own
          // bookkeeping, and a brain write failing must never fail a chat reply.
          if (kaiBrainOk(env) && switchOn(env, 'KAI_BRAIN_WRITE')) {
            const brainWork = (async () => {
              const d = await logDecision(env, {
                surface: 'chat', request: cmd, action: gen.text,
                autonomy_mode: 'explicit-invoke', provider: gen.provider,
                tokens_in: gen.usage?.input_tokens, tokens_out: gen.usage?.output_tokens,
              });
              await kaiRemember(env, {
                id: 'kai-chat-' + Date.now(), kind: 'chat', source: 'command_text',
                text: `Founder asked: ${cmd}\n\nKai El answered: ${gen.text}`,
                summary: gen.text.slice(0, 200),
              });
              await logTrainingSample(env, {
                user_input: cmd, assistant_output: gen.text,
                source_decision_id: d.id ?? undefined,
              });
            })();
            ctx?.waitUntil?.(brainWork);
          }
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
              // Council check (queenDecide()) same as every other proposal path — a
              // diff-carrying proposal goes through EXACTLY the same governance chain
              // as a prose one, unchanged, per the founder's own explicit choice.
              //
              // A diff block (2026-08-10) is optional and additive: extracted here if
              // present, stored alongside the same prose body, never routes around
              // queenDecide(). ACTION_ALLOWLIST/executeApprovedAction() are untouched —
              // this proposal, diff or not, still never executes anything itself. A
              // human (the founder, or a Claude Code session) applies it.
              const diffBlock = extractDiffBlock(gen.text);
              ctx?.waitUntil?.((async () => {
                const { qStatus, qScore, qDecidedBy, qDecidedAt, elderNote } = await queenDecide(env, request.url, { title, body: gen.text });
                const r = await DB.prepare(
                  'INSERT INTO hive_proposals (ts, kind, title, body, status, alignment_score, decided_by, decided_at, elder_note, diff, diff_files, diff_check) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
                ).bind(
                  new Date().toISOString(), 'architect-proposal', title, gen.text, qStatus, qScore, qDecidedBy, qDecidedAt, elderNote,
                  diffBlock?.diff ?? null,
                  diffBlock ? JSON.stringify(diffBlock.files) : null,
                  diffBlock ? 'pending' : null
                ).run();
                // Close the loop with Kai El's own brain (Phase A) — proposing a real
                // code change is exactly the case the high-risk enforcement in
                // logDecision() exists for: it refuses to log without both a reason
                // and a handling plan, so this cannot become a silent, unexplained
                // high-risk entry.
                if (diffBlock && kaiBrainOk(env) && switchOn(env, 'KAI_BRAIN_WRITE')) {
                  await logDecision(env, {
                    surface: 'chat', request: `architect: ${targetFile}`, action: title,
                    risk_tier: 'high',
                    risk_reason: `Proposes a real code change to ${diffBlock.files.join(', ') || targetFile}; an untested or ` +
                      'unapplied diff can silently diverge from what founder review believes was proposed.',
                    risk_handling: 'Diff is stored unapplied and dry-run checked by a separate GitHub Action ' +
                      '(git apply --check) before the founder decides; nothing executes it — a human always applies it.',
                    autonomy_mode: 'draft-approve', provider: gen.provider,
                    tokens_in: gen.usage?.input_tokens, tokens_out: gen.usage?.output_tokens,
                  });
                }
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

      // ── Kai El's brain (2026-08-10) ───────────────────────────────────
      // Read-only, unauthenticated status — same posture as /memory/status and
      // /debug/*: real state, no secret values, and honest about what is off.
      if (p === '/kai/brain') {
        const st = { bound: kaiBrainOk(env), write_enabled: switchOn(env, 'KAI_BRAIN_WRITE'), counts: null };
        if (st.bound) {
          try {
            const r = await env.KAI_BRAIN.prepare(
              `SELECT (SELECT COUNT(*) FROM memories) AS memories,
                      (SELECT COUNT(*) FROM decision_log) AS decisions,
                      (SELECT COUNT(*) FROM training_samples) AS training_samples,
                      (SELECT COUNT(*) FROM training_samples WHERE eligible=1) AS training_eligible`
            ).first();
            st.counts = r || null;
          } catch (e) { st.error = String(e); }
        }
        return json({
          ...st,
          recency: { half_life_days: RECENCY_HALF_LIFE_DAYS, floor: RECENCY_FLOOR },
          fourdbrain: {
            switch_on: switchOn(env, 'KAI_4DBRAIN_BRIDGE'),
            url_set: !!String(env?.FOURDBRAIN_URL ?? '').trim(),
            note: String(env?.FOURDBRAIN_URL ?? '').trim()
              ? 'configured'
              : '4DBRAIN is not deployed anywhere yet — its hive.yml base_url is empty and its Railway/Render configs were never provisioned',
          },
        });
      }
      // The staged-autonomy ladder: what Kai El can do, what he cannot yet, and
      // exactly what the founder does to grant each next stage. Live env state is
      // joined onto the registry's documentation — the registry never stores
      // enablement, precisely so writing to it cannot grant anything.
      if (p === '/kai/autonomy') {
        const state = autonomyState(env);
        let rows = [];
        if (kaiBrainOk(env)) {
          try {
            const r = await env.KAI_BRAIN.prepare(
              'SELECT key, stage, title, description, turn_on_steps, risk_note, requires FROM autonomy_registry ORDER BY stage'
            ).all();
            rows = r?.results || [];
          } catch { rows = []; }
        }
        const ladder = rows.map(row => ({
          ...row,
          enabled: !!state[row.key],
          blocked_by: row.requires && !state[row.requires] ? row.requires : null,
        }));
        return json({
          agent: 'Kai El',
          ladder,
          enabled_now: Object.entries(state).filter(([, v]) => v).map(([k]) => k),
          next_stage: ladder.find(l => !l.enabled) ?? null,
          note: 'Enablement is read from deploy-time environment variables only, never from this database — an agent that can write its own permissions has none.',
        });
      }
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
        // Cloudflare Access (2026-08-09) — presence-only, same discipline as every
        // other row here (F-001: names/booleans, never values). ACCESS_AUD/
        // FOUNDER_EMAIL are plain vars, not secrets, but still reported this way
        // for consistency and because it's what roadmapFounderActions() below reads
        // to derive the founder-actions row for this switch.
        bindings.ACCESS_CONFIGURED = !!(env.FOUNDER_EMAIL && env.ACCESS_AUD);
        // report which expected secrets are set, by presence only
        // FOUNDER_KEY added 2026-08-06 (task 35 investigation) — frontend/src/utils/
        // readiness.ts:48 has always checked secrets_present.includes('FOUNDER_KEY') for
        // the "Queen's Progress" meter, but this array never included it, so that check
        // was permanently false and the meter permanently undercounted by one hive-wide
        // switch whenever FOUNDER_KEY was actually bound. Presence-only, same as the
        // other two (F-001: names/booleans, never values).
        // FOUNDER_KEY moved to Secrets Store 2026-08-08 — a plain `typeof === 'string'`
        // check would silently regress to permanently-absent again (Secrets Store
        // bindings are objects), the exact same class of bug this comment already
        // describes. resolveSecret() normalizes both binding shapes to a real string
        // or null, so it's used uniformly for all three expected secrets.
        const expectedSecrets = ['GROK_BRIDGE_KEY', 'CLOUDFLARE_API_TOKEN', 'FOUNDER_KEY'];
        const secrets_present = [];
        for (const k of expectedSecrets) {
          if (await resolveSecret(env[k])) secrets_present.push(k);
        }
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
        // Visible in Updates (task 49). A colony reporting in is real background work;
        // before this it landed in its own table and left no trace the founder would see.
        ctx?.waitUntil?.(postUpdate(DB, {
          kind: 'colony-report', title: `${colony} reported in (${kind})`, body: reportText,
        }));
        return json({ ok: true });
      }
      // The CAMPAIGN.html task queue, pushed in by .github/workflows/task-digest.yml
      // (task 48). Founder-key gated: this is what the autonomous agents reason over, so
      // an anonymous caller must not be able to feed them a fabricated task list.
      if (p === '/hive/task-digest' && method === 'POST') {
        if (!(await founderAuthOk(request, env))) {
          return json({ detail: (await founderKeyBound(env)) ? 'invalid or missing founder key' : 'no FOUNDER_KEY bound yet' }, 401);
        }
        const dBody = await request.json().catch(() => ({}));
        const digest = (dBody.body || '').toString().trim().slice(0, 4000);
        if (!digest) return json({ detail: 'body required' }, 400);
        await DB.prepare('INSERT INTO task_digest (ts, body) VALUES (?,?)')
          .bind(new Date().toISOString(), digest).run();
        // Keep only the newest few — agents read the latest, history lives in git.
        await DB.prepare('DELETE FROM task_digest WHERE id NOT IN (SELECT id FROM task_digest ORDER BY id DESC LIMIT 5)').run().catch(() => {});
        return json({ ok: true, chars: digest.length });
      }
      if (p === '/hive/task-digest' && method === 'GET') {
        const row = await DB.prepare('SELECT ts, body FROM task_digest ORDER BY id DESC LIMIT 1').first().catch(() => null);
        return json(row || { ts: null, body: null, note: 'no digest posted yet' });
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

      // Task 14's own Acceptance requires an OBSERVED live round trip, not just
      // code that compiles — and the only real trigger (the heartbeat) fires on
      // a 30-min cron, far too slow for a CI job to wait on. This lets
      // edge-health-probe.yml open a real /v11/ws connection, POST here, and
      // confirm the exact message arrives — deterministic, no 30-min wait,
      // same spirit as the other /debug/* diagnostics (no state mutation, no
      // auth gate, nothing here is ever a real hive action).
      if (p === '/debug/ws-broadcast-test' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const payload = { kind: 'debug-test', title: body.title || 'ws-broadcast-test' };
        await broadcastToCommandCenter(env, payload);
        return json({ broadcasted: true, payload });
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
            'GET /kai/brain', 'GET /kai/autonomy',
            'GET /tier3/status', 'GET /arena/challenges', 'GET /arena/fallen',
            'POST /arena/challenge (token+rate-limited)', 'POST /arena/resolve/{id} (token+rate-limited)',
            'POST /arena/project/{id} (token+rate-limited)', 'POST /auth/token',
            'GET /debug/health', 'GET /debug/env', 'GET /debug/git', 'GET /debug/logs',
            'GET /debug/colony-ping', 'GET /debug/endpoints',
            'GET /ws (real-time push, Durable Object)', 'POST /debug/ws-broadcast-test',
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

// Real-time Command Center push (task 14). Cloudflare instantiates exactly
// one of these per `idFromName('global')` — every connected browser lands in
// the same instance, so a broadcast from anywhere (currently: the heartbeat
// in scheduled(), via broadcastToCommandCenter()) reaches every open tab.
// `fetch()` needs the runtime's real WebSocketPair/101 upgrade, which
// node --test can't drive — worker/test/command-center-do.test.js instead
// exercises _addSession()/_broadcast() directly against a stub socket
// (send()/addEventListener() only), the same "test the real logic behind a
// minimal stub" discipline the rest of this suite already uses.
export class CommandCenterDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Set();
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/broadcast') {
      const payload = await request.json().catch(() => ({}));
      this._broadcast(payload);
      return new Response('ok');
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this._addSession(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  _addSession(ws) {
    this.sessions.add(ws);
    const drop = () => this.sessions.delete(ws);
    ws.addEventListener('close', drop);
    ws.addEventListener('error', drop);
  }

  _broadcast(payload) {
    const msg = JSON.stringify({ type: 'update', ...payload });
    for (const ws of this.sessions) {
      try {
        ws.send(msg);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }
}

// ── Named exports, for tests only ────────────────────────────────────────
// The Worker runtime only ever uses `export default` above; these extra named
// exports are inert in production and exist so worker/test/*.test.js can import
// the real functions instead of copying them.
//
// Why this block exists at all (2026-08-07, task 15): this file had ZERO automated
// tests. A previous session wrote 38 real assertions against the provider-routing
// logic and left them in a scratch directory that dies with the container — tests
// that cannot be re-run are not much better than no tests, and the next session
// would have had no way to know they ever existed. Exporting the pure, testable
// pieces is what makes a committed test suite possible without duplicating logic
// into the tests, where it would silently drift from the real thing.
export {
  PROVIDERS,
  PROVIDER_RETRY_AFTER_MS,
  providerOrder,
  providerRoster,
  generate,
  AGENT_WORK,
  resolveSecret,
  founderKeyBound,
  broadcastToCommandCenter,
  verifyAccessJWT,
  // Kai El's brain (2026-08-10) — exported so worker/test/kai-brain.test.js drives
  // the real functions rather than a reimplementation of them.
  KAI_SWITCHES,
  switchOn,
  autonomyState,
  kaiBrainOk,
  kaiRemember,
  kaiRecall,
  recencyWeight,
  RECENCY_HALF_LIFE_DAYS,
  RECENCY_FLOOR,
  logDecision,
  logTrainingSample,
  fourDBrain,
  fetchRepoFile,
  extractDiffBlock,
  nextWorkTurnIndex,
  runWorkCycle,
  recordProviderHealth,
};
