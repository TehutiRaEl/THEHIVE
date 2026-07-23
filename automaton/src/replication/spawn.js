// automaton/src/replication/spawn.js
//
// Self-replication. Two independent gates, both closing real findings:
//
// 1. Approval is ALWAYS required, regardless of config.replicationAutonomy.
//    A `spawn_child` request always creates a `lineage` row (status
//    'proposed') AND an approval_queue entry — there is no code path that
//    skips the queue. This directly answers the founder's own stated
//    intent ("fully autonomous replication") in the one way that's still
//    responsible to build: the mechanism is complete and real, but a human
//    always makes the actual go/no-go call, because unbounded self-
//    replication with no review is the single hardest thing to walk back
//    once it's running (see the devil's-advocate writeup).
//
// 2. `config.replicationAutonomy` (default false) gates whether an
//    *approved* proposal is even allowed to execute a real spawn — with it
//    off, approving a proposal just marks it 'approved' and stops there
//    (useful for demonstrating and testing the whole approval workflow
//    without ever actually forking a process). Flip it via
//    FLIP_THE_SWITCHES.md §2 when ready to let approved replication run for real.
//
// Replaces upstream's Conway-sandbox-based spawn (new VM, `git clone` of
// `main` from GitHub, separate provisioning flow) with a real, working,
// decoupled mechanism: an actual child Node process (node:child_process),
// running this exact same codebase, with its own state directory and its
// own simulated ledger balance. Fully real and testable in this environment
// — no cloud account, no VM provisioner, no proprietary API required.

import { spawn as spawnProcess } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { constitutionHash } from './genesis.js';

export class Replicator {
  constructor({ db, lineage, approvalQueue, policyEngine, config, repoRoot }) {
    this.db = db;
    this.lineage = lineage;
    this.approvalQueue = approvalQueue;
    this.policyEngine = policyEngine;
    this.config = config;
    this.repoRoot = repoRoot;
  }

  /** Always creates a proposal + approval-queue entry. Never spawns anything itself. */
  proposeSpawn({ genesisPrompt, initialFundingCents, inputSource = 'agent', parentId = null, constitutionText }) {
    const decision = this.policyEngine.evaluate({
      tool: 'spawn_child', inputSource, genesisPrompt,
    });
    if (decision.action === 'deny') {
      return { ok: false, denied: true, reason: decision.humanMessage, reasonCode: decision.reasonCode };
    }

    const hash = constitutionHash(constitutionText);
    const lineageId = this.lineage.createProposed({ parentId, genesisPrompt, constitutionHash: hash });
    const approvalId = this.approvalQueue.enqueue(
      { tool: 'spawn_child', genesisPrompt, initialFundingCents, lineageId, parentId },
      { reasonCode: 'REPLICATION_ALWAYS_REQUIRES_APPROVAL', humanMessage: 'Self-replication always requires explicit founder approval, regardless of any autonomy switch.' }
    );
    return { ok: true, pending: true, lineageId, approvalId };
  }

  /**
   * Called only after approvalQueue.resolve(id, {approved:true}) — i.e. a
   * human said yes. Even then, only actually spawns a process if
   * config.replicationAutonomy is true; otherwise marks 'approved' and stops,
   * which is the honest, provable "the switch is off" behavior.
   */
  async executeApprovedSpawn({ lineageId, genesisPrompt, initialFundingCents }) {
    this.lineage.setStatus(lineageId, 'approved');
    if (!this.config.replicationAutonomy) {
      return {
        ok: true, spawned: false,
        reason: 'Approved, but AUTOMATON_REPLICATION_AUTONOMY is off — no process was actually started. See FLIP_THE_SWITCHES.md §2.',
      };
    }

    const homeDir = path.join(this.repoRoot, '.automaton-home', 'children', lineageId);
    fs.mkdirSync(homeDir, { recursive: true });
    fs.writeFileSync(path.join(homeDir, 'GENESIS.md'), genesisPrompt, 'utf8');

    const child = spawnProcess(process.execPath, [path.join(this.repoRoot, 'src', 'index.js'), '--run'], {
      cwd: this.repoRoot,
      env: {
        ...process.env,
        AUTOMATON_HOME: homeDir,
        AUTOMATON_INITIAL_BALANCE_CENTS: String(initialFundingCents ?? 100),
        AUTOMATON_PARENT_LINEAGE_ID: lineageId,
      },
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    this.lineage.setStatus(lineageId, 'running');
    return { ok: true, spawned: true, pid: child.pid, homeDir };
  }
}
