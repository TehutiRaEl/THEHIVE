"""
Tests for Arena Voxel Projection — engine persistence + /v11 endpoints.
"""

import asyncio
import os
import sqlite3
import tempfile

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_projection_test.db")
os.environ["DB_PATH"] = _TEST_DB
if os.path.exists(_TEST_DB):
    os.remove(_TEST_DB)

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.config import settings
from backend.core.db import init_db
from backend.tier3.arena_renderer import engine

init_db()  # TestClient without a context manager never runs the lifespan hook
client = TestClient(app)
HEADERS = {"X-API-Key": settings.api_key, "Content-Type": "application/json"}


class TestProjectionEngine:
    def test_run_persists_frames_and_metrics(self):
        result = asyncio.run(engine.run(999, "AgentA", "AgentB", ticks=6))
        assert result["winner"] in ("AgentA", "AgentB")
        assert result["ticks_run"] == 6

        conn = sqlite3.connect(_TEST_DB)
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM arena_projection_frames WHERE challenge_id=999")
        assert c.fetchone()[0] == 6
        # metrics every 5th tick: ticks 0 and 5
        c.execute("SELECT COUNT(*) FROM arena_projections WHERE challenge_id=999")
        assert c.fetchone()[0] == 2
        conn.close()

    def test_rerun_replaces_frames(self):
        asyncio.run(engine.run(998, "AgentA", "AgentB", ticks=4))
        asyncio.run(engine.run(998, "AgentA", "AgentB", ticks=3))
        assert len(engine.get_frames(998)) == 3

    def test_stable_seed(self):
        p1 = engine._params_from_agent("AgentA", 1200, 432.0)
        p2 = engine._params_from_agent("AgentA", 1200, 432.0)
        assert p1["seed"] == p2["seed"]

    def test_frame_shape(self):
        asyncio.run(engine.run(997, "AgentA", "AgentB", ticks=2))
        frames = engine.get_frames(997)
        assert len(frames) == 2
        f = frames[0]
        for key in ("t", "m", "da", "db", "dv"):
            assert key in f
        m = f["m"]
        assert abs(m["challenger_share"] + m["challenged_share"] - 1.0) < 0.01


class TestProjectionEndpoints:
    def _create_challenge(self):
        r = client.post("/v11/arena/challenge", headers=HEADERS,
                        json={"challenger": "Ares", "challenged": "Athena",
                              "proposition": "voxel projection test"})
        assert r.status_code == 200
        return r.json()["challenge_id"]

    def test_full_flow(self):
        cid = self._create_challenge()

        r = client.post(f"/v11/arena/resolve/{cid}", headers=HEADERS)
        assert r.status_code == 200
        arena_winner = r.json()["winner"]

        r = client.post(f"/v11/arena/project/{cid}", headers=HEADERS)
        assert r.status_code == 200
        body = r.json()
        assert body["arena_winner"] == arena_winner
        assert body["projection"]["ticks_run"] == 30
        assert body["frames_url"] == f"/v11/arena/projection/{cid}/frames"

        r = client.get(f"/v11/arena/projection/{cid}/frames", headers=HEADERS)
        assert r.status_code == 200
        body = r.json()
        assert body["total_frames"] == 30
        for key in ("t", "m", "da", "db", "dv"):
            assert key in body["frames"][0]

        # projection writes arena_projections → history endpoint now populated
        r = client.get(f"/v11/arena/history/{cid}", headers=HEADERS)
        assert r.status_code == 200
        assert len(r.json()["history"]) > 0

    def test_project_unknown_challenge_404(self):
        r = client.post("/v11/arena/project/999999", headers=HEADERS)
        assert r.status_code == 404

    def test_frames_unknown_challenge_404(self):
        r = client.get("/v11/arena/projection/888888/frames", headers=HEADERS)
        assert r.status_code == 404

    def test_ticks_clamped(self):
        cid = self._create_challenge()
        r = client.post(f"/v11/arena/project/{cid}?ticks=500", headers=HEADERS)
        assert r.status_code == 200
        assert r.json()["projection"]["ticks_run"] == 60

    def test_tier3_status_reports_renderer(self):
        r = client.get("/v11/tier3/status", headers=HEADERS)
        assert r.status_code == 200
        assert r.json()["arena_renderer"]["available"] is True
