# tier3/tesseract_model

TESSERACT MODEL — TesserAct 4D World Model

## Classes

- `ColonyTensor4D` — Represents a colony's state history as a 4D tensor (T, X, Y, C).
- `TesseractModelNumpy` — 4D colony world model in pure numpy.
- `FourDVideoGenerator` — Generates 4D video output for the sovereign:
- `TesseractModelTorch` — Full differentiable 4D colony world model.

## Functions

- `log_video()`
- `get_model()`
- `get_video_generator()`
- `wealth_trajectory()`
- `to_frames()` — Export as frame list for frontend visualisation.
- `predict_next()` — Input:  (T, X, Y, C)
- `rollout()` — Autoregressive rollout: predict n_steps into the future.
- `wealth_forecast()` — Predict wealth trajectory for a named colony.
- `train_tesseract_model()` — Train on synthetic colony data.
- `generate()`
- `forward()` — x: (B, T, X, Y, C) → pred: (B, X, Y, C)
- `curvature_loss()`
- `rollout()` — Autoregressive rollout through this model's own forward() (untrained
- `wealth_forecast()` — Predict wealth trajectory for a named colony via this model's own forward pass.

## Links

[[core.config]]
