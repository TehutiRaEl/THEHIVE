-- nanuet-brain-absorption.sql — Absorption mechanism (2026-11-13, issue #243).
--
-- Two new tables in nanuet-brain. ADDITIVE ONLY — nothing existing changes, no
-- column is altered, no row is touched. The founder chose the BIGGER version
-- for FOUNDER_ANSWERED (2026-11-13): the founder's decisions as structured data
-- in Nanuet's brain, so the Queen can check them one by one and Kai El can
-- query them — and the Queen Digest, the runtime that writes completed work
-- back into her brain as learned wisdom, so she does not just read the
-- decisions, she learns from what was actually done.
--
-- APPLY TO THE LIVE DATABASE AFTER THE PR MERGES (the PR does not apply it —
-- applying it is a write to production, and the Worker code degrades honestly
-- until it is applied):
--   npx wrangler d1 execute nanuet-brain --remote --file=worker/schema/nanuet-brain-absorption.sql
--
-- Until it is applied, the new routes degrade honestly (a clear note, never a
-- 500): GET /v11/founder/decisions/:id and GET /v11/nanuet/digest report that
-- the table is not present, and the write paths report the same. The read
-- routes that serve files (GET /v11/founder/decisions, GET /v11/founder/queue,
-- GET /v11/ventures) do not need these tables at all.
--
-- The two tables deliberately live in nanuet-brain (the Queen's own database),
-- not in thehive-queen: these are HER memory — what she knows and what she has
-- learned — and the autonomy_registry in this same database already documents
-- that her memory is hers. The thehive-queen database keeps the operational
-- record (proposals, gaps, sandbox runs); nanuet-brain keeps what the Queen
-- knows and has learned from it.

-- ── founder_decisions ─────────────────────────────────────────────────────
-- One row per recorded founder decision, parsed from docs/FOUNDER_ANSWERED by
-- parseFounderDecisions() in worker/src/index.js and written by
-- syncFounderDecisions(). The id is the decision id exactly as written in
-- FOUNDER_ANSWERED — 'Q-001', 'XR-Q8', 'FQ-Q-015', 'M-01', 'Truth hierarchy',
-- 'G1–G4', 'Tier 1 goals', 'HITL approval list' — so a row is traceable back
-- to its entry by id alone, with no mapping table.
--
-- decided_at is the YYYY-MM-DD from the entry's '## ' header (DECIDED /
-- RATIFIED / APPROVED / AMENDED), NULL when the header carries no date.
-- answer is the '**Founder decision:**' line when the entry has one, else the
-- first 500 chars of the entry body. body is the full entry text, truncated
-- to 8000 chars so one long entry cannot bloat a row without bound.
-- synced_at is when THIS row was written (not when the decision was made) —
-- the two dates are different facts and are kept in different columns.
CREATE TABLE IF NOT EXISTS founder_decisions (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  decided_at TEXT,
  answer     TEXT,
  body       TEXT,
  source     TEXT NOT NULL DEFAULT 'docs/FOUNDER_ANSWERED',
  synced_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_founder_decisions_date ON founder_decisions(decided_at DESC);

-- ── queen_digest ──────────────────────────────────────────────────────────
-- The Queen Digest: completed work, written back into Nanuet's brain as
-- learned wisdom. Each row is one thing the Hive did and what the Queen
-- learned from it. The `wisdom` column is the point of the table — a row
-- with a summary and no wisdom is a log entry, not a lesson; the writer is
-- expected to fill it whenever the lesson is known, and to leave it NULL
-- (honestly empty) rather than invent one when it is not.
--
-- kind is open-ended on purpose (no CHECK constraint): the Digest must be
-- able to record kinds of completed work the Hive has not yet imagined, and
-- a constraint that rejects an unknown kind would silently drop exactly the
-- new work the Digest exists to learn from. The known kinds are documented
-- here and in writeQueenDigest():
--   decision_absorbed — a founder decision was absorbed into founder_decisions
--   work_completed    — a piece of work finished (batch, route, build, audit)
--   route_verified    — a route was verified live (the definition of done)
--   batch_completed   — a Queen batch finished
--   proposal_decided  — a proposal was decided by the founder
--   note              — a plain note, no completed work attached
CREATE TABLE IF NOT EXISTS queen_digest (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ts           TEXT NOT NULL,
  agent        TEXT NOT NULL DEFAULT 'Nanuet',
  kind         TEXT NOT NULL,
  subject_kind TEXT,
  subject_id   TEXT,
  summary      TEXT NOT NULL,
  wisdom       TEXT,
  source       TEXT
);
CREATE INDEX IF NOT EXISTS idx_digest_ts ON queen_digest(ts DESC);
CREATE INDEX IF NOT EXISTS idx_digest_kind ON queen_digest(kind);
CREATE INDEX IF NOT EXISTS idx_digest_subject ON queen_digest(subject_kind, subject_id);
