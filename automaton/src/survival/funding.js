// automaton/src/survival/funding.js
//
// THE FIX FOR A GAP FOUND IN THE REVIEW (§6): upstream's funding-distress
// mechanism was entirely passive — a note written to a local KV table with
// no outbound notification of any kind (no email, no webhook, no message to
// the creator). It "becomes visible" only if someone manually inspects the
// SQLite file. That's not an escalation path, it's a log nobody reads.
//
// This version keeps the local record (for audit/history) but ALSO actively
// pushes an alert every time the survival tier changes for the worse:
//   1. Always: a loud stderr line (visible in any process supervisor's logs).
//   2. Always: a JSON-lines file under the automaton's home dir, so a
//      separate watcher process can tail it.
//   3. If AUTOMATON_ALERT_WEBHOOK_URL is set: a real HTTP POST — e.g. to
//      THEHIVE's own Worker (POST /v11/updates-equivalent) once this
//      automaton is deployed somewhere with network access. Absent that env
//      var, this step is a documented no-op, not a silent failure.

import fs from 'node:fs';
import path from 'node:path';

const TIER_ORDER = ['high', 'normal', 'low_compute', 'critical', 'dead'];

export class FundingMonitor {
  constructor(db, homeDir) {
    this.db = db;
    this.alertPath = path.join(homeDir, 'alerts.jsonl');
  }

  _lastTier() {
    const row = this.db.prepare('SELECT value FROM kv WHERE key = ?').get('survival_last_tier');
    return row?.value ?? null;
  }

  _setLastTier(tier) {
    const now = Date.now();
    this.db.prepare(
      `INSERT INTO kv (key, value, updated_at) VALUES ('survival_last_tier', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).run(tier, now);
  }

  /** Call once per heartbeat tick with the current tier. Escalates on any worsening transition. */
  async checkAndEscalate(tier, balanceCents) {
    const last = this._lastTier();
    const worsened = last && TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(last);
    this._setLastTier(tier);
    if (!worsened) return { escalated: false };

    const alert = {
      ts: new Date().toISOString(),
      kind: 'survival_tier_change',
      from: last,
      to: tier,
      balanceCents,
      message: `Survival tier worsened: ${last} -> ${tier} (balance $${(balanceCents / 100).toFixed(2)}).`,
    };

    console.error(`[automaton:survival] ${alert.message}`);
    try {
      fs.appendFileSync(this.alertPath, JSON.stringify(alert) + '\n');
    } catch { /* best-effort */ }

    const webhookUrl = process.env.AUTOMATON_ALERT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
        return { escalated: true, webhookSent: true };
      } catch (e) {
        console.error(`[automaton:survival] webhook delivery failed: ${e}`);
        return { escalated: true, webhookSent: false, webhookError: String(e) };
      }
    }
    return { escalated: true, webhookSent: false, webhookConfigured: false };
  }
}
