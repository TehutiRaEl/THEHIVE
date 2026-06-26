# ============================================================
# BACKEND ADDITIONS — Sovereign Hive v9
# Paste these imports + classes + endpoints into
# jasper_backend_v9_complete.py
# ============================================================

# ──────────────────────────────────────────────────────────────
# 1. NEW IMPORTS  (add to existing import block)
# ──────────────────────────────────────────────────────────────
"""
from eth_account import Account
from eth_account.signers.local import LocalAccount
import secrets as _secrets
from llm_router import call_llm, call_llm_json, get_llm_status, ollama_is_available
"""

# ──────────────────────────────────────────────────────────────
# 2. WALLET MANAGER
# ──────────────────────────────────────────────────────────────

WALLET_MANAGER_CODE = '''
class WalletManager:
    """
    Generates and stores deterministic Ethereum wallets for each agent.
    Keys are stored encrypted in SQLite.
    """

    def __init__(self):
        self._ensure_table()
        self.rpc_url = os.environ.get("SEPOLIA_RPC_URL", "")
        self.soul_contract = os.environ.get("SOUL_CONTRACT_ADDRESS", "")

    def _ensure_table(self):
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS agent_wallets (
                agent_name   TEXT PRIMARY KEY,
                address      TEXT NOT NULL,
                private_key  TEXT NOT NULL,
                soul_balance REAL DEFAULT 0,
                soul_earned  REAL DEFAULT 0,
                soul_spent   REAL DEFAULT 0,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def create_wallet(self, agent_name: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT address, soul_balance FROM agent_wallets WHERE agent_name = ?",
                  (agent_name,))
        row = c.fetchone()
        if row:
            conn.close()
            return {"agent": agent_name, "address": row[0], "balance": row[1], "new": False}

        private_key = "0x" + secrets.token_hex(32)
        account = Account.from_key(private_key)
        address = account.address

        c.execute(
            "INSERT INTO agent_wallets (agent_name, address, private_key) VALUES (?, ?, ?)",
            (agent_name, address, private_key)
        )
        conn.commit()
        conn.close()
        return {"agent": agent_name, "address": address, "balance": 0.0, "new": True}

    def credit(self, agent_name: str, amount: float, reason: str = ""):
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            UPDATE agent_wallets
            SET soul_balance = soul_balance + ?,
                soul_earned  = soul_earned  + ?
            WHERE agent_name = ?
        """, (amount, amount, agent_name))
        conn.commit()
        conn.close()

    def debit(self, agent_name: str, amount: float) -> bool:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT soul_balance FROM agent_wallets WHERE agent_name = ?", (agent_name,))
        row = c.fetchone()
        if not row or row[0] < amount:
            conn.close()
            return False
        c.execute("""
            UPDATE agent_wallets
            SET soul_balance = soul_balance - ?,
                soul_spent   = soul_spent   + ?
            WHERE agent_name = ?
        """, (amount, amount, agent_name))
        conn.commit()
        conn.close()
        return True

    def tip(self, from_agent: str, to_agent: str, amount: float) -> Dict:
        if not self.debit(from_agent, amount, f"tip to {to_agent}"):
            return {"success": False, "error": "Insufficient SOUL balance"}
        self.credit(to_agent, amount, f"tip from {from_agent}")
        return {"success": True, "from": from_agent, "to": to_agent, "amount": amount}

    def get_balance(self, agent_name: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            SELECT address, soul_balance, soul_earned, soul_spent
            FROM agent_wallets WHERE agent_name = ?
        """, (agent_name,))
        row = c.fetchone()
        conn.close()
        if not row:
            return {"error": "Wallet not found"}
        return {
            "agent": agent_name, "address": row[0],
            "soul_balance": row[1], "soul_earned": row[2], "soul_spent": row[3]
        }

    def leaderboard(self, limit: int = 10) -> List[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            SELECT w.agent_name, w.address, w.soul_balance, w.soul_earned,
                   COALESCE(e.rating, 1200) as elo
            FROM agent_wallets w
            LEFT JOIN elo_rating e ON e.agent_name = w.agent_name
            ORDER BY w.soul_balance DESC
            LIMIT ?
        """, (limit,))
        rows = c.fetchall()
        conn.close()
        return [
            {"agent": r[0], "address": r[1], "soul": r[2], "earned": r[3], "elo": r[4]}
            for r in rows
        ]


wallet_manager = WalletManager()
'''

