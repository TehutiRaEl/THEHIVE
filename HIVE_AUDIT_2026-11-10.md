# HIVE AUDIT — 2026-11-10

**Scope:** full re-grounding of `origin/main` after a 69-day gap in session continuity
(last session knowledge ends 2026-08-19). Read-only investigation. Every suite was really
run; every mutation was really applied and restored byte-identically; production state was
read from real GitHub Actions run logs, not inferred.

**Method note.** This container cannot reach `*.workers.dev` directly. Production facts
below come from `edge-health-probe` run **42774339095** (2026-11-10T07:18Z), read in full
via the GitHub API. Repo facts come from `origin/main` at **b4ebd6d** (PR #224,
2026-11-09). Suites were run against a byte-exact `git archive origin/main` snapshot, not
the local spent branch `claude/fable-5-handoff-setup-vefwlb` (which is ~795 lines behind
main in `worker/src/index.js` alone).

---

## Plain English — what a non-engineer needs to know

The Hive is alive and running. The live edge system answered every one of its 19 health
checks this morning, its eight agents are still taking turns doing real work every hour,
and the robot helpers on GitHub are all running and passing again — the account-level block
that was breaking them in August is gone. The constitution is intact and was deliberately
improved twice in November; its fingerprint matches its record exactly, so nothing was
tampered with. Seventeen pull requests landed, and the two biggest ones gave the Queen her
own memory and taught her to recognise which part of the Hive a proposal belongs to.

Three things need the founder's attention. **First, the serious one:** the constitution
enforcer still has the same bug found in August. It remembers "this was fine" for five
seconds using only the *name* of the request, ignoring the details — so a harmless request
followed instantly by a rule-breaking one with the same name gets waved through. I proved
this again today by running it: all five laws I tested were walked straight past. It is
still harmless *only* because that piece of software runs nowhere — confirmed again today,
it returns "not found." The moment it is switched on, the bug goes live with it. The file
has not been touched in 69 days; its fingerprint is identical to August's.

**Second,** the honesty checker that is supposed to stop people claiming "proven live"
without proof still accepts fake proof. I fed it five made-up references and four passed.
**Third,** the Hive's own paperwork has drifted apart from its to-do list. The founder made
ten real decisions on 4 November that unblock several stalled jobs, but the to-do file was
last edited on 19 August and still lists those jobs as blocked. Separately, the Claude API
key has been rejected by Anthropic with a "wrong key" error for over three months, so every
single agent turn quietly runs on a backup brain instead — visible in today's log, eight
turns in a row. And roughly twenty near-identical duplicate proposals have piled up in the
live queue because the filter built to stop them only catches exact matches.

Nothing here is an emergency. The pattern is that **building kept moving while verifying
and tidying did not**: new work shipped, old known problems stayed exactly where they were.

---

## 1. The known-critical bugs — are they still open?

Baseline: `.claude/skills/devils-advocate-audit/FABLE_SWEEP_2026-08-19.md` (read in full).

### 1a. Constitutional validator cache bypass (F1/F2/F3) — **STILL OPEN (CRITICAL)**

**Source unchanged.** `backend/core/validator.py:61` still reads:

```python
cache_key = action
```

`_cache` is still a **class** attribute (`:55`), TTL still 5.0s (`:56`), and only passes
are cached (`:86`).

**Proof the file has not been touched in 69 days:** `sha256(backend/core/validator.py)` =
`b22a283a20ea2166c1fb63b35c7bbcd5f48f7b4df136b5899b27bc423ee32d59` — **byte-identical** to
the hash the 2026-08-19 sweep recorded in its own §(c)12 restoration ledger.

**Reproduced live today.** Probe primes the cache with a benign context, then re-calls the
same action name with a violating context inside the TTL:

| Law | Action | Cold (hostile only) | After benign prime | Verdict |
|---|---|---|---|---|
| F-005 | `update_permissions` + `override_fixed_law=True` | `allowed=False law=F-005` | **`allowed=True`** | BYPASSED |
| F-001 | `data_delete` + `delete_rate_last_hour=9999` | `allowed=False law=F-001` | **`allowed=True`** | BYPASSED |
| F-002 | `change_wealth_formula` + `retroactive=True` | `allowed=False law=F-002` | **`allowed=True`** | BYPASSED |
| F-003 | `decline_workflow` + `apply_wealth_penalty=True` | `allowed=False law=F-006` | **`allowed=True`** | BYPASSED |
| F-004 | `restrict_access` with no rationale | `allowed=False law=F-004` | **`allowed=True`** | BYPASSED |

Cache confirmed as the mechanism: after a 5.3 s sleep the same hostile
`change_wealth_formula` call correctly returns `allowed=False law=F-002`. Shared class
attribute confirmed: `ConstitutionalValidator._cache is ConstitutionalValidator()._cache`
→ `True`.

*(Probe stubbed only `backend.core.db`, whose sole use in this path is `_log()`. No
validator logic was modified.)*

**F2 — zero coverage, still true.** Disabling the cache lookup (`cached=None` injected
after line 61) leaves the suite at **397 passed**, unchanged. Mutation restored; hash
re-verified identical.

**F3 — blast radius unchanged.** `backend/api/routes.py` still passes caller-supplied
`action` *and* `context` straight into the module singleton.

### Is System A deployed now? — **NO. Still not live.** (the mitigation holds)

- `edge-health-probe` run `42774339095`, final step, verbatim:
  `##[notice]System A (FastAPI backend) is NOT live at the default Render slug
  (status=404) — render.yaml is an undeployed blueprint, not a running service.`
- `.github/workflows/deploy.yml:32` still skips on unset `ORACLE_HOST`; `render.yaml` is
  still a blueprint only.
- **But the founder has now decided to provision it.** `docs/FOUNDER_ANSWERED` Q-001
  (DECIDED 2026-11-04): *"PROVISION — repurposed. NOT retire."* So the only thing keeping
  F1 a landmine rather than a live fire is a decision the founder has already reversed and
  simply not executed yet. **F1 must be fixed before Q-001 is carried out.**

### 1b. `check-claims.py` accepts fabricated evidence (F6) — **STILL OPEN**

`scripts/check-claims.py:29-33` unchanged; the SHA pattern is still
`re.compile(r'\b[0-9a-f]{7,40}\b')` with no resolution check. Run against a crafted
fixture today — **4 of 5 fabrications pass**, identical to August:

```
checked 5 task(s) claiming verified-live
::error::task 905 claims verified-live with no checkable evidence.
EXIT=1
```

