# core/constitution

Constitution Module — Sovereign Hive v11.0

## Classes

- `ConstitutionChecker` — Enforces soul.md (F-001-F-006) as code, parsed live from the real file —

## Functions

- `parse_soul_md()` — Parse the real soul.md into structured data. Returns {} if the file is
- `get_raw_text()` — The real, current soul.md text, read fresh every call — so an
- `check()` — Check an action against F-001-F-006 (via validator) plus the
- `log()` — Logging is validator.validate()'s own responsibility now (it logs
- `get_hash()` — Get current constitution hash — of the real soul.md file.
- `get_laws()` — Get the real, currently-parsed laws from soul.md — not a hard-coded
- `is_constitutional()` — Quick check if action is constitutional (no logging).
- `get_blocked_actions()` — Get list of permanently blocked (operational-policy) actions.
- `get_required_resonance()` — Minimum resonance required for task assignment — real value from
- `get_doubling_threshold()` — Same real value as get_required_resonance() — soul.md's mutable
- `get_amendment_requirements()` — Get the real amendment requirements — soul.md's Fixed Laws section

## Links

[[core.config]] · [[core.validator]]
