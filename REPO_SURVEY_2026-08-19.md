# REPO SURVEY — 2026-08-19

**Scope:** complete map of what exists in `/home/user/THEHIVE` and what is actually WIRED
(reachable at runtime) versus merely present as a file.
**Method:** read-only. Every claim below cites a real path/line or real command output.
**Lane:** repo-survey lane of a 6-lane parallel orchestration.

---

## 0. Two honest caveats about this survey itself

**(a) No sub-agents were spawned — the tool does not exist in this lane.**
The lane brief instructed spawning one Agent-tool sub-agent per domain. This session is
itself an agent thread, and agent threads in this harness cannot spawn further agents.
Two `ToolSearch` queries (`"Task agent subagent launch general-purpose explore"` and the
exact-name query `select:Task,Agent,ListAgents`) returned **"No matching deferred tools
found"** for any spawn capability — only `SendMessage`, `TaskStop`, `Monitor`, and
`EnterWorktree` came back. All six domains below were therefore surveyed directly by this
lane, sequentially. Stating this rather than claiming a multi-tier run that did not happen
is the same discipline `wired-or-not` applies to a `done` marker.

**(b) This container has no outbound network to any production host.**
```
curl https://thehive.sovereignhive.workers.dev/v11/health  -> 000 (exit 56)
curl https://thehive-queen.onrender.com/v11/health         -> 000 (exit 56)
curl https://tehutirael.github.io/THEHIVE/                 -> 000 (exit 56)
```
So no live-production claim in this document rests on a probe from here.
**However — and this corrects the lane brief's premise — the GitHub API *is* reachable
from this container**, via the `mcp__github__*` tools. That let this survey read real
workflow-run history, real job records, and real job logs. Where a fact below is sourced
from a GitHub Actions run, the run ID is given and the fact is real. Where it is not, it is
marked UNVERIFIABLE and left there.

---

## (a) Plain English — what this repo actually is, in ten sentences

THEHIVE is one folder holding **two completely separate working systems that both really
run**, plus a large support harness. System B is a **Cloudflare Worker** — one 3,945-line
JavaScript file that answers 69 web addresses and is the thing real users actually hit.
System A is a **Python FastAPI server** with 135 web addresses and 397 passing tests that
**is not switched on anywhere in the world** — it is finished code with no home, and a
GitHub Actions run yesterday confirmed its intended address returns "404 Not Found".
There is also a **React web dashboard** (the Command Center), a **self-improving robot
agent** called automaton with its money and self-copying powers both switched OFF by
default, and a **harness of 83 skill files** that tell Claude how to work on all of it.

Here is the part that matters most today: **the hive's automated helpers have stopped
running.** Since roughly 7:40pm UTC yesterday (2026-08-18) every single GitHub Actions job
in this repo dies in about two seconds without ever being given a machine to run on — the
account itself appears to be blocked. Separately and for much longer, since 2026-08-08,
the job that publishes the website has been failing for its own unrelated reason (GitHub
Pages is not set up to accept publishing from Actions). And one governance check is
**reporting green while doing nothing at all**, because it is configured to ignore its own
failures — which is exactly the kind of comfortable lie this repo built a whole reality-audit
culture to catch. Meanwhile the code itself is in good shape: 256 Worker tests, 397 backend
tests, and 27 automaton tests all pass right here, right now, and the frontend typechecks
clean.

---

## (b) Per-domain inventory

### 1. `worker/` — the live Cloudflare Worker (System B)

| Item | Count | Evidence |
|---|---|---|
| Files (non-node_modules) | 21 | `find worker -type f` |
| `src/index.js` | **3,945 lines** | `wc -l worker/src/index.js` |
| Test files | 12 | `worker/test/*.test.js` |
| **Tests** | **256 pass / 0 fail / 57 suites** | `npm test --prefix worker`, run this session |
| Syntax | clean | `node --check worker/src/index.js` → OK |
| SQL schema files | 5 | `worker/schema/*.sql` |

**Routes: 69 real `/v11/*` endpoints.**
- 58 exact-match (`p === '/…'`). One further match — `p === '/founder/...'` — is **not a
  route**: it lives inside a comment at `worker/src/index.js:245`. Counted out.
- 11 parameterised (regex), all `p.match(...)`:
  `/proposals/{id}/decide`, `/founder/proposals/{id}/decide`, `/proposals/{id}/actioned`,
  `/proposals/{id}/diff-check`, `/ventures/gaps/{id}/decide`,
  `/ventures/gaps/{id}/issue-linked`, `/ventures/sandbox-runs/{id}/opened`,
  `/ventures/sandbox-runs/{id}/decide`, `/arena/resolve/{id}`, `/arena/project/{id}`,
  `/arena/projection/{id}/frames`.
- Plus non-`/v11` surfaces: `GET /app/*` served from the `ASSETS` binding
  (`worker/src/index.js:3841`) and `/broadcast` inside the Durable Object
  (`worker/src/index.js:3869`).

