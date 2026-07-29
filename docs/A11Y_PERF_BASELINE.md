# Accessibility & Performance Baseline

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Scope:** Kai EL OS primary shell (shipped surface).

---

## Accessibility (current)

| Item | Status |
|------|--------|
| `:focus-visible` outline | Present in index.css |
| Keyboard full nav of graph + drawers | Incomplete |
| ARIA labels on icon-only controls | Sparse |
| `prefers-reduced-motion` | Not systematically applied |
| Screen-reader landmarks | Partial |
| Color contrast on neon-on-dark | Needs formal check |

### Proposed additive work (no overwrite)

1. Landmark roles on shell regions  
2. `aria-label` on icon buttons in LeftNav / TopStatusBar  
3. Reduced-motion CSS gate for float/pulse animations  
4. Focus trap for overlays (Gateway, Biosystem, Observatory)

**Question:** Approve starting with items 1–4 on this PR in a later commit?

---

## Performance (current)

| Item | Status |
|------|--------|
| Vite code-split vendor chunks | Present (three, phaser, d3, vendor) |
| Route-level lazy loading | Partial |
| Large WIP modules excluded from build | Yes (good) |
| Image/asset budgeting | Not formalized |
| Bundle size CI budget | Not formalized |

### Proposed additive work

1. Document current chunk map after next `build:app`  
2. Lazy-load legacy tabs only when selected  
3. Optional: lighthouse/playwright perf smoke in CI (founder-gated)

**Question:** Prioritize a11y 1–4 first, or perf documentation first?
