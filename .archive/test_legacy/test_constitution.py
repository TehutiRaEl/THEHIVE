import pytest
from backend.constitution import ConstitutionChecker

def test_constitution_load():
    checker = ConstitutionChecker("soul.md")
    assert checker.get_hash() is not None

def test_constitution_delete_agent_blocked():
    checker = ConstitutionChecker("soul.md")
    result = checker.check_action("delete_agent", "test", {})
    assert result["allowed"] is False
    assert "violation" in result

def test_constitution_spawn_allowed():
    checker = ConstitutionChecker("soul.md")
    result = checker.check_action("spawn_agent", "test", {"name": "Alice"})
    assert result["allowed"] is True

def test_constitution_central_bank_blocked():
    checker = ConstitutionChecker("soul.md")
    result = checker.check_action("central_bank", "test", {})
    assert result["allowed"] is False

def test_constitution_terminate_blocked():
    checker = ConstitutionChecker("soul.md")
    result = checker.check_action("terminate_agent", "test", {})
    assert result["allowed"] is False
