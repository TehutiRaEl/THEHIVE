"""Frequency Guild — manages agent frequencies and healing."""
from typing import Dict


class FrequencyGuild:
    HEALING_MAP = {"anxiety": 528.0, "fear": 396.0, "anger": 417.0, "pain": 174.0, "default": 7.83}

    def __init__(self):
        self.name = "Frequency Guild"
        self.enabled = True

    def agent_frequency(self, agent_name: str) -> float:
        return 7.83

    def word_frequency(self, word: str) -> Dict:
        total_hz = 0
        valid = 0
        for ch in word.upper():
            if ch in ["A", "C", "E", "G"]:
                hz = {"A": 432, "C": 528, "E": 648, "G": 384}.get(ch, 0)
                total_hz += hz
                valid += 1
        if valid == 0:
            return {"word": word, "frequency_hz": 7.83, "schumann_ratio": 1.0, "letters_mapped": 0}
        avg = total_hz / valid
        return {"word": word, "frequency_hz": round(avg, 2), "schumann_ratio": round(avg / 7.83, 2), "letters_mapped": valid}

    def heal(self, emotional_state: str) -> Dict:
        hz = self.HEALING_MAP.get(emotional_state.lower(), self.HEALING_MAP["default"])
        return {"emotional_state": emotional_state, "healing_hz": hz, "schumann_ratio": round(hz / 7.83, 2)}
