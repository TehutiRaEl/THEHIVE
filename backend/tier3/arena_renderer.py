"""
ARENA RENDERER — Sovereign Hive v11.0 Tier 3
3D Voxel Projection Engine for Gladiator Arena challenges

Each arena challenge produces a 3D simulation:
  • Colony voxel grid: (X=16, Y=16, Z=8) → resource_density per cell
  • Simulation driven by ARGNN-inspired growth rules
  • Delta compression: only changed voxels transmitted per frame
  • WebSocket stream compatible with Three.js VoxelRenderer

Output format per frame:
  {frame, challenger_voxels, challenged_voxels, delta, metric}

Three.js integration: see arena_renderer_frontend.js snippet at bottom.
"""

import math
import json
import time
import uuid
import sqlite3
import hashlib
from typing import List, Dict, Tuple, Optional
import numpy as np

DB_PATH = "jasper_memory.db"

# ════════════════════════════════════════════════════════════
# COLONY STATE TENSOR
# ════════════════════════════════════════════════════════════
class ColonyState:
    """
    3D voxel grid representing a colony's state.
    Shape: (X, Y, Z, C) where C = [resource, buildings, agents, frequency]
    """
    X, Y, Z = 16, 16, 8
    CHANNELS = {"resource":0, "buildings":1, "agents":2, "frequency":3}

    def __init__(self, name: str, seed: int):
        self.name = name
        rng = np.random.RandomState(seed)
        self.grid = np.zeros((self.X, self.Y, self.Z, 4), dtype=np.float32)
        self.grid[..., 0] = rng.exponential(0.3, (self.X, self.Y, self.Z))
        n_build = rng.randint(3, 8)
        for _ in range(n_build):
            x,y,z = rng.randint(0,self.X), rng.randint(0,self.Y), rng.randint(0,self.Z)
            self.grid[x,y,z,1] = rng.uniform(0.5, 1.0)
        self.grid[..., 3] = 7.83 / 1000.0
        self.wealth  = float(self.grid[...,0].sum())
        self.history: List[float] = [self.wealth]

    def step(self, agent_hz: float = 432.0, elo_factor: float = 1.0):
        """One simulation tick: resource growth + agent movement."""
        rng = np.random.RandomState(int(time.time() * 1000) % (2**31))
        hz_norm  = agent_hz / 1000.0
        schumann = 7.83 / 1000.0
        harmony  = abs(math.sin(math.pi * hz_norm / schumann))
        growth   = np.random.normal(1 + 0.02 * harmony * elo_factor,
                                     0.005, (self.X, self.Y, self.Z))
        self.grid[..., 0] = np.clip(self.grid[..., 0] * growth, 0, 5.0)
        build_mask = self.grid[..., 1] > 0.1
        self.grid[build_mask, 0] *= 0.98
        self.grid[build_mask, 1] = np.clip(
            self.grid[build_mask, 1] + 0.005 * elo_factor, 0, 1.0)
        if rng.random() < 0.3:
            x,y,z = rng.randint(0,self.X), rng.randint(0,self.Y), rng.randint(0,self.Z)
            self.grid[x,y,z,2] = min(1.0, self.grid[x,y,z,2] + rng.uniform(0,0.1))
        self.grid[..., 3] = np.clip(
            schumann + hz_norm * 0.01 * harmony, 0, 1.0)
        self.wealth = float(self.grid[..., 0].sum())
        self.history.append(self.wealth)

    def to_voxels(self, threshold: float = 0.05) -> List[Dict]:
        """Export non-empty voxels as list of {x,y,z,r,g,b,a,channel}."""
        voxels = []
        for x in range(self.X):
            for y in range(self.Y):
                for z in range(self.Z):
                    cell = self.grid[x,y,z]
                    density = float(cell.max())
                    if density < threshold: continue
                    dominant = int(np.argmax(cell))
                    colors = [(0.1,0.8,0.1), (0.1,0.4,0.9), (0.0,0.9,0.9), (1.0,0.8,0.0)]
                    r,g,b = colors[dominant]
                    voxels.append({
                        "x":x,"y":y,"z":z,
                        "r":round(r,2),"g":round(g,2),"b":round(b,2),
                        "a":round(min(density,1.0),3),
                        "ch":dominant,
                    })
        return voxels

    def delta(self, prev_voxels: List[Dict]) -> Dict:
        """Compute voxel delta vs previous frame for efficient streaming."""
        curr = {(v["x"],v["y"],v["z"]): v for v in self.to_voxels()}
        prev = {(v["x"],v["y"],v["z"]): v for v in prev_voxels}
        added   = [v for k,v in curr.items() if k not in prev]
        removed = [v for k,v in prev.items() if k not in curr]
        changed = [v for k,v in curr.items()
                   if k in prev and abs(v["a"]-prev[k]["a"]) > 0.02]
        return {"added":added, "removed":removed, "changed":changed,
                "total_voxels":len(curr), "wealth":round(self.wealth,2)}

