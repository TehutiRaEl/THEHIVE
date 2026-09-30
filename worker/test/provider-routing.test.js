// worker/test/provider-routing.test.js
//
// Proves providerOrder() — the real coordination layer (task 52) — actually decides
// the provider attempt order from (a) the calling job's preferred provider role and
// (b) real recorded provider health (task 45), rather than always running the fixed
// Claude → Groq → Mistral → Workers AI waterfall.
//
// The scenario that matters most is task 45's real production failure: Claude bound
// but returning 401 on every call, while /llm/status, the Command Center, and Kai El
// all still reported "Claude" as active. A dead provider must be tried LAST, and must
// come back on its own once it recovers.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, PROVIDER_RETRY_AFTER_MS, providerOrder } from '../src/index.js';

// Must match PROVIDERS order in worker/src/index.js (deepseek + kimi are first-class).
const ALL = ['claude', 'groq', 'mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai'];
const MIN = 60 * 1000;
// Health rows as D1 really returns them: ok is an INTEGER 0/1, not a boolean.
const failedAgo = (msAgo, error = 'HTTP 401: invalid x-api-key') =>
  ({ ok: 0, error, checked_at: new Date(Date.now() - msAgo).toISOString() });
const okAgo = (msAgo) =>
  ({ ok: 1, error: null, checked_at: new Date(Date.now() - msAgo).toISOString() });

describe('the documented waterfall is still the default', () => {
  test('no preference and no health data returns the original order', () => {
    assert.deepEqual(providerOrder({}, {}), ALL);
  });

  test('called with no options at all does not throw', () => {
    assert.deepEqual(providerOrder({}), ALL);
  });

  test('a healthy provider is never deprioritised', () => {
    assert.deepEqual(providerOrder({}, { health: { claude: okAgo(MIN) } }), ALL);
  });
});

