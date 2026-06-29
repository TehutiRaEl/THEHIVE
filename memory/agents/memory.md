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
