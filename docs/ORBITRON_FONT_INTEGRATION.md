# Orbitron Font Integration — Investigation + F1

**Author:** Grok (Detective)  
**Updated:** 2026-07-30  
**PR:** #132

---

## Plain summary

Orbitron is the **display / title** font for Kai EL OS. **F1 applied:** fonts load from **one** path — `frontend/src/index.css` `@import` (Cinzel + Exo 2 + Orbitron weights 400–700). `index.html` only **preconnects** to Google Fonts; it no longer downloads a second stylesheet with duplicate Orbitron or unused Rajdhani/Inter/Fira Code.

---

## Load path (after F1)

| File | Role |
|------|------|
| `frontend/index.html` | `preconnect` only (faster first connection) |
| `frontend/src/index.css` | **Single** `@import` for Cinzel, Exo 2, Orbitron |

`docs/app/index.html` is **build output** — regenerates on next `npm run build:app` from `frontend/index.html`.

---

## Theme wiring (unchanged)

| Mechanism | Definition |
|-----------|------------|
| Tailwind `font-display` | Orbitron |
| Tailwind `font-body` | Exo 2 |
| `.font-orbitron` | Orbitron utility |
| Default body | Exo 2 on `html, body` |

---

## Remaining option

| ID | Action |
|----|--------|
| **F2** | Self-host under `public/fonts` (no Google) — if sovereignty on typography is prioritized |
