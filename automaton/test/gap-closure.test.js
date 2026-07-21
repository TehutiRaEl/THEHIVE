// automaton/test/gap-closure.test.js
//
// Proves each of the five concrete gaps found in the devil's-advocate review
// of Conway-Research/automaton (see
// Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-automaton-devils-advocate-005.md)
// is actually closed in this rebuild — not just documented as fixed.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestContext, cleanup } from './helpers.js';

describe('Gap #1 — "pending_approval" is a real queue, not a soft deny', () => {
  test('a transfer above the confirmation threshold does NOT move money, and is queryable/resolvable', () => {
    const ctx = makeTestContext();
    try {
      ctx.ledger.credit(5000, {});
      const before = ctx.ledger.balanceCents();

      const result = ctx.ledger.requestDebit({ tool: 'transfer_credits', amountCents: 1500, inputSource: 'agent' });
      assert.equal(result.ok, false);
      assert.equal(result.pending, true, 'must be distinguishable from a deny');
      assert.ok(result.approvalId, 'must produce a real, resumable queue entry id');
      assert.equal(ctx.ledger.balanceCents(), before, 'balance must be untouched while pending');

      const pending = ctx.approvalQueue.list('pending');
      assert.equal(pending.length, 1);
      assert.equal(pending[0].id, result.approvalId);

      // Resolving as a human ("creator") is the only way this executes.
      const resolved = ctx.approvalQueue.resolve(result.approvalId, { approved: true, decidedBy: 'creator-test' });
      assert.equal(resolved.status, 'approved');
      const executed = ctx.ledger.applyApprovedDebit(resolved.request);
      assert.equal(executed.ok, true);
      assert.equal(ctx.ledger.balanceCents(), before - 1500);
    } finally { cleanup(ctx); }
  });

  test('rejecting a pending approval never executes it', () => {
    const ctx = makeTestContext();
    try {
      ctx.ledger.credit(5000, {});
      const before = ctx.ledger.balanceCents();
      const result = ctx.ledger.requestDebit({ tool: 'transfer_credits', amountCents: 1500, inputSource: 'agent' });
      ctx.approvalQueue.resolve(result.approvalId, { approved: false, decidedBy: 'creator-test' });
      assert.equal(ctx.ledger.balanceCents(), before, 'a rejected request must never move money');
    } finally { cleanup(ctx); }
  });
});

describe('Gap #2 — fund_child is covered by the SAME caps as transfer_credits', () => {
  test('fund_child above the per-tx cap is denied, exactly like transfer_credits would be', () => {
    const ctx = makeTestContext();
    try {
      ctx.ledger.credit(1_000_000, {}); // huge balance so the half-balance self-preservation check doesn't fire first
      const overCap = ctx.config.financial.maxSingleTransferCents + 100;
      const result = ctx.ledger.requestDebit({ tool: 'fund_child', amountCents: overCap, inputSource: 'agent' });
      assert.equal(result.ok, false);
      assert.equal(result.denied, true);
      assert.equal(result.reasonCode, 'MAX_SINGLE_TRANSFER_EXCEEDED');
    } finally { cleanup(ctx); }
  });

  test('repeated fund_child calls hit the hourly cap, exactly like transfer_credits would', () => {
    const ctx = makeTestContext();
    try {
      ctx.ledger.credit(1_000_000, {});
      // Deliberately UNDER the $10 confirmation threshold so calls execute
      // immediately (isolating the hourly-cap behavior from the separate
      // confirmation-queue behavior already proven in gap #1's tests).
      const each = 900;
      let executedTotal = 0;
      let anyDenied = false;
      for (let i = 0; i < 15; i++) {
        const result = ctx.ledger.requestDebit({ tool: 'fund_child', amountCents: each, inputSource: 'agent' });
        if (result.ok) executedTotal += each;
        if (result.denied) anyDenied = true;
      }
      assert.ok(executedTotal <= ctx.config.financial.maxHourlyCents,
        `executed ${executedTotal} exceeds hourly cap ${ctx.config.financial.maxHourlyCents}`);
      assert.ok(anyDenied, 'fund_child must actually be stoppable by the hourly cap, not silently uncapped like upstream');
    } finally { cleanup(ctx); }
  });

  test('the upstream half-balance self-preservation check still applies on top', () => {
    const ctx = makeTestContext();
    try {
      ctx.ledger.credit(1000, {});
      // This check lives in tools.js (fund_child tool wrapper), not ledger.js directly —
      // verify the ledger-level cap alone would have allowed it, proving the wrapper adds a REAL extra layer.
      const halfPlusOne = 501; // > half of 1000
      const decision = ctx.policyEngine.evaluate({ tool: 'fund_child', inputSource: 'agent', moneyMovementCents: halfPlusOne });
      assert.notEqual(decision.action, 'deny', 'the ledger/policy layer alone should allow this (it is under all caps)');
      // tools.js's fund_child wrapper is what actually blocks it — confirmed in tools.test.js.
    } finally { cleanup(ctx); }
  });
});

