# core/genome

Genome Reproduction — Sovereign Hive v11.0

## Classes

- `GenomeReproduction` — Combines two parent genomes via crossover + mutation to create offspring.

## Functions

- `compatibility()` — Returns 0-1 compatibility score based on genome similarity.
- `crossover()` — Uniform crossover with Gaussian mutation. Returns child trait dict.
- `spawn_child()` — Full pipeline: crossover → DB insert → ELO init → wallet create.
- `get_traits()` — Get all traits for an agent.
- `get_genealogy()` — Get mythology entries for an agent.
- `update_trait()` — Update a single trait for an agent.
- `get_all_genomes()` — Get all agent genomes.
- `get_avg_genome()` — Get average genome across all agents.

## Links

[[core.db]] · [[core.wallet]]
