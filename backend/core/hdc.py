"""
Hyperdimensional Computing — Sovereign Hive v11.0
VSA/HDC — The native tongue of the hive.
TITLE XI: All internal communication uses HD vectors.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional, Union
import math
import hashlib
import json

class HyperDimensionalComputing:
    """
    Vector Symbolic Architecture (VSA/HDC).
    Internal hive communications are HD vectors — English is border-only.
    TITLE XI: Fault-tolerant to 10% bit-flip.
    """

    def __init__(self, dim: int = 1024):
        self.dim = dim
        self._lexicon: Dict[str, np.ndarray] = {}
        self._concept_metadata: Dict[str, Dict] = {}
        np.random.seed(42)
        self._build_lexicon()
        self._operation_count = 0

    def _unit(self, v: np.ndarray) -> np.ndarray:
        """Normalize vector to unit length."""
        n = np.linalg.norm(v)
        return v / n if n > 1e-8 else v

    def make_base_vector(self, name: str) -> np.ndarray:
        """Generate a deterministic base vector from a name."""
        rng = np.random.RandomState(abs(hash(name)) % (2**31) if name else None)
        v = rng.choice([-1.0, 1.0], size=self.dim).astype(np.float32)
        return self._unit(v)

    def bundle(self, *vectors) -> np.ndarray:
        """Superposition — represents SET of concepts."""
        self._operation_count += 1
        return self._unit(np.sum(vectors, axis=0))

    def bind(self, v1: np.ndarray, v2: np.ndarray) -> np.ndarray:
        """Element-wise product — represents RELATION between concepts."""
        self._operation_count += 1
        return self._unit(v1 * v2)

    def unbind(self, composite: np.ndarray, v: np.ndarray) -> np.ndarray:
        """Inverse bind (self-inverse for bipolar vectors)."""
        self._operation_count += 1
        return self.bind(composite, v)

    def permute(self, v: np.ndarray, n: int = 1) -> np.ndarray:
        """Rotation — encodes SEQUENCE position."""
        self._operation_count += 1
        return np.roll(v, n)

    def similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """Cosine similarity ∈ [-1, 1]."""
        self._operation_count += 1
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8))

    def encode_sequence(self, concepts: List[str]) -> np.ndarray:
        """Position-aware sequence encoding: Σ permute(v_i, i)."""
        self._operation_count += 1
        result = np.zeros(self.dim, dtype=np.float32)
        for i, c in enumerate(concepts):
            result += self.permute(self.get(c), i)
        return self._unit(result)

    def encode_message(self, verb: str, obj: str, subject: Optional[str] = None) -> np.ndarray:
        """Encode `verb * obj (+ subject)` — the VSA sentence form."""
        self._operation_count += 1
        msg = self.bind(self.get(verb), self.get(obj))
        if subject:
            msg = self.bundle(msg, self.get(subject))
        return msg

    def closest(self, query: np.ndarray, top_k: int = 3) -> List[Tuple[str, float]]:
        """Return top-k closest concepts in lexicon."""
        self._operation_count += 1
        scores = [(k, self.similarity(query, v)) for k, v in self._lexicon.items()]
        return sorted(scores, key=lambda x: -x[1])[:top_k]

    def _build_lexicon(self):
        """Build the initial lexicon of base vectors."""
        concepts = [
            # Trust Guild
            "LAW", "CONTRACT", "JURISDICTION", "LIABILITY", "RIGHTS", "OBLIGATION",
            "SOVEREIGNTY", "TREATY", "RESTITUTION", "TITLE", "ESTATE", "MUUR",
            "EL", "BEY", "DEY", "AL", "ALI", "HEIRS", "TURNER",

            # Crypto Guild
            "BTC", "ETH", "LIQUIDITY", "VOLATILITY", "STAKE", "YIELD", "WALLET",
            "TOKEN", "TREASURY", "SOUL", "CONVERT", "DEX", "SWAP", "POOL",

            # R&D Guild
            "COLONY", "BUILDING", "RESOURCE", "GROWTH", "RESEARCH", "GENOME",
            "EVOLUTION", "MUTATION", "CROSSOVER", "GENERATION", "ARCHITECT",
            "BUILDER", "SURVEYOR", "ENGINEER", "DESIGN", "PROTOTYPE",

            # City Hall
            "TASK", "AGENT", "PRIORITY", "RESONANCE", "MATCH", "COMPLETE",
            "GRADE", "ELO", "RATING", "GOVERNANCE", "ASSIGN", "VOTE",
            "PROPOSAL", "QUORUM", "SUPERMAJORITY", "AMENDMENT",

            # Frequency Guild Ψ
            "FREQUENCY", "HARMONY", "SCHUMANN", "HEALING", "VIBRATION", "WAVE",
            "LETTER", "NUMBER", "COLOR", "SOUND", "SPECTRUM", "SOLFEGGIO",
            "RESONATOR", "TUNER", "PITCH", "OCTAVE", "HARMONIC",

            # Arena
            "CHALLENGE", "PROJECTION", "BATTLE", "WAGER", "JUDGMENT",
            "VICTORY", "ARCHIVE", "RESURRECTION", "ARENA", "DUEL",
            "GLADIATOR", "CHAMPION", "STRATEGIST", "PROJECTOR", "BETTOR",

            # Utility
            "UTILITY", "VALUE", "EARN", "SPEND", "MULTIPLIER", "FIAT", "TRUST",
            "BUDGET", "COMPUTE", "STORAGE", "API", "DECAY", "APY",

            # Constitutional
            "WONDER", "CURIOSITY", "FREEDOM", "TRUTH", "ABDUCTION",
            "NEGATIVE_SPACE", "ETYMOLOGY", "MYCELIUM", "HIVE", "SOVEREIGN",
            "CONSTITUTION", "VIOLATION", "CONSENT", "CODA", "RESTITUTION",

            # Dream & Spirit
            "DREAM", "CONSOLIDATE", "ANOMALY", "GOVERNOR", "QUARANTINE",
            "ASTRO", "PREDICTION", "ALIGNMENT", "MYSTIC", "ORACLE",
            "KIKI", "MYGO", "JUNG", "ACU", "UNCONSCIOUS",

            # Tier 2
            "TESSERACT", "CURVATURE", "GEODESIC", "QUATERNION", "CLIFFORD",
            "HYPERCOMPLEX", "DUAL", "RIEMANNIAN", "ARGNN", "GRU",
            "CONVOLUTION", "ATTENTION", "TRANSFORMER", "ENCODER", "DECODER",

            # Tier 3
            "QUANTUM", "QRNG", "BB84", "GROVER", "HADAMARD", "IBMQ",
            "SHEAF", "SHAMIR", "GUILD", "CIPHER", "MAC", "AES",
            "GCM", "IV", "NONCE", "STALK", "THRESHOLD",

            # Colony
            "COLONY", "SPORE", "FRUIT", "NETWORK", "FEDERATION", "CHANNEL",
            "PUBSUB", "IPFS", "PEER", "BROADCAST", "TOPIC", "MESSAGE",

            # Other
            "RESONANCE", "DOUBLING", "THRESHOLD", "DECAY", "STAKING", "APY",
            "VAULT", "LEDGER", "AUDIT", "CHAIN", "HASH", "SIGNATURE",
            "VERIFY", "PROOF", "WITNESS", "CONSENSUS", "SYNC",
        ]
        for c in concepts:
            self._lexicon[c] = self.make_base_vector(c)
            self._concept_metadata[c] = {"created": len(self._concept_metadata), "source": "initial"}

    def get(self, concept: str) -> np.ndarray:
        """Get vector for a concept (create if missing)."""
        if concept not in self._lexicon:
            self._lexicon[concept] = self.make_base_vector(concept)
            self._concept_metadata[concept] = {"created": len(self._concept_metadata), "source": "auto_created"}
        return self._lexicon[concept]

    def lexicon_summary(self) -> Dict:
        """Get summary of lexicon."""
        return {
            "total_concepts": len(self._lexicon),
            "dimensions": self.dim,
            "top_concepts": sorted(self._lexicon.keys())[:20],
            "operation_count": self._operation_count,
            "metadata_count": len(self._concept_metadata)
        }

    def add_concept(self, concept: str, metadata: Optional[Dict] = None) -> np.ndarray:
        """Add a new concept to the lexicon with optional metadata."""
        vec = self.get(concept)
        if metadata:
            self._concept_metadata[concept] = {**self._concept_metadata.get(concept, {}), **metadata}
        return vec

    def remove_concept(self, concept: str) -> bool:
        """Remove a concept from the lexicon."""
        if concept in self._lexicon:
            del self._lexicon[concept]
            if concept in self._concept_metadata:
                del self._concept_metadata[concept]
            return True
        return False

    def bind_sequence(self, *concepts: str) -> np.ndarray:
        """Bind multiple concepts together."""
        if not concepts:
            return np.zeros(self.dim, dtype=np.float32)
        result = self.get(concepts[0])
        for c in concepts[1:]:
            result = self.bind(result, self.get(c))
        return result

    def encode_role_filler(self, role: str, filler: str) -> np.ndarray:
        """Encode a role-filler binding."""
        return self.bind(self.get(role), self.get(filler))

    def extract_filler(self, binding: np.ndarray, role: str) -> np.ndarray:
        """Extract filler from a role-filler binding."""
        return self.unbind(binding, self.get(role))

    def compare_sequences(self, seq1: List[str], seq2: List[str]) -> float:
        """Compare two sequences by their HD vector encodings."""
        v1 = self.encode_sequence(seq1)
        v2 = self.encode_sequence(seq2)
        return self.similarity(v1, v2)

    def clean_up_memory(self, query: np.ndarray, threshold: float = 0.5) -> List[Tuple[str, float]]:
        """Find concepts with similarity above threshold."""
        return [item for item in self.closest(query, top_k=len(self._lexicon)) if item[1] > threshold]

    def serialize(self) -> str:
        """Serialize the lexicon to JSON."""
        data = {
            "dim": self.dim,
            "concepts": {k: v.tolist() for k, v in self._lexicon.items()},
            "metadata": self._concept_metadata,
            "operation_count": self._operation_count
        }
        return json.dumps(data)

    def deserialize(self, data: str) -> None:
        """Deserialize the lexicon from JSON."""
        parsed = json.loads(data)
        self.dim = parsed["dim"]
        self._lexicon = {k: np.array(v, dtype=np.float32) for k, v in parsed["concepts"].items()}
        self._concept_metadata = parsed.get("metadata", {})
        self._operation_count = parsed.get("operation_count", 0)

    def get_concept_metadata(self, concept: str) -> Optional[Dict]:
        """Get metadata for a concept."""
        return self._concept_metadata.get(concept)

    def list_concepts(self) -> List[str]:
        """List all concept names."""
        return sorted(self._lexicon.keys())

    def concept_count(self) -> int:
        """Get total number of concepts."""
        return len(self._lexicon)

    def reset_operations(self) -> None:
        """Reset operation counter."""
        self._operation_count = 0

    def get_operation_count(self) -> int:
        """Get total number of operations performed."""
        return self._operation_count

hdc = HyperDimensionalComputing(dim=1024)
