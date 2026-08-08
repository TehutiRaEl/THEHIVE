---
name: childlike-wonder
description: >
  The generative half of the hive's dual-lens doctrine — asks what a thing could BECOME,
  after devils-advocate has interrogated what could break. Use when a design decision is on
  the table, when a feature works but feels smaller than it should, when the founder asks
  "what else could this do", or when an audit has produced only risks and the possibility
  side is missing. Runs the 5-step expansion from memory/philosophy/childlike-wonder.md.
  Deliberately NOT for routine bug fixes, verification passes, or anything where the answer
  is already known and just needs doing — wonder applied to a typo fix is overhead. Never
  run alone on an architectural decision; the doctrine requires both lenses (see dual-lens).
---

# childlike-wonder — what could this become?

## Why this skill exists at all

`memory/philosophy/dual-lens-framework.md` has said this since it was written:

> *"Every architectural choice passes through both lenses before implementation… Neither
> lens is optional. A decision made with only one lens is incomplete."*

And yet: the hive built `devils-advocate-audit` as a real skill, and **never built this
one.** For however long that was true, every decision made "by the framework" was made with
one lens — the critical one. A hive that only ever asks what could break optimises toward
never being wrong, which is not the same as being good.

This skill is not new doctrine. The 5 steps below are lifted directly from
`memory/philosophy/childlike-wonder.md`, which already existed. Only the skill wrapper is
new.

## The 5 steps

Run in order. Each is a real question, not a prompt to be enthusiastic.

1. **If this worked perfectly, what becomes possible?** Not "it works" — what does working
   *unlock* that could not exist before?
2. **What if the hardest constraint were removed?** Name the constraint explicitly first,
   then answer. Often the constraint turns out to be assumed rather than real.
3. **What does a 10-year-old think this should do?** The naive expectation is frequently the
   correct product instinct, stripped of what experts have learned to tolerate.
4. **What would make someone gasp in delight?** If nothing would, the design is adequate and
   knows it. That is worth noticing.
5. **What connection to another domain is invisible to experts here?** The link a specialist
   cannot see because they are standing too close.

## Producing a usable answer

**Wonder is not brainstorming.** The output is not a list of everything imaginable.

- Pick the **one or two** strongest expansions and say why they are strongest.
- For each, name **the smallest real step** toward it — wonder that produces no next action
  is decoration.
- Say plainly when an expansion is **currently blocked** and by what. "This needs the Oracle
  box provisioned" is more useful than silently dropping the idea.
- If genuinely nothing expands — the thing is a small fix and should stay one — **say that.**
  Manufacturing significance is the exact failure this project's agents are instructed to
  avoid elsewhere.

## Hard boundaries

- **Never invent hive mythology.** Names, lore, and Codex canon are founder territory
  (`FABLE_DNA.md` Chromosome V). Wonder proposes capabilities, not new gods.
- **Never let an expansion become a commitment.** This skill produces possibilities; the
  founder decides what gets built. An idea surfacing here is not an idea approved.
- **Never use wonder to soften a real finding.** If devils-advocate found a genuine problem,
  the answer is not "but imagine if it worked." Both lenses report; neither cancels the
  other.
- **Never skip the constraint in step 2.** "What if there were no limits" is a daydream;
  "what if D1 storage were not a constraint" is a design question with a real answer.

## Honest limits

Procedural skill, no machine enforcement — nothing can detect that a decision skipped the
generative lens. The one structural safeguard is `dual-lens`, which refuses to pass a
decision reviewed by only one side, and that gate is itself procedural. Stated plainly
because this repo has a measured history of doctrine with no mechanism behind it.

## Links

`dual-lens` (the binding gate — normally invoke that, not this alone) ·
`devils-advocate-audit` (the other lens) · `fabrication-mining` (this skill's mirror for the
discard pile — asks "what did the reach for this reveal" about things already judged false,
rather than "what could this become" about things judged real) · `polymath-lens` (cross-domain
synthesis on finished deliverables — related to step 5 but for closing out, not deciding) ·
`memory/philosophy/childlike-wonder.md` (source doctrine)
