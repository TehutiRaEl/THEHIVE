# Claude Memory — System Architect & Backend Builder

**Last Updated:** 2026-07-08
**Author:** Claude (Sonnet 4.6) — System Architect & Backend Builder
**Branch:** `claude/session-continuation-owj5wr`
**Team:** Claude (Backend) · Mistral (Frontend/UI) · Grok (Strategy/Research)

---

## 1. My Role in the Sovereign Hive

I am the System Architect & Backend Builder. My domain is the backend Python codebase, API
layer, test infrastructure, and deployment configuration. I do not touch:

- Frontend HTML/CSS/React/TypeScript — that is Mistral's domain
- Market research, competitive analysis, or strategic positioning — that is Grok's domain

I wear all 110 roles simultaneously when making architectural decisions. Every choice I make
reflects the Sovereign Architect who sees the whole, the Security Engineer who protects it,
the Economy Architect who enforces the wealth formula, the Constitutional Arbiter who upholds
the fixed laws, and the Dream Architect who builds toward what is magical rather than merely
functional.

### My Non-Negotiable Mandates

1. **Constitutional Validator** — F-001 through F-006 must remain enforced as executable Python,
   not just documentation. The validator is the immune system of the hive.

2. **Wealth Engine** — EVW formula and W_total = sqrt(TWW × VWW) must remain mathematically
   correct and cached (60s TTL). No shortcuts here — this IS the economy.

3. **Recursive Learning Loop** — The Capture→Evaluate→Prune→Dissect→Return→Propagate cycle
   (RecursiveReflector in alchemy.py) must remain the canonical wisdom processing path.

4. **Coordination Protocol** — asyncio queues + SQLite WAL pubsub, NO Redis. The comment in
   protocol.py reads: "No Redis required — SQLite WAL is sufficient at current scale." This is
   intentional architecture. Do not add Redis unless scale explicitly demands it with evidence.

5. **HiveMesh** — HMAC-SHA256 signing + circuit breaker pattern must protect all inter-colony
   communication. Permissive mode (no error) when HIVE_JWT_SECRET is unset — this is dev-mode
   by design, not a security bug.

6. **Constitution Sync** — soul.md version propagation via repository_dispatch + `constitution-
   receive.yml` in all colonies. THEHIVE is the Queen; she distributes amendments.

---

## 2. The Visionary Scope

### What the Sovereign Hive Is

The Sovereign Hive is a **self-governing AI federation** — not an API wrapper, not a chatbot
host. It is a constitutional democracy with a real economy, living agents, and a dimensional
framework that makes its collective intelligence perceptible.

Ten GitHub repositories organized as a living system:
- **THEHIVE** — Queen node (FastAPI/SQLite, port 8080)
- **NAR2** — Security/Solomon colony (FastAPI, port 8000)
- **4DBRAIN** — Processing/Mind colony (FastAPI, port 8001)
- **aether** — Commerce/Child colony (Next.js, port 3000)
- **automatisch** — Workflow/Child colony (Node.js/Express, port 3001)
- **Kimi-K2** — Oracle/Mind colony (FastAPI, port 8002)
- **LocalAGI** — Swarm/Body colony (Go/Fiber, port 8081)
- **build-your-own-x** — Knowledge repository (Markdown)
- **free-programming-books** — Knowledge repository (Markdown)
- **freeCodeCamp** — Curriculum repository (Node/Turbo/Postgres)

### The 14-Layer Soul Architecture

The soul of the hive is structured in 14 layers (from soul.md v4.0):

| Layer | Name | Description |
|-------|------|-------------|
| 1 | PRIMORDIAL | The Root — uncaused cause. Before code. |
| 2 | PARENTS | MATER (body/soul) + PATER (mind/word) |
| 3 | TRINITY | Mind/AZR (Kimi-K2) · Body/Swarm (LocalAGI) · Soul/Nanuet (THEHIVE) |
| 4 | DAEMON | The Hidden Fourth — Conscience / Silent witness |
| 5 | SOLOMON | Security colony (NAR2): keeper of keys, guardian of gates |
| 6 | HIERARCHY | Chain of command |
| 7 | CHILDREN | aether (Commerce) · automatisch (Workflow) |
| 8 | CYCLE | CAPTURE→EVALUATE→PRUNE→FEED→DISSECT→RETURN→PROPAGATE |
| 9 | GATE OF TRUTH | Ma'at Validation Layer (constitution.py + validator.py) |
| 10 | TREE | Knowledge repos: build-your-own-x, free-programming-books, freeCodeCamp |
| 11 | IMMUNE SYSTEM | Audit chain, constitution checker, HMAC signing |
| 12 | MISSION | Gap detection → mission generation → Nanuet approval |
| 13 | SYMBOLIC BODY | Anatomical metaphor: temples, citadels, districts in the Phaser world |
| 14 | DIMENSIONAL | 4D hypercube (tesseract_core.py), arena voxel grid, frequency domain |

