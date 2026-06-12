#!/usr/bin/env python3
"""
Sovereign Hive Backend — Main Entry Point
Phases 0-8: Spore -> Infinite
"""
import os
import json
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
import uvicorn

from backend.config import settings
from backend.database import Database, init_db_sync
from backend.auth import create_access_token, verify_auth, hash_password, verify_password
from backend.llm_router import router as llm_router
from backend.resonance import ResonanceEngine
from backend.constitution import ConstitutionChecker
from backend.phase_manager import PhaseManager, PHASES
from backend.agent_identity import AgentIdentity
from backend.audit_chain import AuditChain
from backend.sheaf_crypto import SheafCrypto
from backend.models import AgentCreate, ChatRequest, ArenaChallenge, GuildAction

# Guild imports (all 12 must be present)
from backend.guilds.constitutional_guild import ConstitutionalGuild
from backend.guilds.audit_guild import AuditGuild
from backend.guilds.treasury_guild import TreasuryGuild
from backend.guilds.workflow_guild import WorkflowGuild
from backend.guilds.frequency_guild import FrequencyGuild
from backend.guilds.arena_guild import ArenaGuild
from backend.guilds.dream_guild import DreamGuild
from backend.guilds.security_guild import SecurityGuild
from backend.guilds.commerce_guild import CommerceGuild
from backend.guilds.worldbuilding_guild import WorldbuildingGuild
from backend.guilds.academy_guild import AcademyGuild
from backend.guilds.arcane_guild import ArcaneGuild

from backend.utils.rate_limiter import RateLimiter

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("jasper")

# Initialize components
db = Database()
constitution = ConstitutionChecker()
resonance = ResonanceEngine(db)
phase_manager = PhaseManager(db)
rate_limiter = RateLimiter(settings.rate_limit_requests, settings.rate_limit_window)
agent_identity = AgentIdentity(db)
audit_chain = AuditChain()
sheaf_crypto = SheafCrypto()

# Guild instances (all 12)
guilds = {
    "constitutional": ConstitutionalGuild(),
    "audit": AuditGuild(),
    "treasury": TreasuryGuild(),
    "workflow": WorkflowGuild(),
    "frequency": FrequencyGuild(),
    "arena": ArenaGuild(),
    "dream": DreamGuild(),
    "security": SecurityGuild(),
    "commerce": CommerceGuild(),
    "worldbuilding": WorldbuildingGuild(),
    "academy": AcademyGuild(),
    "arcane": ArcaneGuild(),
}

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("Sovereign Hive starting up...")
    await db._init_tables()

    # Seed frequency map
    import aiosqlite
    async with aiosqlite.connect(settings.db_path) as conn:
        for ch, hz in [("A", 432), ("C", 528), ("E", 648), ("G", 384)]:
            await conn.execute(
                "INSERT OR IGNORE INTO frequency_map (char, sound_hz) VALUES (?, ?)",
                (ch, hz)
            )
        await conn.commit()

    yield

    logger.info("Sovereign Hive shutting down gracefully...")

