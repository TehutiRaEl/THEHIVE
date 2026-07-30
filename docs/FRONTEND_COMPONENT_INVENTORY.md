# Frontend Component Inventory

**Author:** Grok (Detective + Frontend UI/UX Master Architect)  
**Date:** 2026-07-29  
**PR:** #132 (`grok/detective-fullstack`)  
**Rule:** Additive documentation only — does not change runtime code.

---

## 1. Primary shell (shipped)

| Path | Role |
|------|------|
| `frontend/src/pages/KaiElOS.tsx` | Root OS experience |
| `frontend/src/components/kai-os/TopStatusBar.tsx` | Live/offline, metrics, overlays |
| `frontend/src/components/kai-os/LeftNav.tsx` | Icon rail / navigation |
| `frontend/src/components/kai-os/CenterGraph.tsx` | Knowledge-graph navigator |
| `frontend/src/components/kai-os/KaiCommune.tsx` | Live chat |
| `frontend/src/components/kai-os/HiveTerminal.tsx` | Activity/log reader |
| `frontend/src/components/kai-os/ConnectedModels.tsx` | LLM roster (honest) |
| `frontend/src/components/kai-os/ConstitutionViewer.tsx` | Live GOVERNANCE.md |
| `frontend/src/components/kai-os/ProposalsPanel.tsx` | HITL proposals |
| `frontend/src/components/kai-os/HiveUpdates.tsx` | Hive → founder updates |
| `frontend/src/components/kai-os/FilesPanel.tsx` | R2-gated files |
| `frontend/src/components/kai-os/LegalLearning.tsx` | Legal study surface |
| `frontend/src/components/kai-os/VenturePlanner.tsx` | Venture brief → proposal |
| `frontend/src/components/kai-os/RoadmapAvatar.tsx` | Evolutionary bars |
| `frontend/src/components/kai-os/BiosystemOverlay.tsx` | Biosystem iframe |
| `frontend/src/components/kai-os/GatewayConsoleOverlay.tsx` | Gateway console |
| `frontend/src/components/kai-os/Observatory.tsx` | Full-screen graph mode |
| `frontend/src/components/kai-os/WorkflowsDrawer.tsx` | Workflow shortcuts |
| `frontend/src/components/kai-os/DreamLogs.tsx` | Heartbeat-as-dreams |
| `frontend/src/components/kai-os/BottomActivityFeed.tsx` | Live activity strip |
| `frontend/src/components/kai-os/KaiSigil.tsx` | Sacred-geometry mark |

## 2. Legacy Command Center tabs (reachable)

Under `frontend/src/components/command-center/tabs/`:

`SOUL`, `ARENA`, `GOVERN`, `MISSIONS`, `4D`, `API`, `ARCANE`, `DREAM`, `HIVE`, `NO_MANS_SKY`, `SETTINGS`, `WORLD`, `WOW`

Supporting: `TabNavigator.tsx`, `PlannedControl.tsx` (honest “not yet wired”), `KaiChatBox.tsx`, `LiveArenaViewer.tsx`, `TesseractRenderer.tsx`.

## 3. Gamified / domain components

| Area | Paths |
|------|--------|
| Missions | MissionBoard, MissionCard, MissionDetails, MissionTimeline |
| Memory | MemoryVault, MemoryItem, MemoryDetails, MemoryGraph, MemoryGraphEnhanced |
| Constitution | ConstitutionHall, ConstitutionVisualizer |
| Feedback | AchievementToast, LevelUpNotification |
| 3D / other | TesseractChamber, PhaserScene, ColonyCard, HiveDashboard, ResourceBar, QuickStats |
| Colony consoles | `components/colony/*ColonyConsole.tsx`, HealthDashboard |
| Common | Button, Card, Modal |

## 4. WIP / excluded from production build

`frontend/src/worlds/`, `voxel/`, `xp/`, `avatars/`, `conversation/` — present, many TS errors, excluded via `tsconfig.build.json`. See `docs/WIP_VOXEL_WORLDS_STATUS.md`.

## 5. Design / vision artifacts (not live UI)

- `Project_file/Founders Visonary Folder/MODIFICATIONS/floating-menu-hub`
- `canvases/thehive-floating-menu/CANVAS.md`
- Unity/Unreal plan under MODIFICATIONS

## 6. Hooks & data layer

`useHiveData`, `useViewport`, `useColonyHealth`, `useWebSocket`, `useAsyncState`, `useNeuralUI`, `usePersistedForm`  
Services: `api.ts`, `websocket.ts`, `github.ts`, `sentry.ts`  
Stores: `uiStore`, `gameStore`, `constitutionStore`
