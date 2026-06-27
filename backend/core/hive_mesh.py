"""
HiveMesh — Sovereign Hive
Cross-colony event dispatch and health monitoring.
Fans out events from the Queen to all known colonies via HTTP.
Caches colony health for CACHE_TTL seconds to avoid hammering offline nodes.
Retries once with exponential backoff on transient failures.
"""

import asyncio
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import httpx

from backend.core.config import settings
from backend.core.protocol import hive_protocol

# ─── Colony registry (id → base URL) ────────────────────────────────────────
_COLONY_URLS: Dict[str, str] = {
    "localagi": settings.localagi_url,
    "nar2": settings.nar2_url,
    "4dbrain": settings.fourdbrain_url,
    "aether": settings.aether_url,
    "automatisch": settings.automatisch_url,
    "kimi-k2": settings.kimi_k2_url,
}

CACHE_TTL = 300  # seconds — 5 minutes


class HiveMesh:
    """
    Fan-out event dispatcher for the Sovereign Hive.
    Queen POSTs events to every healthy colony's /colony/events endpoint.
    Health checks are cached to avoid thundering herd on degraded colonies.
    """

    def __init__(self):
        # colony_id → (healthy: bool, checked_at: float)
        self._health_cache: Dict[str, Tuple[bool, float]] = {}

    async def dispatch(
        self,
        event_type: str,
        payload: Dict[str, Any],
        targets: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """
        Fan out an event to target colonies (all if targets is None).
        Returns {colony_id: event_id | "failed" | "skipped"}.
        """
        target_ids = targets if targets else list(_COLONY_URLS.keys())
        results: Dict[str, str] = {}

        async with httpx.AsyncClient(timeout=5.0) as client:
            tasks = [
                self._send_to_colony(client, cid, event_type, payload)
                for cid in target_ids
                if cid in _COLONY_URLS
            ]
            outcomes = await asyncio.gather(*tasks, return_exceptions=True)

        for cid, outcome in zip(
            [c for c in target_ids if c in _COLONY_URLS], outcomes
        ):
            if isinstance(outcome, Exception):
                results[cid] = "failed"
            else:
                results[cid] = outcome

        hive_protocol.publish_sync(
            "hive.dispatch",
            {"event_type": event_type, "targets": list(results.keys()), "results": results},
        )
        return results

    async def _send_to_colony(
        self,
        client: httpx.AsyncClient,
        colony_id: str,
        event_type: str,
        payload: Dict[str, Any],
    ) -> str:
        """POST event to one colony. Retry once on failure. Returns event_id or 'failed'."""
        if not await self._is_healthy(client, colony_id):
            return "skipped"

        url = f"{_COLONY_URLS[colony_id]}/colony/events"
        body = {"event_type": event_type, "payload": payload, "source": "queen"}

        for attempt in range(2):
            try:
                r = await client.post(url, json=body)
                if r.status_code < 500:
                    data = r.json()
                    return data.get("event_id", str(uuid.uuid4()))
            except Exception:
                if attempt == 0:
                    await asyncio.sleep(2)

        # Mark colony as unhealthy after repeated failure
        self._health_cache[colony_id] = (False, asyncio.get_event_loop().time())
        return "failed"

    async def _is_healthy(self, client: httpx.AsyncClient, colony_id: str) -> bool:
        """Return cached health or perform a fresh /colony/health check."""
        now = asyncio.get_event_loop().time()
        cached = self._health_cache.get(colony_id)
        if cached and (now - cached[1]) < CACHE_TTL:
            return cached[0]

        url = f"{_COLONY_URLS[colony_id]}/colony/health"
        try:
            r = await client.get(url, timeout=3.0)
            healthy = r.status_code == 200
        except Exception:
            healthy = False

        self._health_cache[colony_id] = (healthy, now)
        return healthy

    async def check_all_health(self) -> Dict[str, Any]:
        """Return health status dict for all known colonies."""
        results: Dict[str, Any] = {}
        async with httpx.AsyncClient(timeout=5.0) as client:
            for colony_id, base_url in _COLONY_URLS.items():
                url = f"{base_url}/colony/health"
                try:
                    r = await client.get(url, timeout=3.0)
                    data = r.json() if r.status_code == 200 else {}
                    results[colony_id] = {
                        "status": "healthy" if r.status_code == 200 else "degraded",
                        "http_status": r.status_code,
                        "url": base_url,
                        **data,
                    }
                    self._health_cache[colony_id] = (
                        r.status_code == 200,
                        asyncio.get_event_loop().time(),
                    )
                except Exception as e:
                    results[colony_id] = {
                        "status": "offline",
                        "url": base_url,
                        "error": str(e),
                    }
                    self._health_cache[colony_id] = (False, asyncio.get_event_loop().time())
        return results

    async def get_manifest(self, colony_id: str) -> Optional[Dict]:
        """Fetch /colony/manifest from a specific colony."""
        url = _COLONY_URLS.get(colony_id)
        if not url:
            return None
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{url}/colony/manifest")
                return r.json() if r.status_code == 200 else None
        except Exception:
            return None


hive_mesh = HiveMesh()