| Fixture | Fake evidence | Result |
|---|---|---|
| 901 | `20260807` (a date) | **PASS** (accepted as a commit SHA) |
| 902 | `5551234567` (a phone number) | **PASS** |
| 903 | `run 99999999999` (nonexistent) | **PASS** |
| 904 | `worker/test/totally-made-up.test.js` (nonexistent) | **PASS** |
| 905 | no reference at all | caught |

**F7 also still open.** Against the real `.claude/tasks/CAMPAIGN.html` it reports
`checked 2 task(s)` — 2 of 60 task blocks. CLAUDE.md's "never a bare done" rule still has
no machine enforcement outside the `verified-live` sub-case.

### 1c. Zero regression coverage on the Worker gates — **F4 STILL OPEN / F5 PARTIALLY FIXED**

Real mutations against the main snapshot. Baseline **370 pass / 0 fail**. Every mutation
restored; `sha256(worker/src/index.js)` re-verified
`6ccee52a67016850b8955a6d8af9f2d2b6426e2a4ce266649e88955a927fa608` after each.

| ID | Mutation | Result | Verdict |
|---|---|---|---|
| M14 | Queen alignment threshold `98` → `0` | 369 pass / **1 fail** | **KILLED (newly covered)** |
| M15 | Elder Council veto ignored | 369 pass / **1 fail** | **KILLED (newly covered)** |
| M16 | **Bypass the `QUEEN_AUTONOMOUS_APPROVAL` master switch** | **370 pass / 0 fail** | **SURVIVES — STILL OPEN** |
| M10 | Add `ANY.yml` to `WORKFLOW_DISPATCH_ALLOWLIST` | **370 pass / 0 fail** | **SURVIVES — STILL OPEN** |
| M11 | `validateActionRequest` accepts any off-list action | **370 pass / 0 fail** | **SURVIVES — STILL OPEN** |
| M13 | Delete execution-time re-validation entirely | **370 pass / 0 fail** | **SURVIVES — STILL OPEN** |

- **F5 → CHANGED (partially fixed).** PR #222 added `worker/test/verdict-invariance.test.js`
  and exported `queenDecide`/`queenReview`. That killed M14 and M15. **M16 — the one the
  August sweep explicitly asked to prioritise — still survives.** Today, auto-approval
  could be made unconditional and CI would stay green.
- **F4 → STILL OPEN, unchanged.** `validateActionRequest` is still not exported
  (`worker/src/index.js:429`), has **0** references in `worker/test/`, and
  `WORKFLOW_DISPATCH_ALLOWLIST` (`:393`) has **0**. Three independent mutations that fully
  disable the only path in the Worker producing real GitHub side effects all pass 370/370.

### Other sweep findings, re-checked

| # | Finding | Status today | Evidence |
|---|---|---|---|
| F8 | Automaton suite never runs in CI | **STILL OPEN** | `.github/workflows/ci.yml` has exactly 2 jobs: `test:` (line 13), `worker:` (line 50). No automaton step. |
| F9 | Integration tests cannot fail CI; coverage floor 45% | **STILL OPEN** | `ci.yml` — `continue-on-error: true` on the integration step; `--cov-fail-under=45`. |
| F10 | `AUTOMATON_REPLICATION_AUTONOMY` default-off unguarded | **STILL OPEN** | `MUT[A7] replication default false→true → 27 pass / 0 fail`. Runtime defaults genuinely remain `financial false replication false`. |
| F12 | Provider waterfall degraded | **STILL OPEN, now 84+ days** | See §6 task 45. |

### NEW this pass — two findings the August sweep could not have seen

**N1 — `worker/src/lens/` + `worker/src/gates/create-gate.js` are WIRED with ZERO tests.**
PR #215 (merged 2026-09-30) landed the Dual Lens wire into `worker/src/index.js` — imports
at lines 1–4, and `createGate()` is called at **three** real proposal-write sites
(`:29`, `:1405`, `:3465`). Grep of `worker/test/` for `create-gate|createGate|withLens|
loadVoice|normalizeTitle` returns **zero** matches. A gate that runs on every proposal
write has no regression test at all. This is the same shape as F4/F5 and should join that
follow-up.

**N2 — switch-9 reads bare truthiness, not the fail-closed `switchOn()`.**
`worker/src/index.js:2756` is `if (env.QUEEN_AUTONOMOUS_APPROVAL) {`. A dashboard plain-text
variable set to the string `"off"` is truthy and would **silently enable** auto-approve.
This is honestly self-documented in-code at `:2749-2755` as open item QA-1 needing a founder
decision, and is named in `docs/AUTONOMY_STAGES_AND_GATES.md`'s switch map as a hard
precondition on switch 9. Verified by reading the line; the "inert while switch 9 is off"
claim holds only while the variable is **absent**, not while it is set to "off".

---

## 2. What the 17 merged PRs actually built

