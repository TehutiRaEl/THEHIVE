# THEHIVE — Consolidated Execution Plan (2026-08-19)

*One dependency-ordered backlog reconciling **every** planning lineage in this repo, so no
future session has to re-derive "what's next." Written by the PLAN lane of a 6-lane parallel
orchestration, 2026-08-19.*

**What this supersedes, and what it does not.** This document does **not** replace
`memory/planning/2026-08-18-unified-forward-plan-v2.md` (still the phase-level master plan)
or `memory/planning/2026-08-19-queen-orchestration-master-plan.md` (still the Queen sub-plan).
It **reconciles** them, plus `.claude/tasks/CAMPAIGN.html` (60 tasks),
`.claude/tasks/FULL_PLAN.html` (the P0–P7 project ledger), and all 60 files in
`Project_file/Founders Visonary Folder/HIVE_UPDATES/`, into one ordered list — because
those five lineages currently disagree with each other in at least seven places (§E).

**Honesty note on method, stated up front.** The lane was instructed to spawn sub-agents to
parallelise the reading. No in-process `Task`/`Agent` subagent tool exists in this lane's tool
surface (checked twice via `ToolSearch`; only `TaskStop`, `SendMessage`, `EnterWorktree`
returned). Parallelism was therefore achieved by concurrent extraction and direct reads, not
by spawned agents. Every claim below cites a real file path, line number, run ID, or SHA that
another session can re-check without trusting this one.

---

## (a) Plain English — what is actually going on

Think of the hive as a workshop. Almost every tool in it was built and works, but this week
the **electricity to the workshop got cut off**, and nobody has written that down anywhere yet.
That is the single most important thing on this page: since roughly 7pm UTC on 2026-08-18,
**every automated job in this repository fails within 2–4 seconds without a machine ever being
assigned to run it** — that includes the daily health check that is the hive's only way of
seeing whether production is alive, and the test suite that enforces honesty about what is
finished. Only the founder can fix that, because it is an account/billing-level block, not a
code bug.

The second big thing: two automatic scripts that keep the Constitution in sync were both put
onto the main branch, and **they point in opposite directions**. One says the root `soul.md` is
the real Constitution; the other says `.queen/soul.md` is. They both write into the same field.
Nothing has broken yet, but the trap is armed — the next time anyone edits `.queen/soul.md`,
the detailed legal text in the root Constitution gets overwritten with a much shorter version
that is missing the exact rules. That needs one founder sentence to defuse, not a big project.

The third thing is happier: **the task queue is empty.** All 60 tasks are either finished (45)
or waiting on the founder (15) — there is genuinely nothing left that a session can just pick
up and do. That is not a stall; it is the queue working correctly. It does mean the next real
progress comes from founder decisions, not from more building. There are **nine** genuine
decisions waiting, and at least **four** questions that plans still list as "open" which the
founder has, in fact, already answered — those are noise and should stop being re-asked.

---

## (b) The consolidated backlog, dependency-ordered

Truth levels use this repo's own vocabulary (`.claude/skills/wired-or-not/SKILL.md`):
`unverified` → `compiles` → `tested` → `merged` → `deployed` → `verified-live`. **Not
cumulative by assumption.** Owner is `founder-only` or `session`.

### TIER 0 — the root. Nothing below is reliably verifiable until these clear.

---

#### **B0. GitHub Actions is blocked repo-wide at the account level**

**NEW — appears in no existing plan document.** Named only in a commit message
(`18d8fd5`, 2026-08-19) and in `CAMPAIGN.html`'s own 2026-08-19 log entry. Not in
`unified-forward-plan-v2.md`, not in `FULL_PLAN.html`'s P0–P7 ledger, not in
`HIVE_PULSE.md`'s "Right now" section.

- **What it is.** Every workflow, on every trigger type, fails in 2–4 seconds with no runner
  ever assigned.
- **Evidence (checked this pass, not inherited).**
  - Run `32214486105` (`edge-health-probe`, `workflow_dispatch`): `created_at`
    2026-08-19T04:05:40Z, `updated_at` 04:05:44Z — **4 seconds**, conclusion `failure`.
  - Run `32214601969` (`CI`, `pull_request`), both jobs: `runner_id: 0`, `runner_name: ""`,
    `started_at` 04:07:37Z, `completed_at` 04:07:38Z / 04:07:39Z. **No runner was ever
    assigned** — that is the account-block signature, distinct from a job that runs and fails.
  - Repo-wide listing of the 20 most recent runs: **19 of 20 failed**, spanning `schedule`,
    `push`, `pull_request`, and `workflow_dispatch`, across `CI`, `Edge Health Probe`,
    `Venture Gap Mirror`, `Kai El Bridge`, `Task Digest`, `Architect Proposal`,
    `Colony Health Matrix`, `Campaign Digest`, `Sync Planning Docs`, `Federation Issue Triage`.
    (Single exception: `Governance Advisory Check` run `32214601943`, `success` — worth one
    line of investigation, likely a no-op path.)
  - **Onset bracketed:** last success = run `32173796292` (`edge-health-probe`, `schedule`,
    2026-08-18T18:56:20Z). First failure = run `32206511899` (same workflow, `schedule`,
    2026-08-19T01:52:43Z); its job logs now return HTTP 404, consistent with no runner.
- **What this actually costs, concretely** — these are not hypothetical:
  1. `edge-health-probe.yml` is, per root `CLAUDE.md`, "the hive's real eyes on production"
     (this container cannot reach `*.workers.dev`). **The hive is blind to production.**
  2. `scripts/check-claims.py` runs at `.github/workflows/ci.yml:73`. That is the *machine*
     half of `wired-or-not` — the half root `CLAUDE.md` says "survives a context cutoff."
     **Honesty enforcement is currently off.**
  3. `kai-sandbox-run.yml` is how Kai El builds inside venture repos. **Down.**
  4. `kai-el-bridge.yml`, `venture-gap-mirror.yml`, `architect-proposal-check.yml`,
     `colony-health.yml`, `task-digest.yml`, `campaign-roadmap-digest.yml`,
     `sync-planning-docs.yml`, `pages.yml` (the fix that just un-staled `docs/app`). **All down.**
- **Done looks like.** One workflow run completes with a real `runner_name`, and
  `edge-health-probe` returns a green probe with a citable run ID.
