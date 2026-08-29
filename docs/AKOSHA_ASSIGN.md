# Akosha Assign (A-1)

> **Status:** Protocol only. Enforcement routes are a follow-on after TH-1 board exists.
> **Authority:** Founder-directed 2026-08-29. Akosha reports to Kai El; assigns by specialty.

## Role

Akosha is the **orchestrator under Kai**: reads TownHall + provider health + recent findings, issues **assignments** (`kind=assignment`) and may claim-match open items by `preferred_specialty` / `specialty_tags`.

## Rules

1. **Who may assign:** Akosha, founder, (Kai recommend only — not hard assign unless founder-gated).
2. **Specialty match:** Claim/assign only when agent specialty intersects `preferred_specialty` or `specialty_tags`.
3. **Write surface:** TownHall only for assign/claim fields (`claimed_by`, `assigned_by`, `status=claimed|in_progress`). Still **write-only to hive_updates** for narrative summaries (existing AGENT_WORK discipline).
4. **Hard stops:** `requires_founder=1` or `risk_tier=high` → never auto-assign execution paths; surface to founder.
5. **Not in scope of A-1 runtime yet:** Changing reports_to, creating agents, approving proposals.

## API shape (after TH-1)

- `POST /v11/townhall/:id/assign` — Akosha/founder; body `{ assignee, specialty_note? }`
- `POST /v11/townhall/:id/claim` — specialist self-claim if specialty matches

## Non-goals

- No money, no merge, no constitution edits.

## Next

Implement assign/claim routes after GET/POST /v11/townhall is live (TH-1).
