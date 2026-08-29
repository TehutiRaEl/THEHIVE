# Arena Dispute (AR-1)

> **Status:** Protocol only. Live Arena Elo resolution stays as-is (`resolveChallenge`).
> **Authority:** Founder-directed 2026-08-29. Arena = Elo court **and** dispute surface for colony/agent conflict.

## Live today

- Challenges, projection frames, Elo ±16, fallen_ideas, Sekhmet as judge.
- Heartbeat seeds/resolves pending challenges.

## Dispute extension

When a **conflict** is not a simple proposition duel (colony disagreement, contradicted finding, specialty clash):

1. Post TownHall item `kind=dispute` with `contradiction_flag=1` and links.
2. Optional Arena challenge linked via `output_ref` / parent_id.
3. Verdict (Elo or Council-backed) writes finding back to TownHall; may spawn `innovation`.

## Non-goals (AR-1 doc)

- No change to resolveChallenge math in this slice.
- No auto-merge from Arena outcomes.

## Next

Bridge: on selected completed challenges or explicit dispute posts, create/update townhall_items.
