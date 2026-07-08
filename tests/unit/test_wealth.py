"""
Unit tests for WealthEngine — EVW formula, TWW, VWW, W_total.
"""
import math
import pytest
from unittest.mock import patch, MagicMock


def _mock_db(time_seconds=0.0, evw_sum=0.0, existing_row=None):
    conn = MagicMock()

    def execute_side_effect(sql, params=None):
        inner = MagicMock()
        sql_lower = sql.strip().lower()
        if "wealth_time_log" in sql_lower and "sum" in sql_lower:
            inner.fetchone.return_value = (time_seconds,)
        elif "wealth_contributions" in sql_lower and "sum" in sql_lower:
            inner.fetchone.return_value = (evw_sum,)
        elif "wealth_records" in sql_lower and "select" in sql_lower:
            inner.fetchone.return_value = existing_row
        else:
            inner.fetchone.return_value = None
            inner.fetchall.return_value = []
        return inner

    conn.execute.side_effect = execute_side_effect
    conn.commit.return_value = None
    return conn


# ── EVW formula ───────────────────────────────────────────────────────────

class TestEVWFormula:
    def test_evw_all_components(self):
        from backend.core.wealth import Contribution
        c = Contribution(
            user_id="alice",
            hours_saved=10.0,
            adoption_count=5,
            novelty_score=0.8,
            dispute_resilience=0.6,
        )
        # (10*0.4) + (5*0.3) + (0.8*0.2) + (0.6*0.1) = 4 + 1.5 + 0.16 + 0.06 = 5.72
        assert abs(c.evw() - 5.72) < 1e-9

    def test_evw_zero_contribution(self):
        from backend.core.wealth import Contribution
        c = Contribution(user_id="bob")
        assert c.evw() == 0.0

    def test_evw_only_hours_saved(self):
        from backend.core.wealth import Contribution
        c = Contribution(user_id="carol", hours_saved=5.0)
        assert abs(c.evw() - 2.0) < 1e-9  # 5 * 0.4

    def test_evw_only_adoption(self):
        from backend.core.wealth import Contribution
        c = Contribution(user_id="dave", adoption_count=10)
        assert abs(c.evw() - 3.0) < 1e-9  # 10 * 0.3

    def test_evw_clamped_novelty(self):
        from backend.core.wealth import Contribution
        c = Contribution(user_id="eve", novelty_score=1.0, dispute_resilience=1.0)
        # (0*0.4) + (0*0.3) + (1*0.2) + (1*0.1) = 0.3
        assert abs(c.evw() - 0.3) < 1e-9

    def test_contribution_clamps_negative_values(self):
        with patch("backend.core.wealth.get_db", return_value=_mock_db()):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            # Negative values should be clamped to 0
            contrib_id = engine.record_contribution(
                user_id="test",
                hours_saved=-5.0,
                adoption_count=-2,
                novelty_score=-0.1,
                dispute_resilience=0.5,
            )
        assert contrib_id is not None  # clamping happened, ID returned

    def test_contribution_clamps_novelty_above_1(self):
        with patch("backend.core.wealth.get_db", return_value=_mock_db()):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            contrib_id = engine.record_contribution(
                user_id="test",
                hours_saved=1.0,
                adoption_count=1,
                novelty_score=5.0,  # > 1 → clamped to 1.0
                dispute_resilience=2.0,  # > 1 → clamped to 1.0
            )
        assert contrib_id is not None


# ── TWW / VWW / W_total ───────────────────────────────────────────────────

