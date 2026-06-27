"""
Wealth Engine — Sovereign Hive
Computes EVW (Earned Value Weight), TWW (Time-Weighted Wealth),
VWW (Value-Weighted Wealth), and total wealth W_total = sqrt(TWW * VWW).
F-002: Changes apply prospectively only.
F-006: Exercising fixed rights never reduces wealth.
"""

import math
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import List, Optional, Dict, Any

from backend.core.db import get_db


@dataclass
class Contribution:
    user_id: str
    hours_saved: float = 0.0
    adoption_count: int = 0
    novelty_score: float = 0.0      # 0.0 – 1.0
    dispute_resilience: float = 0.0  # 0.0 – 1.0
    utilized: bool = True
    created_at: Optional[str] = None

    def evw(self) -> float:
        """EVW = (hours_saved*0.4) + (adoption_count*0.3) + (novelty_score*0.2) + (dispute_resilience*0.1)"""
        return (
            self.hours_saved * 0.4
            + self.adoption_count * 0.3
            + self.novelty_score * 0.2
            + self.dispute_resilience * 0.1
        )


@dataclass
class WealthSnapshot:
    user_id: str
    tww: float          # time-wealth in hours
    vww: float          # sum of EVW of utilized contributions
    w_total: float      # geometric mean: sqrt(tww * vww)
    computed_at: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class WealthEngine:
    """
    Calculates and persists user wealth according to F-001/F-002 rules.
    Uses wealth_records and wealth_contributions SQLite tables.
    """

    def record_contribution(
        self,
        user_id: str,
        hours_saved: float,
        adoption_count: int,
        novelty_score: float,
        dispute_resilience: float,
        utilized: bool = True,
    ) -> str:
        """Record a new contribution and return its ID."""
        c = Contribution(
            user_id=user_id,
            hours_saved=max(0.0, hours_saved),
            adoption_count=max(0, adoption_count),
            novelty_score=max(0.0, min(1.0, novelty_score)),
            dispute_resilience=max(0.0, min(1.0, dispute_resilience)),
            utilized=utilized,
            created_at=datetime.now().isoformat(),
        )
        contrib_id = str(uuid.uuid4())
        conn = get_db()
        conn.execute(
            """INSERT INTO wealth_contributions
               (id, user_id, hours_saved, adoption_count, novelty_score,
                dispute_resilience, evw, utilized, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                contrib_id, c.user_id, c.hours_saved, c.adoption_count,
                c.novelty_score, c.dispute_resilience, c.evw(),
                1 if c.utilized else 0, c.created_at,
            ),
        )
        conn.commit()
        return contrib_id

    def record_active_time(self, user_id: str, seconds: float):
        """Log time actively providing value to the swarm (F-001 method 1)."""
        conn = get_db()
        conn.execute(
            "INSERT INTO wealth_time_log (user_id, seconds, logged_at) VALUES (?, ?, ?)",
            (user_id, max(0.0, seconds), datetime.now().isoformat()),
        )
        conn.commit()

    def calculate(self, user_id: str) -> WealthSnapshot:
        """Compute current wealth for a user."""
        conn = get_db()

        # TWW: total hours providing value (method 1)
        row = conn.execute(
            "SELECT COALESCE(SUM(seconds), 0) FROM wealth_time_log WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        total_seconds = row[0] if row else 0.0
        tww = total_seconds / 3600.0

        # VWW: sum of EVW for utilized contributions (method 2)
        row = conn.execute(
            "SELECT COALESCE(SUM(evw), 0) FROM wealth_contributions WHERE user_id = ? AND utilized = 1",
            (user_id,),
        ).fetchone()
        vww = row[0] if row else 0.0

        # W_total = geometric mean: sqrt(TWW * VWW)
        w_total = math.sqrt(tww * vww) if tww > 0 and vww > 0 else 0.0

        snapshot = WealthSnapshot(
            user_id=user_id,
            tww=tww,
            vww=vww,
            w_total=w_total,
            computed_at=datetime.now().isoformat(),
        )

        # Persist snapshot (prospective record — F-002)
        conn.execute(
            """INSERT OR REPLACE INTO wealth_records (user_id, tww, vww, w_total, computed_at)
               VALUES (?, ?, ?, ?, ?)""",
            (user_id, tww, vww, w_total, snapshot.computed_at),
        )
        conn.commit()
        return snapshot

    def get_wealth(self, user_id: str) -> Optional[WealthSnapshot]:
        """Retrieve the last computed wealth snapshot for a user."""
        conn = get_db()
        row = conn.execute(
            "SELECT user_id, tww, vww, w_total, computed_at FROM wealth_records WHERE user_id = ?",
            (user_id,),
        ).fetchone()
        if not row:
            return None
        return WealthSnapshot(
            user_id=row["user_id"],
            tww=row["tww"],
            vww=row["vww"],
            w_total=row["w_total"],
            computed_at=row["computed_at"],
        )

    def get_contributions(self, user_id: str) -> List[Dict]:
        conn = get_db()
        rows = conn.execute(
            "SELECT * FROM wealth_contributions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


wealth_engine = WealthEngine()
