"""
TESSERACT CORE — Sovereign Hive v11.0 Tier 2
Quantum Tesseract Neural Network (QTN)

Architecture:
  • 16-node tesseract graph (4D hypercube: 2^4 vertices, 32 edges)
  • Each node: quaternion state (w,x,y,z) = magnitude + phase in 4D
  • Message passing along geodesic edges (3 rounds)
  • Loss = task_loss + λ1*curvature + λ2*negative_entropy
  • Curvature metric displayed on Bulletin Board
  • TITLE IX Art.7: Space is not flat. All intelligence flows along geodesics.

Requires: numpy (always), torch (optional — falls back to numpy)
"""

import os
import json
import math
import sqlite3
import uuid
import time
from datetime import datetime
from typing import List, Dict, Tuple, Optional

import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    TORCH = True
except ImportError:
    TORCH = False
    print("WARNING: PyTorch not found. TesseractNetwork running in numpy mode (inference only).")

# ──────────────────────────────────────────────────────────────
# TESSERACT TOPOLOGY  (4D hypercube)
# ──────────────────────────────────────────────────────────────
def build_tesseract_adj() -> np.ndarray:
    """
    16 nodes labeled 0-15 (binary 0000-1111 = 4D coordinates).
    Two nodes are adjacent iff their labels differ in exactly 1 bit
    (Hamming distance = 1). Produces 32 undirected edges.
    """
    adj = np.zeros((16, 16), dtype=np.float32)
    for i in range(16):
        for j in range(16):
            if bin(i ^ j).count("1") == 1:
                adj[i][j] = 1.0
    return adj

ADJ = build_tesseract_adj()  # (16,16) constant

# 4D vertex coordinates: bit-decomposed (±1, ±1, ±1, ±1)
VERTICES_4D = np.array([
    [1 if (i >> b) & 1 else -1 for b in range(4)]
    for i in range(16)
], dtype=np.float32)

# Edges list (32 pairs)
EDGES = [(i, j) for i in range(16) for j in range(i+1, 16)
         if bin(i ^ j).count("1") == 1]

# ──────────────────────────────────────────────────────────────
# QUATERNION OPERATIONS (numpy, used in both modes)
# ──────────────────────────────────────────────────────────────
def q_mul(q1: np.ndarray, q2: np.ndarray) -> np.ndarray:
    """Hamilton product of two quaternion arrays (..., 4)."""
    w1,x1,y1,z1 = q1[...,0],q1[...,1],q1[...,2],q1[...,3]
    w2,x2,y2,z2 = q2[...,0],q2[...,1],q2[...,2],q2[...,3]
    return np.stack([
        w1*w2 - x1*x2 - y1*y2 - z1*z2,
        w1*x2 + x1*w2 + y1*z2 - z1*y2,
        w1*y2 - x1*z2 + y1*w2 + z1*x2,
        w1*z2 + x1*y2 - y1*x2 + z1*w2
    ], axis=-1)

def q_norm(q: np.ndarray) -> np.ndarray:
    return np.linalg.norm(q, axis=-1, keepdims=True) + 1e-8

def q_unit(q: np.ndarray) -> np.ndarray:
    return q / q_norm(q)

def q_conj(q: np.ndarray) -> np.ndarray:
    return np.concatenate([q[..., :1], -q[..., 1:]], axis=-1)

def q_similarity(q1: np.ndarray, q2: np.ndarray) -> float:
    """Angular similarity between quaternions ∈ [-1,1]."""
    q1u, q2u = q_unit(q1), q_unit(q2)
    dot = np.sum(q1u * q2u, axis=-1)
    return float(np.clip(dot, -1, 1).mean())

