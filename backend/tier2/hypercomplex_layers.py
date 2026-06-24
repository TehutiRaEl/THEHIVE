"""
HYPERCOMPLEX LAYERS — Sovereign Hive v11.0 Tier 2

Guild-specific hypercomplex neural architectures:
  • Trust Guild:   Quaternion algebra Q (H) — legal embeddings
  • R&D Guild:     Clifford algebra Cl(3,0) — colony spatial data
  • Crypto Guild:  Hypercomplex RNN — market forecasting
  • City Hall:     Dual-number algebra — task sensitivity

TITLE XI: The hive speaks in HD vectors.
These layers ARE the grammar of that language.
"""

import math
import json
from typing import List, Dict, Tuple, Optional
import numpy as np

try:
    import torch
    TORCH = True
except ImportError:
    TORCH = False

# ════════════════════════════════════════════════════════════
# QUATERNION ALGEBRA  (Trust Guild — legal sovereignty)
# ════════════════════════════════════════════════════════════
class QuaternionOps:
    """
    Hamilton quaternions: Q = w + xi + yj + zk
    H forms a division ring — every non-zero element is invertible.
    Used by Trust Guild for encoding legal relationships that must
    preserve orientation (chirality) and non-commutativity of rights.
    """
    @staticmethod
    def mul(q1: np.ndarray, q2: np.ndarray) -> np.ndarray:
        """Hamilton product: (..., 4) × (..., 4) → (..., 4)"""
        w1,x1,y1,z1 = q1[...,0],q1[...,1],q1[...,2],q1[...,3]
        w2,x2,y2,z2 = q2[...,0],q2[...,1],q2[...,2],q2[...,3]
        return np.stack([
            w1*w2 - x1*x2 - y1*y2 - z1*z2,
            w1*x2 + x1*w2 + y1*z2 - z1*y2,
            w1*y2 - x1*z2 + y1*w2 + z1*x2,
            w1*z2 + x1*y2 - y1*x2 + z1*w2,
        ], axis=-1)

    @staticmethod
    def conj(q: np.ndarray) -> np.ndarray:
        """Conjugate: q* = w - xi - yj - zk"""
        r = q.copy()
        r[...,1:] *= -1
        return r

    @staticmethod
    def norm(q: np.ndarray) -> np.ndarray:
        return np.linalg.norm(q, axis=-1, keepdims=True)

    @staticmethod
    def unit(q: np.ndarray) -> np.ndarray:
        n = QuaternionOps.norm(q) + 1e-8
        return q / n

    @staticmethod
    def inv(q: np.ndarray) -> np.ndarray:
        """Multiplicative inverse: q^{-1} = q* / ||q||^2"""
        n2 = (QuaternionOps.norm(q) ** 2) + 1e-8
        return QuaternionOps.conj(q) / n2

    @staticmethod
    def slerp(q1: np.ndarray, q2: np.ndarray, t: float) -> np.ndarray:
        """Spherical linear interpolation (geodesic on S^3)."""
        q1u = QuaternionOps.unit(q1)
        q2u = QuaternionOps.unit(q2)
        dot = np.clip(np.sum(q1u * q2u, axis=-1, keepdims=True), -1, 1)
        theta = np.arccos(np.abs(dot))
        q2u = np.where(dot < 0, -q2u, q2u)
        sin_t = np.sin(theta) + 1e-8
        w1 = np.sin((1-t)*theta) / sin_t
        w2 = np.sin(t*theta)     / sin_t
        fallback = (1-t)*q1u + t*q2u
        result   = w1*q1u + w2*q2u
        return np.where(theta < 1e-6, fallback, result)

    @staticmethod
    def encode_legal_concept(concept: str, dim: int = 4) -> np.ndarray:
        """Map a legal concept to a unit quaternion."""
        families = {
            "sovereignty":   [1, 0, 0, 0],
            "contract":      [0, 1, 0, 0],
            "jurisdiction":  [0, 0, 1, 0],
            "restitution":   [0, 0, 0, 1],
            "trust":         [0.5,  0.5,  0.5,  0.5],
            "title":         [0.5, -0.5,  0.5, -0.5],
            "treaty":        [0.5,  0.5, -0.5, -0.5],
            "rights":        [0.5, -0.5, -0.5,  0.5],
        }
        base_key = next((k for k in families if k in concept.lower()), None)
        if base_key:
            q = np.array(families[base_key], dtype=np.float32)
        else:
            rng = np.random.RandomState(abs(hash(concept)) % (2**31))
            q   = rng.randn(4).astype(np.float32)
        return QuaternionOps.unit(q)

    @staticmethod
    def legal_similarity(c1: str, c2: str) -> float:
        """Angular distance between two legal concepts in quaternion space."""
        q1 = QuaternionOps.encode_legal_concept(c1)
        q2 = QuaternionOps.encode_legal_concept(c2)
        dot = float(np.sum(q1 * q2))
        return round(abs(dot), 6)

