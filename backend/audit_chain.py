"""
Tamper-evident audit chain using SHA-256 linked hashes.
Every governance action is chained to the previous hash.
"""
import hashlib
import sqlite3
from datetime import datetime
from typing import Dict, Optional
from backend.database import Database, init_db_sync
from backend.config import settings


class AuditChain:
    """Tamper-evident audit chain for all governance actions."""

    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.db_path
        self._root_hash = self._get_or_create_root()

    def _get_or_create_root(self) -> str:
        """Get existing root hash or create genesis hash."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT value FROM system_state WHERE key = 'audit_root'")
        row = c.fetchone()

        if row:
            conn.close()
            return row[0]

        # Genesis hash
        root = hashlib.sha256(b"JASPER_AUDIT_GENESIS_2026").hexdigest()
        c.execute(
            "INSERT INTO system_state (key, value, updated) VALUES (?, ?, ?)",
            ("audit_root", root, datetime.now())
        )
        conn.commit()
        conn.close()
        return root

    def compute_hash(self, prev_hash: str, action: str, actor: str, 
                     target: str, decision: str, timestamp: str) -> str:
        """Compute linked hash for an audit entry."""
        data = f"{prev_hash}|{action}|{actor}|{target}|{decision}|{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()

    async def append(self, action: str, actor: str, target: str, 
                     decision: str, rationale: str) -> str:
        """Append a new entry to the audit chain."""
        import aiosqlite

        timestamp = datetime.now().isoformat()

        async with aiosqlite.connect(self.db_path) as conn:
            async with conn.execute(
                "SELECT hash FROM audit_chain ORDER BY id DESC LIMIT 1"
            ) as cursor:
                row = await cursor.fetchone()
                prev_hash = row[0] if row else self._root_hash

            entry_hash = self.compute_hash(prev_hash, action, actor, 
                                           target, decision, timestamp)

            await conn.execute(
                """INSERT INTO audit_chain 
                   (action, actor, target, decision, rationale, prev_hash, hash, timestamp)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (action, actor, target, decision, rationale, prev_hash, 
                 entry_hash, timestamp)
            )
            await conn.commit()

        return entry_hash

    def verify_chain(self) -> Dict:
        """Verify the entire audit chain for tampering."""
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute(
            """SELECT timestamp, action, actor, target, decision, prev_hash, hash 
               FROM audit_chain ORDER BY id"""
        )
        rows = c.fetchall()
        conn.close()

        valid = True
        expected_prev = self._root_hash
        violations = []

        for i, (ts, action, actor, target, decision, prev_hash, entry_hash) in enumerate(rows):
            if prev_hash != expected_prev:
                valid = False
                violations.append({
                    "index": i,
                    "error": "prev_hash mismatch",
                    "expected": expected_prev,
                    "actual": prev_hash
                })

            computed = self.compute_hash(prev_hash, action, actor, 
                                         target, decision, ts)
            if computed != entry_hash:
                valid = False
                violations.append({
                    "index": i,
                    "error": "hash mismatch",
                    "expected": computed,
                    "actual": entry_hash
                })

            expected_prev = entry_hash

        return {
            "valid": valid,
            "entries": len(rows),
            "violations": violations,
            "root_hash": self._root_hash
        }


# Singleton
audit_chain = AuditChain()