# ──────────────────────────────────────────────────────────────
# OLLIVIER-RICCI CURVATURE (numpy)
# ──────────────────────────────────────────────────────────────
def ollivier_ricci_curvature(node_states: np.ndarray, adj: np.ndarray) -> float:
    """
    Approximate Ollivier-Ricci curvature on the tesseract graph.
    κ(i,j) = 1 - W1(μi, μj) / d(i,j)
    where W1 is Wasserstein-1 distance between neighbourhood measures.
    """
    curvatures = []
    for i, j in EDGES[:12]:
        ni = [k for k in range(16) if adj[i,k] > 0 and k != j]
        nj = [k for k in range(16) if adj[j,k] > 0 and k != i]
        if not ni or not nj:
            continue
        mu_i = node_states[ni].mean(axis=0)
        mu_j = node_states[nj].mean(axis=0)
        w1 = np.linalg.norm(mu_i - mu_j)
        d_ij = np.linalg.norm(node_states[i] - node_states[j]) + 1e-8
        kappa = 1.0 - w1 / d_ij
        curvatures.append(kappa)
    return float(np.mean(curvatures)) if curvatures else 0.0

# ──────────────────────────────────────────────────────────────
# NUMPY-MODE TESSERACT (inference, no autograd)
# ──────────────────────────────────────────────────────────────
class TesseractNetworkNumpy:
    """
    Numpy inference-only Tesseract QTN.
    Weights are random at init; load from checkpoint after torch training.
    """
    def __init__(self, node_dim: int = 64):
        self.node_dim  = node_dim
        self.n_nodes   = 16
        rng = np.random.RandomState(42)
        self.node_q    = q_unit(rng.randn(16, 4).astype(np.float32))
        self.node_feat = rng.randn(16, node_dim).astype(np.float32) * 0.1
        scale = 1.0 / math.sqrt(node_dim)
        self.W_msg     = rng.randn(16, node_dim, node_dim).astype(np.float32) * scale
        self.W_out     = rng.randn(16 * node_dim, node_dim).astype(np.float32) * scale

    def _tanh(self, x): return np.tanh(x)

    def forward(self, x: np.ndarray) -> Tuple[np.ndarray, float]:
        """x: (node_dim,) input embedding → returns: (node_dim,) output, curvature scalar"""
        feat = self.node_feat.copy()
        feat[0] += x

        for _ in range(3):
            new_feat = np.zeros_like(feat)
            for i in range(self.n_nodes):
                neighbors = [j for j in range(16) if ADJ[i,j] > 0]
                if neighbors:
                    agg = feat[neighbors].mean(axis=0)
                    new_feat[i] = self._tanh(feat[i] + agg @ self.W_msg[i])
                else:
                    new_feat[i] = feat[i]
            feat = new_feat

        curv = ollivier_ricci_curvature(feat, ADJ)
        out  = self._tanh(feat.reshape(-1) @ self.W_out)
        return out, curv

    def curvature_loss(self, task_loss: float, curv: float,
                       lambda1: float = 0.1, lambda2: float = 0.05) -> float:
        """TITLE IX Art.7: Every governance decision must reduce mean curvature."""
        entropy = -np.sum(
            np.exp(self.node_feat) / np.exp(self.node_feat).sum(axis=1, keepdims=True)
            * self.node_feat, axis=1
        ).mean()
        return task_loss + lambda1 * abs(curv) + lambda2 * float(entropy)

    def state_summary(self) -> Dict:
        curv = ollivier_ricci_curvature(self.node_feat, ADJ)
        q_sims = [float(q_similarity(self.node_q[i], self.node_q[j])) for i,j in EDGES[:8]]
        return {
            "mean_curvature":      round(curv, 6),
            "mean_q_similarity":   round(float(np.mean(q_sims)), 6),
            "node_dim":            self.node_dim,
            "n_nodes":             self.n_nodes,
            "n_edges":             len(EDGES),
            "constitutional_basis":"TITLE IX Art.7 — Curved Manifolds",
        }

