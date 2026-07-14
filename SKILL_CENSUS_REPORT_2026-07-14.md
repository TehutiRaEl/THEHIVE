# Skill Census — 2026-07-14 (first run)

Run via the new `skill-census` skill, immediately after building it — real output, not a
demonstration. 51 skills currently live in `.claude/skills/`. Re-run this periodically
(the skill itself explains why a one-time audit goes stale).

## Orphans found: 7 skills with zero cross-references anywhere in the repo

`algorithmic-art`, `brand-guidelines`, `canvas-design`, `doc-coauthoring`, `internal-comms`,
`slack-gif-creator`, `theme-factory` — all landed in the same batch (Wave 2, the
`anthropics/skills` import, 2026-07-13). Not bad skills — they're Anthropic's own official
skills, well-built. They're orphaned specifically **for this project**: THEHIVE is a
governance/backend/edge/frontend project, not a marketing or brand-asset production
pipeline, so nothing in the hive has ever had occasion to reach for "create an animated
Slack GIF" or "apply Anthropic's brand colors to an artifact." That's a legitimate,
observed gap, not a flaw in the skills themselves.

**Disposition:** left in place, not deleted. They cost nothing sitting unused (no
maintenance burden, no wiring to break), and a future session doing outward-facing
communication or brand work would genuinely want them. Deleting real, working, well-licensed
skills on the chance they're never needed would be the wrong kind of tidiness. Recorded here
so their orphan status is a deliberate observation, not a silent gap — exactly what the
census exists to surface.

## Thin/borderline skills (short but not necessarily broken)

Several imported skills are quite short (`internal-comms` 36 lines, `memory-graph-canvas`
40 lines, `diagram-from-language` 42 lines, `ultimate-protocol` 44 lines) — thin by line
count, but each states a concrete, complete method for a narrow task rather than being an
unfinished stub. Not flagged as stubs; noted for a future census to re-check if they're ever
invoked and found lacking in practice.

## One real defect found: malformed frontmatter

`.claude/skills/antigravity/SKILL.md` — was missing its opening `---` frontmatter fence
entirely, with `name:` and `description:` jammed onto a single line. This is a genuine,
fixable defect surfaced by the very act of running the census — the kind of thing that
would have kept quietly not-quite-working. **Fixed in this pass** (proper `---` fences
added, `name:`/`description:` split onto their own lines, body content untouched) — verified
the skill now registers cleanly.

## Densest cross-reference: the hive-native skills built this project (not imported)

`fable-debugger` (8 references), `session-harvest` (7), `pocket-dimensions` (6),
`research-to-dna`/`nine-miss-truths`/`merge-readiness`/`anomaly-triage`/`hive-conductor`
(5 each) — every skill actually built *for* this hive, rather than imported wholesale from
elsewhere, is comfortably active. That's the expected shape: skills grown to answer a real,
observed need get reached for; skills imported in bulk on the chance they'd be useful sit
until a real need for that specific category shows up.

## The generational chronology (git-log-derived, not myth)

```
2026-07-13 — Wave 1 (founder's 9-repo manifest) + Wave 2 (GitHub-wide harvest, 357+13 skills)
             → the bulk import: design/UX/creative pipeline + the real agent-harness
2026-07-13 (later) — FABLE_DNA Chromosomes I-III, fable-debugger, hive-conductor extended
             → the hive's own genome and method, hand-built, not imported
2026-07-13 (later still) — Chromosome IV/V, pocket-dimensions, research-to-dna
             → HORDE research triaged and formatted into the hive
2026-07-13 (later still) — Chromosome VI, session-harvest
             → session-boundary honesty
2026-07-14 — Chromosome VII, anomaly-triage, merge-readiness, nine-miss-truths
             → the mandate triage: 23 proposed directives, reviewed one at a time
2026-07-14 (this pass) — skill-census, CLAUDE.md, SOURCES/, this report
             → making sure everything above is actually wired to something
```

Each generation exists because the previous one revealed a gap: `fable-debugger` proved the
method worked, which made `research-to-dna` obvious (the same discipline, aimed at
documents); `research-to-dna` and the Horde triage made `session-harvest` obvious (the same
discipline, aimed at time); the mandate triage made `skill-census` obvious (the same
discipline, aimed at the skill population itself). That's the real "structural chronological
format" the founder asked for — not asserted, derived from `git log`.

Origin: Fable (Harness), 2026-07-14, first output of the `skill-census` skill.