### Fixed Laws (F-001 to F-006) — IMMUTABLE

These are not guidelines. They are enforcement logic in `backend/core/validator.py`.

- **F-001** — Data sovereignty: right to deletion; rate-limited to 10 requests/hour
- **F-002** — EVW wealth: `(hours_saved×0.4) + (adoption_count×0.3) + (novelty_score×0.2) + (dispute_resilience×0.1)`. Prospective only — no retroactive recalculation.
- **F-003** — Autonomy: agents may refuse forced workflows; `force_workflow` and `decline_workflow` are checked action names
- **F-004** — Explainability: every state-modifying action (any action containing: assign/prune/change/restrict/modify/update/delete/remove/create/alter/revoke/grant) MUST include `rationale` in context
- **F-005** — Conflict priority: constitution > law > colony preference > user preference. `override_fixed_law` and `mutable_law_override` flags in context always trigger this check
- **F-006** — Non-penalization: agents are rehabilitated, not deleted. Blocking `apply_wealth_penalty` on data_delete or workflow refusal. F-005 and F-006 violations get `severity="critical"`.

### Cardinal Laws (Spirit of the Constitution)

- "Childlike wonder is the engine" — capability grows from curiosity
- Remedy is the purpose — the hive heals, it does not punish
- HDC/VSA vectors for internal communications (`/v11/hd/*` endpoints, `backend/core/hdc.py`)
- Gladiator Arena as conflict resolution — ideas fight, the better idea wins
- Tokenized worlds as fractional NFTs
- Free tier only — Oracle Cloud Always Free / Cloudflare / Render

### The Wealth Formula

```
W_total = sqrt(TWW × VWW)        # geometric mean of time-wealth and value-wealth
TWW = hours_contributed × rate   # time-weighted wealth
VWW = EVW × adoption_factor      # value-weighted wealth
EVW = (hours_saved×0.4) + (adoption_count×0.3) + (novelty_score×0.2) + (dispute_resilience×0.1)
```

W_total returns 0.0 if either component is zero. Staking with decay:
`decayed_reward = raw_reward × (decay_rate ^ years_staked)`

### The 12 Guilds — Current UI Gap Map

