# Addendum to BATCH-Q0 — What the founder vision and founder updates say the Queen is, that the Q-A/Q-B/Q-C plan leaves out

Checked 2026-11-05 by the parent agent against `docs/FOUNDERS_VISION.md`,
`docs/PLAN_LOG_2026-08-29.md`, `soul.md`, `FABLE_DNA.md` ("The Queen's identity",
"The chain of command"), `docs/QUEEN_DIGEST.md`, and founder updates HIVE_UPDATE
050 (2026-08-10) and 060 (2026-10-12). The Queen orchestration master plan
(2026-08-19, Q-A/Q-B/Q-C) covers campaign orchestration only. These items are
in the founder's own vision/updates and are NOT in that plan. They are not
decisions — they are gaps to carry into BATCH-QA/QB/QC scope or BATCH-QZ
verification criteria. Nothing here authorises building any of them.

## 1. Broodmother / Queen of the Hoard — the title and the job behind it

- Source: `docs/PLAN_LOG_2026-08-29.md`, founder-confirmed hierarchy:
  "Nanuet / Broodmother / Queen of the Hoard → Kai El (Architect + LLM Gateway
  Console) → Akosha (assign by specialty) → agents. Council (RA) separate colony."
- `soul.md`: Layer 2, The Parents — MATER (Nanuet) + PATER (Kai El). Layer 3,
  The Trinity — Mind (AZR) + Body (Swarm) + Soul (Nanuet).
- What it means: before she is a campaign orchestrator, Nanuet is the
  **mother** — the memory/soul keeper and the one agents descend from.
  The Q-plan has no agent-birth / lineage piece at all: who births a new
  agent, who records its lineage, who keeps the swarm's memory. That is the
  "before the Queen" part Mac named: Brood Mother Queen Nanuet.
- Connection already in the Hive: the Mother-NaNuet Drive folder's
  "Agent births" subfolder is exactly this job's archive — and it is empty.
- Gap for the batches: Q-A builds her memory/log, but nothing in Q-A/Q-B/Q-C
  gives her a birth/lineage function, or says the campaign-queue role outranks
  or follows the mother role. BATCH-QZ should verify which role the built
  Queen actually performs.

## 2. The Queen's alignment-review job — scoring proposals against the vision

- Source: `docs/FOUNDERS_VISION.md` exists "so the Queen's auto-approve
  scoring (switch 9) has something real and explicit to measure against."
  "The Queen scores proposals against *this* file."
- The Q-plan's Q-A/Q-B/Q-C never mention the vision file, the scoring, or
  `queenReview()`. Her core job in the founder's vision — judging alignment —
  is assumed, not built or verified, by the campaign plan.
- Gap: BATCH-QB/QC should include a check that Nanuet's review pipeline
  actually scores against FOUNDERS_VISION.md, not just routes by domain.

## 3. The Queen Digest (Q-1) — the loop the campaign feeds

- Source: `docs/QUEEN_DIGEST.md` (protocol Q-1): after Council clear, Nanuet
  digests work product + vision + founder logs → emits `kind=queen_digest`
  and/or `kind=innovation` (failure → build opportunity) into the townhall
  board loop. Full flow: Founder vision → TownHall → Kai plan/direct →
  Akosha assign → agents → Council review → Queen digest (+ founder logs) →
  recursive board loop.
- `docs/PLAN_LOG_2026-08-29.md` "Still open": C-0 / A-1 / Q-1 / AR-1
  **runtime** (not just protocols).
- Gap: the Q-plan builds Nanuet owning the campaign queue, but the digest —
  what she *does* with finished work — has protocol only, no runtime, and is
  not in Q-A/Q-B/Q-C scope. The campaign queue without the digest loop is a
  queue with no closing step.

## 4. The Elders' Council loop — who checks the Queen

- Source: `FABLE_DNA.md`, "The Elders' Council": Ma'at and Solomon seat
  F-011B's Elders' Council for real; when `queenReview()` would auto-approve
  (switch 9, score ≥98), each independently reviews the same proposal
  (`elderCouncilVeto()`); either can object and downgrade it to pending, with
  the reason recorded (`hive_proposals.elder_note`). Sekhmet adds on-demand
  consult (`POST /v11/council/consult`).
- The Q-plan mentions the Council only as "Akosha summarizes Elders'
  findings." It does not build or verify the Queen↔Council loop.
