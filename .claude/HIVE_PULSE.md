# HIVE_PULSE — read this first, every autonomous firing

One page, kept small on purpose (target: under ~1000 tokens). Every scheduled
Routine/heartbeat firing reads **this file first, in full — nothing else** — and only
opens a linked file below if this page says that specific thing changed since the last
firing. This is the token/context-economy mechanism described in
`.claude/skills/autonomous-hive-agent/SKILL.md`'s "circulatory system" section: the
lever that makes frequent, cheap, always-on presence possible without every firing
re-reading the whole repo/history to get oriented.

**Update this file at the end of every autonomous firing.** Stale-but-wrong is worse
than short — keep every line true as of the moment you touch it.

---

## Right now (updated 2026-07-31)

- **Open PRs on THEHIVE:** #136 (Kai EL OS roadmap panel) — `state: open`,
  `mergeable_state: clean`, CI last checked green. No other open PRs on this repo.
- **Autonomous 6-session arc:** `trig_013BTxUthvLX3C4nLs7MypVC` — Session 1/6 done
  (agency.py + staking.py coverage). Session 2/6 scheduled `2026-07-31T22:30:00Z`.
  Sessions 3-6: nightly 2 AM Los Angeles time. Full detail →
  `.claude/Fable_memory.md`, latest "Session N/6 (autonomous arc)" entry.
- **PR check-in heartbeat:** converted 2026-07-31 from a manual send_later
  re-arm chain (13 one-shot triggers created across the day, one per hour, each
  depending on the prior firing remembering to re-arm it) to a single native cron
  Routine — `trig_01Dd9ysNpDiCcfVVEKzM54DX`, `58 * * * *` (hourly), no reschedule
  call needed ever again. See "Circulatory system" below for why this matters.
- **devils-advocate-audit sweep:** 4 modules checked (`wallet.py` bug found+fixed,
  `staking.py`/`agency.py`/`colony.py` confirmed correct). Full list of what's still
  unaudited → `.claude/skills/devils-advocate-audit/AUDIT_LEDGER.md`, "Not yet audited"
  section — check there before picking the next target, don't re-derive from scratch.
- **Coverage sweep next targets:** `backend/economy/utility_economy.py` (24%),
  `backend/core/genome.py` (24%), `backend/core/llm_router.py` (17%, the real
  `core/` one — not the dead root-level duplicate, flagged for founder to delete).
- **Rolling logs that may have changed since you last read them (check dates, don't
  assume stale = current):** `.claude/Fable_memory.md` (session harvest),
  `.claude/skills/recursive-growth/LESSONS.md`, `.claude/skills/recursive-growth/SKILL_CHANGELOG.md`,
  `.claude/skills/workflow-optimizer/` (no dedicated notes file yet — see its SKILL.md),
  `PR_LESSONS.md` (latest: L-09).
- **Roadmap:** published artifact + in-app panel (PR #136) both reflect the same
  `frontend/src/data/roadmapData.ts` — update that file, not the two surfaces
  separately, when status changes.

## Circulatory system — how heartbeats stay cheap

See `.claude/skills/autonomous-hive-agent/SKILL.md` for the full design. Summary: native
`cron_expression` Routines for anything truly recurring (never a self-rescheduling
send_later chain — that pattern is what silently stalled the 6-session arc after
Session 1, since it depends on the firing remembering to re-arm itself). Each firing:
read this file first → do one bounded thing → update this file → stop (cron handles the
next fire automatically, no reschedule call to forget).

## Not yet built / open questions

- Whether the 6-session arc itself should convert from `run_once_at` chaining to a
  single nightly cron once its founder-requested 2 AM PT cadence is confirmed stable —
  not done yet, flagged here for a future firing to revisit, not decided unilaterally.
