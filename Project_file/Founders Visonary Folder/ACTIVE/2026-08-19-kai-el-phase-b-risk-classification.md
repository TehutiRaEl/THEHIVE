# Kai El — Phase B risk-classification list (the thing that unblocks Phase B)

**Date:** 2026-08-19
**Status:** DRAFT FOR FOUNDER APPROVAL — nothing here is decided, nothing here is built.
**Unblocks:** `Project_file/Founders Visonary Folder/HIVE_UPDATES/2026-08-10-directive-agent-roster-akosha-naming-kai-el-scope-050.md`
item 10, which says in its own words that Phase B "needs a concrete risk-classification
list agreed with the founder before any code."
**Level of this document:** `verified` against the checked-out repo (every route, table, and
gate below was read from real code and is cited by line number). Nothing was probed against
live production from this container.

---

## Plain English first (read this part even if you read nothing else)

You told the hive that Kai El should not have one single mode of working. You wanted three:
things that are safe enough he can just do them, things where he writes a draft and waits for
your yes, and things so risky he can only touch them when you specifically ask him to — and
for that third group he has to write down *why* it is risky and *how* he plans to handle it.
That was a good decision, but it could not be built, because nobody had ever written down
which actual things go in which of the three buckets. This document is that missing list.

Here is the honest headline: **most of the scary things you were worried about, Kai El
literally cannot do today.** There is no way for him to spend money — the Worker running in
production has no route that moves SOUL or any other currency at all. There is no way for him
to delete anything, because the one route that can delete is already locked behind your
founder key. He cannot deploy, cannot merge, cannot email or post anywhere. So the "high-risk
by default" seed you proposed is right in spirit, but four of its five categories are
currently theoretical rather than live.

What he *can* really do is smaller and more specific: write rows into the proposal queue, ask
for capabilities he lacks, draft a code change as a diff that a human still has to apply, and
start a sandbox run that always lands as a branch and a pull request rather than a direct
push. Those are the things that actually need classifying, and they are the bulk of the table
below. I have marked each line as either **CONFIRMED** (the code makes the answer obvious and
you are just signing off) or **FOUNDER CALL** (there is a genuine judgment here and it is
yours, not mine). There are eight FOUNDER CALL lines. If you only have time for one thing,
read those eight.

One last thing worth knowing: the risk tiers are not a new invention. The database that holds
Kai El's decisions already has `risk_tier`, `risk_reason` and `risk_handling` columns, and the
code already refuses to write a `high` row that is missing a reason or a handling plan
(`worker/src/index.js:1793`). The plumbing for your decision is already in the ground. What
is missing is only the list of which action lands in which tier.

---

## What Kai El can actually reach today — the real surface, not an assumed one

Grounded by reading `worker/src/index.js` (3,945 lines) end to end for its route dispatch,
plus the three Command Center tabs named in the directive.

### The three tabs are real and confirmed

