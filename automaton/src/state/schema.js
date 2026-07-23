// automaton/src/state/schema.js
//
// Schema v1. Unlike upstream (whose ARCHITECTURE.md said "v8" while the code
// had actually drifted to schema v11 — a real doc/code-drift bug the
// devil's-advocate review flagged), this file IS the single source of truth
// for the schema version; CURRENT_SCHEMA_VERSION below is asserted against
// in state/database.js on every open, and any docs describing the schema
// must cite this constant rather than a hardcoded number.

export const CURRENT_SCHEMA_VERSION = 1;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  kind TEXT NOT NULL,        -- 'credit' | 'debit'
  tool TEXT NOT NULL,        -- which tool/action caused this movement
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER NOT NULL,
  counterparty TEXT,         -- e.g. child agent id, inference provider name
  note TEXT
);

CREATE TABLE IF NOT EXISTS policy_decisions (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  tool TEXT NOT NULL,
  input_source TEXT NOT NULL,   -- 'agent' | 'heartbeat' | 'external' | 'creator'
  action TEXT NOT NULL,         -- 'allow' | 'deny' | 'pending_approval'
  rule TEXT,
  reason_code TEXT,
  human_message TEXT,
  request_json TEXT
);

CREATE TABLE IF NOT EXISTS approval_queue (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  tool TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  request_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'approved' | 'rejected'
  decided_at INTEGER,
  decided_by TEXT,
  decision_note TEXT
);

CREATE TABLE IF NOT EXISTS modifications (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  file TEXT NOT NULL,
  input_source TEXT NOT NULL,
  before_hash TEXT,
  after_hash TEXT,
  security_relevant INTEGER NOT NULL DEFAULT 0,
  note TEXT
);

CREATE TABLE IF NOT EXISTS lineage (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  spawned_at INTEGER NOT NULL,
  genesis_prompt TEXT NOT NULL,
  constitution_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed' -- 'proposed' | 'approved' | 'rejected' | 'running' | 'dead'
);

CREATE TABLE IF NOT EXISTS soul_history (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  section TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  auto_applied INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
`;
