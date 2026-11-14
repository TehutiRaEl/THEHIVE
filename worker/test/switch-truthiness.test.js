// worker/test/switch-truthiness.test.js
//
// Q-012 (founder decision 2026-11-13: FIX IT NOW + TEST ALL SIX SWITCHES).
//
// The switch-9 truthiness bug: queenDecide() read QUEEN_AUTONOMOUS_APPROVAL
// with bare truthiness — `if (env.QUEEN_AUTONOMOUS_APPROVAL)` — so a
// dashboard plain-text variable set to the string "off" is truthy and would
// SILENTLY ENABLE auto-approve. The same bare truthiness leaked into the
// /v11/nanuet/autonomy report (`switchOn(env, k) || !!env?.[k]`), so a var set
// to "off" reported as on there too.
//
// Both sites now read through switchOn(), the fail-closed strict reader every
// other switch already used: only an explicit affirmative value ("on", "true",
// "1", "yes", or boolean true) counts as ON; "off", empty, or anything else
// counts as OFF.
//
// These tests prove, for EACH switch, that "off" means off and "on" means on:
//   - the six NANUET switches, via nanuetAutonomyState() and via the live
//     GET /v11/nanuet/autonomy route;
//   - switch 9 (QUEEN_AUTONOMOUS_APPROVAL), via queenDecide() itself — the
//     gate must stay closed for every off-ish value and open for every
//     on-ish value.
//
// The queenDecide gate-closed tests and the pre_existing "off" route test are
// the ones that FAIL on the old code: with "off", the old gate opens,
// queenReview() runs, generate() calls fetch, and the recording stub sees the
// call (qScore becomes 50 instead of staying null); and the old report
// returned true for a var set to "off". On the fixed code the gate never
// opens, fetch is never called, and the report says false.
//
// Style note: node:test, zero dependencies, same stub shapes as
// verdict-invariance.test.js (stubClaudeScore / stubFetchGuard) and
// nanuet-brain.test.js (stubCtx / req / makeEnv from helpers/env.js).

import { test, describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { installCaches, stubCtx, req, makeEnv, stubDB } from './helpers/env.js';
import {
  queenDecide,
  switchOn,
  NANUET_SWITCHES,
  nanuetAutonomyState,
} from '../src/index.js';

let restoreCaches;
before(() => { restoreCaches = installCaches(); });
after(() => { restoreCaches(); });

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

// Values that must read as OFF, and values that must read as ON. "off" is
// first in the OFF list because it is the exact value the bug misread.
const OFF_VALUES = ['off', 'false', '0', 'no', '', 'OFF', ' Off ', 'disabled', 'maybe'];
const ON_VALUES = ['on', 'true', '1', 'yes', 'ON', ' On ', true];

const VISION_TEXT =
  'Grow honestly into a self-governing system that helps the founder build ' +
  'real, lawful value. Never claim a capability it does not have. Never act ' +
  'without the founder\'s real consent on anything irreversible.';
const DECIDE_URL = 'https://thehive.sovereignhive.workers.dev/v11/nanuet/route';

// Recording Claude stub: answers with the canned score text AND records every
// call, so a test can prove generate() was (or was not) reached at all. A
// guard that merely throws would be swallowed by queenReview()'s catch (it
// returns null on any error), so a throw cannot prove the gate opened — only
// the call count can.
function stubClaudeScoreRecording(scoreText) {
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return {
      ok: true, status: 200,
      json: async () => ({
        content: [{ text: scoreText }],
        usage: { input_tokens: 10, output_tokens: 5 },
      }),
      text: async () => scoreText,
    };
  };
  return { calls };
}

function decideEnv(extra = {}) {
  return {
    DB: stubDB(),
    ANTHROPIC_API_KEY: 'k',
    ASSETS: { fetch: async () => ({ ok: true, text: async () => VISION_TEXT }) },
    ...extra,
  };
}

describe('switchOn() — the strict reader', () => {
  test('a missing key reads OFF', () => {
    assert.equal(switchOn({}, 'K'), false);
    assert.equal(switchOn(undefined, 'K'), false);
    assert.equal(switchOn(null, 'K'), false);
  });

  test('every off-ish value reads OFF, including the exact string "off"', () => {
    for (const v of OFF_VALUES) {
      assert.equal(switchOn({ K: v }, 'K'), false, `${JSON.stringify(v)} must read OFF`);
    }
  });

  test('every on-ish value reads ON', () => {
    for (const v of ON_VALUES) {
      assert.equal(switchOn({ K: v }, 'K'), true, `${JSON.stringify(v)} must read ON`);
    }
  });
});

