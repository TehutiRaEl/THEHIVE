"""
Unit tests for Tesseract Model module
"""

import pytest
import numpy as np
from tesseract.tesseract_model import (
    ColonyTensor4D, TesseractModelNumpy, FourDVideoGenerator,
    T_STEPS, X_SIZE, Y_SIZE, N_CHAN
)

class TestColonyTensor4D:
    def test_initialization(self):
        ct = ColonyTensor4D("TEST_COLONY", seed=42)
        assert ct.tensor.shape == (T_STEPS, X_SIZE, Y_SIZE, N_CHAN)
        assert ct.tensor[0, :, :, 0].sum() > 0  # Resource channel has data

    def test_wealth_trajectory(self):
        ct = ColonyTensor4D("TEST_COLONY_2", seed=42)
        trajectory = ct.wealth_trajectory()
        assert len(trajectory) == T_STEPS
        assert all(isinstance(w, float) for w in trajectory)

    def test_to_frames(self):
        ct = ColonyTensor4D("TEST_COLONY_3", seed=42)
        frames = ct.to_frames()
        assert len(frames) == T_STEPS
        assert "t" in frames[0]
        assert "voxels" in frames[0]

class TestTesseractModelNumpy:
    def test_predict_next(self):
        model = TesseractModelNumpy(dim=16)
        ct = ColonyTensor4D("TEST_COLONY_4", seed=42)
        pred = model.predict_next(ct.tensor)
        assert pred.shape == (X_SIZE, Y_SIZE, N_CHAN)
        assert pred.min() >= 0
        assert pred.max() <= 5.0

    def test_rollout(self):
        model = TesseractModelNumpy(dim=16)
        ct = ColonyTensor4D("TEST_COLONY_5", seed=42)
        rollout = model.rollout(ct.tensor[-1], n_steps=3)
        assert rollout.shape == (3, X_SIZE, Y_SIZE, N_CHAN)

    def test_wealth_forecast(self):
        model = TesseractModelNumpy(dim=16)
        forecast = model.wealth_forecast("TEST_COLONY_6", n_steps=3)
        assert "colony" in forecast
        assert "history" in forecast
        assert "forecast" in forecast
        assert len(forecast["forecast"]) == 3
        assert forecast["archetype"] in ["growing", "declining", "stable"]

class TestFourDVideoGenerator:
    def test_generate(self):
        model = TesseractModelNumpy(dim=16)
        vg = FourDVideoGenerator(model)
        video = vg.generate("TEST_COLONY_7", n_forecast=2)
        assert "colony" in video
        assert "historical" in video
        assert "forecast" in video
        assert len(video["historical"]) > 0
        assert len(video["forecast"]) == 2
