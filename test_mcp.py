#!/usr/bin/env python3
"""Smoke tests for MCP stdio server tools (in-process)."""

from __future__ import annotations

import sys
from pathlib import Path

MCP = Path(__file__).resolve().parent
sys.path.insert(0, str(MCP))

from mcp_server import (  # noqa: E402
    handle,
    tool_bridge_run,
    tool_hive_status,
    tool_medium_list_inbox,
    tool_medium_write_inbox,
    tool_phase0_seed,
    tool_phase0_stats,
    tool_phase0_walk,
)


def test_tools_list():
    resp = handle({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
    assert "result" in resp
    names = {t["name"] for t in resp["result"]["tools"]}
    assert "bridge_run" in names
    assert "hive_status" in names
    assert "phase0_walk" in names
    print("PASS test_tools_list", sorted(names))


def test_bridge_run():
    r = tool_bridge_run({"text": "Decided MCP tools must call real Bridge pipeline.", "platform": "hive"})
    assert r.get("bridge_id")
    assert "prompt_preview" in r
    print("PASS test_bridge_run", r["bridge_id"])


def test_hive_status():
    r = tool_hive_status({})
    assert "architect" in r
    assert "bridge_stores" in r
    print("PASS test_hive_status", r["architect"])


def test_medium_write_list():
    w = tool_medium_write_inbox({"text": "MCP test write", "slug": "mcp-test-write"})
    assert w.get("written")
    lst = tool_medium_list_inbox({})
    assert "inbox" in lst
    print("PASS test_medium_write_list", lst.get("count"))


def test_phase0_tools():
    s = tool_phase0_seed({})
    assert s.get("seeded", 0) >= 1
    st = tool_phase0_stats({})
    assert st.get("nodes", 0) >= 1
    w = tool_phase0_walk({"id": "title-18"})
    assert "node" in w
    print("PASS test_phase0_tools", st.get("nodes"))


def test_initialize():
    resp = handle({"jsonrpc": "2.0", "id": 0, "method": "initialize", "params": {}})
    assert resp["result"]["serverInfo"]["name"] == "hive-mcp"
    print("PASS test_initialize")


if __name__ == "__main__":
    test_initialize()
    test_tools_list()
    test_bridge_run()
    test_hive_status()
    test_medium_write_list()
    test_phase0_tools()
    print("All MCP tests OK")
