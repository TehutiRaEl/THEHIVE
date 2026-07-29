# Design Token Unify Map (D1)

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Decision:** D1 = Unify (multi-session). This file is the **map**, not the full migration.

---

## Goal (plain language)

One rulebook for colors, fonts, spacing, and glow so new UI does not guess between three files.

**Interim rule (until bridge lands):** new Kai EL OS work uses **Tailwind theme** (`tailwind.config.js`) + `index.css` globals. Do not extend `variables.css` for new features.

---

## Sources of truth today

| System | File | Role today |
|--------|------|------------|
| A | `frontend/src/index.css` | Global CSS vars + OS backdrop + focus/utilities |
| B | `frontend/src/assets/styles/variables.css` | Older colony themes, spacing scale, glass | 
| C | `frontend/tailwind.config.js` | Tailwind colors/shadows/fonts used by OS components |

---

## Canonical target names (proposed)

These become the **long-term names**. Implementation can map old names → new via CSS vars + Tailwind `theme.extend`.

### Color roles

| Role | Proposed token | Tailwind path | Notes |
|------|----------------|---------------|--------|
| App void background | `--hive-void` | `void.black` / `void.900` | Keep void scale |
| Panel surface | `--hive-surface` | `void.800` | Cards/rails |
| Primary action / focus | `--hive-cyan` | `cyan.neon` / `cyan.glow` | OS energy |
| Governance / Kai / Town Hall | `--hive-gold` | `gold.DEFAULT` / `gold.neon` | Gold reserved for governance |
| Accent violet | `--hive-violet` | `violet.neon` | Secondary accent |
| Yale structure | `--hive-yale` | `yale.DEFAULT` | Bars/structure |
| Danger | `--hive-danger` | (add or use red-500) | Align with index danger |
| Success | `--hive-success` | `electric.green` | |
| Muted text | `--hive-text-muted` | slate utilities | |
| Primary text | `--hive-text` | slate-200 | |

### Colony theme (from variables.css — preserve, do not delete yet)

Keep colony-specific vars (`--thehive-primary`, `--nar2-primary`, etc.) under a **`colony.*`** namespace in a later bridge so federation UI can still theme per colony without polluting OS chrome.

### Typography

| Role | Target | Load in index.css |
|------|--------|-------------------|
| Display / titles | Orbitron | already |
| Body | Exo 2 | already |
| Constitutional / formal | Cinzel | already |
| Deprecated for new UI | Rajdhani, Inter (listed only in variables.css) | do not add for new work |

### Spacing / radius / z-index

Prefer Tailwind scale for new UI. Optional later: expose `--space-*` from variables.css as aliases only if gamified CSS still needs them.

---

## Migration phases (do not skip)

| Phase | Work | Risk |
|-------|------|------|
| **M0** | This map + interim rule (done) | None |
| **M1** | Add `:root` aliases in `index.css` that mirror Tailwind hive names (no visual change) | Low |
| **M2** | Point one small OS component at only canonical names; verify | Low |
| **M3** | Document colony vars as `colony.*`; stop dual gold/purple in new PRs | Low |
| **M4** | Freeze edits to `variables.css` except bugfixes; README pointer | Low |
| **M5** | Optional: codemod/class audit for leftover old class patterns | Medium |

**Not in scope yet:** deleting `variables.css`, restyling every legacy tab, or changing brand identity without founder review.

---

## Conflicts to resolve deliberately

| Conflict | Resolution rule |
|----------|-----------------|
| Two golds (amber secondary vs gold neon) | **Gold = governance only**; general highlights use cyan/violet |
| Purple in index vs violet in Tailwind | Prefer **violet.neon** for OS; map `--color-primary` → violet over time |
| Fonts named in variables but not loaded | Ignore for new UI; load only Cinzel/Exo/Orbitron |

---

## Next implementable slice (Session 4+ when directed)

M1: additive CSS aliases only — no component rewrites required in the same commit.
