# Voting — Constitutional Governance

Constitutional amendments require a supermajority vote across active colonies.

## Process

1. Proposal posted to [[sovereign-hive-meta]] as a GitHub Issue
2. 7-day open comment period
3. Voting period: colonies cast votes via `POST /colony/events` with `type: vote`
4. Pass threshold: >66% of active colonies (by SOUL stake weight)
5. On pass: Queen merges PR to `soul.md`, triggers `constitution-sync.yml`

## Links

[[soul.md]] · [[colony]] · [[soul-token]] · [[staking]]
