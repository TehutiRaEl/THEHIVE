---
name: plan-reality-audit
description: >
  Audits a plan (a session's own ephemeral plan file, a committed master plan, a PR's own
  claimed scope) against the real repo state — verdicting every item as completed / attempted /
  never touched / hallucinated / unfinished / half done / never wired up or deployed / dead
  code — then runs childlike-wonder against the genuine gaps, never against items that are
  correctly not-yet-due. Use when a plan is old enough that it might have drifted from reality
  (the founder's own committed master plan going a month unread is the case this skill was
  built to close), when picking up "where a session left off" and the real state needs
  confirming rather than assuming, or any time a "done" claim needs re-grounding before being
  trusted. Sibling to wired-or-not (the completion-level discipline this skill's verdicts use)
  and devils-advocate-audit (interrogates shipped code for hidden bugs; this skill interrogates
  a PLAN for hidden drift between what it claims and what's real) — hybridized the same way
  branch-dissection hybridized full-file-read + dual-lens for old branches, pointed at plans
  instead. Built 2026-08-18 from the first real run of this method against this session's own
  plan file and the repo's stale month-old master plan.
---

# plan-reality-audit — what does this plan actually say happened, and is any of it true?

## Why this exists

`memory/planning/2026-07-19-unified-forward-plan.md` is the founder's own committed,
pointed-to, "read this first every session" master plan — and by 2026-08-18 it had gone
a full month without being updated, silently drifting out of sync with real, substantial
work (a venture-repo program, a 5-provider waterfall, a real sandbox-execution engine) that
had shipped in the meantime. Nothing was lying — the plan just stopped being read against
reality. That's the gap this skill closes: not "is this code buggy" (`devils-advocate-audit`'s
job) but "does this PLAN's account of what's done still match what's real."

## The eight verdicts

Every item in the target plan gets exactly one, chosen only after checking the real repo
state — never inferred from the plan's own prose alone:

1. **completed** — built, tested, and verified at the level it claims (`wired-or-not`'s own
   ladder: compiles → tested → merged → deployed → verified-live). A "done" claim without a
   checkable reference (run ID, SHA, committed test path) does not earn this verdict.
2. **attempted** — real work exists, genuinely incomplete — not nothing, not finished.
3. **never touched** — no evidence any work started. Not automatically a problem; check
   whether the plan itself marks it founder-blocked or intentionally-sequenced-later first.
4. **hallucinated** — claimed done somewhere, no real evidence found anywhere in the repo.
   The load-bearing verdict this skill exists to catch — see `fabrication-mining` for what to
   do once a claim reaches this verdict, if there's a real discard pile behind it worth mining.
5. **unfinished** — started, stalled, no longer actively worked, not formally abandoned either.
6. **half done** — the distinguishing case from "attempted": a real, working PART exists,
   but the item as scoped needs more than that part to be genuinely usable.
7. **never wired up or deployed** — code exists, nothing calls it, serves it, or reaches it —
   the exact shape of orphaned merged-but-unmounted components this repo has hit more than
   once (`feature/gamified-ui-components`'s 14 unmounted components is the canonical example).
8. **dead code** — built for a real reason, then genuinely superseded by later, better work,
   never removed. Not a bug — confirm via `git log` (a real founder decision, like commit
   `545240f`'s guild-file cleanup) before assuming an absence is a gap rather than a closure.

## The method

1. **Read the real repo, not the plan's prose, for each item.** Grep for the actual route/
   table/component/file the plan claims exists; run the actual test suite; check actual git
   history for actual decisions. The plan is the hypothesis, the repo is the ground truth.
2. **Assign exactly one verdict per item**, from the list above, with the real evidence that
   produced it (a file path, a test count, a commit SHA — never "this looks right").
3. **For every genuine gap** (hallucinated, unfinished, half-done, never-wired, or a
   never-touched item that ISN'T legitimately blocked/sequenced-later): run
   `childlike-wonder`'s 5-step expansion against it — what becomes possible if it worked,
   what's the real hardest constraint, etc. — before deciding what to build. This is
   deliberately AFTER the verdict, not instead of it: wonder applied to something that's
   actually already done, or actually genuinely blocked on the founder, is waste.
4. **Never treat "not yet done" as automatically a gap.** A `Phase 5`-shaped founder-blocked
   item, or an item the plan itself sequences for later, gets its real verdict (probably
   "never touched") without triggering a childlike-wonder pass or a fix — that would be
   solving a problem the plan never had.
5. **Write the report to a real file**, not just chat output — a plan reality audit that
   only lives in one turn's transcript is exactly the kind of thing this skill exists to stop
   happening to plans themselves.

## Hard boundaries

- **Never upgrade a verdict to make a plan look more finished than it is.** The founder's own
  reality audit (2026-08-07, `wired-or-not`) found 34 of 36 "done" tasks unconfirmed — this
  skill exists in that same lineage; softening a verdict here is the exact failure it's built
  to catch.
- **Never fix a gap before finishing the audit.** Verdicting and fixing are separate passes —
  mixing them risks skipping items because an early fix felt like enough progress.
- **Never guess a plan's real status from its own claims when the repo is checkable.** If a
  claim can be verified by reading real code or running a real test, do that — don't take the
  plan's word for it, which is the entire premise of why this skill exists.
- **`hallucinated` is a real, expected outcome, not a failure of the audit.** Same discipline
  `devils-advocate-audit` already states about "could not verify" — record it plainly, don't
  soften it into "unfinished."

## Links

`wired-or-not` (the completion-level ladder this skill's verdicts are built on) ·
`devils-advocate-audit` (interrogates shipped code; this interrogates a plan's claims) ·
`childlike-wonder` (run against genuine gaps only, after the verdict) · `branch-dissection`
(the sibling method this was hybridized from, pointed at old branches instead of plans) ·
`fabrication-mining` (the next step for anything verdicted `hallucinated` with a real discard
pile behind it) · `recursive-growth` (owns reading the master plan at session start — this
skill is what confirms that plan is still telling the truth)
