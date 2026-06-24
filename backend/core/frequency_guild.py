"""
FREQUENCY GUILD Ψ — Letter/Word/Healing Frequencies
TITLE X: All matter, thought, law = vibration.
"""

import math
import sqlite3
from typing import Dict, List, Optional
import numpy as np

from .hdc import hdc

class FrequencyGuild:
    HEALING_MAP = {
        "anxiety": (528.0, "DNA repair / transformation"),
        "fear": (396.0, "Liberation from guilt and fear"),
        "grief": (396.0, "Releasing suppressed emotion"),
        "anger": (417.0, "Undoing, facilitating change"),
        "pain": (174.0, "Natural anaesthetic"),
        "confusion": (741.0, "Awakening intuition"),
        "isolation": (639.0, "Reconnecting with others"),
        "doubt": (852.0, "Returning to spiritual order"),
        "exhaustion": (963.0, "Pineal activation"),
        "trauma": (285.0, "Cellular healing"),
        "default": (7.83, "Schumann baseline"),
    }

    def letter(self, char: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT * FROM frequency_map WHERE char=?", (char.upper(),))
        r = c.fetchone()
        cols = [d[0] for d in c.description] if r else []
        conn.close()
        if not r:
            return {"error": f"No data for '{char}'"}
        d = dict(zip(cols, r))
        d["hd_resonance"] = round(abs(hdc.similarity(
            hdc.get(d.get("emotional_tag", "SILENCE").upper()),
            hdc.get("HARMONY")
        )), 4)
        return d

    def word(self, word: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        freqs, colors, emos = [], [], []
        for ch in word.upper():
            c.execute("SELECT sound_hz,color_hex,emotional_tag FROM frequency_map WHERE char=?", (ch,))
            r = c.fetchone()
            if r:
                freqs.append(r[0])
                colors.append(r[1])
                emos.append(r[2])
        conn.close()
        if not freqs:
            return {"error": "No frequency data"}
        avg = sum(freqs) / len(freqs)
        sr = avg / 7.83
        hs = 1 - abs((sr % 1) - 0.5) * 2
        return {
            "word": word,
            "average_hz": round(avg, 2),
            "letters_mapped": len(freqs),
            "schumann_ratio": round(sr, 2),
            "harmonic_score": round(hs, 4),
            "dominant_emotion": max(set(emos), key=emos.count) if emos else "unknown",
            "color_palette": list(set(colors[:5])),
        }

    def heal(self, state: str) -> Dict:
        sl = state.lower()
        hz, desc = self.HEALING_MAP.get("default")
        for k in self.HEALING_MAP:
            if k in sl:
                hz, desc = self.HEALING_MAP[k]
                break
        return {
            "emotional_state": state,
            "healing_hz": hz,
            "description": desc,
            "schumann_ratio": round(hz / 7.83, 2),
        }

    def agent_hz(self, name: str) -> float:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT spirituality,mysticism,oracle_sensitivity,energy FROM agent_genome WHERE agent_name=?", (name,))
        g = c.fetchone()
        c.execute("SELECT rating FROM elo_rating WHERE agent_name=?", (name,))
        e = c.fetchone()
        conn.close()
        if not g:
            return 7.83
        score = ((g[0] + g[1] + g[2] + g[3]) / 4) * (((e[0] if e else 1200)) / 1200)
        return round(7.83 * max(1, int(score * 55)), 2)

    def task_resonance(self, agent: str, task_hz: float) -> float:
        ahz = self.agent_hz(agent)
        if not task_hz:
            return 1.0
        return round(min(ahz, task_hz) / max(ahz, task_hz), 4)

    def spectrum(self) -> List[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT char,sound_hz,emotional_tag,color_hex FROM frequency_map ORDER BY sound_hz")
        rows = c.fetchall()
        conn.close()
        return [{"char": r[0], "hz": r[1], "emotion": r[2], "color": r[3]} for r in rows]

frequency_guild = FrequencyGuild()
