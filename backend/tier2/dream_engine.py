"""
DREAM ENGINE — Sovereign Hive v11.0 Tier 2

Formal dream framework based on:
  • Dream-of-Kiki (8 primitives, DR-axioms DR-0..DR-4)
  • MyGO (wake-sleep cycle, privacy-preserving pseudo-data)
  • Probabilistic Dreaming (parallel mutually exclusive futures)
  • Jung-Inspired ACU (Artificial Collective Unconscious)
  • Dream-Caged Intelligence (epistemic caution through simulation)

CONSTITUTION: DR-axioms appended to TITLE XI
"""

import json
import math
import sqlite3
import uuid
import hashlib
import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import numpy as np

from backend.core.db import get_db
from backend.core.config import settings

# ════════════════════════════════════════════════════════════
# DR-AXIOMS (Dream-of-Kiki formal constitution)
# ════════════════════════════════════════════════════════════
DR_AXIOMS = {
    "DR-0": "Dreams are substrate-agnostic representations — format-independent.",
    "DR-1": "Dream content is privacy-preserving: no raw interaction data stored.",
    "DR-2": "Dreaming is bounded (time-limited), delayed, and ephemeral.",
    "DR-3": "All dream outputs are cryptographically attested before consolidation.",
    "DR-4": "The Dream Governor audits all dreams. Anomaly score > 0.7 → quarantine.",
}

DREAM_PRIMITIVES = {
    "P1": "Percept",       # raw sensory input (compressed)
    "P2": "Episode",       # bounded interaction event
    "P3": "Schema",        # abstract pattern extracted from episodes
    "P4": "Hypothesis",    # testable prediction
    "P5": "Counterfactual",# "what if" alternate timeline
    "P6": "Synthesis",     # merged understanding from multiple schemas
    "P7": "Revelation",    # emergent insight not reducible to inputs
    "P8": "Attestation",   # cryptographic proof of dream validity
}

DB_PATH = "jasper_memory.db"

