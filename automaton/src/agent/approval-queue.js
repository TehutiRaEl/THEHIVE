// automaton/src/agent/approval-queue.js
//
// THE FIX FOR GAP #1: this is the actual pause/resume state machine that
// upstream's `quarantine` action was supposed to be but never was. When the
// policy engine returns `pending_approval`, the *original* tool call
// (name + full args) is written here as a durable row, and the action is
// NEVER executed until a human explicitly resolves it via resolve().
//
// Compare: upstream's `plan-mode.ts` had the only other "supervised
// approval" concept in the codebase, and it just `throw new Error("awaiting
// human approval")` with no queue, no persistence, no resume — a caught
// exception, not a workflow. This is the finished version of that idea.

import { genId } from '../state/database.js';

export class ApprovalQueue {
  constructor(db) {
    this.db = db;
  }

  /** Enqueue the original request for human review. Never executes it. */
  enqueue(request, decision) {
    const id = genId('appr');
    this.db.prepare(
      `INSERT INTO approval_queue (id, ts, tool, reason_code, request_json, status)
       VALUES (?,?,?,?,?,'pending')`
    ).run(id, Date.now(), request.tool, decision.reasonCode ?? 'UNSPECIFIED', JSON.stringify(request));
    return id;
  }

  list(status = 'pending') {
    return this.db.prepare('SELECT * FROM approval_queue WHERE status = ? ORDER BY ts ASC').all(status);
  }

  get(id) {
    return this.db.prepare('SELECT * FROM approval_queue WHERE id = ?').get(id);
  }

  /**
   * Resolve a pending approval. Only ever called from a `creator`-sourced
   * path (the CLI, or an authenticated founder-facing API) — never from the
   * agent's own reasoning, never from a heartbeat tick. Returns the stored
   * request on approval so the caller can actually dispatch it; the queue
   * itself does not re-invoke tool execution, to keep this module free of a
   * circular dependency on tools.js.
   */
  resolve(id, { approved, decidedBy, note }) {
    const row = this.get(id);
    if (!row) throw new Error(`No approval queue entry ${id}`);
    if (row.status !== 'pending') throw new Error(`Approval ${id} already resolved (${row.status})`);
    const status = approved ? 'approved' : 'rejected';
    this.db.prepare(
      `UPDATE approval_queue SET status = ?, decided_at = ?, decided_by = ?, decision_note = ? WHERE id = ?`
    ).run(status, Date.now(), decidedBy ?? 'creator', note ?? null, id);
    return { ...row, status, request: JSON.parse(row.request_json) };
  }
}
