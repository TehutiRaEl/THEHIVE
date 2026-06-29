# Sovereign Hive — Architecture

THEHIVE is the Queen of the Sovereign Hive federation: a constitutional governance
engine, agent economy, and cross-colony event bus. This document describes the
system architecture of THEHIVE itself and how it coordinates the federation's
colonies (NAR2, 4DBRAIN, aether, automatisch, Kimi-K2, LocalAGI).

## 1. System Architecture

```
                         ┌──────────────────────────────┐
                         │           nginx               │
                         │  reverse proxy + rate limits   │
                         │  nginx/nginx.conf               │
                         └───────────────┬────────────────┘
                                         │
                         ┌───────────────▼────────────────┐
                         │      THEHIVE (Queen) :8080      │
                         │      FastAPI + SQLite (WAL)     │
                         │ ┌─────────────────────────────┐ │
                         │ │ backend/api/                │ │
                         │ │   routes.py   (40+ endpoints)│ │
                         │ │   colony.py   (/colony/*)    │ │
                         │ │   auth.py     (JWT)          │ │
                         │ │   middleware.py (security)   │ │
                         │ │   models.py   (response types)│ │
                         │ └─────────────────────────────┘ │
                         │ ┌─────────────────────────────┐ │
                         │ │ backend/core/                │ │
                         │ │   validator.py  (F-001..F-006)│ │
                         │ │   agency.py     (OBSERVE..DEVIATE)│
                         │ │   genesis.py    (mission lifecycle)│
                         │ │   alchemy.py    (grief→wisdom)│ │
                         │ │   hive_mesh.py  (cross-colony bus)│
                         │ │   protocol.py   (pubsub bus)  │ │
                         │ │   wealth.py     (EVW/TWW/VWW) │ │
                         │ │   db.py         (SQLite WAL)  │ │
                         │ └─────────────────────────────┘ │
                         └───────────────┬────────────────┘
                                         │ HTTP fan-out (HiveMesh)
              ┌──────────────┬───────────┼───────────┬──────────────┐
              ▼              ▼           ▼           ▼              ▼
        ┌──────────┐  ┌───────────┐ ┌─────────┐ ┌──────────┐  ┌───────────┐
        │  NAR2     │  │ 4DBRAIN   │ │ aether  │ │automatisch│  │ Kimi-K2   │
        │ :8000     │  │ :8000     │ │ :3000   │ │ :3000    │  │ :8002     │
        │ security  │  │ cognitive │ │ commerce│ │ workflow │  │ mind/LLM  │
        └──────────┘  └───────────┘ └─────────┘ └──────────┘  └───────────┘
```

Each colony exposes the **Colony Standard Layer** (`/colony/health`, `/colony/info`,
`/colony/manifest`, `POST /colony/events`, `/colony/agents`) implemented via a
shared `colony_sdk.py` factory (`ColonyConfig` + `make_colony_router()`) in the
Python colonies, and equivalent Express/Next.js routers in automatisch/aether.

## 2. Component Structure

| Layer | Responsibility | Key files |
|---|---|---|
| Edge | TLS termination, rate limiting, routing | `nginx/nginx.conf` |
| API | HTTP surface, auth, validation | `backend/api/routes.py`, `colony.py`, `auth.py`, `middleware.py` |
| Core engine | Constitution, economy, agency | `backend/core/*.py` |
| Federation | Cross-colony dispatch + health | `backend/core/hive_mesh.py` |
| Persistence | SQLite (WAL mode) | `backend/core/db.py` |
| Observability | Metrics + dashboards | `monitoring/prometheus.yml`, `monitoring/grafana/` |
| Orchestration | Local dev bring-up | `docker-compose.federation.yml`, `scripts/hive-start.sh` |

## 3. Data Flow

