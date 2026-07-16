# core/agent_engine

Agent Engine — Sovereign Hive v12.0

## Classes

- `Tool`
- `ShortTermMemory` — Rolling window of recent observations (last N turns).
- `LongTermMemory` — MemGPT-style paging memory: main context (hot) + archival storage (cold).
- `_PrioritizedTask`
- `PrioritizedTaskQueue` — Self-ranking task queue inspired by BabyAGI (yoheinakajima).
- `ReactAgent`
- `_P`

## Functions

- `register_tool()` — Decorator to register a callable as a hive tool.
- `tool_schema_list()` — Return tool schemas as a JSON-serialisable list (for LLM system prompt).
- `create_agent()`
- `list_agents()`
- `get_agent()`
- `decorator()`
- `add()`
- `as_messages()`
- `store()`
- `retrieve()`
- `hot_context()`
- `add()`
- `pop()`
- `reprioritize()`
- `as_list()`
- `handle_starttag()`
- `handle_data()`

## Links

[[core]]
