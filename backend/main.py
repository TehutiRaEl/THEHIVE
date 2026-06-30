"""
Jasper Sovereign Hive v11.0 — Main Entry Point
Modular FastAPI application with all routes, middleware, and startup hooks.
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.core.config import settings
from backend.core.db import init_db
from backend.api.routes import router
from backend.api.colony import router as colony_router
from backend.api.knowledge import router as knowledge_router
from backend.api.ml import router as ml_router
from backend.api.browser import router as browser_router
from backend.api.debug import router as debug_router
from backend.api.auth import verify_auth
from backend.api.middleware import (
    RateLimitMiddleware,
    LoggingMiddleware,
    ConstitutionMiddleware,
    PromptInjectionMiddleware,
)
from backend.core.constitution import constitution

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("jasper")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting Jasper Sovereign Hive v11.0...")
    logger.info(f"Phase: {settings.hive_phase}")
    logger.info(f"Decay Rate: {settings.decay_rate}")
    logger.info(f"Doubling Threshold: {settings.doubling_threshold}")
    logger.info(f"Staking APY: {settings.staking_apy}")
    init_db()
    logger.info("✅ Database initialized")
    logger.info(f"Constitution: {constitution.get_hash()[:16]}...")
    logger.info(f"Active Guilds: {', '.join(settings.enable_guilds)}")
    yield
    logger.info("🛑 Shutting down Jasper Sovereign Hive...")

app = FastAPI(
    title="Jasper Sovereign Hive v11.0",
    description="4D · Frequency · Arena · Utility · Constitutional Governance",
    version="11.0",
    lifespan=lifespan
)

# ─── CORS ──────────────────────────────────────────────────────
_cors_origins = settings.cors_origins
if "*" not in _cors_origins:
    _cors_origins = ["*"] if os.getenv("CORS_ALLOW_ALL", "true").lower() == "true" else _cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "X-API-Key", "Content-Type"],
)

# ─── Middleware ──────────────────────────────────────────────
app.add_middleware(PromptInjectionMiddleware)
app.add_middleware(ConstitutionMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

app.include_router(router)
app.include_router(colony_router)    # /colony/* — multi-repo hive standard
app.include_router(knowledge_router) # /v11/knowledge/* — RAG over ingested repos
app.include_router(ml_router)        # /v11/voice, /v11/image, /v11/ml/*
app.include_router(browser_router)   # /v11/browser/*
app.include_router(debug_router)     # /v11/debug/*

try:
    _frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    app.mount("/ui", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
    logger.info("✅ Frontend mounted at /ui")
except Exception as e:
    logger.warning(f"Frontend not mounted: {e}")

@app.get("/")
async def root():
    return {
        "name": "Jasper Sovereign Hive v11.0",
        "status": "active",
        "version": "11.0",
        "phase": settings.hive_phase,
        "endpoints": {
            "board": "/v11/board",
            "simulate": "/v11/simulate",
            "feed": "/v11/feed",
            "health": "/v11/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True, log_level="info")
