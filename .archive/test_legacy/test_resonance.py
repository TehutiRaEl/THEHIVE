import pytest
from backend.resonance import ResonanceEngine

def test_resonance_compute():
    engine = ResonanceEngine()
    rho = engine.compute_sync(0)
    assert 0.0 <= rho <= 1.0

def test_resonance_with_agents():
    engine = ResonanceEngine()
    rho = engine.compute_sync(10)
    assert 0.0 <= rho <= 1.0
    assert rho > engine.compute_sync(0)
