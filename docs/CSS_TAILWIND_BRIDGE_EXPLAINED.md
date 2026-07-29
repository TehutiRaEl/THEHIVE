# CSS variables ↔ Tailwind OS theme — explained

**PR:** #132  
**Audience:** Founder (plain language)

---

## Two ways the app styles itself

1. **CSS variables** — names like `--hive-cyan` stored on `:root` in `index.css`. Any stylesheet can say `color: var(--hive-cyan)`.
2. **Tailwind classes** — names like `text-cyan-glow` or `bg-void-black` defined in `tailwind.config.js`. Components write those class names in JSX.

They are **not automatic mirrors**. A Tailwind class does not read `--hive-*` unless we wire that on purpose later. M1 only **added matching values** under `--hive-*` so humans and future code share one vocabulary.

---

## Tailwind OS theme (what “the OS look” means)

From `frontend/tailwind.config.js`:

| Family | Role in the UI |
|--------|----------------|
| **void** | Near-black backgrounds (shell, panels) |
| **yale** | Structural blue (status / authority bars) |
| **cyan** | Energy, live links, focus accents |
| **gold** | Governance / Kai / Town Hall only (reserved) |
| **violet** | Secondary neon accent |
| **electric** | Utility green/blue |

Fonts: **Orbitron** (display), **Exo 2** (body).  
Shadows: neon cyan/violet/gold glows for panels.

Kai EL OS components mostly use these Tailwind tokens directly (`bg-void-black`, `text-cyan-glow`, `text-gold`, etc.).

---

## M1 mapping (what we added)

| CSS variable | Same idea as Tailwind |
|--------------|------------------------|
| `--hive-void` … `--hive-void-700` | `void.black` … `void.700` |
| `--hive-surface` | `void.800` |
| `--hive-yale` | `yale.DEFAULT` |
| `--hive-cyan` / `--hive-cyan-glow` | `cyan.neon` / `cyan.glow` |
| `--hive-gold` / `--hive-gold-neon` | `gold.DEFAULT` / `gold.neon` |
| `--hive-violet` | `violet.neon` |
| `--hive-danger` / `--hive-success` | danger red / electric green |
| `--hive-text*` | primary / secondary / muted text |

**Legacy** vars (`--color-primary`, `--bg-dark`, …) still exist for older CSS so nothing breaks.

---

## Why unify matters

Without a map, one screen uses purple-from-CSS and another cyan-from-Tailwind. M1 starts the shared dictionary. Later M2 can point one component at `--hive-*` only; M4 freezes growing the old `variables.css` file.

---

## What you do day to day

- **New OS UI:** prefer Tailwind classes from the table above.  
- **Custom CSS:** prefer `--hive-*` when you need a variable.  
- **Colony-colored consoles:** still may use `variables.css` colony tokens until a later colony namespace pass.
