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
