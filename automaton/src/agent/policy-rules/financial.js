// automaton/src/agent/policy-rules/financial.js
//
// THE FIX FOR GAP #2 (upstream): every money-moving tool in upstream
// Automaton was individually named in an `appliesTo.names` allowlist —
// `transfer_credits` was covered by real hourly/daily/per-tx caps, but
// `fund_child` (self-replication funding) and the startup/runtime `topup`
// path were NOT in that list, so replication funding had no rate limit at
// all beyond "can't send more than half current balance," repeatable every
// turn, forever.
//
// The fix here is structural, not a bigger allowlist (a bigger allowlist is
// exactly the kind of thing that's easy to forget to update when a new
// tool is added later — which is how upstream's gap happened in the first
// place). Instead: ANY policy request that declares a `moneyMovementCents`
// field is automatically subject to every rule below, regardless of tool
// name. Adding a new money-moving tool later means it inherits every cap
// automatically the moment it sets that field — there is no allowlist to
// remember to update.

export function createTransferMaxSingleRule(cfg) {
  return {
    name: 'financial.max_single_transfer',
    priority: 10,
    evaluate(request) {
      if (!request.moneyMovementCents) return null;
      if (request.moneyMovementCents > cfg.financial.maxSingleTransferCents) {
        return {
          action: 'deny',
          reasonCode: 'MAX_SINGLE_TRANSFER_EXCEEDED',
          humanMessage: `${request.tool}: ${request.moneyMovementCents}c exceeds the per-transaction cap of ${cfg.financial.maxSingleTransferCents}c.`,
        };
      }
      return null;
    },
  };
}

export function createTurnTransferLimitRule(cfg) {
  return {
    name: 'financial.turn_transfer_limit',
    priority: 11,
    evaluate(request) {
      if (!request.moneyMovementCents) return null;
      if ((request.transfersThisTurn ?? 0) >= cfg.financial.maxTransfersPerTurn) {
        return {
          action: 'deny',
          reasonCode: 'TURN_TRANSFER_LIMIT_EXCEEDED',
          humanMessage: `${request.tool}: already made ${request.transfersThisTurn} money-moving calls this turn (max ${cfg.financial.maxTransfersPerTurn}).`,
        };
      }
      return null;
    },
  };
}

export function createTransferHourlyCapRule(cfg, spendTracker) {
  return {
    name: 'financial.hourly_cap',
    priority: 12,
    evaluate(request) {
      if (!request.moneyMovementCents) return null;
      const spent = spendTracker.sumSince(Date.now() - 60 * 60 * 1000);
      if (spent + request.moneyMovementCents > cfg.financial.maxHourlyCents) {
        return {
          action: 'deny',
          reasonCode: 'HOURLY_CAP_EXCEEDED',
          humanMessage: `${request.tool}: would exceed hourly cap (${spent}c already moved, cap ${cfg.financial.maxHourlyCents}c).`,
        };
      }
      return null;
    },
  };
}

export function createTransferDailyCapRule(cfg, spendTracker) {
  return {
    name: 'financial.daily_cap',
    priority: 13,
    evaluate(request) {
      if (!request.moneyMovementCents) return null;
      const spent = spendTracker.sumSince(Date.now() - 24 * 60 * 60 * 1000);
      if (spent + request.moneyMovementCents > cfg.financial.maxDailyCents) {
        return {
          action: 'deny',
          reasonCode: 'DAILY_CAP_EXCEEDED',
          humanMessage: `${request.tool}: would exceed daily cap (${spent}c already moved, cap ${cfg.financial.maxDailyCents}c).`,
        };
      }
      return null;
    },
  };
}

// THE FIX FOR GAP #1 (upstream): upstream's `require_confirmation` rule set
// `action: "quarantine"`, which the tool executor treated identically to a
// hard deny — it just returned an error string, with no real pause/resume.
// Here, `pending_approval` is a distinct, real state: PolicyEngine surfaces
// it, tools.js writes an actual row to approval_queue.js and returns a
// "queued, waiting on you" result — and a human (never the agent, never a
// heartbeat, never another automaton) approving it via the CLI is the only
// way the original action actually executes. See approval-queue.js.
export function createRequireConfirmationRule(cfg) {
  return {
    name: 'financial.require_confirmation',
    priority: 20,
    evaluate(request) {
      if (!request.moneyMovementCents) return null;
      if (request.moneyMovementCents > cfg.financial.requireConfirmationAboveCents) {
        return {
          action: 'pending_approval',
          reasonCode: 'CONFIRMATION_REQUIRED',
          humanMessage: `${request.tool}: ${request.moneyMovementCents}c exceeds the confirmation threshold (${cfg.financial.requireConfirmationAboveCents}c) — queued for your approval, not executed.`,
        };
      }
      return null;
    },
  };
}

export function financialRules(cfg, spendTracker) {
  return [
    createTransferMaxSingleRule(cfg),
    createTurnTransferLimitRule(cfg),
    createTransferHourlyCapRule(cfg, spendTracker),
    createTransferDailyCapRule(cfg, spendTracker),
    createRequireConfirmationRule(cfg),
  ];
}
