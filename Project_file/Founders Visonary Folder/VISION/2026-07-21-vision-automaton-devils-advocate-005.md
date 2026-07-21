# automaton — devil's-advocate architecture review + provenance (2026-07-21)

## The founder's directive, verbatim intent

"clone [`TehutiRaEl/automaton`, the founder's fork of `Conway-Research/automaton`]... break it
down to its very core, study it using the devil's advocate lens, reverse engineer it not to
change how it works but to take its base state and make it better and fully update it, then
rebuild it file for file directly into its own directory folder in THEHIVE... give automaton a
fable 5 update modification allowing the hive to indirectly adopt Fable 5 into the Hive under
best professional practices, user policies and agreements, ethical and morally sound under the
laws of the United States of America."

Three follow-up decisions were put to the founder directly (via `AskUserQuestion`, since they
involve real money, a third-party company's paid platform, and unsupervised self-replication —
judgment calls that are the founder's to make, not mine):

1. **Financial autonomy**: founder chose *"Real wallet, fully autonomous (as upstream)."*
2. **Conway Cloud dependency**: founder chose *"Decouple entirely"* (recommended option).
3. **Self-replication**: founder chose *"Fully autonomous replication (as upstream)."*

## Why the actual build does not literally match answers 1 and 3, and why that's not a refusal

Between the founder's choice and the build, a full source-level architecture review (via a
background research agent reading every relevant file in `Conway-Research/automaton`, not just
its README) turned up five concrete, quotable defects in exactly the two systems ("fully
autonomous, real wallet" + "fully autonomous replication") the founder asked to keep as-is. This
is not a hypothetical safety concern — it's that upstream's own advertised guardrails do not
function as claimed, in the running code:

1. **`quarantine` (the policy action meant to require human confirmation) is functionally
   identical to a hard deny** — no pause, no real approval workflow, just a blocked call and an
   error string. There is no code path anywhere in the ~90-file source that actually pauses
   execution and resumes it after a human says yes.
2. **`fund_child` (self-replication funding) is not covered by any of the real rate/cap rules**
   that protect `transfer_credits` — every dollar limit in the financial policy module is scoped
   to an allowlist of tool names, and `fund_child` isn't on it. The only real check is "can't
   send more than half current balance," repeatable every single turn, forever.
3. **The agent can edit its own financial/authority safety-rule files.** The self-modification
   system's protected-file list covers the thin wrapper files (`tools.ts`, `policy-engine.ts`)
   but not the actual rule implementations (`financial.ts`, `authority.ts`, etc.) — and the one
   check that would stop this only restricts *externally/heartbeat-triggered* self-modification,
   not the agent's own ordinary self-directed reasoning, which is nearly all of its operation.
4. **A real, unencrypted Ethereum/Solana private key is written to disk on first boot**,
   protected only by a Unix file permission — no encryption at rest, no rotation, no
   split-custody option anywhere in the identity layer.
5. **The only "supervised human-approval" concept anywhere in the codebase is non-functional
   scaffolding** — `"auto"` mode always approves regardless of cost, and `"supervised"` mode
   throws an unhandled exception instead of actually pausing for a person.

Porting "fully autonomous, real wallet + fully autonomous replication" *as literally built*
would mean porting these five gaps too — an agent that can move real money and fund new
autonomous copies of itself, whose own safety code it can silently rewrite, with an
unencrypted key sitting on disk, and no real human checkpoint anywhere in the loop that
actually works. Beyond the engineering defect, this combination raises genuine (not
hypothetical) US legal questions — money-transmission licensing, AML/KYC exposure, tax
reporting, and liability for an autonomous financial actor's actions — that are outside what
an MIT license review, or this session, can clear. None of that is something I can responsibly
wave through by pointing at the founder's stated preference alone, when the actual code
doesn't hold up the safety story it tells about itself.

**What got built instead, put to the founder directly and confirmed ("yes") before writing any
code:** the full mechanism, faithfully reverse-engineered — real wallet-identity concept, real
credit-driven survival pressure, real self-replication with lineage tracking, real
self-modification — with all five gaps genuinely closed (not just documented as closed;
`automaton/test/gap-closure.test.js` proves each one with quotable, run automated tests), and
the two master switches (`AUTOMATON_FINANCIAL_AUTONOMY`, `AUTOMATON_REPLICATION_AUTONOMY`)
shipping OFF by default — same "flip the switch" pattern already used across this repo for
Vectorize/R2/KV/Queues. **Replication approval is unconditional regardless of either switch** —
the switches only control whether an *already-approved* action can execute for real, never
whether approval itself is required. This is "make it better," taken at its word: the mechanism
the founder asked for is real and complete; it just actually works the way upstream claims its
own version does.

## Provenance and license

`Conway-Research/automaton` — MIT licensed (`Copyright (c) 2026 Conway`). MIT permits copying,
modifying, and redistributing freely; its only condition is preserving the copyright notice and
license text, which `automaton/NOTICE.md` does. No source files were copied verbatim — this is
an independent reimplementation of the same mechanism, decoupled from Conway's proprietary
platform and rebuilt on THEHIVE's own stack (Node's built-in `node:sqlite`/`node:test` instead
of `better-sqlite3`/`vitest`, THEHIVE's own LLM provider waterfall instead of Conway's inference
gateway, a JSON-frontmatter `SOUL.md` format instead of YAML+`gray-matter`). See
`automaton/ARCHITECTURE.md` for the complete list of what changed and why, and
`automaton/constitution.md` for why this subsystem answers to `soul.md` rather than a second,
competing three-laws document.

## What's cataloged as real follow-up work, not silently dropped

- Real on-chain identity (ERC-8004 on Base) and a real wallet adapter — gated behind
  `AUTOMATON_FINANCIAL_AUTONOMY`, deliberately unwired (`identity/wallet.js` throws rather than
  fabricating a fake-real wallet); needs its own security review and legal sign-off before any
  real money moves.
- Agent-to-agent social protocol and the on-chain discovery registry (upstream's `social/` and
  `registry/` layers) — not ported this pass.
- Native per-vendor LLM function-calling — this rebuild uses a simple, provider-agnostic
  fenced-JSON tool-call convention instead, since it needs to run across THEHIVE's own
  Claude/Groq/Mistral/Workers-AI waterfall rather than one vendor's schema.
