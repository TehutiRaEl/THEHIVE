# FABLE SWEEP — 2026-08-19

Adversarial re-audit of work already marked **done**, run under
`.claude/skills/fable-debugger/SKILL.md` (probe before claiming, contrast against a
working sibling, verify where it actually runs, never fake a green) and
`.claude/skills/devils-advocate-audit/SKILL.md` (nothing is reported broken — is that
because nothing is, or because nobody re-ran it?). Claim vocabulary per
`.claude/skills/wired-or-not/SKILL.md`.

**Method: 36 real mutations across three codebases, 25 killed, 11 survived, every one
restored byte-identically.** Plus direct invocation probes of four gates that no test
touches. Nothing here is a read-and-reason verdict.

**Scope note, stated plainly:** this lane was asked to spawn its own sub-agents. No
Agent/Task tool is exposed in this lane's tool surface, so all five target areas were
executed directly, in this container, by this session. No sub-agent was spawned and none
is claimed.

---

## (a) Plain English — what this found

Think of the tests as a burglar alarm. The only way to know an alarm works is to break a
window on purpose and check that it screams. So that is what this sweep did: it
deliberately broke 36 things that the tests claim to protect, and watched which ones the
tests actually noticed.

Most of the alarm works. The login gates, the rate limits, the Cloudflare sign-in
checks, the provider routing, and the automaton's five famous safety fixes all screamed
loudly when broken — those are genuinely real, and both `verified-live` claims in the
campaign file turned out to be backed by real evidence when the run logs were actually
opened and read.

But three rooms have no alarm at all. **The most serious one is in the constitution
enforcer.** It keeps a five-second memory of "this action was fine last time" — and that
memory is filed under the action's *name only*, ignoring the details of the request. So
if you ask it something harmless once, then within five seconds ask it the same-named
thing with a rule-breaking request attached, it says yes. This was proven by actually
running it: all six fixed laws (F-001 through F-006) can be walked straight past this
way, including F-005, the law whose entire job is "no flag may ever override a fixed
law." Two mutations that rip the cache out entirely still leave all 397 tests green, so
nothing would ever catch this.

The saving grace is that this code is not deployed anywhere — the FastAPI backend is a
blueprint that runs nowhere, confirmed again in this sweep's own log reading. So this is
a landmine, not a fire. But it would go live the moment anyone provisions that backend.
The other two unalarmed rooms are the Worker's GitHub-action approval list and the
Queen's self-approval switch — both work correctly today, both proven by direct probing,
and both would ship silently broken if anyone edited them, because the test suite cannot
tell the difference.

---

## (b) Findings

Severity order. **CONFIRMED** = reproduced by running it. **PLAUSIBLE** = strong evidence,
one inference not closed.

