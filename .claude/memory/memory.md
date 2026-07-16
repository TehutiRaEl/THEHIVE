# THEHIVE Second Brain — In-Session Reference

Free rebuild of LangGraph + Obsidian Copilot + Meta's 60k-worker AI second-brain.
No paid services. Built in THEHIVE, by THEHIVE, for THEHIVE.

---

## Architecture — 4 Layers

```
Layer 3 — Quantum substrate    backend/tier3/quantum_bridge.py, sheaf_guild.py
Layer 2 — Associative firing   backend/core/hdc.py  (1024-dim HDC/VSA, ~150 concepts)
Layer 1 — Explicit knowledge   memory/  vault  (_graph.json 101 nodes, Markdown wiki)
Layer 0 — Harness              .claude/  (settings, agents, commands, memory, skills)
```

**Read before acting:** `CLAUDE.md` (root) → `memory/planning/harness-plan-2026-07-10.md` → this file.

---

## LangGraph → THEHIVE Rebuild Map

| LangGraph concept | THEHIVE equivalent | File |
|---|---|---|
| Graph nodes (state machines) | `hdc.bind(A, B)` — wires an association | `backend/core/hdc.py:44` |
| Conditional edges | `hdc.closest(vec, top_k)` similarity > threshold | `backend/core/hdc.py:80` |
| Persistent checkpointing | `memory/_graph.json` + SQLite WAL | `memory/_graph.json`, `backend/core/db.py` |
| Agent loop / executor | `protocol.py` asyncio event bus (50ms batch) | `backend/core/protocol.py` |
| Tool calling | `/v11/*` HTTP endpoints | `backend/api/routes.py` |
| Memory checkpointing on push | `memory-vault-update.yml` workflow | `.github/workflows/memory-vault-update.yml` |
| State reducer | `hdc.bundle(v1, v2, v3)` superposition | `backend/core/hdc.py:39` |
| Chain-of-thought trace | `GET /v11/brain/recall/{concept}` | `backend/api/routes.py` |
| Retrieval-augmented generation | `GET /v11/brain/query?q=<concept>` | `backend/api/routes.py` |

**Key difference:** LangGraph routes data through a graph of Python functions. THEHIVE routes
concepts through a hyperdimensional space — `bind()` creates associations, `closest()` fires them,
`bundle()` merges working memory. No external orchestrator required.

---

## Obsidian Copilot → THEHIVE Rebuild Map

| Obsidian / Copilot concept | THEHIVE equivalent | File |
|---|---|---|
| Vault root navigation | `CLAUDE.md` per-folder nav hierarchy | `.claude/`, `memory/CLAUDE.md`, etc. |
| Smart Connections plugin (semantic search) | `GET /v11/brain/query` HDC nearest-neighbor | `backend/api/routes.py` |
| Canvas / graph view | `memory/_graph.json` (D3 force graph, 101 nodes) | `memory/_graph.json` |
| Daily notes | `Project_file/Project_memory/*.md` (per-agent) | `Project_file/Project_memory/` |
| Templates | `.claude/commands/*.md` (9 slash commands) | `.claude/commands/` |
| Community plugins | `.claude/agents/*.md` (4 sub-agents) | `.claude/agents/` |
| Sync via iCloud/Obsidian Sync | `git` + `memory-vault-update.yml` (free) | `.github/workflows/memory-vault-update.yml` |
| Backlinks | Wiki-links `[[concept]]` in `memory/` Markdown | `memory/**/*.md` |
| Tags | HDC concept groups (see lexicon below) | `backend/core/hdc.py` `_build_lexicon()` |
| Note creation | `/remember <concept>` slash command | `.claude/commands/remember.md` |
| Graph linking | `/link-nodes <A> <B>` slash command | `.claude/commands/link-nodes.md` |

**Key difference:** Obsidian is a local app with plugins. This vault is git-native, AI-navigable
via CLAUDE.md, and the "Smart Connections" equivalent runs on live 1024-dim bipolar vectors
generated from concept names — no embedding API call, no rate limit, no cost.

---