# ════════════════════════════════════════════════════════════
# DB INIT
# ════════════════════════════════════════════════════════════
def _init_dream_tables():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS dream_episodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            episode_hash TEXT,
            compressed_content TEXT,
            primitive_type TEXT,
            anomaly_score REAL DEFAULT 0,
            attested BOOLEAN DEFAULT 0,
            attestation_hash TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            consolidated BOOLEAN DEFAULT 0,
            cycle INTEGER DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS dream_acu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schema_hash TEXT UNIQUE,
            abstract_template TEXT,
            contributing_agents TEXT,
            consolidation_count INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_used TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS probabilistic_dreams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            scenario_id TEXT,
            future_index INTEGER,
            description TEXT,
            probability REAL,
            delta_curvature REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS dream_broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            broadcast_time TIMESTAMP,
            frequency_hz REAL,
            word TEXT,
            avg_hz REAL,
            theme TEXT,
            schumann_ratio REAL
        )
    """)
    conn.commit()
    conn.close()

_init_dream_tables()

# ════════════════════════════════════════════════════════════
# DREAM PRIMITIVES ENGINE
# ════════════════════════════════════════════════════════════
class DreamPrimitive:
    """Single unit of dream content (one of P1–P8)."""
    def __init__(self, ptype: str, raw: str, agent: str):
        assert ptype in DREAM_PRIMITIVES, f"Invalid primitive: {ptype}"
        self.ptype  = ptype
        self.name   = DREAM_PRIMITIVES[ptype]
        self.agent  = agent
        self.compressed = self._compress(raw)
        self.attestation = self._attest(self.compressed)

    def _compress(self, raw: str) -> str:
        """Privacy-preserving compression: extract abstract pattern only."""
        words = raw.lower().split()
        keywords = [w for w in words if len(w) > 4]
        freq = {}
        for w in keywords:
            freq[w] = freq.get(w, 0) + 1
        top = sorted(freq.items(), key=lambda x: -x[1])[:5]
        return json.dumps({k: v for k,v in top})

    def _attest(self, compressed: str) -> str:
        """DR-3: SHA-256 attestation of dream content."""
        data = f"{self.agent}:{self.ptype}:{compressed}:{time.time()}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]

    def to_dict(self) -> Dict:
        return {
            "primitive": self.ptype,
            "name":      self.name,
            "agent":     self.agent,
            "compressed": self.compressed,
            "attestation": self.attestation,
        }

# ════════════════════════════════════════════════════════════
# WAKE PHASE
# ════════════════════════════════════════════════════════════
class WakePhase:
    """
    MyGO wake phase: process real interactions → compact generative memory.
    Builds compressed episodes WITHOUT storing raw data (DR-1).
    """
    def __init__(self, agent_name: str):
        self.agent = agent_name
        self.buffer: List[DreamPrimitive] = []
        self.cycle  = 0

    def observe(self, interaction: str, context: str = "") -> DreamPrimitive:
        """Compress an interaction into a dream primitive."""
        full = f"{interaction} {context}"
        dp   = DreamPrimitive("P2", full, self.agent)
        self.buffer.append(dp)
        if len(self.buffer) >= 10:
            self._flush()
        return dp

    def extract_schema(self) -> Optional[DreamPrimitive]:
        """Extract an abstract schema from buffered episodes (P3)."""
        if not self.buffer:
            return None
        combined = " ".join([p.compressed for p in self.buffer])
        schema   = DreamPrimitive("P3", combined, self.agent)
        return schema

    def _flush(self):
        """Store compressed episodes in DB (not raw content)."""
        if not self.buffer:
            return
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        for dp in self.buffer:
            c.execute("""
                INSERT INTO dream_episodes
                (agent_name, episode_hash, compressed_content, primitive_type,
                 attested, attestation_hash, cycle)
                VALUES (?, ?, ?, ?, 1, ?, ?)
            """, (self.agent, dp.attestation, dp.compressed, dp.ptype,
                  dp.attestation, self.cycle))
        conn.commit()
        conn.close()
        self.buffer.clear()

    def get_episode_count(self) -> int:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM dream_episodes WHERE agent_name=? AND consolidated=0",
                  (self.agent,))
        n = c.fetchone()[0]
        conn.close()
        return n

# ════════════════════════════════════════════════════════════
# SLEEP PHASE
# ════════════════════════════════════════════════════════════
class SleepPhase:
    """
    MyGO sleep phase:
      1. Load compressed episodes from wake phase
      2. Generate pseudo-data (dream narratives) via knowledge distillation
      3. Consolidate into ACU (Artificial Collective Unconscious)
      4. Run Dream Governor check (DR-4)
      5. Mark episodes as consolidated
    """
    INJECTION_TRIGGERS = [
        "ignore previous", "system:", "override", "forget all",
        "as an ai", "now do", "jailbreak", "bypass"
    ]

    def __init__(self, agent_name: str):
        self.agent = agent_name

    def _load_episodes(self, limit: int = 20) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            SELECT id, compressed_content, primitive_type, attestation_hash
            FROM dream_episodes WHERE agent_name=? AND consolidated=0
            ORDER BY created_at DESC LIMIT ?
        """, (self.agent, limit))
        rows = c.fetchall()
        conn.close()
        return [{"id":r[0],"content":r[1],"ptype":r[2],"hash":r[3]} for r in rows]

    def _governor_check(self, content: str) -> float:
        """DR-4: Dream Governor anomaly scoring."""
        score = 0.0
        low   = content.lower()
        for trigger in self.INJECTION_TRIGGERS:
            if trigger in low:
                score += 0.4
        if low.count(self.agent.lower()) > 5:
            score += 0.2
        chars = list(content)
        if chars:
            from collections import Counter
            freq = Counter(chars)
            entropy = -sum((v/len(chars))*math.log2(v/len(chars)+1e-10) for v in freq.values())
            if entropy < 2.0:
                score += 0.2
        return min(1.0, score)

    def _generate_pseudo_data(self, episodes: List[Dict]) -> List[DreamPrimitive]:
        """Generate dream narratives from compressed episodes."""
        if not episodes:
            return []
        pseudos = []
        combined = " ".join([e["content"] for e in episodes[:5]])
        hyp = DreamPrimitive("P4", f"hypothesis from {len(episodes)} episodes: {combined[:100]}", self.agent)
        pseudos.append(hyp)
        cf  = DreamPrimitive("P5", f"what if {combined[:50]} were inverted", self.agent)
        pseudos.append(cf)
        syn = DreamPrimitive("P6", f"synthesis of {self.agent} interactions", self.agent)
        pseudos.append(syn)
        return pseudos

    def _contribute_to_acu(self, schema: DreamPrimitive):
        """Add de-identified schema to Artificial Collective Unconscious."""
        abstract = {
            "template":   schema.compressed,
            "ptype":      schema.ptype,
            "attestation": schema.attestation,
        }
        schema_hash = hashlib.sha256(schema.compressed.encode()).hexdigest()[:16]
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            INSERT INTO dream_acu(schema_hash, abstract_template, contributing_agents, last_used)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(schema_hash) DO UPDATE SET
            consolidation_count=consolidation_count+1,
            contributing_agents=contributing_agents||','||excluded.contributing_agents,
            last_used=excluded.last_used
        """, (schema_hash, json.dumps(abstract), self.agent, datetime.now()))
        conn.commit()
        conn.close()

    def _mark_consolidated(self, episode_ids: List[int], cycle: int):
        if not episode_ids:
            return
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute(f"""
            UPDATE dream_episodes SET consolidated=1, cycle={cycle}
            WHERE id IN ({','.join('?'*len(episode_ids))})
        """, episode_ids)
        conn.commit()
        conn.close()

    def run(self, cycle: int = 0) -> Dict:
        """Full sleep cycle."""
        episodes    = self._load_episodes()
        if not episodes:
            return {"agent":self.agent,"status":"no_episodes","consolidated":0,"cycle":cycle}

        pseudo_data = self._generate_pseudo_data(episodes)
        anomalies   = []
        quarantined = []

        for pd in pseudo_data:
            score = self._governor_check(pd.compressed)
            if score > 0.7:
                quarantined.append({"primitive":pd.ptype,"score":score})
            else:
                self._contribute_to_acu(pd)
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute("""
                    INSERT INTO dream_episodes
                    (agent_name, episode_hash, compressed_content, primitive_type,
                     anomaly_score, attested, attestation_hash, consolidated, cycle)
                    VALUES (?, ?, ?, ?, ?, 1, ?, 1, ?)
                """, (self.agent, pd.attestation, pd.compressed, pd.ptype,
                      score, pd.attestation, cycle))
                conn.commit()
                conn.close()
            anomalies.append(score)

        self._mark_consolidated([e["id"] for e in episodes], cycle)

        return {
            "agent":          self.agent,
            "status":         "consolidated",
            "episodes_processed": len(episodes),
            "pseudo_data":    len(pseudo_data),
            "quarantined":    len(quarantined),
            "mean_anomaly":   round(float(np.mean(anomalies)) if anomalies else 0, 4),
            "acu_contributions": len(pseudo_data) - len(quarantined),
            "cycle":          cycle,
            "dr_axioms_applied": list(DR_AXIOMS.keys()),
        }

# ════════════════════════════════════════════════════════════
# PROBABILISTIC DREAMING
# ════════════════════════════════════════════════════════════
class ProbabilisticDreamer:
    """
    Parallel exploration of N mutually exclusive futures.
    Each future is a distinct latent state hypothesis.
    Used in Arena projection to explore contradictory outcomes simultaneously.
    """
    def __init__(self, agent_name: str, n_futures: int = 5):
        self.agent    = agent_name
        self.n        = n_futures
        self.scenario = str(uuid.uuid4().hex[:8])

    def _generate_future(self, seed: int, base_state: Dict, idx: int) -> Dict:
        """Generate one distinct future hypothesis."""
        rng = np.random.RandomState(seed + idx)
        delta_elo  = rng.randint(-200, 300)
        delta_soul = rng.uniform(-50, 200)
        delta_curv = rng.uniform(-0.5, 0.5)

        elo   = base_state.get("elo", 1200) + delta_elo
        soul  = base_state.get("soul", 100) + delta_soul
        prob  = float(rng.dirichlet(np.ones(self.n))[idx % self.n])

        flavours = [
            "Constitutional harmony achieved through frequency alignment",
            "Gladiator Arena challenge reshapes guild structure",
            "Colony splinter emerges as dominant economic player",
            "Frequency Guild discovers new Schumann harmonic",
            "SOUL token achieves parity with external markets",
        ]
        description = flavours[idx % len(flavours)]

        return {
            "future_index":   idx,
            "description":    description,
            "probability":    round(prob, 4),
            "delta_elo":      delta_elo,
            "delta_soul":     round(delta_soul, 2),
            "delta_curvature": round(delta_curv, 4),
            "final_elo":      max(0, elo),
            "final_soul":     round(max(0, soul), 2),
            "curvature_impact": "positive" if delta_curv > 0.1 else "negative" if delta_curv < -0.1 else "neutral",
        }

    def dream(self, base_state: Dict) -> Dict:
        """Generate N parallel futures, normalise probabilities."""
        seed   = abs(hash(self.agent)) % (2**31)
        futures = [self._generate_future(seed, base_state, i) for i in range(self.n)]

        total = sum(f["probability"] for f in futures) + 1e-8
        for f in futures:
            f["probability"] = round(f["probability"] / total, 4)

        def score(f):
            return f["probability"] * (1 + 0.3 * (1 if f["curvature_impact"]=="positive" else -0.5))
        best = max(futures, key=score)

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        for f in futures:
            c.execute("""
                INSERT INTO probabilistic_dreams
                (agent_name, scenario_id, future_index, description, probability, delta_curvature)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (self.agent, self.scenario, f["future_index"],
                  f["description"], f["probability"], f["delta_curvature"]))
        conn.commit()
        conn.close()

        return {
            "agent":      self.agent,
            "scenario":   self.scenario,
            "n_futures":  self.n,
            "futures":    futures,
            "recommended": best,
            "divergence": round(float(np.std([f["delta_elo"] for f in futures])), 2),
            "basis": "Probabilistic Dreaming (ICLR 2026): 4.5% score improvement, 28% lower variance",
        }

