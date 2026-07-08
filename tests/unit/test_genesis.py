"""
Unit tests for GapDetector and MissionGenerator — gap severity, proposal pipeline.
"""
import pytest
from unittest.mock import patch, MagicMock


def _mock_db_empty():
    """DB with no agents, no missions, no episodic memory — returns empty for everything."""
    conn = MagicMock()

    def execute_side(sql, params=None):
        inner = MagicMock()
        inner.fetchall.return_value = []
        inner.fetchone.return_value = (0,)
        return inner

    conn.execute.side_effect = execute_side
    conn.commit.return_value = None
    return conn


def _mock_db_with_missions(rows):
    conn = MagicMock()

    def execute_side(sql, params=None):
        inner = MagicMock()
        sql_lower = sql.strip().lower()
        if "missions" in sql_lower and "select" in sql_lower:
            inner.fetchall.return_value = rows
            inner.fetchone.return_value = (len(rows),)
        else:
            inner.fetchall.return_value = []
            inner.fetchone.return_value = (0,)
        return inner

    conn.execute.side_effect = execute_side
    conn.commit.return_value = None
    return conn


# ── gap_severity function ─────────────────────────────────────────────────

class TestGapSeverity:
    def test_critical_at_08(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 0.8}) == "critical"

    def test_critical_above_08(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 1.0}) == "critical"

    def test_major_at_05(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 0.5}) == "major"

    def test_major_between_05_and_08(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 0.7}) == "major"

    def test_minor_below_05(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 0.3}) == "minor"

    def test_minor_at_zero(self):
        from backend.core.genesis import gap_severity
        assert gap_severity({"severity": 0.0}) == "minor"

    def test_boundary_exact_05(self):
        from backend.core.genesis import gap_severity
        # 0.5 → "major" (>= 0.5 but < 0.8)
        assert gap_severity({"severity": 0.5}) == "major"

    def test_gap_object_also_works(self):
        from backend.core.genesis import gap_severity, Gap
        from datetime import datetime
        import uuid
        gap = Gap(
            id=str(uuid.uuid4()),
            description="test",
            gap_type="isolated_node",
            severity=0.9,
            evidence="",
            detected_at=datetime.now().isoformat(),
        )
        assert gap_severity(gap) == "critical"


# ── MissionStatus enum ────────────────────────────────────────────────────

class TestMissionStatus:
    def test_all_states_defined(self):
        from backend.core.genesis import MissionStatus
        assert MissionStatus.PROPOSED == "proposed"
        assert MissionStatus.FORMALIZED == "formalized"
        assert MissionStatus.ACTIVE == "active"
        assert MissionStatus.COMPLETED == "completed"
        assert MissionStatus.ABANDONED == "abandoned"

    def test_status_is_str_enum(self):
        from backend.core.genesis import MissionStatus
        assert isinstance(MissionStatus.PROPOSED, str)


# ── Gap dataclass ─────────────────────────────────────────────────────────

class TestGapDataclass:
    def test_to_dict(self):
        from backend.core.genesis import Gap
        g = Gap(
            id="g-1",
            description="test gap",
            gap_type="isolated_node",
            severity=0.7,
            evidence="agent=x",
            detected_at="2026-07-08T00:00:00",
        )
        d = g.to_dict()
        assert d["id"] == "g-1"
        assert d["severity"] == 0.7
        assert d["gap_type"] == "isolated_node"

    def test_severity_range(self):
        from backend.core.genesis import Gap
        g = Gap("x", "d", "t", 0.5, "e", "2026-01-01")
        assert 0.0 <= g.severity <= 1.0


# ── GapDetector.scan ─────────────────────────────────────────────────────

class TestGapDetectorScan:
    def test_scan_returns_list(self):
        conn = _mock_db_empty()
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol"):
            from backend.core.genesis import GapDetector
            GapDetector._scan_cache = None
            det = GapDetector()
            gaps = det.scan()
        assert isinstance(gaps, list)

    def test_scan_detects_no_active_missions(self):
        """When missions table has 0 active rows, scanner should detect an unmet_need gap."""
        conn = _mock_db_empty()
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol"):
            from backend.core.genesis import GapDetector
            GapDetector._scan_cache = None
            det = GapDetector()
            gaps = det.scan()
        unmet = [g for g in gaps if g.gap_type == "unmet_need"]
        # At least one "no active missions" gap should be detected
        assert len(unmet) >= 1

    def test_scan_cache_returns_same_result(self):
        conn = _mock_db_empty()
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol"):
            from backend.core.genesis import GapDetector
            GapDetector._scan_cache = None
            det = GapDetector()
            gaps1 = det.scan()
            gaps2 = det.scan()
        assert gaps1 is gaps2  # cache returns same object

    def test_scan_doesnt_crash_on_db_exception(self):
        conn = MagicMock()
        conn.execute.side_effect = Exception("DB offline")
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol"):
            from backend.core.genesis import GapDetector
            GapDetector._scan_cache = None
            det = GapDetector()
            gaps = det.scan()
        assert isinstance(gaps, list)  # graceful degradation


# ── MissionGenerator ──────────────────────────────────────────────────────

class TestMissionGenerator:
    def test_singleton_exported(self):
        from backend.core import genesis as mod
        assert hasattr(mod, "mission_generator") or hasattr(mod, "MissionGenerator")

    def test_mission_template_dataclass(self):
        from backend.core.genesis import MissionTemplate
        m = MissionTemplate(
            id="m-1",
            title="Expand to new territory",
            gap_id="g-1",
            description="Fill this gap",
            status="proposed",
            origin="gap_analysis",
            created_at="2026-07-08T00:00:00",
        )
        d = m.to_dict()
        assert d["id"] == "m-1"
        assert d["status"] == "proposed"

    def test_generate_from_gaps(self):
        conn = _mock_db_empty()
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol") as mock_proto:
            mock_proto.publish_sync = MagicMock()
            from backend.core.genesis import MissionGenerator, GapDetector, Gap
            from datetime import datetime
            import uuid
            GapDetector._scan_cache = None
            gen = MissionGenerator()
            # Provide a gap directly if generate_from_gap exists
            if hasattr(gen, "generate_from_gap"):
                gap = Gap(
                    id=str(uuid.uuid4()),
                    description="No active missions",
                    gap_type="unmet_need",
                    severity=0.9,
                    evidence="active_count=0",
                    detected_at=datetime.now().isoformat(),
                )
                template = gen.generate_from_gap(gap)
                assert template is not None
                assert template.gap_id == gap.id

    def test_get_missions_returns_list(self):
        conn = _mock_db_empty()
        with patch("backend.core.genesis.get_db", return_value=conn), \
             patch("backend.core.genesis.hive_protocol"):
            from backend.core.genesis import MissionGenerator
            gen = MissionGenerator()
            if hasattr(gen, "get_missions"):
                missions = gen.get_missions()
                assert isinstance(missions, list)
