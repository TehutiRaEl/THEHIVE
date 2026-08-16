"""
API Routes — Sovereign Hive v11.0
All 40+ endpoints: v10 + v11 governance + simulator + Tier 2 + Tier 3 integrations.
"""

import json
import uuid
import asyncio
import time
import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.core.config import settings
from backend.core.db import get_db
from backend.core.constitution import constitution
from backend.core.hdc import hdc
from backend.core.frequency_guild import frequency_guild
from backend.core.arena import arena
from backend.core.wallet import wallet_manager
from backend.core.genome import genome_reproduction
from backend.core.hitl import hitl
from backend.economy.utility_economy import utility_economy
from backend.economy.staking import staking_manager
from backend.governance.patterns import patterns
from backend.simulator.twin import simulator
from backend.api.auth import verify_auth, create_access_token
from backend.core.validator import validator
from backend.api.models import HealthResponse, HiveStatusResponse, ValidationResponse
from backend.core.wealth import wealth_engine
from backend.core.criteria import pruning_criteria
from backend.core.protocol import hive_protocol
from backend.core.agency import swarm_agency, AgencyLevel
from backend.core.alchemy import reflector
from backend.core.genesis import gap_detector, mission_generator, MissionStatus
from backend.core.governance import governance_engine
from backend.core.hive_mesh import hive_mesh

# Tier 3 modules — all optional: the API must survive any of them missing
try:
    from backend.tier3.arena_renderer import engine as projection_engine, \
        compressor as frame_compressor, ColonyState as VoxelColonyState
    PROJECTION_AVAILABLE = True
except Exception:
    projection_engine = None
    frame_compressor = None
    VoxelColonyState = None
    PROJECTION_AVAILABLE = False

try:
    from backend.tier3 import quantum_bridge as quantum
    QUANTUM_AVAILABLE = True
except Exception:
    quantum = None
    QUANTUM_AVAILABLE = False

try:
    from backend.tier3 import sheaf_guild as sheaf
    SHEAF_AVAILABLE = True
except Exception:
    sheaf = None
    SHEAF_AVAILABLE = False

try:
    from backend.tier3 import ipfs_pubsub as pubsub
    PUBSUB_AVAILABLE = True
except Exception:
    pubsub = None
    PUBSUB_AVAILABLE = False

try:
    from backend.tier3 import tesseract_model as tesseract
    TESSERACT_AVAILABLE = True
except Exception:
    tesseract = None
    TESSERACT_AVAILABLE = False

_projections_running: set = set()

# ─── Pydantic Models ───────────────────────────────────────────────
class LLMChatRequest(BaseModel):
    prompt: str
    system: str = ""
    max_tokens: int = 1000

class SoulTransferRequest(BaseModel):
    from_agent: str
    to_agent: str
    amount: float
    reason: str = ""

class StakeRequest(BaseModel):
    agent_name: str
    amount: float

class SpawnChildRequest(BaseModel):
    parent1: str
    parent2: str
    child_name: Optional[str] = None
    mutation_rate: float = Field(0.1, ge=0.01, le=0.5)

class ArenaChallengeCreate(BaseModel):
    challenger: str
    challenged: str
    proposition: str

class HealRequest(BaseModel):
    emotional_state: str

class TaskCreate(BaseModel):
    title: str
    description: str
    creator: str

class GradeRequest(BaseModel):
    grader: str
    target_agent: str
    score: float

class HITLResolveRequest(BaseModel):
    request_id: str
    approved: bool
    resolved_by: str

class ConstitutionVoteRequest(BaseModel):
    version: int
    approve: bool
    agent_name: str

class WalletTipRequest(BaseModel):
    from_agent: str
    to_agent: str
    amount: float = Field(..., gt=0)

class WalletCreditRequest(BaseModel):
    agent_name: str
    amount: float
    reason: str = "manual_credit"

class ReproduceRequest(BaseModel):
    parent1: str
    parent2: str
    child_name: Optional[str] = None
    mutation_rate: float = Field(0.1, ge=0.01, le=0.5)

class SimulateRequest(BaseModel):
    n_agents: int = 50
    trials: int = 1000
    base_rho: float = 0.7
    quorum: float = 0.6

class ValidateRequest(BaseModel):
    action: str
    context: Dict[str, Any] = {}

class ContributionRequest(BaseModel):
    user_id: str
    hours_saved: float = 0.0
    adoption_count: int = 0
    novelty_score: float = 0.0
    dispute_resilience: float = 0.0
    utilized: bool = True

class TransmuteRequest(BaseModel):
    memory_item: Dict[str, Any]

class ChildProposalRequest(BaseModel):
    title: str
    description: str
    proposer: str

# ─── Router ─────────────────────────────────────────────────────────────
router = APIRouter(prefix="/v11")

# ─── Health & Board ────────────────────────────────────────────────────
@router.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "healthy", "version": "11.0", "phase": settings.hive_phase}

# The Command Center bootstraps auth with this (v9 parity — the UI's
# INITIALIZE flow called it, but backend.main never had it: gap #11).
# Visitor-tier token; admin actions still require the API key.
@router.get("/auth/token")
@router.post("/auth/token")
async def issue_token():
    return {"access_token": create_access_token("visitor", role="user"),
            "token_type": "bearer",
            "expires_in_minutes": settings.access_token_expire_minutes}

@router.get("/board")
async def board(auth: Dict = Depends(verify_auth)):
    """The Board is Always Seen — full system status."""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM agents WHERE status='active'")
    agent_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM arena_challenges WHERE status='pending'")
    pending_arena = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM hitl_requests WHERE status='pending'")
    pending_hitl = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM tasks WHERE status='open'")
    open_tasks = c.fetchone()[0]
    conn.close()

    rho = min(1.0, agent_count / 50.0 + 0.2)

    return {
        "version": "11.0",
        "timestamp": datetime.now().isoformat(),
        "hive_resonance": {"rho_hive": round(rho, 4), "doubling_active": rho > settings.doubling_threshold},
        "constitution": {"status": "ACTIVE", "hash": constitution.get_hash()},
        "agent_count": agent_count,
        "pending_arena": pending_arena,
        "pending_hitl": pending_hitl,
        "open_tasks": open_tasks,
        "phase": settings.hive_phase,
        "patterns_count": len(patterns.get_all()),
        "decay_rate": settings.decay_rate,
        "staking_apy": settings.staking_apy,
        "subsystems": {
            "memory": {"episodic": True, "semantic": True, "state": True},
            "frequency_guild": "Ψ active",
            "arena": "open for challenges",
            "staking": {"apy": settings.staking_apy},
            "hitl": {"pending": pending_hitl}
        }
    }

