---
name: recursive-growth
description: Invoke at the very start of every session, before planning anything — it reads the current master plan (memory/planning/2026-07-19-unified-forward-plan.md) so work picks up exactly where the last session left off, phase by phase. It also runs alongside fable-debugger: every verified fix gets folded back in as a lesson (LESSONS.md), and once a lesson genuinely recurs (not on a single occurrence) it gets promoted into this skill's own Recurring Patterns section — the skill grows itself. Separately, after any skill runs, it does one light pass over that skill's own files for a small, honest, logged correction (a stale example, a broken path, a fact the run just disproved) — never a rewrite, never touching a documented hard boundary. Not a replacement for hive-conductor's memory-RECALL (that queries the D1/Vectorize sovereign-memory backend) — this is the literal, always-available, no-network-required sibling: the plan file and the skill files themselves are the memory here.
---

# recursive-growth — session-start recall, and a skill that keeps correcting itself

Three founder directives, one skill: (1) every session should be pointed straight at the
master plan, not left to re-derive "what's next"; (2) whatever `fable-debugger` learns from
a real bug should make the hive smarter next time, not evaporate at session's end; (3) skills
themselves should get corrected, in their own files, as their own use turns up something
stale — not just accumulate lessons in a side log nobody rereads.

## Part 1 — Session-start recall (run this first, every session)

```bash
cat memory/planning/CLAUDE.md   # confirms the current pointer
cat memory/planning/2026-07-19-unified-forward-plan.md   # the actual plan
```

Report back plainly, before doing anything else: which phase is next (per the plan's own
"Phase 0" → "Phase 7" ordering), what's already closed, and what's explicitly founder-blocked
(Phase 5 — never scheduled as a task, only tracked). This is the same discipline
`hive-conductor`'s Phase 0 RECALL already applies to sovereign D1/Vectorize memory
(`scripts/recall_context.py`) — this skill is that same idea pointed at the one committed
plan file instead of a network-backed index, so it works even with zero egress, and it names
the concrete next phase rather than a fuzzy "prior related work" brief. Run both; they answer
different questions (RECALL: "has the hive done something like this before anywhere in its
history?" — this skill: "where exactly are we in the one plan we already agreed to?").

If `memory/planning/CLAUDE.md`'s pointer and the Founders Visionary Folder's own pointer
(`Project_file/Founders Visonary Folder/ACTIVE/2026-07-19-current-master-plan-pointer.md`)
ever disagree about which file is current, that disagreement is itself the thing to fix
first — the two lineages pointing at two different plans is exactly the reconciliation gap
this plan's own Phase 1c exists to close. Don't silently pick one; say so and fix the stale
pointer.

## Part 2 — Growing from fable-debugger (recursive learning from bugs)

Every time `fable-debugger`'s loop reaches step 6/7 (VERIFY-REAL, then CLOSE — a fix that
actually proved itself against a real check, not an escalation) do two things:

1. **Always**: append one entry to `LESSONS.md` in this skill's own directory — symptom,
   root cause (one sentence, per fable-debugger's own step 3 discipline), the fix, and the
   verification command that proved it. This is the raw, unfiltered log — append-only, never
   pruned, never summarized away. Every entry should be real (a fix that actually shipped),
   never a hypothetical "here's a bug that could happen."
2. **Only on genuine recurrence** (the same root-cause *shape* appears a second time,
   possibly in a different file): promote it into this file's own **Recurring Patterns**
   section below, generalized past the specific file/symptom into the reusable lesson. This
   is the actual "recursively builds and grows" mechanic — the skill's own body of knowledge
   gets denser over time, but only with things that proved themselves twice, not every
   one-off. A skill that grew by appending every single bug would become noise nobody reads;
   a skill that only grows on real recurrence stays worth reading years in.

### Recurring Patterns (empty until a lesson genuinely recurs — do not seed this with
guesses; the first entries here should be real, already-observed repeats)

*(none yet — see `LESSONS.md` for the raw log this section promotes from)*

## Part 3 — Optimizing other skills' own files, after they run

