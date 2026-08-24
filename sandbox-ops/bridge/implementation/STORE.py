# THEHIVE/bridge/store.py
# Wired sovereign file store (+ optional medium_channel mirror)

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class FileProjectMemory:
    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, bridge: dict[str, Any]) -> None:
        line = json.dumps(
            {
                "ts": datetime.now(timezone.utc).isoformat(),
                "id": bridge.get("id"),
                "header": (bridge.get("compressed") or {}).get("header"),
            }
        )
        with self.path.open("a", encoding="utf-8") as f:
            f.write(line + "\n")


class FileM3Memory:
    """Lightweight contradiction / index log."""

    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def store(self, bridge: dict[str, Any]) -> None:
        tags = (bridge.get("compressed") or {}).get("architecture_tags") or []
        rec = {
            "id": bridge.get("id"),
            "tags": tags,
            "decisions": (bridge.get("compressed") or {}).get("decisions") or [],
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(rec) + "\n")


class FileNeuromcp:
    """File stand-in for hyperdimensional store: one JSON per bridge id."""

    def __init__(self, dir_path: Path):
        self.dir_path = dir_path
        self.dir_path.mkdir(parents=True, exist_ok=True)

    def store(self, bridge_id: str, payload: dict[str, Any]) -> Path:
        path = self.dir_path / f"{bridge_id}.json"
        path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return path


class StorageEngine:
    """Stores bridges in sovereign file memory layers."""

    def __init__(
        self,
        root: Path | None = None,
        medium_outbox: Path | None = None,
    ):
        root = root or Path(__file__).resolve().parent
        self.neuromcp = FileNeuromcp(root / "bridges")
        self.m3 = FileM3Memory(root / "learnings" / "m3_index.jsonl")
        self.project_memory = FileProjectMemory(root / "learnings" / "project_memory.jsonl")
        self.medium_outbox = medium_outbox

    def store(self, bridge: dict[str, Any]) -> dict[str, Any]:
        bid = bridge.get("id") or "unknown"
        path = self.neuromcp.store(bid, bridge)
        self.m3.store(bridge)
        self.project_memory.append(bridge)
        medium_path = None
        if self.medium_outbox is not None:
            self.medium_outbox.mkdir(parents=True, exist_ok=True)
            medium_path = self.medium_outbox / f"bridge-{bid}.json"
            medium_path.write_text(json.dumps(bridge, indent=2, default=str), encoding="utf-8")
        return {
            "id": bid,
            "neuromcp_path": str(path),
            "medium_path": str(medium_path) if medium_path else None,
            "stored_at": datetime.now(timezone.utc).isoformat(),
        }

    def load(self, bridge_id: str) -> dict[str, Any] | None:
        path = self.neuromcp.dir_path / f"{bridge_id}.json"
        if not path.exists():
            return None
        return json.loads(path.read_text(encoding="utf-8"))