| # | Severity | Finding | Evidence | Status |
|---|---|---|---|---|
| F1 | **CRITICAL** | **The constitutional validator's cache bypasses all six fixed laws.** `validate()` caches on the action string alone while every F-check reads `context`. One passing call opens a 5s window in which the same action name is allowed regardless of context. | `backend/core/validator.py:60-64` (`cache_key = action`), `:86` (only passes are cached), `:53` (`_cache` is a **class** attribute — proven shared: `ConstitutionalValidator._cache is v2._cache` → `True`), `:217` (module-level singleton). Probe output: `update_permissions` + `override_fixed_law=True` → `allowed=True`; `restrict_access` with no rationale → `allowed=True`; `decline_workflow` + `apply_wealth_penalty=True` → `allowed=True`; `data_delete` at `delete_rate_last_hour=9999` → `allowed=True`; `change_wealth_formula` + `retroactive=True` → `allowed=True`. After a 5.2 s sleep the same call correctly returns `allowed=False law=F-002`, confirming the cache is the mechanism. | CONFIRMED |
| F2 | **CRITICAL** | **F1 has zero test coverage.** Disabling the cache outright, and setting `CACHE_TTL` to 99999, each leave **397 passed**. The two existing cache tests (`tests/unit/test_validator.py`, `TestValidatorCache`) assert the cache *populates* and that violations are *not* cached — never that a cached allow is still correct for a different context. Its own comment ("action may be retried with corrected context") shows the author reasoned about varying context in the deny direction and missed the symmetric allow direction. | `MUT[P1-cache-disabled] → 397 passed`; `MUT[P2-TTL-99999] → 397 passed`. Line coverage on the file is 98%, which is why this never surfaced. | CONFIRMED |
| F3 | **HIGH** | **Blast radius of F1: both halves are caller-controlled.** `POST /v11/validate` passes the request body's `action` **and** `context` straight into the shared singleton, so priming the cache and then exploiting it is two ordinary API calls. | `backend/api/routes.py:1109` — `result = validator.validate(req.action, req.context)`. Other callers: `backend/api/middleware.py:136`, `backend/core/governance.py:159`, `backend/core/constitution.py:131`. | CONFIRMED |
| F3m | — | *Mitigation for F1–F3:* System A is **not deployed anywhere**, so this is latent, not live. Re-confirmed inside this sweep's own evidence reading. | `edge-health-probe` run `32171115429`, step 7: `https://thehive-queen.onrender.com/v11/health` → `status=404`, `::notice::System A (FastAPI backend) is NOT live`. | CONFIRMED |
| F4 | **HIGH** | **The Worker's action-request allow-list — the only path in the Worker that causes real GitHub side effects — has zero regression coverage.** Four separate mutations that fully disable it all pass **256/256**: accepting off-list actions, bypassing the workflow allow-list, removing the git-ref regex, and deleting the documented execution-time re-validation entirely. Neither `validateActionRequest` nor `executeApprovedAction` is exported, so no unit test can reach them. The one test that mentions `executeApprovedAction` is a negative test about the `modified` decision, and it uses `"action":"noop"` — an off-list action that is never validated. | `worker/src/index.js:392` (`validateActionRequest`), `:405-410` (`executeApprovedAction` re-validation), `:355` (`WORKFLOW_DISPATCH_ALLOWLIST`), `:385` (ref regex). `MUT[M10/M11/M12/M13] → pass=256 fail=0` each. Test: `worker/test/routes.test.js:600`. | CONFIRMED |
| F5 | **HIGH** | **The Queen's autonomous-approval gate has zero coverage.** Three mutations survive 256/256: dropping the alignment threshold from 98 to 0, ignoring an Elder Council veto, and **bypassing the `QUEEN_AUTONOMOUS_APPROVAL` master switch entirely** so the Queen self-approves even when the founder never flipped switch 9. `checks-and-balances` exists specifically to police this authority; the code implementing it is untested. | `worker/src/index.js:2061-2078` (`queenDecide`), `:2063` (switch), `:2068` (threshold), `:2070-2072` (veto). `MUT[M14/M15/M16] → pass=256 fail=0` each. | CONFIRMED |
| F6 | **MEDIUM-HIGH** | **`scripts/check-claims.py` accepts fabricated evidence — 4 of 5 fake references pass.** It checks that a reference *matches a pattern*, never that it *resolves*. `\b[0-9a-f]{7,40}\b` matches any 7+ digit decimal number, so a date and a phone number both qualify as "a commit SHA". A nonexistent run ID and a nonexistent test-file path also pass. Its own docstring promises "a reference someone can check without trusting the claimer." | `scripts/check-claims.py:29-33`. Real run against a crafted fixture: task 901 (`20260807`) PASS, task 902 (`5551234567`) PASS, task 903 (run `99999999999`, does not exist) PASS, task 904 (`worker/test/totally-made-up.test.js`, does not exist) PASS; only task 905 (no number at all) was caught. | CONFIRMED |
| F7 | **MEDIUM** | **The CI claim check covers 2 of 60 tasks.** It only inspects blocks containing the literal `verified-live`. 58 task blocks are outside enforcement entirely, including 27 that assert "done" with no level marker. CLAUDE.md's standing default is *"Never write a bare `done`"* — that rule has no machine enforcement at all; only its `verified-live` sub-case does. | `scripts/check-claims.py` output: `checked 2 task(s)`. Parse of `.claude/tasks/CAMPAIGN.html`: 60 task blocks, 8 carrying an explicit `level:`, 27 saying "done" with none. | CONFIRMED |
| F8 | **MEDIUM** | **The automaton test suite never runs in CI.** `ci.yml` has exactly two jobs — pytest, and the Worker. The five safety-gap tests only execute when a human types `cd automaton && npm test`. The gaps they guard are the financial, self-modification and self-replication gates. | `.github/workflows/ci.yml:12-73` — no automaton step exists. | CONFIRMED |
| F9 | **MEDIUM** | **Integration tests cannot fail CI.** The step carries `continue-on-error: true`, so `tests/integration/` is advisory only. Unit coverage is also floored at just 45%. | `.github/workflows/ci.yml:32-33`, `:30` (`--cov-fail-under=45`). | CONFIRMED |
| F10 | **MEDIUM** | **`AUTOMATON_REPLICATION_AUTONOMY`'s default-off is unguarded.** Flipping its default from `false` to `true` passes **27/27**. Every test passes an explicit config to `makeTestContext`, so neither switch default is directly asserted; the financial one is only *accidentally* covered (its mutation is caught by the wallet-key test, not by a switch test). Both switches genuinely are `false` at runtime — that part of CLAUDE.md's claim holds. | `automaton/src/config.js:52`. `MUT[A7] → pass=27 fail=0`; `MUT[A6-financial-default-ON] → fail=1`. Runtime import: `financialAutonomy = false`, `replicationAutonomy = false`. Tests: `automaton/test/gap-closure.test.js:150,160,176`. | CONFIRMED |
| F11 | **MEDIUM** | **`tokenOk` fails OPEN on a database error, undocumented and untested.** With `WORKER_ADMIN_KEY` set — the production posture — a D1 exception makes *any* non-empty bearer token valid. Flipping it to fail closed passes 256/256. Contrast the sibling `rateLimitOk`, whose fail-open is deliberately documented at length precisely because it "is not a security boundary"; `tokenOk`'s comment documents only the no-key dev-mode fail-open, not this one. | `worker/src/index.js:187` — `} catch { return true; }`. `MUT[M5] → pass=256 fail=0`. Sibling rationale: `worker/src/index.js:138-141`. | CONFIRMED (behaviour + gap); whether it is intentional is **unverified** |
| F12 | **LOW** | **Production's provider waterfall has been degraded for 11+ days.** Every one of the 8 agent-work rows in the most recent probe reads `wanted reasoning, fell back (that provider is not answering)`. On 2026-08-07 only the 2 newest rows showed fallback; by 2026-08-18 all 8 did. Root cause is already named in-repo (rotate `ANTHROPIC_API_KEY`) and still unresolved. The work cycle is running — on its backup provider, every single turn. | Run `32171115429` step 4 log vs run `31216919290` step 4 log. Named in commit `31f174b`. | CONFIRMED |
| F13 | **LOW** | **CLAUDE.md's "full test suite (256 passed)" for the 2026-07-30 F-law reconciliation matches neither suite's history.** `worker/test/` did not exist until 2026-08-07 (commit `24d6d45`), so 256 cannot be the Worker count. The Python suite had 302 `def test_` at the 2026-07-30 commit `2eb9be3` and has 397 today. 256 is exactly *today's* Worker count. | `CLAUDE.md:172`. `git log --diff-filter=A -- worker/test/` → `24d6d45 2026-08-07`. `git grep -c "def test_" 2eb9be3 -- tests/` → 302. | PLAUSIBLE (test-def count is not strictly the collected count) |
| F14 | **LOW** | `founderAuthOk` compares the key with `===`, a non-constant-time comparison. Standard finding class; practical exploitability across network jitter is low, and it is recorded for completeness rather than as an urgent risk. | `worker/src/index.js:234` — `return !!key && key === secret;` | CONFIRMED (present); exploitability **unverified** |

