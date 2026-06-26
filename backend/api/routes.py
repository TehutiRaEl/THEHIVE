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

# ─── Pydantic Models ──────────────────────────────────────────
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

# ─── Router ──────────────────────────────────────────────────
router = APIRouter(prefix="/v11")

# ─── Health & Board ──────────────────────────────────────────
@router.get("/health")
async def health():
    return {"status": "healthy", "version": "11.0", "phase": settings.hive_phase}

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

# ─── Constitution ──────────────────────────────────────────────
@router.post("/constitution/check")
async def check_constitution(action_type: str, actor: str, params: Optional[str] = "{}", auth: Dict = Depends(verify_auth)):
    try:
        params_dict = json.loads(params) if params else {}
    except:
        params_dict = {}
    result = constitution.check(action_type, actor, params_dict)
    constitution.log(action_type, actor, result)
    return result

@router.get("/constitution/soul_md")
async def get_constitution(auth: Dict = Depends(verify_auth)):
    from backend.core.constitution import SOUL_MD
    return {"soul_md": SOUL_MD, "version": "4.0", "hash": constitution.get_hash()}

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
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT version, content, active, approved_at FROM constitution ORDER BY version DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"history": [{"version": r[0], "active": bool(r[2]), "approved_at": r[3]} for r in rows]}

# ─── Governance Patterns (v11.0) ─────────────────────────────
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

# ─── Simulator (v11.0) ────────────────────────────────────────
@router.post("/simulate")
async def run_simulation(req: SimulateRequest, auth: Dict = Depends(verify_auth)):
    return simulator.monte_carlo_proposal(req.n_agents, req.trials, req.base_rho, req.quorum)

@router.post("/simulate/colony")
async def simulate_colony(initial_wealth: float = 1000.0, growth_rate: float = 0.02, ticks: int = 100, auth: Dict = Depends(verify_auth)):
    return simulator.colony_growth_simulation(initial_wealth, growth_rate, 0.05, ticks, 0.7)

@router.post("/simulate/hyperparameters")
async def simulate_hyperparameters(param_grid: Dict, objective: str = "minimize_loss", n_trials: int = 50, auth: Dict = Depends(verify_auth)):
    return simulator.hyperparameter_optimization(param_grid, objective, n_trials)

# ─── SSE Feed (v11.0) ─────────────────────────────────────────
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

# ─── Frequency Guild ──────────────────────────────────────────
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

# ─── Arena ────────────────────────────────────────────────────
@router.post("/arena/challenge")
async def arena_challenge(req: ArenaChallengeCreate, auth: Dict = Depends(verify_auth)):
    return arena.create(req.challenger, req.challenged, req.proposition)

@router.post("/arena/resolve/{challenge_id}")
async def arena_resolve(challenge_id: int, auth: Dict = Depends(verify_auth)):
    result = await arena.run(challenge_id)
    await ws_manager.broadcast({"type": "arena_resolved", "challenge_id": challenge_id, "winner": result.get("winner")})
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

# ─── Wallet ────────────────────────────────────────────────────
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

# ─── Staking (v11.0) ──────────────────────────────────────────
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

# ─── Utility ──────────────────────────────────────────────────
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

# ─── Genome ────────────────────────────────────────────────────
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

# ─── Tasks ────────────────────────────────────────────────────
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
    await ws_manager.broadcast({"type": "task_completed", "task_id": task_id, "agent": agent_name, "soul_reward": reward["agent_share"]})
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

# ─── ELO Grading ─────────────────────────────────────────────
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

# ─── HD Vectors ──────────────────────────────────────────────
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

# ─── HITL ────────────────────────────────────────────────────
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
    await ws_manager.broadcast({"type": "hitl_resolved", "request_id": req.request_id, "approved": req.approved})
    return result

@router.get("/hitl/pending")
async def hitl_pending(auth: Dict = Depends(verify_auth)):
    return {"pending_count": hitl.get_pending_count()}

@router.get("/hitl/requests")
async def hitl_requests(status: Optional[str] = None, auth: Dict = Depends(verify_auth)):
    return {"requests": hitl.get_requests(status)}

# ─── UI: OpenAI-compatible chat proxy (routes to Ollama) ──────
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
    """OpenAI-compatible endpoint — proxies to the configured Ollama instance."""
    model = req.model or settings.ollama_model
    ollama_msgs = [{"role": m.role, "content": m.content} for m in req.messages]
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/chat",
                json={"model": model, "messages": ollama_msgs, "stream": False},
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Ollama error {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        content = data.get("message", {}).get("content", "")
    except HTTPException:
        raise
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Ollama not reachable. Is it running? (ollama serve)")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex[:8]}",
        "object": "chat.completion",
        "model": model,
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": content},
            "finish_reason": "stop",
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }

# ─── UI: web search proxy (DuckDuckGo HTML scrape) ─────────────
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

# ─── Tier 3 Status ──────────────────────────────────────────
@router.get("/tier3/status")
async def tier3_status(auth: Dict = Depends(verify_auth)):
    return {
        "quantum_bridge": {"available": False, "status": "Not loaded"},
        "sheaf_guild": {"available": False, "status": "Not loaded"},
        "ipfs_pubsub": {"available": False, "status": "Not loaded"},
        "arena_renderer": {"available": False, "status": "Not loaded"},
        "tesseract_model": {"available": False, "status": "Not loaded"},
        "message": "Import Tier 3 modules to enable",
        "basis": "Sovereign Hive v11.0"
    }

# ─── WebSocket ─────────────────────────────────────────────────
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
        async with self._lock:
            dead = []
            for ws in self.active:
                try:
                    await ws.send_json(msg)
                except:
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
