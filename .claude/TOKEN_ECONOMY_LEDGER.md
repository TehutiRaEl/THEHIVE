# TOKEN_ECONOMY_LEDGER — tracking real savings, not asserted ones

Founder's ask, 2026-07-31: a standing habit of finding ways to burn fewer tokens and do
more, with real tracking of what's actually saved — micro-level items just get done,
macro-level findings come back to the founder for discussion. This file is that ledger.

**The honest baseline first:** the founder's own target was "96% less tokens than we
already are." That is a real target, not yet a measured result. The only *measured*
number in this hive today is `caveman`'s own claim — **65% output-token reduction**,
verified live per-session via `/caveman-stats` (reads the actual Claude Code session
log, not an AI estimate — see `.claude/skills/caveman-stats/SKILL.md`). Getting from a
measured 65% to a target 96% needs more than one lever, stacked — listed below, each
tagged with whether it's measured, estimated, or still just a hypothesis.

## Levers already in place (micro — just keep doing these)

| Lever | What it saves | Status |
|---|---|---|
| `caveman` (always-on, `CLAUDE.md`) | ~65% of output tokens, every reply | **Measured**, per-session, via `/caveman-stats` |
| `.claude/HIVE_PULSE.md` | Every scheduled firing reads ~1 page instead of re-deriving context from `Fable_memory.md`, `AUDIT_LEDGER.md`, etc. | Estimated large (the alternative is 5+ full-file reads per firing); not yet measured in tokens |
| Native `cron_expression` Routines over `send_later` chains | Removes the risk-driven overhead of re-deriving "what's my state" on every re-arm, and removes the failure mode that burns a whole session re-diagnosing a stalled arc | Structural, not directly token-measured |
| Delegating broad/repetitive reads to a background subagent (`Agent` tool, `run_in_background: true`) | Keeps the calling session's own context window from absorbing large tool outputs it doesn't need in full | Estimated — used this session for the dead-code sweep (see `Fable_memory.md`) rather than grepping everything inline |
| `workflow-optimizer` / `recursive-growth` | Don't re-derive a workflow's steps or a bug's root cause if it's already recorded | Structural (compounds over time, not a single measured number) |

## Levers not yet built (macro — bringing these to the founder, not deciding alone)

- **Cross-session aggregate tracking.** `/caveman-stats` measures one session at a time;
  nothing currently sums that across sessions/days to show a real trend line toward (or
  away from) 96%. Building this needs a place to persist numbers across ephemeral
  containers — the obvious candidate is a `hive_updates`-style D1 row written at
  session-harvest time, but that's a real design decision (schema, who writes it, whether
  it's founder-visible in the Command Center) worth discussing before building.
- **Whether 96% is reachable without quality loss.** `caveman`'s own `ultra` tier already
  documents a hard floor (stripping conjunctions/abbreviations stopped saving tokens and
  started costing clarity — measured zero token saving under the tokenizer). Whether
  further architecture-level savings (more delegation, smaller per-task subagents, tighter
  `HIVE_PULSE.md`-style pre-briefs everywhere) can close the remaining gap without the
  same clarity cost is a real open question, not yet tested at scale.
- **Whether "96% less than we already are" means output tokens, total tokens (incl.
  context read), or dollar cost** — these three numbers move differently (e.g., reading
  less context lowers total-token cost even when output-token savings stay flat at 65%).
  Worth a direct founder conversation on which number matters most before optimizing for
  the wrong one.

## The standing discipline going forward

- **Micro** (a single skill/file/prompt getting measurably or structurally leaner,
  no architecture change, no new tracked commitment): just do it, log it in the table
  above if it's a real new lever, don't ask first.
- **Macro** (anything that would add new infrastructure, change what's tracked/exposed
  to the founder, or trade off quality for tokens): name it here, bring it to the founder,
  don't decide unilaterally — same discipline as every other durable-commitment decision
  in this hive.

## Next

Cross-session aggregate tracking and the "which number matters" question are the two
concrete macro items open for the founder's input. Not built this pass.
