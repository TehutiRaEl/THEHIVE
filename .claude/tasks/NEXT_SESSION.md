# PICK UP HERE — handoff written 2026-08-08

**Why this file exists:** the founder ended the previous session by saying *"stop everything
and provide a to-do list that basically picks up all the work. We're doing right here in the
next conversation."* This is that list.

**Read order for a fresh session:** this file → `.claude/HIVE_PULSE.md` (⚠️ see item 2, it is
currently WRONG) → `.claude/tasks/FULL_PLAN.html` "THE PROJECT LEDGER" tab → this file's
"blocked on founder" table.

---

## Why the last session stopped (not a failure — the rail worked)

The founder-set ceiling (`CAMPAIGN.html` protocol, line ~118: *"token-sum ≥ 3,000,000: stop
immediately"*) was checked and found at **13,941,762**. The founder was asked directly whether
to proceed since they were actively present, and chose: **stop, honor the rail, hand off.**

**The composition is the important part, and it is task 51's exact unresolved problem, now
measured a second time:**

| | tokens |
|---|---|
| Real input | 1,502 |
| Real output | 732,730 |
| **Real reasoning total** | **734,232** ← *under* the 3M limit |
| Cache creation | 13,207,530 ← **94.7%** of what the ceiling counts |
| Cache reads | 214,417,001 (correctly excluded) |
| **What the ceiling counts** | **13,941,762** vs 3,000,000 |

**This is the second firing the ceiling has stopped for the same reason** (first: 2026-08-07,
10,125,486, 96% cache). The rail is doing its job as written; what it counts is the open
question. **Task 51 is now the highest-leverage blocker in the whole queue** — it has cost two
full sessions of autonomous work and will cost every future one until decided.

---

## THE TO-DO LIST

### 1. Task 15 — extend Worker test coverage (FOUNDER CHOSE THIS AS THE TOP ITEM)

**Status:** `in-progress`, honestly — not done. **Blocked on nobody.** This is the only
substantial unblocked work in the ledger.

**What exists:** `worker/test/provider-routing.test.js` + `worker/test/generate.test.js`,
**35 tests, all green**, run via `npm test --prefix worker`, wired into CI as
`Test (Worker, Node 22)`, mutation-tested (breaking the routing rules failed 5 and 7 tests).

**What's missing — this is the actual work:** the `fetch` handler itself is entirely untested.
Task 15's own acceptance names `/venture/plan`, `/legal/research`, and the rate-limit + token
gating. Doing this needs stubs for **D1, ASSETS, and Vectorize** that do not exist yet —
building those stubs is most of the job, and they unlock all future route testing.

**Start here:** `worker/test/` (follow the existing two files' shape — real imports from
`../src/index.js`, `node:test`, zero dependencies, matching `automaton/`'s precedent).

### 2. ⚠️ Fix `.claude/HIVE_PULSE.md` — it is actively lying right now

`HIVE_PULSE.md` line ~18 says: *"ALL Routines deleted by the founder 2026-08-01 — nothing
fires automatically right now, on purpose… Do not recreate any Routine until the founder
approves a redesign."*

`CAMPAIGN.html` line ~27 says a Routine **was** wired 2026-08-04
(`trig_01CJsVYwDs4pHMoFEC5JFi7V`, `0 4 * * * UTC`, self-binds to the founder's session).

**CAMPAIGN.html is newer and presumably correct.** HIVE_PULSE is the file *every autonomous
firing reads first* — so the one file designed to orient a fresh session is the one giving it
false information. Fix the stale section; do not delete the incident history around it.

### 3. Verify the Routine actually exists and when it really fires

**Unresolved discrepancy:** the founder referred to *"the automation we set up to trigger at
night time for 2 AM."* The documented cron is `0 4 * * * UTC` — which is **not 2 AM** in any
US timezone (it's midnight ET / 9 PM PT). Either a different trigger is meant, it drifted, or
the founder's mental model and the record disagree.

**Blocked on:** the `list_triggers` MCP tool required approval and was denied in the last
session. **Ask the founder to approve it once**, then confirm: does
`trig_01CJsVYwDs4pHMoFEC5JFi7V` still exist, is it enabled, and what is `next_run_at`?
Nothing about the automation should be claimed as working until this returns real data —
`wired-or-not` applies.

### 4. Then, and only then, the P0–P7 ledger in order

Full detail with the six-field resume contract per project:
`.claude/tasks/FULL_PLAN.html` → "THE PROJECT LEDGER" tab.

**P0 (Infrastructure) has no unblocked next action** — it waits entirely on the founder's
Oracle box + Cloudflare decisions below. Do not invent work under P0 to look busy; the honest
state is "blocked."

---

## BLOCKED ON THE FOUNDER — nothing moves on these without a decision

| P | Decision needed | Task |
|---|---|---|
| **P1** | **Task 51 — the ceiling measure.** Count real input+output only (734,232 today, honestly under limit) / raise the limit / keep as-is and accept firings stopping. **Highest leverage: has now stopped two sessions.** | 51 |
| P0 | Provision the Oracle Always Free box (set `ORACLE_HOST`, `ORACLE_USER`, `ORACLE_SSH_KEY` — `deploy.yml` then works with no code change), or decide against it and honestly retire System A | 53 |
| P0 | Cloudflare Workers Builds: restrict production to `main`, or knowingly accept branch deploys and rewrite the never-merge rule. **Proven happening** (runs `31216723801`, `31216919290`) | 46 |
| P1 | Replace the `ANTHROPIC_API_KEY` — proven invalid, production returned Anthropic's own `401 authentication_error: "API key is invalid."` No code change fixes a credential | 45 |
| P3 | Real agent headcount (222 vs `SPORE_ROSTER.md`'s counted 189), and real LLM-backed agents vs role *labels* | 47 |
| P3 | Name the Orchestrator (crosses `FABLE_DNA.md` Chromosome V — founder territory, will not be invented) | 52 |
| P4 | Which frontend is canonical — this React Command Center, or the `feature/gamified-ui-components` set | — |
| P7 | Triage the 5 approved-but-unactioned proposals sitting in live D1 (#1, #5, #6, #7, #8) | — |

**Two settings actions would remove several of these from the founder's plate** by letting an
AI read the answer directly instead of asking: enable the **Cloudflare Developer Platform**
connector (installed, currently `enabledInChat: false`) and apply **branch protection +
required status checks** — exact config already written at `docs/BRANCH_PROTECTION.md`.

---

## State of the work as of this handoff

**PR #158** is open with 8 commits, unmerged, and — per task 46 — **already serving
production** regardless of merge state.

Shipped and verified today:
- **Task 45 fix** — `provider_health` table; `/llm/status` reports who really answered.
  Root cause **proven**: the key itself is invalid, not the model ID (the original hypothesis
  was wrong).
- **Task 52** — the Orchestrator agent *and* the real routing layer (`providerOrder()`).
  A first version was reported complete when only the agent existed and the routing did not;
  the founder caught it, corrected in `04f1471`.
- **Task 15 (partial)** — 35 Worker tests rescued out of a scratch directory into the repo.
- **Task 48 — `verified-live`**, probe run `31216919290`: the work cycle genuinely fires the
  real cron against real D1. 17 `agent-work` rows, exactly hourly, 7 agents rotating,
  **~900 tokens/turn**.
- **The reality audit** — 34 of 36 `done` tasks had never been production-verified; 84% of
  promised follow-up verifications never happened. Full findings:
  `VISION/2026-08-07-vision-reality-audit-007.md`.
- **New enforcement** — `wired-or-not` skill + `scripts/check-claims.py` in CI (a
  `verified-live` claim without a run ID / SHA / test path fails the build).
- **New skills** — `founder-input-intake`, `childlike-wonder`, `dual-lens`;
  `hive-conductor` upgraded with batching + skill-catalog awareness + explicit do/don't.
- **15 mined ideas** from the founder's LLM documents, logged not built:
  `VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md`.

## Standing founder instructions still in force

- **No new `CAMPAIGN.html` tasks.** Correct existing entries instead. (Count has held at 60.)
- **Never write a bare "done."** Name the level: `compiles` → `tested` → `merged` →
  `deployed` → `verified-live`, with evidence. Not cumulative by assumption.
- **Founder input mid-work runs `founder-input-intake` BEFORE the next action** — triage
  INVALIDATES / CHANGES / CONFIRMS / EXTENDS, write the result into the plan.
- **Architectural decisions run `dual-lens`** — devil's advocate first, then childlike wonder.
  That order.
- **Break founder documents down to their atoms; never copy-paste them in.**
- **Infrastructure before economy** — the founder's own ordering: *"without infrastructure, it
  doesn't pay to exist."*
