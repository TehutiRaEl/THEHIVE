# WIP Voxel / Worlds / XP Status

**Author:** Grok (Detective)  
**Date:** 2026-07-29  
**PR:** #132  
**Intent:** Formal marker so this tree is not mistaken for live product.

---

## What exists

Large TypeScript/React trees under:

- `frontend/src/worlds/`
- `frontend/src/voxel/`
- `frontend/src/xp/`
- `frontend/src/avatars/`
- `frontend/src/conversation/`

These support a future macro→colony→micro 3D / avatar vision (see VISION doc 2026-07-18 macro-universe).

## Why they are not in the shipped app

1. Many real TypeScript errors (missing imports, interface mismatches, etc.).
2. `tsconfig.build.json` **excludes** these paths so `npm run build:app` stays green.
3. They are not imported from `App.tsx` / KaiElOS module graph for production.

## Options (founder choose)

| Option | Meaning | Risk |
|--------|---------|------|
| **A. Archive formally** | Move or clearly mark as `future-unreal-phase`; stop treating as current debt | Low |
| **B. Repair TS only** | Fix compile errors without inventing game design | Medium (need correct design intent) |
| **C. Integrate subset** | Wire one safe surface (e.g. XP display only) into OS | Medium |
| **D. Leave as-is** | Keep exclusion; document only (this file) | Lowest short-term |

**Recommendation:** D for now + this marker; A if you want the tree out of the “broken” mental list.

**Question:** A, B, C, or D?
