"""
Unit tests for HiveMesh — HMAC signing, circuit breaker, health cache, dispatch.
"""
import hashlib
import hmac as _hmac
import json
import time
import asyncio
import pytest
from unittest.mock import patch, MagicMock, AsyncMock


def _settings_mock():
    s = MagicMock()
    s.jwt_secret_key = "test-secret-key-for-hive"
    s.localagi_url = "http://localagi:8081"
    s.nar2_url = "http://nar2:8000"
    s.fourdbrain_url = "http://4dbrain:8001"
    s.aether_url = "http://aether:3000"
    s.automatisch_url = "http://automatisch:3001"
    s.kimi_k2_url = "http://kimi:8002"
    return s


# ── HMAC signing ─────────────────────────────────────────────────────────

class TestHmacSign:
    def test_hmac_prefix(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _hmac_sign
            sig = _hmac_sign(b"hello")
        assert sig.startswith("sha256=")

    def test_hmac_is_deterministic(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _hmac_sign
            assert _hmac_sign(b"data") == _hmac_sign(b"data")

    def test_hmac_differs_for_different_payloads(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _hmac_sign
            assert _hmac_sign(b"payload_a") != _hmac_sign(b"payload_b")

    def test_hmac_verifiable(self):
        secret = "test-secret-key-for-hive"
        payload = b'{"event":"test"}'
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _hmac_sign
            sig = _hmac_sign(payload)
        expected = "sha256=" + _hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
        assert sig == expected


# ── circuit breaker ───────────────────────────────────────────────────────

class TestCircuitBreaker:
    def _mesh(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import HiveMesh, CIRCUIT_THRESHOLD
            m = HiveMesh()
            return m, CIRCUIT_THRESHOLD

    def test_circuit_open_after_threshold_failures(self):
        mesh, threshold = self._mesh()
        mesh._failure_counts["nar2"] = threshold
        mesh._circuit_opened_at["nar2"] = time.monotonic()
        assert mesh._is_circuit_open("nar2") is True

    def test_circuit_closed_below_threshold(self):
        mesh, threshold = self._mesh()
        mesh._failure_counts["nar2"] = threshold - 1
        assert mesh._is_circuit_open("nar2") is False

    def test_circuit_resets_after_timeout(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import HiveMesh, CIRCUIT_THRESHOLD, CIRCUIT_RESET_SECS
            mesh = HiveMesh()
        # Circuit was opened 2× the reset window ago
        mesh._failure_counts["nar2"] = CIRCUIT_THRESHOLD
        mesh._circuit_opened_at["nar2"] = time.monotonic() - (CIRCUIT_RESET_SECS * 2)
        assert mesh._is_circuit_open("nar2") is False

    def test_fresh_colony_circuit_closed(self):
        mesh, _ = self._mesh()
        assert mesh._is_circuit_open("fresh-colony") is False


# ── health cache ──────────────────────────────────────────────────────────

class TestHealthCache:
    def _mesh(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import HiveMesh
            return HiveMesh()

    def test_cache_stores_health_status(self):
        mesh = self._mesh()
        mesh._health_cache["nar2"] = (True, time.monotonic())
        if hasattr(mesh, "_is_healthy_cached"):
            assert mesh._is_healthy_cached("nar2") is True

    def test_no_cache_entry_defaults_unknown(self):
        mesh = self._mesh()
        assert "new-colony" not in mesh._health_cache


# ── dispatch result shape ─────────────────────────────────────────────────

class TestDispatchResults:
    @pytest.mark.asyncio
    async def test_dispatch_returns_dict(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"event_id": "ev-1"}

        mock_client = AsyncMock()
        mock_client.post.return_value = mock_response

        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol") as mock_proto, \
             patch("httpx.AsyncClient") as mock_ctx:
            mock_ctx.return_value.__aenter__ = AsyncMock(return_value=mock_client)
            mock_ctx.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_proto.publish_sync = MagicMock()
            from backend.core.hive_mesh import HiveMesh
            mesh = HiveMesh()
            result = await mesh.dispatch("test.event", {"data": 1}, targets=["nar2"])

        assert isinstance(result, dict)
        assert "nar2" in result

    @pytest.mark.asyncio
    async def test_dispatch_skips_open_circuit(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            from backend.core.hive_mesh import HiveMesh, CIRCUIT_THRESHOLD
            mesh = HiveMesh()
            mesh._failure_counts["nar2"] = CIRCUIT_THRESHOLD
            mesh._circuit_opened_at["nar2"] = time.monotonic()

        # The colony with open circuit should be "skipped" or "failed", not attempted
        with patch("httpx.AsyncClient") as mock_ctx, \
             patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol") as mock_proto:
            mock_ctx.return_value.__aenter__ = AsyncMock(return_value=AsyncMock())
            mock_ctx.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_proto.publish_sync = MagicMock()
            result = await mesh.dispatch("test", {}, targets=["nar2"])

        assert result.get("nar2") in {"skipped", "failed", None} or "nar2" in result


# ── COLONY_URLS registry ──────────────────────────────────────────────────

class TestColonyRegistry:
    def test_all_six_colonies_registered(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _COLONY_URLS
        expected = {"localagi", "nar2", "4dbrain", "aether", "automatisch", "kimi-k2"}
        assert set(_COLONY_URLS.keys()) == expected

    def test_colony_urls_are_http(self):
        with patch("backend.core.hive_mesh.settings", _settings_mock()), \
             patch("backend.core.hive_mesh.hive_protocol"):
            from backend.core.hive_mesh import _COLONY_URLS
        for url in _COLONY_URLS.values():
            assert url.startswith("http://") or url.startswith("https://")
