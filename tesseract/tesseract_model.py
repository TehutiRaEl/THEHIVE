"""
TESSERACT MODEL — TesserAct 4D World Model
Sovereign Hive v9 Tier 3

Architecture:
  • Input:  (T, X, Y, C) 4D colony state tensor
            T=time steps, X×Y=16×16 spatial grid, C=4 channels
  • Encoder: Conv2D over XY plane at each T → temporal features
  • Temporal: GRU over T axis → learns colony growth dynamics
  • Decoder: transpose-conv back to (X, Y, C) → next-state prediction
"""
import math, json, time, sqlite3, uuid
from typing import List, Dict, Tuple, Optional
import numpy as np

try:
    import torch, torch.nn as nn, torch.optim as optim
    TORCH = True
except ImportError:
    TORCH = False

DB_PATH = "jasper_memory.db"
T_STEPS = 8
X_SIZE  = 16
Y_SIZE  = 16
N_CHAN  = 4

# ════════════════════════════════════════════════════════════
# COLONY TENSOR
# ════════════════════════════════════════════════════════════
class ColonyTensor4D:
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
# NUMPY TESSERACT
# ════════════════════════════════════════════════════════════
class TesseractModelNumpy:
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
        x = frame.reshape(-1)
        return np.tanh(x @ self.W_enc + self.b_enc)

    def _gru_step(self, h: np.ndarray, x: np.ndarray) -> np.ndarray:
        z = 1.0 / (1.0 + np.exp(-(h @ self.W_z + x)))
        r = 1.0 / (1.0 + np.exp(-(h @ self.W_r + x)))
        hc = np.tanh(r * h @ self.W_h + x)
        return (1 - z) * h + z * hc

    def predict_next(self, tensor_4d: np.ndarray) -> np.ndarray:
        T = tensor_4d.shape[0]
        h = np.zeros(self.dim, dtype=np.float32)
        for t in range(T):
            x_enc = self._encode_frame(tensor_4d[t])
            h     = self._gru_step(h, x_enc)
        pred_flat = h @ self.W_dec + self.b_dec
        return pred_flat.reshape(X_SIZE, Y_SIZE, N_CHAN).clip(0, 5.0)

    def rollout(self, initial_frame: np.ndarray, n_steps: int = 4) -> np.ndarray:
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
        }

_numpy_model = TesseractModelNumpy()

# ════════════════════════════════════════════════════════════
# VIDEO GENERATOR
# ════════════════════════════════════════════════════════════
class FourDVideoGenerator:
    def __init__(self, model=None):
        self.model = model or _numpy_model

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
        pred_wealth  = [round(float(pred_tensor[t,:,:,0].sum()),2) for t in range(n_forecast)]
        return {
            "colony":       colony_name,
            "total_frames": len(hist_frames) + len(pred_frames),
            "historical":   hist_frames,
            "forecast":     pred_frames,
            "wealth_forecast": pred_wealth,
            "grid_size":    f"{X_SIZE}×{Y_SIZE}×{T_STEPS}",
            "channels":     ["resource","buildings","agents","frequency"],
        }

_video_gen = FourDVideoGenerator(_numpy_model)

def get_model():
    return _numpy_model

def get_video_generator():
    return _video_gen
