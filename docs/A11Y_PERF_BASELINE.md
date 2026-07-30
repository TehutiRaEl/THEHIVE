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
| Landmark: LeftNav `<nav>` | **Done** (a11y-1) |
| Landmark: TopStatusBar `<header role="banner">` | **Done** (a11y-1) |
| `aria-label` / `aria-current` on LeftNav / status actions | **Done** (a11y-2) |
| `prefers-reduced-motion` gate | **Done** (a11y-3) in `index.css` |
| Keyboard full nav of graph + drawers | Incomplete |
| Focus trap for overlays | Queued (a11y-4) |
| Color contrast on neon-on-dark | Needs formal check |

### Remaining proposed work

4. Focus trap for overlays (Gateway, Biosystem, Observatory)

### A11y-3 behavior

When the user (or OS) enables “reduce motion”, continuous animations and long transitions are effectively disabled globally from `index.css`. LIVE dots and similar may stay lit without pulsing.

---

## Performance

| Item | Status |
|------|--------|
| Vite manual chunks | Updated Session 2 |
| Legacy tabs lazy-loaded | **Done** Session 2 |
| WIP modules excluded from build | Yes |
| Bundle size CI budget | Not formalized |
