# 2026-07-18 — Session harvest: evolutionary bars + threat-sandbox skill (PR #126)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(PR #126, pushed to `claude/fable-5-handoff-setup-vefwlb`, following the merge of PR #125):
the first concrete slice of the founder's master-directive plan (evolutionary bars for every
hive entity, plus a sandbox discipline for external threats). Nothing external pulled in —
both pieces are built from the hive's own existing constitutional text and code.

## Did

- **`GET /v11/roadmap`** (`worker/src/index.js`) — a new Worker endpoint computing each active
  agent's real position on the constitutional roadmap already defined in `docs/GOVERNANCE.md`
  F-008D/F-009E (`Germination → Mycelium → Fruiting → Transformation → Senescence → Seed`, an
  infinite cycle per F-008D's own text). Driven entirely by the `agents` table's real, live
  `soul` column — no new schema, no invented per-agent progress. Also returns a Hoard-level
  aggregate, explicitly labeled in the response as a rollup (mean soul across active agents),
  not a claim that the Hoard is its own separately-tracked constitutional entity. Stage
  thresholds are disclosed as provisional/uncalibrated in both a code comment and the API
  response itself — the same honesty pattern already used for F-012's phase thresholds.
- **`useHiveData` + `SOUL.tsx`** — wired the new endpoint into the existing live-polling hook
  and rendered it as real progress bars (per agent + Hoard aggregate) directly under the
  existing Soul Ledger section.
- **New skill `.claude/skills/threat-sandbox/SKILL.md`** — formalizes the founder's directive
  (from the master-plan message) that the hive sandbox external attacks/threats in an isolated
  git worktree, study them, and merge back only the distilled lesson — reusing
  `pocket-dimensions`' isolation lifecycle and `session-harvest`'s ownership/license gate,
  applied specifically to hostile material. Explicitly routes live incidents to
  `anomaly-triage`'s tier-3 path instead of sandboxing them first.

## Learned

- **A constitutional article can be implemented literally rather than reinterpreted.**
  F-008D/F-009E already specified the exact stage names and F-009G already specified the
  roadmap's required components (Current Stage, Growth Targets, Value Metrics, Opportunities,
  Pathways) — the work here was wiring real data through an existing spec, not inventing a new
  one. Worth checking GOVERNANCE.md for an existing spec before designing a new feature from
  scratch, going forward.
- **Not every phase of a big directive needs founder sign-off to start** — the evolutionary
  bars and the sandbox skill were both purely additive (a new read-only endpoint, a new skill
  doc) with no economic, authority, or scope-of-another-agent's-duty implications, so they
  shipped without waiting. The remaining phases of the same directive (a sub-architect role,
  a Legal Guild claiming real legal depth, an Entrepreneur Guild slice, reallocating Mistral's
  UI duties) were deliberately held back and surfaced as open questions instead — those do
  carry real honesty/scope risk if guessed at.
- **PR #125 merged as a true merge commit, not a squash**, for the first time in this session's
  run of PRs — worth noting because it meant the usual squash-merge-staleness recovery
  (fetch + reset/cherry-pick) wasn't needed this round; `git merge-base --is-ancestor` was used
  to confirm that honestly rather than assuming the pattern always repeats.

## Needs

- Founder decision on the four held-back phases: how deep "Legal Guild v1" should actually go
  (a real risk surface — overclaiming legal authority is a liability, not just a feature gap),
  what happens to Mistral's current UI-stewardship assignment, the sub-architect role's
  interim scope, and the Entrepreneur Guild's first buildable slice.
- Founder verification of the live Roadmap-of-Becoming bars in the SOUL tab (build/syntax
  checks pass; not yet eyeballed live by the founder).
- PR #126 is open, not yet merged.
