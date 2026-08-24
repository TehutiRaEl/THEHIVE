# THEHIVE/bridge/evolve.py
# Wired learning log — strengthen/weaken strategies from outcomes

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class EvolutionEngine:
    """Learns from every bridge to improve future compress/inject choices."""

    def __init__(self, learnings_dir: Path | None = None):
        self.learnings_dir = learnings_dir or Path(__file__).resolve().parent / "learnings"
        self.learnings_dir.mkdir(parents=True, exist_ok=True)
        self.strategy_path = self.learnings_dir / "strategies.json"
        self.log_path = self.learnings_dir / "evolve_log.jsonl"
        self.strategies = self._load_strategies()

    def _load_strategies(self) -> dict[str, Any]:
        if self.strategy_path.exists():
            return json.loads(self.strategy_path.read_text(encoding="utf-8"))
        return {
            "compression": {"weight": 1.0, "successes": 0, "failures": 0},
            "injection": {"weight": 1.0, "successes": 0, "failures": 0},
            "platforms": {},
        }

    def _save_strategies(self) -> None:
        self.strategy_path.write_text(json.dumps(self.strategies, indent=2), encoding="utf-8")

    def learn(self, bridge: dict[str, Any], outcome: dict[str, Any] | Any) -> dict[str, Any]:
        if not isinstance(outcome, dict):
            outcome = {"success": bool(outcome)}
        success = bool(outcome.get("success", False))
        platform = (outcome.get("platform") or bridge.get("inject_target") or "generic").lower()

        if success:
            self.strengthen("compression")
            self.strengthen("injection")
            self._platform_bump(platform, True)
        else:
            self.weaken("compression")
            self.weaken("injection")
            self._platform_bump(platform, False)

        notes = {
            "optimize_compression": self.optimize_compression(bridge),
            "optimize_injection": self.optimize_injection(bridge),
        }
        self.store_learning(bridge, outcome, notes)
        self._save_strategies()
        return {"strategies": self.strategies, "notes": notes}

    def strengthen(self, strategy: str) -> None:
        s = self.strategies.setdefault(strategy, {"weight": 1.0, "successes": 0, "failures": 0})
        s["successes"] = int(s.get("successes", 0)) + 1
        s["weight"] = min(5.0, float(s.get("weight", 1.0)) + 0.1)

    def weaken(self, strategy: str) -> None:
        s = self.strategies.setdefault(strategy, {"weight": 1.0, "successes": 0, "failures": 0})
        s["failures"] = int(s.get("failures", 0)) + 1
        s["weight"] = max(0.1, float(s.get("weight", 1.0)) - 0.1)

    def _platform_bump(self, platform: str, success: bool) -> None:
        p = self.strategies.setdefault("platforms", {}).setdefault(
            platform, {"successes": 0, "failures": 0}
        )
        if success:
            p["successes"] += 1
        else:
            p["failures"] += 1

    def optimize_compression(self, bridge: dict[str, Any]) -> str:
        stats = (bridge.get("compressed") or {}).get("stats") or {}
        out_c = stats.get("approx_output_chars") or 0
        in_c = stats.get("approx_input_chars") or 1
        ratio = out_c / max(in_c, 1)
        if ratio > 0.5:
            return "prefer_tighter_essence_caps"
        return "compression_ok"

    def optimize_injection(self, bridge: dict[str, Any]) -> str:
        inj = bridge.get("injection") or {}
        if not inj.get("prompt_text"):
            return "ensure_prompt_text_always"
        return "injection_packet_ok"

    def store_learning(
        self, bridge: dict[str, Any], outcome: dict[str, Any], notes: dict[str, Any]
    ) -> None:
        rec = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "bridge_id": bridge.get("id"),
            "outcome": outcome,
            "notes": notes,
        }
        with self.log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec) + "\n")
