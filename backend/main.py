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
from backend.api.auth import verify_auth
from backend.api.middleware import (
    RateLimitMiddleware,
    LoggingMiddleware,
    ConstitutionMiddleware
)
from backend.core.constitution import constitution

# ─── Configure Logging ────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("jasper")

# ─── Lifespan Context ─────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("🚀 Starting Jasper Sovereign Hive v11.0...")
    logger.info(f"Phase: {settings.hive_phase}")
    logger.info(f"Decay Rate: {settings.decay_rate}")
    logger.info(f"Doubling Threshold: {settings.doubling_threshold}")
    logger.info(f"Staking APY: {settings.staking_apy}")

    # Initialize database
    init_db()
    logger.info("✅ Database initialized")

    # Log constitution status
    logger.info(f"Constitution: {constitution.get_hash()[:16]}...")

    # Log active guilds
    logger.info(f"Active Guilds: {', '.join(settings.enable_guilds)}")

    yield

    # Shutdown
    logger.info("🛑 Shutting down Jasper Sovereign Hive...")

# ─── Create FastAPI App ───────────────────────────────────────
app = FastAPI(
    title="Jasper Sovereign Hive v11.0",
    description="4D · Frequency · Arena · Utility · Constitutional Governance",
    version="11.0",
    lifespan=lifespan
)

# ─── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "X-API-Key", "Content-Type"],
)

# ─── Middleware ──────────────────────────────────────────────
app.add_middleware(ConstitutionMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# ─── Routes ────────────────────────────────────────────────────
app.include_router(router)

# ─── Static Frontend ──────────────────────────────────────────
try:
    _frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
    app.mount("/ui", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
    logger.info("✅ Frontend mounted at /ui")
except Exception as e:
    logger.warning(f"Frontend not mounted: {e}")

# ─── Root Endpoint ────────────────────────────────────────────
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

# ─── Main Entry Point ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8080))
    host = os.environ.get("HOST", "0.0.0.0")

    print("=" * 60)
    print("🍄 JASPER SOVEREIGN HIVE v11.0")
    print("=" * 60)
    print(f"  Version: 11.0")
    print(f"  Phase: {settings.hive_phase}")
    print(f"  Decay Rate: {settings.decay_rate}")
    print(f"  Doubling Threshold: {settings.doubling_threshold}")
    print(f"  Staking APY: {settings.staking_apy}%")
    print(f"  Server: http://{host}:{port}")
    print(f"  Board: http://{host}:{port}/v11/board")
    print(f"  Documentation: http://{host}:{port}/docs")
    print("=" * 60)
    print("The Board is Always Seen. The Restitution is Inevitable.")
    print("=" * 60)

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
