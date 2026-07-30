# Frontend Performance Inventory (Session 2)

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Decision:** D4 — performance first

---

## Build pipeline (real)

| Script | What it does |
|--------|----------------|
| `npm run build` | Full `tsc` + vite → `dist/` (includes more of tree; may fail on WIP) |
| `npm run build:app` | `tsc -p tsconfig.build.json` + vite → `docs/app` with `--base=/app/` (production Pages path) |

Production path **excludes:** `src/worlds`, `voxel`, `xp`, `avatars`, `conversation`.

## Manual chunks (vite.config.ts) — after Session 2

| Chunk name | Libraries | Notes |
|------------|-----------|--------|
| `vendor` | react, react-dom, react-router-dom | Core |
| `three` | three, @react-three/fiber, @react-three/drei | 3D |
| `d3` | d3 | Graphs |
| `phaser` | phaser | Dynamic import in `PhaserScene.tsx`; **dep added** to package.json 2026-07-29 |
| ~~socket~~ | ~~socket.io-client~~ | **Removed** — no imports in `frontend/src`; was not in package.json |

`chunkSizeWarningLimit`: 1000 (kB).

## Same-origin API (already fixed historically)

`VITE_API_BASE_URL` defaults to `''` at build time so the deployed app talks to the Worker origin — not a visitor’s localhost. Keep this invariant.

## Session 2 code changes

| Change | Why |
|--------|-----|
| Remove `socket` manualChunk | Dead config |
| Add `phaser` dependency | `PhaserScene` already `import('phaser')`; package was missing |
| `React.lazy` + `Suspense` for 13 legacy tabs in `KaiElOS.tsx` | Initial OS shell no longer statically pulls all tab modules |

## Remaining queue

| Priority | Action | Status |
|----------|--------|--------|
| P0 | Document chunks + exclusions | Done |
| P1 | Dead socket chunk + phaser dep | Done this commit |
| P2 | Lazy-load legacy tabs | Done this commit |
| P3 | Confirm three/d3 only load on routes that need them | Later |
| P4 | Optional CI bundle size note | Later |
| Next campaign | D1 token unify mapping doc | Session 3 area |
