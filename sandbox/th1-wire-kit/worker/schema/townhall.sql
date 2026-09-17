-- TownHall schema (canonical; on main via PR #194)
-- Re-landed in sandbox for self-contained kit.

CREATE TABLE IF NOT EXISTS townhall_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_by TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  meta TEXT
);

CREATE INDEX IF NOT EXISTS idx_townhall_status ON townhall_items(status);
CREATE INDEX IF NOT EXISTS idx_townhall_kind ON townhall_items(kind);
