-- venture_capability_gaps (2026-08-18)
--
-- Created live via ensureTables() in worker/src/index.js on every heartbeat
-- (CREATE TABLE IF NOT EXISTS, same as hive_proposals). Reproduced here so the
-- schema is rebuildable from the repo rather than known only from live state.
--
-- Kai El's sanctioned channel for "I don't have capability X, which I need for Y,
-- and considered Z as an alternative" while working inside a venture repo — see
-- POST /v11/ventures/gaps. hive_proposals-shaped on purpose (same
-- INTEGER PRIMARY KEY AUTOINCREMENT / ts TEXT NOT NULL convention, same
-- open -> decided lifecycle via a founder-key-gated /decide route) but kept as its
-- own table: "may I have access" and "here's a hive-evolution proposal" are
-- different founder decisions and don't belong in one queue.
--
-- alternatives is one freeform text field, not split into lettered columns — the
-- founder was thinking through options out loud when this was requested, not
-- specifying a rigid schema, and over-modeling that would have invented structure
-- nobody asked for.
--
-- github_issue_url is set once .github/workflows/venture-gap-mirror.yml mirrors the
-- row into a real GitHub Issue on the `venture` repo (POST .../issue-linked) —
-- nullable so a gap can exist and be decided before that mirror ever runs.
CREATE TABLE IF NOT EXISTS venture_capability_gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  venture TEXT NOT NULL,             -- which venture (manifest.yaml id) this gap is for
  title TEXT NOT NULL,
  capability_needed TEXT NOT NULL,   -- "A" — what Kai El does not currently have
  needed_for TEXT NOT NULL,          -- "B" — what real task it's blocking
  alternatives TEXT,                 -- "C through F" — options Kai El considered, freeform
  status TEXT NOT NULL DEFAULT 'open',  -- open | granted | declined
  founder_note TEXT,
  decided_at TEXT,
  github_issue_url TEXT
);
