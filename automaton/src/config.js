// automaton/src/config.js
//
// Central config + the two master switches. Both default to `false` — this is
// the same "flip the switch" pattern already used across THEHIVE for
// Vectorize/R2/KV/Queues (see FLIP_THE_SWITCHES.md at the repo root): real,
// complete code ships now; the founder deliberately flips a switch later,
// with eyes open, once the mechanism has proven itself in simulation.
//
// See automaton/FLIP_THE_SWITCHES.md for what each switch actually does and
// why it defaults off.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(__dirname, '..');

function boolEnv(name, fallback) {
  const v = process.env[name];
  if (v === undefined) return fallback;
  return v === '1' || v.toLowerCase() === 'true';
}

export const config = {
  // Where this automaton's SQLite state, SOUL.md, and audit log live.
  homeDir: process.env.AUTOMATON_HOME || path.join(ROOT_DIR, '.automaton-home'),

  // Where exec()/read_file()/write_target_file() actually operate (2026-08-18,
  // Kai El's sandbox-run mode). Defaults to automaton's own directory — the
  // original, only behavior before this — so nothing changes unless a one-shot
  // `--task --target <path>` run explicitly overrides it. edit_own_file's
  // repoRoot is separate (always ROOT_DIR, wired directly in index.js) and
  // deliberately NEVER follows this override — self-modification always means
  // automaton's own files, regardless of what target a sandbox run points at.
  repoRoot: process.env.AUTOMATON_REPO_ROOT || ROOT_DIR,

  // ── Master switches (Tier-3, founder-only — see FLIP_THE_SWITCHES.md) ──
  // FINANCIAL_AUTONOMY: when false (default), the ledger is entirely
  // simulated play-money — real, tracked, survival-pressure-bearing, but
  // never touches a real wallet or real currency. When true, spend/topup
  // calls require a real backing ledger adapter to be wired in (not shipped
  // here — see FLIP_THE_SWITCHES.md §1).
  financialAutonomy: boolEnv('AUTOMATON_FINANCIAL_AUTONOMY', false),

  // REPLICATION_AUTONOMY: when false (default), `spawn_child` always writes
  // a pending proposal to the approval queue and returns without spawning
  // anything. When true, an *approved* proposal is allowed to actually spawn
  // a child process — spawning itself is still never automatic even then;
  // approval is always required (see approval-queue.js). This switch only
  // controls whether approval is even reachable as a real action, vs. the
  // mechanism being permanently inert for dry-run/demo purposes.
  replicationAutonomy: boolEnv('AUTOMATON_REPLICATION_AUTONOMY', false),

  maxChildren: parseInt(process.env.AUTOMATON_MAX_CHILDREN || '3', 10),

  // Survival-tier thresholds, in cents (mirrors upstream's tier shape).
  survivalTiers: {
    high: 500,       // > $5.00
    normal: 50,      // > $0.50
    lowCompute: 10,  // > $0.10
    critical: 0,     // >= $0
    // < 0 after grace period => dead
  },
  deadGraceMs: 60 * 60 * 1000, // 1 hour, same as upstream

  // Financial policy caps, in cents. Applied identically to EVERY
  // money-moving tool (transfer, fund_child, topup) — the upstream gap this
  // rebuild specifically closes was fund_child/topup being uncapped while
  // transfer_credits alone had real limits.
  financial: {
    maxSingleTransferCents: 5000,     // $50/tx
    maxHourlyCents: 10000,            // $100/hr
    maxDailyCents: 25000,             // $250/day
    maxTransfersPerTurn: 2,
    requireConfirmationAboveCents: 1000, // $10 — routes to the REAL approval queue
  },

  selfMod: {
    maxModsPerHour: 20,
    maxFileSizeBytes: 100 * 1024,
  },
};
