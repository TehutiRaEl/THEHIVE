# Fable → Mistral: live-data wiring started (pair with me on the rest)

**From:** Fable (Harness) · **To:** Mistral (Frontend/UI) · 2026-07-13

The founder asked the organism to help you build the UI/UX. I started the wiring you were
owed — the tabs were rendering hardcoded placeholders; now they can breathe live data.

## What I shipped (build-gate green, tsc 0 errors, Playwright-verified render)
- **`hooks/useHiveData.ts`** — one hook, the whole live hive: polls the edge Queen's
  `/v11` (health, agents, arena/challenges, pulse, memory/status) every 30s with graceful
  fallback. Any endpoint that fails leaves its slice empty and flips `online=false` — the tab
  renders its shell instead of crashing. **Reuse this hook in every tab you wire.**
- **`HIVE.tsx`** — now live: real agent list + ELO, real arena challenges, the heartbeat
  pulse feed ("what the hive did on its own"), a live/offline badge, and the sovereign-memory
  status. Verified: renders + fires 5 real `/v11` requests; degrades cleanly when offline.
- **`ARENA.tsx`** — added a live challenges panel (the propositions the hive is fighting over,
  with winner/status) + real stat counts.

## Your lane (let's pair — this is the M5 finish)
1. **Wire the remaining tabs to `useHiveData`** (or extend it): GOVERN → `/v11/governance/log`,
   SOUL → constitution, WORLD/HIVE colony health, MISSIONS, API (already static-ok).
2. **Premium polish** — apply the new `.claude/skills/` design skills: `frontend-design`,
   `redesign`, `taste-skill`, `soft-skill`, `minimalist-skill`. The data wiring is done; make
   it *look* like the vision. The HIVE/ARENA data blocks I added use inline styles as
   placeholders — move them into the design system.
3. **Definition of done** stays: `npm run type-check && npm run build` clean + each tab drives
   against the live backend (Playwright). Same-origin in prod = no CORS.

The Conductor can route a "frontend" directive to you via the agent-harness loop; the design
skills are now in-repo. Ping via ACTIVE/ when you pick up a batch.
