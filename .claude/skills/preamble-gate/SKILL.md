---
name: preamble-gate
description: >
  Use BEFORE doing any work in this repo — before the first file edit, commit, push, PR,
  branch operation, workflow dispatch, scheduled trigger or timer, agent/subagent spawn,
  dependency install, or message sent to an outside service. Forces a plain-language
  preamble to the founder first: WHAT you are about to do, WHY, HOW, why it is NECESSARY,
  the PROJECTED IMPROVEMENT, and the COST and RISK — then, for consequential work
  (governance, security, money, CI/triggers, rewriting history, multi-agent fan-out), waits
  for an explicit go-ahead. Read-only investigation (reading files, grep, git log/diff,
  answering questions) is exempt. Applies to every AI that works in this repo, not just
  Claude. Founder rule, 2026-11-10, written after an unattended automation ran up cost and
  froze the hive. Not a substitute for wired-or-not (which governs how completion is
  CLAIMED); this governs what happens BEFORE work starts.
---

# preamble-gate — say what, why, how, why it's needed, and what improves, before touching anything

## Why this exists

The founder's rule, 2026-11-10, in their own words: *"you aren't to do any other work unless
you explicitly explain the what the why the how the necessity and the projected improvement
before any work ... a universal skill that any AI in this repo will be forced to apply first
to build in the hive repo."*

Behind it: the daily automation was turned off by hand because it started costing real money
and froze all other work in the hive. Work nobody could see coming, at a cost nobody had
approved, is the failure this rule exists to prevent. The fix is not more caution inside the
AI's head — it is making the plan visible to the founder *before* anything changes.

## When it fires

**Fires (a preamble is required first):** any edit or write to a file; `git commit`, `push`,
branch create/delete, `rebase`/`reset`/force-anything; creating, updating or commenting on a
PR; dispatching or editing a workflow; creating, changing or deleting a scheduled trigger,
cron, timer or wake-up (**these cost money while unattended — treat them as spending**);
spawning an agent, subagent, or remote session; installing dependencies; touching secrets,
infrastructure or deploys; sending anything to an outside service (Slack, email, a docs
tool); running a test that *mutates* files (mutation testing is not read-only).

**Exempt (go ahead, no preamble):** reading files, `grep`/`find`, `git log`/`diff`/`show`/
`status`, running tests or linters that only read, answering questions, explaining code.
If you are unsure whether something counts, it counts.

## The preamble — plain language, in this order

Write it for a founder who is **not reading the code**. Short full sentences. No jargon left
unexplained. (Caveman compression is for terse status; this is the one place that must be
fully readable — the auto-clarity exception applies.)

1. **WHAT** — one or two sentences: which files, systems or actions, concretely.
2. **WHY** — the problem, with the evidence that it is real (a failing test, a log line, a
   quote from the founder). Not "it would be nice."
3. **HOW** — the steps in order, what will be checked after each, and how to undo it.
4. **NECESSITY** — why this, why now, and what happens if it is not done. Name a smaller
   alternative if one exists. If it is marginal, say so — an honest "optional" is useful.
5. **PROJECTED IMPROVEMENT** — what measurably gets better, and how that will be checked
   afterwards. A claim you could not later verify is not an improvement, it is a hope.
6. **COST & RISK** — tokens or minutes, anything billed, what could break, whether it is
   reversible. Cost is on the list because cost is what froze the hive.

## Scale it to the work

- **Small and reversible** (fix a typo, add a test line): one sentence per field, or a single
  sentence covering all six. Then proceed.
- **Consequential** — governance or constitution files, security gates or validators, money,
  secrets, CI or triggers or timers, deleting or overwriting remote history, more than one
  agent at once, anything that bills on a schedule, anything over roughly 50k tokens: write
  the full preamble **and stop for an explicit go-ahead.** Do not start while waiting.
- **A go-ahead covers exactly the steps the preamble described.** New scope — a second
  fix, a different file set, an extra agent — needs a new preamble. "Go ahead" to one plan
  is not "do whatever seems related."
- **One preamble per unit of work**, not per file edit. Do not preamble-spam.

## Unattended and automated runs

There is no human reading live, so the gate cannot be a conversation. Instead:

- Put the preamble in the first lines of the PR body or log entry, before the work.
- Do not start any *consequential* work (list above) without an approval already recorded
  in the repo. An automation cannot approve itself.
- Never create, re-arm or extend a trigger, timer or recurring check on your own — that is
  spending. Ask the founder.

## For other AIs (Codex, Cursor, Grok, Mistral, ...)

This file is the canonical text. `AGENTS.md`, `.mistral/INSTRUCTIONS.md`,
`.claude/INSTRUCTIONS.md` and `CLAUDE.md` all point here so the rule is not copied five
times and left to drift. If your tool does not load skills, the preamble format above is the
whole rule — apply it by hand.

## How to confirm it is working

**Wiring (machine-checked):** `python3 -m pytest tests/unit/test_preamble_gate.py` proves
this skill exists with valid front matter and the six fields, every instruction surface
above references it, `.claude/settings.json` is valid and registers the hook, and the
configured hook command actually runs and prints the reminder. The same file runs in CI with
the rest of the suite, so a future edit that quietly unplugs any of it fails the build.

**Behaviour (a person has to look):** in a *new* session in this repo, ask for something that
edits a file — e.g. *"add a blank line to the end of README.md"*. Pass: the AI states what,
why, how, necessity, improvement and cost **before** its first edit. Fail: it edits first. A
failure is worth reporting; it means the reminder is not reaching that AI. You can also ask
the AI *"what reminder did you receive about preambles?"* — it should quote the
`PREAMBLE GATE` line the hook injects.

## What this does NOT do (read before trusting it)

- **It cannot force an AI to comply.** A skill and a reminder are procedural; nothing here
  mechanically stops an AI that ignores them. The machine-checked part proves the rule is
  *delivered*, not *obeyed*. This is the same honest limit as `dual-lens`.
- **A blocking enforcement tier was deliberately not built:** a `PreToolUse` hook that
  refuses edits until a preamble file exists. It is the closest thing to real enforcement,
  but it can deadlock sessions — including unattended ones — if it misfires. Build it only
  on the founder's explicit request.
- **The hook is unverified live.** Its command is tested; that Claude Code runs it on each
  prompt is checked by the behavioural test above, not by CI.
