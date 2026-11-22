// automaton/src/inference/thehive-provider.js
//
// Calls THEHIVE's own live Worker (worker/src/index.js) — specifically the
// new POST /v11/automaton/infer route, which reuses the exact same
// Claude -> Groq -> Mistral -> Workers AI waterfall (`generate()`) already
// backing /v11/venture/plan and /v11/legal/research. This is the actual
// "decouple from Conway, use THEHIVE's own stack" implementation: zero new
// inference infrastructure, zero new provider keys to manage — this
// automaton is a client of the hive's own Worker, the same as the Command
// Center UI is.
//
// Base URL is configurable (AUTOMATON_THEHIVE_API_BASE) so local dev can
// point at `wrangler dev`, and defaults to the live production Worker.
//
// AUTH (2026-11-22, founder decision S-2): the route spends AI money, so the
// Worker now requires the founder key. This provider sends it as a Bearer token
// from AUTOMATON_THEHIVE_API_KEY (the sandbox-run workflow sets it from the
// FOUNDER_KEY secret). Without a key it does NOT call the Worker at all (the call
// would be refused): it says so once on stderr and returns null, so the router
// falls back to the simulate provider exactly as it does for any failure.

const DEFAULT_BASE = 'https://thehive.sovereignhive.workers.dev';

export function createTheHiveProvider({
  baseUrl = process.env.AUTOMATON_THEHIVE_API_BASE || DEFAULT_BASE,
  apiKey = process.env.AUTOMATON_THEHIVE_API_KEY,
  timeoutMs = 20000,
  warn = (msg) => console.error(msg),
} = {}) {
  let warned = false;
  return {
    name: 'thehive-worker',
    async generate({ system, prompt, maxTokens }) {
      if (!apiKey) {
        if (!warned) {
          warned = true;
          warn('thehive-provider: AUTOMATON_THEHIVE_API_KEY is not set; the Worker\'s /v11/automaton/infer is founder-only, so inference falls back to the simulate provider.');
        }
        return null;
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(`${baseUrl}/v11/automaton/infer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ system, prompt, maxTokens }),
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 401 && !warned) {
            warned = true;
            warn('thehive-provider: the Worker refused the key (401); inference falls back to the simulate provider.');
          }
          return null;
        }
        const data = await res.json();
        if (!data.ok || !data.text) return null;
        return { text: data.text, provider: `thehive:${data.provider}` };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
