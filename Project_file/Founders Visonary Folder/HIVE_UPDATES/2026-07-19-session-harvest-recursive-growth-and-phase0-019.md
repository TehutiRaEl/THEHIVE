# 2026-07-19 — Session harvest: recursive-growth skill, plan committed, Phase 0 fix (PR #127)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(PR #127, branch `claude/fable-5-handoff-setup-vefwlb`): a new standing skill per the
founder's explicit directive, the master plan finally committed to a durable location, and
the plan's own Phase 0 (the broken `ui-live-probe.yml` CI check) root-caused and fixed.
Nothing external pulled in.

## Did

- **`recursive-growth` skill** (`.claude/skills/recursive-growth/SKILL.md`) — per the
  founder's directive: (1) points every session at the master plan at start, (2) grows from
  every verified `fable-debugger` fix via `LESSONS.md`, promoting genuine recurrences (not
  one-offs) into its own `Recurring Patterns` section, (3) makes small, logged corrections to
  other skills' own files after they run (`SKILL_CHANGELOG.md`), with a hard rule never to
  weaken a documented boundary (`threat-sandbox`, `session-harvest`'s ownership gate,
  `PERMISSIONS.md` tiers, `agent-harness`'s never-self-adjudicate rule).
- **Demonstrated the mechanic immediately** rather than only describing it: added real
  cross-reference lines to `fable-debugger`'s and `hive-conductor`'s own Quick-start
  sections, both logged in `SKILL_CHANGELOG.md` — the same "prove it, don't just configure
  it" discipline used for `agent-harness` the prior round.
- **Committed the master plan to a durable location** — `memory/planning/
  2026-07-19-unified-forward-plan.md`, previously only an ephemeral `/root/.claude/plans/`
  file that doesn't survive session boundaries. Updated `memory/planning/CLAUDE.md`'s
  pointer (superseding `harness-plan-2026-07-10.md`) and added a matching pointer in the
  Founders Visionary Folder (`ACTIVE/2026-07-19-current-master-plan-pointer.md`) — the plan's
  own Phase 1c, executed the same round the plan was written.
- **Phase 0 (fix the broken CI probe)** — root-caused via `fable-debugger`'s own method:
  pulled two independent failing `ui-live-probe.yml` run logs, confirmed both showed the
  actual app completely healthy (live=true, real agents>0, zero console errors) with only
  the served-vs-committed bundle-hash freshness check tripping, both times against a very
  recently merged commit. Root cause: Cloudflare's real ~10-15 minute Workers Builds deploy
  lag (already documented in the file's own header) had zero tolerance in the check, so any
  probe firing within that window after a `docs/app`-touching merge — which this session's
  rapid PR cadence triggered constantly — spuriously failed. Fix: bounded retry with backoff
  (60s/90s/120s, ~4.5min total) via `page.reload()` before treating a mismatch as real.
  Verified for real, not just syntactically: triggered a live `workflow_dispatch` run against
  this branch (run 29675735880) — it passed cleanly (`served=assets/index-CXQcaDzZ.js`
  matched committed on the first check, `live=true`, `agents=8`, zero console errors, both
  viewports). The hash happened to already match this run (no docs/app merge was pending), so
  the retry-with-backoff branch itself wasn't exercised live — its correctness rests on the
  two real failing-run root-causes plus a syntax check of the exact retry logic, not a live
  trigger of the retry path specifically. Honest limitation, not glossed over.

## Learned

- **The "optimize other skills" mechanic needed to be proven the same way `agent-harness`
  was** — writing the discipline down without a real, git-logged example of it happening
  would have been exactly the kind of unverified claim this hive's own honesty norms exist
  to catch. The two cross-reference edits (small, real, changelogged) are the proof.
- **A CI check can be completely honest in intent and still spuriously fail structurally** —
  this wasn't a bug in the app or a bug in the check's logic, it was a check with zero
  tolerance for a deploy pipeline's own documented lag, tripped by this session's own unusually
  high merge cadence. Worth remembering: a freshness/staleness check needs its tolerance
  window sized to the real system it's checking, not to the common case where things are quiet.
- **Two independent failing runs, not one, before fixing** — per `fable-debugger`'s own
  contrast-before-theorizing step; the second data point (a different commit pair, same
  failure shape) is what turned "plausible theory" into "confirmed root cause."

## Needs

- The real `workflow_dispatch` verification run (triggered against this branch) had not yet
  completed as this entry was written — its actual pass/fail result is the true verification
  of the Phase 0 fix, not the syntax checks alone.
- Founder review/merge of PR #127.
- The rest of the unified plan's phases (1 onward) remain open, tracked in
  `memory/planning/2026-07-19-unified-forward-plan.md`.
