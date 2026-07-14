# core/validator

Constitutional Validator — Sovereign Hive

## Classes

- `ValidationResult`
- `ConstitutionalValidator` — Policy-as-code enforcement of F-001 through F-006.

## Functions

- `is_critical_violation()` — Return True if the violation is at critical severity.
- `to_dict()`
- `validate()` — Evaluate an action against all fixed laws. Returns on first violation.
- `validate_batch()` — Validate multiple actions against all fixed laws.

## Links

[[core.db]]
