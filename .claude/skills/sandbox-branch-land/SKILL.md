---
name: sandbox-branch-land
description: Create a dedicated git branch (and optional PR) for any work that lived only in a sandbox, zip, or agent session and never reached the repo. Use when the founder says sandboxed, unshipped, uncommitted, or "land the sandbox".
---

# Sandbox Branch Land

## Problem

Work often exists only in:

- Agent sandbox / container artifacts
- Zip uploads (e.g. TheCopy-ops, Grok session zips)
- Local paths never pushed
- PR descriptions that point at artifacts outside git

That work is invisible to main and dies with the session unless branched.

## When

- Founder says: sandboxed, never committed, unshipped, land the zip, recover session work
- A PR or plan references files that are **not** in the tree
- After any long session that produced code outside a feature branch

## Procedure

1. **Inventory** — list paths/artifacts that exist outside the repo (artifact folders, zips, prior session notes). Do not invent files.
2. **Branch** — `grok/sandbox-land-YYYY-MM-DD` or `agent/sandbox-<topic>-YYYY-MM-DD` from current `main` (or the branch the founder names).
3. **Prefix** — land under a deliberate root (`sandbox-ops/`, `artifacts/`, or topic folder). **Never** flatten onto repo root if that would overwrite Queen README or package manifests (lesson from PR #190).
4. **Commit** — real content only; note in commit body what remains zip-only if not fully expanded.
5. **PR** — open for founder review; mark draft if partial. Body must say: what is in git vs still only in the zip.
6. **Do not merge** unless founder explicitly directs (standing hive rule).

## Anti-patterns

- Claiming "all 183 files landed" when only a subset is expanded
- Overwriting root `README.md` or `worker/src/index.js` from an unrelated sandbox
- Skipping the inventory step and dumping an entire zip blindly

## Relation to plan-sync

After the branch exists, run **plan-sync** so PLAN_LOG / full-plan name the land attempt and what is still pending.
