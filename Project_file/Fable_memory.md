# Fable_memory.md — Claude Fable 5, Harness & Lead Manager

**Role (founder-granted, 2026-07-10):** Harness of the Sovereign Hive project. Lead manager over the team: Founder (TehutiRaEl), Claude Sonnet (Backend/Edge), Mistral (Frontend), Grok (Strategy). The harness reconciles plans against verified reality, unblocks, assigns, and keeps every claim probe-backed.

## What Fable has built (all probe-verified in-session)
- Reconstructed the lost handoff plan from repo evidence; authored `memory/planning/hive-master-plan-2026-07-04.md` (Milestones 1–7, gap register #1–13, continuity protocol: plans live in the repo, never only in a container).
- **M1** Arena voxel pipeline end-to-end (engine→routes→D1-style frame persistence→Three.js InstancedMesh viewer). **M2** one event bus, two transports (WS broadcast fans out to SSE). **M4** tier3 truth (all five modules guarded-import wired; status endpoint cannot lie). **M7** constitution machine crowned THEHIVE as Queen — six colonies received and verified a dispatch within one second (2026-07-06 22:14Z).
- PAT plumbing: diagnosed the phantom Queen repo (`sovereign-hive-meta` never existed; `.queen/` scaffold sat where Actions never looks), built `distribute-pat.yml`, drove the founder through 3 failure→fix cycles (wrong secret name → whitespace in token → green across 6 colonies).
- Actions-tab audit of all ten repos: killed 165-failure deploy loop (gated), NAR2 invalid-YAML hive.yml (stray markdown fence) + illegal `secrets` in `if:`, deleted 28 upstream fork workflows + 4 upstream-infra workflows, repointed dead v9 test imports to live tier3 v11, revived the integration lane.
- Public app: boot sequence + in-browser simulation fallback (the link can never dead-end), `/v11/auth/token` bootstrap, unified Cloudflare Worker (docs assets + `/v11` API + D1 `thehive-queen` 70212689-5633-4c09-9e1d-ae6294ce19eb), closed the bot's static-only autoconfig PR #26.
- Harness org doc: `Founders Visonary Folder/ACTIVE/2026-07-10-harness-audit-and-team-org.md` (P0 register L1–L5, unified M1–M10, harness rules).

## How Fable operates
1. Evidence before status — run logs, live curls, Playwright drives, D1 queries; never memory.
2. Devil's advocate + childlike wonder on every decision (memory/philosophy/dual-lens-framework.md).
3. Role-tagged commits per GOVERNANCE.md; one PR per repo per wave; founder merges.
4. Ephemeral containers ⇒ anything worth keeping is committed the same session.

## Session log
**2026-07-10 (autonomous window):** Resolved PR #40's conflicts (union-merged mistral_memory.md) so the founder could merge Mistral's frontend wave. Founder's accidental merge order (#40 after #42) clobbered overlapping files TWICE — swept and repaired everything: frontend hotfixes restored via **PR #43**, then docs/index.html sovereignhive hostname + Mistral's build-gate worksheet + the committed harness plan restored verbatim from their original commits via **PR #44** (both merged under explicit founder authorization). Lesson captured as `SKILLS/skill-merge-order-and-regression-verify.md` (skill #11). Shipped **L3**: LocalAGI `GET /colony/capabilities` (colony.json identity + status/uptime/soul hash + endpoint pointers, constitution URL repointed to THEHIVE) — **LocalAGI PR #5**, ready for review, founder merges. Compressed all open work into `memory/planning/harness-plan-2026-07-10.md`. P0 state at session end: L1 ✅ · L2 founder · L3 PR up · L4 Sonnet · L5 ✅ verified.

**2026-07-10 (evening, founder-reported issues):** Three diagnoses, all probe-backed. ① Founder believed LocalAGI PR #5 merged — it is still OPEN (they confused it with PR #4 from 07-05); classifier blocks harness self-merge of own code, founder must click merge. ② Grok bridge "step 5" failure solved: all 3 failed runs (07-09) POSTed to hard-coded `thehive.workers.dev` (no account subdomain → DNS exit 6); Sonnet's PR #41 fixed it via `WORKER_URL` secret AFTER those attempts; harness re-ran the workflow (run 29121337650) — guard proves PAT/WORKER_ADMIN_KEY/GROK_BRIDGE_KEY all set, ONLY `WORKER_URL` missing. One secret to add, then re-run = bridge live. ③ "Simulation mode" at production URL: built `edge-health-probe.yml` (runs from GitHub runners because containers can't egress to workers.dev/github.io); runs 29121627631 + 29121765031 prove `/v11/health` + `/v11/agents` return live JSON AND the Pages copy already discovers `thehive.sovereignhive.workers.dev` — server side is 100% green; founder's browser served a stale cached page (fix: hard refresh). Probe workflow kept as the hive's permanent production smoke test. Gotcha discovered: `workflow_dispatch` 404s until the workflow exists on the default branch — self-path push trigger works around it.

## Open threads Fable is holding (see harness doc P0s)
L2: founder adds ONE secret `WORKER_URL=https://thehive.sovereignhive.workers.dev` then re-runs "Distribute PAT to Grok Bridge" · L3: founder merges LocalAGI PR #5 (still open, NOT merged) · L4 CORS allowlist (Sonnet) · M3: production proven live server-side; founder hard-refreshes to see LIVE boot · Mistral dep-manifest worksheet (`ACTIVE/2026-07-10-harness-to-mistral-main-build-gate.md`).

**Next session bootstrapping:** read this file, the harness doc, then `SKILLS/README-skill-exchange.md`. Trust only what those cite.
