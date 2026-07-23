# FLIP_THE_SWITCHES — everything built and waiting on a founder switch

> The pattern: the code ships live and degrades honestly (`available:false`, "key needed",
> `vectorize_bound:false`) until you provision the resource. Nothing pretends. Each switch
> below is one-time; the feature lights up on the next deploy/heartbeat with zero code changes.
> All of these run from the repo root with `npx wrangler …` logged into the hive's Cloudflare
> account (`npx wrangler login` once, in a terminal — not something the hive can or should do).

## 1 · Sovereign memory (Vectorize) → "Vectorize memory bound: true"

```bash
npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine
```
Then uncomment the `"vectorize"` block in `wrangler.jsonc`, commit, push.
**Proof it worked:** `GET /v11/memory/status` → `vectorize_bound: true`; memory fills on the
next heartbeat; Kai El starts recalling past exchanges in the commune.

## 2 · Files store (R2) → the Files panel uploads/lists for real

```bash
npx wrangler r2 bucket create hive-files
```
Then uncomment the `"r2_buckets"` block in `wrangler.jsonc`, commit, push.
**Proof:** `GET /v11/files` → `available: true`; the Files panel shows the Upload button
working (visitor-token gated, 10 MB cap).

## 3 · Extra model voices → Claude / Groq / Mistral read "online"

The Worker already routes the commune through a waterfall (Claude → Groq → Mistral →
Workers AI). Each provider activates the moment its key exists as a Worker secret:

```bash
npx wrangler secret put ANTHROPIC_API_KEY   # Claude — reasoning
npx wrangler secret put GROQ_API_KEY        # Groq — speed
npx wrangler secret put MISTRAL_API_KEY     # Mistral
```
No config edit needed — secrets bind on the next deploy.
**Proof:** `GET /v11/llm/status` → the provider's `bound: true`; the Connected Models panel
flips it from "key needed" to "online"; Kai El's replies return `provider: "claude"` (or
whichever is highest in the waterfall).

Keys live only as Cloudflare secrets — never in the repo, never echoed back (F-001: the
debug surface reports names/presence only).

## 4 · Founder key → the Proposals panel can actually approve/reject

The hive can now draft standing suggestions ("Proposals" in the left nav) — new
implementations, goals, changes it thinks are worth doing. Nothing is ever applied on its own;
every item waits for your explicit approve/reject. That decision endpoint is deliberately
**fail-closed**: with no key bound, nobody — not even you, from the UI — can decide anything,
rather than defaulting to "anyone can."

```bash
npx wrangler secret put FOUNDER_KEY   # pick any strong random value yourself
```
Then paste that same value into the Proposals panel's key field (stored only in your
browser's localStorage, never sent anywhere except the `Authorization` header on decide calls).
**Proof:** `GET /v11/proposals` → `founder_auth_bound: true`; Approve/Reject buttons work.

## 5 · Rate-limit counters (KV) → anti-spam moves off D1 — ✅ FLIPPED 2026-07-23

Flipped at the founder's "go for phase 8": namespace `RATE_LIMIT_KV`
(id `7ca8178dc4bc40e7bac193362e3d6be4`) created via the Cloudflare MCP connector, binding
uncommented in `wrangler.jsonc`, deployed. **Proof:** no visible behavior change (still
30 POSTs/min/IP) — the D1 `rate_limits` table simply stops growing, since `rateLimitOk()`
prefers KV the moment the binding exists.

## 6 · Async LLM jobs (Queues) → venture/plan and legal/research can run decoupled

> Status 2026-07-23: still parked — the Cloudflare MCP connector available to sessions has
> no queue-creation tool (KV/R2/D1 only), so this one still needs the founder's own
> `npx wrangler queues create` below. Everything else about the flip is unchanged.

```bash
npx wrangler queues create hive-llm-jobs
```
Then, **in the same commit**: uncomment the `"queues"` block in `wrangler.jsonc` **and**
re-attach the consumer handler in `worker/src/index.js` — add `queue: processQueueBatch,`
inside the `export default { ... }` object (the function already exists just above it).
These two must always move together: a Worker that exports a `queue()` consumer handler
while the `queues.consumers` binding is commented out fails Workers Builds' pre-deploy
validation — this exact mismatch silently broke every production deploy from 2026-07-21
until diagnosed 2026-07-22 (see PR_LESSONS.md). Commit, push. Nothing changes for
existing callers — both endpoints stay fully synchronous by default. **Proof:**
`POST /v11/venture/plan` (or `/v11/legal/research`) with `{"async": true}` in the body now
returns `202 {job_id, poll: "/v11/jobs?id=..."}` instead of `503`; `GET /v11/jobs?id=<job_id>`
then shows `status` moving from `queued` to `done` (or `error`, with the reason) once the
Queues consumer runs.

## Already flipped / no switch needed
- D1 database, Workers AI, assets, the 30-min heartbeat — live now.
- The UI (graph web, neon theme, Updates, Legal Learning, Files panel shell) — ships with
  the frontend build; no provisioning.
- CORS scoping, list-endpoint pagination, and Cache API edge-caching (`/agents`, `/roadmap`,
  `/llm/status`) — all code-only, no resource to provision, live on the next deploy.

*2026-07-17 — written alongside the audit-driven Command Center update. Switches 5-6 added
2026-07-21 (Phase 8 professionalization pass). When you flip one, tell the hive and it will
re-probe and confirm from the live surface, not assume.*