## Meta 60k-Worker Second Brain → THEHIVE Map

| Meta pattern | THEHIVE equivalent |
|---|---|
| Specialized worker agents | 4 sub-agents in `.claude/agents/` |
| Memory federation across workers | 10-repo colony system (HMAC-signed events) |
| Knowledge retrieval at inference | HDC lexicon ~150 concepts, `closest()` at O(n) |
| Task routing | `hive_mesh.py` fan-out to colony endpoints |
| Persistent shared memory | `memory/_graph.json` + per-colony `colony.json` |

---

## The Memory Cycle

```
CAPTURE → LINK → QUERY → RECALL → EVOLVE
```

| Step | Command | API | What it does |
|---|---|---|---|
| **Capture** | `/remember <concept>` | `POST /v11/brain/remember` | Encodes concept into HDC lexicon + appends to `memory/_index.md` |
| **Link** | `/link-nodes <A> <B>` | `POST /v11/brain/associate` | `hdc.bind(A,B)` → stores as `A:B` key in lexicon + wiki-links |
| **Query** | `/brain-query <concept>` | `GET /v11/brain/query?q=X&top_k=10` | `hdc.closest()` → ranked nearest concepts |
| **Recall** | — | `GET /v11/brain/recall/<concept>` | Traces context chain at configurable depth |
| **Evolve** | `/update-nav` | `python3 scripts/generate_memory_vault.py` | Rebuilds `_graph.json` + refreshes nav docs from AST scan |

---

## `/v11/brain/*` API Reference

```bash
# Capture: encode new concept (auth required)
curl -s -X POST "http://localhost:8080/v11/brain/remember" \
  -H "Content-Type: application/json" \
  -d '{"concept": "MYTOPIC", "description": "what this means"}'
# → {"concept":"MYTOPIC","vector_dim":1024,"lexicon_size":151}

# Query: nearest neighbors (no auth)
curl -s "http://localhost:8080/v11/brain/query?q=SOUL&top_k=5"
# → {"query":"SOUL","nearest":[{"concept":"TOKEN","similarity":0.41},...]}

# Associate: bind two concepts (auth required)
curl -s -X POST "http://localhost:8080/v11/brain/associate" \
  -H "Content-Type: application/json" \
  -d '{"concept_a": "DREAM", "concept_b": "ARENA"}'
# → {"association":"DREAM:ARENA","similarity_to_a":0.38,"similarity_to_b":0.41}

# Recall: trace context chain (no auth)
curl -s "http://localhost:8080/v11/brain/recall/SOUL?depth=2"
# → {"concept":"SOUL","chain":[...],"depth":2}

# Map: full HDC topology (no auth)
curl -s "http://localhost:8080/v11/brain/map"
# → {"nodes":[...],"edges":[...],"total_concepts":150,"sampled_for_edges":60}
```

---

## Slash Command Reference

| Command | One-liner |
|---|---|
| `/remember <concept>` | Capture to HDC + memory vault |
| `/link-nodes <A> <B>` | Wire synapse between two concepts |
| `/brain-query <concept>` | Nearest-neighbor HDC search |
| `/update-nav` | Regenerate all nav docs + graph |
| `/soul-check <description>` | F-001..F-006 constitutional check |
| `/hive-status` | All 7 colony health check |
| `/colony-zoom <name>` | Deep-dive into one colony |
| `/role-deliver <role> <type(scope): desc>` | Format + commit with role tag |
| `/merge-verify [branch]` | Pre-merge regression checklist |

---

## Sub-Agent Reference

| Agent | Trigger condition | Tools |
|---|---|---|
| `memory-librarian` | "update memory", "refresh vault", after backend refactor | Bash, Read, Write, Edit, Glob, Grep |
| `constitutional-validator` | Before economy/agency/governance changes | Read, Grep, Glob |
| `knowledge-cartographer` | "how does X relate to Y?", exploring concept space | Read, Glob, Grep, Bash |
| `colony-health-monitor` | "are all colonies up?", debugging federation | Bash, Read |

---

