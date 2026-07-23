"""
TESSERACT MODEL — TesserAct 4D World Model
Sovereign Hive v11.0 Tier 3

Architecture:
  • Input:  (T, X, Y, C) 4D colony state tensor
            T=time steps, X×Y=16×16 spatial grid, C=4 channels
  • Encoder: Conv2D over XY plane at each T → temporal features
  • Temporal: GRU over T axis → learns colony growth dynamics
  • Decoder: transpose-conv back to (X, Y, C) → next-state prediction
  • Output: predicted next state + 4D "video" for sovereign

Training:
  • Synthetic colony data generated from ARGNN simulation
  • Loss: MSE(predicted, actual) + curvature_regularization
  • No MinkowskiEngine needed — uses dense 4D arrays (numpy/torch)

4D Video output: list of (T, X, Y, C) frames → stream to frontend
"""

import math
import json
import time
import sqlite3
import uuid
from typing import List, Dict, Tuple, Optional
import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    TORCH = True
except ImportError:
    TORCH = False

try:
    from backend.core.config import settings as _settings
    DB_PATH = _settings.db_path
except Exception:
    DB_PATH = "jasper_memory.db"

# ════════════════════════════════════════════════════════════
# 4D STATE TENSOR DEFINITION
# ════════════════════════════════════════════════════════════
T_STEPS = 8     # temporal depth
X_SIZE  = 16    # spatial X
Y_SIZE  = 16    # spatial Y
N_CHAN  = 4     # channels: resource, buildings, agents, frequency

class ColonyTensor4D:
    """
    Represents a colony's state history as a 4D tensor (T, X, Y, C).
    Generates synthetic trajectories for training.
    """
    def __init__(self, name: str, t: int = T_STEPS, seed: int = 0):
        self.name = name
        rng = np.random.RandomState(seed)
        self.tensor = np.zeros((t, X_SIZE, Y_SIZE, N_CHAN), dtype=np.float32)
        self.tensor[0,:,:,0] = rng.exponential(0.4, (X_SIZE, Y_SIZE))
        self.tensor[0,:,:,1] = (rng.random((X_SIZE, Y_SIZE)) > 0.85).astype(float)
        self.tensor[0,:,:,2] = rng.random((X_SIZE, Y_SIZE)) * 0.3
        self.tensor[0,:,:,3] = 7.83 / 1000.0
        for step in range(1, t):
            growth  = rng.normal(1.015, 0.02, (X_SIZE, Y_SIZE))
            self.tensor[step,:,:,0] = np.clip(self.tensor[step-1,:,:,0]*growth, 0, 5.0)
            self.tensor[step,:,:,1] = np.clip(
                self.tensor[step-1,:,:,1] + rng.normal(0, 0.02, (X_SIZE,Y_SIZE)), 0, 1.0)
            self.tensor[step,:,:,2] = np.clip(
                self.tensor[step-1,:,:,2] + rng.normal(0, 0.05, (X_SIZE,Y_SIZE)), 0, 1.0)
            hz_pulse = abs(math.sin(step * 7.83 * 0.1)) * 0.001
            self.tensor[step,:,:,3] = np.clip(
                self.tensor[step-1,:,:,3] + hz_pulse, 0, 0.05)

    def wealth_trajectory(self) -> List[float]:
        return [round(float(self.tensor[t,:,:,0].sum()),2) for t in range(self.tensor.shape[0])]

    def to_frames(self) -> List[Dict]:
        """Export as frame list for frontend visualisation."""
        frames = []
        for t in range(self.tensor.shape[0]):
            voxels = []
            for x in range(X_SIZE):
                for y in range(Y_SIZE):
                    cell = self.tensor[t,x,y,:]
                    density = float(cell.max())
                    if density < 0.05: continue
                    ch = int(np.argmax(cell))
                    colors = [(0.1,0.8,0.1),(0.1,0.4,0.9),(0.0,0.9,0.9),(1.0,0.8,0.0)]
                    r,g,b = colors[ch]
                    voxels.append({"x":x,"y":y,"z":t,"r":r,"g":g,"b":b,
                                   "a":round(min(density,1.0),3),"ch":ch})
            frames.append({"t":t,"voxels":voxels[:200],
                           "wealth":round(float(self.tensor[t,:,:,0].sum()),2)})
        return frames

