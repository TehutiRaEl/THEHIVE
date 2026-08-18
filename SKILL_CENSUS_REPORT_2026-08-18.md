# Skill Census — 2026-08-18 (Phase 1b re-check)

Origin: this run answers v1 plan's Phase 1b ("skills vs. commands split"), flagged
**could-not-verify** by a prior plan-reality-audit and never re-checked since. This is the
real re-check, run against the current repo state (branch
`docs/phase1b-skills-audit-2026-08-18`, off `main` @ `78b268a`), not a restatement of the
2026-07-14 report (`SKILL_CENSUS_REPORT_2026-07-14.md`, which counted 51 skills and is now
five weeks stale).

## Headline verdict, stated first

**CLAUDE.md's claim needs correcting on one factual point and is still substantially true on
the other.**

1. **Factual correction: System A's list is not a skill set.** CLAUDE.md names System A's
   "own skill set" as `brain-query`, `hive-status`, `colony-zoom`, `link-nodes`,
   `merge-verify`, `remember`, `role-deliver`, `soul-check`, `update-nav`. All nine of these
   exist **only** as `.claude/commands/*.md` slash-commands — there is no
   `.claude/skills/*/SKILL.md` for any of them. They are a real, working command set (each
   one either calls the `/v11` API directly or dispatches to a named subagent in
   `.claude/agents/`), just not skills in the mechanism CLAUDE.md's own sentence implies.
   System A's actual skill-shaped artifact is `.claude/skills/hive-memory.md/SKILL.md`
   (257 lines, no YAML frontmatter, its own "Skill ID: hive-memory" header format) — a
   single skill, not nine.
2. **"No cross-references between them yet" is still mostly true today, but has one real,
   working exception** that predates this pass and that CLAUDE.md doesn't mention: two
   System-B-era skills (`autonomous-hive-agent`, `checks-and-balances`) directly name and
   depend on System A's subagents (`constitutional-validator`, `colony-health-monitor`,
   `memory-librarian`, `knowledge-cartographer`, `hive-organism` — all in `.claude/agents/`,
   the layer that System A's commands like `/soul-check`, `/hive-status`, `/update-nav`
   dispatch to). That's a real, verified crossing of the System A/B boundary — through the
   agents layer, not skill-to-skill or skill-to-command directly.

## Method

Followed `.claude/skills/skill-census/SKILL.md`'s own documented method: list every
`SKILL.md`, extract `name:`, grep the whole repo (excluding `.claude/worktrees/`, which holds
disposable pocket-dimension clones, not canonical content) for each skill's name, and
separately hand-check the System A ⇄ System B boundary by name.

```bash
find .claude/skills -name SKILL.md | wc -l        # population
grep -rl "$name" --include=*.md --include=*.js ... # cross-reference count per skill
```

## Population: 83 SKILL.md files, ~80 real distinct invocable skills

83 files exist under `.claude/skills/`. Three are not real invocable skills:

- `.claude/skills/SOURCED_SKILLS_INDEX.md/SKILL.md` — a provenance manifest (no `name:`/
  `description:` frontmatter), documents how other skills were imported. Reference doc, not
  a skill.
- `.claude/skills/taste-skill-llms.txt/SKILL.md` — an `llms.txt`-style index pointing at the
  design-skill family. Also no real frontmatter.
- `.claude/skills/hive-memory.md/SKILL.md` — System A's memory skill, real and substantial
  (257 lines) but uses its own header convention, not the `name:`/`description:` YAML block
  every other skill uses.

One is a verbatim duplicate: `.claude/skills/imagegen-frontend-web/imagegen-frontend-web/`
nests a near-identical copy of its parent `SKILL.md` (988 lines vs. 991; the only diff is a
missing attribution footer) — a packaging artifact from the import, not two skills.

That leaves **~79 distinct, real, invocable skills** with proper frontmatter, up from 51 on
2026-07-14 (+28 in five weeks — governance/audit skills dominate the growth: `dual-lens`,
`childlike-wonder`, `fabrication-mining`, `founder-input-intake`,
`founder-directive-capture`, `checks-and-balances`, `autonomous-hive-agent`,
`branch-dissection`, `plan-reality-audit`, `wired-or-not`, `polymath-lens`,
`recursive-growth`, plus a `debug-issue`/`explore-codebase`/`refactor-safely`/
`review-changes`/`build-graph` cluster that uses capitalized `name:` values and a knowledge-
graph theme distinct from every other batch — looks like a fourth, separate import wave, not
System A or System B).

## System / era tagging

