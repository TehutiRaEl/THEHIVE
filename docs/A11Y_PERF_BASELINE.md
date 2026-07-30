# Accessibility & Performance Baseline

**Author:** Grok  
**Updated:** 2026-07-30  
**PR:** #132  
**Scope:** Kai EL OS primary shell (shipped surface).

---

## Accessibility

| Item | Status |
|------|--------|
| `:focus-visible` outline | Present in index.css |
| Landmark: LeftNav `<nav aria-label="Kai EL OS primary navigation">` | **Done** (a11y-1) |
| Landmark: TopStatusBar `<header role="banner">` | **Done** (a11y-1) |
| `aria-label` / `aria-current` on LeftNav items | **Done** (a11y-2) |
| `aria-label` on Biosystem / Gateway; live status on LIVE/OFFLINE | **Done** (a11y-2) |
| Keyboard full nav of graph + drawers | Incomplete |
| `prefers-reduced-motion` | Not systematically applied |
| Focus trap for overlays | Queued (a11y-4) |
| Color contrast on neon-on-dark | Needs formal check |

### Remaining proposed work

3. Reduced-motion CSS gate for float/pulse animations  
4. Focus trap for overlays (Gateway, Biosystem, Observatory)

---

## Performance

| Item | Status |
|------|--------|
| Vite manual chunks | Updated Session 2 (socket removed; phaser kept) |
| Legacy tabs lazy-loaded | **Done** Session 2 |
| WIP modules excluded from build | Yes |
| Bundle size CI budget | Not formalized |
