-- TownHall bulletin board (TH-1)
-- Source of truth for field rationale: docs/TOWNHALL.md
-- Applied via ensureTables() CREATE TABLE IF NOT EXISTS in worker/src/index.js

CREATE TABLE IF NOT EXISTS townhall_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  author_agent TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  claimed_by TEXT,
  assigned_by TEXT,
  preferred_specialty TEXT,
  specialty_tags TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  pressure REAL NOT NULL DEFAULT 0,
  signal_score REAL NOT NULL DEFAULT 0,
  ttl_at TEXT,
  parent_id INTEGER,
  root_id INTEGER,
  loop_phase TEXT,
  failure_of_id INTEGER,
  innovation_note TEXT,
  colony_id TEXT,
  mesh_targets TEXT,
  gateway_hint TEXT,
  founder_visible INTEGER NOT NULL DEFAULT 1,
  risk_tier TEXT NOT NULL DEFAULT 'normal',
  vision_ref TEXT,
  alignment_score REAL,
  council_status TEXT,
  elder_note TEXT,
  requires_founder INTEGER NOT NULL DEFAULT 0,
  proposal_id INTEGER,
  roadmap_ref TEXT,
  output_ref TEXT,
  provenance TEXT,
  contradiction_flag INTEGER NOT NULL DEFAULT 0,
  gap_label TEXT
);

-- Bound growth: prune closed+decayed older than N days in a later maintenance job
-- (same discipline as hive_updates 100-row cap).
