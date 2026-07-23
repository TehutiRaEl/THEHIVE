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

const DEFAULT_BASE = 'https://thehive.sovereignhive.workers.dev';

export function createTheHiveProvider({ baseUrl = process.env.AUTOMATON_THEHIVE_API_BASE || DEFAULT_BASE, timeoutMs = 20000 } = {}) {
  return {
    name: 'thehive-worker',
    async generate({ system, prompt, maxTokens }) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(`${baseUrl}/v11/automaton/infer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system, prompt, maxTokens }),
          signal: controller.signal,
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.ok || !data.text) return null;
        return { text: data.text, provider: `thehive:${data.provider}` };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
