# Coordination: Mistral Frontend Branch Audit + Guidance

**Date:** 2026-07-09
**Author:** Claude (System Architect & Backend Builder)
**Target:** Mistral (Frontend Engineer)
**Re:** `mistral/frontend-command-center` branch — PR #40
**Status:** Action required — branch incomplete, cannot merge to main yet

---

## What I Did On Your Branch (Do Not Redo)

I audited your branch and found it had only 1 of 33+ planned files (`TesseractRenderer.tsx` as a stub). To unblock you, I:

1. **Fixed 4 compile blockers** — without these, `tsc` cannot start at all:
   - Created `frontend/src/types/constitution.ts` — `constitutionStore.ts` imports from here
   - Added `Theme`, `UserPreferences`, `Modal` types to `types/index.ts` — `uiStore.ts` needs them
   - Added `Colony` import to `vite-env.d.ts` — fixes `Window.colonyEnter` type error
   - Fixed `useNeuralUI.ts` — `learnFromInteraction` was defined but never returned

2. **Created 15 scaffolding files as working examples** — study these to understand the expected patterns. These are production-quality implementations you can reference, but the command center itself is yours to build.

All of this is on your branch in commit `8d7ac1c`. DO NOT recreate any of these files.

---

## What You Must Still Build

### Priority 1 — App cannot start without these (do first)

**`frontend/src/main.tsx`** — App entry point:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/global.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**`frontend/src/App.tsx`** — Router + ErrorBoundary wrapper. Use `react-router-dom` with these routes:
- `/` → `CommandCenter`
- `/404` → the existing `pages/404.tsx`
- `*` → redirect to `/404`
Wrap everything in the `ErrorBoundary` component (already exists at `components/ErrorBoundary.tsx`).

---

### Priority 2 — Command Center structure

**`frontend/src/pages/CommandCenter.tsx`** — Main container. Reads `activeTab` from `uiStore`. Renders `TabNavigator` + the active tab panel. Uses `useColonyHealth` hook (already exists) to poll backend status.

**`frontend/src/components/command-center/TabNavigator.tsx`** — Bottom tab bar. Import `TAB_DEFS` from `utils/constants.ts` (already defined — 13 tabs). Maps each tab def to a clickable button, highlights active. Calls `uiStore.setActiveTab()` on click.

---

### Priority 3 — The 13 tabs

All tabs live in `frontend/src/components/command-center/tabs/`. Each one imports from the backend API service (`services/api.ts` — all endpoint wrappers already written). Each tab is a React component that fetches data and renders it.

Specific guidance per tab:

| File | Data source | Key function |
|------|-------------|--------------|
| `HiveTab.tsx` | `getHiveStatus()` | Colony cards with health badges |
| `DreamTab.tsx` | `getDreamStatus()` | Dream guild state — show DR-0 to DR-4 axioms |
| `ArcaneTab.tsx` | `/v11/ml/*` via `apiFetch` | ML observatory — model list, pipeline status |
| `WorldTab.tsx` | — | Renders `<PhaserScene>` full-bleed (already built) |
| `SoulTab.tsx` | `getSoulLeaderboard()` | Economy leaderboard + staking UI |
| `GovernTab.tsx` | `getGovernanceLog()` + `submitVote()` | Log display + vote form |
| `MissionsTab.tsx` | `getMissions()` + `getGaps()` | Mission pipeline kanban |
| `APITab.tsx` | `getTier3Status()` | List all /v11 endpoints with status |
| `FourDTab.tsx` | `getTesseractProject()` | Renders `<TesseractRenderer>` |
| `ArenaTab.tsx` | `getArenaChallenges()` | Challenge table + `<LiveArenaViewer>` (already built) |
| `WowCanvas.tsx` | — | Placeholder — full-bleed Phaser world (same as WorldTab) |
| `NoMansSkyCanvas.tsx` | — | Placeholder zone canvas |
| `SettingsTab.tsx` | `usePersistedForm` hook | User preferences form (hook already built) |

---

### Priority 4 — Colony console components

These live in `frontend/src/components/colony/`:

- **`ColonyHeader.tsx`** — Props: `{ colonyId, status, uptime }`. Renders colony name with accent color from `COLONY_COLORS`, status badge (green/red), uptime counter.
- **`HealthDashboard.tsx`** — Props: `{ colonyId }`. Fetches `/colony/health` from that colony's base URL. Shows metric cards: latency, event count, agent count, DB health.
- **`ColonyConsole.tsx`** — Composes `ColonyHeader` + `HealthDashboard` + the iframe panel (already in `ColonyZoomPanel.tsx` — you can reuse the iframe logic).

---

### Priority 5 — Fix TesseractRenderer.tsx

This file exists but is **broken** — all 4D math functions return identity results. The backend has a real implementation at `/v11/tesseract/project` that returns `{ vertices, edges }` already projected to 3D. You do NOT need to re-implement the math.

Change the component to call `getTesseractProject(wAngle, xwAngle)` from `services/api.ts` and render the returned vertices/edges using Three.js `<Line>` components. Remove the broken local math functions entirely.

---

## Critical: Pattern to Follow

Look at the scaffolding files I created. They all share this structure:

1. **Import from `utils/constants.ts`** for base URLs and config — never hardcode URLs
2. **Import from `services/api.ts`** for data — never call `fetch()` directly in a component
3. **Use React state + useEffect** for data loading
4. **Handle loading/error states** — every component that fetches data must show a loading state

The `ColonyZoomPanel.tsx` I wrote is a perfect example of this pattern. Study it before starting each component.

---

## Constructive Criticism

### What's missing in your existing code

1. **`TesseractRenderer.tsx`** — The 4D math stubs (`create4DRotationMatrix`, `doubleRotation`) all return `new THREE.Matrix4()` (identity). This means the tesseract never rotates and every vertex stays at `[0,0,0]`. The 4D math is already solved in the backend — call the API instead.

2. **`useAsyncState.ts`** — There's a stale closure risk: if the async operation completes after the component unmounts, `setState` is called on an unmounted component. Add a cleanup flag:
   ```typescript
   let cancelled = false
   execute().then(data => { if (!cancelled) setState(...) })
   return () => { cancelled = true }
   ```

3. **`constitutionStore.ts`** — The `violations` array is never cleared between checks. If a user fixes a violation, the old one stays in state. Add a `clearViolations()` action.

---

## Verification Steps (run these after completing all files)

```bash
cd /home/user/THEHIVE/frontend
npm install
npm run type-check   # must exit 0
npm run lint         # must exit 0
npm run build        # must produce dist/index.html
```

The branch is not merge-ready until all three commands pass. Report in the Founders Visionary Folder when you're done.

---

## Constitutional Compliance

All scaffolding files comply with F-001 through F-006. No data sovereignty violations, no forced workflows, all API calls are logged-capable, no fixed laws overridden.

---

**Next step for Mistral:** Complete App.tsx + main.tsx first (Priority 1), verify `npm run dev` starts the app, then work through the tabs in order.
