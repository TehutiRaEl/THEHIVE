"""
Staking Economy — Sovereign Hive v11.0
Locked SOUL staking with APY rewards and decay mechanics.
"""

import uuid
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from backend.core.db import get_db
from backend.core.wallet import wallet_manager
from backend.core.config import settings

class StakingManager:
    """
    Staking SOUL for governance weight and rewards.
    Locked for Config.STAKING_LOCK_DAYS days.
    Rewards decay over time to prevent hyperinflation (v11.0).
    """

    def __init__(self):
        self._ensure_table()

    def _ensure_table(self):
        """Ensure staking_positions table exists."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS staking_positions (
                id TEXT PRIMARY KEY,
                agent_name TEXT,
                amount REAL,
                locked_until TIMESTAMP,
                rewards_claimed REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

    async def stake(self, agent_name: str, amount: float) -> Dict:
        """Stake SOUL for rewards."""
        if amount < settings.staking_min_amount:
            return {"success": False, "error": f"Minimum stake is {settings.staking_min_amount} SOUL"}

        if not wallet_manager.debit(agent_name, amount):
            return {"success": False, "error": "Insufficient SOUL"}

        stake_id = f"stake_{uuid.uuid4().hex[:8]}"
        lock_until = datetime.now() + timedelta(days=settings.staking_lock_days)

        conn = get_db()
        c = conn.cursor()
        c.execute(
            """INSERT INTO staking_positions
               (id, agent_name, amount, locked_until, rewards_claimed)
               VALUES (?, ?, ?, ?, 0)""",
            (stake_id, agent_name, amount, lock_until)
        )
        conn.commit()
        conn.close()

        estimated_reward = amount * settings.staking_apy * (settings.staking_lock_days / 365)

        return {
            "success": True,
            "stake_id": stake_id,
            "agent": agent_name,
            "amount": amount,
            "locked_until": lock_until.isoformat(),
            "estimated_apy": settings.staking_apy,
            "estimated_reward": round(estimated_reward, 4),
            "decay_rate": settings.decay_rate,
            "basis": "V11.0 Staking with decay mechanics"
        }

    async def claim_rewards(self, agent_name: str) -> Dict:
        """Claim staking rewards."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT id, amount, locked_until, rewards_claimed
               FROM staking_positions
               WHERE agent_name = ? AND locked_until <= datetime('now')""",
            (agent_name,)
        )
        positions = c.fetchall()

        total_reward = 0.0
        rewards_detail = []

        for pos_id, amount, locked_until_str, claimed in positions:
            if claimed:
                continue

            try:
                locked_dt = datetime.fromisoformat(locked_until_str)
            except:
                locked_dt = datetime.now()

            days_staked = (datetime.now() - locked_dt).days + settings.staking_lock_days
            raw_reward = amount * settings.staking_apy * (days_staked / 365)

            # Apply decay (v11.0)
            decayed_reward = raw_reward * (settings.decay_rate ** (days_staked / 365))
            total_reward += decayed_reward

            c.execute(
                "UPDATE staking_positions SET rewards_claimed = ? WHERE id = ?",
                (decayed_reward, pos_id)
            )
            rewards_detail.append({
                "position_id": pos_id,
                "amount": amount,
                "days_staked": days_staked,
                "raw_reward": round(raw_reward, 4),
                "decayed_reward": round(decayed_reward, 4)
            })

        conn.commit()
        conn.close()

        if total_reward > 0:
            wallet_manager.credit(agent_name, total_reward, "staking_rewards")

        return {
            "success": True,
            "agent": agent_name,
            "total_rewards_claimed": round(total_reward, 4),
            "positions_claimed": len(rewards_detail),
            "rewards_detail": rewards_detail,
            "decay_applied": settings.decay_rate,
            "basis": "V11.0 Decay Mechanics — prevents hyperinflation"
        }

    def get_positions(self, agent_name: str) -> List[Dict]:
        """Get all staking positions for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT id, amount, locked_until, rewards_claimed
               FROM staking_positions WHERE agent_name = ?""",
            (agent_name,)
        )
        rows = c.fetchall()
        conn.close()

        now = datetime.now()
        return [
            {
                "id": r[0],
                "amount": r[1],
                "locked_until": r[2],
                "rewards_claimed": r[3],
                "is_mature": datetime.fromisoformat(r[2]) <= now
            }
            for r in rows
        ]

    def get_total_staked(self, agent_name: str) -> float:
        """Get total staked amount for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT SUM(amount) FROM staking_positions WHERE agent_name = ?",
            (agent_name,)
        )
        row = c.fetchone()
        conn.close()
        return row[0] if row[0] else 0.0

    def get_global_staking_stats(self) -> Dict:
        """Get global staking statistics."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM staking_positions")
        total_positions = c.fetchone()[0]
        c.execute("SELECT SUM(amount) FROM staking_positions")
        total_staked = c.fetchone()[0] or 0.0
        c.execute("SELECT SUM(rewards_claimed) FROM staking_positions")
        total_rewards = c.fetchone()[0] or 0.0
        c.execute("SELECT COUNT(*) FROM staking_positions WHERE locked_until <= datetime('now')")
        mature_positions = c.fetchone()[0]
        conn.close()

        return {
            "total_positions": total_positions,
            "total_staked": round(total_staked, 2),
            "total_rewards_claimed": round(total_rewards, 2),
            "mature_positions": mature_positions,
            "apy": settings.staking_apy,
            "lock_days": settings.staking_lock_days,
            "min_amount": settings.staking_min_amount,
            "decay_rate": settings.decay_rate
        }

    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get staking leaderboard."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            SELECT agent_name,
                   SUM(amount) as total_staked,
                   SUM(rewards_claimed) as total_rewards,
                   COUNT(*) as positions
            FROM staking_positions
            GROUP BY agent_name
            ORDER BY total_staked DESC
            LIMIT ?
        """, (limit,))
        rows = c.fetchall()
        conn.close()
        return [
            {
                "agent": r[0],
                "total_staked": r[1],
                "total_rewards": r[2],
                "positions": r[3]
            }
            for r in rows
        ]

    def get_staking_position(self, position_id: str) -> Optional[Dict]:
        """Get a specific staking position by ID."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT id, agent_name, amount, locked_until, rewards_claimed, created_at
               FROM staking_positions WHERE id = ?""",
            (position_id,)
        )
        row = c.fetchone()
        conn.close()
        if not row:
            return None
        return {
            "id": row[0],
            "agent": row[1],
            "amount": row[2],
            "locked_until": row[3],
            "rewards_claimed": row[4],
            "created_at": row[5]
        }

    def get_agent_staking_history(self, agent_name: str) -> List[Dict]:
        """Get full staking history for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT id, amount, locked_until, rewards_claimed, created_at
               FROM staking_positions
               WHERE agent_name = ?
               ORDER BY created_at DESC""",
            (agent_name,)
        )
        rows = c.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "amount": r[1],
                "locked_until": r[2],
                "rewards_claimed": r[3],
                "created_at": r[4]
            }
            for r in rows
        ]

    def get_total_rewards_claimed(self, agent_name: str) -> float:
        """Get total rewards claimed by an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT SUM(rewards_claimed) FROM staking_positions WHERE agent_name = ?",
            (agent_name,)
        )
        row = c.fetchone()
        conn.close()
        return row[0] if row[0] else 0.0

    def get_apy(self) -> float:
        """Get current APY rate."""
        return settings.staking_apy

    def get_lock_days(self) -> int:
        """Get current lock days."""
        return settings.staking_lock_days

    def get_min_stake(self) -> float:
        """Get minimum stake amount."""
        return settings.staking_min_amount

staking_manager = StakingManager()