1. **Inbound request** → nginx applies rate-limit zone (`api`: 60r/m, `colony`: 120r/m) → proxied to the relevant upstream.
2. **Constitutional check** → mutating actions pass through `ConstitutionalValidator.validate()` (`validator.py`), which enforces fixed laws F-001–F-006 and caches results for 5s.
3. **Agency check** → `SwarmAgency.check()` (`agency.py`) gates PROPOSE/EXECUTE/DEVIATE actions per agent, with OBSERVE always allowed and unlogged.
4. **Persistence** → state changes are written to SQLite under WAL journaling; reads use cached connections via `db.py`.
5. **Cross-colony event** → `HiveMesh.dispatch()` (`hive_mesh.py`) signs the payload (`X-Hive-Signature` HMAC-SHA256), fans out `POST /colony/events` to target colonies with a split timeout (connect=3s/read=8s) and exponential backoff, tripping a per-colony circuit breaker after 3 consecutive failures.
6. **Event bus** → intra-Queen pub/sub flows through `HiveProtocol` (`protocol.py`), backed by the `pubsub_messages` table.

## 4. API Design

- REST over HTTP/JSON, versioned under `/v11/*` for Queen-specific endpoints.
- Colony discovery endpoints are unversioned and public under `/colony/*` (no auth — designed for federation-wide discovery).
- Mutating Queen endpoints require a bearer JWT (`auth.py`), with `iss: "sovereign-hive"` enforced on decode.
- Response shapes are typed via Pydantic models in `backend/api/models.py` (`HealthResponse`, `ColonyInfoResponse`, `HiveStatusResponse`, `ValidationResponse`, etc.) and wired through `response_model=` on the corresponding routes for automatic validation and OpenAPI schema generation.

## 5. Database Schema (selected tables)

| Table | Purpose | Key indexes |
|---|---|---|
| `agents` | Registered swarm agents | `idx_agents_status` |
| `pubsub_messages` | Event bus log (`channel_id`, `payload`, `created_at`) | `idx_pubsub_topic_created` |
| `constitution_log` | F-001–F-006 violation/audit trail | `idx_constitution_log_actor` |
| `agency_log` | Agency decisions per agent | `idx_agency_log_agent` |
| `wisdom_ledger` | Grief→wisdom transmutation records (Ma'at scoring) | `idx_wisdom_grief` |
| `missions` | Genesis mission lifecycle (PROPOSED→FORMALIZED→ACTIVE→COMPLETED/ABANDONED) | `idx_missions_status` |
| `staking_positions` | Agent staking with lock periods | `idx_staking_locked` |
| `wealth_contributions` | Inputs to the EVW/TWW/VWW wealth formula | `idx_wealth_user` |
| `utility_metrics` | Per-agent utility economy data | `idx_utility_agent` |
| `agent_wallets` | SOUL token balances | `idx_wallet_agent` |

SQLite is tuned for the federation's read-heavy, single-writer workload:
`journal_mode=WAL`, `synchronous=NORMAL`, `cache_size=-64000` (64MB), `temp_store=MEMORY`,
`mmap_size=256MB`, `journal_size_limit=64MB`.

## 6. Caching Strategy

| Component | TTL | Rationale |
|---|---|---|
| `ConstitutionalValidator.validate()` | 5s | Hot path on every mutating action; violations are deterministic per (action, context) within a short window |
| `SwarmAgency.check()` | 30s | Agency decisions change rarely relative to request volume |
| `GapDetector.scan()` (genesis) | 60s | Mission gap scans are expensive; deduplicated via a `_seen` set |
| `RecursiveReflector.transmute()` (alchemy) | 300s, MD5-keyed at depth 1 | Grief transmutation is read-heavy once computed |
| `HiveMesh` colony health | 300s | Avoids hammering colonies with health checks on every dispatch |
| `wealth_engine.compute_wealth()` | 60s per user | Wealth formula recomputation is avoidable between writes |

All caches are invalidated on the relevant write path (e.g. wealth cache cleared on new contribution).

## 7. Deployment

Local/dev bring-up is a single command: `./scripts/hive-start.sh start`, which runs
`docker compose -f docker-compose.federation.yml up -d --build` and polls each
colony's health endpoint before reporting ready. See `docker-compose.federation.yml`
for the full service topology (static IPs on `172.20.0.0/16`) and `nginx/nginx.conf`
for routing/rate-limit rules. Metrics are scraped by Prometheus
(`monitoring/prometheus.yml`) and visualized in Grafana via the provisioned
datasource (`monitoring/grafana/datasources/prometheus.yml`).
