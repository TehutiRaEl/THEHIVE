"""
Free LLM Router — Sovereign Hive v11.0
Waterfall through all free LLM providers in priority order.
All providers expose an OpenAI-compatible /chat/completions interface.
Zero cost: Ollama (local) → Asian free APIs → Global free APIs.
"""

import asyncio
import logging
import time
from typing import List, Dict, Any, Optional

import httpx

from backend.core.config import settings

logger = logging.getLogger("jasper.llm_router")

# ── Provider registry ──────────────────────────────────────────
# Each entry: id, base_url, api_key_env, default_model, priority (lower = try first)
# api_key = "" means no key needed (local) or key pulled from settings
PROVIDERS: List[Dict[str, Any]] = [
    # Tier 1 — Local Ollama (zero latency, zero cost)
    {
        "id": "ollama",
        "base_url": "",          # set dynamically from settings
        "api_key": "",
        "default_model": "",     # set dynamically from settings
        "priority": 1,
        "timeout": 120.0,
        "ollama_native": True,   # uses /api/chat instead of /v1/chat/completions
    },
    # Tier 2 — Asian free APIs (highest free quotas)
    {
        "id": "moonshot",
        "base_url": "https://api.moonshot.cn/v1",
        "api_key_setting": "moonshot_api_key",
        "default_model": "moonshot-v1-128k",
        "priority": 2,
        "timeout": 60.0,
    },
    {
        "id": "siliconflow",
        "base_url": "https://api.siliconflow.cn/v1",
        "api_key_setting": "siliconflow_api_key",
        "default_model": "Qwen/Qwen2.5-72B-Instruct",
        "priority": 3,
        "timeout": 60.0,
    },
    {
        "id": "deepseek",
        "base_url": "https://api.deepseek.com/v1",
        "api_key_setting": "deepseek_api_key",
        "default_model": "deepseek-chat",
        "priority": 4,
        "timeout": 60.0,
    },
    {
        "id": "zhipu",
        "base_url": "https://open.bigmodel.cn/api/paas/v4",
        "api_key_setting": "zhipu_api_key",
        "default_model": "glm-4-flash",
        "priority": 5,
        "timeout": 60.0,
    },
    # Tier 3 — Global free APIs
    {
        "id": "groq",
        "base_url": "https://api.groq.com/openai/v1",
        "api_key_setting": "groq_api_key",
        "default_model": "llama-3.3-70b-versatile",
        "priority": 6,
        "timeout": 30.0,
    },
    {
        "id": "openrouter",
        "base_url": "https://openrouter.ai/api/v1",
        "api_key_setting": "openrouter_api_key",
        "default_model": "meta-llama/llama-3.1-8b-instruct:free",
        "priority": 7,
        "timeout": 45.0,
    },
    {
        "id": "gemini",
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai",
        "api_key_setting": "gemini_api_key",
        "default_model": "gemini-1.5-flash",
        "priority": 8,
        "timeout": 30.0,
    },
]

# ── Health cache (60s TTL per provider) ───────────────────────
_health_cache: Dict[str, Dict] = {}
_HEALTH_TTL = 60.0


def _provider_healthy(provider_id: str) -> bool:
    entry = _health_cache.get(provider_id)
    if not entry:
        return True  # assume healthy until proven otherwise
    if time.time() - entry["ts"] > _HEALTH_TTL:
        return True  # cache expired
    return entry["ok"]


def _mark_provider(provider_id: str, ok: bool):
    _health_cache[provider_id] = {"ok": ok, "ts": time.time()}


def _get_api_key(provider: Dict) -> str:
    setting_name = provider.get("api_key_setting", "")
    if not setting_name:
        return provider.get("api_key", "")
    return getattr(settings, setting_name, "") or ""


async def _call_ollama(messages: List[Dict], model: str, max_tokens: int, temperature: float) -> str:
    """Call Ollama's native /api/chat endpoint."""
    base = settings.ollama_base_url.rstrip("/")
    model = model or settings.ollama_model
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{base}/api/chat",
            json={"model": model, "messages": messages, "stream": False},
        )
    resp.raise_for_status()
    return resp.json().get("message", {}).get("content", "")


async def _call_openai_compat(
    provider: Dict,
    messages: List[Dict],
    model: str,
    max_tokens: int,
    temperature: float,
) -> str:
    """Call any OpenAI-compatible /chat/completions endpoint."""
    api_key = _get_api_key(provider)
    base = provider["base_url"].rstrip("/")
    model = model or provider["default_model"]

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    async with httpx.AsyncClient(timeout=provider.get("timeout", 60.0)) as client:
        resp = await client.post(
            f"{base}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "stream": False,
            },
        )
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


async def chat(
    messages: List[Dict[str, str]],
    model: str = "",
    max_tokens: int = 2000,
    temperature: float = 0.7,
    provider_hint: str = "",
) -> Dict[str, Any]:
    """
    Route a chat request through the free LLM waterfall.
    Returns {"content": str, "provider": str, "model": str}.
    Falls through providers in priority order, skipping unhealthy ones.
    """
    # Sort by priority
    ordered = sorted(PROVIDERS, key=lambda p: p["priority"])

    # If a specific provider is hinted and healthy, try it first
    if provider_hint:
        hinted = [p for p in ordered if p["id"] == provider_hint]
        rest = [p for p in ordered if p["id"] != provider_hint]
        ordered = hinted + rest

    last_error = None
    for provider in ordered:
        pid = provider["id"]
        if not _provider_healthy(pid):
            logger.debug(f"Skipping unhealthy provider: {pid}")
            continue

        try:
            if provider.get("ollama_native"):
                content = await _call_ollama(messages, model, max_tokens, temperature)
            else:
                api_key = _get_api_key(provider)
                if not api_key:
                    logger.debug(f"Skipping {pid}: no API key configured")
                    continue
                content = await _call_openai_compat(provider, messages, model, max_tokens, temperature)

            _mark_provider(pid, True)
            used_model = model or provider.get("default_model", pid)
            logger.info(f"LLM served by: {pid} / {used_model}")
            return {"content": content, "provider": pid, "model": used_model}

        except httpx.HTTPStatusError as e:
            status = e.response.status_code if e.response else 0
            if status in (429, 503, 502):
                logger.warning(f"Provider {pid} rate-limited/unavailable ({status}), marking unhealthy")
                _mark_provider(pid, False)
            else:
                logger.warning(f"Provider {pid} error {status}: {e}")
            last_error = e

        except (httpx.ConnectError, httpx.TimeoutException) as e:
            logger.warning(f"Provider {pid} unreachable: {e}")
            _mark_provider(pid, False)
            last_error = e

        except Exception as e:
            logger.warning(f"Provider {pid} unexpected error: {e}")
            last_error = e

    raise RuntimeError(
        f"All LLM providers exhausted. Last error: {last_error}. "
        "Add free API keys via environment variables (MOONSHOT_API_KEY, SILICONFLOW_API_KEY, etc.)"
    )


async def provider_status() -> List[Dict]:
    """Return health status of all configured providers."""
    result = []
    for p in sorted(PROVIDERS, key=lambda x: x["priority"]):
        has_key = bool(_get_api_key(p)) or p.get("ollama_native", False)
        result.append({
            "id": p["id"],
            "priority": p["priority"],
            "model": p.get("default_model", ""),
            "base_url": p.get("base_url") or settings.ollama_base_url,
            "has_key": has_key,
            "healthy": _provider_healthy(p["id"]),
        })
    return result
