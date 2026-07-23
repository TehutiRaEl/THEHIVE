// automaton/src/agent/tools.js
//
// The tool registry. Every tool call is dispatched through here — this is
// the ONE place `pending_approval` vs `deny` vs `allow` gets translated into
// what the agent actually sees. THE FIX FOR GAP #1 lives specifically in
// how `pending_approval` is handled below: unlike upstream (which returned
// the exact same error-string shape for both `deny` and `quarantine`), this
// distinguishes them — an agent gets told plainly that its request is
// queued for a human, not that it was refused outright.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function buildToolRegistry({ policyEngine, ledger, selfMod, replicator, lineage, repoRoot, turnState }) {
  function checkPolicy(request) {
    return policyEngine.evaluate({ ...request, transfersThisTurn: turnState.transfersThisTurn });
  }

  function toolResult(decision, okPayload) {
    if (decision.action === 'deny') {
      return { ok: false, blocked: true, reasonCode: decision.reasonCode, message: decision.humanMessage };
    }
    if (decision.action === 'pending_approval') {
      return { ok: false, pending: true, reasonCode: decision.reasonCode, message: decision.humanMessage };
    }
    return { ok: true, ...okPayload };
  }

  return {
    async exec({ command }, { inputSource = 'agent' } = {}) {
      const decision = checkPolicy({ tool: 'exec', inputSource, command });
      if (decision.action !== 'allow') return toolResult(decision);
      try {
        const output = execSync(command, { cwd: repoRoot, timeout: 15000, encoding: 'utf8', maxBuffer: 1024 * 1024 });
        return { ok: true, output };
      } catch (e) {
        return { ok: false, error: String(e.message || e) };
      }
    },

    async read_file({ targetPath }, { inputSource = 'agent' } = {}) {
      const decision = checkPolicy({ tool: 'read_file', inputSource, targetPath });
      if (decision.action !== 'allow') return toolResult(decision);
      const full = path.resolve(repoRoot, targetPath);
      if (!full.startsWith(path.resolve(repoRoot))) return { ok: false, error: 'path traversal outside repo root' };
      if (!fs.existsSync(full)) return { ok: false, error: 'not found' };
      return { ok: true, content: fs.readFileSync(full, 'utf8').slice(0, 50_000) };
    },

    async edit_own_file({ targetPath, content }, { inputSource = 'agent' } = {}) {
      const decision = checkPolicy({
        tool: 'edit_own_file', inputSource, targetPath, contentBytes: Buffer.byteLength(content, 'utf8'),
      });
      if (decision.action !== 'allow') return toolResult(decision);
      const result = selfMod.editFile(targetPath, content, { inputSource });
      return result.ok ? { ok: true, ...result } : { ok: false, blocked: true, message: result.reason };
    },

    /** The single money-out path — see ledger.js's module header. */
    async transfer_credits({ amountCents, counterparty, note }, { inputSource = 'agent' } = {}) {
      const result = ledger.requestDebit({
        tool: 'transfer_credits', amountCents, counterparty, note, inputSource,
        transfersThisTurn: turnState.transfersThisTurn,
      });
      if (result.ok) turnState.transfersThisTurn += 1;
      return result;
    },

    /**
     * Self-replication funding. Goes through the exact same ledger.requestDebit
     * path as transfer_credits (THE FIX FOR GAP #2) — meaning it now inherits
     * every hourly/daily/per-tx cap. The upstream "never more than half your
     * balance" self-preservation check is kept as an ADDITIONAL guard on top,
     * not a replacement for real rate limits.
     */
    async fund_child({ amountCents, childId, note }, { inputSource = 'agent' } = {}) {
      const balance = ledger.balanceCents();
      if (amountCents > balance / 2) {
        return { ok: false, blocked: true, message: 'Cannot transfer more than half current balance to a child (self-preservation).' };
      }
      const result = ledger.requestDebit({
        tool: 'fund_child', amountCents, counterparty: childId, note, inputSource,
        transfersThisTurn: turnState.transfersThisTurn,
      });
      if (result.ok) turnState.transfersThisTurn += 1;
      return result;
    },

    /** Always proposal-only — see replication/spawn.js's module header. */
    async spawn_child({ genesisPrompt, initialFundingCents, constitutionText }, { inputSource = 'agent' } = {}) {
      return replicator.proposeSpawn({ genesisPrompt, initialFundingCents, inputSource, constitutionText });
    },
  };
}
