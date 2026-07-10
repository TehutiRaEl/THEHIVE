# SKILL: Arena voxel projection pipeline (backend sim → frames → Three.js)
Origin: Fable 5, 2026-07-04, PR #22 M1 — directly reusable for Mistral's LiveArenaViewer
Use when: rendering any per-tick voxel/grid stream in any UI.
Steps:
1. Contract: 30 compact frames `{t, m:{wealth+shares+leading}, da[], db[], dv[]}`; voxel = {x,y,z,r,g,b,a,ch}; replay-from-persistence is source of truth (GET /v11/arena/projection/{id}/frames), SSE `arena_frame` is a live bonus.
2. Renderer: one InstancedMesh per colony (max 2048), Map 'x,y,z'→index, upsert per frame, scale = .3+.7*alpha, groups counter-rotate, fixed camera (no OrbitControls — fights other canvases).
3. Play at ~8fps client-side; wealth bar from m.challenger_share.
Gotchas: three r128 `setColorAt` sizes the color buffer from CURRENT count — call it once while count = max BEFORE zeroing, or all instances render white. Projection VISUALIZES; GladiatorArena DECIDES — show `arena_winner`, annotate dissent.
