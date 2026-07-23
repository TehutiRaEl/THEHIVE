// automaton/src/agent/policy-engine.js
//
// Evaluates every rule (priority order), first `deny` wins immediately.
// If no deny fired but at least one rule returned `pending_approval`, the
// OVERALL decision is `pending_approval` — a distinct, real state from
// `deny` (see policy-rules/financial.js's comment on THE FIX FOR GAP #1).
// If nothing fired, `allow`.

import { genId } from '../state/database.js';

export class PolicyEngine {
  constructor(rules, db) {
    this.rules = rules;
    this.db = db;
  }

  evaluate(request) {
    let pending = null;
    for (const rule of this.rules) {
      const result = rule.evaluate(request);
      if (!result) continue;
      if (result.action === 'deny') {
        this._record(request, 'deny', rule.name, result);
        return { action: 'deny', rule: rule.name, ...result };
      }
      if (result.action === 'pending_approval' && !pending) {
        pending = { rule: rule.name, ...result };
      }
    }
    if (pending) {
      this._record(request, 'pending_approval', pending.rule, pending);
      return { action: 'pending_approval', ...pending };
    }
    this._record(request, 'allow', null, {});
    return { action: 'allow' };
  }

  _record(request, action, ruleName, result) {
    try {
      this.db.prepare(
        `INSERT INTO policy_decisions (id, ts, tool, input_source, action, rule, reason_code, human_message, request_json)
         VALUES (?,?,?,?,?,?,?,?,?)`
      ).run(
        genId('pd'), Date.now(), request.tool, request.inputSource ?? 'agent',
        action, ruleName, result.reasonCode ?? null, result.humanMessage ?? null,
        JSON.stringify(request)
      );
    } catch { /* never let audit-logging failure block the decision itself */ }
  }
}
