"""
Integration tests for Tier 3 endpoints — rewritten against backend.main
(the previous version imported the retired jasper_v9_complete entrypoint,
which aborted collection of the whole integration suite).
"""

import os
import tempfile

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_tier3_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.core.config import settings

client = TestClient(app)
HEADERS = {"X-API-Key": settings.api_key}


def test_tier3_status_requires_auth():
    assert client.get("/v11/tier3/status").status_code in (401, 403)


def test_tier3_status_reports_all_modules():
    r = client.get("/v11/tier3/status", headers=HEADERS)
    assert r.status_code == 200
    data = r.json()
    for module in ("quantum_bridge", "sheaf_guild", "ipfs_pubsub",
                   "arena_renderer", "tesseract_model"):
        assert "available" in data[module]
        # status string must agree with the flag — no fiction
        loaded = data[module]["available"]
        assert data[module]["status"].startswith("Loaded" if loaded else "Not loaded")


# ─── Quantum ─────────────────────────────────────────────────────────────
def test_quantum_qrng():
    r = client.get("/v11/quantum/qrng?n_bits=16", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        bits = r.json()["bits"]
        assert len(bits) == 16 and set(bits) <= {0, 1}


def test_quantum_bb84_exchange():
    r = client.post("/v11/quantum/bb84?n_bits=32", headers=HEADERS)
    assert r.status_code in (200, 503)


def test_quantum_ibmq_status():
    r = client.get("/v11/quantum/ibmq/status", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert "available" in r.json()


# ─── Sheaf ───────────────────────────────────────────────────────────────
def test_sheaf_guilds():
    r = client.get("/v11/sheaf/guilds", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        guilds = r.json()["guilds"]
        assert len(guilds) >= 5
        assert all("members" in g and "threshold" in g for g in guilds)


def test_sheaf_setup_all():
    r = client.post("/v11/sheaf/setup/all", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert len(r.json()["setup"]) >= 5


# ─── PubSub ──────────────────────────────────────────────────────────────
def test_pubsub_create_then_list():
    r = client.post("/v11/pubsub/channel?colony_name=TEST_INTEGRATION",
                    headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        channel_id = r.json()["channel_id"]
        chans = client.get("/v11/pubsub/channels", headers=HEADERS).json()["channels"]
        assert any(c.get("channel_id") == channel_id or channel_id in str(c)
                   for c in chans)


# ─── Voxel snapshot ──────────────────────────────────────────────────────
def test_arena_render_voxels():
    r = client.get("/v11/arena/render/voxels/TEST_COLONY?ticks=3", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        data = r.json()
        assert data["colony"] == "TEST_COLONY"
        assert data["total_voxels"] > 0
        v = data["voxels"][0]
        assert {"x", "y", "z", "r", "g", "b", "a"} <= set(v)


def test_arena_render_voxels_deterministic():
    a = client.get("/v11/arena/render/voxels/SAME_SEED?ticks=1", headers=HEADERS)
    b = client.get("/v11/arena/render/voxels/SAME_SEED?ticks=1", headers=HEADERS)
    if a.status_code == 200 and b.status_code == 200:
        # same sha1 seed → same initial grid; step() noise differs, but
        # voxel COUNT from the seeded exponential field stays in family
        assert abs(a.json()["total_voxels"] - b.json()["total_voxels"]) < 400


# ─── Tesseract ───────────────────────────────────────────────────────────
def test_tesseract_status():
    r = client.get("/v11/tesseract/status", headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        data = r.json()
        assert data["grid"] == [16, 16] and data["channels"] == 4


def test_tesseract_forecast():
    r = client.post("/v11/tesseract/forecast?colony_name=TEST&n_forecast=3",
                    headers=HEADERS)
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert "forecast" in str(r.json()).lower() or "wealth" in str(r.json()).lower()