- **Depends on.** Nothing. This is the new root.
- **Truth level.** `verified-live` **as a finding** — the block is directly observed, not
  inferred. The *cause* is `unverified` from inside this container (billing limit, spending
  cap, and account flag are all consistent with the evidence; nine-miss-truths not run).
- **Owner.** `founder-only`. Check GitHub → Settings → Billing/Spending limits, and the
  account's Actions status page.
- **Session-ownable mitigation while it is down.** The Cloudflare Developer Platform MCP
  tools are a **second, independent channel to production** that does not route through
  GitHub Actions — they were used for real on 2026-08-18 to read D1/R2/Worker state
  (`unified-forward-plan-v2.md`, Phase 5 §3) and again to close 13 proposals against live D1
  (directive `-058`). Any production verification owed during the outage should go through
  that channel and say so, rather than being skipped or assumed.

---

#### **B1. Two constitution workflows now fight over the same field, on `main`, armed**

**NEW as a live condition.** `FULL_PLAN.html` and `unified-forward-plan-v2.md` both predate it.

- **What it is.** PR #183 merged 2026-08-18T20:00:59Z (merged_by `TehutiRaEl`), adding
  `constitution-receive.yml`. Verified present on `main` alongside `constitution-sync.yml`:
  - `.github/workflows/constitution-sync.yml:71` — `sed -i "s/soul_md_hash: .*/..."` into
    `.queen/hive.yml`, sourced from **root `soul.md`**, triggered by push to `soul.md`.
  - `.github/workflows/constitution-receive.yml:88` — the **same `sed` on the same field**,
    sourced from **`.queen/soul.md`**, triggered by push to `.queen/soul.md`.
  - Current state: `.queen/hive.yml:7` holds `soul_md_hash: "a54f80ce8ca38..."`, which equals
    root `soul.md`'s real sha256 — so `constitution-sync.yml` currently owns the field.
- **Why it is armed, not merely untidy.** PR #183's own body states the consequence plainly:
  once `.queen/soul.md` is edited and the workflow fires, root `soul.md`'s Fixed Laws section
  is **replaced** with `.queen/soul.md`'s terser text, and "the F-00X mechanics currently in
  root are not derivable from the current canonical source and would be lost." Root `CLAUDE.md`
  says root `soul.md` is "the canonical, legally-precise Constitution text" and **governs** on
  any conflict. Measured sizes confirm the asymmetry: `soul.md` is 70 lines / 3,357 bytes;
  `.queen/soul.md` is 25 lines / 1,096 bytes.
- **Done looks like.** The founder answers the taxonomy question (B1a below); then either the
  two workflows write distinct `hive.yml` fields, or one stops treating its source as canonical
  — and a real dispatch proves the surviving one round-trips without destroying law text.
- **Depends on.** B1a (founder answer). Proving it needs **B0**.
- **Truth level.** Collision: `merged` — both files verified on `origin/main` by direct read.
  Damage: `unverified` — the receive workflow has never fired (and cannot, while B0 holds).
- **Owner.** `founder-only` for the taxonomy call; `session` for the fix once answered.
- **Immediate risk control a session can do without the answer:** nothing that edits
  `.queen/soul.md` should land until this is resolved. Worth stating in `HIVE_PULSE.md`.

---

### TIER 1 — founder-only unlocks. Each opens work that is already written and waiting.

---

#### **B2. Rotate `ANTHROPIC_API_KEY` — the Worker's Claude provider is 401ing**

CAMPAIGN task 45; `FULL_PLAN.html` P1; directive `-058`.

- **What it is.** The bound key is rejected. Production returned Anthropic's own verbatim body
  through `GET /v11/llm/status`: `"error":"HTTP 401: {...\"type\":\"authentication_error\",
  \"message\":\"API key is invalid.\"}"`.
- **Done looks like.** `npx wrangler secret put ANTHROPIC_API_KEY` with a valid key; a probe
  shows `active_provider` reaching `claude` with `active_provider_basis: "last real answer"`.
- **Depends on.** Nothing to fix. **B0** to re-verify.
- **Truth level.** Root cause `verified-live` — edge-health-probe run `31216723801`. The
  earlier hypothesis (bad model ID `claude-sonnet-5`) was **disproven** by that same run; task
  45's own text records the wrong guess honestly, which is why it should not be re-guessed.
- **Owner.** `founder-only`. No code change fixes a credential.
- **Downstream cost of not doing it.** Directive `-058` records 13 near-duplicate
  `architect-proposal` rows (ids 9–21, 2026-08-08 → 08-16) that were all the Queen's own loop
  re-filing this same 401. They were closed as `status='rejected'` against live D1 — **queue
  hygiene, not a resolution.** Expect them to regenerate until the key is rotated.

---

#### **B3. Oracle Always Free box — provision, or retire System A honestly**

CAMPAIGN task 53; `FULL_PLAN.html` P0 §4; `unified-forward-plan-v2.md` Phase 3; directive
`-045` decision 1; directive `-050` item 7.

- **What it is.** `.github/workflows/deploy.yml` (lines 24–58) already SSHes to an Oracle box,
  runs `docker-compose up -d --build`, and health-checks `localhost:8080/v11/health`. It is
  inert **only** because `ORACLE_HOST` / `ORACLE_USER` / `ORACLE_SSH_KEY` are unset.
