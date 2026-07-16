# core/agency

Swarm Agency — Sovereign Hive

## Classes

- `AgencyLevel`
- `AgencyDecision`
- `SwarmAgency` — Governs what autonomous agents are permitted to do.

## Functions

- `to_dict()`
- `check()` — Evaluate whether an agent is permitted to take an action at a given level.
- `revoke_agency()` — Revoke an agent's EXECUTE/DEVIATE rights. Inserts sentinel revocation row.
- `get_agency_history()` — Return the last N agency decisions for an agent.

## Links

[[core.db]]
