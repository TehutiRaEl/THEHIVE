# Provider & Gateway Model Mapping

**Branch:** `grok/providers-deepseek-kimi-2026-08`  
**Date:** 2026-08-28  
**Status:** Blueprint locked; code wiring is the next commit on this branch.

## Current live roster (main / pre-this-branch)

| id | label | role | secret |
|----|-------|------|--------|
| claude | Claude | Reasoning | ANTHROPIC_API_KEY |
| groq | Groq | Speed | GROQ_API_KEY |
| mistral | Mistral | Local intelligence | MISTRAL_API_KEY |
| openai | OpenAI | General | OPENAI_API_KEY |
| openrouter | OpenRouter | Open-source + free-tier models | OPENROUTER_API_KEY |
| workers-ai | Cloudflare Workers AI | Deployment + runtime inference | (AI binding) |

**Not present:** DeepSeek, Kimi/Moonshot as first-class providers or UI keys.

---

## Target roster (this blueprint)

Add two first-class providers; keep OpenRouter as multi-gateway fallback.

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

### DeepSeek (first-class)

| Field | Value |
|-------|--------|
| Base URL | `https://api.deepseek.com` (OpenAI-compatible: `/chat/completions`) |
| Auth | `Authorization: Bearer ${DEEPSEEK_API_KEY}` |
| Default model | `deepseek-v4-pro` (reasoning / code) |
| Fast alternative | `deepseek-v4-flash` |
| Env override | `DEEPSEEK_MODEL` (optional) |
| Notes | Old ids `deepseek-chat` / `deepseek-reasoner` retired after 2026-07-24. Thinking mode via body `thinking: { type: "enabled" }` optional. |

### Kimi / Moonshot (first-class)

| Field | Value |
|-------|--------|
| Base URL | `https://api.moonshot.ai/v1` |
| Auth | `Authorization: Bearer ${MOONSHOT_API_KEY}` (alias accepted: `KIMI_API_KEY` in resolve path if desired) |
| Default model | `kimi-k3` (flagship, ~1M context, always-thinking capable) |
| Coding alternative | `kimi-k2.7-code` |
| General alternative | `kimi-k2.6` |
| Env override | `KIMI_MODEL` or `MOONSHOT_MODEL` |
| Notes | `kimi-k2.5` / `moonshot-v1-*` sunset for new users (platform 2026-08-31). Prefer `kimi-k3`. |

### OpenRouter (gateway — multi-model)

| Field | Value |
|-------|--------|
| Base URL | `https://openrouter.ai/api/v1/chat/completions` |
| Auth | `Authorization: Bearer ${OPENROUTER_API_KEY}` |
| Default model | `openrouter/free` (auto free roster) |
| Env pin | `OPENROUTER_MODEL` |

#### OpenRouter model map (use when direct key absent or founder pins gateway)

| Intent | OpenRouter model id |
|--------|---------------------|
| Free / cheapest auto | `openrouter/free` |
| DeepSeek V4 Pro | `deepseek/deepseek-v4-pro` |
| DeepSeek V4 Flash | `deepseek/deepseek-v4-flash` |
| Kimi K3 (if listed) | `moonshotai/kimi-k3` (verify live `/models`) |
| Kimi K2.6 | `moonshotai/kimi-k2.6` |
| Kimi K2.7 Code | `moonshotai/kimi-k2.7-code` |
| Claude via OR | `anthropic/claude-sonnet-4` (or current) |
| Llama speed via OR | current free/paid Llama id from OR catalog |

**Routing rule:** Prefer direct provider key when bound. If only `OPENROUTER_API_KEY` is bound, OpenRouter answers with `OPENROUTER_MODEL` or `openrouter/free`. Optional later: map `prefer: 'reasoning'` → try DeepSeek direct, then OpenRouter `deepseek/deepseek-v4-pro`, then Claude.

---

## generate() attempt branches (to add)

```js
deepseek: async () => {
  if (!env.DEEPSEEK_API_KEY) return null;
  const r = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.DEEPSEEK_MODEL || 'deepseek-v4-pro',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
    signal: timeout(20000),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const d = await r.json();
  const text = (d?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('HTTP 200 but no usable text in response');
  return {
    text,
    usage: d?.usage
      ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null }
      : null,
  };
},

kimi: async () => {
  const key = env.MOONSHOT_API_KEY || env.KIMI_API_KEY;
  if (!key) return null;
  const r = await fetch('https://api.moonshot.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.KIMI_MODEL || env.MOONSHOT_MODEL || 'kimi-k3',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
    signal: timeout(20000),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${body.slice(0, 200)}`);
  }
  const d = await r.json();
  const text = (d?.choices?.[0]?.message?.content || '').trim();
  if (!text) throw new Error('HTTP 200 but no usable text in response');
  return {
    text,
    usage: d?.usage
      ? { in: d.usage.prompt_tokens ?? null, out: d.usage.completion_tokens ?? null }
      : null,
  };
},
```

OpenRouter branch stays as-is; optional enhancement:

```js
model: env.OPENROUTER_MODEL || 'openrouter/free',
// Documented pins:
// OPENROUTER_MODEL=deepseek/deepseek-v4-pro
// OPENROUTER_MODEL=moonshotai/kimi-k2.6
```

`providerRoster` / `providerOrder` / `recordProviderHealth` / `/llm/status` pick up new ids automatically once they are in `PROVIDERS` and `attempts`.

---

## Secrets (founder-only)

| Secret | How |
|--------|-----|
| DEEPSEEK_API_KEY | Cloudflare Worker secret or Secrets Store |
| MOONSHOT_API_KEY | Cloudflare Worker secret (Kimi platform key) |
| OPENROUTER_API_KEY | Already documented; ensure bound + redeploy |
| Optional | DEEPSEEK_MODEL, KIMI_MODEL, OPENROUTER_MODEL |

Presence-only in `/debug/env` and readiness (F-001: never values).

---

## UI

Command Center ConnectedModels / `/llm/status` already map the full roster. After deploy + secrets, DeepSeek and Kimi rows appear with bound/health/usage — no separate frontend key form required unless you want explicit chips.

---

## Founder flip sequence

1. Merge/wire this branch’s code (PROVIDERS + attempts).
2. `wrangler secret put DEEPSEEK_API_KEY`
3. `wrangler secret put MOONSHOT_API_KEY`
4. Confirm `OPENROUTER_API_KEY` bound; optional `OPENROUTER_MODEL=deepseek/deepseek-v4-flash`
5. Redeploy Worker.
6. GET `/v11/llm/status` — expect deepseek/kimi in roster; bound true after secrets.
7. POST `/v11/command_text` with `{ "provider": "deepseek" }` / `{ "provider": "kimi" }` to pin-test.

---

## Out of scope this PR

- n8n workflow designer
- GitHub PR/issue runner (preferred next tool for visibility)
- Changing Groq model id (docs still list `llama-3.3-70b-versatile`; 404 may be account/catalog lag)
- Money / social / scraping connectors
