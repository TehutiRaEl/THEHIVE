"""
Browser Agent API — Sovereign Hive v12.0
Dispatch agents to browse the web and extract information.
Pattern: Browser Use library (LLM-controlled Playwright automation).
Falls back to lightweight httpx scraping when Browser Use is not available.
"""

import logging
import re
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl, Field

from backend.core import llm_router

logger = logging.getLogger("jasper.browser")

router = APIRouter(prefix="/v11/browser", tags=["browser"])


class BrowserTaskRequest(BaseModel):
    url: Optional[str] = Field(None, description="Starting URL to navigate to")
    task: str = Field(..., min_length=5, description="What the agent should do / extract")
    max_steps: int = Field(5, ge=1, le=20, description="Max browser interaction steps")
    extract_text: bool = True


class BrowserTaskResult(BaseModel):
    task: str
    url: Optional[str]
    result: str
    method: str   # "browser_use" | "fetch_and_reason" | "llm_only"
    steps: int


async def _fetch_and_reason(url: str, task: str) -> dict:
    """
    Lightweight fallback: fetch page HTML → strip tags → ask LLM to answer task.
    No Playwright needed. Works for most read-only research tasks.
    """
    import httpx
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (SovereignHive/12.0 browser-agent)"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
    except Exception as e:
        return {"result": f"Failed to fetch {url}: {e}", "method": "fetch_and_reason", "steps": 1}

    # Strip HTML tags and collapse whitespace
    text = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S)
    text = re.sub(r"<style[^>]*>.*?</style>", " ", text, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s{3,}", "\n", text).strip()

    # Truncate to ~8K chars to stay within LLM context
    context = text[:8000]

    prompt = f"""You are a web research agent. The user wants to accomplish this task:

TASK: {task}

PAGE CONTENT (from {url}):
---
{context}
---

Based only on the page content above, provide a concise answer to the task.
If the page doesn't contain the needed information, say so clearly."""

    try:
        result = await llm_router.chat(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.2,
        )
        return {"result": result["content"], "method": "fetch_and_reason", "steps": 2, "provider": result.get("provider")}
    except Exception as e:
        return {"result": f"LLM reasoning failed: {e}", "method": "fetch_and_reason", "steps": 2}


async def _browser_use_agent(url: Optional[str], task: str, max_steps: int) -> dict:
    """
    Full browser automation via Browser Use library (LLM + Playwright).
    Requires: pip install browser-use playwright && playwright install chromium
    """
    try:
        from browser_use import Agent as BrowserAgent
        from langchain_openai import ChatOpenAI
        import os

        # Browser Use works with any OpenAI-compatible backend
        # Point it at our local gateway
        gateway_url = os.getenv("LLM_GATEWAY_URL", "http://localhost:8181")
        llm = ChatOpenAI(
            base_url=f"{gateway_url}/v1",
            api_key="hive-gateway",
            model="llama3:8b",
        )
        agent = BrowserAgent(
            task=task if not url else f"Navigate to {url} then: {task}",
            llm=llm,
            max_actions_per_step=3,
        )
        result = await agent.run(max_steps=max_steps)
        final = str(result.final_result() or result.history[-1] if result.history else "No result")
        return {"result": final, "method": "browser_use", "steps": len(result.history) if hasattr(result, "history") else max_steps}
    except ImportError:
        return None  # signal to fall back


@router.post("/task", response_model=BrowserTaskResult)
async def browser_task(req: BrowserTaskRequest):
    """
    Dispatch a browser agent to complete a web task.
    Tries Browser Use (full Playwright automation) first, falls back to
    fetch-and-reason (lightweight httpx + LLM) when Playwright isn't available.
    For tasks without a URL, uses LLM + web search from the agent engine.
    """
    # Try full browser automation first
    if req.url:
        br_result = await _browser_use_agent(req.url, req.task, req.max_steps)
        if br_result:
            return BrowserTaskResult(task=req.task, url=req.url, steps=req.max_steps, **br_result)

        # Fallback: fetch + reason
        fr_result = await _fetch_and_reason(req.url, req.task)
        return BrowserTaskResult(task=req.task, url=req.url, **fr_result)

    # No URL — use ReAct agent with web_search tool
    from backend.core.agent_engine import create_agent
    from backend.core.constitution import constitution
    agent = create_agent(name="BrowserBot", role="browser", soul_hash=constitution.get_hash()[:12])
    agent.max_steps = req.max_steps
    run_result = await agent.run(req.task)
    return BrowserTaskResult(
        task=req.task,
        url=None,
        result=run_result["answer"],
        method="react_agent",
        steps=run_result["steps"],
    )


@router.get("/status")
async def browser_status():
    """Check which browser automation backends are available."""
    status = {}
    try:
        import browser_use  # noqa: F401
        status["browser_use"] = {"available": True}
    except ImportError:
        status["browser_use"] = {
            "available": False,
            "install": "pip install browser-use playwright && playwright install chromium",
        }
    try:
        import httpx  # noqa: F401
        status["fetch_and_reason"] = {"available": True, "note": "lightweight fallback, always available"}
    except ImportError:
        status["fetch_and_reason"] = {"available": False}
    return status
