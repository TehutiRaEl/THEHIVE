#!/usr/bin/env python3
"""Tests for medium channel daemon."""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

# Ensure import path
MEDIUM = Path(__file__).resolve().parent
IMPL = MEDIUM.parent / "implementation"
sys.path.insert(0, str(IMPL))
sys.path.insert(0, str(MEDIUM))


def test_process_inbox_item(tmp_path: Path | None = None):
    from daemon import process_one, INBOX, PROCESSED

    # write a temp inbox file into real inbox (daemon uses fixed paths)
    INBOX.mkdir(parents=True, exist_ok=True)
    item = INBOX / "test-daemon-item.md"
    item.write_text(
        "We decided the medium daemon must process inbox to outbox. "
        "Rejected leaving founder drops unprocessed. "
        "Because continuity across sessions is the point.",
        encoding="utf-8",
    )
    result = process_one(item, platform="hive")
    assert result.get("bridge_id"), result
    assert result.get("cycle"), result
    # should have been moved
    assert not item.exists()
    print("PASS test_process_inbox_item", result.get("bridge_id"))


def test_run_once_empty():
    from daemon import run_once

    # empty inbox is fine
    results = run_once(platform="hive")
    assert isinstance(results, list)
    print("PASS test_run_once_empty", len(results))


if __name__ == "__main__":
    test_process_inbox_item()
    test_run_once_empty()
    print("All daemon tests OK")
