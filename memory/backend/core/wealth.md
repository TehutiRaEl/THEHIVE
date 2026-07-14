# core/wealth

Wealth Engine — Sovereign Hive

## Classes

- `Contribution`
- `WealthSnapshot`
- `WealthEngine` — Calculates and persists user wealth according to F-001/F-002 rules.

## Functions

- `evw()` — EVW = (hours_saved*0.4) + (adoption_count*0.3) + (novelty_score*0.2) + (dispute_resilience*0.1)
- `to_dict()`
- `record_contribution()` — Record a new contribution and return its ID.
- `record_active_time()` — Log time actively providing value to the swarm (F-001 method 1).
- `calculate()` — Compute current wealth for a user. Results cached for 60 seconds.
- `get_wealth()` — Retrieve the last computed wealth snapshot for a user.
- `get_contributions()`

## Links

[[core.db]]
