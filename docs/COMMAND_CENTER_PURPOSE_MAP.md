# Command Center Purpose Map — what docs/command-center.html was FOR

**Status:** PURPOSE MAP, 2026-11-11. Workspace-only. Read-only work — nothing
in this file edits, builds, deploys, merges, or flips anything. It exists so
the founder decides the page's fate (retire or rewire — rewire-map Q2) WITH
the accounting in hand, not from "it is dead" alone.

**Standing instruction this map implements (founder, 2026-11-11):** when
retiring pages, account for what each page was FOR and the overall goal /
outcome envisioned when it was created — nothing gets put aside just because
it is dead or never wired up, because it was part of the founder's vision and
still is. The pages were supposed to be ONE cohesive whole, not separate
pages/sites. System A (the Jasper FastAPI backend, localhost:8080) was the
initial build; it was to be reverse engineered and hybridized into the second
build (System B, the live Cloudflare Worker) — Q-001, already decided. The
founder's goal for this map: see what he was trying to do and achieve, and
fulfill that vision entirely — including what he may have overlooked,
assumed, or been ambiguous about.

**Sources:** `docs/command-center.html` (1,407 lines, read in full),
`docs/index.html` (how it is linked), the rewire map
(`~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` — the page's
§2 route table and §3 tab table), `docs/FOUNDERS_VISION.md` (the
one-cohesive-whole doctrine), and the Worker route table verified by grep
against `worker/src/index.js` (main `7af242d`; main has since moved to
`b4ebd6d8` via docs-only PR #224, so every frontend file read here is
current). The biosystem page already got this treatment
(`~/workspace/hive-batches/BIOSYSTEM_REVERSE_ENGINEERING_BLUEPRINT.md`).

**How to read the mapping:** (a) = a live Worker route exists today (named
with method and path — nothing invented). (b) = a new endpoint is needed
(name only, no code — the endpoint is a founder decision, not a builder's
invention). (c) = a panel in the live React app at `/app/` already does
this. (d) = no equivalent — and the row says whether it is a gap in the
vision (something the Hive still needs) or a Jasper-only concept (something
that does not come back).

---

## §1 — Overall goal (plain words)

The command-center page was **the one screen from which the founder runs
the Hive**. Not a dashboard, not a status page — the operating environment.
One screen where he can talk to Kai El, see every agent and what it is
worth, settle conflicts in the arena, watch the money, run the town's work,
watch the law being enforced, check which model is thinking, see every
colony, track his real businesses, read what the Hive remembers, and prove
the machine is healthy — and do it while the Hive itself is visible as a
living world behind it all, with agents wandering its districts and the
Town Hall at its center.

That is the job it was built for: **operate the whole Hive from one
place, and see it alive while you do it.**

Was it supposed to be a separate page or site? **No — it was supposed to
be one cohesive whole, and the evidence says so from three directions:**

1. **The page's own structure.** It is a single screen, not a set of
   pages. One world canvas, one command bar, one top HUD, one side panel
   with 14 tabs that are facets of one job — not 14 destinations. The tabs
   are named for the Hive's functions (WORLD, COMMUNE, SWARM, ARENA, FREQ,
   SOUL, TASKS, GOVERN, LLM, HIVE, VENTURES, GRAPH, MEMORY, DEBUG), and
   every one of them reads from the same backend and the same agent
   roster. Nothing in the page treats any tab as a separate site.
2. **The front door.** `docs/index.html` (2026-07-16) says the root leads
   to Kai EL OS, the current design, and the legacy "SOUL REALM / Town
   Hall" Command Center is "preserved and still reachable" at
   `./command-center.html`. The page was the Command Center before the
   React app — the first build of the one whole — and it was kept as the
   legacy build of the same whole when the React app became the front
   door. "Preserved" is the root page's own word: kept, not replaced in
   purpose.
3. **The vision doc.** `docs/FOUNDERS_VISION.md` (2026-11-06): "The
   frontend, the user interface, is to absorb the same capabilities the
   operator uses through the browser web — exact where possible, and where
   not exact, reverse-engineered and adapted into the Hive. The goal is
   full absorption." And the operating map in the same file runs
   "Founder vision/logs → TownHall board → Kai plan/direct → Akosha
   assign → agents → Council review → Queen digest → board loop." The
   TownHall board is this page's job — the board the whole loop runs
   through. The React app at `/app/` is the second build of the same
   whole: 13 tabs plus overlays covering the same facets (WORLD, ARENA,
   SOUL, GOVERN, LLM, HIVE, COMMUNE, MISSIONS, API). Two builds, one
   whole — never two sites.

