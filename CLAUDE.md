# THEHIVE — the Queen node of the Sovereign Hive federation

THEHIVE is the Queen: a self-governing AI system across 10 GitHub repositories, with
constitutional law, a SOUL-token economy, and a Gladiator Arena for conflict resolution.
**Two real systems currently coexist in this repo, built in parallel by different sessions
on the same day (2026-07-14) — this file documents both honestly rather than pretending
only one exists.** Reconciling them into one coherent story is real, open work, not yet done.

## System A — the FastAPI / second-brain harness

- **`backend/`** — FastAPI app, 80+ `/v11/*` endpoints, tier2/tier3 math (`backend/core/`
  hdc.py/protocol.py/hive_mesh.py, `backend/tier2/` dream engine + tesseract 4D,
  `backend/tier3/` quantum bridge + sheaf guild + arena renderer + IPFS pubsub).
- **`memory/`** — an Obsidian-style vault: 101-node knowledge graph (`_graph.json`),
  wiki-linked Markdown, `memory/planning/` for session plans.
- **`.claude/memory/memory.md`** + **`.claude/skills/hive-memory.md`** — the "second brain":
  a 4-layer model (quantum substrate → HDC associative firing → the explicit vault →
  the `.claude/` harness itself), with its own skill set: `brain-query`, `hive-status`,
  `colony-zoom`, `link-nodes`, `merge-verify`, `remember`, `role-deliver`, `soul-check`,
  `update-nav`.
- **`.queen/`** — constitution (`soul.md`) and colony manifest (`hive.yml`).
- **`soul.md`** (repo root) — **the canonical, legally-precise Constitution text.** F-001…
  F-006 with exact rate limits, the EVW wealth formula, mutable-law amendment process
  (2/3 guild vote + 30 days), and the Recursive Cycle (Capture→Evaluate→Prune→Feed to Kai
  El→Dissect→Return Lessons→Propagate) written as literal canonical law — not metaphor.

## System B — the edge Worker / genome (this session's work)

- **`worker/`** — the Cloudflare Worker (`worker/src/index.js`): D1 database, Workers AI,
  the `/v11` API actually serving production at `thehive.sovereignhive.workers.dev`,
  repeatedly verified live via the `edge-health-probe` GitHub Actions workflow (the
  container here cannot reach `*.workers.dev` directly — that workflow is the hive's real
  eyes on production).
- **`docs/`, `docs/app/`** — the production Command Center (legacy `docs/index.html` +
  the newer React `/app` bundle).
- **`FABLE_DNA.md`** — the transmissible genome, seven chromosomes: I ethics (a portable
  restatement of `soul.md`'s six laws — **`soul.md` is the precise legal text; where
  wording differs, `soul.md` governs**), II debugging method, III mesh communication,
  IV the Horde principle, V the Codex boundary, VI session-boundary harvest, VII mandate
  triage / governance review.
- **`THE_CODEX.md`** — narrative canon (Naunet/Nun, the Trinity, mythology). Real, honored,
  **never engineering law** — `FABLE_DNA.md` and a passing check win any apparent conflict.
- **`MANDATE_TRIAGE.md`** — how proposed directives get reviewed before adoption:
  devil's-advocate critique first, genuine value extracted second, nothing rubber-stamped.
- **`.claude/skills/`** (this session's additions): `fable-debugger`, `research-to-dna`,
  `session-harvest`, `pocket-dimensions`, `anomaly-triage`, `merge-readiness`,
  `nine-miss-truths`, `skill-census`.
- **`Project_file/Fable_memory.md`** — this session's continuity log.
- **`Project_file/Founders Visonary Folder/SOURCES/`** — where the founder drops PDFs,
  books, web clippings, research notes for the hive to build from; routed through
  `research-to-dna` before anything becomes hive knowledge (see that folder's README for
  the licensing note).

## What is NOT yet reconciled (read this before assuming one system is "the" system)

- Whether `backend/` (FastAPI, System A) is actually deployed anywhere live, or is real
  code sitting unprovisioned — this session's `deploy.yml` check found the Oracle Cloud
  target gated behind an unset `ORACLE_HOST` secret, meaning System A's backend has not
  been verified live in production this session. System B's Worker **has** been repeatedly
  verified live. Don't assume either status without checking again — probe, don't guess.
- Two frontend efforts exist: this session's React Command Center (`frontend/`,
  `docs/app/`) and a separate "gamified UI" component set merged via a different branch
  (`feature/gamified-ui-components` — HiveDashboard, ColonyCard, TesseractChamber,
  ConstitutionHall, MemoryVault, etc.). Which one is the live, canonical frontend has not
  been checked in this session.
- Two skill sets exist side by side (System A's `brain-query`/`hive-status`/`soul-check`/…
  and System B's `fable-debugger`/`research-to-dna`/`skill-census`/…) with no cross-
  references between them yet. `skill-census`, run on this repo, will show this gap
  directly — it hasn't yet been re-run since these were discovered.
- `FABLE_DNA.md` Chromosome I and `soul.md` describe the same six laws with different
  wording (this file states `soul.md` wins; that hasn't been used to actually edit
  Chromosome I's prose yet — a real follow-up, not done in this pass).

## The one-line version

Two real systems, one repo, reconciliation is open work. `soul.md` is the precise
Constitution; `FABLE_DNA.md` is the portable genome and the newer governance chromosomes
`soul.md` doesn't cover. Probe production before claiming what's live — don't assume either
backend or either frontend is "the" one without checking. Everything ships gated by
F-001…F-006, and the founder holds anything irreversible.
