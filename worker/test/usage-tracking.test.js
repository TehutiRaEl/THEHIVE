// worker/test/usage-tracking.test.js
//
// Phase 2 usage visibility (2026-08-18): recordProviderHealth() now accumulates
// real running totals (total_calls/total_tokens_in/total_tokens_out) on the SAME
// bounded provider_health row it already upserted, rather than a new growing log
// table — deliberately reusing the discipline task 45's own comment already named
// ("deliberately bounded to exactly N rows forever, regardless of call volume").
//
// The D1 stub in this repo has no real SQLite arithmetic behind it (it's a
// route/argument recorder, not a real database) — so this suite proves the real
// exported recordProviderHealth() issues the correct SQL shape and the correct
// bound values (usage mapped, defaulting to 0 when no usage object exists) rather
// than simulating what a real ON CONFLICT...total_calls+1 would compute. The SQL
// text itself is asserted to contain the real increment expressions, not just a
// plain overwrite — the one place a silent regression (upsert instead of
// increment) could hide undetected otherwise.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { recordProviderHealth } from '../src/index.js';

function stubDB() {
  const queries = [];
  return {
    queries,
    prepare(sql) {
      return {
        bind: (...args) => ({
          run: async () => { queries.push({ sql, args }); return { success: true }; },
        }),
      };
    },
  };
}

describe('recordProviderHealth — real running totals, not a growing log', () => {
  test('issues an INCREMENT expression for total_calls, not a plain overwrite', async () => {
    const DB = stubDB();
    await recordProviderHealth(DB, 'claude', true, null, { in: 10, out: 5 });
    assert.equal(DB.queries.length, 1);
    assert.match(DB.queries[0].sql, /total_calls\s*=\s*total_calls\s*\+\s*1/,
      'a plain upsert here would silently reset the counter to 1 on every real call instead of accumulating');
  });

  test('a successful call with real usage binds the real token counts', async () => {
    const DB = stubDB();
    await recordProviderHealth(DB, 'claude', true, null, { in: 42, out: 17 });
    const [, , , , tokensIn, tokensOut] = DB.queries[0].args;
    assert.equal(tokensIn, 42);
    assert.equal(tokensOut, 17);
  });

  test('no usage object (e.g. Workers AI, which returns none) binds real zeros, never an invented estimate', async () => {
    const DB = stubDB();
    await recordProviderHealth(DB, 'workers-ai', true, null, null);
    const [, , , , tokensIn, tokensOut] = DB.queries[0].args;
    assert.equal(tokensIn, 0);
    assert.equal(tokensOut, 0);
  });

  test('a failed call still counts as a real attempt (total_calls increments) but contributes zero tokens', async () => {
    const DB = stubDB();
    await recordProviderHealth(DB, 'claude', false, 'HTTP 401', null);
    assert.match(DB.queries[0].sql, /total_calls\s*=\s*total_calls\s*\+\s*1/);
    const [provider, ok, , , tokensIn, tokensOut] = DB.queries[0].args;
    assert.equal(provider, 'claude');
    assert.equal(ok, 0);
    assert.equal(tokensIn, 0);
    assert.equal(tokensOut, 0);
  });

  test('a malformed usage object (missing/non-numeric in/out) degrades to zero rather than binding NaN/undefined', async () => {
    const DB = stubDB();
    await recordProviderHealth(DB, 'claude', true, null, { in: 'not-a-number' });
    const [, , , , tokensIn, tokensOut] = DB.queries[0].args;
    assert.equal(tokensIn, 0);
    assert.equal(tokensOut, 0);
  });

  test('a missing DB is a silent no-op, same posture as every other write in this file', async () => {
    await assert.doesNotReject(() => recordProviderHealth(undefined, 'claude', true, null, { in: 1, out: 1 }));
  });
});
