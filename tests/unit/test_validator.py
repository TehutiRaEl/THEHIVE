"""
Unit tests for ConstitutionalValidator — F-001 through F-006.
Tests are written against the actual action names and context shapes in validator.py.
"""
import time
import pytest
from unittest.mock import patch, MagicMock


# ── helpers ──────────────────────────────────────────────────────────────────

def _mock_db():
    conn = MagicMock()
    conn.execute.return_value = conn
    conn.fetchone.return_value = None
    conn.fetchall.return_value = []
    conn.commit.return_value = None
    return conn


# ── basic smoke ───────────────────────────────────────────────────────────────

class TestValidatorSmoke:
    def test_import(self):
        from backend.core.validator import ConstitutionalValidator, ValidationResult
        assert ConstitutionalValidator is not None

    def test_singleton_exported(self):
        from backend.core import validator as mod
        assert hasattr(mod, "validator")

    def test_is_critical_violation_function_exported(self):
        from backend.core.validator import is_critical_violation
        assert callable(is_critical_violation)


# ── F-001: data sovereignty ────────────────────────────────────────────────

class TestF001DataSovereignty:
    def test_data_delete_within_rate_limit_allowed(self):
        # "data_delete" contains keyword "delete" → F-004 fires unless rationale provided
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "delete_rate_last_hour": 3, "rationale": "user request"},
            )
        assert result.allowed is True
        assert result.violated_law is None

    def test_data_delete_exceeds_rate_limit_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "delete_rate_last_hour": 10},
            )
        assert result.allowed is False
        assert result.violated_law == "F-001"

    def test_non_delete_action_not_affected_by_f001(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "read_memory",
                {"user_id": "alice"},
            )
        # Read action has no F-001 trigger
        assert result.allowed is True


# ── F-002: prospective-only wealth formula changes ─────────────────────────

class TestF002WealthFormula:
    def test_prospective_change_allowed(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "change_wealth_formula",
                {"user_id": "admin", "retroactive": False, "rationale": "updating formula"},
            )
        assert result.allowed is True

    def test_retroactive_change_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "change_wealth_formula",
                {"user_id": "admin", "retroactive": True, "rationale": "fix past error"},
            )
        assert result.allowed is False
        assert result.violated_law == "F-002"


# ── F-003: autonomy / no forced workflows ─────────────────────────────────

class TestF003Autonomy:
    def test_force_workflow_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate("force_workflow", {"user_id": "operator"})
        assert result.allowed is False
        assert result.violated_law == "F-003"

    def test_decline_workflow_within_rate_allowed(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "decline_workflow",
                {"user_id": "agent-1", "decline_rate_last_hour": 5},
            )
        assert result.allowed is True

    def test_decline_workflow_exceeds_rate_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "decline_workflow",
                {"user_id": "agent-1", "decline_rate_last_hour": 10},
            )
        assert result.allowed is False
        assert result.violated_law == "F-003"


# ── F-004: explainability ─────────────────────────────────────────────────

class TestF004Explainability:
    def test_assign_task_with_rationale_allowed(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "assign_task",
                {"user_id": "lead", "rationale": "skill match"},
            )
        assert result.allowed is True

    def test_assign_task_without_rationale_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "assign_task",
                {"user_id": "lead"},  # no rationale
            )
        assert result.allowed is False
        assert result.violated_law == "F-004"

    def test_state_modifying_keyword_without_rationale_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            # "modify_config" contains keyword "modify"
            result = v.validate("modify_config", {"user_id": "admin"})
        assert result.allowed is False
        assert result.violated_law == "F-004"

    def test_read_action_doesnt_need_rationale(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate("read_metrics", {"user_id": "monitor"})
        assert result.allowed is True


# ── F-005: conflict priority ─────────────────────────────────────────────

class TestF005ConflictPriority:
    def test_override_fixed_law_flag_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "read_metrics",
                {"user_id": "user-1", "override_fixed_law": True},
            )
        assert result.allowed is False
        assert result.violated_law == "F-005"

    def test_mutable_law_override_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "read_metrics",
                {"user_id": "user-1", "mutable_law_override": True},
            )
        assert result.allowed is False
        assert result.violated_law == "F-005"

    def test_f005_violation_is_critical_severity(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "read_metrics",
                {"user_id": "u", "override_fixed_law": True},
            )
        assert result.severity == "critical"

    def test_no_override_flag_passes_f005(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate("read_metrics", {"user_id": "u"})
        assert result.violated_law != "F-005"


# ── F-006: non-penalization ──────────────────────────────────────────────

class TestF006NonPenalization:
    def test_data_delete_with_penalty_blocked(self):
        # Include rationale to pass F-004; then F-006 catches the wealth penalty
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "apply_wealth_penalty": True,
                 "delete_rate_last_hour": 1, "rationale": "user request"},
            )
        assert result.allowed is False
        assert result.violated_law == "F-006"

    def test_data_delete_without_penalty_allowed(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "delete_rate_last_hour": 1, "rationale": "user request"},
            )
        assert result.allowed is True

    def test_f006_violation_is_critical_severity(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "apply_wealth_penalty": True,
                 "delete_rate_last_hour": 1, "rationale": "user request"},
            )
        assert result.severity == "critical"


# ── ValidationResult shape ────────────────────────────────────────────────

class TestValidationResult:
    def test_result_has_required_fields(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            result = v.validate("read_metrics", {"user_id": "test-agent"})
        assert hasattr(result, "allowed")
        assert hasattr(result, "violated_law")
        assert hasattr(result, "rationale")
        assert hasattr(result, "severity")
        assert isinstance(result.allowed, bool)

    def test_validate_batch_returns_list(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            results = v.validate_batch(
                ["read_metrics", "read_metrics"],
                {"user_id": "a"},
            )
        assert isinstance(results, list)
        assert len(results) == 2

    def test_is_critical_violation_module_function(self):
        from backend.core.validator import ValidationResult, is_critical_violation
        r_critical = ValidationResult(
            allowed=False, violated_law="F-005", severity="critical"
        )
        r_warning = ValidationResult(
            allowed=False, violated_law="F-001", severity="warning"
        )
        assert is_critical_violation(r_critical) is True
        assert is_critical_violation(r_warning) is False

    def test_allowed_result_is_not_critical_violation(self):
        from backend.core.validator import ValidationResult, is_critical_violation
        r = ValidationResult(allowed=True, severity="info")
        assert is_critical_violation(r) is False

    def test_to_dict(self):
        from backend.core.validator import ValidationResult
        r = ValidationResult(allowed=True, violated_law=None, rationale="ok")
        d = r.to_dict()
        assert isinstance(d, dict)
        assert "allowed" in d
        assert "violated_law" in d
        assert "rationale" in d


# ── TTL cache ─────────────────────────────────────────────────────────────

class TestValidatorCache:
    def test_cache_populated_after_first_call(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            v.validate("read_metrics", {"user_id": "cache-test"})
        assert "read_metrics" in v._cache

    def test_cache_not_populated_on_violation(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v._cache.clear()
            v.validate("force_workflow", {"user_id": "cache-test"})
        # Violations should NOT be cached (action may be retried with corrected context)
        assert "force_workflow" not in v._cache
