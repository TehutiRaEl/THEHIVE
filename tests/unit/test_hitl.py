"""
Unit tests for backend/core/hitl.py — the Human-in-the-Loop approval queue.
Previously untested despite being load-bearing since Phase F (2026-07-22):
hive_mesh.dispatch() now calls hitl.request_approval() for any event_type
outside the Tier-1-safe allow-list (see test_hive_mesh.py's TestTierGate),
so a bug here would silently break the tier gate's hold-for-review path.

Each test builds its own HumanInTheLoop() instance rather than importing the
module singleton, so in-memory pending_requests state never leaks between
tests (the underlying sqlite hitl_requests table is shared across the suite,
same as every other table here — request IDs are uuid4, so collisions
across tests are not a practical concern).
"""
import asyncio
import os
import tempfile

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_hitl_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

import pytest

from backend.core.hitl import HumanInTheLoop
from backend.core.config import settings


class TestRequestApproval:
    @pytest.mark.asyncio
    async def test_creates_a_pending_request(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("hive_mesh.dispatch:task_dispatch", {"a": 1}, "hive_mesh")
        assert request_id.startswith("hitl_")
        assert h.is_pending(request_id) is True
        assert h.get_pending_count() == 1

    @pytest.mark.asyncio
    async def test_persists_to_the_database(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("test_action", {"x": "y"}, "tester")
        row = h.get_request(request_id)
        assert row is not None
        assert row["action_type"] == "test_action"
        assert row["status"] == "pending"

    @pytest.mark.asyncio
    async def test_distinct_calls_get_distinct_ids(self):
        h = HumanInTheLoop()
        id1 = await h.request_approval("a", {}, "t")
        id2 = await h.request_approval("b", {}, "t")
        assert id1 != id2
        assert h.get_pending_count() == 2


class TestResolveRequest:
    @pytest.mark.asyncio
    async def test_approve_marks_resolved(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        result = await h.resolve_request(request_id, approved=True, resolved_by="founder")
        assert result == {
            "request_id": request_id, "approved": True,
            "resolved_by": "founder", "status": "approved",
        }
        assert h.is_resolved(request_id) is True
        assert h.is_pending(request_id) is False

    @pytest.mark.asyncio
    async def test_reject_marks_resolved_but_not_approved(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        result = await h.resolve_request(request_id, approved=False, resolved_by="founder")
        assert result["status"] == "rejected"
        assert h.is_resolved(request_id) is True

    @pytest.mark.asyncio
    async def test_resolving_unknown_id_raises(self):
        h = HumanInTheLoop()
        with pytest.raises(ValueError, match="not found"):
            await h.resolve_request("hitl_doesnotexist", approved=True, resolved_by="founder")

    @pytest.mark.asyncio
    async def test_resolving_twice_raises(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        await h.resolve_request(request_id, approved=True, resolved_by="founder")
        with pytest.raises(ValueError, match="already"):
            await h.resolve_request(request_id, approved=True, resolved_by="founder")


class TestCancelRequest:
    @pytest.mark.asyncio
    async def test_cancel_pending_request(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        result = await h.cancel_request(request_id)
        assert result["status"] == "cancelled"
        assert h.is_pending(request_id) is False

    @pytest.mark.asyncio
    async def test_cancel_unknown_id_raises(self):
        h = HumanInTheLoop()
        with pytest.raises(ValueError, match="not found"):
            await h.cancel_request("hitl_nope")

    @pytest.mark.asyncio
    async def test_cancel_already_resolved_raises(self):
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        await h.resolve_request(request_id, approved=True, resolved_by="founder")
        with pytest.raises(ValueError, match="already"):
            await h.cancel_request(request_id)


class TestAutoExpire:
    @pytest.mark.asyncio
    async def test_pending_request_expires_after_timeout(self, monkeypatch):
        monkeypatch.setattr(settings, "hitl_timeout_seconds", 0.05)
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        assert h.is_pending(request_id) is True
        await asyncio.sleep(0.2)
        assert h.is_expired(request_id) is True
        assert h.is_pending(request_id) is False

    @pytest.mark.asyncio
    async def test_resolving_before_expiry_prevents_expiration(self, monkeypatch):
        monkeypatch.setattr(settings, "hitl_timeout_seconds", 0.1)
        h = HumanInTheLoop()
        request_id = await h.request_approval("a", {}, "t")
        await h.resolve_request(request_id, approved=True, resolved_by="founder")
        await asyncio.sleep(0.2)
        # already resolved before the auto-expire task fired — must stay resolved
        assert h.is_resolved(request_id) is True
        assert h.is_expired(request_id) is False


class TestQueries:
    @pytest.mark.asyncio
    async def test_get_requests_filters_by_status(self):
        h = HumanInTheLoop()
        pending_id = await h.request_approval("keep_pending", {}, "t")
        resolved_id = await h.request_approval("will_resolve", {}, "t")
        await h.resolve_request(resolved_id, approved=True, resolved_by="founder")

        pending_rows = h.get_requests(status="pending")
        assert any(r["id"] == pending_id for r in pending_rows)
        assert not any(r["id"] == resolved_id for r in pending_rows)

    def test_get_request_returns_none_for_unknown_id(self):
        h = HumanInTheLoop()
        assert h.get_request("hitl_totally_made_up") is None

    @pytest.mark.asyncio
    async def test_get_all_pending_reflects_in_memory_state(self):
        h = HumanInTheLoop()
        await h.request_approval("a", {}, "t")
        await h.request_approval("b", {}, "t")
        assert len(h.get_all_pending()) == 2
        assert all(r["status"] == "pending" for r in h.get_all_pending())
