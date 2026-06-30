# tier2/argnn

ARGNN — Adaptive Riemannian Graph Neural Network

## Classes

- `RiemannianNode` — A node in the ARGNN with learnable local curvature.
- `GeodesicAttention` — Replaces dot-product attention with geodesic distance on the manifold.
- `ARGNNLayer` — One ARGNN message-passing round:
- `ColonyDensityGraph` — Models a colony as an ARGNN-powered graph.
- `FrequencyResonanceMatcher` — Matches tasks to agents using:

## Functions

- `get_matcher()`
- `match_task_to_agents()` — Top-level function: load agents into ARGNN and rank by resonance.
- `geodesic_distance()` — Distance on curved manifold: d_κ(u,v).
- `update_curvature()` — Adapt curvature toward neighbourhood mean (graph diffusion).
- `density_class()`
- `to_dict()`
- `compute()` — Returns attention weights (len(key_nodes),).
- `attend()` — Weighted aggregation of neighbour features.
- `forward()` — In-place update of node features. Returns updated nodes.
- `simulate()` — Run ARGNN forward passes and return density evolution.
- `register_agent()` — Add agent to the resonance graph.
- `resonance_score()` — Resonance = min/max Hz ratio, boosted by Schumann harmonic proximity.
- `match()` — Rank candidates by geodesic resonance. Returns sorted list with constitutional flag.
- `get_agent_node()`

## Links

[[core.db]] · [[core.frequency_guild]]
