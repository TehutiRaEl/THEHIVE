# Sovereign Hive — Project Memory & Team Coordination
*Last updated: 2026-07-08 | Maintained by: Claude (Backend)*

---

## 1. Agent Roles

| Agent | Domain | Branch | Focus |
|-------|--------|--------|-------|
| **Claude** | Backend / Infrastructure | `claude/session-continuation-owj5wr` | API, DB, auth, tests, CI, constitution |
| **Mistral** | Frontend / UI | `mistral/frontend-command-center` | React app, TypeScript scaffolding, component library |
| **Grok** | Strategy / Research |`grok-strategist-main` | Architecture decisions, LLM integration strategy |

**Coordination rule:** This file is the shared source of truth. Update it when your domain state changes. Mistral reads the Backend API Reference (section 5) to know what endpoints exist.

---

## 2. System Overview

THEHIVE (FastAPI/SQLite, port 8080) is the Queen node of a 10-repo federation.
Seven active colonies respond to federation events; three repos are static knowledge.

**Port map:**

| Colony | Stack | Port |
|--------|-------|------|
| THEHIVE (Queen) | Python/FastAPI + SQLite WAL | 8080 |
| NAR2 (Security) | Python/FastAPI | 8000 |
| 4DBRAIN (Memory) | Python/FastAPI | 8001 |
| Kimi-K2 (Mind/LLM Gateway) | Python/FastAPI | 8002 |
| aether (Commerce/CHILD) | TypeScript/Next.js | 3000 |
| automatisch (Workflow/CHILD) | Node.js/Express | 3001 |
| LocalAGI (Body/Swarm) | Go/Fiber | 8081 |
| LLM Gateway (standalone) | Node.js | 8181 |

---

## 3. Milestone Status

| # | Milestone | Status | Owner |
|---|-----------|--------|-------|
| M1 | Arena voxel projection end-to-end | ✅ Done | Fable 5 |
| M2 | SSE live feed (EventSource in Command Center) | ✅ Done | Fable 5 |
| M3 | Command Center public (`?backend=` + CORS) | ⚠️ Partial | Claude (CORS) + Mistral (config.js) |
| M4 | Tier3 truth audit (guarded imports, real status) | ✅ Done | Fable 5 |
| M5 | One frontend (retire stale `frontend/index.html`) | ❌ Pending | Claude (drift audit) + Mistral |
| M6 | Colony capabilities parity (all 7 colonies) | ⚠️ LocalAGI remaining | Claude |
| M7 | Constitution machine (THEHIVE crowned Queen) | ✅ Done | Fable 5 |
| M8 | Backend unit tests (v11 business logic) | ❌ Pending | Claude |
| M9 | CORS + production domains | ❌ Pending | Claude |
| M10 | Grafana dashboard | ❌ Pending | Claude |
| M11 | Dynamic COLONY_BASE_URLS | ❌ Pending | Claude |

---

## 4. Backend State

### 4.1 Core Modules (all in `backend/core/`)

| Module | Class | Purpose | Tests |
|--------|-------|---------|-------|
| `validator.py` | `ConstitutionalValidator` | Enforces F-001–F-006, logs to `constitution_log`, 5s TTL cache | ❌ None |
| `wealth.py` | `WealthEngine` | EVW formula, TWW/VWW/W_total calculation, 60s TTL cache | ❌ None |
| `alchemy.py` | `AlchemyEngine` | Grief→Wisdom transmutation, Capture→Propagate cycle | ❌ None |
| `protocol.py` | `HiveProtocol` | Async event bus, 50ms batch worker, SQLite WAL pubsub (NO Redis) | ❌ None |
| `hive_mesh.py` | `HiveMesh` | HMAC-SHA256 fan-out, circuit breaker (threshold=3), health cache | ❌ None |
| `genesis.py` | `GapDetector` / `MissionGenerator` | Gap detection, mission proposals, MissionStatus enum | ❌ None |
| `constitution.py` | `ConstitutionChecker` | soul.md v4.0 enforcement, CardinalLaws | ❌ None |
| `agency.py` | `AgencyLevel` | OBSERVE→DEVIATE levels, 30s TTL cache | ❌ None |
| `hdc.py` | `HDCEncoder` | Hyperdimensional computing vectors for agent comms | partial |
| `arena.py` | `GladiatorArena` | Challenge/resolve/bet/fallen/resurrect | ❌ None |

