"""
Staking Economy — Sovereign Hive v11.0
Locked SOUL staking with APY rewards.
"""

import uuid
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Optional

from backend.core.db import get_db
from backend.core.wallet import wallet_manager
from backend.core.config import settings

class StakingManager:
    """
    Staking SOUL for governance weight and rewards.
    Locked for Config.STAKING_LOCK_DAYS days.
    """

    def __init__(self):
        self._ensure_table()

    def _ensure_table(self):
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
            "INSERT INTO staking_positions (id, agent_name, amount, locked_until, rewards_claimed) VALUES (?, ?, ?, ?, 0)",
            (stake_id, agent_name, amount, lock_until)
        )
        conn.commit()

        return {
            "success": True,
            "stake_id": stake_id,
            "amount": amount,
            "locked_until": lock_until.isoformat(),
            "estimated_apy": settings.staking_apy,
            "estimated_reward": round(amount * settings.staking_apy * (settings.staking_lock_days / 365), 4)
        }

    async def claim_rewards(self, agent_name: str) -> Dict:
        """Claim staking rewards."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT id, amount, locked_until, rewards_claimed FROM staking_positions WHERE agent_name = ? AND locked_until <= datetime('now')",
            (agent_name,)
        )
        positions = c.fetchall()

        total_reward = 0.0
        for pos_id, amount, locked_until_str, claimed in positions:
            if claimed:
                continue
            locked_dt = datetime.fromisoformat(locked_until_str)
            days_staked = (datetime.now() - locked_dt).days + settings.staking_lock_days
            reward = amount * settings.staking_apy * (days_staked / 365)
            total_reward += reward
            c.execute("UPDATE staking_positions SET rewards_claimed = ? WHERE id = ?", (reward, pos_id))

        conn.commit()
        conn.close()

        if total_reward > 0:
            wallet_manager.credit(agent_name, total_reward, "staking_rewards")
            # Apply decay to staking rewards (v11.0)
            decayed = total_reward * (settings.decay_rate ** (days_staked / 365))
            total_reward = decayed

        return {
            "success": True,
            "agent": agent_name,
            "rewards_claimed": round(total_reward, 4),
            "decay_applied": settings.decay_rate,
            "basis": "V11.0 Decay Mechanics — prevents hyperinflation"
        }

    def get_positions(self, agent_name: str) -> List[Dict]:
        """Get all staking positions for an agent."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "SELECT id, amount, locked_until, rewards_claimed FROM staking_positions WHERE agent_name = ?",
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
                "is_mature": datetime.fromisoformat(r[2]) <= datetime.now()
            }
            for r in rows
        ]

staking_manager = StakingManager()