**Self-declared route map** at `worker/src/index.js:3679-3703` (`/v11/routes`,
`/v11/debug/endpoints`) lists **41** of the 69 — the map is a curated public list, not a
complete one. Not a bug, but do not treat it as the inventory.

**Exports** (`worker/src/index.js:2126`, `:3860`, `:3915`):
- `export default { scheduled, queue: processQueueBatch, fetch }` — cron heartbeat, queue
  consumer, HTTP handler.
- `export class CommandCenterDO` — the only class in the file (WebSocket Durable Object).
- A named export block of **27 symbols**, existing so `worker/test/` drives real functions
  rather than reimplementations.

**D1 tables touched — 13**, all via `CREATE TABLE IF NOT EXISTS` in `ensureTables()`:
`async_jobs`, `colony_reports`, `grok_bridge_tokens`, `hive_proposals`, `hive_pulse`,
`hive_updates`, `provider_health`, `rate_limits`, `roadmap_items`, `task_digest`,
`venture_capability_gaps`, `venture_sandbox_runs`, `visitor_tokens`.

**Bindings used in code — 23** (`grep -oE "env\.[A-Z][A-Z0-9_]+"`): `ACCESS_AUD`,
`ACCESS_TEAM_DOMAIN`, `AI`, `ANTHROPIC_API_KEY`, `ASSETS`, `COMMAND_CENTER`, `DB`, `FILES`,
`FOUNDER_EMAIL`, `FOUNDER_KEY`, `GITHUB_ACTIONS_TOKEN`, `GROQ_API_KEY`, `HIVE_WORK_CYCLE`,
`KAI_BRAIN`, `LLM_QUEUE`, `MISTRAL_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`,
`OPENROUTER_MODEL`, `QUEEN_AUTONOMOUS_APPROVAL`, `RATE_LIMIT_KV`, `VECTORIZE`,
`WORKER_ADMIN_KEY`. Every infra binding in `wrangler.jsonc` is now **uncommented and
active** — Vectorize (line 25), R2 (line 33), KV (line 40), Queues (line 53), Durable
Objects (line 66), two D1s (lines 76, 97). The historical "ships commented out" pattern is
fully unwound.

**Dead functions: none.** All 52 top-level `function`/`async function` declarations have at
least one non-definition mention. The one apparent hit — `processQueueBatch`, which never
appears with a `(` after it — is attached declaratively at `worker/src/index.js:2290`
(`queue: processQueueBatch,`). A naive call-site grep would have wrongly reported it dead;
this is the same false-positive shape the lane brief warned about for the frontend.

### 2. `frontend/` — the React Command Center

165 files outside `node_modules`; **130** are `.ts/.tsx/.js/.jsx/.css` under `src/`.
Entry: `index.html` → `src/main.tsx` → `src/App.tsx` → `src/pages/KaiElOS.tsx`.

**Typecheck against the production config passes:** `npx tsc -p tsconfig.build.json
--noEmit` → **exit 0**, zero errors (run this session).

**The lazy-import trap, resolved.** `src/pages/KaiElOS.tsx:32-44` declares **13** tabs via
`lazy(() => import(...))`: `HIVE`, `DREAM`, `ARCANE`, `WORLD`, `SOUL`, `GOVERN`, `MISSIONS`,
`API`, `4D`, `ARENA`, `WOW`, `NO_MANS_SKY`, `SETTINGS`. All 13 target files exist under
`src/components/command-center/tabs/`, and all 13 appear as separately-hashed chunks in the
built bundle at `docs/app/assets/` (`HIVE-CkjN-IMT.js`, `4D-DsKS0A2K.js`, …). **Zero dead
tabs.** A static-import grep sees none of these — that is precisely how the historical
"14 dead tabs" report went wrong. A 14th dynamic import exists at
`src/components/PhaserScene.tsx:18` (`import('phaser')`), also live.

**Reachability was computed properly, not grepped.** A transitive resolver
(`/tmp/.../scratchpad/reach.py`) walked static imports, re-exports **and** `import()` calls
from `src/main.tsx`, resolving extensions and `index.*` files. Result:
**80 of 130 files reachable, 0 unresolved relative imports.**

Of the 50 unreachable files, **35 are deliberate and documented**:
`src/FUTURE_MODULES.md` labels `worlds/` (14 files), `voxel/` (8), `xp/` (5),
`conversation/` (5), `avatars/` (3) as FUTURE, and `tsconfig.build.json` **explicitly
excludes all five directories**. Founder decision D2, 2026-07-29, via Grok PR #132. These
are parked, not orphaned. (`src/vite-env.d.ts` is a 36th non-orphan — an ambient type
declaration, invisible to an import graph by design.) The genuine remainder is listed in
section (d).

Hooks: 6 (`useColonyPing`, `useCommandCenterSocket`, `useFocusTrap`, `useHiveData`,
`usePersistedForm`, `useViewport`) — 5 reachable. Stores: 2 (`constitutionStore`,
`uiStore`). Services: 3 (`api`, `github`, `sentry`). Pages: 1 (`KaiElOS`).

