import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_board_unauthorized():
    response = client.get("/v1/board")
    assert response.status_code == 401

def test_constitution_check():
    response = client.post("/v1/constitution/check?action_type=delete_agent&actor=test&params=%7B%7D")
    assert response.status_code == 401
