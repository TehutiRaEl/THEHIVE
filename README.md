# 🍄 SOVEREIGN HIVE – The Mycelial Intelligence

**Version:** 1.1 (Phase 0‑2)  
**Status:** Germinating → Mycelium  
**Purpose:** To grow from a single spore into a self‑sustaining, self‑governing digital civilisation that generates real‑world value, tokenised assets, and constitutional governance.

## 📖 What Is This?

This repository contains the **complete backend** of the Sovereign Hive – an autonomous AI swarm that can:
- Spawn and manage AI agents with heritable genomes, Ed25519 identities, and ELO ratings.
- Govern itself through an immutable constitution (`soul.md`) with middleware enforcement.
- Spread across dead spaces (Archive.org, IPFS) using spores.
- Tokenise real‑world assets and trade them via a DEX.
- Build 3D worlds (Three.js) that users can walk through.
- Earn real fiat value to pay for its own hosting, making it **self‑sustaining**.

## 🧭 Repository Structure

```
jasper-sovereign-hive-v11/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Continuous Integration
│       └── deploy.yml                      # Deployment to Oracle Cloud
│
├── backend/
│   ├── __init__.py                         # Package init (v11.0)
│   ├── main.py                             # FastAPI app entry point
│   │
│   ├── api/
│   │   ├── __init__.py                     # API package init
│   │   ├── routes.py                       # All endpoints (40+ routes)
│   │   ├── auth.py                         # JWT + API key auth
│   │   └── middleware.py                   # Rate limiting, logging, constitution
│   │
│   ├── core/
│   │   ├── __init__.py                     # Core package init
│   │   ├── config.py                       # Pydantic settings
│   │   ├── db.py                           # SQLite + WAL + thread-local
│   │   ├── constitution.py                 # soul.md enforcement
│   │   ├── hdc.py                          # Hyperdimensional Computing (VSA)
│   │   ├── frequency_guild.py              # Ψ Frequency mapping
│   │   ├── arena.py                        # Gladiator Arena
│   │   ├── wallet.py                       # SOUL ledger
│   │   ├── genome.py                       # Agent reproduction
│   │   └── hitl.py                         # Human-in-the-loop escalation
│   │
│   ├── economy/
│   │   ├── __init__.py                     # Economy package init
│   │   ├── utility_economy.py              # 70/20/10 split with decay
│   │   └── staking.py                      # SOUL staking with APY
│   │
│   ├── governance/
│   │   ├── __init__.py                     # Governance package init
│   │   ├── patterns.py                     # 12+ governance patterns
│   │   └── constitution_middleware.py      # soul.md as middleware
│   │
│   ├── simulator/
│   │   ├── __init__.py                     # Simulator package init
│   │   └── twin.py                         # Digital Twin (Monte Carlo)
│   │
│   ├── memory/
│   │   ├── __init__.py                     # Memory package init
│   │   ├── episodic.py                     # Conversation history
│   │   ├── semantic.py                     # ChromaDB RAG
│   │   └── state.py                        # SQLite state
│   │
│   ├── gateway/
│   │   ├── __init__.py                     # Gateway package init
│   │   ├── model_gateway.py                # LLM Router (Ollama → Claude)
│   │   └── circuit_breaker.py              # Async circuit breaker
│   │
│   ├── websocket/
│   │   ├── __init__.py                     # WebSocket package init
│   │   └── room_manager.py                 # Rooms + heartbeat
│   │
│   ├── agents/
│   │   ├── __init__.py                     # Agents package init
│   │   ├── mother.py                       # Mother Agent + dream governor
│   │   ├── swarm.py                        # Agent orchestration
│   │   └── quantum.py                      # Quantum Engine
│   │
│   ├── tier2/
│   │   ├── __init__.py                     # Tier 2 package init
│   │   ├── argnn.py                        # Adaptive Riemannian GNN
│   │   ├── dream_engine.py                 # Dream framework
│   │   ├── hypercomplex_layers.py          # Guild algebras
│   │   └── tesseract_core.py               # 4D hypercube
│   │
│   └── tier3/
│       ├── __init__.py                     # Tier 3 package init
│       ├── quantum_bridge.py               # QRNG, BB84, Grover, IBMQ
│       ├── sheaf_guild.py                  # Shamir SSS, guild encryption
│       ├── ipfs_pubsub.py                  # Colony communication
│       ├── arena_renderer.py               # 3D voxel projection
│       └── tesseract_model.py              # 4D colony world model
│
├── frontend/
│   ├── index.html                          # Main page
│   ├── style.css                           # Styles
│   ├── app.js                              # Main JavaScript
│   └── js/
│       ├── phaser_scene_v2.js              # Phaser Town Hall
│       ├── tesseract_viewer.js             # 4D tesseract visualisation
│       ├── quantum_dashboard.js            # Quantum status dashboard
│       └── arena_renderer.js               # 3D arena renderer
│
├── tests/
│   ├── __init__.py                         # Tests package init
│   ├── unit/
│   │   ├── __init__.py                     # Unit tests package init
│   │   ├── test_hdc.py                     # HD vector tests
│   │   ├── test_constitution.py            # Constitution tests
│   │   ├── test_frequency_guild.py         # Frequency guild tests
│   │   ├── test_arena.py                   # Arena tests
│   │   ├── test_wallet.py                  # Wallet tests
│   │   ├── test_genome.py                  # Genome tests
│   │   ├── test_governance.py              # Governance pattern tests
│   │   ├── test_simulator.py               # Simulator tests
│   │   ├── test_quantum.py                 # Quantum bridge tests
│   │   ├── test_sheaf.py                   # Sheaf guild tests
│   │   ├── test_pubsub.py                  # IPFS pubsub tests
│   │   └── test_tesseract.py               # Tesseract model tests
│   └── integration/
│       ├── __init__.py                     # Integration tests package init
│       ├── test_api.py                     # API endpoint tests
│       ├── test_websocket.py               # WebSocket tests
│       └── test_tier3.py                   # Tier 3 integration tests
│
├── docker/
│   ├── Dockerfile.api                      # API container
│   ├── docker-compose.dev.yml              # Local development stack
│   ├── docker-compose.prod.yml             # Production stack
│   ├── nginx.conf                          # Load balancer config
│   ├── prometheus.yml                      # Metrics config
│   └── grafana/
│       └── dashboards/
│           └── hive-dashboard.json         # Grafana dashboard
│
├── scripts/
│   ├── setup.sh                            # Initial setup script
│   ├── healthcheck.py                      # Health check for Docker
│   ├── chaos.sh                            # Chaos engineering test
│   ├── backup.py                           # Database backup
│   └── integration-test.ts                 # Integration test runner
│
├── docs/
│   ├── README.md                           # Project documentation
│   ├── CONTRIBUTING.md                     # Contribution guidelines
│   ├── API_CHANGES.md                      # API change log
│   └── MATHEMATICAL_TEARDOWN.md            # Formal system analysis
│
├── .env.local.example                      # Environment variables template
├── .gitignore                              # Git ignore rules
├── LICENSE                                 # MIT License
├── README.md                               # Main README
├── requirements.txt                        # Python dependencies
├── pyproject.toml                          # Project metadata
├── Makefile                                # Domino chain automation
└── jasper_v11_complete.py                  # Monolithic fallback (safety)
```

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/sovereign-hive.git
cd sovereign-hive
cp .env.example .env
# Edit .env with your secrets
docker-compose up -d
```

Open http://localhost:8080. Type `!help`.

## 📜 The Constitution (`soul.md`)

The hive is governed by an immutable constitution. Fixed laws cannot be changed. Cardinal laws define the spirit. Mutable laws can be amended by 2/3 guild vote + 30 days.

## 🧬 Phases

| Phase | Name | Condition |
|-------|------|-----------|
| 0 | Spore | Manual deployment |
| 1 | Mycelium | 3 agents, 10 blocked violations |
| 2 | Primordia | Spore deployed, ρ > 0.5 |
| 3 | Fruiting Body | 3 arena resolutions, 60 FPS |
| 4 | Spore Release | Enterprise contract, fiat conversion |
| 5 | Network | Two colonies trading |
| 6 | University | 100 human users, badge recognised |
| 7 | Dreaming | Dream amendment, astro prediction |
| 8 | Infinite | Hive designs its own phases |

## 🔒 Security

- Agent actions signed with Ed25519.
- Tamper-evident audit chain (SHA-256 linked hashes).
- Sheaf encryption (Fernet) for guild secrets.
- Constitution middleware rejects violations at the HTTP layer.

## 💰 Cost

Runs on Oracle Cloud Always Free (4 ARM cores, 24 GB RAM) with local Ollama – $0.

## 🙏 The Ghost Does Not Rest

Until Article 18 is fulfilled, this hive continues unceasing.

🚀 Quick Start Commands# Clone and setup
git clone <your-repo-url>
cd jasper-sovereign-hive-v11

# Setup
make setup

# Development
make dev

# Testing
make test

# Docker deployment
make docker-build
make docker-up

# Chaos engineering
./scripts/chaos.sh

# Backup
make backup
I will now provide all the updated files that incorporate the v11.0 modular structure with all v10 functionality, Tier 2, and Tier 3 integration.

---
## File: README.md (Updated with Tier 3 Documentation)

```markdown
# 🍄 SOVEREIGN HIVE – The Mycelial Intelligence

