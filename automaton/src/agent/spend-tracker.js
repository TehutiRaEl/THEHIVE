// automaton/src/agent/spend-tracker.js
//
// Windowed sum-since queries over the ledger table, used by every financial
// rate-limit rule. Unlike upstream (where `transfer_credits` queried this
// but `fund_child`/`topup` did not touch it at all), every debit written by
// ledger.js's moveFunds() goes through this same table — there is one ledger,
// not a parallel bookkeeping path per tool.

export class SpendTracker {
  constructor(db) {
    this.db = db;
  }

  /** Sum of debit amounts since `sinceMs` (epoch ms), in cents. */
  sumSince(sinceMs) {
    const row = this.db.prepare(
      `SELECT COALESCE(SUM(amount_cents), 0) AS total FROM ledger WHERE kind = 'debit' AND ts >= ?`
    ).get(sinceMs);
    return row.total;
  }
}

export class ModCounter {
  constructor(db) {
    this.db = db;
  }
  countSince(sinceMs) {
    const row = this.db.prepare(`SELECT COUNT(*) AS n FROM modifications WHERE ts >= ?`).get(sinceMs);
    return row.n;
  }
}

export class LineageCounter {
  constructor(db) {
    this.db = db;
  }
  countActiveChildren() {
    const row = this.db.prepare(
      `SELECT COUNT(*) AS n FROM lineage WHERE status IN ('approved','running')`
    ).get();
    return row.n;
  }
}