# ──────────────────────────────────────────────────────────────
# 3. GENOME REPRODUCTION
# ──────────────────────────────────────────────────────────────

GENOME_REPRODUCTION_CODE = '''
class GenomeReproduction:
    """
    Combines two parent genomes via crossover + mutation to create offspring.
    """

    TRAIT_COLS = [
        "leadership","empathy","persistence","creativity","curiosity","analytical",
        "charisma","resilience","loyalty","wisdom","strategy","tactics","coding_skill",
        "communication","negotiation","risk_tolerance","patience","adaptability",
        "memory","focus","energy","spirituality","mysticism","oracle_sensitivity",
        "leadership_extra"
    ]

    def compatibility(self, name1: str, name2: str) -> float:
        g1 = self._load(name1)
        g2 = self._load(name2)
        if not g1 or not g2:
            return 0.0
        diffs = [abs(g1[t] - g2[t]) for t in self.TRAIT_COLS]
        avg_diff = sum(diffs) / len(diffs)
        return round(1.0 - avg_diff, 4)

    def crossover(self, name1: str, name2: str, mutation_rate: float = 0.1) -> Dict:
        g1 = self._load(name1)
        g2 = self._load(name2)
        if not g1 or not g2:
            raise ValueError(f"Genome not found for {name1} or {name2}")

        child_traits = {}
        for trait in self.TRAIT_COLS:
            alpha = random.uniform(0.0, 1.0)
            base  = alpha * g1[trait] + (1.0 - alpha) * g2[trait]
            noise = random.gauss(0, mutation_rate)
            child_traits[trait] = max(0.01, min(0.99, base + noise))

        child_traits["generation"] = max(
            g1.get("generation", 0), g2.get("generation", 0)
        ) + 1
        return child_traits

    def spawn_child(self, parent1: str, parent2: str, child_name: str = None,
                    mutation_rate: float = 0.1) -> Dict:
        traits = self.crossover(parent1, parent2, mutation_rate)

        if not child_name:
            suffix = uuid.uuid4().hex[:4].upper()
            child_name = f"KID_{parent1[:3]}_{parent2[:3]}_{suffix}"

        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT system_prompt FROM agents WHERE name = ?", (parent1,))
        r1 = c.fetchone()
        c.execute("SELECT system_prompt FROM agents WHERE name = ?", (parent2,))
        r2 = c.fetchone()

        blended_prompt = (
            f"You are {child_name}, Generation {traits['generation']} agent. "
            f"Born from the union of {parent1} and {parent2}. "
            f"You carry the combined wisdom of both lineages. "
            f"Parent wisdom:\n[{parent1}]: {(r1[0] or '')[:200]}\n"
            f"[{parent2}]: {(r2[0] or '')[:200]}"
        )

        try:
            c.execute(
                "INSERT INTO agents (name, description, system_prompt, capabilities, tools, status) "
                "VALUES (?, ?, ?, ?, ?, ?)",
                (child_name,
                 f"Gen-{traits['generation']} offspring of {parent1} × {parent2}",
                 blended_prompt,
                 json.dumps(["web_search", "memory_recall", "calculator"]),
                 json.dumps([]),
                 "active")
            )
        except sqlite3.IntegrityError:
            conn.close()
            raise ValueError(f"Agent {child_name} already exists")

        trait_row = {**traits, "agent_name": child_name}
        cols = ", ".join(trait_row.keys())
        placeholders = ", ".join(["?"] * len(trait_row))
        c.execute(f"INSERT INTO agent_genome ({cols}) VALUES ({placeholders})",
                  list(trait_row.values()))

        c.execute("SELECT rating FROM elo_rating WHERE agent_name = ?", (parent1,))
        elo1 = (c.fetchone() or [1200])[0]
        c.execute("SELECT rating FROM elo_rating WHERE agent_name = ?", (parent2,))
        elo2 = (c.fetchone() or [1200])[0]
        child_elo = int((elo1 + elo2) / 2)
        c.execute("INSERT INTO elo_rating (agent_name, rating, matches) VALUES (?, ?, 0)",
                  (child_name, child_elo))

        c.execute(
            "INSERT INTO mythology_ledger (agent_name, title, content, signature) "
            "VALUES (?, ?, ?, ?)",
            (child_name,
             f"Birth of {child_name}",
             f"On this day {datetime.now().isoformat()}, {child_name} was born from the convergence "
             f"of {parent1} (ELO {elo1}) and {parent2} (ELO {elo2}). "
             f"Generation: {traits['generation']}. Mutation rate: {mutation_rate}.",
             hashlib.sha256(child_name.encode()).hexdigest()[:16])
        )

        conn.commit()
        conn.close()

        wallet_info = wallet_manager.create_wallet(child_name)
        wallet_manager.credit(child_name, 50.0, "birth_grant")

        return {
            "status": "born",
            "child": child_name,
            "generation": traits["generation"],
            "parents": [parent1, parent2],
            "starting_elo": child_elo,
            "wallet": wallet_info["address"],
            "soul_grant": 50.0,
            "dominant_traits": sorted(
                [(k, round(v, 3)) for k, v in traits.items()
                 if k not in ("generation",)],
                key=lambda x: x[1], reverse=True
            )[:5],
            "recessive_traits": sorted(
                [(k, round(v, 3)) for k, v in traits.items()
                 if k not in ("generation",)],
                key=lambda x: x[1]
            )[:3],
        }

    def _load(self, agent_name: str) -> Optional[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT * FROM agent_genome WHERE agent_name = ?", (agent_name,))
        row = c.fetchone()
        if not row:
            conn.close()
            return None
        cols = [desc[0] for desc in c.description]
        conn.close()
        return dict(zip(cols, row))


genome_reproduction = GenomeReproduction()
'''


