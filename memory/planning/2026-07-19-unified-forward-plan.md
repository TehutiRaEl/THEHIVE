# THEHIVE — Unified Forward Plan (merging every prior plan + the founder's full vision)

*Supersedes: `memory/planning/harness-plan-2026-07-10.md` (previously marked "CURRENT MASTER
PLAN"), `memory/planning/hive-master-plan-2026-07-04.md`, and this file's own prior content
(the "Make Kai EL OS truly live" plan — Workstreams A–D are complete and verified; see
Closed Ground below). This is now the one plan to read.*

## Context

The founder asked for a full retrospective across every session this conversation has ever
had — what was set out to do, what actually got built, what got stopped or put on hold when a
session ran out of room, what got picked back up — and a single new plan that merges every
prior plan with the whole vision, rather than starting fresh or letting old plans silently
rot unread.

Three research passes (chronological founder-directive audit across `HIVE_UPDATES/` +
`VISION/`; a structural-reconciliation audit of System A/B, orphaned branches, skill sets,
`PERMISSIONS.md`, `TEAM_CHARTERS.md`; a GitHub/CI/colony state audit) plus a synthesis pass
produced the backlog below. Nothing in "Closed Ground" is re-litigated. The founder has since
decided the three open judgment calls that would otherwise have blocked planning (System A:
invest in deploying it; orphaned UI: wire in as a supplementary view; first real commerce
build: the copywriting service; sequencing: clean up first, then run `/fable-debugger`).

Every phase below is written to be compilable as an `agent-harness` goal — a named artifact
plus a real command that exits 0 — per the standing build loop already wired to this repo
(`assets/harnesses/thehive.json`), since the founder has explicitly asked for future work to
run through that loop rather than as an implicit session habit.

## Closed ground — do not re-plan this

Fully built and verified this conversation (spanning many sessions): System B (Cloudflare
Worker + D1) live and repeatedly verified; Kai El OS as the one canonical live frontend;
mobile-responsive layout + desktop-view toggle; the hive→founder Updates channel; the
Proposals channel (`hive_proposals`, fail-closed decide-gate); live Constitution viewer;
chat-overlay fix + chat grounded in real constitution text; the fable-debugger UI pass (13
legacy tabs, ~50 dead buttons honestly disabled, Arena viewer wired); the Biosystem dashboard;
the gateway-console with its Tool Registry made genuinely live; Chromosome IX + `PERMISSIONS.md`
+ Legal-Learning panel; the `GET /v11/roadmap` evolutionary bars (F-008D/F-009E stages +
level/xp) via `RoadmapAvatar.tsx`; the `threat-sandbox` skill; the Sub-Architect charter;
`POST /v11/venture/plan` + `VenturePlanner.tsx`; Legal Guild v1; `agent-harness` wired to
THEHIVE and proven end-to-end. PR #126 (covering the last several of these) is merged.

## The real backlog, in dependency order

### Phase 0 — Fix the currently-broken CI check ✅ CLOSED 2026-07-19

`.github/workflows/ui-live-probe.yml` was actively failing (4 of its last 5 runs red).
Root-caused via `fable-debugger` (two independent failing runs, both showing the app fully
healthy — live=true, real agents, zero console errors — with only the served-vs-committed
bundle-hash freshness check tripping, both times against a very recently merged commit):
Cloudflare's real ~10-15 min Workers Builds deploy lag had zero tolerance in the check, so
any probe firing within that window after a `docs/app`-touching merge spuriously failed.
Fixed with a bounded retry (60s/90s/120s backoff, ~4.5min total) before treating a mismatch
as real. Verified live via `workflow_dispatch` (run 29675735880): passed cleanly against the
real site. Shipped in PR #127. The retry-with-backoff branch itself wasn't exercised in that
verification run (no mismatch was pending) — worth a real check next time this workflow
happens to fire during an active deploy window, to see the retry path itself succeed live.
- **Goal:** `fix-ui-live-probe`. **Done when:** the workflow is green on `main` twice in a
  row (not a one-off flake). Apply `fable-debugger` discipline directly: probe before
  claiming a fix, compare against the one known-good run, find the coupled latent bug, never
  fake a green.
- **Files:** `.github/workflows/ui-live-probe.yml` and whatever real-browser probe script it
  invokes.

### Phase 1 — Reconciliation ("merge the prior plans and vision," operationalized)

This *is* the founder's request, executed. Four sub-phases, all Tier 1 except branch
deletion (Tier 2 — propose per branch before deleting anything).

- **1a. Constitution triangle.** Three differently-numbered "constitution" files coexist:
  `soul.md` (canonical per `CLAUDE.md`), `.queen/soul.md`, `docs/GOVERNANCE.md` (F-001–F-013,
  what the live UI actually shows). Write a verification script that asserts the latter two
  either match `soul.md`'s law text or are explicitly declared derived views. Also: edit
  `FABLE_DNA.md` Chromosome I so its F-001–F-006 prose actually matches `soul.md` — it
  already claims soul.md governs, the wording should agree. **Done when:** the verification
  script exits 0. Files: `soul.md`, `.queen/soul.md`, `docs/GOVERNANCE.md`, `FABLE_DNA.md`.
- **1b. Skills vs. commands split.** `.claude/skills/` (67 skills, actively used) and
  `.claude/commands/` (9 slash-command files — `brain-query`, `hive-status`, `colony-zoom`,
  `link-nodes`, `merge-verify`, `remember`, `role-deliver`, `soul-check`, `update-nav` — zero
  cross-references to the skills set) have never been reconciled; the one skill census
  (`SKILL_CENSUS_REPORT_2026-07-14.md`) predates discovering the split. Either cross-link
  each command to its skill/harness-manifest equivalent, or mark it deprecated with a
  one-line reason; re-run `skill-census`. **Done when:** the re-run census shows zero
  unaccounted `.claude/commands/` entries.
- **1c. Two planning lineages.** `memory/planning/` (its own nav doc calls
  `harness-plan-2026-07-10.md` the "CURRENT MASTER PLAN") and
  `Project_file/Founders Visonary Folder/` (`HIVE_UPDATES/` + `VISION/`, what this session has
  actually used) have never cross-referenced each other. This document becomes the one
  pointer in both: retire the "CURRENT MASTER PLAN" banner in `memory/planning/`'s nav doc in
  favor of a pointer to this plan (once it's committed somewhere durable — see Verification),
  and drop the same pointer into the Founders Visionary folder. **Done when:** both lineages
  contain a live reference to the same plan.
- **1d. Stale branch audit.** Local: `cf-sync`, `mistral-resolve`, `sonnet-sync`,
  `verify-main`. Remote: `claude/session-continuation-owj5wr`, `cloudflare/workers-autoconfig`,
  `feature/voxel-world`, `grok-strategist-main`, `mistral/frontend-command-center`. Write
  `BRANCH_AUDIT_2026-07-19.md` tagging each `salvage-candidate` / `safe-to-delete` /
  `needs-founder-look` (read-only, Tier 1). Actually deleting any branch is Tier 2 — propose
  each one via the Proposals channel first, since `feature/voxel-world` and
  `mistral/frontend-command-center` in particular may carry real unmerged work (the same
  category `feature/gamified-ui-components` turned out to be).

### Phase 2 — Wire the orphaned gamified-UI components into a real supplementary view

Founder's decision: wire in, don't retire. 14 of 15 components from the merged-but-orphaned
`feature/gamified-ui-components` branch (`HiveDashboard`, `ColonyCard`, `TesseractChamber`,
`ConstitutionHall`, `MemoryVault`, `ResourceBar`, `QuickStats`, `MissionBoard`+`MissionCard`+
`MissionDetails`, `MemoryDetails`, `MemoryItem`, `AchievementToast`, `LevelUpNotification`) are
real, committed, sitting in `frontend/src/components/` — `App.tsx` never renders them. Only
`AgentAvatar` got rescued this session (as `RoadmapAvatar.tsx`) — that rescue is the proof the
pattern works.
- **Goal:** `wire-gamified-ui-alt-view`. Kai El OS stays the one canonical entry point;
  add a real, reachable toggle/route that mounts the 14 components as a supplementary view —
  this also gives the founder's macro-universe vision (colonies-as-worlds, zoom to a 3D
  avatar; see Deferred Vision below) a concrete, already-half-built runway instead of a
  from-scratch future build.
- **Tier:** 2 — propose via the Proposals channel before wiring, since real UI surface area
  is at stake; once approved, the wiring itself is Tier 1.
- **Done when:** `npm run build:app` exits 0 and a real-browser check (same discipline as
  `ui-live-probe.yml`) confirms the new view actually renders, not just compiles.
- **Files:** `frontend/src/App.tsx` (or `KaiElOS.tsx`'s panel-toggle pattern), the 14
  component directories under `frontend/src/components/`.

### Phase 3 — Deploy System A for real

Founder's decision: invest in deploying it, not freeze it. Four of five core modules
(`backend/core/agent_engine.py`'s `ReactAgent`, `hitl.py`, `agency.py`, `genesis.py`) are
real, substantial, already wired into `backend/api/routes.py` — only `backend/phase_manager.py`
is genuinely dead. The deploy path failed 165 straight times before being gated off behind an
unset `ORACLE_HOST` secret; a `render.yaml` one-click Blueprint exists as an untried
alternate path.
- **Apply `fable-debugger` discipline first, per the founder's own sequencing decision**:
  root-cause *why* the Oracle deploy failed 165 times before attempting it again — probe the
  actual failure logs/history, don't just re-run the same broken path expecting a different
  result. Decide, with evidence, whether to fix the Oracle SSH path or switch to the Render
  Blueprint.
- **Goal:** `deploy-system-a`. **Done when:** `curl -sf <deployed-host>/health` exits 0 from
  outside the container (the container itself can't reach either target directly — reuse the
  `edge-health-probe.yml` pattern of a GitHub Actions runner doing the actual check, same as
  System B's live-ness has been verified all along).
- **Founder-only step inside this phase:** whichever path is chosen, the actual secret
  (`ORACLE_HOST`) or the Render dashboard click-through is Tier 3 — Claude prepares
  everything up to that point (validated `render.yaml` or a corrected `deploy.yml`, plus a
  ready-to-run post-deploy smoke test) so the founder's one action is the only remaining step.
- **Once live:** delete `backend/phase_manager.py` (confirmed unwired anywhere) or wire it in
  if a real use turns up during the debugger pass.
- **Files:** `backend/core/{agent_engine,hitl,agency,genesis,phase_manager}.py`,
  `backend/api/routes.py`, `.github/workflows/deploy.yml`, `render.yaml`.

### Phase 4 — Build the copywriting service (Scribe-Pro v1)

Founder's decision: copywriting first, confirmed after being suggested repeatedly across
past sessions without a final yes. Fully offline-capable, produces a draft artifact rather
than taking an external action — fits inside existing Tier 1/2 boundaries and the venture
planner's proven "draft, never execute" pattern.
- **Goal (proposal):** `propose-scribe-pro-v1` — a `POST /v11/proposals` entry naming
  copywriting as the first build, with App Factory / dropshipping / Mercury-Outreach named
  and explicitly deferred (not silently dropped — they still need the venture colony repo and
  real external contact, which stay blocked per Phase 5).
- **Goal (build, post-approval):** `build-scribe-pro-v1` — extend the same Worker source
  backing `POST /v11/venture/plan`, producing a real LLM-generated copywriting draft from a
  brief; zero outbound-send capability, matching Chromosome IX and `VenturePlanner.tsx`'s
  existing boundary.
- **Tier:** 2 for the proposal; 1 for the build itself (drafts only, no external action).
- **Done when:** an integration test against the new endpoint returns a non-empty,
  non-fabricated draft for a sample brief.
- **Files:** the System B Worker source backing `/v11/venture/plan`, a new
  `ScribeProPanel.tsx` (or extend `VenturePlanner.tsx`), `PERMISSIONS.md`.

### Phase 5 — Founder-blocked track (Tier 3, tracked, never scheduled as a Claude task)

Three items no amount of retrying resolves — each needs the founder's own hands:
1. **Venture colony repo connection** — `add_repo` has failed 3+ times ("MCP tool call
   requires approval," a UI click, not a retryable error). Blocks the venture Worker, guild
   scaffolding, `.queen/hive.yml` registration, the revenue-irrigation pipeline, and the
   Entrepreneur Guild's "grey areas" scouting mandate.
2. **`FOUNDER_KEY` binding** — `npx wrangler secret put FOUNDER_KEY`, needed to unlock the
   Proposals channel's decide-gate (currently fail-closed, correctly, without it).
3. **Vectorize/R2 provisioning** — `wrangler vectorize create` / `wrangler r2 bucket create`.

Write `Project_file/Founders Visonary Folder/HIVE_UPDATES/BLOCKED_ON_FOUNDER.md` listing all
three with the literal command/click needed. A Tier-1 passive-check goal
(`check-founder-blockers-status`) can detect when each clears (e.g. a low-frequency Routine
that pings `/v11/proposals` and checks session sources for the venture repo) and report into
the Updates channel — it never attempts the founder-only action itself.

### Phase 6 — Harness rollout + the founder's first real run

- **Goal:** `write-harness-manifests-for-remaining-colonies` — new
  `assets/harnesses/{aether,automatisch,kimi-gateway,academy-books,academy-camp}.json`,
  following `thehive.json`'s proven shape. NAR2/4DBRAIN deferred until repo access clarifies.
- **Done when:** a schema-validation pass confirms each new manifest lists only real,
  existing skill/tool paths for its colony.
- **Separately tracked, not scheduled:** the founder running their own first real goal
  through `agent-harness` — this is explicitly the founder's action, not something Claude
  pre-runs on their behalf.

### Phase 7 — Sub-Architect seat (optional, flagged not assumed)

No distinct "Architect" seat exists in `TEAM_CHARTERS.md`; Sub-Architect currently reports to
the Harness & Lead Manager role by mapping, not by original design. Propose (Tier 2, via
Proposals) whether the founder wants a distinct seat carved out. No default action — proceeds
only on a yes.

### Phase 8 — System-design professionalization (added 2026-07-21)

Per the founder's directive: a 31-page study-handbook PDF (misreported as 219 pages by the
upload pipeline — corrected via `pdfinfo` before any work proceeded) plus the newly-cloned
`TehutiRaEl/system-design-101` (real ByteByteGo repo, `cc-by-nc-sd-4.0` — principles
extracted, nothing copied, per `research-to-dna`/`session-harvest`'s standing discipline)
were used as a lens on the hive's own real code. Full findings:
`Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-system-design-professionalization-audit-003.md`.

Confirmed real, right-sized gaps (each grep-verified against `worker/src/index.js`, not
assumed) — **all four items below are CLOSED as of 2026-07-21, code-complete and
`node --check`-verified; KV/Queues additionally need one founder-run `wrangler` command
each before they take live effect (see `FLIP_THE_SWITCHES.md` §5-6), same
commented-binding pattern already used for Vectorize/R2:**
- **Goal:** `harden-cors-scope` — ✅ done. The old wildcard `Access-Control-Allow-Origin: '*'`
  was replaced with `corsHeadersFor(request)`, echoing the caller's `Origin` only when it's in
  `ALLOWED_ORIGINS` (the live Worker origin, the GitHub Pages mirror, local dev ports).
  Computed fresh per-request inside `fetch()`'s closure — never a shared module-level value —
  to avoid the Workers-isolate cross-request state leak that pattern would risk.
- **Goal:** `add-list-endpoint-pagination` — ✅ done. `pageParams(url, defaultLimit, maxLimit)`
  now backs `/tasks`, `/governance/log`, `/updates`, `/proposals`, `/pulse`,
  `/arena/challenges`, `/arena/fallen` — every one accepts `?limit=&offset=`, capped, and
  echoes both back in the response.
- **Goal:** `evaluate-edge-caching` — ✅ done (Cache API + KV, both real, not just evaluated).
  `cachedJson()` wraps `/agents`, `/roadmap`, `/llm/status` in `caches.default`, deliberately
  caching only the JSON body (never the full Response, so a cached entry can never leak one
  origin's CORS header to another origin's request for the same URL) with a 20-60s TTL.
  `rateLimitOk()` now prefers a `RATE_LIMIT_KV` binding (counter+TTL, KV's textbook use case)
  over the original D1 sliding-window table, falling back to D1 when KV is unbound.
- **Goal (upgraded from catalogued to done):** Cloudflare Queues to decouple the synchronous
  LLM calls in `/v11/venture/plan` and `/v11/legal/research` — ✅ done, additive/opt-in only.
  Both endpoints stay fully synchronous by default (zero frontend changes needed); passing
  `{"async": true}` in the body, once `LLM_QUEUE` is bound, enqueues the job and returns
  `202 {job_id, poll}` instead — a new `queue(batch, env, ctx)` consumer processes it and a new
  `GET /v11/jobs?id=` endpoint reports `queued → done/error`.

JWT/claims-based auth to replace the opaque visitor-token model remains catalogued, not
scheduled — still no trigger condition (a Tier-2/3 surface needing stronger caller identity
than "has a token, isn't spamming") has arisen.

Confirmed non-gaps (verified, not just assumed, before being ruled out) — do not "fix" these:
load balancing (Cloudflare's own anycast network already is one), classic OOP design patterns
on the Worker (it's a lightweight edge function — forcing Repository/Strategy/Adapter here
would be over-engineering; System A, once deployed per Phase 3, is the actual right home for
that review), the `${t}` string-interpolated query in the debug-export route (draws from a
hardcoded 6-item whitelist, not user input — genuinely safe), and API versioning (the `/v11`
prefix already is real versioning).

`system-design-101` becomes a standing reference library going forward — check its relevant
category (14 total: API/Web Dev, Real-World Case Studies, Security, Caching/Performance,
Payment/Fintech, Cloud/Distributed Systems, DevOps/CI-CD, Software Development, Software
Architecture, DevTools/Productivity, AI/ML, Technical Interviews, How It Works,
Database/Storage, Computer Fundamentals) before designing new backend/architecture work from
scratch, the same way `research-to-dna` already checks founder-provided research first.

### Phase 9 — `automaton/`: the self-improving, self-replicating agent ✅ CLOSED 2026-07-21

Founder directive: clone `Conway-Research/automaton` (MIT), devil's-advocate it, reverse-engineer
and improve it (not just copy it), rebuild file-for-file into its own `automaton/` directory in
THEHIVE. Full writeup: `Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-automaton-devils-advocate-005.md`.

A source-level review (not just the README) found five concrete gaps between what upstream's
safety mechanisms claim and what the code enforces: a "requires confirmation" policy action that
behaves identically to a hard deny; self-replication funding (`fund_child`) uncapped while the
equivalent `transfer_credits` tool had real limits; the agent able to edit its own
financial/authority policy-rule files (only the thin wrapper files were protected, not the rule
implementations); a real, unencrypted wallet private key written to disk by default; and the only
"supervised human-approval" concept in the whole codebase being non-functional stub code. The
founder, put to the actual choice, initially picked "fully autonomous, real wallet" and "fully
autonomous replication, as upstream" — this was pushed back on with the concrete findings above
(not a hypothetical objection) and the founder confirmed proceeding on the amended basis: build
the full mechanism, close all five gaps for real, ship both master switches
(`AUTOMATON_FINANCIAL_AUTONOMY`, `AUTOMATON_REPLICATION_AUTONOMY`) defaulting off — same
flip-the-switch pattern as Vectorize/R2/KV/Queues — with replication approval unconditional
regardless of either switch.

**Done when:** `cd automaton && npm test` — 15/15 green, each of the five gaps proven closed with
a real, running test (`test/gap-closure.test.js`), zero `npm install` step (Node 22's built-in
`node:sqlite`/`node:test` only). Verified this session.

- **Decoupled from Conway Cloud**: `src/ledger/ledger.js` (simulated, survival-pressure-bearing
  ledger) replaces `conway/{client,credits,topup,x402}`; `src/inference/thehive-provider.js` calls
  a new `POST /v11/automaton/infer` Worker route that reuses the exact same `generate()` waterfall
  already backing `/v11/venture/plan` and `/v11/legal/research` — no new inference infrastructure,
  no new provider keys.
- **Files**: `automaton/` (new directory — `src/`, `test/`, `NOTICE.md`, `README.md`,
  `ARCHITECTURE.md`, `FLIP_THE_SWITCHES.md`, `constitution.md`), `worker/src/index.js` (one new
  route), `CLAUDE.md` (documented), this plan file.

### Phase 10 — Colony deep-integration: fully utilize what's already in each colony ✅ CLOSED 2026-07-22

Founder directive: "is there a way to fully utilize the software in each repo that was just
built on top of" — look at each colony's license first, then bridge or extend the existing
agentic mesh/harness protocol (whichever is more efficient) rather than inventing a new one,
so every colony's real code strengthens the hive instead of sitting mostly-parallel to it.
Full plan: `/root/.claude/plans/the-handoff-is-already-cheeky-ember.md`. Three research passes
(this repo's own mesh infra; automatisch/LocalAGI's licenses+architecture;
NAR2/4DBRAIN/aether's real function+licensing) plus a synthesis pass produced the phased plan
below. Founder decided four judgment calls up front: colony licensing (proprietary/
hive-internal), tesseract-math ownership (move into 4DBRAIN, matching its name), Kimi-K2's
dual bridge (retire Node, keep Python), deployment scope (build to the deploy step, park it —
same founder-only blocker as System A's own deploy).

Protocol decision: **bridge, don't invent.** Two layers, both extending something already
real — the existing HMAC-HTTP colony-standard-layer for lifecycle/health/constitution-sync,
and MCP (Model Context Protocol) for agentic tool-calling/task-dispatch (LocalAGI already
speaks it natively; Python/Node/Go/TS SDKs cover every language already in the federation).

- **Phase A** (mechanical fixes, all 6 colonies): proprietary hive-internal LICENSE added to
  NAR2/4DBRAIN/aether (none existed); aether's `/colony/events` route given real HMAC
  verification (it accepted any unauthenticated JSON body — the one real security gap among
  the six colonies); `aether/LAUpackage.json` renamed to `package.json`, CI `cp` workaround
  removed; Kimi-K2's duplicate Node colony bridge (`colony-server.js`, `Dockerfile.colony`)
  retired in favor of its real Python bridge; NAR2's README architecture drift fixed.
- **Phase B**: the tesseract/hypercomplex/dream-engine math (previously living duplicated in
  this repo's `backend/tier2/`) moved into a real, pip-installable `4DBRAIN/tesseract_math/`
  package — 4DBRAIN being the colony whose name always implied it owned this math. This
  repo's `tier2/*.py` and NAR2's `rotation_matrix.py` are now thin re-export shims over it.
  Found and fixed a real crashing bug in the process: 4DBRAIN's `backend/main.py` had a dead
  `from colony import router` import (nonexistent module, `ImportError` on any real run).
- **Phase C**: `colony_sdk.py` (previously hand-copied byte-identical into NAR2, 4DBRAIN,
  Kimi-K2) promoted into a real package (`colony_sdk/`, `sovereign-hive-colony-sdk` on git),
  consumed as a pinned dependency by all three instead of a diverging local file. Found and
  fixed a real bug: NAR2's `main.py` used a relative `from .colony_sdk import ...`, which
  would have broken once `colony_sdk.py` stopped being a sibling file. Also found and fixed
  this repo's own `backend/api/colony.py` — it had **zero** HMAC verification on
  `POST /colony/events`, the one place this repo's own colony-standard-layer implementation
  was less secure than every colony consuming it.
- **Phase D**: automatisch (AGPL-3.0) gets a native `packages/backend/src/apps/thehive/` app —
  a real "Hive Dispatch Received" trigger and "Send to Hive Mesh" action, not a bolt-on route.
  `/colony/manifest` now reports a real `source: {repo, commit, license}` field (live
  `git rev-parse HEAD`) to satisfy AGPL Section 13's corresponding-source obligation; this
  repo's own code still only ever talks to automatisch over HTTP, never in-process, so AGPL
  never crosses into the rest of the federation. The orphaned `packages/colony-server/`
  sidecar was retired (confirmed zero references first).
- **Phase E**: a real MCP server built at `backend/mcp_server/` (the existing `backend/mcp/`
  was confirmed dead — no JSON-RPC, no transport, one simulated tool, never wired to
  `routes.py`) exposing `hive_dispatch`, `hive_memory_recall`, `hive_law_query` as native
  tools any MCP client can call. First consumer: LocalAGI, which already speaks MCP natively
  (`core/agent/mcp.go`) — no LocalAGI-side code change needed, just operator config pointing
  at `http://<host>:8100/mcp`. Verified with a real JSON-RPC `initialize` handshake over
  streamable-http.
- **Phase F**: `hive_mesh.dispatch()` previously fired any `event_type` to every colony blind.
  Added a Tier-1-safe allow-list per `PERMISSIONS.md`'s own tier definitions
  (`health_check`, `manifest_query`, `capabilities_query`, `info_query`,
  `constitution_update`, `constitution_sync`, `ping`); anything else (e.g. automatisch's
  `task_dispatch`) is now held for founder review through the existing HITL queue
  (`backend/core/hitl.py`) instead of dispatching — reusing existing infra rather than
  inventing a new approval mechanism. Also fixed a real bug found while re-verifying: Tier 3
  `backend/tier3/tesseract_model.py`'s `TesseractModelTorch` had no `wealth_forecast`, so
  `POST /v11/tesseract/forecast` crashed with `AttributeError` whenever torch was installed
  (the default path) — given real `rollout`/`wealth_forecast` methods using its own
  `forward()` pass rather than silently routing to the numpy model (which would have made the
  `"backend": "PyTorch"` response label false).
- **Phase G**: `.claude/skills/agent-harness/assets/harnesses/colonies.json` built — the real
  manifest behind hive-conductor's previously-aspirational "colonies" domain lane. Since the
  six colonies are sibling repos, not a `.claude/skills`-shaped folder
  `harness_manifest_builder.py` can scan, this manifest is hand-authored (documented as the
  one deliberate exception) and its verify step is a new `scripts/colony_verify.py` —
  deterministic, stdlib-only, real structural checks against each sibling checkout. Fed
  through the real harness machinery end to end: `goal_compiler.py` compiled a real goal
  against it, `loop_controller.py` drove init → execute → verify for a task and independently
  re-ran the checks via subprocess, reaching `"status": "verified"`.
- **Phase H — parked, not built this pass**: real deployment of NAR2/4DBRAIN/aether requires
  an account-level deploy (Tier 3, founder-only) plus this repo's own System A deployed first.
  Documented as the natural next step, not scheduled work.

**Done when:** each phase's own done-when line (in the plan file) is independently verified —
all satisfied this session with real commands, not assertions (fresh-venv installs, real
FastAPI/Node HMAC round-trips, a live MCP JSON-RPC handshake, a synthetic Tier-3-shaped
dispatch proven rejected, all 18 `colony_verify.py` checks across 6 colonies passing).

- **Files**: `NAR2/`, `4DBRAIN/`, `aether/`, `automatisch/`, `Kimi-K2/` (each its own PR:
  NAR2 #18, 4DBRAIN #14, aether #13, automatisch #13, Kimi-K2 #14) + this repo's
  `backend/core/hive_mesh.py`, `backend/api/colony.py`, `backend/colony_sdk/`,
  `backend/mcp_server/`, `backend/tier2/*.py` (shims), `backend/tier3/tesseract_model.py`,
  `.claude/skills/agent-harness/` (`SKILL.md`, `assets/harnesses/colonies.json`,
  `scripts/colony_verify.py`), this plan file.

## Deferred vision — real, not contradicted, just not this plan

- The macro-universe vision (colonies-as-worlds connected like the knowledge graph, recursive
  sub-colonies, zoom to a 3D avatar, an eventual Unreal Engine renderer) is cataloged in
  `VISION/2026-07-18-vision-macro-universe-colony-worlds-3d-avatar-002.md`, explicitly "later
  on" per the founder's own words. Phase 2 above (wiring the orphaned gamified-UI components)
  is the concrete first runway toward it, not the whole vision.
- GOVERNANCE.md F-012's founder phase-allocation thresholds (32%–46%) stay deliberately
  uncalibrated until real revenue exists — correct as-is, nothing to close here.
- The "Founder's Purse" stealth-payment scheme remains declined (conflicts with F-004
  explainability) — closed, not reopened by this plan.

## Verification

- Each phase ships as its own PR, following the existing `pr-retrospective` pre-flight.
- Every phase's "done when" line is written to be the actual command an `agent-harness` goal
  compiled against `assets/harnesses/thehive.json` would check — so phases can be run through
  the standing loop directly, not just used as a prose checklist.
- Phase 0 must be green before any later phase's CI-based verification is trusted.
- This plan file itself should be copied into `memory/planning/` and
  `Project_file/Founders Visonary Folder/` as part of Phase 1c, so it becomes the one
  durable, checked-in pointer both lineages share — a plan file under `/root/.claude/plans/`
  alone doesn't survive session boundaries the way a committed repo file does.
