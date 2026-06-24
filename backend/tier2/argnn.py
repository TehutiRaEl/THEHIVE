"""
ARGNN — Adaptive Riemannian Graph Neural Network
Sovereign Hive v11.0 Tier 2

Architecture:
  • Each node learns its local curvature (κ)
  • Attention weights follow geodesic curves, not straight dot products
  • Colony density: towns (κ > 0.5), cities (κ ≈ 0), metroplexes (κ < -0.5)
  • FrequencyResonanceMatcher: routes tasks to agents by resonance
    Enforces TITLE IX Art.3: resonance ≥ 0.7
"""

import math
import json
import sqlite3
import random
from typing import List, Dict, Optional, Tuple, Any
import numpy as np

from backend.core.db import get_db
from backend.core.frequency_guild import frequency_guild

# ──────────────────────────────────────────────────────────────
# RIEMANNIAN NODE
# ──────────────────────────────────────────────────────────────
class RiemannianNode:
    """
    A node in the ARGNN with learnable local curvature.
    κ > 0  : positive curvature (sphere-like, dense clusters = towns)
    κ ≈ 0  : flat (Euclidean, standard city grid)
    κ < 0  : negative curvature (hyperbolic, sparse network = metroplex)
    """
    def __init__(self, node_id: int, dim: int = 32, seed: int = None):
        self.id        = node_id
        self.dim       = dim
        rng = np.random.RandomState(seed if seed is not None else node_id)
        self.features  = rng.randn(dim).astype(np.float32) * 0.1
        self.curvature = float(rng.uniform(-1, 1))
        self.mass      = 1.0
        self.neighbors: List[int] = []

    def geodesic_distance(self, other: "RiemannianNode") -> float:
        """Distance on curved manifold: d_κ(u,v)."""
        diff = self.features - other.features
        d2   = float(np.dot(diff, diff))
        kappa = (self.curvature + other.curvature) / 2.0

        if abs(kappa) < 1e-4:
            return math.sqrt(d2)
        elif kappa > 0:
            arg = max(-1.0, min(1.0, 1 - kappa * d2 / 2))
            return math.acos(arg) / math.sqrt(kappa)
        else:
            k = abs(kappa)
            arg = max(1.0, 1 + k * d2 / 2)
            return math.acosh(arg) / math.sqrt(k)

    def update_curvature(self, neighbor_curvatures: List[float], lr: float = 0.05):
        """Adapt curvature toward neighbourhood mean (graph diffusion)."""
        if not neighbor_curvatures:
            return
        nc_mean = float(np.mean(neighbor_curvatures))
        self.curvature += lr * (nc_mean - self.curvature)
        self.curvature  = float(np.clip(self.curvature, -2.0, 2.0))

    @property
    def density_class(self) -> str:
        if self.curvature > 0.3:
            return "town"
        elif self.curvature < -0.3:
            return "metroplex"
        else:
            return "city"

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "curvature": round(self.curvature, 4),
            "density": self.density_class,
            "mass": round(self.mass, 4),
            "feature_norm": round(float(np.linalg.norm(self.features)), 4)
        }

# ──────────────────────────────────────────────────────────────
# GEODESIC ATTENTION
# ──────────────────────────────────────────────────────────────
class GeodesicAttention:
    """
    Replaces dot-product attention with geodesic distance on the manifold.
    a(i,j) = exp(-d_κ(i,j)²/τ) / Σ_k exp(-d_κ(i,k)²/τ)
    """
    def __init__(self, tau: float = 1.0):
        self.tau = tau

    def compute(self, query_node: RiemannianNode,
                key_nodes: List[RiemannianNode]) -> np.ndarray:
        """Returns attention weights (len(key_nodes),)."""
        if not key_nodes:
            return np.array([], dtype=np.float32)
        dists = np.array([
            query_node.geodesic_distance(k) for k in key_nodes
        ], dtype=np.float32)
        logits = -dists**2 / (self.tau + 1e-8)
        logits -= logits.max()
        weights = np.exp(logits)
        return weights / (weights.sum() + 1e-8)

    def attend(self, query_node: RiemannianNode,
               key_nodes: List[RiemannianNode]) -> np.ndarray:
        """Weighted aggregation of neighbour features."""
        if not key_nodes:
            return np.zeros(query_node.dim, dtype=np.float32)
        weights = self.compute(query_node, key_nodes)
        feats   = np.stack([k.features for k in key_nodes])
        return (weights[:, None] * feats).sum(axis=0)