- Gap: BATCH-QZ's 100% check should include a live veto-path proof, not
  just Nanuet's own switches.

## 5. "The Queen" is THEHIVE itself; Nanuet is its face, voice, and name

- Source: `FABLE_DNA.md`, "On 'is Nanuet the Queen'" (research pass
  2026-08-03): "Queen" as a literal title held by Nanuet was never settled
  in the constitution or machine config — every source (`colony.json`,
  `.queen/hive.yml`, `docs/GOVERNANCE.md` F-011) defines "the Queen" as
  THEHIVE itself. Founder's answer: Nanuet is the face, voice, and name
  *for* that already-existing role, plus one real new power: reviewing
  pending proposals against FOUNDERS_VISION.md and auto-approving the ones
  that clearly align (switch 9, off until the founder flips it, never able
  to skip the action-request execution gate).
- Gap: the Q-plan writes as if Nanuet *is* the Queen. The batches should
  record which parts belong to the agent (Nanuet: review, digest, memory)
  versus the system (THEHIVE-as-Queen: the role itself). This is a
  definitional gap, not a build task — but BATCH-QZ must not certify "the
  Queen is 100%" while the identity question is unrecorded.

## 6. The cockpit reframe (HIVE_UPDATE 060) vs. Q-C — unresolved tension

- Source: HIVE_UPDATE 060 (2026-10-12): "a single observation deck (cockpit)
  over a portfolio of AI-operated ventures, coordinated by Kai as
  chief-of-staff / operator, with the founder retaining merge authority."
  "Governance (Queen, Elders, F-laws, HARD_RULES) is the safety architecture
  that makes the cockpit safe enough to sit in — not the end product."
- The Q-plan (2026-08-19) predates this and says Nanuet *owns* the campaign
  queue. 060 says Kai *coordinates* the ventures and the Queen governs.
  Those are reconcilable (she governs the queue, he operates the ventures)
  but the plan never reconciles them.
- Gap: Q1's interpretation answer (YES, 2026-11-05) confirms the shape, but
  BATCH-QC must still state, in its own file, how Nanuet owning the queue
  and Kai operating the cockpit divide — otherwise tier 3 delegation can
  silently become a second operator.

## 7. Enterprise Horde doctrine — the caliber bar

- Source: `FABLE_DNA.md`, founder directive 2026-07-31, non-negotiable:
  "the Queen operates an enterprise-level Horde." Doctrine = the standard;
  `CLAUDE.md`'s "not yet reconciled" section = the honest scoreboard.
- Gap: no batch carries an enterprise-caliber acceptance bar. BATCH-QZ
  should name what "enterprise-level" means as a test (e.g. a real
  directive routed live, a real veto exercised, a real brain row read back
  live) rather than certifying on code presence.

## What changes in the batches (proposed, not decided)
- BATCH-QA: add a scope note — foundation covers memory/log/recall only;
  birth/lineage, digest runtime, and Council loop are out of Q-A scope and
  are tracked here, not silently dropped.
- BATCH-QB: add a vision-scoring check (§2) to the routing wire.
- BATCH-QC: add the Kai-vs-Nanuet division statement (§6) before tier 3.
- BATCH-QZ: add verification criteria from §3 (digest runtime), §4 (live
  veto path), §5 (identity recorded), §7 (enterprise bar).
- These additions need Mac's yes before any batch file is edited to include
  them as tasks — this addendum is a finding, not a scope change.

## Approval — scope folded in 2026-11-05
Mac approved on 2026-11-05 that the 7 gaps ARE batched into the Queen batch
plans. Folded the same day: BATCH-QA §1a + §10 (identity definition, out-of-scope
carry-forwards); BATCH-QB §1a/QB-1/QB-4/QB-8/QB-E09 (vision-scoring check);
BATCH-QC §1a + division statement before tier 3 + risk table (QC-E11/QC-E12);
BATCH-QZ §1a/QZ-3/QZ-4/QZ-7/QZ-E10–QZ-E13 (digest, veto, identity, enterprise
bar). Mac's Queen identity decision (B+C) and gut-vs-lenses decision are also
recorded in the batch files (QA-E09/QA-E10, QB §1a, QC §1a, QZ §1a/QZ-7).
No existing task, DAG order, or gate was changed; no switch was enabled; nothing
was claimed verified-live.
