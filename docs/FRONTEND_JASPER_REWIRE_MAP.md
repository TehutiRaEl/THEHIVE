# Frontend ↔ Jasper Rewire Map — Command Center UI to the Live Worker

**Status:** PLANNING ONLY. Read-only audit + plan. Nothing in this file edits,
builds, deploys, merges, or flips anything. Implementation is a **separate
founder decision** — see §8. No repo file was changed to produce this map; no
live system was touched.

**Scope:** the Hive's front end (the Command Center / Kai EL OS React app in
`frontend/`) still points at the dead Jasper backend (System A, a FastAPI
backend that ran on `localhost:8080` and runs nowhere now) instead of the live
Cloudflare Worker (System B, `https://thehive.sovereignhive.workers.dev`,
`/v11` API). This map lists every tab, what it calls, what it should call,
the rewire steps in order, and troubleshooting for each step.

**Sources read (main `7af242d`, the durable clone at
`~/workspace/hive-audit/THEHIVE`):**
- `frontend/src/` (App, pages/KaiElOS, command-center tabs, kai-os panels,
  hooks, services, utils/constants.ts, stores, data)
- `worker/src/index.js` (full route table, `p ===` + `p.match` handlers)
- `wrangler.jsonc`, `docs/app/`, `frontend/dist/`, `docs/command-center.html`,
  `docs/biosystem.html`, `docs/index.html`, `.github/workflows/pages.yml`
- `frontend/vite.config.ts`, `frontend/package.json`

**Note on main tip:** main has since moved to `b4ebd6d8` via PR #224, which was
docs-only, so every frontend file read here is current. The only file that
could go stale is this map itself if `frontend/src/` changes after it.

**How to read the verdicts:** LIVE = the call resolves same-origin to a
Worker route that exists and answers. DEAD = the call targets a localhost
backend that runs nowhere, or a Worker path with no handler (HTTP 404).
DISPLAY-ONLY = renders local/static data or props, makes no network call.
UNCALLED = a function exists in the bundle but no mounted component calls it.

---

## §1 — Which frontend is live

**Live: `docs/app/` — the React app, served at
`https://thehive.sovereignhive.workers.dev/app/`.**

- The Worker serves `docs/` as static assets (`wrangler.jsonc`: `assets:
  { directory: "docs", binding: "ASSETS" }`). The platform's asset matcher
  serves real files first; only client-routed deep links fall through to the
  Worker, which rewrites any `GET /app/*` to `/app/index.html`
  (`worker/src/index.js:4885–4886`).
- `docs/app/index.html` is the `build:app` output (`base: /app/`, outDir
  `../docs/app`), built from `frontend/src/` at commit `c1e4c55`
  (2026-09-24, "Rebuild docs/app from frontend/"). **Zero `frontend/src/`
  changes have landed since that rebuild** (verified: `git log
  c1e4c55..HEAD -- frontend/src/` is empty), so the live build is current
  with main `7af242d`.
- `.github/workflows/pages.yml` rebuilds `docs/app/` automatically on every
  push that touches `frontend/` (`npm run build:app`, commits only if the
  build changed). The live build cannot silently drift from source while
  this workflow runs.
- `docs/index.html` (root `/`) is a redirect page: meta-refresh `0` to
  `/app/`, title "Kai EL OS · Sovereign Hive". It also links the legacy page
  (`./command-center.html`, "Legacy · SOUL REALM") — see §4.3.
- `frontend/dist/` is a **stale July build** (last commit `2ac9036`,
  2026-07-13; different asset hashes, includes Sentry/vendor/d3/socket
  chunks the live build does not have). It is **not served anywhere** — the
  Worker serves `docs/`, not `frontend/dist/`. It is a dead artifact in the
  repo, not a second live frontend.

**What "running live" means, then:** the app at `/app/` already runs, and
most of its data calls already resolve same-origin to the Worker (see §3).
The Jasper problem is not "the app doesn't load" — it is three live-mounted
dead interfaces (§4: the colony drill-down, the legacy static pages) plus
stale labels and dead code inside an otherwise live app.

---

## §2 — The Worker route table (authoritative, main `7af242d`)

All paths below are under the `/v11` prefix (`p` is the path after stripping
`/v11`). Handlers without a method note serve any method (no method guard in
the code); handlers marked GET/POST enforce it.