# ──────────────────────────────────────────────────────────────
# PYTORCH-MODE TESSERACT (full training + autograd)
# ──────────────────────────────────────────────────────────────
if TORCH:
    class TesseractNetwork(nn.Module):
        """
        Full PyTorch QTN: trainable node states, message functions,
        curvature regularisation via autograd.
        """
        def __init__(self, node_dim: int = 64, n_nodes: int = 16):
            super().__init__()
            self.n_nodes  = n_nodes
            self.node_dim = node_dim
            self.register_buffer("adj", torch.tensor(ADJ))
            self.node_q = nn.Parameter(
                F.normalize(torch.randn(n_nodes, 4), dim=-1))
            self.node_feat = nn.Parameter(
                torch.randn(n_nodes, node_dim) * 0.1)
            self.msg_fns = nn.ModuleList([
                nn.Sequential(nn.Linear(node_dim, node_dim), nn.Tanh())
                for _ in range(n_nodes)
            ])
            self.curv_fn = nn.Sequential(
                nn.Linear(node_dim * 2, 64), nn.ReLU(),
                nn.Linear(64, 1)
            )
            self.proj_out = nn.Linear(n_nodes * node_dim, node_dim)

        def forward(self, x: "torch.Tensor"):
            """x: (batch, node_dim)"""
            B = x.size(0)
            feat = self.node_feat.unsqueeze(0).expand(B, -1, -1).clone()
            feat[:, 0] = feat[:, 0] + x

            for _ in range(3):
                new_feat = torch.zeros_like(feat)
                for i in range(self.n_nodes):
                    nb = self.adj[i].nonzero(as_tuple=True)[0]
                    if len(nb):
                        agg = feat[:, nb].mean(dim=1)
                        new_feat[:, i] = torch.tanh(
                            feat[:, i] + self.msg_fns[i](agg))
                    else:
                        new_feat[:, i] = feat[:, i]
                feat = new_feat

            curv = self._curv(feat)
            out  = self.proj_out(feat.view(B, -1))
            return out, curv

        def _curv(self, feat: "torch.Tensor") -> "torch.Tensor":
            curv_vals = []
            for i, j in EDGES[:12]:
                pair = torch.cat([feat[:, i], feat[:, j]], dim=-1)
                curv_vals.append(self.curv_fn(pair))
            return torch.stack(curv_vals, dim=1).mean()

        def curvature_loss(self, task_loss, lambda1=0.1, lambda2=0.05):
            _, curv = self.forward(torch.zeros(1, self.node_dim))
            logits = self.node_feat.softmax(dim=-1).clamp(min=1e-8)
            neg_entropy = (logits * logits.log()).sum(dim=-1).mean()
            return task_loss + lambda1 * curv.abs() + lambda2 * neg_entropy.abs()

        def state_summary(self) -> Dict:
            with torch.no_grad():
                feat_np = self.node_feat.detach().cpu().numpy()
                q_np    = self.node_q.detach().cpu().numpy()
            curv = ollivier_ricci_curvature(feat_np, ADJ)
            q_sims = [float(q_similarity(q_np[i], q_np[j])) for i,j in EDGES[:8]]
            return {
                "mean_curvature":    round(curv, 6),
                "mean_q_similarity": round(float(np.mean(q_sims)), 6),
                "node_dim": self.node_dim,
                "n_nodes": self.n_nodes,
                "n_edges": len(EDGES),
                "torch": True,
                "constitutional_basis": "TITLE IX Art.7 — Curved Manifolds",
            }

# ──────────────────────────────────────────────────────────────
# SINGLETON — choose best available backend
# ──────────────────────────────────────────────────────────────
def make_tesseract(node_dim: int = 64):
    if TORCH:
        net = TesseractNetwork(node_dim)
        net.eval()
        return net
    return TesseractNetworkNumpy(node_dim)

_TESSERACT = None
def get_tesseract() -> TesseractNetworkNumpy:
    global _TESSERACT
    if _TESSERACT is None:
        _TESSERACT = make_tesseract(64)
    return _TESSERACT

