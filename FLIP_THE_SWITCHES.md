# FLIP_THE_SWITCHES — everything built and waiting on a founder switch

> The pattern: the code ships live and degrades honestly (`available:false`, "key needed",
> `vectorize_bound:false`) until you provision the resource. Nothing pretends. Each switch
> below is one-time; the feature lights up on the next deploy/heartbeat with zero code changes.
> All of these run from the repo root with `npx wrangler …` logged into the hive's Cloudflare
> account (`npx wrangler login` once, in a terminal — not something the hive can or should do).

## 1 · Sovereign memory (Vectorize) → "Vectorize memory bound: true" — ✅ FLIPPED 2026-08-03

Index `hive-memory` created, binding uncommented in `wrangler.jsonc`.
**Proof it worked:** `GET /v11/memory/status` → `vectorize_bound: true`; memory fills on the
next heartbeat; Kai El starts recalling past exchanges in the commune.

## 2 · Files store (R2) → the Files panel uploads/lists for real — ✅ FLIPPED 2026-08-03

Bucket `hive-files` created, binding uncommented in `wrangler.jsonc`. A 9 GB total-storage
cap was added in `/files/upload` on top of the existing 10 MB per-file cap — R2's free tier
is 10 GB-months, so the hive refuses new uploads before it could ever cross into a real
charge (`507` with an honest reason, not a silent failure). Raising the cap is a founder
decision, not automatic.
**Proof:** `GET /v11/files` → `available: true`; the Files panel shows the Upload button
working (visitor-token gated, 10 MB per-file cap, 9 GB total cap).

## 3 · Extra model voices → Claude / Groq / Mistral read "online" — ✅ FLIPPED 2026-08-03

The Worker already routes the commune through a waterfall (Claude → Groq → Mistral →
Workers AI). All three keys are now bound as Worker secrets.
**Proof:** `GET /v11/llm/status` → the provider's `bound: true`; the Connected Models panel
flips it from "key needed" to "online"; Kai El's replies return `provider: "claude"` (or
whichever is highest in the waterfall).

Keys live only as Cloudflare secrets — never in the repo, never echoed back (F-001: the
debug surface reports names/presence only).

## 4 · Founder key → the Proposals panel can actually approve/reject — ✅ FLIPPED 2026-08-03

The hive can now draft standing suggestions ("Proposals" in the left nav) — new
implementations, goals, changes it thinks are worth doing. Nothing is ever applied on its own;
every item waits for your explicit approve/reject. That decision endpoint is deliberately
**fail-closed**: with no key bound, nobody — not even you, from the UI — can decide anything,
rather than defaulting to "anyone can." `FOUNDER_KEY` is now bound.
**Proof:** `GET /v11/proposals` → `founder_auth_bound: true`; Approve/Reject buttons work
once the same key value is pasted into the Proposals panel's key field (stored only in your
browser's localStorage, never sent anywhere except the `Authorization` header on decide calls).

## 5 · Rate-limit counters (KV) → anti-spam moves off D1 — ✅ FLIPPED 2026-07-23

Flipped at the founder's "go for phase 8": namespace `RATE_LIMIT_KV`
(id `7ca8178dc4bc40e7bac193362e3d6be4`) created via the Cloudflare MCP connector, binding
uncommented in `wrangler.jsonc`, deployed. **Proof:** no visible behavior change (still
30 POSTs/min/IP) — the D1 `rate_limits` table simply stops growing, since `rateLimitOk()`
prefers KV the moment the binding exists.

## 6 · Async LLM jobs (Queues) → venture/plan and legal/research can run decoupled — ✅ FLIPPED 2026-08-03

Queue `hive-llm-jobs` created; `wrangler.jsonc`'s `"queues"` block and `worker/src/index.js`'s
`queue: processQueueBatch` export were uncommented/re-attached together in the same commit,
exactly per the warning below (this two-part rule exists because splitting them broke every
production deploy from 2026-07-21 until diagnosed 2026-07-22 — see PR_LESSONS.md L-08).
Nothing changes for existing callers — both endpoints stay fully synchronous by default.
**Proof:**
`POST /v11/venture/plan` (or `/v11/legal/research`) with `{"async": true}` in the body now
returns `202 {job_id, poll: "/v11/jobs?id=..."}` instead of `503`; `GET /v11/jobs?id=<job_id>`
then shows `status` moving from `queued` to `done` (or `error`, with the reason) once the
Queues consumer runs.

## 7 · Action-request execution → approved Kai El action-requests actually run

