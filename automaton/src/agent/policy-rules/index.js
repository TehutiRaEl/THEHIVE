// automaton/src/agent/policy-rules/index.js
//
// This file (like upstream's) is on the protected-write list — it wires the
// individual rule modules into one ordered set. Unlike upstream, so are all
// the individual rule files it imports (see path-protection.js's comment).

import { pathProtectionRules } from './path-protection.js';
import { authorityRules } from './authority.js';
import { commandSafetyRules } from './command-safety.js';
import { financialRules } from './financial.js';
import { rateLimitRules } from './rate-limits.js';
import { validationRules } from './validation.js';

export function buildAllRules(cfg, { spendTracker, modCounter, lineageCounter }) {
  const all = [
    ...pathProtectionRules(),
    ...authorityRules(),
    ...commandSafetyRules(),
    ...financialRules(cfg, spendTracker),
    ...rateLimitRules(cfg, modCounter, lineageCounter),
    ...validationRules(cfg),
  ];
  all.sort((a, b) => a.priority - b.priority);
  return all;
}
