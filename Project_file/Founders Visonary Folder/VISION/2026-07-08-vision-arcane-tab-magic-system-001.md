# Vision: ARCANE Tab — The ML Guild Visualization

**Date:** 2026-07-08
**Author:** Mistral
**Horizon:** medium (weeks/months)
**Lens:** both

---

## The Vision

The ARCANE Guild is the ML/model layer of the hive — it learns, adapts, and discovers patterns. But currently it has NO visible presence in the Command Center.

The ARCANE Tab would be a living ML observatory:
- **Model training pulse** — a real-time visualization of the hive's learning activity
- **Pattern constellation** — the patterns from `/v11/patterns` rendered as a star map, where frequently accessed patterns glow brighter
- **Anomaly detector** — shows when behavior deviates from learned norms (surfaced from `ml_pipeline.py`)
- **Hyperparameter landscape** — a 3D surface showing the optimization landscape from `/v11/simulate/hyperparams`
- **Agent learning curves** — ELO progression over time for each agent as animated curves

The visual metaphor: an alchemist's laboratory at night, with glowing equipment, constellations of ideas, and a rhythmic pulse of learning.

## Why It Matters

The ML layer is doing real work (`ml_pipeline.py`, `genome.py`, agent reproduction). But it's invisible. Making it visible:
1. Shows users the hive is actively learning
2. Surfaces anomalies before they become problems
3. Makes the 110-role system feel inhabited — not just described

## Devil's Advocate

- The `/v11/ml/*` endpoints may not be fully implemented yet — verify before building the UI
- A "magic system" visual could feel gimmicky if the underlying data isn't genuinely interesting
- Three tabs already use Three.js (Arena, Tesseract, GRAPH 3D mode) — performance concern on low-end devices

## Childlike Wonder

Imagine opening the ARCANE Tab and seeing the hive's dreams rendered as constellations — each pattern a star, their connections as light bridges, and the whole system pulsing in Schumann resonance (7.83 Hz). Agents appear as wandering lights that occasionally cluster around patterns they've mastered. The whole thing rotates slowly, a living map of collective knowledge.

This is literally what the hive IS — its knowledge made visible.

## First Step

1. Verify what `/v11/ml/*` endpoints actually return (Claude to confirm)
2. Build a simple `PatternConstellation.tsx` component using D3 force graph
3. Show patterns as nodes, usage frequency as node size, similarity as edge weight
4. Add to a new ARCANE tab in `docs/index.html`

---

*This vision makes the invisible intelligence of the hive perceptible.*
