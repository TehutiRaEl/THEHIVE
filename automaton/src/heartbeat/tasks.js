// automaton/src/heartbeat/tasks.js
//
// Built-in heartbeat tasks. Deliberately small set vs. upstream's 11 —
// covers the load-bearing ones (survival check, agent tick, soul
// reflection) rather than porting every task 1:1; additional tasks are a
// straightforward addition to this array later.

import { survivalTier, tierBehavior } from '../survival/monitor.js';
import { reflectOnSoul } from '../soul/reflection.js';

export function buildTasks({ ledger, fundingMonitor, agentLoop, approvalQueue, soulHomeDir, genesisPrompt, constitutionExcerpt, config }) {
  return [
    {
      name: 'check_survival',
      async run() {
        const balance = ledger.balanceCents();
        const tier = survivalTier(balance, config);
        const result = await fundingMonitor.checkAndEscalate(tier, balance);
        return { tier, balance, ...result };
      },
    },
    {
      name: 'agent_tick',
      async run() {
        const balance = ledger.balanceCents();
        const tier = survivalTier(balance, config);
        if (tier === 'dead') return { skipped: true, reason: 'dead' };
        return agentLoop.runTick({
          soulFrontmatter: { corePurpose: genesisPrompt }, tier, constitutionExcerpt,
        });
      },
    },
    {
      name: 'soul_reflection',
      async run() {
        return reflectOnSoul(soulHomeDir, {}, approvalQueue, genesisPrompt);
      },
    },
  ];
}
