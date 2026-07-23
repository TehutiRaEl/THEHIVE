# Backend Core — Navigation Guide

## What Lives Here

The cerebellum of THEHIVE. These modules are imported by nearly everything else. Edit
with care — a bug here affects all 80+ endpoints.

## Module Quick Reference

| File | What it does | Key exports |
|------|-------------|-------------|
| `config.py` | Pydantic Settings (env vars) | `settings` singleton |
| `db.py` | SQLite WAL connection + 10 indexes | `get_db()` |
| `protocol.py` | asyncio event bus (50ms batch, NO Redis) | `protocol.publish()` |
| `hive_mesh.py` | HMAC fan-out to colonies, circuit breaker, PERMISSIONS.md tier gate (2026-07-22 — non-Tier-1-safe event types are held for founder review via `hitl`, not fired) | `hive_mesh.dispatch()` |
| `constitution.py` | F-001..F-006 enforcement, soul.md loader | `ConstitutionChecker` |
| `validator.py` | Ma'at validation, `is_critical_violation()` | `validator.validate()` |
| `hdc.py` | 1024-dim HDC/VSA — bind/bundle/closest | `hdc` singleton |
| `wealth.py` | EVW formula, W_total, 60s TTL cache | `wealth.compute_wealth()` |
| `alchemy.py` | Capture→Propagate cycle, grief detection | `AlchemyEngine` |
| `genesis.py` | Gap detection, mission generation | `gap_detector`, `mission_generator` |
| `agency.py` | AgencyLevel (OBSERVE→DEVIATE), 30s TTL | `agency.check()` |
| `agent_engine.py` | Agent registry, list/get/spawn | `list_agents()`, `get_agent()` |
| `arena.py` | Challenge lifecycle, ELO, voxel setup | `arena_manager` |
| `genome.py` | Agent genome + reproduction | `GenomeEngine` |
| `hitl.py` | Human-in-the-loop approval queue | `hitl.request_approval()` |
| `llm_router.py` | LLM provider waterfall (Ollama→Kimi→etc.) | `llm_router.complete()` |
| `ml_pipeline.py` | Whisper, Stable Diffusion, embeddings | `transcribe()`, `classify()` |
| `wallet.py` | SOUL token ledger | `wallet_manager` |
| `frequency_guild.py` | Schumann resonance, solfeggio healing | `frequency_guild` |

## The HDC Neocortex (hdc.py)

The module-level singleton `hdc = HyperDimensionalComputing(dim=1024)` is the third brain:

```python
from backend.core.hdc import hdc

vec = hdc.get("SOUL")                    # get or create concept vector
nearest = hdc.closest(vec, top_k=5)     # associative firing (ventricle lookup)
assoc = hdc.bind(hdc.get("A"), hdc.get("B"))  # wire two concepts (synapse)
merged = hdc.bundle(vec1, vec2, vec3)   # superposition (working memory)
hdc.add_concept("NEW_IDEA", metadata={}) # add to lexicon permanently
```

The lexicon has ~150 pre-built concepts. New concepts persist in-process (not to disk).
Use `/v11/brain/*` endpoints to interact with hdc from outside the process.
