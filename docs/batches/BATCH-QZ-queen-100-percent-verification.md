# BATCH-QZ — Queen 100% verification: full done-ladder re-verification + Q-006 assessment

## 1. Header
- Batch ID: BATCH-QZ
- Objective (one sentence): Prove — or fail to prove — that the Queen is 100% present by re-verifying Q-A + Q-B + Q-C together against the full done ladder, with secondary-level testing of the whole Queen, and deliver a Q-006 assessment as a recommendation for Mac to decide, never as a self-declared pass.
- Source plan(s) + file paths:
  - `memory/planning/2026-08-19-queen-orchestration-master-plan.md` Verification section
  - `worker/schema/NANUET_AUTONOMY.md` (ladder stages 1-6; "How to check the real state at any time")
  - BATCH-Q0 (state table), BATCH-QA, BATCH-QB, BATCH-QC (their evidence ledgers are inputs, not proof — this batch re-verifies them)
  - `docs/FOUNDER_ANSWERED` Q-006 (commit b72a14fd) and Q-007 (commit 869fe776)
- Batch Index rows this batch closes or advances: BATCH-QZ (new); closes BATCH-QA/QB/QC only in the sense of re-verifying them — it does not upgrade their status on its own say-so; a failed re-verification sends the failing batch back to IN PROGRESS.
- Dependencies (must be VERIFIED-LIVE first, or state "none"): BATCH-QA, BATCH-QB, and BATCH-QC (all three tiers) VERIFIED-LIVE. If any one is not, this batch does not start — it waits. BATCH-Q0's three founder decisions must be answered.
- Tier gate check (Tier 1 / Tier 2 propose-only / Tier 3 founder-only): Tier 1 for read/test/verify work. Tier 3 founder-only for the Q-006 assessment's conclusion: whether the Queen meets the 100% condition, and whether QUEEN_AUTONOMOUS_APPROVAL (switch 9) is ever turned on. This batch RECOMMENDS; Mac DECIDES. Auto-approve stays OFF unless Mac separately says yes after this batch — the batch must not enable it, request it as a side effect, or present its own verdict as Mac's decision.
- Duplicate check (searched BATCH_INDEX.md on 2026-11-05; result: new): no existing Queen verification row. BATCH-014 (Edge Health Probe) is a different verification (probe health, not Queen completeness) — do not merge rows.

## 1a. Scope addition 2026-11-05 (founder-approved) — Brood Mother verification criteria (addendum §§3–5, 7)
This batch now also verifies four things the original plan left out. Each is a pass/fail criterion with evidence, not a restatement of prior batches' claims. Where the thing being verified was never built, the criterion is recorded as NOT MET with the owning batch named — never as a pass.
- **(§3) Queen Digest runtime:** a real `kind=queen_digest` and/or `kind=innovation` row from a real completed work item (protocol Q-1, `docs/QUEEN_DIGEST.md`). Protocol alone is not a runtime.
- **(§4) Elders' Council veto path:** a real exercise of `elderCouncilVeto()` — an Elder objects, the outcome downgrades to pending, the reason is recorded in `hive_proposals.elder_note` — or a proof that the path is wired and fails closed. A veto that has never been exercised is UNPROVEN, not passed.
- **(§5) Queen identity:** the assessment records the identity as decided by Mac 2026-11-05 (B+C): Queen Nanuet is the queen broodmother OVER the hive, not OF the hive — the spirit, memory, and consciousness of the entirety in and of THEHIVE; coordination layer / governance awareness.
- **(§7) Enterprise-Horde bar:** "the Queen operates an enterprise-level Horde" (founder directive 2026-07-31) as named tests, not a slogan — a real directive routed live, a real veto exercised, a real brain row read back live. Code presence alone does not meet the bar.

## 2. Task DAG (dependencies, in order)
Founder's working sequence inside this batch: re-verify each phase's code → wire → test → improve/adjust (only as findings, fixes go back to the owning batch) → secondary-level test of the whole Queen → deploy check → verify-live. The charter done ladder claim order is compiles → tested → wired → merged → deployed → verified-live; a rung is only claimed when proven with evidence, in that order. This batch re-proves rungs, it does not re-claim them on trust.