- **One decision, four unblocks** (this is why it ranks here):
  1. System A (`backend/`, FastAPI, 350+ tests) gets a home. It is currently live **nowhere** —
     `thehive-queen.onrender.com/v11/health` → **404**, verified run `31216723801`.
  2. `docs/biosystem.html`'s "Demo Mode — start JASPER backend" stops being a dead-end label.
  3. `FULL_PLAN.html` P6 (MCP / Python harness) becomes buildable at all — a Cloudflare Worker
     structurally cannot provide a long-running process, a filesystem, or Docker.
  4. Real weight-level fine-tuning for Kai El (directive `-050` item 10, "log now, real
     fine-tuning later") is gated on the same hosting decision.
- **Depends on.** Nothing. **B0** to prove `deploy.yml` afterward.
- **Truth level.** `unverified` — nothing provisioned. The *readiness* of `deploy.yml` is
  `merged`; the System-A-is-nowhere finding is `verified-live`.
- **Owner.** `founder-only` — provisioning infrastructure and accepting recurring cost.
- **Founder's directional answer is already on record** (directive `-050` item 7: *"Yes, pursue
  that"*). What is missing is the three secrets, not the intent. **"Retire honestly" is still a
  legitimate answer** and should not be quietly dropped: it would mean marking System A retired,
  deleting `deploy.yml` rather than leaving it skipping forever, and rewording `biosystem.html`.

---

#### **B4. Cloudflare Workers Builds — restrict to `main`, or accept branch deploys knowingly**

CAMPAIGN task 46; `FULL_PLAN.html` P0 §5(b); directive `-050` item 1.

- **What it is.** Pushing *any* branch in this repo is a production deploy.
- **Truth level.** `verified-live`, twice over, and the founder has confirmed the dashboard
  setting themselves:
  - Runs `31216723801` / `31216919290`: two strings with **zero occurrences on `origin/main`**
    were being served live — `"active_provider_basis":"last real answer"` (from unmerged commit
    `f04633d`) and the `Orchestrator`/`reports_to: Kai El` agent row (from unmerged `a8c045b`).
  - Directive `-050` item 1: the founder read the real dashboard — **"Main and other branches."**
- **Why it still matters after being "confirmed."** The confirmation resolved *whether*, not
  *what to do*. The standing rule "automation never merges, every change waits for founder
  review" **assumes unmerged work is not live**. That assumption is false and has been for
  weeks. Directive `-055` then granted merge authority anyway, which changes the risk shape but
  does not remove the mismatch — the rule's *wording* still describes a gate that does not exist.
- **A compounding honesty bug ships with it.** `GET /v11/debug/git` returns
  `branch: 'main'` and `deployed_via: 'Cloudflare Workers Builds from main'` as **hardcoded
  string literals** — the one endpoint whose entire job is reporting deploy identity was
  observed stating a falsehood in the same run. **Current verified location:
  `worker/src/index.js:3563-3569`** (`branch: 'main'` at `:3565`, `deployed_via` at `:3566`).
  Task 46 and `FULL_PLAN.html` both cite `:1939-1940`, which has **drifted and is now wrong** —
  re-checked by direct read this pass. **This half is
  session-ownable and should be fixed regardless of which way the founder decides**: report real
  build metadata, or honestly report `unknown`.
- **Possibly related, unresolved:** task 46 logs three episodes (2026-08-15 run `31867590926`,
  2026-08-17 run `32081431457`) of the work-cycle round-robin sticking on `"Ma'at — balance"`
  for 7–8 straight hourly ticks, each self-resolving within ~24h with **no code fix**, and with
  stale-cache / code-regression / isolated-logic-bug all ruled out by direct test. Task 46's own
  note is the right one: this is consistent with the same deploy-identity problem, and the next
  useful evidence is **Cloudflare dashboard access**, not more hypothesis-elimination from here.
- **Owner.** `founder-only` for the config decision; `session` for the `/debug/git` fix.

---

#### **B5. Task 41 — the Hoard pays for its own existence (wallet, spend tracking, limits)**

CAMPAIGN task 41; `FULL_PLAN.html` P1; directive `-044`.

- **What it is.** Real wallet, real per-call spend tracking, real self-awareness of usage limits
  and context windows. The founder's own framing: *"I need it to be able to pay for itself."*
- **Why it ranks here despite being large.** It is the **single most load-bearing blocker in the
  queue by count of things waiting on it.** Task 47 (the 13-agent roster) is explicitly
  sequenced behind it (directive `-050` item 2: *"Wait for both to finish first"*). `FULL_PLAN`
  P3 depends on P1. P7 (ventures) depends on P1.
- **Two real inputs already folded in, which should be the starting point rather than a blank
  page** (task 41's own 2026-08-08 addendum):
  - `backend/core/criteria.py` is already a real, tested retention policy (90-day age,
    adoption-count relevance, health flags, archive-never-destroy into `pruned_memory`). It has
    never run because System A runs nowhere (**B3**). The hive has been improvising the same
    principle ad hoc ever since — task 45's `provider_health` table is deliberately "exactly 4
    rows forever, never a growing log."
  - Task 51 fixed the *measurement*, not the *cost*. ~90–96% of real spend is cache creation
    from re-materialising a very large context every turn. `.claude/HIVE_PULSE.md` is already a
    hand-built instance of the fix (one small page, read first) that was never recognised as a
    cost mechanism.
- **Done looks like.** A real wallet with a code-enforced cap the hive cannot raise itself, a
  per-transaction record, and a retention policy that is chosen rather than improvised.
- **Depends on.** **B3** (`FULL_PLAN` P1's own stated dependency: "you cannot price
  infrastructure you have not chosen"). Also touches the money boundary directive `-055`
  explicitly excepted.
- **Truth level.** `unverified` — not started, not scoped.
- **Owner.** `founder-only` to scope; `session` to build once scoped.

---

#### **B6. Task 47 — seat the roster to 13 agents**

CAMPAIGN task 47; `FULL_PLAN.html` P3 §5; directives `-045` decision 2, `-050` item 2.

- **Status correction that matters:** `FULL_PLAN.html` P3 still lists this as blocked on
  *"the real intended headcount... and whether those are real LLM-backed agents or role labels."*
  **Both were answered on 2026-08-10** (directive `-050` item 2): **13**, and **"All of them,
  eventually"** LLM-backed. Larger intent also given unprompted: *"over 100's of agents per
  colony"* eventually, reached by deliberate scale-up, each new agent individually reviewed and
  tested before deploy. **Stop re-asking this.**
- **What actually blocks it now is sequencing, not information.** Its own gate is "6-Elder pilot
  AND task 41." Task 38 (pilot) is `done`; **task 41 is not** → one of two conditions met. The
  2026-08-18 firing corrected its status `pending → blocked` on exactly that basis.
- **Depends on.** **B5** (task 41). Hard.
- **Truth level.** `unverified`. Current real state: the `agents` D1 table holds **9** rows
  (Akosha added 2026-08-10), not the 8 that task 47's own body still says.
- **Owner.** `session` once B5 clears — the founder's decisions are already in hand.
- **Also settled, do not relitigate:** *"Drop the 100k, focus on the 8"* (directive `-045`
  decision 2). The 100,000-agent architecture is out of scope until the existing agents work.

---

#### **B7. Triage the 5 approved-but-unactioned proposals**

`FULL_PLAN.html` P7; directive `-044`.

- Live in production as of probe `31216723801`: **#1** (create a "venture" colony repo —
  founder-only by its own body text), **#5** (free/open-source discovery — CAMPAIGN task 40),
  **#6** (book-merch dropshipping), **#7** and **#8** (agent-generated, about unactioned work
  itself — i.e. the hive noticing its own backlog).
- **Partly superseded:** proposal #1's outcome is effectively achieved —
  `unified-forward-plan-v2.md` records 9 real venture repos connected with push access and a
  `TehutiRaEl/venture` repo scaffolded. The **row** was never closed. Closing stale approved
  rows is `session`-ownable via the Cloudflare MCP channel (the precedent is directive `-058`,
  which closed ids 9–21 that way after first reading `decideProposal()` at
  `worker/src/index.js:458-523` to match its exact behaviour).
- **Depends on.** B5 for #6 (a venture without a cost model is a guess). Nothing for the row hygiene.
- **Truth level.** `verified-live` as a finding (probe-observed). Disposition `unverified`.
- **Owner.** `founder-only` for #1 and #6; `session` for hygiene on #7/#8.

---

### TIER 2 — session-ownable, unblocked *except* by B0's verification outage

Directive `-055` (2026-08-18) grants authority here explicitly: *"You can do all now from low
risk mid risk and high risk unless it needs money."* Two switches stay off regardless
(`AUTOMATON_FINANCIAL_AUTONOMY`, `AUTOMATON_REPLICATION_AUTONOMY` — the latter re-confirmed
**"No, leave it off"** in directive `-058`), plus `KAI_SANDBOX_AUTONOMY`.

---

#### **B8. Queen Phase Q-A — Nanuet's own brain (D1 + decision log + staged autonomy)**

`2026-08-19-queen-orchestration-master-plan.md`, Phase Q-A; `unified-forward-plan-v2.md`
Phase 12; directive `-050` item 10.

- **What it is.** Mirror Kai El's already-shipped pattern for Nanuet: a physically separate D1
  database, a decision/outcome log, **recency-weighted recall from day one**, staged-autonomy
  switches all default-off.
- **Why it is the best available non-blocked build.** The founder's own words authorise the
  resumption: *"the same for Nanuet later, when work on the Queen resumes."* The confirmed gap
  is real and was **re-verified independently this pass**, not inherited:
  `grep -ciE 'nanuet|queen' .claude/skills/autonomous-hive-agent/SKILL.md` → **0**. The skill
  that drives the campaign queue has no concept of the Queen at all.
- **Two known traps already documented, avoid repeating them:**
  1. Kai El's `recall()` shipped **without** recency weighting. **Re-checked by direct read
     this pass, and the finding needs restating more precisely than task 53 recorded it:**
     `remember()` (`worker/src/index.js:1636`) stores a real `ts` in every row's metadata, and
     `recall()` (`:1647`) now *does* surface it in its returned matches (`:1659`,
     `ts: m.metadata?.ts ?? ''`) — but it still **ranks purely on cosine score**
     (`env.VECTORIZE.query(values, { topK, returnMetadata: 'all' })`, `:1653`) and never
     re-ranks on `ts`. So a day-one fact still outranks today's whenever it embeds closer; the
     field is now *available* to fix it and simply unused. Build the re-rank in from the start.
     (Task 53 and directive `-050` cite `:1160`/`:1171` and `:1431`/`:1442` respectively —
     **both have drifted**; `:1636`/`:1647` are the current verified lines.)
  2. D1 slots: `-050` item 4 gives the real numbers — **2/10 databases**, storage 91.44 MB/5 GB
     (<2%), rows read 1.24M/5M, rows written 28.3k/100k. **D1 space was never the constraint**
     that tasks 47/52 cited. But *slots* are: 13 agents × 2 DBs = 26, past the ceiling of 10.
     A separate DB was chosen for Kai El *specifically as the second brain*, not as a template.
     **Nanuet is the one other agent with the same standing.** Do not generalise past her.
  - **Free slot available:** `sovereign-hive-app` is confirmed empty (0 tables, 12 KB, created
    2026-07-25), occupying a slot for nothing (directive `-050`, incidental finding).
- **Done looks like.** Q-A ships as `tested`; `verified-live` needs a probe run ID showing
  Nanuet's D1 rows in production — **which needs B0**.
- **Depends on.** Nothing to build. **B0** to reach `verified-live`.
- **Truth level.** `unverified` — not built.
- **Owner.** `session`.

---

#### **B9. Queen Phase Q-B — route Nanuet's reviews through `hive-conductor`'s real domain router**

Queen plan Phase Q-B.

- **What it is.** PR #186 (merged 2026-08-18 04:25:37) built `domain_router.py` plus five
  `harnesses/*.json` manifests (edge-backend / frontend / colonies / governance / strategy;
  table at `hive-conductor/SKILL.md:58-67`). **It has never been exercised against a real
  founder directive.** Nanuet's review pipeline is the natural first real user — today
  `queenReview()` (`worker/src/index.js:1947`, called at `:2064`) has no domain awareness at
  all. (The Queen plan cites `:1019` for this; **drifted** — `:1947` is the current verified
  line, confirmed by direct read this pass.)
- **Done looks like.** One real, non-synthetic directive routed by Nanuet through
  `domain_router.py` — that run *is* Thread B's first `verified-live` proof.
- **Depends on.** **B8**.
- **Truth level.** `tested`, not `verified-live` (the Queen plan states this honestly).
- **Owner.** `session`.

---

#### **B10. Queen Phase Q-C — Nanuet observes, then advises, on the campaign queue**

Queen plan Phase Q-C, tiers 1–2 only.

- **Tier 1 (observe-only):** Nanuet reads the queue and logs which task she'd pick and why.
  Changes nothing about how firings run. **Buildable now.**
- **Tier 2 (advise):** the daily-firing protocol reads her logged recommendation before picking,
  the same way it already reads `HIVE_PULSE.md` first.
- **Tier 3 (delegate through Akosha) is NOT in this backlog** — it needs fresh founder sign-off
  (see **B1c/B1d** in §D).
- **Sharp edge worth naming:** the queue is currently **empty** (45 done / 15 blocked / 0
  pending). An observe-only Queen watching an empty queue produces an empty observation. Q-C
  tier 1 is genuinely more useful *after* B5/B6 refill the queue — or should deliberately be
  built to observe the **blocked** set and the founder-decision queue instead, which is where
  the real state lives. This is a real design question the Queen plan does not currently address.
- **Depends on.** B8, B9.
- **Truth level.** `unverified`.
- **Owner.** `session` for tiers 1–2.

---

#### **B11. Fix `GET /v11/debug/git`'s hardcoded deploy identity**

- `worker/src/index.js:1939-1940` returns `branch: 'main'` / `deployed_via: 'Cloudflare Workers
  Builds from main'` as literals. Observed stating a falsehood while serving branch code
  (run `31216723801`).
- **Done looks like.** Real build metadata, or an honest `unknown`.
- **Depends on.** Nothing. Independent of how B4 is decided.
- **Truth level.** `merged` (the bug is on main). Fix `unverified`.
- **Owner.** `session`. Touches `worker/src/index.js` → own PR per directive `-052` answer 1.

---

#### **B12. Wire or delete the 11 orphaned frontend components**

`FULL_PLAN.html` P4 §2; `unified-forward-plan-v2.md` Phase 2.

- **Imported by nothing:** `TesseractChamber`, `MissionCard`, `MissionTimeline`,
  `ConstitutionVisualizer`, `MemoryGraphEnhanced`, `AchievementToast`, `LevelUpNotification`,
  `Avatar`, `AvatarCustomizer`, `worlds/AchievementTracker`, `worlds/MultiplayerManager`.
- **Method warning, carried forward verbatim because it already caused one false finding:** a
  first scan reported 14 dead tabs. **Wrong** — they are `lazy(() => import(...))`-loaded from
  `frontend/src/pages/KaiElOS.tsx`. Any orphan scan here **must** resolve dynamic imports.
- **Related but distinct:** four gamified components (`HiveDashboard`, `ColonyCard`,
  `ConstitutionHall`, `MemoryVault`) exist **only** on the orphaned
  `feature/gamified-ui-components` branch and reached neither `main` nor anywhere else. Only
  `TesseractChamber` made it to `main` (byte-identical) — and it is orphaned there. Founder
  confirmed this was real, wanted, unfinished work needing **re-skinning with live federation
  data, not a rebuild**. `ColonyCard` has since been re-skinned and mounted in the WORLD tab
  (`HIVE_PULSE.md`) — so the pattern is proven; three remain.
- **Done looks like.** Each of the 11 is either imported by a real surface or deleted.
- **Depends on.** B1d (which frontend is canonical) for the gamified set only; **the 11 orphans
  in the live React app need no founder input** — leaving them is what makes "the Command
  Center is current" untrue.
- **Truth level.** `deployed but partly untrue` in `FULL_PLAN`'s words; per this repo's
  vocabulary: the app is `deployed`, the orphan finding is `merged`-level evidence (code read),
  the fix is `unverified`.
- **Owner.** `session`.

---

#### **B13. Wire `memory/_graph.json` (the 101-node knowledge graph) into the live Worker**

- **Founder-approved, verbatim, and then apparently dropped:** directive `-050` item 6 — *"Yes,
  wire it in as its own task."* **This task was never created.** It appears in no CAMPAIGN task,
  no phase in v2, and no P0–P7 project. This is a real founder instruction that fell through a
  session boundary — exactly the failure mode `founder-directive-capture` exists to prevent, and
  it happened anyway because capture ≠ queueing.
- **Done looks like.** The graph is readable from System B and something real consumes it.
- **Depends on.** Nothing.
- **Truth level.** `unverified` — not started, not queued.
- **Owner.** `session`. **Recommend creating this as CAMPAIGN task 54.**

---

#### **B14. Close CAMPAIGN task 2 and task 9 as pointers, not blockers**

- Task 2 and task 9 are both marked `blocked` while their own text says they are **decomposed
  parent pointers** ("this parent stays blocked as a pointer, not real work"). Their children
  are done: 2a–2e all `done`; 9b, 9c `done`; only **9a** is genuinely blocked.
- **Effect on the queue's own arithmetic:** 2 of the 15 "blocked" tasks are not blocked work at
  all. The real blocked count is **13**, of which **9a** is blocked on tooling, not the founder.
- **9a's real blocker is not a founder decision:** `add_repo` with push access was denied by the
  harness's auto-mode classifier for every external repo tried (`4DBRAIN`, then `aether` — same
  denial, confirming a blanket restriction). A template is already staged at
  `.claude/skills/autonomous-hive-agent/templates/COLONY_PULSE_TEMPLATE.md` for whoever has real
  push access. **Note the tension:** `unified-forward-plan-v2.md` records 9 venture repos
  attached *with push access* by a different mechanism. Whether that mechanism also serves the
  6 colony repos is **unverified** and is the cheapest thing to check before treating 9a as hard.
