"""
Debug API — Sovereign Hive v12.0
Live diagnostics: endpoint health, log tail, env key presence, git status, route map.
All endpoints require X-API-Key or Bearer token (same auth as other routes).
"""

import logging
import os
import subprocess
import collections
from typing import Optional

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

logger = logging.getLogger("jasper.debug")

router = APIRouter(prefix="/v11/debug", tags=["debug"])

# ── In-memory log capture ──────────────────────────────────────
class _MemHandler(logging.Handler):
    def __init__(self, maxlen=200):
        super().__init__()
        self._buf = collections.deque(maxlen=maxlen)

    def emit(self, record):
        self._buf.append(self.format(record))

    def tail(self, n=20):
        return list(self._buf)[-n:]


_mem_handler = _MemHandler(maxlen=200)
_mem_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s — %(message)s"))
logging.getLogger().addHandler(_mem_handler)


# ── /v11/debug/health ─────────────────────────────────────────
@router.get("/health")
async def debug_health():
    """Comprehensive subsystem health check."""
    results = {}

    # FastAPI / Python process
    import platform, sys
    results["process"] = {
        "ok": True,
        "python": sys.version.split()[0],
        "platform": platform.system(),
    }

    # SQLite / DB
    try:
        from backend.core.db import get_db
        db = next(get_db())
        db.execute("SELECT 1")
        results["db"] = {"ok": True, "engine": "sqlite"}
    except Exception as e:
        results["db"] = {"ok": False, "error": str(e)}

    # ChromaDB
    try:
        import chromadb
        client = chromadb.Client()
        results["chromadb"] = {"ok": True, "collections": len(client.list_collections())}
    except ImportError:
        results["chromadb"] = {"ok": False, "error": "chromadb not installed"}
    except Exception as e:
        results["chromadb"] = {"ok": False, "error": str(e)}

    # Redis
    try:
        import redis
        r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, socket_connect_timeout=2)
        r.ping()
        results["redis"] = {"ok": True}
    except ImportError:
        results["redis"] = {"ok": False, "error": "redis not installed"}
    except Exception as e:
        results["redis"] = {"ok": False, "error": str(e)}

    # LLM gateway
    try:
        import httpx, time
        gateway = os.getenv("LLM_GATEWAY_URL", "http://localhost:8181")
        t0 = time.time()
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{gateway}/health")
        latency_ms = round((time.time() - t0) * 1000)
        results["llm_gateway"] = {"ok": r.status_code == 200, "url": gateway, "latency_ms": latency_ms}
    except Exception as e:
        results["llm_gateway"] = {"ok": False, "error": str(e)}

    # ML pipeline
    try:
        from backend.core.ml_pipeline import pipeline_status
        ml = await pipeline_status()
        results["ml_pipeline"] = {"ok": True, **ml}
    except Exception as e:
        results["ml_pipeline"] = {"ok": False, "error": str(e)}

    # Ollama
    try:
        import httpx, time
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        t0 = time.time()
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{ollama_url}/api/tags")
        latency_ms = round((time.time() - t0) * 1000)
        models = [m["name"] for m in (r.json().get("models") or [])]
        results["ollama"] = {"ok": r.status_code == 200, "latency_ms": latency_ms, "models": models[:5]}
    except Exception as e:
        results["ollama"] = {"ok": False, "error": str(e)}

    all_ok = all(v.get("ok") for v in results.values())
    return {"overall": "healthy" if all_ok else "degraded", "subsystems": results}


# ── /v11/debug/logs ───────────────────────────────────────────
@router.get("/logs")
async def debug_logs(lines: int = Query(20, ge=1, le=200)):
    """Return last N lines from in-memory log buffer."""
    return {"lines": _mem_handler.tail(lines), "buffer_size": len(_mem_handler._buf)}


