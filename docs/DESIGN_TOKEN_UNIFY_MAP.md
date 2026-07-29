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
| A | `frontend/src/index.css` | Global CSS vars + OS backdrop + focus/utilities + **M1 `--hive-*` aliases** |
| B | `frontend/src/assets/styles/variables.css` | Older colony themes, spacing scale, glass | 
| C | `frontend/tailwind.config.js` | Tailwind colors/shadows/fonts used by OS components |

---

## Canonical target names

### Color roles (M1 aliases live in `:root`)

| Role | CSS token | Matches Tailwind |
|------|-----------|------------------|
| App void | `--hive-void` … `--hive-void-700` | `void.*` |
| Panel surface | `--hive-surface` | `void.800` |
| Yale structure | `--hive-yale` | `yale.DEFAULT` |
| Cyan energy | `--hive-cyan` / `--hive-cyan-glow` | `cyan.neon` / `cyan.glow` |
| Governance gold | `--hive-gold` / `--hive-gold-neon` | `gold.*` |
| Violet accent | `--hive-violet` | `violet.neon` |
| Danger / success | `--hive-danger` / `--hive-success` | danger + `electric.green` |
| Text | `--hive-text*` | slate hierarchy |

### Colony theme

Keep colony-specific vars in `variables.css` for now; later namespace as `colony.*` without deleting.

### Typography

Display Orbitron · Body Exo 2 · Formal Cinzel. Do not add Rajdhani/Inter for new UI.

---

## Migration phases

| Phase | Work | Status |
|-------|------|--------|
| **M0** | Map + interim rule | **Done** |
| **M1** | `:root` `--hive-*` aliases mirroring Tailwind | **Done** (2026-07-29) |
| **M2** | Point one small OS component at canonical names only | Queued |
| **M3** | Colony vars documented; stop dual gold/purple in new PRs | Queued |
| **M4** | Freeze `variables.css` except bugfixes | Queued |
| **M5** | Optional class audit | Later |

**Not in scope yet:** deleting `variables.css`, restyling every legacy tab.

---

## Conflicts (resolution rules)

| Conflict | Rule |
|----------|------|
| Two golds | Gold = governance only; general energy = cyan/violet |
| Purple vs violet | Prefer violet / `--hive-violet` for OS |
| Fonts in variables not loaded | Ignore for new UI |
