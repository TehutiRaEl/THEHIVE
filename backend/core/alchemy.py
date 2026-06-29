"""
Alchemy / Transmutation — Sovereign Hive
Transforms grief (failure, loss, negative experience) into wisdom
through the recursive reflection cycle.
Process: Capture → Evaluate vs Ma'at → Prune → Dissect → Return Lesson → Propagate
"""

import asyncio
import hashlib
import time
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from backend.core.db import get_db
from backend.core.protocol import hive_protocol, LESSON_DISSECTED, WISDOM_DISTILLED


# Signals that indicate grief in a memory item
_GRIEF_SIGNALS = {
    "failure", "error", "loss", "broken", "rejected", "denied",
    "conflict", "fracture", "abandoned", "failed",
}

# Ma'at evaluation dimensions
_MAAT_DIMENSIONS = {
    "truth":   lambda item: not item.get("contradicted", False),
    "balance": lambda item: item.get("resolution") is not None,
    "order":   lambda item: item.get("actor") is not None,
}


@dataclass
class WisdomEntry:
    id: str
    lesson: str
    source_id: str
    confidence: float       # 0.0 – 1.0
    cycle_depth: int        # how many reflection passes
    grief_type: str
    created_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TransmutationRecord:
    """Maps wisdom_ledger row fields to a typed record."""
    id: str
    input_grief: str      # grief_type
    output_wisdom: str    # lesson
    depth: int            # cycle_depth
    maat_score: float     # confidence
    created_at: str

    @classmethod
    def from_row(cls, row: Dict) -> "TransmutationRecord":
        return cls(
            id=row["id"],
            input_grief=row.get("grief_type", "unknown"),
            output_wisdom=row.get("lesson", ""),
            depth=row.get("cycle_depth", 1),
            maat_score=row.get("confidence", 0.0),
            created_at=row.get("created_at", ""),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class RecursiveReflector:
    """
    The transmutation engine. Grief enters; wisdom emerges.
    Each call to transmute() runs one full recursive cycle.
    Deeper grief (more signals) produces deeper reflection (higher cycle_depth).
    """

    MAX_DEPTH = 7  # mirrors the 7 cycle steps

    # Session-scoped MD5-keyed cache: hash → (WisdomEntry, timestamp)
    _cache: Dict[str, Tuple[WisdomEntry, float]] = {}
    CACHE_TTL = 300.0  # 5 minutes

    def transmute(self, memory_item: Dict[str, Any], depth: int = 1) -> WisdomEntry:
        """
        Run one recursive reflection cycle on a memory item.
        Returns a WisdomEntry. Stores wisdom in wisdom_ledger table.
        """
        if depth > self.MAX_DEPTH:
            depth = self.MAX_DEPTH

        # Cache at depth=1 to avoid redundant processing of identical items
        if depth == 1:
            cache_key = hashlib.md5(str(memory_item).encode()).hexdigest()
            cached = self._cache.get(cache_key)
            if cached and (time.monotonic() - cached[1]) < self.CACHE_TTL:
                return cached[0]

        # Step 1: Capture — identify the grief
        grief_type = self._capture_grief(memory_item)

        # Step 2: Evaluate vs Ma'at — score against truth, balance, order
        maat_score = self._evaluate_maat(memory_item)

        # Step 3: Prune — remove noise, keep essence
        essence = self._prune_to_essence(memory_item, grief_type)

        # Step 4: Dissect — extract structural lesson
        lesson = self._dissect(essence, grief_type, maat_score)

        # Step 5: Return — measure confidence
        confidence = self._compute_confidence(maat_score, depth)

        # Step 6: Propagate — if confidence is low, recurse deeper
        actual_depth = depth
        if confidence < 0.5 and depth < self.MAX_DEPTH:
            deeper = self.transmute(memory_item, depth + 1)
            if deeper.confidence > confidence:
                return deeper
            actual_depth = deeper.cycle_depth

        wisdom = WisdomEntry(
            id=str(uuid.uuid4()),
            lesson=lesson,
            source_id=str(memory_item.get("id", "unknown")),
            confidence=confidence,
            cycle_depth=actual_depth,
            grief_type=grief_type,
            created_at=datetime.now().isoformat(),
        )

        self._persist(wisdom)
        hive_protocol.publish_sync(WISDOM_DISTILLED, wisdom.to_dict())

        if depth == 1:
            self._cache[cache_key] = (wisdom, time.monotonic())

        return wisdom

    async def transmute_async(self, memory_item: Dict[str, Any]) -> WisdomEntry:
        """Non-blocking version of transmute for use in async contexts."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.transmute, memory_item)

    def _capture_grief(self, item: Dict) -> str:
        """Identify what kind of grief is present in this memory."""
        text = " ".join(str(v)[:500] for v in item.values()).lower()
        for signal in _GRIEF_SIGNALS:
            if signal in text:
                return signal
        return "unknown"

    def _evaluate_maat(self, item: Dict) -> float:
        """Score the item against Ma'at's three dimensions. Returns 0.0–1.0."""
        scores = [1.0 if check(item) else 0.0 for check in _MAAT_DIMENSIONS.values()]
        return sum(scores) / len(scores)

    def _prune_to_essence(self, item: Dict, grief_type: str) -> Dict:
        """Strip noise, keep only the structurally significant fields."""
        keep = {"id", "actor", "action", "outcome", "context", "resolution", grief_type}
        return {k: v for k, v in item.items() if k in keep or v is not None}

    def _dissect(self, essence: Dict, grief_type: str, maat_score: float) -> str:
        """Extract a human-readable lesson from the essence."""
        actor = essence.get("actor", "an agent")
        action = essence.get("action", "an action")
        outcome = essence.get("outcome", "an unexpected result")
        resolution = essence.get("resolution")

        lesson = (
            f"When {actor} attempted '{action}', it encountered '{grief_type}' "
            f"resulting in: {outcome}. "
        )
        if resolution:
            lesson += f"Resolution: {resolution}. "
        if maat_score >= 0.67:
            lesson += "Ma'at alignment is strong — this lesson is ready to be integrated."
        elif maat_score >= 0.33:
            lesson += "Ma'at alignment is partial — further reflection may deepen the wisdom."
        else:
            lesson += "Ma'at alignment is weak — this pattern requires more cycles to resolve."
        return lesson

    def _compute_confidence(self, maat_score: float, depth: int) -> float:
        """Confidence increases with Ma'at alignment and reflection depth."""
        depth_bonus = min(0.3, (depth - 1) * 0.05)
        return min(1.0, maat_score + depth_bonus)

    def _persist(self, wisdom: WisdomEntry):
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO wisdom_ledger
                   (id, lesson, source_id, confidence, cycle_depth, grief_type, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    wisdom.id, wisdom.lesson, wisdom.source_id,
                    wisdom.confidence, wisdom.cycle_depth,
                    wisdom.grief_type, wisdom.created_at,
                ),
            )
            conn.commit()
        except Exception:
            pass

    def get_ledger(self, limit: int = 50) -> List[Dict]:
        conn = get_db()
        rows = conn.execute(
            "SELECT * FROM wisdom_ledger ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]

    def get_transmutation_history(self, limit: int = 20) -> List[TransmutationRecord]:
        """Return typed TransmutationRecord history from wisdom_ledger."""
        conn = get_db()
        rows = conn.execute(
            "SELECT * FROM wisdom_ledger ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [TransmutationRecord.from_row(dict(r)) for r in rows]

    def maat_score_breakdown(self, memory_item: Dict[str, Any]) -> Dict[str, Any]:
        """Return per-dimension Ma'at truth/balance/order scores for an item."""
        scores = {
            dim: (1.0 if check(memory_item) else 0.0)
            for dim, check in _MAAT_DIMENSIONS.items()
        }
        total = sum(scores.values()) / len(scores)
        return {
            "dimensions": scores,
            "maat_score": round(total, 4),
            "interpretation": (
                "strong" if total >= 0.67 else
                "partial" if total >= 0.33 else
                "weak"
            ),
        }


reflector = RecursiveReflector()
