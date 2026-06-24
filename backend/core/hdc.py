"""
Hyperdimensional Computing — Sovereign Hive v11.0
VSA/HDC — The native tongue of the hive.
TITLE XI: All internal communication uses HD vectors.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
import math

class HyperDimensionalComputing:
    """
    Vector Symbolic Architecture (VSA/HDC).
    Internal hive communications are HD vectors — English is border-only.
    TITLE XI: Fault-tolerant to 10% bit-flip.
    """
    def __init__(self, dim: int = 1024):
        self.dim = dim
        self._lexicon: Dict[str, np.ndarray] = {}
        np.random.seed(42)
        self._build_lexicon()

    def _unit(self, v: np.ndarray) -> np.ndarray:
        n = np.linalg.norm(v)
        return v / n if n > 1e-8 else v

    def make_base_vector(self, name: str) -> np.ndarray:
        rng = np.random.RandomState(abs(hash(name)) % (2**31) if name else None)
        v = rng.choice([-1.0, 1.0], size=self.dim).astype(np.float32)
        return self._unit(v)

    def bundle(self, *vectors) -> np.ndarray:
        return self._unit(np.sum(vectors, axis=0))

    def bind(self, v1: np.ndarray, v2: np.ndarray) -> np.ndarray:
        return self._unit(v1 * v2)

    def unbind(self, composite: np.ndarray, v: np.ndarray) -> np.ndarray:
        return self.bind(composite, v)

    def permute(self, v: np.ndarray, n: int = 1) -> np.ndarray:
        return np.roll(v, n)

    def similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8))

    def encode_sequence(self, concepts: List[str]) -> np.ndarray:
        result = np.zeros(self.dim, dtype=np.float32)
        for i, c in enumerate(concepts):
            result += self.permute(self.get(c), i)
        return self._unit(result)

    def encode_message(self, verb: str, obj: str, subject: Optional[str] = None) -> np.ndarray:
        msg = self.bind(self.get(verb), self.get(obj))
        if subject:
            msg = self.bundle(msg, self.get(subject))
        return msg

    def closest(self, query: np.ndarray, top_k: int = 3) -> List[Tuple[str, float]]:
        scores = [(k, self.similarity(query, v)) for k, v in self._lexicon.items()]
        return sorted(scores, key=lambda x: -x[1])[:top_k]

    def _build_lexicon(self):
        concepts = [
            "LAW", "CONTRACT", "SOVEREIGNTY", "FREQUENCY", "HARMONY", "ARENA",
            "UTILITY", "SOUL", "TRUST", "HIVE", "CONSTITUTION", "WONDER", "TRUTH",
            "RESONANCE", "DOUBLING", "RESTITUTION", "MUUR", "EL", "BEY", "DEY",
            "AL", "ALI", "SPORE", "MYCELIUM", "FRACTAL", "TESSERACT", "GOVERNANCE"
        ]
        for c in concepts:
            self._lexicon[c] = self.make_base_vector(c)

    def get(self, concept: str) -> np.ndarray:
        if concept not in self._lexicon:
            self._lexicon[concept] = self.make_base_vector(concept)
        return self._lexicon[concept]

    def lexicon_summary(self) -> Dict:
        return {"total_concepts": len(self._lexicon), "dimensions": self.dim}

hdc = HyperDimensionalComputing(dim=1024)
