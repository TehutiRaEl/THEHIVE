# Deploy / Wire Ledger — FABLE Level 5 (2026-09-30)

**Purpose:** Stop losing "on main but dead" state. Every module that was merged in the last 12 PRs is scored: **on disk → wired in runtime → deployed/live**.

**Rules:** Merged ≠ wired ≠ live. Founder gates (Access, production D1, money switches) stay founder-only.

---

## Legend

| Mark | Meaning |
|------|---------|
| **DISK** | File exists on `main` in the correct tree |
| **WIRE** | Imported/called from the live runtime path (`index.js`, nav, etc.) |
| **LIVE** | Evidence of production deploy / binding / migration applied |
| **—** | Not applicable or blocked on founder action |

---

## Dual Lens / proposals (#211, #213)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| `worker/src/lens/anchor.js` (`withLens`) | YES | see wire PR | NO | Wire branch applies `withLens` to work-cycle system prompt |
| `worker/src/lens/voice.js` (`loadVoice`) | YES | see wire PR | NO | Needs R2 VOICE.md optional later |
| `worker/src/lens/spec.md` (G-POS) | YES | — | — | Spec corpus; not executed as code |
| `worker/src/agents/seer.js` | YES | see wire PR | NO | Ptah `PROPOSAL:` path only when wire lands |
| `worker/src/gates/create-gate.js` | YES | see wire PR | NO | POST `/proposals` + Ptah path |
| `worker/src/migrations/001-add-normalized-title.sql` | YES | ensureTables ALTER when wire lands | **NO prod until founder** | Staging first (founder 2026-09-30) |
| `docs/LENS_INDEX_WIRE.patch` | YES | truncated / incomplete | — | Surgical apply preferred; patch EOF-broken |
| `voice-of-the-hive/VOICE.md` | YES | loadVoice when wire + R2 | NO | First compression on main via #213 |

## Body / Kai EL OS (#205, #206)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| `frontend/.../BodyLineagePanel.tsx` | YES | YES (`KaiElOS.tsx`) | **UNVERIFIED** | Source wired; Pages/`docs/app` may lag |
| LeftNav `body` item | YES | YES | **UNVERIFIED** | Same deploy question |
| `sandbox/body-lineage/*` | YES | — | — | Sandbox prototype, not Kai EL OS |

## Biosystem / Access (#209)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| BiosystemOverlay Live → `/v11` | YES | YES (client) | Depends on Worker | Retires JASPER as primary |
| Access JWT code in `index.js` | YES | YES (code path) | **NO** | `wrangler.jsonc` Access vars still commented |
| `ACCESS_TEAM_DOMAIN` / `AUD` / `FOUNDER_EMAIL` | commented template | — | **NO** | Founder dashboard |

## Doctrine / vision (#210, #214)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| Omnivore + coalescence docs | YES | — | — | Stage 1 generator **not built** |
| Master Mind Map Outputs 1–3 | YES | — | — | Ontology deposit |
| PLAN_WEAVE | YES | — | — | Does not replace plan v2 |
| Legal Fence (Campaign 6) | roadmap only | **NO** | NO | Priority B after runner |

## TH-1 / TownHall (earlier)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| `docs/TH1_INDEX_WIRE.patch` | YES | **NO** (not proven applied) | NO | Treat as pending |
| `worker/schema/townhall.sql` / routes docs | YES | partial / unknown | NO | Verify separately |

## CI / infra (#214)

| Artifact | DISK | WIRE | LIVE | Notes |
|----------|------|------|------|-------|
| provider-routing tests + deepseek/kimi | YES | YES | CI green when public | Fixed stale expectations |
| colony-health advisory | YES | YES | YES | Does not block merge |
| federation YAML repair | YES | YES | YES | Was invalid YAML before #214 |

## Founder switches (SWITCHBOARD) — not flipped

| Switch | LIVE |
|--------|------|
| Access vars | NO |
| HIVE_FEDERATION_TOKEN | NO |
| Money / replication | OFF (must stay) |
| Production D1 `001` migration | NO until staging OK |

---

## Wire PR tracking

| Branch / PR | Intent | Status |
|-------------|--------|--------|
| `feat/lens-index-wire-local-2026-09-30` | Apply Dual Lens to `index.js` | Opened with this ledger |
| `feat/lens-index-wire-2026-09-26` | Broken placeholder | **Do not merge** |

## Last updated

2026-09-30 — forensic pass after #214 merge; ledger + Dual Lens local wire branch.
