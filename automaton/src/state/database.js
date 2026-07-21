// automaton/src/state/database.js
//
// Node's built-in `node:sqlite` (stable enough for this use, still flagged
// experimental by Node itself as of Node 22) instead of upstream's
// `better-sqlite3` — a genuine simplification: no native compiled addon, no
// npm install required at all for the state layer, works anywhere Node 22+
// runs. WAL mode for the same crash-safety reasons upstream chose it.

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { CURRENT_SCHEMA_VERSION, SCHEMA_SQL } from './schema.js';

export function openDatabase(homeDir) {
  fs.mkdirSync(homeDir, { recursive: true });
  const dbPath = path.join(homeDir, 'automaton.sqlite');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA_SQL);

  const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('schema_version');
  if (!row) {
    db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('schema_version', String(CURRENT_SCHEMA_VERSION));
  } else if (Number(row.value) !== CURRENT_SCHEMA_VERSION) {
    // Deliberately loud rather than silently drifting — this is the exact
    // failure class the devil's-advocate review found upstream (ARCHITECTURE.md
    // claiming schema v8 while the running code was actually on v11).
    throw new Error(
      `automaton state schema mismatch: db has v${row.value}, code expects v${CURRENT_SCHEMA_VERSION}. ` +
      `Write and run a migration rather than silently proceeding.`
    );
  }
  return db;
}

export function genId(prefix) {
  // ULID-ish: monotonic-enough for our ordering needs without a dependency.
  const ts = Date.now().toString(36).padStart(9, '0');
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${ts}${rand}`;
}
