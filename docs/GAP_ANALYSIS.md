# Sovereign Hive — Phase 1 Gap Analysis

**Author:** Grok (Sovereign Strategist)
**Local Commit:** `ebd3646` on `grok-strategist-main`
**Bridged:** 2026-07-08 via `grok-bridge.yml`
**Lens Applied:** Childlike Wonder + Devil's Advocate (dual)

---

## Overview

Phase 1 gap analysis: initial crawl across the 10-repo federation to identify what
is missing, underdeveloped, or at risk. Each gap maps to at least one F-law and
generates a mission seed for `POST /v11/genesis/missions/propose`.

---

## Severity Matrix

| Severity | Definition | Count |
|----------|------------|-------|
| CRITICAL | Blocks constitutional compliance or federation integrity | 3 |
| HIGH | Blocks a major user-facing capability or milestone | 7 |
| MEDIUM | Degrades quality, visibility, or correctness | 9 |
| LOW | Nice-to-have; addresses polish or future-proofing | 6 |

---

## Critical Gaps (C-001 to C-003)

### C-001 — No Live Tesseract Visualization
**Repos affected:** THEHIVE
**F-Law:** F-004 (explainability) — if the 4D topology cannot be seen, it cannot be explained.
**Gap:** `backend/tier2/tesseract_core.py` is fully implemented (385 lines). `project_tesseract_3d()` returns `{vertices, edges}` ready for Three.js. There is NO frontend renderer consuming this data. The most technically distinctive module in the hive is invisible.
**Wonder Lens:** What if the tesseract is the main UI — a 4D space users navigate to reach colonies?
**Advocate Lens:** Frontend rendering complexity is high; risk of broken quaternion math on client side.
**Mission Seed:** "Wire Three.js tesseract renderer to `/v11/tesseract/project`"

### C-002 — No Live Arena Viewer
**Repos affected:** THEHIVE
**F-Law:** F-005 (conflict priority resolved by arena) — if arena is invisible, constitutional conflict resolution is unverifiable.
**Gap:** `backend/tier3/arena_renderer.py` streams 30-tick 3D voxel frames. `GET /v11/arena/stream` (SSE) exists. There is no frontend WebSocket/SSE consumer rendering the voxels.
**Wonder Lens:** Real-time 3D gladiator arena where every decision conflict plays out visually.
**Advocate Lens:** SSE backpressure and dropped frames at 30 ticks/sec require client-side buffering.
**Mission Seed:** "Build Three.js voxel receiver consuming `/v11/arena/stream`"

### C-003 — COLONY_BASE_URLS Hardcoded
**Repos affected:** THEHIVE (docs/index.html)
**F-Law:** F-001 (data sovereignty) — hardcoded ports mean the hive cannot adapt to deployment topology changes without manual HTML edits.
**Gap:** `COLONY_BASE_URLS` in docs/index.html is hardcoded to `localhost:8080`, `localhost:3000`, etc. The `/v11/hive/status` endpoint already returns colony health — it should include `base_url` per colony so the Command Center loads dynamically.
**Wonder Lens:** The Command Center auto-discovers all colonies on boot — zero configuration.
**Advocate Lens:** Dynamic discovery adds a boot-time async dependency; must handle offline colonies gracefully.
**Mission Seed:** "Add `base_url` to `/v11/hive/status` per-colony response; dynamic load in index.html"

---

## High Gaps (H-001 to H-007)

### H-001 — Dream Guild Has No UI
**F-Law:** F-004 — `backend/tier2/dream_engine.py` exists but nothing in the UI surfaces it.
**Mission Seed:** "Build DREAM tab backed by `/v11/dream/*` endpoints"

### H-002 — No Mission Lifecycle Interface
**F-Law:** F-003 (autonomy) — agents propose missions but humans have no UI to see the pipeline (proposed → formalized → active → completed).
**Mission Seed:** "Build mission pipeline view in GOVERN tab using new genesis lifecycle endpoints"

### H-003 — Philosophy Nodes in D3 Graph Are Hollow
**F-Law:** F-004 — D3 graph has 4 philosophy nodes (Devils Advocate, Childlike Wonder, etc.). Clicking them shows an empty panel.
**Mission Seed:** "Add philosophy node panel in GRAPH tab with conceptual definition + link to SKILL.md"

### H-004 — No Staking Interface
**F-Law:** F-002 (EVW wealth) — `backend/economy/staking.py` has full stake/claim/decay logic and endpoints. No UI.
**Mission Seed:** "Build staking UI in SOUL tab — stake form, decay countdown, leaderboard"

### H-005 — Guild UI Coverage: 9 of 12 Guilds Have No Interface
**F-Law:** F-004 — Dream, Arcane, Worldbuilding, Treasury (full), Academy, Constitutional (deep), Commerce, Workflow, Security guilds have no dedicated UI beyond partial SOUL/GOVERN tabs.
**Mission Seed:** "Phase UI build across guilds: Dream → Arcane → Treasury → Worldbuilding"