**The sentence that matters:** retiring this page retires a build, not the
purpose. The purpose — operate the whole Hive from one place, and see it
alive — lives on in the React app where it already exists, and the missing
pieces are the actual work. A rewire that rebuilds this page as a second
Command Center would make two wholes, which is the opposite of the one
cohesive whole the founder envisioned.

**One correction to the map's shorthand:** the rewire map calls this page
DEAD, and as a whole that verdict stands — it cannot fulfill its purpose
today. But it is not uniformly dead. Its boot sequence tries the live
Worker (third candidate, after a `?backend=` override and same-origin),
and roughly half its calls resolve against the Worker. The other half call
routes that never existed. It is a page that half-works against the live
system and half-pretends — which is worse than fully dead, because the
half that works hides the half that does not.

---

## §2 — Per-section purpose table

26 sections. Counts, computed from the rows below: **17 rows have a live
Worker route (or a resolving file) behind them; 20 rows are covered at
least in part by a live-app panel; 4 rows need a new endpoint (6 endpoint
names, all name-only); 5 rows have no equivalent for the purpose itself
(rows 3, 12, 20, 23, 24 — the purpose has no home even where a route or a
file exists behind it).** (A row can
carry more than one letter — a route that exists and a panel that covers
it, with a gap inside it.)

