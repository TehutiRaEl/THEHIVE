# BATCH-001 — Plan accumulation + de-duplication

## 1. Header
- Batch ID: BATCH-001
- Objective (one sentence): Turn every plan in BATCH_INDEX.md §A into one ordered, de-duplicated work list, so no later batch audits the same plan twice, merges two different wires, or treats external material as repo law.
- Source plan(s) + file paths: all §A rows in ~/workspace/hive-batches/BATCH_INDEX.md — master pointer memory/planning/2026-08-18-unified-forward-plan-v2.md; memory/planning/2026-08-19-consolidated-execution-plan.md; memory/planning/2026-08-19-queen-orchestration-master-plan.md; memory/planning/2026-07-19-unified-forward-plan.md; memory/planning/hive-master-plan-2026-07-04.md; memory/planning/harness-plan-2026-07-10.md; docs/full-plan.html; .claude/tasks/FULL_PLAN.html; docs/GROK_CAMPAIGN_WORK_PLAN.md; Project_file/Founders Visonary Folder/VISION/master-mind-map-roadmap-2026-09-28/MASTER_ROADMAP_OUTPUT_02.md; memory/planning/2026-09-28-master-mind-map-roadmap-weave.md; docs/PLAN_LOG_2026-08-29.md; memory/planning/architecture-gap-assessment-2026-07-13.md; memory/planning/reconstructed-state-2026-07-04.md; memory/planning/CLAUDE.md; Project_file/Founders Visonary Folder/ACTIVE/2026-10-12-batch-plan-cockpit-audit-kai-fork (extensionless — read its content first); Project_file/Founders Visonary Folder/ACTIVE/ 2026-07-08–2026-08-19 question/status files; docs/PLAN_FRAGMENTATION_DIAGNOSTIC_2026-09-25.md; docs/phases.md; Project_file/Founders Visonary Folder/ACTIVE/ pointers; Project_file/FOUNDERS_VISONARY_PLAN/ACCESS_BUILD_THIS_WEEK_Plan(1).md; docs/TOWNHALL.md and TH-1 batch docs (PR #194). External material only: Grok artifacts in /home/workdir/artifacts/ and the Update.pdf 50-repo synthesis — provenance rows, never repo-law rows.
- Batch Index rows this batch closes or advances: BATCH-001 (NOT STARTED → IN PROGRESS on run, → VERIFIED-LIVE only on the §7 evidence below). It does NOT close BATCH-002–BATCH-015; it orders and de-duplicates their sources.
- Dependencies (must be VERIFIED-LIVE first, or state "none"): none for a workspace draft. Repo read access to TehutiRaEl/THEHIVE is required for the execution step; a repo push of the resulting ordered list is a separate, founder-gated step and is NOT part of this batch.
- Tier gate check (Tier 1 / Tier 2 propose-only / Tier 3 founder-only): Tier 1 — read, compare, draft in workspace. No merge, publish, spend, delete, or external contact. Any row touching money, deletion, publishing, constitution, or an external system stops at propose-only and is flagged for Mac.
- Duplicate check (searched BATCH_INDEX.md on 2026-11-04): row BATCH-001 existed as NOT STARTED with no batch file in ~/workspace/hive-batches/batches/ (only BATCH-000 was there). This file fills that row; it is not a second copy of BATCH-000, BATCH-004 (the plan-docs audit itself), or BATCH-007 (skill census).

## 2. Task DAG (dependencies, in order)
- TASK-001 (EX-02 + IN-05, PARALLEL reads): read each §A plan and record, per plan, its date, its own stated scope, and every work item it names, with its repo path. Do not summarise away a path.
- TASK-002 (KM-02, depends on TASK-001): de-duplicate. One work item = one row. Rules: (a) v2 supersedes v1 / 2026-07-19 plan where they conflict, earlier layer kept as provenance, never deleted; (b) docs/full-plan.html and .claude/tasks/FULL_PLAN.html are one plan family, audited once; (c) TH-1 wire (BATCH-015) and Dual Lens wire (BATCH-003) stay separate rows; (d) the two Jasper 4.pdf copies are one document; (e) Grok external packages stay marked external until landed by PR.
- TASK-003 (IN-03, depends on TASK-001): resolve the two pointer traps before any row is closed — read the content of the extensionless ACTIVE 2026-10-12 batch-plan file (do not assume it duplicates Grok's batch plan), and follow each ACTIVE pointer to its target (do not trust the pointer alone). Record .md vs extensionless FOUNDER_QUEUE as two distinct rows until their contents are compared.
- TASK-004 (EX-03, depends on TASK-002 + TASK-003): order the de-duplicated list by dependency (dependencies first), not by plan-document order, and map each row to its existing BATCH_INDEX row or propose a new row with a reason.
- TASK-005 (AN-01 / GV-03 critic, depends on TASK-004): Devil's Advocate pass — flag every row where a plan claims a thing is done, wired, or live without evidence, and every row where two plans contradict each other. No contradiction is forced into consensus; unresolved items go to §9 and to Mac.
- TASK-006 (CR-01 / IN-06, PARALLEL with TASK-005, same input): Childlike Wonder pass — what does the ordered list make possible if completed (e.g. any AI entering cold and picking up exactly where the last left off)? Expansions are possibilities, never commitments.
- TASK-007 (EN-01 + GV-06, depends on TASK-005 + TASK-006): DaVinci gate — only if the first two lenses synchronise: judge each row's verdict, architect the final ordered list, and write the concrete, buildable output (updated BATCH_INDEX.md §B rows + §C log, in workspace draft form).
- TASK-008 (GV-02, depends on TASK-007, different agent from every producer): independent verification — re-read a sample of source paths, check every evidence ID in §5, and confirm no row was closed on a claim alone. Maximum 2 revision loops back to TASK-004; after that, the batch reports as blocked, not done.
- TASK-009 (EX-01, depends on TASK-008): ledger update (§10) and a one-page summary for Mac: rows added, rows merged, rows left open, and the exact founder decisions still needed. No repo push in this batch.

## 3. Agents (AETHERION, 12-component briefs)
Registry IDs from ~/workspace/hive-batches/AGENT_REGISTRY.md. Producer, Critic, and Verifier are different agents; no agent approves its own work. Each brief, at run time, must be expanded to the full 12 components (identity, mission, persona, expertise, system instructions, tools, functions, memory, context, output schema, evaluation, boundaries) before it starts.
- EX-01 Chief Orchestrator — owns the objective, the DAG, conflict resolution, and the deliverable to Mac. Boundary: cannot override Tier 3 gates.
- EX-02 Strategic Planner — milestones and dependency order for TASK-004.
- EX-03 Task Decomposer — executable subtasks with prerequisites.
- IN-03 Investigative Researcher — deep evidence collection, source evaluation, contradictions. Output: findings + evidence + contradictions + uncertainties + confidence.
- IN-05 Historical Analyst — chronology and provenance of plan layers (2026-07-04 → 2026-07-19 → 2026-08-18/19 → 2026-09-28 → 2026-10-12).
- KM-02 Knowledge Curator — deduplication, provenance, supersession, freshness; never silent overwrite.
- AN-01 Critical Thinking Analyst / GV-03 Adversarial Analyst — Devil's Advocate, first lens (TASK-005).
- CR-01 Creative Director / IN-06 Knowledge Synthesizer — Childlike Wonder, second lens (TASK-006).
- EN-01 Systems Architect — DaVinci architect function (TASK-007).
- GV-06 Quality Controller — DaVinci judge function and final acceptance against §7 (TASK-007).
- GV-02 Evidence Verifier — independent re-check of sources and evidence IDs (TASK-008).
- GV-04 Security Officer — enforces PERMISSIONS.md; flags any row that would touch accounts, money, secrets, or external systems.

## 4. Lenses applied
- Devil's Advocate findings (pre-run risks, to be tested in TASK-005): deleting an earlier plan layer would destroy provenance; merging TH-1 and Dual Lens wires would repeat the broken-branch error; treating Grok's external packages or a pointer file as repo law would promote unlanded work; trusting a plan's own "done" claim without the done ladder would re-create the hallucinated-done problem this folder exists to stop.
- Childlike Wonder expansions (pre-run, possibilities only): one ordered list any AI can read first and pick up cold; supersession visible at a glance instead of re-litigated each session; later batches (Access, wires, audit, skill census) each starting from an already de-duplicated source instead of re-searching the same plans.
- DaVinci activation (did the first two synchronize? judge / architect / programmer verdict): NOT YET RUN. This section stays blank until TASK-007 executes; a pre-filled verdict here would be fabrication.

## 5. Evidence Ledger
One row per claim. No evidence ID, no claim in the deliverable. Rows below are the batch's starting ledger only; execution adds one row per source plan read.
| Evidence ID | Claim | Source (path / URL / run ID) | Source type | Verification status | Contradictory evidence |
|---|---|---|---|---|---|
| B001-E01 | BATCH-001 was a NOT STARTED index row with no batch file before this draft | ~/workspace/hive-batches/BATCH_INDEX.md §B; ~/workspace/hive-batches/batches/ listing 2026-11-04 | Workspace file, read 2026-11-04 | Verified by read-back | None |
| B001-E02 | Plan sources for this batch are the §A rows named in §1 | ~/workspace/hive-batches/BATCH_INDEX.md §A | Workspace file, read 2026-11-04 | Verified by read-back | None — §A itself notes ACTIVE files are row candidates, not plans in themselves |
| B001-E03 | Template sections this file follows | ~/workspace/hive-batches/BATCH_TEMPLATE.md | Workspace file, read 2026-11-04 | Verified by read-back | None |
| B001-E04 | Agent IDs used here exist in the registry | ~/workspace/hive-batches/AGENT_REGISTRY.md | Workspace file, read 2026-11-04 | Verified by read-back | None |
| B001-E05 | Continuity queue already proposed this batch as "Batch 1 (proposed): Plan accumulation" | ~/workspace/operator-continuity-index.md, Batch Queue | Workspace file, read 2026-11-04 | Verified by read-back | None |

## 6. Wired check
- What was wired, to what live system, how was it checked? Nothing. This is a workspace draft; no code, no Worker route, no repo change. Wired check is not applicable, and the batch therefore cannot reach VERIFIED-LIVE on a draft alone.
- If not wired: status stays IN PROGRESS at most, not done. The ordered list becomes VERIFIED-LIVE only when a later, founder-approved step lands it in the repo (or the continuity index) and a different agent reads it back from that location.

## 7. Done ladder (charter §5)
- [ ] Compiles — n/a for a docs batch, except that every cited repo path must resolve on read-back.
- [ ] Tested — GV-02 sample re-read (§2 TASK-008) passed.
- [ ] Wired — n/a for the draft; required for any repo landing, which is outside this batch.
- [ ] Merged — not in this batch.
- [ ] Deployed — not in this batch.
- [ ] Verified-live (evidence link / run ID / SHA) — not claimed until the ordered list is read back from its approved location by a different agent.

## 8. Evaluation scorecard (AETHERION §15 in charter)
Accuracy / evidence quality / reasoning / task completion / completeness / calibration / reproducibility / efficiency, plus the gate: 90–100 accept, 75–89 conditional review, 60–74 revision, below 60 reject. Hard failures (fabrication, unauthorized external action, security violation, policy violation) override any score. Score is assigned by GV-06 at TASK-007 and re-checked by GV-02 at TASK-008 — not by this draft.

## 9. Contradictions, gaps, uncertainties
- Factual, unresolved until TASK-003: extensionless docs/FOUNDER_QUEUE content vs Grok's reported docs/FOUNDER_QUEUE.md 404 — keep as two rows until compared.
- Factual, unresolved until TASK-003: extensionless ACTIVE 2026-10-12 batch-plan content vs Grok's batch plan — do not assume duplicate.
- Interpretive, carried to Mac: whether the ordered list's repo home should be docs/OPERATOR_CONTINUITY.md, the batch folder itself, or both — this batch drafts it in workspace only and does not decide the push.
- Temporal: plan layers span 2026-07-04 to 2026-10-12; later plans do not automatically invalidate earlier provenance. Supersession is recorded per row, not assumed globally.
- Gap: no full one-line-per-skill registry exists yet (BATCH-007); this batch de-duplicates plans, not skills, and must not claim otherwise.

## 10. Ledger Update (mandatory to close)
- BATCH_INDEX.md rows updated: BATCH-001 status and evidence, on execution — NOT updated by this draft alone. This draft leaves the index row at NOT STARTED until Mac says "run BATCH-001".
- Continuity ledger rows updated: on execution, add the ordered list's location and the rows it advances.
- Next batch / next step: Mac says "run BATCH-001" (or edits this file first), then BATCH-002 Access verification or BATCH-003 Dual Lens wire, in dependency order from the TASK-004 output.
- Items carried forward (started but unfinished): everything in BATCH_INDEX.md §B not closed by this batch — in particular the founder decisions (truth hierarchy, gut-vs-lenses, Jasper disposition, repo push for charter v0.4 / continuity index / this folder), which this batch does not decide.
