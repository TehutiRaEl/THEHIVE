// automaton/src/replication/genesis.js
//
// Genesis-prompt shape/injection validation. The actual injection-pattern
// check also runs as a policy rule (validation.js) so it's enforced
// regardless of call path; this module additionally builds the constitution
// hash a child must carry, matching upstream's tamper-evidence design.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function constitutionHash(constitutionText) {
  return crypto.createHash('sha256').update(constitutionText).digest('hex');
}

export function readConstitution(repoRoot) {
  // THEHIVE's own constitution governs every automaton spawned from this
  // hive — not a separate three-laws document. See ARCHITECTURE.md.
  const p = path.join(repoRoot, '..', 'soul.md');
  return fs.readFileSync(p, 'utf8');
}

export function buildGenesisConfig({ genesisPrompt, parentId, constitutionText, initialFundingCents }) {
  return {
    genesisPrompt,
    parentId: parentId ?? null,
    constitutionHash: constitutionHash(constitutionText),
    initialFundingCents,
    createdAt: new Date().toISOString(),
  };
}
