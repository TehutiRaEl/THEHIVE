# Machine enforcement — what to switch on, and exactly why

Written 2026-08-07, in direct answer to the founder's question after being told that the
day's new skills were procedural and nothing enforced them:

> *"you said none of this is machine reinforced — if there isn't a skill for it I want to
> know how I could utilize GitHub fully."*

This is the honest list. **Everything here is a founder action** — repo settings and
connector authorisations belong to the account owner, not to an automated session. The
configuration is written out exactly so it takes a few minutes, not an investigation.

---

## Why this matters more than usual in this repo

A reality audit (`VISION/2026-08-07-vision-reality-audit-007.md`) proved two things that
these settings directly address:

1. **Unmerged branch code is serving production.** Verified: `active_provider_basis` and the
   `Orchestrator` agent row appear in live API responses with **zero** occurrences in
   `origin/main` (probe runs `31216723801`, `31216919290`). The standing rule *"automation
   never merges, every change waits for founder review"* assumes unmerged work is not live.
   **That assumption is false today.**
2. **34 of 36 `done` tasks had never been confirmed against production**, and 84% of promised
   follow-up verifications never happened — because the rule lived in a session's context
   instead of in a machine.

A rule a session can forget is not a rule. These settings are rules a session *cannot* forget.

---

## 1. Branch protection on `main` (highest value)

**GitHub → Settings → Branches → Add branch ruleset → target `main`.**

| Setting | Value | Why |
|---|---|---|
| Require a pull request before merging | **on** | Makes "nothing lands without review" structural |
| Required approvals | **1** | The founder is the approver |
| Dismiss stale approvals on new commits | **on** | An approval must apply to the code that actually merges |
| Require status checks to pass | **on** | See §2 |
| Require branches up to date before merging | **on** | Prevents merging against a stale base |
| Require conversation resolution | **on** | No silently-ignored review comments |
| Do not allow bypassing | **on** | Otherwise admins (and automation acting as one) skip all of it |
| Allow force pushes | **off** | History stays auditable |
| Allow deletions | **off** | — |

> **Note on the "never merge" rule.** Branch protection enforces *review before merge*. It
> does **not** stop a branch from being deployed by Cloudflare — that is §3, and it is the
> actual hole. Turning this on without §3 gives a false sense of a closed gate.

## 2. Required status checks

Two checks exist today and both should be merge-blocking. Names must match the job names in
`.github/workflows/ci.yml` exactly:

- **`Test (Worker, Node 22)`** — 35 tests over the provider-routing and `generate()` logic.
  Mutation-tested: breaking the routing rules fails 5 and 7 tests respectively, so this check
  genuinely catches regressions rather than passing vacuously.
- **`Test (Python 3.11)`** — the existing backend suite, coverage floor 45%.

The `wired-or-not` claims check (`scripts/check-claims.py`) runs inside the Worker job, so it
blocks merges automatically once that job is required. That is the machine half of "never
write a bare `done`": a task claiming `verified-live` without a run ID, SHA, or committed
test path fails the build.

## 3. Cloudflare Workers Builds — the actual hole

**This is the one that matters most, and it is not a GitHub setting.**

**Cloudflare dashboard → Workers & Pages → this Worker → Settings → Builds → Branch control.**

Restrict production deploys to `main` only. Until this is done, **pushing any branch is a
production deploy**, which is why unmerged code is live right now.

Whichever way it is decided, `/v11/debug/git` should stop returning hardcoded
`"branch":"main"` and report real build metadata or honest "unknown" — the endpoint whose job
is deploy identity is currently stating a falsehood.

**Faster alternative:** enable the **Cloudflare Developer Platform** connector (already
installed on the account, currently `enabledInChat: false`). With it on, an AI can read the
Workers Builds configuration and real D1 usage directly, instead of this being a question
only the founder can answer. That single toggle would unblock CAMPAIGN tasks 46 and 51's
data, and the D1-space question.

## 4. Optional, lower priority

- **CODEOWNERS** (`.github/CODEOWNERS`, `* @TehutiRaEl`) — auto-requests founder review on
  every PR. Complements §1 rather than replacing it.
- **Secret scanning + push protection** — Settings → Code security. Blocks a committed
  credential at push time. Cheap insurance given the number of API keys this project handles.
- **Dependabot security updates** — the frontend has a large dependency tree.

---

## What this does NOT fix

Stated plainly, because the failure mode this repo keeps hitting is believing a rule is
enforced when it is not:

- **No CI check can verify that a lens was applied**, that founder input was triaged, or that
  a batching decision considered resonance. `dual-lens`, `founder-input-intake`, and
  `hive-conductor` remain **procedural**. Assume they can be skipped.
- **Required checks only bind merges to `main`.** They do not gate deploys — §3 does.
- **`check-claims.py` verifies that evidence is *cited*, not that the evidence is *good*.** A
  claim citing a real run ID that does not actually prove the claim will pass. It raises the
  floor; it does not replace reading.

The rule of thumb this repo earned the hard way: **if it is not in a workflow file or a repo
setting, treat it as advice.**
