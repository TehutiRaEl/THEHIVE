# Design Tokens Inventory

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Finding:** Three partially overlapping token systems exist. This doc inventories them; it does not unify them yet (that needs founder choice).

---

## System A — `frontend/src/index.css` `:root`

Used heavily by Kai EL OS + global styles.

- Primary / secondary / accent / danger / warning / success / info
- bg-dark, bg-darker, bg-card, borders, text hierarchy
- Fonts: Cinzel, Exo 2, Orbitron (Google Fonts import)
- Deep-space neon backdrop gradients
- Focus-visible, pulse-glow, float, shimmer utilities

## System B — `frontend/src/assets/styles/variables.css`

Older “Sovereign Hive” token set (colony themes, golden-ratio spacing, glass).

- deep-space, nebula-purple, gold, silver
- Per-colony theme vars (THEHIVE, NAR2, LocalAGI, automatisch, 4DBRAIN, Kimi-K2, aether)
- Spacing scale, radii, shadows, z-index, transitions
- Fonts listed: Orbitron, Rajdhani, Inter, Fira Code (not all loaded in index.css)

## System C — `frontend/tailwind.config.js`

Kai EL OS Tailwind theme extension.

- void (black scale), yale, cyan glow/neon, gold, violet neon, electric
- fontFamily display/body (Orbitron, Exo 2)
- boxShadow: glow, neon-cyan/violet/gold, panel-neon
- animations: fadeIn, slideIn

## Overlap / drift risk

| Concern | Detail |
|---------|--------|
| Dual purple systems | CSS purple vs Tailwind violet |
| Dual gold | CSS secondary amber vs Tailwind gold reserved for governance |
| Font mismatch | variables.css names Rajdhani/Inter; index loads Cinzel/Exo/Orbitron |
| Colony colors | Strong in variables.css; weak in Tailwind |

## Visionary guidance options (founder choose)

1. **Keep three systems** — lowest risk, more drift over time.  
2. **Unify under Tailwind + CSS variables bridge** — one source of truth, moderate work.  
3. **Freeze variables.css as archive; OS uses Tailwind only** — cleanest for Kai EL OS, may break older gamified CSS that still references variables.css.

**Question for founder:** Which option do you want as the long-term rule?
