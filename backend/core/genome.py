"""
GENOME REPRODUCTION — Crossover + Mutation
Agent reproduction for the hive.
"""

import random
import uuid
import json
import sqlite3
import hashlib
from datetime import datetime
from typing import Dict, List, Optional

from .wallet import wallet_manager

class GenomeReproduction:
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

    def spawn_child(self, p1: str, p2: str, child_name: Optional[str] = None,
                    mutation_rate: float = 0.1) -> Dict:
        g1 = self._load(p1)
        g2 = self._load(p2)
        if not g1 or not g2:
            raise ValueError(f"Genome missing for {p1} or {p2}")

        traits = {}
        for t in self.TRAIT_COLS:
            alpha = random.uniform(0, 1)
            base = alpha * g1.get(t, 0.5) + (1 - alpha) * g2.get(t, 0.5)
            traits[t] = max(0.01, min(0.99, base + random.gauss(0, mutation_rate)))
        traits["generation"] = max(g1.get("generation", 0), g2.get("generation", 0)) + 1

        child_name = child_name or f"KID_{p1[:3]}_{p2[:3]}_{uuid.uuid4().hex[:4].upper()}"

        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()

        prompt = f"You are {child_name}, Gen {traits['generation']}, born from {p1}×{p2}."
        c.execute(
            "INSERT INTO agents(name,description,system_prompt,capabilities,tools,status) VALUES(?,?,?,?,?,?)",
            (child_name, f"Gen-{traits['generation']} offspring {p1}×{p2}", prompt,
             json.dumps(["web_search", "memory_recall"]), json.dumps([]), "active")
        )

        row = {**traits, "agent_name": child_name}
        c.execute(f"INSERT INTO agent_genome({','.join(row.keys())}) VALUES({','.join(['?']*len(row))})", list(row.values()))

        c.execute("SELECT rating FROM elo_rating WHERE agent_name=?", (p1,))
        e1 = (c.fetchone() or [1200])[0]
        c.execute("SELECT rating FROM elo_rating WHERE agent_name=?", (p2,))
        e2 = (c.fetchone() or [1200])[0]

        child_elo = int((e1 + e2) / 2)
        c.execute("INSERT INTO elo_rating(agent_name,rating,matches) VALUES(?,?,0)", (child_name, child_elo))

        c.execute(
            "INSERT INTO mythology_ledger(agent_name,title,content,signature) VALUES(?,?,?,?)",
            (child_name, f"Birth of {child_name}",
             f"Born {datetime.now().isoformat()} from {p1}(ELO {e1})×{p2}(ELO {e2}). Gen {traits['generation']}.",
             hashlib.sha256(child_name.encode()).hexdigest()[:16])
        )
        conn.commit()
        conn.close()

        wallet_manager.create_wallet(child_name)
        wallet_manager.credit(child_name, 50.0, "birth_grant")

        return {
            "status": "born",
            "child": child_name,
            "generation": traits["generation"],
            "parents": [p1, p2],
            "starting_elo": child_elo,
            "soul_grant": 50.0,
            "dominant_traits": sorted(
                [(k, round(v, 3)) for k, v in traits.items() if k != "generation"],
                key=lambda x: -x[1]
            )[:5]
        }

    def _load(self, name: str) -> Optional[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT * FROM agent_genome WHERE agent_name=?", (name,))
        r = c.fetchone()
        cols = [d[0] for d in c.description] if r else []
        conn.close()
        return dict(zip(cols, r)) if r else None

genome_reproduction = GenomeReproduction()