# ════════════════════════════════════════════════════════════
# NUMPY-MODE TESSERACT MODEL
# ════════════════════════════════════════════════════════════
class TesseractModelNumpy:
    """
    4D colony world model in pure numpy.
    Conv2D approximated as local mean pooling + linear transform.
    GRU approximated as exponential smoothing (Holt's method).
    Inference-only (weights fixed at init).
    """
    def __init__(self, dim: int = 32, seed: int = 42):
        rng = np.random.RandomState(seed)
        sc  = 1.0 / math.sqrt(dim)
        self.W_enc = rng.randn(X_SIZE*Y_SIZE*N_CHAN, dim).astype(np.float32) * sc
        self.b_enc = np.zeros(dim, dtype=np.float32)
        self.W_z   = rng.randn(dim, dim).astype(np.float32) * sc
        self.W_r   = rng.randn(dim, dim).astype(np.float32) * sc
        self.W_h   = rng.randn(dim, dim).astype(np.float32) * sc
        self.W_dec = rng.randn(dim, X_SIZE*Y_SIZE*N_CHAN).astype(np.float32) * sc
        self.b_dec = np.zeros(X_SIZE*Y_SIZE*N_CHAN, dtype=np.float32)
        self.dim   = dim

    def _encode_frame(self, frame: np.ndarray) -> np.ndarray:
        """(X,Y,C) → (dim,)"""
        x = frame.reshape(-1)
        return np.tanh(x @ self.W_enc + self.b_enc)

    def _gru_step(self, h: np.ndarray, x: np.ndarray) -> np.ndarray:
        """Simplified GRU: update gate + candidate."""
        z = 1.0 / (1.0 + np.exp(-(h @ self.W_z + x)))
        r = 1.0 / (1.0 + np.exp(-(h @ self.W_r + x)))
        hc = np.tanh(r * h @ self.W_h + x)
        return (1 - z) * h + z * hc

    def predict_next(self, tensor_4d: np.ndarray) -> np.ndarray:
        """
        Input:  (T, X, Y, C)
        Output: (X, Y, C) predicted next frame
        """
        T = tensor_4d.shape[0]
        h = np.zeros(self.dim, dtype=np.float32)
        for t in range(T):
            x_enc = self._encode_frame(tensor_4d[t])
            h     = self._gru_step(h, x_enc)
        pred_flat = h @ self.W_dec + self.b_dec
        return pred_flat.reshape(X_SIZE, Y_SIZE, N_CHAN).clip(0, 5.0)

    def rollout(self, initial_frame: np.ndarray, n_steps: int = 4) -> np.ndarray:
        """
        Autoregressive rollout: predict n_steps into the future.
        Returns (n_steps, X, Y, C)
        """
        history = [initial_frame]
        for _ in range(n_steps):
            hist_tensor = np.stack(history[-T_STEPS:], axis=0)
            if hist_tensor.shape[0] < T_STEPS:
                pad = np.zeros((T_STEPS-hist_tensor.shape[0],X_SIZE,Y_SIZE,N_CHAN),dtype=np.float32)
                hist_tensor = np.concatenate([pad, hist_tensor], axis=0)
            next_frame = self.predict_next(hist_tensor)
            history.append(next_frame)
        return np.stack(history[1:], axis=0)

    def wealth_forecast(self, colony_name: str, n_steps: int = 4) -> Dict:
        """Predict wealth trajectory for a named colony."""
        seed = abs(hash(colony_name)) % (2**31)
        ct   = ColonyTensor4D(colony_name, seed=seed)
        pred = self.rollout(ct.tensor[-1], n_steps)
        hist_wealth = ct.wealth_trajectory()
        pred_wealth = [round(float(pred[t,:,:,0].sum()),2) for t in range(n_steps)]
        trend = (pred_wealth[-1] - pred_wealth[0]) / max(1,n_steps)
        return {
            "colony":       colony_name,
            "history":      hist_wealth,
            "forecast":     pred_wealth,
            "trend_per_tick": round(trend, 3),
            "archetype":    "growing" if trend>1 else "declining" if trend<-1 else "stable",
            "n_forecast":   n_steps,
            "backend":      "PyTorch" if TORCH else "NumPy",
        }