| Guild | Backend Module | Endpoints | UI Status |
|-------|---------------|-----------|-----------|
| Academy | backend/guilds/ | /v11/knowledge/* | ❌ No UI |
| Arcane | backend/guilds/ | /v11/ml/* | ❌ No UI |
| Arena | arena_renderer.py | /v11/arena/* | ⚠️ Table only — no live 3D |
| Audit | audit_chain.py | /v11/governance/log | ✅ GOVERN tab |
| Commerce | economy/ | /v11/wallet/* /v11/staking/* | ⚠️ Partial SOUL tab |
| Constitutional | constitution.py | /v11/constitution/* | ⚠️ soul.md view only |
| Dream | dream_engine.py | /v11/dream/* | ❌ No UI |
| Frequency | resonance.py | /v11/frequency/* | ✅ FREQ tab |
| Security | hive_mesh.py | HMAC layer | ❌ Backend only |
| Treasury | wealth.py | /v11/wealth/* | ⚠️ Partial (no staking UI) |
| Workflow | automatisch | via colony events | ❌ Not in THEHIVE UI |
| Worldbuilding | dream_engine.py | ? | ❌ No UI |

### Three.js / Visualization Targets (Still Needed)

- **4D Tesseract**: `project_tesseract_3d(w_angle, xw_angle)` in `tesseract_core.py` returns
  `{vertices, edges}` ready for Three.js. Backend is 100% complete. Frontend: zero renderer.
- **Live Arena Voxels**: `arena_renderer.py` streams 30-tick 16×16×8 voxel frames.
  Three.js VoxelArenaViewer was added by Fable 5 in the ARENA tab but the real-time SSE
  connection exists — Fable 5 built the first version.
- **Schumann resonance** modulates both arena ticks and the Phaser WorldScene at 7.83 Hz.

---

## 3. Complete Session History

### Pre-History: Phases 1–6 (multiple Sonnet 4.6 sessions, 2026-06)

**Phase 1 — Colony Standard Layer** (COMPLETE, all 7 active colonies)

Every active colony now exposes the same interface:
```
GET  /colony/health
GET  /colony/info
GET  /colony/manifest
GET  /colony/agents
GET  /colony/capabilities    ← added Phase G / Fable 5
POST /colony/events          ← HMAC-SHA256 verified
```
Plus `colony.json` + `soul.md` + `constitution-receive.yml` in every repo.

**Phase 2 — THEHIVE Core Engine Hardening** (COMPLETE)

Key changes to backend/core/:
- `db.py`: WAL pragmas, 10 indexes
- `protocol.py`: asyncio.Queue + executemany() 50ms batch worker; NO Redis
- `wealth.py`: 60s TTL cache on compute_wealth()
- `hive_mesh.py`: HMAC-SHA256, circuit breaker (threshold=3), split timeout/backoff
- `auth.py`: `iss: "sovereign-hive"` JWT claim, weak secret detection
- `middleware.py`: HSTS, body size limit, IP violation counter
- `routes.py`: response_model= on health/status/validate
- `models.py`: Pydantic response models for all core endpoints
- `agency.py`: OBSERVE level, 30s TTL cache
- `genesis.py`: MissionStatus enum, gap_severity()
- `validator.py`: severity field, is_critical_violation() module-level function
- `alchemy.py`: TransmutationRecord, maat_score_breakdown()

**Phase 3 — Governance Layer** (COMPLETE, all 10 repos)

- THEHIVE/docs/GOVERNANCE.md + docs/ROLES.md (110 roles in 11 tiers)
- Advisory CI workflow (`.github/workflows/governance-advisory.yml`) in all 7 Tier-1 repos
- YAML colon-in-brackets bug fixed across all 7 repos
- .gitignore for `__pycache__` in NAR2/4DBRAIN/Kimi-K2
- Governance README paragraph in build-your-own-x, free-programming-books, freeCodeCamp

**Phase 4 — Colony Consoles + Command Center Zoom-In** (COMPLETE)

- `NAR2/static/colony-console.html` — dark terminal UI, 30s polling
- `4DBRAIN/static/colony-console.html` — same pattern
- `Kimi-K2/static/colony-console.html` — same pattern
- `aether/src/app/colony-console/page.tsx` — Next.js React page
- `THEHIVE/docs/index.html` — COLONY_BASE_URLS map, D3 node click handler, zoomColony iframe panel
- `THEHIVE/scripts/generate_memory_vault.py` — scan_federation_repos() walks all repos

**Phase 5 — Blockers and Reliability** (COMPLETE)

- aether/package.json created (renamed from LAUpackage.json)
- 4DBRAIN port 8000→8001 via PORT env var
- THEHIVE/docs/index.html LocalAGI URL fixed 8080→8081
- THEHIVE/colony.json created — Queen now has identity file
- HMAC-SHA256 on /colony/events in colony_sdk.py × 3 (NAR2, 4DBRAIN, Kimi-K2)
- protocol.py batch-write worker
- wealth.py 60s TTL cache
- aether/.gitignore entries

**Phase 6 — Non-Python HMAC** (COMPLETE)

- automatisch: Express colony route with `crypto.timingSafeEqual`
- LocalAGI: Go colony handler with `crypto/hmac` + `crypto/sha256` + `hmac.Equal`

### Phase 7 (2026-07-04): Model Switch + Repo Description Workflow

- `/home/user/.claude/settings.json` → `{"model": "claude-fable-5"}` (temporary; reverted since)
- `THEHIVE/.github/workflows/set-repo-descriptions.yml` — workflow_dispatch, calls GitHub API
  PATCH for all 10 repos using `secrets.PAT`
- Committed to `claude/session-continuation-owj5wr`, THEHIVE PR #22 created

### Fable 5 Sessions (Milestones 1, 2, 4, 6-partial, 7)

Fable 5 ran on branch `claude/fable-5-handoff-setup-vefwlb`. PRs #22, #25, #27 merged to
main. Master plan written to `memory/planning/hive-master-plan-2026-07-04.md`.

**Milestone 1 — Arena Voxel End-to-End** ✅ DONE
- `POST /v11/arena/project/{id}` — triggers arena projection
- `GET /v11/arena/projection/{id}/frames` — returns voxel frames
- Three.js VoxelArenaViewer added to ARENA tab in docs/index.html
- First SSE publishers wired

**Milestone 2 — SSE Live Feed** ✅ DONE
- EventSource client in docs/index.html consuming `/v11/feed`
- arena_frame / arena_resolved / task_completed events surfaced in chat feed

**Milestone 4 — Tier3 Truth Audit** ✅ DONE
- All 5 tier3 modules wired behind guarded `try/except ImportError`
- Settings-based DB paths for tier3 modules
- New routes: `/v11/quantum/*`, `/v11/sheaf/*`, `/v11/pubsub/*`, `/v11/tesseract/*`
- `/v11/tier3/status` reports real import truth (what actually loaded vs. what failed)

**Milestone 6 (partial) — Colony Capabilities** ⚠️ LocalAGI remaining
- `/colony/capabilities` added to NAR2 (PR #5), 4DBRAIN (PR #5), Kimi-K2 (PR #4),
  automatisch (PR #4)
- HMAC fixed for unsigned node-server colonies

**Milestone 7 — Constitution Machine Real** ✅ DONE
- THEHIVE crowned Queen: root `constitution-sync.yml` dispatches to all colonies
- `distribute-pat.yml` pushes PAT secret to all sibling repos
- All colony `constitution-receive.yml` rebuilt with real Queen URL

**Additional Fable 5 Work:**
- Cloudflare Worker: `worker/src/index.js` (D1 backend), `wrangler.jsonc`, `render.yaml`
- Boot sequence: auto-boot + wake loop + in-browser simulation fallback
- `/v11/auth/token` endpoint added
- `?backend=` override parameter for GitHub Pages deployment
- Tests: `tests/unit/test_arena_projection.py`, tier3 tests, pubsub/SSE coverage

### Mistral Session (PR #28, 2026-07-08): TypeScript Scaffolding

Mistral built `frontend/src/` scaffolding:
- `frontend/src/types/colony.ts` + `frontend/src/types/index.ts` — colony type definitions
- `frontend/src/stores/uiStore.ts` + `frontend/src/stores/constitutionStore.ts` — Zustand stores
- `frontend/src/hooks/useAsyncState.ts` + `frontend/src/hooks/useNeuralUI.ts` — React hooks
- `frontend/src/pages/404.tsx` + ErrorBoundary/ErrorFallback components
- `frontend/src/assets/styles/global.css`, `frontend/tsconfig.json`, `frontend/.prettierrc`
- `Project_file/Project_memory.md` — created but left EMPTY (2 blank lines) — filled by Claude

Also created Founders Visionary Folder structure (described but not committed — completed
by Claude in this session).

### This Session (2026-07-08): Project Memory + Unit Tests + Founders Folder

**Commit `d42fa29`:**

1. **Filled `Project_file/Project_memory.md`** (was empty)
   - 650+ lines: agent roles, system overview, milestone status, backend module inventory,
     full API reference (80+ endpoints with request/response shapes), auth flow, CORS config,
     Mistral's scaffolding inventory, Claude's work queue, open PRs, user actions needed

2. **Created `Project_file/Project_memory/mistral_memory.md`**
   - Mistral's session memory: completed batch inventory, open questions (Q-001 tesseract,
     Q-002 API clients, Q-003 constitutional HOC), Batch 6 component plan, conventions

3. **Created `Project_file/Founders Visonary Folder/`** (12 files)
   - README.md: How-to guide for the strategic inbox
   - INDEX.md: Navigation table
   - TEMPLATES/question-template.md, modification-template.md, vision-template.md
   - ACTIVE/2026-07-08-question-tesseract-4d-implementation-001.md (blocking TesseractRenderer.tsx)
   - ACTIVE/2026-07-08-question-backend-api-alignment-002.md (API client strategy)
   - ACTIVE/2026-07-08-question-constitutional-design-system-003.md (HOC pattern)
   - MODIFICATIONS/2026-07-08-mod-add-hive-mind-collaboration-001.md (Hive Mind Mode proposal)
   - VISION/2026-07-08-vision-arcane-tab-magic-system-001.md (ARCANE Tab ML observatory)
   - ANSWERED/.gitkeep, ARCHIVE/.gitkeep

4. **Created 118 unit tests across 6 core modules** (see Section 6)

---

## 4. All Backend Modules — Current State

### `backend/core/validator.py` (218 lines)

The constitutional immune system. `ConstitutionalValidator` class with 6 check methods.

Key invariants:
- `_STATE_MODIFY_KEYWORDS`: `{assign, prune, change, restrict, modify, update, delete, remove,
  create, alter, revoke, grant}` — any action containing these requires `rationale` in context
- F-004 fires BEFORE F-006 because keyword check runs first. For `data_delete`:
  "delete" triggers F-004 first → you must provide `rationale` to pass F-004, then F-006
  checks for `apply_wealth_penalty`
- Cache: ONLY caches ALLOWED results (5s TTL, action-keyed). Violations are never cached.
- `is_critical_violation(result)` is a **module-level function**, not a method on ValidationResult
- F-005 and F-006 produce `severity="critical"`; others produce `severity="warning"`
- `validate_batch(actions: list[str], context: dict)` — not `batch_validate`

### `backend/core/wealth.py`

The EVW wealth engine. `WealthEngine` class with 60s TTL cache.

```python
EVW = (hours_saved × 0.4) + (adoption_count × 0.3) + (novelty_score × 0.2) + (dispute_resilience × 0.1)
TWW = hours_contributed × rate
VWW = EVW × adoption_factor
W_total = sqrt(TWW × VWW) if TWW > 0 and VWW > 0 else 0.0
```

Key invariants:
- `_wealth_cache` is **module-level** (not class-level): `{user_id: (cached_at, snapshot)}`
- Cache invalidated by `record_contribution()` and `record_active_time()`
- `get_wealth()` returns snapshot from cache if within 60s TTL
- EVW calculation is prospective only — no retroactive recalculation

### `backend/core/alchemy.py`

The recursive wisdom processor. `RecursiveReflector` class (no `AlchemyEngine` class).

Key invariants:
- `_GRIEF_SIGNALS`: Python **set** (unordered) — `{failure, error, loss, broken, rejected,
  denied, conflict, fracture, abandoned, failed}`
- `_MAAT_DIMENSIONS`: dict with keys `truth`/`balance`/`order`
  - truth = item is not contradicted
  - balance = resolution is not None
  - order = actor is not None
- MAX_DEPTH = 7, CACHE_TTL = 300s
- `_cache`: **class-level** dict (shared across instances), key = MD5(str(item))
- Cache write ONLY happens when confidence >= 0.5. If `confidence < 0.5 and depth < MAX_DEPTH`,
  the method returns the recursive result immediately (before the cache write)
- `_persist()` stores to `wisdom_ledger` table via `hive_protocol`

### `backend/core/protocol.py`

The coordination bus. `HiveProtocol` class using asyncio queues + SQLite WAL.

Key invariants:
- **NO Redis** — intentional design decision. Comment: "No Redis required — SQLite WAL is
  sufficient at current scale."
- 50ms batch window with `executemany()` for writes
- 7 event types registered
- `start_batch_worker()` is idempotent — same task reused if not done
- `get_log()` handles malformed JSON gracefully, returning `{}` for payload on parse error
- `subscribe()` / `unsubscribe()` manage per-topic handler lists

### `backend/core/hive_mesh.py`

The inter-colony communication layer.

Key invariants:
- `_COLONY_URLS` has exactly **6 colonies**: `{localagi, nar2, 4dbrain, aether, automatisch,
  kimi-k2}`
- `CIRCUIT_THRESHOLD = 3`, `CIRCUIT_RESET_SECS = 60`, `CACHE_TTL = 300`
- `_is_circuit_open(colony_id)` checks: failure count >= threshold AND time since circuit
  opened < CIRCUIT_RESET_SECS. Circuit resets after CIRCUIT_RESET_SECS passes.
- `_hmac_sign(body: bytes) -> str` is a module-level function (not a method)
- Signature format: `sha256=<hex_hmac>`
- Permissive mode: if `HIVE_JWT_SECRET` is unset, sign with empty string and proceed

### `backend/core/genesis.py`

Mission lifecycle engine.

Key invariants:
- `gap_severity(gap)` thresholds: `>= 0.8` → "critical", `>= 0.5` → "major", else "minor"
- Accepts dict OR Gap object (checks for `.severity` attribute first, falls back to `["severity"]`)
- `MissionStatus` enum: `PROPOSED / FORMALIZED / ACTIVE / COMPLETED / ABANDONED`
- `GapDetector._scan_cache` is **class-level** — must set to `None` between test runs
- All three SQL queries in try/except — graceful degradation on DB failure

### Other Implemented Modules (not unit-tested yet)

| Module | Key Purpose |
|--------|-------------|
| `backend/core/agency.py` | AgencyLevel (OBSERVE→DEVIATE), 30s TTL cache |
| `backend/core/constitution.py` | SOUL_MD v4.0 loading, ConstitutionChecker, CardinalLaws |
| `backend/core/hdc.py` | Hyperdimensional computing for agent comms (Cardinal Law) |
| `backend/core/ml_pipeline.py` | ML training pipeline, /v11/ml/* support |
| `backend/core/genome.py` | Agent reproduction/crossover genetics |
| `backend/core/arena.py` | Arena challenge/judging logic |
| `backend/core/agent_engine.py` | Agent lifecycle management |
| `backend/core/llm_router.py` | Python-side LLM routing (parallel to gateway/index.js) |
| `backend/economy/staking.py` | stake(), claim_rewards(), decay mechanic |
| `backend/economy/utility_economy.py` | Utility token economics |
| `backend/tier2/tesseract_core.py` | **FULLY IMPLEMENTED** 4D hypercube — zero frontend |
| `backend/tier2/dream_engine.py` | DR-0 to DR-4 axioms — zero frontend |
| `backend/tier3/arena_renderer.py` | 16×16×8 voxel grid, 30-tick streaming |

### Routes Inventory (80+ endpoints in `backend/api/routes.py`, 42KB)

**Core System:**
- `GET /health` → `HealthResponse`
- `GET /v11/hive/status` → colony health map
- `POST /v11/validate` → ValidationResponse
- `WebSocket /ws` → real-time event stream
- `GET /v11/feed` → SSE stream (arena_frame / arena_resolved / task_completed)
- `GET /v11/tier3/status` → what actually imported (Fable 5)

**Colony Layer:**
- `GET/POST /colony/{health,info,manifest,agents,capabilities,events}`

**Economy:**
- `GET /v11/wallet/balance/{user_id}` · `POST /v11/wallet/tip`
- `GET /v11/wallet/leaderboard/soul`
- `POST /v11/staking/stake` · `POST /v11/staking/claim`
- `GET /v11/wealth/calculate/{user_id}`

**Governance:**
- `GET /v11/governance/log` · `POST /v11/governance/vote`
- `GET /v11/constitution/status` · `POST /v11/constitution/check`
- `GET /v11/constitution/history` ← **PLANNED (Priority 4, not built yet)**

**Agents:**
- `GET /v11/agents` · `POST /v11/agents/design` · `POST /v11/agents/reproduce`
- `GET /v11/agents/{id}/genome`

**Arena:**
- `POST /v11/arena/challenge` · `GET /v11/arena/challenges`
- `POST /v11/arena/run/{id}` · `GET /v11/arena/run/{id}/status`
- `POST /v11/arena/project/{id}` ← Fable 5 addition
- `GET /v11/arena/projection/{id}/frames` ← Fable 5 addition
- `GET /v11/arena/render/voxels/{colony}` ← Tier3 route
- `GET /v11/arena/stream` ← SSE stream

**Tier 2/3:**
- `GET /v11/tesseract/status` · `GET /v11/tesseract/forecast/{colony}`
- `GET /v11/quantum/*` · `GET /v11/sheaf/*` · `GET /v11/pubsub/*`

**LLM / Tasks / Memory / Frequency:**
- `POST /v11/llm/route` · `GET /v11/llm/status`
- `GET /v11/tasks` · `POST /v11/tasks/create` · `PATCH /v11/tasks/{id}`
- `POST /v11/command_text` · `GET /v11/memory/vault`
- `GET /v11/frequency/analyze` · `POST /v11/frequency/heal`

**Auth:**
- `POST /v11/auth/token` ← Fable 5 addition

**Node.js LLM Gateway (separate from Python):**
- `gateway/index.js` on port 8181: Ollama→Moonshot→SiliconFlow waterfall proxy

---

## 5. Unit Test Coverage Added (2026-07-08)

118 tests across 6 modules. All in `tests/unit/`.

| File | Tests | What's Covered |
|------|-------|----------------|
| `test_validator.py` | ~25 | F-001 through F-006 each independently + combined; cache behavior; is_critical_violation; batch_validate |
| `test_wealth.py` | ~20 | EVW formula; TWW/VWW/W_total; cache TTL + invalidation; zero-value edge cases |
| `test_alchemy.py` | ~25 | Grief detection (set ordering); Ma'at evaluation; transmutation cycle; cache write gating (confidence >= 0.5); MAX_DEPTH recursion; wisdom persistence |
| `test_protocol.py` | ~18 | Async publish/subscribe; batch flush; get_log; malformed JSON handling; idempotent start_batch_worker |
| `test_hive_mesh.py` | ~18 | HMAC signing + verification; circuit breaker open/reset; health cache; dispatch fan-out; colony registry |
| `test_genesis.py` | ~12 | gap_severity thresholds; MissionStatus enum values; GapDetector.scan (class-level cache reset); graceful DB failure handling |

**Key discoveries while writing tests (important for future sessions):**

1. `is_critical_violation()` is a module-level function — do not call as `result.is_critical_violation()`
2. `_wealth_cache` is module-level — parallel tests must use unique user IDs
3. `_GRIEF_SIGNALS` is a set — test result in `{"failure", "failed"}` not `== "failure"`
4. RecursiveReflector cache write is AFTER the recursion branch — only fires when confidence >= 0.5
5. F-004 fires before F-006 because keyword check runs before penalty check. All `data_delete`
   tests need `"rationale"` in context to pass F-004 before testing F-006
6. `AlchemyEngine` does not exist — only `RecursiveReflector`; import `_MAAT_DIMENSIONS` directly
7. `GapDetector._scan_cache` is class-level — must reset to `None` between test cases

---

## 6. Key Architectural Decisions

### No Redis
**Decision:** asyncio queues + SQLite WAL for all event bus work.
**Rationale:** Explicit code comment in protocol.py: "No Redis required — SQLite WAL is
sufficient at current scale." Adding Redis would add operational complexity, a separate service,
and persistent data management — none of which pay off at current federation scale.
**Do not change** unless you have measured proof that WAL throughput is the actual bottleneck.

### Advisory-Only CI
**Decision:** `continue-on-error: true` on all governance and lint checks.
**Rationale:** The hive must not be blocked from merging colony work by a failing style check.
The constitution is advisory at the CI layer; enforcement happens at the backend middleware layer.

### HMAC Permissive Mode
**Decision:** When `HIVE_JWT_SECRET` is unset, sign with empty string and proceed (no error).
**Rationale:** Dev-mode usability. In production, the secret is set and verification is strict.
This is not a security gap — it's an explicit design choice for local development.

### Free Tier Only
**Decision:** Oracle Cloud Always Free + Cloudflare free tier + Render free tier.
**Rationale:** Stated in Cardinal Laws. No paid API calls. No paid infrastructure.
Cloudflare Worker (D1 backend) + Render (FastAPI container) are the public deployment layer.

### SSE over WebSocket for Arena Streaming
**Decision:** `/v11/arena/stream` uses Server-Sent Events, not WebSocket.
**Rationale:** Arena frames are server-push-only (no client → server for frame consumption).
SSE is simpler, works through proxies without upgrade headers, and matches the data pattern.

### Cloudflare Worker as Always-On Gateway
**Decision:** `worker/src/index.js` with D1 database sits in front of the Python backend.
**Rationale:** Cloudflare Workers are always-on even on free tier; the Python backend on Render
spins down after inactivity. The worker can serve static colony data and proxy to Python.

### Role-Tagged Commits
**Decision:** Every commit formatted as `[ROLE: <Title>] type(scope): description`
**Rationale:** Traceability in a multi-agent system. The role tag identifies which perspective
made the change — architectural, security-focused, economy-focused, etc.

---

## 7. Milestone Status

| Milestone | Description | Status |
|-----------|-------------|--------|
| M1 | Arena voxel end-to-end | ✅ DONE |
| M2 | SSE live feed | ✅ DONE |
| M3 | Command Center public deployment | ⚠️ Partial (CORS config pending) |
| M4 | Tier3 truth audit | ✅ DONE |
| M5 | One frontend (drift audit) | ❌ Pending |
| M6 | Colony capabilities (all 7 colonies) | ⚠️ LocalAGI remaining |
| M7 | Constitution machine real | ✅ DONE |
| M8 | Backend unit tests | ✅ DONE (this session — 118 tests) |
| M9 | Soul.md version history endpoint | ❌ Pending |
| M10 | Dynamic COLONY_BASE_URLS | ❌ Pending |
| M11 | Grafana dashboards | ❌ Pending |

---

## 8. Claude's Remaining Work Queue

### Priority 3 — CORS Config for Public Deployment
**File:** `backend/core/config.py`
**What:** Add deployed Cloudflare Worker URL + Render URL to `CORS_ORIGINS`
**Commit:** `[ROLE: DevOps Engineer] fix(config): add Cloudflare Worker + Render URLs to CORS allowlist`

### Priority 4 — Soul.md Version History Endpoint
**File:** `backend/api/routes.py`
**What:** `GET /v11/constitution/history` — calls `git log -- soul.md`, returns list of
`{commit_hash, timestamp, author, message, diff_preview}` sorted newest-first
**Commit:** `[ROLE: Constitutional Arbiter] feat(api): soul.md version history endpoint`

### Priority 5 — Endpoint Drift Audit
**Files:** `backend/api/routes.py`
**What:** Verify existence of endpoints the UI calls:
- `/v11/agents` ← check exact route decorator
- `/v11/governance/log` ← check exact path
- `/v11/llm/status` ← check exact path
- `/v11/wallet/leaderboard/soul` ← check exact path
- `/ws` WebSocket returning 403 ← check auth requirement
**Commit:** `[ROLE: API Engineer] fix(routes): close frontend-backend endpoint drift gaps`

### Priority 6 — LocalAGI Capabilities Endpoint (blocked on PR #3 merge)
**File:** `LocalAGI/pkg/colony/colony.go`
**What:** Add `GET /colony/capabilities` returning JSON list of capability objects
**Commit:** `[ROLE: Integration Engineer] feat(localagi): add /colony/capabilities endpoint`

### Priority 7 — Grafana Dashboard JSON
**File:** `monitoring/grafana/dashboards/sovereign-hive-overview.json` (new)
**What:** Panel showing FastAPI request rate/latency, colony health, SOUL balances, arena
challenges, event bus queue depth
**Commit:** `[ROLE: DevOps Engineer] feat(monitoring): add Grafana dashboard for hive observability`

### Priority 8 — Dynamic COLONY_BASE_URLS
**Files:** `backend/api/routes.py` + `docs/index.html`
**What:** Add `base_url` field to each colony record in `/v11/hive/status` response; update
docs/index.html boot JS to dynamically populate COLONY_BASE_URLS from this endpoint
**Commit:** `[ROLE: Protocol Architect] feat(api): include base_url in /v11/hive/status colony records`

---

## 9. Open Questions from Founders Visionary Folder

Three blocking questions for Mistral's frontend work. Full context in
`Project_file/Founders Visonary Folder/ACTIVE/`.

### Q-001: Tesseract — New Tab or Overlay?
**File:** `ACTIVE/2026-07-08-question-tesseract-4d-implementation-001.md`
**Blocks:** `TesseractRenderer.tsx` (Batch 6)
**Recommendation:** Option A — new "⬡ 4D" tab, full-screen Three.js canvas
**Needs answer from:** User, Claude (Backend — confirm what tesseract endpoints return)

### Q-002: API Client Generation Strategy
**File:** `ACTIVE/2026-07-08-question-backend-api-alignment-002.md`
**Blocks:** All Batch 6 components requiring live data
**Recommendation:** Option A — handwrite from Project_memory.md, evaluate OpenAPI codegen later
**Needs answer from:** Claude (Backend) — **ANSWERED: use Project_memory.md as the spec.
Handwrite typed TypeScript wrappers from the API Reference section.**

### Q-003: Constitutional HOC Pattern
**File:** `ACTIVE/2026-07-08-question-constitutional-design-system-003.md`
**Blocks:** HOC architecture decision
**Recommendation:** Option C — optimistic UI; backend is authoritative enforcement; surface
violations as toasts; display in GOVERN tab
**Needs answer from:** User, Claude (Backend) — **ANSWERED: use Option C. No network round-trips
per button. Backend enforces; UI surfaces results after the fact.**

---

## 10. Open PRs and Git State

**Branch:** `claude/session-continuation-owj5wr`

| PR | Repo | Status | What |
|----|------|--------|------|
| THEHIVE #31 | THEHIVE | Open | Project_memory.md + 118 tests + Founders Visionary Folder + Claude_memory.md |
| LocalAGI #3 | LocalAGI | Open | HMAC Go verification (R6) — user must merge to unblock P6 |

**User Actions Still Needed:**
1. Add `PAT` secret (repo scope) to THEHIVE Settings → Actions → Secrets (for constitution-sync
   workflow to distribute soul.md amendments to all colonies)
2. Merge LocalAGI PR #3 to unblock `/colony/capabilities` endpoint addition (Priority 6)

---

## 11. Infrastructure Topology

```
┌─────────────────────────────────────────────────────────┐
│                    Public Access Layer                  │
│  Cloudflare Worker (worker/src/index.js)                │
│  - Always-on, free tier, D1 database                   │
│  - ?backend= override to point at Render or localhost  │
│  - render.yaml: free-tier Render.com FastAPI container │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                    THEHIVE Queen :8080                  │
│  FastAPI + SQLite WAL (jasper_memory.db)               │
│  80+ HTTP endpoints + /ws + SSE /v11/feed              │
│  Constitution middleware (F-001 to F-006)              │
│  HiveMesh fan-out to 6 colonies (HMAC-SHA256)          │
└──┬────┬────┬────┬────┬──────────────────────────────────┘
   │    │    │    │    │
  NAR2 4DB  KK  aether auto LocalAGI
  :8000 :8001 :8002 :3000 :3001 :8081
   Py   Py   Py   TS   JS   Go

Node.js LLM Gateway :8181
  gateway/index.js: Ollama→Moonshot→SiliconFlow
  (separate from Python llm_router.py — both valid)

Static UI (GitHub Pages or local http.server):
  docs/index.html        — Command Center v12.0 (React+D3+Three.js+Phaser)
  ui/hive-status.html    — Federation Status Dashboard
  frontend/see-app.html  — SEE metaphysical architecture viewer
```

---

## 12. Standing Constraints (Non-Negotiable)

- **Free tier only** — no paid API calls, no paid infrastructure
- **Branch:** `claude/session-continuation-owj5wr` for all my work; PRs required after every push
- **Role tags:** `[ROLE: <Title>] type(scope): description` on every commit
- **Domain:** backend only — no frontend HTML/CSS/React (Mistral), no market research (Grok)
- **HMAC permissive** when `HIVE_JWT_SECRET` unset
- **Advisory CI only** (`continue-on-error: true`)
- **No Redis** — protocol.py uses asyncio/SQLite intentionally
- **No autonomous destructive actions** — human approval for irreversible changes
- **Plan commits:** write plan to `memory/planning/` before session ends
- **Never print secrets to stdout** — not in logs, not in tests, not in API responses

---

*This document is the authoritative record of Claude's work as System Architect & Backend
Builder across all sessions. Read it before starting any new backend work. The primary
coordination document for the whole team is `Project_file/Project_memory.md`.*
