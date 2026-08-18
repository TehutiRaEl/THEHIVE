# core/hitl

Human-in-the-Loop Module — Sovereign Hive v11.0

## Classes

- `HumanInTheLoop` — Escalation mechanism for high-stakes operations.

## Functions

- `get_pending_count()` — Get number of pending requests.
- `get_requests()` — Get HITL requests with optional status filter.
- `get_request()` — Get a specific HITL request by ID.
- `get_request_data()` — Get the in-memory record for a request — unlike get_request(), `params`
- `is_pending()` — Check if a request is still pending.
- `is_expired()` — Check if a request has expired.
- `is_resolved()` — Check if a request has been resolved.
- `get_all_pending()` — Get all pending requests.
- `get_all_expired()` — Get all expired requests.
- `get_all_resolved()` — Get all resolved requests.

## Links

[[core.config]] · [[core.db]]
