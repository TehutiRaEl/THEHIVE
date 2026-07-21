// automaton/src/agent/policy-rules/authority.js
//
// Restricts a specific set of high-blast-radius tools when the call did NOT
// originate from a human ("creator") or the agent's own live reasoning turn
// — i.e. from an unattended heartbeat tick or an externally-triggered event
// (a social message, a webhook). This is a genuine, working defense-in-depth
// layer carried over from upstream's authority.ts.
//
// IMPORTANT — this is defense-in-depth, not the primary gate. Upstream's
// actual gap was treating this as the *only* restriction on spawn/fund/
// delete, which meant the agent's own ordinary self-directed reasoning
// (by far its most common operating mode) sailed through with zero
// restriction on those actions. Here, the primary gates on money
// (financial.js, applied regardless of source) and replication
// (config.replicationAutonomy + the approval queue, applied regardless of
// source) do not depend on inputSource at all — this rule only adds an
// *extra* restriction for the unattended-trigger case on top of those.

const EXTERNAL_BLOCKED_TOOLS = new Set([
  'delete_sandbox',
  'spawn_child',
  'fund_child',
  'update_genesis_prompt',
]);

export function createBlockDangerousFromExternalRule() {
  return {
    name: 'authority.block_dangerous_from_external',
    priority: 5, // runs first — this is a hard boundary, not a soft one
    evaluate(request) {
      const source = request.inputSource;
      if ((source === 'external' || source === 'heartbeat' || source === undefined)
        && EXTERNAL_BLOCKED_TOOLS.has(request.tool)) {
        return {
          action: 'deny',
          reasonCode: 'DANGEROUS_ACTION_FROM_UNATTENDED_SOURCE',
          humanMessage: `${request.tool} cannot be triggered by an unattended (${source ?? 'unspecified'}) call — only a live agent turn or a creator action can request it, and even then it is still subject to the financial/replication gates below.`,
        };
      }
      return null;
    },
  };
}

// A second, narrower rule specifically for self-modification triggered by
// something other than the agent's own reasoning or the creator directly —
// carried over from upstream (this part of upstream's design was fine).
export function createSelfModFromExternalRule() {
  return {
    name: 'authority.self_mod_from_external',
    priority: 6,
    evaluate(request) {
      const source = request.inputSource;
      if ((request.tool === 'edit_own_file' || request.tool === 'write_file')
        && (source === 'external' || source === 'heartbeat' || source === undefined)) {
        return {
          action: 'deny',
          reasonCode: 'SELF_MOD_FROM_UNATTENDED_SOURCE',
          humanMessage: `Self-modification cannot be triggered by an unattended (${source ?? 'unspecified'}) call.`,
        };
      }
      return null;
    },
  };
}

export function authorityRules() {
  return [createBlockDangerousFromExternalRule(), createSelfModFromExternalRule()];
}
