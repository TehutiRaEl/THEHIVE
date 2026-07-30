"""
Unit tests for backend/api/colony.py — the Colony Standard Layer, in
particular _verify_hive_signature(): the HMAC gate found missing from the
Queen's own /colony/events during Phase C (2026-07-22), fixed the same
session, and previously untested. Exercises the real routes via a live
FastAPI TestClient (not just the signing helper in isolation), the same
pattern already used by tests/integration/test_tier3.py.
"""
import hashlib
import hmac as _hmac
import json
import os
import tempfile

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_colony_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

from fastapi.testclient import TestClient

from backend.main import app
from backend.core.config import settings

client = TestClient(app)


def _sign(body: bytes, secret: str) -> str:
    return "sha256=" + _hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


# ── /colony/info, /colony/health, /colony/capabilities ────────────────────

class TestColonyIdentityRoutes:
    def test_info_returns_identity(self):
        r = client.get("/colony/info")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "active"
        assert "soul_md_hash" in data

    def test_health_reports_a_real_status(self):
        r = client.get("/colony/health")
        assert r.status_code == 200
        assert r.json()["status"] in ("healthy", "degraded")

    def test_capabilities_returns_identity_and_uptime(self):
        r = client.get("/colony/capabilities")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "healthy"
        assert "uptime_s" in data
        assert data["health_endpoint"] == "/colony/health"


# ── POST /colony/events — signature verification ───────────────────────────

class TestReceiveEventSignatureVerification:
    def test_permissive_when_secret_is_placeholder_default(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "super-secret-change-me")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        r = client.post("/colony/events", content=body)
        assert r.status_code == 200
        assert r.json()["received"] is True

    def test_permissive_when_secret_unset(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        r = client.post("/colony/events", content=body)
        assert r.status_code == 200

    def test_rejects_missing_signature_once_real_secret_set(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "a-real-federation-secret")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        r = client.post("/colony/events", content=body)
        assert r.status_code == 401
        assert "Missing X-Hive-Signature" in r.json()["detail"]

    def test_rejects_tampered_signature(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "a-real-federation-secret")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        bad_sig = _sign(body, "wrong-secret")
        r = client.post("/colony/events", content=body, headers={"X-Hive-Signature": bad_sig})
        assert r.status_code == 401
        assert "Invalid hive signature" in r.json()["detail"]

    def test_accepts_correctly_signed_request(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "a-real-federation-secret")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        good_sig = _sign(body, "a-real-federation-secret")
        r = client.post("/colony/events", content=body, headers={"X-Hive-Signature": good_sig})
        assert r.status_code == 200
        assert r.json()["received"] is True

    def test_signature_must_cover_the_exact_raw_body_bytes(self, monkeypatch):
        """A signature computed over a differently-serialized (but semantically
        equivalent) body must fail — proves verification is over raw bytes,
        not a re-parsed/re-serialized representation that could be spoofed."""
        monkeypatch.setattr(settings, "jwt_secret_key", "a-real-federation-secret")
        real_body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        reformatted_body = json.dumps(
            {"event_type": "constitution_update", "source_colony": "nar2"}, indent=2
        ).encode()
        sig_for_wrong_bytes = _sign(reformatted_body, "a-real-federation-secret")
        r = client.post("/colony/events", content=real_body, headers={"X-Hive-Signature": sig_for_wrong_bytes})
        assert r.status_code == 401

    def test_missing_sha256_prefix_is_rejected(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "a-real-federation-secret")
        body = json.dumps({"event_type": "constitution_update", "source_colony": "nar2"}).encode()
        raw_hex = _hmac.new(b"a-real-federation-secret", body, hashlib.sha256).hexdigest()
        r = client.post("/colony/events", content=body, headers={"X-Hive-Signature": raw_hex})
        assert r.status_code == 401
        assert "Missing X-Hive-Signature" in r.json()["detail"]


# ── POST /colony/events — event-type handling ──────────────────────────────

class TestReceiveEventHandling:
    def _post(self, body: dict, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "")  # permissive; focus on handling logic
        return client.post("/colony/events", content=json.dumps(body).encode())

    def test_constitution_update_returns_hash(self, monkeypatch):
        r = self._post({"event_type": "constitution_update", "source_colony": "queen"}, monkeypatch)
        assert r.status_code == 200
        data = r.json()
        assert data["event"] == "constitution_update"
        assert "soul_md_hash" in data

    def test_agent_migrated_echoes_agent_name(self, monkeypatch):
        r = self._post(
            {"event_type": "agent_migrated", "source_colony": "queen",
             "payload": {"agent_name": "Fable"}},
            monkeypatch,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["agent"] == "Fable"
        assert "spawn_agent" in data["note"]

    def test_agent_migrated_defaults_name_when_missing(self, monkeypatch):
        r = self._post({"event_type": "agent_migrated", "source_colony": "queen"}, monkeypatch)
        assert r.json()["agent"] == "unknown"

    def test_soul_transfer_returns_settle_note(self, monkeypatch):
        r = self._post({"event_type": "soul_transfer", "source_colony": "queen"}, monkeypatch)
        assert r.json()["note"].startswith("Transfer logged")

    def test_task_dispatch_returns_queued_note(self, monkeypatch):
        r = self._post({"event_type": "task_dispatch", "source_colony": "queen"}, monkeypatch)
        assert r.json()["note"].startswith("Task queued")

    def test_unknown_event_type_is_still_acknowledged(self, monkeypatch):
        r = self._post({"event_type": "something_new", "source_colony": "queen"}, monkeypatch)
        assert r.status_code == 200
        assert r.json()["event"] == "something_new"

    def test_invalid_json_body_returns_422(self, monkeypatch):
        monkeypatch.setattr(settings, "jwt_secret_key", "")
        r = client.post("/colony/events", content=b"not json at all")
        assert r.status_code == 422

    def test_timestamp_defaulted_when_omitted(self, monkeypatch):
        r = self._post({"event_type": "constitution_update", "source_colony": "queen"}, monkeypatch)
        assert r.status_code == 200  # route doesn't echo timestamp, but must not fail validating/defaulting it


# ── GET /colony/manifest ────────────────────────────────────────────────────

class TestManifest:
    def test_manifest_parses_known_colonies_into_health_urls(self, monkeypatch):
        monkeypatch.setattr(
            settings, "known_colonies",
            ["NAR2|security|http://nar2.example.com", "4DBRAIN|memory|http://4dbrain.example.com/"],
        )
        r = client.get("/colony/manifest")
        assert r.status_code == 200
        data = r.json()
        assert data["count"] == 2
        assert data["colonies"][0] == {
            "name": "NAR2", "role": "security", "base_url": "http://nar2.example.com",
            "health_url": "http://nar2.example.com/colony/health",
        }
        # trailing slash on base_url must not produce a double slash in health_url
        assert data["colonies"][1]["health_url"] == "http://4dbrain.example.com/colony/health"

    def test_manifest_skips_malformed_entries(self, monkeypatch):
        monkeypatch.setattr(settings, "known_colonies", ["not-enough-fields"])
        r = client.get("/colony/manifest")
        assert r.json()["count"] == 0