| Era | Skills (representative, not exhaustive — see full grep run for all 79) |
|---|---|
| **System A (second-brain / FastAPI harness)** | `hive-memory.md` only, as a skill. The other nine named items are `.claude/commands/*.md`, not skills. |
| **System B (genome / edge worker, 2026-07-14 origin)** | `fable-debugger`, `research-to-dna`, `session-harvest`, `pocket-dimensions`, `anomaly-triage`, `merge-readiness`, `nine-miss-truths`, `skill-census` |
| **System B, later governance/audit generation (2026-07-30 → 2026-08-08+)** | `devils-advocate-audit`, `dual-lens`, `childlike-wonder`, `fabrication-mining`, `founder-input-intake`, `founder-directive-capture`, `checks-and-balances`, `autonomous-hive-agent`, `hive-conductor`, `wired-or-not`, `branch-dissection`, `plan-reality-audit` |
| **Knowledge-graph cluster (distinct 4th wave, capitalized names)** | `Debug Issue`, `Explore Codebase`, `Refactor Safely`, `Review Changes`, `build-graph` |
| **General/imported — design, creative, dev-tooling (Wave 2, 2026-07-13 GitHub harvest)** | `algorithmic-art`, `brand-guidelines`, `brandkit`, `canvas-design`, `doc-coauthoring`, `internal-comms`, `slack-gif-creator`, `theme-factory`, `design-system`, `design-review`, `quick-design`, `redesign-skill`, `taste-skill` (+`-v1`), `gpt-tasteskill`, `stitch-skill`, `soft-skill`, `minimalist-skill`, `brutalist-skill`, `ux-design`, `ux-review`, `frontend-design`, `team-ui`, `image-to-code-skill`, `imagegen-frontend-mobile`, `imagegen-frontend-web`, `json-canvas`, `memory-graph-canvas`, `diagram-from-language`, `mcp-builder`, `skill-creator`, `skill-harvester`, `webapp-testing`, `web-artifacts-builder`, `claude-api`, `caveman`(+`-eli5`,`-stats`,`cavecrew`), `karpathy-guidelines`, `code-review`, `consistency-check`, `agent-harness`, `antigravity`(+`2.0`), `ultimate-protocol`, `output-skill`, `workflow-optimizer`, `pr-retrospective`, `review-delta`, `review-pr`, `threat-sandbox`, `recursive-growth`, `polymath-lens` |

## Real cross-reference count (grepped, not estimated)

Per-skill counts (files elsewhere in the repo, excluding worktrees, that mention the skill's
`name:` string) — full table generated and spot-checked; representative range:

- **0 references:** `antigravity-protocol`, `antigravity-protocol-v2`,
  `ultimate-protocol-simulator` — genuinely orphaned, same finding class as the 2026-07-14
  report's 7 orphans.
- **1 reference (self only, i.e. effectively orphaned):** the knowledge-graph cluster
  (`Debug Issue`, `Explore Codebase`, `Refactor Safely`, `Review Changes`) — each file only
  matches itself; nothing else in the repo names them.
- **Densest, hive-native, System-B-governance skills:** `agent-harness` (104 hits — mostly
  its own `assets/harnesses/*.json` fixture files, not real prose cross-references — treat
  this number with suspicion), `design-system` (83), `code-review` (65), `caveman` (55),
  `fable-debugger` (52), `dual-lens` (43), `session-harvest` (41), `research-to-dna` (37),
  `design-review` (36), `childlike-wonder` (35), `hive-conductor` (33).
- Caveat on the raw counts: several are inflated by the skill name being a common English
  word or matching an unrelated `/v11/*` API route name. Confirmed by hand: `remember` hits
  9 files, but every one of them is the phrase `/v11/memory/remember` (a Worker API route),
  **zero** are the `/remember` slash-command. This is exactly the kind of false-positive the
  method warns about — the raw grep count is a signal, not the verdict, per
  `skill-census/SKILL.md`'s own stated caveat.

## The System A ⇄ System B boundary, checked directly (the actual Phase 1b question)

Direct name-for-name grep, both directions:

**System B skill files mentioning System A's nine command names** (`brain-query`,
`hive-status`, `colony-zoom`, `link-nodes`, `merge-verify`, `remember`, `role-deliver`,
`soul-check`, `update-nav`): only `hive-memory.md/SKILL.md` itself mentions
`brain-query`/`link-nodes`/`remember`/`soul-check`/`update-nav` — and that's System A's own
memory skill documenting System A's own commands, not a cross-system reference. Every other
apparent "remember" hit is the false positive above. **Zero genuine skill→command
cross-references found.**

