"""
Unit tests for HiveProtocol — async event bus, batch flush, persistence.
"""
import asyncio
import json
import pytest
from unittest.mock import patch, MagicMock, AsyncMock


def _mock_db():
    conn = MagicMock()
    conn.execute.return_value = conn
    conn.executemany.return_value = conn
    conn.fetchone.return_value = None
    conn.fetchall.return_value = []
    conn.commit.return_value = None
    return conn


# ── import & constants ────────────────────────────────────────────────────

class TestProtocolConstants:
    def test_event_types_exported(self):
        from backend.core.protocol import (
            MEMORY_CAPTURED, MEMORY_PRUNED, LESSON_DISSECTED,
            LESSON_PROPAGATED, WEALTH_UPDATED, MISSION_GENERATED, WISDOM_DISTILLED,
        )
        assert MEMORY_CAPTURED == "memory.captured"
        assert WISDOM_DISTILLED == "wisdom.distilled"

    def test_hive_protocol_singleton(self):
        from backend.core.protocol import hive_protocol, HiveProtocol
        assert isinstance(hive_protocol, HiveProtocol)


# ── HiveEvent shape ───────────────────────────────────────────────────────

class TestHiveEvent:
    def test_to_dict(self):
        from backend.core.protocol import HiveEvent
        e = HiveEvent(id="e1", event_type="test.event", payload={"x": 1}, created_at="2026-01-01")
        d = e.to_dict()
        assert d["id"] == "e1"
        assert d["event_type"] == "test.event"
        assert d["payload"] == {"x": 1}


# ── publish (async) ───────────────────────────────────────────────────────

class TestPublishAsync:
    @pytest.mark.asyncio
    async def test_publish_returns_event_id(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            event_id = await proto.publish("test.event", {"key": "val"})
        assert isinstance(event_id, str)
        assert len(event_id) > 0

    @pytest.mark.asyncio
    async def test_publish_delivers_to_subscriber(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            queue = proto.subscribe("test.delivery")
            await proto.publish("test.delivery", {"ping": True})
        assert not queue.empty()
        event = queue.get_nowait()
        assert event.event_type == "test.delivery"
        assert event.payload["ping"] is True

    @pytest.mark.asyncio
    async def test_publish_to_unsubscribed_type_doesnt_crash(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            event_id = await proto.publish("type.nobody.subscribed", {})
        assert event_id  # just didn't crash

    @pytest.mark.asyncio
    async def test_multiple_subscribers_all_receive(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            q1 = proto.subscribe("fan.out")
            q2 = proto.subscribe("fan.out")
            await proto.publish("fan.out", {"n": 42})
        assert not q1.empty()
        assert not q2.empty()


# ── publish_sync ──────────────────────────────────────────────────────────

class TestPublishSync:
    def test_publish_sync_returns_id(self):
        conn = _mock_db()
        with patch("backend.core.protocol.get_db", return_value=conn):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            event_id = proto.publish_sync("sync.event", {"data": 1})
        assert isinstance(event_id, str)
        conn.execute.assert_called()
        conn.commit.assert_called()

    def test_publish_sync_persists_to_db(self):
        conn = _mock_db()
        with patch("backend.core.protocol.get_db", return_value=conn):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            proto.publish_sync("sync.event", {"data": 1})
        calls = [str(c) for c in conn.execute.call_args_list]
        assert any("pubsub_messages" in c for c in calls)


# ── subscribe / unsubscribe ───────────────────────────────────────────────

class TestSubscription:
    def test_subscribe_returns_queue(self):
        from backend.core.protocol import HiveProtocol
        proto = HiveProtocol()
        q = proto.subscribe("test.sub")
        assert hasattr(q, "get_nowait")

    def test_unsubscribe_removes_queue(self):
        from backend.core.protocol import HiveProtocol
        proto = HiveProtocol()
        q = proto.subscribe("test.unsub")
        proto.unsubscribe("test.unsub", q)
        assert q not in proto._queues.get("test.unsub", [])

    def test_unsubscribe_nonexistent_queue_doesnt_crash(self):
        import asyncio as _asyncio
        from backend.core.protocol import HiveProtocol
        proto = HiveProtocol()
        q = _asyncio.Queue()
        proto.unsubscribe("nonexistent.type", q)  # should not raise


# ── get_log ───────────────────────────────────────────────────────────────

class TestGetLog:
    def test_get_log_returns_list(self):
        row1 = MagicMock()
        row1.__getitem__ = lambda self, k: {
            "id": "r1", "event_type": "test.ev", "payload": '{"x":1}', "created_at": "2026-01-01"
        }[k]
        conn = _mock_db()
        conn.execute.return_value.fetchall.return_value = [row1]
        with patch("backend.core.protocol.get_db", return_value=conn):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            log = proto.get_log(limit=10)
        assert isinstance(log, list)

    def test_get_log_with_event_type_filter(self):
        conn = _mock_db()
        conn.execute.return_value.fetchall.return_value = []
        with patch("backend.core.protocol.get_db", return_value=conn):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            log = proto.get_log(event_type="test.event", limit=5)
        assert isinstance(log, list)

    def test_get_log_handles_malformed_json_payload(self):
        row = MagicMock()
        row.__getitem__ = lambda self, k: {
            "id": "r1", "event_type": "t", "payload": "NOT_JSON", "created_at": "2026-01-01"
        }[k]
        conn = _mock_db()
        conn.execute.return_value.fetchall.return_value = [row]
        with patch("backend.core.protocol.get_db", return_value=conn):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            log = proto.get_log()
        # Should not raise; bad payload becomes {}
        assert log[0]["payload"] == {}


# ── batch worker ─────────────────────────────────────────────────────────

class TestBatchWorker:
    @pytest.mark.asyncio
    async def test_batch_worker_starts(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            await proto.start_batch_worker()
            assert proto._batch_task is not None
            assert not proto._batch_task.done()
            proto._batch_task.cancel()
            try:
                await proto._batch_task
            except asyncio.CancelledError:
                pass

    @pytest.mark.asyncio
    async def test_batch_worker_idempotent(self):
        with patch("backend.core.protocol.get_db", return_value=_mock_db()):
            from backend.core.protocol import HiveProtocol
            proto = HiveProtocol()
            await proto.start_batch_worker()
            task1 = proto._batch_task
            await proto.start_batch_worker()  # second call
            assert proto._batch_task is task1  # same task, not a new one
            task1.cancel()
            try:
                await task1
            except asyncio.CancelledError:
                pass