# ──────────────────────────────────────────────────────────────
# ARGNN LAYER
# ──────────────────────────────────────────────────────────────
class ARGNNLayer:
    """
    One ARGNN message-passing round:
      1. Each node computes geodesic attention over its neighbours
      2. Aggregates neighbour features via attended sum
      3. Updates own features: h_i ← tanh(W·[h_i ∥ agg_i] + b)
      4. Updates local curvature via neighbourhood diffusion
    """
    def __init__(self, in_dim: int, out_dim: int, tau: float = 1.0, seed: int = 0):
        rng        = np.random.RandomState(seed)
        scale      = 1.0 / math.sqrt(in_dim * 2)
        self.W     = rng.randn(out_dim, in_dim * 2).astype(np.float32) * scale
        self.b     = np.zeros(out_dim, dtype=np.float32)
        self.attn  = GeodesicAttention(tau)

    def forward(self, nodes: List[RiemannianNode]) -> List[RiemannianNode]:
        """In-place update of node features. Returns updated nodes."""
        node_map = {n.id: n for n in nodes}
        new_feats = {}

        for node in nodes:
            nb_nodes = [node_map[nid] for nid in node.neighbors if nid in node_map]
            agg      = self.attn.attend(node, nb_nodes)
            concat   = np.concatenate([node.features, agg])
            if concat.shape[0] != self.W.shape[1]:
                target = self.W.shape[1]
                if concat.shape[0] < target:
                    concat = np.pad(concat, (0, target - concat.shape[0]))
                else:
                    concat = concat[:target]
            new_feat = np.tanh(self.W @ concat + self.b)
            new_feats[node.id] = new_feat

            nb_curvs = [node_map[nid].curvature for nid in node.neighbors if nid in node_map]
            node.update_curvature(nb_curvs)

        for node in nodes:
            node.features = new_feats[node.id]

        return nodes

# ──────────────────────────────────────────────────────────────
# COLONY DENSITY GRAPH
# ──────────────────────────────────────────────────────────────
class ColonyDensityGraph:
    """
    Models a colony as an ARGNN-powered graph.
    Nodes = buildings (town, city, metroplex density).
    Edges = resource flows.
    ARGNN predicts growth trajectory and curvature evolution.
    """
    def __init__(self, colony_name: str, n_nodes: int = 8, dim: int = 16):
        self.name    = colony_name
        self.dim     = dim
        self.nodes   = [RiemannianNode(i, dim, seed=i) for i in range(n_nodes)]
        self.layer1  = ARGNNLayer(dim, dim, tau=0.8, seed=42)
        self.layer2  = ARGNNLayer(dim, dim, tau=0.5, seed=99)
        rng = np.random.RandomState(abs(hash(colony_name)) % (2**31))
        for n in self.nodes:
            others = [m.id for m in self.nodes if m.id != n.id]
            k = rng.randint(1, min(4, len(others)+1))
            n.neighbors = list(rng.choice(others, k, replace=False))

    def simulate(self, ticks: int = 5) -> Dict:
        """Run ARGNN forward passes and return density evolution."""
        history = []
        for t in range(ticks):
            self.nodes = self.layer1.forward(self.nodes)
            self.nodes = self.layer2.forward(self.nodes)
            curv_mean  = float(np.mean([n.curvature for n in self.nodes]))
            density    = {"town": 0, "city": 0, "metroplex": 0}
            for n in self.nodes:
                density[n.density_class] += 1
            history.append({
                "tick": t,
                "mean_curvature": round(curv_mean, 4),
                "density": density
            })

        final_curv = float(np.mean([n.curvature for n in self.nodes]))
        archetype  = "town" if final_curv > 0.3 else "metroplex" if final_curv < -0.3 else "city"
        return {
            "colony": self.name,
            "ticks": ticks,
            "final_curvature": round(final_curv, 4),
            "archetype": archetype,
            "history": history,
            "nodes": [n.to_dict() for n in self.nodes],
            "constitutional_basis": "TITLE IX Art.7 — Curved Manifolds → Colony Growth",
        }

