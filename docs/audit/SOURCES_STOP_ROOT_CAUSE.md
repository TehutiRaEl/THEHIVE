# SOURCES stop — root-cause report (2026-11-11)

**Status:** ROOT-CAUSE REPORT, 2026-11-11. Workspace-only. Read-only work — nothing in this file edits, builds, deploys, merges, or flips anything. It answers cross-reference Q7: why did the SOURCES drop-point stop on 2026-08-08, and what happens to the three August notes.

**Method note:** every claim cites its source file (and date where it matters). Where the evidence does not state something, it is flagged as unanswered, not invented. The conversation logs Log(3)/Log(5) were keyword-searched, not read end-to-end (the same limit the cross-reference states). Log(5) contains no mention of the SOURCES folder — only the generic word "sources" — and its entries cluster 2026-06-25 to 2026-07-09, before SOURCES was created (2026-07-13/14).

---

## (a) What SOURCES held and what the habit was

**The folder:** `Project_file/Founders Visonary Folder/SOURCES/` — 9 files: `README.md` (2026-07-13), five empty `.gitkeep` files (pdfs/, books/, web-clippings/, research-notes/, misc/), and three research notes. Only `research-notes/` ever received anything.

**The habit** (`SOURCES/README.md`, origin: Fable/Harness, 2026-07-13; committed 2026-07-14, `4d6f9d5`): the drop point for founder-provided material — PDFs, books, web clippings, research notes — that isn't already a repo, a chat message, or an existing doc. "Nothing, automatically — and that's intentional. A file landing in this folder is not yet hive knowledge. The next session (or the founder, explicitly) runs it through **`research-to-dna`**: verify what's actually true or checkable in it, classify (verified-real / catalogued-for-later / narrative-canon / declined), distill the *principle* rather than copy the material wholesale, and only then inscribe the result into `FABLE_DNA.md`, `THE_CODEX.md`, a skill, or the memory log — with the source cited."

**The habit was written into the standing instructions.** `CLAUDE.md` (lines 54–57) names SOURCES as the intake: "where the founder drops PDFs, books, web clippings, research notes for the hive to build from; routed through `research-to-dna` before anything becomes hive knowledge." That reference was added 2026-07-14 (`4d6f9d5`) and never changed afterward (`git log -S SOURCES -- CLAUDE.md` shows only that one commit). The `research-to-dna` skill exists at `.claude/skills/research-to-dna/SKILL.md` and is referenced by `CLAUDE.md`, `Fable_memory.md`, `session-harvest`, and `fabrication-mining`.

**The three notes:**

1. **`2026-08-07-agentic-harness-mcp-waterfall.md`** (585 lines, 38 KB). Source: `AI.docx`, uploaded by the founder 2026-08-07 — a chat log from research the founder did with another AI, extracted from the `.docx` XML because "the session upload directory is ephemeral and the original would otherwise be unrecoverable." An MCP + waterfall agentic-harness blueprint, a 100,000-agent scaling architecture, a scaled-down 8-agent colony prototype, and an AUTOMATON reverse-engineering rig. Status: NOT YET HIVE KNOWLEDGE. Triage at `VISION/2026-08-07-vision-agentic-harness-triage-006.md`; founder's scoping decisions at `HIVE_UPDATES/2026-08-07-directive-agentic-harness-decisions-045.md`. Verified defect, flagged in the note itself: the orchestrator code does not compile (`json.dump(plan_data, indent=2, f)` is a SyntaxError, confirmed with `py_compile`).
2. **`2026-08-08-llm-expansion-resources-list.md`** (164 lines, 7 KB). Source: pasted directly by the founder in a chat message, companion to the course report — a curated bibliography of external courses, lecture series, and research papers. Status: NOT YET HIVE KNOWLEDGE. Innovator-lens mining pass at `VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md`. Two checkable claims verified live (real GitHub repos `ryankillian/karpathy-lectures-notebooks` and `vukrosic/zero-to-ai-researcher`).
3. **`2026-08-08-llm-from-scratch-course-integration-report.md`** (401 lines, 18 KB). Source: pasted directly by the founder in a chat message — an old document from the visionary scope/vision archive, "the dream of what we're building now." Status: NOT YET HIVE KNOWLEDGE. Atomization at `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`; founder's decision at `HIVE_UPDATES/2026-08-08-directive-llm-from-scratch-decisions-046.md`. Apparent origin: AI-generated analysis in the Sovereign Hive mythological voice (Necromancer, Daemon, AYINE, ACU, Tesseract QTN).

**Git log for SOURCES:** `4d6f9d5` 2026-07-14 (intake created); `1a060e1` 2026-08-07 (agentic-harness decisions); `507a753` 2026-08-08 (atomize the LLM doc, per research-to-dna); `a54fabc` 2026-08-08 (innovator pass, 15 real ideas mined). No commit after 2026-08-08 mentions SOURCES or research-to-dna.