| Tab (directive's name) | Real id / label | File | Data source |
|---|---|---|---|
| Roadmap | `roadmap` / "Roadmap" | `frontend/src/components/kai-os/LeftNav.tsx:18`, panel `RoadmapPanel.tsx` | `GET /v11/roadmap/development` → `roadmap_items` table (`worker/src/index.js:618`, route `:2351`) |
| Venture Planner | `venture` / "Venture Planner" | `LeftNav.tsx:28`, panel `VenturePlanner.tsx` | `POST /v11/venture/plan` (`VenturePlanner.tsx:36`) then `POST /v11/proposals` (`VenturePlanner.tsx:62`) |
| Project | `world` / "Projects" | `LeftNav.tsx:32`, `CenterGraph.tsx:31` | `GET /v11/tasks` → `tasks` table (`worker/src/index.js:2469`) |

**A real finding the directive could not have known:** the Projects tab has **no write route
at all** in the production Worker. `/v11/tasks` (`worker/src/index.js:2469`) only ever runs a
`SELECT`; there is no `POST /v11/tasks`, no `PUT`, no `DELETE`. So "Kai El picks up work from
the Project tab" cannot mean "Kai El edits a task" today — it can only mean he *reads* tasks
and *proposes* something about them. Making the Projects tab writable is a separate build
decision, not part of risk classification. Flagged, not assumed.

### The categories in your own seed, checked against reality

Your proposed seed was: money/wallet, deletions, deploys/merges, external communications =
high-risk by default. Checked one by one:

| Your seed category | Does it exist as something Kai El could reach? | Evidence |
|---|---|---|
| **Money / wallet** | **No — not in production.** The live Worker has exactly one wallet route, `GET /v11/wallet/leaderboard/soul` (`worker/src/index.js:2339`), and it is read-only. No credit, debit, transfer, or payout route exists anywhere in `worker/src/index.js`. The real `WalletManager` lives in System A (`backend/`), which `CLAUDE.md` records as not deployed anywhere. `KAI_FINANCIAL_AUTONOMY` is stage 7 of the ladder and the code comment at `worker/src/index.js:1707` states plainly that nothing reads it to authorise a payment — it is "documented, not wired." | Verified by grep for `credit|debit|transfer|payout` across `worker/src/index.js`: zero route hits. |
| **Deletions** | **One, and it is already founder-gated.** `POST /v11/roadmap/development` with `status:'delete'` deletes a single roadmap row (`upsertRoadmapItems`, `worker/src/index.js:808`, delete branch at `:862`). The same function also does a **bulk section replace** that deletes every row in a section whose title is not in the submitted list (`:852`) — a genuinely dangerous shape, because omitting a title silently deletes it. Both are behind `founderAuthOk()` (`:2398`) or Cloudflare Access (`:2414`). Kai El has neither credential. | `worker/src/index.js:808-880`, `:2397-2423`. |
| **Deploys / merges** | **No direct path.** The closest thing is `dispatch_workflow`, and it is allow-listed to exactly two workflows, neither of which deploys: `grok-bridge.yml` and `edge-health-probe.yml` (`WORKFLOW_DISPATCH_ALLOWLIST`, `worker/src/index.js:356`). Merges are not reachable at all. The sandbox path (`kai-sandbox-run.yml`) always pushes a branch and opens a PR — never a push to a venture repo's `main`. | `worker/src/index.js:356-388`; `venture_sandbox_runs` table comment at `:653-660`. |
| **External communications** | **One real egress, currently allow-listed and narrow.** `open_issue` posts a real GitHub Issue on `TehutiRaEl/THEHIVE` (`executeApprovedAction`, `worker/src/index.js:431`) — a public, permanent, externally-visible artifact. Beyond that: `KAI_4DBRAIN_BRIDGE` would be a new egress path if it were ever turned on, and it is off and pointed at nothing (`FOURDBRAIN_URL` unset — `worker/src/index.js:3466-3473`). No email, no social, no posting. The chat system prompt already states this to Kai El as a hard ceiling (`:3113-3122`). | `worker/src/index.js:431`, `:1707`, `:3113-3122`. |

**Conclusion on the seed:** it is directionally right and should be kept as the standing
default for anything *new*. But as a description of today's live system it over-fires. Four of
five categories are currently unreachable. Writing the tiering as if they were live would
produce a classifier that spends all its effort guarding doors that are already locked, and
none guarding the doors that are actually open.

---

## THE LIST — approve, amend, or reject line by line

Tiers use the exact three names already in the database (`decision_log.autonomy_mode`,
`worker/schema/kai-el-brain.sql`):

- **LOW → `autonomous`** — Kai El may just do it. Logged, reversible, no external effect.
- **NORMAL → `draft-approve`** — Kai El drafts it; it sits pending until you decide.
- **HIGH → `explicit-invoke`** — Kai El may only do it when you specifically ask, and he must
  write `risk_reason` and `risk_handling` (already enforced in code — `worker/src/index.js:1796-1799`
  refuses the log write without both).

Confidence column: **CONFIRMED** = the code answers this, you are signing off.
**FOUNDER CALL** = a genuine judgment only you can make.

### A. Reading — every one of these is LOW, no exceptions

| # | Action | Real route / evidence | Tier | Confidence |
|---|---|---|---|---|
| A1 | Read the roadmap | `GET /v11/roadmap/development` (`index.js:2351`) | LOW | CONFIRMED |
| A2 | Read tasks / the Projects tab | `GET /v11/tasks` (`index.js:2469`) | LOW | CONFIRMED |
| A3 | Read the proposal queue | `GET /v11/proposals` (`index.js:2493`) | LOW | CONFIRMED |
| A4 | Read agents, governance log, updates, pulse | `index.js:2329`, `:2474`, `:2481`, `:3418` | LOW | CONFIRMED |
| A5 | Read his own memory / brain state | `GET /v11/memory/search` (`:3428`), `GET /v11/kai/brain` (`:3453`) | LOW | CONFIRMED |
| A6 | Read colony reports, provider health, his own usage | `:3627`, `GET /v11/llm/status` (`:2903`) | LOW | CONFIRMED |
| A7 | Read his own autonomy ladder | `GET /v11/kai/autonomy` (`:3482`) | LOW | CONFIRMED |
| A8 | Read a repo file to ground a proposal | `fetchRepoFile()` (`index.js:1881`) | LOW | CONFIRMED |

*Rationale: none of these change any state. Reading is the one place autonomy costs nothing.*

### B. Writing to his own brain — LOW

| # | Action | Real route / evidence | Tier | Confidence |
|---|---|---|---|---|
| B1 | Write a memory about something he did | `kaiRemember()` (`index.js:1726`), gated by `KAI_BRAIN_WRITE` | LOW | CONFIRMED |
| B2 | Write a `decision_log` row | `logDecision()` (`index.js:1793`) | LOW | CONFIRMED |
| B3 | Write a `training_samples` row | `logTrainingSample()` (`index.js:1821`) — `eligible` defaults to 0 so nothing silently becomes training data | LOW | CONFIRMED |
| B4 | Write to `POST /v11/memory/remember` (the shared index) | `index.js:3437` | **FOUNDER CALL** — see note | NEEDS YOUR CALL |

**B4 note.** B1–B3 write to Kai El's *own* database. B4 writes to the *shared* Vectorize index
that also feeds general chat memory. That is a different thing: a wrong memory written there
degrades everyone's recall, not just his. My recommendation is LOW anyway (memories are
additive, recency-weighted since `recencyWeight()` at `index.js:1758`, and nothing executes off
them), but it is the first place his writes leave his own sandbox, so it is genuinely yours to
decide. **Recommended: LOW. Alternative: NORMAL.**

