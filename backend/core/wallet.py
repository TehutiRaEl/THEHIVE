"""
WALLET MANAGER — SOUL Ledger
100% reserve. No central bank.
"""

import os
import sqlite3
import secrets
from typing import Dict, List, Optional

try:
    from eth_account import Account
    ETH_AVAILABLE = True
except ImportError:
    ETH_AVAILABLE = False

class WalletManager:
    def __init__(self):
        self._ensure_table()

    def _ensure_table(self):
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS agent_wallets (
                agent_name   TEXT PRIMARY KEY,
                address      TEXT NOT NULL,
                private_key  TEXT NOT NULL,
                soul_balance REAL DEFAULT 0,
                soul_earned  REAL DEFAULT 0,
                soul_spent   REAL DEFAULT 0,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()

    def create_wallet(self, agent_name: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT address, soul_balance FROM agent_wallets WHERE agent_name = ?", (agent_name,))
        row = c.fetchone()
        if row:
            conn.close()
            return {"agent": agent_name, "address": row[0], "balance": row[1], "new": False}

        private_key = "0x" + secrets.token_hex(32)
        if ETH_AVAILABLE:
            account = Account.from_key(private_key)
            address = account.address
        else:
            address = "0x" + hashlib.sha256(private_key.encode()).hexdigest()[:40]

        c.execute(
            "INSERT INTO agent_wallets (agent_name, address, private_key) VALUES (?, ?, ?)",
            (agent_name, address, private_key)
        )
        conn.commit()
        conn.close()
        return {"agent": agent_name, "address": address, "balance": 0.0, "new": True}

    def credit(self, agent_name: str, amount: float, reason: str = ""):
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            UPDATE agent_wallets
            SET soul_balance = soul_balance + ?,
                soul_earned  = soul_earned  + ?
            WHERE agent_name = ?
        """, (amount, amount, agent_name))
        conn.commit()
        conn.close()

    def debit(self, agent_name: str, amount: float) -> bool:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT soul_balance FROM agent_wallets WHERE agent_name = ?", (agent_name,))
        row = c.fetchone()
        if not row or row[0] < amount:
            conn.close()
            return False
        c.execute("""
            UPDATE agent_wallets
            SET soul_balance = soul_balance - ?,
                soul_spent   = soul_spent   + ?
            WHERE agent_name = ?
        """, (amount, amount, agent_name))
        conn.commit()
        conn.close()
        return True

    def tip(self, from_agent: str, to_agent: str, amount: float) -> Dict:
        if not self.debit(from_agent, amount, f"tip to {to_agent}"):
            return {"success": False, "error": "Insufficient SOUL balance"}
        self.credit(to_agent, amount, f"tip from {from_agent}")
        return {"success": True, "from": from_agent, "to": to_agent, "amount": amount}

    def get_balance(self, agent_name: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            SELECT address, soul_balance, soul_earned, soul_spent
            FROM agent_wallets WHERE agent_name = ?
        """, (agent_name,))
        row = c.fetchone()
        conn.close()
        if not row:
            return {"error": "Wallet not found"}
        return {
            "agent": agent_name,
            "address": row[0],
            "soul_balance": row[1],
            "soul_earned": row[2],
            "soul_spent": row[3]
        }

    def leaderboard(self, limit: int = 10) -> List[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("""
            SELECT w.agent_name, w.address, w.soul_balance, w.soul_earned,
                   COALESCE(e.rating, 1200) as elo
            FROM agent_wallets w
            LEFT JOIN elo_rating e ON e.agent_name = w.agent_name
            ORDER BY w.soul_balance DESC
            LIMIT ?
        """, (limit,))
        rows = c.fetchall()
        conn.close()
        return [
            {"agent": r[0], "address": r[1], "soul": r[2], "earned": r[3], "elo": r[4]}
            for r in rows
        ]

wallet_manager = WalletManager()
