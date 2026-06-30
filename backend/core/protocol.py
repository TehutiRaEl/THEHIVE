"""
Coordination Protocol — Sovereign Hive
Async event bus connecting Nanuet (memory) and Kai El (reach).
Uses asyncio queues + SQLite pubsub_messages table for persistence.
No Redis required — SQLite WAL is sufficient at current scale.
All communication is async and non-blocking.
"""

import asyncio
import json
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional

from backend.core.db import get_db

# ─── Event type constants ─────────────────────────────────────────────────────
MEMORY_CAPTURED = "memory.captured"
MEMORY_PRUNED = "memory.pruned"
LESSON_DISSECTED = "lesson.dissected"
LESSON_PROPAGATED = "lesson.propagated"
WEALTH_UPDATED = "wealth.updated"
MISSION_GENERATED = "mission.generated"
WISDOM_DISTILLED = "wisdom.distilled"


@dataclass
class HiveEvent:
    id: str
    event_type: str
    payload: Dict[str, Any]
    created_at: str
    processed: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class HiveProtocol:
    """
    Lightweight async event bus for intra-hive coordination.
    Nanuet and Kai El share work/outputs via events — not internal state.
    All events are persisted to SQLite for audit compliance (F-004).
    Uses a 50ms batch window + executemany() to reduce SQLite write pressure.
    """

    def __init__(self):
        self._queues: Dict[str, List[asyncio.Queue]] = {}
        self._batch_queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self._batch_task: Optional[asyncio.Task] = None

    async def start_batch_worker(self):
        """Start the background batch-flush coroutine. Call once from app lifespan."""
        if self._batch_task is None or self._batch_task.done():
            self._batch_task = asyncio.create_task(self._batch_flush())

    async def _batch_flush(self):
        """Collect events for 50ms windows then flush with executemany()."""
        while True:
            batch = []
            try:
                event = await asyncio.wait_for(self._batch_queue.get(), timeout=0.05)
                batch.append(event)
                while True:
                    try:
                        batch.append(self._batch_queue.get_nowait())
                    except asyncio.QueueEmpty:
                        break
            except asyncio.TimeoutError:
                await asyncio.sleep(0)
                continue
            except asyncio.CancelledError:
                break

            if batch:
                try:
                    conn = get_db()
                    conn.executemany(
                        """INSERT INTO pubsub_messages (channel_id, payload, created_at)
                           VALUES (?, ?, ?)""",
                        [(e.event_type, json.dumps(e.payload), e.created_at) for e in batch],
                    )
                    conn.commit()
                except Exception:
                    pass

    async def publish(self, event_type: str, payload: Dict[str, Any]) -> str:
        """Publish an event. Enqueues for batch DB write; delivers to in-memory subscribers."""
        event_id = str(uuid.uuid4())
        event = HiveEvent(
            id=event_id,
            event_type=event_type,
            payload=payload,
            created_at=datetime.now().isoformat(),
        )

        # Enqueue for batch persist; fall back to direct persist if queue is full
        try:
            self._batch_queue.put_nowait(event)
        except asyncio.QueueFull:
            self._persist(event)

        # Deliver to in-memory subscribers
        for queue in self._queues.get(event_type, []):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass

        return event_id

    def publish_sync(self, event_type: str, payload: Dict[str, Any]) -> str:
        """Synchronous publish for use in non-async contexts."""
        event_id = str(uuid.uuid4())
        event = HiveEvent(
            id=event_id,
            event_type=event_type,
            payload=payload,
            created_at=datetime.now().isoformat(),
        )
        self._persist(event)
        return event_id

    def subscribe(self, event_type: str) -> asyncio.Queue:
        """Subscribe to an event type. Returns a Queue that receives HiveEvent objects."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._queues.setdefault(event_type, []).append(queue)
        return queue

    def unsubscribe(self, event_type: str, queue: asyncio.Queue):
        listeners = self._queues.get(event_type, [])
        if queue in listeners:
            listeners.remove(queue)

    def get_log(self, event_type: Optional[str] = None, limit: int = 100) -> List[Dict]:
        """Retrieve persisted event log for audit trail."""
        conn = get_db()
        if event_type:
            rows = conn.execute(
                """SELECT id, channel_id as event_type, payload, created_at
                   FROM pubsub_messages WHERE channel_id = ?
                   ORDER BY created_at DESC LIMIT ?""",
                (event_type, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                """SELECT id, channel_id as event_type, payload, created_at
                   FROM pubsub_messages ORDER BY created_at DESC LIMIT ?""",
                (limit,),
            ).fetchall()
        result = []
        for r in rows:
            try:
                payload = json.loads(r["payload"] or "{}")
            except Exception:
                payload = {}
            result.append({
                "id": r["id"],
                "event_type": r["event_type"],
                "payload": payload,
                "created_at": r["created_at"],
            })
        return result

    def _persist(self, event: HiveEvent):
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO pubsub_messages (channel_id, payload, created_at)
                   VALUES (?, ?, ?)""",
                (event.event_type, json.dumps(event.payload), event.created_at),
            )
            conn.commit()
        except Exception:
            pass


hive_protocol = HiveProtocol()