# ════════════════════════════════════════════════════════════
# ARENA PROJECTION ENGINE
# ════════════════════════════════════════════════════════════
class ArenaProjectionEngine:
    """
    Runs dual-colony simulation for an arena challenge.
    Each agent's idea maps to initial colony parameters.
    Simulation runs for N ticks; winner = highest final wealth.
    Streams compressed frames via callback for WebSocket.
    """
    DEFAULT_TICKS = 30
    DB_PATH = "jasper_memory.db"

    def __init__(self):
        self._init_table()

    def _init_table(self):
        conn = sqlite3.connect(self.DB_PATH); c = conn.cursor()
        c.execute("""CREATE TABLE IF NOT EXISTS arena_projections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER, tick INTEGER,
            challenger_wealth REAL, challenged_wealth REAL,
            frame_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
        conn.commit(); conn.close()

    def _params_from_agent(self, agent_name: str, elo: int,
                            agent_hz: float) -> Dict:
        """Map agent properties to colony simulation parameters."""
        return {
            "seed":       abs(hash(agent_name)) % (2**31),
            "agent_hz":   agent_hz,
            "elo_factor": elo / 1200.0,
        }

    async def run(self, challenge_id: int,
                  challenger: str, challenged: str,
                  challenger_elo: int = 1200, challenged_elo: int = 1200,
                  challenger_hz: float = 432.0, challenged_hz: float = 528.0,
                  ticks: int = self.DEFAULT_TICKS,
                  frame_callback = None) -> Dict:
        """
        Full projection run.
        frame_callback: async fn(frame_dict) called per tick for WebSocket streaming.
        """
        cp = self._params_from_agent(challenger, challenger_elo, challenger_hz)
        dp = self._params_from_agent(challenged, challenged_elo, challenged_hz)

        state_a = ColonyState(challenger, cp["seed"])
        state_b = ColonyState(challenged, dp["seed"])

        prev_a, prev_b = [], []
        frame_log = []

        conn = sqlite3.connect(self.DB_PATH); c = conn.cursor()

        for tick in range(ticks):
            state_a.step(cp["agent_hz"], cp["elo_factor"])
            state_b.step(dp["agent_hz"], dp["elo_factor"])

            voxels_a = state_a.to_voxels()
            voxels_b = state_b.to_voxels()
            delta_a  = state_a.delta(prev_a)
            delta_b  = state_b.delta(prev_b)

            diff_voxels = []
            set_a = {(v["x"],v["y"],v["z"]): v["a"] for v in voxels_a}
            set_b = {(v["x"],v["y"],v["z"]): v["a"] for v in voxels_b}
            all_keys = set(set_a.keys()) | set(set_b.keys())
            for k in list(all_keys)[:200]:
                da = set_a.get(k, 0); db = set_b.get(k, 0)
                if abs(da-db) > 0.05:
                    diff_voxels.append({
                        "x":k[0],"y":k[1],"z":k[2],
                        "advantage": "challenger" if da>db else "challenged",
                        "delta": round(da-db, 3),
                    })

            total = state_a.wealth + state_b.wealth + 1e-8
            metric = {
                "tick":              tick,
                "challenger_wealth": round(state_a.wealth, 2),
                "challenged_wealth": round(state_b.wealth, 2),
                "total_wealth":      round(total, 2),
                "challenger_share":  round(state_a.wealth/total, 4),
                "challenged_share":  round(state_b.wealth/total, 4),
                "leading":           challenger if state_a.wealth > state_b.wealth else challenged,
            }

            frame = {
                "challenge_id":   challenge_id,
                "tick":           tick,
                "total_ticks":    ticks,
                "challenger":     challenger,
                "challenged":     challenged,
                "challenger_delta": {"added": delta_a["added"][:20],
                                      "changed": delta_a["changed"][:20]},
                "challenged_delta": {"added": delta_b["added"][:20],
                                      "changed": delta_b["changed"][:20]},
                "diff_voxels":    diff_voxels[:50],
                "metric":         metric,
                "challenger_hz":  cp["agent_hz"],
                "challenged_hz":  dp["agent_hz"],
            }
            frame_log.append(metric)
            prev_a, prev_b = voxels_a, voxels_b

            if tick % 5 == 0:
                c.execute("""INSERT INTO arena_projections
                    (challenge_id,tick,challenger_wealth,challenged_wealth,frame_data)
                    VALUES(?,?,?,?,?)""",
                    (challenge_id, tick, state_a.wealth, state_b.wealth,
                     json.dumps(metric)))

            if frame_callback:
                try: await frame_callback(frame)
                except: pass

        conn.commit(); conn.close()

        winner  = challenger if state_a.wealth > state_b.wealth else challenged
        loser   = challenged if winner == challenger else challenger
        final_a, final_b = state_a.wealth, state_b.wealth

        trajectory = {
            "challenger": [round(h,1) for h in state_a.history[::3]],
            "challenged": [round(h,1) for h in state_b.history[::3]],
        }

        return {
            "challenge_id":    challenge_id,
            "winner":          winner,
            "loser":           loser,
            "challenger_final_wealth": round(final_a, 2),
            "challenged_final_wealth": round(final_b, 2),
            "ticks_run":       ticks,
            "challenger_hz":   cp["agent_hz"],
            "challenged_hz":   dp["agent_hz"],
            "trajectory":      trajectory,
            "frame_log":       frame_log[::5],
            "verdict":         f"{winner} prevails with {max(final_a,final_b):.1f} vs {min(final_a,final_b):.1f} colony wealth",
            "renderer":        "ArenaProjectionEngine v1 (voxel simulation)",
        }

    def get_projection_history(self, challenge_id: int) -> List[Dict]:
        conn = sqlite3.connect(self.DB_PATH); c = conn.cursor()
        c.execute("""SELECT tick,challenger_wealth,challenged_wealth
                     FROM arena_projections WHERE challenge_id=?
                     ORDER BY tick""", (challenge_id,))
        rows = c.fetchall(); conn.close()
        return [{"tick":r[0],"ch_a":r[1],"ch_b":r[2]} for r in rows]

# ════════════════════════════════════════════════════════════
# FRAME COMPRESSOR  (efficient WebSocket payload)
# ════════════════════════════════════════════════════════════
class FrameCompressor:
    """Compress arena frames for efficient WebSocket transmission."""
    MAX_VOXELS_PER_FRAME = 60

    def compress(self, frame: Dict) -> bytes:
        """Pack frame to compact JSON bytes."""
        compact = {
            "t": frame["tick"],
            "m": frame["metric"],
            "da": frame.get("challenger_delta",{}).get("added",[])[:self.MAX_VOXELS_PER_FRAME//2],
            "db": frame.get("challenged_delta",{}).get("added",[])[:self.MAX_VOXELS_PER_FRAME//2],
            "dv": frame.get("diff_voxels",[])[:30],
        }
        return json.dumps(compact, separators=(",",":")).encode()

    def decompress(self, data: bytes) -> Dict:
        return json.loads(data)

engine     = ArenaProjectionEngine()
compressor = FrameCompressor()

__all__ = [
    "ColonyState","ArenaProjectionEngine","FrameCompressor",
    "engine","compressor",
]
