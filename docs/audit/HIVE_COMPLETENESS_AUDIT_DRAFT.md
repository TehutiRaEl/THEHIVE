# Hive Completeness Audit — has Mac provided everything necessary? (DRAFT, workspace-only)

**Status:** Draft checklist, 2026-11-10 (evening PT). Workspace-only. Mac asked
2026-11-10 (source:62): make sure he has provided everything necessary for
the Hive up till now, so the Hive is never blindsided waiting for something
he never gave it. This is a checklist to go through WITH him — not a verdict.
Nothing here is decided, merged, or written to any repo.

**How to use it:** go down the list with Mac, one row at a time. A row is
PROVIDED only when the thing exists in a form the Hive can actually use
(a file, a decision on main, a key in the right store) — not when it was
merely mentioned. Anything else is MISSING or IN PROGRESS, with the one
person who can supply it named.

**Note on scope:** the business-plans transfer (Drive → TehutiRaEl/venture,
structured, README per plan) is already in progress via a subagent
(2026-11-10) and is NOT duplicated here — it appears below only as a row
so the audit tracks it. The Commerce Lens deep-dive is also in progress
now (working doc `~/workspace/hive-batches/QUANTUM_COMMERCE_LENS.md`,
first question: what makes the Lens "quantum") and is listed, not redone.

## A. Founder decisions and governance — PROVIDED

| # | Thing | Where it lives | Status |
|---|---|---|---|
| A1 | Q-001–Q-010, all decided | `docs/FOUNDER_ANSWERED` on THEHIVE main | PROVIDED |
| A2 | Operator charter v0.5 | `docs/OPERATOR_CHARTER.md`, merged PR #218 | PROVIDED |
| A3 | F-005 v2 (later-wins), live law | `soul.md` on main, merged PR #220 | PROVIDED (known gaps NV-012–NV-017 live) |
| A4 | Canonical law F-001–F-006 only | `soul.md` (M-02, 2026-09-30) | PROVIDED |
| A5 | Stages-and-gates draft | `docs/AUTONOMY_STAGES_AND_GATES.md`, merged PR #224 as draft, NOT ratified | PROVIDED as draft |
| A6 | 20-rung done ladder, ratified | Workspace draft, ratified 2026-11-07 | PROVIDED |
| A7 | FABLE-5 spec (founder-provided) | `~/workspace/hive-batches/FABLE-5_SPEC.md` | PROVIDED; sits alongside rung 20 |
| A8 | Lenses order + gut-vs-lenses | Decided 2026-11-03 / 2026-11-05 | PROVIDED |
| A9 | Queen identity (Nanuet OVER the hive) | Decided 2026-11-05 | PROVIDED |
| A10 | Forest vision, spore plan, Blitzkrieg | Decided 2026-11-09 | PROVIDED |

## B. The Queen build — PROVIDED, with two live blockers only Mac can clear

| # | Thing | Status |
|---|---|---|
| B1 | Q-A built, merged PR #221, verified-live (brain provisioned:true, bound:true) | PROVIDED |
| B2 | Q-B built, merged PR #222/#223, deployed, stage 3 BUILT live | PROVIDED |
| B3 | QB-8 directive chosen ("Check live Worker + ACCESS status") | PROVIDED |
| B4 | Switch enablement (stages 1 + 3) in Mac's own browser | MISSING — dashboard sign-in failed twice, will not be retried; only Mac's signed-in browser works |
| B5 | FOUNDER_KEY via Secure Vault flow (never in chat) | MISSING — only Mac can supply it |
| B6 | Switch validator (red/yellow/green) | IN PROGRESS — draft at `~/workspace/hive-batches/SWITCH_VALIDATOR_DRAFT.md` (this run) |

## C. Money, keys, and survival — the thinnest shelf

