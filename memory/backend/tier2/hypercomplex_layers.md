# tier2/hypercomplex_layers

HYPERCOMPLEX LAYERS — Sovereign Hive v11.0 Tier 2

## Classes

- `QuaternionOps` — Hamilton quaternions: Q = w + xi + yj + zk
- `QuaternionLinear` — Quaternion-valued linear layer: maps (n_in, 4) → (n_out, 4).
- `CliffordAlgebra` — Clifford algebra Cl(3,0) with basis {1, e1, e2, e3, e12, e13, e23, e123}.
- `HyperComplexRNN` — LSTM-like RNN operating in quaternion space.
- `DualNumber` — Dual numbers: a + bε where ε²=0. Perfect for automatic differentiation.
- `GuildEncoder`

## Functions

- `task_priority_sensitivity()`
- `get_guild_encoder()`
- `mul()` — Hamilton product: (..., 4) × (..., 4) → (..., 4)
- `conj()` — Conjugate: q* = w - xi - yj - zk
- `norm()`
- `unit()`
- `inv()` — Multiplicative inverse: q^{-1} = q* / ||q||^2
- `slerp()` — Spherical linear interpolation (geodesic on S^3).
- `encode_legal_concept()` — Map a legal concept to a unit quaternion.
- `legal_similarity()` — Angular distance between two legal concepts in quaternion space.
- `forward()` — x: (n_in, 4) → out: (n_out, 4)
- `gp()`
- `grade_project()`
- `inner()`
- `outer()`
- `encode_colony_building()`
- `colony_interaction()`
- `mv_norm()`
- `step()`
- `reset()`
