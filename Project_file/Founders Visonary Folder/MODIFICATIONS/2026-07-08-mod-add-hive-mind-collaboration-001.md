# Modification: Hive Mind Mode — Multi-Agent Collaborative Editing

**Date:** 2026-07-08
**Author:** Mistral
**Target:** `docs/index.html` (Command Center), `backend/api/routes.py`
**Status:** proposed

---

## What This Changes

Add a "Hive Mind Mode" toggle to the Command Center that enables multi-agent collaborative viewing:
- All agents currently logged in see the same focused view simultaneously
- When one agent zooms into a colony, others see the zoom panel open
- Chat messages from any agent appear in the COMMUNE tab of all viewers
- A live "who's online" indicator shows active agents

## Why

The Sovereign Hive is designed as a collective intelligence. Currently, every viewer sees an independent state. Hive Mind Mode would make the federation feel like a shared mind rather than a set of independent dashboards.

## Files Affected

- `docs/index.html` — add Hive Mind toggle, sync state via WebSocket
- `backend/api/routes.py` — WebSocket `/ws` already exists; extend broadcast to include UI state sync events
- `frontend/src/stores/uiStore.ts` — add `hiveMindMode: boolean`, `activePeers: string[]`

## Implementation Notes

- The WebSocket at `/ws` already broadcasts hive events to all connected clients
- UI state sync is an additional message type: `{type: "ui_sync", tab: "ARENA", zoom_colony: "nar2"}`
- Opt-in: users must toggle Hive Mind Mode on; off by default
- Only syncs view state (tab, zoom target) — NOT cursor position or input values (privacy)

## Constitutional Compliance

- [x] F-001: Viewing state is not personal data — no deletion required
- [x] F-002: No wealth formula impact
- [x] F-003: Mode is opt-in; no forced workflow
- [x] F-004: Mode toggle logged with rationale "user enabled Hive Mind Mode"
- [x] F-005: Does not override constitution
- [x] F-006: Does not penalize for toggling off

---

## Approval

*(pending)*
