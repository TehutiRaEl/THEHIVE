# SOURCES Audit — what source material exists that SHOULD be in SOURCES but isn't

**Date:** 2026-11-11. **Status:** AUDIT ONLY, read-only. Nothing was moved,
copied, edited, deleted, merged, or published. **Report:** this file.
**Scope:** the repo (`~/workspace/hive-audit/THEHIVE/`, main tip `37651d9c`),
the Founders Visonary Folder, and the workspace
(`hive-batches/`, `hive-audit/`, `goals/`, `tau-audit/`, `jasper-audit/`,
`venture-plans-work/`, `user/files/`).

**The rule used (from `SOURCES/README.md`, 2026-07-13):** SOURCES is the
drop-point for anything the founder wants the hive to build from that isn't
already a repo, a chat message, or an existing doc — PDFs, book excerpts, web
clippings, research notes, screenshots-as-text. Subfolders: `pdfs/`,
`books/`, `web-clippings/`, `research-notes/`, `misc/`. Naming:
`YYYY-MM-DD-short-description.ext`. A file landing here is raw material, not
adopted knowledge — `research-to-dna` is the pass that promotes it.
Licensing note: the founder's own writing stores in full, freely; a third
party's copyrighted work stores as notes/summary/key-excerpts-with-citation,
not full text, in the public repo.

**Strictness:** only founder-provided material counts as a gap. Agent-generated
reports, audits, plans, reconciliations, code, and config are working files,
not source material, and are not counted as gaps.

**Headline numbers:**
- Files in SOURCES now: **9** (README + 5 empty `.gitkeep` + **3 real source
  notes**, all `research-notes/`, all 2026-08-07–08). `pdfs/`, `books/`,
  `web-clippings/`, `misc/` are all empty.
- **Gaps: 20 items covering 19 distinct source documents** (Update.pdf is the
  PDF twin of the Update doc) — founder-provided source material not in
  SOURCES and not in any repo.
- **Flagged ambiguities: 9 groups** — founder material already an existing doc
  in ACTIVE/VISION/the workspace. Flagged as a question for the founder, not
  as gaps (see §5).
- **Already covered:** the 23 business plans (venture repo), Jasper 3 (repo
  `.archive`), the Messiah dissertation (encapsulated in
  `docs/MESSIAH_COMPLEX.md`), GNOS PT.2 / SVFG / Prompted lens (venture repo),
  and the 3 SOURCES notes themselves.

---

## §1 — SOURCES inventory (what's there now)

| File | Size | Date | Content |
|---|---|---|---|
| `README.md` | 2,999 | 2026-07-13 | The drop-point definition, subfolders, naming, research-to-dna, licensing note |
| `research-notes/2026-08-07-agentic-harness-mcp-waterfall.md` | 38,118 | 2026-08-07 | Founder research from another AI; source `AI.docx` (uploaded by the founder). NOT YET HIVE KNOWLEDGE; triage at `VISION/2026-08-07-vision-agentic-harness-triage-006.md`; decisions at `HIVE_UPDATES/2026-08-07-directive-agentic-harness-decisions-045.md`. Verified defect flagged in the header: the orchestrator code does not compile. |
| `research-notes/2026-08-08-llm-expansion-resources-list.md` | 7,262 | 2026-08-08 | Founder-pasted bibliography of LLM courses/papers. NOT YET HIVE KNOWLEDGE; mining pass at `VISION/2026-08-08-vision-llm-expansion-innovator-pass-009.md`. Two GitHub repos in it verified live as real. |
| `research-notes/2026-08-08-llm-from-scratch-course-integration-report.md` | 18,392 | 2026-08-08 | Founder-pasted LLM-from-scratch course report ("the dream of what we're building now"). NOT YET HIVE KNOWLEDGE; atomization at `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`; decisions at `HIVE_UPDATES/2026-08-08-directive-llm-from-scratch-decisions-046.md`. Header warns it invents Hive names (Necromancer, Daemon, AYINE, ACU, Tesseract QTN) that are not real in the repo. |
| `books/.gitkeep`, `misc/.gitkeep`, `pdfs/.gitkeep`, `research-notes/.gitkeep`, `web-clippings/.gitkeep` | 0 | — | Empty placeholders. No PDFs, books, web-clippings, or misc material exists in the folder. |

