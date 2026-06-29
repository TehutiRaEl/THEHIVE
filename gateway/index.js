/**
 * Sovereign Hive — Free LLM Gateway
 * OpenAI-compatible /v1/chat/completions proxy.
 * Waterfalls through all free providers in priority order.
 * Deploy: node index.js  (port 8181, configurable via PORT env var)
 */

const http = require("http");
const https = require("https");

const PORT = parseInt(process.env.PORT || "8181", 10);

// ── Provider registry ─────────────────────────────────────────
// All expose OpenAI-compatible /chat/completions except Ollama (native /api/chat)
const PROVIDERS = [
  // Tier 1 — Local Ollama
  {
    id: "ollama",
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "llama3:8b",
    apiKey: "",
    priority: 1,
    timeoutMs: 120_000,
    ollamaNative: true,
  },
  // Tier 2 — Asian free APIs
  {
    id: "moonshot",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-128k",
    apiKey: process.env.MOONSHOT_API_KEY || "",
    priority: 2,
    timeoutMs: 60_000,
  },
  {
    id: "siliconflow",
    baseUrl: "https://api.siliconflow.cn/v1",
    model: "Qwen/Qwen2.5-72B-Instruct",
    apiKey: process.env.SILICONFLOW_API_KEY || "",
    priority: 3,
    timeoutMs: 60_000,
  },
  {
    id: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    priority: 4,
    timeoutMs: 60_000,
  },
  {
    id: "zhipu",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
    apiKey: process.env.ZHIPU_API_KEY || "",
    priority: 5,
    timeoutMs: 60_000,
  },
  // Tier 3 — Global free APIs
  {
    id: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY || "",
    priority: 6,
    timeoutMs: 30_000,
  },
  {
    id: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.1-8b-instruct:free",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    priority: 7,
    timeoutMs: 45_000,
  },
  {
    id: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-1.5-flash",
    apiKey: process.env.GEMINI_API_KEY || "",
    priority: 8,
    timeoutMs: 30_000,
  },
];

// ── OmniRoute scoring state ─────────────────────────────────────
// score = availability × (1/avg_latency) × priority_boost
const _stats = new Map(); // id → {ok, ts, latencies[], calls, errors}
const HEALTH_TTL = 60_000;

function getStats(id) {
  if (!_stats.has(id)) _stats.set(id, { ok: true, ts: 0, latencies: [], calls: 0, errors: 0 });
  return _stats.get(id);
}

function isHealthy(id) {
  const s = getStats(id);
  if (Date.now() - s.ts > HEALTH_TTL) { s.ok = true; } // optimistic reset after TTL
  return s.ok;
}

function markProvider(id, ok, latencyMs = 0) {
  const s = getStats(id);
  s.ok = ok; s.ts = Date.now(); s.calls++;
  if (!ok) { s.errors++; s.latencies = []; }
  else if (latencyMs > 0) { s.latencies = [...s.latencies.slice(-4), latencyMs]; }
}

function providerScore(provider) {
  const s = getStats(provider.id);
  if (!s.ok) return 0;
  const availability = s.calls === 0 ? 1 : Math.max(0, 1 - s.errors / Math.max(s.calls, 1));
  const avgLat = s.latencies.length ? s.latencies.reduce((a,b)=>a+b,0)/s.latencies.length : 5000;
  const invLat = 1000 / Math.max(avgLat, 10);  // normalised to seconds
  const priorityBoost = 1 / provider.priority;
  return availability * invLat * priorityBoost;
}

