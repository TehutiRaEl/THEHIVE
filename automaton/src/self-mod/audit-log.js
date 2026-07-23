// automaton/src/self-mod/audit-log.js
//
// Upstream's audit-log.ts was a straightforward append-only DB log —
// correct as a record, but never actively surfaced (nothing alerted a human
// when a modification touched a security-relevant path; you had to go
// looking). This version keeps the same durable record but also pushes a
// loud stderr line (and reuses FundingMonitor's alert-file convention) the
// moment a security-relevant edit lands, so "the agent just modified its own
// agent/ or self-mod/ code" is something a supervising process actually
// notices, not something buried in a table.

import fs from 'node:fs';
import path from 'node:path';
import { genId } from '../state/database.js';

export class AuditLog {
  constructor(db, homeDir) {
    this.db = db;
    this.alertPath = path.join(homeDir, 'alerts.jsonl');
  }

  record({ file, inputSource, beforeHash, afterHash, securityRelevant, note = null }) {
    this.db.prepare(
      `INSERT INTO modifications (id, ts, file, input_source, before_hash, after_hash, security_relevant, note)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(genId('mod'), Date.now(), file, inputSource, beforeHash, afterHash, securityRelevant ? 1 : 0, note);

    if (securityRelevant) {
      const alert = {
        ts: new Date().toISOString(), kind: 'security_relevant_self_mod',
        file, inputSource, message: `Self-modification of security-relevant file: ${file} (source: ${inputSource}).`,
      };
      console.error(`[automaton:self-mod] ${alert.message}`);
      try { fs.appendFileSync(this.alertPath, JSON.stringify(alert) + '\n'); } catch { /* best-effort */ }
    }
  }

  recent(limit = 20) {
    return this.db.prepare('SELECT * FROM modifications ORDER BY ts DESC LIMIT ?').all(limit);
  }
}
