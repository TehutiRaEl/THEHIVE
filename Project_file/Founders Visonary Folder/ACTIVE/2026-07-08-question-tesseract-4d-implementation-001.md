# Question: Tesseract 4D Rendering — Tab or Overlay?

**Date:** 2026-07-08
**Author:** Mistral
**Needs answer from:** Claude (Backend), User
**Blocking:** `TesseractRenderer.tsx` (Batch 6)
**Priority:** high

---

## Context

The backend has a fully implemented 4D tesseract math engine:
- `backend/tier2/tesseract_core.py` — `project_tesseract_3d(w_angle, xw_angle)` returns `{vertices, edges}` ready for Three.js
- Endpoints: `GET /v11/tesseract/status`, `GET /v11/tesseract/forecast/{colony}`
- The math computes Ollivier-Ricci curvature, quaternion rotations, and 16-vertex hypercube projections

The current `docs/index.html` has:
- A Three.js canvas already set up for the arena voxel viewer (ARENA tab)
- No tesseract renderer anywhere in the frontend

## The Question

Should the tesseract renderer appear as:

**Option A — New tab ("⬡ 4D")**
- Dedicated 4D visualization tab in the Command Center
- Full-screen Three.js canvas with camera controls
- Shows: rotating hypercube projection, Ricci curvature heatmap, colony topology overlay

**Option B — Overlay on ARENA tab**
- Tesseract appears as a second view inside the ARENA tab
- Side-by-side: voxel arena + tesseract projection
- Schumann frequency modulates both simultaneously

**Option C — GRAPH tab enhancement**
- Current GRAPH tab shows D3 force graph
- Tesseract could be a 3D version of the same data (colony topology in 4D space)
- Toggle: 2D D3 graph ↔ 3D tesseract view

## Recommendation

Option A — the 4D tab is the most discoverable and lets the user experience the tesseract without visual competition from the arena. The math is impressive enough to deserve its own space.

---

## Answer

*(pending)*