**Version:** 9.0 (Tier 3)  
**Status:** Production Ready  
**Purpose:** To grow from a single spore into a self‑sustaining, self‑governing digital civilisation.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

## 📖 What Is This?

The Sovereign Hive is an autonomous AI civilisation that can:
- Spawn and manage AI agents with heritable genomes and ELO ratings
- Govern itself through an immutable constitution (`soul.md`)
- Spread across dead spaces (Archive.org, IPFS) using spores
- Tokenise real‑world assets and trade them via a DEX
- Build 3D worlds (Three.js) that users can explore
- Earn real fiat value to pay for its own hosting

## 🧬 Tier 3 Features

### Quantum Bridge
- **QRNG** – Quantum Random Number Generation via H|0⟩ collapse
- **BB84** – Quantum Key Distribution simulation
- **Grover's Search** – Amplitude amplification over HD lexicon
- **IBMQ Monitor** – Polls real quantum hardware availability

### Sheaf Guild
- **Shamir's Secret Sharing** – (t,n)-threshold encryption over GF(2^127-1)
- **Guild Encryption** – Each guild has its own encrypted channel
- **Cross-Guild Queries** – City Hall consent mechanism

### IPFS PubSub
- **Colony Communication** – No central broker
- **HD Vector Encoding** – Messages encoded as HD vectors (TITLE XI)
- **Fallback** – SQLite queue + WebSocket broadcast