| # | Section | What it is | What it was FOR | Data / action it needs | Mapping today |
|---|---|---|---|---|---|
| 1 | Boot screen + backend detection | The "ENTERING THE HIVE" boot; `detectBackend()` tries `?backend=` → same-origin → `thehive.sovereignhive.workers.dev` → localhost:8080 → localhost:8181; a 75 s patient wake loop; a "LIVE BACKEND REQUIRED" gate; a DemoHive in-browser simulation fallback with a "DEMO HIVE" banner | Find a live Hive, wait for it to wake, and always open — so the founder is never locked out of his own Command Center | `GET /v11/health` probe against each candidate | **(a)** `GET /v11/health` exists. **(c)** The React app is same-origin `/v11` — no detection needed, it just works. **(d)** The `?backend=` override, the 75 s wake loop, and the DemoHive simulation have no live equivalent. The wake loop is a System A-era solution to a problem System B does not have (the Worker is always-on edge; no cold start). The simulation is a Jasper-era fallback — the live app shows OFFLINE instead, which is the honest behaviour (nothing faked). |
| 2 | Cortana Oracle (Three.js head) | A glowing 3D head — Kai El's face — that speaks, reacts, and changes colour with Elo and soul; 7.83 Hz Schumann baseline; 500-word lore intro | Give Kai El a face that speaks, so the founder talks to a presence, not a text box | Speech text, Elo average, soul total, frequency | **(c)** Partial — KaiSigil + CenterGraph are the React app's Kai El presence. **(d)** The animated speaking head itself has no exact equivalent — a gap in the vision (see §4, question 8). |
| 3 | Frequency bar | Eleven small frequency pips (174 / 285 / 396 / 417 / 528 / 639 / 741 / 852 / 963 Hz plus 432 / 7.83) under the HUD, display-only, driven by a local `activeHz` | Show the Hive's current frequency as a living visual | A local `activeHz` value; nothing is fetched | **(d)** Jasper-only concept. No `/frequency/*` route exists on the Worker, no live-app panel shows it, and the biosystem blueprint already drops word→Hz / FrequencyGuild. Does not come back. (The resonance threshold 0.707 is real Hive law — soul.md mutable law #2 — but it is a number, not a frequency bar.) |
| 4 | Minimap | A small viewport rectangle over the world map, tracking the camera and the agents | See where you are in the world at a glance | Agent positions + camera viewport | **(c)** Partial — the React WORLD tab (ColonyGrid) shows the same systems as cards. **(d)** The viewport-over-a-world minimap itself has no equivalent — part of the world-as-place gap (row 5). |
| 5 | Phaser WORLD (15 zones) | The big canvas: SOUL REALM, FREQUENCY LANDS, ARENA BADLANDS, TRUST CITADEL, R&D ARCHIPELAGO, CRYPTO EXCHANGE, AETHER CITADEL, AUTOMATISCH NEXUS, KIMI ORACLE, ACADEMY DISTRICT, OUTER COLONIES, POSTGRES VAULT, REDIS CACHE, N8N FORGE, ML CRUCIBLE — agents wander by Elo zone, with a Town Hall, day/night, weather, Schumann rings, and a minimap | Make the Hive a place you can see and navigate — every system has a location, every agent has a place in it, and the Town Hall sits at the centre | Agents + Elo + colony health + tasks + pulse | **(c)** Partial — the React WORLD tab covers the data (agents, colonies, tasks, pulse). **(d)** The world-as-place itself has no equivalent — a gap in the vision. The React NMS tab is a Phaser scene that is display-only and "not yet wired". The 15 zones are a Jasper-era map of systems that are real (colonies, arena, SOUL, LLM, knowledge); the spatial world is the missing piece. |
| 6 | Command bar | "Speak to Kai El…" — a text box plus a mic button, always visible at the bottom, with "ENTER THE HIVE" / "AWAKE" mode switching | Speak to Kai El from anywhere in the Center, without switching tabs | `POST /command_text` | **(a)** `POST /v11/command_text` exists. **(c)** KaiCommune.tsx in the React app (same logic). Covered — with a Queen flag: the route is unauthenticated (30/min/IP only), so gating it is Queen work (the commune-gating decision, asked 2026-11-10, unanswered). The mic button (voice input) is **(d)** — no equivalent in the app. |
| 7 | Top HUD | LIVE/OFFLINE, top SOUL, top Elo, current Hz, Schumann, active provider, agent count | The Hive's vital signs at a glance — is it alive, who is winning, what is it thinking on | Leaderboards, `/llm/status`, `/agents` | **(a)** All routes exist. **(c)** TopStatusBar in the React app. Covered. |
| 8 | WORLD tab (the canvas) | The Phaser canvas itself as a tab, with the zone map and the colony zoom-in panel | The world you operate in, as a tab alongside the tools | Same as row 5 | Same as row 5 — **(c)** partial (data covered), **(d)** the world-as-place is missing. |
| 9 | COMMUNE tab | Chat with Kai El, plus Hive event messages (agent born, task completed) in the same conversation | Talk with Kai El and watch the Hive act in the same conversation | `POST /command_text` + an event feed | **(a)** `/command_text` exists. **(c)** KaiCommune.tsx. Covered for the chat. **(d)** The event messages in the chat have no live equivalent — the React app polls via useHiveData; `/events/stream` does not exist (row 24). |
| 10 | SWARM tab | The agents registry: every agent with Elo, soul, and description; DESIGN AGENT and REPRODUCE buttons; a LIVE/DEMO badge | See every agent, what it is worth, and make new ones | `GET /agents`, leaderboards, `POST /design_agent`, `POST /spawn_agent`, `POST /agents/reproduce` | **(a)** `/agents` and the leaderboards exist. **(c)** Partial — the React WORLD tab shows agents, but there is no dedicated registry panel. **(b)** New endpoints, names only: `POST /v11/design_agent`, `POST /v11/spawn_agent`, `POST /v11/agents/reproduce`. Agent creation is a capability question, not just a code question — who is allowed to design and spawn agents from the UI is a founder decision (see §4, question 3). |
| 11 | ARENA tab | Challenges, "RUN PROJECTION", resolve, the voxel projection viewer, and the Hall of Fallen Ideas — "no idea deleted" | Settle conflicts by projection; let ideas fall without being erased | `GET /arena/challenges`, `GET /arena/fallen`, `POST /arena/challenge`, `POST /arena/resolve/{id}`, `POST /arena/project/{id}`, `GET /arena/projection/{id}/frames` | **(a)** Every route exists (verified: index.js:4775, :4780, :4785, :4795, :4806, :4825). **(c)** React ARENA tab + LiveArenaViewer + DREAM tab (fallen). Covered — with one concrete gap: **(d)** nothing in the React UI runs a projection (the route exists, the app never calls it). |
| 12 | FREQ tab | The Frequency Guild: word→Hz, letter→Hz, "heal" — type a word and see its frequency | Treat everything as vibration; make the invisible visible | `POST /frequency/word`, `POST /frequency/heal`, `POST /frequency/letter` | **(d)** Jasper-only concept. No `/frequency/*` route exists on the Worker and no live-app panel does this. Dropped — consistent with the biosystem blueprint, which drops word→Hz and the FrequencyGuild. Does not come back. |
| 13 | SOUL tab | The SOUL economy leaderboard (the 70/20/10 split in words) plus a TIP button to tip an agent | Watch the money and reward the agents that earn it | `GET /wallet/leaderboard/soul`, `POST /wallet/tip` | **(a)** The leaderboard exists. **(c)** React SOUL tab. Covered for watching. **(b)** `POST /v11/wallet/tip` (name only) — no route exists, and tipping is money movement, so it is founder-gated (Q-004). The 70/20/10 split is real Hive law — soul.md mutable law #3 — not Jasper text. |

