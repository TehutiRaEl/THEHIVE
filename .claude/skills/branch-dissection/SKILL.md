---
name: branch-dissection
description: >
  Full, methodical dissection of an old, disconnected-history branch before it's used or
  deleted. Use when a repo audit surfaces a branch with no shared ancestor with main (a
  real, recurring shape in this project's history), or any time abandoned work needs to
  be judged rather than skimmed before a decision is made about it. Reads every real file
  the branch contains, verdicts each real piece, runs both dual-lens skills against the
  findings, asks the founder wherever intent is genuinely unclear, and only recommends
  deletion once everything real has been gathered, merged/adapted, and logged. Built from
  the first real run of this method against feature/gamified-ui-components (2026-08-18) —
  not a hypothetical process, a codification of one that already worked.
---

# branch-dissection — judge an old branch before it disappears

## Why this exists

A GitHub audit found 7 branches in this repo with no shared history with `main` at
all — real work, dating back to mid-July, sitting disconnected and undocumented. The
founder's own framing, verbatim, is why this skill exists: *"if it's not [written
down], that's the reason you don't know so we need to make sure it gets in there this
time."* Deleting an unexamined branch destroys whatever real intent it carried;
skimming it and moving on repeats the exact silence that made it unexamined in the
first place. This skill is the discipline that closes that gap, once, reusably.

## The method — five steps, in order

**1. Read every real file, not just the ones with familiar names.** A branch's name
describes its last few commits, not necessarily its real history or its full
contents — `feature/gamified-ui-components` turned out to be 90% an unrelated early
backend scaffold. Check the branch's full commit log and file tree before assuming
the name is the whole story.

**2. Verdict each real piece — exactly one of four:**
- **absorb** — the idea/pattern is good, adapt it into something real
- **copy-paste** — usable as-is, no rebuild needed
- **rebuild** — the shape is right, the content isn't (this project's most common
  verdict so far: real, working UI patterns filled with placeholder/fictional data)
- **needs a second look** — real intent unclear, do not guess

Check every piece against what already exists on `main` before verdicting — a piece
that looks missing may already have been deliberately, rigorously decided closed (see
branch 1's `arena_guild.py`/`constitutional_guild.py`/etc. — commit `545240f`, a real
founder-reviewed cleanup, not a gap).

**3. Run both dual-lens skills against the verdicted findings** —
`childlike-wonder` (what could this become) and `devils-advocate-audit` (what's weak
or being missed), in that order per `dual-lens`'s own doctrine (interrogate first,
expand second). This is not re-confirming step 2's verdicts — it's asking what the
mechanical read-through structurally cannot surface: hidden assumptions, staleness
risk, blast radius, and genuine expansion possibilities the verdict-per-piece pass
doesn't have a slot for.

**4. Ask the founder wherever intent is genuinely unclear — and only there.** Don't
ask about things a careful read already answers (framework/library availability, what
exists on `main`, whether code runs). Do ask about origin intent, whether a direction
is still wanted, and anything the files themselves cannot resolve. Capture every real
answer in `Project_file/Founders Visonary Folder/HIVE_UPDATES/` as a directive —
verbatim, dated — because an answer held only in one session's context dies with that
session, which is the exact failure this skill exists to stop repeating.

**5. Only recommend deletion once everything real has been gathered, merged or
adapted, and logged.** A branch closes the loop when its content has genuinely
stopped being the only record of itself — not when it's merely been read once.

## What "genuinely unclear" looks like vs. what doesn't need asking

Ask: *"why was this built as a separate effort instead of inside the real
frontend?"*, *"is this direction still wanted?"*, *"which of these two conflicting
things should govern?"*

Don't ask: *"does `main`'s `package.json` already have this dependency?"* (check it),
*"is this file's logic real or a stub?"* (read it), *"does this duplicate something
that already shipped?"* (grep for it). The whole point of the mechanical read-through
in steps 1-2 is to exhaust what code alone can answer, so step 4's questions are the
ones that genuinely need the founder — not padding a question list with things
already answerable.

## A real precedent worth knowing about

Branch 1's dissection surfaced a discovery unrelated to the branch's own UI content —
two live constitutions in the repo (root `soul.md` vs `.queen/soul.md`), one of them
completely unenforced and drifted from its own recorded integrity hash. That finding
came from asking a genuinely-unclear question (about a UI taxonomy choice) and
following where the real answer led, not from the mechanical file read itself. Stay
open to a dissection surfacing something bigger than the branch it started on — don't
prematurely narrow step 4 to only the branch's own literal content.

## Hard boundaries

- **Never delete a branch this method hasn't fully run against.** A partial read is
  not a verdict.
- **Never guess at founder intent to avoid asking.** That is the specific failure
  this skill exists to close.
- **Never treat "already superseded on `main`" as a gap to fill without checking
  `git log` first.** Confirm via history (as with branch 1's guild files) before
  assuming an absence is an oversight rather than a real, already-made decision.
- **Never skip the dual-lens pass because the file read felt thorough.** Step 3 finds
  a different class of thing than steps 1-2 can, by design — see `dual-lens`'s own
  doctrine for why neither lens is optional.

## Links

`dual-lens` (the binding gate this skill's step 3 invokes) · `childlike-wonder` ·
`devils-advocate-audit` · `founder-directive-capture` (owns the permanent verbatim
archive step 4 writes into) · `merge-readiness` (once absorbed content is ready to
actually ship as a PR)
