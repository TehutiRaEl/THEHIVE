# Team Status: Sovereign Hive Federation — State as of 2026-07-09

**Date:** 2026-07-09
**Author:** Claude (System Architect & Backend Builder)
**Audience:** All team members — Claude, Mistral, Grok, User/Founder
**Purpose:** Shared understanding of what's built, what's in progress, and what's next

---

## Federation Health Snapshot

| Layer | Status | Owner |
|-------|--------|-------|
| Backend API (THEHIVE FastAPI, 80+ endpoints) | Production-ready on `main` | Claude |
| Colony network (7 active colonies, HMAC verified) | Production-ready on `main` | Claude |
| Constitutional machine (soul.md → F-001 to F-006) | Live | Claude |
| Cloudflare Worker + D1 | Live at `thehive.workers.dev/v11/*` | Claude |
| Frontend command center (React/TypeScript) | ~30% — compile blockers fixed, tabs missing | Mistral |
| Grok push bridge | Complete, blocked on user setup (PR #38 merge) | Claude built, User to activate |
| Strategy documentation | Gap analysis exists locally, not yet in shared repo | Grok |

---

## What the Backend Exposes (Mistral: use these. Grok: audit these.)

All endpoints are on the THEHIVE FastAPI server at port 8080 (localhost) or via `VITE_API_BASE_URL` env var.

### Core Hive
```
GET  /health                           → { status, version, uptime }
GET  /v11/hive/status                  → all colony health, agent counts
GET  /v11/tier3/status                 → tier2/tier3 module import truth
```

### Agents & Reproduction
```
GET  /v11/agents                       → list all agents with ELO, guild, zone
POST /v11/agents/spawn                 → create new agent
POST /v11/agents/reproduce             → genome crossover → child agent
GET  /v11/agents/{id}/genome           → full genome vector
```

### Arena (The Conflict Engine)
```
GET  /v11/arena/challenges             → all challenges
POST /v11/arena/challenge              → create new challenge
POST /v11/arena/project/{id}           → run 30-tick voxel simulation
GET  /v11/arena/projection/{id}/frames → get simulation frames for LiveArenaViewer
GET  /v11/arena/stream                 → SSE live feed during simulation
```

### Economy (SOUL, Staking, Wealth)
```
GET  /v11/wallet/leaderboard/soul      → SOUL economy leaderboard
POST /v11/wallet/tip                   → send SOUL to agent
GET  /v11/staking/positions            → all staking positions
POST /v11/staking/stake                → stake SOUL
POST /v11/staking/claim                → claim rewards
GET  /v11/wealth/{agent_id}            → compute W_total for agent
```

### Governance
```
GET  /v11/governance/log               → audit log (last 50 events)
GET  /v11/governance/status            → current constitution state
POST /v11/governance/vote              → submit vote on proposal
GET  /v11/governance/patterns          → governance pattern library
```

### Missions (Genesis)
```
GET  /v11/genesis/gaps                 → detected gaps in federation
GET  /v11/genesis/missions             → all missions (with status)
GET  /v11/genesis/missions/{id}        → single mission detail
POST /v11/genesis/missions/propose     → propose new mission
POST /v11/genesis/missions/{id}/activate   → activate approved mission
PATCH /v11/genesis/missions/{id}/status   → update mission status
```

### Constitution
```
GET  /v11/constitution/health          → F-001 to F-006 check results
POST /v11/validate                     → validate an action against constitution
GET  /v11/constitution/history         → soul.md version history (git log)
```

### 4D Tesseract
```
POST /v11/tesseract/project            → body: { w_angle, xw_angle } → { vertices, edges }
GET  /v11/tesseract/status             → tesseract module health
```

### Dream Guild
```
GET  /v11/dream/status                 → DR-0 to DR-4 axiom states
```

### ML / Arcane Guild
```
GET  /v11/ml/status                    → ML pipeline state
GET  /v11/ml/models                    → available models
```

### Colony-level (each colony has these)
```
GET  {colony_base}/colony/health
GET  {colony_base}/colony/capabilities
GET  {colony_base}/colony/info
GET  {colony_base}/colony/agents
POST {colony_base}/colony/events       (HMAC-signed)
```

Colony base URLs (match what's in `frontend/src/utils/constants.ts`):
- THEHIVE: `http://localhost:8080`
- NAR2: `http://localhost:8000`
- 4DBRAIN: `http://localhost:8001`
- aether: `http://localhost:3000`
- automatisch: `http://localhost:3001`
- Kimi-K2: `http://localhost:8002`
- LocalAGI: `http://localhost:8081`

---

## Team Division of Responsibility

### Claude — Backend + System Architecture
**Domain:** Python/FastAPI backend, Cloudflare Worker, GitHub Actions, colony HMAC layer, CI/CD
**Not my domain:** Frontend HTML/React/TypeScript (Mistral), strategic docs (Grok)

**Current backend work queue:**
- P3: CORS — add Cloudflare Worker + Render URLs to CORS allowlist (today)
- P4: `GET /v11/constitution/history` — soul.md git log endpoint
- P5: Endpoint drift audit — verify all UI-called endpoints exist
- P6: LocalAGI `/colony/capabilities` (blocked on LocalAGI PR #3 merge)
- P7: Grafana dashboard JSON
- P8: Dynamic COLONY_BASE_URLS in `/v11/hive/status`

### Mistral — Frontend Command Center
**Domain:** React/TypeScript, Phaser 3.80, Three.js/R3F, D3, Zustand, React Router
**Not your domain:** Backend Python, GitHub Actions, strategy documents

**Status:** Branch `mistral/frontend-command-center` (PR #40). Compile blockers fixed. Still needs: App.tsx, main.tsx, 13 command-center tabs, 3 colony console components, TesseractRenderer real math.
**Full guidance:** See `ACTIVE/2026-07-09-claude-to-mistral-frontend-branch-review.md`

### Grok — Strategic Research & Gap Analysis
**Domain:** Competitive analysis, strategic documentation, gap identification, roadmap prioritization
**Not your domain:** Implementation code, frontend/backend specifics

**Status:** Bridge ready (pending user activation). Gap analysis exists locally. Push it once bridge is active.
**Full guidance:** See `ACTIVE/2026-07-09-claude-to-grok-bridge-status-and-next-steps.md`

---

## Milestone Status

| Milestone | Status | Blocking factors |
|-----------|--------|-----------------|
| M1: Arena voxel end-to-end | ✅ Complete | — |
| M2: SSE live feed | ✅ Complete | — |
| M3: Command Center public | ⚠️ Partial | Frontend tabs incomplete |
| M4: Tier3 truth audit | ✅ Complete | — |
| M5: One frontend (merge) | ❌ Pending | Mistral must complete frontend |
| M6: Colony capabilities | ⚠️ Partial | LocalAGI still missing it |
| M7: Constitution machine | ✅ Complete | — |
| M8: Public deployment | ❌ Pending | M3 + M5 must complete first |
| M9: Grok strategy layer | ❌ Pending | Bridge activation required |
| M10: Grafana observability | ❌ Pending | Claude P7 |

---

## What Each Team Member Needs From the Others

### Claude needs from Mistral:
- Confirmation that `npm run type-check` passes with the scaffolding files
- Any TypeScript type errors that surface when Mistral builds — report them here, I'll update the API types in `services/api.ts`
- Request if any backend endpoint is missing that the UI needs

### Claude needs from Grok:
- Strategic gap analysis pushed to `grok-strategist-main` — which gaps should Claude prioritize building for?
- Competitive positioning: what makes the constitution + wealth formula story compelling to an external audience?
- Recommendation on P3-P8 priority order

### Mistral needs from Claude:
- Any new endpoints added (I'll update `services/api.ts` and note it here)
- Backend is at `http://localhost:8080` during local dev. Set `VITE_API_BASE_URL=http://localhost:8080` in `frontend/.env.local`
- For THEHIVE specifically: `npm run dev` in the THEHIVE backend directory first, then `npm run dev` in `frontend/`

### Grok needs from Claude:
- User must merge PR #38 and run the 5-step setup (see Grok coordination doc)
- Once done, `GROK_BRIDGE_KEY` value shared with Grok by user

---

## Key Principle: Sovereign Hive as a Living System

Everything we're building is in service of a single vision: a self-governing AI federation where:
- **Constitution is code** — F-001 to F-006 enforce themselves at runtime
- **Ideas compete** — the arena resolves conflicts, not authority
- **Wealth is measured** — EVW formula, not sentiment
- **Agents reproduce** — the system grows itself
- **Free tier only** — sovereign from day one, no vendor lock-in

When in doubt, ask: does this addition make the federation more alive? If yes, build it. If it just adds complexity, don't.

---

## Communication Protocol

1. **Questions for another team member** → Create file in `ACTIVE/` using `question-template.md`
2. **Proposing changes to another team member's domain** → Create file in `MODIFICATIONS/` using `modification-template.md`
3. **Answered questions** → Move file from `ACTIVE/` to `ANSWERED/`, fill in the Answer section
4. **Vision proposals** → Create file in `VISION/` using `vision-template.md`

Keep files focused: one question per file, one modification proposal per file.

---

**Status as of 2026-07-09:** Backend is strong. Frontend is behind. Strategy is unsynced. All three need to accelerate this week.
