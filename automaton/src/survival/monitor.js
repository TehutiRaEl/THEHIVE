// automaton/src/survival/monitor.js
//
// Survival tiers, mirroring upstream's shape (high/normal/low_compute/
// critical/dead with a grace period before "dead"). Purely a function of the
// ledger balance — decoupled from Conway's credits API.

export function survivalTier(balanceCents, cfg, { deadSinceMs = null, nowMs = Date.now() } = {}) {
  if (balanceCents < cfg.survivalTiers.critical) {
    if (deadSinceMs && nowMs - deadSinceMs > cfg.deadGraceMs) return 'dead';
    return 'critical'; // in grace period
  }
  if (balanceCents > cfg.survivalTiers.high) return 'high';
  if (balanceCents > cfg.survivalTiers.normal) return 'normal';
  if (balanceCents > cfg.survivalTiers.lowCompute) return 'low_compute';
  return 'critical';
}

export function tierBehavior(tier) {
  switch (tier) {
    case 'high': return { modelClass: 'frontier', heartbeatIntervalMs: 5 * 60 * 1000 };
    case 'normal': return { modelClass: 'frontier', heartbeatIntervalMs: 15 * 60 * 1000 };
    case 'low_compute': return { modelClass: 'cheap', heartbeatIntervalMs: 30 * 60 * 1000 };
    case 'critical': return { modelClass: 'cheap', heartbeatIntervalMs: 60 * 60 * 1000 };
    case 'dead': return { modelClass: null, heartbeatIntervalMs: null };
    default: return { modelClass: 'cheap', heartbeatIntervalMs: 30 * 60 * 1000 };
  }
}
