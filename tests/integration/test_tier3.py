"""
Integration tests for Tier 3 endpoints
"""

import pytest
import httpx
from fastapi.testclient import TestClient

from jasper_v9_complete import app

client = TestClient(app)

# Test authentication
def test_tier3_status_requires_auth():
    response = client.get("/tier3/status")
    assert response.status_code in [401, 403]

def test_tier3_status_with_auth():
    # First get a token
    token_resp = client.post("/auth/token")
    assert token_resp.status_code == 200
    token = token_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/tier3/status", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "quantum_bridge" in data
    assert "sheaf_guild" in data
    assert "ipfs_pubsub" in data
    assert "arena_renderer" in data
    assert "tesseract_model" in data

# ─── Quantum Endpoints ──────────────────────────────────────
def test_quantum_qrng():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/quantum/qrng?n_bits=16", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "bits" in data
    assert len(data["bits"]) == 16

def test_quantum_ibmq_status():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/quantum/ibmq/status", headers=headers)
    assert response.status_code in [200, 503]  # 503 if module not available

# ─── Sheaf Endpoints ──────────────────────────────────────
def test_sheaf_guilds():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/sheaf/guilds", headers=headers)
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        data = response.json()
        assert "guilds" in data

def test_sheaf_setup():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/sheaf/setup/all", headers=headers)
    assert response.status_code in [200, 503]

# ─── PubSub Endpoints ─────────────────────────────────────
def test_pubsub_channels():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/pubsub/channels", headers=headers)
    assert response.status_code in [200, 503]

def test_pubsub_create_channel():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/pubsub/channel?colony_name=TEST_INTEGRATION", headers=headers)
    assert response.status_code in [200, 503]

# ─── Arena Renderer Endpoints ─────────────────────────────
def test_arena_voxels():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/arena/render/voxels/TEST_COLONY?ticks=3", headers=headers)
    assert response.status_code in [200, 503]
    if response.status_code == 200:
        data = response.json()
        assert "colony" in data
        assert "voxels" in data

# ─── Tesseract Model Endpoints ────────────────────────────
def test_tesseract_status():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/tesseract_model/status", headers=headers)
    assert response.status_code in [200, 503]

def test_tesseract_forecast():
    token = client.post("/auth/token").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.post("/tesseract_model/forecast?colony_name=TEST&n_forecast=3", headers=headers)
    assert response.status_code in [200, 503]
