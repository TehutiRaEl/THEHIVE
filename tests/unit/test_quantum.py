"""
Unit tests for Quantum Bridge module
"""

import pytest
import numpy as np
from backend.tier3.quantum_bridge import (
    QuantumCircuit, QRNG, BB84, GroverSearch, HadamardHD,
    quantum_encode_text, grover_lexicon_search
)

class TestQuantumCircuit:
    def test_initialization(self):
        qc = QuantumCircuit(3)
        assert qc.n == 3
        assert len(qc.state) == 8
        assert qc.state[0] == 1.0

    def test_hadamard(self):
        qc = QuantumCircuit(1)
        qc.h(0)
        assert abs(abs(qc.state[0])**2 - 0.5) < 1e-8
        assert abs(abs(qc.state[1])**2 - 0.5) < 1e-8

    def test_cnot(self):
        qc = QuantumCircuit(2)
        qc.x(0)
        qc.cnot(0, 1)
        assert qc.state[3] == 1.0  # |11⟩

    def test_measure(self):
        qc = QuantumCircuit(1)
        qc.h(0)
        # Use fixed seed for reproducibility
        rng = np.random.RandomState(42)
        result = qc.measure(0, rng)
        assert result in [0, 1]

class TestQRNG:
    def test_random_bits(self):
        qrng = QRNG()
        bits = qrng.random_bits(10)
        assert len(bits) == 10
        assert all(b in [0, 1] for b in bits)

    def test_random_int(self):
        qrng = QRNG()
        val = qrng.random_int(0, 100)
        assert 0 <= val <= 100

class TestBB84:
    def test_exchange_no_eve(self):
        bb = BB84()
        result = bb.exchange(32, eve_present=False)
        assert result["n_bits_sent"] == 32
        assert result["security"] == "SECURE"
        assert result["eve_detected"] is False

    def test_exchange_with_eve(self):
        # Real, known flakiness fixed here (found on PR #183's CI): with no
        # fixed seed, Eve's interception is genuinely random per bit, so
        # roughly 1-in-100 runs show zero errors by pure chance even with
        # Eve present (~0.75^n_sifted for n_bits=32) and the assertion below
        # fails on real, correct code. Fixed seed for reproducibility, same
        # precedent as test_measure() above.
        bb = BB84()
        rng = np.random.RandomState(42)
        result = bb.exchange(32, eve_present=True, rng=rng)
        assert result["eve_detected"] is True or result["qber"] > 0

class TestGroverSearch:
    def test_search(self):
        grover = GroverSearch()
        items = ["SOVEREIGNTY", "FREQUENCY", "HARMONY", "SOUL", "TRUST"]
        result = grover.search(items, "SOUL")
        assert result["found"] is True
        assert result["best_match"] == "SOUL"
        assert result["n_items"] == 5

class TestHadamardHD:
    def test_make_vector(self):
        whd = HadamardHD(dim=8)
        v = whd.make_vector(42)
        assert len(v) == 8
        assert abs(np.linalg.norm(v) - 1.0) < 1e-8

    def test_similarity(self):
        whd = HadamardHD(dim=8)
        v1 = whd.encode_concept("SOVEREIGNTY")
        v2 = whd.encode_concept("SOVEREIGNTY")
        sim = whd.similarity(v1, v2)
        assert abs(sim - 1.0) < 1e-6

def test_quantum_encode_text():
    result = quantum_encode_text("SOVEREIGN HIVE", n_qubits=4)
    assert "n_qubits" in result
    assert result["n_qubits"] == 4
    assert "quantum_hash" in result
