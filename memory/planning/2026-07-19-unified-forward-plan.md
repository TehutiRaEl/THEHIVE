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