class QuaternionLinear:
    """
    Quaternion-valued linear layer: maps (n_in, 4) → (n_out, 4).
    Weight matrix acts via Hamilton product rather than scalar multiply.
    """
    def __init__(self, n_in: int, n_out: int, seed: int = 42):
        rng = np.random.RandomState(seed)
        self.W = QuaternionOps.unit(
            rng.randn(n_out, n_in, 4).astype(np.float32) * 0.1)
        self.b = np.zeros((n_out, 4), dtype=np.float32)

    def forward(self, x: np.ndarray) -> np.ndarray:
        """x: (n_in, 4) → out: (n_out, 4)"""
        out = np.zeros((self.W.shape[0], 4), dtype=np.float32)
        for j in range(self.W.shape[0]):
            for i in range(self.W.shape[1]):
                out[j] += QuaternionOps.mul(self.W[j,i], x[i])
        return QuaternionOps.unit(out + self.b)

    def __call__(self, x): return self.forward(x)

# ════════════════════════════════════════════════════════════
# CLIFFORD ALGEBRA Cl(3,0)  (R&D Guild — colony spatial)
# ════════════════════════════════════════════════════════════
class CliffordAlgebra:
    """
    Clifford algebra Cl(3,0) with basis {1, e1, e2, e3, e12, e13, e23, e123}.
    Colony buildings modeled as Clifford multivectors.
    """
    GRADES = [0, 1, 1, 1, 2, 2, 2, 3]
    NAMES  = ['1','e1','e2','e3','e12','e13','e23','e123']

    _GP = None

    @classmethod
    def _build_gp_table(cls):
        blades = [frozenset(), frozenset({1}),frozenset({2}),frozenset({3}),
                  frozenset({1,2}),frozenset({1,3}),frozenset({2,3}),frozenset({1,2,3})]
        idx    = {tuple(sorted(b)): i for i, b in enumerate(blades)}

        table = np.zeros((8, 8, 2), dtype=np.int32)
        for i, b1 in enumerate(blades):
            for j, b2 in enumerate(blades):
                merged = b1.symmetric_difference(b2)
                sign   = 1
                lst1, lst2 = sorted(b1), sorted(b2)
                seq = lst1 + lst2
                for k in range(len(seq)):
                    for l in range(k+1, len(seq)):
                        if seq[k] > seq[l]: sign *= -1
                table[i, j, 0] = idx[tuple(sorted(merged))]
                table[i, j, 1] = sign
        cls._GP = table

    @classmethod
    def gp(cls, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        if cls._GP is None: cls._build_gp_table()
        result = np.zeros(8, dtype=np.float32)
        for i in range(8):
            for j in range(8):
                ridx, sign = cls._GP[i, j]
                result[ridx] += sign * a[i] * b[j]
        return result

    @classmethod
    def grade_project(cls, mv: np.ndarray, grade: int) -> np.ndarray:
        mask = np.array([1 if cls.GRADES[i]==grade else 0 for i in range(8)], dtype=np.float32)
        return mv * mask

    @classmethod
    def inner(cls, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return cls.gp(a, b)

    @classmethod
    def outer(cls, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return cls.gp(a, b)

    @classmethod
    def encode_colony_building(cls, resource: float, x: float, y: float,
                                size: float = 1.0) -> np.ndarray:
        mv = np.zeros(8, dtype=np.float32)
        mv[0] = float(resource)
        mv[1] = float(x)
        mv[2] = float(y)
        mv[3] = float(size)
        mv[4] = float(x * y)
        return mv

    @classmethod
    def colony_interaction(cls, b1: np.ndarray, b2: np.ndarray) -> Dict:
        product = cls.gp(b1, b2)
        return {
            "resource_exchange":  round(float(product[0]), 4),
            "x_momentum":         round(float(product[1]), 4),
            "y_momentum":         round(float(product[2]), 4),
            "territorial_overlap": round(float(product[4]), 4),
            "volume":             round(float(product[7]), 4),
        }

    @classmethod
    def mv_norm(cls, mv: np.ndarray) -> float:
        rev = mv.copy()
        for i in range(8):
            if cls.GRADES[i] in (2, 3):
                rev[i] *= -1
        prod = cls.gp(mv, rev)
        return float(math.sqrt(max(0, prod[0])))

# ════════════════════════════════════════════════════════════
# HYPERCOMPLEX RNN  (Crypto Guild — market forecasting)
# ════════════════════════════════════════════════════════════
class HyperComplexRNN:
    """
    LSTM-like RNN operating in quaternion space.
    Used by Crypto Guild for SOUL price / market forecasting.
    """
    def __init__(self, input_dim: int, hidden_dim: int, seed: int = 7):
        assert input_dim % 4 == 0 and hidden_dim % 4 == 0
        self.input_dim  = input_dim
        self.hidden_dim = hidden_dim
        self.n_hidden   = hidden_dim // 4
        self.n_input    = input_dim  // 4
        rng = np.random.RandomState(seed)

        def qinit(n_out, n_in):
            return QuaternionOps.unit(rng.randn(n_out, n_in, 4).astype(np.float32) * 0.05)

        self.Wf = qinit(self.n_hidden, self.n_input)
        self.Wi = qinit(self.n_hidden, self.n_input)
        self.Wg = qinit(self.n_hidden, self.n_input)
        self.Wo = qinit(self.n_hidden, self.n_input)
        self.Uf = qinit(self.n_hidden, self.n_hidden)
        self.Ui = qinit(self.n_hidden, self.n_hidden)
        self.Ug = qinit(self.n_hidden, self.n_hidden)
        self.Uo = qinit(self.n_hidden, self.n_hidden)
        self.bf = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.bi = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.bg = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.bo = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.h = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.c = np.zeros((self.n_hidden, 4), dtype=np.float32)

    def _qmv(self, W: np.ndarray, x: np.ndarray) -> np.ndarray:
        out = np.zeros((W.shape[0], 4), dtype=np.float32)
        for j in range(W.shape[0]):
            for i in range(W.shape[1]):
                out[j] += QuaternionOps.mul(W[j,i], x[i])
        return out

    def _sigmoid_q(self, q: np.ndarray) -> np.ndarray:
        return 1.0 / (1.0 + np.exp(-q))

    def _tanh_q(self, q: np.ndarray) -> np.ndarray:
        return np.tanh(q)

    def _qhadamard(self, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        return a * b

    def step(self, x_q: np.ndarray) -> np.ndarray:
        f = self._sigmoid_q(self._qmv(self.Wf, x_q) + self._qmv(self.Uf, self.h) + self.bf)
        i = self._sigmoid_q(self._qmv(self.Wi, x_q) + self._qmv(self.Ui, self.h) + self.bi)
        g = self._tanh_q  (self._qmv(self.Wg, x_q) + self._qmv(self.Ug, self.h) + self.bg)
        o = self._sigmoid_q(self._qmv(self.Wo, x_q) + self._qmv(self.Uo, self.h) + self.bo)
        self.c = self._qhadamard(f, self.c) + self._qhadamard(i, g)
        self.h = self._qhadamard(o, self._tanh_q(self.c))
        return self.h

    def reset(self):
        self.h = np.zeros((self.n_hidden, 4), dtype=np.float32)
        self.c = np.zeros((self.n_hidden, 4), dtype=np.float32)

    def forecast(self, price_series: List[float]) -> Dict:
        self.reset()
        if len(price_series) < 2:
            return {"error": "Need >= 2 data points"}
        arr = np.array(price_series, dtype=np.float32)
        mu, sigma = arr.mean(), arr.std() + 1e-8
        norm = (arr - mu) / sigma

        n_in = self.n_input
        for p in norm:
            x_q = np.zeros((n_in, 4), dtype=np.float32)
            x_q[0, 0] = p
            self.step(x_q)

        hidden_scalars = self.h[:, 0]
        trend     = float(np.mean(hidden_scalars))
        volatility= float(np.std(hidden_scalars))
        next_norm = trend + 0.5 * volatility * np.sign(trend)
        next_price= float(next_norm * sigma + mu)
        sentiment = "bullish" if trend > 0.1 else "bearish" if trend < -0.1 else "neutral"
        return {
            "last_price":   round(float(price_series[-1]), 4),
            "forecast":     round(next_price, 4),
            "trend":        round(trend, 6),
            "volatility":   round(volatility, 6),
            "sentiment":    sentiment,
            "hidden_norm":  round(float(np.linalg.norm(self.h)), 4),
            "backend":      "HyperComplexRNN (Quaternion LSTM)",
        }

# ════════════════════════════════════════════════════════════
# DUAL NUMBERS  (City Hall — task sensitivity / derivatives)
# ════════════════════════════════════════════════════════════
class DualNumber:
    """Dual numbers: a + bε where ε²=0. Perfect for automatic differentiation."""
    def __init__(self, real: float, dual: float = 0.0):
        self.r = float(real)
        self.d = float(dual)
    def __add__(self, o): return DualNumber(self.r+o.r, self.d+o.d)
    def __sub__(self, o): return DualNumber(self.r-o.r, self.d-o.d)
    def __mul__(self, o): return DualNumber(self.r*o.r, self.r*o.d+self.d*o.r)
    def __truediv__(self, o): return DualNumber(self.r/o.r, (self.d*o.r-self.r*o.d)/(o.r**2))
    def sin(self): return DualNumber(math.sin(self.r), self.d*math.cos(self.r))
    def cos(self): return DualNumber(math.cos(self.r), -self.d*math.sin(self.r))
    def exp(self): return DualNumber(math.exp(self.r), self.d*math.exp(self.r))
    def __repr__(self): return f"({self.r:.4f} + {self.d:.4f}ε)"

def task_priority_sensitivity(elo: float, resonance: float, soul: float,
                               d_elo: float = 1.0) -> Dict:
    e  = DualNumber(elo, d_elo)
    r  = DualNumber(resonance, 0)
    s  = DualNumber(soul, 0)
    one = DualNumber(1.0)
    thousand = DualNumber(1200.0)
    divisor  = DualNumber(1000.0)
    arg = (e - thousand) * DualNumber(1/1000)
    sig = one / (one + DualNumber(math.exp(-arg.r), arg.d * -math.exp(-arg.r)))
    log_soul = DualNumber(math.log(1+soul), 0)
    priority = sig * r + log_soul * DualNumber(0.1)
    return {
        "priority":         round(priority.r, 6),
        "d_priority_d_elo": round(priority.d, 8),
        "elo":              elo,
        "resonance":        resonance,
        "soul":             soul,
        "interpretation":   f"Priority increases {priority.d:.4f} per ELO point",
    }

# ════════════════════════════════════════════════════════════
# GUILD ENCODER (unified interface)
# ════════════════════════════════════════════════════════════
class GuildEncoder:
    GUILD_ALGEBRA = {
        "Trust":     "quaternion",
        "Crypto":    "hypercomplex_rnn",
        "R&D":       "clifford",
        "City Hall": "dual",
        "Frequency": "quaternion",
        "Arena":     "clifford",
    }

    def __init__(self):
        self.rnn = HyperComplexRNN(input_dim=4, hidden_dim=8)

    def encode(self, guild: str, concept: str, extra: Dict = None) -> Dict:
        alg = self.GUILD_ALGEBRA.get(guild, "quaternion")
        extra = extra or {}

        if alg == "quaternion":
            q = QuaternionOps.encode_legal_concept(concept)
            return {
                "guild": guild, "concept": concept, "algebra": "Quaternion H",
                "w": round(float(q[0]),6), "x": round(float(q[1]),6),
                "y": round(float(q[2]),6), "z": round(float(q[3]),6),
                "norm": round(float(np.linalg.norm(q)),6),
            }

        elif alg == "clifford":
            r = extra.get("resource", 1.0)
            x = extra.get("x", 0.0)
            y = extra.get("y", 0.0)
            mv = CliffordAlgebra.encode_colony_building(r, x, y)
            return {
                "guild": guild, "concept": concept, "algebra": "Clifford Cl(3,0)",
                "multivector": {CliffordAlgebra.NAMES[i]: round(float(mv[i]),4) for i in range(8)},
                "norm": round(CliffordAlgebra.mv_norm(mv), 6),
            }

        elif alg == "hypercomplex_rnn":
            prices = extra.get("prices", [1.0, 1.0, 1.05, 0.98, 1.02])
            return {
                "guild": guild, "concept": concept, "algebra": "HyperComplex RNN",
                **self.rnn.forecast(prices)
            }

        elif alg == "dual":
            elo = extra.get("elo", 1200)
            res = extra.get("resonance", 0.85)
            soul = extra.get("soul", 100.0)
            return {
                "guild": guild, "concept": concept, "algebra": "Dual Numbers",
                **task_priority_sensitivity(elo, res, soul)
            }

        return {"error": f"Unknown algebra: {alg}"}

    def guild_similarity(self, guild: str, c1: str, c2: str) -> float:
        e1 = self.encode(guild, c1)
        e2 = self.encode(guild, c2)
        alg = self.GUILD_ALGEBRA.get(guild, "quaternion")
        if alg == "quaternion":
            q1 = np.array([e1["w"],e1["x"],e1["y"],e1["z"]])
            q2 = np.array([e2["w"],e2["x"],e2["y"],e2["z"]])
            return round(abs(float(np.dot(q1,q2))),6)
        return 0.5

_GUILD_ENCODER = GuildEncoder()

def get_guild_encoder() -> GuildEncoder:
    return _GUILD_ENCODER

__all__ = [
    "QuaternionOps","QuaternionLinear",
    "CliffordAlgebra",
    "HyperComplexRNN",
    "DualNumber","task_priority_sensitivity",
    "GuildEncoder","get_guild_encoder",
]
