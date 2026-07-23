# automaton — FLIP_THE_SWITCHES

Same pattern as the repo-root `FLIP_THE_SWITCHES.md`: real, complete code ships now,
degrading honestly until a founder deliberately flips a switch. Both switches below
default OFF.

## 1 · Financial autonomy — real money instead of a simulated ledger

**Currently:** `src/ledger/ledger.js` tracks a real, persistent, survival-pressure-bearing
balance — but it is simulated play-money. `src/identity/wallet.js` never generates a
real keypair; if `AUTOMATON_FINANCIAL_AUTONOMY=true` is set without more, it throws
rather than fabricating a fake-real wallet.

**To actually flip this on, you would need to:**
1. Write a real wallet adapter in `src/identity/wallet.js` (a real keypair, real
   custody — hardware-backed or a KMS, not a plaintext JSON file, which is exactly
   the gap found in upstream's implementation).
2. Write a real ledger backing (an actual payment rail) and wire it into
   `src/ledger/ledger.js`'s `_executeDebit`/`credit` methods in place of the
   simulated `kv` balance.
3. Get an actual legal read on money-transmission / AML / tax exposure for your
   specific jurisdiction and use case before any of this touches real funds — this
   is not something either the upstream project's MIT license or this codebase's
   test suite can clear for you.

**This is deliberately not a small config flip** — it requires writing real code and
getting real legal sign-off, on purpose.

## 2 · Replication autonomy — approved proposals can actually spawn a process

**Currently:** `spawn_child` always creates a `lineage` row + an `approval_queue`
entry, regardless of this switch. With the switch off, approving a proposal
(`node src/index.js --approve <id>`) marks it `approved` and stops there — no process
is actually started. **Approval is never optional, with or without this switch.**

**To flip:**
```bash
export AUTOMATON_REPLICATION_AUTONOMY=true
```
(or set it in whatever process manager/env you deploy this with, then restart).

**Proof it worked:** approve a pending `spawn_child` proposal and check
`node src/index.js --status` — `activeChildren` should increase, and a new directory
under `.automaton-home/children/<lineageId>/` should exist with its own `GENESIS.md`
and its own simulated ledger, entirely independent of the parent's.

**What this does NOT do:** it does not remove the approval requirement, raise
`maxChildren`, or grant the child anything the parent didn't explicitly fund. Each
child runs under the exact same policy engine and protected-path list as its parent —
lineage does not inherit looser rules.

## Already on / no switch needed

- The simulated ledger, survival tiers, self-mod (with its full protected-path list),
  the approval queue, and injection defense are all live now — no provisioning step.
- Inference: calls THEHIVE's own live Worker (`POST /v11/automaton/infer`) first,
  falls back to a fully offline simulated response if unreachable. No new API keys
  required — it rides on whatever the Worker's own provider waterfall already has
  bound (see the repo-root `FLIP_THE_SWITCHES.md` §3 for those).
