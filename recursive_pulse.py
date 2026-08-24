#!/usr/bin/env python3
"""
Recursive Build Pulse — one full Observe → Bridge → Status → Evolve cycle.

Ties medium + Bridge + Phase0 + Nanuet memory into a single offline pulse.
Does not claim 24/7 autonomy; runs once (or --watch).

Usage:
  python recursive_pulse.py
  python recursive_pulse.py --watch 60
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # TheCopy-ops
sys.path.insert(0, str(ROOT / "bridge" / "implementation"))
sys.path.insert(0, str(ROOT / "bridge" / "medium_channel"))
sys.path.insert(0, str(ROOT / "nanuet" / "runtime"))
sys.path.insert(0, str(ROOT / "kaiel" / "legal_brain" / "phase0" / "ingest"))

OUTBOX = ROOT / "bridge" / "medium_channel" / "outbox"


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def pulse() -> dict:
    report: dict = {"ts": _ts(), "steps": {}}

    # 1. Medium process
    try:
        from daemon import run_once

        med = run_once(platform="hive")
        report["steps"]["medium"] = {"ok": True, "processed": len(med)}
    except Exception as e:
        report["steps"]["medium"] = {"ok": False, "error": str(e)}

    # 2. Bridge status sample
    try:
        from pipeline import run_bridge
        import uuid

        session = {
            "id": f"pulse-{uuid.uuid4().hex[:10]}",
            "source": "recursive_pulse",
            "conversation": [
                {
                    "role": "user",
                    "content": "Recursive pulse: observe medium, phase0, nanuet; evolve strategies.",
                }
            ],
            "tags": ["pulse", "recursive"],
        }
        bridge = run_bridge(session, platform="hive", evolve_success=True)
        report["steps"]["bridge"] = {
            "ok": True,
            "id": bridge.get("id"),
            "evolution": (bridge.get("evolution") or {}).get("notes"),
        }
    except Exception as e:
        report["steps"]["bridge"] = {"ok": False, "error": str(e)}

    # 3. Phase0 stats
    try:
        import file_graph as fg

        nodes, edges = fg.load_graph()
        if not nodes:
            fg.seed_sample()
            nodes, edges = fg.load_graph()
        report["steps"]["phase0"] = fg.stats(nodes, edges)
    except Exception as e:
        report["steps"]["phase0"] = {"ok": False, "error": str(e)}

    # 4. Nanuet health
    try:
        import memory_core as nc

        report["steps"]["nanuet"] = nc.health()
    except Exception as e:
        report["steps"]["nanuet"] = {"ok": False, "error": str(e)}

    # 5. Write pulse to outbox
    OUTBOX.mkdir(parents=True, exist_ok=True)
    path = OUTBOX / f"recursive-pulse-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.json"
    path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    report["outbox"] = str(path)
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--watch", type=int, default=0)
    args = parser.parse_args()
    if args.watch <= 0:
        r = pulse()
        print(json.dumps(r, indent=2, default=str))
        return 0
    print(f"recursive pulse every {args.watch}s", flush=True)
    while True:
        r = pulse()
        print(json.dumps({"ts": r["ts"], "outbox": r.get("outbox")}, flush=True))
        time.sleep(args.watch)


if __name__ == "__main__":
    sys.exit(main())