## HDC Concept Lexicon — Key Groups

The `hdc` singleton has ~150 pre-built concepts. Key groups:

**Soul / Economy:** `SOUL`, `TOKEN`, `WEALTH`, `STAKE`, `REWARD`, `DECAY`, `EVW`, `W_TOTAL`

**Federation:** `QUEEN`, `COLONY`, `GUILD`, `AGENT`, `HIVE`, `MESH`, `HMAC`, `BROADCAST`

**Cognition:** `MEMORY`, `WISDOM`, `TRUTH`, `DREAM`, `VISION`, `WONDER`, `ALCHEMY`, `REMEDY`

**Constitution:** `CONSTITUTION`, `LAW`, `MANDATE`, `REMEDY`, `SOVEREIGNTY`, `AUTONOMY`

**Arena / Conflict:** `ARENA`, `CHALLENGE`, `VOXEL`, `ELO`, `BATTLE`, `CONFLICT`, `RESOLUTION`

**Frequency / Resonance:** `FREQUENCY`, `SCHUMANN`, `RESONANCE`, `HARMONY`, `HEALING`

**Math / Geometry:** `TESSERACT`, `QUATERNION`, `CURVATURE`, `DIMENSION`, `HDC`, `BIND`

Any unknown concept auto-encodes via `hdc.get(name)` — deterministic seed from string hash.
New concepts persist **in-process only** (restart clears them from RAM; vault Markdown persists).

---

## Key Invariants (Never Violate)

| Constraint | Why |
|---|---|
| No Redis | `protocol.py` uses asyncio/SQLite WAL — intentional, free, correct at current scale |
| HMAC permissive when secret unset | Dev mode — intentional; set `HIVE_JWT_SECRET` for prod |
| Free tier only | No paid APIs, no paid infra beyond existing |
| Never edit `memory/backend/*.md` by hand | AST-generated, overwritten on every vault run |
| Never edit `soul.md` directly | Requires 2/3 guild vote + 30-day review |
| HDC bindings are ephemeral | `hdc.lexicon` is in-process only; vault Markdown is the durable layer |
| Advisory CI only | `continue-on-error: true` on all workflows |
| Branch `claude/session-continuation-owj5wr` | All Claude development here; PR required after push |

---

## Session Boot Sequence

```bash
# 1. Orient
cat CLAUDE.md | head -60

# 2. Check open work
git log --oneline -10
# check PRs via: mcp__github__list_pull_requests owner=TehutiRaEl repo=THEHIVE state=open

# 3. Load context
cat memory/planning/harness-plan-2026-07-10.md

# 4. Query the neocortex (if backend running)
curl -s "http://localhost:8080/v11/brain/query?q=SOUL&top_k=5"

# 5. Check colonies
# invoke .claude/agents/colony-health-monitor.md
```

---

## File Pointers — Complete Layer Map

```
.claude/
├── memory/memory.md           ← YOU ARE HERE
├── settings.json              ← model pin
├── agents/
│   ├── memory-librarian.md
│   ├── constitutional-validator.md
│   ├── knowledge-cartographer.md
│   └── colony-health-monitor.md
├── commands/                  ← 9 slash commands
└── skills/
    └── hive-memory.md         ← repeatable memory skill

memory/                        ← Obsidian vault (101 nodes)
├── _graph.json                ← D3 force graph (key: "links")
├── _index.md                  ← vault navigation hub
├── backend/                   ← AST-generated (do not hand-edit)
├── colonies/                  ← 10 colony pages
├── guilds/                    ← 12 guild pages
├── philosophy/                ← 4 cognitive lens docs
├── mathematics/               ← HDC, tesseract, resonance math
└── planning/                  ← session continuity docs

backend/core/hdc.py            ← HDC singleton (dim=1024, ~150 concepts)
backend/api/routes.py          ← /v11/brain/* endpoints (POST remember, GET query, etc.)
scripts/generate_memory_vault.py ← vault regenerator (AST scan → Markdown + _graph.json)
.github/workflows/memory-vault-update.yml ← auto-updates vault on main push
```