# ── /v11/debug/env ────────────────────────────────────────────
_TRACKED_KEYS = [
    "MOONSHOT_API_KEY", "SILICONFLOW_API_KEY", "DEEPSEEK_API_KEY",
    "ZHIPU_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "GEMINI_API_KEY",
    "ANTHROPIC_API_KEY", "OPENAI_API_KEY",
    "OLLAMA_BASE_URL", "LLM_GATEWAY_URL",
    "DATABASE_URL", "REDIS_HOST", "REDIS_PASSWORD",
    "SECRET_KEY", "API_KEY", "CORS_ORIGINS",
    "N8N_ENCRYPTION_KEY", "POSTGRES_PASSWORD",
    "HIVE_PHASE", "COLONY_ROLE",
]

@router.get("/env")
async def debug_env():
    """Show which tracked env vars are set (key names only, never values)."""
    present = [k for k in _TRACKED_KEYS if os.getenv(k)]
    missing = [k for k in _TRACKED_KEYS if not os.getenv(k)]
    # Also count any unlisted vars that are set
    all_set = {k for k in os.environ if k not in _TRACKED_KEYS and not k.startswith("_")}
    return {
        "present": present,
        "missing": missing,
        "other_vars_count": len(all_set),
        "note": "Values are never returned. Key presence only.",
    }


# ── /v11/debug/endpoints ──────────────────────────────────────
@router.get("/endpoints")
async def debug_endpoints():
    """List all registered FastAPI routes."""
    from backend.main import app
    routes = []
    for route in app.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            routes.append({
                "path": route.path,
                "methods": sorted(route.methods or []),
                "name": route.name,
                "tags": getattr(route, "tags", []),
            })
    routes.sort(key=lambda r: r["path"])
    return {"count": len(routes), "routes": routes}


# ── /v11/debug/git ────────────────────────────────────────────
@router.get("/git")
async def debug_git():
    """Return git status, branch, and recent log."""
    def run(cmd):
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=5,
                cwd="/home/user/THEHIVE"
            )
            return result.stdout.strip() if result.returncode == 0 else f"[error] {result.stderr.strip()}"
        except Exception as e:
            return f"[error] {e}"

    branch = run(["git", "rev-parse", "--abbrev-ref", "HEAD"])
    status = run(["git", "status", "--short"])
    log = run(["git", "log", "--oneline", "-10"])
    diff_stat = run(["git", "diff", "--stat", "HEAD"])

    return {
        "branch": branch,
        "status": status or "(clean)",
        "log": log,
        "diff_stat": diff_stat or "(no changes)",
    }


# ── /v11/debug/colony-ping ────────────────────────────────────
_KNOWN_COLONIES = [
    {"name": "THEHIVE",                "url": "http://localhost:8080",  "health": "/v11/health"},
    {"name": "kimi-gateway",           "url": "http://localhost:8181",  "health": "/health"},
    {"name": "aether",                 "url": "https://github.com/TehutiRaEl/aether", "health": None},
    {"name": "automatisch",            "url": "http://localhost:3001",  "health": "/healthz"},
    {"name": "n8n",                    "url": "http://localhost:5678",  "health": "/healthz"},
    {"name": "free-programming-books", "url": "https://github.com/TehutiRaEl/free-programming-books", "health": None},
    {"name": "freeCodeCamp",           "url": "https://github.com/TehutiRaEl/freeCodeCamp", "health": None},
]

@router.get("/colony-ping")
async def debug_colony_ping():
    """Ping all known colonies and return their health status."""
    import httpx, time, asyncio

    async def ping(colony):
        if not colony.get("health"):
            return {**colony, "status": "no_health_endpoint", "latency_ms": None}
        url = colony["url"] + colony["health"]
        try:
            t0 = time.time()
            async with httpx.AsyncClient(timeout=4.0) as client:
                r = await client.get(url)
            ms = round((time.time() - t0) * 1000)
            return {**colony, "status": "ok" if r.status_code < 400 else f"http_{r.status_code}", "latency_ms": ms, "http": r.status_code}
        except Exception as e:
            return {**colony, "status": "offline", "latency_ms": None, "error": str(e)[:80]}

    results = await asyncio.gather(*[ping(c) for c in _KNOWN_COLONIES])
    return {"colonies": list(results)}
