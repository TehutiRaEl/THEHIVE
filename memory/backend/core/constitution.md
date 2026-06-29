# core/constitution

Constitution Module — Sovereign Hive v11.0

## Classes

- `ConstitutionChecker` — Enforces soul.md as code. Rejects violations, not just logs them.

## Functions

- `check()` — Check if an action violates the constitution.
- `log()` — Log constitution checks to database.
- `get_hash()` — Get current constitution hash.
- `get_laws()` — Get parsed laws from the constitution.
- `is_constitutional()` — Quick check if action is constitutional (no logging).
- `get_blocked_actions()` — Get list of permanently blocked actions.
- `get_required_resonance()` — Get the minimum resonance required for task assignment.
- `get_doubling_threshold()` — Get the doubling threshold from the constitution.
- `get_amendment_requirements()` — Get the requirements for constitutional amendments.

## Links

[[core.config]] · [[core.db]]
