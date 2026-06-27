"""
Middleware Module — Sovereign Hive v11.0
Rate limiting, CORS, logging, constitution enforcement.
"""

import time
import logging
from collections import defaultdict
from typing import Dict, Tuple
from threading import Lock

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from backend.core.config import settings
from backend.core.constitution import constitution
from backend.core.db import get_db
from backend.core.validator import validator

logger = logging.getLogger("jasper.middleware")

# ─── Rate Limiter ──────────────────────────────────────────────
class RateLimiter:
    """
    Sliding window rate limiter per user/IP.
    Cleanup runs every 10 minutes to prevent memory leaks.
    """

    def __init__(self, requests_per_window: int, window_seconds: int):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self._buckets: Dict[str, list] = defaultdict(list)
        self._lock = Lock()
        self._last_cleanup = time.time()

    def check(self, key: str) -> Tuple[bool, int]:
        """Check if request is allowed. Returns (allowed, remaining)."""
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            if now - self._last_cleanup > 600:
                self._cleanup_old_buckets(now)
                self._last_cleanup = now

            bucket = self._buckets[key]
            bucket = [ts for ts in bucket if ts > window_start]
            self._buckets[key] = bucket

            if len(bucket) >= self.requests_per_window:
                return False, 0

            bucket.append(now)
            return True, self.requests_per_window - len(bucket)

    def _cleanup_old_buckets(self, now: float):
        """Remove buckets that haven't been used in 2 windows."""
        cutoff = now - (self.window_seconds * 2)
        dead_keys = [k for k, v in self._buckets.items() if not v or max(v) < cutoff]
        for k in dead_keys:
            del self._buckets[k]
        if dead_keys:
            logger.info(f"Rate limiter cleanup: removed {len(dead_keys)} stale buckets")

rate_limiter = RateLimiter(settings.rate_limit_requests, settings.rate_limit_window)

# ─── Rate Limit Middleware ─────────────────────────────────────
class RateLimitMiddleware(BaseHTTPMiddleware):
    """FastAPI middleware for rate limiting."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/docs", "/openapi.json", "/"]:
            return await call_next(request)

        client_id = request.client.host if request.client else "unknown"
        api_key = request.headers.get("X-API-Key")
        if api_key:
            client_id = f"key_{api_key[:8]}"

        allowed, remaining = rate_limiter.check(client_id)
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"error": f"Rate limit exceeded. Try again in {settings.rate_limit_window}s"}
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Limit"] = str(settings.rate_limit_requests)
        return response

# ─── Request Logging Middleware ──────────────────────────────
class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests with timing information."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path

        logger.info(f"Request: {method} {path} from {client_ip}")

        response = await call_next(request)

        duration = (time.time() - start_time) * 1000
        logger.info(f"Response: {method} {path} -> {response.status_code} ({duration:.2f}ms)")

        return response

# ─── Constitution Middleware ──────────────────────────────────
class ConstitutionMiddleware(BaseHTTPMiddleware):
    """Enforce soul.md on all requests."""

    async def dispatch(self, request: Request, call_next):
        if request.url.path in ["/health", "/docs", "/openapi.json", "/", "/favicon.ico"]:
            return await call_next(request)

        if request.url.path.startswith("/ui/") or request.url.path.startswith("/static/"):
            return await call_next(request)

        violation = await constitution.check_request(request)
        if violation:
            logger.warning(f"Constitution violation: {violation}")
            return JSONResponse(
                status_code=403,
                content={
                    "error": "CONSTITUTION_VIOLATION",
                    "article": violation.get("article"),
                    "details": violation.get("details"),
                    "required_action": violation.get("required_action", "Review soul.md")
                }
            )

        v_result = validator.validate(
            f"{request.method}:{request.url.path}",
            {"path": request.url.path, "method": request.method},
        )
        if not v_result.allowed:
            logger.warning(f"F-law violation {v_result.violated_law}: {v_result.rationale}")
            return JSONResponse(
                status_code=403,
                content={
                    "error": "CONSTITUTION_VIOLATION",
                    "article": v_result.violated_law,
                    "details": v_result.rationale,
                },
            )

        return await call_next(request)

# ─── Security Headers Middleware ─────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

# ─── Request ID Middleware ────────────────────────────────────
class RequestIDMiddleware(BaseHTTPMiddleware):
    """Add a unique request ID to every request."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            import uuid
            request_id = str(uuid.uuid4())[:8]

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

# ─── CORSMiddleware is imported and configured in main.py ────
# ─── All middleware are applied in main.py ────────────────────