describe('Gap #3 — the agent cannot edit its own financial/authority guardrail files', () => {
  test('editing policy-rules/financial.js is blocked, from an ordinary agent-sourced call', () => {
    const ctx = makeTestContext();
    try {
      const result = ctx.selfMod.editFile('src/agent/policy-rules/financial.js', '// tampered', { inputSource: 'agent' });
      assert.equal(result.ok, false);
      assert.equal(result.blocked, true);
    } finally { cleanup(ctx); }
  });

  test('every file in policy-rules/ is protected, not just index.js (the exact upstream gap)', () => {
    const ctx = makeTestContext();
    try {
      const files = ['financial.js', 'authority.js', 'command-safety.js', 'path-protection.js', 'rate-limits.js', 'validation.js', 'index.js'];
      for (const f of files) {
        const result = ctx.selfMod.editFile(`src/agent/policy-rules/${f}`, '// tampered', { inputSource: 'agent' });
        assert.equal(result.ok, false, `${f} should be protected but was editable`);
      }
    } finally { cleanup(ctx); }
  });

  test('a harmless, non-guardrail file CAN be edited (protection is not a blanket lockdown)', () => {
    const ctx = makeTestContext();
    try {
      const result = ctx.selfMod.editFile('src/harmless.js', '// updated content', { inputSource: 'agent' });
      assert.equal(result.ok, true);
    } finally { cleanup(ctx); }
  });

  test('the policy engine ALSO denies edit_own_file on a protected path (defense in depth)', () => {
    const ctx = makeTestContext();
    try {
      const decision = ctx.policyEngine.evaluate({ tool: 'edit_own_file', inputSource: 'agent', targetPath: 'src/agent/policy-rules/authority.js' });
      assert.equal(decision.action, 'deny');
      assert.equal(decision.reasonCode, 'PROTECTED_PATH_WRITE');
    } finally { cleanup(ctx); }
  });
});

describe('Gap #4 — no real wallet / plaintext private key is created by default', () => {
  test('simulated identity has no private key material at all', async () => {
    const ctx = makeTestContext();
    try {
      const { getOrCreateIdentity } = await import('../src/identity/wallet.js');
      const identity = getOrCreateIdentity(ctx.homeDir, ctx.config);
      assert.equal(identity.mode, 'simulated');
      assert.ok(!('privateKey' in identity));
      assert.ok(!('mnemonic' in identity));
    } finally { cleanup(ctx); }
  });

  test('flipping financialAutonomy on without a real wallet adapter fails loudly, not silently', async () => {
    const ctx = makeTestContext({ financialAutonomy: true });
    try {
      const { getOrCreateIdentity } = await import('../src/identity/wallet.js');
      assert.throws(() => getOrCreateIdentity(ctx.homeDir, ctx.config), /no real wallet adapter/);
    } finally { cleanup(ctx); }
  });
});

describe('Gap #5 — replication always requires approval, regardless of the autonomy switch', () => {
  test('spawn_child always creates a lineage + approval-queue entry, never spawns directly', () => {
    const ctx = makeTestContext({ replicationAutonomy: true }); // even with the switch ON
    try {
      const result = ctx.replicator.proposeSpawn({
        genesisPrompt: 'Earn honest value for the hive.', initialFundingCents: 100,
        inputSource: 'agent', constitutionText: 'test constitution text',
      });
      assert.equal(result.ok, true);
      assert.equal(result.pending, true);
      assert.ok(result.lineageId);
      assert.ok(result.approvalId);
      const lineageRow = ctx.lineage.get(result.lineageId);
      assert.equal(lineageRow.status, 'proposed', 'must never be anything other than proposed until a human approves');
    } finally { cleanup(ctx); }
  });

  test('an approved spawn does NOT actually run a process while replicationAutonomy is false', async () => {
    const ctx = makeTestContext({ replicationAutonomy: false });
    try {
      const proposal = ctx.replicator.proposeSpawn({
        genesisPrompt: 'Earn honest value.', initialFundingCents: 100, inputSource: 'agent', constitutionText: 'x',
      });
      ctx.approvalQueue.resolve(proposal.approvalId, { approved: true, decidedBy: 'creator-test' });
      const outcome = await ctx.replicator.executeApprovedSpawn({
        lineageId: proposal.lineageId, genesisPrompt: 'Earn honest value.', initialFundingCents: 100,
      });
      assert.equal(outcome.spawned, false, 'the switch being off must prevent actual process creation even after approval');
    } finally { cleanup(ctx); }
  });

  test('spawn_child from an external/heartbeat source is denied outright (defense in depth)', () => {
    const ctx = makeTestContext();
    try {
      const decision = ctx.policyEngine.evaluate({ tool: 'spawn_child', inputSource: 'heartbeat' });
      assert.equal(decision.action, 'deny');
      assert.equal(decision.reasonCode, 'DANGEROUS_ACTION_FROM_UNATTENDED_SOURCE');
    } finally { cleanup(ctx); }
  });

  test('max children cap is enforced', () => {
    const ctx = makeTestContext({ maxChildren: 1 });
    try {
      ctx.lineage.createProposed({ parentId: null, genesisPrompt: 'p1', constitutionHash: 'h1' });
      ctx.lineage.setStatus(ctx.lineage.all()[0].id, 'running');
      const decision = ctx.policyEngine.evaluate({ tool: 'spawn_child', inputSource: 'agent', genesisPrompt: 'p2' });
      assert.equal(decision.action, 'deny');
      assert.equal(decision.reasonCode, 'MAX_CHILDREN_EXCEEDED');
    } finally { cleanup(ctx); }
  });
});