### 3. `backend/` — the FastAPI harness (System A)

128 files, **79 `.py` modules** across 13 packages (`api` 10, `core` 22, `economy` 3,
`governance` 2, `guilds` 8, `mcp` 3, `mcp_server` 2, `memory` 3, `simulator` 2, `tier2` 4,
`tier3` 5, `utils` 3, root 12).

**135 unique route paths** across 142 decorator sites — genuinely a superset of the
Worker's surface in breadth: quantum (`/quantum/bb84`, `/quantum/qrng`), hyperdimensional
(`/hd/bind`, `/hd/bundle`, `/hd/encode`), frequency guild, sheaf guild, staking, genome
spawn/genealogy, tesseract forecast, HITL queues.

**Tests: 397 collected, 397 passed** (`.venv/bin/python -m pytest -q`, 10.22s, run this
session). Only 5 warnings, all Pydantic v2 deprecations in `backend/api/ml.py:110`.

**`CLAUDE.md`'s "not deployed anywhere" claim is STILL TRUE, and now re-confirmed with
fresher evidence than the 2026-08-07 line it cites.** Three independent confirmations:
1. `render.yaml` is a Blueprint whose own header reads "New → Blueprint → pick this repo" —
   a manual click, never automated.
2. `.github/workflows/deploy.yml:32-34` still gates on an unset secret:
   `if [ -z "$ORACLE_HOST" ]; then … "⏸ Oracle box not provisioned yet … skipping deploy."`
3. **Live probe, `edge-health-probe` run `32173796292`, 2026-08-18T18:56:31Z**, step 7
   ("Informational — is the FastAPI backend actually deployed?"), verbatim from the job log:
   ```
   ── GET https://thehive-queen.onrender.com/v11/health (render.yaml default slug)
   status=404
   Not Found
   ##[notice]System A (FastAPI backend) is NOT live at the default Render slug
   (status=404) — render.yaml is an undeployed blueprint, not a running service.
   ```
   That is ~15 hours before this survey, and is the freshest possible evidence — no
   successful probe has run since (see §6).

### 4. `automaton/` — the self-improving agent

44 files, **34 `.js` source modules** + 3 test files. Zero runtime dependencies (Node 22
built-ins only).

