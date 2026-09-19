#!/usr/bin/env python3
"""Surgical wire: DeepSeek + Kimi into PROVIDERS + generate() attempts (from docs/PROVIDER_GATEWAY_MAP.md)."""
from pathlib import Path
import sys

p = Path("worker/src/index.js")
text = p.read_text()
if "id: 'deepseek'" in text and "deepseek: async" in text:
    print("already wired")
    sys.exit(0)

old_providers = """const PROVIDERS = [
  { id: 'claude', label: 'Claude', role: 'Reasoning', secret: 'ANTHROPIC_API_KEY' },
  { id: 'groq', label: 'Groq', role: 'Speed', secret: 'GROQ_API_KEY' },
  { id: 'mistral', label: 'Mistral', role: 'Local intelligence', secret: 'MISTRAL_API_KEY' },
  { id: 'openai', label: 'OpenAI', role: 'General', secret: 'OPENAI_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter', role: 'Open-source + free-tier models', secret: 'OPENROUTER_API_KEY' },
  { id: 'workers-ai', label: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', secret: null },
];"""

new_providers = """const PROVIDERS = [
  { id: 'claude', label: 'Claude', role: 'Reasoning', secret: 'ANTHROPIC_API_KEY' },
  { id: 'groq', label: 'Groq', role: 'Speed', secret: 'GROQ_API_KEY' },
  { id: 'mistral', label: 'Mistral', role: 'Local intelligence', secret: 'MISTRAL_API_KEY' },
  { id: 'openai', label: 'OpenAI', role: 'General', secret: 'OPENAI_API_KEY' },
  { id: 'deepseek', label: 'DeepSeek', role: 'Reasoning / code', secret: 'DEEPSEEK_API_KEY' },
  { id: 'kimi', label: 'Kimi', role: 'Long-context / agentic', secret: 'MOONSHOT_API_KEY' },
  { id: 'openrouter', label: 'OpenRouter', role: 'Open-source + free-tier models', secret: 'OPENROUTER_API_KEY' },
  { id: 'workers-ai', label: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', secret: null },
];"""

if old_providers not in text:
    print("PROVIDERS block not found or already diverged", file=sys.stderr)
    sys.exit(1)
text = text.replace(old_providers, new_providers, 1)

# Insert attempt branches immediately before openrouter: async
marker = "    openrouter: async () => {"
if marker not in text:
    print("openrouter attempt marker not found", file=sys.stderr)
    sys.exit(1)
if "deepseek: async" not in text:
    branches = """    deepseek: async () => {
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
"""
    text = text.replace(marker, branches + marker, 1)

p.write_text(text)
print("providers wired ok", len(text))
