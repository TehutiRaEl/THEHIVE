# SWITCHBOARD — the Queen's before/after checklist, unified

Founder's ask (2026-07-31): one place that shows, before and after flipping any switch,
what THEHIVE is actually capable of and what's actually running — covering both meanings
of "flip the switch" this hive uses. This file **indexes and live-probes**, it does not
replace either source file — each switch's full mechanical instructions stay in the file
that owns them, linked below, so nothing drifts by being duplicated in two places.

- **`FLIP_THE_SWITCHES.md`** (repo root) — hive-wide production-completeness switches.
  Each one is safe, additive, reversible: the code already ships live and degrades
  honestly until the resource is provisioned.
- **`automaton/FLIP_THE_SWITCHES.md`** — the self-replicating agent's two switches.
  Different in kind: not config flips, real money and real process-spawning, both still
  gated behind code that doesn't fully exist yet (financial) or an env var over
  already-built code (replication).

**Live status below was probed at 2026-08-01T09:01Z** via `edge-health-probe.yml`'s real
`GET /v11/debug/env` + `/v11/llm/status` + `/v11/memory/status` calls — not assumed from
memory. Re-run that workflow any time and re-read this table before trusting an older copy.

## Hive-wide switches — production completeness

| # | Switch | Before (now) | After flipping | Status | Founder action |
|---|---|---|---|---|---|
| 1 | Sovereign memory (Vectorize) | `vectorize_bound: false` — Kai El never recalls past exchanges, `/v11/knowledge/*` RAG unavailable | Memory fills every heartbeat; Kai El's commune replies get real recall context | ❌ **not flipped** | `npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine`, uncomment `wrangler.jsonc`'s `vectorize` block |
| 2 | Files store (R2) | `FILES: false` — Files panel shows `available:false`, no uploads | Files panel Upload button works for real, 10 MB cap, visitor-token gated | ❌ **not flipped** | `npx wrangler r2 bucket create hive-files`, uncomment `wrangler.jsonc`'s `r2_buckets` block |
| 3 | Extra model voices (Claude/Groq/Mistral) | `secrets_present: []` — every provider `bound: false`; `active_provider: workers-ai` only (the free, small edge model) | Waterfall picks up each bound key automatically, highest-priority provider answers | ❌ **not flipped**, none of the three | `npx wrangler secret put ANTHROPIC_API_KEY` (and/or `GROQ_API_KEY`, `MISTRAL_API_KEY`) |
| 4 | Founder key | `secrets_present: []` confirms `FOUNDER_KEY` absent — Proposals panel fails **closed**, nobody (not even the founder from the UI) can approve/reject anything | `founder_auth_bound: true`; Approve/Reject buttons on Proposals work; `hive_proposals` (including Kai El's own `PROPOSAL:`-marked suggestions) become decidable | see `FLIP_THE_SWITCHES.md` §4 for live status | Moved 2026-08-08 to Cloudflare **Secrets Store** (`wrangler.jsonc`'s `secrets_store_secrets` binding) — set/rotate it in the dashboard's Secrets Store panel or `npx wrangler secrets-store secret create <store_id> --name FOUNDER_KEY --scopes workers`, then paste the same value into the Proposals panel |
| 5 | Rate-limit counters (KV) | — | Anti-spam counters move off D1 onto KV, same 30/min/IP behavior, less DB write pressure | ✅ **FLIPPED 2026-07-23** (`RATE_LIMIT_KV: true`, confirmed live) | none — already done |
| 6 | Async LLM jobs (Queues) | `LLM_QUEUE: false` — `/v11/venture/plan` and `/v11/legal/research` only run synchronously | `{"async": true}` on either endpoint returns a pollable job instead of blocking | ❌ **not flipped** | `npx wrangler queues create hive-llm-jobs` — **and in the same commit**, uncomment `wrangler.jsonc`'s `queues` block **and** re-attach `queue: processQueueBatch,` in `worker/src/index.js`'s `export default` (see `PR_LESSONS.md` L-08 — this exact mismatch broke production for ~26h once already) |
| 7 | Action-request execution (GitHub token) | `GITHUB_ACTIONS_TOKEN` unbound — approved `action-request` proposals record `executed:false` with an honest reason, nothing runs | An approved `rerun_ci`/`open_issue`/`dispatch_workflow` proposal actually calls the GitHub API on approval | ❌ **not flipped** | `npx wrangler secret put GITHUB_ACTIONS_TOKEN` (a fine-grained PAT scoped to `TehutiRaEl/THEHIVE`: Actions read/write + Issues write only) |
| 8 | Federation PR review (`federation-pr-review.yml`) | `HIVE_FEDERATION_TOKEN` unbound — the 6-hourly workflow runs and logs an honest no-op, comments nothing | Every open PR across the real, owned colony repos (`.queen/hive.yml`) gets one real, evidence-cited automated first-pass comment (mergeable state + real check status), never a rubber stamp, never merges/approves | ❌ **not flipped** | A GitHub org/repo secret `HIVE_FEDERATION_TOKEN` on `TehutiRaEl/THEHIVE`: a fine-grained PAT with read+write on Pull requests/Issues for the colony repos listed in `.queen/hive.yml` |

## automaton switches — real money, real replication

Both still default OFF; neither is a small config flip.

| # | Switch | Before (now) | After flipping | Status | What flipping actually requires |
|---|---|---|---|---|---|
| 1 | Financial autonomy | Ledger is real and persistent but simulated play-money; wallet has no real keypair | `AUTOMATON_FINANCIAL_AUTONOMY=true` would move real funds | ❌ **not flipped**, and genuinely can't be yet | Real wallet adapter (hardware-backed or KMS custody, not plaintext), a real payment-rail ledger backing, and an actual legal read on money-transmission/AML/tax exposure — this is deliberately not a config change |
| 2 | Replication autonomy | `spawn_child` always creates the lineage row + approval-queue entry; approval never spawns a real process while this is off | Approved proposals spawn a real independent child process under `.automaton-home/children/<lineageId>/` | ❌ **not flipped** | `export AUTOMATON_REPLICATION_AUTONOMY=true` — code is ready, this one really is just the env var. Approval itself is never optional either way. |

## The one-line current state

Free-tier edge model only, no memory, no files, no async jobs, no founder-decision
capability in the UI, no automaton autonomy of either kind — everything else in
`FLIP_THE_SWITCHES.md`'s "already flipped / no switch needed" section (D1, Workers AI,
assets, the heartbeat, the UI shell, CORS, pagination, edge caching) is live now. Every
switch above is founder-action-gated by design (`PERMISSIONS.md`'s founder-only tier) —
nothing here is blocked on code that doesn't exist, except automaton's financial switch.

*Built 2026-08-01, autonomous arc firing, backlog priority #1. Re-probe via
`edge-health-probe.yml` (workflow_dispatch) before trusting this table days later.*