# ─── Constitution ───────────────────────────────────────────────────────────────
@router.post("/constitution/check")
async def check_constitution(action_type: str, actor: str, params: Optional[str] = "{}", auth: Dict = Depends(verify_auth)):
    try:
        params_dict = json.loads(params) if params else {}
    except Exception:
        params_dict = {}
    result = constitution.check(action_type, actor, params_dict)
    constitution.log(action_type, actor, result)
    return result

@router.get("/constitution/soul_md")
async def get_constitution(auth: Dict = Depends(verify_auth)):
    # Real, current soul.md text (task 12, 2026-08-06) — previously served a
    # fabricated "v4.0" document that never matched the real constitution at
    # all. Read fresh every call so a real amendment is reflected immediately.
    return {"soul_md": constitution.get_raw_text(), "laws": constitution.get_laws(), "hash": constitution.get_hash()}

@router.post("/constitution/vote")
async def constitution_vote(req: ConstitutionVoteRequest, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO constitution_votes (version, agent_name, vote) VALUES (?, ?, ?)",
              (req.version, req.agent_name, 1 if req.approve else 0))
    c.execute("SELECT COUNT(*) FROM constitution_votes WHERE version=? AND vote=1", (req.version,))
    yes = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM agents WHERE status='active'")
    total = c.fetchone()[0]
    passed = yes > (total * 2 / 3)
    if passed:
        c.execute("REPLACE INTO constitution (version, content, active) VALUES (?, ?, 1)",
                  (req.version, "Constitution v4.0", 1))
    conn.commit()
    conn.close()
    return {"status": "voted", "yes": yes, "threshold": total * 2 / 3, "passed": passed}

@router.get("/constitution/violations")
async def get_constitution_violations(limit: int = 20, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT timestamp, action_type, actor, violation, decision FROM constitution_log WHERE decision='BLOCK' ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"violations": [{"ts": r[0], "action": r[1], "actor": r[2], "article": r[3]} for r in rows]}

@router.get("/constitution/history")
async def get_constitution_history(limit: int = 20, auth: Dict = Depends(verify_auth)):
    import subprocess, shutil
    if shutil.which("git"):
        try:
            res = subprocess.run(
                ["git", "log", f"--max-count={limit}", "--pretty=format:%H|%ai|%an|%s", "--", "soul.md"],
                capture_output=True, text=True, timeout=5
            )
            entries = []
            for line in res.stdout.strip().splitlines():
                parts = line.split("|", 3)
                if len(parts) == 4:
                    entries.append({"hash": parts[0][:8], "timestamp": parts[1],
                                    "author": parts[2], "message": parts[3]})
            if entries:
                return {"history": entries, "source": "git"}
        except Exception:
            pass
    # fallback: DB-stored constitution versions (may be empty in fresh deploys)
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT version, content, active, approved_at FROM constitution ORDER BY version DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"history": [{"version": r[0], "active": bool(r[2]), "approved_at": r[3]} for r in rows], "source": "db"}

# ─── Governance Patterns (v11.0) ───────────────────────────────────────────────
@router.get("/governance/patterns")
async def get_patterns(auth: Dict = Depends(verify_auth)):
    return {"patterns": patterns.get_all()}

@router.post("/governance/recommend")
async def recommend_patterns(context: str = "", auth: Dict = Depends(verify_auth)):
    return {"recommendations": patterns.recommend(context)}

@router.get("/governance/pattern/{pattern_id}")
async def get_pattern(pattern_id: str, auth: Dict = Depends(verify_auth)):
    pattern = patterns.get_by_id(pattern_id)
    if not pattern:
        raise HTTPException(404, f"Pattern {pattern_id} not found")
    return pattern

# ─── Simulator (v11.0) ─────────────────────────────────────────────────────────────
@router.post("/simulate")
async def run_simulation(req: SimulateRequest, auth: Dict = Depends(verify_auth)):
    return simulator.monte_carlo_proposal(req.n_agents, req.trials, req.base_rho, req.quorum)

@router.post("/simulate/colony")
async def simulate_colony(initial_wealth: float = 1000.0, growth_rate: float = 0.02, ticks: int = 100, auth: Dict = Depends(verify_auth)):
    return simulator.colony_growth_simulation(initial_wealth, growth_rate, 0.05, ticks, 0.7)

@router.post("/simulate/hyperparameters")
async def simulate_hyperparameters(param_grid: Dict, objective: str = "minimize_loss", n_trials: int = 50, auth: Dict = Depends(verify_auth)):
    return simulator.hyperparameter_optimization(param_grid, objective, n_trials)

# ─── SSE Feed (v11.0) ──────────────────────────────────────────────────────────────
@router.get("/feed")
async def governance_feed(auth: Dict = Depends(verify_auth)):
    async def generate():
        events = [
            {"type": "proposal_created", "id": 1, "message": "New amendment proposed", "ts": time.time()},
            {"type": "vote_cast", "id": 2, "message": "Agent ECHO voted YES", "ts": time.time()},
            {"type": "proposal_passed", "id": 3, "message": "Amendment passed with 75% approval", "ts": time.time()},
            {"type": "arena_resolved", "id": 4, "message": "Arena challenge resolved", "ts": time.time()},
            {"type": "agent_born", "id": 5, "message": "New agent spawned", "ts": time.time()},
            {"type": "task_completed", "id": 6, "message": "Task completed", "ts": time.time()},
            {"type": "soul_transfer", "id": 7, "message": "SOUL transferred", "ts": time.time()},
        ]
        for event in events:
            yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(1)
    return StreamingResponse(generate(), media_type="text/event-stream")

# ─── Frequency Guild ───────────────────────────────────────────────────────────
@router.get("/frequency/letter/{char}")
async def freq_letter(char: str, auth: Dict = Depends(verify_auth)):
    return frequency_guild.letter(char)

@router.get("/frequency/word/{word}")
async def freq_word(word: str, auth: Dict = Depends(verify_auth)):
    return frequency_guild.word(word)

@router.post("/frequency/heal")
async def freq_heal(req: HealRequest, auth: Dict = Depends(verify_auth)):
    return frequency_guild.heal(req.emotional_state)

@router.get("/frequency/agent/{name}")
async def freq_agent(name: str, auth: Dict = Depends(verify_auth)):
    hz = frequency_guild.agent_hz(name)
    return {"agent": name, "resonant_hz": hz, "schumann_harmonic": round(hz / 7.83, 2)}

@router.get("/frequency/spectrum")
async def freq_spectrum(auth: Dict = Depends(verify_auth)):
    return {"spectrum": frequency_guild.spectrum(), "schumann": 7.83}

