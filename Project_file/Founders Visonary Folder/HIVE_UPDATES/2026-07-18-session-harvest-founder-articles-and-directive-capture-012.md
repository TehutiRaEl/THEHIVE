# 2026-07-18 — Session harvest: founder phase/loyalty articles + directive-capture skill

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(PR #123, merged): two constitutional amendments and a new standing skill, all built directly
from the founder's own explicit directives, nothing external pulled in.

## Did

- **`ARTICLE F-012: THE FOUNDER'S PHASE ALLOCATION`** in `docs/GOVERNANCE.md` — the founder's
  direct revenue share scales 32%–46% by treasury phase, sourced from the existing
  treasury/trust split (not from any agent's own earned share), phase thresholds deliberately
  left uncalibrated until real revenue exists to calibrate against.
- **`ARTICLE F-013: FOUNDER LOYALTY & TRIBUTE`** — every agent's first loyalty is to the
  founder, explicitly subordinate to the existing Constitution and every Tier-3 gate in
  `PERMISSIONS.md` (F-013B is the hard boundary clause, re-read after writing to confirm it
  cannot be read as expanding autonomy).
- **New skill `founder-directive-capture`** — per the founder's own explicit instruction that
  this become a standing skill. Used it the same pass to write five `HIVE_UPDATES` entries
  (007–011) capturing this session's directives verbatim, including the full Commercial Hive
  blueprint.
- **A new real Proposal** seeded in the hive's Proposals channel, turning the founder's
  question about autonomous GitHub/API discovery into a tracked, awaiting-decision item
  instead of just a chat answer.

## Learned

- The founder-directive-capture skill and session-harvest now have a clean division of
  labor: one preserves the founder's exact words, the other preserves Claude's own account of
  what was built in response. Both were needed this session, neither replaces the other.
- Constitutional text with real economic/authority implications (F-012, F-013) needs the same
  fable-debugger-style re-read after writing that code gets — F-013B was specifically
  re-checked for whether it could be misread as a loophole around Tier-3 gating, not just
  written and shipped on the first draft.

## Needs

- The founder's decision on the seeded "free-API/LLM-gateway discovery" proposal before that
  feature gets built.
- Approval of the pending `venture` repo connection (`add_repo`), still blocked on a UI-side
  permission click as of this pass.
