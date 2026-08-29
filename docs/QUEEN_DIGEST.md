# Q-1 — Queen digest → TownHall board

> Status: protocol 2026-08-29.

## Flow
Council clear → Queen correlates against `FOUNDERS_VISION` + founder logs → posts `kind=queen_digest` (and optional `innovation` if gap found) with `loop_phase=queen|innovate`, `vision_ref`, `alignment_score`.

## Rules
- Digest does not execute actions.
- High risk / requires_founder still founder-only.
- May link `parent_id` to council_queue item and `root_id` to founder_task.