# ──────────────────────────────────────────────────────────────
# 4D → 3D PROJECTION (for frontend visualisation)
# ──────────────────────────────────────────────────────────────
def project_tesseract_3d(w_angle: float = 0.0, xw_angle: float = 0.0) -> Dict:
    """
    Project 4D tesseract vertices to 3D for Three.js rendering.
    Rotation in XW plane (w_angle) and ZW plane (xw_angle).
    """
    cos_w, sin_w   = math.cos(w_angle), math.sin(w_angle)
    cos_xw, sin_xw = math.cos(xw_angle), math.sin(xw_angle)

    verts3 = []
    for v in VERTICES_4D:
        x, y, z, w = v
        x2 = x * cos_w  - w * sin_w
        w2 = x * sin_w  + w * cos_w
        z2 = z * cos_xw - w2 * sin_xw
        w3 = z * sin_xw + w2 * cos_xw
        d   = 3.0
        fac = d / (d - w3 + 1e-8)
        verts3.append([round(x2*fac, 4), round(y*fac, 4), round(z2*fac, 4)])

    return {
        "vertices": verts3,
        "edges":    EDGES,
        "n_nodes":  16,
        "n_edges":  len(EDGES),
        "w_angle":  round(w_angle, 4),
        "xw_angle": round(xw_angle, 4),
    }

# ──────────────────────────────────────────────────────────────
# AGENT EMBEDDING (text → tesseract vector)
# ──────────────────────────────────────────────────────────────
def embed_text_for_tesseract(text: str, dim: int = 64) -> np.ndarray:
    """Deterministic embedding from text → (dim,) float32 vector."""
    rng = np.random.RandomState(abs(hash(text)) % (2**31))
    v   = rng.randn(dim).astype(np.float32)
    return v / (np.linalg.norm(v) + 1e-8)

def process_through_tesseract(text: str) -> Dict:
    """Full pipeline: text → embed → tesseract forward → curvature report."""
    net = get_tesseract()
    emb = embed_text_for_tesseract(text, 64)
    if TORCH:
        with torch.no_grad():
            x   = torch.tensor(emb).unsqueeze(0)
            out, curv = net(x)
            out_np    = out.squeeze(0).numpy()
            curv_val  = float(curv.item())
    else:
        out_np, curv_val = net.forward(emb)

    summary = net.state_summary()
    summary["input_text"]    = text[:80]
    summary["curvature_val"] = round(curv_val, 6)
    summary["output_norm"]   = round(float(np.linalg.norm(out_np)), 4)
    summary["constitutional"] = "Mean curvature must decrease each governance cycle"
    return summary

# ──────────────────────────────────────────────────────────────
# DB PERSISTENCE (store curvature history for Bulletin Board)
# ──────────────────────────────────────────────────────────────
DB_PATH = "jasper_memory.db"

def init_tesseract_table():
    conn = sqlite3.connect(DB_PATH)
    c    = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS tesseract_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            mean_curvature REAL, mean_q_similarity REAL,
            input_text TEXT, curvature_loss REAL, notes TEXT
        )
    """)
    conn.commit()
    conn.close()

init_tesseract_table()

def log_curvature(curvature: float, q_sim: float, text: str = "", notes: str = ""):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO tesseract_log
        (mean_curvature, mean_q_similarity, input_text, curvature_loss, notes)
        VALUES (?, ?, ?, ?, ?)
    """, (curvature, q_sim, text[:200], curvature, notes))
    conn.commit()
    conn.close()

def get_curvature_history(limit: int = 20) -> List[Dict]:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT timestamp, mean_curvature, mean_q_similarity, input_text
        FROM tesseract_log ORDER BY timestamp DESC LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()
    return [{"ts":r[0],"curvature":r[1],"q_sim":r[2],"text":r[3]} for r in rows]

# ──────────────────────────────────────────────────────────────
# PUBLIC API (imported by main backend)
# ──────────────────────────────────────────────────────────────
__all__ = [
    "get_tesseract", "process_through_tesseract",
    "project_tesseract_3d", "embed_text_for_tesseract",
    "ollivier_ricci_curvature", "log_curvature", "get_curvature_history",
    "q_mul", "q_unit", "q_conj", "q_similarity",
    "EDGES", "ADJ", "VERTICES_4D", "TORCH",
]
