# HIVE_UPDATES — the hive's durable, add-only update log to the founder

This is the **write side** of the founder's distinction, honored exactly:

> "the hive can utilize [the visionary directory] instead of the hive adding to the
> visionary files to change themselves — they can add to provide me updates which show up
> on the user interface as updates."

So the boundary is:

- **The hive MAY add** dated update files here (status, "what I did / what I need / what I
  learned"). Append-only. One file per update, newest by date.
- **The hive MUST NOT** edit `VISION/`, `soul.md`, `FABLE_DNA.md` Chromosome I, or any law
  or vision text to change what it is. Amending the law/vision is **founder-only** (FABLE_DNA
  Chromosome I amendment process). This folder is the pressure-release valve that lets the
  hive communicate without ever rewriting its own constitution.

## Two surfaces, same rule

1. **Runtime (ephemeral):** the Worker writes updates to the D1 `hive_updates` table each
   heartbeat; the UI shows them in the **Updates** panel (`GET /v11/updates`). Bounded to the
   most recent 100 rows — a live feed, not a permanent record.
2. **Durable (this folder):** a session commits the updates worth keeping to Git here, so
   they survive the ephemeral container and D1 pruning. This is the permanent record.

## File convention

`YYYY-MM-DD-short-slug-NNN.md` — same dated convention as `VISION/`. Start each with a
one-line summary, then: **Did**, **Needs**, **Learned**. Keep it plain — the founder reads
these directly.

*Established 2026-07-17 alongside the Updates channel (Workstream C).*
