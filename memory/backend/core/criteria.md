# core/criteria

Pruning Criteria — Sovereign Hive

## Classes

- `PruneDecision`
- `PruningCriteria` — Evaluates memory items against configurable retention rules.

## Functions

- `evaluate()` — Evaluate a single memory item. Returns prune/retain decision with rationale.
- `execute_pruning()` — Scan a memory table, evaluate each item, archive pruned ones.
- `get_pruning_log()`

## Links

[[core.db]]
