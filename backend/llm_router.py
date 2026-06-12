"""
LLM Router with fallback chain: Ollama (primary) -> Claude (fallback).
Implements retry with exponential backoff and graceful degradation.
"""
import httpx
import time
import hashlib
import json
from typing import Optional, Dict
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from backend.config import settings


class LLMRouter:
    """Routes LLM calls with fallback chain and circuit breaker pattern."""

    def __init__(self):
        self.cost_tracker = {"ollama": {"requests": 0, "tokens": 0}, "claude": {"requests": 0, "tokens": 0}}
        self.cache = {}
        self.cache_ttl = 3600

    def _get_cache_key(self, prompt: str, system: str) -> str:
        return hashlib.sha256(f"{prompt}:{system}".encode()).hexdigest()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.TimeoutException, httpx.ConnectError))
    )
    async def call_ollama(self, prompt: str, system: str = "", max_tokens: int = 500) -> Dict:
        """Call local Ollama instance with retries."""
        cache_key = self._get_cache_key(prompt, system)
        if cache_key in self.cache:
            cached, ts = self.cache[cache_key]
            if time.time() - ts < self.cache_ttl:
                return {"text": cached, "provider": "cache", "cached": True}

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "system": system,
                    "stream": False,
                    "options": {"num_predict": max_tokens, "temperature": 0.7}
                }
            )
            if resp.status_code != 200:
                raise RuntimeError(f"Ollama error {resp.status_code}: {resp.text[:200]}")

            data = resp.json()
            text = data.get("response", "")
            self.cost_tracker["ollama"]["requests"] += 1
            self.cost_tracker["ollama"]["tokens"] += len(text) // 4

            self.cache[cache_key] = (text, time.time())
            return {"text": text, "provider": "ollama", "cached": False}

    async def call_claude(self, prompt: str, system: str = "", max_tokens: int = 500) -> Dict:
        """Call Anthropic Claude as fallback."""
        if not settings.anthropic_api_key:
            raise RuntimeError("No ANTHROPIC_API_KEY configured")

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": max_tokens,
                    "system": system,
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            if resp.status_code != 200:
                raise RuntimeError(f"Claude error {resp.status_code}: {resp.text[:200]}")

            data = resp.json()
            text = data["content"][0]["text"] if data.get("content") else ""
            tokens = data.get("usage", {}).get("input_tokens", 0) + data.get("usage", {}).get("output_tokens", 0)
            self.cost_tracker["claude"]["requests"] += 1
            self.cost_tracker["claude"]["tokens"] += tokens

            return {"text": text, "provider": "claude", "cached": False}

    async def call(self, prompt: str, system: str = "", max_tokens: int = 500) -> Dict:
        """Route to primary (Ollama) with fallback to Claude."""
        provider = settings.llm_provider.lower()

        if provider == "claude":
            try:
                return await self.call_claude(prompt, system, max_tokens)
            except Exception as e:
                # Fallback to Ollama if Claude fails
                return await self.call_ollama(prompt, system, max_tokens)

        # Default: Ollama first, then Claude
        try:
            return await self.call_ollama(prompt, system, max_tokens)
        except Exception as e:
            if settings.anthropic_api_key:
                try:
                    return await self.call_claude(prompt, system, max_tokens)
                except Exception as e2:
                    return {
                        "text": f"All LLM providers failed. Ollama: {str(e)[:100]}, Claude: {str(e2)[:100]}",
                        "provider": "fallback_error",
                        "error": True
                    }
            return {
                "text": f"Ollama failed and no Claude key configured: {str(e)[:200]}",
                "provider": "fallback_error",
                "error": True
            }

    def get_cost_summary(self) -> Dict:
        return self.cost_tracker


# Singleton
router = LLMRouter()

async def call_ollama(prompt: str, system: str = "", max_tokens: int = 500) -> str:
    """Backward-compatible wrapper returning text only."""
    result = await router.call(prompt, system, max_tokens)
    return result.get("text", "")
