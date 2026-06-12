"""Async rate limiter with sliding window and cleanup."""
import asyncio
import time
from typing import Dict, Tuple
from collections import defaultdict


class RateLimiter:
    def __init__(self, requests_per_window: int, window_seconds: int):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.buckets: Dict[str, list] = defaultdict(list)
        self.lock = asyncio.Lock()
        self.last_cleanup = time.time()

    async def check(self, key: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - self.window_seconds

        async with self.lock:
            if now - self.last_cleanup > 600:
                self._cleanup_old_buckets(now)
                self.last_cleanup = now

            bucket = [ts for ts in self.buckets[key] if ts > window_start]

            if len(bucket) >= self.requests_per_window:
                return False, 0

            bucket.append(now)
            self.buckets[key] = bucket
            return True, self.requests_per_window - len(bucket)

    def _cleanup_old_buckets(self, now: float):
        cutoff = now - (self.window_seconds * 2)
        dead_keys = [k for k, v in self.buckets.items() if not v or max(v) < cutoff]
        for k in dead_keys:
            del self.buckets[k]