describe('preference routing — the roles the UI always displayed but never enforced', () => {
  test("prefer 'speed' really puts Groq first", () => {
    assert.deepEqual(providerOrder({}, { prefer: 'speed' }),
      ['groq', 'claude', 'mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai']);
  });

  test("prefer 'reasoning' keeps Claude first and the rest stable", () => {
    assert.deepEqual(providerOrder({}, { prefer: 'reasoning' }), ALL);
  });

  test("prefer 'local' matches Mistral on a partial role match", () => {
    assert.deepEqual(providerOrder({}, { prefer: 'local' }),
      ['mistral', 'claude', 'groq', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai']);
  });

  test('a provider id works as a preference too, not just a role word', () => {
    assert.deepEqual(providerOrder({}, { prefer: 'mistral' }),
      ['mistral', 'claude', 'groq', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai']);
  });

  test("prefer 'open-source' matches OpenRouter — the founder's non-Claude-only lever", () => {
    assert.deepEqual(providerOrder({}, { prefer: 'open-source' }),
      ['openrouter', 'claude', 'groq', 'mistral', 'openai', 'deepseek', 'kimi', 'workers-ai']);
  });

  test('every role named in PROVIDERS resolves to its own provider', () => {
    // Guards against a role being renamed in PROVIDERS while AGENT_WORK still asks
    // for the old word — which would silently degrade to the plain waterfall.
    for (const p of PROVIDERS) {
      const first = providerOrder({}, { prefer: p.role })[0];
      assert.equal(first, p.id, `role "${p.role}" should route to ${p.id}`);
    }
  });
});

describe('task 45 — a dead provider must not keep being tried first', () => {
  test('a recently-failed Claude is moved to the back of the line', () => {
    assert.deepEqual(providerOrder({}, { health: { claude: failedAgo(2 * MIN) } }),
      ['groq', 'mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai', 'claude']);
  });

  test('real health OUTRANKS the job preference', () => {
    // The load-bearing rule: preferring a dead provider is task 45's own failure
    // mode wearing a different hat, so a reasoning job still skips a dead Claude.
    assert.deepEqual(
      providerOrder({}, { prefer: 'reasoning', health: { claude: failedAgo(2 * MIN) } }),
      ['groq', 'mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai', 'claude']);
  });

  test('relative order among several dead providers is preserved', () => {
    assert.deepEqual(
      providerOrder({}, { health: { claude: failedAgo(MIN), groq: failedAgo(MIN) } }),
      ['mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai', 'claude', 'groq']);
  });

  test('when everything is down, every provider is still attempted', () => {
    const allDead = Object.fromEntries(ALL.map((id) => [id, failedAgo(MIN)]));
    const order = providerOrder({}, { health: allDead });
    assert.deepEqual(order, ALL, 'must not return an empty or truncated list');
    assert.equal(order.length, ALL.length, 'a provider must never be dropped entirely');
  });
});

describe('recovery — a failing provider must come back on its own', () => {
  // Deprioritise-never-skip is deliberate: skipping outright would write a provider
  // off permanently on a stale row AND freeze that row, since nothing would re-check it.
  test('a failure older than the retry window returns to normal priority', () => {
    assert.deepEqual(
      providerOrder({}, { health: { claude: failedAgo(PROVIDER_RETRY_AFTER_MS + MIN) } }),
      ALL);
  });

  test('a failure just inside the retry window is still deprioritised', () => {
    assert.deepEqual(
      providerOrder({}, { health: { claude: failedAgo(PROVIDER_RETRY_AFTER_MS - MIN) } }),
      ['groq', 'mistral', 'openai', 'deepseek', 'kimi', 'openrouter', 'workers-ai', 'claude']);
  });

  test('the retry window is a sane length, not zero or infinite', () => {
    assert.ok(PROVIDER_RETRY_AFTER_MS > 0, 'zero would mean never deprioritise');
    assert.ok(PROVIDER_RETRY_AFTER_MS <= 6 * 60 * MIN,
      'longer than a few hours would leave a recovered provider sidelined too long');
  });
});

describe('`only` (task 44) must still bypass all routing', () => {
  test('only pins exactly one provider, even a dead one', () => {
    assert.deepEqual(
      providerOrder({}, { only: 'claude', health: { claude: failedAgo(MIN) } }),
      ['claude']);
  });

  test('only ignores any preference', () => {
    assert.deepEqual(providerOrder({}, { only: 'mistral', prefer: 'speed' }), ['mistral']);
  });

  test('only with an unknown id returns nothing rather than guessing', () => {
    assert.deepEqual(providerOrder({}, { only: 'not-a-provider' }), []);
  });
});

describe('bad input degrades to the waterfall instead of crashing or dropping providers', () => {
  test('an unknown preference word falls back to the documented order', () => {
    assert.deepEqual(providerOrder({}, { prefer: 'nonsense-role' }), ALL);
  });

  test('a malformed checked_at is treated as no signal, not as a failure', () => {
    assert.deepEqual(
      providerOrder({}, { health: { claude: { ok: 0, error: 'x', checked_at: 'not-a-date' } } }),
      ALL);
  });

  test('a future-dated row does not deprioritise (clock-skew safety)', () => {
    assert.deepEqual(
      providerOrder({}, { health: { claude: failedAgo(-5 * MIN) } }),
      ALL);
  });

  test('health for an unknown provider is ignored', () => {
    assert.deepEqual(providerOrder({}, { health: { 'some-old-provider': failedAgo(MIN) } }), ALL);
  });

  test('every returned order is a permutation of the real provider list', () => {
    const cases = [
      {}, { prefer: 'speed' }, { prefer: 'reasoning' },
      { health: { claude: failedAgo(MIN) } },
      { health: Object.fromEntries(ALL.map((id) => [id, failedAgo(MIN)])) },
    ];
    for (const c of cases) {
      assert.deepEqual([...providerOrder({}, c)].sort(), [...ALL].sort(),
        `order must stay a permutation for ${JSON.stringify(c)}`);
    }
  });
});
