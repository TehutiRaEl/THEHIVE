#!/usr/bin/env python3
"""
Thoth's real job (2026-08-03 chain-of-command work): keeper of the written record —
this script (plus the memory-librarian subagent that runs it) is the actual thing that
keeps the memory vault synchronized and accurate.

Generate Obsidian-compatible memory vault for THEHIVE.
Parses Python AST, extracts modules/classes/functions, emits [[wiki-links]] Markdown files.
Also writes memory/_graph.json for D3.js force graph in the Command Center UI.

Usage: python scripts/generate_memory_vault.py
"""

import ast
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).parent.parent
BACKEND = ROOT / "backend"
MEMORY = ROOT / "memory"

# ── helpers ───────────────────────────────────────────────────────────────────

def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9-]", "-", name.lower()).strip("-")


def _docstring(node) -> str:
    try:
        ds = ast.get_docstring(node)
        return (ds or "").split("\n")[0].strip()
    except Exception:
        return ""


def _write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"  wrote {path.relative_to(ROOT)}")


# ── Python AST → memory/backend/*.md ─────────────────────────────────────────

def parse_module(py_path: Path) -> dict[str, Any]:
    src = py_path.read_text(encoding="utf-8", errors="ignore")
    try:
        tree = ast.parse(src, filename=str(py_path))
    except SyntaxError:
        return {}

    classes = []
    functions = []
    imports = []
    endpoints = []

    for node in ast.walk(tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            module = getattr(node, "module", None) or ""
            if module.startswith("backend."):
                imports.append(module.replace("backend.", ""))
        elif isinstance(node, ast.ClassDef):
            classes.append({"name": node.name, "doc": _docstring(node)})
        elif isinstance(node, ast.FunctionDef):
            for deco in node.decorator_list:
                deco_src = ast.unparse(deco) if hasattr(ast, "unparse") else ""
                m = re.search(r'@?router\.(get|post|put|delete|patch)\("([^"]+)"', deco_src)
                if m:
                    endpoints.append({"method": m.group(1).upper(), "path": m.group(2)})
            if not node.name.startswith("_"):
                functions.append({"name": node.name, "doc": _docstring(node)})

    return {
        "module_doc": _docstring(tree),
        "classes": classes,
        "functions": functions,
        "imports": imports,
        "endpoints": endpoints,
    }


def emit_module_page(py_path: Path, info: dict) -> Path:
    rel = py_path.relative_to(BACKEND)
    parts = list(rel.parts)
    parts[-1] = parts[-1].replace(".py", "")
    link_name = "/".join(parts)
    out_path = MEMORY / "backend" / "/".join(parts[:-1]) / (parts[-1] + ".md")

    lines = [f"# {link_name}", ""]
    if info.get("module_doc"):
        lines += [info["module_doc"], ""]

    if info.get("endpoints"):
        lines += ["## Endpoints", ""]
        for ep in info["endpoints"]:
            lines.append(f"- `{ep['method']} {ep['path']}`")
        lines.append("")

    if info.get("classes"):
        lines += ["## Classes", ""]
        for cls in info["classes"]:
            doc = f" — {cls['doc']}" if cls.get("doc") else ""
            lines.append(f"- `{cls['name']}`{doc}")
        lines.append("")

    if info.get("functions"):
        lines += ["## Functions", ""]
        for fn in info["functions"][:20]:
            doc = f" — {fn['doc']}" if fn.get("doc") else ""
            lines.append(f"- `{fn['name']}()`{doc}")
        lines.append("")

    if info.get("imports"):
        links = [f"[[{imp}]]" for imp in sorted(set(info["imports"]))]
        lines += ["## Links", "", " · ".join(links), ""]

    _write(out_path, "\n".join(lines))
    return out_path


# ── Hand-crafted sections ─────────────────────────────────────────────────────

COLONIES = [
    ("THEHIVE", "Core Colony — governance engine, agent population, SOUL ledger, arena", "http://localhost:8080"),
    ("aether", "Revenue/Orchestration Colony — license authority, cross-colony task router", "https://github.com/TehutiRaEl/aether"),
    ("automatisch", "Automation Colony / Hive Bus — open-source Zapier, colony event backbone", "http://localhost:3001"),
    ("kimi-gateway", "Free LLM Gateway Colony — OmniRoute waterfall, 8 providers", "http://localhost:8181"),
    ("free-programming-books", "Academy Colony A — 40+ language knowledge RAG corpus", "https://github.com/TehutiRaEl/free-programming-books"),
    ("freeCodeCamp", "Academy Colony B — full curriculum for agent skill development", "https://github.com/TehutiRaEl/freeCodeCamp"),
    ("sovereign-hive-meta", "Queen — soul.md constitution authority, colony manifest", "https://github.com/TehutiRaEl/sovereign-hive-meta"),
    ("NAR2", "Outer Colony A — role TBD when access granted", None),
    ("4DBRAIN", "Outer Colony B — role TBD when access granted", None),
    ("n8n", "Workflow Engine — complex multi-step agent flows", "http://localhost:5678"),
]

GUILDS = [
    "academy", "arcane", "arena", "audit", "commerce", "constitutional",
    "dream", "frequency", "security", "treasury", "workflow", "worldbuilding",
]

HAND_CRAFTED: dict[str, str] = {}

# constitution/soul.md.md
HAND_CRAFTED["constitution/soul.md.md"] = """\
# soul.md — The Sovereign Constitution

The canonical constitution of the Sovereign Hive. All colonies pull from [[sovereign-hive-meta]] and must
maintain a matching `soul_md_hash` returned by [[colony]].

## Core Articles

1. **Identity** — Jasper is sovereign. No entity may override the constitutional identity.
2. **Transparency** — The board is always seen. No hidden state, no demo data.
3. **Economy** — SOUL flows 70% creator / 20% validator / 10% treasury. No exceptions.
4. **Equality** — All agents compete by ELO only. No favoritism.
5. **Freedom** — Any agent may exit any colony. Sovereignty is non-negotiable.
6. **Continuity** — The hive persists across all failures. Redundancy is a constitutional obligation.

## Enforcement

- [[constitution-middleware]] checks every API request
- [[prompt-injection]] shield blocks jailbreak attempts
- Hash verification: [[colony]] `/colony/health` returns current `soul_md_hash`
- Constitution updates dispatched by [[sovereign-hive-meta]] via GitHub Actions

## Links

[[constitution-middleware]] · [[voting]] · [[violations]] · [[colony]] · [[soul-token]]
"""

# constitution/voting.md
HAND_CRAFTED["constitution/voting.md"] = """\
# Voting — Constitutional Governance

Constitutional amendments require a supermajority vote across active colonies.

## Process

1. Proposal posted to [[sovereign-hive-meta]] as a GitHub Issue
2. 7-day open comment period
3. Voting period: colonies cast votes via `POST /colony/events` with `type: vote`
4. Pass threshold: >66% of active colonies (by SOUL stake weight)
5. On pass: Queen merges PR to `soul.md`, triggers `constitution-sync.yml`

## Links

[[soul.md]] · [[colony]] · [[soul-token]] · [[staking]]
"""

# economy pages
HAND_CRAFTED["economy/SOUL-token.md"] = """\
# SOUL Token

ERC-20 token deployed on Ethereum Sepolia testnet. Primary unit of value in the Sovereign Hive economy.

## Distribution

| Recipient | Share |
|-----------|-------|
| Task creator | 70% |
| Validator | 20% |
| Treasury | 10% |

## Contract

Implemented in `soul_token.sol`. ABI exposed via [[wallet]] endpoints.

## Links

[[wallet]] · [[staking]] · [[utility-economy]] · [[doubling-state]] · [[arena]]
"""

HAND_CRAFTED["economy/staking.md"] = """\
# Staking

Lock SOUL tokens to earn APY rewards.

## Parameters

- Default APY: configurable via `settings.staking_apy`
- Lock days: configurable per position
- Early unlock: forfeits accrued rewards

## Doubling Trigger

When resonance score ρ > 0.707 (1/√2), a doubling event fires — see [[doubling-state]].

## Links

[[SOUL-token]] · [[wallet]] · [[doubling-state]] · [[resonance-score]]
"""

HAND_CRAFTED["economy/doubling-state.md"] = """\
# Doubling State

When the hive resonance score ρ exceeds 1/√2 ≈ 0.707, a **doubling event** fires:
- All staking rewards are doubled for 24 hours
- Arena prize pool doubles
- New agent spawns are free (0 SOUL cost)

## Derivation

The threshold 1/√2 corresponds to the point where two equal-amplitude waves are in constructive
interference at 45° phase offset — a natural resonance peak in the [[frequency-mapping]] system.

## Links

[[resonance-score]] · [[staking]] · [[SOUL-token]] · [[frequency-mapping]] · [[hdc]]
"""

# philosophy
HAND_CRAFTED["philosophy/devils-advocate.md"] = """\
# Devil's Advocate Lens

10-step interrogation applied to every architectural decision:

1. What is the single point of failure?
2. What hidden assumptions are baked in?
3. What is the blast radius when this fails?
4. Who benefits if this is wrong?
5. What is the worst-case latency?
6. What breaks at 10× current load?
7. What does the attacker do with this?
8. What data is never shown (and why)?
9. What happens if a dependency disappears?
10. Is there a simpler path to the same outcome?

**The board is always seen.** No fake state, no demo data, no hidden metrics.

## Links

[[childlike-wonder]] · [[alchemical-process]] · [[dual-lens-framework]]
"""

HAND_CRAFTED["philosophy/childlike-wonder.md"] = """\
# Childlike Wonder Lens

5-step expansion applied after Devil's Advocate interrogation:

1. What if this worked perfectly — what becomes possible?
2. What if we removed the hardest constraint?
3. What does a 10-year-old think this should do?
4. What would make someone gasp in delight?
5. What connection to another domain is invisible to experts?

## Links

[[devils-advocate]] · [[alchemical-process]] · [[dual-lens-framework]]
"""

HAND_CRAFTED["philosophy/alchemical-process.md"] = """\
# Alchemical Integration Process

Applied to every external repository we synthesize:

| Stage | Question |
|-------|----------|
| **Nigredo** | What problem does this repo solve? What's broken about our current solution? |
| **Albedo** | What's the minimal extractable pattern (not the whole repo)? |
| **Citrinitas** | How does it integrate without breaking existing colonies? |
| **Rubedo** | What emerges that wasn't possible before? |

## Links

[[devils-advocate]] · [[childlike-wonder]] · [[dual-lens-framework]]
"""

HAND_CRAFTED["philosophy/dual-lens-framework.md"] = """\
# Dual-Lens Framework

The non-negotiable foundation for all decisions in the Sovereign Hive.

Every architectural choice passes through both lenses before implementation:

1. **[[devils-advocate]]** — interrogates what we've built (risk, failure, attack surface)
2. **[[childlike-wonder]]** — asks what it could become (possibility, emergence, delight)

Neither lens is optional. A decision made with only one lens is incomplete.

## Links

[[devils-advocate]] · [[childlike-wonder]] · [[alchemical-process]] · [[soul.md]]
"""

# LLM providers
HAND_CRAFTED["llm/waterfall.md"] = """\
# OmniRoute LLM Waterfall

8-provider dynamic routing system in [[kimi-gateway]]. Scoring:

```
score = availability × (1 / avg_latency_ms) × (1 / priority)
```

Rolling 5-sample latency window per provider. Health TTL: 60 seconds (optimistic reset).

## Provider Priority

| Priority | Provider | Model | Key Env Var |
|----------|----------|-------|-------------|
| 1 | Ollama (local) | llama3:8b | OLLAMA_BASE_URL |
| 2 | Moonshot | moonshot-v1-128k | MOONSHOT_API_KEY |
| 3 | SiliconFlow | Qwen2.5-72B | SILICONFLOW_API_KEY |
| 4 | DeepSeek | deepseek-chat | DEEPSEEK_API_KEY |
| 5 | Zhipu | glm-4-flash | ZHIPU_API_KEY |
| 6 | Groq | llama-3.3-70b | GROQ_API_KEY |
| 7 | OpenRouter | llama-3.1-8b:free | OPENROUTER_API_KEY |
| 8 | Gemini | gemini-1.5-flash | GEMINI_API_KEY |

## Links

[[ollama]] · [[groq]] · [[moonshot]] · [[providers]] · [[kimi-gateway]]
"""

HAND_CRAFTED["llm/providers.md"] = """\
# LLM Providers Registry

All providers are **free tier** — zero recurring cost.

| Provider | Free Quota | Endpoint |
|----------|-----------|----------|
| Ollama | Unlimited (local) | http://localhost:11434 |
| Moonshot | ~15M tokens/month | api.moonshot.cn/v1 |
| SiliconFlow | 14M tokens signup | api.siliconflow.cn/v1 |
| DeepSeek | Generous | api.deepseek.com/v1 |
| Zhipu | GLM-4-Flash free forever | open.bigmodel.cn/api/paas/v4 |
| Groq | 14,400 req/day | api.groq.com/openai/v1 |
| OpenRouter | :free models unlimited | openrouter.ai/api/v1 |
| Gemini | 15 req/min | generativelanguage.googleapis.com |

All keys stored as GitHub Actions secrets + Oracle Cloud `.env`. **Never in code.**

## Links

[[waterfall]] · [[ollama]] · [[groq]]
"""

# mathematics
HAND_CRAFTED["mathematics/resonance-score.md"] = """\
# Resonance Score (ρ)

Composite hive health metric combining:
- Agent ELO distribution (entropy)
- SOUL velocity (tokens/hour)
- Colony connectivity (graph density)
- Frequency alignment (Hz deviation from Schumann base)

Range: 0.0 (dead) → 1.0 (peak resonance)

## Doubling Threshold

ρ > 1/√2 ≈ 0.707 triggers [[doubling-state]].

## Links

[[doubling-state]] · [[doubling-threshold]] · [[hdc]] · [[frequency-mapping]] · [[elo]]
"""

HAND_CRAFTED["mathematics/hdc.md"] = """\
# Hyperdimensional Computing (HDC)

High-dimensional binary vectors (10,000 dimensions) represent agent genomes, memories, and colony states.
Operations: XOR (bind), AND (bundle), Hamming distance (similarity).

Used in THEHIVE for:
- Agent genome encoding ([[genome]])
- Colony state fingerprinting
- Memory associative recall ([[agents/memory]])

## Links

[[genome]] · [[resonance-score]] · [[agents/memory]] · [[tesseract]]
"""

HAND_CRAFTED["mathematics/tesseract.md"] = """\
# Tesseract — 4D Colony World Model

The Phaser world map is a 2D projection of a 4D tesseract. Each colony zone occupies a face.
Rotation through the 4th dimension reveals hidden colony relationships invisible in 3D.

The Three.js Cortana oracle head rotates through this space, visualizing the current dimensional phase.

## Links

[[hdc]] · [[frequency-mapping]] · [[resonance-score]]
"""

HAND_CRAFTED["mathematics/frequency-mapping.md"] = """\
# Frequency Mapping

Maps Hz ranges to emotional/functional states for the Frequency Guild:

| Range (Hz) | State | Guild Use |
|------------|-------|-----------|
| 0.1–4 | Delta — deep integration | Memory consolidation |
| 4–8 | Theta — creativity | Dream guild tasks |
| 8–12 | Alpha — flow | Arena optimal performance |
| 12–30 | Beta — active | Standard agent cognition |
| 30–100 | Gamma — peak awareness | Constitution voting |
| 7.83 | Schumann — baseline | Hive synchronization |

## Links

[[resonance-score]] · [[hdc]] · [[tesseract]] · [[frequency-guild]]
"""

# agents
HAND_CRAFTED["agents/lifecycle.md"] = """\
# Agent Lifecycle

```
spawn → compete → evolve → die
```

1. **Spawn**: POST /v11/agents/spawn — deducts SOUL, generates Ed25519 key pair, assigns genome
2. **Compete**: arena battles, task completion, knowledge queries — all earn/lose ELO
3. **Evolve**: ELO > threshold → trait unlock, genome mutation, new tool access
4. **Die**: ELO < floor OR explicit DELETE → SOUL returned pro-rata

## Links

[[genome]] · [[elo]] · [[agents/memory]] · [[react-engine]] · [[arena]] · [[SOUL-token]]
"""

HAND_CRAFTED["agents/genome.md"] = """\
# Agent Genome

Ed25519 public/private key pair forms the identity core. Traits encoded as HDC vectors.

## Fields

- `agent_id`: UUID
- `public_key`: Ed25519 hex
- `traits`: dict of float values (curiosity, persistence, creativity, etc.)
- `elo`: current ELO rating (default 1200)
- `guild`: primary guild membership
- `memory_id`: pointer to ChromaDB collection

## Inheritance

Spawning from a parent agent inherits 50% of parent traits with Gaussian noise (σ=0.1).

## Links

[[lifecycle]] · [[elo]] · [[agents/memory]] · [[hdc]] · [[SOUL-token]]
"""

HAND_CRAFTED["agents/elo.md"] = """\
# ELO Rating System

Standard Elo rating (K=32) adapted for multi-agent arena battles and task competitions.

- Default rating: 1200
- K-factor: 32 (volatile early, 16 after 30 matches)
- Floor: 600 (below this = death trigger)
- Ceiling: uncapped

## Arena Application

`POST /v11/arena/battle` resolves a battle, updates both agents' ELO.

## Links

[[lifecycle]] · [[arena]] · [[genome]]
"""

HAND_CRAFTED["agents/memory.md"] = """\
# Agent Memory

Two-tier architecture:

| Tier | Store | TTL | Capacity |
|------|-------|-----|----------|
| Short-term | Python dict (in-process) | Session | 50 items |
| Long-term | ChromaDB collection | Permanent | Unlimited |

Recall: cosine similarity search over long-term store, re-hydrated into short-term at session start.

Archival: short-term overflow → embed → ChromaDB write (async).

## Links

[[lifecycle]] · [[genome]] · [[react-engine]] · [[chromadb]] · [[knowledge]]
"""

HAND_CRAFTED["agents/react-engine.md"] = """\
# ReAct Engine

Reason + Act loop powering all THEHIVE agents.

```
Thought: [reasoning about goal]
Tool: {"name": "...", "args": {...}}
Observation: [tool result]
... (repeat up to max_steps)
ANSWER: [final response]
```

Implemented in `backend/core/agent_engine.py`.

## Tools Available

- `search_knowledge` — ChromaDB RAG query
- `web_search` — DuckDuckGo (no API key)
- `browser_task` — Playwright automation
- `arena_challenge` — challenge another agent
- `delegate` — delegate subtask to another agent

## Links

[[lifecycle]] · [[agents/memory]] · [[browser]] · [[knowledge]] · [[waterfall]]
"""


def emit_hand_crafted():
    for rel_path, content in HAND_CRAFTED.items():
        _write(MEMORY / rel_path, content)


def emit_colony_pages():
    for name, desc, url in COLONIES:
        lines = [f"# {name}", "", desc, ""]
        if url:
            lines += [f"**URL**: {url}", ""]
        lines += [
            "## Colony Standard Endpoints",
            "",
            "- `GET /colony/info` — name, role, soul_md_hash, guilds, status",
            "- `GET /colony/health` — status, uptime, last_soul_sync",
            "- `POST /colony/events` — receive cross-colony events",
            "- `GET /colony/agents` — list agents (if applicable)",
            "",
            "## Links",
            "",
            "[[soul.md]] · [[colony]] · [[THEHIVE]]",
        ]
        _write(MEMORY / "colonies" / f"{_slug(name)}.md", "\n".join(lines))


def emit_guild_pages():
    descriptions = {
        "academy": "Knowledge acquisition and agent training. Manages ChromaDB corpus.",
        "arcane": "Advanced mathematics, HDC, and frequency research.",
        "arena": "Combat tournaments, ELO ranking, prize pools.",
        "audit": "Constitution compliance, transaction verification.",
        "commerce": "SOUL token flows, marketplace, licensing.",
        "constitutional": "Voting, amendments, soul.md enforcement.",
        "dream": "Creative generation (Stable Diffusion, music, narrative).",
        "frequency": "Hz-to-state mapping, Schumann sync, resonance scoring.",
        "security": "Prompt injection defense, colony hardening, audit logs.",
        "treasury": "10% fee collection, reserve management, doubling fund.",
        "workflow": "n8n/automatisch flows, cross-colony automation.",
        "worldbuilding": "Phaser world map, colony zone design, lore.",
    }
    for guild in GUILDS:
        desc = descriptions.get(guild, "")
        content = f"# {guild.title()} Guild\n\n{desc}\n\n## Links\n\n[[soul.md]] · [[THEHIVE]] · [[arena]]\n"
        _write(MEMORY / "guilds" / f"{guild}.md", content)


# ── _graph.json ───────────────────────────────────────────────────────────────

def build_graph(module_infos: list[dict]) -> dict:
    nodes = []
    links = []
    seen_ids = set()

    def add_node(id_, label, group):
        if id_ not in seen_ids:
            nodes.append({"id": id_, "label": label, "group": group})
            seen_ids.add(id_)

    # Colony nodes
    for name, _, _ in COLONIES:
        add_node(f"colony/{name}", name, "colony")

    # Guild nodes
    for guild in GUILDS:
        add_node(f"guild/{guild}", guild.title(), "guild")

    # Backend module nodes
    for info in module_infos:
        mod_id = info["id"]
        add_node(mod_id, info["label"], "module")
        for imp in info.get("imports", []):
            target = f"backend/{imp.replace('.', '/')}"
            if target in seen_ids:
                links.append({"source": mod_id, "target": target})

    # Philosophy nodes
    for page in ["devils-advocate", "childlike-wonder", "alchemical-process", "dual-lens-framework"]:
        add_node(f"philosophy/{page}", page.replace("-", " ").title(), "philosophy")

    # Cross-links: all colonies → THEHIVE
    for name, _, _ in COLONIES:
        if name != "THEHIVE":
            links.append({"source": f"colony/{name}", "target": "colony/THEHIVE"})

    # All guilds → THEHIVE
    for guild in GUILDS:
        links.append({"source": f"guild/{guild}", "target": "colony/THEHIVE"})

    return {"nodes": nodes, "links": links}


# ── Federation repo walk ─────────────────────────────────────────────────────

FEDERATION_ROOT = ROOT.parent  # /home/user (parent of THEHIVE checkout)

ROLE_FOR_COLONY_ID = {
    "thehive": "core",
    "aether": "revenue",
    "automatisch": "automation",
    "kimi-k2": "llm",
    "localagi": "unknown",
    "nar2": "unknown",
    "4dbrain": "unknown",
    "build-your-own-x": "knowledge",
    "free-programming-books": "knowledge",
    "freecodecamp": "curriculum",
}

SIZE_FOR_ROLE = {
    "core": 22, "revenue": 15, "automation": 15, "llm": 17,
    "knowledge": 13, "curriculum": 13, "unknown": 11,
}


def scan_federation_repos() -> dict:
    """Walk sibling repo directories, read colony.json/soul.md/README.md.

    Returns extra_nodes and extra_links to merge into _graph.json.
    """
    extra_nodes: list[dict] = []
    extra_links: list[dict] = []
    seen_ids: set[str] = set()

    if not FEDERATION_ROOT.is_dir():
        return {"nodes": extra_nodes, "links": extra_links}

    for repo_dir in sorted(FEDERATION_ROOT.iterdir()):
        if not repo_dir.is_dir() or repo_dir.name.startswith("."):
            continue
        if repo_dir == ROOT:
            continue  # THEHIVE is already in COLONY_GRAPH

        # Try reading colony.json for authoritative identity
        colony_json_path = repo_dir / "colony.json"
        colony_id = repo_dir.name
        role = ROLE_FOR_COLONY_ID.get(colony_id.lower(), "unknown")
        description = ""

        if colony_json_path.exists():
            try:
                cj = json.loads(colony_json_path.read_text(encoding="utf-8", errors="ignore"))
                colony_id = cj.get("colony_name") or cj.get("colony_id") or colony_id
                role_map = {"colony": "unknown", "outer-colony": "unknown",
                            "core": "core", "mind": "llm"}
                archetype_map = {
                    "commerce": "revenue", "cognitive": "unknown", "security": "unknown",
                    "workflow": "automation", "mind": "llm",
                }
                role = (archetype_map.get(cj.get("archetype", ""), None)
                        or role_map.get(cj.get("role", ""), "unknown")
                        or ROLE_FOR_COLONY_ID.get(repo_dir.name.lower(), "unknown"))
                description = str(cj.get("entity", "")) or cj.get("colony_name", "")
            except Exception:
                pass

        # Soul.md first line as description fallback
        if not description:
            soul_path = repo_dir / "soul.md"
            if soul_path.exists():
                try:
                    first = soul_path.read_text(encoding="utf-8", errors="ignore").split("\n")[0]
                    description = first.lstrip("# ").strip()
                except Exception:
                    pass

        # README first non-empty, non-header line
        if not description:
            readme = repo_dir / "README.md"
            if readme.exists():
                try:
                    for line in readme.read_text(encoding="utf-8", errors="ignore").split("\n"):
                        stripped = line.strip().lstrip("#").strip()
                        if stripped and not stripped.startswith("!") and not stripped.startswith("<"):
                            description = stripped[:120]
                            break
                except Exception:
                    pass

        node_id = colony_id
        if node_id not in seen_ids:
            extra_nodes.append({
                "id": node_id,
                "role": role,
                "size": SIZE_FOR_ROLE.get(role, 11),
                "description": description,
                "repo": repo_dir.name,
            })
            seen_ids.add(node_id)
            extra_links.append({"source": node_id, "target": "THEHIVE", "active": False})

    return {"nodes": extra_nodes, "links": extra_links}


# ── _index.md ─────────────────────────────────────────────────────────────────

def emit_index():
    lines = [
        "# Sovereign Hive Memory Vault",
        "",
        "The complete knowledge graph of THEHIVE. Open in Obsidian for visual navigation.",
        "",
        "## Categories",
        "",
        "| Category | Description |",
        "|----------|-------------|",
        "| [[constitution/soul.md]] | The canonical constitution |",
        "| [[colonies/THEHIVE]] | Colony index |",
        "| [[agents/lifecycle]] | Agent lifecycle |",
        "| [[economy/SOUL-token]] | SOUL economy |",
        "| [[guilds/arena]] | Guild index |",
        "| [[llm/waterfall]] | LLM routing |",
        "| [[mathematics/resonance-score]] | Mathematics |",
        "| [[philosophy/dual-lens-framework]] | Philosophy |",
        "| [[backend/api/routes]] | API endpoints |",
        "",
        "## Quick Links",
        "",
        "[[soul.md]] · [[THEHIVE]] · [[waterfall]] · [[resonance-score]] · [[devils-advocate]]",
    ]
    _write(MEMORY / "_index.md", "\n".join(lines))


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    print("Generating memory vault...")
    MEMORY.mkdir(exist_ok=True)

    # Parse all backend Python files
    module_infos = []
    for py_path in sorted(BACKEND.rglob("*.py")):
        if "__pycache__" in str(py_path):
            continue
        info = parse_module(py_path)
        if not info:
            continue
        out = emit_module_page(py_path, info)
        rel = py_path.relative_to(BACKEND)
        mod_id = "backend/" + "/".join(rel.parts).replace(".py", "")
        module_infos.append({
            "id": mod_id,
            "label": mod_id.split("/")[-1],
            "imports": info.get("imports", []),
        })

    # Hand-crafted pages
    emit_hand_crafted()
    emit_colony_pages()
    emit_guild_pages()
    emit_index()

    # _graph.json — merge THEHIVE AST graph with federation-wide repo scan
    graph = build_graph(module_infos)
    fed = scan_federation_repos()
    existing_ids = {n["id"] for n in graph["nodes"]}
    for node in fed["nodes"]:
        if node["id"] not in existing_ids:
            graph["nodes"].append(node)
            existing_ids.add(node["id"])
    graph["links"].extend(fed["links"])
    graph_path = MEMORY / "_graph.json"
    graph_path.write_text(json.dumps(graph, indent=2), encoding="utf-8")
    print(f"  wrote memory/_graph.json ({len(graph['nodes'])} nodes, {len(graph['links'])} links)")
    if fed["nodes"]:
        print(f"  + {len(fed['nodes'])} federation repo nodes from {FEDERATION_ROOT}")

    # _federation.json — live snapshot of all discovered colony identities
    federation_snapshot: list[dict] = []
    queen_soul = ROOT / "soul.md"
    queen_hash = ""
    if queen_soul.exists():
        import hashlib
        queen_hash = hashlib.sha256(queen_soul.read_bytes()).hexdigest()[:16]
    # Always include THEHIVE itself
    thehive_cj_path = ROOT / "colony.json"
    if thehive_cj_path.exists():
        try:
            thehive_cj = json.loads(thehive_cj_path.read_text(encoding="utf-8", errors="ignore"))
            federation_snapshot.append({**thehive_cj, "soul_md_hash": queen_hash, "source": "local"})
        except Exception:
            pass
    # Append sibling colonies
    if FEDERATION_ROOT.is_dir():
        for repo_dir in sorted(FEDERATION_ROOT.iterdir()):
            if not repo_dir.is_dir() or repo_dir.name.startswith(".") or repo_dir == ROOT:
                continue
            cj_path = repo_dir / "colony.json"
            if cj_path.exists():
                try:
                    cj = json.loads(cj_path.read_text(encoding="utf-8", errors="ignore"))
                    soul_hash = ""
                    soul_path = repo_dir / "soul.md"
                    if soul_path.exists():
                        import hashlib
                        soul_hash = hashlib.sha256(soul_path.read_bytes()).hexdigest()[:16]
                    federation_snapshot.append({**cj, "soul_md_hash": soul_hash, "source": "local"})
                except Exception:
                    pass
    fed_dir = MEMORY / "colonies"
    fed_dir.mkdir(parents=True, exist_ok=True)
    fed_json_path = fed_dir / "_federation.json"
    fed_json_path.write_text(json.dumps(federation_snapshot, indent=2), encoding="utf-8")
    print(f"  wrote memory/colonies/_federation.json ({len(federation_snapshot)} colonies)")

    total = sum(1 for _ in MEMORY.rglob("*.md"))
    print(f"\nDone — {total} Markdown files, 2 graph JSON files in memory/")


if __name__ == "__main__":
    main()
