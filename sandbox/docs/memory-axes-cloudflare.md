# KAIEL Memory Axes — Cloudflare Mapping (2026-09-14)

Design only. Not yet wired into production Worker.

## Axes (not types)

1. **What is stored** — type enum: fact | event | procedure | skill | self_obs | counterfactual | meta
2. **State** — active | archived | suppressed | decayed
3. **Source & reliability** — source + confidence (0–1)
4. **Medium** — classical only (D1 + Vectorize)
5. **Access pattern** — semantic (Vectorize) + contextual (metadata/tags) + exact (SQL)
6. **Valence / salience** — salience score + optional valence tag

## Proposed D1 schema

```sql
CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'active',
  content TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.7,
  salience REAL NOT NULL DEFAULT 0.5,
  valence TEXT,
  context_tags TEXT,
  vector_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_used_at TEXT,
  use_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0
);

CREATE TABLE memory_links (
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  relation TEXT NOT NULL,
  confidence REAL DEFAULT 0.8,
  PRIMARY KEY (from_id, to_id, relation)
);
```

## Vectorize

- One index; vector id = memories.id
- Metadata: type, state, source, confidence, salience, context_tags
- Embed with Workers AI (e.g. @cf/baai/bge-base-en-v1.5)

## Mechanisms

- Compression job → summary rows
- Suppression → state flag (never hard-delete by default)
- Adaptive scoring → bump/decay salience on use outcome
- Contextual retrieval → filter by context_tags + semantic score

Quantum / "stasis as type" / invented labels stay out of schema.
