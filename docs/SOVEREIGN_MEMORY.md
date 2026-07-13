# Sovereign Memory — semantic recall for the hive

The hive's honest answer to the research briefing's (fictional) `neuromcp` "memory core":
built on **real Cloudflare Vectorize + Workers AI embeddings**, on your own account, free tier.

## What it does
The hive can now *remember and recall its own history semantically*. Each heartbeat's
action ("resolved #31: Ma'at defeats Kai El · spawned #32 …") is embedded with a free
Workers AI model (`@cf/baai/bge-base-en-v1.5`, 768-dim) and stored as a vector. A natural-
language query is embedded the same way and matched by cosine similarity — so the hive can
answer "when did governance last change?" or "what has Kai El been arguing?" over its own past.

## Endpoints (edge Queen, `/v11`)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v11/memory/search?q=…&topK=5` | GET/POST | semantic recall — nearest memories to the query |
| `/v11/memory/remember` | POST `{text, kind?}` | store a memory manually |
| `/v11/memory/status` | GET | `{vectorize_bound, ai_bound, model}` — wiring check |

All degrade gracefully: with the index unprovisioned, writes/queries no-op and `status`
reports `vectorize_bound:false`. Nothing throws; the heartbeat is unaffected.

## Activation (founder, one-time — deploy-safe by design)
The `vectorize` binding in `wrangler.jsonc` is **commented out on purpose**: a binding to a
non-existent index fails the deploy and would take the live Queen down. So:

1. Create the index (once):
   ```bash
   npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine
   ```
2. Uncomment the `"vectorize"` block in `wrangler.jsonc`, commit → Workers Builds redeploys.
3. Verify: `GET /v11/memory/status` → `vectorize_bound:true`. Memory begins filling on the
   next heartbeat (every 30 min); `GET /v11/memory/search?q=arena` starts returning matches.

## Where this sits in the architecture
This is the **memory layer beneath the Hive Conductor**. The Conductor routes and governs;
the heartbeat acts; sovereign memory lets the hive *recall what it has done* — closing the
last real capability gap from the founder's research (on verified ground, not the fictional
`neuromcp`). Next: index the D1 governance_log + agents into Vectorize too, and let the
Conductor query memory before planning (retrieval-augmented orchestration).
