# THEHIVE — Unified Forward Plan v2 (reconciling a month of real, undocumented work)

*Supersedes: `memory/planning/2026-07-19-unified-forward-plan.md`. That plan is not wrong
about anything it says — a real `plan-reality-audit` run against it (2026-08-18, full report
kept as `Project_file/Founders Visonary Folder/HIVE_UPDATES/2026-08-18-directive-plan-
reality-audit-052.md`) confirmed most of its phase-by-phase claims still hold — it is simply
silent about roughly a month of real, shipped, merged work (PRs #172–#176) that happened
after it was written. This document is a genuine refresh, not a rewrite: every still-open
phase from v1 carries forward unchanged below except where real new evidence updates it.*

## Context

The founder asked this session to work autonomously for 2-3 hours, directed by the founder's
own real vision/scope documents. The first real check against those documents found the
committed master plan itself had gone stale — this file is that reconciliation, done for
real (`plan-reality-audit` skill, built and run today) rather than assumed necessary.

## What changed since 2026-07-19 — real, shipped, none of it in v1

All of the following merged to `main` today (2026-08-18), verified via `git log`/`npm test`,
not assumed:

- **The venture capability-gap + sandbox system.** 9 real venture repos attached with push
  access (7 distinct ventures — `herDao`+`DispaFrontend` and `pipeline369-scraper`+`TheCopy`
  are each one venture across two repos), a full manifest/constitution/protocol scaffold
  pushed to a new `TehutiRaEl/venture` repo, a `venture_capability_gaps` D1 table + routes
  (mirrored into real GitHub Issues), and a `venture_sandbox_runs` table +
  `.github/workflows/kai-sandbox-run.yml` — Kai El can now genuinely build inside a venture
  repo on a GitHub Actions runner, always landing as a branch + real PR, never a direct push
  to that repo's main.
- **The sandbox engine is `automaton`, adapted, not a new build.** `automaton/config.js` got
  a `repoRoot` override (`AUTOMATON_REPO_ROOT`), a new `write_target_file` tool (deliberately
  distinct from the policy-anticipated `write_file`, which the policy layer already treats as
  self-modification), its own honestly-worded authority rule, and a `--task` one-shot CLI
  mode. `automaton/test/` is now **27 tests / 8 suites**, not the 15/15 v1 recorded — v1's
  own Phase 9 claim was true when written, understated now.
- **The `generate()` waterfall is 5 providers, not 4.** Claude → Groq → Mistral → OpenAI →
  OpenRouter → Workers AI. OpenRouter defaults to a free open-source model — the concrete
  mechanism satisfying the founder's explicit "not Claude-only, use open-source/free where
  possible" direction. `automaton`'s own inference layer already called this same waterfall
  (`POST /v11/automaton/infer`), so it inherited the upgrade automatically.
- **The founder-key/login gap is real, and now fixed.** `ProposalsPanel.tsx` already had a
  working Cloudflare Access-first flow (2026-08-09); the actual bug (buttons still
  `disabled={!key}` regardless of Access session state) is fixed, plus a new
  `GET /v11/founder/whoami` route. This is the concrete update to v1's own **Phase 5**,
  below.
- **Phase 2 Kai El authority work**: real running usage totals on `provider_health`
  (`total_calls`/`total_tokens_in`/`total_tokens_out`, surfaced in `GET /v11/llm/status` and
  in Kai El's own hive-context), documented `revenue-proposal`/`agent-proposal` conventions
  on the already-generic `POST /proposals` `kind` field (zero new routes needed), and an
  explicit, deliberate decision NOT to build real agent-creation execution — that stays
  proposal-only, a real authority boundary, not an oversight.
- **Two new skills**: `branch-dissection` (full-file-read + verdict + dual-lens method for
  old orphaned branches, run for real once against `feature/gamified-ui-components`) and
  `plan-reality-audit` (the method that produced this very document).

## Phase-by-phase status, carried forward from v1 with real updates only

**Phase 0 (CI retry fix)** — ✅ still CLOSED, code-level re-verified today.

**Phase 1a (constitution triangle)** — **STILL OPEN, and it needs a founder decision before
any more engineering, not more engineering first.** `soul.md` vs `.queen/soul.md` still
diverge materially (confirmed today). The real blocker was named correctly by `childlike-
wonder` when run against this gap today: nobody has decided whether `.queen/soul.md` and
`docs/GOVERNANCE.md` are meant to be verbatim copies of `soul.md`, declared derived views, or
genuinely separate documents for different audiences. **Open question for the founder,
captured here rather than assumed:** which of those three is correct? A verification script
(v1's own stated "done when") has nothing to check equality against until that's answered.

**Phase 1b (skills vs. commands split)** — not re-verified this pass (flagged
could-not-verify in the fresh audit) — carries forward from v1 unchanged, still open.

**Phase 1c (two planning lineages)** — ✅ still CLOSED — and this very document, plus the
pointer updates below, is Phase 1c's own mechanism doing its job a second time, as designed.

**Phase 1d (stale branch audit)** — **✅ done today**, superseding v1's never-written
`BRANCH_AUDIT_2026-07-19.md` with a real `BRANCH_AUDIT_2026-08-18.md` at the repo root,
reflecting the real current branch list (which has moved on from v1's — several new branches
from this month's own work, several of v1's named branches already resolved). See that file
for the real per-branch salvage-candidate/safe-to-delete/needs-founder-look tags.
`feature/gamified-ui-components` is explicitly excluded from that fresh audit and tracked
separately below — it already has its own full `branch-dissection` pass done, with real
founder answers captured.

**Phase 2 (wire orphaned gamified-UI components)** — **STILL OPEN, Tier 2, needs a real
Proposals-channel submission before wiring — this document does not do that submission
itself** (this sandboxed container cannot reach the live Worker's API to file it for real;
see Phase 3's own note on the same constraint). What's new since v1: `feature/gamified-ui-
components` got its own full `branch-dissection` pass this month (not just this fresh
scan), with real founder decisions already on record — this was founder-requested work, not
a session's experiment; "Colony" should be re-skinned with real federation data (not the
generic sci-fi mock content it ships with); gamification (XP/levels) is a real initiative
the founder still wants explored, not shelved now that Kai El OS exists. **The next real
step is filing the Tier-1-safe Proposals-channel entry for `wire-gamified-ui-alt-view`** —
prepared, not filed, since filing needs live API reach this session doesn't have from this
container. A GitHub Actions workflow (matching `edge-health-probe.yml`'s own pattern for
reaching the live Worker) is the real mechanism to actually file it, not a future session
re-discovering the same constraint.

**Phase 3 (deploy System A)** — unchanged from v1, still not live anywhere (CLAUDE.md's own
already-answered 2026-08-07 probe). Not independently re-checked this pass — this container
has no outbound reach to `*.onrender.com`/`*.workers.dev`, stated honestly rather than
guessed, matching the exact same limitation named in Phase 2 above.

**Phase 4 (Scribe-Pro v1)** — unchanged from v1, correctly still not-yet-due, no drift.

**Phase 5 (founder-blocked track)** — **materially changed, the plan's single biggest real
update.** v1 named three hard blockers. Real status today:
1. **Venture colony repo connection** — superseded. 9 real venture repos are connected with
   push access (via a different session/mechanism than the literal `add_repo`-approval-click
   v1 describes, but the real outcome — Kai El able to read and write real venture repos —
   is achieved).
2. **`FOUNDER_KEY` binding** — the original blocker is still technically real (the raw
   secret is still honestly fail-closed until the founder binds it), but a full, real,
   parallel unlock path now exists: Cloudflare Access, end-to-end wired
   (`verifyAccessJWT()`, `GET /v11/founder/whoami`, `POST /founder/proposals/:id/decide`,
   and — as of today — a frontend that actually reflects Access session state instead of
   still gating every button on the raw key). The founder's own remaining action here
   (`FLIP_THE_SWITCHES.md` §11 "Step 0" — creating the Access Application in the Cloudflare
   Zero Trust dashboard) is real and still owed, but the blocker's *shape* has changed from
   "one binary secret" to "one real, documented, one-time dashboard action with working code
   waiting on the other side of it."
3. **Vectorize/R2 provisioning** — **checked for real, 2026-08-18**, via the Cloudflare
   Developer Platform MCP tools becoming available mid-session (previously this container had
   no live Cloudflare reach at all — the `edge-health-probe` GitHub Actions workflow was the
   only eyes on production; this is a second, independent channel now). Real, live account
   state: **R2 confirmed provisioned** — bucket `hive-files`, created 2026-08-03. **D1
   confirmed live and populated** — `thehive-queen` (114,745,344 bytes, the real production
   DB, created 2026-07-07), `sovereign-hive-app` (created 2026-07-25), `kai-el-brain` (created
   2026-08-10). The `thehive` Worker itself confirmed live, `modified_on` timestamped
   2026-08-18T11:24:40Z — consistent with this session's own recent merges landing on `main`.
   **Vectorize itself not yet checked** (no Vectorize-list tool used this pass) — flagged
   honestly as the one real remaining gap in this specific check, not assumed either way.

**Phase 6 (harness manifests for remaining colonies)** — the literal per-colony files v1
names (`aether.json` etc.) still don't exist, but the real underlying need looks addressed
differently: `colonies.json` (one hand-authored manifest covering all six sibling-repo
colonies) already exists per Phase 10 below. Recommend closing Phase 6 as "addressed via a
different, arguably more efficient route" rather than carrying it forward as a literal gap —
flagged here for the founder to confirm, not unilaterally closed.

**Phase 7 (Sub-Architect seat)** — unchanged, correctly still optional/undecided, no drift.

**Phase 8 (system-design professionalization)** — ✅ still CLOSED, all four specific claims
(`corsHeadersFor`, `pageParams`, `cachedJson`, `LLM_QUEUE`) re-verified present and real in
today's code, not just the 2026-07-21 snapshot.

**Phase 9 (`automaton/`)** — ✅ still CLOSED, and now **understated**: real current count is
**27 tests / 8 suites**, not 15/15 — this month's sandbox-engine work added
`automaton/test/sandbox-run.test.js` on top of the original `gap-closure.test.js`.

**Phase 10 (colony deep-integration)** — ✅ CLOSED per v1, spot-checked (not fully
re-audited) today: `backend/mcp_server/` confirmed present and real; `backend/colony_sdk/`
not found locally as a top-level directory — ambiguous, plausibly consistent with v1's own
"promoted into a real, pinned-dependency package" framing (i.e., it may now live outside
this repo as a distributable package, not necessarily a regression) rather than confirmed
hallucinated. Worth a real check next time colony_sdk's actual distribution mechanism
matters for real work.

## New: Phase 11 — this month's real work, closed ground going forward

Everything under "What changed since 2026-07-19" above is now Closed Ground for this plan,
the same way v1 declared its own predecessor's Workstreams A-D closed. Not re-litigated by
future sessions; built on top of.

## New: Phase 12 — the Queen's campaign orchestration (2026-08-19, own sub-plan)

**STILL OPEN, own document, not summarized here to avoid the two-copy drift Phase 1c
exists to prevent.** Full plan: `memory/planning/2026-08-19-queen-orchestration-master-
plan.md`. One-line version: Nanuet has no real orchestration role today (confirmed by
grep — `autonomous-hive-agent/SKILL.md` never mentions her) despite three separate,
already-real pieces existing that a build could stand on — Akosha (coordination under Kai
El, done), `hive-conductor`'s real domain routing (PR #186, tested not verified-live), and
Kai El's own D1-brain pattern (`c347a6a`) which the founder already said, verbatim, to
repeat for Nanuet "later, when work on the Queen resumes." That resumption is what the new
doc plans, phased the same way Kai El's own build was (foundation → routing → staged
campaign-queue ownership), gated on real founder sign-off before the higher-autonomy tiers.

## Deferred vision — unchanged from v1

The macro-universe vision, GOVERNANCE.md's uncalibrated founder-phase-allocation
thresholds, and the declined "Founder's Purse" stealth-payment scheme all carry forward from
v1 exactly as written — nothing here contradicts or revisits those.

## Verification

- Same discipline as v1: each phase ships as its own PR (or, for this reconciliation itself
  and the branch audit, a direct low-risk commit per the founder's own authorization for
  this autonomous stretch — still visible via a real PR for transparency, never silently
  landed).
- This file, plus updated pointers in `memory/planning/CLAUDE.md` and `Project_file/
  Founders Visonary Folder/ACTIVE/`, becomes the new one durable, checked-in pointer both
  lineages share — v1's own Phase 1c requirement, satisfied a second time.
- Real open items needing the founder's own word before more engineering: Phase 1a's
  constitution-taxonomy question, Phase 2's Proposals-channel filing (blocked on live API
  reach, not on founder time), Phase 6's "close as addressed differently" confirmation.
