# ============================================================
# LLM ROUTER — Sovereign Hive v9
# Primary: Ollama (local) → Fallback: Claude API
# Drop-in replacement for call_claude() throughout the backend
# ============================================================
import os
import json
import logging
import httpx
from typing import Optional, List, Dict, Any

logger = logging.getLogger("jasper.llm")

# ─── CONFIG ────────────────────────────────────────────────
OLLAMA_BASE_URL  = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL     = os.environ.get("OLLAMA_MODEL", "llama3:8b")
LLM_PROVIDER     = os.environ.get("LLM_PROVIDER", "auto")
ANTHROPIC_KEY    = os.environ.get("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL     = "claude-sonnet-4-20250514"
OLLAMA_TIMEOUT   = 120.0

# ─── OLLAMA CLIENT ─────────────────────────────────────────
async def _call_ollama(
    prompt: str,
    system: str = "",
    max_tokens: int = 1000,
) -> Dict:
    payload: Dict[str, Any] = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
            "repeat_penalty": 1.1,
        },
    }
    if system:
        payload["system"] = system

    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Ollama HTTP {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        text = data.get("response", "")
        return {"text": text, "tool_calls": [], "provider": "ollama"}


async def _call_ollama_chat(
    messages: List[Dict],
    system: str = "",
    max_tokens: int = 1000,
) -> Dict:
    chat_messages = []
    if system:
        chat_messages.append({"role": "system", "content": system})
    chat_messages.extend(messages)

    payload = {
        "model": OLLAMA_MODEL,
        "messages": chat_messages,
        "stream": False,
        "options": {"num_predict": max_tokens, "temperature": 0.7},
    }
    async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
        resp = await client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        if resp.status_code != 200:
            raise RuntimeError(f"Ollama chat HTTP {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        text = data.get("message", {}).get("content", "")
        return {"text": text, "tool_calls": [], "provider": "ollama"}


# ─── CLAUDE CLIENT ─────────────────────────────────────────
async def _call_claude(
    prompt: str,
    system: str = "",
    max_tokens: int = 1000,
    tools: Optional[List[str]] = None,
    tool_registry=None,
) -> Dict:
    if not ANTHROPIC_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not set – cannot use Claude fallback")

    headers = {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    tool_descriptions = []
    if tools and tool_registry:
        for name in tools:
            if name in tool_registry.list_tools():
                tool_descriptions.append({
                    "name": name,
                    "description": tool_registry.descriptions[name],
                    "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}},
                })

    data: Dict[str, Any] = {
        "model": CLAUDE_MODEL,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": prompt}],
    }
    if tool_descriptions:
        data["tools"] = tool_descriptions

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=data)
        if resp.status_code != 200:
            raise RuntimeError(f"Claude API error {resp.status_code}: {resp.text[:300]}")
        result = resp.json()
        text = result["content"][0]["text"] if result.get("content") else ""
        tool_calls = result["content"][1:] if len(result.get("content", [])) > 1 else []
        return {"text": text, "tool_calls": tool_calls, "provider": "claude"}


# ─── HEALTH CHECK ──────────────────────────────────────────
async def ollama_is_available() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def get_llm_status() -> Dict:
    ollama_ok = await ollama_is_available()
    claude_ok  = bool(ANTHROPIC_KEY)
    return {
        "ollama": {"available": ollama_ok, "model": OLLAMA_MODEL, "url": OLLAMA_BASE_URL},
        "claude": {"available": claude_ok, "model": CLAUDE_MODEL},
        "active_provider": (
            "ollama" if (LLM_PROVIDER == "ollama" or (LLM_PROVIDER == "auto" and ollama_ok))
            else "claude"
        ),
        "llm_provider_setting": LLM_PROVIDER,
    }


# ─── MAIN ROUTER ────────────────────────────────────────────
async def call_llm(
    prompt: str,
    system: str = "",
    max_tokens: int = 1000,
    tools: Optional[List[str]] = None,
    tool_registry=None,
    force_provider: Optional[str] = None,
) -> Dict:
    provider = force_provider or LLM_PROVIDER

    if provider == "claude":
        return await _call_claude(prompt, system, max_tokens, tools, tool_registry)

    if provider == "ollama":
        return await _call_ollama(prompt, system, max_tokens)

    # AUTO mode
    try:
        result = await _call_ollama(prompt, system, max_tokens)
        logger.debug(f"LLM response via Ollama ({OLLAMA_MODEL})")
        return result
    except Exception as ollama_err:
        if ANTHROPIC_KEY:
            logger.warning(f"Ollama unavailable ({ollama_err}) – falling back to Claude")
            result = await _call_claude(prompt, system, max_tokens, tools, tool_registry)
            return result
        else:
            raise RuntimeError(
                f"Ollama failed ({ollama_err}) and no ANTHROPIC_API_KEY set for fallback."
            ) from ollama_err


# ─── STRUCTURED OUTPUT HELPER ──────────────────────────────
async def call_llm_json(
    prompt: str,
    system: str = "",
    max_tokens: int = 1000,
    retries: int = 2,
) -> Dict:
    json_system = (system + "\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown code fences.").strip()
    json_prompt = prompt + "\n\nRespond only with valid JSON."

    for attempt in range(retries + 1):
        try:
            raw = await call_llm(json_prompt, json_system, max_tokens)
            text = raw["text"].strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse failed (attempt {attempt+1}): {e}")
            if attempt == retries:
                logger.error("All JSON parse attempts failed – returning empty dict")
                return {}
    return {}
