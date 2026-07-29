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

## Manual chunks (vite.config.ts)

Configured `manualChunks`:

| Chunk name | Libraries |
|------------|-----------|
| `vendor` | react, react-dom, react-router-dom |
| `three` | three, @react-three/fiber, @react-three/drei |
| `d3` | d3 |
| `phaser` | phaser |
| `socket` | socket.io-client |

### Detective finding

`frontend/package.json` **dependencies** list react, three, r3f, d3, framer-motion, zustand, sentry — but **do not** list `phaser` or `socket.io-client`.  
Chunk names for phaser/socket are therefore **reserved / possibly empty** unless those packages are pulled transitively or added later. Worth cleaning in a later commit (remove dead chunk keys or add deps if truly used).

`chunkSizeWarningLimit`: 1000 (kB).

## Same-origin API (already fixed historically)

`VITE_API_BASE_URL` defaults to `''` at build time so the deployed app talks to the Worker origin — not a visitor’s localhost. Keep this invariant.

## Safe optimizations (queued, not all done this commit)

| Priority | Action | Status |
|----------|--------|--------|
| P0 | Document chunks + exclusions (this file) | Done |
| P1 | Remove or fix dead `phaser` / `socket` manualChunks if unused | Next code slice |
| P2 | Lazy-load legacy Command Center tabs only when user opens them | Next sessions |
| P3 | Confirm three/d3 only load on routes that need them | Detective + optional code |
| P4 | Optional CI bundle size note (founder-gated) | Later |

## What we are not doing this session

- No force-enable of future modules into the main bundle  
- No full design-token unify yet (D1 is multi-session; starts after this baseline)  
- No floating-menu implementation yet (hybrid design next docs)  