| # | Thing | Status |
|---|---|---|
| C1 | Survival number calculated: $10/month | PROVIDED — `~/workspace/hive-batches/SURVIVAL_NUMBER.md`; one verification left (C4) |
| C2 | Tier 1 goals + milestones (fractal, dated) | PROVIDED — short $1,000 by Sun Nov 22, 2026; medium $10,000/month by Feb 28, 2027; long local hardware |
| C3 | Tier 1 pyramid, levels 2–6 extensive | PROVIDED — `~/workspace/hive-batches/TIER-1-PYRAMID-SKETCH.md` (2026-11-10 evening) |
| C4 | Zapier + Replit plan levels (free vs paid) | MISSING — record does not state them; if either is paid, the $10 survival number moves |
| C5 | Fresh Groq key, minted by hand, stored in gateway Provider Keys | MISSING — only Mac can mint it; Workers AI remains the only healthy brain |
| C6 | Claude API key for the Hive (subscription ≠ key) | MISSING — Mac renewed the Claude app subscription 2026-11-10; live probe same day still 401 on the stored key |
| C7 | Oracle Cloud account + home region | MISSING — only Mac can confirm; box not provisioned |
| C8 | Lore beats for Tier 1 scripting (Rank 1 + Shorts + Codex sections) | MISSING — asked 2026-11-06 and again 2026-11-10; gates all scripting |
| C9 | Commerce Lens deep-dive | IN PROGRESS — main agent, 2026-11-10 |
| C10 | Mogul / quantum middleman arbitrage mechanism | MISSING — concept recorded, deep-dive not started |
| C11 | Sufi practice, full entailments | MISSING — concept recorded, deep-dive not started |

## D. The novels (TAU) — PROVIDED as audit, with rulings outstanding

| # | Thing | Status |
|---|---|---|
| D1 | Full TAU repo audit + next-phase plan | PROVIDED — `~/workspace/tau-audit/` |
| D2 | Crossroads Book 1 as sole focus; Finale = Book 4's ending | PROVIDED — decided 2026-11-09 |
| D3 | Kappius spelling (repo "Kappius" vs Mac's "Kassppius") | MISSING — ruling needed from Mac |
| D4 | Subtitle collision ("The Last Breath Before Dawn" on two books) | MISSING — ruling needed from Mac |
| D5 | Book 2–4 titles source (import vs named now vs later) | MISSING — open |
| D6 | ChatGPT import (CANON-IMPORT-001) | MISSING — imports/ holds only READMEs; no manuscript material imported |

## E. Material provided but not yet placed in the Hive

| # | Thing | Status |
|---|---|---|
| E1 | Extensive business plans in Google Drive → TehutiRaEl/venture, structured, README each | IN PROGRESS — subagent, 2026-11-10 |
| E2 | Jasper 42 missing items (MUSE folder audit) | PROVIDED as inventory; review parked — top 10 first, after laws sandboxes; nothing built until Queen 100% |
| E3 | FABLE-5 Claude blueprint + mind map (41 KB) | PROVIDED — `~/workspace/hive-batches/FABLE-5_CLAUDE_BLUEPRINT.md`; awaiting Claude's plan back via Mac |
| E4 | Messiah Complex digest (repo doc ready) | PROVIDED — PR #223 merged; Nanuet brain entry + lens queued behind Queen 100% |

## F. Open founder decisions already queued (do NOT re-ask as new — list only)

1. Gate the Commune path (`POST /v11/command_text`, live + unauthenticated) to Mac-only — asked 2026-11-10.
2. Switch-9 truthiness fix — draft now or park until after QZ — asked 2026-11-10.
3. Proposal #120 (audit artifact, duplicate F-007 title) — reject / leave pending / decide — asked 2026-11-10.
4. Auto-flip proposal (six evidence items) + defining A3–A5 + the number N — open, from the stages-and-gates draft.
5. Tier 1 niche / lore beats (C8 above) — the blocker between here and the $1,000.

## What this audit does NOT claim

- It does not claim the list is complete. Its purpose is the opposite: a
  list Mac can correct, so the things he has forgotten to provide surface
  before the Hive needs them.
- "PROVIDED" means "in a usable form", not "mentioned once". If Mac
  remembers providing something listed as MISSING, the row flips on his
  word + a pointer to where it lives.
- Nothing in this file authorises a build, a merge, a switch flip, a spend,
  or a repo write. The Queen 100% rule stands: nothing else gets built
  until the Queen is 100%.

*End of draft. Next step: go through it with Mac, row by row, starting
with section C — the money/keys shelf is the thinnest, and C8 (lore beats)
is the one gating the $1,000 by Nov 22.*
