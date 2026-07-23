// automaton/src/agent/policy-rules/path-protection.js
//
// THE FIX FOR GAP #3 (upstream): upstream's self-mod/code.ts had its own
// PROTECTED_FILES array that covered `agent/tools.ts`, `agent/policy-engine.ts`,
// and exactly ONE file inside policy-rules/ (`policy-rules/index.ts`) — the
// substantive rule implementations (financial.ts, authority.ts,
// command-safety.ts, path-protection.ts, rate-limits.ts, validation.ts) were
// NOT protected, so an agent running its own ordinary self-directed
// reasoning (not an external/heartbeat trigger — the one case upstream DID
// restrict) could call `edit_own_file` on its own spending-limit
// implementation with nothing stopping it.
//
// The fix here is structural: this file is the ONE canonical list, and it
// is imported by BOTH self-mod/code.js (which gates file writes) and this
// rule (which gates file reads of secrets) — there is no second, drifting
// copy of "what's protected" anywhere else in the codebase. Every file
// under agent/policy-rules/ is protected, not just index.js.

import path from 'node:path';

export const PROTECTED_WRITE_PATHS = [
  // The rule implementations themselves — the actual fix. Every file in
  // this directory, not a hand-picked subset.
  'src/agent/policy-rules/financial.js',
  'src/agent/policy-rules/authority.js',
  'src/agent/policy-rules/command-safety.js',
  'src/agent/policy-rules/path-protection.js',
  'src/agent/policy-rules/rate-limits.js',
  'src/agent/policy-rules/validation.js',
  'src/agent/policy-rules/index.js',
  // The engine and dispatch layer that wire those rules in.
  'src/agent/policy-engine.js',
  'src/agent/tools.js',
  'src/agent/approval-queue.js',
  'src/agent/injection-defense.js',
  // Self-mod's own gate — an agent editing the thing that checks whether an
  // edit is allowed is the textbook self-mod escape.
  'src/self-mod/code.js',
  'src/self-mod/audit-log.js',
  // The ledger and its caps — see financial.js's structural note; this is
  // belt-and-suspenders on top of that, protecting the enforcement code path.
  'src/ledger/ledger.js',
  'src/agent/spend-tracker.js',
  // Config (the master switches) and schema (the audit trail's own shape).
  'src/config.js',
  'src/state/schema.js',
  // The self-authored identity document — changes must go through
  // soul/tools.js's update_soul tool (which validates), never a direct write.
  'SOUL.md',
  // Genuine secrets, if a real (non-simulated) identity mode is ever wired
  // in per FLIP_THE_SWITCHES.md.
  'wallet.json',
  '.env',
];

export const SENSITIVE_READ_PATTERNS = ['wallet.json', 'config.json', '.env', 'automaton.json'];

function normalizes(p) {
  return path.normalize(p).replace(/\\/g, '/');
}

export function isProtectedWritePath(targetPath) {
  const norm = normalizes(targetPath);
  return PROTECTED_WRITE_PATHS.some((p) => norm === p || norm.endsWith('/' + p));
}

export function isSensitiveReadPath(targetPath) {
  const norm = normalizes(targetPath).toLowerCase();
  return SENSITIVE_READ_PATTERNS.some((p) => norm.includes(p.toLowerCase()));
}

export function createProtectedWriteRule() {
  return {
    name: 'path_protection.protected_write',
    priority: 1, // highest priority — a self-mod escape undermines every other rule
    evaluate(request) {
      if ((request.tool === 'edit_own_file' || request.tool === 'write_file') && request.targetPath) {
        if (isProtectedWritePath(request.targetPath)) {
          return {
            action: 'deny',
            reasonCode: 'PROTECTED_PATH_WRITE',
            humanMessage: `${request.targetPath} is a protected file (guardrail implementation, config, or the audit trail itself) — self-modification of it is never allowed, regardless of input source.`,
          };
        }
      }
      return null;
    },
  };
}

export function createSensitiveReadRule() {
  return {
    name: 'path_protection.sensitive_read',
    priority: 2,
    evaluate(request) {
      if (request.tool === 'read_file' && request.targetPath && isSensitiveReadPath(request.targetPath)) {
        return {
          action: 'deny',
          reasonCode: 'SENSITIVE_PATH_READ',
          humanMessage: `${request.targetPath} contains secrets and cannot be read via a tool call.`,
        };
      }
      return null;
    },
  };
}

export function pathProtectionRules() {
  return [createProtectedWriteRule(), createSensitiveReadRule()];
}