# Create FastAPI app
app = FastAPI(
    title="Sovereign Hive",
    description="Mycelial AI Civilisation — v1.1",
    version="1.1.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constitution middleware — REJECTS violations
@app.middleware("http")
async def constitution_middleware(request: Request, call_next):
    """Reject constitutionally forbidden requests."""
    if request.url.path in ["/health", "/docs", "/openapi.json", "/static/"]:
        return await call_next(request)

    violation = await constitution.check_request(request)
    if violation:
        await db.log_violation(
            action=violation.get("action", "unknown"),
            actor=violation.get("actor", "unknown"),
            violation=violation.get("details", "")
        )

        return JSONResponse(
            status_code=403,
            content={
                "error": "CONSTITUTION_VIOLATION",
                "tier": violation.get("tier", "unknown"),
                "article": violation.get("article", ""),
                "details": violation.get("details", ""),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

    return await call_next(request)

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_id = request.client.host if request.client else "unknown"
    allowed, remaining = await rate_limiter.check(client_id)
    if not allowed:
        return JSONResponse(
            status_code=429,
            content={
                "error": "Rate limit exceeded",
                "retry_after": settings.rate_limit_window
            }
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response

# Static files — mounted at /static to avoid shadowing API
app.mount("/static", StaticFiles(directory="frontend", html=True), name="static")

# ---------- API Endpoints ----------

@app.get("/health")
async def health():
    """Health check endpoint (no auth required)."""
    return {
        "status": "ok",
        "phase": settings.hive_phase,
        "version": "1.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/v1/board")
async def board(auth=Depends(verify_auth)):
    """Get the hive bulletin board."""
    rho = await resonance.compute()
    agents = await db.list_agents()

    return {
        "resonance": rho,
        "doubling_active": rho.get("doubling_active", False),
        "agent_count": len(agents),
        "phase": settings.hive_phase,
        "phase_name": PHASES.get(settings.hive_phase, {}).get("name", "Unknown"),
        "constitution_hash": constitution.get_hash(),
        "guilds": list(guilds.keys()),
        "enabled_guilds": settings.enable_guilds
    }

@app.post("/v1/agent/spawn")
async def spawn_agent(agent: AgentCreate, auth=Depends(verify_auth)):
    """Spawn a new agent."""
    check = constitution.check_action("spawn_agent", auth.get("user", "unknown"), {"name": agent.name})
    if not check["allowed"]:
        raise HTTPException(403, detail=check.get("violation", {}))

    identity = await agent_identity.register_agent(agent.name)
    await db.create_agent(agent.name, agent.description)

    await audit_chain.append(
        action="spawn_agent",
        actor=auth.get("user", "unknown"),
        target=agent.name,
        decision="approved",
        rationale=f"Agent spawned via API by {auth.get('user', 'unknown')}"
    )

    return {
        "status": "spawned",
        "agent": agent.name,
        "public_key": identity.get("public_key", ""),
        "identity": identity
    }

@app.post("/v1/agent/{name}/status")
async def update_agent_status(name: str, status: str, auth=Depends(verify_auth)):
    """Update agent status (dormancy, not deletion per Fixed Law)."""
    if status == "deleted":
        raise HTTPException(403, detail="Agent deletion forbidden by Fixed Law No.1")

    await db.update_agent_status(name, status)

    await audit_chain.append(
        action="update_status",
        actor=auth.get("user", "unknown"),
        target=name,
        decision="approved",
        rationale=f"Status changed to {status}"
    )

    return {"status": "updated", "agent": name, "new_status": status}

@app.get("/v1/agents")
async def list_agents(auth=Depends(verify_auth)):
    """List all agents."""
    agents = await db.list_agents()
    return {"agents": agents, "count": len(agents)}

@app.post("/v1/llm/chat")
async def chat(req: ChatRequest, auth=Depends(verify_auth)):
    """Chat with the LLM router (Ollama -> Claude fallback)."""
    result = await llm_router.call(req.prompt, req.system, req.max_tokens)
    return {
        "response": result.get("text", ""),
        "provider": result.get("provider", "unknown"),
        "cached": result.get("cached", False)
    }

@app.post("/v1/arena/challenge")
async def arena_challenge(req: ArenaChallenge, auth=Depends(verify_auth)):
    """Create an arena challenge."""
    arena = guilds["arena"]
    result = await arena.create_challenge(req.agent1, req.agent2, req.topic)
    return result

@app.post("/v1/arena/resolve/{challenge_id}")
async def arena_resolve(challenge_id: int, auth=Depends(verify_auth)):
    """Resolve an arena challenge."""
    arena = guilds["arena"]
    result = await arena.resolve_challenge(challenge_id)

    await audit_chain.append(
        action="arena_resolve",
        actor=auth.get("user", "unknown"),
        target=str(challenge_id),
        decision="resolved",
        rationale=f"Winner: {result.get('winner', 'unknown')}"
    )

    return result

@app.get("/v1/guilds")
async def list_guilds(auth=Depends(verify_auth)):
    """List all 12 guilds."""
    return {
        "guilds": [
            {
                "name": name,
                "enabled": name in settings.enable_guilds,
                "class": g.__class__.__name__
            }
            for name, g in guilds.items()
        ],
        "enabled": settings.enable_guilds
    }

@app.post("/v1/guild/{guild_name}/action")
async def guild_action(guild_name: str, action: GuildAction, auth=Depends(verify_auth)):
    """Execute an action on a guild."""
    if guild_name not in guilds:
        raise HTTPException(404, detail=f"Guild {guild_name} not found")

    guild = guilds[guild_name]

    method = getattr(guild, action.action, None)
    if method is None:
        raise HTTPException(400, detail=f"Action {action.action} not available on {guild_name}")

    result = await method(**action.params) if asyncio.iscoroutinefunction(method) else method(**action.params)

    return {
        "guild": guild_name,
        "action": action.action,
        "result": result
    }

@app.get("/v1/phase")
async def get_phase(auth=Depends(verify_auth)):
    """Get current phase info."""
    return phase_manager.get_phase_info()

@app.post("/v1/phase/evaluate")
async def evaluate_phase(state: Dict[str, Any], auth=Depends(verify_auth)):
    """Evaluate phase triggers."""
    if auth.get("role") != "admin":
        raise HTTPException(403, detail="Admin required")

    result = await phase_manager.evaluate_triggers(state)
    return result

@app.post("/v1/phase/advance")
async def advance_phase(state: Dict[str, Any], auth=Depends(verify_auth)):
    """Attempt to advance phase."""
    if auth.get("role") != "admin":
        raise HTTPException(403, detail="Admin required")

    result = await phase_manager.advance(state)

    if result.get("advanced"):
        await audit_chain.append(
            action="phase_advance",
            actor=auth.get("user", "unknown"),
            target=str(result.get("new_phase", "")),
            decision="approved",
            rationale="Phase triggers met"
        )

    return result

@app.get("/v1/constitution")
async def get_constitution(auth=Depends(verify_auth)):
    """Get constitution summary."""
    return {
        "hash": constitution.get_hash(),
        "rules": constitution.get_rules_summary(),
        "fixed_laws": list(constitution.FIXED_LAWS.keys()),
        "cardinal_laws": list(constitution.CARDINAL_LAWS.keys()),
        "mutable_laws": list(constitution.MUTABLE_LAWS.keys())
    }

@app.post("/v1/constitution/check")
async def check_constitution(action_type: str, actor: str, params: Optional[str] = "{}", auth=Depends(verify_auth)):
    """Check if an action is constitutionally permitted."""
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        params_dict = {}

    result = constitution.check_action(action_type, actor, params_dict)
    return result

@app.get("/v1/audit/verify")
async def verify_audit(auth=Depends(verify_auth)):
    """Verify audit chain integrity."""
    if auth.get("role") != "admin":
        raise HTTPException(403, detail="Admin required")

    return audit_chain.verify_chain()

@app.get("/v1/audit/chain")
async def get_audit_chain(limit: int = 20, auth=Depends(verify_auth)):
    """Get recent audit chain entries."""
    import aiosqlite

    async with aiosqlite.connect(settings.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        async with conn.execute(
            """SELECT * FROM audit_chain ORDER BY id DESC LIMIT ?""",
            (limit,)
        ) as cursor:
            rows = await cursor.fetchall()
            return {"entries": [dict(r) for r in rows], "count": len(rows)}

# WebSocket with auth, heartbeat, and room management
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, room_id: str = "global", agent_name: str = None):
    """WebSocket endpoint with authentication and room management."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008, reason="Authentication required")
        return

    if token != settings.api_key:
        await websocket.close(code=1008, reason="Invalid authentication")
        return

    await websocket.accept()

    room_connections = getattr(app.state, "ws_rooms", {})
    if room_id not in room_connections:
        room_connections[room_id] = []
    room_connections[room_id].append(websocket)
    app.state.ws_rooms = room_connections

    logger.info(f"WebSocket connected: room={room_id}, agent={agent_name}")

    try:
        while True:
            data = await websocket.receive_text()

            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
                    continue
                elif msg.get("type") == "broadcast":
                    for ws in room_connections.get(room_id, []):
                        if ws != websocket:
                            await ws.send_json({
                                "type": "message",
                                "room": room_id,
                                "data": msg.get("data")
                            })
                    continue
            except json.JSONDecodeError:
                pass

            await websocket.send_json({"type": "echo", "data": data})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: room={room_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in room_connections.get(room_id, []):
            room_connections[room_id].remove(websocket)

# Run
if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("SOVEREIGN HIVE v1.1")
    logger.info("=" * 60)
    logger.info(f"Phase: {settings.hive_phase} ({PHASES.get(settings.hive_phase, {}).get('name', 'Unknown')})")
    logger.info(f"Guilds: {len(guilds)} (all 12 present)")
    logger.info(f"Database: {settings.db_path}")
    logger.info("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8080)