The hive can now propose a small set of bounded, allow-listed real actions
(`rerun_ci`, `open_issue`, `dispatch_workflow` on a fixed workflow allow-list — see
`worker/src/index.js`'s `ACTION_ALLOWLIST`) via `POST /v11/proposals/action-request`.
Creation is already gated (off-allow-list requests are rejected with 400 before they
ever become a pending proposal) and approval is already gated (`FOUNDER_KEY`, same as
every other proposal decision) — this switch only controls whether an *approved* one
can actually reach GitHub, or just gets recorded as approved with nothing executed.

```bash
npx wrangler secret put GITHUB_ACTIONS_TOKEN
```
Use a fine-grained PAT scoped only to `TehutiRaEl/THEHIVE`, with the minimum
permissions the three allow-listed actions need: Actions (read/write, for reruns and
workflow dispatch) and Issues (write, for opening issues). No config edit needed —
secrets bind on the next deploy.
**Proof it worked:** approve a pending `action-request` proposal via
`POST /v11/proposals/:id/decide` → the response's `execution.executed` is `true`
(previously `false` with a "no GITHUB_ACTIONS_TOKEN bound yet" reason).

## 8 · Federation PR review → every open colony PR gets a real automated first pass

`.github/workflows/federation-pr-review.yml` (task 9b) runs every 6 hours, reads the
real colony repo list from `.queen/hive.yml`, and posts one real, evidence-cited comment
(mergeable state + real CI check status, never an opinion) on every open PR that doesn't
already have one — comment-only, never approves/merges/blocks. Without a token bound it
still runs on schedule and logs an honest no-op (see the workflow's own guard step).

```bash
gh secret set HIVE_FEDERATION_TOKEN --repo TehutiRaEl/THEHIVE
```
Use a fine-grained PAT with Pull requests (read/write) and Issues (read) scoped to the
real colony repos in `.queen/hive.yml` (currently: `aether`, `automatisch`, `Kimi-K2`,
`free-programming-books`, `freeCodeCamp`, `NAR2`, `4DBRAIN`, `sovereign-hive-meta` — the
workflow always re-derives this list from the manifest at run time, never a separate
hardcoded copy).
**Proof:** trigger the workflow manually (`workflow_dispatch`) → an open PR in one of
those repos gets a real comment starting `<!-- hive-federation-pr-review -->` within the
run.

The same `HIVE_FEDERATION_TOKEN` also gates `.github/workflows/federation-issue-triage.yml`
(task 9c) — one secret, two federation-wide read/label workflows, no separate token needed.
That one labels untriaged open issues (best-effort bug/enhancement/question + a narrow,
explicit urgent-keyword flag — see the workflow's own header for the exact list) and
mirrors results into one "Federation Issue Triage Queue" tracking issue in THEHIVE, same
shape as `kai-el-bridge.yml`'s concerns/proposals queue. Never transfers, closes, or
assigns an issue.

## 9 · The Queen's real approval power — proposals ≥98% aligned with your vision auto-approve

The founder asked for this explicitly (2026-08-03): the Queen (Nanuet) can review a
pending proposal against a real, written reference of your vision
(`docs/FOUNDERS_VISION.md` — a first draft, meant to be edited by you directly) and
auto-approve it herself when the alignment score is 98 or higher, so most decisions
don't have to wait on you. Ships real and complete, same as every other switch here —
**off by default** until you flip it, so nothing changes until you decide to turn it on.

One built-in boundary that's true regardless of the switch: a proposal already flagged
`action-request` kind (the ones that can reach real GitHub execution — switch 7) never
auto-approves, no score high enough to skip that — those already run through the
separate `ACTION_ALLOWLIST` gate because they touch something real outside the hive.
Everything else — new features, fixes, agent-role changes, architecture proposals — is
in scope for the Queen's own judgment once this is flipped on.

```bash
npx wrangler secret put QUEEN_AUTONOMOUS_APPROVAL   # any non-empty value turns it on
```
**Proof it worked:** `GET /v11/proposals` → `queen_auto_approval_bound: true`; a new
proposal that clearly, concretely serves `docs/FOUNDERS_VISION.md` comes back already
`status: "approved"`, `decided_by: "queen"`, with a real `alignment_score` — visible in
the exact same Proposals panel you already use, nothing hidden.

## Already flipped / no switch needed
- D1 database, Workers AI, assets, the 30-min heartbeat — live now.
- The UI (graph web, neon theme, Updates, Legal Learning, Files panel shell) — ships with
  the frontend build; no provisioning.
- CORS scoping, list-endpoint pagination, and Cache API edge-caching (`/agents`, `/roadmap`,
  `/llm/status`) — all code-only, no resource to provision, live on the next deploy.

## 10. The work cycle — ON by default, this is the OFF switch

**This one is backwards from every other switch on this page, on purpose.**

Every switch above is off until you turn it on. The work cycle is **already running** —
one agent per hour, taking a real turn on real hive state, posting what it finds to the
Updates channel with the measured token cost attached.

That inversion is deliberate. The founder's own words, 2026-08-06: *"after flipping the
switches, I thought would do so, but it hasn't been done yet."* Flipping switches bound
capabilities; it never created work, because no code ever asked the agents to do any. A
tenth switch sitting off would have reproduced exactly that. So the work exists by
default, and this is how you stop it:

```bash
npx wrangler secret put HIVE_WORK_CYCLE   # enter: off
```

Any value other than `off` (or no secret at all) leaves the cycle running.

**What it costs, measured not estimated:** roughly 24 LLM calls a day, one per hour,
~2,000 tokens each. Every single turn logs its real token count and which provider
actually answered, so the decision to speed it up or slow it down is made on a real
number. The Arena half of the heartbeat still runs every 30 minutes and costs nothing —
it is pure Elo math.

**What it can and cannot do:** agents write only to `hive_updates` and `hive_proposals`,
both add-only and both founder-reviewed. No agent can approve, merge, execute, or spend.
Ptah's turn may draft a `PROPOSAL:`, which runs through the same Queen scoring and
Elders' Council veto as every other proposal, and still waits for you.

---

*2026-07-17 — written alongside the audit-driven Command Center update. Switches 5-6 added
2026-07-21 (Phase 8 professionalization pass). When you flip one, tell the hive and it will
re-probe and confirm from the live surface, not assume.*