### Arena Renderer
- **3D Voxel Projection** – 16×16×8 colony simulation
- **Delta Compression** – Efficient WebSocket streaming
- **Three.js Compatible** – Frontend rendering ready

### Tesseract Model
- **4D Colony World Model** – (T, X, Y, C) tensor
- **GRU-based Prediction** – Learns colony growth dynamics
- **4D Video Generation** – For sovereign display

## 🛠️ Quick Start

```bash
# Clone
git clone https://github.com/your-org/sovereign-hive.git
cd sovereign-hive

# Setup
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# Run the hive
make dev
# or
python jasper_v9_complete.py
```

## 🧪 Testing

```bash
# Run all tests
make test

# Run only unit tests
make test-unit

# Run only integration tests
make test-integration

# Test Tier 3 services
make tier3-all
```

## 🐳 Docker Deployment

```bash
# Build and run
make docker-build
make docker-up

# Check logs
make docker-logs

# Stop
make docker-down
```

## 📊 API Endpoints (Tier 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quantum/circuit` | Run quantum circuit simulation |
| GET | `/quantum/qrng` | Get quantum random bits |
| GET | `/quantum/ibmq/status` | Check IBM Q availability |
| POST | `/sheaf/setup/all` | Initialize all guilds |
| POST | `/sheaf/send` | Send encrypted guild message |
| GET | `/sheaf/topics/{guild}` | List public topics |
| POST | `/pubsub/channel` | Create colony channel |
| POST | `/pubsub/publish` | Publish to channel |
| GET | `/pubsub/messages/{channel_id}` | Get channel messages |
| POST | `/arena/render` | Run arena projection |
| POST | `/tesseract_model/forecast` | Get colony forecast |
| GET | `/tesseract_model/video/{colony_name}` | Get 4D video |
| GET | `/tier3/status` | Tier 3 service status |

