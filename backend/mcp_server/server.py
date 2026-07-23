"""
THEHIVE MCP server — the real agentic bridge for the federation (2026-07-22).

A clean-room build, NOT an extension of backend/mcp/ (that directory is
confirmed dead: no JSON-RPC, no transport, one literally-simulated tool,
never imported by routes.py). This is a genuine Model Context Protocol
server using the real `mcp` SDK, exposing three tools any MCP client can
call — first consumer is LocalAGI, which already speaks MCP natively
(core/agent/mcp.go supports attaching remote HTTP MCP servers per-agent,
no LocalAGI-side code change needed).

Run:
    python -m backend.mcp_server.server            # stdio, for local/dev clients
    python -m backend.mcp_server.server --http      # streamable-http, for LocalAGI

Tools:
    hive_dispatch(event_type, payload)   -> wraps hive_mesh.dispatch()
    hive_memory_recall(query, top_k)     -> wraps the live Worker's
                                             /v11/memory/search, same
                                             degrade-to-unavailable behavior
                                             as hive-conductor's own
                                             recall_context.py
    hive_law_query(article)              -> reads soul.md / PERMISSIONS.md
                                             directly off disk (no network)
"""

import argparse
import os
import re
from pathlib import Path
from typing import Any, Optional

import httpx
from mcp.server.fastmcp import FastMCP

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MEMORY_BASE = "https://thehive.sovereignhive.workers.dev"

mcp = FastMCP(
    name="thehive",
    instructions=(
        "Tools for interacting with THEHIVE, the Sovereign Hive federation's "
        "Queen node: dispatch events to colonies, recall the hive's own "
        "semantic memory, and query its constitutional law (soul.md / "
        "PERMISSIONS.md)."
    ),
)


@mcp.tool()
async def hive_dispatch(event_type: str, payload: Optional[dict[str, Any]] = None) -> dict:
    """
    Fan out an event to every healthy colony via THEHIVE's hive_mesh
    dispatcher (HMAC-signed, circuit-breaker-protected). Returns
    {colony_id: event_id | "failed" | "skipped" | "circuit_open"}.
    """
    from backend.core.hive_mesh import hive_mesh

    results = await hive_mesh.dispatch(event_type, payload or {})
    return {"event_type": event_type, "results": results}


@mcp.tool()
async def hive_memory_recall(query: str, top_k: int = 3) -> dict:
    """
    Recall prior hive memory related to `query` — the same call
    hive-conductor's own Phase-0 RECALL step makes (GET /v11/memory/search
    on the live Cloudflare Worker). Degrades gracefully to
    {"available": false, "reason": ...} when the Vectorize index isn't
    provisioned yet or the endpoint is unreachable — never raises.
    """
    base = os.environ.get("HIVE_MEMORY_BASE", DEFAULT_MEMORY_BASE).rstrip("/")
    url = f"{base}/v11/memory/search"
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            r = await client.get(url, params={"q": query, "topK": top_k})
            data = r.json()
    except Exception as e:
        return {"available": False, "reason": f"memory endpoint unreachable: {type(e).__name__}", "matches": []}
    if not data.get("available"):
        return {"available": False, "reason": "memory backend not provisioned (Vectorize index not yet created)", "matches": []}
    return {"available": True, "matches": data.get("matches", [])}


_ARTICLE_RE = re.compile(r"^#{1,3}\s*(?:F-\d+|Article\s+\S+)", re.IGNORECASE)


@mcp.tool()
def hive_law_query(article: Optional[str] = None) -> dict:
    """
    Read the hive's constitutional law directly from disk — soul.md (the
    canonical, legally-precise text) and PERMISSIONS.md (the Tier 1/2/3
    permissions layer). Pass `article` (e.g. "F-001") to get just that
    section; omit it to get both documents in full.
    """
    soul_path = REPO_ROOT / "soul.md"
    permissions_path = REPO_ROOT / "PERMISSIONS.md"
    soul_text = soul_path.read_text() if soul_path.exists() else ""
    permissions_text = permissions_path.read_text() if permissions_path.exists() else ""

    if not article:
        return {
            "soul_md": soul_text,
            "permissions_md": permissions_text,
            "source": "soul.md is canonical; where FABLE_DNA.md's prose differs, soul.md governs",
        }

    needle = article.strip().upper()
    for doc_name, text in (("soul.md", soul_text), ("PERMISSIONS.md", permissions_text)):
        lines = text.splitlines()
        for i, line in enumerate(lines):
            if needle in line.upper() and _ARTICLE_RE.match(line.strip()):
                # capture until the next heading of the same or higher level
                section = [line]
                for later in lines[i + 1:]:
                    if _ARTICLE_RE.match(later.strip()) or later.startswith("## "):
                        break
                    section.append(later)
                return {"found": True, "source": doc_name, "text": "\n".join(section).strip()}

    return {"found": False, "article": article, "note": "no matching heading in soul.md or PERMISSIONS.md"}


def main():
    parser = argparse.ArgumentParser(description="THEHIVE MCP server")
    parser.add_argument("--http", action="store_true", help="serve over streamable-http instead of stdio (for LocalAGI's remote MCP server config)")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=int(os.environ.get("MCP_PORT", "8100")))
    args = parser.parse_args()

    if args.http:
        mcp.settings.host = args.host
        mcp.settings.port = args.port
        mcp.run(transport="streamable-http")
    else:
        mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
