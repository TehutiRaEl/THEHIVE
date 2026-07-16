# core/governance

Governance Engine — Sovereign Hive

## Classes

- `PolicyDecision`
- `AuditEntry`
- `VoteRecord`
- `VoteTally`
- `GovernanceStatus`
- `GovernanceEngine` — Orchestrates policy decisions across the hive.

## Functions

- `to_dict()`
- `to_dict()`
- `to_dict()`
- `to_dict()`
- `to_dict()`
- `policy_check()` — Run action through constitutional validator and return a PolicyDecision.
- `get_audit_log()` — Read audit entries from constitution_log, newest first.
- `submit_vote()` — Record a vote on a governance proposal. vote must be approve/reject/abstain.
- `get_vote_tally()` — Return vote counts for a proposal.
- `log_governance_event()` — Write a governance event to constitution_log.
- `get_governance_status()` — Return high-level governance health metrics.

## Links

[[core.db]] · [[core.validator]]