**System A command files (`.claude/commands/*.md`) mentioning any System B skill name**
(`fable-debugger`, `research-to-dna`, `session-harvest`, `pocket-dimensions`,
`anomaly-triage`, `merge-readiness`, `nine-miss-truths`, `skill-census`, `hive-conductor`,
`dual-lens`, `devils-advocate-audit`): **zero matches, all eleven.** Command files also don't
reference `.claude/skills/` generically at all (`grep -rl ".claude/skills" .claude/commands`
returns nothing), and no `SKILL.md` references `.claude/commands/` generically either.

**But the agents layer bridges the two systems already**, and this is real, verified, and
not mentioned in CLAUDE.md's current text:

- `.claude/skills/autonomous-hive-agent/SKILL.md:127-143` explicitly names and uses
  `hive-organism`, `colony-health-monitor`, `constitutional-validator`,
  `knowledge-cartographer`, `memory-librarian` — all five live at
  `.claude/agents/*.md`, and all five are also what System A's commands dispatch to
  (`/hive-status` → `colony-health-monitor`, `/soul-check` → `constitutional-validator`,
  `/update-nav` → `memory-librarian`).
- `.claude/skills/checks-and-balances/SKILL.md` repeatedly names `constitutional-validator`
  by name (6 occurrences) as its sibling skill, explicitly distinguishing what it audits
  (systemic authority distribution) from what `constitutional-validator` audits (per-change
  F-001–F-006 compliance).

So: **skill-to-command cross-referencing is still zero** (confirms CLAUDE.md's literal
sentence), but **skill-to-agent cross-referencing across the System A/B line is real and has
existed since at least `autonomous-hive-agent` and `checks-and-balances` landed** — this is
partial resolution CLAUDE.md hasn't caught up to describing. The founder's original "with no
cross-references between them yet" sentence should be updated to name this exception rather
than stand as flatly true.

## `.claude/commands/` vs `.claude/skills/` — overlap check

9 files in `.claude/commands/`, all listed in the task. One real overlap found:

- **`/merge-verify`** (command: "Verify a branch is safe to merge: check CI, run imports,
  test key endpoints, confirm no regressions") and **`merge-readiness`** (skill: "the
  formalized verify-PR-autofix-merge loop... watching an open PR for CI failures that need
  re-diagnosis and a re-push") cover the same capability — pre-merge CI verification — via
  two different mechanisms, never reconciled. `merge-readiness` is the more complete of the
  two (autofix + re-push loop; `/merge-verify` is check-only per its own description). This
  is the one concrete "same capability defined twice" case, not a fabricated one.
- **`/soul-check`** (command, dispatches to `constitutional-validator` agent) and
  `checks-and-balances` (skill) are adjacent but NOT duplicates — `checks-and-balances`
  explicitly self-describes as a sibling that checks a different thing (systemic authority
  distribution vs. per-change F-001–F-006 compliance), so this is a legitimately
  non-overlapping pair, correctly documented as such in the skill's own body.
- The other seven commands (`brain-query`, `colony-zoom`, `hive-status`, `link-nodes`,
  `remember`, `role-deliver`, `update-nav`) have no matching skill capability anywhere in
  `.claude/skills/` — cleanly distinct, no duplication.

## Honest verdict

- **Phase 1b's original "could-not-verify" flag is now resolved: verified, with a
  correction.** CLAUDE.md's description of System A's "skill set" is factually wrong (it's a
  command set, not skills) but its substantive claim ("no cross-references... yet") is
  correct in the narrow skill-to-command sense and incomplete in the broader
  system-boundary sense — the agents layer already bridges the two systems in two places
  (`autonomous-hive-agent`, `checks-and-balances`), built after CLAUDE.md's sentence was
  written and never folded back into it.
- **One real command/skill duplication exists** (`/merge-verify` vs. `merge-readiness`) and
  was not previously documented anywhere found in this pass.
- **This container could fully verify all of the above** — everything here is a direct grep
  or file read against the checked-out repo, nothing required live production access, so
  there is no "could not verify from this container" caveat to carry forward this time.
- **Not verified in this pass, flagged rather than guessed at:** whether any of the ~79
  skills or 9 commands are actually *invoked* in practice (vs. merely present and
  cross-referenced) — the skill-census method's own "active" bar includes invocation history
  from session logs/PR descriptions, which this pass did not exhaustively trace for all 79.
  The cross-reference counts above are a real, grepped signal, not a full activity audit.

Origin: this pass, 2026-08-18, run directly against `.claude/skills/`, `.claude/commands/`,
and `.claude/agents/` in `/home/user/THEHIVE` on branch
`docs/phase1b-skills-audit-2026-08-18`.
