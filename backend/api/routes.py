"""
API Routes — Sovereign Hive v11.0
All endpoints: v10 + v11 governance + Tier 2 + Tier 3 integrations.
"""

import json
import asyncio
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
    conn.close()

    rho = 0.5  # Placeholder — replace with HiveResonance.compute()
    return {
        "version": "11.0",
        "timestamp": datetime.now().isoformat(),
        "hive_resonance": {"rho_hive": rho, "doubling_active": rho > settings.doubling_threshold},
        "constitution": {"status": "ACTIVE", "hash": constitution.get_hash()},
        "agent_count": agent_count,
        "phase": settings.hive_phase,
        "patterns_count": len(patterns.get_all()),
        "decay_rate": settings.decay_rate,
        "subsystems": {
            "memory": {"episodic": True, "semantic": True, "state": True},
            "frequency_guild": "Ψ active",
            "arena": "open for challenges",
            "staking": {"apy": settings.staking_apy},
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

# ─── Governance Patterns (v11.0) ─────────────────────────────
@router.get("/governance/patterns")
async def get_patterns(auth: Dict = Depends(verify_auth)):
    return {"patterns": patterns.get_all()}

@router.post("/governance/recommend")
async def recommend_patterns(context: str = "", auth: Dict = Depends(verify_auth)):
    return {"recommendations": patterns.recommend(context)}

# ─── Simulator (v11.0) ────────────────────────────────────────
@router.post("/simulate")
async def run_simulation(n_agents: int = 50, trials: int = 1000, base_rho: float = 0.7, auth: Dict = Depends(verify_auth)):
    return simulator.monte_carlo_proposal(n_agents, trials, base_rho)

# ─── SSE Feed (v11.0) ─────────────────────────────────────────
@router.get("/feed")
async def governance_feed(auth: Dict = Depends(verify_auth)):
    async def generate():
        events = [
            {"type": "proposal_created", "id": 1, "message": "New amendment proposed"},
            {"type": "vote_cast", "id": 2, "message": "Agent ECHO voted YES"},
            {"type": "proposal_passed", "id": 3, "message": "Amendment passed with 75% approval"},
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

# ─── Arena ────────────────────────────────────────────────────
@router.post("/arena/challenge")
async def arena_challenge(req: ArenaChallengeCreate, auth: Dict = Depends(verify_auth)):
    return arena.create(req.challenger, req.challenged, req.proposition)

@router.post("/arena/resolve/{challenge_id}")
async def arena_resolve(challenge_id: int, auth: Dict = Depends(verify_auth)):
    return await arena.run(challenge_id)

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

# ─── Wallet ────────────────────────────────────────────────────
@router.post("/wallet/create/{agent_name}")
async def create_wallet(agent_name: str, auth: Dict = Depends(verify_auth)):
    return wallet_manager.create_wallet(agent_name)

@router.get("/wallet/{agent_name}")
async def get_wallet(agent_name: str, auth: Dict = Depends(verify_auth)):
    return wallet_manager.get_balance(agent_name)

@router.post("/wallet/tip")
async def tip_soul(req: SoulTransferRequest, auth: Dict = Depends(verify_auth)):
    result = wallet_manager.tip(req.from_agent, req.to_agent, req.amount)
    if not result["success"]:
        raise HTTPException(400, result["error"])
    return result

@router.post("/wallet/credit")
async def credit_soul(agent_name: str, amount: float, reason: str = "manual", auth: Dict = Depends(verify_auth)):
    wallet_manager.credit(agent_name, amount, reason)
    return {"status": "credited", "agent": agent_name, "amount": amount}

@router.get("/wallet/leaderboard")
async def soul_leaderboard(limit: int = 10, auth: Dict = Depends(verify_auth)):
    return {"leaderboard": wallet_manager.leaderboard(limit)}

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
async def spawn_child(req: SpawnChildRequest, auth: Dict = Depends(verify_auth)):
    try:
        return genome_reproduction.spawn_child(req.parent1, req.parent2, req.child_name, req.mutation_rate)
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

# ─── Tasks ────────────────────────────────────────────────────
@router.post("/tasks")
async def create_task(req: TaskCreate, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute(
        "INSERT INTO tasks (title, description, creator, status) VALUES (?, ?, ?, 'open')",
        (req.title, req.description, req.creator)
    )
    task_id = c.lastrowid
    conn.commit()
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
    return {"status": "completed", "agent": agent_name, "soul_reward": reward}

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
    # Update utility multiplier after ELO change
    utility_economy.get_multiplier(req.target_agent)
    return {"agent": req.target_agent, "old_rating": rating, "new_rating": new_elo}

@router.get("/grading/leaderboard")
async def elo_leaderboard(limit: int = 20, auth: Dict = Depends(verify_auth)):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT agent_name, rating, matches FROM elo_rating ORDER BY rating DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return {"leaderboard": [{"agent_name": r[0], "rating": r[1], "matches": r[2]} for r in rows]}

# ─── HD Vectors ──────────────────────────────────────────────
@router.get("/hd/lexicon")
async def hd_lexicon(auth: Dict = Depends(verify_auth)):
    return hdc.lexicon_summary()

@router.post("/hd/encode")
async def hd_encode(text: str, auth: Dict = Depends(verify_auth)):
    v = hdc.encode_sequence(text.split()[:16])
    closest = hdc.closest(v, top_k=5)
    return {"text": text, "dim": hdc.dim, "closest": [{"concept": c, "sim": round(s, 4)} for c, s in closest]}

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

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, msg: Dict):
        for ws in self.active:
            try:
                await ws.send_json(msg)
            except:
                self.disconnect(ws)

ws_manager = WebSocketManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast({"type": "echo", "data": data, "ts": time.time()})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
