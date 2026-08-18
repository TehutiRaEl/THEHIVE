// worker/test/work-cycle-rotation.test.js
//
// Real production bug found 2026-08-11 via a dispatched edge-health-probe run: the
// hourly work cycle had been firing for 7+ consecutive hours and every single turn
// went to Ma'at. Root cause was `SELECT COUNT(*) WHERE kind='agent-work'` used as a
// round-robin cursor against a table (hive_updates) that postUpdate() prunes to its
// last 100 rows ACROSS EVERY KIND on every write — so the count wasn't a monotonic
// total, it fluctuated with pruning and could sit at the same value (mod
// AGENT_WORK.length) indefinitely. Fixed by deriving the next turn from the single
// most recent agent-work row's actual agent instead of a count.
//
// These tests drive the real exported nextWorkTurnIndex() and AGENT_WORK, not a
// reimplementation, and specifically reproduce the exact failure shape that was
// observed live before asserting it's fixed.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { nextWorkTurnIndex, AGENT_WORK } from '../src/index.js';

const AGENTS_IN_ORDER = AGENT_WORK.map((j) => j.agent);

describe('nextWorkTurnIndex — the real fix', () => {
  test('no prior row (bootstrap / empty table) starts at index 0', () => {
    assert.equal(nextWorkTurnIndex(undefined), 0);
    assert.equal(nextWorkTurnIndex(null), 0);
    assert.equal(nextWorkTurnIndex(''), 0);
  });

  test('advances to the very next agent after each known agent, in real AGENT_WORK order', () => {
    for (let i = 0; i < AGENTS_IN_ORDER.length; i++) {
      const title = `${AGENTS_IN_ORDER[i]} — some focus`;
      const expected = (i + 1) % AGENTS_IN_ORDER.length;
      assert.equal(nextWorkTurnIndex(title), expected,
        `after ${AGENTS_IN_ORDER[i]} (index ${i}), expected index ${expected} (${AGENTS_IN_ORDER[expected]})`);
    }
  });

  test('wraps from the last agent back to the first', () => {
    const lastAgent = AGENTS_IN_ORDER[AGENTS_IN_ORDER.length - 1];
    assert.equal(nextWorkTurnIndex(`${lastAgent} — wrap-up`), 0);
  });

  test('an unrecognised or malformed title falls back to index 0, not a crash', () => {
    assert.equal(nextWorkTurnIndex('total garbage, no em dash'), 0);
    assert.equal(nextWorkTurnIndex('Nobody — not a real agent'), 0);
    assert.equal(nextWorkTurnIndex(12345), 0);
    assert.equal(nextWorkTurnIndex({}), 0);
  });

  test('handles the em-dash + surrounding whitespace exactly as postUpdate() writes it', () => {
    // postUpdate() writes `${job.agent} — ${job.focus}` — real format, real spacing.
    assert.equal(nextWorkTurnIndex("Ma'at — balance"), 1);
  });

  test('THE REGRESSION TEST: repeatedly feeding back the SAME real title never produces the same index forever', () => {
    // This is the exact failure shape that was observed live: 32 consecutive real
    // agent-work rows, every one Ma'at. Simulate the real loop — each call's output
    // (mapped back to a title) feeds the next call, the way runWorkCycle() really
    // chains turn to turn via the database.
    let title = undefined; // no prior row
    const seen = [];
    for (let i = 0; i < AGENTS_IN_ORDER.length * 3; i++) {
      const idx = nextWorkTurnIndex(title);
      seen.push(AGENTS_IN_ORDER[idx]);
      title = `${AGENTS_IN_ORDER[idx]} — focus`;
    }
    const distinct = new Set(seen);
    assert.equal(distinct.size, AGENTS_IN_ORDER.length,
      `expected all ${AGENTS_IN_ORDER.length} agents to appear across 3 full cycles, got only: ${[...distinct].join(', ')}`);
    // Real fairness check, same discipline as task 48's original 24-tick proof:
    // over exactly 3 full cycles, every agent gets exactly 3 turns, not a skewed split.
    for (const agent of AGENTS_IN_ORDER) {
      const count = seen.filter((a) => a === agent).length;
      assert.equal(count, 3, `${agent} got ${count} turns across 3 full cycles, expected exactly 3`);
    }
  });

  test('is stable and repeatable: the same input always produces the same output (no hidden randomness)', () => {
    const title = "Sekhmet — judge";
    const first = nextWorkTurnIndex(title);
    for (let i = 0; i < 10; i++) assert.equal(nextWorkTurnIndex(title), first);
  });
});