**Tests: 27 pass / 0 fail** (`cd automaton && npm test`, run this session, no install
needed). Breakdown, each verified individually:
- `test/gap-closure.test.js` — **15/15** (matches `CLAUDE.md`'s stated figure)
- `test/sandbox-run.test.js` — **12/12** (newer, 2026-08-18; **not** reflected in `CLAUDE.md`)

**Both master switches default OFF**, in code, at `automaton/src/config.js`:
```
:43   financialAutonomy:    boolEnv('AUTOMATON_FINANCIAL_AUTONOMY',   false),
:52   replicationAutonomy:  boolEnv('AUTOMATON_REPLICATION_AUTONOMY', false),
```
The in-file comments confirm the design `CLAUDE.md` describes: with `replicationAutonomy`
false, `spawn_child` "always writes a pending proposal to the approval queue and returns
without spawning anything"; with it true, approval is *still* mandatory — the switch only
controls whether approval is reachable at all. Enforced at
`automaton/src/replication/spawn.js:73`. `maxChildren` defaults to 3.

**Policy engine: 7 rule modules, 508 lines** — `authority.js` (100), `command-safety.js`
(47), `financial.js` (128), `index.js` (25), `path-protection.js` (110), `rate-limits.js`
(47), `validation.js` (51).

**What the "sandbox engine" actually is.** There is no separate sandbox subsystem. The
sandbox is a *scoping* mechanism: `config.repoRoot` (overridable by
`AUTOMATON_REPO_ROOT` / a one-shot `--task --target <path>`) bounds a generic
`write_target_file` tool, while `edit_own_file`'s root is pinned to `ROOT_DIR` and
**deliberately never follows the override** — so self-modification always means automaton's
own files no matter where a sandbox run is pointed. `automaton/src/config.js:30-35` states
this explicitly. `test/sandbox-run.test.js` proves it against a real temp dir separate from
`homeDir`. This is the mechanism `.github/workflows/kai-sandbox-run.yml` uses to let Kai El
make real writes into a *venture* repo (see that file's lines 25-32 for why automaton was
chosen over two alternatives), reaching inference through
`src/inference/thehive-provider.js` → `POST /v11/automaton/infer`.

### 5. `.claude/` — the harness

401 files. **83 `SKILL.md` files** across 82 skill directories; **9** commands; **5** agents;
**3** task files; **2** harness scripts + **13** repo `scripts/`.

**Two skill directories contain no `SKILL.md`:** `.claude/skills/caveman-eli5-workspace/`
(holds `evals/` and `iteration-1/` — skill-authoring workspace, not a skill) and
`.claude/skills/debug-issue/` (contains a nested `debug-issue/` directory). Neither is
invocable as-is.

**What changed since `SKILL_CENSUS_REPORT_2026-08-18.md`: essentially nothing.** The census
counted 83 `SKILL.md` files; there are **83 today** — same number, and
`git log --since=2026-08-18 -- .claude/` shows the only post-census commits touching
`.claude/` modified `.claude/tasks/CAMPAIGN.html` and `.claude/HIVE_PULSE.md`. **No skill
was added, removed, or renamed.** The census is current; it was not redone.

**Its three named orphans re-verified, and the verdict changes.** The census listed
`antigravity-protocol`, `antigravity-protocol-v2`, `ultimate-protocol-simulator` at
"0 references". Fresh grep (excluding `.git`, `node_modules`, `worktrees`) finds **6, 5,
and 5 files** respectively. The names are the `name:` frontmatter values, not the directory
names (`antigravity/`, `antigravity2.0/`, `ultimate-protocol/`) — a genuine trap. They are
low-reference, but "0 references" no longer holds today.

**The `.claude/agents/` bridge is real and load-bearing.** All 5 agents are referenced from
7-14 other files each: `colony-health-monitor` 14, `constitutional-validator` 13,
`memory-librarian` 12, `hive-organism` 9, `knowledge-cartographer` 7. Likewise all 9
commands are referenced elsewhere (5-17 files). The census's substantive conclusion — that
System A's "skill set" is really a *command* set, and that the agents layer already bridges
A and B — holds.

**One harness claim spot-checked and confirmed runnable:**
`python3 .claude/skills/hive-conductor/scripts/domain_router.py --directive "fix the worker
health route"` → exit 0, emits `{"schema":"hive-conductor/routing.v1","verdict":
"SINGLE-DOMAIN","matched_domains":["edge-backend"]}`. Real code, not prose.

### 6. `docs/` + colonies + workflows

**`docs/`** — 72 files: 38 `.md`, 7 published HTML pages, `manifest.json`, and `docs/app/`
(the built React bundle: `index.html` + 15 hashed assets). The Worker serves this whole
directory via `"assets": { "directory": "docs", "binding": "ASSETS" }`
(`wrangler.jsonc:11`), and reads `GOVERNANCE.md` / `FOUNDERS_VISION.md` back out of it at
runtime (`worker/src/index.js:1928`, `:1950`). Page sizes and `/v11` reference counts:
`campaign.html` 2,363 lines / 53 refs · `full-plan.html` 3,268 / 56 · `landing.html` 560 / 4 ·
`command-center.html` 1,407 / 3 · `index.html` 59 / 4 · `biosystem.html` 17,344 / **0** ·
`gateway-console.html` 1,674 / **0**.

**`.github/workflows/` — 24 workflows.** By trigger: 3 scheduled-only, 8 scheduled +
dispatch, 6 dispatch-only, 4 push/PR-driven, 1 `repository_dispatch`, 1 `workflow_run`,
1 PR-only. Busiest crons: `venture-gap-mirror` every 15 min; `architect-proposal-check`
every 10 min; `edge-health-probe`, `ui-live-probe`, `federation-pr-review`,
`campaign-roadmap-digest`, `roadmap-digest` every 6h; `task-digest` every 4h;
`colony-health` and `d1-backup` daily/weekly.

**CI gates only three things** (`.github/workflows/ci.yml`): `pytest tests/unit/` with
`--cov-fail-under=45` and `pytest tests/integration/` (line 30, 33); `node --check` +
`npm test --prefix worker` (line 63, 66); `python3 scripts/check-claims.py` (line 73).
`grep -rn "npm test" .github/workflows/` returns exactly one hit — line 66.

**`scripts/check-claims.py` runs clean here:** "checked 2 task(s) claiming verified-live /
all verified-live claims carry checkable evidence", exit 0. Cross-checked against
`.claude/tasks/CAMPAIGN.html`: 48 `done`, 17 `blocked`, 2 `in-progress`, 2 `pending`; the
string `verified-live` appears 14 times but 12 of those are prose ("NOT verified-live") or
Campaign-Log lines the checker excludes by design. So **2 of 48 done tasks claim
`verified-live`** — the checker is behaving correctly and the ratio is honest.

**Colonies.** `.queen/hive.yml` registers a queen (`TehutiRaEl/sovereign-hive-meta`,
`soul_md_hash: a54f80ce…`) and **12 colonies**: 6 GitHub repos with health paths (THEHIVE,
aether, automatisch, kimi-gateway/Kimi-K2, academy-books, academy-camp), 2 private
repos with role "unknown" and empty `base_url` (`NAR2`, `4DBRAIN`), and 4 infrastructure
entries (n8n, postgres, redis, ml-pipeline) whose `base_url`s are all `localhost` defaults.
`colony.json` (repo root) is THEHIVE's own self-descriptor: role `queen`, 22 declared
capabilities, `port: 8080` — a **System A** port, not the Worker's.
Two further `colonies.json` files exist and are harness manifests, not registries:
`.claude/skills/hive-conductor/harnesses/colonies.json` and
`.claude/skills/agent-harness/assets/harnesses/colonies.json`. The former is honest about
its own limits — every verification entry is `"kind": "manual-evidence"` with the note
*"this container has no direct network reach to any colony."*

---

## (c) THE WIRED / NOT-WIRED LEDGER

`EXISTS` = the file is here. `BUILT` = it does what it claims, proven by a check run.
`WIRED` = it is actually reachable and running in the place it is meant to run.

### Green — exists, built, and wired

| Thing | EXISTS | BUILT | WIRED | Evidence |
|---|---|---|---|---|
| Worker `/v11` API, 69 routes | ✅ | ✅ 256/256 tests | ✅ | `npm test --prefix worker`; probe run `32173796292` all 8 steps green 2026-08-18T18:56:32Z |
| Worker WebSocket push (`/v11/ws` + `CommandCenterDO`) | ✅ | ✅ | ✅ **proven live** | Run `32173796292` job log: marker `probe-73363615` POSTed and received back over the socket — *"PROVEN LIVE: a real client received a real pushed update over /v11/ws"* |
| Backend FastAPI code, 135 routes | ✅ | ✅ 397/397 tests | — | `pytest -q` this session |
| Automaton safety gates | ✅ | ✅ 27/27 tests | ✅ via `kai-sandbox-run.yml` | `npm test`; `config.js:43,52`; `spawn.js:73` |
| Frontend 13 lazy tabs | ✅ | ✅ tsc exit 0 | ✅ | `tsc -p tsconfig.build.json`; 13 hashed chunks in `docs/app/assets/` |
| All wrangler infra bindings | ✅ | ✅ | ✅ | `wrangler.jsonc` — every binding uncommented; `queue: processQueueBatch` attached at `index.js:2290` |
| `check-claims.py` in CI | ✅ | ✅ exit 0 | ✅ | `ci.yml:73`; run this session |
| `domain_router.py` | ✅ | ✅ exit 0 | ✅ | run this session |

### Red — exists and builds, but is NOT wired

| Thing | EXISTS | BUILT | WIRED | Evidence |
|---|---|---|---|---|
| **Backend / System A in production** | ✅ | ✅ | ❌ **404** | Run `32173796292` step 7: `status=404` at `thehive-queen.onrender.com/v11/health`. `deploy.yml:32-34` still gated on unset `ORACLE_HOST`. Unchanged since 2026-08-07. |
| **All GitHub Actions** | ✅ | ✅ | ❌ **blocked** | Every run since 2026-08-18T19:50Z fails in ~2s with `runner_id: 0`, `runner_name: ""`. See §(e) F1. |
| **GitHub Pages publishing** | ✅ | ❌ | ❌ | `pages.yml` failing since 2026-08-08. Job log run `32092901808`: `##[error]Get Pages site failed… verify that the repository has Pages enabled and configured to build using GitHub Actions` / `HttpError: Not Found`. Last success: run `30868956614`, **2026-08-04T01:30:29Z**. |
| **`docs/app` bundle vs production** | ✅ | ✅ | ❌ **drifted** | Repo now serves `assets/index-DancRs-E.js` (`docs/app/index.html`, committed `0bdd87b` 2026-08-18T19:49:51Z). Production at 18:56Z was still serving `assets/index-pdM0psdT.js` (run `32173796292` step 5). The fix landed 53 min after the last probe and **no deploy path has run since**. |
| **Worker deploy automation** | ❌ | — | ❌ | `grep -rn "wrangler deploy"` over all workflows/Makefile/package.json/scripts → **zero hits**. `wrangler` appears in 3 workflows, never as a deploy. The Worker reaches production only by an out-of-band step (manual `wrangler deploy`, or Cloudflare's git integration configured outside this repo — cf. the orphan branch `origin/cloudflare/workers-autoconfig`). **UNVERIFIABLE from here.** |
| **`automaton/` tests in CI** | ✅ | ✅ 27/27 | ❌ | `ci.yml` mentions "automaton" only in a comment at line 49. No job runs `cd automaton && npm test`. |
| **Frontend typecheck / lint / build in CI** | ✅ | ✅ | ❌ | `tsc`/`vite build` appear only in `pages.yml:72` (`npm run build:app`) — which is the workflow that has been red since 2026-08-08. `grep -rn "eslint" .github/workflows/` → zero. |
| **`governance-advisory.yml`** | ✅ | ❌ | ❌ **false green** | Run `32214601943` reports `conclusion: "success"`; its sole job `advisory` (id `95953640943`) reports `conclusion: "failure"`, `runner_id: 0`. Cause: `continue-on-error: true` at `governance-advisory.yml:10`. |
| Colony health across the federation | ✅ | ✅ | ❌ | `colony-health.yml` last success run `32177372292`, 2026-08-18T19:34:29Z. Failing since. |
| `biosystem.html`, `gateway-console.html` | ✅ | ? | ❌ | 0 `/v11` references each — no live data path. `biosystem.html`'s "Demo Mode — start JASPER backend" state is a direct consequence of System A being 404. |
| **`ConstitutionalValidator.CACHE_TTL` guarded by a test** | ❌ | — | ❌ | `grep -rn "CACHE_TTL" tests/` → zero hits. The value was changed 5.0 → 99999.0 mid-survey and all 397 tests still pass. See §(e) F6. |

### Amber — cannot be determined from here

| Thing | Status |
|---|---|
| Whether `thehive.sovereignhive.workers.dev` is up **right now** | **UNVERIFIABLE.** Last real evidence is run `32173796292`, 2026-08-18T18:56:32Z — all green. Actions has been unable to probe since. |
| Whether the 12 colonies are reachable | **UNVERIFIABLE.** Last `colony-health` success 2026-08-18T19:34:29Z; the conductor's own manifest already labels all colony checks `"kind": "manual-evidence"`. |
| Whether GitHub Pages is serving anything at all | **UNVERIFIABLE.** The 404 from `configure-pages` is equally consistent with Pages being off, or with Pages set to "deploy from a branch" (in which case `docs/` is live and current and only the *workflow* is broken). Needs one look at repo Settings → Pages. |

---

## (d) Orphans — verified unreferenced, with method

**Method (frontend):** transitive import-graph walk from the real entry point
(`index.html` → `src/main.tsx`), resolving static imports, `export … from`, **and dynamic
`import()`**, with extension and `index.*` resolution. 0 unresolved relative specifiers, so
the graph is complete rather than merely large. Every candidate was then re-grepped by name
across `src/` to catch non-import references. **Deliberate exclusions
(`src/FUTURE_MODULES.md` + `tsconfig.build.json`) are reported as parked, not orphaned.**

**Genuinely unreferenced frontend components — 13 files:**

| File | Note |
|---|---|
| `frontend/src/components/AchievementToast/AchievementToast.tsx` + `.css` | zero references anywhere |
| `frontend/src/components/LevelUpNotification/LevelUpNotification.tsx` + `.css` | zero references anywhere |
| `frontend/src/components/MissionCard/MissionCard.tsx` + `.css` | zero. (`MissionTimeline.tsx:167`'s `renderMissionCard` is an unrelated local function — a trap for a name-grep) |
| `frontend/src/components/TesseractChamber/TesseractChamber.tsx` + `.css` | zero. **This is the one component `CLAUDE.md` says made it to `main` byte-identical from `feature/gamified-ui-components` — it did arrive, and nothing imports it.** |
| `frontend/src/components/ConstitutionVisualizer.tsx` | only mention is a to-do *string* at `tabs/MISSIONS.tsx:110` |
| `frontend/src/components/MemoryGraphEnhanced.tsx` | only a comment at `types/memory.ts:3` + the same to-do string |
| `frontend/src/components/MissionTimeline.tsx` | only the same to-do string |
| `frontend/src/hooks/usePersistedForm.ts` | defined, never consumed |
| `frontend/src/assets/styles/global.css`, `variables.css` | never imported; `src/index.css` is the live stylesheet |

**Stray files at `frontend/` root** — extension-less, outside the Vite graph, referenced by
nothing: `frontend/app` (a standalone three.js/OrbitControls script), `frontend/index` (a
`JASPER v9 · SOVEREIGN HIVE · KAI EL` HTML page), `frontend/style` (loose CSS),
`frontend/see-app.html`, `frontend/js/phaser_scene_v2.js` (a JS file whose payload is a
template-literal of React code), `frontend/public/index.html` (duplicate of the real
`frontend/index.html`).

**Repo-root strays:** `ErrorBoundary.tsx.` — 12,737 bytes, **note the trailing dot**;
`grep -rl "ErrorBoundary.tsx\."` finds no reference. Also `.gitignoreb` (13 bytes) and
`download` (305 bytes).

**`skills-library/` — 2,594 files, 5 real references.** Referenced only from
`.claude/skills/skill-harvester/SKILL.md`,
`.claude/skills/SOURCED_SKILLS_INDEX.md/SKILL.md`,
`.claude/skills/hive-conductor/harnesses/skills-active.json`,
`.claude/skills/agent-harness/assets/harnesses/thehive.json`, and one HIVE_UPDATES
directive. By file count this is **the largest single body of unreferenced material in the
repo** — larger than `backend/` and `frontend/` combined. It is a harvested external
library, so "orphan" may be the intended state; flagging the ratio, not prescribing a fix.

**Single-file directories:** `ui/` contains only `ui/hive-status.html`; `skills/` contains
only `skills/visionary-recommender/SKILL.md` — which sits *outside* `.claude/skills/` and so
is invisible to the skill census.

**Not orphans, despite looking like it:** `worker/src/index.js`'s `processQueueBatch`
(declaratively attached, `:2290`); `frontend/src/vite-env.d.ts` (ambient types); the 35
FUTURE-module files (documented exclusion); `memory-base/` (a git submodule per
`.gitmodules`).

---

## (e) What surprised me / looks wrong

### F1 — Every GitHub Actions run is dead, and the outage window is now pinned to 16 minutes

`CLAUDE.md`'s newest commit says "GH Actions account block confirmed repo-wide … since
yesterday." Reading the real run history narrows that considerably:

| Workflow | Last SUCCESS | First FAILURE after |
|---|---|---|
| `colony-health.yml` | `32177372292` — **2026-08-18T19:34:29Z** | `32178851005` — **2026-08-18T19:50:09Z** |
| `edge-health-probe.yml` | `32173796292` — 2026-08-18T18:56:20Z | `32206511899` — 2026-08-19T01:52:43Z |

**The block began between 19:34:29Z and 19:50:09Z on 2026-08-18** — a 16-minute window,
which happens to straddle commit `0bdd87b` at 19:49:51Z. Of the 30 most recent runs
repo-wide, **29 are failures and the 30th is a false green** (F2). Independently confirmed
by me this session: job `95953326701` (Edge Health Probe, dispatched 04:05:41Z today) has
`runner_id: 0`, `runner_name: ""`, `started_at == created_at`, completed 2 seconds later,
**no steps at all**. No runner was ever assigned. This is not a test failure — nothing ran.

**Consequence for this repo specifically:** `edge-health-probe` is, by `CLAUDE.md`'s own
words, "the hive's real eyes on production." Those eyes closed ~15 hours ago. Every
`verified-live` claim made from here on is unbackable until Actions returns.

### F2 — A governance gate that reports green while doing nothing

`Governance Advisory Check` run `32214601943` reports `"conclusion": "success"`. Its only
job, `advisory` (id `95953640943`), reports `"conclusion": "failure"` with `runner_id: 0` —
it never got a machine. The run is green anyway because
`.github/workflows/governance-advisory.yml:10` sets `continue-on-error: true`.

This is the exact failure shape the 2026-08-07 reality audit was ordered to eliminate: a
green marker surviving while the thing it attested to did not happen. It is worse than the
other 29 failures, because those are honestly red. Anyone scanning the PR checks on
`18d8fd5` sees one ✅ next to the word "Governance" and could reasonably conclude governance
was checked. It was not. `continue-on-error` on an advisory job is defensible as a design
choice; combined with a total runner outage it silently manufactures a pass.

### F3 — Two independent outages, and the older one predates the block by ten days

The Actions block (F1) is easy to see because everything is red. Hidden underneath it:
**`pages.yml` has failed on every push since 2026-08-08T02:10:55Z** — 8 consecutive
failures — for an entirely unrelated reason. Job log, run `32092901808`:

```
##[error]Get Pages site failed. Please verify that the repository has Pages enabled
and configured to build using GitHub Actions, or consider exploring the `enablement`
parameter for this action.
##[error]HttpError: Not Found
```

Last successful Pages deploy: run `30868956614`, **2026-08-04T01:30:29Z — 15 days ago.**

Compounding it: commit `0bdd87b` ("Fix stale docs/app + make pages.yml rebuild it
automatically") added the `npm run build:app` step to `pages.yml` — `git log -S "build:app"`
confirms that step has existed only since that commit. But `pages.yml`'s own trigger paths
are `docs/**` (with `!docs/app/**`), `frontend/**`, `README.md` — **`.github/workflows/**` is
not among them**, and `0bdd87b` touched only `pages.yml` and `docs/app/**`, both excluded.
So that commit did not fire its own workflow, and `pages.yml` has not run *at all* since
2026-08-18T02:44:00Z. **The auto-rebuild fix has never once executed.** Its correctness is
`compiles`-level at best, in this repo's own vocabulary.

### F4 — `automaton/` is the one subsystem with real-world write authority and no CI gate

`.github/workflows/kai-sandbox-run.yml:25-32` documents that automaton was chosen over two
alternatives to be the mechanism by which Kai El performs real file writes into external
venture repositories. Its 27 tests are the enforcement proof for five specific safety gaps
(uncapped self-replication funding, an agent able to edit its own authority rules, and so
on) that this rebuild exists to close.

`ci.yml` never runs them. `grep -rn "npm test" .github/workflows/` returns exactly one line:
`npm test --prefix worker`. The word "automaton" appears in `ci.yml` once, at line 49, inside
a comment. A regression in `policy-rules/financial.js` or `replication/spawn.js` would pass
CI green. The tests are excellent and they are not guarding anything.

The same gap covers the frontend: no typecheck, no lint, no build in CI. `tsc` runs only
inside `pages.yml` — the workflow that has been red for eleven days.

### F5 — A `CLAUDE.md` line that a real check contradicts

`CLAUDE.md` states that from `feature/gamified-ui-components`, "only `TesseractChamber`
actually made it to `main` (byte-identical) — `HiveDashboard`, `ColonyCard`,
`ConstitutionHall`, and `MemoryVault` never made it anywhere."

`frontend/src/components/ColonyCard/ColonyCard.tsx` and `ColonyGrid.tsx` **exist on this
branch and are live**: `frontend/src/components/command-center/tabs/WORLD.tsx:5` imports
`ColonyGrid`, renders it at line 69, and `frontend/src/hooks/useColonyPing.ts:4` says
outright *"Wires ColonyCard to the real GET /v11/debug/colony-ping route."* Both are inside
the reachable set of my import graph.

Two readings are possible and I could not separate them read-only: either the branch's
`ColonyCard` is a different component that coincidentally shares a name with one built
independently here, or the `branch-dissection` finding is wrong on this row. Either way the
`CLAUDE.md` sentence, read plainly, is false as written — a live, wired `ColonyCard` exists.

**And the inverse, which is the sharper half:** `TesseractChamber` — the one component
`CLAUDE.md` credits as having successfully landed — is imported by **nothing**. It made the
journey and never got plugged in. The component described as the migration's success is the
orphan; the one described as never having arrived is the one serving live colony data.

### F6 — A live edit to the constitutional validator appeared mid-survey, and no test catches it

**This lane wrote exactly one file (`REPO_SURVEY_2026-08-19.md`) and edited nothing.** At
the end of the survey `git status` nevertheless showed `backend/core/validator.py` modified.
Timestamps put the change at **2026-08-19 05:27:35.535**, half a second after this report
file was created at 05:27:35.034 — i.e. it landed *during* this survey, from outside it
(most plausibly a sibling lane of the same 6-lane orchestration).

The diff is one line, at `backend/core/validator.py:56`:

```diff
-    CACHE_TTL = 5.0  # seconds — short TTL since context can change
+    CACHE_TTL = 99999.0  # seconds — short TTL since context can change
```

`ConstitutionalValidator.validate()` is the F-001…F-006 enforcement path — the same function
`CLAUDE.md` cites as the authority that settled the Chromosome I / `soul.md` F-003 drift. Its
result cache is keyed on the action, and this raises the entry lifetime from 5 seconds to
~27.8 hours. The comment still reads *"short TTL since context can change"*, now describing
the opposite of what the constant does: a context that later becomes violating would keep
receiving the cached earlier verdict for more than a day.

**What I verified, and what I did not.** I re-ran the full suite against the modified file:
**397 passed, 0 failed.** `grep -rn "CACHE_TTL" tests/` returns **zero hits** — no test in
the repo reads `ConstitutionalValidator.CACHE_TTL` or its `_cache`, so the change is
completely invisible to CI. That is a real, verified coverage gap on the constitutional
enforcement path, independent of who made the edit or why. I did **not** revert it: this
lane is read-only, and silently undoing a sibling lane's in-flight work would be worse than
reporting it. I also cannot tell from here whether this was deliberate (a probe, a
benchmark, a perf experiment) or accidental — I am reporting the observation, not assigning
an intent.

Flagged rather than filed away, per `anomaly-triage`: an unexplained edit to the
constitution-enforcement path that the entire test suite waves through is precisely the
"strange thing that isn't yet clearly a bug" that skill exists to escalate rather than
absorb. **Founder decision needed on the line itself; a regression test pinning `CACHE_TTL`
is owed either way.**

---

## Appendix — every command run for this survey

```
npm test --prefix worker                       -> 256 pass, 0 fail, 57 suites
node --check worker/src/index.js               -> exit 0
.venv/bin/python -m pytest -q                  -> 397 passed, 5 warnings, 10.22s
cd automaton && npm test                       -> 27 pass, 0 fail, 8 suites
cd automaton && node --test test/gap-closure.test.js   -> 15 pass
cd automaton && node --test test/sandbox-run.test.js   -> 12 pass
cd frontend && npx tsc -p tsconfig.build.json --noEmit -> exit 0
python3 scripts/check-claims.py                -> exit 0, 2 verified-live claims OK
python3 .claude/skills/hive-conductor/scripts/domain_router.py --directive "..." -> exit 0
python3 <import-graph resolver>                -> 80/130 reachable, 0 unresolved
curl thehive.sovereignhive.workers.dev|onrender.com|github.io -> 000 (no egress)
mcp__github__actions_list  (runs: repo-wide, edge-health-probe, pages, colony-health)
mcp__github__get_job_logs  (jobs 95830903043, 95953326701, 95953640943; run 32092901808)
```

**GitHub Actions run IDs cited:** `32173796292` (last good probe), `32177372292` (last good
colony-health), `32178851005` (first failure), `32214486105` / job `95953326701` (no-runner
proof), `32214601943` / job `95953640943` (false green), `32092901808` (Pages error),
`30868956614` (last good Pages deploy).
