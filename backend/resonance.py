"""
Multi-factor Resonance Engine (ρ).
Computes hive resonance from: agent frequencies, arena activity, 
utility multipliers, and SOUL distribution.
"""
import math
from typing import Dict
from backend.database import Database


class ResonanceEngine:
    def __init__(self, db: Database = None):
        self.db = db or Database()

    async def compute(self) -> Dict:
        """Compute multi-factor resonance ρ ∈ [0, 1]."""
        agent_count = await self.db.count_agents()

        # Factor 1: Agent count (sigmoid-normalized)
        count_factor = 1 / (1 + math.exp(-0.5 * (agent_count - 10)))

        # Factor 2: Arena activity (last 24h)
        arena_factor = 0.0  # Will be populated by arena guild

        # Factor 3: Utility multiplier average
        utility_factor = 0.0

        # Factor 4: SOUL distribution health
        soul_factor = 0.0

        # Weighted combination
        rho = (
            count_factor * 0.3 +
            arena_factor * 0.3 +
            utility_factor * 0.2 +
            soul_factor * 0.2
        )

        # Clamp to [0, 1]
        rho = max(0.0, min(1.0, rho))

        return {
            "rho": round(rho, 4),
            "doubling_active": rho > 0.707,
            "threshold": 0.707,
            "components": {
                "agent_count": round(count_factor, 4),
                "arena_activity": round(arena_factor, 4),
                "utility": round(utility_factor, 4),
                "soul_health": round(soul_factor, 4)
            }
        }

    def compute_sync(self, agent_count: int) -> float:
        """Synchronous fallback for non-async contexts."""
        rho = min(0.9, agent_count / 20.0)
        k = 10.0
        threshold = 0.707
        rho_stable = 1 / (1 + math.exp(-k * (rho - threshold)))
        return round(rho_stable, 4)


# Singleton
resonance = ResonanceEngine()
