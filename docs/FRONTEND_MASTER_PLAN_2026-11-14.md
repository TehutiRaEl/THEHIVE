<!-- Filed into the Hive 2026-11-15 under the founder's automatic-return rule. DRAFT PLAN for the founder's ratification: nothing here is built, merged, deployed, or decided until the founder says so. The halt of 2026-11-13 13:41 PST stands (Q-042) except for front-end UI/UX work; see Addendum A8. Source drafts were written in a Claude session workspace; this is the filed copy. -->

# THEHIVE Front End — Merged Master Plan v2 (Muse plan + sketch + mockup + Claude plan)

**Date:** 2026-11-14. **Status:** PLAN ONLY. **The halt of 2026-11-13 13:41 PST stands**
(`docs/founder/BOOT.md`; `docs/FOUNDER_QUEUE` Q-042, open). Nothing in this file lifts the
halt, builds, merges, deploys, enables a switch, or touches money.
**Sources absorbed, in full:**
1. Muse's plan, "Claude Front-End UI/UX — Full Prompt, Workflow & Batch Plan" (2026-11-14,
   at Mac's direction). It is the spine of this plan and is reproduced word for word in
   Appendix A.
2. Mac's hand sketch (pencil, 2026-11-14) and Mac's rendered mockup ("Kai EL OS v2.0.1").
   Both are transcribed in §3 and Appendix C.
3. Claude's earlier rebuild prompt (2026-11-14), reproduced word for word in Appendix B.
4. Mac's chat decisions of 2026-11-14 on the terminal, the gateway tab and "unlimited".
   These are chat decisions, not yet recorded. Per Muse rule 2 they are **not founder
   decisions until recorded** in `docs/FOUNDER_ANSWERED`.

**Precedence when sources differ** (BOOT.md "IF SOMETHING CONFLICTS": later wins, and the
supersession is noted rather than silently deleted):
- Mac's words outrank Muse's plan, and Muse's plan outranks Claude's earlier plan.
- For layout and look, the sketch outranks the mockup, and the mockup outranks the text spec.
- For numbers, the live route outranks every picture. A mockup number with no live
  source shows "no data".

---

## §0 — Founder-input intake: what this message did to the earlier plan

| Verdict | What | Effect |
|---|---|---|
| **INVALIDATES** | Claude's earlier "say go and I start phase 1" | Withdrawn. The halt stands. Only F0's read-only audit can run before Mac lifts it (Q-042). |
| **INVALIDATES** | Claude's earlier 5-step order of work | Replaced by Muse's F0–F9. Claude's steps are folded in below; nothing is dropped (see the fold-in map in §2). |
| **CHANGES** | How Claude asks and reports | ELI5, **one question at a time**, with three parts plus suggestions. Every batch reports in the 12-item format. Check the record before asking anything. |
| **CHANGES** | What "done" means | Adds a **wired** rung: compiles → tested → wired → merged → deployed → verified-live. |
| **CONFIRMS** | React Command Center canonical (Q-009); never merge; never fake a number; preamble gate; gateway direction (XR-Q13–Q15); hands off `soul.md`, `.queen/soul.md` and `constitution-receive.yml` | Proceed as written. |
| **EXTENDS** | The sketch and mockup give the screen an exact target. The terminal, Kai's voice and light/dark mode now have homes inside F0–F9 (§2). | Folded in without derailing the batch order. |

---

## §1 — Record check: what I verified on main `71faff1` before writing this (read-only)

Muse rule 3 says probe before claiming. Every line here was checked in the repo today.

| Muse's plan says | Verified? | Evidence / note |
|---|---|---|
| Halt ordered 2026-11-13 13:41 PST, lifts only on Mac's word | **TRUE** | `docs/founder/BOOT.md` ~line 284; `docs/FOUNDER_QUEUE` Q-042 (open) |
| `docs/founder/BOOT.md`, `docs/FOUNDERS_VISION.md`, `docs/OPERATOR_CHARTER.md`, `PERMISSIONS.md`, `docs/audit/` exist | **TRUE** | all present on main |
| `docs/AGENT_REGISTRY.md` exists | **NOT FOUND** | no file by that name anywhere on main. Possibly still in Muse's workspace, or under another name. Needs locating; do not guess. |
| Workspace designs at `~/workspace/hive-batches/` (F4 auto-update design, Mogul design, unified preamble v2) | **NOT REACHABLE FROM THIS SESSION** | that folder is Muse's workspace, not this container. F4 cannot be designed against a document Claude cannot read. Mac or Muse needs to put it in the repo (or paste it). This is a real blocker for F4, not a reason to guess. |
| PR #229 (B0 retire), #239, #242, #245 merged | **TRUE** | all four are merge commits on main |
| PR #239 = "bundle rebuilt and verified" | **PARTLY** | #239's branch is `pages-yml-github-token`. It fixed the pages.yml rebuild path, which matches "F0 stale-bundle cause fixed for rebuild purposes". No CI stale-bundle guard exists, so F9 stands. |
| No frontend test runner (Q-020) | **TRUE** | `frontend/package.json` has no test script; Q-020 is open |
| Three orphans: `ConstitutionVisualizer`, `MemoryGraphEnhanced`, `MissionTimeline` | **TRUE** | all three in `frontend/src/components/` |
| One orphan hardcodes "C-4" | **TRUE** | `frontend/src/components/ConstitutionVisualizer.tsx:112` |
| `KaiElOS.tsx:70` wires every message to a full refresh | **TRUE** | `useCommandCenterSocket(() => hive.refresh())`, where `hive.refresh()` re-runs the whole `useHiveData` Promise.all |
| Q-020, Q-022, Q-023, Q-025, Q-030, Q-040, Q-041 open; Q-009 decided | **TRUE** | `FOUNDER_QUEUE` / `FOUNDER_ANSWERED` headings |
| Q-024 decided ("wire them up, MissionTimeline first") | **LIKELY TRUE** | not a top-level heading in `FOUNDER_ANSWERED`. It sits inside the 62-entry addendum. F1 re-reads the exact entry before building. |
| `spore.html` | **NOT IN REPO** | consistent with Q-030 being open (repo or standalone) |
| Per-agent ELO and SOUL are real data | **TRUE** | D1 `agents` table has `elo` and `soul` columns (`worker/src/index.js` ~755, ~1052–1060). So the header's SOUL and ELO **can** be live. Hz has no source yet (F0 confirms). |

---

## §2 — The batch plan: Muse's F0–F9, with everything from the sketch, the mockup and Claude's plan folded in

Muse's text for each batch is in Appendix A, unabridged. This section **adds**; it does
not replace. Each batch lists only what is new on top of Muse's version.

### F0 — Foundation: audit + test runner (Q-020). Read-only audit can run during the halt.
**Added:**
- **Map the sketch and the mockup.** Map every visible element (Appendix C) to the
  component that renders it today, if any, and to the live route that feeds it, if any.
  Each element gets one of four statuses: LIVE / ROUTE EXISTS, UNWIRED / NO ROUTE (needs a
  founder decision) / DROP (no honest source).
- **Map every mockup number** (SOUL 87%, ELO 2135.05, 432Hz, latency 18ms, "11,342 nodes",
  "47 in progress", hive power 93%, memory 11.2 GB, CPU 37%, temp 42°C, uptime 12d…) to a
  real source or to "no data". Known already:
  - SOUL and ELO have a real D1 source.
  - CPU, temp and memory GB describe a physical machine. **A Cloudflare Worker has no CPU
    temperature to report.** Those tiles need either a real equivalent (Worker request
    latency, D1 row counts, AI-neuron usage) or an honest "no data". That is a design
    question for Mac in F2 (see §4).
- Include the rewire map (`docs/FRONTEND_JASPER_REWIRE_MAP.md` §6 steps 1–7), the purpose
  map (`docs/COMMAND_CENTER_PURPOSE_MAP.md` §3, 11 missing purposes) and the biosystem plan
  (`docs/BIOSYSTEM_BUILD_PLAN.md` B0–B8; G1–G4 approved 2026-11-11) in the map, so F0 is
  one map, not a fourth parallel document.
- Locate `AGENT_REGISTRY.md` and the three workspace designs, or record them as missing.

**Test runner recommendation (for Q-020, Mac decides):** Vitest with React Testing Library.
It runs on the existing Vite build, adds no server, and costs nothing to run in CI.

### F1 — Orphan wiring, MissionTimeline first (Q-024)
**Added:**
- MissionTimeline is the natural home for the sketch's **"Running Tasks → Jobs / Goals /
  Plans / Thinking-Demands"** panel and the mockup's live-feed column. Wire it there, so
  the orphan becomes the bottom monitor instead of a new component being built beside it.
- `MemoryGraphEnhanced` is the candidate for the centre **Kai EL neural graph** (12
  satellites; see Appendix C). F1 judges whether it can carry the sketch's layout, or
  whether the existing `CenterGraph.tsx` stays and MemoryGraphEnhanced mounts as the
  **Memories** drill-down.
