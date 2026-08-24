#!/usr/bin/env python3
"""Tests for wired five-layer Bridge."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from CAPTURE import CaptureEngine
from COMPRESS import CompressionEngine
from STORE import StorageEngine
from INJECT import InjectionEngine
from EVOLVE import EvolutionEngine
from pipeline import run_bridge


class TestBridge(unittest.TestCase):
    def test_capture_compress(self):
        cap = CaptureEngine().capture(
            {
                "conversation": [{"role": "user", "content": "We decided to use LadybugDB."}],
                "decisions": ["use LadybugDB"],
            }
        )
        self.assertIn("id", cap)
        self.assertTrue(cap["decisions"])
        packet = CompressionEngine().compress(cap)
        self.assertEqual(packet["header"]["protocol"], "AIST-hive-v1")
        self.assertIn("essence", packet)

    def test_store_load(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            store = StorageEngine(root=root, medium_outbox=root / "outbox")
            bridge = {
                "id": "test-bridge-1",
                "compressed": {"header": {"protocol": "AIST-hive-v1"}, "decisions": ["x"]},
            }
            result = store.store(bridge)
            self.assertTrue(Path(result["neuromcp_path"]).exists())
            loaded = store.load("test-bridge-1")
            self.assertEqual(loaded["id"], "test-bridge-1")

    def test_inject_platforms(self):
        eng = InjectionEngine()
        bridge = {
            "id": "b1",
            "compressed": {
                "header": {"protocol": "AIST-hive-v1"},
                "essence": ["user: hi"],
                "decisions": ["d1"],
                "threads": [],
                "architecture_tags": ["phase 0"],
            },
        }
        for p in ("grok", "claude", "hive", "generic"):
            packet = eng.inject(bridge, p)
            self.assertIn("prompt_text", packet)
            self.assertTrue(packet["operator_gate"])

    def test_evolve(self):
        with tempfile.TemporaryDirectory() as td:
            eng = EvolutionEngine(learnings_dir=Path(td))
            bridge = {"id": "e1", "compressed": {"stats": {"approx_input_chars": 100, "approx_output_chars": 20}}}
            out = eng.learn(bridge, {"success": True, "platform": "grok"})
            self.assertGreaterEqual(out["strategies"]["compression"]["successes"], 1)

    def test_full_pipeline(self):
        bridge = run_bridge(
            {
                "conversation": [
                    {"role": "user", "content": "Decided medium channel is persistent. Next: MCP mesh."}
                ],
                "decisions": ["persistent medium"],
                "source": "unit_test",
            },
            platform="hive",
            evolve_success=True,
        )
        self.assertTrue(bridge["id"])
        self.assertIn("store", bridge)
        self.assertIn("injection", bridge)
        self.assertIn("evolution", bridge)


if __name__ == "__main__":
    unittest.main()