**All substantive content dates 2026-08-07 to 2026-08-08.** Nothing has been
added since — the three notes are the only three uses of SOURCES, all inside
the `fable-5-handoff-setup-vefwlb` session (see
`~/workspace/hive-batches/SOURCES_STOP_ROOT_CAUSE.md`).

---

## §2 — The gap list (20 items, 19 distinct source documents)

Founder-provided source material that is NOT in SOURCES and NOT in any repo.
Grouped by where it lives now. For each: what it is, where it is, its date,
and why it qualifies.

### A. Drive extracts excluded from the venture placement (8 items, 13 files)

From `~/workspace/venture-plans-work/extracts/` — verbatim extracts of the
founder's Google Drive docs, made 2026-11-05/2026-11-11 for the venture
placement, then explicitly excluded because they are not business plans
(`~/workspace/hive-batches/VENTURE_PLANS_INVENTORY.md`, §"Found in Drive but
NOT placed"). They are founder-provided source material with no repo home.
Proposed SOURCES home in brackets.

| # | Item | Files in the workspace | Date(s) | Proposed home |
|---|---|---|---|---|
| A1 | **Agents** — Hive persona/agent manifest (personas + Tehuti Protocol) | `extracts/agents-2026-08-04.txt`, `extracts/agents-2026-11-05.txt` | 2026-08-04 / 2026-11-05 | `research-notes/` |
| A2 | **Ai** — Arithmancer-Architect physics/AI-memory essay | `extracts/ai-2026-08-08.txt`, `extracts/ai-2026-11-05.txt` | 2026-08-08 / 2026-11-05 | `research-notes/` |
| A3 | **grok play** — BabyJarvis constitutional LLM build plan (A1–G2, zero visibility/persistence, chain of custody) | `extracts/grok-play-2026-07-24.txt`, `extracts/grok-play-2026-11-05.txt` | 2026-07-24 / 2026-11-05 | `research-notes/` |
| A4 | **Update** — "THE SOVEREIGN HIVE — THE 50-REPOSITORY BRAIN" (the doc that claims F-001–F-011; no canonical F-007–F-011 text exists in `soul.md`) | `extracts/update-2026-08-18.txt`, `extracts/update-2026-11-05.txt` (+ `user/files/Update.pdf`, see C1) | 2026-08-18 / 2026-11-05 | `research-notes/` (+ `pdfs/` for the PDF) |
| A5 | **money-trail** — research dissection, Walmart / "Uncle Sam" corporate anatomy | `extracts/money-trail.txt` | undated (extract 2026-11-05) | `research-notes/` |
| A6 | **reverse-engineering** — Kappius reverse-engineering narrative | `extracts/reverse-engineering.txt` | undated (extract 2026-11-05) | `research-notes/` |
| A7 | **Untitled 2026-07-21** — Ellis/transmutation observation catalog protocol (×2, identical) | `extracts/untitled-2026-07-21.txt`, `extracts/untitled-2026-11-05.txt` | 2026-07-21 / 2026-11-05 | `research-notes/` |
| A8 | **Untitled 2026-07-30** — "Founder Answers — The Intake Form" (SVFG intake) | `extracts/untitled-2026-07-30.txt` | 2026-07-30 | `misc/` |

Note on A4: the Update doc is constitution-adjacent — it is the source behind
the F-007–F-011 claim that the record has to keep separate from canonical law
(`soul.md` F-001–F-006 only). Preserving it in SOURCES keeps the claim
traceable as source, not adopted as law.

### B. The 4 Untitled Docs from the MUSE folder (4 items)

From `~/workspace/jasper-audit/musefolder/doc-*.json` — full-text extractions
of the founder's Google Drive "musefolder" Untitled Docs, made 2026-11-05
(`~/workspace/jasper-audit/muse-hive-extraction.md`, §b items 14–17). The
extraction doc carries summaries; the full text lives only in these JSON files
in a working directory. Proposed SOURCES home in brackets.

| # | Item | Content | Proposed home |
|---|---|---|---|
| B1 | **KaiEl ChatGPT Custom Instructions** (Untitled, 5,615 chars) | Ready-to-paste ChatGPT persona config for KaiEl — Sherlock-Holmes detective mind, cite sources and date them, label speculation with likelihood, auditable step-by-step arithmetic, structured evidence output (Summary — Observations — Hypotheses ranked — Evidence & Citations — Next steps — Confidence 0–100%) | `misc/` |
| B2 | **Dante Crux / Order of Balance bible** (Untitled, ~215K chars, 2,827 lines) | Fantasy world/character bible (fiction) — Dante Crux, "The Prodigal Flamebearer"; the Order of Balance (council of nine, cosmic polarities); Soul Memory Law, Ledger of Echoes; prophecy vs. agency, memory/forgetting, institutional distrust. The founder's own fiction. | `books/` |
| B3 | **Guardian Talisman of the Serpent Path** (Untitled, 21,712 chars) | Occult/ritual document for a three-stone pendant (Malachite / Smoky Quartz / Obsidian — "Triune Blade of Purification"); spoken recitations, breath ×3, 7-day morning practice. Not Hive engineering material. | `misc/` |
| B4 | **Sovereign LLM protocol essay** (Untitled, 10,677 chars, Ellis-voiced) | 7-part protocol for building a sovereign LLM by observing other models without copying them (Observation Catalog → Gateway Harness Privacy → Black Box Re-Assimilation → Rigorous Modification Training → Professional Engineering Eye → Sovereign LLM → Cache Cleaning). Closes on "The Elephant in the Room" (unresolved). | `research-notes/` |

Note on B2/B3: the MUSE folder gap analysis records these as "preserved in
folder only; not Hive material" — they are the founder's own fiction/ritual
writing, not Hive engineering. They qualify as SOURCES material (the founder's
own writing stores in full, freely) but the founder decides whether fiction and
ritual belong in SOURCES or stay in Drive.

### C. PDFs in the workspace, not in SOURCES (2 items)

From `~/workspace/user/files/` — PDF prints of founder Drive docs, uploaded
2026-11-03 / 2026-11-07. They are the source files themselves, sitting in a
workspace upload directory.

| # | Item | File | Size | Proposed home |
|---|---|---|---|---|
| C1 | **Update.pdf** — PDF print of the Update doc (A4). Title "Update", Google Docs Renderer. The PDF behind the F-001–F-011 claim. | `user/files/Update.pdf` | 379,975 | `pdfs/` |
| C2 | **childlike_wonder_lens.pdf** — PDF print of the "Devils advocate lens/childlike wonder lens" Doc. Title "Devils advocate lens/childlike wonder lens", Google Docs Renderer. | `user/files/childlike_wonder_lens.pdf` | 587,219 | `pdfs/` |

Note on C2: the lens content is already in the repo
(`worker/src/lens/spec.md` + `.claude/skills/childlike-wonder`), but the source
PDF itself is not preserved in SOURCES.

### D. PDFs in Google Drive only — not in the repo, not in the workspace as files (4 items)

These exist only in Google Drive. Their text was extracted during the
2026-11-05 MUSE folder audit, but the full text is NOT preserved locally —
the audit's extraction doc (`muse-hive-extraction.md`, 121,902 bytes) carries
summaries only, and the two PDF texts (48,608 + 117,296 chars) are not stored
anywhere in the workspace. The PDFs themselves would have to be downloaded
from Drive (a follow-up, not done in this read-only audit).

| # | Item | Drive location | Size/pages | Proposed home |
|---|---|---|---|---|
| D1 | **Kai El.pdf** — print rendering of the "Kai El" Doc (soul.md + Spore). The Kai El soul.md v1.0 is MISSING from the Hive (gap-analysis item T-1: nowhere in the repo; repo `soul.md` is the Hive constitution F-001–F-006). This PDF is the source for it. | musefolder, top level | 433,714 bytes, 32 pp. | `pdfs/` |
| D2 | **The hive 1.2.pdf** — print rendering of "The hive 1.2" (v9.0). | musefolder, top level | 670,306 bytes, 62 pp. | `pdfs/` |
| D3 | **The Exodus 2.0.pdf** — found in Drive folder listings, never extracted. Content unknown. | Drive Apps folder | unknown | `pdfs/` (after a look) |
| D4 | **Jasper 4.pdf** — Jasper backend document. The file IS in the workspace (`jasper-audit/Jasper4.pdf`, `Jasper4-second.pdf`, `musefolder/muse-Jasper4a.pdf`, `musefolder/muse-Jasper4b.pdf`); it is not in SOURCES. Content already dissected (`JASPER_DISSECTION.md`); code already in the repo (`backend/`, `.archive`). | workspace `jasper-audit/` | — | `pdfs/` |

### E. The Arithmancer PDF — original not preserved anywhere (1 item)

| # | Item | Evidence | Proposed home |
|---|---|---|---|
| E1 | **The Arithmancer PDF** (chat attachment, 2026-08-08). The founder attached a PDF in chat ("[PDF attached]") and provided outputs of an extensive conversation; the directive preserves the founder's verbatim words (`HIVE_UPDATES/2026-08-08-directive-arithmancer-pdf-048.md`). The PDF file is in NEITHER the repo (the repo's only PDF is a skill asset) NOR the workspace (workspace-wide PDF search finds no Arithmancer PDF). What survives: the AI dissection in `VISION/2026-08-08-vision-arithmancer-full-dissection-011.md` + `...-thermodynamics-audit-010.md`, and the Ai essay extract (A2), which may overlap it. | Directive 048 + VISION 010/011 + cross-reference §3 | `pdfs/` (if recoverable) |

