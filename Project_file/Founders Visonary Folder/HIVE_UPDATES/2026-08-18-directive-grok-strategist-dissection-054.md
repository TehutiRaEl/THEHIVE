# Branch Dissection — `grok-strategist-main` — 2026-08-18

Full `.claude/skills/branch-dissection/SKILL.md` pass. This is branch 3 of the session's
standing 7-branch dissection queue (branch 1, `feature/gamified-ui-components`, and branch 2,
`feature/voxel-world`, already dissected). Starting facts taken from `BRANCH_AUDIT_2026-08-18.md`
(not re-derived) as the entry point, then verified independently rather than trusted at face
value — see headline finding below for why that mattered here.

**Method:** read-only, Tier 1/2 boundary (this is a doc, not a merge). No delete, no merge, no
push to `grok-strategist-main`. `git fetch origin grok-strategist-main feature/gamified-ui-
components feature/voxel-world`, then `git diff --stat` against all three candidate relatives
per this task's explicit instruction (lesson learned from branch 2: diff against the nearest
sibling, not reflexively against `main`), plus tree-hash comparison, commit-log comparison, and
a full GitHub Actions check via `mcp__github__actions_list`/`actions_get`. Baseline: `origin/main`
at `f2ba143` (2026-08-18).

**Branch 1's own dissection output file could not be located anywhere in this repo** — not on
`main`, not in any of the three local `.claude/worktrees/` checkouts, not in git history under
any commit message. Only its *findings*, summarized secondhand, survive in `CLAUDE.md`'s "What
is NOT yet reconciled" section (the TesseractChamber/HiveDashboard/ColonyCard/ConstitutionHall/
MemoryVault verdict) and in branch 2's dissection file, which references it. This dissection
relies on that secondhand summary for branch 1's verdicts and flags the missing primary source
as an open item below — it is not this dissection's job to redo branch 1's work, but a future
session should not assume the file exists just because two other documents describe having read
it.

## Headline finding: this branch carries zero unique file content — it is `feature/gamified-ui-components`, republished under a different name

```
git rev-parse origin/feature/gamified-ui-components^{tree}  → 56793bff6afd494df2b9dc0729259a15d0d0f488
git rev-parse origin/grok-strategist-main^{tree}             → 56793bff6afd494df2b9dc0729259a15d0d0f488
```

Identical tree hash — not "very similar," cryptographically the same file content, same
directory structure, down to the byte, across all 3,510 tracked files. `git diff --stat
origin/feature/gamified-ui-components...origin/grok-strategist-main` returns **empty**. The only
difference between the two refs is two commits sitting on top of `grok-strategist-main`
(`ed2ea3f` "Merge pull request #58 from TehutiRaEl/main" and `63bbde3` "Merge pull request #92
from TehutiRaEl/main") — both are merge commits pulling `main` into `grok-strategist-main`, and
neither changes the resulting tree at all (their net diff is zero; `gamified-ui-components`
reached the same final tree via its own equivalent merge, "Merge pull request #96," one commit
later on 2026-07-16).

This means the raw `git diff --stat main...grok-strategist-main` this task's instructions warned
about would have been dramatically misleading here too, in the opposite direction branch 2 showed
— not "inflated by 9x" but **100% inflated**, since it fails outright (`fatal: no merge base`,
confirmed) and any file-status diff against `main` would report the entire 3,510-file tree as
"added," when the true unique-to-this-branch content is **zero files**.

**Practical consequence: every file-level verdict branch 1 already reached for
`feature/gamified-ui-components` — `TesseractChamber` absorbed into `main`, `HiveDashboard`/
`ColonyCard`/`ConstitutionHall`/`MemoryVault` real-but-unabsorbed, the founder's confirmation this
was real wanted work needing a re-skin not a rebuild — applies to `grok-strategist-main` without
re-deriving it.** This dissection does not re-verdict that content; re-running the same
verdict-per-piece pass against byte-identical files would be pure duplication of branch 1's real
work, not independent confirmation of anything.

## What actually is specific to this branch (not covered by branch 1)

### 1. `.grok/memory.md/Sovereign Strategist` — Grok's own session-continuation memory log
**Verdict: absorb (as historical record), not as active continuity doc.** Present in the tree
identically on both branches (so not literally unique to `grok-strategist-main` either — but it
*is* new content branch 1's known summary never mentions, and its subject matter is this
specific branch by name, so it belongs logged here). Dated 2026-07-08, author "Grok (Sovereign
Strategist)." Its own opening lines are worth quoting directly because they document a real
operational failure candidly, in the hive's own multi-agent team's words:

