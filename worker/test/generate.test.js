// worker/test/generate.test.js
//
// Drives the real generate() end to end with fetch, Workers AI, and D1 stubbed, so the
// restructured provider loop is proven by running it rather than by reading it.
// generate() was rewritten from a hardcoded four-branch if-chain into an ordered loop
// (task 52); these assertions cover what that rewrite must not break.
//
// The stubs are deliberately thin: they record what was called so a test can assert a
// dead provider was genuinely NOT contacted, which is the whole point of the routing.

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { generate } from '../src/index.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const CLAUDE_OK = {
  content: [{ text: 'claude answer' }],
  usage: { input_tokens: 10, output_tokens: 5 },
};
const OPENAI_OK = (who) => ({
  choices: [{ message: { content: `${who} answer` } }],
  usage: { prompt_tokens: 7, completion_tokens: 3 },
});
const res = (ok, body, status = 200) => ({
  ok, status,
  json: async () => body,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

// A D1 stub that serves provider_health rows and records what was written back.
function stubDB(healthRows = []) {
  const writes = [];
  return {
    writes,
    prepare(sql) {
      return {
        all: async () => ({ results: healthRows }),
        first: async () => null,
        bind: (...args) => ({
          run: async () => {
            if (sql.includes('provider_health')) {
              writes.push({ provider: args[0], ok: args[1], error: args[2] });
            }
          },
        }),
        run: async () => {},
      };
    },
  };
}

// Routes a stub response per provider and records the call order.
function stubFetch(handlers, calls) {
  globalThis.fetch = async (url) => {
    const id = String(url).includes('anthropic') ? 'claude'
      : String(url).includes('groq') ? 'groq'
        : String(url).includes('mistral') ? 'mistral' : 'unknown';
    calls.push(id);
    const h = handlers[id];
    if (!h) throw new Error(`unexpected call to ${id}`);
    return h();
  };
}

describe('the happy path stops at the first provider that answers', () => {
  test('Claude answers and no later provider is contacted', async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(true, CLAUDE_OK),
      groq: () => res(true, OPENAI_OK('groq')),
      mistral: () => res(true, OPENAI_OK('mistral')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', GROQ_API_KEY: 'k', MISTRAL_API_KEY: 'k' },
      { system: 's', prompt: 'p' });

    assert.equal(r.text, 'claude answer');
    assert.equal(r.provider, 'claude', 'must report who really answered');
    assert.deepEqual(r.usage, { in: 10, out: 5 }, 'real token usage passes through');
    assert.deepEqual(calls, ['claude'], 'later providers must not be called');
    assert.deepEqual(DB.writes, [{ provider: 'claude', ok: 1, error: null }]);
  });

  test('the attempt order is reported back to the caller', async () => {
    const calls = [], DB = stubDB();
    stubFetch({ claude: () => res(true, CLAUDE_OK) }, calls);
    const r = await generate({ DB, ANTHROPIC_API_KEY: 'k' }, { system: 's', prompt: 'p' });
    assert.ok(Array.isArray(r.order), 'order must be returned so cost reports can name it');
    assert.equal(r.order[0], 'claude');
  });
});

describe('task 45 live — a failing provider falls through AND records why', () => {
  test('a 401 from Claude is recorded with its real status and body', async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(false, '{"error":"invalid x-api-key"}', 401),
      groq: () => res(true, OPENAI_OK('groq')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'bad', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p' });

    assert.equal(r.provider, 'groq');
    assert.deepEqual(calls, ['claude', 'groq']);
    assert.equal(DB.writes[0].provider, 'claude');
    assert.equal(DB.writes[0].ok, 0);
    assert.match(DB.writes[0].error, /HTTP 401/,
      'the real status must be captured, not swallowed by a bare catch');
    assert.match(DB.writes[0].error, /invalid x-api-key/,
      'the response body is what tells the founder WHY it is dead');
    assert.deepEqual(DB.writes[1], { provider: 'groq', ok: 1, error: null });
  });

  test('a 200 with no usable text counts as a failure, not a silent skip', async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(true, { content: [{ text: '  ' }] }),
      groq: () => res(true, OPENAI_OK('groq')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p' });

    assert.equal(r.provider, 'groq');
    assert.equal(DB.writes[0].ok, 0);
    assert.match(DB.writes[0].error, /no usable text/);
  });

  test('a thrown network error is recorded rather than lost', async () => {
    const DB = stubDB();
    globalThis.fetch = async (url) => {
      if (String(url).includes('anthropic')) throw new Error('connection reset');
      return res(true, OPENAI_OK('groq'));
    };
    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p' });
    assert.equal(r.provider, 'groq');
    assert.match(DB.writes[0].error, /connection reset/);
  });
});

describe('recorded health actually changes who gets called', () => {
  test('a known-dead Claude is not contacted at all', async () => {
    const calls = [];
    const DB = stubDB([
      { provider: 'claude', ok: 0, error: 'HTTP 401', checked_at: new Date().toISOString() },
    ]);
    stubFetch({
      claude: () => res(false, 'nope', 401),
      groq: () => res(true, OPENAI_OK('groq')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'bad', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p' });

    assert.equal(r.provider, 'groq');
    assert.deepEqual(calls, ['groq'],
      'the whole point: no 20s timeout burned on a provider already known to be dead');
    assert.equal(r.order[r.order.length - 1], 'claude', 'dead provider sorts last');
  });
});

describe('prefer routing reaches a different key for real', () => {
  test("prefer 'speed' calls Groq and never touches Claude", async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(true, CLAUDE_OK),
      groq: () => res(true, OPENAI_OK('groq')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p', prefer: 'speed' });

    assert.equal(r.provider, 'groq');
    assert.deepEqual(calls, ['groq']);
  });
});

describe('binding, pinning, and honest failure', () => {
  test('an unbound provider is skipped without a false failure row', async () => {
    const calls = [], DB = stubDB();
    stubFetch({ mistral: () => res(true, OPENAI_OK('mistral')) }, calls);

    const r = await generate({ DB, MISTRAL_API_KEY: 'k' }, { system: 's', prompt: 'p' });

    assert.equal(r.provider, 'mistral');
    assert.deepEqual(DB.writes, [{ provider: 'mistral', ok: 1, error: null }],
      'unbound is not the same as broken — it must not pollute provider_health');
  });

  test('everything down returns null rather than a fabricated answer', async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(false, 'down', 500),
      groq: () => res(false, 'down', 500),
      mistral: () => res(false, 'down', 500),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', GROQ_API_KEY: 'k', MISTRAL_API_KEY: 'k' },
      { system: 's', prompt: 'p' });

    assert.equal(r, null, 'never invent text when no provider answered');
    assert.equal(DB.writes.length, 3, 'each failure is still recorded');
  });

  test('`only` pins one provider and refuses to fall through when it fails', async () => {
    const calls = [], DB = stubDB();
    stubFetch({
      claude: () => res(false, 'bad', 401),
      groq: () => res(true, OPENAI_OK('groq')),
    }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'bad', GROQ_API_KEY: 'k' },
      { system: 's', prompt: 'p', only: 'claude' });

    assert.equal(r, null, 'a pinned test must never be answered by a different key');
    assert.deepEqual(calls, ['claude']);
  });

  test('Workers AI answers last and reports null usage honestly', async () => {
    const calls = [], DB = stubDB();
    stubFetch({ claude: () => res(false, 'down', 500) }, calls);

    const r = await generate(
      { DB, ANTHROPIC_API_KEY: 'k', AI: { run: async () => ({ response: 'workers ai answer' }) } },
      { system: 's', prompt: 'p' });

    assert.equal(r.provider, 'workers-ai');
    assert.equal(r.usage, null,
      'Workers AI reports no token counts — null, never a fabricated zero');
  });

  test('a missing D1 binding does not stop generation', async () => {
    // Health is an optimisation, not a dependency: losing D1 must degrade to the
    // plain waterfall rather than take the whole generative surface down.
    const calls = [];
    stubFetch({ claude: () => res(true, CLAUDE_OK) }, calls);
    const r = await generate({ DB: undefined, ANTHROPIC_API_KEY: 'k' }, { system: 's', prompt: 'p' });
    assert.equal(r.provider, 'claude');
  });
});
