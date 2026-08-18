# Founder directive — Kai El self-training research, then the architect-agent evolution

**Date:** 2026-08-10
**Captured by:** session continuing `claude/provider-failure-queens-orchestrator-atvpaz`
**Why this file exists:** `founder-directive-capture`'s standing rule. Continues the
same day's thread as `HIVE_UPDATES/...-agent-roster-akosha-naming-kai-el-scope-050.md`
(D1 headroom, Akosha's naming, the Kai El brain scoping) rather than restarting it.

## 1. Kai El training his own model — research discussion, not a build

The founder asked to research how Kai El could eventually train himself and "become
its own model rather than just an agent." This was explicitly a research/discussion
request — nothing was built from it. Findings, stated honestly:

- Kai El today is not a model at all — a name for a system prompt sent to whichever
  provider (Claude/Groq/Mistral/Workers AI) answers. No weights belong to him.
- Claude cannot be fine-tuned — Anthropic does not release weights. A real "Kai El
  model" would have to be built on an open-weight base (Mistral's open models, Llama,
  Qwen), a different lineage than the providers he talks to today, not a customized
  version of them.
- Training from scratch is not realistic for this project — stated plainly rather than
  left as an implied someday. The realistic technique is LoRA/QLoRA fine-tuning of an
  existing open model.
- A staged path was laid out: (1) accumulate real data — already happening via Phase
  A's `decision_log`/`training_samples`; (2) curate/label, since `eligible` defaults to
  0 on purpose; (3) a small experimental fine-tune via a *hosted* provider (Mistral's
  own fine-tuning API, Together.ai, Fireworks) rather than self-hosted GPU infra,
  since none exists; (4) rigorous evaluation against the baseline — a fine-tune can
  come out worse, not better, and this step is the one hobby projects skip; (5) decide
  on inference hosting only if evaluation actually shows improvement.
- Two honest blockers named directly: real usage volume today is too thin to fine-tune
  on yet, and **any pipeline that pays for a training run is exactly `KAI_FINANCIAL_
  AUTONOMY` territory** — the switch built this session and deliberately left
  unbuilt. Self-training and financial autonomy are the same open decision, not two.

Founder response: **"log it"** — logged here as the record; no further action this
pass. Recommended next real step, if pursued: a founder review pass over what's
already accumulating in `training_samples`, since everything past that is blocked on
data volume and the financial-autonomy decision, not on anything technical.

## 2. Kai El's first evolution — a full autonomous architect agent

The founder then asked to design Kai El's "first evolution into a full autonomous
architect agent." Real exploration (not assumption) found this capability already
exists in a limited form: Kai El's chat replies starting with `PROPOSAL:` already
create real `hive_proposals` rows (`worker/src/index.js:2762-2780`, this is literally
Ptah's job) and already flow through the real governance chain (`queenDecide()`/
`elderCouncilVeto()`). The gap: the proposal body was prose only, never actionable —
a human had to manually turn it into a real change. Separately, `ACTION_ALLOWLIST`
permits only 3 narrow actions (rerun CI, open an issue, dispatch 2 named workflows) —
nothing like "change code" exists as an executable action, and `MANDATE_TRIAGE.md:37`
explicitly flags automated merge loops as conflicting with the founder-only gate
unless deliberately bounded.

Three scoping questions were put to the founder directly, given how much each changes
the design, and answered:

1. **What should an architect proposal contain?** → **Real code diffs, human-applied.**
   Kai El drafts an actual reviewable diff; a human (the founder, or a Claude Code
   session) still performs the real commit/PR. He never touches the repo directly.
2. **Governance path?** → **Unchanged** — the same `queenDecide()`/`elderCouncilVeto()`/
   founder-decide flow as every proposal today. No constitutional change.
3. **Ladder placement?** → **Stage 3 (`KAI_TAB_DRAFT`) made real**, not a new switch.
   Off by default; inert until the founder flips that existing stage.

## What shipped, same session (plan mode → approved → built)

Real infrastructure and code, not a design document alone:

- **Schema**: `hive_proposals` (production `thehive-queen`) gained `diff`,
  `diff_files`, `diff_check` columns — applied live via the Cloudflare D1 connector,
  mirrored at `worker/schema/hive-proposals-diff.sql` for reproducibility.
- **`fetchRepoFile()`** (`worker/src/index.js`) — fetches a target file's real current
  content from GitHub's public raw API before Kai El drafts a diff against it, since
  the Worker's `ASSETS` binding only serves `docs/` and he cannot otherwise see the
  repo's real content. Solves the real risk of him guessing at line numbers.
- **The `PROPOSAL:` marker path extended** — when the founder names a `target_file`
  and `KAI_TAB_DRAFT` is on, real file content is fetched and included in his prompt;
  he's instructed to follow `PROPOSAL: <title>` with a fenced ` ```diff ` block.
  `extractDiffBlock()` parses it; a missing/malformed block degrades to today's
  prose-only behavior rather than throwing. **Explicit v1 scope limit**: the founder
  names the file — Kai El never self-selects one across the repo.
- **A new GitHub Action** (`architect-proposal-check.yml`) dry-run applies
  (`git apply --check`) each pending diff — the only place that honestly can, since
  the Worker has no git — and posts the real result back via a new founder-key-gated
  `POST /v11/proposals/:id/diff-check` route that writes only that one column.
- **`ProposalsPanel.tsx`** now renders the real diff (collapsed) and its real
  `diff_check` status, so the founder reviews an actual diff and its actual
  applicability rather than prose describing an intention.
- **Closes the loop with Phase A** — a diff-carrying proposal also logs to Kai El's
  own `decision_log` at `risk_tier: 'high'`, using the enforcement already built that
  refuses a high-risk row without both a real reason and a real handling plan.

**Explicitly not built, matching the founder's own answers:** no change to
`ACTION_ALLOWLIST`; no autonomous PR creation; no autonomous merge (still pure GitHub
branch protection); no Roadmap/Venture Planner/Project tab UI wiring (Phase B, still
separately scoped, still needs its own risk-classification round).

**Verified:** `node --check` clean; worker suite 189 → 205 tests, all green (16 new);
mutation-tested (3 real mutations caught: empty-diff guard, leading-slash strip,
404-specific messaging — each restored and re-verified); a real clean diff and a
real deliberately-broken diff were both dry-run applied against an actual git
checkout to prove the Action's core logic in both directions, not just read;
frontend `tsc --noEmit` unchanged from the pre-existing baseline (one deprecation
warning in `tsconfig.json` itself, confirmed present before this change via
`git stash`, zero new errors in `ProposalsPanel.tsx`). Level: **tested**, not
verified-live — live confirmation owed post-merge (a real proposal with a real diff,
a real Action run, a real `diff_check` value surfacing in the panel).

Full design plan: `/root/.claude/plans/well-that-s-good-log-noble-key.md` (approved
via plan mode this session).