---

## (c) NULL RESULTS — checked, genuinely fine

An audit that only ever finds problems is doing motivated reasoning. These were probed
for real and held up.

1. **Both `verified-live` claims are honest, and the evidence actually proves the claim.**
   This was the single most likely place to find a false claim, given the 34-of-36
   precedent. It did not. Task 14 (run `32171115429`): a real WebSocket opened to
   `wss://thehive.sovereignhive.workers.dev/v11/ws`, a random nonce `probe-d5889468`
   POSTed, and the *same nonce* received back over the socket — a genuine round trip with
   a fresh marker, not a tautological check. Task 48 (run `31216919290`): 7 distinct
   agents, newest row 0.2 h old, real hourly rotation against real D1, with three
   independent failure conditions that can each fail. Both runs verified as real via the
   GitHub API (`conclusion: success`), and both step logs read in full.
2. **The three intentionally-different security defaults are all still correct.**
   `founderAuthOk` fails **CLOSED** (`worker/src/index.js:231`) — killed by 4 tests across
   4 route families. `tokenOk` fails **OPEN** with no admin key (`:178`) — killed by 29
   tests. `rateLimitOk` fails **OPEN**, both its KV and D1 paths (`:150`, `:159`) — each
   threshold mutation killed by 2 tests. None has been quietly flipped.
