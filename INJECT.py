# THEHIVE/bridge/inject.py
# Wired injection = portable prompt packet (no silent live post to external AIs)

from __future__ import annotations

import json
from typing import Any


SUPPORTED = ("claude", "deepseek", "grok", "chatgpt", "gemini", "hive", "generic")


class InjectionEngine:
    """
    Builds an injection package for a target platform.
    Live paste/API send remains operator-gated; this layer always works offline.
    """

    def inject(self, bridge: dict[str, Any], target_platform: str) -> dict[str, Any]:
        target = (target_platform or "generic").lower().strip()
        if target not in SUPPORTED:
            raise ValueError(f"Unsupported target platform: {target_platform}")
        packet = self._base_packet(bridge, target)
        if target == "claude":
            return self.inject_claude(bridge, packet)
        if target == "deepseek":
            return self.inject_deepseek(bridge, packet)
        if target == "grok":
            return self.inject_grok(bridge, packet)
        if target == "chatgpt":
            return self.inject_chatgpt(bridge, packet)
        if target == "gemini":
            return self.inject_gemini(bridge, packet)
        if target == "hive":
            return self.inject_hive(bridge, packet)
        return self.inject_generic(bridge, packet)

    def _base_packet(self, bridge: dict[str, Any], target: str) -> dict[str, Any]:
        c = bridge.get("compressed") or {}
        return {
            "target": target,
            "bridge_id": bridge.get("id"),
            "mode": "clipboard_or_system_prompt",
            "operator_gate": True,
            "prompt_text": self._render_prompt(c, target),
            "structured": {
                "header": c.get("header"),
                "essence": c.get("essence"),
                "decisions": c.get("decisions"),
                "threads": c.get("threads"),
                "architecture_tags": c.get("architecture_tags"),
            },
        }

    def _render_prompt(self, compressed: dict[str, Any], target: str) -> str:
        lines = [
            f"[HIVE BRIDGE INJECT → {target}]",
            "Continue from this compressed session context. Do not invent prior work.",
            "",
            "## Header",
            json.dumps(compressed.get("header") or {}, indent=2),
            "",
            "## Essence",
        ]
        for e in compressed.get("essence") or []:
            lines.append(f"- {e}")
        lines.append("")
        lines.append("## Decisions")
        for d in compressed.get("decisions") or []:
            lines.append(f"- {d}")
        lines.append("")
        lines.append("## Open threads")
        for t in compressed.get("threads") or []:
            lines.append(f"- {t}")
        lines.append("")
        lines.append("## Architecture tags")
        lines.append(", ".join(compressed.get("architecture_tags") or []) or "(none)")
        return "\n".join(lines)

    def inject_claude(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Paste as first message or Project knowledge snippet."
        return packet

    def inject_deepseek(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Paste as system/context prefix."
        return packet

    def inject_grok(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Paste at session start; pair with STANDING_CHANNEL.md if in Hive."
        return packet

    def inject_chatgpt(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Paste into custom GPT instructions or first turn."
        return packet

    def inject_gemini(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Paste as context; keep under model context limits."
        return packet

    def inject_hive(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Write prompt_text to medium_channel or conversation_logs."
        packet["mode"] = "hive_file"
        return packet

    def inject_generic(self, bridge: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
        packet["hint"] = "Portable text packet for any model."
        return packet