# ──────────────────────────────────────────────────────────────
# 4. NEW ENDPOINTS  (add after existing endpoints)
# ──────────────────────────────────────────────────────────────

NEW_ENDPOINTS_CODE = '''
# ─── LLM STATUS ─────────────────────────────────────────────
@app.get("/llm/status")
async def llm_status_endpoint(auth: Dict = Depends(verify_api_key)):
    return await get_llm_status()


@app.post("/llm/switch")
async def llm_switch_endpoint(provider: str, auth: Dict = Depends(verify_api_key)):
    import llm_router
    if provider not in ("ollama", "claude", "auto"):
        raise HTTPException(400, "provider must be ollama, claude, or auto")
    llm_router.LLM_PROVIDER = provider
    os.environ["LLM_PROVIDER"] = provider
    return {"status": "switched", "provider": provider}


# ─── WALLET ENDPOINTS ────────────────────────────────────────
class WalletTipRequest(BaseModel):
    from_agent: str
    to_agent:   str
    amount:     float = Field(..., gt=0)

class WalletCreditRequest(BaseModel):
    agent_name: str
    amount:     float
    reason:     str = "manual_credit"


@app.post("/wallet/create/{agent_name}")
async def create_wallet_endpoint(agent_name: str, auth: Dict = Depends(verify_api_key)):
    return wallet_manager.create_wallet(agent_name)


@app.get("/wallet/{agent_name}")
async def get_wallet_endpoint(agent_name: str, auth: Dict = Depends(verify_api_key)):
    return wallet_manager.get_balance(agent_name)


@app.post("/wallet/tip")
async def tip_endpoint(req: WalletTipRequest, auth: Dict = Depends(verify_api_key)):
    result = wallet_manager.tip(req.from_agent, req.to_agent, req.amount)
    if not result["success"]:
        raise HTTPException(400, result["error"])
    await manager.broadcast({"type": "soul_tip", **result})
    return result


@app.post("/wallet/credit")
async def credit_endpoint(req: WalletCreditRequest, auth: Dict = Depends(verify_api_key)):
    wallet_manager.credit(req.agent_name, req.amount, req.reason)
    return {"status": "credited", "agent": req.agent_name, "amount": req.amount}


@app.get("/wallet/leaderboard/soul")
async def soul_leaderboard(limit: int = 10, auth: Dict = Depends(verify_api_key)):
    return {"leaderboard": wallet_manager.leaderboard(limit)}


# ─── REPRODUCTION ENDPOINTS ──────────────────────────────────
class ReproduceRequest(BaseModel):
    parent1:        str
    parent2:        str
    child_name:     Optional[str] = None
    mutation_rate:  float = Field(0.1, ge=0.01, le=0.5)


@app.get("/agents/compatibility")
async def genome_compatibility(
    agent1: str, agent2: str, auth: Dict = Depends(verify_api_key)
):
    score = genome_reproduction.compatibility(agent1, agent2)
    interpretation = (
        "Highly compatible – stable offspring expected" if score > 0.8 else
        "Moderately compatible – balanced crossover"   if score > 0.5 else
        "Diverse genomes – creative but unpredictable offspring"
    )
    return {"agent1": agent1, "agent2": agent2, "compatibility": score,
            "interpretation": interpretation}


@app.post("/agents/reproduce")
async def reproduce_endpoint(req: ReproduceRequest, auth: Dict = Depends(verify_api_key)):
    try:
        result = genome_reproduction.spawn_child(
            req.parent1, req.parent2, req.child_name, req.mutation_rate
        )
        await swarm.load_agent(result["child"])
        await manager.broadcast({
            "type": "agent_born",
            "child":   result["child"],
            "parents": result["parents"],
            "generation": result["generation"]
        })
        await governance.log_decision(
            "reproduction", req.parent1,
            f"{req.parent1} × {req.parent2} → {result['child']}",
            "allow",
            f"Generation {result['generation']} offspring created with {req.mutation_rate} mutation"
        )
        return result
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.get("/agents/genealogy/{agent_name}")
async def agent_genealogy(agent_name: str, auth: Dict = Depends(verify_api_key)):
    conn = sqlite3.connect("jasper_memory.db")
    c = conn.cursor()
    c.execute(
        "SELECT title, content, created_at FROM mythology_ledger "
        "WHERE agent_name = ? ORDER BY created_at",
        (agent_name,)
    )
    rows = c.fetchall()
    c.execute("SELECT * FROM agent_genome WHERE agent_name = ?", (agent_name,))
    genome_row = c.fetchone()
    cols = [desc[0] for desc in c.description] if genome_row else []
    conn.close()
    return {
        "agent": agent_name,
        "mythology": [{"title": r[0], "story": r[1], "date": r[2]} for r in rows],
        "genome": dict(zip(cols, genome_row)) if genome_row else None
    }


@app.get("/grading/leaderboard")
async def elo_leaderboard_endpoint(limit: int = 20, auth: Dict = Depends(verify_api_key)):
    conn = sqlite3.connect("jasper_memory.db")
    c = conn.cursor()
    c.execute(
        "SELECT agent_name, rating, matches FROM elo_rating ORDER BY rating DESC LIMIT ?",
        (limit,)
    )
    rows = c.fetchall()
    conn.close()
    return {"leaderboard": [{"agent_name": r[0], "rating": r[1], "matches": r[2]}
                             for r in rows]}


@app.get("/tasks")
async def get_tasks_endpoint(status: Optional[str] = None, auth: Dict = Depends(verify_api_key)):
    conn = sqlite3.connect("jasper_memory.db")
    c = conn.cursor()
    if status:
        c.execute("SELECT id, title, description, creator, assignee, status, created_at, deadline "
                  "FROM tasks WHERE status = ? ORDER BY created_at DESC", (status,))
    else:
        c.execute("SELECT id, title, description, creator, assignee, status, created_at, deadline "
                  "FROM tasks ORDER BY created_at DESC")
    rows = c.fetchall()
    conn.close()
    return {"tasks": [
        {"id": r[0], "title": r[1], "description": r[2], "creator": r[3],
         "assignee": r[4], "status": r[5], "created_at": r[6], "deadline": r[7]}
        for r in rows
    ]}


@app.put("/tasks/{task_id}/complete")
async def complete_task_with_reward(
    task_id: int,
    agent_name: str,
    auth: Dict = Depends(verify_api_key)
):
    conn = sqlite3.connect("jasper_memory.db")
    c = conn.cursor()
    c.execute("SELECT title, assignee FROM tasks WHERE id = ?", (task_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(404, "Task not found")
    title    = row[0]
    assignee = agent_name or row[1]
    c.execute("UPDATE tasks SET status = 'done', assignee = ?, completed_at = ? WHERE id = ?",
              (assignee, datetime.now(), task_id))
    conn.commit()
    conn.close()

    reward = 10.0
    wallet_manager.credit(assignee, reward, f"task_completion:{title}")
    await manager.broadcast({"type": "task_completed", "task_id": task_id, "agent": assignee,
                             "soul_reward": reward})
    return {"status": "completed", "agent": assignee, "soul_reward": reward}
'''