3. **Every Cloudflare Access JWT check is enforced and covered.** Removing the audience
   check, the expiry check, the signature check, or the founder-email allow-list each
   fails tests (M6–M9). The suite signs with a real RSA keypair rather than mocking crypto.
4. **Provider routing, provider-health backoff and work-cycle rotation are strongly
   covered.** M17–M19 killed by 4, 3 and 5 tests respectively, including a named
   regression test for the round-robin.
5. **The Worker's action-request gates genuinely work today** — despite having no tests.
   Eight real invocations: off-list action rejected 400; off-allow-list workflow rejected
   400; a shell-injection-shaped git ref rejected 400; a negative `run_id` rejected 400; a
   valid request queued as *pending*; the bypass attempt (smuggling
   `kind:"action-request"` through the generic `/proposals` route) correctly refused 400;
   and — the documented second gate — approving a *stored* off-list action returns
   `executed:false, reason: "failed re-validation at execution time"` even with a GitHub
   token bound. The source comment's "two independent gates" claim is true.
6. **The Queen's approval gate genuinely works today** — despite having no tests. Four
   scenarios probed: switch off + score 100 → `pending`; switch on + score 97 → `pending`;
   switch on + score 99 → `approved` by `queen`; switch on + score 99 + Elder veto →
   `pending` with the veto note recorded.
7. **`queenDecide` really is structurally unreachable for `action-request` proposals**, as
   its comment claims — the dedicated route hard-codes `'pending'` and never calls it
   (`worker/src/index.js:2552-2564`), and the generic route 400s that kind outright
   (`:2531`). No alignment score can skip the stricter gate.
8. **Automaton gaps 1, 2, 3 and 5 are genuinely enforced by tests that fail when the
   enforcement is removed.** Disabling path protection (A1), removing `financial.js` from
   the protected list — the exact upstream gap shape (A2), narrowing the money caps back to
   an allow-list (A3), turning `pending_approval` into a hard deny (A1b), letting
   `spawn_child` skip the approval queue (A4), and letting an approved spawn run with the
   switch off (A5) each fail. The gap-2 fix is structural (any request declaring
   `moneyMovementCents` inherits every cap) rather than a longer allow-list, which is the
   stronger design.
