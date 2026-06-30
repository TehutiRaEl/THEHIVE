# governance/patterns

Governance Patterns — Sovereign Hive v11.0

## Classes

- `GovernancePatterns` — Governance pattern repository with recommendation engine.

## Functions

- `get_all()` — Get all governance patterns.
- `get_by_id()` — Get a specific pattern by ID.
- `get_by_name()` — Get a pattern by name (case-insensitive partial match).
- `recommend()` — Recommend patterns based on context.
- `get_success_rate()` — Get success rate for a pattern.
- `get_complexity()` — Get complexity score for a pattern.
- `get_applicable_patterns()` — Get patterns applicable to a given agent count and context.
- `compare_patterns()` — Compare two patterns side by side.
