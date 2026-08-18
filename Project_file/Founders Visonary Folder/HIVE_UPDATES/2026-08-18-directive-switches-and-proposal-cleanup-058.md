# Directive: full-risk switches request + proposal-queue cleanup — 2026-08-18

## Founder's real words, verbatim

> "Eli5 wake up and run final sweep as well as it's Okay now for the high risk stuff ask me
> all questions to help you proceed without assuming then I give you permission to flip all
> switches that can be flipped by you I approve all proposals in the command center UI"

## Research done before acting (not assumed)

An Explore agent read every real "switch" in the repo (`AUTOMATON_FINANCIAL_AUTONOMY`,
`AUTOMATON_REPLICATION_AUTONOMY`, `QUEEN_AUTONOMOUS_APPROVAL`, the `KAI_*` ladder,
`GITHUB_ACTIONS_TOKEN`, `HIVE_FEDERATION_TOKEN`) and traced exactly what each controls and
how it's set. Separately, a live read-only query against the real production `thehive-queen`
D1 database (via the Cloudflare Developer Platform MCP tools) showed the actual pending-
proposal queue state.

**Findings, not assumptions:**
- Of every real switch, only `AUTOMATON_REPLICATION_AUTONOMY` is a plain env var a repo
  commit could flip — real code, complete, gates whether an approved `spawn_child` proposal
  forks a real child OS process. `AUTOMATON_FINANCIAL_AUTONOMY` needs new custody/legal code
  that doesn't exist yet (flipping the bare env var alone throws an error by design).
  `QUEEN_AUTONOMOUS_APPROVAL`, the `KAI_*` ladder, `GITHUB_ACTIONS_TOKEN`, and
  `HIVE_FEDERATION_TOKEN` are all Cloudflare-dashboard or GitHub-org secrets — genuinely not
  settable from inside this repo by me, regardless of authorization level.
- The live `hive_proposals` table had exactly 13 pending rows (ids 9-21), all `kind=
  'architect-proposal'`, all near-duplicate prose titled variants of "Address/Resolve Claude
  Authentication Error" spanning 2026-08-08 through 08-16 — no real code diffs, no bulk-
  approve mechanism exists in the code. They're symptomatic of one real, still-live
  production issue: the Worker's Claude/Anthropic provider failing with HTTP 401, almost
  certainly an expired/invalid `ANTHROPIC_API_KEY` — a Cloudflare Worker secret only the
  founder can rotate.

## Founder's real answers (AskUserQuestion, verbatim intent preserved)

1. `AUTOMATON_REPLICATION_AUTONOMY`: **No, leave it off.**
2. The 13 pending proposals: **Close them, flag the real root cause instead** — not
   blanket-approve.

## What was actually done

1. **No switch was touched.** No env var, workflow, or secret change anywhere.
2. **Closed all 13 pending proposals (ids 9-21)** directly against the live production D1
   database (`thehive-queen`, via the Cloudflare MCP tools — this container has no outbound
   HTTP reach to the live Worker, so the equivalent `UPDATE ... SET status='rejected'` that
   `POST /founder/proposals/:id/decide` would run was executed directly against the same
   table instead, verified by reading `decideProposal()` in `worker/src/index.js:458-523`
   first to match its exact behavior). Verified after: `SELECT status, count(*) ... GROUP BY
   status` for ids 9-21 confirms all 13 now `status='rejected'`.
3. **Posted a `hive_updates` entry** (id 1901) summarizing the closure and naming the real
   root cause, visible in the Command Center's own Updates feed — the same visibility
   mechanism the app's own code uses on every real decision.

## Real, actionable open item for the founder (the one thing in this sweep only you can do)

**Rotate `ANTHROPIC_API_KEY`** as a Cloudflare Worker secret (`npx wrangler secret put
ANTHROPIC_API_KEY` or via the Cloudflare dashboard). This is the actual fix for the 401 the
13 closed proposals were all reporting — closing the proposals is queue hygiene, not a
resolution. Until this is rotated, the Worker's provider waterfall will keep failing over
past Claude to Groq/Mistral/OpenAI/OpenRouter/Workers AI on every real request, and the
Queen's own autonomous proposal-generation loop will likely keep re-filing the same report.

## Final sweep result

Checked open PRs: only #183 (`constitution-receive.yml`) remains open, correctly still held
pending the founder's own resolution of its real conflict with the existing
`constitution-sync.yml` (opposite sync direction, same `hive.yml` hash field) — unchanged
from earlier this session, not re-litigated here. No new real, non-founder-blocked gap
surfaced in this sweep beyond the proposal-queue cleanup above.