9. **Automaton gap 4 confirmed by direct invocation.** Creating an identity writes only
   `{address, mode:"simulated", createdAt}` — the random seed is derived from and
   discarded, so there is no key material on disk at all. With `financialAutonomy: true`
   it throws loudly rather than fabricating a real-looking identity.
10. **All six F-law checks and the severity logic are meaningfully covered.** P3–P9 each
    killed by named tests in `tests/unit/test_validator.py`. The answer to "does the suite
    cover F-001..F-006 or mostly trivia" is: it covers them properly. The cache (F1) is the
    one hole, and it happens to be the hole that voids all six.
11. **Baselines are real, not asserted:** worker 256/256, automaton 27/27 (CLAUDE.md cites
    15/15 for `gap-closure.test.js` alone; `sandbox-run.test.js` adds the rest), backend
    pytest **397 passed**, `check-claims.py` exit 0.
12. **Every mutation was restored byte-identically.** Final state: `worker/src/index.js`
    sha256 `52a97da814abdd09ce4083359caca575711e0a79f1d2788537623f862af6f2b3`,
    `backend/core/validator.py` sha256
    `b22a283a20ea2166c1fb63b35c7bbcd5f48f7b4df136b5899b27bc423ee32d59`, `git diff --stat`
    empty, `git status --porcelain` empty, and all three suites re-run green afterwards.

**Method note, recorded against premature convergence:** the first Queen probe appeared to
show the Elder veto being ignored. It was the probe that was wrong — it emitted
`VETO: ...` where the code parses `VERDICT: OBJECT`. Re-running with the real protocol
showed correct behaviour. Had that first result been reported, it would have been a
fabricated finding. Probes get debugged before their output becomes a claim.

---

## (d) Recommended follow-ups — each scoped to one PR

Ordered by severity. None were fixed here; fixing mid-audit is against the method.

1. **Fix the validator cache (F1/F2/F3).** Either key the cache on `(action, context
   fingerprint)` or delete it — 397 tests pass without it, so it is buying nothing that is
   currently measured. Ship with a regression test that primes with a benign context and
   asserts a violating context on the same action is still denied, for each of F-001–F-006.
   *Escalate rather than self-merge: this is production constitutional enforcement.*
2. **Cover the Worker action-request allow-list (F4).** Export `validateActionRequest` and
   `executeApprovedAction`, then add tests that make M10–M13 fail: off-list action, off-list
   workflow, malformed git ref, and a stored off-list action surviving to execution-time
   re-validation. The behaviour is already correct — this only pins it.
3. **Cover the Queen approval gate (F5).** Four tests mirroring the probe in §(c)6, so
   M14–M16 die. Prioritise the master-switch one: today, auto-approval could become
   unconditional and CI would stay green.
4. **Harden `check-claims.py` (F6).** Three small changes: `os.path.exists()` on a cited
   test path; require a SHA to resolve via `git cat-file -e` (or require at least one
   `a-f` character so bare decimals stop qualifying); require run IDs to carry the `run`
   prefix. Its own fixture-based self-test should include the five fabrications above.
5. **Add the automaton suite to CI (F8).** A third job in `ci.yml`, mirroring the Worker
   job. Zero dependencies, ~0.3 s runtime.
6. **Decide on `tests/integration/`'s `continue-on-error` (F9).** Either make it blocking
   or write the reason it is not directly into the step, so the next session does not read
   green as passing.
7. **Pin both automaton switch defaults (F10).** One test asserting `config.financialAutonomy
   === false` and `config.replicationAutonomy === false` with no env set.
8. **Decide and document `tokenOk`'s DB-error fail-open (F11).** Whichever way it goes, pin
   it with a test — an undocumented, untested security default is the problem, more than
   the direction itself.
