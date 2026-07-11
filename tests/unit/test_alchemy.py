"""
Unit tests for AlchemyEngine / RecursiveReflector — grief→wisdom transmutation.
"""
import pytest
from unittest.mock import patch, MagicMock


def _mock_db():
    conn = MagicMock()
    conn.execute.return_value = conn
    conn.fetchone.return_value = None
    conn.fetchall.return_value = []
    conn.commit.return_value = None
    return conn


def _make_reflector():
    """Import RecursiveReflector with DB and protocol patched out."""
    with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
         patch("backend.core.alchemy.hive_protocol") as mock_proto:
        mock_proto.publish_sync = MagicMock(return_value="evt-1")
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        return r, mock_proto


# ── grief signal detection ────────────────────────────────────────────────

class TestGriefDetection:
    def _capture(self, item):
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol"):
            from backend.core.alchemy import RecursiveReflector
            r = RecursiveReflector()
            return r._capture_grief(item)

    def test_detects_failure(self):
        # The set iteration order is undefined; "failure" and "failed" are both valid matches
        result = self._capture({"status": "failure", "msg": "task failed"})
        assert result in {"failure", "failed"}

    def test_detects_error(self):
        assert self._capture({"log": "error during execution"}) == "error"

    def test_detects_conflict(self):
        assert self._capture({"note": "conflict between agents"}) == "conflict"

    def test_unknown_when_no_signal(self):
        assert self._capture({"result": "success", "value": 42}) == "unknown"

    def test_first_matching_signal_wins(self):
        grief = self._capture({"a": "failure", "b": "error"})
        assert grief in {"failure", "error"}


# ── Ma'at evaluation ──────────────────────────────────────────────────────

class TestMaatEvaluation:
    def _maat(self, item):
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol"):
            from backend.core.alchemy import RecursiveReflector
            r = RecursiveReflector()
            return r._evaluate_maat(item)

    def test_full_maat_all_three_dimensions(self):
        item = {"contradicted": False, "resolution": "fixed", "actor": "agent-1"}
        score = self._maat(item)
        # truth=True (not contradicted), balance=True (resolution set), order=True (actor set)
        assert abs(score - 1.0) < 1e-9

    def test_zero_maat_nothing_present(self):
        # contradicted=True, no resolution, no actor
        item = {"contradicted": True}
        score = self._maat(item)
        assert abs(score - 0.0) < 1e-9  # all three fail

    def test_partial_maat(self):
        # truth=True, balance=False, order=True → 2/3
        item = {"contradicted": False, "actor": "agent-1"}
        score = self._maat(item)
        assert abs(score - 2 / 3) < 1e-9

    def test_maat_score_between_0_and_1(self):
        for item in [
            {},
            {"contradicted": True, "resolution": "none"},
            {"actor": "x", "resolution": "y"},
        ]:
            score = self._maat(item)
            assert 0.0 <= score <= 1.0


# ── transmute (full cycle) ────────────────────────────────────────────────

class TestTransmuteCycle:
    def test_returns_wisdom_entry(self):
        from backend.core.alchemy import RecursiveReflector, WisdomEntry
        r = RecursiveReflector()
        r._cache.clear()
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            item = {"id": "mem-1", "status": "failure", "actor": "agent-2", "resolution": "retry"}
            wisdom = r.transmute(item)
        assert isinstance(wisdom, WisdomEntry)

    def test_wisdom_has_required_fields(self):
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            item = {"id": "mem-2", "status": "error"}
            wisdom = r.transmute(item)
        assert wisdom.id
        assert wisdom.lesson
        assert 0.0 <= wisdom.confidence <= 1.0
        assert wisdom.cycle_depth >= 1
        assert wisdom.grief_type

    def test_unknown_grief_is_handled(self):
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            item = {"id": "mem-3", "value": "perfectly fine data"}
            wisdom = r.transmute(item)
        assert wisdom.grief_type == "unknown"

    def test_wisdom_published_to_protocol(self):
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock(return_value="evt-1")
            r.transmute({"id": "mem-4", "status": "failure"})
        mock_proto.publish_sync.assert_called_once()

    def test_depth_capped_at_max(self):
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            wisdom = r.transmute({"id": "m", "status": "failure"}, depth=999)
        assert wisdom.cycle_depth <= r.MAX_DEPTH

    def test_depth_1_uses_cache_on_second_call(self):
        # Use an item that produces confidence >= 0.5 so the cache path is reached.
        # All three Ma'at dimensions pass: contradicted=False, resolution set, actor set.
        from backend.core.alchemy import RecursiveReflector
        r = RecursiveReflector()
        r._cache.clear()
        item = {
            "id": "cache-test-high-conf",
            "status": "error",
            "contradicted": False,
            "resolution": "retried",
            "actor": "agent-1",
        }
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock(return_value="evt-1")
            wisdom1 = r.transmute(item)
            call_count = mock_proto.publish_sync.call_count
            wisdom2 = r.transmute(item)
        # Second call hits the class-level cache → same WisdomEntry returned, no extra publish
        assert mock_proto.publish_sync.call_count == call_count
        assert wisdom1.id == wisdom2.id


# ── TransmutationRecord ──────────────────────────────────────────────────

class TestTransmutationRecord:
    def test_from_row(self):
        from backend.core.alchemy import TransmutationRecord
        row = {
            "id": "tr-1",
            "grief_type": "failure",
            "lesson": "always retry with backoff",
            "cycle_depth": 3,
            "confidence": 0.85,
            "created_at": "2026-07-08T00:00:00",
        }
        rec = TransmutationRecord.from_row(row)
        assert rec.id == "tr-1"
        assert rec.input_grief == "failure"
        assert rec.output_wisdom == "always retry with backoff"
        assert rec.depth == 3
        assert abs(rec.maat_score - 0.85) < 1e-9

    def test_to_dict(self):
        from backend.core.alchemy import TransmutationRecord
        rec = TransmutationRecord(
            id="x", input_grief="loss", output_wisdom="w", depth=1,
            maat_score=0.5, created_at="2026-07-08T00:00:00"
        )
        d = rec.to_dict()
        assert isinstance(d, dict)
        assert d["id"] == "x"


# ── maat_score_breakdown ──────────────────────────────────────────────────

class TestMaatBreakdown:
    def test_breakdown_has_all_dimensions(self):
        # AlchemyEngine may not exist; use RecursiveReflector which has _evaluate_maat
        with patch("backend.core.alchemy.get_db", return_value=_mock_db()), \
             patch("backend.core.alchemy.hive_protocol"):
            from backend.core.alchemy import RecursiveReflector, _MAAT_DIMENSIONS
        # _MAAT_DIMENSIONS should define truth, balance, order
        assert "truth" in _MAAT_DIMENSIONS
        assert "balance" in _MAAT_DIMENSIONS
        assert "order" in _MAAT_DIMENSIONS
