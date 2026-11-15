# Batch F0: Front-End Audit Map (read-only)

**Date:** 2026-11-14, 17:35 PST (America/Los_Angeles). The system clock says Nov 14; this chat's date line says Nov 15. I used the clock.
**Against:** main `71faff1` (`frontend/` is unchanged by PR #261, which is docs only).
**Authority:** Mac said "Yes" to a read-only F0 audit during the halt (Q-042 still open).
**What I did:** read the code, built the app in a scratch copy outside the repo, and deleted that copy. **Nothing in the repo changed.** `git status` is clean.
**What I did NOT do:** probe the live site (this container cannot reach `*.workers.dev`), build anything, or start the test runner. The test runner is its own go-ahead.
**Truth level of everything below:** `compiles` (type-check + build, in scratch) and `read` (the code). Nothing here is `verified-live`.

---

## The headline

**The app is already about 70% of your sketch, and mostly built honestly.** The header, the 12-circle graph, the nav, the commune panel, the Hive Terminal panel, the Running Tasks bar, the sigil, Workflows and the models list all exist and read real data. F2 is mostly **closing gaps**, not a rebuild. The Q-024 orphans are also much bigger than Muse's plan says.

---

## 1. Size and shape

| Fact | Number |
|---|---|
| TypeScript/React files in `frontend/src` | 121 files, ~21,600 lines |
| Reachable from the app's entry (`main.tsx`) | 78 files, ~8,550 lines |
| **Unreachable (nothing loads them)** | **43 files, ~13,070 lines = 60% of the source** |
| Test files / test runner | **0 / none** (no `test` script in `package.json`) |
| Type-check (`tsc -p tsconfig.build.json`) | **passes** (exit 0, in scratch) |
| Build (`vite build`, in scratch) | **passes**, 12.7 s |
| Committed bundle `docs/app` vs a fresh build of main's source | **identical**: same entry file hashes, same sizes |

The last row is good news for the stale-bundle worry. At the repo level, the committed bundle matches the source on main. Whether the *live* site serves that bundle still needs an `edge-health-probe` run, which I can't do from here.

**The 43 unreachable files**
- **34 are the gamified "world" code** (`worlds/` 14, `voxel/` 8, `conversation/` 5, `xp/` 4, `avatars/` 3), exactly 11,169 lines. `tsconfig.build.json` **deliberately excludes** them from the production build. So the voxel/Unity-style world from the older vision is parked code, not live code.
- **2 stragglers:** a `usePersistedForm` hook and a type-declaration file.
- **7 are orphan components** (zero importers, 1,827 lines in total):

| Component | Lines | Purpose today | Where it belongs |
|---|---|---|---|
| `MissionTimeline` | 310 | Mission history timeline. Calls `/genesis/missions`, which does **not** exist. | Running Tasks panel (F1) |
| `MemoryGraphEnhanced` | 251 | Force-directed memory graph. Calls `/memory/graph`, which does **not** exist. | Memories circle |
| `ConstitutionVisualizer` | 626 | Laws display. Calls `/constitution`, which does **not** exist. **Hardcodes "C-4 No Human Veto".** | After the real constitution route (G2) |
| `TesseractChamber` | 151 | 3D tesseract | 4D tab |
| `AchievementToast`, `LevelUpNotification`, `MissionCard` | 195, 197, 97 | Gamification pieces (the XP system is also parked) | Parked with the world code |

Muse's plan lists three orphans. There are seven, plus a parked world of 11,169 lines. That is a bigger "left behind" than the plan knew about, and it is a Q-024 question, not a decision I make.

---

## 2. Your sketch, element by element

| Sketch element | Status today | Where | Gap |
|---|---|---|---|
| LIVE dot | **LIVE** | `TopStatusBar` | none |
| ◇ soul number | **LIVE, but it is the #1 agent's SOUL, not a total** | `TopStatusBar` (`soulBoard[0].soul`) | Decide: top agent, or the hive total? |
| ELO | **LIVE**, the top agent's rating | same | same question |
| 432Hz | **A fixed constant** labelled as branding (code comment: "never implied to be measured") | same | No real source exists. Decision needed (§3). |
| Latency | **LIVE**, measured by timing `/v11/health` every 30 s | same | none |
| Left nav (15 items, your order) | **Exists, wrong order and extras mixed in** | `LeftNav` | Reorder; move extras under "More" |
| ✱ Commands + chat box | Commands is a **label with an input**; no command list | `LeftNav` | Build the `/commands` list |
| Centre hub "Kai EL" + 12 circles | **Exists** | `CenterGraph` | Counts need fixing (§3); circles 13–15 to add |
| Core (Town Hall) circle | Exists, **shows the governance log count** | `CenterGraph` | Town Hall zoom into the task board is not built; `/v11/townhall` exists but no screen reads it |
| Sigil (Kai's face) | **Exists**, animates when Kai is "speaking" | `KaiSigil` | No actual voice. No speech output anywhere in the live code. |
| Running Tasks (Jobs/Goals/Plans/Thinking) | **Exists** | `BottomActivityFeed` | "Plans" = governance log count; "Goals" = pending arena challenges. Labels stretch the truth. `/v11/jobs` is live but unused. |
| Commune panel ("Kai EL") | **LIVE**, calls `/v11/command_text` | `KaiCommune` | `command_text` is unauthenticated (already queued as FQ-Q-011) |
| Hive Terminal (– □ ×) | **Display only**, shows heartbeat lines, says "not a shell". Its own code comment explains why: a browser shell would be an RCE hole. | `HiveTerminal` | The real terminal is F6-T and needs your recorded decision |
| Workflows drop-down | **Exists**, 3 wired / 5 "soon" | `WorkflowsDrawer` | 5 workflows unbuilt |
| / Commands drop-down | **Missing** (only the nav label) | none | New |
| Tools: Debugger | **Missing** as a tile | none | New. `/v11/health/subsystems` and `/debug/*` exist to feed it. |
| Tools: Tools | **Missing** | none | New |
| Tools: Memory Mode | **Missing** | none | New. `/v11/memory/search` exists to feed it. |
| Tools: LLM (connected LLMs) | **LIVE** | `ConnectedModels` | Lives in the nav area, not the Tools row |
| Light and dark modes | **Not built.** A theme toggle exists in the store (`uiStore.toggleTheme`) but **nothing reads it**. | `stores/uiStore.ts` | Build the tokens, the toggle, and the light palette |
| Phone layout | **Exists**: a separate narrow layout with a drawer | `KaiElOS` | Re-check against the 15-circle design |

## 3. Your mockup's numbers, and where each one can really come from

| Mockup shows | Real source? | Verdict |
|---|---|---|
| SOUL 87% bar | none (SOUL is an unbounded count, not a percentage) | **No honest source.** Drop the bar, or define what 87% means. |
| ELO 2135.05 | `/v11/grading/leaderboard` | **LIVE** (already wired) |
| 432Hz | none | **Constant.** Keep as a labelled brand constant, or drop. Mac decides. |
| Hive Status "Connected" | `/v11/health` | **LIVE** |
| Models Online | `/v11/llm/status` | **LIVE** |
| Latency 18ms | `/v11/health` timing | **LIVE** |
| Projects 12 / Memories 11,342 / Tasks 47 / Agents 64 / Skills 23 / Files 8,942 / APIs 32 / Workflows 15 / Training 5 / Dream Logs 402 / Swarms 7 | see §4 | Mixed. See below. |
| Running Tasks counts | `/v11/tasks`, `/arena/challenges`, `/jobs` | Real routes exist; today's mapping is loose |
| Hive Power 93% | none | **No source** |
| Swarm Activity 64 agents | `/v11/agents` | **LIVE** (count) |
| Memory Usage 11.2 / 32 GB | none | **No source.** A Worker has no RAM to report. |
| CPU Load 37% | none | **No source** |
| Temp 42°C | none | **No source** |
| Uptime 12d 4h | none exposed | **No source** (could be added as a new Worker route; a founder decision) |

**So the mockup's bottom vitals bar cannot be built as drawn.** Only latency, agent count and uptime (if a route is added) are honest. The rest describe a physical machine the Hive does not have.

## 4. The centre graph's counts, checked one by one (F3 findings)

`CenterGraph.tsx` claims "Every count is a real, live number". Checked:

| Circle | What it shows | Honest? |
|---|---|---|
| Projects | `tasks.length` (task count) | Mislabeled |
| Core (Town Hall) | `governance.length` | Mislabeled |
| Memories | `pulse.length` (heartbeat count) | **Mislabeled** (not memories) |
| Swarms | `agents.length` | Mislabeled |
| Tasks | non-completed tasks | **Honest** |
| Dream Logs | `pulse.length` (same number as Memories) | Duplicate |
| Training | "—", marked not connected | **Honest** |
| Skills | `agents.length` | Mislabeled |
| Files | "—" | Honest |
| **APIs** | **hardcoded `18`** | **Fabricated number** |
| **Workflows** | **hardcoded `8`** | **Fabricated number** |
| Agents | `agents.length` | **Honest** |

Two numbers are typed into the code, not measured, and five more are real numbers under the wrong label. All are F3 work.

**A second F3 violation, worse:** the Missions tab (`MISSIONS.tsx`) shows **invented sample missions** ("Complete Command Center Tabs", "Implement Real 4D Math", dated July 2026) **whenever the real `/tasks` route returns empty or errors**. Its footer then says "Data source: /v11/genesis/missions", a route that does not exist. This is exactly the "simulated data presented as live" pattern Muse's rule 11 forbids.

## 5. Category 8 items (PR #261), re-verified

Two methods this time: the route-string scan, **plus** a full list of every `fetch(` call in reachable code, to catch URLs built at runtime.

| Item | Result |
|---|---|
| AB-8.01 Ventures | **CONFIRMED.** Zero references in `frontend/src`. (`VenturePlanner` calls `/venture/plan` and `/proposals`, not `/ventures`.) |
| AB-8.02 Queen (`nanuet/*`) | **CONFIRMED.** Zero. The header's "Queen %" is a computed readiness number, not Nanuet data. |
| AB-8.03 Founder decisions/queue | **CONFIRMED.** Zero. (`/founder/whoami` and the proposals-decide route are used by `ProposalsPanel`.) |
| AB-8.04 Kai brain/autonomy | **CONFIRMED.** Zero in React. |
| AB-8.05 jobs, task-digest, subsystems, knowledge, memory/search, colony/reports | **CONFIRMED.** Zero. |
| AB-8.06 Rewire/biosystem plans never started | **CONFIRMED.** Last `frontend/src` change is PR #229. |
| Not in the scan before | `/v11/townhall` is also live with no screen. |

**New finding: broken API layer.** `services/api.ts` has 31 functions. **25 have zero callers.** **16 of its 31 point at routes the Worker does not have** (`/hive/status`, `/constitution*`, `/memory/graph`, `/genesis/*`, `/governance/status`, `/governance/vote`, `/tesseract/project`, `/dream/status`, `/agents/reproduce`). Muse's "~17" is right. Only 4 files import the file at all (the Missions tab and three orphans).

## 6. Other findings

1. **The live Constitution panel shows the wrong document.** `ConstitutionViewer` fetches `docs/GOVERNANCE.md` (573 lines, titled "FULL CONSTITUTION", "F-001 through F-011 with Sub-Articles"), not `soul.md` (F-001–F-006). The catalogue (AB-6.02, AB-1.01) says anything beyond F-006 has no ratification. So the screen presents unratified articles as the constitution. This is the Q-022 question, now with the evidence. (My first grep missed the F-numbers because that file uses non-breaking hyphens; I re-checked.)
2. **The WebSocket refresh is as Muse describes.** `KaiElOS` runs `useCommandCenterSocket(() => hive.refresh())`, and `hive.refresh()` re-fetches **16 endpoints** at once. The poll is 30 s. Confirmed in code.
3. **Heavy libraries, loaded lazily.** `phaser` 1.48 MB and `three` 0.96 MB (raw), but the entry file is 138 KB, so they load on demand. An F9 item, not urgent.
4. **`docs/app` stays in step with source** only through `pages.yml`, which rebuilds on `frontend/**` changes. No CI check fails a stale bundle (Muse's F9).

---

## 7. The 12 items (Muse's required report format)

1. **What I must do:** the read-only F0 audit during the halt.
2. **What I must retrieve:** the front-end structure, data flow, orphans, API layer, and a build baseline.
3. **What I retrieved:** §1–§6 above.
4. **When:** 2026-11-14, 17:35 PST, main `71faff1`.
5. **References:** `frontend/src/components/kai-os/{TopStatusBar,CenterGraph,LeftNav,BottomActivityFeed,HiveTerminal,ConnectedModels,WorkflowsDrawer}.tsx`; `frontend/src/hooks/useHiveData.ts`; `frontend/src/services/api.ts`; `frontend/tsconfig.build.json`; `command-center/tabs/MISSIONS.tsx`; `kai-os/ConstitutionViewer.tsx`; `worker/src/index.js` routes; PR #261.
6. **Further improvements:** a Vitest test runner (Vite 5 is present, so it fits with no new build tool); a single `useHiveData` replacement driven by F4 events; a "no data" tile component used everywhere.
7. **Further implications:** the sketch is a gap-closing job; the biggest *risks* are fake numbers and the wrong constitution on screen, not missing layout. The parked world code (11,169 lines) is a decision for you, not for F2.
8. **Further research:** the F4 design doc and `AGENT_REGISTRY.md` are not reachable; `/v11/townhall` response shape; whether the live site serves the committed bundle (needs a probe workflow run).
9. **Deciphering (plain words):** the screen you drew is mostly built. What is wrong is a few numbers that are typed in or mislabeled, the missing light mode, three missing tool tiles, and a lot of live data nothing displays.
10. **Abductive reasoning:** the best explanation for 60% unreachable code is that two efforts (the gamified world and the React command center) were built in parallel, and only the second was ever wired to `main.tsx`. The hardcoded 18 and 8 fit "placeholder left in once the circles were drawn" rather than bad faith.
11. **Quantitative analysis:** 121 files / 21.6k lines; 43 files / 13.1k lines unreachable (60%); 31 API functions, 25 unused (81%), 16 pointing at nonexistent routes (52%); 12 circles, 2 hardcoded numbers, 5 mislabeled, 4 honest, 1 duplicate; 0 tests; type-check 0 errors; bundle identical to source.
12. **Excavated lens:** the Hive Terminal's own comment already says a browser shell is a remote-code-execution hole. That is the same constraint behind F6-T's design (authenticated route, then a GitHub runner). Nothing in the repo contradicts the plan for the terminal.

---

## 8. What changes in the master plan (proposed, not applied)

- **F0:** done as a read-only audit. The test runner and the green baseline still wait for their own go-ahead.
- **F1:** the orphan list grows from 3 to 7. Add a question: what to do with the 11,169-line parked world (keep parked, or retire).
- **F2:** add the missing tiles (Debugger, Tools, Memory Mode), the `/commands` list, light mode, and the nav reorder.
- **F3:** fix the 2 hardcoded circle numbers, the 5 mislabels, and the Missions fallback data. This is the first thing that can be built and tested cheaply.
- **F5/Q-022:** the evidence in §6.1 goes into the Q-022 question.

## 9. Questions queued for you (asked one at a time, later)

1. Header's big number: the top agent's SOUL, or the hive total?
2. 432Hz: keep as a labelled brand constant, or drop?
3. The mockup's bottom vitals bar: keep only the honest tiles (latency, agent count, uptime), or drop it?
4. The 11,169-line parked world: keep parked, or retire?
5. Q-020: Vitest as the test runner?
6. Record the terminal decision in `FOUNDER_ANSWERED`?


---

## UPDATE 2026-11-15 (appended; the audit above is unchanged)

Main moved after this audit. PR #259 (merged 2026-11-15, main `f0f37b0`) added `docs/CONSTITUTION.md` and a **`GET /v11/constitution` route** in the Worker. Effects on the findings above:
- §5: of the 16 `services/api.ts` functions that pointed at routes the Worker lacked, `getConstitutionLaws` (`/constitution`) now has a matching route. **15 remain.** `/constitution/soul` and `/constitution/history` still do not exist.
- §1/§6.1: `ConstitutionVisualizer` can now be given a real source, and the live `ConstitutionViewer` still reads `docs/GOVERNANCE.md`. Both need Batch F1/F5 to re-check the response shape and remove the hardcoded "C-4" law before mounting. This is a note, not a verified-live claim.
- `frontend/` had no changes between `71faff1` and `f0f37b0` (checked with `git diff --stat`), so every other finding stands.
