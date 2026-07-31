---
name: polymath-lens
description: >
  Adds one short cross-domain synthesis note — engineering/economics/governance/design/
  federation, da-Vinci-notebook style — to a FINAL DELIVERABLE only (an AUDIT_LEDGER.md
  entry, a roadmap update, a session-harvest summary, a report handed to the founder as
  finished). Never applies to routine chat replies, in-progress edits, or anything still
  caveman-terse — those stay fast with zero added overhead. Use when closing out a
  devils-advocate-audit finding, publishing/updating the roadmap artifact, writing a
  Fable_memory.md harvest entry, or any other output explicitly delivered as "done." Skip
  it — don't force one — when a finding genuinely has no other-domain angle (e.g. a pure
  resource-lifecycle bug like wallet.py's connection-reuse bug has no economics/design
  shadow worth naming).
---

# polymath-lens

Leonardo's notebooks never stayed in one lane — an anatomy sketch sits next to a canal
lock design next to a stage-machinery note, because he kept noticing the same shape
recurring across domains. This skill is that habit, applied narrowly: **the last thing
added to a finished deliverable, never the first thing, and never on ordinary turns.**

## Scope — read this before using it

**Applies to:** a devils-advocate-audit ledger entry, a roadmap artifact/panel update, a
session-harvest or Fable_memory.md entry, a report explicitly delivered to the founder as
a finished piece of work.

**Does not apply to:** everyday chat replies, mid-task status updates, code review
comments, caveman-mode output, or anything not yet in its final form. Day-to-day
communication stays exactly as fast as it already is — this is not a standing overhead
tax on every message. If unsure whether something counts as a "final deliverable," it
probably doesn't yet — draft first, decide at the end whether this applies.

## The move

After the deliverable's substantive content is otherwise complete, add **one short
paragraph (1–3 sentences), clearly separated, e.g. under a `Cross-domain note:` line** —
naming which other domain(s) the finding or decision touches and *why*, using the hive's
own vocabulary:

- **Engineering** — code correctness, architecture, coupling
- **SOUL economy** — wealth invariants, EVW formula, staking/reward math, ledger integrity
- **Governance / constitution** — F-001–F-006, amendment process, HITL gating
- **Federation** — cross-colony consistency (does this apply to one colony or all six?)
- **UX / design** — what a human actually sees or experiences as a result
- **Scheduling / automation cost** — token/context economy, trigger cadence, what a
  recurring job actually costs to run
- **Narrative / Codex** — rare, only when a finding genuinely touches the mythology layer

## The rule that keeps this from becoming noise

**A forced connection is worse than none.** If the honest answer is "this is purely an
engineering bug with no other-domain shadow," say nothing — do not manufacture a
cross-domain note to satisfy this skill's existence. The colony.py HMAC audit is the
worked example of a *real* one: a missing-replay-protection finding is simultaneously a
security finding (engineering), a SOUL-ledger integrity risk if the signed event is a
payout (economy), and a "does this affect one colony or the federation's shared pattern"
question (governance/federation) — three genuine domains, not a stretch. The wallet.py
seed bug, by contrast, gets none: a connection closed out from under its own caller is a
pure resource-lifecycle defect with no economics or governance angle worth inventing.

## Interaction with other skills

This does not change any other skill's output format. It appends one short note to
whatever `devils-advocate-audit` already wrote to `AUDIT_LEDGER.md`, whatever
`session-harvest` already wrote to `Fable_memory.md`, or whatever the roadmap artifact/
panel already says — never restructures those, never replaces their own verdict/summary
language, never adds decorative framing beyond the one labeled note.

## What this is not

Not a rewrite pass, not a style pass, not a way to make reports longer for their own
sake, not required on every entry (a clean "nothing else to add" is a fine, honest
outcome — skip the note entirely rather than pad one in). Not a chat-mode toggle — it
never runs mid-conversation, only at deliverable close.

## Origin

Built 2026-07-31 at the founder's request, as the "heart" of the autonomous-hive-agent
organism (see `.claude/skills/autonomous-hive-agent/SKILL.md`) — the founder's own framing
was "da Vinci archetype... polymath synthesis," scoped explicitly to final deliverables
only so it never taxes ordinary chat.
