# Backend — Navigation Guide

## What Lives Here

The FastAPI application. Entry point: `backend/main.py`. All HTTP endpoints are in
`backend/api/routes.py` (80+ routes under the `/v11` prefix). The brain of THEHIVE.

## Directory Structure

| Path | Contents |
|------|----------|
| `main.py` | FastAPI app + lifespan, CORS, middleware mounts, router includes |
| `api/routes.py` | All 80+ `/v11/*` endpoints — the primary file to edit for new routes |
| `api/colony.py` | Colony endpoints: `/colony/health`, `/colony/info`, `/colony/events`, etc. |
| `api/ml.py` | ML endpoints: `/v11/voice/transcribe`, `/v11/image/generate`, `/v11/ml/*` |
| `api/auth.py` | JWT auth: `verify_auth` dependency, `/v11/auth/token` |
| `api/middleware.py` | HSTS, body size limit, IP violation counter |
| `api/models.py` | Pydantic response models |
| `core/` | The cerebellum — see `core/CLAUDE.md` |
| `economy/` | Staking + utility economy |
| `governance/` | Governance patterns + recommend logic |
| `guilds/` | 12 guild module stubs |
| `memory/` | Episodic memory + vector store |
| `mcp/` | An in-process tool registry — NOT a real MCP (Model Context Protocol) server; no JSON-RPC/transport, one tool (`web_search_tool`) is literally simulated, unwired from `routes.py`. A real MCP server for the federation (colonies as MCP clients) is planned separately — see memory/planning/'s colony deep-integration Phase E — do not confuse the two. |
| `tier2/` | Thin re-export shims since 2026-07-22 — the real 4D tesseract math, dream engine, hypercomplex layers, ARG-NN now live in 4DBRAIN's `tesseract_math` package (4DBRAIN being the colony whose name promised it) |
| `tier3/` | Arena renderer, quantum bridge, sheaf guild, IPFS pubsub, tesseract model |
| `utils/` | Crypto helpers, rate limiter, misc utils |

## Key Patterns

- All routes use `Depends(verify_auth)` for protected endpoints
- DB access via `get_db()` from `backend/core/db.py`
- Event bus: publish via `protocol.publish(event_type, payload)` (asyncio queue, NOT Redis)
- Colony fan-out: `hive_mesh.broadcast(event)` with HMAC signing
- Settings: `from backend.core.config import settings` (Pydantic BaseSettings)

## Adding a New Route

Append to `backend/api/routes.py`. The router is `router = APIRouter(prefix="/v11")`.
Add imports at the top with existing ones. Follow the pattern:
```python
@router.get("/your/path")
async def your_handler(auth: Dict = Depends(verify_auth)):
    return {"result": ...}
```

## What NOT to Change

- `protocol.py` — the event bus; do not add Redis here
- `hive_mesh.py` — HMAC signing logic; permissive mode when secret unset is intentional
- `constitution.py` — fixed law enforcement; F-001 through F-006 are immutable
