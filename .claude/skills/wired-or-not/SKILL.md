---
name: wired-or-not
description: >
  Use before marking ANY task done, writing a completion claim in a commit or PR body, or
  telling the founder something is finished, working, live, or production-ready. Forces a
  claim to name which of five truth levels it actually reached (compiles → tested → merged
  → deployed → verified-live) instead of the bare word "done", which hides the difference
  between "the code parses" and "it is genuinely running in production." Also use when
  auditing existing done markers inherited from an earlier session, since a claim written
  before this skill existed carries no level and must not be assumed to mean verified-live.
  Not for deciding whether work is GOOD (that is code-review) or whether a PR will land
  green (that is merge-readiness) — this skill only answers "is this claim true, and true
  at what level."
---

# wired-or-not — never say "done" without saying what kind of done

## Why this exists

Written 2026-08-07, after a founder-ordered audit found this, measured not guessed:

- **34 of 36 tasks marked `done` in `CAMPAIGN.html` had never been confirmed against
  production.** Only 2 cited real live evidence. 13 explicitly admitted verification was
  still owed. 21 carried no evidence and no caveat at all.
- Four layers of agent work (tasks 37 → 38 → 48 → 52) were stacked on each other, each
  marked done, **none ever verified live.** Task 38's own text said task 37 was
  *"syntax-checked, not yet proven"* — and two more layers were built on top of it anyway.
- A session built the Orchestrator agent, reported the coordination layer complete, and had
  in fact shipped an agent that wrote *prose about* provider routing with no routing code
  behind it. Caught only because the founder pushed back.

The failure is not laziness or lying. It is that **"done" is a single word covering five
very different states**, and a session that runs out of context hands the next session a
`done` marker stripped of the knowledge that it meant "it compiles."

## The five levels

Every completion claim names exactly one. No claim may use a bare "done."

| Level | Means | Evidence required |
|---|---|---|
| `compiles` | Parses / typechecks. Nothing more. | `node --check`, `tsc`, a clean build |
| `tested` | Automated tests exercise the real logic and pass | Test file path + count, and the tests must be **committed**, not in a scratch dir |
| `merged` | On the default branch | Commit SHA on `main` |
| `deployed` | The built artifact is actually serving | A deploy/build ID, or a probe showing the new code's own fingerprint |
| `verified-live` | Observed doing its real job in production | A probe run ID, or a live response containing something only the new code emits |

**The levels are not cumulative by assumption.** `merged` does not imply `deployed`.
`deployed` does not imply `verified-live` — plenty of deployed code never runs because
nothing calls it. Each level needs its own evidence or it is not claimed.

## The rule

> A claim above `tested` requires a **reference another person could check without
> trusting you** — a run ID, a SHA, a test path, a URL that returns the proof.

If you cannot produce that reference, you may not make the claim. Say the level you can
prove and name what is missing. "Tested, deployment unverified" is a *complete, honest*
status. "Done" is not.

## How to find the real level

Ask in order. Stop at the first "no" — that is your level.

1. **Does it parse?** → `compiles`
2. **Do committed tests exercise it and pass?** Tests in `/tmp` or a scratch directory do
   not count; they die with the container. → `tested`
3. **Is the commit on the default branch?** → `merged`
4. **Is the artifact serving?** Do not infer this from a merge. Check. → `deployed`
5. **Has it been observed doing its job?** Not "the endpoint returns 200" — the actual
   behaviour. A work cycle is verified-live when agent output appears in the database, not
   when the health check is green. → `verified-live`

## Auditing an inherited claim

A `done` written before this skill existed carries **no level**. Do not assume it means
verified-live; the audit found that assumption wrong 34 times out of 36. Re-derive the
level from evidence in the repo, and if the evidence is not there, the honest label is
**`unverified`** — not "broken", which is its own unproven claim.

## The trap this skill was written to catch

**Verifying a layer without verifying what it stands on.** The Orchestrator's tests passed.
The rotation was provably fair. None of that touched the real question, which was whether
*any* agent had ever run in production — and the answer, for four straight layers, had
never once been checked.

Before claiming a layer works, name the layer beneath it and state its level too. If the
foundation is `compiles`, nothing above it can honestly be called `verified-live`.

## Boundaries

- This skill **never** raises a claim's level. It only ever finds the true one, which in
  practice means lowering claims. If applying it makes something look more finished than
  before, it has been applied wrong.
- It does not judge code quality — that is `code-review`.
- It does not get a PR landing green — that is `merge-readiness`.
- It does not replace `session-harvest`. Harvest distils what a session *built*; this
  checks whether those claims are *true*. Run this before harvest, so the harvest inherits
  honest levels.
- A negative result is a real, publishable finding. "The agents are not running" is a
  successful use of this skill, not a failure to be softened or reframed.

## Machine enforcement — the reason this is not just advice

Advice in a file is exactly what got skipped across session boundaries. So the levels are
also checked by CI: a task in `.claude/tasks/CAMPAIGN.html` claiming `verified-live` must
carry a real evidence reference (a probe run ID, a commit SHA, or a committed test path).
`scripts/check-claims.py`, wired into `.github/workflows/ci.yml`, fails the build otherwise.

The skill is the reasoning. **The CI check is what survives a context cutoff.**
