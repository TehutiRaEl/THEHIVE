# Biosystem Build Plan — from code to live

**Status:** PLAN, 2026-11-11. Workspace-only. This plan builds nothing by
itself — it is the written order of work. Every phase starts only on the
founder's go-ahead (preamble rule — one question at a time, ELI5). Nothing
in this file edits, builds, deploys, merges, or flips anything. No
constitution file or workflow is touched by this plan.

**Decision this plan implements:** Q-B1, RETIRE the legacy biosystem page
(`docs/biosystem.html`) — as **STEP 1 of reverse engineering, NOT
abandonment**. Everything the founder built in the bio hive system is for
the Hive. It was never built and wired into the Hive properly. This plan is
the order that gets it done properly.

**Sources:** the blueprint
(`~/workspace/hive-batches/BIOSYSTEM_REVERSE_ENGINEERING_BLUEPRINT.md` v1.0),
the audit (`~/workspace/hive-batches/BIOSYSTEM_GATEWAY_AUDIT.md`),
the rewire map (`~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` §2
Worker route table). Repo state: audit clone main `7af242d`; main has since
moved to `b4ebd6d8` via docs-only PR #224, so every frontend file read here
is current.

**Evolution rule (founder's standing instruction):** as the founder keeps
expanding the structure, this plan evolves every time — using everything he
has already provided for the structure plus everything newly provided.
When the structure grows, bump the version (v1.1, v1.2…), add the new
concepts to the affected phase, and never silently drop a step. The plan is
the order of work; the build follows it, not the other way round.

---

## §1 — The code-to-live structure

The founder's lifecycle for this build, in order:

**coded → wired → developed → tested → retested → further implementation →
improvements if necessary → rewired → further developed → deployed → live.**

That lifecycle runs on the ratified 20-rung done ladder — the code-to-live
structure:

1. compiles
2. researches
3. confirm
4. abduct
5. deduce
6. tested
7. quantitative analysis
8. innovative compressive complex computing
9. reverse engineered if necessary
10. legally and lawfully sound
11. quantum compression
12. Devil's Advocate
13. Childlike Wonder
14. DaVinci fully applied
15. wired
16. tested
17. **16b Fable pre-merge (blocking PR gate)**
18. merged
19. deployed
20. **verified-live**
21. **20 Fable post-live** (the 7-step Fable debugger, run again after live)

**Only verified-live counts as done.** A phase that is coded but not
verified live is not done — it is in progress. A phase that passes its
tests but has an open Fable finding is blocked — the finding is fixed
deliberately (see §2, the bug rule), not folded silently into the same
change.

The plan is nine phases, B0–B8. Each phase names the rungs it runs on, the
steps in order, the verification for each step (exact probe, expected
result), the troubleshooting for the common failure, and the evidence that
gets recorded. **No phase starts until the founder's go-ahead for that
phase.** A go-ahead for B0 is a go-ahead for B0 only — it does not carry
forward to B1.

---

## §2 — The rules that bind the plan

**1. Preamble, per phase.** Before any phase, the founder gets the plain
version first: WHAT / WHY (with evidence) / HOW (steps, checks, undo) /
NECESSITY / PROJECTED IMPROVEMENT / COST & RISK — then the phase waits for
his explicit go-ahead. An approval covers only the steps it described.

**2. Bug rule (founder's standing instruction — binding on whoever builds,
including Claude).** While building, find and diagnose bugs along the way.
Do NOT leave them, and do NOT silently auto-fix them. Every bug goes
through four lenses before it is fixed:

- **Programmer** — what is the bug, exactly? Reproduce it. Name the file,
  the line, the input, and the wrong output. If it cannot be reproduced,
  it is not yet a bug — it is a suspicion, and it is logged as one.
- **Architect** — why is it there? What design choice made it possible? Is
  it a local mistake or a shape problem (two systems disagreeing about who
  owns a value, a route that was never meant to exist, a copy that was
  pasted and never merged)? Name the root cause, not the symptom.
- **Developer** — what is the smallest fix that is true? Propose the fix,
  the files it touches, and what it does NOT touch. If the fix would change
  behaviour beyond the bug, say so — that is a design change, and it needs
  a founder decision, not a quiet edit.
- **Full-stack software engineer** — what does the fix do across the whole
  stack? Does the frontend, the Worker, the database, and the deploy all
  still agree after the fix? How is it verified live (exact probe,
  expected result)? What would prove the fix wrong?

The workflow for every bug: **log it** (in the build's bug log, with the
four-lens diagnosis — a bug that is not logged is a bug that was left) →
**diagnose it** (through all four lenses, in writing, before any code
changes) → **propose the fix** (through the same four lenses; the proposal
is part of the record) → **fix it deliberately** (the fix lands as its own
change, with its own verification; never folded silently into an unrelated
change). **Never ignore it, never silently patch it.** A silent fix is a
lie in the record: the next person to read the code cannot tell what was
broken or why it was changed. A logged, diagnosed, deliberately fixed bug
is proof the build was honest.

**3. Nothing is faked.** A panel with no data shows "no data", never a
simulated number. The old page's demo-mode simulation is the failure this
rebuild exists to end. A number on screen must match a direct read of the
route that feeds it — any mismatch is a bug, not a rounding difference.

**4. The Queen 100% rule stands.** Nothing in this plan flips a switch,
gates or un-gates the Commune path, or touches Queen/Kai brain surfaces as
build work. Those are Queen-sequence work, not this rebuild. If a phase
meets them, it flags them and stops — it does not build them.

**5. Retiring the page is not abandoning the system.** Phase B0 removes
the dead surface so nothing pretends to be live. The concepts live in the
blueprint (§2–§3) and come back in phases B1–B8, properly wired.

**6. The repo beats the blueprint.** If the blueprint and the repo
disagree, the repo is the fact and the blueprint is the error — say so, with
file and line, so the blueprint can be corrected. Do not silently build
around a discrepancy.

**7. The constitution is soul.md F-001–F-006 only.** The old page's 12
Jasper-era SOUL_MD articles are a citation, not a constitution. Nothing in
this plan validates against them or quotes them as Hive law. The
constitution changes only through a pull request the founder merges — never
through a browser box. The SOUL editor is dropped and never rebuilt.

**8. No money moves.** Money movement is founder-gated (Q-004). The
70/20/10 split and the waterfall are not built in any phase until a Tier
decision exists. The SOUL leaderboard is a display of a real route; it is
not a payment.

---

## §3 — The phases, in order

### Phase B0 — Retire the dead page (STEP 1 of reverse engineering)

**Purpose (plain words):** take the dead page down so nothing in the app
pretends to be live. The live tab already shows the real data, so nothing
is lost. The old page is stored, not deleted — its history is kept.

**Rungs:** compiles → tested → DaVinci → 16b Fable pre-merge → merged →
deployed → verified-live.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B0.1 | Remove the "Legacy atlas" tab + iframe from `BiosystemOverlay.tsx`. The live tab is untouched. | `npm run build:app` passes. Open `/app/` → Biosystem → no "Legacy atlas" button. `grep -rn "biosystem.html" frontend/src` returns **two prose comments** (the header comment at `BiosystemOverlay.tsx:14` and the comment at `ConstitutionViewer.tsx:10`) — the iframe at `:130` is gone. (Correction 2026-11-11: the plan first said "only the comment"; there are two comments, not one.) | If the build breaks, the tab state (`'live' \| 'legacy'`) was left referenced — remove the union member too. |
| B0.2 | Check the root-page link before touching it. It points at command-center.html, not biosystem — verify first. Do not touch command-center.html here; it is map Q2. | `grep -rn "biosystem" docs/index.html` returns nothing. | If a link remains, it is in a different file — grep `docs/` for `biosystem.html` and follow the hit. |
| B0.3 | Archive `docs/biosystem.html` — **move, do not delete** (deletion is Tier 3 founder-gated) — to a documented archive location. Record the move in the PR body. The archive keeps the whole file as found: both copies and the "Version 2 update 3" merge note included. | The file is absent from `docs/` and present in the archive. `/biosystem.html` returns 404 from the Worker (expected — nothing links it). | If the Worker still serves it, the asset is cached in a deployed `docs/app` build — it clears on the next deploy, not by hand. |
| B0.4 | Fable pre-merge (rung 16b, blocking). Run the 7-step Fable debugger (REPRODUCE → CONTRAST → ROOT-CAUSE → COUPLED-BUG → FIX-MINIMAL → VERIFY-REAL → CLOSE/ESCALATE) on the change. | Fable report filed; no open findings. | Any finding blocks the merge — it is fixed deliberately under §2 rule 2, not folded silently into the same change. |
| B0.5 | Merge (the founder merges), deploy via the existing pipeline, verify live. | Open `/app/` → Biosystem → live tab shows provider/agents/proposals from `/v11`. No localhost request in the network tab. **D11 note (2026-11-11):** the PR does NOT carry a rebuilt `docs/app` — `pages.yml` rebuilds it on merge (the PR #228 pattern). The check that the string `biosystem.html` is gone from the bundle therefore runs on the post-merge rebuilt bundle, not in the PR. | If the live tab reads OFFLINE, check `GET /v11/health` directly — if it 200s, the app's base is wrong, not the Worker. |

**Evidence recorded:** the PR number, the commit, the archive location, the
Fable pre-merge report, the live probe (no localhost request, live tab
shows Worker data). **Go-ahead gate:** this phase waits on the founder's
go-ahead (the preamble for B0 was given in chat, 2026-11-10). A go-ahead
for B0 covers B0.1–B0.5 only.

### Phase B1 — Code the new Biosystem surface

**Purpose (plain words):** build the new Biosystem tab in the app — the
72-system atlas re-expressed as the Hive's real systems (agents, colonies,
Queen, Kai El), the 10 tabs rebuilt as live panels, the stack map kept.
This is the coding phase: the surface exists, it compiles, and it renders.

**Rungs:** compiles → researches → confirm → abduct → deduce → tested.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B1.1 | Extend the existing live tab into the new Biosystem surface: the atlas as the Hive's real systems, the 10 tabs as panels, the stack map kept as it is. | The surface renders in the app. Every panel has a named data source (an EXISTS route from the blueprint §3, or a written "no data" state). | A panel with no named source is not built yet — it is listed as a gap, not filled with a simulated number. |
| B1.2 | Build clean. No localhost, no `ws://`, no `127.0.0.1` anywhere in the built bundle. | `npm run build:app` passes. Grep of the built bundle for `localhost`, `ws://`, `127.0.0.1` returns nothing. | A hit in the bundle is a dead reference left in — trace it to its line before deciding whether it is a call or a label. |
| B1.3 | Empty states. Every panel's empty state shows "no data" when its route is unreachable — never a simulated number, never stale data dressed as live. | Per panel: with its route unreachable, the panel shows "no data". | A panel that shows a number with no route behind it is faking — it is a bug under §2 rule 3. |

**Evidence recorded:** the build output, the bundle grep result, the panel
list with each panel's data source. **Go-ahead gate:** this phase waits on
its own founder go-ahead, after B0 is verified live.

### Phase B2 — Wire (the EXISTS rows)

**Purpose (plain words):** connect every panel to the real Worker route
that feeds it. This is the wiring phase: the numbers on screen are the
numbers the Worker really says.

**Rungs:** wired → tested → quantitative analysis.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B2.1 | Wire the live panels to their EXISTS routes from the blueprint §3: `GET /v11/llm/status`, `GET /v11/agents`, `GET /v11/proposals`, `GET /v11/health`, `GET /v11/tasks`, `GET /v11/arena/challenges`, `GET /v11/arena/fallen`, `GET /v11/governance/log`, `GET /v11/memory/status`, `GET /v11/wallet/leaderboard/soul`, `GET /v11/debug/colony-ping`, `GET /v11/tier3/status`, `GET /v11/pulse`, `GET /v11/nanuet/brain`, `GET /v11/kai/brain`. | For each panel: open it live, read the number it shows, and read the same route directly — the two must match. | Any mismatch is a bug under §2 rule 2 (log → diagnose through the four lenses → propose → fix deliberately). It is not a rounding difference and it is not fixed silently. |
| B2.2 | The atlas until its route exists. The 72-system atlas has no dedicated route yet (blueprint row 6 — `GET /v11/biosystem/status` is a name only, decision gate G1 in §4). Until it exists, the atlas is a static map fed by the wired rows above. | The atlas shows the systems and their grouping; no per-system number is shown that has no route behind it. | A per-system number with no route is faking — remove the number, keep the map. |
| B2.3 | No localhost anywhere in the wired surface. | `grep -rn "localhost\|/v10/"` on the new surface returns nothing (except historical research citations, which are content, not calls). | A `localhost` string that is a call is a dead reference — rewire it to the same-origin route or remove it. |

**Evidence recorded:** a panel → route → value table (the wired check),
one row per panel, with the live value and the direct-route value side by
side. **Go-ahead gate:** this phase waits on its own founder go-ahead,
after B1.

### Phase B3 — Develop the engines (Worker-side, not browser-side)

**Purpose (plain words):** rebuild the engines where they belong — in the
Worker, not in the browser. The browser shows what the engines do; it does
not re-implement them. This is the development phase: the body's functions
live in the Hive, and the UI reports them.

**Rungs:** innovative compressive complex computing → reverse engineered
if necessary → legally and lawfully sound → quantum compression →
Devil's Advocate → Childlike Wonder → DaVinci fully applied.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B3.1 | SwarmOrchestrator as the Worker's domain routing. The routing is already live (QB-2). The UI shows routing; it does not re-implement it in the browser. | The routing display matches a direct read of the Worker's routing state. | A browser-side routing re-implementation is a shape bug — the logic belongs Worker-side; move it. |
| B3.2 | GladiatorArena on the Hive Arena: `GET /v11/arena/challenges`, `GET /v11/arena/fallen`, `GET /v11/arena/projection/:id/frames`. Keep the rule: the loser's idea is archived, never deleted. | An arena challenge shown in the UI matches the same challenge read directly from `/v11/arena/challenges`. | A duel that deletes instead of archiving is a Tier 3 violation — stop, do not ship it. |
| B3.3 | EvolutionEngine on the proposal lifecycle: `GET /v11/proposals` + `POST /v11/proposals` + the decide routes. The PROPOSE → SOLVE → VERIFY → UPDATE cycle is the proposal lifecycle plus the Fable debugger loop (rung 20). | A proposal shown in the UI matches the same proposal read directly from `/v11/proposals`. | A proposal state the Worker does not know is a fake — the UI reads, it does not invent. |
| B3.4 | MemoryLayer on D1 (`nanuet-brain`, `KAI_BRAIN`) via `GET /v11/memory/status`. The Hive's memory is Worker-side, not browser localStorage. | The memory display matches `GET /v11/memory/status`. | Browser localStorage holding Hive memory is the old shape — the memory lives in the Worker. |
| B3.5 | StigmergyEngine on the memory / governance log trail: `GET /v11/memory/status` + `GET /v11/governance/log`. Full trail history waits on the Queen Digest runtime (blueprint row 29) — it is not built here. | The trail shown matches the governance log read directly. | A trail with no log behind it is invented history — remove it until the Digest runtime exists. |
| B3.6 | ConstitutionChecker validates against **soul.md F-001–F-006 only**, via the new `GET /v11/constitution` endpoint (blueprint row 18 — decision gate G2 in §4, founder decision first). The old page's 12 Jasper-era articles are a citation, not a constitution. | The checker cites F-001–F-006 and nothing else. | A check against the 12 Jasper articles is a wrong-constitution bug — the checker is rebuilt, not patched around. |

**Evidence recorded:** for each engine, its named Worker route — or a
written statement of why it lives in the UI. **Go-ahead gate:** this phase
waits on its own founder go-ahead, after B2.

### Phase B4 — Test

**Purpose (plain words):** prove the surface works, with counts, not
vibes. Every panel, every route, every empty state, every error state gets
a test that says pass or fail.

**Rungs:** tested → quantitative analysis.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B4.1 | A test suite in the QB-5/QB-6 pattern (370/370): every panel, every route, every empty state, every error state. Counts, not vibes — the suite reports pass/fail per panel. | The suite runs green. The report lists each panel and its result. | A panel that cannot reach its route fails its test — it does not silently show stale data. A test that passes while the panel shows stale data is a bad test, not a pass. |
| B4.2 | Error states. Every route failure is tested: the panel shows its honest error state, not a frozen number. | Per panel: with its route failing, the panel shows the error state and the suite records it as a pass. | A frozen number on a failed route is faking — it is a bug under §2 rule 3. |

**Evidence recorded:** the suite report (pass/fail per panel, with counts).
**Go-ahead gate:** this phase waits on its own founder go-ahead, after B3.

### Phase B5 — Retest (Fable pre-merge, blocking)

**Purpose (plain words):** run the debugger before anything merges. This
is the retest phase: the 7-step Fable debugger checks the whole build, and
anything it finds blocks the merge until it is fixed properly.

**Rungs:** 16b Fable pre-merge (blocking PR gate).

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B5.1 | Run the 7-step Fable debugger pre-merge (REPRODUCE → CONTRAST → ROOT-CAUSE → COUPLED-BUG → FIX-MINIMAL → VERIFY-REAL → CLOSE/ESCALATE), per the FABLE-5 spec, on the whole build B0–B4. | Fable report filed; no open findings. | Any finding blocks the merge — it is fixed deliberately under §2 rule 2, with its own change and its own verification. It is not fixed silently in the same PR, and it is not waived. |
| B5.2 | The bug log is closed out: every bug found in B0–B4 has a four-lens diagnosis and a deliberate fix, or a written founder decision to leave it. | The bug log shows zero unlogged bugs and zero undiagnosed bugs. | An unlogged bug is a bug that was left — log it before the phase closes. |

**Evidence recorded:** the Fable pre-merge report and the closed bug log.
**Go-ahead gate:** this phase waits on its own founder go-ahead, after B4.

### Phase B6 — Further implementation + improvements (the RETHINK rows)

**Purpose (plain words):** build the rethink items — the concepts that
have no Hive equivalent as written, so they come back in a new shape. One
at a time, each with its own go-ahead. This is the further-implementation
phase, and the improvements phase.

**Rungs:** wired → tested → DaVinci.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B6.1 | The lens-state display (blueprint rows 8 and 25). The 6 neurotransmitter gauges and the 10 cognitive modes become a lens-state display: which lens is active (Devil's Advocate / Childlike Wonder / DaVinci; Cyborg / JARVIS / Alfred) and the hemisync state. The drug-named modes do NOT come back. | The display names the active lens and shows real lens state. No drug name appears anywhere in the display. | A drug-named mode reappearing is a dropped concept being re-added — remove it; the lenses are the real modes. |
| B6.2 | The hemisync display (blueprint row 26). GatewayProcess becomes the hemisync display: Childlike Wonder (right) + Devil's Advocate (left) in hemisync as alignment → DaVinci. The lens-state route (`GET /v11/lens/state`, name only) is decision gate G4 in §4 — founder decision first. | The display shows the hemisync state from real data. | A hemisync number with no data behind it is faking — show the state honestly or show "no data". |
| B6.3 | The coherence reading (blueprint rows 11 and 17). Rho becomes a hive coherence reading derived from `GET /v11/pulse` (exists). A dedicated rho number (`GET /v11/biosystem/resonance`, name only) is decision gate G3 in §4. | The reading matches a direct read of `/v11/pulse`. | A coherence number that does not derive from the pulse is invented — derive it or drop it. |
| B6.4 | The spore lifecycle tracking (blueprint row 30). The spore lifecycle (dormant → germinating → propagating → fruiting) is tracked in the Tier 1 goal, not in a new endpoint, until the founder says otherwise. | The tracking matches the Tier 1 goal's record. | A spore state the goal does not know is invented — the goal is the record. |
| B6.5 | The trail history (blueprint row 29). The full trail history waits on the Queen Digest runtime — the missing keystone that writes completed work back into Nanuet's brain as learned wisdom. It is not built here. | The trail shows only what the memory / governance log actually holds. | A trail longer than the log is invented history — it waits for the Digest runtime. |

**Evidence recorded:** for each rethink item, a written decision (what it
became, what it replaced, what data feeds it) and a live probe showing
real data. No rethink item ships on simulated data. **Go-ahead gate:** each
rethink item waits on its own founder go-ahead, after B5.

### Phase B7 — Rewire (second pass)

**Purpose (plain words):** go back over the build with everything the
testing found, and fix it properly. A deliberate second pass, not a patch.

**Rungs:** rewired → further developed → tested.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B7.1 | Rewire whatever B4–B6 found: panels that need a different route, engines that belong Worker-side after all, labels that lie. | The same probes as B2 and B4, re-run. The count of open findings from B5 is zero. | A rewire that introduces a new finding is not a fix — it goes through §2 rule 2 like any other bug. |
| B7.2 | Re-run the test suite. | The suite runs green, with the same counts as B4 (or better, with the new coverage written down). | A suite that passes fewer panels than B4 is a regression — the rewire is reverted and re-done. |

**Evidence recorded:** the re-run probe table and the re-run suite report.
**Go-ahead gate:** this phase waits on its own founder go-ahead, after B6.

### Phase B8 — Deploy → live → Fable post-live

**Purpose (plain words):** put it live and prove it live. Merge, deploy,
check it in the real app, then run the debugger once more after live. Only
verified-live counts as done.

**Rungs:** merged → deployed → verified-live → 20 Fable post-live.

| Step | What | Verification (exact probe, expected result) | Troubleshooting |
|---|---|---|---|
| B8.1 | Merge (the founder merges), deploy via the existing pipeline. | The deploy lands; the live app serves the new Biosystem surface. | If the deploy does not land, the merge is not the deploy — check the pipeline before touching the code. |
| B8.2 | Verify live. | Open `/app/` → Biosystem live → every panel shows Worker data. No localhost request in the network tab. No `v10` requests. | A panel showing demo or stale data live is not verified-live — it is a bug, and the phase does not close. |
| B8.3 | Fable post-live (rung 20). Run the 7-step Fable debugger post-live. | Fable post-live report filed; no open findings. | Any finding re-opens the build — it does not get fixed silently in the same change. |

**Evidence recorded:** the merge, the deploy, the live probe (every panel
showing Worker data, no localhost, no `v10`), and the Fable post-live
report. **Go-ahead gate:** this phase waits on its own founder go-ahead,
after B7. When B8.3 closes with no open findings, the biosystem is done —
verified live.

---

## §4 — Decision gates (not in any phase until decided)

A name is not a build. Each of these needs its own founder yes, its own
preamble (what / why / how / necessity / improvement / cost & risk), and its
own phase before any build touches it.

**APPROVED by the founder 2026-11-11: G1, G2, G3, G4 — all four, by name.**
Each is built at its own phase (G1 at B2, G2 at B3, G3/G4 at B6); each phase
still needs its own go-ahead. The "what happens if unanswered" column below
is now the record of what was decided against, kept for provenance.

| Gate | What it is | Why it is a founder decision | What happens if unanswered |
|---|---|---|---|
| G1 | `GET /v11/biosystem/status` (blueprint row 6) — one call returning the living systems of the Hive with real status, so the atlas shows per-system numbers | A new Worker route is a new surface; it is the atlas's data source | The atlas stays a static map fed by the wired rows — no per-system numbers are faked |
| G2 | `GET /v11/constitution` (blueprint row 18; map G2) — the constitution as a route, so the ConstitutionChecker validates against F-001–F-006 | A new Worker route; it serves the constitution itself | The checker is not built — the constitution is read from the repo, not from a route |
| G3 | `GET /v11/biosystem/resonance` (blueprint row 11, optional) — a dedicated rho number | A new Worker route; a new number the Hive would have to compute and stand behind | The coherence reading stays derived from `/v11/pulse` (B6.3) |
| G4 | `GET /v11/lens/state` (blueprint row 26, optional) — the live lens state, so the hemisync display reads real data | A new Worker route; it exposes the Hive's thinking state | The hemisync display shows only what is honestly known, or "no data" |

The DROP rows are non-goals, not gates: the SOUL editor (never rebuilt),
the 5-tier legal hierarchy (no such structure is decided — a separate
founder decision with counsel, not a biosystem panel), the waterfall /
70-20-10 split (money — Q-004), word→Hz / FrequencyGuild, and the six
eigenmodes. A builder does not re-add them as "missing features".

---

## §5 — Evidence ledger (what gets recorded, per phase)

| Phase | Evidence |
|---|---|
| B0 | PR number, commit, archive location, Fable pre-merge report, live probe (no localhost, live tab shows Worker data) |
| B1 | Build output, bundle grep result, panel list with each panel's data source |
| B2 | Panel → route → value table (live value and direct-route value side by side, one row per panel) |
| B3 | Per engine: its named Worker route, or a written statement of why it lives in the UI |
| B4 | Suite report (pass/fail per panel, with counts) |
| B5 | Fable pre-merge report, closed bug log (zero unlogged, zero undiagnosed) |
| B6 | Per rethink item: the written decision (what it became, what it replaced, what data feeds it) + a live probe showing real data |
| B7 | Re-run probe table, re-run suite report |
| B8 | Merge, deploy, live probe (every panel on Worker data, no localhost, no `v10`), Fable post-live report |

The ledger is the proof. A phase with no evidence is a phase that did not
happen — it is not marked done.

---

## §6 — What this plan does NOT do

- No switch is flipped by any phase. The switch validator
  (`~/workspace/hive-batches/SWITCH_VALIDATOR_DRAFT.md`) is the authority
  on switch state; this plan does not touch it.
- No Commune gating. `POST /v11/command_text` is live and unauthenticated;
  gating it to Mac-only is Queen work, 100% inside the Queen build. The
  biosystem never calls it without the gating decision.
- No Queen/Kai brain surfaces as build work. `/v11/nanuet/brain` and
  `/v11/kai/brain` exist in the Worker and are wired as read-only displays
  in B2.1 — but building Queen state surfaces is a future Queen step, not
  this rebuild. (Reading a route in B2.1 is a display; building a Queen
  surface is Queen work.)
- No constitution changes. The constitution changes only through a pull
  request the founder merges. The SOUL editor is dropped and never rebuilt.
- No money moves. The 70/20/10 split and the waterfall are not built in
  any phase until a Tier decision exists (Q-004).
- No deletion. The old page is archived (moved), never deleted. Deletion is
  Tier 3 founder-gated.
- No NEW endpoint is designed or built until the founder says yes to that
  endpoint by name (§4). A name in the blueprint is a name, not a build.
- No phase starts without the founder's go-ahead for that phase. A
  go-ahead for one phase does not carry forward to the next.

---

## Appendix — Provenance

- Blueprint v1.0: `~/workspace/hive-batches/BIOSYSTEM_REVERSE_ENGINEERING_BLUEPRINT.md`
  (533 lines, 2026-11-11; the two-copies finding verified by diff — the
  copies are byte-identical except the doctype line; copy 1 canonical).
- Audit: `~/workspace/hive-batches/BIOSYSTEM_GATEWAY_AUDIT.md` (339 lines,
  2026-11-11; spot-checked by Muse — the two-copies claim and the
  AI-Gateway-unused claim both verified against the clone).
- Rewire map (Worker route table): `~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` §2.
- Old page: `docs/biosystem.html`, 17,344 lines, main `7af242d`.
- Overlay: `frontend/src/components/kai-os/BiosystemOverlay.tsx` (live tab:
  `GET /v11/llm/status`, `GET /v11/agents`, `GET /v11/proposals`).
- History: `docs/ACCESS_BIOSYSTEM_STATUS_2026-09-20.md` (PR #209 rewired
  the overlay, deliberately left the framed page).
- Founder decisions in force: Q-B1 retire-as-step-1 (2026-11-10); Queen
  100% rule (chronological Q-A → Q-B → Q-C); Q-004 (no automatic money
  moves); the 20-rung done ladder (ratified); FABLE-5 alongside rung 20;
  the preamble rule (plain language first, go-ahead before consequential
  work); the bug-handling rule in §2 (founder's instruction, 2026-11-10);
  the evolution rule (the plan versions up as the founder expands the
  structure).

*End of plan v1.0.*
