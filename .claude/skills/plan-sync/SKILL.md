---
name: plan-sync
description: Force-update all plan surfaces whenever new work starts that is not already tracked. Use at the start of any feature, research pass, or slice that is missing from full-plan / CAMPAIGN / PLAN_LOG / TOWNHALL.
---

# Plan Sync

## When

Before coding or opening a PR for work that is **not already named** in the live plan surfaces.

## Surfaces (update all that exist)

1. `docs/full-plan.html` or `memory/planning/*unified-forward-plan*` — add the slice id + one-line status.
2. `CAMPAIGN.html` / task digest path if the work is campaign-scoped.
3. `docs/PLAN_LOG_*.md` or create dated log entry (what landed today).
4. `docs/TOWNHALL.md` slice roadmap if TownHall-related.
5. Project memory / HIVE_PULSE when durable state changed.

## Rules

- **Do not** invent green status — use pending / protocol / runtime / blocked honestly.
- **Do not** skip this skill because "it's just docs" — lost plan state is the failure mode this exists to prevent.
- If work was **sandboxed and never committed**, also invoke **sandbox-branch-land** (sibling skill) before treating it as done.

## Minimal checklist

```
[ ] Named in PLAN_LOG with date
[ ] Slice id on TownHall roadmap if applicable
[ ] Master plan pointer updated or noted "unchanged"
[ ] Open follow-ons listed, not implied
```
