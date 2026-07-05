"""
Tests for Governance Module — Sovereign Hive v11.0
"""

import pytest
from backend.governance.patterns import patterns, GOVERNANCE_PATTERNS

class TestGovernancePatterns:
    def test_get_all_patterns(self):
        """Test that all patterns are returned."""
        all_patterns = patterns.get_all()
        assert len(all_patterns) >= 10
        assert all("patternId" in p for p in all_patterns)
        assert all("name" in p for p in all_patterns)

    def test_get_by_id(self):
        """Test retrieving a specific pattern by ID."""
        pattern = patterns.get_by_id("futarchy")
        assert pattern is not None
        assert pattern["name"] == "Futarchy"
        assert pattern["successRate"] >= 0.0 and pattern["successRate"] <= 1.0

    def test_get_by_id_not_found(self):
        """Test retrieving a non-existent pattern."""
        pattern = patterns.get_by_id("non_existent")
        assert pattern is None

    def test_recommend(self):
        """Test pattern recommendation engine."""
        recommendations = patterns.recommend(context="funding", n=3)
        assert len(recommendations) == 3
        # Quadratic Funding should be boosted for funding context
        names = [p["name"] for p in recommendations]
        assert any("Quadratic" in name or "Funding" in name for name in names)

    def test_recommend_no_context(self):
        """Test recommendations without context."""
        recommendations = patterns.recommend(n=5)
        assert len(recommendations) == 5
        # Should return top patterns by success rate
        assert recommendations[0]["successRate"] >= recommendations[-1]["successRate"]

    def test_pattern_structure(self):
        """Test that all patterns have the required structure."""
        required_fields = [
            "patternId", "name", "description", "successRate",
            "complexityScore", "applicability", "pros", "cons"
        ]
        for p in GOVERNANCE_PATTERNS:
            for field in required_fields:
                assert field in p, f"Missing field '{field}' in pattern {p.get('patternId', 'unknown')}"

    def test_success_rate_bounds(self):
        """Test that success rates are within valid bounds."""
        for p in GOVERNANCE_PATTERNS:
            assert 0.0 <= p["successRate"] <= 1.0, f"Invalid success rate for {p['patternId']}"