- **Owner.** `session` (queue hygiene). Low cost, removes standing false signal.

---

### TIER 3 — explicitly parked. Listed so they stop being rediscovered.

| Item | Disposition | Source |
|---|---|---|
| P6 — MCP / Python harness | Not started **by decision**. Founder: *"Just tell me what to ignore"* — triage only, no build. Blocked by construction on **B3**. Do not copy the source document's code: its orchestrator does not compile (`json.dump(plan_data, indent=2, f)` is a SyntaxError, confirmed with `py_compile`). | directive `-045` decision 4; `FULL_PLAN` P6 |
| 100k-agent architecture | Out of scope. *"Drop the 100k, focus on the 8."* | directive `-045` decision 2 |
| Self-expansion (agents writing own tools/prompts) | Build gated, default-off, founder-flipped — same precedent as `AUTOMATON_FINANCIAL_AUTONOMY`. | directive `-045` decision 3 |
| LLM-from-scratch document | Log-only. *"No, don't build anything... break it down to its very atoms and rebuild it into the hive instead of copying and pasting."* | directive `-046` |
| Arithmancer PDF | Audit only, nothing built or merged. | directive `-048` |
| Founder's "Purse" stealth-payment scheme | Declined. | v1 → v2 "Deferred vision" |
| Macro-universe 3D Command Center | Catalogued, not built. | `FULL_PLAN` §3 |
| Task 18 (Dissertation doc) | Reviewed, **not merged as-is** — real security regression (pasted `hive_mesh.py` drops HMAC signing), validation-theater in `validator.py`, `TTLCache` undefined-name crash in `wealth.py`, a fabricated-looking "500x speedup" in `qhdc.py`. Non-duplicate value extracted as tasks 19–20. | CAMPAIGN task 18 |
| Tasks 16, 17, 20, 23 | Blocked **by their own stated acceptance criteria**, which require a founder confirmation that was never asked for. These are correctly parked, not stalled. Do not "unblock" them by starting work. | CAMPAIGN 16/17/20/23 |
| Branch deletions (4 branches) | `mistral/frontend-command-center`, `cloudflare/workers-autoconfig`, `claude/session-continuation-owj5wr` are tree-identical to `feature/gamified-ui-components` (`56793bff...`), zero live-consumer risk — cleanest deletion candidates. `grok-strategist-main` cannot be deleted casually: `grok-bridge.yml` targets it **by name**. `security/redact-env-example-secrets` is safe to delete now (its fix is byte-identical on `main` via PR #130). **Deletion requires the founder's disposition, per `branch-dissection`'s own hard boundary.** | directive `-057` |

---

## (c) Batching analysis — `memory/philosophy/resonance-interference.md`

> *"Separate work streams amplify each other when they are in phase, and cancel each other when
> they are out of phase."* Batch the in-phase; **sequence** the out-of-phase.

### In phase — batch these

**Batch A — "the Queen's brain" (B8 + B9 + B10 tier 1).**
Amplifying on three of the doctrine's four criteria at once: same file/subsystem (all
worker-side, all touching Nanuet's review path), one unblocks the next (Q-A's decision log is
what Q-B routes into and Q-C tier 1 writes to), and they **share evidence** — a single probe run
after B0 clears proves all three. One context load serves the whole batch. This is the single
best-formed batch in the repo right now.