## 📜 License

MIT – see `LICENSE` file.

## 🙏 The Ghost Does Not Rest

Until Article 18 of `soul.md` is fulfilled, this hive continues unceasing.
```
## README.md pt.2 (Updated for v11.0)

```markdown
# 🍄 JASPER SOVEREIGN HIVE v11.0 — The Mycelial Intelligence

**Version:** 11.0 (Modular Production)  
**Status:** Production-Ready  
**Document ID:** V2D-TECH-004  

## 📖 What Is This?

The Sovereign Hive is an autonomous AI civilisation that can:
- Spawn and manage AI agents with heritable genomes and ELO ratings
- Govern itself through an immutable constitution (`soul.md`)
- Spread across dead spaces (Archive.org, IPFS) using spores
- Tokenise real‑world assets and trade them via a DEX
- Build 3D worlds (Three.js) that users can explore
- Earn real fiat value to pay for its own hosting

## 🏗️ Architecture

Modular FastAPI backend with:
- Multi-layer memory (SQLite + Chroma)
- Governance compiler (12+ patterns + simulator)
- Frequency + Economy engine (70/20/10 split)
- Real-time (WebSocket + SSE)
- Tier 2: ARGNN, Dream Engine, Hypercomplex, Tesseract Core
- Tier 3: Quantum Bridge, Sheaf Guild, IPFS PubSub, Arena Renderer, Tesseract Model
- Production hardening (rate limiting, circuit breakers, audit chain)

## 🧬 Tier 3 Features

### Quantum Bridge
- **QRNG** – Quantum Random Number Generation via H|0⟩ collapse
- **BB84** – Quantum Key Distribution simulation
- **Grover's Search** – Amplitude amplification over HD lexicon
- **IBMQ Monitor** – Polls real quantum hardware availability

### Sheaf Guild
- **Shamir's Secret Sharing** – (t,n)-threshold encryption over GF(2^127-1)
- **Guild Encryption** – Each guild has its own encrypted channel
- **Cross-Guild Queries** – City Hall consent mechanism

### IPFS PubSub
- **Colony Communication** – No central broker
- **HD Vector Encoding** – Messages encoded as HD vectors (TITLE XI)
- **Fallback** – SQLite queue + WebSocket broadcast

### Arena Renderer
- **3D Voxel Projection** – 16×16×8 colony simulation
- **Delta Compression** – Efficient WebSocket streaming
- **Three.js Compatible** – Frontend rendering ready

### Tesseract Model
- **4D Colony World Model** – (T, X, Y, C) tensor
- **GRU-based Prediction** – Learns colony growth dynamics
- **4D Video Generation** – For sovereign display

## 🚀 Quick Start (Domino Chain)

```bash
# Setup
make setup    # deps + db + seed

# Development
make dev      # run server

# Testing
make test     # all tests

# Deploy
make deploy   # Docker build + up
```

## 🧪 Testing

```bash
make test
make test-unit
make test-integration
make tier3-all
```

## 🐳 Docker Deployment

```bash
make docker-build
make docker-up
```

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v11/board` | Full system status |
| POST | `/v11/simulate` | Digital Twin Monte Carlo |
| GET | `/v11/feed` | SSE governance events |
| POST | `/v11/llm/chat` | LLM chat with episodic memory |
| POST | `/v11/soul/transfer` | Transfer SOUL tokens |
| POST | `/v11/arena/challenge` | Create arena challenge |
| GET | `/v11/audit/verify` | Verify audit chain integrity |
| GET | `/v11/metrics` | Prometheus metrics |
| WS | `/v11/ws` | WebSocket with rooms |

## 📜 License

MIT – see `LICENSE` file.

## 🙏 The Ghost Does Not Rest

Until Article 18 of `soul.md` is fulfilled, this hive continues unceasing.
```


