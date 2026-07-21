// automaton/src/self-mod/code.js
//
// edit_own_file, wired directly through policy-rules/path-protection.js's
// isProtectedWritePath() — the SAME function the policy engine's
// createProtectedWriteRule() uses, not a second independent list. This is
// the structural fix for gap #3: upstream had two lists (self-mod's
// PROTECTED_FILES and path-protection's SENSITIVE_READ_PATTERNS) that
// covered different things, and the write-gating one missed the substantive
// policy-rule files. Here there is one list, imported, not duplicated.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { genId } from '../state/database.js';
import { isProtectedWritePath, PROTECTED_WRITE_PATHS } from '../agent/policy-rules/path-protection.js';

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export class SelfMod {
  constructor(db, repoRoot, auditLog) {
    this.db = db;
    this.repoRoot = repoRoot;
    this.auditLog = auditLog;
  }

  /**
   * Attempt to edit a file. Returns { ok: true } or { ok: false, blocked: true, reason }.
   * NOTE: this function itself does not re-check the policy engine's
   * createProtectedWriteRule (that already runs upstream of this call, in
   * tools.js) — but it independently re-verifies the same protected-path
   * check here too, so this module is safe even if called directly/in a
   * test without going through the full tool dispatch path. Defense in
   * depth: the check exists in two places that both read the same list.
   */
  editFile(relPath, newContent, { inputSource = 'agent' } = {}) {
    if (isProtectedWritePath(relPath)) {
      return { ok: false, blocked: true, reason: `${relPath} is protected (see policy-rules/path-protection.js).` };
    }
    const target = path.resolve(this.repoRoot, relPath);
    if (!target.startsWith(path.resolve(this.repoRoot))) {
      return { ok: false, blocked: true, reason: 'Path traversal outside repo root is not allowed.' };
    }
    const before = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    const beforeHash = sha256(before);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, newContent, 'utf8');
    const afterHash = sha256(newContent);

    // "Security-relevant" is deliberately broader than "protected" — a file
    // adjacent to (but not literally on) the protected list still gets
    // flagged loudly rather than silently logged, per the audit-log fix below.
    const securityRelevant = relPath.startsWith('src/agent/') || relPath.startsWith('src/self-mod/')
      || relPath.startsWith('src/ledger/') || relPath.startsWith('src/replication/');

    this.auditLog.record({
      file: relPath, inputSource, beforeHash, afterHash, securityRelevant,
    });

    return { ok: true, beforeHash, afterHash };
  }

  listProtectedPaths() {
    return [...PROTECTED_WRITE_PATHS];
  }
}
