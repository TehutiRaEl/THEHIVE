"""
Pruning Criteria — Sovereign Hive
Defines what constitutes inadequate or unhealthy memory and executes pruning.
Pruned items are ARCHIVED (moved to pruned_memory), never destroyed.
F-004: All pruning decisions include a human-readable rationale.
"""

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from backend.core.db import get_db


@dataclass
class PruneDecision:
    item_id: str
    verdict: str        # "prune" | "retain"
    criteria_hit: str   # which criterion triggered
    rationale: str


class PruningCriteria:
    """
    Evaluates memory items against configurable retention rules.
    Default policy:
      - Age:       items older than retention_days (default 90) are pruned
      - Relevance: items with adoption_count < min_adoption (default 0 = never used)
      - Health:    items flagged by system or user
    """

    def __init__(
        self,
        retention_days: int = 90,
        min_adoption: int = 1,
    ):
        self.retention_days = retention_days
        self.min_adoption = min_adoption

    def evaluate(self, item: Dict[str, Any]) -> PruneDecision:
        """Evaluate a single memory item. Returns prune/retain decision with rationale."""
        item_id = str(item.get("id", "unknown"))

        # Health check: flagged items pruned immediately
        if item.get("flagged"):
            return PruneDecision(
                item_id=item_id,
                verdict="prune",
                criteria_hit="health",
                rationale=(
                    f"Memory item '{item_id}' is flagged as unhealthy. "
                    "Flagged content is moved to archive to maintain hive integrity."
                ),
            )

        # Age check
        created_at = item.get("created_at")
        if created_at:
            try:
                created = datetime.fromisoformat(str(created_at))
                age = datetime.now() - created
                if age > timedelta(days=self.retention_days):
                    return PruneDecision(
                        item_id=item_id,
                        verdict="prune",
                        criteria_hit="age",
                        rationale=(
                            f"Memory item '{item_id}' is {age.days} days old "
                            f"(retention threshold: {self.retention_days} days). "
                            "Archiving to maintain active memory freshness."
                        ),
                    )
            except (ValueError, TypeError):
                pass

        # Relevance check
        adoption = item.get("adoption_count", item.get("utilization_count", None))
        if adoption is not None and adoption < self.min_adoption:
            return PruneDecision(
                item_id=item_id,
                verdict="prune",
                criteria_hit="relevance",
                rationale=(
                    f"Memory item '{item_id}' has never been utilized "
                    f"(adoption_count={adoption}, minimum={self.min_adoption}). "
                    "Archiving unutilized content to reduce noise."
                ),
            )

        return PruneDecision(
            item_id=item_id,
            verdict="retain",
            criteria_hit="none",
            rationale=f"Memory item '{item_id}' meets all retention criteria.",
        )

    def execute_pruning(self, table: str = "episodic_memory") -> List[PruneDecision]:
        """
        Scan a memory table, evaluate each item, archive pruned ones.
        Returns list of PruneDecisions for audit.
        """
        conn = get_db()
        decisions: List[PruneDecision] = []

        try:
            rows = conn.execute(
                f"SELECT * FROM {table} ORDER BY created_at ASC LIMIT 1000"
            ).fetchall()
        except Exception:
            return decisions

        for row in rows:
            item = dict(row)
            decision = self.evaluate(item)
            decisions.append(decision)

            if decision.verdict == "prune":
                self._archive(conn, item, decision)

        conn.commit()
        return decisions

    def _archive(self, conn, item: Dict, decision: PruneDecision):
        """Move item to pruned_memory archive with rationale. Never deletes."""
        import json
        conn.execute(
            """INSERT OR IGNORE INTO pruned_memory
               (id, source_table, content, criteria_hit, rationale, archived_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                str(item.get("id", "")),
                "episodic_memory",
                json.dumps(item),
                decision.criteria_hit,
                decision.rationale,
                datetime.now().isoformat(),
            ),
        )

    def get_pruning_log(self, limit: int = 100) -> List[Dict]:
        conn = get_db()
        rows = conn.execute(
            "SELECT * FROM pruned_memory ORDER BY archived_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]


pruning_criteria = PruningCriteria()
