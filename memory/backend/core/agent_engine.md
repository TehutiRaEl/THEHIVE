# core/agent_engine

Agent Engine — Sovereign Hive v12.0

## Classes

- `Tool`
- `ShortTermMemory` — Rolling window of recent observations (last N turns).
- `LongTermMemory` — Persistent summaries and key facts extracted from completed tasks.
- `ReactAgent`
- `_P`

## Functions

- `register_tool()` — Decorator to register a callable as a hive tool.
- `tool_schema_list()` — Return tool schemas as a JSON-serialisable list (for LLM system prompt).
- `create_agent()`
- `decorator()`
- `add()`
- `as_messages()`
- `store()`
- `retrieve()`
- `handle_starttag()`
- `handle_data()`

## Links

[[core]]
