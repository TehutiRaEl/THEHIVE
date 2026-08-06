"""
Unit tests for backend/core/constitution.py (CAMPAIGN.html task 12, 2026-08-06).

Real finding this file's rewrite fixed: ConstitutionChecker previously enforced
a fabricated "v4.0" document (Titles IX-XVI, Cardinal Laws, DR-Axioms) that never
matched the real soul.md at the repo root — a different document entirely, not
just outdated wording. GET /v11/constitution/soul_md served that fake text to
any caller, labeled as "the" constitution. Confirmed with the founder before
rewriting: switch to reading and enforcing the real, current soul.md
(F-001-F-006) instead. These tests prove the parser reads the real file
correctly, that a real amendment changes what's reported (the task's own
literal acceptance criterion), and that every real call site's expected return
shape and blocking behavior survived the switch unchanged.
"""
import asyncio
import os
import tempfile

import pytest

from backend.core.constitution import ConstitutionChecker, parse_soul_md, OPERATIONAL_SAFETY_RULES


REAL_SOUL_MD = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "soul.md")


class _FakeRequest:
    """Minimal stand-in for a Starlette Request — check_request() only reads
    .url.path, .method, and (for one path) awaits .json()."""
    def __init__(self, path, method="GET", json_body=None):
        self.url = type("U", (), {"path": path})()
        self.method = method
        self._json_body = json_body or {}

    async def json(self):
        return self._json_body


# ── Real-file parsing ──────────────────────────────────────────────────────

class TestParseRealSoulMd:
    def test_finds_all_six_fixed_laws(self):
        parsed = parse_soul_md(REAL_SOUL_MD)
        assert set(parsed["fixed"].keys()) == {
            "F-001", "F-002", "F-003", "F-004", "F-005", "F-006",
        }

    def test_fixed_law_text_is_real_not_invented(self):
        parsed = parse_soul_md(REAL_SOUL_MD)
        assert "5 minutes" in parsed["fixed"]["F-001"]["text"]
        assert "10/hour" in parsed["fixed"]["F-001"]["text"]
        assert parsed["fixed"]["F-005"]["title"] == "Conflict Priority"

    def test_finds_mutable_laws_including_resonance_threshold(self):
        parsed = parse_soul_md(REAL_SOUL_MD)
        mutable_text = " ".join(parsed["mutable"].values())
        assert "0.707" in mutable_text

    def test_missing_file_returns_empty_dict_not_a_crash(self):
        assert parse_soul_md("/nonexistent/path/soul.md") == {}


# ── The task's literal acceptance criterion: changing soul.md changes output ─

class TestLiveAmendmentChangesEnforcement:
    def test_editing_soul_md_text_changes_get_laws_output(self):
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
            f.write(
                "## Fixed Laws (Immutable)\n\n"
                "### F-001: Original Title\noriginal body text\n"
            )
            path = f.name
        try:
            checker = ConstitutionChecker(path=path)
            assert checker.get_laws()["fixed"]["F-001"]["title"] == "Original Title"

            # A real amendment: the file changes on disk...
            with open(path, "w") as f:
                f.write(
                    "## Fixed Laws (Immutable)\n\n"
                    "### F-001: Amended Title\namended body text\n"
                )
            # ...and a FRESH checker instance reflects it immediately, no code change.
            checker2 = ConstitutionChecker(path=path)
            assert checker2.get_laws()["fixed"]["F-001"]["title"] == "Amended Title"
            assert checker2.get_hash() != checker.get_hash()
        finally:
            os.unlink(path)

    def test_get_raw_text_reads_fresh_every_call(self):
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False) as f:
            f.write("first version")
            path = f.name
        try:
            checker = ConstitutionChecker(path=path)
            assert checker.get_raw_text() == "first version"
            with open(path, "w") as f:
                f.write("second version")
            # Same instance, no re-init — get_raw_text() re-reads the file live.
            assert checker.get_raw_text() == "second version"
        finally:
            os.unlink(path)


# ── check() — F-001-F-006 delegation to validator, and operational rules ────

class TestCheckDelegatesToValidator:
    def test_f001_rate_limit_blocks_via_check(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = checker.check("data_delete", "agent-1", {"delete_rate_last_hour": 10})
        assert result["allowed"] is False
        assert "F-001" in result["article"]

    def test_f003_force_workflow_blocks_via_check(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = checker.check("force_workflow", "agent-1", {})
        assert result["allowed"] is False
        assert "F-003" in result["article"]

    def test_unrecognized_action_is_allowed(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        # Matches arena.py's real call shape for a bet — never in the old
        # HARD_RULES dict either, so this preserves existing behavior.
        result = checker.check("place_bet", "agent-1", {"amount": 10})
        assert result["allowed"] is True


class TestOperationalSafetyRulesPreserved:
    def test_agent_deletion_still_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = checker.check("no_agent_deletion", "agent-1", {})
        assert result["allowed"] is False
        assert result["article"] == OPERATIONAL_SAFETY_RULES["no_agent_deletion"]

    def test_get_blocked_actions_lists_operational_rules(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        assert set(checker.get_blocked_actions()) == set(OPERATIONAL_SAFETY_RULES.keys())


# ── check_request() — same real paths blocked as before the rewrite ─────────

class TestCheckRequestPreservesRealGates:
    def test_agent_delete_path_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = asyncio.run(checker.check_request(_FakeRequest("/v11/agent/delete", "POST")))
        assert result is not None
        assert result["article"] == OPERATIONAL_SAFETY_RULES["no_agent_deletion"]

    def test_soul_print_path_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = asyncio.run(checker.check_request(_FakeRequest("/v11/soul/print", "POST")))
        assert result is not None
        assert result["article"] == OPERATIONAL_SAFETY_RULES["soul_reserve"]

    def test_human_veto_flag_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        req = _FakeRequest("/v11/constitution/amend", "POST", json_body={"human_veto": True})
        result = asyncio.run(checker.check_request(req))
        assert result is not None
        assert result["article"] == OPERATIONAL_SAFETY_RULES["no_human_veto"]

    def test_health_path_never_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = asyncio.run(checker.check_request(_FakeRequest("/health", "GET")))
        assert result is None

    def test_normal_path_not_blocked(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        result = asyncio.run(checker.check_request(_FakeRequest("/v11/agents", "GET")))
        assert result is None


# ── Metadata methods report real values, not fabricated ones ────────────────

class TestMetadataIsReal:
    def test_resonance_threshold_matches_real_soul_md(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        assert checker.get_required_resonance() == 0.707
        assert checker.get_doubling_threshold() == 0.707

    def test_amendment_requirements_has_no_fabricated_ninety_day_clause(self):
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        reqs = checker.get_amendment_requirements()
        assert reqs["mutable_laws"]["waiting_period"] == "30 days"
        assert reqs["fixed_laws"]["amendable"] is False

    def test_get_hash_matches_real_file_sha256(self):
        import hashlib
        checker = ConstitutionChecker(path=REAL_SOUL_MD)
        with open(REAL_SOUL_MD, "rb") as f:
            expected = hashlib.sha256(f.read()).hexdigest()
        assert checker.get_hash() == expected
