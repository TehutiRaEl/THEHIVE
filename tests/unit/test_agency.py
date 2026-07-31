"""
Unit tests for backend/core/agency.py — the Swarm Agency permission model
(AgencyLevel OBSERVE→PROPOSE→EXECUTE→DEVIATE). Previously under-tested (31%)
despite being the gate every semi-autonomous swarm action passes through —
F-003 (no forced workflows), F-001 (bulk-delete threshold), F-006 (no wealth
penalty for fixed rights) are all enforced here, plus the permanent
_BLOCKED_ACTIONS hard-block and the 30s PROPOSE/EXECUTE decision cache.

Each test uses a fresh SwarmAgency() instance but note _cache and
_BLOCKED_ACTIONS are class-level — cache entries are keyed by
"agent_id:action:level", so distinct agent_id/action combos per test avoid
cross-test cache collisions without needing to clear the class cache.
"""
import os
import tempfile
import uuid

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_agency_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

from backend.core.db import init_db
from backend.core.agency import SwarmAgency, AgencyLevel

init_db()


def _agent(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


class TestObserve:
    def test_observe_is_always_allowed(self):
        a = SwarmAgency()
        decision = a.check(_agent("obs"), "read_state", AgencyLevel.OBSERVE)
        assert decision.allowed is True
        assert "always permitted" in decision.reason

    def test_observe_is_never_logged(self):
        a = SwarmAgency()
        agent = _agent("obs-log")
        a.check(agent, "read_state", AgencyLevel.OBSERVE)
        assert a.get_agency_history(agent) == []

    def test_observe_bypasses_the_blocked_action_list(self):
        """Documents actual behavior: the OBSERVE branch returns before the
        _BLOCKED_ACTIONS check runs, so a blocked action name at OBSERVE
        level is still reported allowed. Callers are expected to only ever
        request OBSERVE for genuinely read-only actions."""
        a = SwarmAgency()
        decision = a.check(_agent("obs-blocked"), "override_constitution", AgencyLevel.OBSERVE)
        assert decision.allowed is True


class TestBlockedActions:
    def test_propose_is_denied_for_a_blocked_action(self):
        a = SwarmAgency()
        decision = a.check(_agent("blk"), "delete_agent", AgencyLevel.PROPOSE)
        assert decision.allowed is False
        assert "permanently blocked" in decision.reason

    def test_execute_is_denied_for_a_blocked_action(self):
        a = SwarmAgency()
        decision = a.check(_agent("blk"), "bypass_audit", AgencyLevel.EXECUTE)
        assert decision.allowed is False

    def test_deviate_is_denied_for_a_blocked_action(self):
        a = SwarmAgency()
        decision = a.check(_agent("blk"), "print_soul_unbacked", AgencyLevel.DEVIATE)
        assert decision.allowed is False

    def test_blocked_action_denial_is_logged(self):
        a = SwarmAgency()
        agent = _agent("blk-log")
        a.check(agent, "force_workflow", AgencyLevel.EXECUTE)
        history = a.get_agency_history(agent)
        assert len(history) == 1
        assert history[0]["allowed"] == 0


class TestPropose:
    def test_propose_is_always_allowed_for_a_non_blocked_action(self):
        a = SwarmAgency()
        decision = a.check(_agent("prop"), "suggest_optimization", AgencyLevel.PROPOSE)
        assert decision.allowed is True

    def test_propose_decisions_are_cached_within_ttl(self):
        a = SwarmAgency()
        agent = _agent("prop-cache")
        first = a.check(agent, "suggest_optimization", AgencyLevel.PROPOSE)
        second = a.check(agent, "suggest_optimization", AgencyLevel.PROPOSE)
        assert second.decision_id == first.decision_id


class TestExecute:
    def test_execute_allowed_when_within_constitutional_bounds(self):
        a = SwarmAgency()
        decision = a.check(_agent("exec"), "update_dashboard", AgencyLevel.EXECUTE)
        assert decision.allowed is True
        assert "within constitutional bounds" in decision.reason

    def test_execute_denied_when_action_contains_force(self):
        """F-003: no forced workflows."""
        a = SwarmAgency()
        decision = a.check(_agent("exec"), "force_migration", AgencyLevel.EXECUTE)
        assert decision.allowed is False
        assert "F-003" in decision.reason

    def test_execute_denied_on_excessive_bulk_delete(self):
        """F-001: bulk data deletion exceeds safe threshold."""
        a = SwarmAgency()
        decision = a.check(
            _agent("exec"), "bulk_delete_data", AgencyLevel.EXECUTE, context={"count": 500},
        )
        assert decision.allowed is False
        assert "F-001" in decision.reason

    def test_execute_allowed_on_bulk_delete_under_threshold(self):
        a = SwarmAgency()
        decision = a.check(
            _agent("exec"), "bulk_delete_data", AgencyLevel.EXECUTE, context={"count": 50},
        )
        assert decision.allowed is True

    def test_execute_denied_on_wealth_penalty_for_fixed_right(self):
        """F-006: no wealth penalty for exercising fixed rights."""
        a = SwarmAgency()
        decision = a.check(
            _agent("exec"), "penalize_agent", AgencyLevel.EXECUTE,
            context={"apply_wealth_penalty": True, "reason_is_fixed_right": True},
        )
        assert decision.allowed is False
        assert "F-006" in decision.reason

    def test_execute_decisions_are_cached_within_ttl(self):
        a = SwarmAgency()
        agent = _agent("exec-cache")
        first = a.check(agent, "update_dashboard", AgencyLevel.EXECUTE)
        second = a.check(agent, "update_dashboard", AgencyLevel.EXECUTE)
        assert second.decision_id == first.decision_id


class TestDeviate:
    def test_deviate_approved_within_bounds_is_logged_with_governance_note(self):
        a = SwarmAgency()
        decision = a.check(_agent("dev"), "unusual_but_legal_action", AgencyLevel.DEVIATE)
        assert decision.allowed is True
        assert "logged for governance review" in decision.reason

    def test_deviate_rejected_out_of_bounds(self):
        a = SwarmAgency()
        decision = a.check(_agent("dev"), "force_reboot", AgencyLevel.DEVIATE)
        assert decision.allowed is False
        assert decision.reason.startswith("DEVIATE rejected:")

    def test_deviate_is_never_cached_each_call_is_a_fresh_decision(self):
        a = SwarmAgency()
        agent = _agent("dev-nocache")
        first = a.check(agent, "unusual_but_legal_action", AgencyLevel.DEVIATE)
        second = a.check(agent, "unusual_but_legal_action", AgencyLevel.DEVIATE)
        assert second.decision_id != first.decision_id

    def test_deviate_blocked_action_still_hard_blocked(self):
        a = SwarmAgency()
        decision = a.check(_agent("dev"), "human_veto_constitution", AgencyLevel.DEVIATE)
        assert decision.allowed is False
        assert "permanently blocked" in decision.reason


class TestRevocation:
    def test_revoked_agent_is_denied_execute(self):
        a = SwarmAgency()
        agent = _agent("rev")
        assert a.revoke_agency(agent, "test revocation") is True
        decision = a.check(agent, "update_dashboard", AgencyLevel.EXECUTE)
        assert decision.allowed is False
        assert "revoked" in decision.reason

    def test_revoked_agent_is_denied_deviate(self):
        a = SwarmAgency()
        agent = _agent("rev")
        a.revoke_agency(agent, "test revocation")
        decision = a.check(agent, "unusual_action", AgencyLevel.DEVIATE)
        assert decision.allowed is False

    def test_revoked_agent_can_still_propose(self):
        """Revocation gate only checks EXECUTE/DEVIATE — PROPOSE stays open."""
        a = SwarmAgency()
        agent = _agent("rev")
        a.revoke_agency(agent, "test revocation")
        decision = a.check(agent, "suggest_something", AgencyLevel.PROPOSE)
        assert decision.allowed is True

    def test_revoked_agent_can_still_observe(self):
        a = SwarmAgency()
        agent = _agent("rev")
        a.revoke_agency(agent, "test revocation")
        decision = a.check(agent, "read_state", AgencyLevel.OBSERVE)
        assert decision.allowed is True

    def test_revoke_invalidates_that_agents_cache(self):
        a = SwarmAgency()
        agent = _agent("rev-cache")
        cached = a.check(agent, "suggest_thing", AgencyLevel.PROPOSE)
        a.revoke_agency(agent, "cache-bust check")
        fresh = a.check(agent, "suggest_thing", AgencyLevel.PROPOSE)
        assert fresh.decision_id != cached.decision_id

    def test_revoke_does_not_invalidate_other_agents_cache(self):
        a = SwarmAgency()
        untouched = _agent("untouched")
        cached = a.check(untouched, "suggest_thing", AgencyLevel.PROPOSE)
        a.revoke_agency(_agent("someone-else"), "unrelated revocation")
        still_cached = a.check(untouched, "suggest_thing", AgencyLevel.PROPOSE)
        assert still_cached.decision_id == cached.decision_id


class TestHistory:
    def test_history_respects_limit(self):
        a = SwarmAgency()
        agent = _agent("hist")
        for i in range(5):
            a.check(agent, f"action_{i}", AgencyLevel.DEVIATE)
        assert len(a.get_agency_history(agent, limit=3)) == 3

    def test_history_is_empty_for_unknown_agent(self):
        a = SwarmAgency()
        assert a.get_agency_history(_agent("never-seen")) == []

    def test_history_includes_action_and_allowed_fields(self):
        a = SwarmAgency()
        agent = _agent("hist-fields")
        a.check(agent, "some_action", AgencyLevel.DEVIATE)
        row = a.get_agency_history(agent)[0]
        assert row["action"] == "some_action"
        assert row["level"] == "deviate"
        assert row["allowed"] == 1
