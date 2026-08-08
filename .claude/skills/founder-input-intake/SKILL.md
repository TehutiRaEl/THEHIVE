---
name: founder-input-intake
description: >
  Use the moment the founder sends new information mid-work — vision, scope, an addition, an
  implementation detail, a correction, a screenshot, a document — BEFORE continuing whatever
  was in progress. Triages that input against the work currently in flight and folds it into
  the active plan immediately, so it can change what is about to happen instead of being
  parked as "later" and surfacing after the moment it would have helped. Explicitly NOT for
  routine replies ("yes", "go ahead", "looks good") or for answering a question already asked
  — those need no re-plan. Hands the permanent verbatim record to founder-directive-capture;
  this skill owns the live course-correction, that one owns the archive.
---

# founder-input-intake — new information changes the plan now, not later

## Why this exists

The founder's own words, 2026-08-07:

> *"each time I provide you new additional information from the founders perspective I need
> that to never interrupt your work flow process ever again… instead of just trying to do
> something later on when what I could be mentioning could help out with you maybe doing
> what you might be about to do or what you've already done."*

Two distinct failures were happening, and this skill exists to stop both:

1. **Information arriving too late to help.** The founder mentions something that bears
   directly on the next action, and it gets acknowledged but not acted on until after that
   action already happened the old way.
2. **Information derailing the work.** The opposite overcorrection — dropping everything to
   chase a remark that was context, not a redirect.

Both come from the same root: **no defined moment where founder input meets the current
plan.** This is that moment.

## The triage — four outcomes, decided before the next action

Run this the instant input arrives. It is short on purpose; it must not itself become an
interruption.

| Outcome | Test | What happens |
|---|---|---|
| **INVALIDATES** | The work in flight is now wrong or pointless | **Stop before the next write.** Say what is being abandoned and why. Do not finish it "since it's nearly done." |
| **CHANGES** | The work is right but the approach or target moved | **Re-plan before the next action**, then continue |
| **CONFIRMS** | Independently supports the current direction | Continue. Note the confirmation — it raises confidence and is worth recording |
| **EXTENDS** | Real, related, but not about what is in flight | **Fold into the plan. Do not derail.** Finish the current unit first |

**When genuinely torn between INVALIDATES and EXTENDS, ask.** One question costs far less
than either finishing abandoned work or dropping work that should have finished.

## Then write it down, immediately

The triage result goes **into the active plan file**, not into a memory of the conversation.
This is not bookkeeping — it is the whole mechanism.

A founder-ordered audit (2026-08-07) measured that **84% of work deferred with "verification
owed post-merge" was never followed up**, because the caveat lived in a session's context and
died with it. Founder input parked as "later" fails identically. If the plan does not carry
it, the next session inherits nothing.

Record: what arrived, which of the four it was, and what changed as a result. One or two
lines.

## Check what it means for work already finished

The founder specifically named this: *"or what you've already done."*

New information can retroactively change the meaning of completed work. Before moving on,
ask whether it invalidates something already marked done, reveals a claim that was made at
too high a level (see `wired-or-not`), or explains a result that was previously confusing.

**If it invalidates finished work, say so in the same reply.** Do not let a correct-at-the-
time claim stand once it is known to be wrong.

## Hard boundaries

- **Never paraphrase a founder directive into something stronger or weaker than what was
  said.** If it came from a UI selection rather than typed prose, record it as a selection —
  a paraphrase promoted to a quote is a fabrication even when it flatters.
- **Never silently reinterpret ambiguous input as approval.** "That's interesting" is not
  "do it."
- This skill re-plans; it does **not** grant permission. Anything irreversible or
  founder-gated stays gated no matter what arrives.
- **Substantive directives still go to `founder-directive-capture`** for the permanent
  verbatim record in `Project_file/Founders Visonary Folder/HIVE_UPDATES/`. Live re-plan
  here, archive there — run both, they are not alternatives.

## Honest limits

This is a **procedural** skill. Nothing machine-enforces it — no CI check can detect that
founder input was ignored. Said plainly because the same audit found doctrine declared
"non-negotiable" with no mechanism behind it, and this skill should not quietly become
another instance of that.

What makes it survive a context cutoff is the one concrete artifact: **the triage result
written into the plan file.** That is the part to never skip.

## Links

`founder-directive-capture` (archive) · `wired-or-not` (claim levels) · `dual-lens`
(evaluating what arrives) · `memory/philosophy/resonance-interference.md` (does this input
amplify or cancel the work in flight)