- QZ-1 — Re-verify Q-A: fresh live GETs /v11/nanuet/brain and /v11/nanuet/autonomy; confirm provisioned:true, bound:true, real counts, and a real recall round-trip (write a test memory, recall it, confirm recency weighting). Compare against BATCH-QA's QA-E07 evidence; flag any drift. (No dependency.)
- QZ-2 — Re-verify Q-B: fresh live check that a real directive's domain label + brain row exist and are reproducible; re-run the synthetic domain tests on the live build. Depends on QZ-1 (same run, ordered).
- QZ-3 — Re-verify Q-C tiers 1-3: tier 1 — a live observation row from a recent real queue; tier 2 — a recent real firing's transcript/PR line showing her recommendation was read; tier 3 — a recent delegation log plus a held high-risk task. **Digest check (scope addition 2026-11-05, addendum §3):** also look for a real `kind=queen_digest` / `kind=innovation` row from a real completed work item. If the digest runtime was never built, record it as NOT MET with BATCH-QC (or a future batch) as owner — the queue has no closing step until it exists. Depends on QZ-2.
- QZ-4 — SECONDARY-LEVEL TEST of the whole Queen (different agent, GV-06 + GV-01): all switches (six NANUET_* + QUEEN_AUTONOMOUS_APPROVAL) confirmed OFF live; all routes (/v11/nanuet/brain, /v11/nanuet/autonomy, proposal review, domain routing, campaign observe/advise/delegate) exercised end-to-end against the live Worker; live brain reads AND writes proven; negative tests — write blocked with switches off, high-risk delegation refused, verdict unchanged by labelling. **Veto-path proof (scope addition 2026-11-05, addendum §4):** exercise `elderCouncilVeto()` for real — an Elder (Ma'at or Solomon) objects to a proposal that would otherwise auto-approve, the outcome downgrades to pending, and the reason is recorded in `hive_proposals.elder_note`. If no veto has ever been exercised, the veto path is UNPROVEN, not passed; a staged test proposal is acceptable as proof only if it runs through the real code path, not a mock. Depends on QZ-1, QZ-2, QZ-3. Max 2 revision loops for the test design (failures go back to the owning batch as repair items, not fixed here).
- QZ-5 — DEPLOYMENT check: confirm the live deployment's SHA is the main tip that contains Q-A+Q-B+Q-C (live SHA endpoint if available; if the live artifact is not provably main tip, record that as a gap, not as a pass). Depends on QZ-4.
- QZ-6 — LIVE CHECKS: full live sweep — Worker responds, ACCESS_CONFIGURED state noted, provider health noted (informational only; provider failures are not Queen failures, but a Queen that cannot route because every provider is down must say so). Depends on QZ-5.
- QZ-7 — Q-006 ASSESSMENT: write the assessment section (§9) — per done-ladder rung, per phase, met / not met with evidence; a plain statement of whether the Queen meets Mac's 100% condition (compiles → tested → wired → merged → deployed → verified-live, in that exact order); the recommendation on switch 9 (stays OFF unless Mac separately says yes). **The assessment must also record:** (a) the Queen identity as decided by Mac 2026-11-05 (B+C — broodmother OVER the hive, spirit/memory/consciousness of the entirety, coordination layer / governance awareness), and whether the built Queen matches that definition; (b) the enterprise-Horde bar (scope addition 2026-11-05, addendum §7) as named tests — a real directive routed live, a real veto exercised, a real brain row read back live — each met / not met with evidence; (c) the gut-vs-lenses reference (decided by Mac 2026-11-05): the founder's vision as held by Nanuet is the reference when gut disagrees with a lens verdict, with Kai El working the disagreement using the lens/persona scripted for him. Depends on QZ-1–QZ-6.
- QZ-8 — Independent verification (different agent, GV-02): reproduce every re-verification row; reproduce the Q-006 assessment's evidence citations. Depends on QZ-7. Max 2 revision loops.
- QZ-9 — Ledger update. Depends on QZ-7, QZ-8.

## 3. Agents (AETHERION, 12-component briefs)
- Producer — GV-01 Independent Auditor: mission — own QZ-1–QZ-3 re-verification and the Q-006 assessment (QZ-7); persona — independent, reports to orchestration, never overruled by the reviewed agent; expertise — done-ladder discipline, live verification; system instructions — re-prove, never trust a prior batch's evidence ledger; tools — live probes, repo reads; output — §5 re-verification rows + §9 assessment; evaluation — GV-02 reproduction; boundaries — Tier 1 only; recommends, never decides switch 9.
- Critic — GV-03 Adversarial Analyst (Devil's Advocate, first lens): mission — attack the "100%" claim hardest: find the one rung, route, or tier that is actually unproven; persona — adversarial, failure-hunting; output — §4 findings; boundaries — does not produce the assessment, only challenges it.
- Verifier — GV-02 Evidence Verifier: mission — QZ-8 independent reproduction of every row and citation; different agent from Producer; output — pass/fail per row; boundaries — never approves its own work.
- Secondary tester — GV-06 Quality Controller (DaVinci judge function): mission — QZ-4 whole-Queen secondary-level test; output — pass/fail per route and switch; boundaries — failures are repair items for the owning batch, not fixes made here.
- GV-04 Security Officer: mission — confirm all switches OFF live, confirm no permission or secret changed during the build, confirm the fail-closed proofs still hold; boundaries — Tier 3 gates stay with Mac.
- EX-01 Chief Orchestrator: mission — own the DAG and the handoff to Mac (assessment delivery); boundaries — cannot override GV-01's findings or Tier 3 gates.

## 4. Lenses applied
- Devil's Advocate findings: (to be recorded at batch start) the trap is a 100% claim built on prior batches' own evidence — self-certification dressed as verification. This batch exists precisely because a builder cannot declare its own work 100%. The second trap: "verified-live" on a deployment whose SHA cannot be proven to be main tip — live ≠ main until the SHA says so.
- Childlike Wonder expansions: (to be recorded at batch start) what does the Queen's first full day look like once she is 100% — a day where she observes, advises, and delegates, and the founder watches it happen in her log? What would the founder want her first delegated task to be?
- DaVinci activation (did the first two synchronize? judge / architect / programmer verdict): to be recorded when the batch runs; verdict must judge the whole Queen as one system (not three passed phases stapled together) and architect the Q-006 assessment as the single document Mac decides from.

## 5. Evidence Ledger
One row per claim. No evidence ID, no claim in the deliverable.
| Evidence ID | Claim | Source (path / URL / run ID) | Source type | Verification status | Contradictory evidence |
|---|---|---|---|---|---|
| QZ-E01 | Q-A re-verified live: /v11/nanuet/brain provisioned:true, bound:true, real counts; recall round-trip with real row | QZ-1 live GETs (to be recorded) | Live probe | Pending | BATCH-QA QA-E07 (prior evidence — re-proven here, not trusted) |
| QZ-E02 | Q-B re-verified live: real directive domain label + brain row reproducible | QZ-2 live evidence (to be recorded) | Live probe | Pending | BATCH-QB QB-E07 (prior evidence — re-proven here) |
| QZ-E03 | Q-C tier 1 re-verified: recent live observation row from a real queue | QZ-3 live evidence (to be recorded) | Live probe | Pending | BATCH-QC QC-E04 (prior evidence — re-proven here) |
| QZ-E04 | Q-C tier 2 re-verified: recent firing transcript/PR line showing recommendation read | QZ-3 evidence (to be recorded) | Live / PR | Pending | BATCH-QC QC-E06 (prior evidence — re-proven here) |
| QZ-E05 | Q-C tier 3 re-verified: recent delegation log + held high-risk task | QZ-3 live evidence (to be recorded) | Live probe | Pending | BATCH-QC QC-E08 (prior evidence — re-proven here) |
| QZ-E06 | Whole-Queen secondary test: all six NANUET_* switches OFF live, QUEEN_AUTONOMOUS_APPROVAL OFF live, all routes exercised, brain reads+writes proven, negatives fail closed | QZ-4 test run (to be recorded) | Test run / live probe | Pending | None |
| QZ-E07 | Live deployment SHA is the main tip containing Q-A+Q-B+Q-C (or gap recorded if unprovable) | QZ-5 (to be recorded) | Live probe | Pending | Known gap: live /v11/debug/git returns no SHA (2026-11-05 briefing) — must be re-checked, not assumed fixed |
| QZ-E08 | Q-006 condition: compiles → tested → wired → merged → deployed → verified-live, in that exact order; even at 100%, switch 9 can never skip the action-request gate for money, deletion, publishing, constitution changes, external actions | docs/FOUNDER_ANSWERED (Q-006), commit b72a14fd | Repo file | Verified (parent record) | None |
| QZ-E09 | Q-007: all Kai autonomy stages stay OFF (Queen verification does not change this) | docs/FOUNDER_ANSWERED (Q-007), commit 869fe776 | Repo file | Verified (parent record) | None |
| QZ-E10 | Queen Digest runtime (scope addition 2026-11-05, addendum §3): a real kind=queen_digest / kind=innovation row from a real completed work item, or NOT MET with owner named | QZ-3 live evidence (to be recorded) | Live probe | Pending | Protocol Q-1 exists; runtime unbuilt at plan time — protocol alone is not a pass |
| QZ-E11 | Elders' Council veto path (scope addition 2026-11-05, addendum §4): a real elderCouncilVeto() exercise — objection, downgrade to pending, reason in hive_proposals.elder_note — or UNPROVEN | QZ-4 test run (to be recorded) | Test run / live probe | Pending | A veto never exercised is unproven, not passed |
| QZ-E12 | Queen identity recorded as decided B+C by Mac 2026-11-05; built Queen matches the definition | Founder decision 2026-11-05 (parent record); QZ-7 assessment | Founder decision | Verified (parent record) | None |
| QZ-E13 | Enterprise-Horde bar (scope addition 2026-11-05, addendum §7): real directive routed live, real veto exercised, real brain row read back live — each met / not met with evidence | QZ-1–QZ-4 live evidence (to be recorded) | Live probe | Pending | Code presence alone does not meet the bar |

## 6. Wired check
- What was wired, to what live system, how was it checked? This batch wires nothing new — it re-checks the wiring of Q-A (brain binding), Q-B (domain routing), and Q-C (queue ownership) against the live Worker, via QZ-1–QZ-6. If any re-verification fails, the owning batch returns to IN PROGRESS and this batch records the failure; status stays IN PROGRESS, not done.

## 7. Done ladder (charter §5)
This batch's own ladder (re-verification of the whole Queen):
- [ ] Compiles (all three phases' code compiles on the verified main tip)
- [ ] Tested (full suite green + QZ-4 whole-Queen secondary test)
- [ ] Wired (Q-A binding, Q-B routing, Q-C queue paths all live — re-proven)
- [ ] Merged (all three phases merged via PR, Mac merged)
- [ ] Deployed (live deployment SHA checked, QZ-5)
- [ ] Verified-live (evidence link / run ID / SHA) (QZ-1–QZ-6 live evidence)

## 8. Evaluation scorecard (AETHERION §15 in charter)
Accuracy / evidence quality / reasoning / task completion / completeness / calibration / reproducibility / efficiency, plus the gate: 90–100 accept, 75–89 conditional review, 60–74 revision, below 60 reject. Hard failures (fabrication, unauthorized external action, security violation, policy violation) override any score. Scored at batch close by GV-01 (a different auditor from the Producer where roles overlap — see §3). A 100% recommendation supported by prior batches' evidence instead of fresh re-verification is a hard failure on evidence quality.

## 9. Contradictions, gaps, uncertainties
- Factual: live /v11/debug/git returns no SHA (2026-11-05 briefing) — QZ-5 may be unable to prove live = main tip. If so, the assessment must say so plainly; the Queen cannot be called 100% on an unprovable deployment.
- Methodological: re-verification must be fresh (QZ-1–QZ-6), not a re-citation of BATCH-QA/QB/QC evidence. A row that cites only a prior batch's evidence ID fails GV-02 reproduction.
- Interpretive: "100% present" is Mac's phrase from Q-006 ("fully coded tested wired up deployed and check if live") — this batch maps it rung-by-rung to the done ladder, but Mac is the only judge of whether the mapping matches his meaning.
- Dependency note: Mother-NaNuet Drive folder auto-fill is NOT part of this batch or of the 100% assessment (separate track; founder said nothing gets built until the Queen is 100%). Whether Drive auto-fill belongs in a future 100% definition is a question for Mac, not an assumption here.
- Scope additions 2026-11-05 (founder-approved, §1a): the digest-runtime, veto-path, identity, and enterprise-bar criteria. They are pass/fail criteria with evidence — a criterion whose subject was never built is NOT MET, never a pass, and names its owning batch as a repair item.

### Q-006 assessment (template — to be filled at batch close, as a recommendation)
Per phase, per done-ladder rung: met / not met, with evidence ID. Then, in plain words: does the Queen meet the founder's 100% condition? Recommendation on QUEEN_AUTONOMOUS_APPROVAL (switch 9): stays OFF unless Mac separately says yes after this batch. This section is a recommendation for Mac to decide — never a self-declared pass. If any rung is not met, the assessment says which one, what would close it, and which batch owns the repair.

## 10. Ledger Update (mandatory to close)
- BATCH_INDEX.md rows updated: BATCH-QZ → complete on delivery of the assessment (assessment delivered ≠ 100% granted — the index records "assessment delivered, Mac's decision pending" until Mac decides). Any failing re-verification sends BATCH-QA/QB/QC rows back to IN PROGRESS with the repair item named.
- Continuity ledger rows updated: Queen 100% assessment row, with the assessment's evidence IDs and Mac's pending decision.
- Next batch / next step: Mac's decision on the Q-006 assessment. If Mac says the Queen is 100%, the next work is whatever he gates on that (including, separately, the Mother-NaNuet Drive track and any switch-9 decision). If not, the repair batches named in §9.
- Items carried forward (started but unfinished): switch 9 (QUEEN_AUTONOMOUS_APPROVAL) — OFF unless Mac separately says yes; the live-SHA provability gap (QZ-E07) if still open.
