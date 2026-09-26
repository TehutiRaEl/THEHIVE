ALTER TABLE hive_proposals ADD COLUMN normalized_title TEXT;

UPDATE hive_proposals
SET normalized_title = TRIM(
  LOWER(
    REPLACE(
      REPLACE(title, '#', ''),
      '  ', ' '
    )
  )
)
WHERE normalized_title IS NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_normalized_pending
  ON hive_proposals(normalized_title, status)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS gate_refusals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  layer TEXT NOT NULL,
  reason TEXT NOT NULL,
  title TEXT NOT NULL,
  body_excerpt TEXT,
  existing_id INTEGER,
  kind TEXT
);

CREATE INDEX IF NOT EXISTS idx_gate_refusals_ts
  ON gate_refusals(ts DESC);
