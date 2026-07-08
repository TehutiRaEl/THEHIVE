# Sovereign Hive — Governance
Framework
# Constitution (F-001 to F-006)

**F-001 Data Sovereignty & Time Wealth**  
Research respects user data; real-time intelligence is gathered ethically.

**F-002 Value-Weighted Wealth**  
Identifies gaps where EVW can be maximized; monitors wealth metrics.

**F-003 Autonomy & Alternatives**  
Strategic recommendations always include alternative paths.

**F-004 Explainability**  
Every strategic recommendation includes rationale and evidence.

**F-005 Conflict Priority**  
Strategic direction aligns with constitutional hierarchy.

**F-006 Cross-Law Non-Penalization**  
Strategic adjustments never penalize users for exercising rights.

This document defines how contributions are reviewed and tagged across the
Sovereign Hive federation: THEHIVE (this repo, the hub) plus six colony
repos (NAR2, 4DBRAIN, aether, automatisch, Kimi-K2, LocalAGI) and three
documentation-only repos (build-your-own-x, free-programming-books,
freeCodeCamp).

It is a **documentation and convention layer**. It does not grant or
restrict tool access, does not run unsupervised, and does not block merges
by itself — see "Enforcement" below.

## Purpose

Give every contributor — human or AI — a shared, lightweight vocabulary for
what a change is and why it's safe to merge, without slowing down normal
development.

## Governance-as-a-Service
- Policy-check layer intercepts agent actions.
- Declarative rules for compliance.
- Audit logs for all decisions.

## Principles

1. **Transparency** — changes should be easy to understand from their commit
   message and diff alone, without needing private context.
2. **Reviewability** — prefer small, single-purpose commits over large mixed
   changes.
3. **No silent destructive action** — deleting data, force-pushing, dropping
   schemas, or discarding uncommitted work requires explicit confirmation
   from a human reviewer; it is never done automatically.
4. **Human approval for cross-repo or shared-state changes** — anything that
   touches more than one repository, shared infrastructure, or published
   interfaces gets a human in the loop before merge.
5. **Documentation parity** — code changes that affect behavior should come
   with a docs/README update in the same change, where practical.

## Status Labels

Used informally in PR descriptions and review comments to communicate
review state at a glance:

| Label | Meaning |
|---|---|
| `Approved` | Reviewed and ready to merge. |
| `Needs Review` | Awaiting a reviewer's pass. |
| `Blocked` | Cannot proceed until a dependency or decision lands elsewhere. |
| `Do Not Merge` | Known issue; intentionally held back. |
| `Unclear — Ask` | Reviewer is unsure of intent; needs author clarification. |

## Commit / PR Convention

```
[ROLE: <Role Title>] type(scope): description

Rationale: <one sentence on why this change is needed>
```

- `type` follows [Conventional Commits](https://www.conventionalcommits.org/):
  `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.
- `<Role Title>` is one entry from [docs/ROLES.md](./ROLES.md) — pick the
  role that best matches the *nature* of the work, not necessarily your
  job title. This is a readability aid, not an access-control mechanism.

Example:

```
[ROLE: Database Reliability Director] fix(db): add missing index on wallet_ledger

Rationale: queries against wallet_ledger.agent_name were doing full table
scans under load.
```

## Role Catalog

The full 101-role catalog lives in [docs/ROLES.md](./ROLES.md). Other
repos in the federation link back to that file rather than duplicating it,
and carry only the subset of roles relevant to their own stack.

## Enforcement

This is **advisory only**. `.github/workflows/governance-advisory.yml` runs
on pull requests and posts warnings (e.g. a missing `[ROLE: ...]` tag, code
changes with no doc update) — it never fails the build and is not a
required status check. Nothing in this repository or workflow acts without
human review, modifies its own governing documents unsupervised, or pushes
changes without a PR.