> "In Session 1, I built foundational files in a local sandbox at `/home/workdir/artifacts/
> THEHIVE` on branch `grok-strategist-main`. The branch was NOT pushed to GitHub before the
> session ended — the work existed only in the container environment. Claude (System Architect)
> bridged the content into the shared repo... **Key lesson: Always push to origin before the
> session ends. Local sandbox work is lost on container teardown. Push early, push often — even
> WIP commits.**"

The file goes on to describe Grok's self-declared role ("Sovereign Strategist" — market
intelligence, gap analysis, roadmap prioritization, constitutional stress-testing, dual-lens
synthesis) and a table of files it *believed* it built vs. what Claude's bridge actually needed
(several were redundant with Claude's already-more-complete versions). This is a real, useful
artifact: an early precedent for exactly the failure mode this session's own harness (routines,
`send_later`, session-boundary harvest) now exists to prevent, from a different agent's own
voice. Worth folding a pointer into `FABLE_DNA.md` Chromosome VI (session-boundary harvest) or
`.claude/Fable_memory.md` as precedent, not worth resurrecting as an active role — no evidence
"Sovereign Strategist" as a standing role survived past this one entry.

### 2. `.mistral/` directory — a third agent's skill/instruction set (Mistral, frontend/UI role)
**Verdict: needs a second look.** Present identically on both branches (again, not unique to
this branch specifically, but not covered by branch 1's known summary either): `.mistral/
INSTRUCTIONS.md`, `SESSION_START_WORKFLOW.md`, `SETUP_SUMMARY.md`, and nine `.mistral/skills/*`
directories (canvas, canvas-react, data-visualization, deep-research, internal-search,
mistral-self-knowledge, project-chats, skill-creator, userLibrary, vibe-work-onboarding).
Confirms the Grok memory file's own claim of a three-agent team (Claude/backend, Mistral/
frontend, Grok/strategy) was real infrastructure, not just narrative — an actual second AI
vendor's tooling lived in this repo at this point in its history. Not read in full here (out of
this dissection's scope — it belongs to whichever future pass handles the gamified-ui-components
lineage's full content, since it is identical there too); flagged so it isn't mistaken for
something unique to `grok-strategist-main` that would be lost if this branch alone were deleted.

### 3. `worker/src/index.js` — checked specifically per this task's instructions
**Verdict: not a regression, stale-but-safe.** Byte-identical to `feature/gamified-ui-
components`'s copy (0-line diff) — the same copy branch 2's dissection already confirmed carries
the real hardening (`rateLimitOk` 30 POSTs/IP/min, `tokenOk` write-endpoint gating,
`/admin/d1-export` backup route, `WORKER_ADMIN_KEY`-gated admin surfaces). Diffed against
`main`'s current copy: 617 lines here vs. 3,945 lines on `main` — an old, much smaller snapshot
that simply predates most of the `/v11` route surface `main` has grown since, not a rollback of
any protection that existed at the time. No security concern; do not copy this file forward as a
"newer" or "more complete" version of anything, same standing rule branch 2 already established
for this lineage.

### 4. `backend/core/wallet.py` — checked given automaton's known history of a real wallet-key
   issue elsewhere in this repo
**Verdict: not a regression, not unique to this branch.** Present, generates private keys via
`secrets.token_hex(32)` (not hardcoded), stores them in plaintext in SQLite by design — an
8-line diff against `main`'s current copy, meaning this is essentially the same implementation
`main` already carries, not a different or weaker one. This is a pre-existing System-A design
choice (plaintext key storage in a local dev DB) that predates and is unrelated to this branch;
not a new finding this dissection is surfacing, just confirming it isn't a divergent risk here.
`automaton/` (where the actual founder-reviewed wallet-key gap was found and closed) is **absent
entirely** from this branch's tree — this snapshot predates `automaton/`'s addition to the
lineage, same pattern branch 2 found for its own missing content.

### 5. Secret scan across the full 3,510-file tree
**Verdict: clean.** Grepped for common API-key/token shapes (`sk-…`, `AIza…`, `xox[baprs]-…`,
PEM private-key headers) across every file in the branch. Every hit was a legitimate false
positive — skill documentation and a literal `secret_scanner.py` test/reference file inside
`skills-library/`, not a real credential. `.env.local.example` and `.env.example` contain only
placeholder values (`change_this_to_a_random_64_char_string`, etc.), consistent with `main`'s
current practice.

## Genuinely new, not-yet-flagged finding: this branch is a live target of an active GitHub Actions workflow on `main`

`.github/workflows/grok-bridge.yml` exists on `main` today (`f2ba143`, current HEAD) — "Grok
Bridge — Sandbox Sync Receiver." It is a `repository_dispatch` (event type `grok-push`) /
`workflow_dispatch` receiver that:

- checks out `grok-strategist-main` by name (`ref: grok-strategist-main`) using
  `secrets.PAT || secrets.GITHUB_TOKEN`,
- writes arbitrary files decoded from a webhook payload's `client_payload.files` array (base64
  content, path taken from the payload with only minimal traversal guarding — an absolute-path
  check with a logic gap, `not path or "/" in path and path.startswith("/")`, which due to
  operator precedence only actually skips a path that is *both* absolute *and* contains a
  slash elsewhere, i.e. skips essentially every real absolute path but would not catch a crafted
  edge case; `..`-traversal is checked separately and correctly),
- runs `git add -A` and pushes the commit **directly to `grok-strategist-main`, with no PR, no
  review** (`contents: write` permission, direct `git push origin grok-strategist-main`).

**This means `grok-strategist-main` is not a dead, purely-historical branch the way `feature/
gamified-ui-components` and `feature/voxel-world` are — it is the live, named write target of a
dormant-but-still-present automated sync mechanism on `main` itself.** Checked via
`mcp__github__actions_list` (`list_workflow_runs` for `grok-bridge.yml`): **exactly one run,
ever** — `run 28968829699`, 2026-07-08, triggered by manual `workflow_dispatch` with
`test_mode`, which took the `skip=true` branch and made no commit. It has never actually fired
on a real `grok-push` `repository_dispatch` event. The receiver is real, wired, and reachable by
anyone holding a token with `repo` scope (the trigger event itself is not public-facing — it
requires dispatch API access, which already implies write-level trust), but has sat completely
unused since the day the branch was created.

**This is the security-relevant finding this dissection is required to flag.** Not because it
has ever misfired — it hasn't, not once — but because:
1. **Deleting `grok-strategist-main` without also retiring or repointing `grok-bridge.yml` would
   leave a workflow on `main` referencing a nonexistent branch** — the next real `grok-push`
   dispatch (however unlikely) would fail at the checkout step, not gracefully.
2. **The bypass-review, direct-push design is a real standing risk profile independent of
   whether it's ever used** — any credential capable of firing `repository_dispatch` with type
   `grok-push` can write arbitrary files to a real branch in this repo with no human in the
   loop, and the only thing preventing exploitation today is that nothing has sent that event
   type since the test dispatch. This is worth a founder decision, not a silent pass, regardless
   of this dissection's outcome for the branch's file content.
3. No prior branch-dissection pass (branches 1 or 2) or `BRANCH_AUDIT_2026-08-18.md`'s quick
   pass surfaced this — it would not show up in any file-diff-based method, only in a workflow-
   file read plus an Actions-API check. Flagging it here specifically because grepping
   `.github/workflows/` for the branch name under review is now a check this dissection is
   adding to its own method for the remaining 4 branches in the queue.

## Verdict summary

| Verdict | Piece |
|---|---|
| already covered by branch 1 (byte-identical, no re-verdict needed) | The entire 3,510-file tree — same content as `feature/gamified-ui-components` |
| absorb (as historical precedent, not active role) | `.grok/memory.md/Sovereign Strategist` — Grok's own session-loss lesson, worth citing in session-boundary-harvest doctrine |
| needs a second look | `.mistral/` — a third vendor's real skill/instruction set, not previously catalogued by name in any dissection so far; out of this pass's scope to fully read |
| not a regression, not unique | `worker/src/index.js` (stale-but-hardened, same as branch 2's finding), `backend/core/wallet.py` (matches `main`'s existing design) |
| clean | full-tree secret scan |
| **security-relevant, flagged for the founder** | `.github/workflows/grok-bridge.yml` — live, unreviewed, direct-push receiver still wired to this branch by name, unused since 2026-07-08 but not disabled |

## Lens pass 1 — `devils-advocate-audit`

1. **Single point of failure** — a future session trusting "tree-identical to gamified-ui-
   components, nothing to do here" at face value would miss `grok-bridge.yml` entirely, because
   that finding lives in `.github/workflows/`, not in the branch's own tree diff. Tree identity
   answers "what files does the branch carry," not "what still points at the branch's name."
2. **Hidden assumptions** — this task's brief itself assumed branch 1's dissection file exists
   and is readable ("see...the earlier branch-1 directive"); it does not exist anywhere in this
   checkout. The assumption that a cited prior artifact survives is exactly the kind of thing
   this skill's own doctrine (a founder correction/answer held only in one session's context
   dies with that session) warns about — and it happened to a dissection finding *about*
   session-continuity, which is a pointed enough coincidence to name explicitly.
3. **Blast radius if this branch's content silently vanished** — for file content: zero, it's
   fully redundant with `feature/gamified-ui-components`. For the branch *ref itself*: real but
   narrow — `grok-bridge.yml`'s checkout step would start failing the next time (if ever) a real
   `grok-push` dispatch fires, which is a silent-until-triggered failure mode, not an immediate
   one.
4. **Who is harmed by a wrong verdict** — recommending deletion here without flagging
   `grok-bridge.yml` would hand a future session (or an automated cleanup pass acting on this
   dissection's "recommend deletion" language) a plausible-looking reason to delete a branch a
   live workflow still targets, breaking that workflow the next time it's actually used.
5. **What breaks at an unusual path** — the exact unusual path is "someone or something actually
   sends a `grok-push` `repository_dispatch` event for the first time since 2026-07-08." Nothing
   in this repo's current CI would catch that failure before it happens; it would surface as a
   failed Action run with no other signal.
6. **What does an attacker do with this** — the realistic threat isn't public exposure
   (`repository_dispatch` needs `repo`-scoped write access already, which implies existing
   trust) but privilege *concentration*: today, `grok-bridge.yml` is one more path that turns
   "has a PAT with dispatch rights" into "can push arbitrary files to a real branch with zero
   review," alongside whatever other write paths already exist. Worth an inventory of how many
   such bypass-review paths exist across `.github/workflows/*.yml`, not just this one — out of
   this dissection's scope, flagged as a question below.
7. **What's never shown** — the workflow's own commit author is `grok-bridge[bot]
   <grok-bridge@sovereign-hive.local>`, a synthetic identity with no real GitHub account behind
   it. If it ever did fire, whatever it committed would read as an automated, seemingly-verified-
   looking commit with no human accountability trail beyond "whoever held the PAT."
8. **What if a dependency disappears** — the workflow depends on `secrets.PAT` optionally
   falling back to `secrets.GITHUB_TOKEN`; if `PAT` is unset, the default `GITHUB_TOKEN`'s scope
   may or may not be sufficient to push to a non-default branch depending on repo settings — not
   verified here (would require an actual dispatch to observe, which this dissection deliberately
   does not trigger).
9. **Simpler path to the same outcome** — if Grok's cross-session file-sync need is still real,
   a PR-based bridge (open a PR from the payload instead of pushing directly) would give the
   same capability with a review gate, at the cost of requiring a human merge step. Worth raising
   as an option rather than assuming the direct-push design was deliberate risk acceptance.
10. **Could this be verified rather than assumed** — yes, and was: tree-hash equality is
    cryptographic proof, not a visual diff estimate; the workflow's run history was pulled from
    the real GitHub Actions API (one run, test-mode, no real dispatch ever sent), not inferred
    from the workflow file's existence alone.

## Lens pass 2 — `childlike-wonder`

- **The real "Sovereign Strategist" idea, not the leftover file.** Grok's self-described role
  (market intelligence, gap analysis vs. other multi-agent frameworks, roadmap prioritization,
  constitutional stress-testing) maps almost exactly onto what `devils-advocate-audit` +
  `hive-conductor` + the founder's own strategic-review habits do today, just pre-dating all of
  them by five weeks. Worth noting as a real, independently-arrived-at precedent for a role the
  hive re-invented later under different names — not evidence to resurrect a "Grok agent," but a
  data point that this shape of role was wanted early and repeatedly.
- **A real cross-vendor bridge pattern worth designing properly, not living as a dormant
  receiver.** `grok-bridge.yml`'s actual goal — let an agent working in an isolated sandbox
  (Grok, or any future non-Claude agent) sync its work back into the shared repo without losing
  it to container teardown — is exactly the problem `pocket-dimensions` and `session-boundary-
  harvest` solve for Claude sessions today. The smallest real step: route a future version of
  this bridge through a PR (as `pocket-dimensions`' own lifecycle already models —
  create → work → review → merge) instead of a direct push, and it becomes reusable
  infrastructure for *any* external-agent sandbox sync, not a single-purpose, single-branch,
  never-actually-fired receiver.
- **A "grep the workflows for this branch's name" step, added to the dissection method itself.**
  This finding came from one grep this dissection ran that neither branch 1 nor branch 2's
  passes are recorded as having run. Worth proposing as a standing addition to
  `branch-dissection/SKILL.md` for the remaining 4 branches — cheap to run, and this pass shows
  it can surface something a pure file-diff method structurally cannot.

## Open questions for the founder — genuinely unclear, not code-answerable

1. **Is `grok-bridge.yml` still wanted, in its current direct-push-no-review form?** This
   dissection does not recommend disabling it unilaterally — that's a real, live workflow change,
   not documentation, and outside this pass's Tier 1/2 scope. But the founder should decide
   whether it stays as-is, gets converted to a PR-based flow, or gets retired alongside whatever
   disposition `grok-strategist-main` itself gets.
2. **Should `grok-strategist-main`'s disposition be decided together with `feature/gamified-ui-
   components`'s (since their content is now proven identical), or does the live workflow
   reference make it a separate case that must stay a real branch regardless of what happens to
   the other two?** Branch 2's dissection already asked whether *its* disposition should fold
   into branch 1's; this pass adds a third branch to that same question, but the workflow
   dependency means `grok-strategist-main` cannot simply be deleted the moment gamified-ui-
   components's absorption work is done, the way branch 2 was framed — this one has a live
   consumer.
3. **Where is branch 1's actual dissection output file?** Not found anywhere in this repo despite
   being cited by name in this task's own brief and by branch 2's dissection. Either it was
   written somewhere never committed (a local-only file, lost the same way Grok's own memory
   file describes losing work), or it exists in a PR or worktree this session didn't have access
   to. Worth the founder confirming which, since a third dissection now depends on a document
   that may not actually exist as a retrievable artifact — which, if true, is the exact
   information-loss failure this whole skill was built to stop.
4. **Is the `.mistral/` skill set (Mistral AI, frontend/UI role) still relevant to anything active
   in this repo, or is it purely historical alongside `.grok/`?** Not read in full here — this
   pass only confirmed it exists and is real, not what's in it or whether any of it should be
   absorbed.

## What this dissection does NOT recommend

No merge, no PR against `grok-strategist-main`, no deletion, no change to `grok-bridge.yml`. Per
the skill's hard boundary, deletion is only appropriate once everything real has been gathered,
absorbed/adapted, and logged — this file is that log for `grok-strategist-main`. Its file content
needs no separate absorption work (it's already covered by whatever branch 1's absorption plan
does for `feature/gamified-ui-components`), but its live workflow dependency means this branch's
ref cannot be treated as a simple "safe to delete once absorbed" case without a founder decision
on `grok-bridge.yml` first — a meaningfully different disposition than branches 1 or 2 reached.
