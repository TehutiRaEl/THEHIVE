// automaton/test/helpers.js — shared test wiring, isolated tmp home dir per test file.

import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import { openDatabase } from '../src/state/database.js';
import { buildAllRules } from '../src/agent/policy-rules/index.js';
import { PolicyEngine } from '../src/agent/policy-engine.js';
import { ApprovalQueue } from '../src/agent/approval-queue.js';
import { SpendTracker, ModCounter, LineageCounter } from '../src/agent/spend-tracker.js';
import { Ledger } from '../src/ledger/ledger.js';
import { AuditLog } from '../src/self-mod/audit-log.js';
import { SelfMod } from '../src/self-mod/code.js';
import { Lineage } from '../src/replication/lineage.js';
import { Replicator } from '../src/replication/spawn.js';
import { config as defaultConfig } from '../src/config.js';

export function makeTestContext(overrides = {}) {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'automaton-test-'));
  const config = { ...defaultConfig, ...overrides, homeDir };
  const db = openDatabase(homeDir);
  const spendTracker = new SpendTracker(db);
  const modCounter = new ModCounter(db);
  const lineage = new Lineage(db);
  const lineageCounter = new LineageCounter(db);
  const rules = buildAllRules(config, { spendTracker, modCounter, lineageCounter });
  const policyEngine = new PolicyEngine(rules, db);
  const approvalQueue = new ApprovalQueue(db);
  const ledger = new Ledger(db, policyEngine, approvalQueue);
  const auditLog = new AuditLog(db, homeDir);

  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'automaton-repo-'));
  fs.mkdirSync(path.join(repoRoot, 'src', 'agent', 'policy-rules'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'src', 'agent', 'policy-rules', 'financial.js'), '// real rule file\n');
  fs.writeFileSync(path.join(repoRoot, 'src', 'harmless.js'), '// harmless file\n');

  const selfMod = new SelfMod(db, repoRoot, auditLog);
  const replicator = new Replicator({ db, lineage, approvalQueue, policyEngine, config, repoRoot });

  return { homeDir, repoRoot, config, db, policyEngine, approvalQueue, ledger, auditLog, selfMod, lineage, replicator, spendTracker, modCounter, lineageCounter };
}

export function cleanup(ctx) {
  fs.rmSync(ctx.homeDir, { recursive: true, force: true });
  fs.rmSync(ctx.repoRoot, { recursive: true, force: true });
}
