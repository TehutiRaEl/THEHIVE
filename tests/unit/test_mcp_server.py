"""
Unit tests for backend/mcp_server/server.py — the real federation MCP server
(Phase E, 2026-07-22). Exercises all three tools (hive_dispatch,
hive_memory_recall, hive_law_query) directly.

Stubs the `mcp` package before import instead of requiring the real SDK to be
installed. This repo's own environment has hit real installability problems
with `mcp`'s dependency chain (it drags in a starlette/pydantic upgrade that
conflicts with the pinned fastapi version elsewhere in requirements.txt) —
testing against a minimal stub keeps this suite fast, dependency-free, and
stable, while still exercising 100% of this module's own logic. The stub's
`.tool()` decorator is a passthrough (registers, returns the function
unchanged), matching FastMCP's own real behavior — nothing about the actual
tool logic under test is faked.
"""
import sys
import types

import pytest
from unittest.mock import patch, MagicMock, AsyncMock


def _install_mcp_stub():
    if "mcp.server.fastmcp" in sys.modules and hasattr(sys.modules["mcp.server.fastmcp"], "FastMCP"):
        return  # real SDK (or a previously-installed stub) already present

    class _StubFastMCP:
        def __init__(self, name=None, instructions=None):
            self.name = name
            self.instructions = instructions
            self.settings = types.SimpleNamespace(host=None, port=None)
            self._tools = {}

        def tool(self):
            def decorator(fn):
                self._tools[fn.__name__] = fn
                return fn
            return decorator

        def run(self, transport=None):
            raise NotImplementedError("stub FastMCP.run() should never be called in tests")

    mcp_pkg = types.ModuleType("mcp")
    mcp_server_pkg = types.ModuleType("mcp.server")
    mcp_fastmcp_pkg = types.ModuleType("mcp.server.fastmcp")
    mcp_fastmcp_pkg.FastMCP = _StubFastMCP
    mcp_server_pkg.fastmcp = mcp_fastmcp_pkg
    mcp_pkg.server = mcp_server_pkg

    sys.modules["mcp"] = mcp_pkg
    sys.modules["mcp.server"] = mcp_server_pkg
    sys.modules["mcp.server.fastmcp"] = mcp_fastmcp_pkg


_install_mcp_stub()

from backend.mcp_server import server as mcp_server_module  # noqa: E402


# ── hive_dispatch ─────────────────────────────────────────────────────────

class TestHiveDispatch:
    @pytest.mark.asyncio
    async def test_wraps_hive_mesh_dispatch_and_shapes_result(self):
        fake_results = {"nar2": "ev-1", "aether": "skipped"}
        mock_hive_mesh = MagicMock()
        mock_hive_mesh.dispatch = AsyncMock(return_value=fake_results)

        with patch("backend.core.hive_mesh.hive_mesh", mock_hive_mesh):
            result = await mcp_server_module.hive_dispatch("health_check", {"a": 1})

        mock_hive_mesh.dispatch.assert_awaited_once_with("health_check", {"a": 1})
        assert result == {"event_type": "health_check", "results": fake_results}

    @pytest.mark.asyncio
    async def test_defaults_payload_to_empty_dict_when_omitted(self):
        mock_hive_mesh = MagicMock()
        mock_hive_mesh.dispatch = AsyncMock(return_value={})

        with patch("backend.core.hive_mesh.hive_mesh", mock_hive_mesh):
            await mcp_server_module.hive_dispatch("ping")

        mock_hive_mesh.dispatch.assert_awaited_once_with("ping", {})


# ── hive_memory_recall ────────────────────────────────────────────────────

class TestHiveMemoryRecall:
    @pytest.mark.asyncio
    async def test_available_returns_matches_and_passes_params(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {"available": True, "matches": [{"text": "x"}]}
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch("httpx.AsyncClient") as mock_ctx:
            mock_ctx.return_value.__aenter__ = AsyncMock(return_value=mock_client)
            mock_ctx.return_value.__aexit__ = AsyncMock(return_value=False)
            result = await mcp_server_module.hive_memory_recall("what happened", top_k=2)

        assert result == {"available": True, "matches": [{"text": "x"}]}
        mock_client.get.assert_awaited_once()
        _, kwargs = mock_client.get.call_args
        assert kwargs["params"] == {"q": "what happened", "topK": 2}

    @pytest.mark.asyncio
    async def test_degrades_when_vectorize_not_provisioned(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {"available": False}
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch("httpx.AsyncClient") as mock_ctx:
            mock_ctx.return_value.__aenter__ = AsyncMock(return_value=mock_client)
            mock_ctx.return_value.__aexit__ = AsyncMock(return_value=False)
            result = await mcp_server_module.hive_memory_recall("anything")

        assert result["available"] is False
        assert "not provisioned" in result["reason"]
        assert result["matches"] == []

    @pytest.mark.asyncio
    async def test_degrades_on_unreachable_endpoint_never_raises(self):
        with patch("httpx.AsyncClient") as mock_ctx:
            mock_ctx.return_value.__aenter__ = AsyncMock(side_effect=ConnectionError("no route"))
            result = await mcp_server_module.hive_memory_recall("anything")

        assert result["available"] is False
        assert "unreachable" in result["reason"]
        assert result["matches"] == []

    @pytest.mark.asyncio
    async def test_uses_env_override_for_memory_base(self, monkeypatch):
        monkeypatch.setenv("HIVE_MEMORY_BASE", "https://custom.example.com/")
        mock_response = MagicMock()
        mock_response.json.return_value = {"available": True, "matches": []}
        mock_client = AsyncMock()
        mock_client.get = AsyncMock(return_value=mock_response)

        with patch("httpx.AsyncClient") as mock_ctx:
            mock_ctx.return_value.__aenter__ = AsyncMock(return_value=mock_client)
            mock_ctx.return_value.__aexit__ = AsyncMock(return_value=False)
            await mcp_server_module.hive_memory_recall("q")

        args, _ = mock_client.get.call_args
        assert args[0] == "https://custom.example.com/v11/memory/search"


# ── hive_law_query ────────────────────────────────────────────────────────

class TestHiveLawQuery:
    def test_no_article_returns_both_documents_in_full(self):
        result = mcp_server_module.hive_law_query()
        assert "F-001" in result["soul_md"]
        assert "F-006" in result["soul_md"]
        assert result["permissions_md"]  # non-empty
        assert "soul.md" in result["source"]

    def test_real_article_found_in_soul_md(self):
        result = mcp_server_module.hive_law_query("F-001")
        assert result["found"] is True
        assert result["source"] == "soul.md"
        assert "F-001" in result["text"]
        assert "Data Sovereignty" in result["text"]

    def test_article_lookup_is_case_insensitive(self):
        result = mcp_server_module.hive_law_query("f-005")
        assert result["found"] is True
        assert "F-005" in result["text"]

    def test_section_capture_stops_before_next_heading(self):
        result = mcp_server_module.hive_law_query("F-001")
        # F-001's captured section must not bleed into F-002's text
        assert "F-002" not in result["text"]

    def test_nonexistent_article_reports_not_found(self):
        result = mcp_server_module.hive_law_query("F-999")
        assert result["found"] is False
        assert result["article"] == "F-999"
        assert "note" in result
