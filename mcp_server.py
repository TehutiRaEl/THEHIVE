#!/usr/bin/env python3
"""
Hive MCP stdio server — Bridge + Medium + Operator status tools.

Implements a minimal JSON-RPC MCP-style tool host over stdin/stdout.
Not a full multi-tenant cloud; single local process, sovereign-first.

Usage:
  python mcp_server.py
  # or:  echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | python mcp_server.py
"""

from __future__ import annotations

import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]  # bridge/
IMPL = ROOT / "implementation"
MEDIUM = ROOT / "medium_channel"
OPS_ROOT = ROOT.parent  # TheCopy-ops

sys.path.insert(0, str(IMPL))

from pipeline import run_bridge  # noqa: E402


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


TOOLS = [
    {
        "name": "bridge_run",
        "description": "Run five-layer Bridge pipeline on text (Capture→Compress→Store→Inject→Evolve).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
                "platform": {"type": "string", "default": "hive"},
            },
            "required": ["text"],
        },
    },
    {
        "name": "medium_list_inbox",
        "description": "List files currently in medium_channel/inbox.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "medium_list_outbox",
        "description": "List recent medium_channel/outbox files.",
        "inputSchema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "default": 20}},
        },
    },
    {
        "name": "medium_write_inbox",
        "description": "Write a founder message into medium inbox for daemon/pipeline.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "text": {"type": "string"},
                "slug": {"type": "string"},
            },
            "required": ["text"],
        },
    },
    {
        "name": "medium_process_inbox",
        "description": "Run medium daemon once (process all inbox items).",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "hive_status",
        "description": "Return honest Architect / Bridge / Operator status snapshot.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "bridge_list_stores",
        "description": "List stored bridge ids under implementation/bridges.",
        "inputSchema": {
            "type": "object",
            "properties": {"limit": {"type": "integer", "default": 20}},
        },
    },
    {
        "name": "phase0_stats",
        "description": "Phase 0 file-native legal graph stats (nodes/edges/by_level).",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "phase0_walk",
        "description": "Walk Phase 0 provision hierarchy from a node id (e.g. title-18, 18-usc-1001).",
        "inputSchema": {
            "type": "object",
            "properties": {"id": {"type": "string", "default": "usc"}},
            "required": ["id"],
        },
    },
    {
        "name": "phase0_seed",
        "description": "Seed sample USC hierarchy into file-native graph if empty.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def tool_bridge_run(args: dict) -> dict:
    text = args.get("text") or ""
    platform = args.get("platform") or "hive"
    session = {
        "id": f"mcp-{uuid.uuid4().hex[:12]}",
        "source": "mcp_server",
        "platform": "hive",
        "conversation": [{"role": "user", "content": text}],
        "tags": ["mcp"],
    }
    bridge = run_bridge(session, platform=platform, evolve_success=True)
    return {
        "bridge_id": bridge.get("id"),
        "store": bridge.get("store"),
        "inject_target": bridge.get("inject_target"),
        "prompt_preview": (bridge.get("injection") or {}).get("prompt_text", "")[:800],
        "evolution_notes": (bridge.get("evolution") or {}).get("notes"),
    }


def tool_medium_list_inbox(_args: dict) -> dict:
    inbox = MEDIUM / "inbox"
    inbox.mkdir(parents=True, exist_ok=True)
    files = [p.name for p in sorted(inbox.glob("*")) if p.is_file()]
    return {"inbox": files, "count": len(files)}


def tool_medium_list_outbox(args: dict) -> dict:
    outbox = MEDIUM / "outbox"
    outbox.mkdir(parents=True, exist_ok=True)
    limit = int(args.get("limit") or 20)
    files = [p.name for p in sorted(outbox.glob("*"), reverse=True) if p.is_file()][:limit]
    return {"outbox": files, "count": len(files)}


def tool_medium_write_inbox(args: dict) -> dict:
    text = args.get("text") or ""
    slug = args.get("slug") or f"mcp-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}"
    inbox = MEDIUM / "inbox"
    inbox.mkdir(parents=True, exist_ok=True)
    path = inbox / f"{slug}.md"
    path.write_text(text, encoding="utf-8")
    return {"written": str(path), "bytes": len(text)}


def tool_medium_process_inbox(_args: dict) -> dict:
    daemon_path = MEDIUM / "daemon.py"
    # import and run
    sys.path.insert(0, str(MEDIUM))
    from daemon import run_once  # type: ignore

    results = run_once(platform="hive")
    return {"processed": len(results), "results": results}


def tool_hive_status(_args: dict) -> dict:
    bridges_dir = IMPL / "bridges"
    bridge_count = len(list(bridges_dir.glob("*.json"))) if bridges_dir.exists() else 0
    inbox_n = len(list((MEDIUM / "inbox").glob("*"))) if (MEDIUM / "inbox").exists() else 0
    outbox_n = len(list((MEDIUM / "outbox").glob("*"))) if (MEDIUM / "outbox").exists() else 0
    learnings = IMPL / "learnings" / "strategies.json"
    strategies = {}
    if learnings.exists():
        strategies = json.loads(learnings.read_text(encoding="utf-8"))
    return {
        "ts": _ts(),
        "architect": {
            "blueprint_pct": "75-85",
            "dual_channel_pct": "70-80",
            "autonomous_body_pct": "15-25",
            "note": "File-native Bridge + medium daemon + MCP stdio now live; Chrome smoke and Ladybug still operator-bound",
        },
        "bridge_stores": bridge_count,
        "medium_inbox": inbox_n,
        "medium_outbox": outbox_n,
        "strategies": strategies,
        "mcp": "stdio_server_running",
    }


def tool_bridge_list_stores(args: dict) -> dict:
    bridges_dir = IMPL / "bridges"
    limit = int(args.get("limit") or 20)
    if not bridges_dir.exists():
        return {"ids": [], "count": 0}
    ids = sorted([p.stem for p in bridges_dir.glob("*.json")], reverse=True)[:limit]
    return {"ids": ids, "count": len(ids)}


def _phase0_mod():
    phase0 = OPS_ROOT / "kaiel" / "legal_brain" / "phase0" / "ingest"
    sys.path.insert(0, str(phase0))
    import file_graph as fg  # type: ignore

    return fg


def tool_phase0_stats(_args: dict) -> dict:
    fg = _phase0_mod()
    nodes, edges = fg.load_graph()
    if not nodes:
        fg.seed_sample()
        nodes, edges = fg.load_graph()
    return fg.stats(nodes, edges)


def tool_phase0_walk(args: dict) -> dict:
    fg = _phase0_mod()
    nodes, edges = fg.load_graph()
    if not nodes:
        fg.seed_sample()
        nodes, edges = fg.load_graph()
    nid = args.get("id") or "usc"
    return fg.walk(nid, nodes, edges)


def tool_phase0_seed(_args: dict) -> dict:
    fg = _phase0_mod()
    return fg.seed_sample()


HANDLERS = {
    "bridge_run": tool_bridge_run,
    "medium_list_inbox": tool_medium_list_inbox,
    "medium_list_outbox": tool_medium_list_outbox,
    "medium_write_inbox": tool_medium_write_inbox,
    "medium_process_inbox": tool_medium_process_inbox,
    "hive_status": tool_hive_status,
    "bridge_list_stores": tool_bridge_list_stores,
    "phase0_stats": tool_phase0_stats,
    "phase0_walk": tool_phase0_walk,
    "phase0_seed": tool_phase0_seed,
}


def handle(req: dict) -> dict:
    method = req.get("method")
    rid = req.get("id")
    params = req.get("params") or {}

    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": rid,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "hive-mcp", "version": "0.1.0"},
            },
        }
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rid, "result": {"tools": TOOLS}}
    if method == "tools/call":
        name = params.get("name")
        args = params.get("arguments") or {}
        if name not in HANDLERS:
            return {
                "jsonrpc": "2.0",
                "id": rid,
                "error": {"code": -32601, "message": f"Unknown tool: {name}"},
            }
        try:
            result = HANDLERS[name](args)
            return {
                "jsonrpc": "2.0",
                "id": rid,
                "result": {
                    "content": [{"type": "text", "text": json.dumps(result, indent=2, default=str)}]
                },
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": rid,
                "error": {"code": -32000, "message": str(e)},
            }
    if method == "ping":
        return {"jsonrpc": "2.0", "id": rid, "result": {"ok": True, "ts": _ts()}}

    return {
        "jsonrpc": "2.0",
        "id": rid,
        "error": {"code": -32601, "message": f"Method not found: {method}"},
    }


def main() -> int:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except json.JSONDecodeError as e:
            print(json.dumps({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(e)}}))
            continue
        resp = handle(req)
        print(json.dumps(resp), flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
