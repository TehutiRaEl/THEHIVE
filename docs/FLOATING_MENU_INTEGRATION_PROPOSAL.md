# Floating Menu → Kai EL OS Integration Proposal

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Source artifacts:**
- `Project_file/Founders Visonary Folder/MODIFICATIONS/floating-menu-hub`
- `canvases/thehive-floating-menu/CANVAS.md`

---

## What the canvas is

Anime-MMO style 3D hub portal + panels (Profile, Quests, Inventory, Social, etc.) with demo/hardcoded data, Three.js + framer-motion.

## What the live product is

Kai EL OS: graph-centric shell, live `/v11` data, honesty about unwired controls.

## Integration options

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **1. Keep as vision only** | Leave in MODIFICATIONS/canvases | Zero risk | Never becomes product |
| **2. Overlay panel** | Add optional “Menu Hub” overlay on OS using **live** data only | Additive; matches OS patterns | Needs API mapping |
| **3. Replace LeftNav** | Make floating menu primary nav | Strong MMO feel | High risk to current UX |
| **4. Hybrid** | Keep graph nav; open floating menu for inventory/social fantasy surfaces when data exists | Balanced | More design work |

**Security / honesty note:** Any integrated panel must not show fake player counts, levels, or online friends. Use real hive data or explicit “demo / not live” labels (same rule as PlannedControl).

**Recommendation:** Option 1 until you pick 2 or 4; never 3 without a dedicated design pass.

**Question:** 1, 2, 3, or 4?
