"""
Integration test proving CAMPAIGN.html task 26's fix: approving a HITL
request whose action_type is hive_mesh.dispatch:* must actually re-fire the
original held event through the real send path — not just flip a database
row's status, which was the bug AUDIT_LEDGER.md's 2026-08-02 entry found via
a standalone reproduction (mock_send.called was False after approval).

Network is never touched: _send_to_colony is mocked, same discipline
test_hive_mesh.py already uses for dispatch tests. What this test proves is
the WIRING — that resolving an approval actually calls the real dispatch
path with the original event_type/payload — not that colonies are reachable.
"""
import os
import tempfile

# Unique per process (not a fixed shared path) — a fixed path here previously
# let stale rows from an earlier pytest invocation's now-dead HumanInTheLoop()
# in-memory state leak into this run's DB-backed lookups. See the note in
# _find_pending_request() below for what that looked like when it happened.
_TEST_DB = os.path.join(
    tempfile.gettempdir(), f"hive_hitl_redispatch_test_{os.getpid()}.db"
)
os.environ.setdefault("DB_PATH", _TEST_DB)

from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from backend.main import app
from backend.core.config import settings
from backend.core.hive_mesh import hive_mesh

client = TestClient(app)
HEADERS = {"X-API-Key": settings.api_key}


def _find_pending_request(action_type_prefix):
    r = client.get("/v11/hitl/requests", params={"status": "pending"}, headers=HEADERS)
    assert r.status_code == 200
    matches = [
        row for row in r.json()["requests"]
        if row["action_type"].startswith(action_type_prefix)
    ]
    assert matches, f"no pending request with action_type starting {action_type_prefix!r}"
    # get_requests() orders by requested_at DESC, so index 0 is the most
    # recent — the on-disk test DB is a fixed path shared across separate
    # pytest invocations, so older matching rows from a prior run's now-dead
    # HumanInTheLoop() instance can still be sitting in it (index[-1] picked
    # one of those once and failed resolve_request() with "not found" since
    # it only exists in that dead process's in-memory dict, not this one's).
    return matches[0]["id"]


def test_approving_a_held_dispatch_actually_redispatches(monkeypatch):
    mock_send = AsyncMock(return_value="sent-ok")
    monkeypatch.setattr(hive_mesh, "_send_to_colony", mock_send)

    # 1. A non-Tier-1-safe event type gets held, not fired — existing behaviour.
    r = client.post(
        "/v11/hive/dispatch",
        params={"event_type": "task_dispatch"},
        json={"payload": {"msg": "hello colony"}, "targets": ["nar2"]},
        headers=HEADERS,
    )
    assert r.status_code == 200
    assert r.json()["dispatched_to"] == {"nar2": "held_for_review"}
    mock_send.assert_not_called()

    request_id = _find_pending_request("hive_mesh.dispatch:task_dispatch")

    # 2. Approving it must cause the real send path to fire — this is the fix.
    r = client.post(
        "/v11/hitl/resolve",
        json={"request_id": request_id, "approved": True, "resolved_by": "founder"},
        headers=HEADERS,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "approved"
    assert body["redispatched"] == {"nar2": "sent-ok"}
    mock_send.assert_awaited_once()
    _, sent_cid, sent_event_type, sent_payload = mock_send.call_args.args
    assert sent_cid == "nar2"
    assert sent_event_type == "task_dispatch"
    assert sent_payload == {"msg": "hello colony"}


def test_rejecting_a_held_dispatch_never_redispatches(monkeypatch):
    mock_send = AsyncMock(return_value="sent-ok")
    monkeypatch.setattr(hive_mesh, "_send_to_colony", mock_send)

    r = client.post(
        "/v11/hive/dispatch",
        params={"event_type": "move_funds"},
        json={"payload": {"amount": 1}, "targets": ["nar2"]},
        headers=HEADERS,
    )
    assert r.status_code == 200
    request_id = _find_pending_request("hive_mesh.dispatch:move_funds")

    r = client.post(
        "/v11/hitl/resolve",
        json={"request_id": request_id, "approved": False, "resolved_by": "founder"},
        headers=HEADERS,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "rejected"
    assert "redispatched" not in body
    mock_send.assert_not_called()


def test_unrelated_hitl_approval_never_touches_hive_mesh(monkeypatch):
    """A HITL approval whose action_type is NOT hive_mesh.dispatch:* must
    never trigger a redispatch attempt — the wiring is scoped narrowly."""
    from backend.core.hitl import hitl
    import asyncio

    mock_send = AsyncMock(return_value="sent-ok")
    monkeypatch.setattr(hive_mesh, "_send_to_colony", mock_send)

    request_id = asyncio.run(
        hitl.request_approval("some_other_action", {"x": 1}, "tester")
    )

    r = client.post(
        "/v11/hitl/resolve",
        json={"request_id": request_id, "approved": True, "resolved_by": "founder"},
        headers=HEADERS,
    )
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "approved"
    assert "redispatched" not in body
    mock_send.assert_not_called()
