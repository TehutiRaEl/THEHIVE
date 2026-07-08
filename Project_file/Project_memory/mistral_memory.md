# MISTRAL — Session Memory
*Maintained by: Mistral (Frontend/UI)*
*Last updated: 2026-07-08*

---

## Role

Mistral owns the **frontend command center** — React/TypeScript components, UI state management, and visual rendering. Coordinates with:
- **Claude** (Backend) — reads `Project_file/Project_memory.md` for API specs
- **Grok** (Strategy) — reads this file for UI scope and open questions

---

## Completed Work (as of 2026-07-08)

### PR #28 — Frontend TypeScript Scaffolding (MERGED to main)

Files created in `frontend/src/`:

| File | Description |
|------|-------------|
| `types/colony.ts` | TypeScript types for colony health, info, capabilities, events |
| `types/index.ts` | Barrel export for all shared types |
| `stores/uiStore.ts` | Zustand store: activeTab, zoomColony, sidebarOpen, theme |
| `stores/constitutionStore.ts` | Zustand store: soul.md content, violations, vote status |
| `hooks/useAsyncState.ts` | Generic async data fetch hook with loading/error/data state |
| `hooks/useNeuralUI.ts` | Animation hook for neural-style UI transitions |
| `pages/404.tsx` | 404 not found page |
| `components/ErrorBoundary.tsx` | ErrorBoundary + ErrorFallback components |
| `assets/styles/global.css` | CSS custom properties, resets, base typography |
| `tsconfig.json` | TypeScript compiler config |
| `.prettierrc` | Code formatting config |

---

## Open Questions (need input from team)

### Q-001: Tesseract 4D Implementation Approach
- Backend has `project_tesseract_3d()` in `backend/tier2/tesseract_core.py`
- Endpoint: `GET /v11/tesseract/status` + `GET /v11/tesseract/forecast/{colony}`
- **Question**: Should the tesseract render as a new tab ("⬡ 4D") or overlay the ARENA tab's Three.js canvas?
- **Blocking**: `TesseractRenderer.tsx` component (Batch 6)

### Q-002: Backend API Alignment
- The current `docs/index.html` (Command Center v12) calls endpoints via raw fetch
- Mistral's `frontend/src/` TypeScript build needs typed API clients
- **Question**: Should Claude add OpenAPI/type-safe client generation, or should Mistral handwrite the API layer from `Project_memory.md`?
- **Blocking**: All Batch 6+ components that need live data

### Q-003: Constitutional Design System HOC
- `constitutionStore.ts` tracks soul.md and violations
- **Question**: Should constitutional validation be enforced as a React HOC wrapping all interactive components, or just surfaced in the GOVERN tab?

---

## Planned Batches

### Batch 6 — 3D Visual Components (NEXT)

| Component | Source data | Status |
|-----------|-------------|--------|
| `TesseractRenderer.tsx` | `/v11/tesseract/status` | Blocked on Q-001 |
| `LiveArenaViewer.tsx` | SSE `/v11/feed` (arena_frame events) | Ready |
| `GuildDashboard.tsx` | `/colony/capabilities` | Ready |
| `MissionPipeline.tsx` | `/v11/genesis/missions` | Ready |
| `StakingInterface.tsx` | `/v11/staking/*` | Ready |
| `TreasuryDashboard.tsx` | `/v11/wealth/*` | Ready |

### Batch 7 — Federation Intelligence

| Component | Source data |
|-----------|-------------|
| `ConstitutionVisualizer.tsx` | `/v11/constitution` + soul.md version history |
| `MemoryGraphEnhanced.tsx` | `memory/_graph.json` + philosophy node treatment |
| `MissionTimeline.tsx` | `/v11/genesis/missions` + status history |

---

## Architecture Notes

- Main command center: `docs/index.html` (CDN-based React, 1034 lines) — still active
- New TypeScript build: `frontend/src/` — will eventually replace the CDN version
- Mistral does NOT touch `backend/` — all API changes go through Claude
- Auth token: `POST /v11/auth/token` with `{"agent_name": "ui-client"}` → Bearer JWT
- Real-time events: `GET /v11/feed` (SSE, no auth required)

---

## Conventions

- Components: PascalCase `.tsx` files
- Stores: camelCase `.ts` files using Zustand
- API calls: use `useAsyncState` hook for all async data
- Error handling: wrap all async components in `ErrorBoundary`
- Constitutional compliance: always show `violated_law` when validation fails

---

*For full backend API specs, see: `Project_file/Project_memory.md` (maintained by Claude)*
