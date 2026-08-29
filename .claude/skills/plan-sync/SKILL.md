---
name: plan-sync
description: When starting or accepting any new work not already logged in plan files (full-plan, CAMPAIGN, PLAN_LOG, TOWNHALL roadmap, session logs), update all relevant plan/log surfaces before or as work proceeds so nothing is lost on cutoff.
---

# Plan Sync Skill

## Trigger
ALWAYS when the founder (or session) directs **new** work that is not already present in:
- `docs/full-plan.html` / FULL_PLAN surfaces
- `.claude/tasks/CAMPAIGN.html` or `docs/campaign.html`
- `docs/PLAN_LOG_*.md` or equivalent session plan logs
- `docs/TOWNHALL.md` slice roadmap
- Active PR descriptions / issue trackers for the same work

## Required actions
1. **Identify** the new work in one line (name + outcome).
2. **Append** to the latest `docs/PLAN_LOG_YYYY-MM-DD.md` (create if missing) with status `planned|in_progress|done|blocked`.
3. **Update** slice tables in `docs/TOWNHALL.md` or related protocol docs if the work is a named slice.
4. **CAMPAIGN / full-plan**: add a pending/blocked/done note or task row when the work is engineering-track; do not invent completed claims.
5. **If cut off mid-work**, the log entry must be enough for another AI to resume (branch name, files, acceptance).

## Non-goals
- Do not skip logging because the change is "small."
- Do not only chat the plan — it must be in-repo.
- Do not mark done in CAMPAIGN without real acceptance evidence.

## Verification
Before ending a turn that started new work: confirm PLAN_LOG (or equivalent) contains the item.
