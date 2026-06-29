"""
Swarm Agency — Sovereign Hive
Permission model for semi-autonomous swarm agents.
The Swarm has local freedom but must stay within constitutional bounds (F-003, F-005).
"""

import time
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from backend.core.db import get_db


class AgencyLevel(str, Enum):
    OBSERVE = "observe"    # read-only; always allowed; not logged
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

    # 30-second TTL cache for PROPOSE/EXECUTE decisions (not DEVIATE)
    _cache: Dict[str, Tuple["AgencyDecision", float]] = {}
    CACHE_TTL = 30.0

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

        # OBSERVE: always allowed, never logged
        if level == AgencyLevel.OBSERVE:
            return AgencyDecision(
                agent_id=agent_id, action=action, level=level.value,
                allowed=True, reason="OBSERVE is always permitted (read-only).", decision_id=decision_id,
            )

        # Check revocation
        if self._is_revoked(agent_id) and level in (AgencyLevel.EXECUTE, AgencyLevel.DEVIATE):
            decision = AgencyDecision(
                agent_id=agent_id, action=action, level=level.value, allowed=False,
                reason=f"Agent '{agent_id}' agency has been revoked.", decision_id=decision_id,
            )
            self._log(decision)
            return decision

        # Cache lookup for PROPOSE/EXECUTE
        cache_key = f"{agent_id}:{action}:{level.value}"
        if level in (AgencyLevel.PROPOSE, AgencyLevel.EXECUTE):
            cached = self._cache.get(cache_key)
            if cached and (time.monotonic() - cached[1]) < self.CACHE_TTL:
                return cached[0]

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
            self._cache[cache_key] = (decision, time.monotonic())
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
            self._cache[cache_key] = (decision, time.monotonic())
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

    def _is_revoked(self, agent_id: str) -> bool:
        """Check if an agent's agency has been revoked."""
        try:
            conn = get_db()
            row = conn.execute(
                "SELECT level FROM agency_log WHERE agent_id = ? AND level = 'revoked' ORDER BY created_at DESC LIMIT 1",
                (agent_id,),
            ).fetchone()
            return row is not None
        except Exception:
            return False

    def revoke_agency(self, agent_id: str, reason: str) -> bool:
        """Revoke an agent's EXECUTE/DEVIATE rights. Inserts sentinel revocation row."""
        revoke_id = str(uuid.uuid4())
        try:
            conn = get_db()
            conn.execute(
                """INSERT INTO agency_log (id, agent_id, action, level, allowed, reason, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (revoke_id, agent_id, "revoke", "revoked", 0, reason, datetime.now().isoformat()),
            )
            conn.commit()
            # Invalidate cache for this agent
            for k in list(self._cache.keys()):
                if k.startswith(f"{agent_id}:"):
                    del self._cache[k]
            return True
        except Exception:
            return False

    def get_agency_history(self, agent_id: str, limit: int = 50) -> List[Dict]:
        """Return the last N agency decisions for an agent."""
        try:
            conn = get_db()
            rows = conn.execute(
                """SELECT id, agent_id, action, level, allowed, reason, created_at
                   FROM agency_log WHERE agent_id = ?
                   ORDER BY created_at DESC LIMIT ?""",
                (agent_id, limit),
            ).fetchall()
            return [dict(r) for r in rows]
        except Exception:
            return []

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
