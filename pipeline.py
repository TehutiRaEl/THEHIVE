#!/usr/bin/env python3
"""
Five-layer Bridge pipeline — fully wired file-native path.

  Capture → Compress → Store → Inject → Evolve

Usage:
  python pipeline.py
  python pipeline.py --platform grok --text "We decided Phase 0 uses LadybugDB."
"""

from __future__ import annotations

import argparse
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

from CAPTURE import CaptureEngine
from COMPRESS import CompressionEngine
from STORE import StorageEngine
from INJECT import InjectionEngine
from EVOLVE import EvolutionEngine

ROOT = Path(__file__).resolve().parent
MEDIUM_OUTBOX = ROOT.parent / "medium_channel" / "outbox"


def run_bridge(
    session_data: dict,
    platform: str = "hive",
    evolve_success: bool = True,
) -> dict:
    capture = CaptureEngine()
    compress = CompressionEngine()
    store = StorageEngine(root=ROOT, medium_outbox=MEDIUM_OUTBOX)
    inject = InjectionEngine()
    evolve = EvolutionEngine(learnings_dir=ROOT / "learnings")

    captured = capture.capture(session_data)
    compressed = compress.compress(captured)
    bridge_id = captured["id"]
    bridge = {
        "id": bridge_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "captured": captured,
        "compressed": compressed,
    }
    store_result = store.store(bridge)
    bridge["store"] = store_result

    injection = inject.inject(bridge, platform)
    bridge["injection"] = injection
    bridge["inject_target"] = platform
    # re-store with injection attached
    store.store(bridge)

    learn = evolve.learn(
        bridge,
        {"success": evolve_success, "platform": platform},
    )
    bridge["evolution"] = learn
    return bridge


def main() -> int:
    parser = argparse.ArgumentParser(description="Hive five-layer Bridge pipeline")
    parser.add_argument("--platform", default="hive", help="inject target")
    parser.add_argument("--text", default="", help="single user text to capture")
    parser.add_argument("--fail", action="store_true", help="mark evolve outcome failed")
    args = parser.parse_args()

    session = {
        "id": f"cap-{uuid.uuid4().hex[:12]}",
        "source": "pipeline_cli",
        "platform": "hive",
        "conversation": [
            {
                "role": "user",
                "content": args.text
                or (
                    "We decided Phase 0 uses LadybugDB. "
                    "Rejected dual-write SurrealDB for now. "
                    "Next: operator Chrome smoke when desktop available. "
                    "Because mobile iOS only until Monday."
                ),
            },
            {
                "role": "assistant",
                "content": "Locked federal USC + Ladybug; medium channel persistent; operator MV3 skeleton tested.",
            },
        ],
        "decisions": ["Phase 0 = federal USC + pure LadybugDB"],
        "rejected_approaches": ["SurrealDB dual-write in Phase 0"],
        "tags": ["bridge", "phase0", "operator"],
    }

    bridge = run_bridge(session, platform=args.platform, evolve_success=not args.fail)
    print(json.dumps(
        {
            "id": bridge["id"],
            "store": bridge.get("store"),
            "inject_target": bridge.get("inject_target"),
            "prompt_preview": (bridge.get("injection") or {}).get("prompt_text", "")[:500],
            "evolution_notes": (bridge.get("evolution") or {}).get("notes"),
            "compression_stats": (bridge.get("compressed") or {}).get("stats"),
        },
        indent=2,
    ))
    return 0


if __name__ == "__main__":
    sys.exit(main())