---

## (b) Timeline around 2026-08-07/08

- **2026-08-06:** `HIVE_UPDATES/2026-08-06-directive-proposal5-scope-and-hoard-economy-044.md` (Proposal 5 scope + Hoard economy); commune log. Session: `claude/fable-5-handoff-setup-vefwlb` (session `session_013M4iozyGijv5Q267JZfeEG`). The 044 file quotes the founder on agents' "usage limits" — about the *Hive's* pay-to-live design, not about Claude's session limits — and notes a message "cut off in the screenshot" (a screenshot truncation, not a session cutoff).
- **2026-08-07:** the founder uploads `AI.docx` and asks for a triage with 4 questions; then stops the work and orders the reality audit ("how much was fabricated, hallucinated... and set out to be attempted and coded but never plugged up and wired up," and "why it didn't happen"). SOURCES note 1 lands; `VISION/2026-08-07-vision-agentic-harness-triage-006.md` (conclusion: genuine architecture sketch, do not copy its code; "Explicitly NOT started — the founder chose triage only"); `VISION/2026-08-07-vision-reality-audit-007.md`; `HIVE_UPDATES/2026-08-07-directive-agentic-harness-decisions-045.md` (founder chose: host "Nowhere yet — need to figure that out"; "Drop the 100k, focus on the 8"; self-expansion "Keep it gated, like automaton"; afterward, "Log them").
- **2026-08-07, the reality audit (007) — the key diagnosis:** the founder proposed "session context cutoff causes task-jumping," and the data supports it. Of 13 `done` tasks that explicitly admitted verification was owed, 11 were never followed up (84%). Mechanism: a session builds something real and marks it `done` with an honest caveat; that session ends; the caveat lived in its working context, not in any machine-checked place; the next session reads `data-status="done"` — a binary — and moves on. "The failure is structural, not moral." The fix built the same day: the `wired-or-not` skill + `scripts/check-claims.py` in CI — "This is the half that survives a context cutoff, because it runs whether or not the next session read the skill." The same audit records a same-day instance: "the 38 provider-routing assertions written into a container scratch directory that would have died with the session."
- **2026-08-08:** SOURCES notes 2 and 3 land; `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md` (classifies every element against what the hive already has); `VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md` (15 real ideas mined); `VISION/2026-08-08-vision-arithmancer-thermodynamics-audit-010.md`, `-011.md` (full dissection), `-012.md` (decline retro sweep); `HIVE_UPDATES/2026-08-08-directive-llm-from-scratch-decisions-046.md` (founder: "Yes, log it"; "No, don't build anything. The goal was to go over all of this and see what all we could utilize... break it down so it's very atoms and rebuild it into the hive instead of copying and pasting everything"); `047` (innovator-lens correction — the founder correcting the method: the query "wasn't to check to see if any of it was in the hive. It was to utilize the devil's advocate lens... like an innovator would"); `048` (Arithmancer PDF); `049` (fabrication mining). **Two sessions were active on 08-08:** `fable-5-handoff-setup-vefwlb` (045, 046, 047) and `claude/thehive-handoff-scope-gtn2rw` (048, 049). The Arithmancer PDF — a founder-provided document, attached with the words "[PDF attached]" — was processed directly by the second session into `HIVE_UPDATES/048` and `VISION/010-011`, **bypassing SOURCES entirely**.
- **2026-08-10:** a new session, `claude/provider-failure-queens-orchestrator-atvpaz` (050, 051) — "session continuing" — captures founder decisions live (agent roster ceiling "13 right now," Akosha's naming, D1 headroom, Kai El scope; Kai El self-training research). No documents dropped.
- **2026-08-18:** the burst — `HIVE_UPDATES/052–058` (plan reality audit, voxel-world dissection, Grok strategist dissection, full risk authorization, Mistral frontend dissection, branch-queue closeout, switches + proposal cleanup), `VISION/2026-08-18-vision-post-cutoff-research-pass-013.md` (the "cutoff" here is the January 2026 *knowledge* cutoff, not a session cutoff), `ACTIVE/2026-08-18-current-master-plan-pointer.md`. The 052 file records the founder authorizing "a 2-3 hour (or until the 5-hour session limit) autonomous stretch" — the only mention of a usage limit as a session boundary in the August record, dated ten days *after* SOURCES stopped, and framed as a planned boundary ("work 2-3 hours or until you reach the limit, then pick up where you left off"), not a loss event. The 054 file quotes a *Grok* session from 2026-07-08: "In Session 1, I built foundational files in a local sandbox... The branch was NOT pushed to GitHub before the session ended — the work existed only in the container environment" — a different agent, a month earlier, whose lesson ("Always push to origin before the session ends") was already recorded.
- **2026-08-19:** `ACTIVE/2026-08-19-kai-el-phase-b-risk-classification.md`, `-phase-c-brainstorm-design.md`, `-plan-v2-open-phase-verification.md`.
- **2026-08-29:** `HIVE_UPDATES/2026-08-29-call-list-accepted-059.md`, `ANSWERED/2026-08-29-call-list-acknowledgment-accepted.md`, `VISION/2026-08-29-vision-sovereign-podcast-venture-v1-014.md` (first Kai El venture, decisions locked).

---

## (c) Where material went after August 8

The folder did not go quiet — only SOURCES did. Founder material after 08-08 went **directly** into the working folders, because it was produced live, in-session, rather than dropped as a document:

- **`HIVE_UPDATES/`** — founder directives, captured verbatim via `founder-directive-capture`: 050–051 (08-10), 052–058 (08-18), 059 (08-29), 060–061 (10-12/13).
- **`VISION/`** — doctrine logs, research passes, dissections: 013 (08-18), 014 (08-29), the 09-19 doctrine logs (PLC/body map, legal-financial architecture, lineage bedrock, sovereignty blueprint — all "Author: Founder (directive)"), the 09-28 master mind map.
- **`ACTIVE/`** — plans and Phase B/C work: 08-18 pointer, 08-19 Phase B/C, 10-12 batch plan.
- **The decisive data point:** the founder-supplied Master Mind Map & Roadmap (2026-09-28) — "Source: Founder-supplied Master Mind Map & Roadmap (2026-09-28). Unabridged." — went directly into `VISION/master-mind-map-roadmap-2026-09-28/`, **not** into SOURCES/. Seven weeks after the stop, a substantial founder-supplied document still bypassed the drop-point. The bypass was the new normal, not a one-off loss.
- **The founder's working mode shifted.** From 08-06 to 08-08 he worked by *document drop* (upload a `.docx`, paste a document, attach a PDF) for triage. From 08-10 onward he worked by *live conversation* (directives, Q&A, doctrine, authorizations) — and live conversation output goes straight into `HIVE_UPDATES/`/`VISION/` by the `founder-directive-capture` discipline, not through a drop-point. SOURCES only receives *documents*; with no documents arriving, it went quiet.
- SOURCES is never mentioned in any 08-18 or later file, and no commit after 08-08 mentions it.

---

## (d) Verdict on the founder's hypothesis — UNPROVEN as stated

**The hypothesis:** a Claude session got cut off when the founder hit the usage limits, and that is why SOURCES stopped.

**What supports the underlying mechanism:**
- The `fable-5-handoff-setup-vefwlb` session **did** end between 2026-08-08 and 2026-08-10 (a new session, `provider-failure-queens-orchestrator`, is capturing work on 08-10). A session boundary occurred exactly when SOURCES stopped.
- The 2026-08-07 reality audit **proved** the general failure mode: habits and caveats that live only in session context are lost when the session ends (84% of verification-owed tasks never followed up). The audit's own words: "the caveat lived in its working context, not in any machine-checked place."
- The founder named the "5 hour session usage limit" (052, 2026-08-18) as the routine end of a work session — usage limits were a known, expected session boundary.

**What does NOT support it as the specific cause:**
- **No file records a session being cut off by the usage limit on 2026-08-07/08.** The record is silent on why the `fable-5-handoff-setup-vefwlb` session ended — usage limit, context limit, or the founder simply starting fresh are all unanswered in the record. Do not assume one.
- **The 08-07 diagnosis was about a different mechanism.** The founder's confirmed theory was *context* cutoff (context-window exhaustion causing task-jumping), not the 5-hour usage limit. The two are different ways a session ends.
- **The usage-limit mention is ten days too late and the wrong shape.** The only usage-limit-as-boundary mention (052) is dated 2026-08-18, and it frames the limit as a *planned* boundary ("work 2-3 hours or until you reach the limit, then pick up where you left off"), not a loss event.
- **SOURCES stopped but the work didn't.** Sessions continued on 08-10 and 08-18 producing voluminous material (050–058, 013, Phase B/C). A usage-limit cutoff cannot explain why *only* the SOURCES habit stopped while `HIVE_UPDATES`/`VISION`/`ACTIVE` continued at pace. A cutoff that kills one habit and leaves everything else running is not what the evidence shows.
- **The habit was already being bypassed while the session was still alive.** The Arithmancer PDF on 08-08 was processed by a parallel session (`thehive-handoff-scope-gtn2rw`) directly into `HIVE_UPDATES/048` and `VISION/010-011`, without SOURCES. The habit was never universal, even before any session ended.

**Verdict: UNPROVEN.** The mechanism (a session ended, and a habit that lived only in that session's context died with it) is confirmed by the record. But the specific cause the hypothesis names — a usage-limit cutoff on 08-07/08 — is not established by any evidence in the record, and it cannot explain why only SOURCES stopped. (Note: the record has a separate, later usage-limit event in November 2026 — it is not conflated with August here; nothing in the August record ties a usage-limit cutoff to these dates.)

---

## (e) Best-supported root cause

The SOURCES drop-point was a **session-local habit, never a durable rule** — and it died at a session boundary, exactly as the 2026-08-07 reality audit diagnosed. Three reinforcing causes:

1. **The habit lived in one session, not in the machinery.** It was used exactly three times, all inside the `fable-5-handoff-setup-vefwlb` session (08-06–08-08). A parallel session on the same day processed a founder PDF directly without it. `CLAUDE.md` named SOURCES, but no check, no handoff template, and no enforcement ever required its use — and the founder is the one who drops material, so the habit depended entirely on the founder continuing to drop documents in-session. When that session ended (between 08-08 and 08-10), the habit died with it: the caveat lived in its working context, not in any machine-checked place (007's exact diagnosis).
2. **The founder's working mode changed.** After 08-08 he worked by live conversation (directives, Q&A, doctrine, authorizations) rather than by dropping documents. SOURCES only receives *documents*; with none arriving, it went quiet. The 09-28 founder-supplied mind map going straight to `VISION/` proves the bypass was the new normal, not a one-off loss.
3. **The intake queue was empty.** The `research-to-dna` verify/classify/distill steps had already run on all three notes (006/008/009), the founder had decided (045: triage only, host "Nowhere yet," "Drop the 100k"; 046: "Build nothing yet — atomize"), and the remaining step (inscription/rebuild) was blocked by decisions that still stand. There was no pending intake to pull the habit back into use when the next sessions started.

In short: the session ended (proximate trigger — and the usage limit is one *possible* reason it ended, but the record doesn't say); the habit died with it because it was never made durable (root cause); and the founder's shift to live conversation meant no new documents arrived to revive it (sustaining cause).

---

## (f) Recommendation for the three August notes — mark them SUPERSEDED, do not re-run the pass

**Do not re-run the `research-to-dna` pass.** It already ran: verify + classify + distill are done (006 triage, 008 atomization, 009 innovator pass — 15 real ideas mined). Re-running it would repeat finished work.

**What never happened is the final step** — inscription into `FABLE_DNA.md`, `THE_CODEX.md`, a skill, or the memory log, or the rebuild the founder described ("break it down to its very atoms and rebuild it into the hive"). That step was blocked by the founder's own standing decisions, which still stand:
- 045 (2026-08-07): harness host "Nowhere yet — need to figure that out"; "Drop the 100k, focus on the 8"; self-expansion gated.
- 046 (2026-08-08): "Build nothing yet — atomize, don't copy-paste."
- The host question is still open (the Oracle box is still unprovisioned, Q-001) and the harness has nowhere to run.

**The source documents' central claims were checked and partly fabricated** (046): "Free GPU training on Oracle Cloud" is false (ARM CPU only — no GPU); "AYINE," "Tesseract QTN," and "ACU" do not exist anywhere in the repository (grepped in full — zero occurrences); "NECROMANCER spawns DAEMONS" and "TITLE XXI/XXII" fail on inspection. The material is from a pre-Queen, pre-Worker-maturity era, and the Hive has moved on (Queen build, Tier 1 income, cockpit).

**Recommendation:** record the three notes as **SUPERSEDED**, with the reason stated (pass already run; rebuild blocked by standing founder decisions; premises partly fabricated; architecture moved on). Nothing is deleted — the distilled principles remain readable in `VISION/2026-08-07-vision-agentic-harness-triage-006.md`, `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`, and `VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md` if a future session wants them. Where the "superseded" note lives (a line in `SOURCES/README.md`, or the cross-reference addendum) is the founder's call.

**Alternative considered and not recommended:** completing the inscription now (inscribing the verified-real principles and the 15 mined ideas). The founder's "build nothing yet" still stands and the host question is still open — inscribing them now would adopt material the founder explicitly parked.

---

## Open / unanswered (flagged, not filled in)

- Why the `fable-5-handoff-setup-vefwlb` session ended between 2026-08-08 and 2026-08-10 (usage limit, context limit, or a fresh start) — the record does not say.
- Whether the founder wants the SOURCES drop-point revived as a durable habit (e.g., a check or handoff line that enforces it) or retired in favour of the direct-to-`VISION`/`HIVE_UPDATES` path that has been the working normal since 08-10. That is a founder decision, not an inference from the record.
