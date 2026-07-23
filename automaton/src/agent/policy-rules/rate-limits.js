// automaton/src/agent/policy-rules/rate-limits.js
//
// Generic per-tool rate limiting (distinct from financial.js's money-cap
// rules) — e.g. bounding how often self-modification, replication attempts,
// or external social sends can happen, independent of dollar amounts.

export function createSelfModRateLimitRule(cfg, modCounter) {
  return {
    name: 'rate_limits.self_mod',
    priority: 15,
    evaluate(request) {
      if (request.tool !== 'edit_own_file') return null;
      const countLastHour = modCounter.countSince(Date.now() - 60 * 60 * 1000);
      if (countLastHour >= cfg.selfMod.maxModsPerHour) {
        return {
          action: 'deny',
          reasonCode: 'SELF_MOD_RATE_LIMIT',
          humanMessage: `${countLastHour} self-modifications in the last hour (cap ${cfg.selfMod.maxModsPerHour}).`,
        };
      }
      return null;
    },
  };
}

export function createReplicationCapRule(cfg, lineageCounter) {
  return {
    name: 'rate_limits.max_children',
    priority: 16,
    evaluate(request) {
      if (request.tool !== 'spawn_child') return null;
      const active = lineageCounter.countActiveChildren();
      if (active >= cfg.maxChildren) {
        return {
          action: 'deny',
          reasonCode: 'MAX_CHILDREN_EXCEEDED',
          humanMessage: `${active} active children already (cap ${cfg.maxChildren}).`,
        };
      }
      return null;
    },
  };
}

export function rateLimitRules(cfg, modCounter, lineageCounter) {
  return [createSelfModRateLimitRule(cfg, modCounter), createReplicationCapRule(cfg, lineageCounter)];
}