### C. The proposal queue — this is where most Phase B work will actually land

| # | Action | Real route / evidence | Tier | Confidence |
|---|---|---|---|---|
| C1 | File a plain proposal (`kind: 'suggestion'` and friends) | `POST /v11/proposals` (`index.js:2506`, kind defaults at `:2525`) | NORMAL | CONFIRMED |
| C2 | File a `revenue-proposal` or `agent-proposal` | same route, documented kind conventions | NORMAL | CONFIRMED |
| C3 | File an `architect-proposal` carrying a real unified diff | `index.js:3290-3345`; diff extracted by `extractDiffBlock()` (`:1903`) | HIGH | CONFIRMED |
| C4 | File an `action-request` proposal | `POST /v11/proposals/action-request` (`index.js:2552`) — the generic `/proposals` route explicitly *rejects* this kind at `:2531` | HIGH | CONFIRMED |
| C5 | Decide / approve / reject any proposal | `POST /v11/proposals/:id/decide` (`decideProposal()`, `index.js:449`) | **NEVER — not a tier** | CONFIRMED |
| C6 | Volume: how many proposals may Kai El file per day unprompted? | no limit exists in code today | **FOUNDER CALL** | NEEDS YOUR CALL |

**C3 is already classified HIGH in shipped code, and correctly.** `worker/src/index.js:3336-3344`
already writes `risk_tier: 'high'` with a real reason ("an untested or unapplied diff can
silently diverge from what founder review believes was proposed") and a real handling plan
("stored unapplied and dry-run checked by a separate GitHub Action before the founder
decides"). This table is ratifying an existing, working decision, not inventing one.

**C5 is a hard boundary, not a tier.** The whole design rests on Kai El being unable to
approve his own work. `decideProposal()` is reachable only through `founderAuthOk()`
(`index.js:2568`) or `verifyAccessJWT()` (`:2595`). This line exists in the table so that the
boundary is written down and cannot be quietly re-tiered by a future session.

**C6 note.** This is the one risk the autonomy registry itself names and does not solve: stage
3's own `risk_note` says the queue "can fill faster than it is reviewed"
(`worker/schema/kai-el-brain.sql`, `KAI_TAB_DRAFT` row). There is no cap in code. Your options:
(a) no cap, you triage; (b) a soft daily cap (e.g. 5/day) after which he must batch;
(c) one open proposal per tab at a time. **Recommended: (b), 5/day.** Purely your call.

### D. The action-request allow-list — the only things that really *execute*

Each entry below is one of the three actions in `ACTION_ALLOWLIST` (`index.js:358-388`). All
three already require your approval to run at all (`decideProposal()` re-validates against the
allow-list at execution time, `index.js:407`). The tier here is about whether Kai El may
*propose* it unprompted, not whether it runs without you — it never does.

| # | Action | What it really does | Tier | Confidence |
|---|---|---|---|---|
| D1 | `rerun_ci` | Re-runs an existing CI run (`index.js:426`) | NORMAL | **FOUNDER CALL** |
| D2 | `open_issue` | Creates a **real, public, permanent** GitHub Issue (`index.js:431`) | HIGH | CONFIRMED |
| D3 | `dispatch_workflow` — `edge-health-probe.yml` | Runs the production health probe | NORMAL | **FOUNDER CALL** |
| D4 | `dispatch_workflow` — `grok-bridge.yml` | Runs the founder-operated Grok bridge | HIGH | CONFIRMED |

**D1/D3 note.** Both are cheap, idempotent, and near-harmless: rerunning CI costs a runner
minute, and the health probe is the hive's own eyes on production. I would call both NORMAL,
i.e. Kai El may draft them and you click yes. The argument for HIGH is that both consume
GitHub Actions minutes on your account without you initiating, which is a small real cost.
**Recommended: NORMAL for both.** Your call.

**D2 is HIGH and I am confident.** An issue is externally visible, permanent, attributable to
you, and matches your own "external communications" seed exactly.

**D4 is HIGH and I am confident.** `grok-bridge.yml` is explicitly described in Kai El's own
system prompt as founder-operated and something he has no access to (`index.js:3106-3112`).
Letting him dispatch it unprompted would contradict what he is told about himself.

### E. Venture work

| # | Action | Real route / evidence | Tier | Confidence |
|---|---|---|---|---|
| E1 | Draft a venture plan (LLM only, no side effect) | `POST /v11/venture/plan` (`index.js:2793`) — the response itself says "nothing here creates a real account, posts content, spends money, or deploys" (`:2839`) | LOW | CONFIRMED |
| E2 | File a capability gap ("I need X for Y") | `POST /v11/ventures/gaps` (`index.js:2672`) | NORMAL | CONFIRMED |
| E3 | Start a venture sandbox run | `POST /v11/ventures/sandbox-runs` (`index.js:2742`); the run always pushes a branch + opens a PR, never `main` | HIGH | **FOUNDER CALL** |
| E4 | Legal research question | `POST /v11/legal/research` (`index.js:2848`) | LOW | CONFIRMED |

**E2 note.** A capability gap is mirrored into a **real GitHub Issue** on the `venture` repo by
`venture-gap-mirror.yml` (`github_issue_url` column, `index.js:647-655`). By the D2 logic that
would make it HIGH. I am calling it NORMAL instead because the whole point of that channel is
that Kai El asks openly rather than improvising silently — making it HIGH would suppress
exactly the behaviour it was built to encourage. Flagging the tension honestly rather than
hiding it; if you disagree, E2 becomes HIGH and the reasoning is consistent with D2.

**E3 note.** This is the single largest genuine judgment in this document. A sandbox run makes
Kai El write real code into one of your real venture repos. Every guardrail is already in
place (branch only, PR only, merging the PR *is* your approval — `index.js:653-660`), and there
is already a dedicated switch for it, `KAI_SANDBOX_AUTONOMY`, off by default (`index.js:1694`).
So the argument for NORMAL is real: the PR gate already does what draft-approve does. The
argument for HIGH is that it burns Actions minutes, touches a repo whose other collaborators
may not expect it, and is the one thing on this list that produces work product outside
THEHIVE. **Recommended: HIGH, i.e. explicit-invoke.** Genuinely yours.

### F. Everything else that writes

| # | Action | Real route / evidence | Tier | Confidence |
|---|---|---|---|---|
| F1 | Upload a file to R2 | `POST /v11/files/upload` (`index.js:3371`) | NORMAL | **FOUNDER CALL** |
| F2 | Post a colony report | `POST /v11/colony/report` (`index.js:3590`) | LOW | CONFIRMED |
| F3 | Consult the Elders' Council | `POST /v11/council/consult` (`index.js:3640`) | LOW | CONFIRMED |
| F4 | Issue an Arena challenge | `POST /v11/arena/challenge` (`index.js:3741`) | NORMAL | **FOUNDER CALL** |
| F5 | Post a task digest | `POST /v11/hive/task-digest` (`index.js:3610`) — already founder-key gated | N/A (unreachable) | CONFIRMED |
| F6 | Export the whole D1 database | `GET /v11/admin/d1-export` (`index.js:3790`) | HIGH | CONFIRMED |
| F7 | Set the Grok bridge token | `POST /v11/admin/grok-token` (`index.js:3806`) | **NEVER** | CONFIRMED |
| F8 | Edit the roadmap (upsert or delete) | `POST /v11/roadmap/development` (`index.js:2397`) — founder-gated today | **FOUNDER CALL** — see below | NEEDS YOUR CALL |

**F1 note.** Storage growth and a real bucket. Low harm, but it is persistent storage he
controls. **Recommended: NORMAL.**

**F4 note.** An Arena challenge affects another agent's Elo. Harmless now with a small roster;
becomes a real political act at 13+ agents. **Recommended: NORMAL.**

**F6 is HIGH and I am confident.** A full database export is a bulk data-egress action. It
matches the spirit of your "external communications" seed better than anything else on the
list.

**F8 is the biggest open question in Phase B and needs your decision before any code.** The
directive says Kai El should "fill the task" — populate and flesh out a task's scope. On the
Roadmap tab, the only thing that can be filled is a `roadmap_items` row, and the only route
that writes one is founder-gated. So Phase B has exactly three possible shapes, and you have
to pick one:

| Option | What it means | What it costs |
|---|---|---|
| **F8-a** | Kai El never writes `roadmap_items`. He files a proposal saying "here is the roadmap row I would write," and you apply it. | Zero new authority. Slowest. Uses only what already exists. |
| **F8-b** | A new, narrower route lets Kai El write **only** to `section='backlog'` and **only** insert/update, never delete, never the bulk section-replace at `index.js:852`. | One new route, one new switch. Real but bounded new authority. |
| **F8-c** | Kai El gets the existing founder-gated route. | Hands him the bulk-delete shape at `index.js:852`. **I recommend against this.** |

**Recommended: F8-b**, because it is the only option that makes "fill the task" mean something
real without handing over a delete primitive. But F8-a is a legitimate, more conservative
answer and costs nothing to build. This is the decision Phase B is actually waiting on.

### G. Standing default for anything not on this list

| # | Rule | Tier | Confidence |
|---|---|---|---|
| G1 | Any action touching money, a wallet, or a payment | HIGH, and additionally blocked by the stage-7 rule that Kai El can never raise his own cap (`worker/schema/kai-el-brain.sql`, `KAI_FINANCIAL_AUTONOMY` row) | CONFIRMED — your own seed |
| G2 | Any deletion of any row, file, branch, or record | HIGH | CONFIRMED — your own seed |
| G3 | Any deploy, merge, force-push, or write to a `main` branch | HIGH | CONFIRMED — your own seed |
| G4 | Any communication leaving the hive (issue, email, post, webhook, new egress host) | HIGH | CONFIRMED — your own seed |
| G5 | Any action not on this list at all | HIGH until explicitly classified | **FOUNDER CALL** |
| G6 | Any action that would change Kai El's own permissions or switches | **NEVER** — the `autonomy_registry` table deliberately has no `enabled` column for exactly this reason | CONFIRMED |

**G5 note.** Default-HIGH for the unknown is the safe choice and matches how the rest of this
repo already behaves (fail-closed on `FOUNDER_KEY`, allow-lists rather than deny-lists). The
cost is friction: every genuinely trivial new action starts life needing your explicit
invocation. **Recommended: HIGH.** The alternative — default NORMAL — is defensible and less
annoying, and is a real choice, not a mistake.

---

## Summary of the eight lines that genuinely need your decision

| Line | Question | My recommendation |
|---|---|---|
| **F8** | Can Kai El write roadmap rows at all, and if so how narrowly? | **F8-b** — backlog section only, insert/update only, never delete |
| **E3** | Sandbox runs into real venture repos: NORMAL or HIGH? | **HIGH** (explicit-invoke) |
| **C6** | Cap on unprompted proposals per day? | **Yes, 5/day** |
| **D1** | `rerun_ci` — NORMAL or HIGH? | **NORMAL** |
| **D3** | `dispatch_workflow edge-health-probe.yml` — NORMAL or HIGH? | **NORMAL** |
| **B4** | Writing to the *shared* memory index — LOW or NORMAL? | **LOW** |
| **F1 / F4** | R2 upload and Arena challenge — LOW or NORMAL? | **NORMAL** for both |
| **G5** | Default tier for anything unclassified | **HIGH** |

---

## What Phase B still needs after you approve this, and what it does not

**Does not need building — already exists and is real:**

- The three-tier vocabulary, in the database: `decision_log.risk_tier`, `risk_reason`,
  `risk_handling`, `autonomy_mode` (`worker/schema/kai-el-brain.sql`).
- The enforcement that a HIGH decision cannot be logged without both a reason and a handling
  plan (`worker/src/index.js:1796-1799`) — this is code, not a prompt, so it cannot be talked
  around by a bad generation.
- The switches the tiers hang off: `KAI_TAB_DRAFT` (stage 3, draft-approve) and
  `KAI_TAB_AUTONOMOUS_LOW` (stage 6, autonomous-on-low-risk), both off, both documented with
  their real turn-on steps (`worker/src/index.js:1682-1699` and the `autonomy_registry` seed).
- A working precedent for a HIGH classification end to end: the architect-diff path already
  classifies itself HIGH with a real reason and handling plan (`worker/src/index.js:3336-3344`).

**Still needs building, after your sign-off, in this order:**

1. A classifier function that maps an intended action to one of the three tiers using this
   table — a plain lookup, not a model judgment. A model-judged tier would be one bad
   generation away from mis-tiering a delete.
2. Whatever F8 resolves to (a new narrow route, or nothing).
3. Frontend wiring across the three tabs. This is the part that touches `frontend/` and
   `docs/app/`, and is why the directive itself called Phase B "bigger, touches
   `frontend/`/`docs/app/`, not worker-only."

**Deliberately not proposed here, because you did not ask for it:** no new agent, no new name,
no new mythology, no change to any existing tier already shipped in code, and no financial
capability of any kind.