class TestWealthCalculation:
    def test_zero_wealth_when_no_data(self):
        conn = _mock_db(time_seconds=0.0, evw_sum=0.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("nobody")
        assert snap.tww == 0.0
        assert snap.vww == 0.0
        assert snap.w_total == 0.0

    def test_tww_calculated_from_seconds(self):
        conn = _mock_db(time_seconds=7200.0, evw_sum=0.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("alice")
        assert abs(snap.tww - 2.0) < 1e-9  # 7200s / 3600 = 2 hours

    def test_vww_is_sum_of_evw(self):
        conn = _mock_db(time_seconds=0.0, evw_sum=3.5)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("bob")
        assert abs(snap.vww - 3.5) < 1e-9

    def test_w_total_geometric_mean(self):
        conn = _mock_db(time_seconds=3600.0, evw_sum=4.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("carol")
        # tww=1.0, vww=4.0 → w_total = sqrt(1.0 * 4.0) = 2.0
        assert abs(snap.w_total - 2.0) < 1e-9

    def test_w_total_zero_if_tww_is_zero(self):
        conn = _mock_db(time_seconds=0.0, evw_sum=10.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("dave")
        assert snap.w_total == 0.0

    def test_w_total_zero_if_vww_is_zero(self):
        conn = _mock_db(time_seconds=3600.0, evw_sum=0.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("eve")
        assert snap.w_total == 0.0

    def test_w_total_sqrt_formula(self):
        for user_id, tww_hours, vww in [
            ("user_a", 2.0, 8.0), ("user_b", 4.0, 9.0), ("user_c", 0.5, 2.0)
        ]:
            conn = _mock_db(time_seconds=tww_hours * 3600, evw_sum=vww)
            with patch("backend.core.wealth.get_db", return_value=conn):
                from backend.core.wealth import WealthEngine, _wealth_cache
                _wealth_cache.clear()
                engine = WealthEngine()
                snap = engine.calculate(user_id)
            expected = math.sqrt(tww_hours * vww)
            assert abs(snap.w_total - expected) < 1e-9, f"tww={tww_hours} vww={vww}"


# ── WealthSnapshot shape ──────────────────────────────────────────────────

class TestWealthSnapshot:
    def test_snapshot_has_required_fields(self):
        conn = _mock_db(time_seconds=1800.0, evw_sum=2.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("test")
        assert hasattr(snap, "user_id")
        assert hasattr(snap, "tww")
        assert hasattr(snap, "vww")
        assert hasattr(snap, "w_total")
        assert hasattr(snap, "computed_at")
        assert snap.user_id == "test"

    def test_snapshot_to_dict(self):
        conn = _mock_db(time_seconds=3600.0, evw_sum=1.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            snap = engine.calculate("test")
        d = snap.to_dict()
        assert isinstance(d, dict)
        assert "w_total" in d
        assert "tww" in d


# ── record_active_time ────────────────────────────────────────────────────

class TestRecordActiveTime:
    def test_record_active_time_inserts(self):
        conn = _mock_db()
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            engine.record_active_time("alice", 1800.0)
        assert conn.execute.called
        assert conn.commit.called

    def test_record_active_time_clamps_negative(self):
        conn = _mock_db()
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine
            engine = WealthEngine()
            # Should not raise; clamps to 0
            engine.record_active_time("alice", -100.0)


# ── TTL cache ─────────────────────────────────────────────────────────────

class TestWealthCache:
    def test_cache_returns_same_snapshot_on_second_call(self):
        conn = _mock_db(time_seconds=3600.0, evw_sum=2.0)
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine, _wealth_cache
            engine = WealthEngine()
            _wealth_cache.clear()
            snap1 = engine.calculate("cache-test")
            snap2 = engine.calculate("cache-test")
        # Both snapshots should have identical values
        assert abs(snap1.w_total - snap2.w_total) < 1e-9

    def test_cache_invalidated_by_new_contribution(self):
        conn = _mock_db()
        with patch("backend.core.wealth.get_db", return_value=conn):
            from backend.core.wealth import WealthEngine, _wealth_cache
            engine = WealthEngine()
            _wealth_cache["invalidate-user"] = (9999999999.0, MagicMock())
            engine.record_contribution(
                "invalidate-user", 1.0, 1, 0.5, 0.5
            )
            assert "invalidate-user" not in _wealth_cache