9. **Rotate `ANTHROPIC_API_KEY` / restore the reasoning provider (F12).** Founder-gated.
10. **Extend claim enforcement past `verified-live` (F7).** Make `check-claims.py` require
    *some* level marker on any task asserting completion, so the "never a bare done" rule
    has the machine half it currently lacks.
11. **Correct or drop CLAUDE.md's "256 passed" (F13).** One line.

---

## Appendix — mutation ledger

36 mutations. Every one restored and hash-verified.

**Worker (`worker/src/index.js`) — 19 run, 11 killed, 8 survived**

| ID | Mutation | Result |
|---|---|---|
| M1 | `founderAuthOk` fail-closed → fail-open | KILLED (4) |
| M2 | `tokenOk` dev-mode fail-open → closed | KILLED (29) |
| M3 | rate limit, D1 path, 30 → 30000 | KILLED (2) |
| M4 | rate limit, KV path, 30 → 30000 | KILLED (2) |
| M5 | `tokenOk` DB-error catch, open → closed | **SURVIVED** |
| M6 | Access JWT audience check removed | KILLED (1) |
| M7 | Access JWT expiry check removed | KILLED (1) |
| M8 | Access JWT signature check removed | KILLED (4) |
| M9 | Access JWT founder-email allow-list removed | KILLED (1) |
| M10 | unknown action accepted by allow-list | **SURVIVED** |
| M11 | workflow-dispatch allow-list removed | **SURVIVED** |
| M12 | git-ref regex removed | **SURVIVED** |
| M13 | execution-time re-validation removed | **SURVIVED** |
| M14 | Queen score threshold 98 → 0 | **SURVIVED** |
| M15 | Elder veto ignored | **SURVIVED** |
| M16 | `QUEEN_AUTONOMOUS_APPROVAL` switch bypassed | **SURVIVED** |
| M17 | `providerOrder` `only` pin ignored | KILLED (4) |
| M18 | work-turn rotation frozen at 0 | KILLED (3) |
| M19 | provider-health backoff disabled | KILLED (5) |

**Automaton (`automaton/src/`) — 8 run, 7 killed, 1 survived**

| ID | Mutation | Result |
|---|---|---|
| A1 | `isProtectedWritePath` → always false (gap 3) | KILLED (3) |
| A2 | `financial.js` dropped from protected list (gap 3) | KILLED (2) |
| A3 | money caps narrowed to `transfer_credits` only (gap 2) | KILLED (2) |
| A1b | `pending_approval` → hard `deny` (gap 1) | KILLED (2) |
| A4 | `spawn_child` skips the approval queue (gap 5) | KILLED (1) |
| A5 | approved spawn runs with autonomy off (gap 5) | KILLED (1) |
| A6 | `AUTOMATON_FINANCIAL_AUTONOMY` default → true | KILLED (1) |
| A7 | `AUTOMATON_REPLICATION_AUTONOMY` default → true | **SURVIVED** |

**Backend (`backend/core/validator.py`) — 9 run, 7 killed, 2 survived**

| ID | Mutation | Result |
|---|---|---|
| P1 | cache lookup disabled | **SURVIVED** (397 passed) |
| P2 | `CACHE_TTL` 5 → 99999 | **SURVIVED** (397 passed) |
| P3 | F-001 rate limit 10 → 10000 | KILLED (2) |
| P4 | F-002 retroactive check removed | KILLED (1) |
| P5 | F-003 `force_workflow` allowed | KILLED (3) |
| P6 | F-004 rationale requirement removed | KILLED (2) |
| P7 | F-005 override flag honoured | KILLED (3) |
| P8 | F-006 wealth penalty allowed | KILLED (2) |
| P9 | severity always `warning` | KILLED (2) |

Probes that no test performs are reproducible from this file's descriptions; the probe
scripts themselves were written to the session scratchpad, deliberately not committed,
since committed tests are task 2/3's deliverable and not this audit's to write.
