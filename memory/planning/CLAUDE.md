# Planning — Navigation Guide

## What Lives Here

Session continuity documents. Every Claude session should read the most recent file here
before starting work. These are the episodic memory of the project.

## Files (read newest first)

- `2026-07-19-unified-forward-plan.md` — **CURRENT MASTER PLAN** — read this first every
  session. Supersedes `harness-plan-2026-07-10.md` below: it merges every prior plan in this
  directory and in `Project_file/Founders Visonary Folder/` with the founder's full vision,
  built from a three-agent retrospective across the entire project history. See the
  `recursive-growth` skill (`.claude/skills/recursive-growth/SKILL.md`) — invoke it at the
  start of every session; it points here automatically and tracks phase-by-phase progress.
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

The durable, committed master plan is `2026-07-19-unified-forward-plan.md` (above) — read
that, not an ephemeral `/root/.claude/plans/*.md` path, since plan-mode files live outside
the repo and don't survive session boundaries. A session's own in-progress plan-mode file
(if any) is a working copy of, or a delta against, that committed plan.

Open PRs to check at session start:
- THEHIVE: `mcp__github__list_pull_requests owner=TehutiRaEl repo=THEHIVE state=open`
- LocalAGI: `mcp__github__list_pull_requests owner=TehutiRaEl repo=localagi state=open`