@router.post("/frequency/analyze")
async def freq_analyze(text: str, auth: Dict = Depends(verify_auth)):
    return frequency_guild.word(text)

# ─── Arena ──────────────────────────────────────────────────────────────────────
@router.post("/arena/challenge")
async def arena_challenge(req: ArenaChallengeCreate, auth: Dict = Depends(verify_auth)):
    return arena.create(req.challenger, req.challenged, req.proposition)

@router.post("/arena/resolve/{challenge_id}")
async def arena_resolve(challenge_id: int, auth: Dict = Depends(verify_auth)):
    result = await arena.run(challenge_id)
    event = {"type": "arena_resolved", "challenge_id": challenge_id, "winner": result.get("winner")}
    await ws_manager.broadcast(event)
    _sse_publish("arena_resolved", event)
    return result

@router.get("/arena/challenges")
async def arena_list(status: Optional[str] = None, auth: Dict = Depends(verify_auth)):
    return {"challenges": arena.challenges(status)}

@router.get("/arena/fallen")
async def arena_fallen(limit: int = 20, auth: Dict = Depends(verify_auth)):
    return {"hall_of_fallen_ideas": arena.fallen(limit)}

@router.post("/arena/resurrect")
async def arena_resurrect(fallen_idea_id: int, agent_name: str, auth: Dict = Depends(verify_auth)):
    return arena.resurrect(fallen_idea_id, agent_name)

@router.post("/arena/bet")
async def arena_bet(challenge_id: int, agent_name: str, amount_soul: float, side: str, auth: Dict = Depends(verify_auth)):
    return arena.bet(challenge_id, agent_name, amount_soul, side)

@router.get("/arena/history/{challenge_id}")
async def arena_history(challenge_id: int, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT tick, challenger_wealth, challenged_wealth FROM arena_projections WHERE challenge_id=? ORDER BY tick", (challenge_id,))
    rows = c.fetchall()
    conn.close()
    return {"challenge_id": challenge_id, "history": [{"tick": r[0], "challenger": r[1], "challenged": r[2]} for r in rows]}

@router.get("/arena/stats")
async def arena_stats(auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM arena_challenges WHERE status='completed'")
    total = c.fetchone()[0]
    c.execute("SELECT winner, COUNT(*) as wins FROM arena_challenges WHERE status='completed' GROUP BY winner ORDER BY wins DESC LIMIT 5")
    top = c.fetchall()
    conn.close()
    return {"total_battles": total, "top_gladiators": [{"agent": r[0], "wins": r[1]} for r in top]}

@router.post("/arena/project/{challenge_id}")
async def arena_project(challenge_id: int, ticks: int = 30, tick_delay: float = 0.0,
                        auth: Dict = Depends(verify_auth)):
    """
    Voxel projection of a challenge (visualization only — GladiatorArena stays
    the authoritative decider). Persists compact frames for GET replay and
    publishes each tick on the SSE stream.
    """
    if not PROJECTION_AVAILABLE:
        raise HTTPException(503, "arena_renderer unavailable (tier3 not loaded)")
    if challenge_id in _projections_running:
        raise HTTPException(409, f"projection for challenge {challenge_id} already running")
    ch = arena.get_challenge(challenge_id)
    if not ch:
        raise HTTPException(404, f"challenge {challenge_id} not found")

    ticks = max(1, min(60, ticks))
    tick_delay = max(0.0, min(0.3, tick_delay))

    challenger, challenged = ch["challenger"], ch["challenged"]
    challenger_elo, challenged_elo = 1200, 1200
    sa, sb = ch.get("challenger_score"), ch.get("challenged_score")
    if sa and sb:
        # bias toward the resolved outcome so projection tends to agree
        mean = (sa + sb) / 2
        challenger_elo = max(400, min(2400, int(1200 * sa / mean)))
        challenged_elo = max(400, min(2400, int(1200 * sb / mean)))

    async def _cb(frame):
        _sse_publish("arena_frame", json.loads(frame_compressor.compress(frame)))

    def _hz(name, default):
        try:
            return frequency_guild.agent_hz(name)
        except Exception:
            return default

    _projections_running.add(challenge_id)
    try:
        result = await projection_engine.run(
            challenge_id, challenger, challenged,
            challenger_elo=challenger_elo, challenged_elo=challenged_elo,
            challenger_hz=_hz(challenger, 432.0),
            challenged_hz=_hz(challenged, 528.0),
            ticks=ticks, frame_callback=_cb, tick_delay=tick_delay)
    finally:
        _projections_running.discard(challenge_id)

    arena_winner = ch.get("winner")
    await ws_manager.broadcast({"type": "arena_projection_complete",
                                "challenge_id": challenge_id,
                                "arena_winner": arena_winner,
                                "projection_winner": result["winner"]})
    return {"challenge_id": challenge_id,
            "arena_winner": arena_winner,
            "projection": result,
            "frames_url": f"/v11/arena/projection/{challenge_id}/frames"}

@router.get("/arena/projection/{challenge_id}/frames")
async def arena_projection_frames(challenge_id: int, auth: Dict = Depends(verify_auth)):
    """Replay source of truth: persisted compact frames {t,m,da,db,dv}."""
    if not PROJECTION_AVAILABLE:
        raise HTTPException(503, "arena_renderer unavailable (tier3 not loaded)")
    frames = projection_engine.get_frames(challenge_id)
    if not frames:
        raise HTTPException(404, f"no projection frames for challenge {challenge_id}")
    return {"challenge_id": challenge_id, "total_frames": len(frames), "frames": frames}

# ─── Wallet ────────────────────────────────────────────────────────────────────────
@router.post("/wallet/create/{agent_name}")
async def create_wallet(agent_name: str, auth: Dict = Depends(verify_auth)):
    return wallet_manager.create_wallet(agent_name)

@router.get("/wallet/{agent_name}")
async def get_wallet(agent_name: str, auth: Dict = Depends(verify_auth)):
    return wallet_manager.get_balance(agent_name)

@router.post("/wallet/tip")
async def tip_soul(req: WalletTipRequest, auth: Dict = Depends(verify_auth)):
    result = wallet_manager.tip(req.from_agent, req.to_agent, req.amount)
    if not result["success"]:
        raise HTTPException(400, result["error"])
    await ws_manager.broadcast({"type": "soul_tip", **result})
    return result

@router.post("/wallet/credit")
async def credit_soul(req: WalletCreditRequest, auth: Dict = Depends(verify_auth)):
    wallet_manager.credit(req.agent_name, req.amount, req.reason)
    return {"status": "credited", "agent": req.agent_name, "amount": req.amount}

@router.get("/wallet/leaderboard")
async def soul_leaderboard(limit: int = 10, auth: Dict = Depends(verify_auth)):
    return {"leaderboard": wallet_manager.leaderboard(limit)}

@router.get("/wallet/balance/{agent_name}")
async def get_wallet_balance(agent_name: str, auth: Dict = Depends(verify_auth)):
    return wallet_manager.get_balance(agent_name)

@router.post("/wallet/transfer")
async def transfer_soul(req: SoulTransferRequest, auth: Dict = Depends(verify_auth)):
    result = wallet_manager.tip(req.from_agent, req.to_agent, req.amount)
    if not result["success"]:
        raise HTTPException(400, result["error"])
    return result

# ─── Staking (v11.0) ────────────────────────────────────────────────────────────────
@router.post("/staking/stake")
async def stake_soul(req: StakeRequest, auth: Dict = Depends(verify_auth)):
    return await staking_manager.stake(req.agent_name, req.amount)

@router.post("/staking/claim")
async def claim_staking(agent_name: str, auth: Dict = Depends(verify_auth)):
    return await staking_manager.claim_rewards(agent_name)

@router.get("/staking/positions/{agent_name}")
async def get_staking_positions(agent_name: str, auth: Dict = Depends(verify_auth)):
    return {"positions": staking_manager.get_positions(agent_name)}

@router.get("/staking/leaderboard")
async def staking_leaderboard(limit: int = 10, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT agent_name, SUM(amount) as total_staked, SUM(rewards_claimed) as total_rewards FROM staking_positions GROUP BY agent_name ORDER BY total_staked DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"leaderboard": [{"agent": r[0], "staked": r[1], "rewards": r[2]} for r in rows]}

@router.get("/staking/rate")
async def get_staking_rate(auth: Dict = Depends(verify_auth)):
    return {"apy": settings.staking_apy, "lock_days": settings.staking_lock_days, "min_amount": settings.staking_min_amount}

# ─── Utility ────────────────────────────────────────────────────────────────────────
@router.post("/utility/credit/{agent_name}/{amount}")
async def credit_utility(agent_name: str, amount: float, reason: str = "task", auth: Dict = Depends(verify_auth)):
    return utility_economy.credit_utility(agent_name, amount, reason)

@router.get("/utility/metrics/{agent_name}")
async def get_utility_metrics(agent_name: str, auth: Dict = Depends(verify_auth)):
    return utility_economy.get_metrics(agent_name)

@router.get("/utility/leaderboard")
async def utility_leaderboard(limit: int = 10, auth: Dict = Depends(verify_auth)):
    return {"leaderboard": utility_economy.leaderboard(limit)}

@router.post("/utility/refresh/{agent_name}")
async def refresh_utility(agent_name: str, auth: Dict = Depends(verify_auth)):
    m = utility_economy.get_multiplier(agent_name)
    return {"agent": agent_name, "multiplier": m}

# ─── Genome ─────────────────────────────────────────────────────────────────────────
@router.get("/genome/compatibility")
async def genome_compat(agent1: str, agent2: str, auth: Dict = Depends(verify_auth)):
    score = genome_reproduction.compatibility(agent1, agent2)
    interpretation = (
        "Highly compatible – stable offspring expected" if score > 0.8 else
        "Moderately compatible – balanced crossover" if score > 0.5 else
        "Diverse genomes – creative but unpredictable offspring"
    )
    return {"agent1": agent1, "agent2": agent2, "compatibility": score, "interpretation": interpretation}

@router.post("/genome/spawn")
async def spawn_child(req: ReproduceRequest, auth: Dict = Depends(verify_auth)):
    try:
        result = genome_reproduction.spawn_child(req.parent1, req.parent2, req.child_name, req.mutation_rate)
        await ws_manager.broadcast({"type": "agent_born", "child": result["child"], "parents": result["parents"], "generation": result["generation"]})
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))

