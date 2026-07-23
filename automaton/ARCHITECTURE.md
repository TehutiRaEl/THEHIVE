# automaton — Architecture

State schema version: **1** (`src/state/schema.js` — `CURRENT_SCHEMA_VERSION` is the
single source of truth; `state/database.js` throws loudly on any mismatch rather than
silently proceeding. Upstream's own ARCHITECTURE.md claimed "schema v8" while the
running code had drifted to v11 — this note exists specifically so that doesn't
happen here: if this number and the constant in `schema.js` ever disagree, this
file is wrong, not the code.)

## Request flow for a money-moving or replication action

```
tool call (agent/tools.js)
      │
      ▼
policy request { tool, inputSource, moneyMovementCents?, targetPath?, ... }
      │
      ▼
PolicyEngine.evaluate()  — agent/policy-engine.js
  runs every rule in agent/policy-rules/*.js, priority order
      │
      ├─ any rule returns 'deny'   → stop immediately, nothing executes
      ├─ a rule returns 'pending_approval', no deny fired
      │        → ApprovalQueue.enqueue()  — a real, durable row
      │        → tool returns { ok:false, pending:true, approvalId }
      │        → execution happens ONLY via `--approve <id>`, which is a
      │          creator-sourced CLI action, never something the agent or a
      │          heartbeat tick can trigger itself
      └─ nothing fired            → 'allow' → the action actually executes
```

Every decision (allow/deny/pending) is written to `policy_decisions` regardless of
outcome — this table plus `approval_queue` plus `modifications` is the complete audit
trail for anything the automaton has ever attempted, not just what it succeeded at.

## The five gaps this rebuild specifically closes

Full write-up with upstream code citations:
`Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-automaton-devils-advocate-005.md`.
Summary, and where the fix lives:

1. **`quarantine` was a soft deny, not an approval gate.**
   Fix: `pending_approval` is a distinct engine state; `agent/approval-queue.js` is a
   real table + resolve() workflow; `src/index.js --approve/--reject` is the only way
   a queued action ever executes. Proven by `test/gap-closure.test.js`'s Gap #1 suite.

2. **`fund_child` (replication funding) bypassed every rate/cap rule that
   `transfer_credits` had.**
   Fix: `ledger/ledger.js` has exactly one debit path, `requestDebit()`, and every
   money-moving tool calls it — there is no second, uncapped path to bypass. Rules in
   `policy-rules/financial.js` apply to any request carrying `moneyMovementCents`,
   not to an allowlist of tool names. Proven by Gap #2 suite.

3. **The agent could edit its own financial/authority rule files** (only the thin
   wrapper files were on upstream's protected list, not the actual rule
   implementations).
   Fix: `policy-rules/path-protection.js`'s `PROTECTED_WRITE_PATHS` is the one
   canonical list, covering every file under `agent/policy-rules/` plus the engine,
   tools, approval-queue, self-mod, and ledger modules themselves — imported by both
   the policy engine's write-rule AND `self-mod/code.js`, so there's no second,
   drifting copy. Proven by Gap #3 suite.

4. **Real, unencrypted private key on disk by default.**
   Fix: `identity/wallet.js`'s default path never generates a real keypair — a
   simulated pseudo-address only. Flipping `AUTOMATON_FINANCIAL_AUTONOMY` on without
   also writing a real wallet adapter throws, loudly, rather than fabricating one.
   Proven by Gap #4 suite.

5. **The only "supervised approval" concept in the whole codebase
   (`orchestration/plan-mode.ts`) was a non-functional stub** — `"auto"` mode always
   approved regardless of cost, `"supervised"` mode threw an unhandled exception
   instead of actually pausing.
   Fix: replication approval is unconditional and always real (see gap #1's queue),
   regardless of `AUTOMATON_REPLICATION_AUTONOMY` — that switch only controls whether
   an *already-approved* proposal can execute a real spawn; approval itself is never
   optional or auto-granted. Proven by Gap #5 suite.

## What stayed the same as upstream (the parts that were genuinely good)

- The overall policy-engine shape (ordered rules, first-deny-wins) — upstream's
  architecture here was sound; the bug was in *which* files/tools were covered, not
  the engine design itself.
- Survival tiers (`high`/`normal`/`low_compute`/`critical`/`dead`) and their
  thresholds — a real, working mechanism upstream got right.
- The self-authored `SOUL.md` identity-document concept, and its size/injection
  validation on the `update_soul` tool path.
- Lineage tracking with a constitution hash for tamper-evidence between parent and
  child.
- Injection-defense's detector categories (instruction patterns, authority claims,
  ChatML markers, encoding obfuscation, multi-language, financial manipulation,
  self-harm).
- The `EXTERNAL_BLOCKED_TOOLS` defense-in-depth concept for unattended/heartbeat-
  triggered dangerous actions — kept, but explicitly documented as a *secondary*
  layer now, since treating it as the *only* restriction was itself part of gap #2's
  root cause (an ordinary agent-sourced call was never covered by it).

## Deliberate architectural changes beyond the five gaps

- **Decoupled from Conway Cloud.** `src/ledger/ledger.js` replaces
  `src/conway/{client,credits,topup,x402}.ts` entirely with a local, simulated ledger.
  `src/inference/thehive-provider.js` replaces Conway's inference gateway with a call
  to THEHIVE's own Worker (a new `POST /v11/automaton/infer` route reusing the exact
  same `generate()` waterfall already backing `/v11/venture/plan` and
  `/v11/legal/research`), falling back to `src/inference/simulate-provider.js` when
  unreachable — the same "always degrade honestly, never fabricate infrastructure
  that isn't there" pattern already established across `worker/src/index.js`.
- **Zero native/npm dependencies** (see README's "Why zero dependencies").
- **Replication spawns a real local child process** (`node:child_process`, with its
  own state directory and simulated funding) instead of provisioning a cloud VM and
  `git clone`-ing `main` from GitHub — genuinely testable in any environment with
  Node installed, no cloud account required.
