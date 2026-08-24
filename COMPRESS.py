# THEHIVE/bridge/compress.py
# Wired AIST-style structural compression (essence / memory / decisions / threads)

from __future__ import annotations

import json
from typing import Any


class CompressionEngine:
    """Compresses capture payload into a stable bridge packet."""

    def compress(self, context: dict[str, Any]) -> dict[str, Any]:
        packet = {
            "header": self.generate_header(context),
            "essence": self.extract_essence(context),
            "memory": self.extract_memory(context),
            "decisions": self.extract_decisions(context),
            "threads": self.extract_threads(context),
            "rejected": list(context.get("rejected_approaches") or [])[:15],
            "architecture_tags": list(context.get("architecture") or [])[:30],
        }
        packet["stats"] = {
            "approx_input_chars": self._input_chars(context),
            "approx_output_chars": len(json.dumps(packet, default=str)),
        }
        return packet

    def generate_header(self, context: dict[str, Any]) -> dict[str, Any]:
        meta = context.get("metadata") or {}
        return {
            "protocol": "AIST-hive-v1",
            "capture_id": context.get("id"),
            "captured_at": context.get("captured_at"),
            "source": meta.get("source"),
            "platform": meta.get("platform"),
            "message_count": len(context.get("conversation") or []),
        }

    def extract_essence(self, context: dict[str, Any]) -> list[str]:
        """What was built / concluded — last user+assistant slices + architecture tags."""
        essence: list[str] = []
        for tag in context.get("architecture") or []:
            essence.append(f"arch:{tag}")
        conv = context.get("conversation") or []
        for m in conv[-6:]:
            role = m.get("role", "?")
            content = (m.get("content") or "").strip().replace("\n", " ")
            if content:
                essence.append(f"{role}: {content[:400]}")
        return essence[:24]

    def extract_memory(self, context: dict[str, Any]) -> dict[str, Any]:
        return {
            "code_blocks": len(context.get("code") or []),
            "code_previews": [c[:200] for c in (context.get("code") or [])[:3]],
            "metadata": context.get("metadata") or {},
        }

    def extract_decisions(self, context: dict[str, Any]) -> list[str]:
        return list(context.get("decisions") or [])[:20]

    def extract_threads(self, context: dict[str, Any]) -> list[str]:
        """Open threads = rejected leftovers + rationale without decision + explicit TODO-like lines."""
        threads: list[str] = []
        for r in context.get("rationale") or []:
            threads.append(f"rationale:{r}")
        conv = context.get("conversation") or []
        for m in conv:
            c = m.get("content") or ""
            if any(k in c.lower() for k in ("todo", "next:", "blocked", "waiting on", "phase 1")):
                threads.append(c.strip()[:300])
        return threads[:20]

    def _input_chars(self, context: dict[str, Any]) -> int:
        n = 0
        for m in context.get("conversation") or []:
            n += len(m.get("content") or "")
        for c in context.get("code") or []:
            n += len(c)
        return n