After any skill in `.claude/skills/` completes a real run (not a dry read), do one light
pass, bounded by hard rules:

1. **What counts as an optimization**: a stale example that no longer matches the repo (a
   renamed file, a moved endpoint), a broken script path, a described behavior the run just
   proved wrong or incomplete, a missing cross-reference to a skill that's clearly relevant
   (the way this section itself should have existed the first time `fable-debugger` and
   `hive-conductor` were written — see the changelog entries this skill added to both on
   2026-07-19, the first real proof of this mechanic, not just a description of it).
2. **What never counts**: rewriting a skill's core contract, loosening a documented hard
   boundary (`threat-sandbox`'s "never absorb the payload," `session-harvest`'s
   ownership/license gate, any `PERMISSIONS.md` tier boundary, `agent-harness`'s
   never-adjudicate-your-own-verification rule), or any edit that isn't traceable to
   something this run actually observed. When in doubt, don't edit — log it in `LESSONS.md`
   as a candidate instead and let it recur before acting.
3. **Every edit is small and logged**: one paragraph or one line changed, a one-line entry
   appended to `SKILL_CHANGELOG.md` in this directory naming which skill, what changed, and
   why (the observed evidence), and committed normally — never silent, uncommitted drift.
   This is Tier 1 under `PERMISSIONS.md` (internal, reversible via git, no external party, no
   money) — but the changelog is what keeps it honest under F-004 (explainability): anyone
   can `git log`/`git blame` a skill file and find the reason a line changed.
4. **This skill is not exempt from itself**: when running `recursive-growth` itself turns up
   something stale in this very file (a broken path, a Recurring Pattern that turns out
   wrong), the same rule applies — small edit, changelog entry, no silent rewrite.

## Relationship to the hive's other memory/growth mechanisms (so nothing here duplicates them)

- **`hive-conductor`'s Phase 0 RECALL** — queries sovereign D1/Vectorize memory for "has the
  hive done something like this before, anywhere." Network-dependent, degrades gracefully.
  This skill is its local, always-on sibling, scoped to one committed plan file.
- **`fable-debugger`** — the method that produces the lessons this skill grows from. This
  skill doesn't debug; it remembers what debugging taught, and corrects the skills involved.
- **`pr-retrospective` / `PR_LESSONS.md`** — PR-outcome-specific forward checks (what to
  watch for on the *next* PR touching a risky surface). This skill's `LESSONS.md` is broader
  (any verified fable-debugger fix, not just PR-shaped ones) and feeds skill-file corrections,
  not just a pre-flight checklist.
- **`session-harvest`** — distills a whole session's work into `HIVE_UPDATES/` at close,
  under an ownership/license gate. This skill runs continuously *within* a session (every
  fable-debugger close, every skill run), and writes to skill files and the lessons log, not
  to the founder-facing updates channel.
- **`skill-census`** — audits whether skills are wired/orphaned, periodically. This skill is
  what keeps a skill's *content* accurate between census runs, not what discovers whether a
  skill is used at all.

## Quick start

```bash
# 0. Session start — read the plan, report the next phase, before anything else:
cat memory/planning/CLAUDE.md
cat memory/planning/2026-07-19-unified-forward-plan.md

# 1. After a fable-debugger close — append the raw lesson:
#    (edit .claude/skills/recursive-growth/LESSONS.md — symptom / root cause / fix / verification)

# 2. If that lesson's shape has appeared before — promote it into this file's
#    "Recurring Patterns" section, generalized past the one instance.

# 3. After any skill runs — if something in ITS OWN files is now stale, make one small,
#    logged edit and append one line to SKILL_CHANGELOG.md naming what/why.
```

Origin: founder directive, 2026-07-19 — "refer directly to this plan at the beginning of
each session," "recursively builds and grows... any time fable 5 debugger is r[u]n,"
"learn recursively from any and all the bugs," "fully optimize any other skill... directly
into their file[s]." Built the same way every other skill here was: a real, repeatable
method, written down so any session can run it — not a promise, a discipline.