| 14 | TASKS tab | The Town Hall board: every task with status (open / assigned / done), plus CREATE with title, agent, priority, and due date | See the Hive's work and add to it — the board the whole loop runs through | `GET /tasks`, `POST /tasks` | **(a)** `GET /v11/tasks` exists (D1, paginated — verified index.js:3342). **(c)** React MISSIONS tab — read-only. **(b)** `POST /v11/tasks` (name only) — no route exists (verified: the `/tasks` handler is GET-only). The React app cannot create tasks either, so task creation from the UI is missing in both builds. |
| 15 | GOVERN tab | The Justicia governance log (every action, article, timestamp) plus a VIEW button to read soul.md | Watch the law being enforced, and read the law itself | `GET /governance/log`, `GET /constitution/soul_md` | **(a)** `/governance/log` exists. **(c)** React GOVERN tab. Covered for watching. **(b)** `GET /v11/constitution` (name only) — the soul.md viewer — is already G2, approved by the founder by name 2026-11-11 (built at B3). Note: the old page loads `docs/GOVERNANCE.md` as "the live Constitution" through its ConstitutionViewer — soul.md F-005 Clause 3 says GOVERNANCE's F-005D/E/F hold no rank, so the viewer must read soul.md, not GOVERNANCE.md (Claude Decision 8, open). |
| 16 | LLM tab | The LLM gateway: every provider, its status, the active one, and the health note ("Only Workers AI is healthy") | See which model is thinking and whether each provider is alive | `GET /llm/status` | **(a)** Exists. **(c)** React ARCANE tab + ConnectedModels overlay. Covered. |
| 17 | HIVE tab | The colony network: eight colonies (plus HiveWorld), each with health, and a zoom-in panel | See the whole federation and zoom into any colony | Colony list, `/colony/health`, `/colony/capabilities`, console URLs | **(a)** `/colony/health` and `/colony/reports` exist (verified index.js:3155, :4670). **(c)** React WORLD ColonyGrid + ColonyZoomPanel (rewired in PR #228 to colony-ping + colony/health, per Q1 — capabilities section dropped). **(d)** Two pieces have no equivalent: the zoom-in iframe to a live colony console (colonies have no HTTP origin — the live app links to the colony GitHub repo instead), and the `/colony/capabilities` fetch (no route; map G1, dropped per Q1). Question: does the founder still want per-colony consoles, or is health + repo link enough (§4, question 6)? |
| 18 | VENTURES tab | The founder's real businesses (TheCopy and others), each with a repo link and status, shown as "unverified" when no live numbers exist | Track the real businesses separately from the colony network — the portfolio, not the Hive | Venture list (hardcoded) + repo links | **(c)** VenturePlanner overlay in the React app (calls `/v11`). **(d)** The lead/client counts have no route — they live only in TheCopy's own browser-local CRM, and the page honestly shows "unverified" rather than guessing. The portfolio has no live numbers (§4, question 5). |
| 19 | GRAPH tab | A D3 force graph of the colony network — drag nodes, click a colony to zoom | See the federation as a living web, not a list | `./memory/_graph.json` (relative fetch, resolves — `docs/memory/` exists) | **(a)** The data file exists and resolves. **(c)** CenterGraph in the React app renders a graph (contents not fully verified — it has a GraphNode interface and fetches from `/v11`). Partial. |
| 20 | MEMORY tab | The Obsidian memory vault as a wiki: `[[links]]`, categories (Constitution, Colonies, Agents, Economy, LLM, Open Source, Math, Philosophy), search | Browse what the Hive remembers — the memory as a place you can walk through | `./memory/_index.md` plus per-node `.md` files (relative fetches, resolve — `docs/memory/` exists) | **(a)** The files exist and resolve. **(c)** No live-app panel browses the vault — **(d)** a gap in the vision. The Worker's memory is `/memory/status` (a status, not a browser). The vault's generator script (`scripts/generate_memory_vault.py`) is the open question: does it still run, and who regenerates it (§4, question 4)? |
| 21 | DEBUG tab | The Hive Debugger: run every endpoint, read env keys, git state, log tail, colony ping — and copy the log | Prove the machine is healthy, in one place, in one click | 12 endpoints: `/health`, `/debug/health`, `/debug/env`, `/debug/git`, `/debug/logs`, `/debug/colony-ping`, `/debug/endpoints`, `/agents`, `/llm/status`, `/ml/status`, `/browser/status`, `/knowledge/status` | **(a)** All 12 exist (verified). **(c)** React API tab — tests endpoints one at a time. Covered for testing. **(d)** The one-click full diagnostic (run all, log tail, copy) has no equivalent — a small gap. Note: the old page has a bug — it reads `collected['/env']` but the endpoint is `/debug/env`, so the env-keys section never displays. Found, not fixed (this map fixes nothing). |
| 22 | Colony zoom-in slide panel | A slide-in panel over the WORLD tab: a colony's console in an iframe, plus its capabilities and health | Open a colony's own console without leaving the Center | `GET /colony/capabilities` (then `/colony/health` fallback) + a console URL | **(a)** `/colony/health` exists; `/colony/capabilities` does not. **(c)** ColonyZoomPanel (rewired in PR #228 — repo link, no iframe). **(d)** The iframe-to-a-live-console itself has no equivalent (no colony HTTP origin). Same question as row 17. |
| 23 | WebSocket live feed | The Hive tells you the moment something happens: `agent_born`, `task_completed`, `elo_updated` | Live, not polled — the Center reacts as the Hive acts | `GET /ws` (the Worker upgrades to a WebSocket) | **(a)** `/ws` exists (Durable Object — verified index.js:3149). **(d)** No verified live equivalent in the React app: BottomActivityFeed renders from polled useHiveData, and no React surface was verified to subscribe to `/ws`. Unverified, not absent — the live-push purpose may be partially covered; the subscription itself is a build question, not a founder question. |
| 24 | SSE live feed | Server-sent events into the chat: `arena_resolved`, `soul_tip`, `task_created`, `task_assigned`, `hitl_request`, `hitl_resolved` — the event types the WebSocket handler does not surface | The chat hears what the Hive does, including the moments a human is asked to decide | `GET /events/stream` | **(d)** No Worker route exists for `/events/stream`. The event types point at a real approval flow — `hitl_request` / `hitl_resolved` is human-in-the-loop approval, a founder-gated action (§4, question 9). The live-events-in-the-UI purpose is covered only by polling (BottomActivityFeed / useHiveData). |
| 25 | Auth gate | "INITIALIZE SOVEREIGN SESSION" — get a token, store it in `localStorage`, send it as a Bearer token on every call | Prove who you are before the Hive obeys you | `POST /auth/token` | **(a)** `/auth/token` exists — visitor-tier tokens, issued freely, stored in D1 (verified index.js:3158). **(c)** The React app has no session gate: reads are public, writes are founder-gated (Cloudflare Access + founder key). That is arguably the correct shape, not a gap — the old page's session is a Jasper-era habit, and the Hive's answer to "prove who you are" is Q-002 Access, not a token button. |
| 26 | Sentry note (comment) | A comment in the page's own head: Sentry is "genuinely unwired" — it needs its own SDK and a DSN, which it does not have | Error tracking, admitted as not built | A Sentry DSN (never supplied) | **(c)** The React app calls `initSentry()` at boot — a gated no-op with no DSN. Not a purpose gap: a known-unwired item, stated honestly by the page itself. Whether Sentry is wanted at all is a founder question (§4, question 10). |

**Routes the page calls that do not exist on the Worker (verified by grep,
no handler found):** `/design_agent`, `/spawn_agent`, `/agents/reproduce`,
`/frequency/word`, `/frequency/heal`, `/frequency/letter`, `/wallet/tip`,
`/constitution/soul_md`, `/events/stream`, `/hive/status` (only the false
roadmap-data comment at index.js:834, already fixed in PR #228),
`/colony/capabilities`, `POST /tasks`. Twelve missing calls, six of them
endpoint names that a rewire would need (rows 10, 13, 14, 15) — and three
of the twelve (the `/frequency/*` trio) are concepts that do not come back.

---

## §3 — What the live app already covers vs what is missing

The retire-vs-rewire decision is about the missing purposes, not about
the dead code. Here is the split.

### Already covered by the live React app at /app/

- **Talk to Kai El** — KaiCommune, same `/v11/command_text` the old
  command bar used (rows 6, 9). The chat works; the gating is Queen work.
- **See the agents and what they are worth** — WORLD tab: agents, Elo,
  soul, leaderboards (rows 7, 10 in part).
- **Settle conflicts in the arena** — ARENA tab, LiveArenaViewer, DREAM
  tab for the fallen (row 11). Every arena route exists.
- **Watch the law being enforced** — GOVERN tab, `/governance/log`
  (row 15).
- **See which model is thinking** — ARCANE tab + ConnectedModels,
  `/llm/status` (row 16).
- **See the colony network and its health** — WORLD ColonyGrid +
  ColonyZoomPanel, colony-ping + `/colony/health` (row 17, in its rewired
  form — repo link instead of a console iframe).
- **Watch the SOUL economy** — SOUL tab, `/wallet/leaderboard/soul`
  (row 13, watching only).
- **See and read the Hive's work** — MISSIONS tab, `GET /v11/tasks`
  (row 14, reading only).
- **Test the endpoints** — API tab, one at a time (row 21, in part).
- **See the vital signs** — TopStatusBar (row 7).
- **Track the ventures** — VenturePlanner overlay (row 18, in part — the
  list, not live numbers).
- **See the network as a graph** — CenterGraph (row 19, in part).

### Still missing — the purposes with no live home

These are the real work, whichever option the founder picks:

1. **Run a projection from the UI** (row 11). The route exists
   (`POST /v11/arena/project/{id}`); nothing in the React app calls it.
   The smallest missing purpose — a button that already has a route.
2. **Create tasks from the UI** (row 14). `POST /v11/tasks` does not
   exist; the MISSIONS tab is read-only. The Town Hall board can show
   work but not add to it.
3. **Design, spawn, and reproduce agents from the UI** (row 10). Three
   routes do not exist — and the question underneath is who is allowed
   to create agents, which is a founder decision before it is code.
4. **Tip an agent's SOUL** (row 13). `POST /v11/wallet/tip` does not
   exist, and it moves money, so it is founder-gated (Q-004).
5. **Read the constitution in the UI** (row 15). `GET /v11/constitution`
   is G2 — already approved by name (2026-11-11), built at B3. The one
   missing purpose that is already decided.
6. **The world as a place** (rows 5, 8, 4). The data is covered; the
   navigable world is not. The NMS Phaser tab is display-only. This is
   the largest missing purpose — and the one the founder must weigh,
   because it is the page's most distinctive idea.
7. **The memory vault as a browsable wiki** (row 20). The files exist
   and resolve; no panel browses them.
8. **The one-click full diagnostic** (row 21). The API tab tests one
   endpoint at a time; there is no "prove the machine is healthy" button.
9. **A live event feed** (rows 23, 24). `/ws` exists but no React
   surface was verified to subscribe; `/events/stream` does not exist.
   The app polls instead of listening.
10. **A colony console to zoom into** (rows 17, 22). Colonies have no
    HTTP origin; the live app links to repos. The question is whether a
    console per colony is still wanted.
11. **Kai El's speaking face** (row 2). KaiSigil is a presence; the
    animated head that speaks is not there.

### Deliberately not coming back (Jasper-only, dropped)

- **The Frequency Guild** (rows 3, 12): word→Hz, letter→Hz, heal, and
  the frequency bar. No routes, no panel, and the biosystem blueprint
  already drops it. The resonance threshold (0.707, soul.md mutable law
  #2) survives as a number, not as a frequency display.
- **The simulation fallback** (row 1): DemoHive, the page that always
  opens with fake data. The live app shows OFFLINE honestly instead.
  That is the correct behaviour under the nothing-faked rule.
- **The patient wake loop** (row 1): a System A cold-start fix for a
  problem the always-on Worker does not have.

---

## §4 — Overlooked / assumed / ambiguous

Flagged plainly as questions for the founder. None of these are filled
in here — that is his call.

1. **One screen, or many tabs?** The old page put the world, the command
   bar, and the HUD on ONE screen — you could see the Hive alive while
   you worked. The React app splits the same functions into 13 tabs you
   switch between. Is the "one screen, everything visible at once"
   quality part of the vision, or is tab-switching fine? The doctrine
   says one cohesive whole — but "one whole" and "one screen" are not
   the same thing, and the founder never said which one he meant.
2. **Is the Hive a place you navigate, or a set of panels?** The old
   page made the Hive a place (15 zones, agents wandering, day/night,
   weather, a Town Hall at the centre). The React app shows the same
   systems as lists and cards. Which does the founder want the operator
   to feel — a place, or a control room?
3. **Who is allowed to create agents?** DESIGN AGENT and REPRODUCE are
   the only buttons in the old page that create life in the Hive. No
   routes exist for them. Before they are built, the founder must say
   who may use them — him alone, Kai El, Nanuet — and whether agent
   creation is a founder-gated act like money and publishing.
4. **Whose memory is the vault?** The memory vault (`./memory/`) is a
   generated wiki — a snapshot made by `scripts/generate_memory_vault.py`.
   The Worker's memory lives in D1 (Nanuet's brain, Kai's brain). Is the
   vault the Hive's memory browser, or just a snapshot of it? Does the
   generator still run, and who regenerates it — or should the vault be
   rebuilt to read the Worker's memory directly?
5. **Are the ventures' numbers supposed to reach the Hive?** TheCopy's
   lead and client counts live only in its own browser-local CRM, so the
   VENTURES tab honestly shows "unverified". Is that acceptable — the
   portfolio lists businesses without live numbers — or should each
   venture report its numbers to the Hive?
6. **Does each colony still get a console?** The old page assumed every
   colony has a live console you can zoom into with an iframe. Colonies
   are repos, not running services — they have no HTTP origin. Does the
   founder still want per-colony consoles (which would mean running
   something per colony), or is health + repo link enough?
7. **Should the Center always open?** The old page always opened, even
   with no backend — it fell back to a simulation. The live app shows
   OFFLINE. The simulation is fake data, which the Hive does not do —
   but "always opens" is a real resilience goal. Is honest OFFLINE the
   right behaviour, or does the founder want a read-only mode that opens
   with the last known good data?
8. **Does Kai El need a face that speaks?** The Cortana head is the most
   distinctive visual in the old page — a presence that talks back.
   KaiSigil is a sigil, not a face. Is the speaking head part of the
   vision, or was it decoration for a demo?
9. **What is the HITL flow?** The SSE feed's event types include
   `hitl_request` and `hitl_resolved` — human-in-the-loop approval. The
   Hive has proposal approval (the founder decides), but no route named
   HITL exists and no UI surface shows a pending human decision. Is
   there a human-in-the-loop approval flow the founder expects, and
   where does it live?
10. **Is Sentry wanted at all?** The page admits error tracking was never
    wired (no SDK, no DSN). The React app calls `initSentry()` as a
    gated no-op. Error tracking is either a real requirement — in which
    case it needs a DSN and a decision — or it was never wanted, in which
    case the comment and the no-op call are dead weight.

---

## §5 — Retire vs rewire, on the purpose

Not a decision — a statement of what each option would mean for the
purposes in §2.

### If retired

The page goes into storage with the biosystem treatment — archived, not
deleted (the founder's rule: nothing set aside just because it is dead).
What goes into storage with it:

- **The purposes that already live in the React app** (rows 6, 7, 9,
  11, 13 in part, 14 in part, 15, 16, 17 in part, 18 in part, 19 in
  part, 21 in part) are unaffected — they already have a home, and
  retiring the page changes nothing for them.
- **The purposes with no live home** (rows 2, 4, 5, 8, 10, 11 in part,
  13 in part, 14 in part, 20, 21 in part, 23, 24, 17/22 in part) go into
  storage WITH the page — but they live on in this purpose map, which is
  the record. They are parked purposes, not deleted ones. The missing
  list in §3 is the work that remains, and it is work for the React app,
  not for a dead page.
- **The Jasper-only concepts** (rows 3, 12, and the simulation/wake-loop
  in row 1) go into storage and stay there — they are dropped, by the
  same reasoning the biosystem blueprint already applied.
- The page's one genuinely distinctive idea — the world as a place you
  operate in (rows 5, 8) — would be stored, not built, until the founder
  answers §4 question 2. That is the real cost of retiring: the most
  ambitious purpose waits for a decision, and the decision is about the
  vision, not about the file.

### If rewired

A rewire of this page is a rebuild, not a port — and the page itself
proves it. Twelve of its calls go to routes that do not exist, and three
of those are concepts that do not come back. A localhost-string swap
leaves a page that loads and then 404s on half its panels. A real rewire
means:

- **Rebuilt:** the world map (rows 5, 8), the speaking head (row 2),
  the memory vault browser (row 20), the full diagnostic (row 21), the
  live event feed (rows 23, 24) — plus the six new endpoints named in
  §2 (rows 10, 13, 14, 15), each needing its own founder yes.
- **Already covered by the live app, so a rewire would duplicate it:**
  commune, agents, arena, governance, LLM, tasks-read, SOUL-watch,
  colonies, endpoint testing (rows 6, 7, 9, 11, 13–17, 21). Rebuilding
  those into a second Command Center makes two wholes.
- **The honest question a rewire raises:** if the React app is the one
  cohesive whole the doctrine describes, why would the Hive have two
  Command Centers? The missing purposes in §3 belong in the React app —
  that is what "the frontend absorbs the capabilities" means. Retiring
  this page and building the missing purposes into the React app IS the
  one-cohesive-whole path. Rewiring the page is the two-wholes path, and
  it should only be chosen if the founder wants a second, separate
  operating surface — which is the opposite of what the vision doc says.

### The one-line version

Retire the page, keep the purposes: the covered ones already live in
`/app/`, the missing ones (§3) are the work, and the world-as-place
(§4, question 2) is the decision that gates the biggest of them. A rewire
builds a second Command Center; the doctrine says there is one.

---

## Sources and verification notes

- `docs/command-center.html` — read in full (1,407 lines). Boot:
  `detectBackend()` (lines ~1–180); Three.js Cortana head (~180–400);
  frequency bar and HUD (~400–520); Phaser world, 15 zones (~520–760);
  React HUD, 14 tabs (~760–1150); command bar, WebSocket, SSE, auth
  (~1150–1407). DemoHive simulation backend in the same file.
- `docs/index.html` — root meta-refreshes to `/app/`; links "Legacy ·
  SOUL REALM" → `./command-center.html`; comment: the legacy Command
  Center "is preserved and still reachable".
- `docs/FOUNDERS_VISION.md` — frontend-absorption doctrine; the
  TownHall-board operating map.
- `~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` — the page's
  §2 route table (15 live / 6 dead call targets for this page) and §3
  tab table (the React app's 13 tabs + kai-os overlays).
- Worker routes verified by grep against `worker/src/index.js` (clone,
  main `7af242d`): `/health`, `/auth/token` (:3158), `/agents`,
  `/grading/leaderboard`, `/wallet/leaderboard/soul`, `/tasks` GET-only
  (:3342), `/governance/log`, `/llm/status`, `/arena/challenges` (:4775),
  `/arena/fallen` (:4780), `/arena/challenge` POST (:4785),
  `/arena/resolve/{id}` POST (:4795), `/arena/project/{id}` POST (:4806),
  `/arena/projection/{id}/frames` GET (:4825), `/command_text`,
  `/debug/health`, `/debug/env`, `/debug/git`, `/debug/logs`,
  `/debug/colony-ping`, `/debug/endpoints`, `/ml/status`,
  `/browser/status`, `/knowledge/status`, `/colony/health` (:3155),
  `/colony/reports` (:4670), `/ws` (:3149), `/memory/status`,
  `/health/subsystems`, `/pulse`, `/nanuet/brain`, `/kai/brain`. Missing
  (no handler found): `/design_agent`, `/spawn_agent`,
  `/agents/reproduce`, `/frequency/*`, `/wallet/tip`,
  `/constitution/soul_md`, `/events/stream`, `/hive/status`,
  `/colony/capabilities`, `POST /tasks`.
- React app: `frontend/src/components/kai-os/` — KaiCommune.tsx (same
  `/command_text` logic), ColonyZoomPanel.tsx (rewired in PR #228),
  VenturePlanner.tsx (calls `/v11`), CenterGraph.tsx (GraphNode,
  renders a graph), BottomActivityFeed.tsx (renders from polled
  useHiveData — no WS/SSE subscription verified), KaiSigil.tsx,
  TopStatusBar.tsx, BiosystemOverlay.tsx, ProposalsPanel.tsx.
- `docs/memory/_index.md` and `docs/memory/_graph.json` exist — the
  page's two relative fetches resolve. `scripts/generate_memory_vault.py`
  is the vault generator (run state unverified).
- Related record: `~/workspace/hive-batches/BIOSYSTEM_REVERSE_ENGINEERING_BLUEPRINT.md`
  (the biosystem page's purpose map — same treatment, same format).
  The biosystem half of legacy-pages Q2 is decided (retire — B0, PR
  #229, open for the founder's merge). The command-center half is open
  under Q2, awaiting the founder's answer with this map in hand.
