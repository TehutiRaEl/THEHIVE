# THEHIVE MCP server

The real Model Context Protocol server for the Sovereign Hive federation —
built 2026-07-22 as part of the colony deep-integration pass. Not related to
`backend/mcp/` (that directory is an unwired, partly-simulated in-process
tool registry; this is a genuine MCP server using the real `mcp` SDK).

## Run

```bash
# stdio (local dev clients, e.g. Claude Desktop)
python -m backend.mcp_server.server

# streamable-http (what LocalAGI or any remote MCP client attaches to)
python -m backend.mcp_server.server --http --port 8100
```

Verified with a real JSON-RPC `initialize` handshake over the HTTP
transport (not just "should work") — see commit history for the exact
verification command.

## Tools

| Tool | Wraps | Notes |
|---|---|---|
| `hive_dispatch(event_type, payload)` | `backend.core.hive_mesh.hive_mesh.dispatch()` | HMAC-signed fan-out to every healthy colony, circuit-breaker protected |
| `hive_memory_recall(query, top_k)` | `GET /v11/memory/search` on the live Worker | Same call and same graceful degrade-to-unavailable behavior as `hive-conductor`'s `recall_context.py` |
| `hive_law_query(article=None)` | `soul.md` / `PERMISSIONS.md` on disk | No network — reads the actual constitution files directly |

## LocalAGI setup

In a LocalAGI agent's config, attach a remote MCP server pointing at
`http://<host>:8100/mcp` (no code change needed on LocalAGI's side —
`core/agent/mcp.go` already supports this). The agent can then call
`hive_dispatch`, `hive_memory_recall`, and `hive_law_query` as native tools
mid-conversation.
