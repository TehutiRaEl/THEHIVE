---
name: hive-efficiency-protocol
description: Use when a session must run long, autonomously, or under tight token budget — the harness's continuous-build mode. Compresses output to signal-only, batches independent tool calls, and keeps the plan/memory in the repo so context loss is survivable. Adapted from KINGSTAR-OMEGA/claude-token-optimizer (MIT) for the Sovereign Hive.
---

# Hive Efficiency Protocol

The hive is built by long autonomous sessions across ephemeral containers. Tokens
and context are the scarce resource; the constitution and the repo are the durable
memory. This skill keeps a session lean without going dark on the founder.

## 1. Output discipline (signal, not narration)
- Lead every turn's final message with the outcome — what happened / what's next.
- No step-by-step narration of tool calls; the diff and the PR are the record.
- Status notes between tool calls stay one line. Never restate a plan you already committed.
- When driving many workflow buttons or reads, summarize the *result*, not each call.

## 2. Tool batching
- Independent tool calls go in ONE block (parallel). Only serialize on real data deps.
- Prefer the dedicated read tools (Read/Grep/Glob) over Bash — they never hit the
  safety classifier that intermittently gates Bash in this environment.
- For production checks the container can't reach (workers.dev, github.io), use the
  `edge-health-probe` workflow on a GitHub runner, not local curl.

## 3. Context survival (the one rule we paid for)
- Anything worth keeping is committed the SAME session — containers are reclaimed.
- The working plan lives in the repo (`memory/planning/`), not only in context.
- Per-member memory files are the long-term store; one writer per file.
- After compaction, re-read: `Project_file/Fable_memory.md` → harness doc → this skill dir.

## 4. When to spend tokens anyway
Efficiency is not silence. Spend freely on: the founder-facing report, a probe-backed
claim, a disclosure (e.g. a self-merge), or a genuine fork in the plan that needs a
decision. Never compress those into fragments.

Origin: Fable, 2026-07-13, adapted from claude-token-optimizer (MIT). The upstream
"zero-English JSON compiler" mode is deliberately NOT adopted — the harness owes the
founder readable prose; we take its batching + scratch-verify discipline instead.
