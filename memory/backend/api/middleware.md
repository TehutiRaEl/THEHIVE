# api/middleware

Middleware Module — Sovereign Hive v11.0

## Classes

- `RateLimiter` — Sliding window rate limiter per user/IP.
- `RateLimitMiddleware` — FastAPI middleware for rate limiting.
- `LoggingMiddleware` — Log all requests with timing information.
- `ConstitutionMiddleware` — Enforce soul.md on all requests.
- `SecurityHeadersMiddleware` — Add security headers to all responses.
- `RequestIDMiddleware` — Add a unique request ID to every request.
- `PromptInjectionMiddleware` — Scan incoming request bodies for prompt injection payloads.

## Functions

- `scan_for_injection()` — Scan text for prompt injection patterns.
- `check()` — Check if request is allowed. Returns (allowed, remaining).

## Links

[[core.config]] · [[core.constitution]] · [[core.db]]