Shallow-clone caveat, stated up front: this clone is **shallow**
(`git rev-parse --is-shallow-repository` → `true`), 83 commits total, and the oldest
reachable commit is `701f5cf` (2026-09-19, the PR #204 merge). **Commits between
2026-08-19 and 2026-09-19 are below the shallow boundary and cannot be inspected from this
container.** The "83 commits" figure is therefore "83 commits visible", all dated
2026-09-19 → 2026-11-09. PR #204's own diff is unreadable (its first parent is grafted);
PRs #207, #208, #212 never appear as merges — #207/#208 were resolved into main by commit
`d53f986` instead.

| PR | Merge | Date | What it really shipped | Level |
|---|---|---|---|---|
| #205 | `64ac5e8` | 09-19 | "Option A" docs: charter templates, 508(c)(1)(A) research, tech-sovereignty + body/lineage surface docs. 8 files, docs only. | EXISTS (docs) |
| #206 | `7667258` | 09-20 | `BodyLineagePanel.tsx` + LeftNav/KaiElOS wiring + `UNIFIED_PROPOSAL`. Real frontend component, mounted. | BUILT + WIRED (frontend) |
| #209 | `8555195` | 09-23 | `BiosystemOverlay.tsx` retires the JASPER/localhost demo iframe, points at same-origin `/v11`. +192/−23. | BUILT + WIRED |
| #210 | `21086b2` | 09-23 | Omnivore vision + `PROPOSAL_COALESCENCE.md` + #208 keep/discard dissection. Docs/doctrine. | EXISTS (docs) |
| #211 | `32fb9d0` | 09-25 | Dual Lens package: `lens/`, `gates/`, `agents/seer.js`, voice-of-the-hive, migration SQL. **Explicitly no `index.js` wire yet.** +2446. | BUILT, not wired |
| #213 | `08df6b3` | 09-28 | First real `VOICE.md` compression from soul.md + FABLE_DNA + `LENS_WIRE_AND_MIGRATION_STATUS.md`. | EXISTS (docs) |
| #214 | `4733fd2` | 09-30 | Master Mind Map & Roadmap deposit + **3 real CI repairs** (invalid YAML in `federation-issue-triage.yml` and `federation-pr-review.yml`; `colony-health` made advisory). | MERGED (CI fixes now verifiably running — see §4) |
| #215 | `997f609` | 09-30 | **The Dual Lens wire actually lands**: `worker/src/index.js` +77, `DEPLOY_WIRE_LEDGER.md`. | WIRED, **untested** (N1) |
| #216 | `dd65999` | 11-02 | Three empty `Project_file` READMEs filled. | EXISTS (docs) |
| #217 | `aa74c32` | 11-03 | `docs/OPERATOR_CHARTER.md` v0.4, 689 lines. | EXISTS (governance doc) |
| #218 | `22af95e` | 11-04 | Charter v0.5 — **status record only**, no rule change (+18/−4). | EXISTS |
| #219 | `4c3cafb` | 11-05 | **F-005 amended**: soul.md +12 — six new clauses (DaVinci's six named changes). | MERGED (constitutional) |
| #220 | `f2713da` | 11-06 | **F-005 amended again**: soul.md +11/−4 — second pass, DaVinci's eight named changes. Net result: **9 clauses**. | MERGED (constitutional) |
| #221 | `dd7fe93` | 11-06 | **Phase Q-A: Nanuet's brain D1 binding wired.** `index.js` +19/−?, `nanuet-brain.test.js`, `wrangler.jsonc` NANUET_BRAIN block uncommented with a real `database_id`. | WIRED + DEPLOYED |
| #222 | `672ad87` | 11-07 | **Phase Q-B: Queen domain routing.** +2361 lines: ported `routeProposalDomain()`, `deriveVisionVerdict()`, `handleNanuetRoute()`, schema columns, and **4 new test files** (`domain-routing`, `domain-routing-parity`, `verdict-invariance`, 582-row corpus). | WIRED, suite 370/370 |
| #223 | `7af242d` | 11-07 | `docs/MESSIAH_COMPLEX.md` — founder dissertation encapsulated, with honest-flags section. | EXISTS (doc) |
| #224 | `b4ebd6d` | 11-09 | `docs/AUTONOMY_STAGES_AND_GATES.md`, 323 lines, explicitly **DRAFT, not ratified**. | EXISTS (draft) |

**Shape of the 17:** 10 are docs/governance only. 5 touched real runtime code
(#206, #209, #215, #221, #222). Only #222 brought meaningful new test coverage.

### Queen orchestration master plan — how much is actually built

Against `memory/planning/2026-08-19-queen-orchestration-master-plan.md`:

- **Phase Q-A — BUILT, WIRED, DEPLOYED.** Nanuet has her own separate D1 (`nanuet-brain`),
  not extra tables in `thehive-queen`, as the plan required. `wrangler.jsonc` records
  *"ACTIVATED 2026-11-05 (BATCH-QA, QA-2/QA-3) … the binding below is live"*, with the real
  D1 slot cost noted (4/10 as of QA-2). Decision log, recency-weighted recall and
  all-off-by-default switches present. `NANUET_BRAIN_WRITE` and `NANUET_REVIEW_LOG` are
  **BUILT** per `worker/schema/NANUET_AUTONOMY.md`.
- **Phase Q-B — BUILT, WIRED.** `DOMAIN_ROUTING_BUILT = true`
  (`worker/src/index.js:2383`). `routeProposalDomain()` is a port of
  `.claude/skills/hive-conductor/scripts/domain_router.py` — a pure keyword function, zero
  `generate()` calls, so zero token cost. It runs *after* the verdict, inside the log
  try/catch, so it provably cannot change a verdict (that is what
  `verdict-invariance.test.js` pins). `NANUET_DOMAIN_ROUTING` is stage 3, **BUILT**.
- **Phase Q-C — DOES NOT EXIST.** `NANUET_CAMPAIGN_OBSERVE`,
  `NANUET_CAMPAIGN_ADVISE`, `NANUET_DELEGATE_AKOSHA` appear in `NANUET_SWITCHES`
  (`worker/src/index.js:2035-2037`) purely so the ladder's destination is visible. The
  in-code comment is explicit: *"Nothing in this file reads any of them to authorise
  anything, because there is nothing to authorise: the capabilities do not exist."*
  `NANUET_AUTONOMY.md` marks stages 4–6 **NOT BUILT**. Nanuet does **not** own the campaign
  queue; nothing reads `.claude/tasks/CAMPAIGN.html` on her behalf.
- **All six NANUET switches are OFF**, and `switchOn()` is fail-closed. The one exception is
  switch 9's bare-truthiness read (N2 above).

**Net: Q-A and Q-B are real and deployed; Q-C — the actual original ask ("Nanuet owns the
campaign queue") — is 0% built.** Per `docs/AUTONOMY_STAGES_AND_GATES.md`, Q-C is also the
gate on the Kai El real terminal and on founder-gating `/v11/command_text`.

---

## 3. The daily automation — current state from repo evidence

**Framing correction, carried into this report:** the routine
`trig_01CJsVYwDs4pHMoFEC5JFi7V` was **turned off deliberately by the founder** because it
started costing real money and froze other work in the Hive. This section reports only what
the repository shows. It makes no claim that anything failed or went unnoticed, and I have
no tool in this session that can read routine state, so live routine status is
**unverified** from here.

**What the repo shows:**

1. **Campaign Log's last entry is dated 2026-08-19.** `.claude/tasks/CAMPAIGN.html` has not
   been modified on main since — `git log origin/main -- .claude/tasks/CAMPAIGN.html`
   returns only `701f5cf` (2026-09-19), which is the shallow graft boundary, not a real edit.
2. **Queue invariants hold and the queue is genuinely empty of actionable items.** Parsing
   the 60 `<div class="task">` opening tags: **45 `done`, 15 `blocked`, 0 `pending`,
   0 `in-progress`.** (A naive `data-status` grep gives 48/17/2/2 — that over-counts, because
   the protocol text and legend contain literal `data-status="pending"` examples. The 60
   task-div parse is the correct one.)
3. **What the firing protocol expects**, verbatim from `.claude/tasks/CAMPAIGN.html`'s
   Protocol block: *"Find the first `<div class="task" data-status="pending">` below, in
   document order. That is the only task under consideration. Ignore everything marked done
   or blocked."* With 0 pending, the protocol's own stop rule applies —
   `.claude/HIVE_PULSE.md` states it directly: *"Next firing: Protocol's own 'if no task
   left pending: stop' rule applies again — don't invent scope."*
   The protocol also sets a ~150,000-token per-task budget and records a measured
   ~83,500-token average per task (n=2).
4. **`.claude/HIVE_PULSE.md` is STALE.** Its own authoritative section is headed
   `## Right now (updated 2026-08-18 — read this section first)` — **84 days old.** It is
   the one page every autonomous firing is required to read first, and it is wrong in at
   least these ways:
   - It still says `nanuet-brain` **"does not exist yet"** / Q-A is branch work. Q-A is now
     deployed (PR #221).
   - It still records the routine's live state as `unverified` pending a `list_triggers`
     approval, with no mention of the founder's shutdown.
   - It describes a provider waterfall of 5; main now has 8.
   - Its closing section says *"Nothing else outstanding beyond what's already named
     there"* — which predates all ten Q-decisions, both F-005 amendments, Q-A, Q-B and the
     three new governance docs.
5. **Does 0-pending mean there is genuinely nothing to do?** **Literally yes, substantively
   no.** Under the queue's own rule, there is nothing to pick up. But outside that file:
   - **30 approved-unactioned proposals** sit in live production right now (run
     `42774339095`), and the protocol's *own* standing rule (task 32, 2026-08-04) says every
     firing must check exactly that.
   - Ten founder decisions (Q-001…Q-010, 2026-11-04) and nine migrated ones (M-01…M-09)
     clear or change the blockers on at least **6 of the 15 blocked tasks** (§6) — none of
     which is reflected in the queue.

**Restart assessment.** Technically the automation could restart: GitHub Actions is healthy
(§4), production is live, and all three suites are green. But **a restart needs a founder
decision and a cost control before anything else**, for reasons visible in the repo itself:
the queue is 0-pending so a firing would stop immediately without doing useful work; the
one page every firing reads first is 84 days stale and would mislead it; `HIVE_PULSE.md`
preserves the 2026-08-01 cost incident as standing doctrine (*"it cost real money"*) along
with the rule *"do not create any NEW Routine without the founder's approval"*; and the
measured per-task cost is ~83.5K tokens. Re-pointing the queue at the real open work
(§6, §"what a session should do next") should precede any restart, not follow it.

---

## 4. GitHub Actions health — **RESOLVED. Workflows are running and passing.**

This is determinable from the container, via the GitHub API. The August account-level block
(every workflow failing at 0 ms billable compute) is **gone**. Real compute, real
durations, today:

```
completed  success  Colony Health Matrix          main  schedule          42828091408  12s  2026-11-10T13:49:41Z
completed  success  Task Digest → Hive            main  schedule          42815978283  10s  2026-11-10T12:28:00Z
completed  success  Federation Issue Triage       main  workflow_dispatch 42814019788  16s  2026-11-10T12:14:13Z
completed  success  Federation PR Review          main  workflow_dispatch 42814015600   8s  2026-11-10T12:14:12Z
completed  success  Kai El Bridge                 main  schedule          42813994471  14s  2026-11-10T12:14:03Z
completed  success  Venture Gap Mirror            main  schedule          42809940844   8s  2026-11-10T11:44:39Z
completed  success  Architect Proposal dry-run    main  schedule          42809368435   9s  2026-11-10T11:40:20Z
completed  success  Campaign Digest → CC          main  schedule          42777262986   9s  2026-11-10T07:43:20Z
completed  success  UI Live Probe (real browser)  main  schedule          42776965302  39s  2026-11-10T07:40:46Z
completed  success  Roadmap Digest → CC           main  schedule          42776168711   9s  2026-11-10T07:33:57Z
completed  success  Edge Health Probe             main  schedule          42774339095  18s  2026-11-10T07:18:16Z
completed  success  CI                            main  push              42754565234  49s  2026-11-10T04:14:19Z
```

- **CI passes on main** (run `42754565234`, 49 s, on the #224 merge).
- **27 workflow files** exist in `.github/workflows/`. The three YAML repairs in PR #214
  are confirmed effective — `federation-issue-triage` and `federation-pr-review` both run
  green.
- **One workflow is persistently red: `Deploy GitHub Pages`.** It has failed on **every**
  push to main for at least the last 10 runs (`42754565245`, `42402138769`, `42335386489`,
  `42139471058`, `42129814790`, `41950691992`, `41949091253`, `41947468796`, `41936443565`,
  `41935843482`). Cause, from `--log-failed`:
  `fatal: could not read Username for 'https://github.com': terminal prompts disabled` →
  `git failed with exit code 128`. Low urgency by the founder's own ruling — Q-010 makes the
  React Command Center canonical and the Operator Charter §6 records GitHub Pages as
  *"initial creation only and is legacy"* — but it means every main-branch push shows a red
  X, which erodes the signal value of CI status at a glance.
- **`constitution-receive.yml` has NOT fired recently.** Its last three runs are all
  2026-06-27 (`28283365897`, `28281648107`, `28281623773`). **Correction to prior
  grounding:** the `chore: update soul.md hash to …` commits (`fa42f20`, `1823771`) are from
  `constitution-sync.yml` and each touch **only `.queen/hive.yml`, one line** — they did not
  edit `soul.md`. Verified: `git show --stat fa42f20` → `.queen/hive.yml | 2 +-`.

---

## 5. Current test and claim health

All run for real against the `origin/main` snapshot.

| Suite | Command | Result | Last known (2026-08-19) | Δ |
|---|---|---|---|---|
| Worker | `npm test --prefix worker` | **370 tests / 370 pass / 0 fail**, 73 suites | 324 | **+46** |
| Python (full) | `python3 -m pytest tests/` | **397 passed** | 397 | **0** |
| Python (unit) | `python3 -m pytest tests/unit/` | 382 passed | — | — |
| Python (integration) | `python3 -m pytest tests/integration/` | 15 passed | — | — |
| Automaton | `cd automaton && npm test` | **27 tests / 27 pass / 0 fail**, 8 suites | 27 | **0** |
| Claims | `python3 scripts/check-claims.py` | **exit 0** — `checked 2 task(s) claiming verified-live / all verified-live claims carry checkable evidence` | exit 0, 2 checked | 0 |

- **Worker +46** is entirely PR #222: `domain-routing.test.js`, `domain-routing-parity.test.js`,
  `verdict-invariance.test.js`, and a 582-row `domain-routing-corpus.json` fixture.
- **Python unchanged at 397** — no Python test was added in 69 days, which is precisely why
  F1/F2 remain uncovered.
- Container note: `pytest` and the `requirements-ci.txt` set were not preinstalled; I
  installed them (`numpy`, `scipy`, `fastapi`, `pydantic-settings`, and a forced
  `cryptography` 50.0.2 reinstall to fix a `_cffi_backend` pyo3 panic from the Debian
  system package). No repo file was modified.

**CAMPAIGN.html invariants — both as expected:**

- `grep -c '<div class="task"'` → **60** ✓ (expected 60)
- `<div` count **62**, `</div>` count **61** → **div-delta 1** ✓ (expected 1)
- Status breakdown: **45 done / 15 blocked / 0 pending / 0 in-progress** ✓

**soul.md integrity — verified intact and self-consistent:**

- `sha256(soul.md)` = `5b6ca4b9e955d62aea45d696a1b2f8518a8c477a7c675de791c3f261fd4e9b4f`,
  and `.queen/hive.yml:7` records `soul_md_hash:
  "5b6ca4b9e955d62aea45d696a1b2f8518a8c477a7c675de791c3f261fd4e9b4f"` — **exact match.**
- F-001…F-006 all present. The 5-minute / 10-per-hour delete right, sale-transfers-a-copy,
  the EVW formula, and the **geometric mean** wealth combination are all intact, verbatim.
- F-005 now carries **9 clauses** (PR #219 added six, PR #220 reworked them to nine).
- `soul.md` on main has been modified by exactly two commits, both deliberate F-005
  amendments shipped alone in their own PRs, as F-005 Clause 3 itself now requires.
- **Real drift found:** `.queen/soul.md` differs from root `soul.md` by **106 diff lines**
  (different title, F-001 text absent, none of the nine F-005 clauses). Per M-01 the root
  file is the sole edit source and `.queen/soul.md` is a derived view, so this is expected
  in kind — but the gap is now large, and the Operator Charter §3 flags the
  root-vs-`.queen` canonical question as *"narrowed but not closed."*

---

## 6. The 15 blocked tasks — is each blocker still real?

| Task | What blocks it | Still real? |
|---|---|---|
| **2** — Command Center button/tab audit | Decomposed pointer into 2a–2e; parent kept `blocked` as a signpost | **NO — vestigial.** All five children (`task-2a`…`task-2e`) are `data-status="done"`. The decomposed work is complete; the parent is stale bookkeeping. Safe to close. |
| **4** — Wire `services/sentry.ts` | Needs a founder-supplied Sentry DSN | **YES, unchanged.** `VITE_SENTRY_DSN` appears in 15 files but only as a variable name (`frontend/src/vite-env.d.ts`, `services/sentry.ts`, `main.tsx`, built bundles). No value anywhere; `env.example` has no Sentry entry. Code is wired; the credential is still missing. |
| **9** — SPORE_ROSTER gaps (pointer) | Decomposed into 9a–9c | Pointer only. 9a's blocker below. |
| **9a** — Per-colony pulse file | 2026-08-02: harness denied `add_repo` with push access for every colony repo | **WORTH RE-TESTING.** An `add_repo` tool with an `access: "push"` parameter **is present in this session's tool surface**, which differs from the 2026-08-02 denial. I did not invoke it (out of this audit's read-only scope — it mints credentials). The fallback template `.claude/skills/autonomous-hive-agent/templates/COLONY_PULSE_TEMPLATE.md` is still in place. One real attempt would settle it. |
| **40** — Proposal #5, free/open-source discovery | Approved but unactioned; scope needed founder clarity | **NO — CLEARED 2026-11-04.** Q-009: *"#5 … ACTION: build it, propose-only. Search/evaluate only; each candidate as its own proposal; founder approves before anything is wired in."* This is now actionable work with an explicit scope and gate. |
| **41** — Hoard pays for its own existence | Needs a real founder financial decision | **PARTIALLY CLEARED.** Q-004 (2026-11-04) establishes five gated revenue tiers, authorises **Tier 1 only**, and keeps the hard rule *"no automatic money moves: each real money action still requires the founder's explicit yes."* The policy frame now exists; the wallet/spend-tracking build does not. Tiers 3–4 explicitly need qualified human counsel. |
| **45** — Claude API key failing 100% of the time | Founder credential/plan decision | **YES — STILL REAL, AND NOW VERIFIED LIVE AS STILL BROKEN.** Run `42774339095`, `/v11/llm/status`: `claude … "bound":true,"health":{"ok":false,"error":"HTTP 401: {\"type\":\"authentication_error\",\"message\":\"invalid x-api-key\"}"}`. `"active_provider":"workers-ai"`. All 8 most recent agent-work rows read `wanted reasoning/speed, fell back (that provider is not answering)`. First measured 2026-08-06 — **96 days unresolved.** Code added DeepSeek and Kimi to the waterfall (`PROVIDERS`, `worker/src/index.js:1450-1459`, 8 providers), which deepens the fallback bench but does not fix the dead key; `/v11/llm/status` lists only 5 as bound. |
| **46** — Unmerged branch code reaching production; `/debug/git` hardcodes "main" | Governance/safety question for the founder | **LARGELY ANSWERED.** `/v11/debug/git` now returns `{"available":false,"branch":"main","status":"deployed artifact (no live working tree)","deployed_via":"Cloudflare Workers Builds from main"}` — it reports the deploy source explicitly rather than implying a working tree. The underlying Workers Builds branch-deploy configuration question is still not independently confirmed from the container. |
| **47** — ~200+ agent roster | Sequencing: wait for 6-Elder pilot AND task 41 | **STILL GATED, but moved.** Live `/v11/agents` shows **10** agents (Ma'at, Kai El, Solomon, Nanuet, Thoth, Sekhmet, Ptah, Horus, Akosha, Orchestrator) against the founder's stated next checkpoint of 13. Task 41's financial frame is now partially decided (Q-004), so one of the two conditions has advanced from "blocked" to "policy decided, build pending". |
| **53** — Oracle Always Free box never provisioned | Founder-only infra provisioning + cost | **DECISION CLEARED, EXECUTION NOT DONE.** Q-001 (2026-11-04): **PROVISION, repurposed** — with five approved purposes (private engine behind the Worker, HiveMesh colony host, long-running lab, staging twin, reengineered-not-restored). Repo state unchanged: `deploy.yml:32` still skips on unset `ORACLE_HOST`; Render slug still 404. **This is now the single highest-leverage unexecuted decision, and F1 gates it.** |
| **16** — Venture/legal session history + export | Own acceptance text requires founder confirmation; none on record | **YES, unchanged.** No Q- or M-entry covers it. |
| **17** — Legal-research citation verification | Needs founder to approve a real verification source | **YES, unchanged.** No Q- or M-entry covers it. |
| **18** — Founder's "Dissertation" — disposition | Disposition undecided | **NO — CLEARED 2026-11-06.** `docs/MESSIAH_COMPLEX.md` is explicitly *"the disposition step"* for *"the 'Dissertation' of blocked-task triage #18 in the F-007 compound proposal (proposal #117)."* Merged as PR #223. |
| **20** — `treasury_guild.py` revenue-split scope | 2026-08-01 Q2 "real plan, discuss later", unanswered | **PARTIALLY CLEARED.** Q-004's tier structure is the revenue conversation arriving from another angle; the specific 70/20/10 split in soul.md's mutable law 3 is still undiscussed. |
| **23** — MANDATE_TRIAGE proposal for F-007 Agent Valuation | Real constitutional change; no founder ask on record | **CHANGED — now bounded, not blocked.** M-02 (migrated 2026-11-05) rules **F-001–F-006 only** are canonical, so F-007 is definitively *not* law. M-06 rules **F-007 TIERED HANDLING** — handled as proposals and triage items. Compound proposal #117 is the live vehicle. The task as literally written (take F-007 through soul.md's amendment process) is now *contrary* to M-02/M-06 and should be rewritten, not merely unblocked. |

**Tally: of 15 blocked tasks, 3 are fully cleared (2, 18, 40), 4 have materially moved
(41, 20, 23, 47), 1 should be re-tested with a now-present tool (9a), and 7 remain
genuinely blocked (4, 9, 16, 17, 45, 46, 53).** The repo's documented habit of leaving
tasks `blocked` after the blocker cleared is confirmed again, at a rate of roughly 1 in 3.

### Also found in live production state (run `42774339095`)

- **30 approved-unactioned proposals**, of which ~20 are near-identical clones titled
  variants of *"Governance Kernel Proposal for F-007 - Enhance(d) Task Routing
  Optimization"* (#80–#115). The gate built to stop this is **wired but structurally
  cannot catch these**: `createGate()` compares `normalized_title` only against rows with
  `status = 'pending'` (these are `approved`), does an exact match after a weak normaliser
  that only strips a leading `#123 ` and `hive ` (so "Enhance" vs "Enhanced" are different
  keys), and `worker/src/migrations/001-add-normalized-title.sql`'s **backfill `UPDATE` was
  never applied to production** — `docs/DEPLOY_WIRE_LEDGER.md:29` records
  *"**NO prod until founder** | Staging first (founder 2026-09-30)"*, consistent with Q-003.
  The `ALTER TABLE … ADD COLUMN normalized_title` *is* applied at runtime by `ensureTables`
  (`worker/src/index.js:592`), so the column exists; the legacy rows just have `NULL` and
  can never clash. **Classic deployed-but-not-working.**
- **`ACCESS_CONFIGURED: false`** and `secrets_present: ["FOUNDER_KEY"]` —
  **Q-002's Cloudflare Access decision has not been executed.** `ACCESS_TEAM_DOMAIN`,
  `ACCESS_AUD`, `FOUNDER_EMAIL` are unset on the Worker.
- Healthy: `d1_database` bound+healthy, `workers_ai` bound, `vectorize_memory` bound,
  `assets` bound, heartbeat alive (`2026-11-10T07:00:50.172Z`), Arena live at challenge
  **#5708**, WebSocket round trip `PROVEN LIVE` with fresh marker `probe-39a43c01`.
- Work cycle: `agent-work rows: 31`, newest **0.3 h** old, **8 distinct agents rotating** →
  `PROVEN: the work cycle fires the real cron against the real D1 — recent, repeating, and
  rotating.`

---

## 7. New governance surface

### `docs/OPERATOR_CHARTER.md` (v0.5, PRs #217 + #218, 689 lines)

**What authority it establishes:** a working operator charter for **Muse** as
operator/orchestrator — "a Jarvis/Alfred-style second brain." Its own header is explicit
and self-limiting: *"working charter, not constitutional law … It does **not** amend
soul.md, FABLE_DNA.md, or PERMISSIONS.md."*

Real constraints it fixes:
- **§2 priority order:** `soul.md` → `FABLE_DNA.md` → `docs/FOUNDERS_VISION.md`. Provider
  harnesses (`CLAUDE.md`, `.claude/`, `.mistral/`, `.grok/`, `.queen/`) are *"working notes,
  not governing law."* `THE_CODEX.md` is narrative canon, never engineering law.
- **§3:** canonical set is **F-001–F-006 only**; *"Only Mac, by formal amendment, can widen
  the canonical set."* F-007–F-011, F-012 kept in inventory, **not promoted to law**.
- **§4 three permission tiers** built from `PERMISSIONS.md`, plus the **small-merge rule**:
  Muse may merge small aligned changes **only** if they pass the full done ladder and touch
  **no** Tier 3 gate — *"Anything touching money, deletion, publishing, the Constitution, an
  external system, or an irreversible action still needs Mac's explicit approval, regardless
  of any switch, including Queen auto-approve."*
- **§5 done ladder:** compiles → tested → wired → merged → deployed → verified-live.
  Verified-live is what counts as done.
- **§1** makes DaVinci a **third** standalone lens alongside Devil's Advocate and Childlike
  Wonder.

**Conflict check vs `soul.md` / `FABLE_DNA.md`: NO CONFLICT.** It disclaims
constitutional status, ranks soul.md first, and its small-merge rule is *narrower* than
Tier 3, not wider.

**Two honest open items it leaves OPEN, not resolved** (§6): the truth hierarchy
(`production > code > plan > narrative`) is *"proposed only until Mac ratifies it"*, and the
**gut-vs-lenses policy is unanswered**. §7 Jasper disposition is also OPEN. Note the charter
leans on `~/workspace/...` paths (Jasper dissection, batch folder, continuity index) that
are **not in the repo** — so parts of it are not independently checkable from main.

### `docs/MESSIAH_COMPLEX.md` (PR #223, 49 lines)

**What it establishes: nothing authoritative — deliberately.** It is the Hive's own
encapsulation of the founder's dissertation, and the disposition step for blocked task 18.
Its closing section is explicit: *"It does not ratify any claim in the dissertation as Hive
law. Canonical law remains F-001–F-006 in soul.md. It does not authorize any money move,
publication, or external action. It does not change the charter, the Queen build order, or
the F-007 compound proposal #117."*

**Conflict check: NO CONFLICT.** It is a lens and a standing question, not law. Its
**Honest flags** section is a genuinely good piece of work: it marks the DUNS-number
reading as interpretation, the "strawman" argument as *"a sovereign-citizen-style argument
that courts consistently reject"*, the frequency claims as speculative, and corrects two
factual attributions (schizophrenia → Bleuler 1908/1911, not Kraepelin 1899; ADHD term
1987 but ADD from DSM-III 1980). Two placements are **queued behind the Queen 100% rule**:
a Queen-brain entry and a `messiah-complex` lens/skill. Neither exists yet.

One thing worth naming: the document turns its own thesis on the Hive, asking whether *"a
Queen who holds the founder's vision, agents who wait on her scoring, a founder whose word
is sovereign"* becomes another savior-figure. That is a live governance question, not
decoration.

### `docs/AUTONOMY_STAGES_AND_GATES.md` (PR #224, 323 lines)

**What it establishes: a design, explicitly NOT ratified.** Header: *"Draft, 2026-11-09.
Proposed repo design doc. Not Hive law, not a charter change … Nothing in this file
authorizes a switch flip, a merge, a deploy, a spend, or any build."*

It compresses the ratified 20-rung done ladder plus FABLE-5 into **7 stages, one
fail-closed gate each**, and a **16-proof taxonomy**. Its most load-bearing section is the
**FOUNDER GATE**, which handles a founder idea by *refusing* it rather than adopting it:

> Mac's idea on the 2026-11-09 call — "if it does it by itself, it can automatically flip
> certain switches as long as it has met the prerequisites" — is recorded here as a
> **PROPOSAL REQUIRING A FOUNDER DECISION, not as a rule.** It is not adopted by this draft.
> … It contradicts the standing rule until Mac explicitly changes that rule: Q-006 … and
> Q-007 … Nothing in this draft overrides Q-006 or Q-007.

It then names **six** pieces of evidence that would have to exist before the founder could
even consider auto-flipping — including *"the switch-9 truthiness bug fixed"* and *"an
explicit amendment of Q-006/Q-007, recorded on main."*

**Conflict check: NO CONFLICT — and it is the cleanest example in this audit of a document
declining to grant itself authority.** A founder suggestion that would have widened
autonomy was written down as a proposal with six preconditions instead of being
rubber-stamped, exactly as `MANDATE_TRIAGE.md` requires. It also honestly marks A3–A5 as
*"NOT defined in the record. This draft does not invent them."*

Two substantive facts it surfaces that belong in this audit:
- `POST /v11/command_text` (the "Commune with Kai El" path) is **verified live but
  UNAUTHENTICATED** — only a 30/min/IP rate limit, no founder auth. Founder-gating it is
  named as Queen work inside the Q-C sequence.
- The **Queen 100% rule** (Mac, 2026-11-09): *nothing else gets built until the Queen is
  100%, chronological Q-A → Q-B → Q-C*, with the Kai El chatbot inside that build. That
  rule, taken at face value, makes Q-C the gate on essentially all other new building.

**Precedence summary: all three new documents correctly subordinate themselves to
`soul.md` and `FABLE_DNA.md`. I found no governance conflict with either.** The real
governance risk is not conflict — it is **volume**: authority is now distributed across
`soul.md`, `FABLE_DNA.md`, `PERMISSIONS.md`, `FLIP_THE_SWITCHES.md`,
`docs/GOVERNANCE.md`, `docs/FOUNDERS_VISION.md`, `docs/OPERATOR_CHARTER.md`,
`docs/FOUNDER_ANSWERED`, `docs/FOUNDER_QUEUE`, `docs/AUTONOMY_STAGES_AND_GATES.md`,
`worker/schema/NANUET_AUTONOMY.md` and `.claude/HIVE_PULSE.md` — twelve places, two of
which (`GOVERNANCE.md`'s F-007–F-013, and F-005D/E/F) are now explicitly **void or
non-canonical** while still sitting in the repo saying otherwise.

---

## What needs the founder

Deduplicated. Each is genuinely waiting on a decision or an act only the founder can make.

1. **Authorise the F1 validator-cache fix — and fix it before executing Q-001.**
   Reproduced again today; all six fixed laws walk past it. The sweep's own instruction
   stands: *"Escalate rather than self-merge: this is production constitutional
   enforcement."* Q-001 (provision the Oracle box) is the event that converts this from
   latent to live. These two items are now coupled and should be sequenced, not run in
   parallel.
2. **Rotate / replace `ANTHROPIC_API_KEY`.** HTTP 401 `invalid x-api-key`, live, today.
   96 days of every agent turn silently running on a fallback provider. Single highest
   ratio of real capability restored to effort spent.
3. **Execute Q-001 (Oracle box) — or re-decide.** The decision is recorded; nothing in the
   repo has moved. It unblocks task 53 and the biosystem "Demo Mode" copy, and gives System
   A the staging twin Q-003 requires.
4. **Execute Q-002 (Cloudflare Access).** Live `ACCESS_CONFIGURED: false`; only
   `FOUNDER_KEY` is bound. Estimated 15–30 min of dashboard work per Q-002's own note.
5. **Decide on switch-9's truthiness read (N2 / open item QA-1).** The code deliberately
   refuses to change the gate's semantics without a founder decision. Required by
   `AUTONOMY_STAGES_AND_GATES.md` before switch 9 is ever touched.
6. **Approve a Q-C design pass, or confirm the Queen build pauses at Q-B.** Q-C is 0% built
   and the Queen 100% rule makes it the gate on all other building. This is the single
   biggest fork in the road.
7. **Decide whether the daily automation restarts — and under what cost control.** It was
   turned off deliberately for cost. If it is to come back, the repo needs: a re-pointed
   queue (it is 0-pending, so a firing would stop immediately), a refreshed
   `HIVE_PULSE.md`, and an explicit per-firing budget. Measured cost is ~83.5K tokens/task.
8. **Rule on the ~20 duplicate F-007 proposals** (#80–#115) in the live queue: bulk-close,
   coalesce into #117, or leave. Then decide whether `createGate` should also compare
   against non-`pending` rows.
9. **Rule on Q-003's staging step** so migration `001-add-normalized-title.sql`'s backfill
   can be applied somewhere. Currently neither staging nor production has it.
10. **Answer the two OPEN items the Operator Charter names itself:** the truth hierarchy
    (`production > code > plan > narrative`), and the gut-vs-lenses policy.
11. **Confirm tasks 16 and 17 are wanted** (or close them). Both have sat blocked on their
    own acceptance gate since 2026-08-11 with no founder ask on record either way.
12. **Rewrite or close task 23.** As literally written it now contradicts M-02 and M-06.

## What a session should do next — dependency-ordered

**Tier 0 — no founder decision required, highest value, do first**

1. **Refresh `.claude/HIVE_PULSE.md`.** It is 84 days stale and is the one page every
   autonomous firing reads first. Nothing else in Tier 0 is safe to automate while the
   read-first page is wrong. Fold in: Q-A/Q-B deployed, the ten Q- and nine M-decisions,
   8-provider waterfall, Actions-healthy, the routine's deliberate shutdown.
2. **Reconcile `.claude/tasks/CAMPAIGN.html` with `docs/FOUNDER_ANSWERED`.** Close tasks 2,
   18, 40; re-scope 23; update 41, 47, 20, 46, 53. This is what makes the 0-pending queue
   honest rather than merely literal. Depends on (1) only for consistency.
3. **Harden `scripts/check-claims.py` (F6/F7).** Four small changes, already specified in
   the sweep's §(d)4: `os.path.exists()` on cited test paths; require a SHA to resolve via
   `git cat-file -e` (or require ≥1 `a-f` character); require run IDs to carry a `run`
   prefix; and extend enforcement past `verified-live` so "never a bare done" gets its
   machine half. Add the five fabrications in §1b as its own fixtures. **Do this before
   (4)–(6)** so their claims are checkable.
4. **Cover the Worker action-request allow-list (F4).** Export `validateActionRequest` and
   `executeApprovedAction`; write tests that make M10/M11/M13 fail. Behaviour is already
   correct — this only pins it.
5. **Close the M16 gap (F5 remainder).** One test asserting the Queen cannot self-approve
   with the master switch off. This is the highest-severity *remaining* coverage hole:
   today, auto-approval could become unconditional and CI would stay green.
6. **Cover `create-gate.js` / `lens/` (N1).** Wired at three proposal-write sites since
   2026-09-30 with zero tests. Include a test for the near-duplicate case the live queue
   actually exhibits.
7. **Add the automaton suite to CI (F8)** — a third job mirroring the Worker job; ~0.3 s.
   And **pin both automaton switch defaults (F10)** — one test, no env set.
8. **Decide and document `tokenOk`'s DB-error fail-open (F11)** and
   `tests/integration/`'s `continue-on-error` (F9) — in both cases, write the reason into
   the step so the next session does not read green as passing.
9. **Fix or retire `Deploy GitHub Pages`.** Red on every main push for 10+ runs; Q-010 and
   Charter §6 both make the surface legacy, so retiring the workflow is probably correct.

**Tier 1 — needs a founder decision first (in dependency order)**

10. Validator cache fix (item 1 above) — **before** any System A provisioning.
11. `ANTHROPIC_API_KEY` rotation (item 2) — independent, can go any time.
12. Q-002 Cloudflare Access execution — independent.
13. Q-001 Oracle provisioning → then Q-003 staging → then the migration backfill.
14. Switch-9 truthiness decision → then any switch-9 work at all.
15. Q-C design pass → Nanuet owns the campaign queue → founder-gating `/v11/command_text`
    → the Kai El real terminal.
16. Task 40 (proposal #5 discovery, propose-only) and task 41 Tier 1 — both now have
    founder scope and are buildable.

---

## UNVERIFIED — what this container could not check

Stated plainly, because an honest "unverified" is more useful than a confident guess.

1. **Live routine / scheduled-task state for `trig_01CJsVYwDs4pHMoFEC5JFi7V`.** No tool in
   this session can read it. Its deliberate founder shutdown is taken from the coordinator's
   correction, not from repo or API evidence. The repo contains no record of the shutdown
   at all — which is itself worth fixing.
2. **Anything on `origin/main` between 2026-08-19 and 2026-09-19.** The clone is shallow
   (83 commits, oldest `701f5cf` dated 2026-09-19). PR #204's own diff is unreadable
   because its first parent is grafted — `git diff 701f5cf^1 701f5cf` fails with
   `fatal: bad revision`. Any work merged in that month-long window is invisible from here.
   The large "+300 lines `.claude/HIVE_PULSE.md`" that `git show --stat 701f5cf` reports is
   a graft artifact, **not** evidence that `.claude/` was deleted and restored.
3. **Whether `normalized_title` is actually populated in production D1.** I verified that
   `ensureTables` runs the `ALTER TABLE` (`worker/src/index.js:592`), so the column should
   exist, and that `DEPLOY_WIRE_LEDGER.md:29` says the migration file was never applied to
   prod, so the backfill `UPDATE` and the partial index should be absent. I could not query
   D1 to confirm either. The duplicate-proposal evidence is consistent with this reading but
   does not prove it.
4. **Whether the live Worker build actually contains PR #224's main tip.**
   `/v11/debug/git` reports `deployed_via: "Cloudflare Workers Builds from main"` but
   `available: false` with no commit SHA, so deployed-code identity cannot be pinned to a
   SHA from here. Task 46's underlying branch-deploy configuration question is therefore
   still open.
5. **Live `/v11/nanuet/brain` and `/v11/nanuet/autonomy` state.** Both routes exist and are
   unauthenticated, but `edge-health-probe` does not yet probe them, so I read Q-A/Q-B
   status from code and `wrangler.jsonc` rather than from production. **Adding these two
   routes to `edge-health-probe.yml` would make the Queen's real ladder state observable
   every run — a cheap, high-value change.**
6. **The Operator Charter's `~/workspace/` references** (Jasper dissection, batch folder,
   `OPERATOR_CONTINUITY.md`) are outside the repo and unreadable from here, so §7, §12 and
   §16 cannot be independently checked.
7. **`automaton` financial/replication switch state in any real deployment.** Verified
   `false` at import time locally; no deployed automaton instance was probed.
8. **Whether task 9a's `add_repo` blocker has genuinely lifted.** The tool with push access
   is present in this session's surface, which differs from the 2026-08-02 denial, but I did
   not invoke it — out of this audit's read-only scope. Needs one real attempt.
9. **F14 (`founderAuthOk` non-constant-time `===`)** was not re-probed this pass; no reason
   to believe it changed, and its exploitability remains unverified as in August.

---

### Audit provenance

- Repo state: `origin/main` @ `b4ebd6d`, read via `git archive` into an isolated snapshot.
- Production state: `edge-health-probe` run **42774339095** (2026-11-10T07:18Z), full log.
- Workflow health: `gh run list` / `gh run view --log-failed`, 2026-11-10.
- Suites run for real: worker **370/370**, python **397 passed**, automaton **27/27**,
  `check-claims.py` exit 0.
- 8 mutations applied and restored; `worker/src/index.js`, `backend/core/validator.py` and
  `automaton/src/config.js` all sha256-verified byte-identical afterwards.
- No file in `/home/user/THEHIVE` was modified by this audit except the creation of this
  report. No commit, push, checkout, reset or merge was run. Nothing found here was fixed.
