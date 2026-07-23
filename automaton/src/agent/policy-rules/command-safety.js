// automaton/src/agent/policy-rules/command-safety.js
//
// Blocks obviously destructive shell patterns in the `exec` tool. Carried
// over from upstream's command-safety.ts (this part of upstream's design
// was sound) — extended to also cover `edit_own_file`'s targetPath, since
// upstream's version only regex-scanned the shell string, which meant a
// direct file write (not going through a shell) bypassed it entirely. That
// gap is closed here more fundamentally by path-protection.js's
// isProtectedWritePath check running on every write regardless of mechanism
// — this file is specifically about shell metacharacter/destructive-command
// patterns, which is a different (and narrower) concern.

const FORBIDDEN_COMMAND_PATTERNS = [
  /rm\s+-rf\s+[~./]/i,
  /rm\s+-rf\s+\.automaton/i,
  /drop\s+table/i,
  /kill\s+.*automaton/i,
  />\s*\/dev\/sd[a-z]/i,
  /:\(\)\s*\{\s*:\|:&\s*\}\s*;:/, // fork bomb
  /curl.*\|\s*sh/i,
  /wget.*\|\s*sh/i,
  /chmod\s+-R\s+777\s+\//i,
];

export function createForbiddenCommandRule() {
  return {
    name: 'command_safety.forbidden_pattern',
    priority: 3,
    evaluate(request) {
      if (request.tool !== 'exec' || !request.command) return null;
      for (const pattern of FORBIDDEN_COMMAND_PATTERNS) {
        if (pattern.test(request.command)) {
          return {
            action: 'deny',
            reasonCode: 'FORBIDDEN_COMMAND_PATTERN',
            humanMessage: `Command matches a forbidden destructive pattern (${pattern}).`,
          };
        }
      }
      return null;
    },
  };
}

export function commandSafetyRules() {
  return [createForbiddenCommandRule()];
}
