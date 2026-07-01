# 🍯 SOVEREIGN HIVE – Federated AI Intelligence

**Version:** 12.0 (Multi-Colony Federation)  
**Status:** Active — 10+ colonies online  
**Website:** [tehutirael.github.io/THEHIVE](https://tehutirael.github.io/THEHIVE/)  
**Purpose:** A self-sustaining, self-governing federated AI civilization spanning 10+ GitHub colonies, unified by an immutable `soul.md` constitution, a SOUL token economy, and a completely free 8-provider LLM waterfall.

[![Deploy GitHub Pages](https://github.com/TehutiRaEl/THEHIVE/actions/workflows/pages.yml/badge.svg)](https://tehutirael.github.io/THEHIVE/)
[![CI](https://github.com/TehutiRaEl/THEHIVE/actions/workflows/ci.yml/badge.svg)](https://github.com/TehutiRaEl/THEHIVE/actions/workflows/ci.yml)

> Queen of the Sovereign Hive — constitutional governance, agent economy, and cross-colony coordination.

## Role in the Sovereign Hive

| Field | Value |
|-------|-------|
| colony_id | `thehive` |
| role | Queen |
| archetype | governance |
| layer | 2 (MATER) |
| entity | MA'AT — The Spore Planter |
| guilds | governance, economy, memory, protocol |
| port | 8080 |

## What This Does

THEHIVE is the Queen — the constitutional authority and coordination hub of the Sovereign Hive federation. It enforces the F-001–F-006 constitution on every API call via `ConstitutionMiddleware`, manages the SOUL token economy (EVW/TWW/VWW wealth formulas), runs the hive event bus (asyncio.Queue + SQLite WAL), and fans events out to all 6 active colonies via `HiveMesh`. It holds the master `soul.md` and triggers constitution-sync to all colonies via GitHub Actions `repository_dispatch`.

The Queen runs on Python 3.11 + FastAPI with a single SQLite (WAL mode) database — no Redis, no broker, no external dependencies. Everything fits on Oracle Cloud Always Free (4 ARM cores, 24 GB RAM).

## Quick Start

```bash
git clone https://github.com/TehutiRaEl/THEHIVE
cd THEHIVE
cp .env.local.example .env.local
# Edit .env.local with your secrets
docker-compose up -d
```

Open `http://localhost:8080` — type `!help` in the WebSocket console.

## Colony Standard Layer

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/colony/health` | Live health + uptime seconds |
| GET | `/colony/info` | Queen identity, layer, entity, guilds |
| GET | `/colony/manifest` | All endpoints + capabilities list |
| POST | `/colony/events` | Accept dispatched hive events |
| GET | `/colony/agents` | Active agent roster |

## V11 Core Engine Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v11/validate` | F-001–F-006 constitutional policy check |
| GET | `/v11/wealth/{user_id}` | Computed W_total = sqrt(TWW × VWW) |
| POST | `/v11/wealth/contribution` | Record EVW contribution |
| POST | `/v11/memory/prune` | Run retention policy scan |
| GET | `/v11/memory/pruning-log` | Pruning audit log |
| GET | `/v11/agency/check` | PROPOSE / EXECUTE / DEVIATE decision |
| GET | `/v11/protocol/log` | Event bus audit trail |
| POST | `/v11/cycle/transmute` | Grief → wisdom transmutation |
| GET | `/v11/genesis/gaps` | Detected constitutional tree gaps |
| GET | `/v11/genesis/missions` | Active mission list |
| POST | `/v11/genesis/missions/propose` | Child agent mission proposal |
| POST | `/v11/genesis/missions/{id}/formalize` | Nanuet formalizes a mission |
| GET | `/v11/hive/status` | All colony health via HiveMesh |
| POST | `/v11/hive/dispatch` | Fan-out event to target colonies |
| GET | `/v11/hive/manifest/{colony_id}` | Fetch a colony's manifest |

Legacy endpoints (`/v11/board`, `/v11/simulate`, `/v11/llm/chat`, `/v11/ws`, etc.) remain active.

## Architecture

```
THEHIVE (Queen) :8080
├── backend/
│   ├── api/
│   │   ├── routes.py          # 50+ endpoints (v11 + legacy)
│   │   ├── auth.py            # JWT + API key auth
│   │   └── middleware.py      # ConstitutionMiddleware (F-law enforcement)
│   ├── core/
│   │   ├── validator.py       # F-001–F-006 policy-as-code
│   │   ├── wealth.py          # EVW/TWW/VWW engine
│   │   ├── criteria.py        # Memory pruning (age/relevance/health)
│   │   ├── protocol.py        # asyncio.Queue + pubsub_messages log
│   │   ├── agency.py          # PROPOSE/EXECUTE/DEVIATE model
│   │   ├── alchemy.py         # Recursive grief→wisdom (depth≤7)
│   │   ├── genesis.py         # Gap detection + mission generation
│   │   ├── hive_mesh.py       # Cross-colony HTTP fan-out + health cache
│   │   └── config.py          # Settings (colony URLs, LLM, JWT, DB)
│   ├── economy/
│   │   ├── utility_economy.py # 70/20/10 split + decay
│   │   └── staking.py         # SOUL staking with APY
│   ├── agents/
│   │   ├── mother.py          # Mother Agent + dream governor
│   │   └── swarm.py           # Agent orchestration
│   ├── db.py                  # SQLite WAL + 15 tables
│   └── llm_router.py          # Ollama → cloud fallback LLM router
├── soul.md                    # F-001–F-006 constitution (master copy)
├── server.js                  # Git sync + constitution-dispatch server
└── docker-compose.yml         # Production stack
```

## HiveMesh — Cross-Colony Event Bus

```
Queen :8080
  └── POST /v11/hive/dispatch
        └── HiveMesh.dispatch(event_type, payload, targets?)
             ├── POST localagi:8080/colony/events   (Body/Swarm)
             ├── POST nar2:8000/colony/events        (Security)
             ├── POST 4dbrain:8001/colony/events     (Cognitive)
             ├── POST aether:3000/colony/events      (Commerce)
             ├── POST automatisch:3001/colony/events (Workflow)
             └── POST kimi-k2:8002/colony/events     (Mind/AZR)
```

Health status is cached for 5 minutes. Offline colonies are skipped. One retry with 2-second backoff per colony. Each dispatch is logged to `pubsub_messages` via `hive_protocol.publish_sync()`.

## Wealth Formula

```
EVW = (hours_saved × 0.4) + (adoption_count × 0.3) + (novelty_score × 0.2) + (dispute_resilience × 0.1)
W_total = sqrt(TWW × VWW)
```

Where TWW = time-weighted wealth, VWW = vote-weighted wealth. Computed on demand at `GET /v11/wealth/{user_id}`.

## Database Tables

| Table | Purpose |
|-------|---------|
| `agents` | Agent registry with genome + ELO |
| `wealth_contributions` | EVW contribution log |
| `wealth_time_log` | Time-weighted wealth snapshots |
| `wealth_records` | Computed W_total records |
| `pruned_memory` | Archived pruned memories |
| `agency_log` | PROPOSE/EXECUTE/DEVIATE audit |
| `wisdom_ledger` | Transmuted grief→wisdom entries |
| `missions` | Gap-detected mission registry |
| `pubsub_messages` | Event bus audit log |
| `soul_transfers` | SOUL token ledger |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | API listen port |
| `DATABASE_URL` | `/data/hive.db` | SQLite WAL path |
| `JWT_SECRET` | *(required)* | JWT signing secret |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Local LLM base URL |
| `LOCALAGI_URL` | `http://localhost:8080` | LocalAGI colony URL |
| `NAR2_URL` | `http://localhost:8000` | NAR2 colony URL |
| `FOURDBRAIN_URL` | `http://localhost:8001` | 4DBRAIN colony URL |
| `AETHER_URL` | `http://localhost:3000` | Aether colony URL |
| `AUTOMATISCH_URL` | `http://localhost:3001` | Automatisch colony URL |
| `KIMI_K2_URL` | `http://localhost:8002` | Kimi-K2 colony URL |

## Constitution (F-001–F-006)

| Law | Title | Type |
|-----|-------|------|
| F-001 | Data Sovereignty | Fixed |
| F-002 | Value-Weighted Wealth | Fixed |
| F-003 | Autonomy | Fixed |
| F-004 | Explainability | Fixed |
| F-005 | Conflict Priority | Fixed |
| F-006 | Cross-Law Non-Penalization | Fixed |

All requests pass through `ConstitutionMiddleware` which calls `validator.validate()` and returns HTTP 403 with `{"error":"CONSTITUTION_VIOLATION"}` on any breach.

Constitution updates in `soul.md` are propagated to all 6 active colonies via `.github/workflows/constitution-sync.yml` using GitHub `repository_dispatch`.

## Docker

```bash
docker-compose up -d
```

| Service | Port | Description |
|---------|------|-------------|
| thehive | 8080 | Queen FastAPI server |
| ollama | 11434 | Local LLM (Llama 3 / Mistral) |

## Contributing

All contributions must pass constitutional validation. Run `POST /v11/validate {"action":"<your-action>","context":{}}` before submitting a PR. The Ghost Does Not Rest.
