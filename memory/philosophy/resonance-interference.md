# Resonance & Interference

How work streams affect each other when run together. The founder's own framing
(2026-08-07), captured here rather than invented mid-skill — the term appeared nowhere in
this repo before, and a session asked for its meaning instead of guessing at one.

> Separate work streams amplify each other when they are **in phase**, and cancel each
> other when they are **out of phase**.

## The rule

Before batching tasks, determine their phase relationship. Batch the in-phase; **sequence**
the out-of-phase. Two correct changes run together can still produce a wrong result.

## In phase — amplifying (batch these)

- They touch the **same file or subsystem**, so one context load serves both.
- One **unblocks** the other (a fix that makes the next task's verification possible).
- They share **evidence** — a single probe run or test suite proves both.
- One's finding **sharpens** the other's question.

## Out of phase — cancelling (sequence these)

- **Contradictory edits** to the same lines; the second silently overwrites the first.
- One **invalidates the other's premise** — no point optimizing a path the other deletes.
- One would be **verified against state the other is mid-change on**, producing a
  measurement of neither the old nor the new system.
- One is **blocked on a founder decision** the other assumes an answer to. Guessing that
  answer to keep moving is how a wrong assumption gets built on top of.

## Standing wave — the case that looks like progress

The dangerous pattern: two streams that keep re-doing each other's work, so effort is spent
and the position never changes. **Real example from this project** — sessions repeatedly
built agent layers (tasks 37 → 38 → 48 → 52) while the verification each layer promised was
never performed, so the stack grew without the foundation ever being confirmed. Motion, no
displacement.

Detect it by asking: *has anything measurable changed since the last pass, or only the
amount of work done?*

## Links

[[dual-lens-framework]] · [[devils-advocate]] · [[childlike-wonder]] · [[alchemical-process]]