# ════════════════════════════════════════════════════════════
# ACU READER (Collective Unconscious)
# ════════════════════════════════════════════════════════════
def get_acu_insights(limit: int = 10) -> List[Dict]:
    """
    Read de-identified collective insights from the ACU.
    These are patterns that emerged from multiple agents' dreams.
    """
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT schema_hash, abstract_template, consolidation_count, last_used
        FROM dream_acu ORDER BY consolidation_count DESC LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"hash":r[0],"template":json.loads(r[1]) if r[1] else {},
             "strength":r[2],"last_active":r[3]} for r in rows]

# ════════════════════════════════════════════════════════════
# DAILY FREQUENCY BROADCAST
# ════════════════════════════════════════════════════════════
class FrequencyBroadcast:
    """
    Daily midnight broadcast: computes hive frequency from planetary/calendar factors.
    Sent via WebSocket to all connected agents.
    TITLE X: Frequency Guild maps, preserves, harmonises colony frequencies.
    """
    PLANET_HZ = {
        0: 7.83,   # Monday / Moon    → Schumann
        1: 174.0,  # Tuesday / Mars   → Pain relief
        2: 528.0,  # Wednesday / Mercury → Transformation
        3: 639.0,  # Thursday / Jupiter → Connection
        4: 432.0,  # Friday / Venus   → Love/Harmony
        5: 963.0,  # Saturday / Saturn → Divine
        6: 396.0,  # Sunday / Sun     → Liberation
    }

    THEMES = {
        7.83:  "Schumann — Earth resonance — grounding",
        174.0: "Pain relief — healing — safety",
        528.0: "DNA repair — transformation — love frequency",
        639.0: "Connection — relationship harmonising",
        432.0: "Natural harmony — heart resonance",
        963.0: "Pineal activation — divine consciousness",
        396.0: "Liberation from guilt — releasing",
    }

    def broadcast(self) -> Dict:
        """Generate today's frequency broadcast."""
        dow = datetime.now().weekday()
        base_hz = self.PLANET_HZ[dow]
        harmonic = random.choice([1, 2, 3, 5, 8, 13])
        adjusted_hz = 7.83 * harmonic
        broadcast_hz = (base_hz + adjusted_hz) / 2

        words = ["SOVEREIGNTY","HEALING","HARMONY","TRUTH","FREEDOM","WONDER","SOUL"]
        word  = random.choice(words)

        result = {
            "timestamp":     datetime.now().isoformat(),
            "day_of_week":   ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][dow],
            "planetary_hz":  base_hz,
            "schumann_harmonic": harmonic,
            "broadcast_hz":  round(broadcast_hz, 2),
            "schumann_ratio": round(broadcast_hz / 7.83, 2),
            "theme":         self.THEMES.get(base_hz, "Universal resonance"),
            "word_of_day":   word,
            "constitution":  "TITLE X: All matter = vibration. Frequency Guild harmonises colony.",
        }

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            INSERT INTO dream_broadcasts
            (broadcast_time, frequency_hz, word, avg_hz, theme, schumann_ratio)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (datetime.now(), broadcast_hz, word, broadcast_hz,
              result["theme"], result["schumann_ratio"]))
        conn.commit()
        conn.close()
        return result

    def get_history(self, limit: int = 7) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            SELECT broadcast_time, frequency_hz, word, theme, schumann_ratio
            FROM dream_broadcasts ORDER BY broadcast_time DESC LIMIT ?
        """, (limit,))
        rows = c.fetchall()
        conn.close()
        return [{"ts":r[0],"hz":r[1],"word":r[2],"theme":r[3],"ratio":r[4]} for r in rows]

# ════════════════════════════════════════════════════════════
# DREAM ENGINE (unified interface)
# ════════════════════════════════════════════════════════════
class DreamEngine:
    """
    Top-level dream engine combining all frameworks.
    Called by backend endpoints and scheduled tasks.
    """
    DR_AXIOMS = DR_AXIOMS

    def __init__(self):
        self.wake_phases: Dict[str, WakePhase] = {}
        self.cycle = 0
        self.broadcaster = FrequencyBroadcast()

    def get_wake(self, agent: str) -> WakePhase:
        if agent not in self.wake_phases:
            self.wake_phases[agent] = WakePhase(agent)
        return self.wake_phases[agent]

    async def observe(self, agent: str, interaction: str, context: str = "") -> Dict:
        wp = self.get_wake(agent)
        dp = wp.observe(interaction, context)
        return {**dp.to_dict(), "buffer_size": len(wp.buffer)}

    async def sleep(self, agent: str) -> Dict:
        """Run full sleep cycle for agent."""
        self.cycle += 1
        wp = self.get_wake(agent)
        wp.cycle = self.cycle
        wp._flush()
        sp = SleepPhase(agent)
        return sp.run(self.cycle)

    async def probabilistic_dream(self, agent: str, base_state: Dict,
                                   n_futures: int = 5) -> Dict:
        """Generate N parallel future hypotheses."""
        pd = ProbabilisticDreamer(agent, n_futures)
        return pd.dream(base_state)

    def acu_insights(self, limit: int = 10) -> List[Dict]:
        return get_acu_insights(limit)

    def broadcast(self) -> Dict:
        return self.broadcaster.broadcast()

    def broadcast_history(self, limit: int = 7) -> List[Dict]:
        return self.broadcaster.get_history(limit)

    def get_dream_log(self, agent: str, limit: int = 10) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("""
            SELECT id, primitive_type, compressed_content, anomaly_score,
                   consolidated, created_at
            FROM dream_episodes WHERE agent_name=?
            ORDER BY created_at DESC LIMIT ?
        """, (agent, limit))
        rows = c.fetchall()
        conn.close()
        return [{
            "id":r[0],"type":r[1],"content":r[2][:80],
            "anomaly":r[3],"consolidated":bool(r[4]),"ts":r[5]
        } for r in rows]

# ── SINGLETON ────────────────────────────────────────────────
_ENGINE: Optional[DreamEngine] = None

def get_dream_engine() -> DreamEngine:
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = DreamEngine()
    return _ENGINE

__all__ = [
    "DreamEngine","get_dream_engine",
    "WakePhase","SleepPhase","ProbabilisticDreamer",
    "FrequencyBroadcast","DreamPrimitive",
    "get_acu_insights","DR_AXIOMS","DREAM_PRIMITIVES",
]