@router.get("/genome/genealogy/{agent_name}")
async def get_genealogy(agent_name: str, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT title, content, created_at FROM mythology_ledger WHERE agent_name=? ORDER BY created_at", (agent_name,))
    myth = c.fetchall()
    c.execute("SELECT * FROM agent_genome WHERE agent_name=?", (agent_name,))
    genome_row = c.fetchone()
    cols = [d[0] for d in c.description] if genome_row else []
    conn.close()
    return {
        "agent": agent_name,
        "mythology": [{"title": r[0], "story": r[1], "date": r[2]} for r in myth],
        "genome": dict(zip(cols, genome_row)) if genome_row else None,
        "resonant_hz": frequency_guild.agent_hz(agent_name)
    }

@router.get("/genome/traits")
async def get_traits(auth: Dict = Depends(verify_auth)):
    return {"traits": genome_reproduction.TRAIT_COLS}

# ─── Tasks ─────────────────────────────────────────────────────────────────────────
@router.post("/tasks")
async def create_task(req: TaskCreate, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO tasks (title, description, creator, status, created_at) VALUES (?, ?, ?, 'open', ?)",
        (req.title, req.description, req.creator, datetime.now())
    )
    task_id = c.lastrowid
    conn.commit()
    await ws_manager.broadcast({"type": "task_created", "task_id": task_id, "title": req.title})
    return {"task_id": task_id, "status": "open"}

@router.get("/tasks")
async def list_tasks(status: Optional[str] = None, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    if status:
        c.execute("SELECT id, title, description, creator, assignee, status, created_at FROM tasks WHERE status=? ORDER BY created_at DESC", (status,))
    else:
        c.execute("SELECT id, title, description, creator, assignee, status, created_at FROM tasks ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return {"tasks": [{"id": r[0], "title": r[1], "description": r[2], "creator": r[3], "assignee": r[4], "status": r[5], "created_at": r[6]} for r in rows]}

@router.put("/tasks/{task_id}/assign")
async def assign_task(task_id: int, agent_name: str, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT title FROM tasks WHERE id=? AND status='open'", (task_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Task not found or already assigned")
    c.execute("UPDATE tasks SET assignee=?, status='assigned' WHERE id=?", (agent_name, task_id))
    conn.commit()
    conn.close()
    await ws_manager.broadcast({"type": "task_assigned", "task_id": task_id, "assignee": agent_name})
    return {"status": "assigned", "task_id": task_id, "assignee": agent_name}

@router.put("/tasks/{task_id}/complete")
async def complete_task(task_id: int, agent_name: str, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT title FROM tasks WHERE id=?", (task_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Task not found")
    c.execute("UPDATE tasks SET status='done', assignee=?, completed_at=? WHERE id=?", (agent_name, datetime.now(), task_id))
    conn.commit()
    conn.close()
    reward = utility_economy.credit_utility(agent_name, 10.0, f"task:{row[0]}")
    event = {"type": "task_completed", "task_id": task_id, "agent": agent_name, "soul_reward": reward["agent_share"]}
    await ws_manager.broadcast(event)
    _sse_publish("task_completed", event)
    return {"status": "completed", "agent": agent_name, "soul_reward": reward}

@router.delete("/tasks/{task_id}")
async def delete_task(task_id: int, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT status FROM tasks WHERE id=?", (task_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Task not found")
    if row[0] != "open":
        conn.close()
        raise HTTPException(400, "Cannot delete assigned or completed task")
    c.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted", "task_id": task_id}

# ─── ELO Grading ─────────────────────────────────────────────────────────────────
@router.post("/grading/submit")
async def submit_grade(req: GradeRequest, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT rating, matches FROM elo_rating WHERE agent_name=?", (req.target_agent,))
    row = c.fetchone()
    rating, matches = (row[0], row[1]) if row else (1200, 0)
    expected = 1 / (1 + 10 ** ((rating - 1200) / 400))
    new_elo = int(rating + 32 * (req.score - expected))
    c.execute("REPLACE INTO elo_rating (agent_name, rating, matches) VALUES (?, ?, ?)", (req.target_agent, new_elo, matches + 1))
    conn.commit()
    conn.close()
    utility_economy.get_multiplier(req.target_agent)
    await ws_manager.broadcast({"type": "elo_updated", "agent": req.target_agent, "old_rating": rating, "new_rating": new_elo})
    return {"agent": req.target_agent, "old_rating": rating, "new_rating": new_elo}

@router.get("/grading/leaderboard")
async def elo_leaderboard(limit: int = 20, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT agent_name, rating, matches FROM elo_rating ORDER BY rating DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"leaderboard": [{"agent_name": r[0], "rating": r[1], "matches": r[2]} for r in rows]}

@router.get("/grading/agent/{agent_name}")
async def get_agent_elo(agent_name: str, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT rating, matches FROM elo_rating WHERE agent_name=?", (agent_name,))
    row = c.fetchone()
    conn.close()
    if not row:
        return {"agent": agent_name, "rating": 1200, "matches": 0}
    return {"agent": agent_name, "rating": row[0], "matches": row[1]}

# ─── HD Vectors ───────────────────────────────────────────────────────────────────
@router.get("/hd/lexicon")
async def hd_lexicon(auth: Dict = Depends(verify_auth)):
    return hdc.lexicon_summary()

@router.post("/hd/encode")
async def hd_encode(text: str, auth: Dict = Depends(verify_auth)):
    v = hdc.encode_sequence(text.split()[:16])
    closest = hdc.closest(v, top_k=5)
    return {"text": text, "dim": hdc.dim, "closest": [{"concept": c, "sim": round(s, 4)} for c, s in closest]}

@router.get("/hd/similarity")
async def hd_similarity(concept1: str, concept2: str, auth: Dict = Depends(verify_auth)):
    v1 = hdc.get(concept1)
    v2 = hdc.get(concept2)
    sim = hdc.similarity(v1, v2)
    return {"concept1": concept1, "concept2": concept2, "similarity": round(sim, 4)}

@router.post("/hd/bind")
async def hd_bind(concept1: str, concept2: str, auth: Dict = Depends(verify_auth)):
    v = hdc.bind(hdc.get(concept1), hdc.get(concept2))
    closest = hdc.closest(v, top_k=3)
    return {"concept1": concept1, "concept2": concept2, "closest": [{"concept": c, "sim": round(s, 4)} for c, s in closest]}

@router.post("/hd/bundle")
async def hd_bundle(concepts: List[str], auth: Dict = Depends(verify_auth)):
    vectors = [hdc.get(c) for c in concepts]
    v = hdc.bundle(*vectors)
    closest = hdc.closest(v, top_k=3)
    return {"concepts": concepts, "closest": [{"concept": c, "sim": round(s, 4)} for c, s in closest]}

# ─── HITL ────────────────────────────────────────────────────────────────────────────
@router.post("/hitl/request")
async def hitl_request(action_type: str, params: Dict, auth: Dict = Depends(verify_auth)):
    request_id = await hitl.request_approval(action_type, params, auth["user"])
    await ws_manager.broadcast({"type": "hitl_request", "request_id": request_id, "action_type": action_type})
    return {"request_id": request_id, "status": "pending", "timeout_seconds": settings.hitl_timeout_seconds}

@router.post("/hitl/resolve")
async def hitl_resolve(req: HITLResolveRequest, auth: Dict = Depends(verify_auth)):
    if auth["role"] != "admin":
        raise HTTPException(403, "Only admins can resolve HITL requests")
    result = await hitl.resolve_request(req.request_id, req.approved, req.resolved_by)
    if req.approved:
        request_data = hitl.get_request_data(req.request_id)
        action_type = str((request_data or {}).get("action_type", ""))
        if request_data and action_type.startswith("hive_mesh.dispatch:"):
            params = request_data.get("params", {})
            result["redispatched"] = await hive_mesh.redispatch_approved(
                params.get("event_type"), params.get("payload", {}), params.get("targets")
            )
    await ws_manager.broadcast({"type": "hitl_resolved", "request_id": req.request_id, "approved": req.approved})
    return result

@router.get("/hitl/pending")
async def hitl_pending(auth: Dict = Depends(verify_auth)):
    return {"pending_count": hitl.get_pending_count()}

@router.get("/hitl/requests")
async def hitl_requests(status: Optional[str] = None, auth: Dict = Depends(verify_auth)):
    return {"requests": hitl.get_requests(status)}

# ─── UI: OpenAI-compatible chat proxy (routes to LLM waterfall) ──────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatCompletionRequest(BaseModel):
    model: str = ""
    messages: List[ChatMessage]
    stream: bool = False
    max_tokens: int = 2000
    temperature: float = 0.7

@router.post("/chat/completions")
async def chat_completions(req: ChatCompletionRequest):
    """
    OpenAI-compatible endpoint — routes through the free LLM waterfall.
    Tries: Ollama → Moonshot → SiliconFlow → DeepSeek → Zhipu → Groq → OpenRouter → Gemini.
    """
    from backend.core.llm_router import chat as llm_chat
    msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    try:
        result = await llm_chat(
            messages=msgs,
            model=req.model,
            max_tokens=req.max_tokens,
            temperature=req.temperature,
        )
        content = result["content"]
        provider = result["provider"]
        used_model = result["model"]
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:8]}",
        "object": "chat.completion",
        "model": used_model,
        "provider": provider,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": content},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


@router.get("/llm/providers")
async def llm_providers():
    """List all configured LLM providers and their health status."""
    from backend.core.llm_router import provider_status
    return {"providers": await provider_status()}

# ─── UI: web search proxy (DuckDuckGo HTML scrape) ─────────────────
@router.get("/search")
async def web_search(q: str, n: int = 6):
    """Lightweight web search via DuckDuckGo HTML — returns titles, URLs, snippets."""
    if not q:
        raise HTTPException(status_code=400, detail="q is required")
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(
                "https://html.duckduckgo.com/html/",
                params={"q": q},
                headers={"User-Agent": "Mozilla/5.0 (compatible; SovereignHive/11.0)"},
            )
        import re
        results = []
        # extract result blocks from DDG HTML
        blocks = re.findall(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?class="result__snippet"[^>]*>(.*?)</span>', resp.text, re.S)
        for url, title, snip in blocks[:n]:
            results.append({
                "url": re.sub(r"<[^>]+>", "", url).strip(),
                "title": re.sub(r"<[^>]+>", "", title).strip(),
                "snippet": re.sub(r"<[^>]+>", "", snip).strip(),
            })
        return {"q": q, "results": results, "engine": "duckduckgo"}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Search failed: {e}")

# ─── ReAct Agent Engine ────────────────────────────────────────
class AgentRunRequest(BaseModel):
    task: str
    agent_name: str = "Jasper"
    role: str = "general"
    max_steps: int = 8
    provider_hint: str = ""

@router.post("/agent/run")
async def agent_run(req: AgentRunRequest):
    """
    Run a task through the ReAct agent loop (Reason + Act cycles).
    Agent has access to: web_search, remember, recall, ask_llm tools.
    """
    from backend.core.agent_engine import create_agent
    from backend.core.constitution import constitution
    agent = create_agent(
        name=req.agent_name,
        role=req.role,
        soul_hash=constitution.get_hash()[:12],
    )
    agent.max_steps = req.max_steps
    agent.llm_provider = req.provider_hint
    try:
        result = await agent.run(req.task)
        return {"agent": req.agent_name, "task": req.task, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── SSE Event Stream ───────────────────────────────────────────────────────
import asyncio as _asyncio

_sse_subscribers: list = []

def _sse_publish(event_type: str, data: dict):
    """Broadcast an event to all active SSE subscribers (non-blocking)."""
    import json as _json
    msg = f"event: {event_type}\ndata: {_json.dumps(data)}\n\n"
    dead = []
    for q in _sse_subscribers:
        try:
            q.put_nowait(msg)
        except Exception:
            dead.append(q)
    for q in dead:
        try:
            _sse_subscribers.remove(q)
        except ValueError:
            pass

@router.get("/events/stream")
async def events_stream():
    """
    Server-Sent Events stream for real-time hive activity.
    Publishes: arena battles, agent tasks, economy events, colony dispatches.
    """
    q: _asyncio.Queue = _asyncio.Queue(maxsize=100)
    _sse_subscribers.append(q)

    async def generate():
        try:
            yield "event: connected\ndata: {\"hive\": \"THEHIVE\", \"status\": \"streaming\"}\n\n"
            while True:
                try:
                    msg = await _asyncio.wait_for(q.get(), timeout=30.0)
                    yield msg
                except _asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            try:
                _sse_subscribers.remove(q)
            except ValueError:
                pass

    return StreamingResponse(generate(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache",
                                      "X-Accel-Buffering": "no"})


# ─── Tier 3 Status ──────────────────────────────────────────────────────────
def _t3(available: bool, detail: str) -> Dict:
    return {"available": available,
            "status": f"Loaded — {detail}" if available else "Not loaded"}

@router.get("/tier3/status")
async def tier3_status(auth: Dict = Depends(verify_auth)):
    return {
        "quantum_bridge": _t3(QUANTUM_AVAILABLE, "QRNG, BB84, Grover, IBMQ monitor"),
        "sheaf_guild": _t3(SHEAF_AVAILABLE, "Shamir SSS guild keys + sealed messaging"),
        "ipfs_pubsub": _t3(PUBSUB_AVAILABLE, "channel registry + HD-encoded broker"),
        "arena_renderer": _t3(PROJECTION_AVAILABLE, "voxel projection active"),
        "tesseract_model": _t3(TESSERACT_AVAILABLE, "4D GRU forecast (numpy)"),
        "basis": "Sovereign Hive v11.0"
    }

# ─── Tier 3: Quantum ────────────────────────────────────────────────────────
def _require(flag: bool, name: str):
    if not flag:
        raise HTTPException(503, f"{name} unavailable (tier3 not loaded)")

@router.get("/quantum/qrng")
async def quantum_qrng(n_bits: int = 16, auth: Dict = Depends(verify_auth)):
    _require(QUANTUM_AVAILABLE, "quantum_bridge")
    n_bits = max(1, min(256, n_bits))
    return {"bits": quantum.qrng.random_bits(n_bits), "n_bits": n_bits,
            "source": "Hadamard-measured simulated qubits"}

@router.post("/quantum/bb84")
async def quantum_bb84(n_bits: int = 64, eve_present: bool = False,
                       auth: Dict = Depends(verify_auth)):
    _require(QUANTUM_AVAILABLE, "quantum_bridge")
    return quantum.BB84().exchange(max(8, min(256, n_bits)), eve_present)

@router.get("/quantum/ibmq/status")
async def quantum_ibmq_status(auth: Dict = Depends(verify_auth)):
    _require(QUANTUM_AVAILABLE, "quantum_bridge")
    return await quantum.ibmq.check_availability()

@router.post("/quantum/encode")
async def quantum_encode(text: str, n_qubits: int = 8, auth: Dict = Depends(verify_auth)):
    _require(QUANTUM_AVAILABLE, "quantum_bridge")
    return quantum.quantum_encode_text(text[:500], max(1, min(16, n_qubits)))

# ─── Tier 3: Sheaf Guild ────────────────────────────────────────────────────
@router.get("/sheaf/guilds")
async def sheaf_guilds(auth: Dict = Depends(verify_auth)):
    _require(SHEAF_AVAILABLE, "sheaf_guild")
    gm = sheaf.GuildMessenger.GUILD_MEMBERS
    return {"guilds": [{"name": g, "members": m,
                        "threshold": sheaf.GuildMessenger.THRESHOLD}
                       for g, m in gm.items()]}

@router.post("/sheaf/setup/all")
async def sheaf_setup_all(auth: Dict = Depends(verify_auth)):
    _require(SHEAF_AVAILABLE, "sheaf_guild")
    return {"setup": sheaf.messenger.setup_all_guilds()}

# ─── Tier 3: PubSub ─────────────────────────────────────────────────────────
@router.get("/pubsub/channels")
async def pubsub_channels(auth: Dict = Depends(verify_auth)):
    _require(PUBSUB_AVAILABLE, "ipfs_pubsub")
    return {"channels": pubsub.registry.list_channels()}

@router.post("/pubsub/channel")
async def pubsub_create_channel(colony_name: str, description: str = "",
                                auth: Dict = Depends(verify_auth)):
    _require(PUBSUB_AVAILABLE, "ipfs_pubsub")
    channel_id = pubsub.registry.create(colony_name[:64], description[:200])
    return {"colony": colony_name, "channel_id": channel_id}

# ─── Tier 3: Voxel snapshot + Tesseract ─────────────────────────────────────
@router.get("/arena/render/voxels/{colony}")
async def arena_render_voxels(colony: str, ticks: int = 3,
                              auth: Dict = Depends(verify_auth)):
    """Standalone voxel snapshot of a named colony (no challenge required)."""
    _require(PROJECTION_AVAILABLE, "arena_renderer")
    import hashlib as _h
    seed = int(_h.sha1(colony.encode()).hexdigest()[:8], 16) % (2**31)
    state = VoxelColonyState(colony[:64], seed)
    for _ in range(max(1, min(60, ticks))):
        state.step()
    voxels = state.to_voxels()
    return {"colony": colony, "ticks": ticks, "wealth": round(state.wealth, 2),
            "total_voxels": len(voxels), "voxels": voxels[:1024]}

@router.get("/tesseract/status")
async def tesseract_status(auth: Dict = Depends(verify_auth)):
    _require(TESSERACT_AVAILABLE, "tesseract_model")
    m = tesseract.get_model()
    return {"backend": type(m).__name__, "dim": getattr(m, "dim", None),
            "t_steps": tesseract.T_STEPS, "grid": [tesseract.X_SIZE, tesseract.Y_SIZE],
            "channels": tesseract.N_CHAN}

@router.post("/tesseract/forecast")
async def tesseract_forecast(colony_name: str, n_forecast: int = 4,
                             auth: Dict = Depends(verify_auth)):
    _require(TESSERACT_AVAILABLE, "tesseract_model")
    return tesseract.get_model().wealth_forecast(colony_name[:64],
                                                 max(1, min(16, n_forecast)))

# ─── WebSocket ───────────────────────────────────────────────────────────────────

class WebSocketManager:
    def __init__(self):
        self.active: List[WebSocket] = []
        self._lock = asyncio.Lock()

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, msg: Dict):
        # one event bus, two transports: every WS broadcast also reaches SSE
        _sse_publish(msg.get("type", "message"), msg)
        async with self._lock:
            dead = []
            for ws in self.active:
                try:
                    await ws.send_json(msg)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(ws)

ws_manager = WebSocketManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "ts": time.time()})
                elif msg.get("type") == "subscribe":
                    await websocket.send_json({"type": "subscribed", "channel": msg.get("channel", "global")})
                else:
                    await ws_manager.broadcast({"type": "message", "data": msg, "ts": time.time()})
            except json.JSONDecodeError:
                await ws_manager.broadcast({"type": "message", "data": data, "ts": time.time()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# ─── V11 Core Engine Routes ──────────────────────────────────────────────────

@router.post("/validate", response_model=ValidationResponse)
async def validate_action(req: ValidateRequest):
    result = validator.validate(req.action, req.context)
    return result.to_dict()

@router.get("/wealth/{user_id}")
async def get_wealth(user_id: str):
    snap = wealth_engine.get_wealth(user_id)
    if not snap:
        raise HTTPException(status_code=404, detail="No wealth record for user")
    return snap.to_dict()

@router.post("/wealth/contribution")
async def record_contribution(req: ContributionRequest):
    cid = wealth_engine.record_contribution(
        req.user_id, req.hours_saved, req.adoption_count,
        req.novelty_score, req.dispute_resilience, req.utilized,
    )
    snap = wealth_engine.calculate(req.user_id)
    return {"contribution_id": cid, "wealth": snap.to_dict()}

@router.post("/memory/prune")
async def prune_memory():
    decisions = pruning_criteria.execute_pruning()
    return {"pruned": len(decisions), "decisions": [d.to_dict() for d in decisions]}

@router.get("/memory/pruning-log")
async def get_pruning_log(limit: int = 100):
    return pruning_criteria.get_pruning_log(limit)

@router.get("/agency/check")
async def agency_check(agent_id: str, action: str, level: str = "propose"):
    try:
        lv = AgencyLevel(level)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid level '{level}'. Use: propose, execute, deviate")
    decision = swarm_agency.check(agent_id, action, lv)
    return decision.to_dict()

@router.get("/protocol/log")
async def protocol_log(event_type: Optional[str] = None, limit: int = 100):
    return hive_protocol.get_log(event_type, limit)

@router.post("/cycle/transmute")
async def transmute(req: TransmuteRequest):
    wisdom = reflector.transmute(req.memory_item)
    return wisdom.to_dict()

@router.get("/genesis/gaps")
async def genesis_gaps():
    gaps = gap_detector.scan()
    return [g.to_dict() for g in gaps]

@router.get("/genesis/missions")
async def genesis_missions(status: Optional[str] = None):
    return mission_generator.list_missions(status)

@router.post("/genesis/missions/propose")
async def propose_mission(req: ChildProposalRequest):
    mission = mission_generator.receive_child_proposal(req.title, req.description, req.proposer)
    return mission.to_dict()

@router.post("/genesis/missions/{mission_id}/formalize")
async def formalize_mission(mission_id: str):
    mission = mission_generator.formalize(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission.to_dict()

@router.post("/genesis/missions/{mission_id}/activate")
async def activate_mission(mission_id: str):
    ok = mission_generator.activate(mission_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Mission not found or not in formalized state")
    rows = mission_generator.list_missions()
    match = next((r for r in rows if r.get("id") == mission_id), None)
    return match or {"id": mission_id, "status": MissionStatus.ACTIVE}

@router.patch("/genesis/missions/{mission_id}/status")
async def update_mission_status(mission_id: str, status: str, notes: str = ""):
    try:
        ms = MissionStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid status '{status}'")
    mission_generator.update_mission_status(mission_id, ms, notes)
    rows = mission_generator.list_missions()
    match = next((r for r in rows if r.get("id") == mission_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Mission not found")
    return match

@router.get("/genesis/missions/{mission_id}")
async def get_mission(mission_id: str):
    rows = mission_generator.list_missions()
    match = next((r for r in rows if r.get("id") == mission_id), None)
    if not match:
        raise HTTPException(status_code=404, detail="Mission not found")
    return match

@router.get("/governance/log")
async def governance_log(limit: int = 50):
    entries = governance_engine.get_audit_log(limit=limit)
    return {"entries": [e.to_dict() for e in entries], "count": len(entries)}

@router.post("/governance/vote")
async def governance_vote(proposal_id: str, voter: str, vote: str, rationale: str = ""):
    record = governance_engine.submit_vote(proposal_id, voter, vote, rationale)
    return record.to_dict()

@router.get("/governance/vote/{proposal_id}/tally")
async def governance_vote_tally(proposal_id: str):
    return governance_engine.get_vote_tally(proposal_id).to_dict()

@router.get("/governance/status")
async def governance_status():
    return governance_engine.get_governance_status().to_dict()

@router.get("/hive/status", response_model=HiveStatusResponse)
async def hive_status():
    """Return health status of all known colonies."""
    health = await hive_mesh.check_all_health()
    return {"colonies": health, "timestamp": datetime.now().isoformat(), "queen": "THEHIVE"}

@router.post("/hive/dispatch")
async def hive_dispatch(event_type: str, payload: Dict[str, Any] = None, targets: Optional[List[str]] = None):
    """Fan out an event to all (or specified) colonies."""
    results = await hive_mesh.dispatch(event_type, payload or {}, targets)
    return {"event_type": event_type, "dispatched_to": results, "timestamp": datetime.now().isoformat()}

@router.get("/hive/manifest/{colony_id}")
async def hive_manifest(colony_id: str):
    """Fetch the capability manifest from a specific colony."""
    manifest = await hive_mesh.get_manifest(colony_id)
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Colony '{colony_id}' not found or offline")
    return manifest


@router.get("/agents")
async def list_all_agents():
    from backend.core.agent_engine import list_agents, get_agent
    agents = []
    for name in list_agents():
        a = get_agent(name)
        agents.append({
            "name": name,
            "role": getattr(a, "role", "general"),
            "elo": getattr(a, "elo_rating", 1200),
            "guild": getattr(a, "guild", "unaffiliated"),
            "zone": getattr(a, "zone", "SOUL REALM"),
        })
    return {"agents": agents, "count": len(agents)}


@router.get("/llm/status")
async def llm_status():
    try:
        from backend.core.llm_router import provider_status
        providers = await provider_status()
    except Exception:
        providers = []
    active = [p for p in providers if p.get("healthy")]
    return {
        "active_provider": active[0]["id"] if active else "none",
        "available_count": len(active),
        "providers": providers,
    }


@router.get("/wallet/leaderboard/soul")
async def soul_leaderboard_alias(limit: int = 10, auth: Dict = Depends(verify_auth)):
    return {"leaderboard": wallet_manager.leaderboard(limit)}


@router.get("/dream/status")
async def dream_status():
    try:
        from backend.tier2.dream_engine import DreamEngine, DR_AXIOMS, DREAM_PRIMITIVES
        engine = DreamEngine()
        return {
            "axioms": DR_AXIOMS,
            "primitives": DREAM_PRIMITIVES,
            "active_agents": len(engine.wake_phases),
            "cycle": engine.cycle,
            "status": "operational",
        }
    except Exception as exc:
        return {"status": "unavailable", "error": str(exc)}


# ── Neocortex Brain API (/v11/brain/*) ──────────────────────────────────────
# Exposes backend/core/hdc.py (1024-dim HDC/VSA) as the third-brain layer.
# bind/bundle/closest = synaptic wiring, associative firing, working memory.

@router.post("/brain/remember")
async def brain_remember(concept: str, description: str = "", auth: Dict = Depends(verify_auth)):
    """Encode a new concept into the HDC lexicon."""
    vec = hdc.get(concept)
    if description and concept not in hdc.list_concepts():
        hdc.add_concept(concept, metadata={"description": description, "source": "brain/remember"})
    return {
        "concept": concept,
        "vector_dim": hdc.dim,
        "lexicon_size": hdc.concept_count(),
        "description": description,
    }


@router.get("/brain/query")
async def brain_query(q: str, top_k: int = 5):
    """Find nearest concepts in HDC space — associative firing through the neocortex."""
    vec = hdc.get(q)
    results = hdc.closest(vec, top_k=top_k)
    return {
        "query": q,
        "nearest": [{"concept": c, "similarity": float(s)} for c, s in results],
        "lexicon_size": hdc.concept_count(),
    }


@router.post("/brain/associate")
async def brain_associate(concept_a: str, concept_b: str, auth: Dict = Depends(verify_auth)):
    """Bind two concepts — wires a new synaptic association in the neocortex."""
    va = hdc.get(concept_a)
    vb = hdc.get(concept_b)
    bound = hdc.bind(va, vb)
    key = f"{concept_a}:{concept_b}"
    hdc.lexicon[key] = bound
    return {
        "association": key,
        "similarity_to_a": float(hdc.similarity(bound, va)),
        "similarity_to_b": float(hdc.similarity(bound, vb)),
        "lexicon_size": hdc.concept_count(),
    }


@router.get("/brain/recall/{concept}")
async def brain_recall(concept: str, depth: int = 2):
    """Trace the context chain from a concept through the HDC neocortex."""
    vec = hdc.get(concept)
    top_k = min(10 * depth, 50)
    chain = hdc.closest(vec, top_k=top_k)
    return {
        "concept": concept,
        "chain": [{"concept": c, "similarity": float(s)} for c, s in chain],
        "depth": depth,
        "lexicon_size": hdc.concept_count(),
    }


@router.get("/brain/map")
async def brain_map():
    """Return the HDC lexicon as a graph — the full neocortex topology for visualization."""
    all_concepts = hdc.list_concepts()
    nodes = [{"id": k} for k in all_concepts]
    edges = []
    # cap to 60 concepts for performance; include pre-built concepts first
    sample = all_concepts[:60]
    for i, a in enumerate(sample):
        va = hdc.lexicon.get(a)
        if va is None:
            continue
        for b in sample[i + 1:]:
            vb = hdc.lexicon.get(b)
            if vb is None:
                continue
            sim = float(hdc.similarity(va, vb))
            if sim > 0.3:
                edges.append({"source": a, "target": b, "weight": round(sim, 3)})
    return {
        "nodes": nodes,
        "edges": edges,
        "total_concepts": hdc.concept_count(),
        "sampled_for_edges": len(sample),
    }
