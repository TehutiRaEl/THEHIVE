---
name: fabrication-mining
description: Use on claims already judged false, fabricated, or unverifiable — a hallucinated citation, an invented mechanism, a mythology promoted to spec, a document research-to-dna marked DECLINED — to extract what the fabrication was reaching for before discarding it. Runs strictly after a verdict of false, never as a substitute for reaching one; a claim still under verification belongs to devils-advocate-audit or research-to-dna, not here. Not for claims already known true (nothing to mine) or for confirmed security threats (anomaly-triage's tier-3 path escalates those; mining them into a "lesson" would soften a real risk). Produces one of five verdicts per fabrication, including the load-bearing null result — some fabrications are simply wrong, and saying so plainly is this skill's evidence it isn't manufacturing insight from noise.
---

# fabrication-mining — the discard pile is not empty

## Why this skill exists at all

The founder has made the same correction three times, and until now nothing in the hive
carried it forward between sessions:

> *"filtering-and-rejecting isn't the job; the job is real, granular, collaborative
> construction"* — 2026-08-02, on a dissertation-length document with real bugs in its
> pasted code (`Fable_memory.md`, 2026-08-02 entry).

> *"[the pass] wasn't to check to see if any of it was in the hive… it was to utilize the
> devil's advocate, lens, and compare and contrast what all can be used in the hive that may
> not have ever been spoken about or thought of like an innovator would"* —
> `HIVE_UPDATES/2026-08-08-directive-innovator-lens-correction-047.md`.

> *"what fabrications can we still derive improvements, implications and otherwise from"* —
> the directive this skill was built from,
> `HIVE_UPDATES/2026-08-08-directive-fabrication-mining-049.md`.

**The structural gap this closes.** Every existing verification path in the hive terminates
at "false" and stops there:

- `research-to-dna`'s **DECLINED** verdict = *"checked and found fabricated, unsafe,
  license-incompatible, or off-vision. Recorded with the reason."* Recorded is not mined.
- `devils-advocate-audit` interrogates what could break in something real; it was never
  pointed at something already known fake.
- `childlike-wonder` only ever runs on things judged real or on the hive's own designs.

Nothing in the hive asks: *why was this particular false thing generated, and what does its
shape point at?* That question is this skill's entire job.

## When this runs, precisely

**After** a verdict of false/fabricated/unverifiable has already been reached — by
`research-to-dna`, `devils-advocate-audit`, direct grep-and-check, or plain reading. This
skill never reaches that verdict itself; it starts from one already reached elsewhere.

Typical triggers: a `research-to-dna` **DECLINED** disposition; a `devils-advocate-audit`
finding that a specific claim in reviewed material is false; a founder-shared document
containing invented terminology, fake citations, or mythology promoted to engineering spec;
picking up an old `DECLINED`/rejected verdict during a retro sweep.

**Does not run on:** claims not yet verified (verify first, elsewhere); claims already known
true (nothing to mine — that is `childlike-wonder`'s job, on the real thing); confirmed
security threats (`anomaly-triage` tier 3 — escalate, do not mine into a lesson).

## The method — five steps per fabrication

Run per distinct fabrication, not once per document. A 28-page document with nine separate
invented claims gets nine passes, because each points somewhere different.

### 1 · Classify the error shape

Name it before analysing it — the shape itself is often the fastest route to step 2.

- **Fabricated precision** — a specific number with no method behind it (`96.9% ± 1.8%` on an
  unfalsifiable claim).
- **Invented mechanism** — a plausible-sounding causal link asserted, not derived (geomagnetic
  field strength → transformer attention coherence).
- **Motivated citation** — real vendor/author + plausible number + no locator (an "Intel/AMD
  whitepaper" claim with no title, date, or link).
- **Category error** — treating one kind of thing as another (memory as energy rather than
  configuration; a single mythological figure promoted to a plural engineering role).
- **Scope overclaim** — a real, narrow finding stretched past what it supports.
- **Mythology-promoted-to-spec** — narrative language read as an engineering requirement.
- **Typo / transcription error** — not a claim at all, just noise. Name it and stop; this is
  what step 5's `NO-SIGNAL` verdict is for.

### 2 · Ask what it was reaching for

What would have to be true for someone (or something generating text) to produce *this
specific* fabrication rather than a different one? What real need does the invented claim
serve, even though the claim itself is false? A fabricated citation about bit-flip rates is
reaching for "cooling matters more than people think" — that reach may be sound even though
the citation is not.

### 3 · Strip the false part, keep the reach

Restate the underlying want in falsifiable, checkable terms — with the invented specifics
(the fake number, the fake mechanism, the fake name) removed. If nothing falsifiable survives
the stripping, that is itself informative: proceed to step 5 and return `NO-SIGNAL`.

### 4 · Test the stripped reach against the real hive

Grep and read before answering, per this hive's standing discipline — never assert from
memory. Is the stripped want already built, somewhere in the hive? Genuinely missing?
Something the hive got right by a different route (an independent rediscovery worth citing as
validation)? Or a live instance of a failure mode the hive already has, evidenced elsewhere?

### 5 · Verdict — exactly one of five, stated explicitly

- **`POINTS-AT-A-REAL-GAP`** — the stripped reach names something genuinely missing or
  underspecified. Name the gap, name where it would live in the hive, and — per this hive's
  standing rule — do **not** silently open a new task for it; fold it into an existing task or
  record it as a founder-facing finding.
- **`INDEPENDENT-REDERIVATION`** — the fabrication reaches somewhere the hive already got, by
  a different and better route. Cite the real implementation. This is validation, not new
  work — say so plainly rather than manufacturing a task from it.
- **`LIVE-FIXTURE`** — the fabrication itself is a usable test artifact for a capability the
  hive is already building (a fabricated citation is a ready-made adversarial input for a
  citation-verification feature, for instance).
- **`MIRROR`** — the document's failure shape is a failure shape the hive itself has had.
  Cite the hive's own real instance. This is the sharpest finding this skill can produce,
  because it is evidence about the hive, not about the document.
- **`NO-SIGNAL`** — the fabrication is simply wrong, points at nothing, and nothing survives
  stripping. **State this plainly rather than omitting the fabrication from the report.** A
  report that only lists fabrications with a positive verdict is indistinguishable from one
  that manufactured insight to justify the exercise — `NO-SIGNAL` is the falsifiability check
  on this skill's own output.

## Producing a usable report

- One verdict block per fabrication: the quoted source claim, the classified shape, the
  stripped reach, the verdict, and the citation (`file:line` or "nothing found, checked at
  `path`") that supports it. A reader must be able to disagree with the verdict without
  re-reading the source document.
- **Never let a `POINTS-AT-A-REAL-GAP` verdict become an approved task.** This skill surfaces;
  it does not decide. Fold into existing scope or hand to the founder, per this hive's
  standing "an idea surfacing here is not an idea approved" discipline (`childlike-wonder`
  carries the identical rule for the same reason).
- Recurring shapes belong in `FABRICATION_PATTERNS.md`, this skill's companion registry —
  append-only, dated, each entry citing its real instances. A shape seen once is an
  observation; a shape seen twice, cited both times, is a pattern worth checking for
  proactively the next time similar material arrives.

## Relationship to the other lenses — where this sits, exactly

- **`research-to-dna`** reaches the DECLINED verdict this skill starts from. This skill is the
  step that verdict was always missing.
- **`devils-advocate-audit`** interrogates what could break in something real, or reaches a
  false verdict on a specific claim mid-audit. When it does the latter, that claim can be
  handed to this skill.
- **`childlike-wonder`** asks what something real could become. This skill is its mirror for
  the discard pile — not "what could this become" but "what did the reach for this reveal,
  now that we know it isn't this."
- **`dual-lens`** gates architectural *decisions* — it has no discard pile of its own to mine.
  When the subject under `dual-lens` is source material (a document, a proposal, external
  research) rather than the hive's own design, `dual-lens` invokes this skill as an explicit
  third stage. See `dual-lens/SKILL.md`'s "Stage 3" section.
- **`nine-miss-truths`** generates alternative explanations before a root cause is named — the
  moment *before* a verdict. This skill runs strictly *after* one, on a verdict already fixed
  at "false."
- **`anomaly-triage`**'s tier-3 path (confirmed security threat) is the one thing this skill
  must never absorb. A real intrusion attempt does not get mined for "what was it reaching
  for" — it gets escalated. If a fabrication turns out, mid-mining, to be a live threat
  vector rather than a false claim, stop mining and hand it to `anomaly-triage` immediately.

## Hard boundaries

- **Never let mining soften a real risk.** If a document also contains a genuine hazard (a
  ToS-violating plan, an unsafe mechanism), mining its *other* fabrications for value does not
  change that verdict. Both findings stand; neither cancels the other — the same rule
  `dual-lens` states for its two lenses applies here between "this is dangerous" and "that
  other part is useful."
- **Never invent hive mythology while mining.** A fabrication that touches `THE_CODEX.md`
  territory gets analysed for its engineering reach only (`FABLE_DNA.md` Chromosome V's
  boundary) — new lore is founder territory regardless of what a fabrication gestures toward.
- **Never skip `NO-SIGNAL`.** A skill that always finds something to extract is not doing
  analysis; it is doing motivated reasoning with extra steps. If nothing survives step 3,
  report that.
- **Never mine a confirmed security threat.** Hand it to `anomaly-triage` tier 3 instead —
  see "Relationship to the other lenses" above.
- **Never treat a mined finding as approved work.** See "Producing a usable report" above.

## Honest limits

Procedural, same as `dual-lens` and `childlike-wonder` — nothing machine-enforces that this
skill actually ran, or that a `NO-SIGNAL` verdict wasn't quietly upgraded to look more
interesting than it is. Stated because this repo has a measured history of doctrine with no
mechanism behind it (`memory/philosophy/dual-lens-framework.md` existed unenforced for weeks
before `dual-lens` the skill did). The one durable safeguard: every verdict in a written
report is checkable independently — a reader who does not trust the verdict can re-derive it
from the cited claim and the cited hive evidence.

**Retroactive debt, named rather than hidden.** This skill did not exist when the hive
declined the 2026-08-02 dissertation's pasted code, `MANDATE_TRIAGE.md`'s tabled directives,
or the 2026-08-01 dead-code sweep. Those declines were never mined. A retro sweep is real,
separate, and bounded work — see `VISION/2026-08-08-vision-decline-retro-sweep-012.md` for
what has and has not yet been covered. Do not assume full historical coverage exists just
because this skill now does.

## Links

`research-to-dna` (reaches the DECLINED verdict this starts from) ·
`devils-advocate-audit` (the interrogation this follows) ·
`childlike-wonder` (the mirror-image lens, for things judged real) ·
`dual-lens` (invokes this as Stage 3 when the subject is source material) ·
`nine-miss-truths` (runs before a verdict; this runs after) ·
`anomaly-triage` (the hard boundary — real threats escalate, they do not get mined) ·
`FABRICATION_PATTERNS.md` (this skill's companion registry, same directory)
