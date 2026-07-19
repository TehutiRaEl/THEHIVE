# 2026-07-18 — Session harvest: rescued Mistral's AgentAvatar into the roadmap bars (PR #126)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(commit `b3d05fe`, pushed onto the still-open PR #126). Adapted Mistral's own orphaned
`AgentAvatar.tsx` (real code sitting unmerged on `feature/gamified-ui-components`, this
repo's own prior work — not third-party material) into the live SOUL tab, replacing the
prior pass's plain-div roadmap bars.

## Did

- **`frontend/src/components/kai-os/RoadmapAvatar.tsx`** (new) — kept the useful visual shape
  of Mistral's original (an animated-fill progress bar + circular avatar disc, via
  `framer-motion`, already a project dependency), but reskinned it end-to-end: the original's
  fictional `level`/`xp`/`xpToNextLevel`/`role` fields are gone entirely, replaced with the
  hive's real `RoadmapEntry` shape (`stage`, `nextStage`, `soul`, `soulToNext`, `progressPct`)
  from the `/v11/roadmap` endpoint shipped last pass.
- Wired it into `SOUL.tsx` in place of the plain-div bars — one `RoadmapAvatar` per active
  agent, plus an emphasized large one for the Hoard-level aggregate.
- Verified via `npm run build:app` — clean.

## Learned

- **This is what "adapt, don't blindly import" looks like when the source is the hive's own
  orphaned work, not a third party's.** `session-harvest`'s ownership gate is about
  external/hostile material; this case is neither — it's Mistral's own real, already-owned
  code sitting unmerged in the same repo. The discipline that still applied was the *design*
  one: don't wire in a component whose data model doesn't match reality. Reskinning it to the
  real roadmap data was the actual work, not a rubber-stamp copy-paste.
- **A scope-decision round can partially land even when the founder's actual answers get
  lost.** An `AskUserQuestion` call aborted mid-flight this pass (`"Tool permission stream
  closed before response received"`) — the founder later confirmed they'd answered far more
  extensively than the four multiple-choice prompts allowed for, but none of that content
  ever reached this session. Rather than block everything on a resend, the one piece with an
  unambiguous, low-risk recommended default (rescue the orphaned avatar component) shipped;
  the three higher-stakes pieces (Legal Guild depth, Sub-Architect scope, Entrepreneur Guild
  slice) were explicitly held back pending the founder's real words, not guessed at.

## Needs

- The founder's actual answers to the three still-open scope questions (Legal Guild depth,
  Sub-Architect role, Entrepreneur Guild first slice) — lost to the aborted tool call, asked
  for again directly in-conversation.
- Founder verification that the new avatar-style roadmap bars render correctly live (build
  passes; not yet eyeballed in a real browser by the founder).
- PR #126 still open, now with three commits.
