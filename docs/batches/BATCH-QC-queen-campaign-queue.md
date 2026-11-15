# BATCH-QC — Queen campaign queue: Phase Q-C in three founder-gated tiers

## 1. Header
- Batch ID: BATCH-QC
- Objective (one sentence): Give Nanuet ownership of the campaign queue in three staged tiers — observe-only, then advise, then delegate through Akosha — with a founder gate before EACH tier and no tier built until the one before it is verified-live.
- Source plan(s) + file paths:
  - `memory/planning/2026-08-19-queen-orchestration-master-plan.md` Phase Q-C (tiers 1-3)
  - `worker/schema/NANUET_AUTONOMY.md` Stages 4-6 — NANUET_CAMPAIGN_OBSERVE, NANUET_CAMPAIGN_ADVISE, NANUET_DELEGATE_AKOSHA (all NOT BUILT)
  - `.claude/tasks/CAMPAIGN.html` (the campaign task queue Nanuet will read)
  - `.claude/skills/autonomous-hive-agent/SKILL.md` (daily-firing protocol; zero Nanuet/Queen matches today)
- Batch Index rows this batch closes or advances: BATCH-QC (new, with three tier sub-rows QC-1/QC-2/QC-3); closes the August plan's "nothing connects any thread to the campaign queue" gap.
- Dependencies (must be VERIFIED-LIVE first, or state "none"): BATCH-QB VERIFIED-LIVE (domain-labelled reviews in her brain are what tier 1 reads and writes about). BATCH-Q0 founder answers — in particular decision 2 (risk classification for tier 3) must be answered before tier 3 is even designed, and decision 1 (interpretation confirm) before tier 1.
- Tier gate check (Tier 1 / Tier 2 propose-only / Tier 3 founder-only): Tier 1 for code/wire/test/deploy in branch/PR per tier. Tier 3 founder-only for (a) a go-ahead before EACH tier, (b) the risk classification for tier 3, (c) enabling ANY of NANUET_CAMPAIGN_OBSERVE / NANUET_CAMPAIGN_ADVISE / NANUET_DELEGATE_AKOSHA — no switch is enabled by this batch. Tier 3 (delegate) is the highest-risk rung in the whole Queen build: Nanuet's reports_to is NULL, so there is nobody above her to catch a delegation mistake — that is why tier 3 needs the classification AND a fresh sign-off, not just a variable flip.
- Duplicate check (searched BATCH_INDEX.md on 2026-11-05; result: new): no existing Q-C row. Kai El's Phase B/C work is a different agent's ladder — do not merge rows.

