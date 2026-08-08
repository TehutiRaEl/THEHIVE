---
name: dual-lens
description: >
  The binding gate for architectural and design decisions — runs BOTH hive lenses in the
  doctrine's own order (devils-advocate interrogates what could break, then childlike-wonder
  expands what it could become) and refuses to pass a decision reviewed by only one. Use
  before committing to any structural choice: a new subsystem, a schema change, an agent or
  capability, a change to how the hive governs or spends, or any founder proposal being
  evaluated. When the subject is source material — a document, external research, a founder-
  shared PDF — rather than the hive's own design, a third stage (fabrication-mining) runs
  after the first two whenever devils-advocate found something false along the way; skip it
  when there is no discard pile to mine. Explicitly NOT for routine bug fixes, verification
  passes, or mechanical work where the answer is known and just needs doing — running both
  lenses on a typo is pure overhead. This is the enforcement wrapper for
  memory/philosophy/dual-lens-framework.md, which declared both lenses non-negotiable and had
  no mechanism behind it.
---

# dual-lens — neither lens is optional

## The doctrine this enforces

`memory/philosophy/dual-lens-framework.md`, verbatim:

> *"Every architectural choice passes through both lenses before implementation:
> **devils-advocate** — interrogates what we've built (risk, failure, attack surface);
> **childlike-wonder** — asks what it could become (possibility, emergence, delight).
> Neither lens is optional. A decision made with only one lens is incomplete."*

**That was true on paper and false in practice.** `devils-advocate-audit` existed as a real
skill; `childlike-wonder` did not exist at all until 2026-08-07. Every decision made "under
the framework" before then was single-lens by construction. This skill is the gate that was
missing.

## Order matters — interrogate first, then expand

The doctrine specifies it, and the reason is real: **wonder applied before criticism
produces advocacy, not design.** Once you have described how wonderful something could be,
you are motivated to find its risks survivable. Reversing the order is the single most
common way this gate gets quietly defeated.

### Stage 1 — Devil's advocate: what could break?

Full method: `devils-advocate-audit`. Minimum for this gate:
- What fails, and what does that failure cost?
- What does this let someone (or some agent) do that they should not?
- What does it couple that was previously independent?
- What claim does it make that is not yet evidenced (`wired-or-not`)?

### Stage 2 — Childlike wonder: what could it become?

Full method: `childlike-wonder`. Minimum for this gate:
- If it worked perfectly, what becomes possible that could not before?
- What named constraint, if removed, changes the answer?
- What cross-domain connection is invisible from inside this problem?

### Stage 3 — Fabrication-mining: conditional, source material only

**Runs only when the subject under review is source material** — a document, a founder-shared
PDF, external research, a proposal built from outside claims — **not** when it is one of the
hive's own design decisions. A new subsystem or schema change has no discard pile to mine;
forcing this stage onto routine architectural decisions is exactly the kind of theatre "Don't"
below warns against.

**Trigger condition:** Stage 1 found one or more claims in the source material that are false,
fabricated, or unverifiable — not merely risky, actually false. If Stage 1 found the material
entirely sound, or found risks in a genuine design rather than falsehoods in a document, this
stage does not run — say so, rather than forcing a mining pass with nothing to mine.

When triggered: run `fabrication-mining` on each false claim Stage 1 identified. That skill's
five-verdict method (`POINTS-AT-A-REAL-GAP` / `INDEPENDENT-REDERIVATION` / `LIVE-FIXTURE` /
`MIRROR` / `NO-SIGNAL`) produces what Stage 1 alone cannot: not just "this is false," but what
the falsehood was reaching for, checked against what the hive actually has. See
`fabrication-mining/SKILL.md` for the full method — it is not reproduced here.

**Worked example:** `VISION/2026-08-08-vision-arithmancer-thermodynamics-audit-010.md`
(Stages 1–2, source-material decisions) and
`VISION/2026-08-08-vision-arithmancer-full-dissection-011.md` (Stage 3, added after the
founder's own correction that a fabrication-only-discarded pass had missed the actual ask).

### The verdict

Every lens that ran reports. **None cancels another.** A real risk is not erased by a
beautiful possibility, a real possibility is not erased by a manageable risk, and a mined
finding from Stage 3 does not soften a risk Stage 1 found — `fabrication-mining`'s own hard
boundary says the same thing from the other direction. Say what each found, then state the
decision and which lens it favours and why.

## The refusal — the actual gate

**A decision reviewed by only one lens does not pass.** If only one has run, the honest
output is *"single-lens, incomplete"* plus what the missing lens still needs to answer —
never a verdict dressed as complete.

This includes the tempting cases:
- The risk is obvious and severe → **still run wonder.** It often reveals that the valuable
  part can be kept while the dangerous part is dropped.
- The idea is obviously good → **still run devils-advocate.** This is where the expensive
  mistakes live.
- Time is short → then say the gate was skipped. **Skipping it and not saying so is the one
  outcome this skill exists to prevent.**

## Do

- Run this on **founder proposals too**, not only on your own designs. A founder idea
  deserves both lenses — that is respect, not obstruction. `MANDATE_TRIAGE.md` already says
  nothing gets rubber-stamped.
- Check **resonance** before batching decisions together
  (`memory/philosophy/resonance-interference.md`): two decisions that cancel each other must
  be sequenced, not merged.
- Name what you **could not evaluate** and why.

## Don't

- **Don't run wonder first.** See above.
- **Don't let either lens become theatre** — a risk section listing generic risks nobody
  will act on, or a wonder section listing everything imaginable, both defeat the gate while
  appearing to satisfy it.
- **Don't treat the verdict as permission.** Anything irreversible or founder-gated stays
  gated regardless of how well it passed.
- **Don't invent Codex mythology** in the wonder pass (`FABLE_DNA.md` Chromosome V).

## Honest limits — stated because this repo has a history

**This gate is procedural. Nothing machine-enforces it.** No CI check can detect a decision
that skipped a lens.

That matters here specifically: a founder-ordered audit (2026-08-07) found 34 of 36 `done`
tasks never verified against production, and the root cause was doctrine with no mechanism —
which is exactly what `dual-lens-framework.md` was. Writing a skill about it improves the
odds; it does not make it enforced. **Anyone reading this should assume it can be skipped,
and treat "did both lenses actually run?" as a live question rather than a settled one.**

The one durable artifact: when a decision passes this gate, **write both lenses' findings
into the plan or task record**, not just the verdict. Findings in a file survive a context
cutoff; findings in a session's head do not.

## Links

`devils-advocate-audit` · `childlike-wonder` · `fabrication-mining` (conditional Stage 3, source
material only) · `wired-or-not` (claim levels) ·
`hive-conductor` (invokes this gate when routing decisions) ·
`memory/philosophy/dual-lens-framework.md` (source doctrine) ·
`memory/philosophy/resonance-interference.md`
