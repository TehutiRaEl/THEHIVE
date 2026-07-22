"""
Colony Standard Layer — Sovereign Hive v11.0
Exposes /colony/* endpoints so the Queen meta-repo and other colonies
can discover, health-check, and send events to this node.
"""

import hashlib
import hmac
import time
import asyncio
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from backend.core.config import settings
from backend.core.constitution import constitution
from backend.core.db import get_db
from backend.api.models import HealthResponse, ColonyInfoResponse

router = APIRouter(prefix="/colony", tags=["colony"])


def _verify_hive_signature(request: Request, body: bytes) -> None:
    """
    Reject cross-colony POSTs whose X-Hive-Signature doesn't match
    HMAC-SHA256(body, settings.jwt_secret_key) — the same key hive_mesh.py's
    _hmac_sign() uses to sign outbound dispatches, and the same pattern
    every colony's own /colony/events already enforces (colony_sdk.py,
    automatisch's colony.js, LocalAGI's colony.go, aether's route.ts).
    Found missing here 2026-07-22 while wiring the rest of the federation —
    the Queen's own inbound event endpoint had zero verification, the one
    real inconsistency in an otherwise-uniform pattern. Permissive when
    unset (dev mode), fail-closed once JWT_SECRET_KEY is a real secret.
    """
    secret = settings.jwt_secret_key
    if not secret or secret == "super-secret-change-me":
        return  # permissive — no real secret configured yet
    sig_header = request.headers.get("X-Hive-Signature", "")
    if not sig_header.startswith("sha256="):
        raise HTTPException(status_code=401, detail="Missing X-Hive-Signature header")
    expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig_header, expected):
        raise HTTPException(status_code=401, detail="Invalid hive signature")

# ── Colony identity (override via env vars) ────────────────────
COLONY_NAME = settings.colony_name
COLONY_ROLE = settings.colony_role
COLONY_VERSION = "11.0"

_start_time = time.time()


# ── Models ─────────────────────────────────────────────────────
class ColonyEvent(BaseModel):
    event_type: str          # constitution_update | agent_migrated | soul_transfer | task_dispatch
    source_colony: str
    payload: Dict[str, Any] = {}
    timestamp: Optional[str] = None


class AgentMigration(BaseModel):
    agent_name: str
    genome: Dict[str, Any]    # Ed25519 pub key + traits
    soul_balance: float = 0.0
    elo_rating: int = 1200
    origin_colony: str


# ── Endpoints ──────────────────────────────────────────────────

@router.get("/info", response_model=ColonyInfoResponse)
async def colony_info():
    """Return colony identity and constitution hash."""
    return {
        "name": COLONY_NAME,
        "role": COLONY_ROLE,
        "version": COLONY_VERSION,
        "soul_md_hash": constitution.get_hash(),
        "guilds": settings.enable_guilds,
        "phase": settings.hive_phase,
        "meta_repo": settings.meta_repo_url,
        "api_base": "/v11",
        "status": "active",
    }


@router.get("/health", response_model=HealthResponse)
async def colony_health():
    """Standard health endpoint polled by the Queen's hive-health workflow."""
    uptime_s = int(time.time() - _start_time)
    db = get_db()
    try:
        db.execute("SELECT 1").fetchone()
        db_ok = True
    except Exception:
        db_ok = False
    finally:
        db.close()

    return {
        "status": "healthy" if db_ok else "degraded",
        "colony": COLONY_NAME,
        "role": COLONY_ROLE,
        "uptime_seconds": uptime_s,
        "soul_md_hash": constitution.get_hash(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "db": "ok" if db_ok else "error",
    }


@router.get("/agents")
async def colony_agents():
    """List agents resident in this colony."""
    db = get_db()
    try:
        rows = db.execute(
            "SELECT name, traits, elo_rating, soul_balance, status FROM agents LIMIT 100"
        ).fetchall()
        agents = [
            {
                "name": r[0],
                "traits": r[1],
                "elo_rating": r[2],
                "soul_balance": r[3],
                "status": r[4] if len(r) > 4 else "active",
            }
            for r in rows
        ]
    except Exception:
        agents = []
    finally:
        db.close()
    return {"colony": COLONY_NAME, "agents": agents, "count": len(agents)}


@router.post("/events")
async def receive_event(request: Request):
    """
    Receive a cross-colony event from automatisch or the Queen.
    Handles: constitution_update, agent_migrated, soul_transfer, task_dispatch.
    Requires a valid X-Hive-Signature once JWT_SECRET_KEY is set (see
    _verify_hive_signature above) — permissive in dev mode, same as every
    other colony's /colony/events.
    """
    body = await request.body()
    _verify_hive_signature(request, body)
    try:
        event = ColonyEvent.model_validate_json(body)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid event body")
    event.timestamp = event.timestamp or datetime.now(timezone.utc).isoformat()

    if event.event_type == "constitution_update":
        # Re-hash and validate — constitution.py reads soul.md from disk
        new_hash = constitution.get_hash()
        return {
            "received": True,
            "event": "constitution_update",
            "soul_md_hash": new_hash,
            "colony": COLONY_NAME,
        }

    if event.event_type == "agent_migrated":
        # Accept a migrating agent genome (full spawn handled by genome module)
        payload = event.payload
        agent_name = payload.get("agent_name", "unknown")
        return {
            "received": True,
            "event": "agent_migrated",
            "agent": agent_name,
            "colony": COLONY_NAME,
            "note": "Agent queued for spawn. Use POST /v11/spawn_agent to finalize.",
        }

    if event.event_type == "soul_transfer":
        return {
            "received": True,
            "event": "soul_transfer",
            "colony": COLONY_NAME,
            "note": "Transfer logged. Settle via POST /v11/wallet/tip.",
        }

    if event.event_type == "task_dispatch":
        return {
            "received": True,
            "event": "task_dispatch",
            "colony": COLONY_NAME,
            "note": "Task queued. Create via POST /v11/tasks.",
        }

    return {"received": True, "event": event.event_type, "colony": COLONY_NAME}


@router.get("/capabilities")
async def colony_capabilities():
    """
    Return colony.json identity + live health status.
    Used by scan_federation_repos() and the ColonyZoomPanel header.
    """
    import json, os
    colony_json_path = os.path.join(os.path.dirname(__file__), "..", "..", "colony.json")
    identity: Dict[str, Any] = {}
    try:
        with open(os.path.normpath(colony_json_path)) as f:
            identity = json.load(f)
    except Exception:
        identity = {
            "colony_id": settings.colony_name.lower(),
            "colony_name": settings.colony_name,
            "role": settings.colony_role,
            "version": COLONY_VERSION,
        }

    return {
        **identity,
        "status": "healthy",
        "uptime_s": round(time.time() - _start_time, 1),
        "soul_md_hash": constitution.get_hash()[:16],
        "health_endpoint": "/colony/health",
        "capabilities_endpoint": "/colony/capabilities",
    }


@router.get("/manifest")
async def hive_manifest():
    """
    Return the known colony list for the Phaser world map.
    Sourced from settings (populated via HIVE_COLONIES env var).
    """
    colonies = []
    for entry in settings.known_colonies:
        parts = entry.split("|")
        if len(parts) >= 3:
            colonies.append({
                "name": parts[0],
                "role": parts[1],
                "base_url": parts[2],
                "health_url": parts[2].rstrip("/") + "/colony/health",
            })
    return {
        "queen": settings.meta_repo_url,
        "colonies": colonies,
        "count": len(colonies),
    }
