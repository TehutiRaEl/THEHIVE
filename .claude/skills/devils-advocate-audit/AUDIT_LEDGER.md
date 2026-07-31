# Devil's-Advocate Audit Ledger

Tracks every module actually re-verified by this skill's loop (reproduce-and-run, not
read-and-reason), so the sweep is resumable across sessions and honest about what's
still owed a real pass. **A module not listed here has not been audited by this skill —
its existing tests passing is not the same claim.**

## How to read this file

Each entry: what was checked, how (the actual command/invocation run, not "reviewed the
code"), the verdict, and the date/session. Verdicts:
- **CONFIRMED CORRECT** — re-run for real, held up, no bug found
- **BUG FOUND — FIXED** — re-run for real, broke, fixed under normal authority rules (PR
  if production code, direct commit only if pure test-file-only)
- **BUG FOUND — ESCALATED** — re-run for real, broke, needs founder input before fixing
- **COULD NOT VERIFY** — genuinely blocked (missing connector/credential/environment) —
  say why; never silently upgrade this to a pass

---

## Entries

### 2026-07-31 — `backend/core/wallet.py` (`WalletManager`)

**Verdict: BUG FOUND — FIXED** (this is the finding that created this skill, not an
output of running it — logged here as the ledger's seed case and the reason the skill
exists)

- **How it was actually found:** writing `tests/unit/test_wallet.py` and running it for
  the first time — not a read-through, not a diff review of the PR that introduced it.
- **What broke:** `credit()` held a `get_db()` connection across a call to its own
  `create_wallet()`, which fetches the same thread-local connection and closes it —
  every `credit()` call (every SOUL grant, tip, arena payout) raised
  `sqlite3.ProgrammingError: Cannot operate on a closed database`.
- **Coupled-bug check performed:** yes — re-read `debit()`, `tip()`, `transfer()` after
  the fix; none share the same nested-call-closes-connection shape. `staking.py`'s
  `claim_rewards()` was separately audited (see below) since it also calls
  `wallet_manager.credit()`.
- **Fixed via:** PR #135, reordering so `create_wallet()` runs first and `credit()`
  re-fetches its own connection afterward. 26 new tests, including a total-supply
  invariance check across transfers (Fixed Law #4).

### 2026-07-31 — `backend/economy/staking.py` (`StakingManager`)

**Verdict: CONFIRMED CORRECT** (after one test-authoring mistake corrected — see note)

- **How it was actually checked:** wrote `tests/unit/test_staking.py`, ran it for real.
- **Note, for honesty:** the first draft of the test suite produced 3 failures by
  simulating "already matured" positions via a negative `staking_lock_days` — that
  broke the reward-decay formula's own assumption (that the setting is unchanged
  between stake time and claim time, true in real production). This was a test-fixture
  bug, not a `staking.py` bug — confirmed by rewriting the fixture to backdate
  `locked_until` directly instead, after which all 19 tests passed cleanly. Recorded
  here so it isn't mistaken for a second real bug on a future re-read of this ledger.
- **Coupled-bug check performed:** yes — `claim_rewards()`'s call into
  `wallet_manager.credit()` (the exact function that broke in the wallet.py finding
  above) was exercised for real by these tests and did not reproduce the earlier bug,
  confirming the wallet.py fix actually holds under a second, independent caller.

### 2026-07-31 — `backend/core/agency.py` (`SwarmAgency`)

**Verdict: CONFIRMED CORRECT**

- **How it was actually checked:** wrote `tests/unit/test_agency.py` (28 tests), ran it
  for real — OBSERVE/PROPOSE/EXECUTE/DEVIATE ladder, the permanent block-list, the
  30s decision cache, revocation semantics.
- **One quirk documented, not fixed:** the OBSERVE branch returns before the
  `_BLOCKED_ACTIONS` hard-block check runs, so a blocked action *name* at OBSERVE level
  is reported allowed. Not treated as a bug: OBSERVE is defined as read-only, so no
  caller should ever request OBSERVE on an action that needs blocking in the first
  place. Flagged here rather than silently fixed, since changing it without confirming
  the intended contract would be scope creep beyond what devil's-advocate found —
  worth a deliberate look, not an assumed fix.

### 2026-07-31 — `backend/api/colony.py` (`_verify_hive_signature`)

**Verdict: CONFIRMED CORRECT, one architecture-wide gap flagged (not fixed here)**

- **How it was actually checked:** the ten devil's-advocate questions applied first
  (see below), then an independent verification script — written fresh, not reusing
  `tests/unit/test_colony.py`'s `_sign()` helper — that hand-computes HMAC-SHA256 and
  drives the real endpoint through `TestClient`. This is the "independent
  re-derivation" this file's earlier entry for this target said hadn't happened yet.
- **Checks run and result:** permissive-when-placeholder holds; an independently
  hand-computed correct signature is accepted; a 1-byte-tampered body with the
  original signature is rejected; a signature computed with the wrong secret is
  rejected; an empty body doesn't crash the HMAC layer; a wrong-case `SHA256=` prefix
  is correctly rejected (case-sensitive `startswith`). 7/7 as expected.
- **Real finding, not a false alarm:** no replay protection — a validly-signed event
  can be resent byte-for-byte and is accepted again, since the signature covers only
  the body and nothing binds it to a single use (no nonce, no enforced freshness
  window on the optional `timestamp` field). Checked whether this is unique to
  colony.py: it is not — the same raw-body-HMAC-only pattern is shared by every
  colony's `/colony/events` implementation and by `hive_mesh.py`'s outbound signer, so
  this is a federation-wide design gap, not a single-file bug. Correctly **not**
  patched unilaterally here: fixing replay protection in one file while five other
  colonies keep the old pattern would create exactly the kind of one-off divergence
  fable-debugger's "match the proven path" rule warns against. Logged for the founder
  to decide whether it's worth a coordinated fix across all six colonies.
- **Devil's-advocate questions that actually surfaced something:** "what happens if a
  dependency disappears" → confirmed the permissive fallback fires correctly when
  `jwt_secret_key` is unset *or* left at the literal placeholder value, but whether
  production has actually been given a real, non-placeholder secret is not something
  this session can check from here (System A isn't deployed anywhere live to inspect)
  — noted as a founder-confirmation item, same class as the other founder-action
  items already tracked in the roadmap. "What does the attacker do with this" is where
  the replay finding above came from.

### 2026-07-31 — Dead/unused code sweep (`backend/`, `worker/src/index.js`, `frontend/src/`)

**Verdict: mixed — several BUG-ADJACENT FINDINGS (dead code, not behavior bugs), one large ARCHITECTURAL FINDING, most of the rest CONFIRMED CORRECT (properly gated, not dead)**

- **How it was actually checked:** a background `Explore` subagent, grep-based
  importer/caller checks per candidate (not a read-through) — for the worker, verified
  every top-level function has a real call site within the file; for the frontend, built
  an actual import-reachability graph (BFS from `main.tsx`, including `lazy()`/`import()`)
  across all 149 `.ts`/`.tsx` files rather than eyeballing folders.
- **Confirmed dead, high confidence (needs founder confirmation before delete, not yet
  deleted):** `backend/guilds/*.py` (all 12 modules — genuinely orphaned, *not*
  flip-the-switch gated; `enable_guilds` config only feeds a log line, never constructs
  any of these classes, so this is a real distinction from the worker's gated features);
  a **third** `frequency_guild.py` duplicate (`backend/guilds/frequency_guild.py`,
  shadowing the real `backend/core/frequency_guild.py` — same shape as the two duplicates
  already known); a **fourth** duplicate, `backend/utils/rate_limiter.py` (shadowed by
  `middleware.py`'s own inline `RateLimiter`); `backend/mcp/` (already self-documented as
  dead in `backend/CLAUDE.md`, just never actually removed); 7 more zero-importer
  standalone modules (`agent_identity.py`, `audit_chain.py`, `phase_manager.py`,
  `resonance.py`, `sheaf_crypto.py`, `memory/episodic_memory.py`, `memory/vector_store.py`,
  `utils/crypto.py`, `utils/helpers.py`).
- **Correctly NOT flagged — gated, not dead:** `backend/tier3/*` (conditionally imported,
  tested); `backend/tier2/*` shim modules (re-export the real `tesseract_math` package,
  confirmed to exist); the worker's `processQueueBatch` (deliberately unexported per
  `FLIP_THE_SWITCHES.md` §6, same pattern L-08 already covers).
- **Real finding beyond dead code — an architectural one:** 56 of the frontend's 89
  "unreachable" files are not stray dead code, they're a coherent second app —
  `pages/CommandCenter.tsx`, a full `components/colony/` console set, `HiveDashboard`,
  `ConstitutionHall`, `MemoryVault`, `TesseractChamber`, etc. — self-identified in
  `frontend/src/README.md` as the "Mistral Frontend Command Center Branch." This is the
  physical presence, in this checkout, of the second frontend effort `CLAUDE.md`'s "not
  yet reconciled" section already named as unreconciled (`feature/gamified-ui-components`)
  — not a new discovery of the gap, but the first confirmation of exactly what and how
  much code is sitting there. Large and coherent enough that it may be a revival
  candidate rather than a deletion candidate — correctly left as a founder decision, not
  assumed either way. (The other 33 unreachable files — `worlds/`, `voxel/`, `xp/`,
  `avatars/`, `conversation/` — are confirmed intentional per `FUTURE_MODULES.md`, not
  part of this finding.)
- **Dependency spot-check (not exhaustive):** `sqlalchemy`/`alembic` declared but zero
  imports found anywhere (DB layer is raw `sqlite3`); `langchain`/`langchain-community`
  declared but the actual code imports the undeclared `langchain_openai` instead —
  possible declared/actual mismatch, flagged as "worth a second look," not asserted as a
  confirmed bug.
- **Devils-advocate questions that surfaced something:** "is there a simpler path" → the
  guilds/ orphan set is itself the answer, a whole subsystem built and never wired, the
  simpler path was just not building it or wiring it fully. "What's the single point of
  failure" → not applicable here, dead code by definition isn't load-bearing, which is
  exactly why this sweep is a lower-urgency, batchable cleanup rather than an emergency.

### 2026-07-31 — Follow-up: WHY the 12 guilds stubs + 4 duplicates got orphaned (founder-requested depth pass)

**Verdict: origin traced, per-file disposition assigned — not a blanket delete list**

Founder explicitly declined a blanket "delete the dead code" and asked instead: were these
built for a real reason and later superseded (safe to delete), or abandoned mid-flight
(possibly still needed)? Checked via `git log --follow` per file, not assumed.

- **Origin, traced for real:** all 12 guild stubs landed in one bulk-import commit
  (`884eb99`, 2026-07-17, alongside `.archive/jasper_v10_complete.py` and other
  legacy-era files) — never independently built, never wired to `routes.py`/`main.py`,
  zero commits since. `backend/CLAUDE.md` already self-labels them "12 guild module
  stubs." Every method returns a hardcoded/simulated value. **Verdict: never-finished
  scaffolding for a phased roadmap, not abandoned mid-flight work.**
- **Per-file disposition (12 stubs):** 7 safe-to-delete, their exact job now genuinely
  executed elsewhere for real — `arena_guild.py`→`core/arena.py`,
  `frequency_guild.py`→`core/frequency_guild.py`, `constitutional_guild.py`→real
  `/constitution/vote` + `governance.py`, `dream_guild.py`→4DBRAIN's real
  `tesseract_math.dream_engine`, `treasury_guild.py`'s ledger half→`wallet.py`,
  `security_guild.py`→distributed real enforcement (`PromptInjectionMiddleware`, real
  auth, real rate limiter). **1 partial:** `treasury_guild.py`'s ledger half is
  superseded, but its 70/20/10 `distribute_revenue()` feature (`agent_split`/
  `treasury_split`/`trust_split` settings) has **no live implementation anywhere** —
  genuinely unfinished, founder decision needed on whether to build it for real.
  **4 genuinely-unfinished, low priority** (their described Phase 4-7 features were
  simply never reached): `commerce_guild.py` (contracts/DEX), `academy_guild.py`
  (badges), `arcane_guild.py` (predictions), `worldbuilding_guild.py` (3D generation).
  **1 genuinely-unfinished but its own dependencies are also dead:** `audit_guild.py`
  wraps `agent_identity.py`/`audit_chain.py`, both themselves zero-importer orphans —
  nothing real underneath it to wrap.
- **Duplicate pairs — diffed for real, not assumed identical:** `llm_router.py` and
  `frequency_guild.py` orphans are architecturally superseded (old v9 static-fallback
  design vs. the real 8-provider OmniRoute router; 5-tone hardcoded stub vs. the real
  10-tone DB+HDC version) — **safe-to-delete, nothing unique to port.**
  **`constitution.py` and `rate_limiter.py` are BOTH genuinely high-risk, real
  differences, NOT safe to auto-merge or auto-delete:** the orphan `constitution.py`
  dynamically regex-parses the real `soul.md` at runtime (a capability the active
  DB-backed version lacks and arguably should have, to prevent law-text drift) — a real
  architecture question, not a bug fix, needs the founder's own call. The orphan
  `rate_limiter.py` is `asyncio`-based (non-blocking) vs. the active
  `threading.Lock`-based version (which has cleanup-event logging the orphan lacks) — a
  genuine async-vs-observability tradeoff on load-bearing security enforcement, not a
  mechanical merge.
- **Nothing deleted, edited, or merged in this pass** — investigation only, per the
  founder's own instruction to understand before acting. Dispositions above are ready
  for the founder to actually decide on.

---

## Not yet audited by this skill (do not assume clean)

Ordered by the SUSPECT priority in SKILL.md — highest blast radius / least-verified first:

- `backend/core/hitl.py` (human-in-the-loop approval queue) — same caveat: tests exist,
  written same-session as the read-through, not independently re-derived.
- `backend/mcp_server/server.py` — tests use a stubbed `mcp` SDK, not the real one (the
  real SDK has installability problems in this sandbox); the stub's behavior matching
  the real FastMCP's behavior has not been independently re-verified against the real
  package.
- Everything merged into `main` from PR #131 (founder's own gamified-UI patch), PR #132
  and #133 (Grok's workstream) — these were diff-reviewed and build-verified
  (`npm run build:app`, `esbuild`, `tsc`), which catches syntax/build breaks, but that
  is not the same discipline as re-running the actual runtime behavior of what changed.
- `backend/economy/utility_economy.py`, `backend/core/genome.py`,
  `backend/core/llm_router.py` — no tests exist yet at all (0-24% coverage per the
  last measurement), so there is nothing to even independently re-derive against yet.
- Anything in `backend/` deployed nowhere live (System A) — lower real-world blast
  radius than System B's Worker precisely because nothing depends on it running
  correctly *yet*, but worth a pass before any future decision to actually deploy it.
- The Cloudflare Worker's KV rate-limiter and Queues producer code (System B,
  `worker/src/index.js`) — verified live via direct Cloudflare account access and the
  `edge-health-probe` workflow, which is real evidence, but that confirms the binding
  is *live*, not that the rate-limit math or Queue message shape is correct under an
  unusual load pattern — a devil's-advocate pass on the "what breaks at 10x load"
  question specifically has not been run against this file.

## Known "could not verify" cases (say so, don't hide it)

- **Exa connector, requested 2026-07-31:** the founder asked to enable this for
  upcoming autonomous sessions, specifically to help this kind of audit work (checking
  current docs/behavior instead of relying on training knowledge). The org's settings
  do not allow connectors to be attached to background Routines from this tool at all —
  confirmed by a direct API error, not assumed. This is the literal event that
  prompted this skill: a real gap (no connector) that would not have surfaced unless
  asked about directly. Any future audit finding that would have benefited from a live
  web/docs search and didn't get one should be marked here the same honest way, not
  silently treated as equivalent to having had the tool.