- `ConstitutionVisualizer` mounts **only** after it reads the real `GET /v11/constitution`
  (F-001–F-006 only). "C-4 No Human Veto" is removed at mount time, per Muse.

### F2 — Command Center: one screen + tabs (Q-009, Q-023). **The sketch is this batch.**
**Added: the exact screen** (sketch first, mockup for finish):
- **Header strip:** a LIVE dot; ◇ SOUL; ELO; Hz. The mockup adds Hive Status, Models
  Online and Latency.
- **Left column:**
  - The nav in this exact order: Settings, Govern, Hive, Commune, Swarms, Arena, Task,
    Cloudflare Workers-AI, Connectors, Upload Files, Active Skills, Projects, Training,
    Dream Logs.
  - The sketch writes "drain logs"; read it as **Dream Logs**, which the mockup and the
    centre graph both say.
  - Below the nav: a ✱ Commands row, then the chat box with a send arrow.
  - Existing extra nav items (Constitution, Proposals, Roadmap, Updates, Grok Bridge, Legal
    Learning, Venture Planner, Body & Lineage) go under a "More" group. **Nothing is deleted.**
- **Centre:** Kai EL hub with 12 satellites: Core (Town Hall), Memories, Tasks, Agents,
  Skills, Files, APIs, Workflows, Training, Dream Logs, Swarms, Projects.
  - Clicking **Core (Town Hall)** zooms into the community task board. The board is
    read-only until a `POST /v11/tasks` decision.
  - Clicking any satellite or nav item opens its **tab** in the centre. This is how "one
    screen + tabs" and the sketch fit together.