### 4.2 Economy Modules

| Module | Class | Purpose |
|--------|-------|---------|
| `economy/staking.py` | `StakingEngine` | stake(), claim_rewards(), decay, leaderboard |
| `economy/utility_economy.py` | `UtilityEconomy` | Credit/debit utility tokens |
| `core/wallet.py` | `SOULWallet` | Token transfers, SOUL balance |

### 4.3 Tier3 Math Modules (behind guarded imports)

| Module | Purpose | Import Guard |
|--------|---------|--------------|
| `tier3/quantum_bridge.py` | QRNG, BB84, IBM-Q status | `try/except ImportError` |
| `tier3/sheaf_guild.py` | Sheaf topology for guild coordination | `try/except ImportError` |
| `tier3/ipfs_pubsub.py` | IPFS pubsub channels | `try/except ImportError` |
| `tier3/tesseract_model.py` | Tesseract neural network | `try/except ImportError` |
| `tier3/arena_renderer.py` | 16×16×8 voxel grid, 30-tick Schumann sim | `try/except ImportError` |

**Check live import status:** `GET /v11/tier3/status`

### 4.4 Database

Single SQLite database: `jasper_memory.db` (WAL mode, 10 indexes)
Auto-created on first boot via `backend/core/db.py`.

Key tables: `pubsub_messages`, `wealth_records`, `wealth_contributions`, `wealth_time_log`, `constitution_log`, `missions`, `arena_challenges`, `arena_projections`, `agents`, `tasks`, `elo_records`, `staking_positions`, `soul_wallet`

---

## 5. Backend API Reference (for Mistral)

All endpoints require `Authorization: Bearer <token>` except where noted.

**Get a token (no auth required):**
```
POST /v11/auth/token
Body: {"agent_name": "your-agent-name"}
Response: {"access_token": "...", "token_type": "bearer"}
```

### 5.1 Health & Status (no auth)
```
GET  /health                      → {status, version, uptime_seconds, db_status, colony_id}
GET  /v11/hive/status             → {colonies: {id: {status, latency_ms, last_seen}}, timestamp}
GET  /v11/tier3/status            → {quantum, sheaf, pubsub, tesseract, arena_renderer} — real import state
```

### 5.2 Constitution & Governance
```
POST /v11/constitution/check      → {allowed, reason, violated_law?}
GET  /v11/constitution            → soul.md text
POST /v11/constitution/vote       → vote on a proposed amendment
GET  /v11/constitution/violations → last 20 violations
GET  /v11/constitution/history    → last 20 constitution change events (from pubsub log)
GET  /v11/governance/feed         → SSE stream of governance decisions
GET  /v11/governance/log          → recent governance decisions (alias: feed as JSON)
```

### 5.3 Agents & ELO
```
GET  /v11/agents                  → list all agents
POST /v11/agents/run              → {agent_name, task} → run agent task
POST /v11/agents/grade            → submit ELO grade for agent output
GET  /v11/agents/elo              → ELO leaderboard
GET  /v11/agents/elo/{name}       → single agent ELO
POST /v11/agents/reproduce        → spawn child agent from two parents (genome crossover)
GET  /v11/agents/genome/compat?agent1=&agent2= → compatibility score
GET  /v11/agents/genome/genealogy/{name} → ancestor tree
GET  /v11/agents/genome/traits    → available trait list
```

