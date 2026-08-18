# Planning — Navigation Guide

## What Lives Here

Session continuity documents. Every Claude session should read the most recent file here
before starting work. These are the episodic memory of the project.

## Files (read newest first)

- `2026-08-18-unified-forward-plan-v2.md` — **CURRENT MASTER PLAN** — read this first every
  session. Supersedes `2026-07-19-unified-forward-plan.md` below: a real
  `plan-reality-audit` run (2026-08-18) found the v1 plan had gone a month stale — not wrong
  about anything it claimed, just silent on a real month of shipped work (the venture
  capability-gap/sandbox system, the 5-provider LLM waterfall, the founder-key/Access login
  fix, Phase 2 Kai El authority work). v2 carries every still-open v1 phase forward unchanged
  except where real new evidence updates it, and folds in what v1 never knew about. See the
  `recursive-growth` skill (`.claude/skills/recursive-growth/SKILL.md`) — invoke it at the
  start of every session; it points here automatically and tracks phase-by-phase progress.
- `2026-07-19-unified-forward-plan.md` — superseded 2026-08-18; kept for reference/history,
  most of its phase-by-phase content is still individually accurate — read v2 for current
  status, not this file directly.
- `harness-plan-2026-07-10.md` — superseded; kept for reference/history only, do not treat as current.
- `hive-master-plan-2026-07-04.md` — Fable 5's master plan (reference for context)
- `reconstructed-state-2026-07-04.md` — state reconstruction after the Fable 5 handoff

## How Plans Work

Each session writes its work plan here before execution. Plans include:
- Context: what prompted the session, what was already done
- Audit findings: confirmed state of the codebase
- Implementation plan: commit-by-commit with file paths and role tags
- Verification steps: how to confirm the work landed correctly

## Current Session State

The durable, committed master plan is `2026-08-18-unified-forward-plan-v2.md` (above) — read
that, not an ephemeral `/root/.claude/plans/*.md` path, since plan-mode files live outside
the repo and don't survive session boundaries. A session's own in-progress plan-mode file
(if any) is a working copy of, or a delta against, that committed plan.

Open PRs to check at session start:
- THEHIVE: `mcp__github__list_pull_requests owner=TehutiRaEl repo=THEHIVE state=open`
- LocalAGI: `mcp__github__list_pull_requests owner=TehutiRaEl repo=localagi state=open`
