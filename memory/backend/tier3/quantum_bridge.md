# tier3/quantum_bridge

QUANTUM BRIDGE — Sovereign Hive v11.0 Tier 3

## Classes

- `QuantumCircuit` — Statevector simulator for n qubits.
- `QRNG` — Generate true (simulated) quantum random bits via H|0⟩ measurement.
- `BB84` — Simulates the BB84 QKD protocol between two agents (Alice and Bob).
- `GroverSearch`
- `HadamardHD`
- `IBMQMonitor`

## Functions

- `quantum_encode_text()`
- `grover_lexicon_search()`
- `h()`
- `x()`
- `y()`
- `z()`
- `s()`
- `t()`
- `rx()`
- `ry()`
- `rz()`
- `cnot()` — Controlled-NOT gate.
- `cz()` — Controlled-Z.
- `toffoli()` — Toffoli (CCX) gate.
- `measure()` — Measure qubit, collapse state. Returns 0 or 1.
- `measure_all()`
- `probabilities()`
- `fidelity()`
- `to_dict()`
- `random_bits()`