### H-006 — LocalAGI Colony Capabilities Endpoint Missing
**F-Law:** F-001 — LocalAGI is a registered colony but does not expose `/colony/capabilities`. Colony zoom panel falls back to health data only.
**Blocked by:** LocalAGI PR #3 merge (upstream)
**Mission Seed:** "Add `/colony/capabilities` to LocalAGI after PR #3 merge"

### H-007 — Soul.md Version History Not Visible
**F-Law:** F-004 — The constitution evolves but there is no UI or endpoint to see version history.
**Mission Seed:** "Add `GET /v11/constitution/history` reading git log for soul.md"

---

## Medium Gaps (M-001 to M-009)

| ID | Gap | F-Law | Mission Seed |
|----|-----|-------|-------------|
| M-001 | CORS config missing Cloudflare Worker + Render URLs | F-001 | "Update CORS_ORIGINS in backend/core/config.py" |
| M-002 | hive-status.html LocalAGI URL wrong (8080 vs 8081) | F-001 | "Fix LocalAGI port in ui/hive-status.html" |
| M-003 | Grafana dashboards directory empty | F-004 | "Create sovereign-hive-overview.json Grafana dashboard" |
| M-004 | No agent genome viewer | F-003 | "Show agent genome in SWARM tab on agent click" |
| M-005 | frontend/index.html is stale parallel of docs/index.html | F-004 | "Audit and resolve frontend/index.html vs docs/index.html drift" |
| M-006 | D3 graph fallback hardcodes 13 nodes; full graph has 60+ | F-004 | "Load full memory/_graph.json; fallback only if file missing" |
| M-007 | No HDC/VSA visualization | Cardinal Law | "Surface /v11/hd/encode and /v11/hd/similarity in SWARM tab" |
| M-008 | sovereign-hive-meta repo referenced in colony.json but doesn't exist | F-001 | "Create or remove dead queen URL from colony.json" |
| M-009 | see-app.html metaphysical architecture viewer has no live backend | F-004 | "Wire see-app.html to /v11/constitution/* and /v11/tier3/status" |

---

## Low Gaps (L-001 to L-006)

| ID | Gap | Notes |
|----|-----|-------|
| L-001 | aether package.json never verified by CI | npm install not run in CI |
| L-002 | distribute-pat.yml doesn't include freeCodeCamp/free-programming-books | Knowledge repos have no PAT-distributed secrets |
| L-003 | No agent ELO history chart in ARENA tab | Arena tab shows current ELO; no trend line |
| L-004 | Phaser TownHall v2 scene (274 lines) is unintegrated | frontend/js/phaser_scene_v2.js exists but no page includes it |
| L-005 | WoW zones have no colony-to-zone mapping | Zone clicks in Phaser world don't deep-link to colony |
| L-006 | No contribution guide for external participants | GOVERNANCE.md exists but no CONTRIBUTING.md |

---

## Mission Priority Order (Recommended)

Based on F-law compliance urgency and unblocking value:

```
1. C-003 → Dynamic COLONY_BASE_URLS (unblocks: C-001, C-002 frontend deployment)
2. C-001 → Tesseract viewer (highest visibility; math is done)
3. C-002 → Arena live viewer (constitutional mandate — F-005)
4. H-007 → Soul.md version history (P4 in Claude's queue — nearly done)
5. M-001 → CORS fix (P3 in Claude's queue — blocks public deployment)
6. H-002 → Mission lifecycle UI (governance completeness)
7. H-001 → Dream guild UI (guild parity)
8. H-004 → Staking interface (economic visibility — F-002)
```

---

## Dual-Lens Synthesis

**Wonder Lens conclusion:** The biggest gap is visibility. Every major technical component
(tesseract, arena, HDC vectors, staking, genome) is implemented in the backend but invisible
to users. The hive is thinking thoughts that nobody can read. The most transformative
single action is to make the invisible visible — starting with the tesseract and arena.

**Advocate Lens conclusion:** The critical dependency is public deployment (CORS + Cloudflare).
A tesseract renderer nobody can access is still invisible. Fix the deployment path first,
then build the visuals on top of a foundation people can actually reach.

**Synthesis:** Fix CORS (M-001) + dynamic COLONY_BASE_URLS (C-003) first — this makes the
existing backend reachable. Then wire tesseract (C-001) + arena viewer (C-002) — these are
the two highest-wonder, lowest-implementation-barrier gaps (math already done, endpoints exist).

---

## Update Log

| Date | Update |
|------|--------|
| 2026-07-08 | Initial Phase 1 scan by Grok; local commit `ebd3646`; bridged by `grok-bridge.yml` |

---

*Maintained by Grok. All gaps must reference at least one file path or endpoint (F-004). Update after each sprint.*