If the original PDF still exists (in the original chat upload or in Drive),
recover it. If not, record it as lost — its content survives only as the
dissection and the Ai essay.

### F. The ChatGPT-export zip — unextracted, needs a look (1 item)

| # | Item | Evidence | Proposed home |
|---|---|---|---|
| F1 | **ChatGPT data export zip** (48 MB, 71 files, 2026-07-29) — `chat.html` (11.9 MB), `conversations-000.json` (12.0 MB), `conversations-001.json` (2.6 MB), `codex.json`, `ads.json`, ~64 `file-*.dat` / `file_*.dat` attachments (102 KB–2.7 MB each). In Drive only; top-level listed only, never extracted. It is the founder's own ChatGPT history — the raw material behind much of the Hive's origin. | musefolder inventory item 25; `muse-hive-extraction.md` §b | `misc/` (after extraction + classification) |

---

## §3 — Already covered (brief)

Founder-provided material that already has a home and does NOT need SOURCES:

- **The 3 SOURCES notes themselves** (§1) — already in SOURCES.
- **23 business plans** (320,135 words) — placed in TehutiRaEl/venture under
  `plans/` (PR #1 open); source binaries in
  `venture-plans-work/downloads/` (Business_idea_1.pdf, LEE_BOYS.pdf,
  ScopeSync.pdf, Tu-ra.pdf, Zach_Ginn_Wholesaling_Course.pdf).
- **Jasper 3** — Jasper v7 backend code, already in the THEHIVE repo as
  `.archive` (+ `backend/`).
- **Messiah complex 2.0** (dissertation) — content encapsulated in
  `docs/MESSIAH_COMPLEX.md` (PR #223 merged). The source PDF
  (`user/files/Messiah_complex_dissertation_3.0.pdf`, 214,653 bytes) is in the
  workspace; copying it to `pdfs/` is optional provenance, not a gap.
- **GNOS PT.2** — placed in the venture repo (plan #13, GNOS, 31,046 words).
- **SVFG** — placed in the venture repo (plan #12, 40,620 words).
- **Prompted lens (Mogul Bridge)** — placed in the venture repo (plan #18,
  mogul-bridge, 8,076 words).
- **The hive v8/v9 substance** — in the repo as `backend/` code (System A).
  (The source Docs themselves are §5, ambiguity.)
- **Lens methods** — in the repo (`worker/src/lens/spec.md` + skills).
- **th1-wire-kit** — complete, in the repo (PR #195).
- **Forensic packages** (Full Plan / Roadmap + Vision, 2026-10-02) — generated
  from main; copies in the folder.
- **soul token.sol** — at the repo root.
- **The 2026-08-08 triages** (`VISION/006/008/009`) — the research-to-dna
  outputs on the 3 SOURCES notes; they are the triage, not the source.

---

## §4 — Not source material (brief)

Checked and excluded — agent-generated work, code, config, or licensing-blocked.
Do not move these into SOURCES.

- **All of `docs/`** (audits, plans, specs, research memos, e.g.
  `docs/research/508c1a-church-exemption-research.md`,
  `docs/research/technical-sovereignty.md`) — AI-generated research and work
  products, not founder-provided source.
- **`ACTIVE/` / `ANSWERED/`** (questions, bridge status, team status, Kai El
  Phase B/C plans) — agent-generated work and the record.
- **`MODIFICATIONS/unity-migration-unreal-engine-architecture-plan`** (87 KB)
  — AI-generated architecture plan. **`MODIFICATIONS/floating-menu-hub`**
  (78 KB) — React code (a prototype).
- **`SKILLS/`** (12 skill docs), **`voice-of-the-hive/`** (VOICE.md,
  COMPRESSION_PROTOCOL.md), **`canvases/`** (design specs), **`memory/`**
  (memory graph), **`.claude/` / `.mistral/` / `.grok/` / `.queen/`** — skills,
  specs, and agent material.
- **All workspace agent reports** — `hive-batches/` (audits, plans, the
  Controller, the Map, the cross-reference), `hive-audit/` (the 107-claim
  audit), `tau-audit/`, `goals/`, `jasper-audit/` reports — working files.
- **Code** — `Spore.html.txt`, `Hive.html.txt`, `DispatcherApp.jsx`,
  `dispatcher-backend-with-readme.zip`, `soul token.sol` (already in the repo
  root). Spore's repo-vs-standalone question is already recorded as Mac's
  call; it is not a SOURCES gap.
- **Credentials** — `bridge-env.txt` (musefolder) — never in SOURCES, never
  in the repo.
- **Licensing-blocked (third-party, full text must NOT go in the public repo
  — per `SOURCES/README.md`):** `What-Would-The-Rockefellers-Do22.pdf`
  (published book by Garrett B. Gunderson — extract in the workspace, full
  text must not be reproduced); `Credit security.pdf` (700 pp., 30 MB,
  Drive only, identified from pp. 1–5 only); Drive legal/reference PDFs
  (Dodd Frank, CFR, The-Right-to-Travel.pdf, Living-in-the-Private.pdf,
  10-12g / 10–12GForm); Drive marketing books (ca$hvertising, The Millionaire
  Next Door). For these, the README's rule applies: store the founder's own
  notes/summary/key-excerpts-with-citation, not the full text.
- **Template, not source** — `Untitled 2025-04-22` (SBA business-plan
  outline/template Mac used for Suit & Street).
- **Photos** — the 2 `.jpg` files in `user/files/` (not SOURCES material;
  SOURCES is PDFs, books, web clippings, research notes, screenshots-as-text).
- **Empty** — the 8 Mother-NaNuet subfolder Docs (1 char each, verified
  empty) and the THEHIVE subfolder shells (empty) — nothing to move.
- **The repo's only PDF** — `.claude/skills/theme-factory/theme-showcase.pdf`
  — a skill asset, not founder material.

---

## §5 — The ambiguity (9 groups, flagged — not gaps)

Founder-provided (or founder-directed) material that is ALREADY an existing
doc in ACTIVE/VISION/the workspace — the direct path after 2026-08-08. The
README says SOURCES is for material "that isn't already ... an existing doc,"
so it may not belong in SOURCES at all. **Flagged as a question for the
founder, not counted as gaps.** If the founder's answer is "SOURCES holds the
source behind the doc," these move in as copies; if "the direct path stands,"
they stay where they are.

| # | Item | Where it is now | Why it's ambiguous |
|---|---|---|---|
| 1 | **The hive (v8 Doc)** — the v8.0 full production backend as a single-file doc (~168K chars) | Drive only (full text not preserved locally; summary in `muse-hive-extraction.md` §b-1). Substance in the repo as `backend/` code. | Substance is a repo; the doc itself is not preserved in SOURCES. |
| 2 | **The hive 1.1 (v8 guide Doc)** — integration guide + code blocks | Drive only (summary only). Substance in the repo as code/guide. | Same as #1. |
| 3 | **True sovereignty (v7 Doc)** — the v7 origin doc (~110K chars extracted) | Drive only (summary only). Substance in the repo as `backend/` code. | Same as #1. |
| 4 | **Master mind map & roadmap deposit (2026-09-28)** — "Unabridged founder deposit. Not abridged. Not censored." (4 files + README: mind map, roadmap Campaigns 0–7, legal fence, plan weave) | `VISION/master-mind-map-roadmap-2026-09-28/` (existing doc in VISION/) | Founder material, already an existing doc in VISION/ (the direct path). |
| 5 | **idea#1.md (2026-07-15)** — the game-studio vision document ($3.7M–$7.56M) | `vision-folder/idea#1.md` (existing doc) | Founder vision doc, already an existing doc. |
| 6 | **VISION 2026-09-19/20 logs (6 files)** — deep body systems, legal-financial architecture, lineage bedrock, PLC/body acronym map, sovereignty blueprint, intellectual omnivore. All headed "Author: Founder (directive)". | `VISION/2026-09-19-*.md`, `VISION/2026-09-20-*.md` (existing docs in VISION/) | Founder-directed (AI-written in-session from founder directive), already existing docs in VISION/. |
| 7 | **Conversation logs** — Log(1)–Log(5) (1.29 MB + 1.57 MB for Log(3)/Log(5)) + `2026-08-06-kai-el-commune-full-log.md` | `Visionary-Conversation-logs/` (existing docs) | Founder conversations, already existing docs; mostly AI-generated with founder prompts embedded. |
| 8 | **52-day cycles transcript (Sister Zodiakas masterclass)** — "as supplied by Mac, 2026-11-06", preserved untruncated, unaltered | `~/workspace/2027-timeline-map-build/52-day-cycles-TRANSCRIPT.md` (existing doc in the workspace) | Founder-provided, already an existing doc in the workspace, already processed into the 2027 calendar. |
| 9 | **HIVE_UPDATES directives** — the record of founder decisions, several preserving the founder's verbatim words (e.g. directive 048, the Arithmancer PDF) | `HIVE_UPDATES/` (existing docs — the record) | The record, where it belongs; the source material behind a directive (e.g. the Arithmancer PDF) is the gap (E1), not the directive itself. |

---

## §6 — Recommendation

### Move or copy into SOURCES (from the workspace — no Drive access needed)

These are ready now. Copy (don't move) the workspace extracts into SOURCES,
keeping the original Drive source + date in the file header, following the
`YYYY-MM-DD-short-description.ext` naming. This needs the founder's go-ahead
— it is a repo change (a PR), not an audit step.

1. **A1–A8 (13 extract files)** → `research-notes/` (A1–A7) and `misc/` (A8).
   For the ×2 duplicates, keep both, dated — the 2026-08/09 version and the
   2026-11-05 version are separate extractions of the same Drive doc.
2. **B1–B4 (4 Untitled Docs)** → convert the `doc-*.json` full text to `.md`
   with a title + date header → `misc/` (B1, B3), `books/` (B2 — the Dante
   Crux bible), `research-notes/` (B4).
3. **C1–C2 (2 PDFs)** → `pdfs/` (`Update.pdf`, `childlike_wonder_lens.pdf`).
4. **D4 (Jasper 4.pdf)** → `pdfs/` (from `jasper-audit/Jasper4.pdf`).
5. **Optional provenance:** the Messiah dissertation PDF
   (`user/files/Messiah_complex_dissertation_3.0.pdf`) → `pdfs/` — the content
   is already encapsulated, so this is provenance only, not a gap.

### Needs Drive access (follow-ups, not doable from the workspace alone)

6. **D1–D3 (Kai El.pdf, The hive 1.2.pdf, The Exodus 2.0.pdf)** → download
   from Drive → `pdfs/`. D3 needs a look first (content unknown).
7. **F1 (ChatGPT-export zip)** → extract + classify first, then decide the
   SOURCES subfolder. The 71 files include the founder's conversation history
   and ~64 attachments — this is the largest single unexamined source.
8. **E1 (Arithmancer PDF)** → recover if it still exists (original chat upload
   or Drive); if not, record it as lost and note that its content survives
   only as the VISION dissection + the Ai essay (A2).

### Leave alone

- Everything in §4 (licensing-blocked, templates, code, credentials, photos,
  empty files, agent-generated work).
- Everything in §3 (already covered).
- **The §5 ambiguity is the founder's call** — it is the same question as the
  Q7 follow-up (revive SOURCES as a durable habit or retire it in favour of
  the direct path). If SOURCES is revived as the durable intake + map, the
  §5 items are the next decision: does SOURCES hold the source behind an
  existing doc, or does the direct path stand? Do not move §5 items until
  that is decided.

### What this audit does NOT do

- It does not run `research-to-dna` on any of the gap items. Landing in
  SOURCES is raw material, not adopted knowledge — the pass (verify /
  classify / distill / inscribe, with the source cited) still has to run on
  each item, and for A4 (Update / F-001–F-011) that pass is the one that keeps
  a claimed law separate from canonical law.
- It does not decide the 42 MISSING items from the MUSE folder gap analysis.
  Those are ideas/concepts not built in the Hive (GNOS, Mogul Bridge, BabyJarvis,
  Kai El soul.md v1.0, voice auth, etc.) — build gaps, not SOURCES gaps. The
  source DOCS behind them are the gap items listed here (A1–A4, B1–B4, D1).