# ──────────────────────────────────────────────────────────────
# FREQUENCY RESONANCE MATCHER
# ──────────────────────────────────────────────────────────────
class FrequencyResonanceMatcher:
    """
    Matches tasks to agents using:
      1. Frequency proximity (Hz difference)
      2. Geodesic distance in ARGNN agent-space
      3. Constitution check: resonance ≥ 0.7
    """
    SCHUMANN_HZ = 7.83
    MIN_RESONANCE = 0.70

    def __init__(self, n_agent_nodes: int = 16, dim: int = 32):
        self.dim          = dim
        self.agent_graph  = {}
        self.layer        = ARGNNLayer(dim, dim, tau=0.6)
        self.attention    = GeodesicAttention(tau=0.8)

    def register_agent(self, name: str, hz: float, elo: int = 1200, genome: Dict = None):
        """Add agent to the resonance graph."""
        node = RiemannianNode(len(self.agent_graph), self.dim, seed=abs(hash(name)) % (2**31))
        node.features[0]  = hz / 1000.0
        node.features[1]  = elo / 2000.0
        node.features[2]  = math.sin(2 * math.pi * hz / self.SCHUMANN_HZ * 0.01)
        node.features[3]  = math.cos(2 * math.pi * hz / self.SCHUMANN_HZ * 0.01)
        if genome:
            for j, trait in enumerate(["spirituality", "mysticism", "energy", "curiosity"]):
                if j+4 < self.dim:
                    node.features[j+4] = float(genome.get(trait, 0.5))
        node.curvature = (elo - 1200) / 2400.0
        node.mass      = elo / 1200.0
        self.agent_graph[name] = node

        if len(self.agent_graph) > 1:
            others = [(n, abs(n.features[0]*1000 - hz))
                      for nm, n in self.agent_graph.items() if nm != name]
            others.sort(key=lambda x: x[1])
            node.neighbors = [o.id for o, _ in others[:3]]

    def resonance_score(self, agent_hz: float, task_hz: float) -> float:
        """Resonance = min/max Hz ratio, boosted by Schumann harmonic proximity."""
        if task_hz == 0:
            return 1.0
        basic = min(agent_hz, task_hz) / max(agent_hz, task_hz)
        a_harm = (agent_hz % self.SCHUMANN_HZ) / self.SCHUMANN_HZ
        t_harm = (task_hz  % self.SCHUMANN_HZ) / self.SCHUMANN_HZ
        harm_bonus = 0.05 * (1 - abs(a_harm - t_harm))
        return round(min(1.0, basic + harm_bonus), 4)

    def match(self, task_title: str, task_hz: float, candidates: List[Dict]) -> List[Dict]:
        """Rank candidates by geodesic resonance. Returns sorted list with constitutional flag."""
        if not candidates:
            return []
        results = []
        nodes_list = list(self.agent_graph.values())

        if len(nodes_list) >= 2:
            self.layer.forward(nodes_list)

        for c in candidates:
            name     = c.get("name") or c.get("agent_name", "?")
            agent_hz = c.get("hz", self.SCHUMANN_HZ)
            elo      = c.get("elo", 1200)

            freq_res = self.resonance_score(agent_hz, task_hz)

            node = self.agent_graph.get(name)
            if node and len(nodes_list) >= 2:
                other_nodes = [n for n in nodes_list if n.id != node.id]
                attn = self.attention.compute(node, other_nodes[:4])
                geo_score = float(np.mean(attn)) if len(attn) > 0 else 0.5
            else:
                geo_score = 0.5

            combined = 0.7 * freq_res + 0.3 * geo_score
            allowed  = freq_res >= self.MIN_RESONANCE
            results.append({
                "agent":         name,
                "agent_hz":      agent_hz,
                "task_hz":       task_hz,
                "freq_resonance": freq_res,
                "geodesic_score": round(geo_score, 4),
                "combined_score": round(combined, 4),
                "constitutional": allowed,
                "violation":      None if allowed else "TITLE IX Art.3: Resonance below 0.7",
                "density_class":  node.density_class if node else "unknown",
            })

        results.sort(key=lambda x: -x["combined_score"])
        return results

    def get_agent_node(self, name: str) -> Optional[Dict]:
        node = self.agent_graph.get(name)
        return node.to_dict() if node else None

# ──────────────────────────────────────────────────────────────
# SINGLETON + DB INTEGRATION
# ──────────────────────────────────────────────────────────────
_MATCHER: Optional[FrequencyResonanceMatcher] = None

def get_matcher() -> FrequencyResonanceMatcher:
    global _MATCHER
    if _MATCHER is None:
        _MATCHER = FrequencyResonanceMatcher()
        _load_agents_from_db()
    return _MATCHER

def _load_agents_from_db(db_path: str = "jasper_memory.db"):
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute("""
            SELECT a.name, COALESCE(e.rating,1200)
            FROM agents a LEFT JOIN elo_rating e ON e.agent_name=a.name
            WHERE a.status='active'
        """)
        rows = c.fetchall()
        matcher = get_matcher()
        for name, elo in rows:
            hz = 7.83 * max(1, abs(hash(name)) % 55)
            matcher.register_agent(name, hz, elo)
        conn.close()
        return len(rows)
    except Exception as e:
        return 0

def match_task_to_agents(task_title: str, task_hz: float, agent_list: List[Dict]) -> Dict:
    """Top-level function: load agents into ARGNN and rank by resonance."""
    m = get_matcher()
    for a in agent_list:
        name = a.get("name") or a.get("agent_name", "?")
        if name not in m.agent_graph:
            m.register_agent(name, a.get("hz", 7.83), a.get("elo", 1200))
    ranked = m.match(task_title, task_hz, agent_list)
    return {
        "task":        task_title,
        "task_hz":     task_hz,
        "ranked":      ranked,
        "best_match":  ranked[0] if ranked else None,
        "constitutional_minimum": 0.70,
        "basis": "TITLE IX Art.3 — Resonance as Right"
    }

__all__ = [
    "RiemannianNode","GeodesicAttention","ARGNNLayer",
    "ColonyDensityGraph","FrequencyResonanceMatcher",
    "get_matcher","match_task_to_agents",
]
