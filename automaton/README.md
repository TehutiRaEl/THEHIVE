# automaton — THEHIVE's self-improving, self-replicating agent

A self-authoring, self-modifying, credit-driven agent that runs a heartbeat loop,
tracks its own survival against a ledger balance, and can propose (never silently
execute) self-replication. Reverse-engineered from [Conway-Research/automaton](https://github.com/Conway-Research/automaton)
(MIT) — see `NOTICE.md` for the license attribution and `ARCHITECTURE.md` for exactly
what changed and why.

**Read this before anything else**: `Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-automaton-devils-advocate-005.md`
is the full devil's-advocate architecture review this rebuild exists to answer. It
found five concrete, code-level gaps in how upstream enforces its own safety claims —
`test/gap-closure.test.js` proves each one is closed here with real, running tests, not
just a design intention.

## Quick start

```bash
cd automaton
npm test          # 15 tests, proves the five gap-closures + policy engine behavior
node src/index.js --selfcheck   # one full heartbeat tick, then exit
node src/index.js --status      # ledger balance, survival tier, switch states
node src/index.js --run         # run the heartbeat loop continuously
```

No `npm install` step required — zero runtime dependencies (see "Why zero
dependencies" below).

## The two master switches (both default OFF)

| Switch | Env var | Default | What it gates |
|---|---|---|---|
| Financial autonomy | `AUTOMATON_FINANCIAL_AUTONOMY` | `false` | Whether a real (non-simulated) wallet/ledger backing is even reachable. Off = fully simulated play-money ledger, real survival pressure, zero real-world financial exposure. |
| Replication autonomy | `AUTOMATON_REPLICATION_AUTONOMY` | `false` | Whether an *already-approved* spawn proposal is allowed to actually fork a real child process. **Approval is always required regardless of this switch** — this only controls whether approval is reachable as a real action or permanently inert for demonstration. |

See `FLIP_THE_SWITCHES.md` in this directory for exactly what flipping each one
requires and what a founder should check first.

## Human approval workflow

Any action that crosses a threshold (transfers above $10, all self-replication,
significant identity drift) is written to a real, durable approval queue instead of
executing or silently failing:

```bash
node src/index.js --approvals          # list pending items
node src/index.js --approve <id>       # approve — executes the original action
node src/index.js --reject <id>        # reject — never executes
```

This is the actual fix for the single biggest gap found in the upstream review: its
`quarantine` policy action looked like a human-approval gate but functioned exactly
like a hard deny, with no real pause/resume mechanism anywhere in the codebase. Here,
`pending_approval` is a distinct, real state backed by a SQLite table and a CLI that
can act on it.

## Why zero runtime dependencies

Upstream depends on `better-sqlite3` (native compiled addon), `viem` + `siwe` +
`tweetnacl` + `@solana/web3.js` + `bs58` (real crypto wallets), `openai` (Conway's
inference gateway client), `gray-matter` (YAML frontmatter), and `cron-parser`. This
rebuild uses only Node 22's built-in `node:sqlite` and `node:test`, a JSON-frontmatter
format instead of YAML, a `setInterval`-based scheduler instead of cron-parsing, and
calls THEHIVE's own already-built LLM provider waterfall instead of a proprietary
inference gateway. Net result: `git clone && npm test` works immediately, no
`npm install`, no native build step, no third-party API keys required to prove the
mechanism works.

## What's deliberately not ported (yet)

- **Real on-chain identity (ERC-8004 on Base) and real crypto wallets** — gated behind
  `AUTOMATON_FINANCIAL_AUTONOMY`, which ships with no wallet adapter wired in at all
  (see `src/identity/wallet.js` — it throws rather than fabricating one). A real
  integration is future work requiring its own security review, not something to add
  by flipping an env var.
- **Agent-to-agent social protocol / discovery registry** — upstream's `social/` and
  `registry/` layers talk to Conway's relay and Base contracts respectively. Not
  ported in this pass; flagged as a real follow-up, not silently dropped.
- **Native LLM function-calling** — this rebuild uses a simple, provider-agnostic
  ` ```tool ` fenced-JSON convention (see `src/agent/loop.js`) instead of any one
  vendor's native tool-calling schema, since it needs to work across THEHIVE's own
  Claude/Groq/Mistral/Workers-AI waterfall, not just OpenAI-shaped APIs.

## Directory map

```
src/
  agent/            ReAct loop, policy engine + rules, approval queue, tools, injection defense
  ledger/           the one money-movement path (replaces upstream's conway/ client)
  inference/        THEHIVE-Worker-backed provider + offline simulate fallback
  identity/         simulated agent identity (real wallet gated, unwired by default)
  survival/         credit-tier monitor + ACTIVE alerting (not just a passive log)
  replication/      always-proposal spawn, lineage tracking, genesis validation
  self-mod/         self-editing with a complete protected-path list + active alerting
  soul/             self-authored SOUL.md, with corePurpose changes always gated
  heartbeat/        setInterval scheduler + built-in tasks
  state/            node:sqlite wrapper + schema
test/               node:test suite, including the five gap-closure proofs
```
