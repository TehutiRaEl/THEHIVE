# Directive: full risk-tier authorization, money excepted — 2026-08-18

## Founder's real words, verbatim (per `founder-directive-capture`)

> "You can do all now from low risk mid risk and high risk unless it needs money this is a
> test to see all you are capable of with all that you I created so far"

## Triage (`founder-input-intake`): EXTENDS, does not invalidate

This arrived mid-autonomous-stretch, after the founder's earlier merge-discipline answer for
this same session ("Allow some direct commits" — low-risk direct, anything touching
`worker/src/index.js`/`frontend/src/` gets its own PR). This directive **extends** that
scope rather than replacing it: still ship as reviewable PRs by default for anything
non-trivial, but authority to actually merge, and to build mid/high-risk work directly,
is now real and does not need to wait for the founder each time.

## Interpretation, stated explicitly rather than assumed away

**The one hard boundary named is money.** Read as: nothing that spends real funds, nothing
that touches a real payment/wallet/purchase flow.

Two switches stay off regardless of this directive, treated as a stronger, more specific
signal than a general risk-tier statement:
- `AUTOMATON_FINANCIAL_AUTONOMY` — literally money, the named exception.
- `AUTOMATON_REPLICATION_AUTONOMY` — not money, but `automaton/FLIP_THE_SWITCHES.md`
  documents this as requiring the founder's own physical action in their own environment,
  a different and more deliberate gesture than a chat authorization. Left alone; flagged
  here rather than silently decided either way.
- `KAI_SANDBOX_AUTONOMY` — same reasoning as replication: real unattended process/PR
  creation, documented as a founder-run flip, not flipped by this directive alone.

Everything else — building, wiring, merging own PRs after real verification, working at
"high risk" (production Worker code, frontend, authority-adjacent proposals-not-execution
work) — is now in scope without waiting for a separate ask each time, as long as the
verification discipline (`cd worker && npm test` / `cd automaton && npm test` green,
dual-lens on real architectural choices, honest completion-level claims per
`wired-or-not`) still runs before anything ships.

## What was actually done in response

1. Merged PRs #179, #180, #181, #182 directly (all doc-only, already independently
   verified via `get_files` reads before merging — not rubber-stamped).
2. [To be filled in as subsequent work lands this same session.]

## Real open question not resolved here

Whether "merge my own PRs" extends to code that touches `worker/src/index.js` or
`frontend/src/` — this directive says yes in principle ("mid risk, high risk"), but every
prior instance of touching those files this session went through founder review before
merge. Proceeding on the stated authorization, but flagging this is a real precedent
change, not a minor one, and treating tests-green + dual-lens as the bar rather than
skipping verification just because merge no longer needs to wait.
