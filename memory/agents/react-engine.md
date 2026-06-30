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
