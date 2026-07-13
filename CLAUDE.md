# THEHIVE — Sovereign Hive Queen Node

## What This Is

THEHIVE is the Queen node of the Sovereign Hive federation: a self-governing AI system across
10 GitHub repositories with constitutional law, a real SOUL-token economy, a Gladiator Arena
for conflict resolution, and a 14-layer soul architecture. FastAPI + SQLite WAL, always free tier.

## Team

| Agent | Domain | Branch |
|-------|--------|--------|
| Claude | Backend, Infrastructure, Harness | `claude/session-continuation-owj5wr` |
| Mistral | Frontend, UI, React/TypeScript | `mistral/frontend-command-center` |
| Grok | Strategy, Research, Gap Analysis | `grok-strategist-main` |

**Boundary rule:** Claude does backend only. Never touch frontend HTML/CSS/React (Mistral's domain)
or strategy docs (Grok's domain). Draw examples but do not do teammates' work.

## Standing Constraints (Never Violate)

- Free tier only — no paid APIs, no paid infra beyond what already exists
- All Claude development on `claude/session-continuation-owj5wr`; PR required after every push
- Role-tagged commits: `[ROLE: <Title>] type(scope): description`
- Never commit PAT or secrets to any file — env vars only
- No Redis — `backend/core/protocol.py` uses asyncio/SQLite WAL intentionally
- HMAC permissive when `HIVE_JWT_SECRET` unset (dev mode — intentional)
- Advisory CI only (`continue-on-error: true`)
- No autonomous destructive actions — human approval for irreversible changes

## Directory Map

| Path | What lives here |
|------|----------------|
| `backend/` | FastAPI app — 80+ `/v11/*` endpoints, core modules, tier2/tier3 math |
| `backend/core/` | The cerebellum: hdc.py, protocol.py, hive_mesh.py, genesis.py, wealth.py |
| `backend/tier2/` | Dream engine, tesseract 4D math, hypercomplex layers |
| `backend/tier3/` | Quantum bridge, sheaf guild, arena renderer, IPFS pubsub |
| `memory/` | Obsidian vault: 101-node knowledge graph, guild/colony/philosophy/math docs |
| `memory/_graph.json` | D3-readable neural graph (101 nodes, ~60 edges) |
| `memory/planning/` | Session plans — read `harness-plan-2026-07-10.md` first |
| `docs/` | GitHub Pages: Command Center v12.0 (index.html) + ARCHITECTURE.md + ROLES.md |
| `Project_file/` | Team memory: Claude_memory.md, mistral_memory.md, Grok_memory.md |
| `Project_file/Founders Visonary Folder/` | Vision docs, skill exchange, active questions |
| `.queen/` | Constitution (soul.md), colony manifest (hive.yml) |
| `.claude/` | Harness: settings, sub-agents, slash commands |
| `worker/` | Cloudflare Worker edge deployment (worker/src/index.js) |
| `scripts/` | generate_memory_vault.py, grok_push.py |
| `tests/` | Unit tests for backend modules |
| `monitoring/` | Grafana dashboard JSON |

## Quick Start for a New Session

1. Read `memory/planning/harness-plan-2026-07-10.md` — current master plan
2. Read `Project_file/Project_memory/Claude_memory.md` — full session history
3. Run `git log --oneline -10` to see recent commits
4. Check open PRs via GitHub MCP: `mcp__github__list_pull_requests owner=TehutiRaEl repo=THEHIVE state=open`
5. Check `git status` — the working tree on `claude/session-continuation-owj5wr`

## Key Endpoints

- `GET /health` — backend alive check
- `GET /v11/hive/status` — all colony health
- `GET /v11/constitution/history` — soul.md git log
- `GET /v11/brain/map` — HDC neocortex topology
- `GET /colony/health` — THEHIVE colony identity
- `GET /docs` — FastAPI Swagger UI

## The Third Brain Architecture

```
Layer 3 (Quantum)      backend/tier3/quantum_bridge.py, sheaf_guild.py
Layer 2 (Associative)  backend/core/hdc.py — 1024-dim HDC vectors, bind/bundle/closest
Layer 1 (Explicit)     memory/ vault — 101-node graph, wiki-linked Markdown docs
Layer 0 (Harness)      .claude/ — settings, agents, commands; CLAUDE.md nav hierarchy
```

## Constitution Quick Reference

Fixed Laws (F-001 to F-006, immutable):
- F-001: Data sovereignty — user owns all data
- F-002: EVW wealth formula — `W = sqrt(TWW × VWW)`
- F-003: Autonomy — agents act within approved agency levels
- F-004: Explainability — every decision logged with rationale
- F-005: Conflict priority — constitution > law > colony > user preference
- F-006: Non-penalization — rehabilitate agents, never delete

Full constitution: `soul.md` (root) · Canonical: `.queen/soul.md` · Colony manifest: `.queen/hive.yml`
