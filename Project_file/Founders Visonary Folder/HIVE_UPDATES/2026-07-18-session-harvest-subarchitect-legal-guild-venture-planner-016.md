# 2026-07-18 — Session harvest: Sub-Architect, Legal Guild v1, venture planner (PR #126)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(commit `25154d2`, pushed onto the still-open PR #126). This round acted on the founder's
actual answers to the four scope questions from the earlier AskUserQuestion — recovered via
screenshots after the original tool call lost the response — rather than the recommended
defaults used as a stopgap in the prior pass.

## Did

- **Rewired (not retired) the level/XP framing** — the founder explicitly wanted the
  fictional level/xp model from Mistral's orphaned `AgentAvatar.tsx` kept, but driven by real
  data for all current and future agents. `computeRoadmap()` now also returns
  `level`/`xp`/`xpToNextLevel` as pure derivations of the same real stage/soul values (not a
  second, separate progress system) — `RoadmapAvatar.tsx` shows both the constitutional stage
  name and the level/XP badge together.
- **Cataloged, not built, the founder's larger 3D-universe vision** — a new VISION entry
  capturing the macro(universe of colonies-as-planets)→colony(world)→micro(3D avatar)
  navigation concept and the eventual Unreal Engine phase, honestly cross-referenced against
  the real, already-scaffolded (but currently broken, ~247 TS errors) `frontend/src/worlds`+
  `voxel` tree — this is unfinished prior work toward the same vision, not nothing.
- **Sub-Architect charter** — added to `TEAM_CHARTERS.md`, explicitly subordinate to the
  Harness & Lead Manager (documented honestly that no separate "Architect" seat exists in this
  file, so the founder's "head architect" was mapped to the closest real existing role rather
  than inventing an undefined one). Hard boundary: no independent execution authority.
- **Entrepreneur Guild's first buildable slice** — `POST /v11/venture/plan` (real LLM-backed
  goal→departments→tasks decomposition, reusing the Worker's existing provider waterfall) +
  `VenturePlanner.tsx`. Seeded the founder's own venture example (book-merch dropshipping +
  faceless multi-platform social, SEO-driven trending-niche discovery) as a real tracked
  proposal. Explicitly never executes anything real (no account creation, no posting, no
  spend) — everything funnels through the existing founder-gated Proposals channel.
- **Legal Guild v1** — `POST /v11/legal/research` + a Q&A box in `LegalLearning.tsx`, matching
  the founder's own confirmed choice (a real research assistant, hard disclaimer — not a
  false-authority persona). The system prompt explicitly instructs the model never to claim a
  bar exam or license, to explain the real sovereign-vs-sovereign-citizen distinction, and to
  say "I don't know" rather than fabricate a citation.

## Learned

- **A tool failure and a founder's actual intent are two different repairs.** The prior pass
  correctly disclosed that four scope answers were lost to an aborted `AskUserQuestion` call
  and proceeded on recommended defaults as a stopgap — but a stopgap default is not the same
  as the founder's actual answer, and this pass shows how differently things landed once the
  real answers arrived (keep-and-rewire vs. retire the level/XP system; a much bigger venture
  scope than "intake form only"; a specific reporting relationship for Sub-Architect). Worth
  remembering: a default chosen under uncertainty should be treated as provisional, not final,
  and revisited the moment real input arrives — which is exactly what happened here.
- **"The founder's own words, verbatim, screenshotted from elsewhere" is a legitimate source
  to act on** — same standing as any other founder-directive-capture case, even though it
  arrived as images from what appears to be a different session/conversation rather than
  this session's own chat. Reading the screenshots directly (not guessing at their contents)
  was the correct move before building anything.
- **Grounding a claimed role ("the head architect") against what's actually chartered** caught
  a real gap: no "Architect" seat exists in `TEAM_CHARTERS.md` at all. Rather than silently
  inventing one or ignoring the founder's reporting-line instruction, the honest move was to
  map it to the nearest real existing role and say so plainly, leaving a distinct Architect
  seat as a named, undone follow-up if the founder wants one later.

## Needs

- Founder verification of all four live surfaces (roadmap avatar bars with level/XP, Venture
  Planner, Legal Guild Q&A, the new venture proposal) — build/syntax checks pass, not yet
  eyeballed live.
- A separate reply is owed on the founder's follow-up question about whether "the HORDE" can
  run this same build→verify→checkpoint→continue loop autonomously — answered in-conversation
  this pass with an honest assessment (real prior code exists in `backend/core/agent_engine.py`
  `ReactAgent` and `hitl.py`, but it's dormant since System A is unprovisioned; the actually-
  running version of this loop this whole session has been this Claude Code session itself,
  optionally extendable via the `agent-harness` skill) rather than assumed answered here.
- PR #126 still open, now five commits, retitled and re-described to reflect full scope.
