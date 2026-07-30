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
| `prefers-reduced-motion` gate | **Done** (a11y-3) |
| Focus trap for overlays | **Done** (a11y-4) via `useFocusTrap` |
| Keyboard full nav of graph + drawers | Incomplete |
| Color contrast on neon-on-dark | Needs formal check |

### A11y-4 notes

- Hook: `frontend/src/hooks/useFocusTrap.ts`
- Wired: Observatory, BiosystemOverlay, GatewayConsoleOverlay
- Dialogs use `role="dialog"` + `aria-modal="true"`
- Esc still closes; focus restored to prior control on close
- Iframe content is a separate document — trap covers overlay chrome (close controls)

---

## Performance

| Item | Status |
|------|--------|
| Vite manual chunks | Updated Session 2 |
| Legacy tabs lazy-loaded | **Done** Session 2 |
| WIP modules excluded from build | Yes |
| Bundle size CI budget | Not formalized |