// ── HTTP helper ────────────────────────────────────────────────
function httpRequest(url, options, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Call a single provider ─────────────────────────────────────
async function callProvider(provider, messages, model, maxTokens, temperature) {
  const useModel = model || provider.model;
  const t0 = Date.now();

  if (provider.ollamaNative) {
    const body = JSON.stringify({ model: useModel, messages, stream: false });
    const url = new URL("/api/chat", provider.baseUrl);
    const res = await httpRequest(
      url.toString(),
      { method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
      body,
      provider.timeoutMs
    );
    if (res.status !== 200) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    const data = JSON.parse(res.body);
    return { content: data.message?.content || "", latencyMs: Date.now() - t0 };
  }

  // OpenAI-compatible
  if (!provider.apiKey) throw new Error("no_key");
  const payload = JSON.stringify({ model: useModel, messages, max_tokens: maxTokens, temperature, stream: false });
  const url = new URL("/chat/completions", provider.baseUrl);
  const res = await httpRequest(
    url.toString(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        Authorization: `Bearer ${provider.apiKey}`,
      },
    },
    payload,
    provider.timeoutMs
  );
  if (res.status !== 200) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
  const data = JSON.parse(res.body);
  return { content: data.choices?.[0]?.message?.content || "", latencyMs: Date.now() - t0 };
}

// ── OmniRoute router ───────────────────────────────────────────
async function routeChat(messages, model, maxTokens, temperature) {
  // Sort by composite score (desc) — fast + healthy providers rise naturally
  const ordered = [...PROVIDERS].sort((a, b) => providerScore(b) - providerScore(a));
  for (const provider of ordered) {
    if (!isHealthy(provider.id)) continue;
    try {
      const { content, latencyMs } = await callProvider(provider, messages, model, maxTokens, temperature);
      markProvider(provider.id, true, latencyMs);
      return { content, provider: provider.id, model: model || provider.model, latency_ms: latencyMs };
    } catch (err) {
      if (err.message === "no_key") continue;
      const status = err.status || 0;
      if ([429, 502, 503].includes(status)) markProvider(provider.id, false);
      console.warn(`[${provider.id}] failed:`, err.message);
    }
  }
  throw new Error("All providers exhausted. Set at least one free API key (GROQ_API_KEY, MOONSHOT_API_KEY, etc.).");
}

// ── Request handler ────────────────────────────────────────────
async function handleRequest(req, res) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, cors);
    return res.end(JSON.stringify({ status: "healthy", service: "kimi-gateway" }));
  }

  if (req.method === "GET" && req.url === "/info") {
    res.writeHead(200, cors);
    const ranked = [...PROVIDERS].sort((a,b) => providerScore(b) - providerScore(a));
    return res.end(JSON.stringify({
      name: "kimi-gateway",
      role: "llm",
      version: "12.0",
      routing: "omni-route-dynamic",
      providers: ranked.map((p) => {
        const s = getStats(p.id);
        const avgLat = s.latencies.length ? Math.round(s.latencies.reduce((a,b)=>a+b,0)/s.latencies.length) : null;
        return {
          id: p.id,
          priority: p.priority,
          score: Math.round(providerScore(p) * 10000) / 10000,
          model: p.model,
          hasKey: p.ollamaNative ? true : Boolean(p.apiKey),
          healthy: isHealthy(p.id),
          avg_latency_ms: avgLat,
          calls: s.calls,
          errors: s.errors,
        };
      }),
    }));
  }

  if (req.method === "GET" && (req.url === "/v1/models" || req.url === "/models")) {
    const models = PROVIDERS.filter((p) => p.ollamaNative || p.apiKey).map((p) => ({
      id: p.model,
      object: "model",
      provider: p.id,
    }));
    res.writeHead(200, cors);
    return res.end(JSON.stringify({ object: "list", data: models }));
  }

  if (req.method === "POST" && (req.url === "/v1/chat/completions" || req.url === "/chat/completions")) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const messages = payload.messages || [];
        const model = payload.model || "";
        const maxTokens = payload.max_tokens || 2000;
        const temperature = payload.temperature ?? 0.7;

        const result = await routeChat(messages, model, maxTokens, temperature);
        const response = {
          id: `chatcmpl-${Math.random().toString(36).slice(2, 10)}`,
          object: "chat.completion",
          model: result.model,
          provider: result.provider,
          choices: [{ index: 0, message: { role: "assistant", content: result.content }, finish_reason: "stop" }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        };
        res.writeHead(200, cors);
        res.end(JSON.stringify(response));
      } catch (err) {
        res.writeHead(503, cors);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, cors);
  res.end(JSON.stringify({ error: "Not found" }));
}

// ── Start server ───────────────────────────────────────────────
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`🧠 Kimi Gateway — Free LLM Router`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Providers (${PROVIDERS.length}): ${PROVIDERS.map((p) => p.id).join(", ")}`);
  const keyed = PROVIDERS.filter((p) => p.ollamaNative || p.apiKey).map((p) => p.id);
  console.log(`   Active:  ${keyed.join(", ") || "none — set API keys in env vars"}`);
});
