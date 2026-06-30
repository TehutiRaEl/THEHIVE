# OmniRoute — Dynamic LLM Provider Scoring

**Pattern extracted**: `score = availability × (1/avg_latency) × (1/priority)`

## Integration

`gateway/index.js` — `providerScore()`, `_stats` Map, `markProvider()`.
Rolling 5-sample latency window. 60s health TTL with optimistic reset.
Providers sorted by score descending before each request — fast + healthy providers rise naturally.

## Links

[[waterfall]] · [[providers]] · [[kimi-gateway]]
