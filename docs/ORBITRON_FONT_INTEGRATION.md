# Orbitron Font Integration — Investigation

**Author:** Grok (Detective)  
**Date:** 2026-07-29  
**PR:** #132  
**Scope:** How Orbitron is loaded and used in THEHIVE frontend (no code change in this doc).

---

## Plain summary

Orbitron **is integrated** and used as the **display / title** font for Kai EL OS and several legacy surfaces. It is loaded **twice** from Google Fonts with slightly different weight sets, and older paths also load Rajdhani/Inter that the OS theme no longer prioritizes.

---

## Load paths (network)

### 1. `frontend/index.html` (and built `docs/app/index.html`)

```
preconnect → fonts.googleapis.com / fonts.gstatic.com
link: Orbitron wght@400;700
      + Rajdhani 500;700
      + Inter 400;500;700
      + Fira Code
      display=swap
```

### 2. `frontend/src/index.css` (CSS `@import`, must stay above `@tailwind`)

```
Cinzel 400–700
Exo 2 300–700
Orbitron 400;500;600;700
display=swap
```

**Finding:** Orbitron is requested from **two** Google Fonts URLs. Browsers often dedupe by family, but weights differ (HTML: 400+700 only; CSS: 400–700). Extra families in HTML (Rajdhani, Inter, Fira Code) are **not** in the Tailwind OS theme (`display: Orbitron`, `body: Exo 2`).

---

## Theme wiring

| Mechanism | Definition |
|-----------|------------|
| Tailwind | `fontFamily.display: ['Orbitron', 'sans-serif']` → class **`font-display`** |
| Tailwind | `fontFamily.body: ['Exo 2', 'sans-serif']` → class **`font-body`** |
| CSS utility | `.font-orbitron { font-family: 'Orbitron', sans-serif }` in `index.css` |
| CSS var (legacy) | `--font-title: 'Orbitron', sans-serif` in `variables.css` |

Body default in `index.css`: `font-family: 'Exo 2', sans-serif` on `html, body`.

---

## Where Orbitron is used (samples)

**Via `font-display` (OS shell):** TopStatusBar (LIVE), CenterGraph (“Kai EL”), KaiCommune header, ConstitutionViewer headings, DreamLogs labels, RoadmapAvatar, KaiElOS panel titles / mobile brand.

**Via explicit `font-family: Orbitron`:** legacy-tabs.css headers, 404 page, MemoryItem/MemoryDetails IDs, TesseractChamber stats, docs shell `docs/index.html` h1.

---

## Gaps / risks

| Issue | Detail |
|-------|--------|
| Dual load | index.html + index.css both fetch Orbitron |
| Weight mismatch | HTML omits 500/600; CSS includes them — `font-semibold` may synthesize if 600 missing from first request |
| Dead weight in HTML | Rajdhani / Inter / Fira Code loaded but OS prefers Exo 2 + Orbitron + Cinzel |
| Sovereignty / perf | Google Fonts is a third-party dependency; taste-skill docs prefer self-host + `font-display: swap` (already using swap on Google URL) |
| No local `@font-face` | Font fails offline / if Google blocked → falls back to `sans-serif` |

---

## Options (founder choose if/when changing)

| ID | Action | Why |
|----|--------|-----|
| **F1** | Single load path: keep CSS `@import` (Cinzel+Exo+Orbitron full weights); strip duplicate Orbitron + unused families from `index.html` | Less network, one weight set |
| **F2** | Self-host Orbitron (+ Exo 2, Cinzel) under `frontend/public/fonts` with `@font-face` | Sovereignty, offline, no Google |
| **F3** | Leave as-is | Zero churn; works online |

**Recommendation:** F1 when next touching fonts; F2 if data-sovereignty on typography becomes a priority.

---

## Relation to D1 token unify

Typography is part of the design system. Canonical rule already in map: **Display = Orbitron, Body = Exo 2, Formal = Cinzel**. Font load cleanup is orthogonal to `--hive-*` color aliases but same “one rulebook” goal.
