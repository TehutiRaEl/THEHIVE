"""
Human-in-the-Loop Module — Sovereign Hive v11.0
High-stakes actions require human approval with auto-expiry.
"""

import time
import uuid
import asyncio
import json
import sqlite3
from datetime import datetime
from typing import Dict, Optional, List, Any

from backend.core.db import get_db
from backend.core.config import settings

class HumanInTheLoop:
    """
    Escalation mechanism for high-stakes operations.
    Requests auto-expire after Config.hitl_timeout_seconds.
    TITLE XV: Constitution is Code — human veto is prohibited.
    """

    def __init__(self):
        self.pending_requests: Dict[str, Dict] = {}
        self._lock = asyncio.Lock()
        self._ensure_table()

    def _ensure_table(self):
        """Ensure hitl_requests table exists."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS hitl_requests (
                id TEXT PRIMARY KEY,
                action_type TEXT,
                params TEXT,
                status TEXT,
                requested_by TEXT,
                requested_at TIMESTAMP,
                resolved_at TIMESTAMP,
                approved BOOLEAN
            )
        """)
        conn.commit()

    async def request_approval(self, action_type: str, params: Dict, requested_by: str) -> str:
        """Request human approval for a high-stakes action."""
        request_id = f"hitl_{uuid.uuid4().hex[:8]}"
        expires_at = time.time() + settings.hitl_timeout_seconds

        async with self._lock:
            self.pending_requests[request_id] = {
                "action_type": action_type,
                "params": params,
                "requested_by": requested_by,
                "requested_at": time.time(),
                "status": "pending",
                "expires_at": expires_at
            }

        conn = get_db()
        c = conn.cursor()
        c.execute(
            """INSERT INTO hitl_requests
               (id, action_type, params, status, requested_by, requested_at)
               VALUES (?, ?, ?, 'pending', ?, ?)""",
            (request_id, action_type, json.dumps(params), requested_by, datetime.now())
        )
        conn.commit()
        conn.close()

        asyncio.create_task(self._auto_expire(request_id))

        return request_id

    async def _auto_expire(self, request_id: str):
        """Auto-expire pending requests after timeout."""
        await asyncio.sleep(settings.hitl_timeout_seconds)
        async with self._lock:
            if request_id in self.pending_requests and self.pending_requests[request_id]["status"] == "pending":
                self.pending_requests[request_id]["status"] = "expired"

        conn = get_db()
        c = conn.cursor()
        c.execute(
            "UPDATE hitl_requests SET status='expired', resolved_at=? WHERE id=?",
            (datetime.now(), request_id)
        )
        conn.commit()
        conn.close()

    async def resolve_request(self, request_id: str, approved: bool, resolved_by: str) -> Dict:
        """Resolve a pending HITL request."""
        async with self._lock:
            if request_id not in self.pending_requests:
                raise ValueError(f"Request {request_id} not found")
            request = self.pending_requests[request_id]
            if request["status"] != "pending":
                raise ValueError(f"Request {request_id} is already {request['status']}")
            request["status"] = "approved" if approved else "rejected"
            request["resolved_by"] = resolved_by
            request["resolved_at"] = time.time()

        conn = get_db()
        c = conn.cursor()
        c.execute(
            """UPDATE hitl_requests
               SET status=?, resolved_at=?, approved=?
               WHERE id=?""",
            ("resolved" if approved else "rejected", datetime.now(), approved, request_id)
        )
        conn.commit()
        conn.close()

        return {
            "request_id": request_id,
            "approved": approved,
            "resolved_by": resolved_by,
            "status": request["status"]
        }

    def get_pending_count(self) -> int:
        """Get number of pending requests."""
        return len([r for r in self.pending_requests.values() if r.get("status") == "pending"])

    def get_requests(self, status: Optional[str] = None) -> List[Dict]:
        """Get HITL requests with optional status filter."""
        conn = get_db()
        c = conn.cursor()
        if status:
            c.execute(
                "SELECT * FROM hitl_requests WHERE status=? ORDER BY requested_at DESC",
                (status,)
            )
        else:
            c.execute("SELECT * FROM hitl_requests ORDER BY requested_at DESC")
        rows = c.fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def get_request(self, request_id: str) -> Optional[Dict]:
        """Get a specific HITL request by ID."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM hitl_requests WHERE id=?", (request_id,))
        row = c.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_request_data(self, request_id: str) -> Optional[Dict]:
        """Get the in-memory record for a request — unlike get_request(), `params`
        here is the real dict a caller passed to request_approval(), not the JSON
        string stored in the DB row. Callers that need to replay the original
        action_type/params (e.g. hive_mesh's post-approval re-dispatch) use this."""
        return self.pending_requests.get(request_id)

    def is_pending(self, request_id: str) -> bool:
        """Check if a request is still pending."""
        return self.pending_requests.get(request_id, {}).get("status") == "pending"

    def is_expired(self, request_id: str) -> bool:
        """Check if a request has expired."""
        return self.pending_requests.get(request_id, {}).get("status") == "expired"

    def is_resolved(self, request_id: str) -> bool:
        """Check if a request has been resolved."""
        return self.pending_requests.get(request_id, {}).get("status") in ["approved", "rejected"]

    def get_all_pending(self) -> List[Dict]:
        """Get all pending requests."""
        return [r for r in self.pending_requests.values() if r.get("status") == "pending"]

    def get_all_expired(self) -> List[Dict]:
        """Get all expired requests."""
        return [r for r in self.pending_requests.values() if r.get("status") == "expired"]

    def get_all_resolved(self) -> List[Dict]:
        """Get all resolved requests."""
        return [r for r in self.pending_requests.values() if r.get("status") in ["approved", "rejected"]]

    async def cancel_request(self, request_id: str) -> Dict:
        """Cancel a pending request."""
        async with self._lock:
            if request_id not in self.pending_requests:
                raise ValueError(f"Request {request_id} not found")
            if self.pending_requests[request_id]["status"] != "pending":
                raise ValueError(f"Request {request_id} is already {self.pending_requests[request_id]['status']}")
            self.pending_requests[request_id]["status"] = "cancelled"

        conn = get_db()
        c = conn.cursor()
        c.execute(
            "UPDATE hitl_requests SET status='cancelled', resolved_at=? WHERE id=?",
            (datetime.now(), request_id)
        )
        conn.commit()
        conn.close()

        return {
            "request_id": request_id,
            "status": "cancelled",
            "message": "Request cancelled by user"
        }

hitl = HumanInTheLoop()
