// automaton/src/identity/wallet.js
//
// Upstream generates a REAL Ethereum/Solana keypair on first boot (viem +
// tweetnacl), unencrypted on disk, no human in the loop — see the
// devil's-advocate review, finding #2 under "Identity / Wallet". This
// rebuild's default (config.financialAutonomy === false) never touches a
// real chain or generates a real private key at all: identity is a stable,
// deterministic pseudo-address derived from a random local seed, used only
// to label ledger rows and lineage records. There is no key to steal
// because there is no key.
//
// If FINANCIAL_AUTONOMY is ever flipped on (FLIP_THE_SWITCHES.md §1), this
// module is where a real wallet-adapter would be wired in — deliberately
// NOT shipped here, so flipping that switch requires deliberately writing
// new code, not just changing an env var.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function getOrCreateIdentity(homeDir, config) {
  const p = path.join(homeDir, 'identity.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));

  if (config.financialAutonomy) {
    throw new Error(
      'AUTOMATON_FINANCIAL_AUTONOMY is true, but no real wallet adapter is wired into identity/wallet.js. ' +
      'This is intentional — see FLIP_THE_SWITCHES.md §1. Refusing to fabricate a real-looking identity.'
    );
  }

  const seed = crypto.randomBytes(16).toString('hex');
  const address = 'sim_' + crypto.createHash('sha256').update(seed).digest('hex').slice(0, 40);
  const identity = { address, mode: 'simulated', createdAt: new Date().toISOString() };
  fs.mkdirSync(homeDir, { recursive: true });
  fs.writeFileSync(p, JSON.stringify(identity, null, 2), 'utf8');
  return identity;
}
