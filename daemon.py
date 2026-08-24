#!/usr/bin/env python3
"""
Medium Channel Daemon — processes founder inbox → Bridge pipeline → outbox/cycles.

File-native, no external network required.
Usage:
  python daemon.py              # process once
  python daemon.py --watch 30   # poll every 30s
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Bridge lives one level up under implementation/
BRIDGE_IMPL = Path(__file__).resolve().parent.parent / "implementation"
sys.path.insert(0, str(BRIDGE_IMPL))

from pipeline import run_bridge  # noqa: E402

ROOT = Path(__file__).resolve().parent
INBOX = ROOT / "inbox"
OUTBOX = ROOT / "outbox"
CYCLES = ROOT / "cycles"
PROCESSED = ROOT / "processed"
STATE = ROOT / "daemon_state.json"


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_state() -> dict:
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {"processed_files": [], "last_run": None, "cycles": 0}


def save_state(state: dict) -> None:
    STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def read_inbox_item(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    return {
        "id": f"inbox-{path.stem[:40]}",
        "source": "medium_inbox",
        "platform": "hive",
        "conversation": [{"role": "user", "content": text}],
        "tags": ["medium", "founder", "inbox"],
        "text": text,
    }


def write_cycle(bridge: dict, source_name: str) -> Path:
    CYCLES.mkdir(parents=True, exist_ok=True)
    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    path = CYCLES / f"{day}-{source_name[:40]}.md"
    c = bridge.get("compressed") or {}
    lines = [
        f"# Medium Cycle — {bridge.get('id')}",
        f"**Source:** {source_name}",
        f"**At:** {_ts()}",
        "",
        "## Decisions",
    ]
    for d in c.get("decisions") or []:
        lines.append(f"- {d}")
    lines.append("")
    lines.append("## Essence")
    for e in (c.get("essence") or [])[:12]:
        lines.append(f"- {e}")
    lines.append("")
    lines.append("## Open threads")
    for t in (c.get("threads") or [])[:10]:
        lines.append(f"- {t}")
    lines.append("")
    inj = bridge.get("injection") or {}
    lines.append("## Inject preview")
    lines.append("```")
    lines.append((inj.get("prompt_text") or "")[:1500])
    lines.append("```")
    path.write_text("\n".join(lines), encoding="utf-8")
    return path


def process_one(path: Path, platform: str = "hive") -> dict:
    session = read_inbox_item(path)
    bridge = run_bridge(session, platform=platform, evolve_success=True)
    cycle_path = write_cycle(bridge, path.stem)
    # mark processed
    PROCESSED.mkdir(parents=True, exist_ok=True)
    dest = PROCESSED / path.name
    if path.exists():
        shutil.move(str(path), str(dest))
    return {
        "bridge_id": bridge.get("id"),
        "source": path.name,
        "cycle": str(cycle_path),
        "store": bridge.get("store"),
        "ts": _ts(),
    }


def run_once(platform: str = "hive") -> list[dict]:
    INBOX.mkdir(parents=True, exist_ok=True)
    OUTBOX.mkdir(parents=True, exist_ok=True)
    state = load_state()
    results = []
    for path in sorted(INBOX.glob("*")):
        if not path.is_file():
            continue
        if path.name.startswith("."):
            continue
        try:
            r = process_one(path, platform=platform)
            results.append(r)
            state["processed_files"].append(path.name)
            print(json.dumps({"ok": True, **r}))
        except Exception as e:
            err = {"ok": False, "source": path.name, "error": str(e), "ts": _ts()}
            results.append(err)
            print(json.dumps(err), file=sys.stderr)
    state["last_run"] = _ts()
    state["cycles"] = int(state.get("cycles", 0)) + len(results)
    save_state(state)
    # status pulse into outbox
    pulse = {
        "ts": _ts(),
        "daemon": "medium_channel",
        "processed_this_run": len(results),
        "total_cycles": state["cycles"],
        "results": results,
    }
    pulse_path = OUTBOX / f"daemon-pulse-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.json"
    pulse_path.write_text(json.dumps(pulse, indent=2), encoding="utf-8")
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Medium channel daemon")
    parser.add_argument("--watch", type=int, default=0, help="Poll interval seconds (0 = once)")
    parser.add_argument("--platform", default="hive")
    args = parser.parse_args()
    if args.watch <= 0:
        run_once(platform=args.platform)
        return 0
    print(f"watching {INBOX} every {args.watch}s", flush=True)
    while True:
        run_once(platform=args.platform)
        time.sleep(args.watch)


if __name__ == "__main__":
    sys.exit(main())