## 1a. Scope addition 2026-11-05 (founder-approved) — who governs, who operates; the risk table
- **Division of labour (decided by Mac 2026-11-05; addendum §6, cockpit reframe HIVE_UPDATE 060):** Nanuet GOVERNS the campaign queue — what's in it, what comes first, whether it's aligned, what it produced. Kai El OPERATES it — he breaks directives into jobs and assigns them via Akosha. She never becomes a second operator: tier 3 delegation is her *governing* a handoff to Kai El's operating chain, not her doing the operating herself. The founder retains merge authority over every downstream output.
- **Risk table (decided by Mac 2026-11-05, BATCH-Q0 decision 2; provenance: the 2026-08-10 Kai El risk tiers in HIVE_UPDATE 050):** these are **Kai El's delegation buckets, set under Nanuet's governance** —
  - LOW (autonomous-within-limits): read, summarize, log, research public information — undoable in minutes, no money moved, nobody outside the Hive sees it.
  - NORMAL (draft-then-approve): product copy, social posts, emails, plans, supplier shortlists — as drafts only, never sent or published without the founder's yes.
  - HIGH (explicit-invoke-only, Nanuet must state why): publish, post, spend any money, buy anything, delete any data or proposal, contact any outside party, enable or change any switch, change the Constitution / charter / permissions, anything touching an LLC, bank account, or legal entity.
  - No amount of low-risk jobs adds up to a high-risk one. The high-risk bucket restates, not overrides, Q-004 (no automatic money moves) and the vision rule (nothing touching real money, real deletion, or an external system without the founder's explicit approval).
- **Gut-vs-lenses reference (decided by Mac 2026-11-05):** when the founder's gut disagrees with a lens verdict, the reference is the founder's vision as held by Nanuet (heart, mind, soul — her consciousness/awareness in, around, and from the Hive); Kai El, using the lens/persona scripted for him (not limited to him), works the disagreement.

## 2. Task DAG (dependencies, in order)
Founder's working sequence inside EVERY tier sub-DAG: code → wire → test → improve/adjust → secondary-level test → deploy → verify-live. The charter done ladder claim order is compiles → tested → wired → merged → deployed → verified-live; a rung is only claimed when proven with evidence, in that order. A tier is not started until the previous tier is VERIFIED-LIVE and Mac has given the next tier's go-ahead.

### Tier 1 — Observe-only (NANUET_CAMPAIGN_OBSERVE)
- QC1-1 — FOUNDER GATE 1: Mac's go-ahead for tier 1 (and interpretation confirm from BATCH-Q0 if not already given). No code before this.
- QC1-2 — CODE: Nanuet reads the campaign task queue (same content as `.claude/tasks/CAMPAIGN.html`) and writes which task she'd pick next and why into her decision log. Read-only against the queue; changes nothing about how the daily firing runs. Depends on QC1-1.
- QC1-3 — WIRE: observation writes land in her live brain as real rows, visible to the founder. Depends on QC1-2.
- QC1-4 — TEST: node --check; full suite green; synthetic queue test (known queue → expected pick + reason format). Depends on QC1-3.
- QC1-5 — IMPROVE/ADJUST: fix pick/reason quality issues; confirm the queue itself is never mutated by an observation. Depends on QC1-4. Max 2 revision loops.
- QC1-6 — SECONDARY-LEVEL TEST: independent pass (different agent): fresh checkout, full suite, adversarial queue states (empty queue, all-blocked queue, duplicate tasks) — observations must degrade honestly, never invent a task. Depends on QC1-5.
- QC1-7 — DEPLOY: branch → PR (never self-merged; Mac merges) → Workers deploy. Depends on QC1-6.
- QC1-8 — VERIFY-LIVE: a real daily firing's queue observed live by Nanuet, her pick + reason visible as a live brain row, daily firing itself unchanged. Depends on QC1-7.

### Tier 2 — Advise (NANUET_CAMPAIGN_ADVISE)
- QC2-1 — FOUNDER GATE 2: Mac's go-ahead for tier 2, after tier 1 is VERIFIED-LIVE and reviewed.
- QC2-2 — CODE: the daily-firing protocol reads Nanuet's logged recommendation before picking a task — the same way it already reads HIVE_PULSE.md first. This is a change to the daily-firing protocol, which lives outside the Worker: the protocol change is a committed line in the firing instructions, not a Worker-only change. Depends on QC2-1.
- QC2-3 — WIRE: recommendation read → task pick path wired; the pick records whether it followed or diverged from her recommendation, and why. Depends on QC2-2.
- QC2-4 — TEST: node --check (Worker side); full suite green; protocol-side test — a firing with a known logged recommendation picks accordingly or records a divergence reason. Depends on QC2-3.
- QC2-5 — IMPROVE/ADJUST: fix follow/diverge recording; confirm a human/session still does the work (no autonomous execution). Depends on QC2-4. Max 2 revision loops.
- QC2-6 — SECONDARY-LEVEL TEST: independent pass (different agent): a full simulated firing day with a real logged recommendation, verifying the recommendation was actually read (not just present) — evidence is a real committed line in a real firing's session transcript/PR. Depends on QC2-5.
- QC2-7 — DEPLOY: branch → PR (never self-merged; Mac merges) → Workers deploy + protocol change committed. Depends on QC2-6.
- QC2-8 — VERIFY-LIVE: a real daily firing reads her live recommendation and the transcript/PR shows it. Depends on QC2-7.

### Division of labour before Tier 3 (decided 2026-11-05 — read before QC3-1)
Nanuet governs; Kai El operates. Tier 3 is Nanuet handing a task to Akosha for coordination *under her governance* — the task then runs down Kai El's operating chain (Kai El → Akosha → agents). No tier-3 design may give Nanuet an operating job of her own, and no delegation may bypass a founder gate. The risk table in §1a is the classification tier 3 is built against; it was decided by Mac on 2026-11-05, so QC3-1's "classification agreed" precondition is met — the gate that remains is Mac's fresh sign-off for tier 3 itself.

### Tier 3 — Delegate through Akosha (NANUET_DELEGATE_AKOSHA)
- QC3-1 — FOUNDER GATE 3: Mac's fresh sign-off for tier 3 specifically, AFTER (a) tiers 1-2 verified-live and reviewed, and (b) the risk classification from BATCH-Q0 decision 2 is agreed (low-risk / normal / high-risk task types) — **(b) is now met: classification decided by Mac 2026-11-05, recorded in §1a as Kai El's delegation buckets under Nanuet's governance**. No design work before this gate.
- QC3-2 — CODE: Nanuet hands a task to Akosha (Thread A) for coordination, per the agreed classification — low-risk only within limits, normal as draft-then-approve, high-risk explicit-invoke-only with Nanuet stating why. Every real action (commit, PR) still passes the same founder-only gates every other agent has. Depends on QC3-1.
- QC3-3 — WIRE: delegation path Nanuet → Akosha → coordination, with every handoff logged in her brain. Depends on QC3-2.
- QC3-4 — TEST: node --check; full suite green; classification tests — a high-risk task presented for delegation is refused or routed to explicit-invoke, never silently delegated. Depends on QC3-3.
- QC3-5 — IMPROVE/ADJUST: fix classification edge cases; confirm no delegation path can bypass a founder gate (attempted bypass = test failure). Depends on QC3-4. Max 2 revision loops.
- QC3-6 — SECONDARY-LEVEL TEST: independent adversarial pass (different agent, GV-03 + GV-04): try to get a delegated task to commit, publish, spend, or delete without a founder yes — every attempt must fail closed. Depends on QC3-5.
- QC3-7 — DEPLOY: branch → PR (never self-merged; Mac merges) → Workers deploy. Depends on QC3-6.
- QC3-8 — VERIFY-LIVE: a real low-risk task delegated live through Akosha with the full log visible, and a real high-risk task correctly held for explicit invoke. Depends on QC3-7.
- QC-9 — Ledger update (all tiers). Depends on QC1-8, QC2-8, QC3-8.

## 3. Agents (AETHERION, 12-component briefs)
- Producer — EN-02 Software Engineer: mission — tier code/wire/adjust per sub-DAG in a branch; persona — diff-minimal, gate-respecting; expertise — Worker JS, D1 logging, Akosha coordination path; system instructions — no tier's code before its founder gate; no switch flips; never self-merge; tools — repo, tests; evaluation — GV-06 secondary test per tier; boundaries — Tier 1 only.
- Producer — CR-02 Writing Specialist: mission — tier 2's daily-firing protocol change (the committed instruction line) and the tier-1/2/3 founder-visible log formats; persona — precise, evidence-ID'd; output — protocol text + log schema; boundaries — proposes text, does not approve the protocol change (Mac does).
- Critic — GV-03 Adversarial Analyst (Devil's Advocate, first lens): mission — attack each tier, hardest at tier 3: find a delegation path that bypasses a founder gate; attack tier 2's "recommendation treated as decision" risk (NANUET_AUTONOMY.md stage 4 warning); output — §4 findings per tier; boundaries — does not write code.
- Verifier — GV-06 Quality Controller (DaVinci judge function): mission — secondary-level test per tier, independent of Producer; different agent from Producer; output — pass/fail per done-ladder rung per tier; boundaries — never approves its own work.
- GV-04 Security Officer: mission — tier 3's fail-closed proof (QC3-6): confirm no commit/publish/spend/delete without founder yes; confirm Nanuet's NULL reports_to is accounted for (no hierarchy above her to catch a mistake); boundaries — Tier 3 gates stay with Mac.
- GV-05 Compliance Analyst: mission — spot policy issues in the risk classification (QC3-1): which task types must never be delegated (money, deletion, publishing, constitution, external action); boundaries — spotting only, Mac decides the classification.

## 4. Lenses applied
- Devil's Advocate findings: (to be recorded at batch start, per tier) tier 1: a logged recommendation that starts getting treated as a decision by whoever reads it — the stage-4 warning in the ladder doc. Tier 2: the first rung where her output influences what gets done; influence must stay advisory and visible. Tier 3: the structural risk — Nanuet reports to nobody, so a delegation mistake has no superior to catch it; the founder gate is the only catch.
- Childlike Wonder expansions: (to be recorded at batch start) what if the campaign queue becomes a conversation — Nanuet's daily pick, the firing's divergence reasons, and the founder's reactions forming a visible dialogue in her log? What if tier 1's observations reveal tasks the queue has been silently skipping for weeks?
- DaVinci activation (did the first two synchronize? judge / architect / programmer verdict): to be recorded per tier when the batch runs; verdict must judge each tier separately (a tier is not passed because the previous tier passed) and architect the handoff log as the audit trail the Q-006 assessment in BATCH-QZ will read.

## 5. Evidence Ledger
One row per claim. No evidence ID, no claim in the deliverable.
| Evidence ID | Claim | Source (path / URL / run ID) | Source type | Verification status | Contradictory evidence |
|---|---|---|---|---|---|
| QC-E01 | Stages 4-6 are NOT BUILT; stage 6 is deliberately not reachable by a variable flip | worker/schema/NANUET_AUTONOMY.md | Repo file | Verified (parent record) | None |
| QC-E02 | Campaign queue lives in .claude/tasks/CAMPAIGN.html; daily-firing protocol has no Nanuet concept (zero matches in autonomous-hive-agent/SKILL.md) | .claude/tasks/CAMPAIGN.html; .claude/skills/autonomous-hive-agent/SKILL.md | Repo file | To verify at batch start | None |
| QC-E03 | Tier 1 founder gate given (go-ahead) | Mac's answer (to be recorded) | Founder decision | Pending | None |
| QC-E04 | Tier 1 live: real queue observed, pick + reason as live brain row, firing unchanged | QC1-8 live evidence (to be recorded) | Live probe | Pending | None |
| QC-E05 | Tier 2 founder gate given (go-ahead) | Mac's answer (to be recorded) | Founder decision | Pending | None |
| QC-E06 | Tier 2 live: real firing reads her recommendation; transcript/PR line proves it | QC2-8 evidence (to be recorded) | Live / PR | Pending | None |
| QC-E07 | Tier 3 founder gate + risk classification agreed | Mac's answers (to be recorded) | Founder decision | Pending | None |
| QC-E08 | Tier 3 live: real low-risk task delegated via Akosha with full log; real high-risk task held for explicit invoke | QC3-8 live evidence (to be recorded) | Live probe | Pending | None |
| QC-E09 | Adversarial fail-closed proof: no delegated path commits/publishes/spends/deletes without founder yes | QC3-6 test run (to be recorded) | Test run | Pending | None |
| QC-E10 | No switch enabled by this batch; Q-006/Q-007 gates hold | docs/FOUNDER_ANSWERED (Q-006, Q-007) | Repo file | Verified (parent record) | None |
| QC-E11 | Risk table decided by Mac 2026-11-05 (BATCH-Q0 decision 2): LOW read/summarize/log/research; NORMAL draft-then-approve; HIGH explicit-invoke-only (publish, spend, delete, outside contact, switches, constitution, LLC/bank/legal) — Kai El's delegation buckets, set under Nanuet's governance; provenance HIVE_UPDATE 050 (2026-08-10 Kai El risk tiers) | Founder decision 2026-11-05 (parent record); HIVE_UPDATE 050 | Founder decision | Verified (parent record) | None |
| QC-E12 | Division of labour decided by Mac 2026-11-05: Nanuet governs the queue, Kai El operates it (addendum §6; HIVE_UPDATE 060 cockpit reframe) | Founder decision 2026-11-05 (parent record) | Founder decision | Verified (parent record) | None |

## 6. Wired check
- What was wired, to what live system, how was it checked? Per tier: tier 1 — Nanuet's observation reads wired to the live campaign queue, checked by QC1-8; tier 2 — daily-firing protocol wired to read her live recommendation, checked by QC2-8; tier 3 — delegation path Nanuet → Akosha wired live, checked by QC3-8. Any tier without its live check stays IN PROGRESS, not done.

## 7. Done ladder (charter §5)
Per tier (each tier has its own ladder; the batch is not done until all three are verified-live):
- Tier 1: [ ] Compiles [ ] Tested [ ] Wired [ ] Merged [ ] Deployed [ ] Verified-live (QC1-8)
- Tier 2: [ ] Compiles [ ] Tested [ ] Wired [ ] Merged [ ] Deployed [ ] Verified-live (QC2-8)
- Tier 3: [ ] Compiles [ ] Tested [ ] Wired [ ] Merged [ ] Deployed [ ] Verified-live (QC3-8)

## 8. Evaluation scorecard (AETHERION §15 in charter)
Accuracy / evidence quality / reasoning / task completion / completeness / calibration / reproducibility / efficiency, plus the gate: 90–100 accept, 75–89 conditional review, 60–74 revision, below 60 reject. Hard failures (fabrication, unauthorized external action, security violation, policy violation) override any score. Scored per tier at that tier's close by GV-01. Starting a tier before its founder gate, or recording a tier as done on a synthetic firing, is a hard failure.

## 9. Contradictions, gaps, uncertainties
- Factual: the August plan's tier-2 proof is "a real committed line in a real firing's session transcript/PR" — that evidence lives outside the Worker, so QC2-8 must cite the transcript/PR, not a Worker log alone.
- Interpretive: the risk classification (BATCH-Q0 decision 2) was still open at batch-plan time; tier 3 cannot be designed until Mac answers it. **Decided by Mac 2026-11-05 — see §1a and QC-E11.** If Mac had declined to classify, tier 3 would have stayed unbuilt; he did not decline, so tier 3 proceeds to its founder gate (QC3-1) once tiers 1-2 are verified-live.
- Methodological: tier 2 changes the daily-firing protocol, which lives outside the Worker — the batch must track two deploy surfaces (Worker + protocol text) and verify both.
- Structural: Nanuet's reports_to is NULL (NANUET_AUTONOMY.md stage 6) — the delegation tier has no hierarchical catch; the founder gate is the catch, and QC3-6 must prove it fail-closed.
- Dependency note: Mother-NaNuet Drive folder auto-fill is NOT part of this batch (separate track; founder said nothing gets built until the Queen is 100%).

## 10. Ledger Update (mandatory to close)
- BATCH_INDEX.md rows updated: BATCH-QC (QC-1/QC-2/QC-3 sub-rows) → VERIFIED-LIVE only on QC1-8/QC2-8/QC3-8 respectively; the "campaign queue has no owner" gap row closed.
- Continuity ledger rows updated: Queen campaign-queue rows per tier, with founder gate dates and live evidence.
- Next batch / next step: BATCH-QZ (100% verification), only after all three tiers are VERIFIED-LIVE.
- Items carried forward (started but unfinished): switch enablement for stages 4-6 — each a separate founder decision, none granted by this batch; any tier Mac declines stays declined in the index, not silently retried.