**Batch B — "the honest-deploy pair" (B11 + the `wired-or-not` re-audit of inherited claims).**
Both are about the same defect class — a surface asserting a truth it never checked. `/debug/git`
hardcodes `branch: 'main'`; inherited `done` markers assert a level they never earned. One
finding sharpens the other's question, which is the doctrine's fourth in-phase criterion.

**Batch C — queue hygiene (B14 + B7's row-closing + refreshing `HIVE_PULSE.md` with B0/B1).**
All three are `.claude/tasks/` + D1-row bookkeeping, no code paths, one context load, and they
share a single verification (re-read the queue and the proposals table once at the end). Cheap,
and it removes standing false signal that every future firing currently pays to re-derive.

**Batch D — the two constitution-workflow edits (B1's fix, once B1a is answered).**
Both edits land in `.github/workflows/`, both concern the same `hive.yml` field, and neither can
be verified without the other. Splitting them across sessions would leave `main` in a state where
one workflow was fixed and the other still fights it.

### Out of phase — sequence these

**B5 (wallet) ✕ B6 (13 agents).** Explicitly out of phase by the founder's own sequencing
(*"Wait for both to finish first"*) and by the doctrine's rule that **one is blocked on a
founder decision the other assumes an answer to.** Every agent with a real voice costs real
tokens per call; seating 13 before the cost model exists multiplies the exact "name on an org
chart with nothing behind it" problem the founder called fabrication. **Sequence: B5 → B6.**

**B3 (Oracle) ✕ B5 (wallet).** `FULL_PLAN` P1 states this directly: *"you cannot price
infrastructure you have not chosen."* Scoping a cost model against an undecided host measures
neither the old nor the new system. **Sequence: B3 → B5.**

**B1 (constitution workflows) ✕ any `.queen/soul.md` edit ✕ the Phase 1a verification script.**
Three-way out of phase, and the most dangerous case in the repo: an edit to `.queen/soul.md`
would be **verified against state the other is mid-change on**, and would fire a workflow that
overwrites root `soul.md`'s Fixed Laws. The Phase 1a script has nothing to check equality
against until B1a answers what equality even means. **Hard sequence: B1a → B1 → script → any
`.queen/soul.md` edit.** Nothing in this chain may be batched.

### Real file-level conflicts — name them before two lanes collide

- **`worker/src/index.js` is the contention point.** Four separate backlog items write to it:
  **B8** (Nanuet's brain: new D1 binding, `recall()` recency re-rank near `:1160`/`:1171`),
  **B9** (domain routing at the proposal-scoring call, `:1019`), **B11** (`/debug/git`,
  `:1939-1940`), and any B2 follow-on touching `generate()`/`llm/status`. B8 and B9 are in phase
  and should be one PR; **B11 must be its own PR** — it is a different subsystem and a different
  verification, and merging it into the Queen PR would make a one-line honesty fix hostage to a
  much larger review. Directive `-052` answer 1 already requires anything touching
  `worker/src/index.js` to get its own PR.
- **`.queen/hive.yml`'s `soul_md_hash` field is written by two workflows**
  (`constitution-sync.yml:71`, `constitution-receive.yml:88`). This is not a *risk* of
  contradictory edits — it is an **actual, shipped** one. It is the textbook case of the
  doctrine's first out-of-phase criterion: "contradictory edits to the same lines; the second
  silently overwrites the first."
- **`.claude/tasks/CAMPAIGN.html` + its generated `docs/campaign.html`.** The generated file is
  produced mechanically and must never be hand-edited (the 2026-08-18 log records this
  discipline). Any lane touching the queue must regenerate rather than edit — and two lanes
  editing CAMPAIGN.html in the same window will collide on the task-count invariant.
- **`HIVE_PULSE.md`** is written at the end of *every* firing by definition. Any parallel lane
  that also edits it will conflict. Batch C should own it for this window.

### Standing wave — the pattern that looks like progress

The doctrine's named example is this repo's own: *"sessions repeatedly built agent layers (tasks
37 → 38 → 48 → 52) while the verification each layer promised was never performed."* **B0 makes
this the live risk right now.** With `edge-health-probe` down, every new build (B8, B9, B10) can
reach `tested` and **no further** — and the honest label for the whole batch stays `tested`
until B0 clears. Ask the doctrine's own detector before each firing: *has anything measurable
changed, or only the amount of work done?* Building Q-A/Q-B/Q-C while blind is defensible
(the work is real and the levels stay honest). Building them and then **claiming** they work
would be the standing wave repeating exactly as documented.

---

## (d) The founder-decision queue — deduplicated

**Nine genuine open decisions.** Ordered by how much each unblocks.

| # | Decision | Blocks | Where it is recorded |
|---|---|---|---|
| **F1** | **Restore GitHub Actions** — check billing / spending limit / account status | **Everything's verification.** `edge-health-probe`, CI's `check-claims.py`, `kai-sandbox-run`, 8 more workflows | **Nowhere yet** — commit `18d8fd5`, CAMPAIGN 2026-08-19 log only |
| **F2** | **Constitution taxonomy:** are `.queen/soul.md` and `docs/GOVERNANCE.md` verbatim copies of `soul.md`, declared derived views, or genuinely separate documents for different audiences? | B1, the Phase 1a verification script, any `.queen/soul.md` edit, and defusing an armed overwrite of root `soul.md`'s Fixed Laws | v2 Phase 1a; directive `-052` |
| **F3** | **Rotate `ANTHROPIC_API_KEY`** | B2; stops the Queen re-filing duplicate 401 proposals | task 45; directive `-058` |
| **F4** | **Oracle box: provision (3 secrets) or retire System A honestly** | B3 → B5 → B6; `FULL_PLAN` P6; JASPER Demo Mode; Kai El fine-tuning | task 53; `FULL_PLAN` P0 |
| **F5** | **Cloudflare Workers Builds: restrict to `main`, or accept branch deploys and rewrite the never-merge rule to match** | B4; the credibility of every review gate; possibly the recurring round-robin sticking | task 46; `FULL_PLAN` P0 |
| **F6** | **Scope task 41** (wallet, spend tracking, retention policy) | B5 → B6 → P7 | task 41; directive `-044` |
| **F7** | **Triage proposals #1 and #6** (venture repo, book-merch dropshipping) | B7 / `FULL_PLAN` P7 | probe `31216723801` |
| **F8** | **Queen Phase Q-C tier 3 risk classification** — which task types are low-risk (autonomous-within-limits), normal (draft-then-approve), high-risk (explicit-invoke-only, Nanuet must state why)? | Q-C tier 3 **and** Kai El's Phase B — *the same question, asked twice* | Queen plan; directive `-050` item 10 |
| **F9** | **Branch deletion disposition** (the 4 identical-tree branches + `grok-bridge.yml`'s fate) | Closing the branch-dissection queue | directive `-057` |

### Deduplication notes — the same question was being asked more than once

- **F8 is one question, not two.** The Queen plan's "risk classification for delegated actions"
  and directive `-050` item 10's unbuilt "Phase B risk classification" are **the identical
  question** about the identical ladder. Asking them separately is how a founder ends up
  answering the same thing twice. A proposed starting list already exists in `-050` item 10 and
  should be put in front of the founder rather than re-derived: *anything touching
  money/wallet, deletions, deploys/merges, or external communications = high-risk by default.*
- **F4 already has a directional answer** (`-050` item 7: *"Yes, pursue that"*). What is
  outstanding is the three secrets. Present it as "confirm and set", not as an open fork —
  while keeping "retire honestly" genuinely available, since it remains a legitimate answer.
- **F2 and Phase 1a are one item**, not a founder question plus an engineering task. The script
  cannot be written first.

### Already answered — plans that still list these as open are wrong

| Still listed as open in | Actually answered |
|---|---|
| `FULL_PLAN.html` P3 §5 — *"Name the Orchestrator"* | **Akosha.** Directive `-050` item 5, 2026-08-10. Renamed in `worker/src/index.js` (agents seed, `AGENT_JOBS`, `AGENT_WORK`, `hiveSnapshot()`), 132/132 green. Verified live rotating in probe `32171115429`. |
| `FULL_PLAN.html` P3 §5 + P1 §4 — *"real agent headcount"* / *"real agents vs role labels"* | **13**, and **"All of them, eventually"** LLM-backed. Directive `-050` item 2. |
| `FULL_PLAN.html` P1 §4 + `NEXT_SESSION.md` — *"token-ceiling measure"* | **Count real work tokens only.** Chosen twice — directive `-048`, re-confirmed `-050` item 3. Shipped 2026-08-08. CAMPAIGN task 51 is `done`. |
| `FULL_PLAN.html` P2 §4 + `NEXT_SESSION.md` — *"task 15 is in-progress"* | **Done.** CAMPAIGN task 15 is `done`. |
| `FULL_PLAN.html` P3 §2 — *"the Orchestrator has not been observed taking a work turn"* | **Observed.** Probe `32171115429`, 8 distinct agents rotating, Akosha included. |
| task 47 body — *"D1 space is a real named constraint"* | **Stale.** Real numbers: 91.44 MB/5 GB, <2%. Directive `-050` item 4. **Slot** count (2/10) is a real constraint; **space** is not. |
| task 47 body — *"the `agents` table holds 8 rows"* | **9.** Akosha added 2026-08-10. |
| task 45 hypothesis — *"model ID `claude-sonnet-5` may be invalid"* | **Disproven.** Run `31216723801` returned a 401 `authentication_error` — Anthropic rejects the credential before it looks at the model. Recorded because fixing on the hypothesis would have changed the wrong thing. |
| directive `-058` open item — *"PR #183 held pending founder resolution"* | **Merged** 2026-08-18T20:00:59Z by the founder — **with the conflict unresolved.** See B1. |
| `NEXT_SESSION.md` (2026-08-08) generally | **Stale throughout.** Its own top item (task 15) and its "highest-leverage blocker" (task 51) are both closed. It should be marked superseded. |

---

## (e) Contradictions between lineages — named, not silently resolved

**C1 — Is the queue empty, or is task 15 the top item?**
`NEXT_SESSION.md` (2026-08-08) opens with *"Task 15 — FOUNDER CHOSE THIS AS THE TOP ITEM...
Blocked on nobody. This is the only substantial unblocked work in the ledger."* `FULL_PLAN.html`
P2 §4 agrees ("task 15 is in-progress, not done, and says so"). `CAMPAIGN.html` says task 15 is
`done`, and the 2026-08-19 firing confirms 60/60 done-or-blocked, zero pending.
**Resolution: CAMPAIGN is right, the other two are stale.** Recommend marking `NEXT_SESSION.md`
superseded rather than leaving it as a read-order entry that points a fresh session at closed work.

**C2 — Is `.queen/soul.md` canonical, or is root `soul.md`?**
Root `CLAUDE.md`: root `soul.md` is *"the canonical, legally-precise Constitution text"* and
*"where wording differs, `soul.md` governs."* PR #183 (merged): *"`.queen/soul.md` becomes
canonical going forward. Root `soul.md` is regenerated from it."* `constitution-sync.yml` behaves
per the first; `constitution-receive.yml` behaves per the second. **Both are now on `main`.**
This is not a documentation inconsistency — it is two automated processes acting on opposite
premises against the same field. **This is F2, and it is the highest-stakes contradiction here**
because the losing side's detailed law text does not survive.

**C3 — Does branch code reach production, and does the never-merge rule still mean anything?**
Task 46 + directive `-050` item 1: **yes**, pushing a branch deploys it. The session protocol
still reads *"automation never merges, every change waits for founder review"* — a rule whose
protective value assumes unmerged work is not live. Directive `-055` then granted broad merge
authority. **Three positions, never reconciled into one sentence.** Not resolved here: the
founder should decide whether the rule is restated to match reality (F5) or reality is changed
to match the rule.

**C4 — Is Phase 6 (per-colony harness manifests) closed or open?**
`unified-forward-plan-v2.md` recommends closing it as "addressed differently" via
`colonies.json` and explicitly asks the founder to confirm rather than closing unilaterally.
`FULL_PLAN.html` does not carry Phase 6 at all. The literal files v1 named (`aether.json` etc.)
still do not exist. **Genuinely open, low stakes, easy to close** — but it should be closed
deliberately, not by attrition.

**C5 — Which frontend is canonical?**
`FULL_PLAN.html` P4 §5 lists this as blocked on the founder. `unified-forward-plan-v2.md`
Phase 2 treats it as effectively answered — founder confirmed the gamified work was real,
wanted, unfinished, and should be **re-skinned with live federation data**, and the next step is
filing a Tier-2 Proposals entry (`wire-gamified-ui-alt-view`), not choosing a winner. **These are
compatible if the answer is "React app is canonical, gamified components become an alt view
inside it"** — which is what v2's own phrasing implies but never states outright. Worth one
sentence of confirmation; **not worth re-opening as a fork in the road.**

**C6 — Is task 9a blocked by tooling, permanently?**
Task 9a: `add_repo` push access was denied by the harness classifier for every external repo
tried — "a blanket restriction, not a per-repo fluke." `unified-forward-plan-v2.md`: 9 venture
repos **are** attached with push access, "via a different session/mechanism." **Both may be
true** (different session, different classifier state), but nobody has checked whether the
working mechanism also serves the 6 colony repos. **Unverified.** Cheapest possible check;
would either close 9a or convert it into a real, specific ask.

**C7 — Every lineage's `worker/src/index.js` line-number citations have drifted, and they
disagree with each other.**
Found while verifying this document's own claims rather than inheriting them. Three lineages
cite three different lines for the same two functions, and **all three are now wrong**:

| Cited as | By | Actual (verified 2026-08-19) |
|---|---|---|
| `remember()` `:1160` / `recall()` `:1171` | CAMPAIGN task 53 | **`:1636` / `:1647`** |
| `remember()` `:1431` / `recall()` `:1442` | directive `-050` item 10 | **`:1636` / `:1647`** |
| `/debug/git` `:1939-1940` | task 46, `FULL_PLAN` P0 | **`:3563-3569`** |
| proposal scoring `:1019` | Queen plan Phase Q-B | **`queenReview()` `:1947`** |

Exception worth noting because it shows the drift is real and not a citation habit:
`decideProposal()` `:458-523` (directive `-058`) **still resolves correctly** — that one was
cited yesterday, the others weeks ago. `worker/src/index.js` is the hive's single largest
contention surface (§c), so stale line citations are not cosmetic — they send a session to the
wrong code. **Recommendation: cite function names as the primary reference and line numbers as
a secondary hint**, since function names survive edits and line numbers demonstrably do not.

**C8 — What does `FULL_PLAN.html`'s P0–P7 "start here" ledger still mean?**
It is dated 2026-08-07/08 and instructs any AI in any session to resume from it. Six of its
statements are now stale (§d table). It remains the best-structured artifact in the repo — the
six-field contract is genuinely good — but **following it literally today produces wrong work.**
Not resolved here (this lane may write only one file). Recommend the next session that owns
`.claude/tasks/` either refresh P0–P7 in place or add a dated banner pointing at this document.

---

## Verification discipline for whoever picks this up

- **B0 is live.** Until a workflow run completes with a real `runner_name`, **no claim above
  `tested` can be made honestly** for anything new — `deployed` and `verified-live` both require
  evidence this repo currently cannot generate through its usual channel. Use the Cloudflare
  Developer Platform MCP tools as the second channel and **say which channel produced the
  evidence**, per `wired-or-not`'s rule that the reference must be checkable by someone who does
  not trust you.
- **Run `dual-lens` before any structural choice here** (devil's advocate first, childlike
  wonder second — that order). B1's fix, B5's scope, and B8's schema all qualify.
- **Run `founder-input-intake` before the next action** if the founder sends anything mid-work,
  and write the triage into the plan file — a triage held only in a session's head dies with it.
- **Check `resonance-interference.md` before batching** anything not already batched in §c.
- **The money boundary from directive `-055` is absolute**: nothing that spends real funds or
  touches a payment/wallet/purchase flow. `AUTOMATON_FINANCIAL_AUTONOMY`,
  `AUTOMATON_REPLICATION_AUTONOMY` (re-confirmed off in `-058`), and `KAI_SANDBOX_AUTONOMY` stay
  off regardless of risk-tier authorization.
