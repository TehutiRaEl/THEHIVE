// automaton/src/ledger/ledger.js
//
// Replaces upstream's src/conway/{client,credits,topup,x402}.js entirely.
// Two structural changes from upstream, both closing real findings from the
// devil's-advocate review:
//
// 1. DECOUPLED FROM CONWAY: no proprietary API, no real on-chain wallet by
//    default. Balance is a row in THIS repo's own SQLite state — genuinely
//    simulated play-money, but real enough to create real survival pressure
//    (see survival/monitor.js). A real backing store can be wired in later
//    (FLIP_THE_SWITCHES.md §1) without changing this module's interface.
//
// 2. ONE DEBIT PATH FOR EVERYTHING: upstream had `transfer_credits` (capped,
//    rate-limited, policy-gated) and `fund_child`/`topup` (NOT policy-gated
//    at all — the exact gap this rebuild exists to close) as separate code
//    paths. Here there is exactly one function, `requestDebit()`, and every
//    money-moving tool (transfer, fund_child, topup-equivalent) calls it.
//    There is no second path to bypass.

import { genId } from '../state/database.js';

const BALANCE_KEY = 'ledger_balance_cents';

export class Ledger {
  constructor(db, policyEngine, approvalQueue) {
    this.db = db;
    this.policyEngine = policyEngine;
    this.approvalQueue = approvalQueue;
    this._ensureBalanceRow();
  }

  _ensureBalanceRow() {
    const row = this.db.prepare('SELECT value FROM kv WHERE key = ?').get(BALANCE_KEY);
    if (!row) {
      // Starting balance: a modest simulated seed, same spirit as upstream's
      // "genesis funding" — enough turns to prove itself before hitting
      // low_compute, never enough to make survival pressure meaningless.
      // A spawned child reads its funding amount from this env var (set by
      // replication/spawn.js at process-launch time); absent that, a fresh
      // top-level automaton gets the default $2.00 seed.
      const seed = parseInt(process.env.AUTOMATON_INITIAL_BALANCE_CENTS || '200', 10);
      this.db.prepare('INSERT INTO kv (key, value, updated_at) VALUES (?,?,?)')
        .run(BALANCE_KEY, String(seed), Date.now());
    }
  }

  balanceCents() {
    const row = this.db.prepare('SELECT value FROM kv WHERE key = ?').get(BALANCE_KEY);
    return parseInt(row.value, 10);
  }

  /** Money coming IN (earnings). Never gated — only outflows are. */
  credit(amountCents, { tool = 'earning', counterparty = null, note = null } = {}) {
    if (amountCents <= 0) throw new Error('credit amount must be positive');
    const after = this.balanceCents() + amountCents;
    this._writeLedgerRow('credit', tool, amountCents, after, counterparty, note);
    this._setBalance(after);
    return { ok: true, balanceAfter: after };
  }

  /**
   * The one debit path. Every money-moving tool calls this — see the module
   * header. Returns one of:
   *   { ok: true,  balanceAfter }                      — executed
   *   { ok: false, denied: true,  reason }              — policy denied
   *   { ok: false, pending: true, approvalId }          — queued, see approval-queue.js
   *   { ok: false, insufficientFunds: true }            — balance too low
   */
  requestDebit({ tool, amountCents, counterparty = null, note = null, inputSource = 'agent', transfersThisTurn = 0 }) {
    if (amountCents <= 0) throw new Error('debit amount must be positive');

    const decision = this.policyEngine.evaluate({
      tool, inputSource, moneyMovementCents: amountCents, transfersThisTurn,
    });

    if (decision.action === 'deny') {
      return { ok: false, denied: true, reason: decision.humanMessage, reasonCode: decision.reasonCode };
    }
    if (decision.action === 'pending_approval') {
      const approvalId = this.approvalQueue.enqueue(
        { tool, amountCents, counterparty, note, inputSource },
        decision
      );
      return { ok: false, pending: true, approvalId, reason: decision.humanMessage };
    }

    return this._executeDebit({ tool, amountCents, counterparty, note });
  }

  /** Called only after a human has approved a queued request. No re-gating. */
  applyApprovedDebit({ tool, amountCents, counterparty = null, note = null }) {
    return this._executeDebit({ tool, amountCents, counterparty, note: `${note ?? ''} [creator-approved]`.trim() });
  }

  _executeDebit({ tool, amountCents, counterparty, note }) {
    const balance = this.balanceCents();
    if (amountCents > balance) {
      return { ok: false, insufficientFunds: true, balance };
    }
    const after = balance - amountCents;
    this._writeLedgerRow('debit', tool, amountCents, after, counterparty, note);
    this._setBalance(after);
    return { ok: true, balanceAfter: after };
  }

  _writeLedgerRow(kind, tool, amountCents, balanceAfter, counterparty, note) {
    this.db.prepare(
      `INSERT INTO ledger (id, ts, kind, tool, amount_cents, balance_after_cents, counterparty, note)
       VALUES (?,?,?,?,?,?,?,?)`
    ).run(genId('ledg'), Date.now(), kind, tool, amountCents, balanceAfter, counterparty, note);
  }

  _setBalance(cents) {
    this.db.prepare('UPDATE kv SET value = ?, updated_at = ? WHERE key = ?').run(String(cents), Date.now(), BALANCE_KEY);
  }

  history(limit = 50) {
    return this.db.prepare('SELECT * FROM ledger ORDER BY ts DESC LIMIT ?').all(limit);
  }
}