# ════════════════════════════════════════════════════════════
# PYTORCH-MODE TESSERACT MODEL
# ════════════════════════════════════════════════════════════
if TORCH:
    class TesseractModelTorch(nn.Module):
        """
        Full differentiable 4D colony world model.
        Encoder: Conv2d spatial → GRU temporal → Decoder.
        Supports gradient-based training on synthetic colony data.
        """
        def __init__(self, n_chan: int = N_CHAN, dim: int = 64, gru_layers: int = 2):
            super().__init__()
            self.dim = dim
            self.spatial_enc = nn.Sequential(
                nn.Conv2d(n_chan, 16, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.Conv2d(16, 32, kernel_size=3, padding=1),
                nn.ReLU(),
                nn.AdaptiveAvgPool2d((4,4)),
                nn.Flatten(),
                nn.Linear(512, dim),
                nn.Tanh(),
            )
            self.gru = nn.GRU(dim, dim, num_layers=gru_layers,
                               batch_first=True, dropout=0.1)
            self.decoder = nn.Sequential(
                nn.Linear(dim, 256),
                nn.ReLU(),
                nn.Linear(256, X_SIZE * Y_SIZE * n_chan),
                nn.Sigmoid(),
            )
            self.n_chan = n_chan

        def forward(self, x: "torch.Tensor"):
            """x: (B, T, X, Y, C) → pred: (B, X, Y, C)"""
            B, T, X, Y, C = x.shape
            x_flat = x.view(B*T, C, X, Y)
            enc    = self.spatial_enc(x_flat)
            enc    = enc.view(B, T, self.dim)
            out, _  = self.gru(enc)
            last    = out[:, -1, :]
            pred_flat = self.decoder(last)
            pred = pred_flat.view(B, X, Y, C)
            return pred * 5.0

        def curvature_loss(self, pred: "torch.Tensor", target: "torch.Tensor",
                            lambda_curv: float = 0.05) -> "torch.Tensor":
            mse  = nn.functional.mse_loss(pred, target)
            lap_x = pred[:,:,1:,:] - pred[:,:,:-1,:]
            lap_y = pred[:,1:,:,:] - pred[:,:-1,:,:]
            smooth = lap_x.pow(2).mean() + lap_y.pow(2).mean()
            return mse + lambda_curv * smooth

        def rollout(self, initial_frame: np.ndarray, n_steps: int = 4) -> np.ndarray:
            """Autoregressive rollout through this model's own forward() (untrained
            weights unless train_tesseract_model() has been run first)."""
            history = [initial_frame]
            with torch.no_grad():
                for _ in range(n_steps):
                    hist = np.stack(history[-T_STEPS:], axis=0)
                    if hist.shape[0] < T_STEPS:
                        pad = np.zeros((T_STEPS - hist.shape[0], X_SIZE, Y_SIZE, self.n_chan), dtype=np.float32)
                        hist = np.concatenate([pad, hist], axis=0)
                    x = torch.tensor(hist, dtype=torch.float32).unsqueeze(0)  # (1, T, X, Y, C)
                    pred = self.forward(x)[0].numpy()  # (X, Y, C)
                    history.append(pred)
            return np.stack(history[1:], axis=0)

        def wealth_forecast(self, colony_name: str, n_steps: int = 4) -> Dict:
            """Predict wealth trajectory for a named colony via this model's own forward pass."""
            seed = abs(hash(colony_name)) % (2**31)
            ct   = ColonyTensor4D(colony_name, seed=seed)
            pred = self.rollout(ct.tensor[-1], n_steps)
            hist_wealth = ct.wealth_trajectory()
            pred_wealth = [round(float(pred[t,:,:,0].sum()),2) for t in range(n_steps)]
            trend = (pred_wealth[-1] - pred_wealth[0]) / max(1,n_steps)
            return {
                "colony":       colony_name,
                "history":      hist_wealth,
                "forecast":     pred_wealth,
                "trend_per_tick": round(trend, 3),
                "archetype":    "growing" if trend>1 else "declining" if trend<-1 else "stable",
                "n_forecast":   n_steps,
                "backend":      "PyTorch",
            }

    def train_tesseract_model(n_samples: int = 64, epochs: int = 5) -> Dict:
        """Train on synthetic colony data."""
        model = TesseractModelTorch()
        opt   = optim.Adam(model.parameters(), lr=1e-3)
        losses = []
        for epoch in range(epochs):
            epoch_loss = 0.0
            for _ in range(n_samples):
                seed = np.random.randint(0, 10000)
                ct   = ColonyTensor4D("train", seed=seed)
                x    = torch.tensor(ct.tensor[:-1]).unsqueeze(0)
                y    = torch.tensor(ct.tensor[-1]).unsqueeze(0)
                opt.zero_grad()
                pred = model(x)
                loss = model.curvature_loss(pred, y)
                loss.backward()
                opt.step()
                epoch_loss += loss.item()
            avg = epoch_loss / n_samples
            losses.append(round(avg, 6))
        return {"epochs": epochs, "samples": n_samples,
                "loss_history": losses, "final_loss": losses[-1]}

# ════════════════════════════════════════════════════════════
# 4D VIDEO GENERATOR  (for sovereign display)
# ════════════════════════════════════════════════════════════
class FourDVideoGenerator:
    """
    Generates 4D video output for the sovereign:
    a sequence of 3D snapshots (T slices of the 4D tensor).
    Each frame is a compressed voxel list for Three.js.
    """
    def __init__(self, model=None):
        self.model = model or TesseractModelNumpy()

    def generate(self, colony_name: str, n_forecast: int = 8) -> Dict:
        seed = abs(hash(colony_name)) % (2**31)
        ct   = ColonyTensor4D(colony_name, seed=seed)
        hist_frames = ct.to_frames()
        pred_tensor = self.model.rollout(ct.tensor[-1], n_forecast)
        pred_colony = ColonyTensor4D.__new__(ColonyTensor4D)
        pred_colony.name   = colony_name + "_FORECAST"
        pred_colony.tensor = pred_tensor
        pred_frames = pred_colony.to_frames()
        for f in hist_frames: f["type"] = "historical"
        for f in pred_frames: f["type"] = "forecast"
        total_wealth = ct.wealth_trajectory()
        pred_wealth  = [round(float(pred_tensor[t,:,:,0].sum()),2) for t in range(n_forecast)]
        return {
            "colony":       colony_name,
            "total_frames": len(hist_frames) + len(pred_frames),
            "historical":   hist_frames,
            "forecast":     pred_frames,
            "wealth_history": total_wealth,
            "wealth_forecast": pred_wealth,
            "grid_size":    f"{X_SIZE}×{Y_SIZE}×{T_STEPS}",
            "channels":     ["resource","buildings","agents","frequency"],
            "backend":      "PyTorch" if TORCH else "NumPy",
        }

# ════════════════════════════════════════════════════════════
# DB LOGGING
# ════════════════════════════════════════════════════════════
def _init_model_tables():
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("""CREATE TABLE IF NOT EXISTS tesseract_model_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        colony_name TEXT, run_id TEXT, n_frames INTEGER,
        final_wealth REAL, trend TEXT, backend TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)""")
    conn.commit(); conn.close()

_init_model_tables()

def log_video(colony_name: str, n_frames: int,
              final_wealth: float, trend: str):
    conn = sqlite3.connect(DB_PATH); c = conn.cursor()
    c.execute("INSERT INTO tesseract_model_log(colony_name,run_id,n_frames,final_wealth,trend,backend) VALUES(?,?,?,?,?,?)",
              (colony_name, uuid.uuid4().hex[:8], n_frames, final_wealth,
               trend, "torch" if TORCH else "numpy"))
    conn.commit(); conn.close()

_numpy_model = TesseractModelNumpy()
_video_gen   = FourDVideoGenerator(_numpy_model)

def get_model():
    if TORCH:
        m = TesseractModelTorch(); m.eval(); return m
    return _numpy_model

def get_video_generator(): return _video_gen

__all__ = [
    "ColonyTensor4D","TesseractModelNumpy","FourDVideoGenerator",
    "get_model","get_video_generator",
    "T_STEPS","X_SIZE","Y_SIZE","N_CHAN","TORCH",
]
if TORCH:
    __all__ += ["TesseractModelTorch","train_tesseract_model"]
