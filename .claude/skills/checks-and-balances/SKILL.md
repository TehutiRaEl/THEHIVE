---
name: checks-and-balances
description: >
  Audits authority distribution across THEHIVE's agents against the real chain-of-command
  data (agents.reports_to, added 2026-08-04) and docs/GOVERNANCE.md's own separation-of-
  powers doctrine (F-011A.4: "The Queen's authority is not absolute — it is constitutional...
  bound by the wisdom of the Elders"). Sibling to constitutional-validator, which checks a
  proposed change against F-001–F-006 but never touches whether any one role has
  accumulated too much, or too little, real authority relative to the hierarchy. Triggered
  by a real event, 2026-08-04: Nanuet (the Queen) gained a genuine new power — auto-
  approving proposals scoring ≥98% aligned with the founder's vision (FLIP_THE_SWITCHES.md
  switch 9, QUEEN_AUTONOMOUS_APPROVAL) — with no existing mechanism checking that grant
  against the constitution's own separation-of-powers doctrine. Use whenever a switch,
  proposal, or code change grants (or could grant) any agent/role new real authority; when
  reviewing whether the reports_to hierarchy still makes sense as the roster grows; or
  periodically, same standing-sweep cadence as devils-advocate-audit.
---

# checks-and-balances

The founder's own framing: make sure no one's overloaded with power, and no one's
unloaded with it, aligned directly with the real chain of command. This skill is that
check, run against live data — not narrative, not the constitution's aspiration alone.

## Why this is a separate skill, not a stretch of constitutional-validator

`constitutional-validator` (`.claude/agents/constitutional-validator.md`) checks one
proposed change against F-001–F-006 at the moment it lands — a point-in-time gate. This
skill checks something different: **the accumulated, current shape of authority across
every agent, all at once**, against `agents.reports_to` and F-011's doctrine — a systemic
audit, not a per-change gate. A change can pass constitutional-validator cleanly (it
doesn't itself violate F-001–F-006) and still leave the hive's authority distribution
lopsided — switch 9 is the exact case: granting Nanuet real auto-approve power is not, by
itself, a constitutional violation, but nothing checked whether the Elders'-Council check
F-011B describes as her counterweight actually exists anywhere yet.

## What it checks, every run

1. **Live hierarchy shape** — pull `agents.reports_to` for every active agent (via
   `edge-health-probe`, same pattern as every other live check in this repo; this
   container cannot reach `*.workers.dev` directly). Flag:
   - Any role with `reports_to = NULL` other than Nanuet (the Queen) — an unchecked-power
     gap, someone with no one they answer to.
   - Any role that reports to someone but has no real, documented capability at all — an
     unloaded-power gap, authority structure with nothing underneath it.
   - Any cycle or dangling `reports_to` (points at a name that isn't a real active agent).
2. **Every switch in `FLIP_THE_SWITCHES.md`** — for each one that's flipped on, ask: does
   it grant new real authority to a specific agent/role (not just a new integration)? If
   yes, is there a real, live counterweight — an audit, a review step, a second approval —
   or is the check purely narrative (written in `docs/GOVERNANCE.md` but nothing in code
   enforces it)? Switch 9 (`QUEEN_AUTONOMOUS_APPROVAL`) is the standing first case to
   re-check every run: is F-011B's Elders' Council live anywhere real, or still just text?
3. **F-011's doctrine vs. reality** — read `docs/GOVERNANCE.md` F-011A/F-011B in full each
   run (doctrine can be amended; never assume last run's reading still holds). Compare its
   claims against what's actually enforced in `worker/src/index.js` (same discipline
   `constitutional-validator` already uses for F-001–F-006 — a law only counts once code
   enforces it, not when it's merely written).

## The loop

```
1. PULL     → live agents.reports_to + FLIP_THE_SWITCHES.md's current switch states
2. COMPARE  → each flipped switch against F-011's doctrine: real counterweight, or narrative only?
3. NAME     → in plain language, every role that's currently overloaded (unchecked) or
              unloaded (no real capability) — cite the exact agent name and the exact gap
4. LEDGER   → append a dated entry to AUDIT_LEDGER.md (same file devils-advocate-audit
              uses — one shared, chronological record of every audit run in this hive,
              not a second ledger to cross-reference)
```

## What this is not

Not a per-change gate (that's `constitutional-validator`) and not a code-correctness audit
(that's `devils-advocate-audit`/`fable-debugger`). This skill's only question is: **right
now, across the whole live roster, is authority actually balanced against the real
hierarchy and the constitution's own doctrine — or has something drifted?** A clean run
("balanced, no gaps found") is a real, useful outcome, not a wasted pass.

## Origin

Built 2026-08-04 at the founder's direct request, alongside the chain-of-command work
(PR #149) that gave this skill something real to check for the first time — `reports_to`
didn't exist before that PR, and neither did any agent power significant enough to need a
systemic check (switch 9 is the first real case). Sibling to `constitutional-validator`,
not a replacement for it.
