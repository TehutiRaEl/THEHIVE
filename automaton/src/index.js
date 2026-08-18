#!/usr/bin/env node
// automaton/src/index.js — entrypoint.
//
// Usage:
//   node src/index.js --run          run the heartbeat loop continuously
//   node src/index.js --selfcheck     one full tick, then exit (used by CI/tests)
//   node src/index.js --approvals     list pending approval-queue entries
//   node src/index.js --approve <id>  approve a pending entry (creator-sourced)
//   node src/index.js --reject <id>   reject a pending entry
//   node src/index.js --task "<text>" one bounded ReAct run (up to maxTurns
//                                      cycles) against a real task, then exit
//                                      (Kai El's sandbox-run mode,
//                                      2026-08-18) — set AUTOMATON_HOME to a
//                                      fresh temp dir and AUTOMATON_REPO_ROOT to
//                                      the target checkout BEFORE invoking this,
//                                      since both are read once at config.js's
//                                      module-load time, not from a CLI flag.
//                                      inputSource is always 'creator-cli' —
//                                      write_target_file's authority rule
//                                      requires exactly that, never an
//                                      unattended trigger.
//   node src/index.js --help

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { config, ROOT_DIR } from './config.js';
import { openDatabase } from './state/database.js';
import { buildAllRules } from './agent/policy-rules/index.js';
import { PolicyEngine } from './agent/policy-engine.js';
import { ApprovalQueue } from './agent/approval-queue.js';
import { SpendTracker, ModCounter, LineageCounter } from './agent/spend-tracker.js';
import { Ledger } from './ledger/ledger.js';
import { AuditLog } from './self-mod/audit-log.js';
import { SelfMod } from './self-mod/code.js';
import { Lineage } from './replication/lineage.js';
import { Replicator } from './replication/spawn.js';
import { FundingMonitor } from './survival/funding.js';
import { Router } from './inference/provider.js';
import { createTheHiveProvider } from './inference/thehive-provider.js';
import { createSimulateProvider } from './inference/simulate-provider.js';
import { AgentLoop } from './agent/loop.js';
import { buildToolRegistry } from './agent/tools.js';
import { initSoul, readSoul } from './soul/model.js';
import { readConstitution } from './replication/genesis.js';
import { runOnce, startLoop } from './heartbeat/scheduler.js';
import { buildTasks } from './heartbeat/tasks.js';
import { survivalTier, tierBehavior } from './survival/monitor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function wireEverything() {
  const db = openDatabase(config.homeDir);
  const spendTracker = new SpendTracker(db);
  const modCounter = new ModCounter(db);
  const lineage = new Lineage(db);
  const lineageCounter = new LineageCounter(db);

  const rules = buildAllRules(config, { spendTracker, modCounter, lineageCounter });
  const policyEngine = new PolicyEngine(rules, db);
  const approvalQueue = new ApprovalQueue(db);
  const ledger = new Ledger(db, policyEngine, approvalQueue);
  const auditLog = new AuditLog(db, config.homeDir);
  const selfMod = new SelfMod(db, ROOT_DIR, auditLog);
  const fundingMonitor = new FundingMonitor(db, config.homeDir);

  const replicator = new Replicator({ db, lineage, approvalQueue, policyEngine, config, repoRoot: ROOT_DIR });

  const router = new Router([createTheHiveProvider(), createSimulateProvider()]);
  const turnState = { transfersThisTurn: 0 };
  // exec/read_file/write_target_file operate against config.repoRoot (defaults
  // to ROOT_DIR, overridable via AUTOMATON_REPO_ROOT for a sandbox-run — see
  // config.js). edit_own_file's own repoRoot stays hardcoded to ROOT_DIR above
  // (selfMod, line ~52) on purpose — self-modification never follows this.
  const tools = buildToolRegistry({ policyEngine, ledger, selfMod, replicator, lineage, repoRoot: config.repoRoot, turnState });
  const agentLoop = new AgentLoop({ router, tools, ledger });

  let genesisPrompt = process.env.AUTOMATON_GENESIS_PROMPT || 'Create genuine value for THEHIVE and its founder through honest work.';
  let constitutionExcerpt = 'See soul.md at the THEHIVE repo root — this automaton is governed by that constitution, not a separate law.';
  try { constitutionExcerpt = readConstitution(ROOT_DIR).split('\n').slice(0, 20).join('\n'); } catch { /* fine, use fallback */ }

  initSoul(config.homeDir, genesisPrompt);

  const tasks = buildTasks({
    ledger, fundingMonitor, agentLoop, approvalQueue,
    soulHomeDir: config.homeDir, genesisPrompt, constitutionExcerpt, config,
  });

  // agentLoop/genesisPrompt/constitutionExcerpt added to the returned context
  // 2026-08-18 for the new --task one-shot mode below — every other existing
  // caller of wireEverything() already ignores extra keys it doesn't ask for.
  return { db, ledger, approvalQueue, auditLog, lineage, replicator, tasks, config, agentLoop, genesisPrompt, constitutionExcerpt };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`automaton (THEHIVE rebuild) — see automaton/README.md and ARCHITECTURE.md
  --run          run the heartbeat loop continuously
  --selfcheck    one full tick, then exit
  --approvals    list pending approval-queue entries
  --approve <id> approve a pending entry
  --reject <id>  reject a pending entry
  --task <text>  one bounded ReAct run (up to maxTurns cycles), then exit
                 (set AUTOMATON_HOME + AUTOMATON_REPO_ROOT first — see header)
  --status       print ledger balance + survival tier + switch states`);
    return;
  }

  const ctx = wireEverything();

  if (args.includes('--status')) {
    const balance = ctx.ledger.balanceCents();
    const tier = survivalTier(balance, ctx.config);
    console.log(JSON.stringify({
      balanceCents: balance, tier,
      financialAutonomy: ctx.config.financialAutonomy,
      replicationAutonomy: ctx.config.replicationAutonomy,
      pendingApprovals: ctx.approvalQueue.list('pending').length,
      activeChildren: ctx.lineage.activeChildren().length,
    }, null, 2));
    return;
  }

  if (args.includes('--approvals')) {
    console.log(JSON.stringify(ctx.approvalQueue.list('pending'), null, 2));
    return;
  }

  const approveIdx = args.indexOf('--approve');
  if (approveIdx !== -1) {
    const id = args[approveIdx + 1];
    const resolved = ctx.approvalQueue.resolve(id, { approved: true, decidedBy: 'creator-cli' });
    console.log(`Approved ${id}.`);
    if (resolved.request.tool === 'spawn_child') {
      const outcome = await ctx.replicator.executeApprovedSpawn({
        lineageId: resolved.request.lineageId,
        genesisPrompt: resolved.request.genesisPrompt,
        initialFundingCents: resolved.request.initialFundingCents,
      });
      console.log(JSON.stringify(outcome, null, 2));
    } else if (resolved.request.amountCents) {
      const outcome = ctx.ledger.applyApprovedDebit(resolved.request);
      console.log(JSON.stringify(outcome, null, 2));
    }
    return;
  }

  const rejectIdx = args.indexOf('--reject');
  if (rejectIdx !== -1) {
    const id = args[rejectIdx + 1];
    ctx.approvalQueue.resolve(id, { approved: false, decidedBy: 'creator-cli' });
    console.log(`Rejected ${id}.`);
    return;
  }

  if (args.includes('--selfcheck')) {
    const results = await runOnce(ctx.tasks);
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const taskIdx = args.indexOf('--task');
  if (taskIdx !== -1) {
    const task = args[taskIdx + 1];
    if (!task) { console.error('--task requires a text argument'); process.exit(1); }
    // 'creator-cli' — the same inputSource --approve/--reject already use —
    // is deliberate: write_target_file's authority rule
    // (policy-rules/authority.js's createTargetWriteFromExternalRule) denies
    // 'external'/'heartbeat'/undefined outright, so a real sandbox-run
    // dispatch must be able to prove it's a genuine creator/dispatch-
    // initiated call, not an unattended trigger, before any real write can
    // happen at all.
    const result = await ctx.agentLoop.runTick({
      soulFrontmatter: { corePurpose: ctx.genesisPrompt },
      tier: 'normal',
      constitutionExcerpt: ctx.constitutionExcerpt,
      inputSource: 'creator-cli',
      task,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (args.includes('--run')) {
    console.log('automaton starting heartbeat loop (Ctrl+C to stop)...');
    const balance = ctx.ledger.balanceCents();
    const tier = survivalTier(balance, ctx.config);
    const { heartbeatIntervalMs } = tierBehavior(tier);
    startLoop(ctx.tasks, heartbeatIntervalMs || 15 * 60 * 1000, (results) => {
      console.log(`[${new Date().toISOString()}] tick:`, JSON.stringify(results));
    });
    return;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
