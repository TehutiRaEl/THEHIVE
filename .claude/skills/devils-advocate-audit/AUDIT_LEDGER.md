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

### 2026-07-31 — Follow-up: cataloguing the 56-file second frontend effort (founder-requested depth pass)

**Verdict: correction to the original sweep's count, plus a real per-file usable/skip/new catalog**

- **Correction to the earlier sweep:** 13 of the "56 unreachable" files
  (`components/command-center/tabs/*.tsx` — HIVE/DREAM/ARCANE/WORLD/SOUL/GOVERN/
  MISSIONS/API/4D/ARENA/WOW/NO_MANS_SKY/SETTINGS) are **not actually orphaned** —
  `KaiElOS.tsx` lazy-imports every one of them directly as its "full-takeover" tabs.
  The tab *content* was already salvaged into the live app; only the routing shell
  around it (`TabNavigator.tsx` + 4 page files) is still genuinely unreachable.
- **Skip — inferior duplicate of something already live:** the page/router shell
  (superseded by `KaiElOS.tsx`'s graph-navigator, which the founder deliberately chose);
  `components/colony/*` (10 fake consoles simulating CPU/memory with `Math.random()` —
  `ColonyZoomPanel.tsx`, already live, does the same job with real `/colony/health`
  calls); `TesseractChamber.tsx` (basic wireframe cubes vs. the already-live
  `TesseractRenderer.tsx`'s real 6-plane 4D→3D projection); `MemoryGraph.tsx` (older,
  simpler sibling of `MemoryGraphEnhanced.tsx`, redundant once that one's taken).
- **Skip — mismatched/fictional data, firmly not wanted:** `data/{colonies,constitution,
  memories,missions}.ts` invent sci-fi content ("Alpha Centauri Prime," fictional laws)
  that would actively misrepresent the real system (real colonies are the 10 GitHub
  repos, the real constitution is `soul.md`'s F-001–F-006) — not a quality problem, a
  correctness problem. The presentational components built against this data
  (`MissionBoard`/`Card`/`Details`, `QuickStats`, `ResourceBar`, `AgentAvatar`,
  `ColonyCard`, `MemoryVault`, `MemoryDetails`/`Item`, `ConstitutionHall`) inherit the
  same problem and would need full re-binding + re-skinning to the live design tokens,
  not a lift.
- **Skip — buggy or low-quality:** `useColonyHealth.ts` calls `getHiveStatus()` →
  `/v11/hive/status`, which **does not exist anywhere in `worker/src/index.js`**
  (grepped, confirmed absent) — would silently fail in production. `useNeuralUI.ts`
  fakes a "prediction confidence" counter with no real learning behind it.
  `useAsyncState.ts` is redundant with the live app's already-established fetch pattern
  (`useHiveData.ts`). `utils/constitutional.ts`'s policy checks are permissive no-ops.
  `gameStore.ts` ties to the `worlds/` module `FUTURE_MODULES.md` already deferred on
  purpose — not re-litigated here.
- **Genuinely new capability, real integration value, not yet built live:**
  - **`MemoryGraphEnhanced.tsx` + `ConstitutionVisualizer.tsx`** — the strongest find.
    Both already call the real, live `services/api.ts` functions
    (`getMemoryGraph()`/`getConstitutionLaws()`), and `ConstitutionVisualizer`'s
    fallback data correctly states F-001–F-006 (unlike the fictional `data/` files).
    Live's current equivalents (`DreamLogs.tsx`, `ConstitutionViewer.tsx`) are flat
    lists/markdown with no graph, no tiering, no history — a real capability gap.
    Integration is a re-skin job (swap inline `theme.*` styles for the live
    cyan-glow/void-black Tailwind tokens), not a data job — data-wise already correct.
  - **`services/sentry.ts`** — near-zero-cost win. `@sentry/react`/`@sentry/tracing`
    are already declared in `package.json` but `initSentry()` is never called anywhere
    — **the live app currently ships with zero error tracking.** Needs one call from
    `main.tsx` plus a `VITE_SENTRY_DSN` env var; the file itself needs no changes.
  - **`services/github.ts`** — `sendGrokBridgeDispatch`/`fetchGrokToken` call real,
    confirmed-present Worker endpoints (`/admin/grok-token`, `/bridge/grok-token`) that
    nothing in the live UI currently exposes a trigger for.
  - **`stores/uiStore.ts`** — a complete generic notification/modal/toast system; live
    panels currently hand-roll every overlay via ad hoc `useState`. Self-contained,
    only needs its stock theme palette swapped or dropped.
  - **Minor/low-priority:** `AchievementToast`/`LevelUpNotification` (the underlying
    XP/level data already exists on `RoadmapEntry`, nothing renders it yet — revisit if
    that surfaces later, not urgent); `usePersistedForm.ts` (clean, cheap, nothing
    currently needs it); `components/common/{Button,Card,Modal}` (flags a real gap — no
    shared component library exists live — but wrong palette means rewrite, not port).
- **Nothing wired, moved, or deleted in this pass** — investigation only.

---

## Not yet audited by this skill (do not assume clean)

Ordered by the SUSPECT priority in SKILL.md — highest blast radius / least-verified first:

- ~~`backend/core/hitl.py`~~ — **audited 2026-08-02, see Entries above.** Bug found
  (approval doesn't re-fire the held action), escalated as CAMPAIGN.html task 26.
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

### 2026-08-01 — Dead-code dispositions executed, founder's 19-question answers

**Verdict: BUG FOUND (in the prior audit itself) — FIXED, plus real deletions/edits,
all re-verified by running the suite, not read-through.**

Founder answered all 19 open items from the 2026-07-31 dead-code/second-frontend audit.
Before deleting anything, re-verified each target fresh (imports, git history, direct
file reads) rather than trusting the prior summary — this caught one real error in the
prior audit:

- **`workflow_guild.py` was miscategorized.** The prior sweep filed it under "safe to
  delete, job done elsewhere" (the founder's Q1 "one more folded into these"). A fresh
  read shows it has no real live counterpart — `deploy_spore()` returns a hardcoded
  `archive.org/placeholder` IPFS hash, `create_workflow()` is a pass-through stub. This
  belongs with Q3's "genuinely unfinished, still on roadmap" bucket instead. **Not
  deleted** — corrected here rather than deleted on the wrong premise.
- **Deleted for real** (Q1 confirmed-safe + Q5, all re-verified zero-importer via fresh
  grep before removal): `backend/guilds/arena_guild.py`, `constitutional_guild.py`,
  `dream_guild.py`, `frequency_guild.py`, `security_guild.py`; `backend/llm_router.py`
  (root-level orphan, `backend/core/llm_router.py` is the real live one).
- **`backend/guilds/treasury_guild.py`** — trimmed, not deleted (Q1+Q2 together): removed
  `credit()`/ledger bookkeeping (confirmed superseded for real by `wallet.py`, zero
  callers), kept `distribute_revenue()`/`get_balance()` — the 70/20/10 revenue-split idea
  the founder said is "a real plan, discuss later," not dead.
- **Rate limiter (Q7)** — live `RateLimiter` in `backend/api/middleware.py` ported from
  `threading.Lock`/sync `check()` to `asyncio.Lock`/async `check()`, matching the tradeoff
  the dead orphan (`backend/utils/rate_limiter.py`, deleted) represented. Correction for
  the founder mid-session: this is the Worker-unrelated **backend API** rate limiter
  (30/min/IP throttling); it has nothing to do with Claude Code session/token cost, which
  is a separate system entirely — flagged directly so the fix isn't mistaken for a cost
  control.
- **`audit_guild.py`** (+ its dead deps `agent_identity.py`, `audit_chain.py`) — **not
  deleted** (Q4: founder wants the compliance-audit concept rebuilt against something
  real eventually, not dropped).
- **4 low-priority stubs** (`commerce_guild.py`, `academy_guild.py`, `arcane_guild.py`,
  `worldbuilding_guild.py`) + now `workflow_guild.py` — **not deleted** (Q3: still on
  roadmap).
- **`backend/constitution.py` orphan** (dynamic `soul.md` parser) — **no action**, Q6
  asked for an explanation of what "porting" would mean before deciding; given directly
  in-session, decision still pending.
- **Full suite re-run after every deletion/edit**: `375 passed`, zero failures/skips —
  the actual verification this ledger exists to require, not a read-through.

Second-frontend Q8–Q14 dispositions (sentry.ts wiring, `components/common` library,
skip-bucket deletion minus `TesseractChamber` per founder's explicit hold) not yet
executed — a fresh `Explore` pass was dispatched the same session to re-verify the exact
skip-bucket file list before deleting anything there, same discipline as above. Record
the outcome here when it lands, not a new file.

### 2026-08-02 — `backend/core/hitl.py` (`HumanInTheLoop`) + its one real caller, `hive_mesh.dispatch()`

**Verdict: BUG FOUND — ESCALATED** (CAMPAIGN.html task 10, next item off the priority
list). Re-run for real via a standalone probe script, not a read-through — full command
and output below.

`hive_mesh.dispatch()` correctly holds any non-Tier-1-safe event for founder review
instead of firing it blind (`backend/core/hive_mesh.py` lines 96-111): it calls
`hitl.request_approval(...)`, publishes a `hive.dispatch.held` event, and returns
`{cid: "held_for_review", ...}` — confirmed real by both existing tests
(`tests/unit/test_hive_mesh.py::test_non_tier1_event_is_held_for_review_not_dispatched`
and `::test_synthetic_tier3_shaped_dispatch_is_rejected_before_reaching_colony`) and a
fresh full-suite run (`python3 -m pytest tests/unit/test_hitl.py
tests/unit/test_hive_mesh.py -q` → **33 passed**, this session, after installing
`requirements-ci.txt` fresh — no cached result trusted).

**The real gap, found by tracing what happens AFTER approval, which no existing test
does:** `POST /v11/hitl/resolve` → `hitl.resolve_request()` only ever updates the HITL
request's own status (in-memory dict + `hitl_requests` D1/SQLite row) to
`approved`/`rejected`. Nothing anywhere reads that result back and re-invokes the
original held dispatch. `grep`-confirmed across the whole `backend/` tree: the string
`hive_mesh.dispatch:` (the `action_type` prefix `hive_mesh.py` stores the held event
under) appears in exactly one place — the line that writes it — never in a read/branch
anywhere else. Proven live, not just by absence-of-code:

```python
mesh = HiveMesh()
with patch.object(mesh, '_send_to_colony', new=AsyncMock(return_value='sent-ok')) as mock_send:
    result = await mesh.dispatch('first_contact', {'msg': 'hello colony'}, targets=['nar2'])
    # result == {'nar2': 'held_for_review'}
    req_id = <the matching pending hitl request's id>
    approve_result = await hitl.resolve_request(req_id, approved=True, resolved_by='founder')
    # approve_result == {'request_id': ..., 'approved': True, 'resolved_by': 'founder', 'status': 'approved'}
    print(mock_send.called)  # -> False
```
`mock_send.called` is `False` after approval — the founder clicking "approve" on a held
`hive_mesh` dispatch currently does nothing beyond marking a database row. The event
never actually reaches the colony it was meant for, approved or not. This is the same
class of gap `automaton`'s upstream review flagged (a human-approval mechanism that looks
real but doesn't cause the approved thing to happen) — mirror-imaged: there it was
"confirmation-required" behaving like a hard deny; here it's "approved" behaving like
silence. Every existing HITL test (`test_hitl.py`) only exercises `HumanInTheLoop` in
isolation and never round-trips through `hive_mesh.dispatch()`'s real caller path, so
nothing caught this until this pass traced the actual call graph instead of trusting that
green tests meant the feature worked end-to-end.

**Why ESCALATED, not fixed here:** this is CAMPAIGN.html task 10's scope (ledger entry,
not a code fix) for a genuinely safety-relevant mechanism (the founder-approval gate for
cross-colony fan-out) — deciding the right re-dispatch shape (synchronous callback at
resolve time? a poller that re-checks approved `hive_mesh.dispatch:*` rows and replays
them? should a stale/long-approved request still fire, or does approval need to happen
within some freshness window?) is a real design decision, not a one-line patch, and
touches the exact machinery `PERMISSIONS.md`'s Tier gate depends on being trustworthy.
Routed as a new `pending` CAMPAIGN.html task (26) rather than fixed unilaterally
mid-audit, per this skill's and the campaign protocol's own rule not to expand a task's
scope silently. **Also true and worth naming:** System A's backend (where this lives) is
not verified live in production this session (per `CLAUDE.md`'s own open-items section),
so the real-world blast radius today is zero — this is a correctness bug in code that
isn't yet serving traffic, not an active incident. Still worth fixing before any future
decision to deploy System A, which is exactly why it's escalated rather than shelved.

## 2026-08-04 — checks-and-balances: first real run, live authority-distribution audit

**What was checked:** the entire live `agents.reports_to` hierarchy and
`FLIP_THE_SWITCHES.md`'s switch 9 (`QUEEN_AUTONOMOUS_APPROVAL`) against
`docs/GOVERNANCE.md` F-011's separation-of-powers doctrine — this skill's first
invocation, and the first time this data has existed to check at all (`reports_to` and
switch 9 both shipped in PR #149, same session).

**How:** dispatched `edge-health-probe.yml` live (this container can't reach
`*.workers.dev` directly), read the real job log — `GET /v11/agents` confirmed live:
```
{"agents":[{"name":"Ma'at","reports_to":"Kai El"},{"name":"Kai El","reports_to":"Nanuet"},
{"name":"Solomon","reports_to":"Kai El"},{"name":"Nanuet","reports_to":null},
{"name":"Thoth","reports_to":"Kai El"},{"name":"Sekhmet","reports_to":"Kai El"},
{"name":"Ptah","reports_to":"Kai El"},{"name":"Horus","reports_to":"Kai El"}]}
```
Also confirmed live via the same run: Kai El's own chat reply now says "I report
directly..." — the hierarchy is genuinely reaching his real context, not just the DB.

**Verdict: CONFIRMED CORRECT, with two real findings, neither urgent.**

1. **No unchecked- or unloaded-power gap in the live roster.** Nanuet is the only
   `reports_to: null` row, exactly as designed (she's the Queen). Every other agent has
   both a real `reports_to` and a real job (per task 27/PR #149). No dangling or cyclic
   `reports_to` values — every one points to a real, active agent name in the same set.
2. **Real structural gap between doctrine and reality, not yet closed:** the hierarchy is
   currently a flat two-level tree — Queen → Kai El → the other six agents, all direct
   reports. `docs/GOVERNANCE.md` F-011B describes an Elders' Council as the real
   counterweight to central authority; that council does not exist as seated, real agents
   yet — the founder has said this explicitly ("let's discuss it entirely first," "this
   needs to be a different group... once we fulfill the roles of all other agents" — now
   done, per task 27). Switch 9 (Queen's real auto-approve power) is confirmed **off**
   right now, so there is no live risk today — but its doctrine-required counterweight
   (a seated Council) isn't real yet either. Recommend: don't flip switch 9 until the
   Council is seated for real, or at minimum name this dependency explicitly at flip time.

**One unrelated, minor thing noticed while reading the same live probe (not this skill's
core job, flagging honestly rather than silently passing over it):** `/v11/debug/env`'s
`secrets_present` still returns `[]` even though `/v11/llm/status` confirms three
providers genuinely bound — the same small display-only bug flagged earlier this session,
still unfixed. Cosmetic, not a real gap (the actual llm/status endpoint tells the truth),
but worth a real task eventually so the two surfaces agree.
