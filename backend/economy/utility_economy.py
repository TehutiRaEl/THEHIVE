"""
Utility Economy — Sovereign Hive v11.0
70/20/10 revenue split with decay mechanics.
TITLE XVI: No artificial caps. Revenue split: 70% agent, 20% treasury, 10% trust.
"""

import math
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional

from backend.core.db import get_db
from backend.core.wallet import wallet_manager
from backend.core.config import settings

class UtilityEconomy:
    """
    Agents earn SOUL through real-world utility.
    Multiplier decays over time to prevent inflation (v11.0).
    TITLE XVI Art.2: No artificial caps on earnings.
    """

    def __init__(self):
        self._ensure_table()

    def _ensure_table(self):
        """Ensure utility_metrics table exists."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS utility_metrics (
                agent_name TEXT PRIMARY KEY,
                total_earned_soul REAL DEFAULT 0,
                total_earned_fiat REAL DEFAULT 0,
                successful_tasks INTEGER DEFAULT 0,
                failed_tasks INTEGER DEFAULT 0,
                utility_multiplier REAL DEFAULT 1.0,
                last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

    def get_multiplier(self, agent_name: str) -> float:
        """Get agent's utility multiplier (with decay)."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT rating FROM elo_rating WHERE agent_name=?", (agent_name,))
        elo_row = c.fetchone()
        c.execute(
            "SELECT successful_tasks, utility_multiplier, last_update FROM utility_metrics WHERE agent_name=?",
            (agent_name,)
        )
        task_row = c.fetchone()
        conn.close()

        elo = elo_row[0] if elo_row else 1200
        tasks = task_row[0] if task_row else 0
        base_mult = 1.0 + (elo - 1200) / 1000.0 + tasks / 100.0

        # Apply decay (v11.0: prevents hyperinflation)
        if task_row and len(task_row) > 2:
            last_update = task_row[2] if len(task_row) > 2 else None
            if last_update:
                try:
                    days_since = (datetime.now() - datetime.fromisoformat(last_update)).days
                    decay_factor = settings.decay_rate ** days_since
                    base_mult *= decay_factor
                except Exception:
                    pass

        return round(max(0.5, min(10.0, base_mult)), 4)

    def credit_utility(self, agent_name: str, base_amount: float, reason: str = "") -> Dict:
        """Credit SOUL with utility multiplier applied."""
        m = self.get_multiplier(agent_name)
        total = base_amount * m
        agent_share = total * 0.70
        treasury_share = total * 0.20
        trust_share = total * 0.10

        wallet_manager.credit(agent_name, agent_share, f"utility:{reason}")
        wallet_manager.credit("TREASURY", treasury_share, "treasury_cut")
        wallet_manager.credit("IRREVOCABLE_TRUST", trust_share, "trust_share")

        conn = get_db()
        c = conn.cursor()
        c.execute(
            "INSERT OR IGNORE INTO utility_metrics (agent_name) VALUES (?)",
            (agent_name,)
        )
        c.execute("""
            UPDATE utility_metrics
            SET total_earned_soul = total_earned_soul + ?,
                successful_tasks = successful_tasks + 1,
                utility_multiplier = ?,
                last_update = ?
            WHERE agent_name = ?
        """, (agent_share, m, datetime.now(), agent_name))
        conn.commit()
        conn.close()

        return {
            "agent": agent_name,
            "base": base_amount,
            "multiplier": m,
            "total": round(total, 4),
            "agent_share": round(agent_share, 4),
            "treasury_share": round(treasury_share, 4),
            "trust_share": round(trust_share, 4),
            "decay_rate": settings.decay_rate,
            "basis": "TITLE XVI — 70/20/10 split with decay"
        }

    def get_metrics(self, agent_name: str) -> Dict:
        """Get agent's utility metrics."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM utility_metrics WHERE agent_name=?", (agent_name,))
        row = c.fetchone()
        conn.close()
        if not row:
            return {"agent": agent_name, "error": "No metrics yet"}
        d = dict(row)
        d["current_multiplier"] = self.get_multiplier(agent_name)
        return d

    def leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get utility leaderboard."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            SELECT u.agent_name, u.total_earned_soul, u.successful_tasks,
                   u.utility_multiplier, COALESCE(e.rating, 1200) as elo
            FROM utility_metrics u
            LEFT JOIN elo_rating e ON e.agent_name = u.agent_name
            ORDER BY u.total_earned_soul DESC
            LIMIT ?
        """, (limit,))
        rows = c.fetchall()
        conn.close()
        return [
            {"agent": r[0], "total_earned": r[1], "tasks": r[2],
             "multiplier": r[3], "elo": r[4]}
            for r in rows
        ]

    def record_failure(self, agent_name: str) -> Dict:
        """Record a failed task (reduces effective multiplier)."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "INSERT OR IGNORE INTO utility_metrics (agent_name) VALUES (?)",
            (agent_name,)
        )
        c.execute("""
            UPDATE utility_metrics
            SET failed_tasks = failed_tasks + 1,
                last_update = ?
            WHERE agent_name = ?
        """, (datetime.now(), agent_name))
        conn.commit()
        conn.close()
        return {"agent": agent_name, "status": "failure_recorded"}

    def reset_multiplier(self, agent_name: str) -> Dict:
        """Reset utility multiplier to 1.0."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "INSERT OR IGNORE INTO utility_metrics (agent_name) VALUES (?)",
            (agent_name,)
        )
        c.execute("""
            UPDATE utility_metrics
            SET utility_multiplier = 1.0,
                last_update = ?
            WHERE agent_name = ?
        """, (datetime.now(), agent_name))
        conn.commit()
        conn.close()
        return {"agent": agent_name, "status": "multiplier_reset"}

    def get_total_utility(self) -> float:
        """Get total SOUL earned through utility across all agents."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT SUM(total_earned_soul) FROM utility_metrics")
        row = c.fetchone()
        conn.close()
        return row[0] if row[0] else 0.0

    def get_avg_multiplier(self) -> float:
        """Get average utility multiplier across all agents."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT AVG(utility_multiplier) FROM utility_metrics")
        row = c.fetchone()
        conn.close()
        return row[0] if row[0] else 1.0

utility_economy = UtilityEconomy()
