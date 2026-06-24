"""
API Package — Sovereign Hive v11.0
Routes, authentication, and middleware modules.
"""

from backend.api.routes import router, ws_manager
from backend.api.auth import verify_auth, create_access_token, verify_websocket_auth
from backend.api.middleware import RateLimiter, rate_limiter, ConstitutionMiddleware, LoggingMiddleware, RateLimitMiddleware

__all__ = [
    "router",
    "ws_manager",
    "verify_auth",
    "create_access_token",
    "verify_websocket_auth",
    "RateLimiter",
    "rate_limiter",
    "ConstitutionMiddleware",
    "LoggingMiddleware",
    "RateLimitMiddleware",
]
