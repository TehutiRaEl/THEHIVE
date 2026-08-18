-- venture_sandbox_runs (2026-08-18)
--
-- Created live via ensureTables() in worker/src/index.js on every heartbeat
-- (CREATE TABLE IF NOT EXISTS, same as hive_proposals). Reproduced here so the
-- schema is rebuildable from the repo rather than known only from live state.
--
-- The real record of Kai El actually building something inside a venture repo via
-- .github/workflows/kai-sandbox-run.yml. A run is NEVER a direct push to that
-- venture's main branch — the workflow always pushes a new branch and opens a real
-- GitHub PR; merging that PR IS the founder's approval, the same role
-- POST /v11/proposals/:id/decide plays for text/diff proposals. This table only
-- mirrors that real GitHub state back into the Command Center for one place to see
-- it — it never grants or executes anything itself.
--
-- Deliberately a separate table from venture_capability_gaps: "may I have access to
-- X" and "here's finished work on a branch, please review" are different founder
-- decisions and stay two different queues. linked_gap_id is nullable — set only
-- when a run follows a capability gap the founder already granted.
CREATE TABLE IF NOT EXISTS venture_sandbox_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  venture TEXT NOT NULL,          -- which venture (manifest.yaml id) this run is for
  task TEXT NOT NULL,             -- what Kai El was asked/chose to build
  branch TEXT,                    -- set once the workflow pushes it
  pr_url TEXT,                    -- set once the workflow opens the real PR
  status TEXT NOT NULL DEFAULT 'running',  -- running | pr_open | merged | closed
  linked_gap_id INTEGER,          -- nullable FK into venture_capability_gaps.id
  decided_at TEXT,
  founder_note TEXT
);
