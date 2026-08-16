"""
HiveMesh — Sovereign Hive
Cross-colony event dispatch and health monitoring.
Fans out events from the Queen to all known colonies via HTTP.
Caches colony health for CACHE_TTL seconds to avoid hammering offline nodes.
Retries with exponential backoff; circuit breaker halts failing colonies.
HMAC-SHA256 signs every dispatch for colony-side verification.
"""

import asyncio
import hashlib
import hmac
import json
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import httpx

from backend.core.config import settings
from backend.core.hitl import hitl
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

CACHE_TTL = 300          # health cache TTL (seconds)
CIRCUIT_THRESHOLD = 3   # consecutive failures before opening circuit
CIRCUIT_RESET_SECS = 60 # seconds before testing a tripped circuit

# ─── Tier gate (PERMISSIONS.md) ──────────────────────────────────────────────
# Tier 1 — AUTONOMOUS: "reversible, internal, no external party, no money, no
# legal weight." These event types never cause a colony to take an outward-
# facing or stateful action on their own — they are read-only or relay
# already-approved law — so hive_mesh may fire them without a human in the
# loop. Everything else is Tier-2/3-shaped (first contact, publishing,
# commercial/task actions) and PERMISSIONS.md requires the founder's go
# before it goes out — dispatch() holds those for review via the existing
# HITL queue (backend/core/hitl.py) instead of firing blind.
TIER1_SAFE_EVENT_TYPES = frozenset({
    "health_check",
    "manifest_query",
    "capabilities_query",
    "info_query",
    "constitution_update",
    "constitution_sync",
    "ping",
})


def _hmac_sign(body: bytes) -> str:
    """HMAC-SHA256 sign a payload with the JWT secret."""
    secret = settings.jwt_secret_key.encode()
    return "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()


class HiveMesh:
    """
    Fan-out event dispatcher for the Sovereign Hive.
    Queen POSTs events to every healthy colony's /colony/events endpoint.
    Health checks are cached to avoid thundering herd on degraded colonies.
    Circuit breaker opens after CIRCUIT_THRESHOLD consecutive failures.
    All dispatches are HMAC-signed for colony-side verification.
    """

    def __init__(self):
        # colony_id → (healthy: bool, checked_at: float)
        self._health_cache: Dict[str, Tuple[bool, float]] = {}
        # colony_id → consecutive failure count
        self._failure_counts: Dict[str, int] = {}
        # colony_id → timestamp when circuit opened
        self._circuit_opened_at: Dict[str, float] = {}

    async def dispatch(
        self,
        event_type: str,
        payload: Dict[str, Any],
        targets: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """
        Fan out an event to target colonies (all if targets is None).
        `event_type` is classified against PERMISSIONS.md's Tier 1 allow-list
        first: Tier-1-safe types dispatch immediately; anything else is held
        for founder review through the HITL queue instead of firing blind.
        Returns {colony_id: event_id | "failed" | "skipped" | "held_for_review"}.
        """
        target_ids = targets if targets else list(_COLONY_URLS.keys())

        if event_type not in TIER1_SAFE_EVENT_TYPES:
            request_id = await hitl.request_approval(
                action_type=f"hive_mesh.dispatch:{event_type}",
                params={"event_type": event_type, "payload": payload, "targets": target_ids},
                requested_by="hive_mesh",
            )
            hive_protocol.publish_sync(
                "hive.dispatch.held",
                {
                    "event_type": event_type,
                    "targets": target_ids,
                    "hitl_request_id": request_id,
                    "reason": "event_type is not in TIER1_SAFE_EVENT_TYPES; held for founder review per PERMISSIONS.md",
                },
            )
            return {cid: "held_for_review" for cid in target_ids}

        return await self._fire(event_type, payload, target_ids)

    async def _fire(
        self, event_type: str, payload: Dict[str, Any], target_ids: List[str]
    ) -> Dict[str, str]:
        """Actually send `event_type` to every colony in `target_ids`. No tier
        check, no HITL gate — callers (dispatch() for Tier-1-safe events,
        redispatch_approved() for a founder-approved held event) have already
        decided this is allowed to fire."""
        results: Dict[str, str] = {}

        _timeout = httpx.Timeout(connect=3.0, read=8.0, write=5.0, pool=5.0)
        async with httpx.AsyncClient(timeout=_timeout) as client:
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

    async def redispatch_approved(
        self,
        event_type: str,
        payload: Dict[str, Any],
        targets: Optional[List[str]] = None,
    ) -> Dict[str, str]:
        """Replay a HITL-approved hive_mesh.dispatch: request through the real
        send path. Called from the /hitl/resolve handler once a request whose
        action_type starts with 'hive_mesh.dispatch:' is approved — never from
        dispatch() itself, so an already-approved event can't loop back through
        the Tier gate and get held a second time. Staleness: resolve_request()
        already refuses to approve anything whose status isn't still 'pending'
        (hitl.py's own auto-expire flips it to 'expired' after
        settings.hitl_timeout_seconds), so a request that sat too long is
        rejected by the approval step itself, before it ever reaches here —
        there is no separate freshness window to enforce in this method."""
        target_ids = targets if targets else list(_COLONY_URLS.keys())
        results = await self._fire(event_type, payload, target_ids)
        hive_protocol.publish_sync(
            "hive.dispatch.redispatched",
            {"event_type": event_type, "targets": target_ids, "results": results},
        )
        return results

    def _is_circuit_open(self, colony_id: str) -> bool:
        """Return True if the circuit breaker is open (colony paused)."""
        if self._failure_counts.get(colony_id, 0) >= CIRCUIT_THRESHOLD:
            opened_at = self._circuit_opened_at.get(colony_id, 0)
            import time as _time
            if _time.monotonic() - opened_at < CIRCUIT_RESET_SECS:
                return True
            # Reset after cooldown
            self._failure_counts[colony_id] = 0
        return False

    async def _send_to_colony(
        self,
        client: httpx.AsyncClient,
        colony_id: str,
        event_type: str,
        payload: Dict[str, Any],
    ) -> str:
        """POST event to one colony. Retry with backoff. Returns event_id or 'failed'."""
        if self._is_circuit_open(colony_id):
            return "circuit_open"

        if not await self._is_healthy(client, colony_id):
            return "skipped"

        url = f"{_COLONY_URLS[colony_id]}/colony/events"
        body = {"event_type": event_type, "payload": payload, "source": "queen"}
        body_bytes = json.dumps(body).encode()
        signature = _hmac_sign(body_bytes)
        headers = {
            "Content-Type": "application/json",
            "X-Hive-Signature": signature,
            "X-Hive-Source": "queen",
        }

        backoff = 1.0
        for attempt in range(2):
            try:
                r = await client.post(url, content=body_bytes, headers=headers)
                if r.status_code < 500:
                    self._failure_counts[colony_id] = 0
                    data = r.json()
                    return data.get("event_id", str(uuid.uuid4()))
            except Exception:
                if attempt == 0:
                    await asyncio.sleep(backoff)
                    backoff *= 2

        # Trip circuit breaker after exhausting retries
        import time as _time
        self._failure_counts[colony_id] = self._failure_counts.get(colony_id, 0) + 1
        if self._failure_counts[colony_id] >= CIRCUIT_THRESHOLD:
            self._circuit_opened_at[colony_id] = _time.monotonic()
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