describe('the six NANUET switches — nanuetAutonomyState()', () => {
  test('all six "off" means all six OFF', () => {
    const env = {};
    for (const k of NANUET_SWITCHES) env[k] = 'off';
    const state = nanuetAutonomyState(env);
    assert.deepEqual(Object.keys(state).sort(), [...NANUET_SWITCHES].sort());
    for (const k of NANUET_SWITCHES) assert.equal(state[k], false, `${k} must be OFF`);
  });

  test('all six "on" means all six ON', () => {
    const env = {};
    for (const k of NANUET_SWITCHES) env[k] = 'on';
    const state = nanuetAutonomyState(env);
    for (const k of NANUET_SWITCHES) assert.equal(state[k], true, `${k} must be ON`);
  });

  test('each switch, each off-ish value: OFF', () => {
    for (const k of NANUET_SWITCHES) {
      for (const v of OFF_VALUES) {
        const state = nanuetAutonomyState({ [k]: v });
        assert.equal(state[k], false, `${k}=${JSON.stringify(v)} must read OFF`);
      }
    }
  });

  test('each switch, each on-ish value: ON', () => {
    for (const k of NANUET_SWITCHES) {
      for (const v of ON_VALUES) {
        const state = nanuetAutonomyState({ [k]: v });
        assert.equal(state[k], true, `${k}=${JSON.stringify(v)} must read ON`);
      }
    }
  });

  test('unset switches read OFF', () => {
    const state = nanuetAutonomyState({});
    for (const k of NANUET_SWITCHES) assert.equal(state[k], false, `${k} unset must be OFF`);
  });
});

describe('GET /v11/nanuet/autonomy — the ladder reports strict states', () => {
  test('all six "off" reports every switch off and nothing enabled', async () => {
    const env = {};
    for (const k of NANUET_SWITCHES) env[k] = 'off';
    const res = await worker.fetch(req('/nanuet/autonomy'), makeEnv(env), stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.deepEqual(b.enabled_now, []);
    for (const k of NANUET_SWITCHES) assert.equal(b.switches[k], false, `${k} must report OFF`);
  });

  test('all six "on" reports every switch on and all enabled', async () => {
    const env = {};
    for (const k of NANUET_SWITCHES) env[k] = 'on';
    const res = await worker.fetch(req('/nanuet/autonomy'), makeEnv(env), stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.deepEqual([...b.enabled_now].sort(), [...NANUET_SWITCHES].sort());
    for (const k of NANUET_SWITCHES) assert.equal(b.switches[k], true, `${k} must report ON`);
  });

  test('switch 9 set to "off" reports pre_existing OFF (the old code reported ON)', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), makeEnv({ QUEEN_AUTONOMOUS_APPROVAL: 'off' }), stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.pre_existing.QUEEN_AUTONOMOUS_APPROVAL, false, '"off" must report OFF, not ON');
  });

  test('switch 9 set to "on" reports pre_existing ON', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), makeEnv({ QUEEN_AUTONOMOUS_APPROVAL: 'on' }), stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.pre_existing.QUEEN_AUTONOMOUS_APPROVAL, true);
  });

  test('switch 9 unset reports pre_existing OFF', async () => {
    const res = await worker.fetch(req('/nanuet/autonomy'), makeEnv({}), stubCtx());
    assert.equal(res.status, 200);
    const b = await res.json();
    assert.equal(b.pre_existing.QUEEN_AUTONOMOUS_APPROVAL, false);
  });
});

describe('queenDecide() — the switch-9 gate (Q-012)', () => {
  test('every off-ish value keeps the gate CLOSED: no review, no fetch call', async () => {
    for (const v of OFF_VALUES) {
      const rec = stubClaudeScoreRecording('SCORE: 50\nREASON: Serves the vision.');
      const res = await queenDecide(decideEnv({ QUEEN_AUTONOMOUS_APPROVAL: v }), DECIDE_URL, { title: 'Test proposal', body: 'Test body.' });
      assert.equal(res.qStatus, 'pending', `${JSON.stringify(v)}: qStatus must stay pending`);
      assert.equal(res.qScore, null, `${JSON.stringify(v)}: qScore must stay null (no review ran)`);
      assert.equal(rec.calls.length, 0, `${JSON.stringify(v)}: generate() must never be called (gate closed)`);
    }
  });

  test('an unset switch 9 keeps the gate CLOSED', async () => {
    const rec = stubClaudeScoreRecording('SCORE: 50\nREASON: Serves the vision.');
    const env = decideEnv();
    delete env.QUEEN_AUTONOMOUS_APPROVAL;
    const res = await queenDecide(env, DECIDE_URL, { title: 'Test proposal', body: 'Test body.' });
    assert.equal(res.qStatus, 'pending');
    assert.equal(res.qScore, null);
    assert.equal(rec.calls.length, 0, 'generate() must never be called (gate closed)');
  });

  test('every on-ish value OPENS the gate: the review runs and scores', async () => {
    for (const v of ON_VALUES) {
      const rec = stubClaudeScoreRecording('SCORE: 50\nREASON: Serves the vision.');
      const res = await queenDecide(decideEnv({ QUEEN_AUTONOMOUS_APPROVAL: v }), DECIDE_URL, { title: 'Test proposal', body: 'Test body.' });
      assert.equal(res.qScore, 50, `${JSON.stringify(v)}: the review must run and score`);
      assert.equal(res.qStatus, 'pending', `${JSON.stringify(v)}: score 50 is below the 98 threshold, so it stays pending`);
      assert.ok(rec.calls.length > 0, `${JSON.stringify(v)}: generate() must be called (gate open)`);
    }
  });
});
