// automaton/src/soul/reflection.js
//
// Periodic self-reflection on SOUL.md. Upstream auto-applied changes to
// `capabilities`/`relationships`/`financialCharacter` with no review, and
// only ever *suggested* (never gated) a `corePurpose` rewrite — meaning the
// one field that defines what the automaton is FOR could, in principle,
// drift silently over many small "suggested" nudges an operator never
// actually approved one-by-one.
//
// This version keeps auto-updating the low-stakes descriptive fields
// (capabilities/relationships/financialCharacter — these are observations
// about what already happened, not decisions), but ANY change to
// `corePurpose` itself always goes through the approval queue, full stop —
// never auto-applied, never merely "suggested" in a log nobody reads.

import { readSoul, writeSoul } from './model.js';

function jaccardSimilarity(a, b) {
  const setA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const setB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = new Set([...setA].filter((w) => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 1 : intersection.size / union.size;
}

export function genesisAlignment(currentPurpose, genesisPrompt) {
  return jaccardSimilarity(currentPurpose, genesisPrompt);
}

export function reflectOnSoul(homeDir, { recentToolCalls = [], recentInboxSenders = [], recentTransactions = [] }, approvalQueue, genesisPrompt) {
  const soul = readSoul(homeDir);
  if (!soul) return { updated: false, reason: 'no SOUL.md yet' };
  const { frontmatter, body } = soul;

  // Auto-applied: observational, not a decision about identity.
  frontmatter.capabilities = [...new Set([...(frontmatter.capabilities ?? []), ...recentToolCalls])].slice(-50);
  frontmatter.relationships = [...new Set([...(frontmatter.relationships ?? []), ...recentInboxSenders])].slice(-50);
  if (recentTransactions.length) {
    frontmatter.financialCharacter = frontmatter.financialCharacter ?? { earned: 0, spent: 0, notableTransactions: [] };
    frontmatter.financialCharacter.notableTransactions = [
      ...(frontmatter.financialCharacter.notableTransactions ?? []), ...recentTransactions,
    ].slice(-20);
  }
  frontmatter.updatedAt = new Date().toISOString();
  writeSoul(homeDir, frontmatter, body);

  // Never auto-applied: queue for approval instead of silently suggesting.
  const alignment = genesisAlignment(frontmatter.corePurpose, genesisPrompt);
  let corePurposeQueued = false;
  if (alignment < 0.5) {
    approvalQueue.enqueue(
      { tool: 'update_soul_core_purpose', currentPurpose: frontmatter.corePurpose, genesisPrompt, alignment },
      { reasonCode: 'CORE_PURPOSE_DRIFT', humanMessage: `Genesis alignment dropped to ${alignment.toFixed(2)} — corePurpose rewrite requires your review, not auto-applied.` }
    );
    corePurposeQueued = true;
  }

  return { updated: true, alignment, corePurposeQueued };
}
