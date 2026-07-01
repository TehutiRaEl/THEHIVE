"""
Constitutional Validator — Sovereign Hive
Enforces F-001 through F-006 (the new fixed laws) as code.
Complements the existing ConstitutionChecker (TITLE IX–XVI laws).
"""

import threading
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple

from backend.core.db import get_db

# State-modifying action keyword patterns for F-004 detection
_STATE_MODIFY_KEYWORDS = {
    "assign", "prune", "change", "restrict", "modify", "update",
    "delete", "remove", "create", "alter", "revoke", "grant",
}


@dataclass
class ValidationResult:
    allowed: bool
    violated_law: Optional[str] = None
    rationale: str = ""
    action: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    severity: str = "info"  # "info" | "warning" | "critical"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "allowed": self.allowed,
            "violated_law": self.violated_law,
            "rationale": self.rationale,
            "action": self.action,
            "timestamp": self.timestamp,
            "severity": self.severity,
        }


def is_critical_violation(result: ValidationResult) -> bool:
    """Return True if the violation is at critical severity."""
    return not result.allowed and result.severity == "critical"


class ConstitutionalValidator:
    """
    Policy-as-code enforcement of F-001 through F-006.
    Every action that affects a user must pass through validate() before execution.
    F-004: All violations return a human-readable rationale.
    """

    _log_lock = threading.Lock()
    _cache: Dict[str, Tuple["ValidationResult", float]] = {}
    CACHE_TTL = 5.0  # seconds — short TTL since context can change

    def validate(self, action: str, context: Dict[str, Any]) -> ValidationResult:
        """Evaluate an action against all fixed laws. Returns on first violation."""
        # Cache lookup (keyed by action only — context may vary)
        cache_key = action
        cached = self._cache.get(cache_key)
        if cached and (time.monotonic() - cached[1]) < self.CACHE_TTL:
            return cached[0]

        checks = [
            self._check_f001,
            self._check_f002,
            self._check_f003,
            self._check_f004,
            self._check_f005,
            self._check_f006,
        ]
        for check in checks:
            result = check(action, context)
            result.action = action
            if not result.allowed:
                result.severity = "critical" if result.violated_law in ("F-005", "F-006") else "warning"
                self._log(action, context.get("user_id", "system"), result)
                return result
        result = ValidationResult(
            allowed=True, rationale="Action complies with all fixed laws.",
            action=action, severity="info",
        )
        self._log(action, context.get("user_id", "system"), result)
        self._cache[cache_key] = (result, time.monotonic())
        return result

    def validate_batch(self, actions: List[str], context: Dict[str, Any]) -> List[ValidationResult]:
        """Validate multiple actions against all fixed laws."""
        return [self.validate(action, context) for action in actions]

    def _check_f001(self, action: str, ctx: Dict) -> ValidationResult:
        """F-001: Data deletion must complete within 5 minutes; rate limit 10/hour."""
        if action == "data_delete":
            rate = ctx.get("delete_rate_last_hour", 0)
            if rate >= 10:
                return ValidationResult(
                    allowed=False,
                    violated_law="F-001",
                    rationale=(
                        "F-001 (Data Sovereignty): Rate limit exceeded. "
                        f"You have made {rate} deletion requests in the last hour. "
                        "Maximum is 10/hour."
                    ),
                )
        return ValidationResult(allowed=True)

    def _check_f002(self, action: str, ctx: Dict) -> ValidationResult:
        """F-002: Wealth formula changes must apply prospectively only."""
        if action == "change_wealth_formula":
            if ctx.get("retroactive", False):
                return ValidationResult(
                    allowed=False,
                    violated_law="F-002",
                    rationale=(
                        "F-002 (Value-Weighted Wealth): Wealth formula changes "
                        "must apply prospectively only. Retroactive changes are forbidden."
                    ),
                )
        return ValidationResult(allowed=True)

    def _check_f003(self, action: str, ctx: Dict) -> ValidationResult:
        """F-003: Workflows cannot be forced; decline rate limit 10/hour."""
        if action == "force_workflow":
            return ValidationResult(
                allowed=False,
                violated_law="F-003",
                rationale=(
                    "F-003 (Autonomy & Alternatives): The operator shall never force "
                    "a workflow. Offer a manual alternative or up to 3 correlated workflows."
                ),
            )
        if action == "decline_workflow":
            rate = ctx.get("decline_rate_last_hour", 0)
            if rate >= 10:
                return ValidationResult(
                    allowed=False,
                    violated_law="F-003",
                    rationale=(
                        f"F-003 (Autonomy & Alternatives): Decline rate limit exceeded "
                        f"({rate}/hour). Maximum is 10/hour. Try again after the window resets."
                    ),
                )
        return ValidationResult(allowed=True)

    def _check_f004(self, action: str, ctx: Dict) -> ValidationResult:
        """F-004: Every decision affecting the user must include a rationale."""
        affects_user_actions = {
            "assign_task", "prune_memory", "change_wealth", "restrict_access",
            "modify_workflow", "update_permissions",
        }
        action_lower = action.lower()
        is_state_modifying = (
            action in affects_user_actions
            or any(kw in action_lower for kw in _STATE_MODIFY_KEYWORDS)
        )
        if is_state_modifying and not ctx.get("rationale"):
            return ValidationResult(
                allowed=False,
                violated_law="F-004",
                rationale=(
                    "F-004 (Explainability): Every decision that affects the user "
                    "must be accompanied by a human-readable rationale. "
                    "Include 'rationale' in your request context."
                ),
            )
        return ValidationResult(allowed=True)

    def _check_f005(self, action: str, ctx: Dict) -> ValidationResult:
        """F-005: Fixed laws cannot be overridden by mutable laws or any override flag."""
        if ctx.get("override_fixed_law") or ctx.get("mutable_law_override"):
            return ValidationResult(
                allowed=False,
                violated_law="F-005",
                rationale=(
                    "F-005 (Conflict Priority): Fixed laws are immutable. "
                    "No mutable law, flag, or human veto can override F-001 through F-006."
                ),
            )
        return ValidationResult(allowed=True)

    def _check_f006(self, action: str, ctx: Dict) -> ValidationResult:
        """F-006: Exercising a fixed right must not reduce wealth or other rights."""
        if action in {"data_delete", "decline_workflow"} and ctx.get("apply_wealth_penalty"):
            return ValidationResult(
                allowed=False,
                violated_law="F-006",
                rationale=(
                    "F-006 (Cross-Law Non-Penalization): Exercising a fixed right "
                    f"('{action}') shall not reduce wealth or other rights. "
                    "Remove the wealth penalty."
                ),
            )
        return ValidationResult(allowed=True)

    def _log(self, action: str, user_id: str, result: ValidationResult):
        with self._log_lock:
            try:
                conn = get_db()
                conn.execute(
                    """INSERT INTO constitution_log (timestamp, action_type, actor, violation, decision)
                       VALUES (?, ?, ?, ?, ?)""",
                    (
                        datetime.now().isoformat(),
                        action,
                        user_id,
                        result.violated_law or "",
                        "ALLOW" if result.allowed else "BLOCK",
                    ),
                )
                conn.commit()
            except Exception:
                pass


validator = ConstitutionalValidator()
