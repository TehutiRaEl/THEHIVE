# Provider & Gateway Model Mapping

**Branch:** `grok/providers-wire-2026-09-17`  
**Date:** 2026-09-17  
**Status:** Blueprint locked; **code wire PR in progress** (PROVIDERS + generate attempts).

## Current live roster (main / pre-wire)

| id | label | role | secret |
|----|-------|------|--------|
| claude | Claude | Reasoning | ANTHROPIC_API_KEY |
| groq | Groq | Speed | GROQ_API_KEY |
| mistral | Mistral | Local intelligence | MISTRAL_API_KEY |
| openai | OpenAI | General | OPENAI_API_KEY |
| openrouter | OpenRouter | Open-source + free-tier models | OPENROUTER_API_KEY |
| workers-ai | Cloudflare Workers AI | Deployment + runtime inference | (AI binding) |

**Adding:** DeepSeek, Kimi/Moonshot as first-class providers.

---

## Target roster

```js
const PROVIDERS = [
  { id: 'claude',     label: 'Claude',                role: 'Reasoning',                      secret: 'ANTHROPIC_API_KEY' },
  { id: 'groq',       label: 'Groq',                  role: 'Speed',                          secret: 'GROQ_API_KEY' },
  { id: 'mistral',    label: 'Mistral',               role: 'Local intelligence',             secret: 'MISTRAL_API_KEY' },
  { id: 'openai',     label: 'OpenAI',                role: 'General',                        secret: 'OPENAI_API_KEY' },
  { id: 'deepseek',   label: 'DeepSeek',              role: 'Reasoning / code',               secret: 'DEEPSEEK_API_KEY' },
  { id: 'kimi',       label: 'Kimi',                  role: 'Long-context / agentic',         secret: 'MOONSHOT_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter',            role: 'Open-source + free-tier models', secret: 'OPENROUTER_API_KEY' },
  { id: 'workers-ai', label: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', secret: null },
];
```

---

## Direct API endpoints & default models (Aug 2026)

### DeepSeek
- Base: `https://api.deepseek.com` (`/chat/completions`)
- Auth: `Authorization: Bearer ${DEEPSEEK_API_KEY}`
- Default model: `deepseek-v4-pro` (override: `DEEPSEEK_MODEL`)
- Fast: `deepseek-v4-flash`

### Kimi / Moonshot
- Base: `https://api.moonshot.ai/v1`
- Auth: `Authorization: Bearer ${MOONSHOT_API_KEY}` (alias `KIMI_API_KEY` accepted in wire)
- Default model: `kimi-k3` (override: `KIMI_MODEL` / `MOONSHOT_MODEL`)

### OpenRouter
- Default: `openrouter/free` or `OPENROUTER_MODEL` pin

---

## Founder flip sequence (after this PR merges + deploy)

1. `wrangler secret put DEEPSEEK_API_KEY`
2. `wrangler secret put MOONSHOT_API_KEY`
3. Confirm `OPENROUTER_API_KEY` bound
4. Redeploy Worker
5. GET `/v11/llm/status` — expect deepseek/kimi in roster
6. Optional pin-test via `provider=deepseek|kimi` on command_text

## Out of scope

n8n, GitHub runner, Groq model id change, money/social connectors.
