# core/protocol

Coordination Protocol — Sovereign Hive

## Classes

- `HiveEvent`
- `HiveProtocol` — Lightweight async event bus for intra-hive coordination.

## Functions

- `to_dict()`
- `publish_sync()` — Synchronous publish for use in non-async contexts.
- `subscribe()` — Subscribe to an event type. Returns a Queue that receives HiveEvent objects.
- `unsubscribe()`
- `get_log()` — Retrieve persisted event log for audit trail.

## Links

[[core.db]]
