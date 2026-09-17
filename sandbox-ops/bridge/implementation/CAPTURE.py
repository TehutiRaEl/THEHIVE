# THEHIVE/bridge/capture.py
# Wired file-native capture — no external platform required

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any


class CaptureEngine:
    """Captures session context into a structured payload."""

    def capture(self, session_data: dict[str, Any] | None = None) -> dict[str, Any]:
        session_data = session_data or {}
        return {
            "id": session_data.get("id") or f"cap-{uuid.uuid4().hex[:12]}",
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "conversation": self.extract_conversation(session_data),
            "decisions": self.extract_decisions(session_data),
            "rejected_approaches": self.extract_rejected(session_data),
            "rationale": self.extract_rationale(session_data),
            "code": self.extract_code(session_data),
            "architecture": self.extract_architecture(session_data),
            "metadata": self.extract_metadata(session_data),
        }

    def extract_conversation(self, session_data: dict[str, Any]) -> list[dict[str, str]]:
        raw = session_data.get("conversation") or session_data.get("messages") or []
        if isinstance(raw, str):
            return [{"role": "user", "content": raw}]
        out = []
        for m in raw:
            if isinstance(m, dict):
                out.append(
                    {
                        "role": str(m.get("role", "user")),
                        "content": str(m.get("content", m.get("text", "")))[:20000],
                    }
                )
            else:
                out.append({"role": "user", "content": str(m)[:20000]})
        return out

    def extract_decisions(self, session_data: dict[str, Any]) -> list[str]:
        if session_data.get("decisions"):
            return [str(d) for d in session_data["decisions"]]
        text = self._flat_text(session_data)
        found = re.findall(
            r"(?i)(?:decided|decision|locked|we will|chose to)\s*[:\-]?\s*(.+?)(?:\.|$)",
            text,
        )
        return [f.strip()[:500] for f in found[:20]]

    def extract_rejected(self, session_data: dict[str, Any]) -> list[str]:
        if session_data.get("rejected_approaches"):
            return [str(x) for x in session_data["rejected_approaches"]]
        text = self._flat_text(session_data)
        found = re.findall(
            r"(?i)(?:rejected|not doing|avoid|won't|will not)\s*[:\-]?\s*(.+?)(?:\.|$)",
            text,
        )
        return [f.strip()[:500] for f in found[:20]]

    def extract_rationale(self, session_data: dict[str, Any]) -> list[str]:
        if session_data.get("rationale"):
            return [str(x) for x in session_data["rationale"]]
        text = self._flat_text(session_data)
        found = re.findall(
            r"(?i)(?:because|rationale|reason)\s*[:\-]?\s*(.+?)(?:\.|$)",
            text,
        )
        return [f.strip()[:500] for f in found[:20]]

    def extract_code(self, session_data: dict[str, Any]) -> list[str]:
        if session_data.get("code"):
            c = session_data["code"]
            return c if isinstance(c, list) else [str(c)[:8000]]
        text = self._flat_text(session_data)
        blocks = re.findall(r"```[\w]*\n([\s\S]*?)```", text)
        return [b[:8000] for b in blocks[:10]]

    def extract_architecture(self, session_data: dict[str, Any]) -> list[str]:
        if session_data.get("architecture"):
            a = session_data["architecture"]
            return a if isinstance(a, list) else [str(a)]
        text = self._flat_text(session_data)
        keys = re.findall(
            r"(?i)\b(phase\s*\d|layer\s*\d|ladybug|medium_channel|operator grant|child_of|provision)\b",
            text,
        )
        return list(dict.fromkeys(k.lower() for k in keys))[:30]

    def extract_metadata(self, session_data: dict[str, Any]) -> dict[str, Any]:
        return {
            "source": session_data.get("source", "hive_session"),
            "platform": session_data.get("platform", "unknown"),
            "tags": session_data.get("tags") or [],
            "raw_keys": sorted(session_data.keys()),
        }

    def _flat_text(self, session_data: dict[str, Any]) -> str:
        if "text" in session_data:
            return str(session_data["text"])
        parts = []
        for m in self.extract_conversation(session_data):
            parts.append(m.get("content", ""))
        return "\n".join(parts)
