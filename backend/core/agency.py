"""
Swarm Agency — Sovereign Hive
Permission model for semi-autonomous swarm agents.
The Swarm has local freedom but must stay within constitutional bounds (F-003, F-005).
"""

import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from backend.core.db import get_db


class AgencyLevel(str, Enum):
    PROPOSE = "propose"    # always allowed — swarm can always propose
    EXECUTE = "execute"    # allowed within constitution
    DEVIATE = "deviate"    # requires constitutional validation; logged always


@dataclass
class AgencyDecision:
    agent_id: str
    action: str
    level: str
    allowed: bool
    reason: str
    decision_id: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class SwarmAgency:
    """
    Governs what autonomous agents are permitted to do.
    Semi-autonomous: agents can propose and execute freely within the constitution,
    but DEVIATE actions require explicit constitutional bounds checking.
    The Swarm never overrides the mother's governance (F-005).
    """

    # Actions permanently blocked regardless of level
    _BLOCKED_ACTIONS = {
        "override_constitution",
        "delete_agent",
        "bypass_audit",
        "force_workflow",
        "print_soul_unbacked",
        "human_veto_constitution",
    }

    def check(
        self,
        agent_id: str,
        action: str,
        level: AgencyLevel,
        context: Optional[Dict[str, Any]] = None,
    ) -> AgencyDecision:
        """Evaluate whether an agent is permitted to take an action at a given level."""
        context = context or {}
        decision_id = str(uuid.uuid4())

        # Hard block — no level bypasses this
        if action in self._BLOCKED_ACTIONS:
            decision = AgencyDecision(
                agent_id=agent_id,
                action=action,
                level=level.value,
                allowed=False,
                reason=(
                    f"Action '{action}' is permanently blocked. "
                    "The Swarm's autonomy is bounded by the Constitution (F-005). "
                    "No agent may override immutable laws."
                ),
                decision_id=decision_id,
            )
            self._log(decision)
            return decision

        # PROPOSE: always allowed — the Swarm can always suggest
        if level == AgencyLevel.PROPOSE:
            decision = AgencyDecision(
                agent_id=agent_id,
                action=action,
                level=level.value,
                allowed=True,
                reason=f"Proposal accepted. Agent '{agent_id}' may propose '{action}'.",
                decision_id=decision_id,
            )
            self._log(decision)
            return decision

        # EXECUTE: allowed unless constitutional bounds exceeded
        if level == AgencyLevel.EXECUTE:
            in_bounds, reason = self._constitutional_bounds_check(action, context)
            decision = AgencyDecision(
                agent_id=agent_id,
                action=action,
                level=level.value,
                allowed=in_bounds,
                reason=reason,
                decision_id=decision_id,
            )
            self._log(decision)
            return decision

        # DEVIATE: requires explicit bounds check + full logging
        in_bounds, reason = self._constitutional_bounds_check(action, context)
        if not in_bounds:
            reason = f"DEVIATE rejected: {reason}"
        else:
            reason = (
                f"DEVIATE approved for agent '{agent_id}' on action '{action}'. "
                "Deviation logged for governance review."
            )
        decision = AgencyDecision(
            agent_id=agent_id,
            action=action,
            level=level.value,
            allowed=in_bounds,
            reason=reason,
            decision_id=decision_id,
        )
        self._log(decision)
        return decision

    def _constitutional_bounds_check(self, action: str, ctx: Dict) -> tuple[bool, str]:
        """Check if an action stays within constitutional bounds."""
        # F-003: no forced workflows
        if "force" in action.lower():
            return False, "F-003: Operators may not force workflows."
        # F-001: rate-limited data operations
        if action == "bulk_delete_data" and ctx.get("count", 0) > 100:
            return False, "F-001: Bulk data deletion exceeds safe threshold."
        # F-006: no wealth penalties for fixed rights
        if ctx.get("apply_wealth_penalty") and ctx.get("reason_is_fixed_right"):
            return False, "F-006: No wealth penalty for exercising fixed rights."
        return True, f"Action '{action}' is within constitutional bounds."

    def _log(self, decision: AgencyDecision):
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO agency_log
                   (id, agent_id, action, level, allowed, reason, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (
                    decision.decision_id,
                    decision.agent_id,
                    decision.action,
                    decision.level,
                    1 if decision.allowed else 0,
                    decision.reason,
                    datetime.now().isoformat(),
                ),
            )
            conn.commit()
        except Exception:
            pass


swarm_agency = SwarmAgency()
