"""
Frequency Guild Ψ — Sovereign Hive v11.0
Letter/Word/Healing Frequencies with Schumann baseline.
TITLE X: All matter, thought, law = vibration.
"""

import math
import sqlite3
from typing import Dict, List, Optional, Tuple

from backend.core.db import get_db
from backend.core.hdc import hdc

class FrequencyGuild:
    """
    Maps letters, words, emotions → Hz.
    Provides healing frequencies, task resonance, and audio params.
    TITLE X: All matter, thought, law = vibration.
    """

    SCHUMANN_BASELINE = 7.83

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

    def __init__(self):
        self._ensure_table()

    def _ensure_table(self):
        """Ensure frequency_map table exists."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS frequency_map (
                char TEXT PRIMARY KEY,
                numeric_val INTEGER,
                sound_hz REAL,
                note_name TEXT,
                color_hex TEXT,
                emotional_tag TEXT,
                solfeggio_hz REAL,
                source TEXT
            )
        """)
        conn.commit()

    def letter(self, char: str) -> Dict:
        """Get frequency data for a single letter."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM frequency_map WHERE char=?", (char.upper(),))
        r = c.fetchone()
        conn.close()
        if not r:
            return {"error": f"No data for '{char}'"}
        d = dict(r)
        # Add HD resonance
        emotion = d.get("emotional_tag", "SILENCE").upper()
        d["hd_resonance"] = round(abs(hdc.similarity(
            hdc.get(emotion if emotion else "SILENCE"),
            hdc.get("HARMONY")
        )), 4)
        return d

    def word(self, word: str) -> Dict:
        """Compute the vibrational frequency of a word from its letters."""
        conn = get_db()
        c = conn.cursor()
        freqs, colors, emos = [], [], []
        for ch in word.upper():
            c.execute("SELECT sound_hz, color_hex, emotional_tag FROM frequency_map WHERE char=?", (ch,))
            r = c.fetchone()
            if r:
                freqs.append(r[0])
                colors.append(r[1])
                emos.append(r[2])
        conn.close()
        if not freqs:
            return {"error": "No frequency data"}
        avg = sum(freqs) / len(freqs)
        sr = avg / self.SCHUMANN_BASELINE
        hs = 1 - abs((sr % 1) - 0.5) * 2
        return {
            "word": word,
            "average_hz": round(avg, 2),
            "letters_mapped": len(freqs),
            "schumann_ratio": round(sr, 2),
            "harmonic_score": round(hs, 4),
            "dominant_emotion": max(set(emos), key=emos.count) if emos else "unknown",
            "color_palette": list(set(colors[:5])),
            "synth_params": self._synth_params(avg),
        }

    def heal(self, state: str) -> Dict:
        """Get healing frequency for an emotional state."""
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
            "schumann_ratio": round(hz / self.SCHUMANN_BASELINE, 2),
            "synth_params": self._synth_params(hz),
            "basis": "TITLE X Art.3 — Resonance as Right"
        }

    def agent_hz(self, name: str) -> float:
        """Compute an agent's resonant frequency from genome + ELO."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            SELECT spirituality, mysticism, oracle_sensitivity, energy
            FROM agent_genome WHERE agent_name=?
        """, (name,))
        g = c.fetchone()
        c.execute("SELECT rating FROM elo_rating WHERE agent_name=?", (name,))
        e = c.fetchone()
        conn.close()
        if not g:
            return self.SCHUMANN_BASELINE
        score = ((g[0] + g[1] + g[2] + g[3]) / 4) * (((e[0] if e else 1200)) / 1200)
        return round(self.SCHUMANN_BASELINE * max(1, int(score * 55)), 2)

    def task_resonance(self, agent: str, task_hz: float) -> float:
        """Compute resonance score for agent-task pairing. Must be ≥ 0.7."""
        ahz = self.agent_hz(agent)
        if not task_hz:
            return 1.0
        return round(min(ahz, task_hz) / max(ahz, task_hz), 4)

    def spectrum(self) -> List[Dict]:
        """Get full frequency spectrum."""
        conn = get_db()
        c = conn.cursor()
        c.execute("""
            SELECT char, sound_hz, emotional_tag, color_hex
            FROM frequency_map ORDER BY sound_hz
        """)
        rows = c.fetchall()
        conn.close()
        return [
            {"char": r[0], "hz": r[1], "emotion": r[2], "color": r[3]}
            for r in rows
        ]

    def _synth_params(self, hz: float) -> Dict:
        """Generate synthesizer parameters for a frequency."""
        return {
            "base_frequency_hz": hz,
            "waveform": "sine",
            "duration_seconds": 60,
            "amplitude": 0.7,
            "overtones": [hz * 2, hz * 3, hz / 2],
            "schumann_blend_hz": self.SCHUMANN_BASELINE,
        }

    def word_frequency(self, word: str) -> Dict:
        """Alias for word() — compatibility with existing code."""
        return self.word(word)

    def letter_frequency(self, char: str) -> Dict:
        """Alias for letter() — compatibility with existing code."""
        return self.letter(char)

    def emotional_frequency(self, emotion: str) -> Dict:
        """Alias for heal() — compatibility with existing code."""
        return self.heal(emotion)

    def resonance_between(self, concept1: str, concept2: str) -> float:
        """Compute resonance between two concepts via HD vectors."""
        v1 = hdc.encode_sequence(concept1.split())
        v2 = hdc.encode_sequence(concept2.split())
        return round(hdc.similarity(v1, v2), 4)

    def concept_to_hz(self, concept: str) -> float:
        """Map a concept to a frequency using HD vector similarity."""
        v = hdc.encode_sequence(concept.split())
        # Use Schumann as base, modulate by HD similarity
        base = self.SCHUMANN_BASELINE
        modulation = 1 + 0.5 * v[0]  # Use first dimension as modulation
        return round(base * modulation, 2)

    def get_frequency_table(self) -> Dict[str, float]:
        """Get full frequency table mapping characters to Hz."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT char, sound_hz FROM frequency_map")
        rows = c.fetchall()
        conn.close()
        return {r[0]: r[1] for r in rows}

    def get_emotional_spectrum(self) -> Dict[str, Tuple[float, str]]:
        """Get healing frequency map."""
        return self.HEALING_MAP

    def heal_agent(self, agent_name: str, emotional_state: str) -> Dict:
        """Heal an agent by adjusting their frequency."""
        hz, desc = self.HEALING_MAP.get(emotional_state.lower(), self.HEALING_MAP["default"])
        current = self.agent_hz(agent_name)
        healed = (current + hz) / 2  # Blend towards healing frequency
        return {
            "agent": agent_name,
            "emotional_state": emotional_state,
            "healing_hz": hz,
            "current_hz": current,
            "healed_hz": round(healed, 2),
            "description": desc,
        }

frequency_guild = FrequencyGuild()
