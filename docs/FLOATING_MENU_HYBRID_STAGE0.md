# Floating Menu Hybrid — Stage 0 (D3)

**Author:** Grok  
**Date:** 2026-07-29  
**PR:** #132  
**Decision:** D3 = Hybrid (keep graph + LeftNav; floating menu only for fantasy/inventory/social-style surfaces when data is real or clearly labeled demo).

---

## Stage 0 = design only (this document)

No UI code in this stage. Prevents the canvas from being mistaken for the live product.

---

## What stays primary

- **CenterGraph** — knowledge-graph navigator  
- **LeftNav** — section rail  
- **OS panels** — updates, proposals, constitution, etc.  
- **Legacy tabs** — full-takeover when selected (now lazy-loaded)

## What the floating menu may become later

Optional **overlay** (not a nav replacement) for:

| Panel idea | Data rule |
|------------|-----------|
| Profile / agent card | Real agent list from hive API or honest empty |
| Quests / missions | Real missions endpoint or PlannedControl |
| Inventory | Only if real inventory API exists; else “not live” |
| Social / peers | Real federation peers or explicit offline |

Hard rule: **no fake player counts, levels, or online friends.**

---

## Suggested entry (when Stage 1 is approved)

- One control in LeftNav or TopStatusBar: **“Hub”** or sigil secondary action  
- Opens overlay; Esc / backdrop closes  
- Does not unmount the OS shell underneath  

## Suggested non-goals

- Replacing LeftNav (rejected under D3)  
- Shipping Three.js hub portal as default home  
- Copying canvas demo data into production

---

## Stage ladder

| Stage | Deliverable |
|-------|-------------|
| **0** | This design note (done) |
| **1** | Empty overlay shell + open/close only (no fake data) |
| **2** | Wire one panel to one real endpoint |
| **3** | Additional panels only as APIs exist |

Vision artifacts remain in:

- `Project_file/Founders Visonary Folder/MODIFICATIONS/floating-menu-hub`
- `canvases/thehive-floating-menu/`

---

## Founder gate

Stage 1 code starts only when you say so (e.g. “build Hub overlay shell”). Until then, hybrid = design policy only.