| Route | Method | Notes |
|---|---|---|
| `/health`, `/colony/health` | — | liveness + version |
| `/auth/token` | — | issues a visitor token (any method) |
| `/agents` | — | agent roster |
| `/grading/leaderboard` | — | Elo board |
| `/wallet/leaderboard/soul` | — | soul board |
| `/roadmap` | — | roadmap |
| `/roadmap/development` | GET, POST | dev roadmap (GET used by UI) |
| `/founder/roadmap/development` | POST | founder write |
| `/founder/nanuet/route` | POST | Access-gated directive route (QB-8) |
| `/nanuet/route` | POST | FOUNDER_KEY directive route (QB-8) |
| `/founder/whoami` | GET | Access session check |
| `/founder/login` | GET | Access login trigger (link) |
| `/tasks` | — | task queue |
| `/governance/log` | — | governance events |
| `/updates` | — | hive updates |
| `/townhall` | GET, POST | TownHall |
| `/proposals` | GET, POST | proposals list / file |
| `/proposals/action-request` | POST | action-request filing |
| `/proposals/:id/decide` | POST | FOUNDER_KEY-gated decide |
| `/founder/proposals/:id/decide` | POST | Access-gated decide |
| `/proposals/:id/actioned` | POST | mark work done |
| `/proposals/:id/diff-check` | POST | diff applicability |
| `/ventures/gaps` | GET, POST | venture gaps |
| `/ventures/gaps/:id/decide` | POST | gap decide |
| `/ventures/gaps/:id/issue-linked` | POST | gap ↔ issue link |
| `/ventures/sandbox-runs` | GET, POST | sandbox runs |
| `/ventures/sandbox-runs/:id/opened` | POST | run opened |
| `/ventures/sandbox-runs/:id/decide` | POST | run decide |
| `/venture/plan` | POST | venture plan drafting (LLM) |
| `/legal/research` | POST | legal research (LLM) |
| `/automaton/infer` | POST | automaton inference |
| `/llm/status` | — | provider roster + health |
| `/jobs` | GET | async LLM jobs |
| `/command_text` | POST | Commune with Kai El (**unauthenticated**) |
| `/files` | GET | R2 file list |
| `/files/upload` | POST | R2 upload (visitor-token gated) |
| `/files/get` | GET | R2 download link |
| `/pulse` | — | heartbeat trail |
| `/memory/search` | — | vector memory search |
| `/memory/remember` | POST | store a memory |
| `/memory/status` | — | Vectorize/AI binding status |
| `/kai/brain` | — | Kai El brain status |
| `/kai/autonomy` | — | Kai El autonomy stages |
| `/nanuet/brain` | — | Nanuet brain status |
| `/nanuet/autonomy` | — | Nanuet autonomy stages + switches |
| `/tier3/status` | — | Tier-3 engine status |
| `/debug/health`, `/debug/env`, `/debug/git`, `/debug/logs` | — | debug surfaces |
| `/debug/colony-ping`, `/colony/ping` | — | colony roster, CI-checked status |
| `/debug/ws-broadcast-test` | POST | push a test broadcast |
| `/debug/endpoints`, `/routes` | — | route listing (partial — see §5.2) |
| `/colony/report` | POST | colony report intake |
| `/colony/reports` | GET | colony reports |
| `/hive/task-digest` | GET, POST | task digest |
| `/council/consult` | POST | elder consult (Ma'at/Solomon/Sekhmet) |
| `/ml/status`, `/browser/status`, `/knowledge/status` | — | subsystem status |
| `/arena/challenges` | — | arena challenges |
| `/arena/fallen` | — | hall of fallen ideas |
| `/arena/challenge` | POST | create a challenge |
| `/arena/resolve/:id` | POST | resolve a challenge |
| `/arena/project/:id` | POST | run a projection |
| `/arena/projection/:id/frames` | GET | projection frames |
| `/admin/d1-export` | GET | D1 export (WORKER_ADMIN_KEY) |
| `/admin/grok-token` | POST | store Grok bridge token |
| `/bridge/grok-token` | GET | retrieve GitHub PAT via Grok key |
| `/ws` | — | WebSocket → CommandCenterDO (real-time push) |
| `/app/*` | GET | SPA shell rewrite to `/app/index.html` |

**Cyborg-lens note on the route table:** the Worker is the system the
frontend must interface with, and it is legible — every route above is a
real read/write channel. The frontend's job is to use the channels that
exist and stop calling the ones that don't.

---

## §3 — Tab-by-tab map

**Base URL rule (the whole map turns on this):**
`frontend/src/utils/constants.ts:16` —
`API_BASE_URL = VITE_API_BASE_URL || (DEV ? 'http://localhost:8080' : '')`.
`vite.config.ts` defines `VITE_API_BASE_URL` as `''` unless the env var is
set. So in the **production build, `API_BASE_URL` is `''` and every
`${API_BASE_URL}/v11/...` call resolves same-origin to the Worker — LIVE**.
In **dev (`npm run dev`), it is `http://localhost:8080` — DEAD** (Jasper's
port, runs nowhere). Every `V11 = ${API_BASE_URL}/v11` in the kai-os panels
and `useHiveData` inherits this rule. That is the single most important fact
in this map: the app is live in prod and dead in dev, by the same line.

### 3.1 The 13 tabs (TAB_DEFS, `frontend/src/utils/constants.ts:25`)

| Tab | File | Fetches | Base | Verdict |
|---|---|---|---|---|
| HIVE | `tabs/HIVE.tsx` | `useHiveData` slices: health, agents, challenges, pulse, memoryBound, online | same-origin `/v11` | **LIVE** |
| DREAM | `tabs/DREAM.tsx` | `useHiveData`: challenges, developmentRoadmap, fallen, online | same-origin `/v11` | **LIVE** |
| ARCANE | `tabs/ARCANE.tsx` | `useHiveData`: llm, aiBound, memoryBound, pulse, tier3, online | same-origin `/v11` | **LIVE** |
| WORLD | `tabs/WORLD.tsx` | `useHiveData`: agents, challenges, pulse, tasks, online + `ColonyGrid` (`useColonyPing` → `GET /v11/debug/colony-ping`) + `ColonyZoomPanel` (see below) | same-origin `/v11`, **except the zoom panel** | **LIVE, except the drill-down is DEAD** |
| SOUL | `tabs/SOUL.tsx` | `useHiveData`: roadmap, soulBoard, online + `useConstitutionStore` (local, no fetch) + hardcoded law list in the tab | same-origin `/v11` | **LIVE** (law text is static, not fetched) |
| GOVERN | `tabs/GOVERN.tsx` | `useHiveData`: governance, memoryBound, online | same-origin `/v11` | **LIVE** |
| MISSIONS | `tabs/MISSIONS.tsx` | `getTasks()` (`services/api.ts`) → `GET /v11/tasks` | same-origin `/v11` | **LIVE** |
| API | `tabs/API.tsx` | Tester: user-picks from 14 listed endpoints, all served (see §3.3). Docs cards: `GET /v11/feed` (SSE) **does not exist**; "Base URL: http://localhost:8000" is a stale label | same-origin `/v11` | **LIVE as a tester; two stale DISPLAY items** |
| 4D | `tabs/4D.tsx` | None — `TesseractRenderer` computes 4D→3D locally, no fetch | — | **DISPLAY-ONLY** |
| ARENA | `tabs/ARENA.tsx` | `useHiveData`: agents, challenges, online + `LiveArenaViewer` → `GET /v11/arena/projection/:id/frames` + `PlannedControl` disabled buttons | same-origin `/v11` | **LIVE** (frames exist only after a projection runs; nothing in the UI runs one — see §5.2) |
| WOW | `tabs/WOW.tsx` | `useHiveData`: agents, online | same-origin `/v11` | **LIVE** |
| NMS | `tabs/NO_MANS_SKY.tsx` | None — `PhaserScene` is a local game; all controls are `PlannedControl` (disabled, "not yet wired") | — | **DISPLAY-ONLY** |
| SETTINGS | `tabs/SETTINGS.tsx` | None — local state + `localStorage`, `useUIStore` notifications | — | **DISPLAY-ONLY** (stale labels: "API Base: http://localhost:8000", "Mode: Development", "Build: 2026-07-10", "Branch: mistral/frontend-command-center") |

Every tab also mounts `KaiChatBox` (minimized pill) → `POST /v11/command_text`
— **LIVE, unauthenticated**. That path is Queen work, not rewire work (§7).

### 3.2 The Kai EL OS shell (`frontend/src/pages/KaiElOS.tsx`) and kai-os panels

The shell itself calls `useHiveData()` (16 endpoints, §3.4) and
`useCommandCenterSocket()` (`/v11/ws` → CommandCenterDO, **LIVE**).

| Panel / surface | File | Fetches | Verdict |
|---|---|---|---|
| TopStatusBar | `kai-os/TopStatusBar.tsx` | `GET /v11/health` (latency probe, 30 s) + `hive` prop | **LIVE** |
| LeftNav | `kai-os/LeftNav.tsx` | None (nav only). `connectors` + `training` marked `wired:false` ("soon") | **DISPLAY-ONLY** (2 unwired items). Note: `swarms` is `wired:true` but has no panel in KaiElOS — clicking it falls through to the center graph (a no-op nav item). |
| CenterGraph | `kai-os/CenterGraph.tsx` | None — reads `hive` prop | **DISPLAY-ONLY** |
| Observatory | `kai-os/Observatory.tsx` | None — fullscreen `CenterGraph` wrapper | **DISPLAY-ONLY** |
| KaiCommune | `kai-os/KaiCommune.tsx` | `POST /v11/command_text` + `useHiveData` `debugEnv` (founder-bound label) | **LIVE, unauthenticated** — Queen work (§7) |
| HiveTerminal | `kai-os/HiveTerminal.tsx` | None — reads `hive.pulse` prop; footer says "read-only activity feed — not a shell" | **DISPLAY-ONLY** (the real terminal is Q-C Queen work, §7) |
| BottomActivityFeed | `kai-os/BottomActivityFeed.tsx` | None — reads `hive` prop (tasks/challenges/governance/pulse) | **DISPLAY-ONLY** |
| ConnectedModels | `kai-os/ConnectedModels.tsx` | None — reads `hive.llm.roster` prop, static FALLBACK otherwise | **DISPLAY-ONLY** |
| DreamLogs | `kai-os/DreamLogs.tsx` | None — reads `hive.pulse` (heartbeat entries) | **DISPLAY-ONLY** |
| HiveUpdates | `kai-os/HiveUpdates.tsx` | None — reads `hive.updates` prop | **DISPLAY-ONLY** |
| ProposalsPanel | `kai-os/ProposalsPanel.tsx` | `GET /v11/proposals`, `GET /v11/founder/whoami`, `POST /v11/founder/proposals/:id/decide` (Access, tried first), `POST /v11/proposals/:id/decide` (FOUNDER_KEY fallback), link `GET /v11/founder/login` | **LIVE** (decide fails closed without Access session or key — by design) |
| BodyLineagePanel | `kai-os/BodyLineagePanel.tsx` | None — static planning text | **DISPLAY-ONLY** |
| LegalLearning | `kai-os/LegalLearning.tsx` | `POST /v11/legal/research` + static curated external links | **LIVE** |
| VenturePlanner | `kai-os/VenturePlanner.tsx` | `POST /v11/venture/plan`, `POST /v11/proposals` (submit as proposal) | **LIVE** |
| ConstitutionViewer | `kai-os/ConstitutionViewer.tsx` | `GET /GOVERNANCE.md` (same-origin static doc) | **LIVE** (static file fetch, not an API call) |
| FilesPanel | `kai-os/FilesPanel.tsx` | `GET /v11/files`, `GET /v11/auth/token`, `POST /v11/files/upload`, link `GET /v11/files/get?key=…` | **LIVE** (R2 bucket activated 2026-08-03; panel checks `available` at runtime) |
| RoadmapPanel | `kai-os/RoadmapPanel.tsx` | `useHiveData` `developmentRoadmap` (`GET /v11/roadmap/development`) + static `data/roadmapData.ts` (completed phases, federation table) | **LIVE** |
| GrokBridgePanel | `kai-os/GrokBridgePanel.tsx` | `GET /v11/bridge/grok-token` + `POST api.github.com/.../dispatches` + `GET api.github.com/.../actions/workflows/grok-bridge.yml/runs` | **LIVE** (Worker + GitHub API; needs a Grok bridge key entered in the panel) |
| BiosystemOverlay | `kai-os/BiosystemOverlay.tsx` | Live tab: `GET /v11/llm/status`, `GET /v11/agents`, `GET /v11/proposals`. Legacy tab: iframe `/biosystem.html` | **LIVE tab; legacy tab is DEAD** (§4.3) |
| GatewayConsoleOverlay | `kai-os/GatewayConsoleOverlay.tsx` | iframe `/gateway-console.html` (same-origin static doc, exists in `docs/`) | **LIVE** (the framed page itself makes its own keyless calls; out of this map's scope) |
| CampaignOverlay | `kai-os/CampaignOverlay.tsx` | iframe `/campaign.html` (generated by `sync-planning-docs.yml`, exists in `docs/`) | **LIVE** |
| FullPlanOverlay | `kai-os/FullPlanOverlay.tsx` | iframe `/full-plan.html` (generated by `sync-planning-docs.yml`, exists in `docs/`) | **LIVE** |
| WorkflowsDrawer | `kai-os/WorkflowsDrawer.tsx` | None — static list (Coding/Research/Automation "wired", 5 more "soon") | **DISPLAY-ONLY** |
| KaiElOS inline panels | `pages/KaiElOS.tsx` | `skills` (static text + `hive.agents.length`), `ml-status` (reads `hive.llm`/`aiBound`/`memoryBound`), `connectors` ("Not yet connected — planned"), `training` ("Not yet built — planned") | **DISPLAY-ONLY** |

### 3.3 The API tab's endpoint list (already corrected in source)

`tabs/API.tsx` lists 14 endpoints, all served by the Worker: `GET /v11/health`,
`/v11/agents`, `/v11/arena/challenges`, `/v11/arena/fallen`, `/v11/pulse`,
`/v11/governance/log`, `/v11/grading/leaderboard`, `/v11/wallet/leaderboard/soul`,
`/v11/tasks`, `/v11/memory/status`, `/v11/llm/status`, `/v11/tier3/status`,
`POST /v11/command_text`, `POST /v11/auth/token`. (The Worker's `/auth/token`
handler has no method guard, so both the tab's POST and FilesPanel's GET work.)
Its comment records the previous list advertised Jasper-only endpoints
(`/hive/status`, `/genesis/missions`, `/memory/graph`, `/feed`) that 404 in
production — that fix is already in the source; only the two docs-card labels
remain (§4.2).

### 3.4 Hooks and services

| File | Calls | Verdict |
|---|---|---|
| `hooks/useHiveData.ts` | 16 GETs, polled every 30 s: `/health`, `/agents`, `/arena/challenges`, `/pulse`, `/governance/log`, `/wallet/leaderboard/soul`, `/memory/status`, `/grading/leaderboard`, `/tasks`, `/arena/fallen`, `/llm/status`, `/tier3/status`, `/updates`, `/roadmap`, `/roadmap/development`, `/debug/env`. Any failure leaves that slice empty and sets `online=false` — graceful degradation, no crash. | **LIVE** (prod) / **DEAD** (dev, localhost:8080) |
| `hooks/useColonyPing.ts` | `GET /v11/debug/colony-ping` (60 s poll). Surfaces the route's own "checked-in-ci" status honestly. | **LIVE** |
| `hooks/useCommandCenterSocket.ts` | WebSocket `${API_BASE_URL \|\| origin}` → `/v11/ws`. One shared, reference-counted socket; reconnects with backoff; a missed push self-heals on the next `useHiveData` poll. | **LIVE** (prod) / **DEAD** (dev) |
| `services/api.ts` | 30 functions. **LIVE and called:** `getTasks` → `GET /v11/tasks` (MISSIONS tab). **LIVE but uncalled:** `getHealth`, `getAgents`, `getArenaChallenges`, `getArenaFallen`, `createChallenge`, `resolveChallenge`, `projectArena`, `getArenaFrames`, `getGovernanceLog`, `getSoulLeaderboard`, `getGradingLeaderboard`, `getLLMStatus`, `getTier3Status`, `getToken`. **DEAD (no Worker handler) and uncalled:** `getHiveStatus` → `/hive/status`; `reproduceAgent` → `POST /agents/reproduce`; `getGovernanceStatus` → `/governance/status`; `submitVote` → `POST /governance/vote`; `getGaps` → `/genesis/gaps`; `getMissions`, `getMission`, `proposeMission`, `activateMission`, `updateMissionStatus` → `/genesis/missions*`; `getConstitution`, `getConstitutionLaws`, `getConstitutionHistory` → `/constitution*`; `getMemoryGraph` → `/memory/graph`; `getTesseractProject` → `/tesseract/project`; `getDreamStatus` → `/dream/status`. | **Mixed: 1 live call, 14 live-but-uncalled, 16 dead paths** (see §5.1) |
| `services/github.ts` | `fetchGrokToken` → `GET /v11/bridge/grok-token` (same-origin); `sendGrokBridgeDispatch` → `POST api.github.com/.../dispatches`; `findGrokBridgeRun` → `GET api.github.com/.../actions/workflows/grok-bridge.yml/runs` | **LIVE** (sole caller: GrokBridgePanel) |
| `services/sentry.ts` | No-op without `VITE_SENTRY_DSN` | **DISPLAY-ONLY** (no call) |

**Count (mounted React app, prod): 56 live call targets covering 32 distinct
Worker routes** (16 useHiveData + 1 colony-ping + 1 ws + 1 TopStatusBar health +
1 KaiCommune + 1 KaiChatBox + 3 Biosystem + 4 FilesPanel + 5 ProposalsPanel +
2 VenturePlanner + 1 LegalLearning + 1 LiveArenaViewer + 14 API-tab list +
3 GrokBridgePanel + 1 GOVERNANCE.md + 1 MISSIONS getTasks).
**Dead from mounted code: 3 interfaces** (§4). **Display-only surfaces: ~17**
(§3.1–3.2 tables).

---

## §4 — Every localhost / Jasper reference

### 4.1 Live code — the dead interface (this is the core of the problem)

| # | File:line | Reference | What it does | Verdict |
|---|---|---|---|---|
| 1 | `frontend/src/utils/constants.ts:4` | `THEHIVE: 'http://localhost:8080'` | Colony base URL for THEHIVE (Jasper's old port) | **DEAD** — used only by `ColonyZoomPanel` |
| 2 | `constants.ts:5` | `NAR2: 'http://localhost:8000'` | Colony base URL for NAR2 | **DEAD** — same |
| 3 | `constants.ts:6` | `'4DBRAIN': 'http://localhost:8001'` | Colony base URL for 4DBRAIN | **DEAD** — same |
| 4 | `constants.ts:7` | `aether: 'http://localhost:3000'` | Colony base URL for aether | **DEAD** — same |
| 5 | `constants.ts:8` | `automatisch: 'http://localhost:3001'` | Colony base URL for automatisch | **DEAD** — same |
| 6 | `constants.ts:9` | `'Kimi-K2': 'http://localhost:8002'` | Colony base URL for Kimi-K2 | **DEAD** — same |
| 7 | `constants.ts:10` | `LocalAGI: 'http://localhost:8081'` | Colony base URL for LocalAGI | **DEAD** — same |
| 8 | `constants.ts:16` | `API_BASE_URL` dev fallback `'http://localhost:8080'` | In dev, every `/v11` call goes to Jasper's port | **DEAD in dev; harmless in prod** (prod is `''`) |
| 9 | `constants.ts:17` | `WS_URL = … \|\| 'ws://localhost:8080'` | Dead export — **nothing imports `WS_URL`** (only declared here + in `vite-env.d.ts`) | **DEAD code** |
| 10 | `frontend/src/components/ColonyZoomPanel.tsx:38,40` | `fetch(${base}/colony/capabilities)` → fallback `fetch(${base}/colony/health)` | WORLD tab drill-down: fetches capabilities/health from the colony's own base URL | **DEAD** — `base` is always a localhost URL in prod; the fetch fails and the panel shows "offline" |
| 11 | `ColonyZoomPanel.tsx:59-60` | `consoleUrl = ${base}/colony-console` (iframe) | Embeds the colony's console in an iframe | **DEAD** — localhost iframe, never loads |
| 12 | `frontend/vite.config.ts:31,35` | Dev proxy `/api → http://localhost:8000`, `/ws → ws://localhost:8000` | Dev-server proxy to Jasper-era ports | **DEAD config** — nothing in `src/` calls `/api` or `/ws` (the socket uses `/v11/ws`) |
| 13 | `vite.config.ts:74` | `VITE_ARENA_WS_URL` default `'ws://localhost:3001'` | Feeds the unused `WS_URL` export | **DEAD** (see #9) |

Note the shape of the problem: the **word** "Jasper" barely appears in the
live app at all. The Jasper problem is the **localhost map** — seven colony
URLs plus a dev fallback — not a name.

### 4.2 Stale labels (display-only, no call — but they lie to the founder)

| # | File:line | Text | Truth |
|---|---|---|---|
| 14 | `tabs/API.tsx:228` | "http://localhost:8000 (configurable via VITE_API_BASE_URL)" | Base URL in prod is same-origin (`''`), not localhost:8000 (which is NAR2's old port, not even Jasper's 8080) |
| 15 | `tabs/API.tsx` docs card | "GET /v11/feed (SSE, no auth required)" | **No `/v11/feed` route exists in the Worker** (0 mentions). The label advertises a feed that was never built. |
| 16 | `tabs/SETTINGS.tsx:205` | "API Base: http://localhost:8000" | Same as #14 — hardcoded stale string |
| 17 | `tabs/SETTINGS.tsx` | "Mode: Development", "Build: 2026-07-10", "Branch: mistral/frontend-command-center" | Hardcoded July values in a September build; the deployed build is main, not a Mistral branch |
| 18 | `kai-os/BiosystemOverlay.tsx:14,113,150` | "Legacy docs/biosystem.html (JASPER-era localhost:8080 demo)", "was JASPER-oriented", "There is no separate JASPER process to start" | Comments + one honest rendered sentence — **correct statements, not dead calls**. Keep the sentence; the legacy tab it describes is the problem (§4.3) |

The built bundle (`docs/app/assets/`) contains the same localhost strings
(from `constants.ts` + the API/SETTINGS labels) — expected, it is compiled
from this source. A post-rewire bundle check is: `grep -r localhost
docs/app/assets/` must return nothing (step 1 verification).

### 4.3 Legacy static pages (live-mounted, Jasper-era, still reachable)

| # | File | What it does | Verdict |
|---|---|---|---|
| 19 | `docs/command-center.html` (1,407 lines) | The old static Command Center. Probes `http://localhost:8080` and `http://localhost:8181` for `/v11/health`; colony consoles at all 7 localhost ports (`:584–591`); `fetch(BACKEND_BASE + '/hive/status')` (`:618`) — **the Worker has no `/hive/status` handler** (see §5.1 note); arena projection frames via `base` (localhost); WebSocket to a localhost-derived URL; colony capabilities/health fetches (`:1366–1368`). Two fetches DO resolve: `./memory/_index.md` and `./memory/_graph.json` (relative, `docs/memory/` exists). | **DEAD** — still reachable: linked from the root page (`docs/index.html:55`, "Legacy · SOUL REALM") |
| 20 | `docs/biosystem.html` (~16,500 lines) | The legacy 72-system atlas. `HiveClient` defaults to `http://localhost:8080` (`:4295`, duplicated `:12967`); fetches `/v10/health` (`:4307`) — **v10 never existed on the Worker**; instantiated with localhost at `:7909`/`:16581`. | **DEAD** — still reachable: BiosystemOverlay's "Legacy atlas" tab iframes it |
| 21 | `frontend/src/worlds/MultiplayerManager.ts:134` | `new WebSocket(signalingServer)` — multiplayer signalling | **DEAD code** — zero importers; never mounted |
| 22 | `frontend/src/components/ConstitutionVisualizer.tsx`, `MemoryGraphEnhanced.tsx`, `MissionTimeline.tsx` | Call the dead `services/api.ts` functions (`getConstitutionLaws/History`, `getMemoryGraph`, `getMissions`) | **DEAD code** — zero importers; never mounted (MissionTimeline appears only as a string in MISSIONS.tsx:110) |

---

## §5 — The gaps

### 5.1 Frontend calls with no Worker endpoint (NEW WORK — name only, no code designed)

| # | Caller | Missing endpoint | What it must return | Status |
|---|---|---|---|---|
| G1 | `ColonyZoomPanel` | `GET /v11/colony/capabilities` (or per-colony) | The capability record for one colony (what it can do, its health, its console URL) — the data the panel currently tries to fetch from each colony's own localhost base | **NEW WORK, only if the founder wants the capabilities section live.** Alternative (no new endpoint): rewire the panel to the existing `GET /v11/debug/colony-ping` roster and drop the capabilities section. |
| G2 | `ConstitutionVisualizer` (unmounted) / SOUL tab's hardcoded laws | `GET /v11/constitution` | The live constitution text (soul.md F-001–F-006) for the UI to render instead of hardcoded strings | **NEW WORK, optional** — nothing mounted calls it today. Only needed if the founder wants the constitution surface live. |
| G3 | API tab docs card (label only, not a call) | `GET /v11/feed` (SSE) | A live server-sent-events feed of hive activity | **NEW WORK, optional** — only if the founder wants a real event feed. Otherwise delete the label. |

**The honest headline:** the mounted app needs **at most one** new endpoint
(G1), and even that has a no-new-code alternative. Everything else the
mounted app calls already exists. The dead `services/api.ts` paths
(`/genesis/*`, `/constitution/*`, `/memory/graph`, `/tesseract/project`,
`/dream/status`, `/governance/status`, `/governance/vote`, `/hive/status`,
`/agents/reproduce`) are **dead code, not missing endpoints** — no mounted
component calls them, so building Worker routes for them would be building
for nobody.

**One false claim in the Worker's own code, found during this audit:**
`worker/src/index.js:834` says "`/v11/hive/status` already returns all colony
URLs with health". **It does not** — there is no `/hive/status` handler
(`p === '/hive/status'` appears nowhere; the only match is that comment).
`services/api.ts:getHiveStatus` would 404. The comment is stale and should be
corrected when the rewire lands (a comment fix, not a behaviour change).

### 5.2 Worker endpoints no tab uses (not gaps — future surfaces, do not build now)

- **Queen/Kai state:** `GET /nanuet/brain`, `/nanuet/autonomy`, `/kai/brain`,
  `/kai/autonomy` — nothing in the UI reads the Queen's or Kai El's brain or
  autonomy state. A Queen status surface is a future Queen step, not this
  rewire.
- **Directives:** `POST /founder/nanuet/route`, `POST /nanuet/route` — QB-8
  routes; no UI caller by design (founder-key flow, not a button).
- **Writes with no UI:** `POST /roadmap/development`, `POST
  /founder/roadmap/development`, `POST /proposals/:id/actioned`,
  `POST /proposals/:id/diff-check`.
- **Whole features with no UI:** `GET/POST /townhall`, `POST
  /council/consult`, `POST /automaton/infer`, `GET /jobs`, `POST
  /memory/search`, `POST /memory/remember`, `GET/POST /ventures/gaps` (+
  decide/issue-linked), `GET/POST /ventures/sandbox-runs` (+ opened/decide),
  `POST /colony/report`, `GET /colony/reports`, `GET/POST /hive/task-digest`,
  `GET /debug/health`, `/debug/git`, `/debug/logs`, `GET /ml/status`,
  `/browser/status`, `/knowledge/status`, `POST /arena/challenge`,
  `POST /arena/resolve/:id`, `POST /arena/project/:id`,
  `GET /admin/d1-export`, `POST /admin/grok-token`,
  `POST /debug/ws-broadcast-test`.
- **Consequence for ARENA:** nothing in the UI runs a projection or resolves
  a challenge — `LiveArenaViewer` only *plays back* frames. Frames exist
  because the 30-minute heartbeat resolves challenges and writes
  `arena_projection_frames` (`worker/src/index.js:1075–1077`). If the founder
  wants a "run projection" button, that is a new UI action on an existing
  route (`POST /arena/project/:id`), not a new endpoint.
- **`/debug/endpoints` is a partial listing:** it omits `/proposals`,
  `/nanuet/*`, `/founder/*`, `/files`, `/updates`, `/ventures/*`, and others
  that exist. Do not use it as the route inventory — §2 of this map is.

---

## §6 — The rewire plan (steps in order)

Cyborg-lens framing per step — **interface** (what reads from where),
**channel** (how it connects), **verification** (exact probe, expected
result). No step flips a switch, merges, deploys, or spends anything. Each
step is a source edit; the deploy happens through the existing path
(`pages.yml` rebuilds `docs/app/` on push; the Worker deploys on push to
main). Troubleshooting follows each step.

### Step 1 — Fix the base-URL layer (`frontend/src/utils/constants.ts`, `frontend/vite.config.ts`)

- **Interface:** every `/v11` call in the app reads `API_BASE_URL`; the
  colony drill-down reads `COLONY_BASE_URLS`.
- **Channel:** (a) replace the seven localhost `COLONY_BASE_URLS` values with
  same-origin Worker paths (or `''` where no Worker route exists — see step
  3); (b) change the dev fallback so `npm run dev` points at the live Worker
  via `VITE_API_BASE_URL` instead of `http://localhost:8080`; (c) delete the
  unused `WS_URL` export and its `vite-env.d.ts` entry; (d) remove the dead
  `/api` + `/ws` dev proxy entries from `vite.config.ts` (nothing calls
  them); change the `VITE_ARENA_WS_URL` default away from
  `ws://localhost:3001` or delete the define with `WS_URL`.
- **Verification:** `npm run build:app`, then `grep -r localhost
  docs/app/assets/` returns **nothing**; open `/app/` and confirm the status
  bar reads LIVE with agents listed.
- **Troubleshooting (in order):** (1) if the bundle still contains
  localhost, the string came from a label, not a URL — check API.tsx:228 and
  SETTINGS.tsx:205 (step 4 covers them); (2) if `/app/` reads OFFLINE after
  the change, open `GET /v11/health` directly — if that 200s, the app's base
  is wrong, not the Worker; if it fails, the Worker/deploy is the problem,
  not this step; (3) if `npm run dev` still reads OFFLINE, `VITE_API_BASE_URL`
  is unset in the dev shell — set it to the Worker origin.

### Step 2 — Rewire the colony drill-down (`frontend/src/components/ColonyZoomPanel.tsx`, `tabs/WORLD.tsx`)

- **Interface:** the WORLD tab's zoom panel reads colony capabilities/health
  from the colony's own base URL.
- **Channel:** fetch `GET /v11/debug/colony-ping` (already live, already
  polled by `ColonyGrid`) for the roster + CI-checked status, and
  `/v11/colony/health` same-origin for liveness; drop the `${base}/colony-console`
  iframe (the consoles run nowhere — replace with a link to the colony's GitHub
  repo from `data/colonies.ts`, which already carries `repoUrl`).
- **Verification:** open `/app/`, WORLD tab, click a colony — the panel shows
  the CI-checked status string from `/v11/debug/colony-ping` (e.g.
  "checked-in-ci") instead of "offline"; no localhost request appears in the
  network tab.
- **Troubleshooting:** (1) if the panel still says offline, check
  `/v11/debug/colony-ping` directly — if it 200s with a roster, the panel's
  fetch is wrong; (2) if a colony shows no entry, the roster in the Worker
  (not the panel) is the source of truth — see `worker/src/index.js`
  `/debug/colony-ping` handler; (3) capabilities section empty is expected
  until step 3 is decided.

### Step 3 — Decide the capabilities gap (founder decision, no code yet)

- **Interface:** the panel wants per-colony capabilities; no Worker route
  serves them (G1).
- **Channel:** two options — (a) **new Worker endpoint** `GET
  /v11/colony/capabilities` (NEW WORK: design + build + test + deploy is a
  separate batch, not this rewire); or (b) **drop the capabilities section**
  and let the panel show only what `/v11/debug/colony-ping` already returns.
- **Verification:** the founder picks (a) or (b); if (a), the endpoint is
  verified by `GET /v11/colony/capabilities` returning one colony's record;
  if (b), the panel renders without a capabilities block.
- **Troubleshooting:** do not build (a) speculatively — if no consumer
  besides this panel needs capabilities, (b) is the right call.

### Step 4 — Fix the stale labels (`tabs/API.tsx`, `tabs/SETTINGS.tsx`)

- **Interface:** two docs-card/label strings lie about the backend.
- **Channel:** (a) API tab: delete the "`GET /v11/feed` (SSE)" docs card
  unless G3 is approved; change "Base URL: http://localhost:8000" to
  "Base URL: same-origin (`/v11` on this Worker)"; (b) SETTINGS tab: replace
  the hardcoded System Information card with live values (API Base:
  same-origin; Mode: production; Build: the deployed commit — read from
  `GET /v11/debug/git` if it ever returns a SHA, otherwise omit it rather
  than inventing one; Branch: main).
- **Verification:** open the API and SETTINGS tabs live; no localhost string
  is visible anywhere in either tab.
- **Troubleshooting:** if a label still shows localhost after rebuild,
  the string lives in the built bundle — `grep -r localhost docs/app/assets/`
  names the chunk; trace the chunk back to the source file.

### Step 5 — Quarantine the dead code (propose, do not execute)

- **Interface:** `services/api.ts` (16 dead paths), `ConstitutionVisualizer`,
  `MemoryGraphEnhanced`, `MissionTimeline`, `MultiplayerManager`, `WS_URL`.
- **Channel:** propose deletion in a PR for the founder's merge decision.
  **Deletion is founder-gated** (PERMISSIONS.md Tier 3) — this step is a
  proposal, not an action. The safe interim is a `DEAD_CODE.md` note in the
  repo naming each dead file/function and why, so no one rewires toward it.
- **Verification:** after the founder approves, `npm run build` still passes
  (the dead code has no importers, so deletion cannot break the build) and
  `grep -rn "genesis/\|/constitution\|/memory/graph\|/tesseract\|/dream/status"
  frontend/src/services/api.ts` returns nothing.
- **Troubleshooting:** if the build breaks on deletion, something *did*
  import the "dead" code — the import graph in §3.4 says otherwise, so treat
  a break as a signal to re-audit, not to force it.

### Step 6 — Decide the legacy pages (founder decision, no code yet)

- **Interface:** two live doors into dead pages — the root page's "Legacy ·
  SOUL REALM" link (`docs/index.html:55` → `docs/command-center.html`) and
  BiosystemOverlay's "Legacy atlas" tab (→ `docs/biosystem.html`).
- **Channel:** two options per page — (a) **retire**: remove the link/tab and
  delete (founder-gated) or archive the file; (b) **rewire**: point the page's
  fetches at same-origin `/v11` (a substantial rewrite of 1,407 / ~16,500
  lines — a separate batch, not this rewire). Note `docs/biosystem.html` also
  fetches `/v10/health`, an API version that never existed on the Worker —
  a rewire is not a find-and-replace, it is a rewrite.
- **Verification:** the founder picks retire or rewire per page; if retire,
  the link/tab is gone and the page is unreachable from the live app.
- **Troubleshooting:** do not "fix" these pages by editing the localhost
  strings to the Worker origin — `command-center.html` also calls
  `/hive/status`, which has no Worker handler, and `biosystem.html` calls
  `/v10/*`, which never existed. A string swap leaves a page that loads and
  then 404s on its data calls.

### Step 7 — Document the dev workflow (docs only)

- **Interface:** a developer running `npm run dev` gets a dead app by default.
- **Channel:** document (in `frontend/README.md` or the repo README) that
  local dev needs `VITE_API_BASE_URL=https://thehive.sovereignhive.workers.dev`
  (or a local `wrangler dev` origin) — otherwise every `/v11` call goes to
  localhost:8080 and the app reads OFFLINE. No code change beyond step 1's
  fallback fix.
- **Verification:** a fresh checkout + `VITE_API_BASE_URL` set + `npm run dev`
  shows the app LIVE with agents listed.
- **Troubleshooting:** if dev still reads OFFLINE with the var set, the
  `vite.config.ts` define overrides it — check the define's precedence
  (the define reads `process.env.VITE_API_BASE_URL` at config load).

---

## §7 — Queen 100% rule: what this map does NOT schedule

- **Commune with Kai El** (`KaiCommune` / `KaiChatBox` → `POST
  /v11/command_text`) is **LIVE but unauthenticated**. Gating it to Mac-only
  is **Queen work, 100% inside the Queen build** (Q-A → Q-B → Q-C) — the
  founder decision (Access app vs in-handler founder auth) is already queued
  with Mac (asked 2026-11-10). This map does **not** schedule the gating as
  parallel rewire work.
- **The real terminal** (`HiveTerminal` is display-only by design — "not a
  shell", deliberately, because a public frontend executing commands would be
  a remote-code-execution hole) is **Q-C Queen work**. This map does not
  schedule it.
- **Queen/Kai brain surfaces** (`GET /nanuet/brain`, `/kai/brain`, etc.) have
  no UI today. Adding a Queen status surface is a future Queen step, not
  this rewire.
- **No switch is flipped by any step in this map.** The switch validator
  (`~/workspace/hive-batches/SWITCH_VALIDATOR_DRAFT.md`) is the authority on
  switch state; this map does not touch it.

---

## §8 — Founder decision (what to approve, in what order)

Nothing here is approved until Mac says so. The proposed order:

1. **Step 1** (base-URL layer) — the fix everything else depends on.
2. **Step 2** (colony drill-down rewire) — the one user-visible dead
   interface in the live app.
3. **Step 3** (capabilities gap) — pick (a) new endpoint or (b) drop the
   section. If (a), it becomes its own batch with its own done-ladder run.
4. **Step 4** (stale labels) — small, safe, can ride with step 1 or 2.
5. **Step 5** (dead-code quarantine) — approve the proposal; deletion itself
   needs a separate founder yes at merge time.
6. **Step 6** (legacy pages) — retire or rewire, per page. Retire is the
   cheap, honest call; rewire is a rewrite, not a fix.
7. **Step 7** (dev workflow doc) — docs only, any time.

**Open questions for Mac (not decisions yet, just the list):**
- Q1: capabilities — new endpoint (a) or drop the section (b)?
- Q2: legacy pages — retire or rewire, per page?
- Q3: dead code — delete, or keep with a `DEAD_CODE.md` note?
- Q4: constitution surface — build `GET /v11/constitution` (G2) or leave the
  SOUL tab's laws hardcoded?
- Q5: event feed — build `GET /v11/feed` (G3) or delete the API tab's label?

*End of map. Implementation is a separate founder decision; this file authorises
nothing to be built, merged, deployed, or flipped.*