### 5.4 Arena (Gladiator Challenge Engine)
```
POST /v11/arena/challenge         → {idea1, idea2, context?} → challenge_id
POST /v11/arena/challenge/{id}/resolve → run outcome determination
GET  /v11/arena/challenges        → list challenges (?status=open|resolved|projecting)
GET  /v11/arena/fallen            → Hall of Fallen Ideas
POST /v11/arena/resurrect/{id}    → attempt resurrection of fallen idea
POST /v11/arena/bet/{id}          → place SOUL bet on a challenge
GET  /v11/arena/history/{id}      → event history for challenge
GET  /v11/arena/stats             → arena economy summary
POST /v11/arena/project/{id}      → run 30-tick voxel projection simulation
GET  /v11/arena/projection/{id}/frames → retrieve projection frame data
GET  /v11/arena/render/voxels/{colony} → tier3 voxel render for a colony
```

### 5.5 SOUL Economy & Staking
```
POST /v11/wallet/create?agent_name= → create wallet
GET  /v11/wallet/{name}           → wallet balance + history
POST /v11/wallet/tip              → {from, to, amount, message?}
POST /v11/wallet/credit           → {agent_name, amount, reason}
GET  /v11/wallet/leaderboard/soul → top N by SOUL balance
GET  /v11/wallet/balance/{name}   → just the balance number
POST /v11/wallet/transfer         → {from, to, amount}
POST /v11/staking/stake           → {agent_name, amount_soul, lock_days}
POST /v11/staking/claim/{name}    → claim staking rewards
GET  /v11/staking/positions/{name} → current staking positions
GET  /v11/staking/leaderboard     → top stakers
GET  /v11/staking/rate            → current APY rate
POST /v11/utility/credit/{name}   → credit utility tokens
GET  /v11/utility/metrics/{name}  → utility stats
GET  /v11/utility/leaderboard     → utility leaderboard
POST /v11/utility/refresh/{name}  → decay utility score
```

### 5.6 Wealth Engine (EVW / W_total)
```
GET  /v11/wealth/{user_id}        → {user_id, tww, vww, w_total, computed_at}
POST /v11/wealth/contribution     → record a contribution
                                     Body: {user_id, hours_saved, adoption_count,
                                            novelty_score, dispute_resilience}
```

### 5.7 Tasks (Kanban)
```
POST /v11/tasks                   → create task {title, description, priority?}
GET  /v11/tasks                   → list tasks (?status=open|assigned|done)
POST /v11/tasks/{id}/assign?agent_name= → assign task
POST /v11/tasks/{id}/complete?agent_name= → mark complete
DELETE /v11/tasks/{id}            → delete task
```

### 5.8 LLM & Chat
```
POST /v11/llm/chat               → OpenAI-compatible: {messages, model?, temperature?}
GET  /v11/llm/providers          → provider health / active provider badge
POST /v11/llm/search             → web search (?q=&n=6)
GET  /v11/llm/status             → alias for /v11/llm/providers
```

### 5.9 Frequency Guild
```
GET  /v11/frequency/letter/{char} → Hz value for character
GET  /v11/frequency/word/{word}   → Hz analysis for word
POST /v11/frequency/heal          → {text} → healing frequency analysis
GET  /v11/frequency/agent/{name}  → agent's resonance frequency
GET  /v11/frequency/spectrum      → full frequency spectrum
GET  /v11/frequency/analyze?text= → full text frequency analysis
```

### 5.10 HD/VSA (Hyperdimensional Computing)
```
GET  /v11/hd/lexicon              → current HD vector lexicon
GET  /v11/hd/encode?text=         → encode text to HD vector
GET  /v11/hd/similarity?concept1=&concept2= → cosine similarity
GET  /v11/hd/bind?concept1=&concept2=       → XOR binding of two concepts
POST /v11/hd/bundle               → bundle list of concepts into one vector
```

### 5.11 Human-in-the-Loop (HITL)
```
POST /v11/hitl/request?action_type=&params= → create HITL approval request
POST /v11/hitl/resolve            → resolve pending HITL request
GET  /v11/hitl/pending            → list pending approvals
GET  /v11/hitl/requests           → all requests (?status=)
```

### 5.12 Memory & Alchemy
```
POST /v11/memory/prune            → trigger memory pruning cycle
GET  /v11/memory/pruning-log      → last 100 prune events
POST /v11/transmute               → {content, context?} → grief→wisdom transmutation
```