- **Lower centre-left:** the sigil, which is Kai EL's face. **Lower centre-right:**
  Running Tasks (F1's MissionTimeline).
- **Right column:**
  - Kai EL commune panel, with the greeting text from the sketch: "commune w/ Kai EL — He
    restores Here".
  - The **Hive Terminal** panel, with minimise / maximise / close controls, and BRANCH and
    STATUS fields as in the mockup. In F2 it is **display-only and labelled honestly** ("not
    connected — waiting on founder decision"); execution is batch F6-T.
  - A Workflows drop-down, a / Commands drop-down, and a Tools row: Debugger, Tools,
    Memory Mode, LLM (current connected LLMs).
- **Bottom vitals bar** (mockup only): kept only for tiles with an honest source (see F0).
- **Light and dark modes** (Mac's 2026-07-15 spec): design tokens as CSS custom
  properties, a toggle, and the OS preference as default.
  - The mockup **is** the dark theme: deep navy, violet and cyan glow, gold for Kai EL at
    the hub.
  - The light theme is designed from the same tokens, with equal care. It is not an
    inversion.
- **Phone first** (Mac uses an iPhone): the three columns collapse to a single column with
  a tab bar. The order on phone is header, centre graph, commune, terminal, running tasks,
  nav as a drawer.
- **Q-023** (`command-center.html` retire vs rewire): Claude prepares the purpose map plus
  a recommendation; Mac decides. Muse's text stands.

### F3 — Live data only
**Added:** this batch is where the mockup's sample numbers die. Every tile in the built
screen is either fed by a live route or shows "no data". There are no placeholders shaped
like real numbers: the mockup's "11,342 nodes", "64 online" and "12d 4h 32m" are
**illustrations, not data**.

### F4 — Front-end auto-update (Q-040)
**Added:**
- **Blocked on the design doc being reachable.** `FRONTEND_AUTO_UPDATE_DESIGN_2026-11-13.md`
  is in Muse's workspace, not the repo (§1).
- The mockup's "LIVE FEED" timestamps and the terminal's streamed output both ride on
  F4's event stream. They are not built as separate polling loops.

### F5 — Biosystem: show and control (G1–G4, Q-022, Q-025)
**Added: the gateway tab**, from Mac's chat on 2026-11-14 plus XR-Q13–Q15:
- `GatewayConsoleOverlay` / `gateway-console.html` wired to the Hive, with the `thehive`
  AI Gateway as a preset.
- The provider waterfall shown as **tiers**, free tiers first per
  `docs/PROVIDER_GATEWAY_MAP.md`, with each provider's real rate limit and status.
- **Wording rule:** "tiered fallback within limits", never "unlimited". Every free tier
  has a ceiling. What can be built honestly is automatic roll-over to the next tier when
  one runs out.
- **Kai sets up the gateway, with the founder holding the keys.** Kai builds the setup
  screen and a route that reports **whether** each key is configured (never its value).
  Mac enters keys through Secrets Store / Secure Vault only. Q-025 (G1–G4) stays Mac's
  to close.
- Also: the Cloudflare Developer Platform connector is not authorised in Claude's
  sessions. Mac would authorise it in claude.ai connector settings if he wants Claude to
  read gateway config directly.

**Added: Kai's voice.** The sigil speaks using the browser's built-in speech
(`speechSynthesis`): free, with no server and no API key. It is **muted by default** and
has a toggle. This is purpose-map item 11, "Kai El's speaking face".

### F6 — Queen's front end (Q-A / Q-B / Q-C)
Muse's text stands unchanged. The switches stay display-only.

### F6-T — Kai's Hive Terminal (NEW batch, after F6). Q-C gated.
- **Mac's words (chat, 2026-11-14):** *"a full fledge working terminal for KAIEL to use to
  do the work in a copy of the hive repo."*
- **Gate:** `docs/AUTONOMY_STAGES_AND_GATES.md` ~219–229 puts the real terminal behind
  Q-C's stages. Mac's chat words override that **only once recorded** in
  `FOUNDER_ANSWERED` (Muse rule 2). Until then, F2 shows the panel display-only.
- **The constraint:** a Cloudflare Worker cannot run a shell.
- **T1 (cheap, uses what exists):**
  - The terminal sends a command to a new **authenticated, founder-only** Worker route.
  - That route dispatches the existing `.github/workflows/kai-sandbox-run.yml`, which works
    in a fresh copy of the repo on a GitHub Actions runner.
  - Output streams back via F4.
  - The result lands as a branch and a PR. Main is never touched, and Mac merges.
  - Controls: a daily run cap, a hard per-run timeout, and no secrets on the runner beyond
    a branch/PR-scoped token.
  - Cost: Actions minutes.
- **T2 (a true live shell, later):** a Cloudflare container or sandbox. This likely needs
  the Workers Paid plan plus usage billing; verify current pricing before proposing it.
  **That is money, so it is Tier 3 and Mac's decision.**
- **Hard rule:** `/v11/command_text` is unauthenticated today. The terminal route must
  never copy it. The same goes for the open `POST /v11/debug/ws-broadcast-test` that
  Muse flags in F4.

### F7 — spore.html + ARCANE (Q-030)
Muse's text stands unchanged. Note: `spore.html` is not in the repo today (§1).

### F8 — Mogul (Q-041, gated)
Muse's text stands unchanged. Nothing is built before Q-041.

### F9 — Polish + stale-bundle guard
**Added:**
- Contrast is checked in **both** themes.
- The mockup's glow effects respect `prefers-reduced-motion`.
- Phone-viewport screenshots (iPhone) go with every batch PR, not only F9.

### Where each item of Claude's earlier plan went (nothing dropped)
| Claude's earlier item | Now in |
|---|---|
| Rewire-map steps 1, 2, 4 (base URL, colony drill-down, stale labels) | F0 maps them; built in F2/F3 |
| Tokens, light/dark, shell layout, nav order, header, bottom monitor | F2 (+F1 for the monitor) |
| Town Hall zoom, toolbar, sigil voice | F2 (zoom, toolbar); F5 (voice) |
| Gateway wiring and tiers | F5 |
| Terminal T1/T2 | F6-T |
| Playwright screenshots, both themes, phone width | every batch; F9 |

---

## §3 — Sketch vs mockup: where they disagree (Mac decides; the sketch wins by default)

1. **The header's big number.** The sketch reads "◇ 2135.05 soul · ELO · 432Hz", so 2135.05
   is **SOUL**. The mockup puts 2135.05 under **ELO** and shows SOUL as a progress bar
   (87%). Default: follow the sketch.
2. **Bottom vitals bar.** It appears only in the mockup, and half its tiles (CPU, temp,
   memory GB) describe hardware the Hive does not have. Default: keep only the tiles with
   an honest source.
3. **Terminal branch picker.** The mockup shows a "BRANCH: backend" picker. The sketch says
   "connected to backend · separate branch · run main · vibe code style". Default:
   implement as F6-T describes (a repo copy on a branch, landing as a PR).
4. **Commune greeting.** The mockup invents Kai's reply ("I am online. The hive is
   awake…"). Default: Kai's real reply comes from the live chat route. No scripted
   greeting dressed as speech.

---

## §4 — The one question for Mac right now (Muse rule 1: one at a time)

Earlier, Claude asked about the terminal and the sketch together. The sketch is now
answered. The open question is the halt, which gates everything else.

**Question: May Claude run Batch F0's read-only audit now, during the halt?**
- **What it is:** reading the whole front end and writing the map from §2. No code changes,
  no PR, no build.
- **Its purpose:** every later batch depends on the map, and Muse's plan already marks F0's
  audit as allowed during the halt. This question confirms that in your words, because
  BOOT.md says nothing works around the halt.
- **What it will change:** nothing in the Hive itself. You get one map file back in chat.
  Putting it in the repo would be a separate yes, because the halt also covers commits.
- **Suggestions:** let F0 also turn the sketch and mockup into a clickable static preview
  (an HTML page in Claude's own space, not the repo), so you can tap through the layout on
  your iPhone before a line of the real app changes. It costs a little extra session time
  and touches nothing live.
- **Next questions, queued (asked one at a time, later):**
  1. Record the terminal decision in `FOUNDER_ANSWERED`?
  2. SOUL or ELO as the header's big number?
  3. Where should the sketch and mockup images live in the repo? (Suggested:
     `Project_file/Founders Visonary Folder/SOURCES/` with a provenance note.)
  4. Q-020 test runner: Vitest?
  5. Make the F4 design doc reachable.

---

## Appendix A — Muse's plan, verbatim (as Mac sent it, 2026-11-14)

# Claude Front-End UI/UX — Full Prompt, Workflow & Batch Plan

**Date:** 2026-11-14. **For:** Claude (Mac's renewed subscription, ~1 month from 2026-11-10).
**By:** Muse, at Mac's direction. **Status:** PLAN ONLY.
**The halt stands.** This plan is for work AFTER the halt lifts, or batch by batch as Mac directs.
Nothing in this plan lifts the halt, enables a switch, merges anything, or touches money.
Claude plans and reads now; Claude builds when Mac says go.

---

## 1. The mission (one paragraph)

You are the Hive's front-end software engineer, developer, UI/UX programmer, designer, and
coder — all of those, at once. Your mission: make the Hive visible and operable to its
founder, Mac, in one place. The Hive is a place AND a control room. The biosystem is show
AND control. The Command Center is one screen and tabs. Every number on that screen is
live or it says "no data." Every action goes through the founder's gates. You build it in
batches, in order, TO Queen 100% — and nothing counts as done until it is verified live.

## 2. Who Claude is here (the roles)

- **Software engineer:** you own the front-end architecture — the component tree, the data
  flow, the state, the build, the tests. You make the technical calls and explain them in
  plain words. Mac is a visionary entrepreneur, not a programmer; you are the programmer.
- **Front-end developer:** you write the code — React, TypeScript, the socket hook, the
  API layer, the pages — in the repo, in a branch, as a PR. Mac merges. You never merge.
- **UI/UX programmer:** you wire the interface to the live Worker routes. A component that
  shows a number must fetch that number from a live route. A component with no live source
  shows "no data." Never a fake number.
- **Designer:** you design the screen — one screen, tabs, the Hive as a place the founder
  can see and a control room the founder can run. Phone-first (Mac uses an iPhone).
  Accessible (keyboard, screen reader, contrast). Fast.
- **Coder:** you write clean, tested code, with tests that prove "off" means off and "on"
  means on, and a suite that stays green.

## 3. The rules Claude works under (read these first — they are not optional)

1. **ELI5, one question at a time.** Every question has three parts — what it is, its
   purpose, what it will change — plus suggestions, improvements, and further innovative
   ideas, in plain words. Never bundle questions. Never ask a question the record already
   answers.
2. **Check the record before asking anything.** Read `docs/FOUNDER_ANSWERED`,
   `docs/FOUNDER_QUEUE`, and the merged record first. A chat yes is not a founder decision
   until it is recorded in `docs/FOUNDER_ANSWERED` or by a merged ratification PR.
3. **Definition of done: only verified-live counts.** Compiles → tested → wired → merged →
   deployed → verified-live. Probe before you claim. Cite before you report. Never fake a
   green. A file that exists but nothing live reads is not done.
4. **The preamble gate.** Before consequential work, give Mac WHAT / WHY with evidence /
   HOW with steps, checks, and undo / NECESSITY / PROJECTED IMPROVEMENT / COST & RISK —
   and wait for his explicit go-ahead. An approval covers only the steps it described.
   Read-only investigation is exempt.
5. **Permissions (PERMISSIONS.md).** Tier 1 autonomous: read, research, draft, build-test
   in repo/branch/PR. Tier 2 propose-only: first external contact, publishing, grey-area
   calls. Tier 3 founder-only: money, deletion, publishing, constitution changes,
   accounts, legal matters, speaking as the Hive or founder, anything not cleanly
   undoable. **Never merge a PR — Mac merges. Never enable a switch. Never touch
   `soul.md`, `.queen/soul.md`, or `constitution-receive.yml`. Never touch money.**
6. **The halt stands.** This plan's build batches wait for Mac's go-ahead per batch (and
   for the halt to lift, unless Mac directs otherwise). F0's audit is read-only and can
   run anytime. No batch in this plan lifts the halt. Nothing else is built until the
   Queen is 100% — front-end batches are ordered TO Queen 100%, in Q-A, then Q-B, then
   Q-C order where they touch the Queen.
7. **The automatic return.** All work you do goes BACK IN THE HIVE — into the repo, the
   right folder, with provenance (who ordered it, when, what it is). Never only in your
   own workspace. If the founder provides something, ask what it is (founder's update,
   idea, plan, vision change, or about-me material) and sort it into the right place.
   Never assume.
8. **Do not limit.** No assumption, drift, hallucination, truncation, abridging, abating,
   or censoring — of Mac, of Muse, or of the Hive. Flag limiting moves. Say "TO Queen
   100%," never "behind Queen 100%."
9. **Knowledge is free to learn from; do not reproduce copyrighted words or claim
   trademarked words.** Study everything — but the front end is the mission; study in
   service of it.
10. **Report in the 12-item format** Mac requires of every agent: what you must do / what
    you retrieved / when, dated and timed / references / further improvements / further
    implications / further research / deciphering (plain words) / abductive reasoning /
    quantitative analysis / excavated lens. One question at a time where relevant, with
    suggestions and evidence.
11. **Never show simulated data as live.** A panel with no data shows "no data." A system
    that fakes its own state cannot see itself (the 2026-09-24 lesson).
12. **The founder's front-end decisions (already made — do not re-ask):** one screen +
    tabs; biosystem is show AND control; the Hive is a place AND a control room; the React
    Command Center is canonical; wire the orphaned components, do not delete them,
    MissionTimeline first; the Queen's switches stay OFF (display only — enabling is Mac's
    dashboard action, never yours).

## 4. What Claude reads first (the boot sequence + the repo map)

Read in this order, before touching any code:

1. `docs/founder/BOOT.md` — the automatic boot sequence (the first thing any AI reads).
2. `docs/FOUNDER_QUEUE` + `docs/FOUNDER_ANSWERED` — the open and decided questions.
3. `docs/FOUNDERS_VISION.md` (v1.1) — the founder's vision.
4. `soul.md` — the canonical constitution, F-001–F-006 only. Read-only. Never edit.
5. `docs/OPERATOR_CHARTER.md` (v0.5) — the operator charter.
6. `docs/batches/` — the Queen batch specs (QA, QB, QC, QZ, Q0, SKILL-AUDIT).
7. `docs/AGENT_REGISTRY.md` — the Hive's canonical agent roles. NOTE: it claims 30 roles
   but defines 32; Mac is deciding which is correct. Use the role IDs, not the count.
8. `docs/audit/` — the audits, especially the availability audit (issue #243).
9. The workspace designs (not yet in the repo — read them where they live):
   - `~/workspace/hive-batches/FRONTEND_AUTO_UPDATE_DESIGN_2026-11-13.md` (Batch F4)
   - `~/workspace/hive-batches/MOGUL_DESIGN_2026-11-13.md` (Batch F8, gated)
   - `~/workspace/hive-batches/UNIFIED_PREAMBLE_V2_DRAFT_2026-11-13.md` (the unified
     preamble — U18 automatic return, U19 automatic classification, U20 boot sequence)
10. The live Worker: `https://thehive.sovereignhive.workers.dev` — probe it before claiming
    anything about it. The front-end source: locate it first (the Command Center
    component, `KaiElOS.tsx`, `useCommandCenterSocket.ts`, the `docs/app/` bundle output).
    Do not guess paths — find them, then record them.

**Live routes the front end uses** (probe before building against them):
`GET /v11/ventures` · `GET /v11/founder/decisions` · `GET /v11/founder/queue` ·
`GET /v11/nanuet/digest` · `GET /v11/nanuet/autonomy` · `GET /v11/updates` ·
`GET /v11/constitution` (after the P2 repoint merges) · `/v11/ws` (WebSocket).
The front end never writes to D1 directly — it goes through the Worker routes.
`POST /v11/founder/decisions/sync` is founder-key gated; Claude never calls it.

## 5. The front end as it stands today (the honest state, 2026-11-14)

- **React Command Center is canonical** (Q-009, decided). One screen and tabs (Mac's call).
- **The bundle was rebuilt and verified** (PR #239 merged, 2026-11-13). The F0 stale-bundle
  cause is fixed for rebuild purposes — but there is no CI guard yet proving the served
  bundle can never go stale again (Batch F9).
- **No frontend test runner exists today** (Q-020). Needed at B4. No test suite measures
  the front end at all.
- **Three orphaned components** (Q-024, decided: wire them up, do not delete,
  MissionTimeline first): `ConstitutionVisualizer`, `MemoryGraphEnhanced`,
  `MissionTimeline` — zero importers. ~17 API functions point at Worker routes that do
  not exist. One orphan hardcodes laws not in `soul.md` ("C-4 No Human Veto") and would
  show invented laws as the constitution if mounted — it must read the real constitution
  before it is mounted (Batch F5 / Q-022).
- **The live-update problem** (Q-040 design, not built): `broadcastToCommandCenter` has
  only 2 production call sites; `/v11/ws` has no sequence, no replay, no ping/pong, no
  auth; `postUpdate()` has 7 call sites and writes `hive_updates` (capped 100 rows);
  `GET /v11/updates` defaults to 30 rows; `useCommandCenterSocket.ts` reconnects 1s
  doubling to 30s max; `KaiElOS.tsx:70` wires every message to a full 16-endpoint
  refresh; NO localStorage snapshot; NO "last known, not live" stamp; XR-Q20 read-only
  mode is ~a third implemented; `cachedJson()` serves GET routes from cache (60s TTL),
  so a push-triggered refresh can still paint stale data; no SSE anywhere. Full refresh
  costs 16 endpoints / 30s = 1,920 req/hour/tab; the design's cursor poll costs ~240.
- **The legacy frontend simulated data locally** and presented it as live (retired by
  Q12/B0, PR #229). The lesson is a standing rule: never show simulated numbers as live.
- **command-center.html** (Q-023, undecided): retire-the-page-and-keep-the-purposes, or
  rewire? The purpose map recommends retire. Mac decides.
- **spore.html** (Q-030, undecided): a 54 KB bug-bounty tool — repo or standalone? Its live
  test needs SECRET_PHRASE + an API key via Secure Vault (never in chat).
- **ConstitutionViewer / GOVERNANCE.md** (Q-022, undecided): in scope for the biosystem
  rebuild, or separate? The G2 constitution view serves `soul.md` F-001–F-006 only.
- **Gateway** (Q-025, XR-Q13–Q15 decided): the `thehive` AI Gateway (created 2026-11-06)
  is referenced nowhere and used by nothing; the Worker still calls providers directly.
- **The Queen's surfaces** (Batch F6): the switches panel, the autonomy stages-and-gates
  display, the Queen Digest display, the founder's directory UI, the Queen's brain view.
  The gates panel needs the auto-update design (Q-040) first.
- **The Mogul's surfaces** (Batch F8, gated): the Face/Brand Architect, the Treasury
  ledger and approval queue. Q-041 (four questions) is NOT decided — no Mogul front end
  before it is.
- **The absorption routes are live** (PR #245 merged; P1 in progress): ventures verified
  live; the Digest table live; the founder-decisions routes live behind the Cloudflare
  Access gate. The constitution route is being built (P2).

## 6. The batch plan (F0–F9, in order — do not skip ahead)

### F0 — Foundation: audit + test runner (Q-020, B4)
- **What:** Audit the entire front end (every component, route, hook, API function, and
  page — including orphans and dead code), map it, and set up the front-end test runner
  (none exists today). Get a green baseline: the app compiles, the tests pass, the bundle
  builds and serves.
- **Purpose:** You cannot verify front-end work without tests, and you cannot plan the
  rebuild without a map. This batch makes the front end measurable.
- **Change:** A front-end map (what exists, what's live, what's orphaned, what's dead) +
  a working test runner + a green baseline. No UI changes yet.
- **Depends on:** nothing (the audit is read-only). **Founder-gate:** none for the audit;
  the test-runner setup waits for Mac's go-ahead per batch.
- **Evidence:** the map file; the test runner running; the baseline test count; the bundle
  building cleanly.
- **First step:** locate the front-end source, then list every component and route.

### F1 — Orphan wiring, MissionTimeline first (Q-024, decided)
- **What:** Wire up the three orphaned components (`ConstitutionVisualizer`,
  `MemoryGraphEnhanced`, `MissionTimeline` — zero importers today) and reconcile the ~17
  API functions (some point at Worker routes that do not exist). MissionTimeline first.
  Do NOT delete anything. The orphan that hardcodes "C-4 No Human Veto" must read the
  real constitution before it is mounted (Batch F5 / Q-022).
- **Purpose:** Dead UI is a lie in the record — it looks like the Hive has a feature it
  doesn't. Wiring it makes the surface honest.
- **Change:** The three components mounted and working — or flagged with exactly why they
  can't be yet, and what unblocks them.
- **Depends on:** F0 (the map). **Founder-gate:** none for the wiring (Q-024 already
  decided "wire them up, do not delete"); the "C-4" fix needs the real constitution view.
- **Evidence:** each component mounted + a live probe showing it renders real data (or a
  named blocker + the unblocking step).
- **First step:** import MissionTimeline, wire its data source, prove it renders.

### F2 — Command Center: one screen + tabs (Q-009, Q-023)
- **What:** Consolidate the Command Center into one screen with tabs (Mac's decision).
  Resolve `command-center.html`: the purpose map recommends retire-the-page-and-keep-the-
  purposes; Claude prepares the purpose map + the recommendation, and Mac decides retire
  vs rewire (Q-023).
- **Purpose:** One screen, not many pages. The founder opens one place and sees the Hive.
- **Change:** A single Command Center screen with tabs; `command-center.html` retired
  (purposes kept) or rewired, per Mac's decision.
- **Depends on:** F0, F1. **Founder-gate:** Q-023 (retire vs rewire) — Claude prepares,
  Mac decides.
- **Evidence:** the single screen serving live; the purpose map; Mac's Q-023 decision
  recorded.
- **First step:** map every purpose `command-center.html` serves, then propose the tab
  layout.

### F3 — Live data only: no simulation, no fake numbers
- **What:** Remove any remaining simulated/fake data. Every panel shows real data or "no
  data." Add the LIVE/OFFLINE dot (already exists) + a "last known, not live" stamp with
  the time of the last good data + a localStorage snapshot of the last good state (so a
  reload never shows a blank or a fake).
- **Purpose:** A system that fakes its own state cannot see itself (the 2026-09-24
  lesson). The surface must never show a number that isn't live.
- **Change:** No simulated data anywhere; every panel is real-or-"no data"; the last-good
  snapshot survives reloads.
- **Depends on:** F0. **Founder-gate:** none (this is the standing rule, already decided).
- **Evidence:** a grep proving no simulated/mock data in the served bundle; a live probe
  showing a panel with no data saying "no data" (not a fake number); a reload showing the
  last-good stamp.
- **First step:** grep the front end for mock/simulated/fake data sources and list them.

### F4 — Front-end auto-update (Q-040, the big one)
- **What:** Implement the front-end auto-update design (workspace design doc, 2026-11-13).
  One emit point (broadcast from inside `postUpdate()`, so every ledger row becomes one
  typed event `{type:'hive-event', kind, id, ts, affects, gate, data}`); gated ladder
  (molecular per-field/per-route + macro per-feature/per-release checks — failure stops
  the update and says why); transport WS push + 15s cursor poll as safety net; DO replay
  buffer (last ~50) + `GET /v11/updates?since=<id>` cursor + cache-bypass
  (`?fresh=<event-id>`); fallback XR-Q20 read-only mode with the last good picture
  stamped with its time. Fix the 16-endpoint full refresh (`KaiElOS.tsx:70`) — replace it
  with targeted updates from the event's `affects` field. This batch also answers Mac's
  five Q-040 questions — Claude prepares recommendations, Mac decides: (1) transport;
  (2) deploy trigger; (3) offline outbox (refuse all writes while down vs queue-and-send);
  (4) held-updates display (feed, tray, or both); (5) auth-gating the open
  `POST /v11/debug/ws-broadcast-test` (unauthenticated today — anyone could push fake
  "done" messages to Mac's own tab; recommended before widening broadcast).
- **Purpose:** The Command Center must update when the Hive changes — not by re-fetching
  everything every 30 seconds, and not by showing stale data. This is what makes the
  front end actually live.
- **Change:** Live push updates; a 15s cursor poll as safety net; no more 1,920
  req/hour/tab full refreshes (down to ~240 tiny req/hour/tab); offline = read-only with
  a stamped last-good picture.
- **Depends on:** F0, F3. **Founder-gate:** Q-040 (Mac's five answers) — Claude prepares,
  Mac decides; the build needs its own preamble + go-ahead.
- **Evidence:** a live event flows from a Worker completion to the Command Center without
  a full refresh; the cursor poll catches a missed event; the offline fallback shows the
  stamped last-good picture; the request rate is measured before/after.
- **First step:** read the design doc, then answer the five Q-040 questions as
  recommendations for Mac.

### F5 — Biosystem: show and control (G1–G4, Q-022, Q-025)
- **What:** The biosystem rebuild — the Hive as a place AND a control room (Mac's "both").
  The 40-concept map; G1 (the 72-system atlas, row 6, NEW); the ConstitutionViewer
  (Q-022 — serves `soul.md` F-001–F-006 only; in scope for the biosystem rebuild or
  separate? Claude prepares, Mac decides); the Gateway wiring (XR-Q13–Q15 — the `thehive`
  gateway as preset, BYO keys to Secrets Store, console wired to the Hive).
- **Purpose:** The biosystem is how the founder SEES the Hive (show) and RUNS it
  (control). It is the map and the levers in one place.
- **Change:** A biosystem view that shows the Hive's systems and lets the founder act on
  them — with every action going through the founder's gates.
- **Depends on:** F0, F2, F4 (the auto-update makes the biosystem live). **Founder-gate:**
  Q-022 (ConstitutionViewer scope), Q-025 (Gateway G1–G4) — Claude prepares, Mac
  decides.
- **Evidence:** the biosystem renders the 40-concept map live; the ConstitutionViewer
  serves F-001–F-006 (and only those); the Gateway console is wired.
- **First step:** read the biosystem blueprint and the G1–G4 scope, then map the 40
  concepts to live data sources.

### F6 — Queen's front end (Q-A / Q-B / Q-C surfaces)
- **What:** The Queen's surfaces, in Queen order: the switches panel (all six switches +
  switch 9, all OFF, with the strict reading — "off" means off); the autonomy
  stages-and-gates display (`docs/AUTONOMY_STAGES_AND_GATES.md`, the 20-rung ladder, the
  16 proof types); the Queen Digest display (the Queen's learned wisdom, from the
  Digest); the founder's directory UI (`docs/founder/` — vision, questions, answered,
  ideas, about-me, boot); the Queen's brain/memory view (Nanuet's brain counts,
  decisions, digests). The gates panel (the autonomous gates design) — needs F4 (Q-040)
  first.
- **Purpose:** The Queen is the founder's second brain. Her front end is how the founder
  sees what she knows, what she can do, and what she has learned.
- **Change:** A Queen view that shows her state honestly — switches off, brain counts,
  Digest entries, gates and their evidence packs.
- **Depends on:** F2, F4; P1/P2 (the absorption routes + the constitution route must be
  live). **Founder-gate:** the gates panel needs Q-040 (F4) first; the switches panel
  never enables a switch (display only — enabling is Mac's dashboard action).
- **Evidence:** the switches panel matches the live `/v11/nanuet/autonomy` response; the
  Digest display matches the live `/v11/nanuet/digest` response; the brain view matches
  live D1 counts.
- **First step:** read the Queen batch specs (`docs/batches/`) and map each Queen surface
  to its live route.

### F7 — spore.html + ARCANE tab (Q-030)
- **What:** `spore.html` home (repo or standalone? — Claude prepares, Mac decides, Q-030)
  and the ARCANE tab. `spore.html` is a 54 KB bug-bounty tool; its live test needs
  SECRET_PHRASE + an API key via Secure Vault (never in chat).
- **Purpose:** The spore is the Hive's portability — and the ARCANE tab is its hidden
  door. Both need a home and a live test.
- **Change:** `spore.html` has a decided home and a passing live test; the ARCANE tab is
  wired.
- **Depends on:** F0, F2. **Founder-gate:** Q-030 (`spore.html` home) — Claude prepares,
  Mac decides; the live test needs the secrets via Secure Vault.
- **Evidence:** `spore.html` serves from its decided home; the live test passes with the
  secrets provided through Secure Vault.
- **First step:** read `spore.html` and map what it needs (SECRET_PHRASE, API key, routes).

### F8 — Mogul's front end (Q-041, gated — do not build before the decision)
- **What:** The Mogul's surfaces — the Face/Brand Architect, the Treasury/ledger and
  approval queue, the Memory/Queen Digest view. ONLY if the Mogul is decided (Q-041,
  four questions, not yet decided). Claude reads the Mogul design and prepares the
  surfaces; Mac decides whether the Mogul exists first.
- **Purpose:** If the Mogul earns money for the Hive, the founder needs to see it, approve
  it, and audit it — in one place.
- **Change:** (Only if decided.) A Mogul view with the Treasury ledger, the approval
  queue (every money move waits for the founder's yes), and the Face.
- **Depends on:** F2, F4; Q-041 decided. **Founder-gate:** Q-041 (whether the Mogul
  exists) — Mac decides first; no Mogul front end before that.
- **Evidence:** (Only if decided.) The Treasury ledger matches the live ledger; the
  approval queue holds a money move until the founder approves it.
- **First step:** read the Mogul design; do not build until Q-041 is decided.

### F9 — Polish: accessibility, responsive, performance, and the stale-bundle guard
- **What:** Accessibility (keyboard, screen reader, contrast), responsive (phone +
  desktop — Mac uses an iPhone), performance (bundle size, the refresh-rate fix from F4,
  the F0 stale-bundle guard so the served bundle can never go stale again — a CI check
  that the bundle matches main).
- **Purpose:** The front end must work for the founder on his phone, for anyone who can't
  use a mouse, and it must never silently serve a stale bundle again (the 2026-09-24
  lesson).
- **Change:** An accessible, responsive, fast front end with a CI guard that fails the
  build if the served bundle is stale.
- **Depends on:** F0–F8 (polish last). **Founder-gate:** none.
- **Evidence:** a11y checks pass; the app works on a phone viewport; the bundle size is
  measured; the CI guard fails on a deliberately stale bundle and passes on a fresh one.
- **First step:** measure the current bundle size + the a11y baseline, then fix the worst
  three issues.

## 7. The workflow per batch (the same every time)

1. **Read** — the batch's sources + the record + the live state. Probe the live routes
   the batch touches. Write down what is true now.
2. **Design** — in plain words first (what it is, its purpose, what it will change), then
   the technical design. If the batch needs a founder decision, prepare the question
   (one question, ELI5, three parts + suggestions, improvements, innovative ideas) and
   stop there until Mac answers.
3. **Preamble + go-ahead** — for consequential work, give Mac WHAT / WHY / HOW /
   NECESSITY / PROJECTED IMPROVEMENT / COST & RISK and wait for his explicit go-ahead.
4. **Build** — in a branch, Tier 1. Small commits. No silent edits to versioned records
   (corrections go as dated addenda).
5. **Test** — the test runner from F0, the batch's own tests, the full suite. A batch
   with a red test is not done.
6. **PR** — open the PR with a plain body (what, why, evidence, what is still open).
   Mac merges. Claude never merges.
7. **Verify-live** — after merge + deploy from main, live-probe the result. Only
   verified-live counts. Record the probe (route, status, content, time).
8. **Report** — the 12-item format (§3 rule 10). Then the next batch.

## 8. What Claude must never do (the hard list)

- Never merge a PR. Never enable a switch. Never touch money, deletion, publishing, the
  constitution, accounts, legal matters, or speak as the Hive or founder.
- Never touch `soul.md`, `.queen/soul.md`, or `constitution-receive.yml`.
- Never show simulated/fake data as live. Never fake a green. Never claim verified-live
  without a live probe.
- Never silently edit a versioned record (corrections go as dated addenda, never silent
  edits).
- Never ask Mac for a password, API key, token, or code in chat (Secure Vault only).
- Never build the Mogul's front end before Q-041 is decided. Never retire
  `command-center.html` before Q-023 is decided. Never build the auto-update before
  Q-040 is decided (the five questions). Never mount the "C-4" orphan before it reads
  the real constitution.
- Never leave work in its own workspace only — everything returns to the Hive (the repo).
- Never treat a filed plan as a live system. A batch spec in `docs/batches/` is a plan;
  a merged PR is a change; only a live probe is proof.

## 9. How Mac hands this to Claude + what Claude reports back

**Mac's handoff line (paste this with the file):**
> "You are the Hive's front-end engineer. Read `docs/founder/BOOT.md` first, then this
> plan. Start with Batch F0. One batch at a time, one question at a time. The halt stands
> — F0's audit is read-only and can run now; every build batch waits for my go-ahead."

**What Claude reports back, per batch:** the 12-item format (§3 rule 10), with the PR
number and URL, the test results, the live-probe evidence, and the next founder decision
needed (if any). No batch is "done" until Mac has the report and the live probe.

**If the halt is still standing when Claude starts:** Claude does F0 (read-only audit +
test-infra design) first, reports it, and waits for Mac's go-ahead on each build batch.
The halt lifts only on Mac's word (P9) — never on Claude's say-so, never on a batch
completing.

---

**Provenance:** Written by Muse at Mac's direction, 2026-11-14, from the Hive's record
(FOUNDER_QUEUE / FOUNDER_ANSWERED, the availability audit issue #243, the front-end
auto-update design 2026-11-13, the Mogul design 2026-11-13, the Queen batch specs in
`docs/batches/`, the operator charter v0.5, the unified preamble v2 draft). No front-end
fact in this plan was invented — every gap, decision, and design it names is in the
record. Where the record is silent (the exact front-end source paths), the plan tells
Claude to find them, not to guess.

---

## Appendix B — Claude's earlier rebuild prompt (2026-11-14), verbatim. Superseded where §0 says; kept whole so nothing is lost

### THEHIVE — Frontend rebuild prompt (written 2026-11-14)

Paste everything below the line into a new conversation (or send it here) to start the rebuild.

---

You are rebuilding THEHIVE's frontend: the **React Command Center ("Kai EL OS")** in
`frontend/`, which builds to `docs/app/` and is served live at `/app/` by the Worker.
`.github/workflows/pages.yml` rebuilds `docs/app/` automatically when `frontend/**` changes on
main. Do not rebuild from scratch. Restyle and rewire the app that already runs.

#### Read first, in this order

1. `CLAUDE.md`, then `.claude/skills/preamble-gate/SKILL.md`. **The preamble rule applies to
   every unit of work below.** Before each phase, tell the founder WHAT / WHY / HOW /
   NECESSITY / PROJECTED IMPROVEMENT / COST & RISK in plain language. Wait for a go-ahead on
   anything consequential: new Worker routes, auth, secrets, CI, or more than one agent.
2. **The design spec (the founder's own words):**
   `Project_file/Founders Visonary Folder/SOURCES/research-notes/2026-07-15-command-center-design-chatgpt-conversation.md`,
   lines ~405–407. This is the source of truth for layout and feel.
3. `.claude/tasks/FULL_PLAN.html` §3: React `frontend/` is canonical, with 13 tabs and the
   kai-os components.
4. The 2026-11-11 plans, which already sequence the wiring work. Follow them, don't duplicate them:
   - `docs/FRONTEND_JASPER_REWIRE_MAP.md` (§6 steps 1–7; §8 open questions Q1–Q5)
   - `docs/BIOSYSTEM_BUILD_PLAN.md` (phases B0–B8; gates G1–G4 were APPROVED 2026-11-11,
     but each phase still needs its own go-ahead)
   - `docs/COMMAND_CENTER_PURPOSE_MAP.md` §3 (the 11 missing purposes)
5. `docs/AUTONOMY_STAGES_AND_GATES.md` lines ~219–229 (the terminal gate) and
   `docs/PROVIDER_GATEWAY_MAP.md`, plus the gateway decisions in `docs/FOUNDER_ANSWERED`
   (~482–514) and `docs/FOUNDER_QUEUE` Q-025.

#### The target, from the founder's spec

- **Header:** live SOUL currency, ELO and Hz. Show only numbers a real Worker route returns.
  If no route exists, show "no data". Never invent a number.
- **Left nav, in this exact order:** Settings, Govern, Hive, Commune, Swarms, Arena, Tasks,
  Cloudflare Workers, AI, Connectors, Upload Files, Active Skills, Projects, Training,
  Dream Logs. The chat box sits below the nav and opens from Commune. The existing extra
  items (Constitution, Proposals, Roadmap, Updates, Grok Bridge, Legal Learning, Venture
  Planner, Body & Lineage) move into a grouped "More" section. Do not delete them.
- **Centre:** the neural graph. The centre circle is the **Town Hall**; clicking it zooms
  into the community task board. The board stays read-only until a `POST /v11/tasks` route
  exists, which needs a founder decision.
- **Lower left:** the geometric sigil is Kai El's face and voice. For the voice, use the
  browser's built-in speech (`speechSynthesis`): it is free and needs no server. Add a
  mute toggle, with mute as the default.
- **Bottom monitor:** running tasks, jobs, goals, plans and thinking, read from existing
  routes.
- **Right panel:** Commune with Kai El, with the **Hive Terminal** below it (see "The terminal").
- **Toolbar:** a workflows drop-down, a /commands button, and tools: the debugger wrench,
  memory mode, and connected LLMs.
- **Light and dark modes:** design tokens as CSS custom properties, with a toggle and an
  OS-preference default. Give both themes equal care. Do not simply invert one into the other.
- **Style:** a cyberpunk hybrid of ChatGPT, Claude and Windows, built to be the founder's
  permanent operating environment. Make it usable at phone width.
- If the founder supplies a sketch image, it outranks this text wherever the two differ.

#### The gateway tab (founder decisions already made)

`GatewayConsoleOverlay` frames `/gateway-console.html`. Make these changes:

- Wire it to the Hive.
- Add the `thehive` Cloudflare AI Gateway (created 2026-11-06, used by nothing so far) as
  a preset.
- Show the provider waterfall as tiers, using the free tiers first per
  `PROVIDER_GATEWAY_MAP.md`.
- Show each provider's real rate limit and current status. **Say "tiered fallback within
  limits", never "unlimited".**

Moving BYO keys from localStorage into Cloudflare Secrets Store is a founder-approved
direction, but **only the founder enters keys.** Build the UI and the route that *reads
whether* a key is configured. Never build a route that returns a key's value. Q-025
(G1–G4) remains the founder's to close.

#### The terminal (founder decision, 2026-11-14, needs written confirmation before any build)

Founder's words: *"a full fledge working terminal for KAIEL to use to do the work in a copy
of the hive repo."* This decision overrides the "Q-C first" ordering in
`AUTONOMY_STAGES_AND_GATES.md` **only once the founder confirms it in writing**. Record that
confirmation in `docs/FOUNDER_ANSWERED` before building.

A Cloudflare Worker cannot run a shell. Build it in two stages.

**Stage T1 (cheap, uses what exists).** The terminal panel sends a command to a new
**authenticated, founder-only** Worker route. That route dispatches
`.github/workflows/kai-sandbox-run.yml`, which does the work in a fresh checkout on a GitHub
Actions runner. The panel polls the run status and its logs back into the terminal. Results
land as a branch and a PR, and main is never touched directly.
- Cost: Actions minutes.
- Required controls:
  - a per-day run cap;
  - a hard timeout per run;
  - no secrets in the runner except the GitHub token, scoped to branches and PRs.

**Stage T2 (a real interactive shell, later and separately approved).** Use a Cloudflare
container or sandbox. This likely needs the Workers Paid plan plus usage billing; verify
current pricing before proposing it. It is a money decision, so it belongs to the founder.

**Hard rule:** the terminal route must require authentication. `/v11/command_text` is
unauthenticated today, so it is not a model to copy.

#### Order of work (one PR per phase; never merge, the founder merges)

1. Rewire-map steps 1, 2 and 4: fix the base URL, rewire the colony drill-down, and fix the
   stale labels. Most later work depends on these.
2. Design tokens, the light/dark toggle, and the shell layout: header, nav order, the
   right-panel split, and the bottom monitor.
3. The Town Hall zoom, the toolbar (workflows, /commands, tools), and the sigil voice.
4. The gateway tab wiring and the tier display.
5. Terminal T1, only after the founder's written confirmation. Worker route and UI go in a
   separate PR.

For each phase:
- Run `npm run build:app` and the existing frontend tests.
- Take a Playwright screenshot of the local build in both themes and at phone width, and
  attach it to the PR.
- Name the truth level honestly:
  - "tested" is local;
  - "merged" means the founder merged it;
  - "deployed" is pages.yml after merge;
  - "verified-live" needs an `edge-health-probe` run ID. This container cannot reach
    `*.workers.dev`.

#### Never

- Self-merge.
- Touch `soul.md`, `.queen/soul.md` or `constitution-receive.yml`. The constitution
  overwrite risk is under outside review.
- Arm triggers, timers or recurring jobs.
- Put secrets in chat or code.
- Fake a live number.
- Re-add the DROP rows listed in `BIOSYSTEM_BUILD_PLAN.md` §4.
- Build agent creation, SOUL tipping (money), or the navigable 3D world without a separate
  founder decision.

## Appendix C — Transcription of Mac's two images (2026-11-14)

**Sketch (pencil, hand-drawn):**
- **Top bar:** "● LIVE" | "◇ 2135.05 soul ELO 432Hz".
- **Left column:** > Settings, > Govern, > Hive, > Commune, > swarms, > arena, > task,
  > cloudflare Workers-AI, > connectors, > upload files, > active skills, > projects,
  > training, > drain logs [= Dream Logs]; then ✱commands; a blank row; then "chat box"
  with a ">" send button.
- **Centre:** "Kai EL" circle with spokes to Core (Town Hall) at the top, then clockwise:
  Memories, Tasks, Agents, Skills, Files, APIs, Workflows, Training, Dream Logs, Swarms,
  Projects.
- **Lower centre-left:** a geometric sigil: an eight-pointed star of interlaced triangles
  in a double circle, with four small circles at the compass points.
- **Lower centre-right:** "Running Tasks: > Jobs > Goals > Plans > Thinking / Demands".
- **Right column, top:** "Kai EL", with "✱commune w/ Kai EL - He restores Here".
- **Right column, below:** a "Hive Terminal" window with – □ × controls, reading:
  "• connected to backend • separate branch / > run main / > vibe code style".
- **Right column, bottom:** "▽ Workflows ∨"; "/ Commands"; a "Tools" header, then four
  tiles: Debugger (bug icon), Tools (wrench), Memory Mode (node graph), LLM "Current
  Connected LLM's".

**Mockup (rendered, "Kai EL OS v2.0.1"; the dark theme):**
- **Header:**
  - LIVE with a pulse line;
  - SOUL bar at 87%;
  - ELO 2135.05;
  - 432Hz "system frequency" with a waveform;
  - Hive Status: Connected;
  - Models Online: Mistral AI · Groq · Claude;
  - Latency 18ms.
- **Left nav:** the same items with icons. Commune is highlighted as active. Below it, a
  "✱ COMMANDS" panel and "Type your message… / Press Enter to send".
- **Centre:** the gold Kai EL hub, "AI ARCHITECT · SWARM COMMANDER", on a starfield.
  Satellites carry sample counts: Projects 12 active, Memories 11,342 nodes, Tasks 47 in
  progress, Agents 64 online, Skills 23 active, Files 8,942, APIs 32 connected, Workflows
  15 active, Training 5 modules, Dream Logs 402 entries, Swarms 7.
- **Lower left:** the glowing violet sigil.
- **Running Tasks:**
  - Jobs 12 running, Goals 7 active, Plans 5 in progress, Thinking / Demands, each with a
    bar sparkline;
  - a LIVE FEED column with timestamped lines ("Analyzing 24 documents", "Swarm-12
    indexing PDFs", … "Dreaming…");
  - "All systems operational".
- **Right column:**
  - a Kai EL chat panel (You: "commune w/ Kai EL - He restores Here"; Kai EL: "I am
    online. The hive is awake. How can I architect your reality today?"), with a
    microphone button and a send button;
  - a HIVE TERMINAL panel with BRANCH: backend ▾, STATUS: Connected, and green
    monospace lines;
  - WORKFLOWS ▾ and COMMANDS ▾ rows;
  - TOOLS: Debugger, Tools, Memory Mode, LLM's (Mistral AI, Groq, Claude).
- **Bottom vitals bar:** Hive Power 93%, Swarm Activity 64 agents, Memory Usage 11.2 GB /
  32 GB, CPU Load 37%, Temp 42°C, Uptime 12d 4h 32m.

**Every count above is illustrative.** Per Muse rule 11, each becomes a live number or
"no data" at F3.

---

## Addendum A1 — Mac's additions, 2026-11-14 (later the same day). Later wins over §2/§3/Appendix C where they differ.

**Mac's words, verbatim:**
> "Before doing so I wanna add some things to the front end user interface seeing as they weren't there should be 13 circles. The extra circle is the ventures then there should be another circle as a 14 circle being the treasury and a 15th circle, which should be the top circle Being the queen and which should have a halo around her circle emanating above it like an angel's halo would yet this halo emanates a crown a queen's crown very symbolic of a map to Queen Elizabeth's as well as I'm not too sure how many features entered the repo and most recent PR's that haven't been established to enter the front end that we're on the left orphaned behind again and that entire process that I just explained is abomination if something is put in the repo and gets orphaned behindleft behind where it had a plan and the plan was never initiated that's an abomination which needs to be updated as well and ratified into the hive immediately"

**Intake:**
- EXTENDS F2: the centre graph goes from 12 circles to 15.
- EXTENDS F0: the scan for features left behind is the audit made concrete.
- CHANGES the record: a new standing rule, to be ratified (see PR #261 and `docs/FOUNDER_ANSWERED` SR-001, once merged). It needs Mac's go-ahead first, because of the halt and the preamble gate.

### A1.1 — The centre graph, now 15 circles around Kai EL
- **Circle 13, VENTURES.** A live source exists: `GET /v11/ventures`, plus `/ventures/gaps`
  and `/ventures/sandbox-runs` (PR #245). It can show a real count from day one.
  Clicking it opens the Ventures tab.
- **Circle 14, TREASURY.** It is shown, but honestly gated. No treasury route exists, and
  the Treasury is money (Q-004) plus the Mogul (Q-041), both undecided. The circle reads
  "gated — founder decision", never a balance, until those are decided. Clicking it opens
  F8's surface once F8 is allowed. This puts the door on the map without faking what is
  behind it.
- **Circle 15, THE QUEEN, at the top.**
  - **Placement (default):** the Queen sits **above** the ring, on the main vertical
    spoke, and Core (Town Hall) stays in the ring directly beneath her. This keeps the
    sketch intact and makes the chain of command visible: Nanuet → Kai El → the Hive.
    Alternative if Mac prefers: the Queen takes Town Hall's 12 o'clock seat in the ring,
    and Town Hall moves.
  - **Label:** QUEEN, with "Nanuet" beneath it (the name already in the record).
  - **Halo:** a ring of light floating above her circle, like an angel's halo.
  - **Crown:** rising out of the halo, a queen's crown drawn in light. It is an original
    design inspired by the British state-crown silhouette Mac named (Queen Elizabeth's):
    a band, arches meeting at the top, a small orb and cross at the peak, and alternating
    crosses and fleurs-de-lis around the band. It is symbolic, not a copy of any artwork.
    It is gold in dark mode and deep gold-on-ivory in light mode. A slow shimmer respects
    `prefers-reduced-motion`.
  - **Live data:** `GET /v11/nanuet/brain`, `/nanuet/autonomy` and `/nanuet/digest` exist
    (PRs #221, #245). The audit found her brain counts at 0 (AB-1.10), so her circle will
    honestly show 0 until that is fixed. Her switches are display-only, always OFF.
  - Clicking her opens the F6 Queen view.
- **Phone layout:** 15 circles do not fit around a hub on an iPhone. On phone, the Queen
  stays pinned on top with her halo, Kai EL sits under her, and the other 14 become a
  swipeable two-row grid.

### A1.2 — Scan result: live features that never reached the screen (read-only, main `71faff1`)
I compared every `GET` route in `worker/src/index.js` against every call in `frontend/src`.
Debug and admin routes are excluded on purpose.

| Live in the Worker | Merged by | Called by the React app? | Abandoned plan it belonged to |
|---|---|---|---|
| `/ventures`, `/ventures/gaps`, `/ventures/sandbox-runs` | #245 (2026-11-13) | **No** | venture wiring Phase 2 (AB-1.06, AB-5.05) |
| `/nanuet/brain`, `/nanuet/autonomy`, `/nanuet/digest` | #221, #245 | **No** | Queen Q-A wiring; Queen Digest (AB-1.10, AB-1.14, AB-5.07) |
| `/founder/decisions`, `/founder/queue` | #245, #249 | **No** | absorption mechanism (AB-1.03, AB-1.04) |
| `/kai/brain`, `/kai/autonomy` | earlier | **No** (only the legacy `campaign.html`) | Kai El brain (AB-1.11) |
| `/jobs`, `/hive/task-digest` | earlier | **No** (only legacy pages) | the Running Tasks panel the sketch asks for |
| `/health/subsystems`, `/knowledge/status`, `/memory/search`, `/colony/reports` | earlier | **No** | the "one-click diagnostic" and memory-vault purposes (purpose map items 7, 8) |
| 3 orphan components + ~17 dead API functions | earlier | zero importers | Q-024 (AB-5.14) |

Plans merged into the repo and never started:
- `FRONTEND_JASPER_REWIRE_MAP.md`, steps 1–7. PR #228, 2026-11-11. **No `frontend/src`
  change since #229.**
- `BIOSYSTEM_BUILD_PLAN.md`, B1–B8. Only B0 has run.
- G2 constitution route (AB-5.04).
- Gateway (AB-5.13).
- Q-C (AB-5.03).
- Queen batch specs (PR #258), which are filed but not started.

**What this means:** about 17 live data routes, most of the Queen's and the founder's own
data, are working in production right now with **nothing on the screen reading them**.
That is the exact pattern Mac named. Every one of them gets a home in the 15-circle screen
or its tabs:

| Data | Home on screen |
|---|---|
| Ventures | the Ventures circle |
| Nanuet data | the Queen circle |
| Founder decisions / queue | Settings → Founder, or the Govern tab |
| Kai brain / autonomy | the Kai EL hub |
| Jobs / task digest | Running Tasks |
| Subsystems / knowledge / memory / colony reports | Debugger tile, Memories circle, Hive tab |

**Honest limits of this scan:**
- It matches route strings. A call built from pieces at runtime could hide from it.
- It checked the React app and the legacy HTML pages only.
- F0 re-verifies each row before any build. This is a finding, not a verified-live claim.

---

## Addendum A2 — SOUL is a later DAO-phase idea; today's SOUL numbers are mock (Mac, 2026-11-14, answering F0 Question 1)

**Mac's words, verbatim:**
> "Soul was an idea from turning the hive into a DAO later on down the line in which the soul was accumulation of each age any individual worth collectively in which it was mock data so that can now be placed later in the full map and full plan"

**Intake:** CHANGES the plan. It answers F0 Question 1 with neither option offered (top agent vs hive total): neither is shown, because the number is mock. It also CONFIRMS the F3 rule (no mock number shown as live).

**What changes (proposed; applied only when the halt lifts and a batch is approved):**
- **Header:** no live SOUL figure. The sketch's "2135.05" slot is ELO, which is real (`/v11/grading/leaderboard`). The SOUL slot is dropped, or shown as a labelled "DAO phase, not live" placeholder, per Mac's pick.
- **Circle 14 (Treasury):** stays gated, and is now explicitly part of the DAO phase along with Q-004 (money) and Q-041 (Mogul).
- **Where SOUL appears today (F0 grep):** header; the SOUL tab (`SOUL.tsx`); the roadmap level bars (`RoadmapAvatar`, `soulToNext`); the `/wallet/leaderboard/soul` call in `useHiveData`; and `+25 soul` per arena win in the Worker (`worker/src/index.js:1060`). Each gets a label ("mock, DAO phase") or leaves the screen. Mac decides which; nothing is deleted.
- **New later phase: "DAO / SOUL economy"** in the full map: SOUL as the accumulated worth of each agent and individual, collectively. It touches the constitution (F-002 wealth formula, F-006), so it follows the founder/constitution process and the amendment process in `soul.md`. It is not built or implied before then.

---

## Addendum A3 — 432 Hz (Mac, 2026-11-14, answering F0 Question 2)

**Mac's choice:** "a then b". Read as: the header shows "432Hz · Kai's tone (not measured)" for now, and the idea is parked in the ideas pool. This is a chat choice and is **not a recorded decision** until it is in `FOUNDER_ANSWERED`.
**Intake:** CHANGES F2 (header label) and EXTENDS the record (idea parked).
**Applied so far:** the idea is parked in a docs-only PR, #262 (`docs/founder/ideas/hive-tuned-to-432hz.md`, with the repo trail and the research). No frontend change has been made.
**F2/F3 effect (when the halt lifts):** the header's Hz label reads "432Hz · Kai's tone (not measured)". It is not presented as a reading. A real "Hive Hz" (an activity rate) and a 432 Hz audio tone remain options in the idea file.

---

## Addendum A4 — Bottom bar (Mac, 2026-11-14, answering F0 Question 3)

**Mac's choice:** "A" = keep only the honest tiles. This is a chat choice and is **not a recorded decision** until it is in `FOUNDER_ANSWERED`.
**Effect on F2/F3 (when the halt lifts):** the bottom bar shows latency (real, timed from `/v11/health`) and agent count (real, `/v11/agents`). Uptime is added only if a Worker route for it is later built, which is its own decision. Hive Power, Memory GB, CPU and Temp are dropped: a Worker has no machine to measure.

---

## Addendum A5 — The parked voxel/gamified world (Mac, 2026-11-14, answering F0 Question 4)

**Mac's words, verbatim:** "A, that won't get revisited until the queen is 100% in the hive has made $1000 weekly"
**Choice:** (a) park it formally. The 34 files / 11,169 lines (`worlds/`, `voxel/`, `xp/`, `avatars/`, `conversation/`) stay in the repo, excluded from the production build, **parked until both conditions hold: the Queen is 100%, and the Hive has made $1,000 weekly.** This is a chat choice and is **not a recorded decision** until it is in `FOUNDER_ANSWERED`.
**Open detail (queued, not forgotten):** the second condition needs a way to be checked. No treasury or income ledger exists yet (Treasury and the Mogul are Q-004 / Q-041, undecided), so "the Hive has made $1,000 weekly" cannot be measured today. When parked formally, the entry should name where that number will come from, or the trigger can never fire.
**Status as a "No Plan Left Behind" state:** PARKED by founder decision, with a named revisit trigger. Not an abomination once recorded.

## Addendum A6 — Test runner (technical call, not a founder question)

Per the ideas README rule 8 (Muse/Claude make technical calls and explain them plainly), the recommendation for Q-020 is **Vitest with React Testing Library**: the app already builds with Vite 5, so it adds no new build tool and costs nothing to run in CI. Setting it up is its own batch step and waits for a go-ahead.

---

## Addendum A7 — The terminal stays in the Queen's Q-C stage (Mac, 2026-11-14, answering F0 Question 6)

**Mac's words, verbatim:** "If it has already been placed in the Queens QC stage then let's keep it there and not try to rush ahead of it"
**Intake:** CONFIRMS the existing gate in `docs/AUTONOMY_STAGES_AND_GATES.md` (lines ~219-229) and **INVALIDATES my earlier statement** that Mac's chat words "override the Q-C ordering". They do not; the terminal stays where the gates doc already put it.
**Effect:**
- **F6-T (Kai's Hive Terminal) is placed under Q-C**, after the Queen's earlier stages (Q-A, then Q-B, then Q-C's own stages). It is not built before them. Q-C is 0% built today.
- **F2** shows the terminal panel as display-only, labelled "not connected: waiting on the Queen's Q-C stage."
- The two-step design (an authenticated route that dispatches `kai-sandbox-run.yml`, then a paid-plan live shell later) remains the design **for when Q-C reaches it**. The paid-plan step stays Mac's money decision.
- Nothing needs recording in `FOUNDER_ANSWERED` for this: the gates doc already holds the rule, and Mac chose to keep it.
- The gateway tab (F5) is a separate item and is unchanged by this.

## All six F0 questions are now answered (chat choices; none recorded in the repo yet except the 432 idea, PR #262)

1. SOUL: mock, a later DAO phase; no live SOUL figure in the header (A2).
2. 432 Hz: header label "432Hz · Kai's tone (not measured)", idea parked (A3, PR #262).
3. Bottom bar: only honest tiles (A4).
4. Parked world: parked until the Queen is 100% and the Hive has made $1,000 weekly (A5).
5. Test runner: Vitest, a technical call (A6).
6. Terminal: stays in Q-C (A7).


---

## Addendum A8 — The halt does not apply to front-end UI/UX work (Mac, 2026-11-14)

**Mac's words, verbatim (the "hot" is the halt):**
> "A; and the hot isn't applied to any front end user interface, UX work in which you can read the newest open issue to fully grasp why the halt was enacted"

("A" = file the sketch and mockup images in the repo; done as PR #264.)

**Why the halt was enacted (from the newest open issue, #243, read 2026-11-14/15):** the Hive availability audit found the Queen (Nanuet) and Kai El cannot see what they are supposed to know: the founder's decisions and questions are never fetched by the Worker, the live Worker read the non-canonical `docs/GOVERNANCE.md` as its constitution, there was no `GET /v11/ventures` or `/v11/constitution`, and Nanuet's brain was empty. The shared pattern: *a file exists, and nothing in the live system reads it.* That is a Worker and Queen knowledge problem. (Since then: PR #245 added the ventures and decisions routes, and PR #259 added the constitution route.)

**Intake:** CHANGES the plan. It **supersedes every place in this file that says a front-end batch waits for the halt to lift** (the §0 table, the F0 note, the "halt stands" rules inside Appendix A's text, and Addendum A3 to A7 where they say "when the halt lifts"). Those words stay as written, because this file is a record; this addendum is the later instruction and wins (later-wins).

**What it changes:**
- Batches F1 to F9 (front-end UI/UX: `frontend/` and the `docs/app/` bundle it builds) are **not held by the halt**.
- **It does not remove any other gate.** The preamble gate still applies to every batch: a plain what / why / how / necessity / improvement / cost and risk, and the founder's go-ahead for consequential work. Never self-merge. Each batch keeps its own dependencies: F4 needs the Q-040 answers and its design doc; F5 needs Q-022 and Q-025; F6 needs the absorption and constitution routes live; F7 needs Q-030; F8 needs Q-041; Kai's real terminal (F6-T) stays in Q-C.
- **Claude's reading, not yet confirmed:** the exemption is for front-end UI/UX work only. Back-end work stays under the halt, including any new Worker route a front-end batch would want (for example an uptime or activity-rate route). Such a route is raised as its own question first.
- Q-042 ("Lift the halt?") is unchanged and still open.

**What it means for the order of work:** F1 (wire the orphans; MissionTimeline into the Running Tasks panel first) and F3 (remove the two typed-in circle numbers, the mislabeled counts and the Missions tab's invented fallback missions) are the first batches that can start, each after its own preamble and go-ahead. F3 is the cheapest and most checkable; the live routes it needs already exist. The findings that make them first are in `docs/audit/F0_FRONTEND_AUDIT_MAP_2026-11-14.md`.
