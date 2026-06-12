"""
Phase Manager — evaluates triggers and manages Phase 0→8 transitions.
All 12 guilds must be present (stubs acceptable).
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
from backend.database import Database


PHASES = {
    0: {"name": "Spore", "triggers": {"manual": True}},
    1: {"name": "Mycelium", "triggers": {"min_agents": 3, "min_violations": 10}},
    2: {"name": "Primordia", "triggers": {"spore_deployed": True, "min_rho": 0.5}},
    3: {"name": "Fruiting Body", "triggers": {"min_arena_resolutions": 3, "min_fps": 60}},
    4: {"name": "Spore Release", "triggers": {"enterprise_contract": True, "fiat_conversion": True}},
    5: {"name": "Network", "triggers": {"colonies_trading": 2}},
    6: {"name": "University", "triggers": {"min_users": 100, "badge_recognised": True}},
    7: {"name": "Dreaming", "triggers": {"dream_amendment": True, "astro_prediction": True}},
    8: {"name": "Infinite", "triggers": {"self_designing": True}}
}


class PhaseManager:
    """Manages hive phase transitions with trigger evaluation."""

    def __init__(self, db: Database = None):
        self.db = db or Database()
        self.current_phase = 0

    async def evaluate_triggers(self, state: Dict[str, Any]) -> Dict:
        """Evaluate if current phase can advance."""
        phase_info = PHASES.get(self.current_phase, {})
        triggers = phase_info.get("triggers", {})

        results = {}
        all_met = True

        for trigger, required in triggers.items():
            actual = state.get(trigger)
            met = self._check_trigger(trigger, required, actual)
            results[trigger] = {
                "required": required,
                "actual": actual,
                "met": met
            }
            if not met:
                all_met = False

        return {
            "phase": self.current_phase,
            "phase_name": phase_info.get("name", "Unknown"),
            "can_advance": all_met,
            "triggers": results,
            "next_phase": self.current_phase + 1 if all_met and self.current_phase < 8 else None
        }

    def _check_trigger(self, name: str, required: Any, actual: Any) -> bool:
        if isinstance(required, bool):
            return bool(actual) == required
        if isinstance(required, (int, float)):
            return (actual or 0) >= required
        return False

    async def advance(self, state: Dict[str, Any]) -> Dict:
        """Attempt to advance to next phase."""
        eval_result = await self.evaluate_triggers(state)

        if not eval_result["can_advance"]:
            return {
                "advanced": False,
                "reason": "Triggers not met",
                "evaluation": eval_result
            }

        next_phase = eval_result["next_phase"]
        if next_phase is None:
            return {
                "advanced": False,
                "reason": "Already at maximum phase (Infinite)",
                "evaluation": eval_result
            }

        self.current_phase = next_phase

        return {
            "advanced": True,
            "new_phase": next_phase,
            "phase_name": PHASES.get(next_phase, {}).get("name", "Unknown"),
            "evaluation": eval_result
        }

    def get_phase_info(self, phase: int = None) -> Dict:
        phase = phase or self.current_phase
        info = PHASES.get(phase, {})
        return {
            "phase": phase,
            "name": info.get("name", "Unknown"),
            "triggers": info.get("triggers", {}),
            "all_phases": list(PHASES.keys())
        }

    def list_all_phases(self) -> List[Dict]:
        return [
            {"phase": p, "name": info["name"], "triggers": info["triggers"]}
            for p, info in PHASES.items()
        ]


# Singleton
phase_manager = PhaseManager()
