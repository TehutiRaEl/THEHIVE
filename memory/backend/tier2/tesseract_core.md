# tier2/tesseract_core

TESSERACT CORE — Sovereign Hive v11.0 Tier 2

## Classes

- `TesseractNetworkNumpy` — Numpy inference-only Tesseract QTN.
- `TesseractNetwork` — Full PyTorch QTN: trainable node states, message functions,

## Functions

- `build_tesseract_adj()` — 16 nodes labeled 0-15 (binary 0000-1111 = 4D coordinates).
- `q_mul()` — Hamilton product of two quaternion arrays (..., 4).
- `q_norm()`
- `q_unit()`
- `q_conj()`
- `q_similarity()` — Angular similarity between quaternions ∈ [-1,1].
- `ollivier_ricci_curvature()` — Approximate Ollivier-Ricci curvature on the tesseract graph.
- `make_tesseract()`
- `get_tesseract()`
- `project_tesseract_3d()` — Project 4D tesseract vertices to 3D for Three.js rendering.
- `embed_text_for_tesseract()` — Deterministic embedding from text → (dim,) float32 vector.
- `process_through_tesseract()` — Full pipeline: text → embed → tesseract forward → curvature report.
- `init_tesseract_table()`
- `log_curvature()`
- `get_curvature_history()`
- `forward()` — x: (node_dim,) input embedding → returns: (node_dim,) output, curvature scalar
- `curvature_loss()` — TITLE IX Art.7: Every governance decision must reduce mean curvature.
- `state_summary()`
- `forward()` — x: (batch, node_dim)
- `curvature_loss()`
