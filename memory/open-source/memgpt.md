# MemGPT / Letta — Paging Memory Architecture

**Repo**: cpacker/MemGPT (now Letta)
**Pattern extracted**: Two-tier paging memory — hot context + archival storage

## Core Insight

LLMs have a fixed context window. MemGPT treats the context window like OS RAM and archival storage
like disk. Facts that don't fit in hot context are "paged out" to a searchable archive and retrieved
on demand.

## Integration in THEHIVE

`backend/core/agent_engine.py` — `LongTermMemory` class:
- `hot: List[str]` — last 20 facts, always in LLM context
- `archival: List[str]` — up to 2000 facts, keyword-searchable
- `store(fact)` evicts oldest hot fact to archival when full (page-out)
- `retrieve(query)` searches both tiers ranked by keyword overlap

## Links

[[agents/memory]] · [[react-engine]] · [[crewai]] · [[babyagi]]
