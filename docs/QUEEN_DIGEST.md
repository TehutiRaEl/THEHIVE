# Queen Digest (Q-1)

> **Status:** Protocol only. Runtime follows TH-1 + stable TownHall writes.
> **Authority:** Founder-directed 2026-08-29. Queen correlates against founder vision/logs; writes new board items (loop engineering).

## Role

After Council clear (or parallel on selected findings), **Nanuet** digests: compare work product + vision_ref + founder logs → emit `kind=queen_digest` and/or `kind=innovation` (failure→build opportunity).

## Existing live pieces

- `queenReview()` / `queenDecide()` score proposals against FOUNDERS_VISION.md.
- Switch 9 (`QUEEN_AUTONOMOUS_APPROVAL`) + Elders veto stay as today for **proposals**.

## Digest vs proposal path

| Path | Surface | Outcome |
|------|---------|---------|
| Proposal decide | hive_proposals | approved/rejected/modified |
| Queen digest | townhall_items | new/strengthened board items, loop_phase=queen |

Digest does **not** replace /decide. It feeds the recursive board loop: founder vision → TownHall → Kai → Akosha → agents → Council → Queen → board again.

## Protocol steps

1. Select items in `in_review` / post-council with `council_status=clear`.
2. Score alignment (reuse queenReview-style grounding).
3. Write `queen_digest` item; if gap found, write `innovation` with `failure_of_id`.
4. Never spend, merge, or flip money/constitution switches.

## Next

Runtime job or route that posts digest items to TownHall after TH-1.
