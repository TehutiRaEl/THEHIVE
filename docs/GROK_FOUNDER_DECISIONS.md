# Grok Founder Decisions (locked)

**Recorded:** 2026-07-29  
**PR:** #132  
**Source:** Founder answers in chat (elaborated decision board)

---

## D1 — Design tokens → **2 (Unify)**

Long-term: one source of truth bridging Tailwind + CSS variables.  
**Not** a one-session rewrite. Schedule after perf Session 2 slice: mapping doc → bridge → gradual migrate.  
Until then: **new OS UI prefers Tailwind tokens** (`tailwind.config.js` + `index.css`); avoid extending `variables.css` for new work.

## D2 — Voxel / worlds / XP → **Future (label now; map into OS later)**

- Treat `worlds/`, `voxel/`, `xp/`, `avatars/`, `conversation/` as **future** capability, not current product debt to “fix in place.”
- Keep production build exclusion (`tsconfig.build.json`).
- Over time, as the repo expands, **add into the OS UI map only where necessary** to move forward (thin, honest integrations — no fake stats).
- Formal label: see `frontend/src/FUTURE_MODULES.md` and prior `docs/WIP_VOXEL_WORLDS_STATUS.md`.

## D3 — Floating Menu → **4 (Hybrid)**

Keep graph + LeftNav as primary. Floating menu only for fantasy / inventory / social-style surfaces when real data exists (or explicit demo labels). Staged; not a nav replacement.

## D4 — Next code → **Performance first**

Session 2 starts with performance inventory and safe optimizations (docs + optional lazy-load), not a11y-first. A11y follows after this slice.

## D5 — New state-changing endpoints → **Yes — founder-key default**

Any new Grok-built endpoint that changes state defaults to founder-key (or stronger) unless founder explicitly opens it. Fail closed if key missing.

## D6 — Security checklist on PR #132 → **Yes**

Every commit/PR update on this lane includes the short security checklist (secrets, public writes, keys in files, irreversible harm).

## D7 — DID / SSI → **Near-term**

Schedule after security basics (Session 4 area): detective + thin spike (e.g. did:key / VC notes). Not ignored; not blocking Session 2 perf work.

---

## Execution order implied

1. **Now (Session 2):** Performance inventory + safe next steps  
2. Token unify mapping (multi-session, starts after perf baseline)  
3. Hybrid floating-menu design (docs → optional overlay later)  
4. Security pass + checklist discipline (ongoing; deep Session 4)  
5. DID near-term spike (after security basics)  
6. Future modules into OS map only when a concrete need appears  
