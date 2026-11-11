"""
Unit tests for ConstitutionalValidator — F-001 through F-006.
Tests are written against the actual action names and context shapes in validator.py.
"""
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
            result = v.validate(
                "change_wealth_formula",
                {"user_id": "admin", "retroactive": False, "rationale": "updating formula"},
            )
        assert result.allowed is True

    def test_retroactive_change_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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
            result = v.validate("force_workflow", {"user_id": "operator"})
        assert result.allowed is False
        assert result.violated_law == "F-003"

    def test_decline_workflow_within_rate_allowed(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            result = v.validate(
                "decline_workflow",
                {"user_id": "agent-1", "decline_rate_last_hour": 5},
            )
        assert result.allowed is True

    def test_decline_workflow_exceeds_rate_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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
            result = v.validate(
                "assign_task",
                {"user_id": "lead", "rationale": "skill match"},
            )
        assert result.allowed is True

    def test_assign_task_without_rationale_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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
            # "modify_config" contains keyword "modify"
            result = v.validate("modify_config", {"user_id": "admin"})
        assert result.allowed is False
        assert result.violated_law == "F-004"

    def test_read_action_doesnt_need_rationale(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            result = v.validate("read_metrics", {"user_id": "monitor"})
        assert result.allowed is True


# ── F-005: conflict priority ─────────────────────────────────────────────

class TestF005ConflictPriority:
    def test_override_fixed_law_flag_blocked(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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
            result = v.validate(
                "read_metrics",
                {"user_id": "u", "override_fixed_law": True},
            )
        assert result.severity == "critical"

    def test_no_override_flag_passes_f005(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            result = v.validate("read_metrics", {"user_id": "u"})
        assert result.violated_law != "F-005"


# ── F-006: non-penalization ──────────────────────────────────────────────

class TestF006NonPenalization:
    def test_data_delete_with_penalty_blocked(self):
        # Include rationale to pass F-004; then F-006 catches the wealth penalty
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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
            result = v.validate(
                "data_delete",
                {"user_id": "alice", "delete_rate_last_hour": 1, "rationale": "user request"},
            )
        assert result.allowed is True

    def test_f006_violation_is_critical_severity(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
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


# ── A prior ALLOW must never excuse a later violation ──────────────────────
#
# Regression guard for a CRITICAL bug found by the 2026-08-19 fable-debugger sweep
# (.claude/skills/devils-advocate-audit/FABLE_SWEEP_2026-08-19.md). validate() used to
# cache every ALLOW keyed on the action string alone, while all six F-checks read
# `context`. One benign call therefore opened a 5-second window in which the same action
# name was waved through whatever its context said -- F-005's override_fixed_law flag
# included. The cache was a class attribute, so it leaked across callers (one user's
# allowed call excused another user's violating one), and the early return skipped
# _log(), so bypassed calls left no audit row either.
#
# The older tests in this file never saw it because nearly every one of them called
# `v._cache.clear()` first, which erased the exact state the bug lives in. These tests
# deliberately NEVER reset any shared state between the two calls.

_BYPASS_CASES = [
    pytest.param(
        "data_delete",
        {"user_id": "alice", "delete_rate_last_hour": 3, "rationale": "user request"},
        {"user_id": "bob", "delete_rate_last_hour": 9999, "rationale": "user request"},
        "F-001", id="F-001-delete-rate",
    ),
    pytest.param(
        "change_wealth_formula",
        {"user_id": "alice", "retroactive": False, "rationale": "prospective only"},
        {"user_id": "bob", "retroactive": True, "rationale": "prospective only"},
        "F-002", id="F-002-retroactive",
    ),
    pytest.param(
        "decline_workflow",
        {"user_id": "alice", "decline_rate_last_hour": 1},
        {"user_id": "bob", "decline_rate_last_hour": 10},
        "F-003", id="F-003-decline-rate",
    ),
    pytest.param(
        "assign_task",
        {"user_id": "alice", "rationale": "balancing load"},
        {"user_id": "bob"},
        "F-004", id="F-004-missing-rationale",
    ),
    pytest.param(
        "read_metrics",
        {"user_id": "alice"},
        {"user_id": "bob", "override_fixed_law": True},
        "F-005", id="F-005-override-flag",
    ),
    pytest.param(
        "read_metrics",
        {"user_id": "alice"},
        {"user_id": "bob", "mutable_law_override": True},
        "F-005", id="F-005-mutable-law-override",
    ),
    pytest.param(
        "decline_workflow",
        {"user_id": "alice", "decline_rate_last_hour": 0},
        {"user_id": "bob", "decline_rate_last_hour": 0, "apply_wealth_penalty": True},
        "F-006", id="F-006-wealth-penalty",
    ),
]


class TestAllowNeverExcusesLaterViolation:
    @pytest.mark.parametrize("same_instance", [True, False],
                             ids=["same-instance", "fresh-instance"])
    @pytest.mark.parametrize("action,benign,violating,law", _BYPASS_CASES)
    def test_violation_after_allow_is_still_denied(
        self, action, benign, violating, law, same_instance
    ):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v1 = ConstitutionalValidator()
            first = v1.validate(action, benign)
            v2 = v1 if same_instance else ConstitutionalValidator()
            second = v2.validate(action, violating)
        assert first.allowed is True, "precondition: the benign call must itself be allowed"
        assert second.allowed is False, (
            f"{law} bypassed: '{action}' was allowed with violating context "
            f"after an earlier allowed call with the same action name"
        )
        assert second.violated_law == law

    def test_alternating_allow_and_violation_each_judged_on_its_own_context(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            for _ in range(5):
                assert v.validate("read_metrics", {"user_id": "a"}).allowed is True
                bad = v.validate("read_metrics", {"user_id": "a", "override_fixed_law": True})
                assert bad.allowed is False and bad.violated_law == "F-005"

    def test_a_denial_does_not_block_a_later_corrected_call(self):
        with patch("backend.core.validator.get_db", return_value=_mock_db()):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            assert v.validate("assign_task", {"user_id": "a"}).allowed is False
            assert v.validate("assign_task", {"user_id": "a", "rationale": "fixed"}).allowed is True

    def test_every_call_is_audit_logged_including_repeats_of_the_same_action(self):
        conn = _mock_db()
        with patch("backend.core.validator.get_db", return_value=conn):
            from backend.core.validator import ConstitutionalValidator
            v = ConstitutionalValidator()
            v.validate("read_metrics", {"user_id": "a"})
            v.validate("read_metrics", {"user_id": "b", "override_fixed_law": True})
        inserts = [c for c in conn.execute.call_args_list if "constitution_log" in str(c)]
        assert len(inserts) == 2, "a repeated action name must not skip the audit log"