### 5.13 Patterns & Simulation
```
GET  /v11/patterns                → known behavioral patterns
GET  /v11/patterns/recommend?context= → recommend patterns for context
GET  /v11/patterns/{id}           → single pattern
POST /v11/simulate                → run colony simulation
GET  /v11/simulate/colony         → colony growth simulation
GET  /v11/simulate/hyperparams    → hyperparameter optimization
```

### 5.14 Genesis (Mission Pipeline)
```
GET  /v11/genesis/gaps            → detected system gaps
GET  /v11/genesis/missions        → mission proposals (?status=proposed|active|done)
POST /v11/genesis/missions/propose → {gap_id, description, priority}
POST /v11/genesis/missions/{id}/formalize → approve and activate a mission
```

### 5.15 Tier3 Math Routes
```
GET  /v11/quantum/qrng?n_bits=    → quantum random number generation
POST /v11/quantum/bb84            → BB84 key exchange simulation
GET  /v11/quantum/ibmq/status     → IBM-Q backend status
GET  /v11/quantum/encode?text=    → quantum state encoding
GET  /v11/sheaf/guilds            → sheaf topology guild map
POST /v11/sheaf/setup/all         → initialize sheaf structures for all guilds
GET  /v11/pubsub/channels         → active pubsub channels
POST /v11/pubsub/channel?colony_name= → create pubsub channel
GET  /v11/tesseract/status        → tesseract network status
GET  /v11/tesseract/forecast/{colony}?n_forecast= → tesseract forecast
```

### 5.16 Real-time Streams
```
GET  /v11/feed                    → SSE stream (no auth required)
                                     Events: arena_frame, arena_resolved, task_completed,
                                             governance_decision, agent_born, wealth_updated
WS   /ws                          → WebSocket (JWT required in query: ?token=...)
                                     Broadcasts: all hive events as JSON
```

### 5.17 Colony Federation Layer
```
GET  /colony/health               → {status, colony_id, uptime, db_health}
GET  /colony/info                 → {colony_id, role, soul_md_hash, capabilities}
GET  /colony/manifest             → full manifest JSON
GET  /colony/agents               → agents registered in this colony
GET  /colony/capabilities         → declared capabilities list
POST /colony/events               → receive federation event (HMAC-verified)
                                     Header: X-Hive-Signature: sha256=<hmac>
```

### 5.18 Hive Federation Control
```
GET  /v11/hive/status             → all colony health with latency
POST /v11/hive/dispatch?event_type= → broadcast event to all/target colonies
GET  /v11/hive/manifest/{colony_id} → proxy colony manifest
```

### 5.19 Agency
```
GET  /v11/agency/check?agent_id=&action=&level= → check agency permission
                                     Levels: OBSERVE, PROPOSE, EXECUTE, AUTOMATE, DEVIATE
```

### 5.20 Protocol Log
```
GET  /v11/protocol/log?event_type=&limit= → pubsub event audit log
```

---

## 6. Auth Flow

```
1. POST /v11/auth/token  {"agent_name": "ui-client"}
   → {"access_token": "<jwt>", "token_type": "bearer"}

2. All protected endpoints:
   Header: Authorization: Bearer <jwt>

JWT claims:
  - sub: agent_name
  - iss: "sovereign-hive"
  - exp: +24h
  - iat: now

JWT secret source: JWT_SECRET_KEY in .env (or env var)
```

No user registration. Any agent_name generates a valid token (dev-mode permissive).

---

## 7. CORS Configuration

Current allowed origins (from `backend/core/config.py`):
- `http://localhost:8080`
- `http://localhost:3000`
- Set via `CORS_ORIGINS` env var (comma-separated)

**Pending (Milestone M9):** Add Cloudflare Worker URL + Render deploy URL to allowlist. Mistral will need these for the public Command Center deployment.

---

## 8. Mistral's Frontend Scaffolding (Already Built)

Located in `frontend/src/`:

| File | Purpose |
|------|---------|
| `types/colony.ts` | Colony type definitions |
| `types/index.ts` | All shared TypeScript types |
| `stores/uiStore.ts` | Zustand UI state store |
| `stores/constitutionStore.ts` | Zustand constitution state |
| `hooks/useAsyncState.ts` | Async data fetching hook |
| `hooks/useNeuralUI.ts` | Neural UI animation hook |
| `pages/404.tsx` | 404 error page |
| `components/ErrorBoundary.tsx` | Error boundary + fallback |
| `assets/styles/global.css` | Global CSS |
| `tsconfig.json` | TypeScript config |
| `.prettierrc` | Code style config |

**Note:** The main `docs/index.html` (Command Center v12) and `frontend/index.html` (JASPER v9) are standalone CDN-linked files, not part of the Mistral TypeScript build. Mistral's `frontend/src/` is a separate React/Vite build that will eventually replace them.

---

## 9. Claude's Backend Work Queue

### In Progress / Next

- [ ] **M8 — Unit Tests**: `tests/unit/test_{validator,wealth,alchemy,protocol,hive_mesh,genesis}.py`
  - Commit: `[ROLE: Test Engineer] test(core): comprehensive unit tests for v11 backend modules`

- [ ] **M9 — CORS**: Add Cloudflare + Render URLs to `backend/core/config.py`
  - Commit: `[ROLE: DevOps Engineer] fix(config): add Cloudflare Worker + Render URLs to CORS allowlist`

- [ ] **M10 — Grafana**: `monitoring/grafana/dashboards/sovereign-hive-overview.json`
  - Commit: `[ROLE: DevOps Engineer] feat(monitoring): Grafana dashboard for hive observability`

- [ ] **M11 — Dynamic URLs**: Add `base_url` field to `/v11/hive/status` colony records
  - Commit: `[ROLE: Protocol Architect] feat(api): include base_url in /v11/hive/status colony records`

- [ ] **LocalAGI capabilities**: Add `/colony/capabilities` to `LocalAGI/pkg/colony/colony.go` (blocked on PR #3 merge)

### Completed This Session
- [x] Populate `Project_file/Project_memory.md` (this file)

---

## 10. Open PRs

| Repo | PR | Title | Status |
|------|----|-------|--------|
| LocalAGI | #3 | HMAC Go verification (R6) | Open — needs merge |
| THEHIVE | latest | Phase 7/8 work on session-continuation branch | Push pending |

---

## 11. User Actions Needed

1. **Add `PAT` secret** to THEHIVE repository Settings → Secrets → Actions.
   Secret name: `PAT`, scope: `repo` (full).
   Required for: `distribute-pat.yml` (push secret to all colonies) and `set-repo-descriptions.yml`.

2. **Merge LocalAGI PR #3** to unblock capabilities endpoint addition.

3. **Cloudflare/Render URLs**: Once deployed, share the Cloudflare Worker URL + Render URL so Claude can add them to CORS config.

---

## 12. Fixed Laws (Reference — Never Violate)

| Law | Description |
|-----|-------------|
| F-001 | Data sovereignty: user may request deletion within 5 min |
| F-002 | EVW formula: `(hours_saved×0.4)+(adoption_count×0.3)+(novelty_score×0.2)+(dispute_resilience×0.1)` |
| F-003 | Autonomy: agents may refuse within approved agency level |
| F-004 | Explainability: every governance decision must be logged with rationale |
| F-005 | Conflict priority: constitution > law > colony preference > user preference |
| F-006 | Non-penalization: exercising fixed rights never reduces wealth |

---

## 13. Standing Constraints

- Free tier only — no paid APIs or infrastructure
- Branch `claude/session-continuation-owj5wr` for all Claude work
- PRs required after every push
- Role-tagged commits: `[ROLE: <Title>] type(scope): description`
- HMAC permissive when `HIVE_JWT_SECRET` unset (dev mode)
- Advisory CI only (`continue-on-error: true`)
- NO Redis — protocol.py uses asyncio/SQLite intentionally
- Plans committed to `memory/planning/` before session ends

---

*This document is the handshake point for all three agents. Keep it current.*
