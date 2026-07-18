# 2026-07-18 — Proposals channel: the hive suggests, you decide

**Summary:** You were explicit that human-in-the-loop is never removed — the hive should
surface suggestions (new implementations, goals, changes) and always wait for your actual
yes/no. Built that as a real, working channel, not just a promise in prose.

## Did

- New D1 table `hive_proposals` + `GET /v11/proposals` (public read) + `POST /v11/proposals`
  (create, anti-spam gated like other public writes) + `POST /v11/proposals/:id/decide`.
- The decide endpoint is gated by a new `founderAuthOk` helper — the deliberate opposite of
  the existing `tokenOk`. `tokenOk` fails *open* with no admin key bound (fine for a chat
  message). Approving a hive-evolution proposal is much higher-stakes, so `founderAuthOk`
  fails **closed**: with no `FOUNDER_KEY` secret bound, nothing can be decided by anyone,
  including you from the UI, rather than silently defaulting to "anyone can."
- fable-debugger caught a real coupled bug before shipping: the original decide query didn't
  check whether it actually updated a row, so deciding an already-decided or nonexistent
  proposal would still report success. Fixed to check `result.meta.changes` and return an
  honest 404 otherwise.
- Seeded four real, currently-open proposals — not placeholder examples: create the
  `venture` colony repo, provision Vectorize, provision R2, bind `FOUNDER_KEY` itself.
- New `ProposalsPanel.tsx` + nav entry; a founder-key field (stored only in your browser's
  `localStorage`) gates Approve/Reject in the UI to match the backend's fail-closed default.
- Documented the new `FOUNDER_KEY` switch in `FLIP_THE_SWITCHES.md`.
- Merged as PR #121.

## Needs

- `npx wrangler secret put FOUNDER_KEY` — until you set this, the Proposals panel is
  read-only for everyone, on purpose. Paste the same value into the panel's key field once
  it's bound.
- The `venture` repo — still the blocking step for the entrepreneurial-colony work
  (franchise/business-plan/invention intake, the revenue-irrigation design, the Entrepreneur
  Guild's opportunity-scouting mandate). Create it empty on github.com and hand it over.

## Learned

- A gate's *default direction* matters as much as whether it exists. `tokenOk`'s fail-open
  default is the right call for anti-spam on a low-stakes action; reusing that same pattern
  for "did the founder actually approve this" would have been a real, exploitable gap —
  anyone could have approved or rejected hive-evolution proposals. The fix wasn't more
  code, it was choosing the opposite failure mode for a higher-stakes action.
