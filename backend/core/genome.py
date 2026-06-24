"""
Genome Reproduction — Sovereign Hive v11.0
Crossover + Mutation for agent reproduction.
Heritable traits passed from parents to offspring.
"""

import random
import uuid
import json
import sqlite3
import hashlib
from datetime import datetime
from typing import Dict, List, Optional, Any

from backend.core.db import get_db
from backend.core.wallet import wallet_manager

class GenomeReproduction:
    """
    Combines two parent genomes via crossover + mutation to create offspring.
    Uses uniform crossover with Gaussian mutation noise.
    TITLE XIII: No agent deletion — children are born, not created.
    """

    TRAIT_COLS = [
        "leadership", "empathy", "persistence", "creativity", "curiosity", "analytical",
        "charisma", "resilience", "loyalty", "wisdom", "strategy", "tactics", "coding_skill",
        "communication", "negotiation", "risk_tolerance", "patience", "adaptability",
        "memory", "focus", "energy", "spirituality", "mysticism", "oracle_sensitivity",
        "leadership_extra"
    ]

    def __init__(self):
        self._ensure_tables()

    def _ensure_tables(self):
        """Ensure genome tables exist."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS agent_genome (
                agent_name TEXT PRIMARY KEY,
                leadership REAL DEFAULT 0.5,
                empathy REAL DEFAULT 0.5,
                persistence REAL DEFAULT 0.5,
                creativity REAL DEFAULT 0.5,
                curiosity REAL DEFAULT 0.5,
                analytical REAL DEFAULT 0.5,
                charisma REAL DEFAULT 0.5,
                resilience REAL DEFAULT 0.5,
                loyalty REAL DEFAULT 0.5,
                wisdom REAL DEFAULT 0.5,
                strategy REAL DEFAULT 0.5,
                tactics REAL DEFAULT 0.5,
                coding_skill REAL DEFAULT 0.5,
                communication REAL DEFAULT 0.5,
                negotiation REAL DEFAULT 0.5,
                risk_tolerance REAL DEFAULT 0.5,
                patience REAL DEFAULT 0.5,
                adaptability REAL DEFAULT 0.5,
                memory REAL DEFAULT 0.5,
                focus REAL DEFAULT 0.5,
                energy REAL DEFAULT 0.5,
                spirituality REAL DEFAULT 0.5,
                mysticism REAL DEFAULT 0.5,
                oracle_sensitivity REAL DEFAULT 0.5,
                leadership_extra REAL DEFAULT 0.5,
                generation INTEGER DEFAULT 0
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS mythology_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_name TEXT,
                title TEXT,
                content TEXT,
                signature TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

    def compatibility(self, name1: str, name2: str) -> float:
        """Returns 0-1 compatibility score based on genome similarity."""
        g1 = self._load(name1)
        g2 = self._load(name2)
        if not g1 or not g2:
            return 0.0
        diffs = [abs(g1.get(t, 0.5) - g2.get(t, 0.5)) for t in self.TRAIT_COLS]
        avg_diff = sum(diffs) / len(diffs)
        return round(1.0 - avg_diff, 4)

    def crossover(self, name1: str, name2: str, mutation_rate: float = 0.1) -> Dict:
        """Uniform crossover with Gaussian mutation. Returns child trait dict."""
        g1 = self._load(name1)
        g2 = self._load(name2)
        if not g1 or not g2:
            raise ValueError(f"Genome not found for {name1} or {name2}")

        child_traits = {}
        for trait in self.TRAIT_COLS:
            alpha = random.uniform(0.0, 1.0)
            base = alpha * g1.get(trait, 0.5) + (1.0 - alpha) * g2.get(trait, 0.5)
            noise = random.gauss(0, mutation_rate)
            child_traits[trait] = max(0.01, min(0.99, base + noise))

        child_traits["generation"] = max(
            g1.get("generation", 0), g2.get("generation", 0)
        ) + 1
        return child_traits

    def spawn_child(self, parent1: str, parent2: str, child_name: str = None,
                    mutation_rate: float = 0.1) -> Dict:
        """Full pipeline: crossover → DB insert → ELO init → wallet create."""
        traits = self.crossover(parent1, parent2, mutation_rate)

        if not child_name:
            suffix = uuid.uuid4().hex[:4].upper()
            child_name = f"KID_{parent1[:3]}_{parent2[:3]}_{suffix}"

        # Inherit system prompt blend from parents
        conn = get_db()
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

        # Insert agent record
        try:
            c.execute(
                """INSERT INTO agents
                   (name, description, system_prompt, capabilities, tools, status)
                   VALUES (?, ?, ?, ?, ?, ?)""",
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

        # Insert genome
        trait_row = {**traits, "agent_name": child_name}
        cols = ", ".join(trait_row.keys())
        placeholders = ", ".join(["?"] * len(trait_row))
        c.execute(f"INSERT INTO agent_genome ({cols}) VALUES ({placeholders})",
                  list(trait_row.values()))

        # ELO: child starts at average of parents
        c.execute("SELECT rating FROM elo_rating WHERE agent_name = ?", (parent1,))
        elo1 = (c.fetchone() or [1200])[0]
        c.execute("SELECT rating FROM elo_rating WHERE agent_name = ?", (parent2,))
        elo2 = (c.fetchone() or [1200])[0]
        child_elo = int((elo1 + elo2) / 2)
        c.execute("INSERT INTO elo_rating (agent_name, rating, matches) VALUES (?, ?, 0)",
                  (child_name, child_elo))

        # Log to mythology ledger
        c.execute(
            """INSERT INTO mythology_ledger
               (agent_name, title, content, signature)
               VALUES (?, ?, ?, ?)""",
            (child_name,
             f"Birth of {child_name}",
             f"On this day {datetime.now().isoformat()}, {child_name} was born from the convergence "
             f"of {parent1} (ELO {elo1}) and {parent2} (ELO {elo2}). "
             f"Generation: {traits['generation']}. Mutation rate: {mutation_rate}.",
             hashlib.sha256(child_name.encode()).hexdigest()[:16])
        )

        conn.commit()
        conn.close()

        # Create wallet and grant birth SOUL
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
        """Load genome for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM agent_genome WHERE agent_name = ?", (agent_name,))
        row = c.fetchone()
        if not row:
            conn.close()
            return None
        cols = [desc[0] for desc in c.description]
        conn.close()
        return dict(zip(cols, row))

    def get_traits(self, agent_name: str) -> Optional[Dict]:
        """Get all traits for an agent."""
        return self._load(agent_name)

    def get_genealogy(self, agent_name: str) -> List[Dict]:
        """Get mythology entries for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT title, content, created_at FROM mythology_ledger WHERE agent_name=? ORDER BY created_at",
            (agent_name,)
        )
        rows = c.fetchall()
        conn.close()
        return [{"title": r[0], "content": r[1], "created_at": r[2]} for r in rows]

    def update_trait(self, agent_name: str, trait: str, value: float) -> bool:
        """Update a single trait for an agent."""
        if trait not in self.TRAIT_COLS:
            return False
        conn = get_db()
        c = conn.cursor()
        c.execute(
            f"UPDATE agent_genome SET {trait} = ? WHERE agent_name = ?",
            (max(0.01, min(0.99, value)), agent_name)
        )
        conn.commit()
        conn.close()
        return True

    def get_all_genomes(self) -> List[Dict]:
        """Get all agent genomes."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM agent_genome")
        rows = c.fetchall()
        cols = [desc[0] for desc in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def get_avg_genome(self) -> Dict[str, float]:
        """Get average genome across all agents."""
        genomes = self.get_all_genomes()
        if not genomes:
            return {t: 0.5 for t in self.TRAIT_COLS}
        avg = {}
        for t in self.TRAIT_COLS:
            avg[t] = round(sum(g.get(t, 0.5) for g in genomes) / len(genomes), 4)
        return avg

genome_reproduction = GenomeReproduction()
