# THEHIVE Call List (canonical)

> **Status:** Draft for **founder acknowledgment**. Until you mark this accepted in the
> Visionary Folder log + FOUNDERS_VISION appendix, agents treat this as the proposed
> map of *what may be called* — not a license to invent new gates or spend paths.
>
> **Date:** 2026-08-29  
> **Authority:** Founder-directed (“add call list to visionary logs and founders vision;
> acknowledge all calls; macro → micro; implement → wire → test → develop → deploy”).

---

## 1. Why this exists

The hive already has many real functions and routes. Without one **call list**, agents
and sessions re-discover them ad hoc, invent parallel names, or claim “wired” when only
docs exist. This document is the single inventory of **calls** the hive is allowed to
rely on — from the founder’s macro intent down to a specific function in
`worker/src/index.js` or a future TownHall route.

**Rule:** If a call is not on this list (or explicitly added by founder ack), it is not
part of the hive’s operating surface for planning or auto-routing.

---

## 2. Macro → micro (how calls are used)

| Level | What “a call” means | Who initiates | Who may execute |
|-------|---------------------|---------------|-----------------|
| **Macro (vision)** | Founder intent, law, irreversible yes/no | Founder | Founder only (FOUNDER_KEY / Access) |
| **Queen (Nanuet)** | Alignment score + optional auto-approve under switch 9 | Proposal create paths | `queenReview` / `queenDecide`; never money/constitution |
| **Kai El** | Plan, direct, synthesize, gateway preference | Chat, work cycle, TownHall plan items | `generate`, `hiveSnapshot`, `runWorkCycle`, POST proposals/updates |
| **Akosha** | Assign / coordinate by specialty | Kai directive or board item | A-1 assign (docs); today: AGENT_WORK turn only |
| **Council (RA body)** | Review / clear / object | Board `council_queue` or consult | `consultElder`, `elderCouncilVeto`; C-0 protocols |
| **Specialists** | Domain work (balance, wisdom, arena, …) | Claim/assign or AGENT_WORK slot | `AGENT_WORK` jobs; findings → board/updates |
| **Arena** | Elo contest + future dispute | Challenge create / heartbeat | `resolveChallenge`, `projectChallenge`; AR-1 later |
| **Edge (Worker)** | HTTP + D1 + cron | Browser, CI, cron | All `/v11/*` routes below |
| **Micro (function)** | One named JS function or SQL table write | Caller above | Exact symbol in `index.js` / schema |

**Flow (locked hierarchy):**  
Founder vision/logs → **TownHall board** → Kai plan/direct → Akosha assign → agents →
Council review → Queen digest (+ vision) → new/strengthened board items (loop).  
Proposals + decide remain the **irreversible** path; TownHall does not replace them.

---

## 3. Call inventory (verified + planned)

### 3.1 Founder / authority (macro)

| Call / surface | Location | Status | Notes |
|----------------|----------|--------|-------|
| `founderAuthOk` | `worker/src/index.js` | **Live** | FOUNDER_KEY; fail-closed |
| `verifyAccessJWT` | same | **Live** | Cloudflare Access alternate |
| `POST /v11/proposals/:id/decide` | same | **Live** | approved / rejected / modified |
| `POST /v11/founder/proposals/:id/decide` | same | **Live** | Access-gated same logic |
| Money / constitution / merge | various | **Founder-only** | Never on auto-approve |

### 3.2 Queen (Nanuet)

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| `queenReview` | `index.js` | **Live** | Scores vs `docs/FOUNDERS_VISION.md` |
| `queenDecide` | same | **Live** | ≥98 + elders; switch 9 |
| `QUEEN_AUTONOMOUS_APPROVAL` | env switch | **Live** | Flip-the-switch; no action-request skip |
| Queen digest → TownHall | Q-1 protocol | **Docs only** | `docs/QUEEN_DIGEST.md` |

### 3.3 Council / Elders

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| `elderCouncilVeto` | `index.js` | **Live** | Ma'at + Solomon on auto-approve |
| `consultElder` | same | **Live** | POST `/v11/council/consult` |
| `ELDER_VOICES` | same | **Live** | maat / solomon / sekhmet |
| C-0 Council protocols | `docs/COUNCIL_PROTOCOLS.md` | **Docs** | RA head; agents later |

### 3.4 Kai El / gateway / work cycle

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| `generate` + `providerOrder` | `index.js` | **Live** | Waterfall + health deprioritise |
| `hiveSnapshot` | same | **Live** | Bounded prompt context |
| `runWorkCycle` / `AGENT_WORK` | same | **Live** | Hourly agent turns |
| `POST /v11/command_text` | same | **Live** | Chat; rate-limited |
| `kaiRemember` / `kaiRecall` / `logDecision` | same | **Live** | KAI_BRAIN switches |
| Provider roster / `/v11/llm/status` | same | **Live** | Honest health |

### 3.5 Akosha / specialists

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| Akosha AGENT_WORK job | `AGENT_WORK` | **Live** | Coordination summary only |
| A-1 assign/claim by specialty | `docs/AKOSHA_ASSIGN.md` | **Docs** | Runtime not wired |
| Specialist jobs (Ma'at…Ptah) | `AGENT_WORK` | **Live** | Findings → hive_updates |

### 3.6 TownHall (shared board)

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| Protocol + schema | `docs/TOWNHALL.md`, `worker/schema/townhall.sql` | **On main** | TH-0 / schema file |
| `GET/POST /v11/townhall` | `docs/TH1_WORKER_ROUTES.md`, PR #195 patch | **Pending apply** | ensureTables + routes |
| Claim / assign routes | A-1 | **Not started** | After TH-1 |

### 3.7 Arena

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| `resolveChallenge` / `projectChallenge` | `index.js` | **Live** | Elo + voxels |
| Arena HTTP routes | `/v11/arena/*` | **Live** | token + rate limit writes |
| AR-1 dispute → board | `docs/ARENA_DISPUTE.md` | **Docs** | Later |

### 3.8 Proposals / updates / colonies

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| `hive_proposals` CRUD + action-request allowlist | `index.js` | **Live** | ACTION_ALLOWLIST |
| `postUpdate` / `GET /v11/updates` | same | **Live** | Bounded channel |
| `POST /v11/colony/report` | same | **Live** | Mesh inbound |
| Venture gaps / sandbox runs | same | **Live** | Separate tables |

### 3.9 Hygiene skills (meta-calls)

| Call | Location | Status | Notes |
|------|----------|--------|-------|
| plan-sync | `.claude/skills/plan-sync/` | **On main** | Update plans before new work |
| sandbox-branch-land | `.claude/skills/sandbox-branch-land/` | **On main** | Branch sandboxed uncommitted work |

---

## 4. Full path: implement → wire → test → develop → deploy

For **every** new or incomplete call on this list, the hive follows the same ladder.
No step is skipped for “docs only” items that claim to be live.

| Stage | Meaning | Evidence |
|-------|---------|----------|
| **1. Specify** | Protocol/doc names the call, inputs, outputs, gates | `docs/*.md`, this list |
| **2. Implement** | Code exists on a branch (schema, function, route) | PR diff |
| **3. Wire** | Call is reachable from the real path (ensureTables, route table, cron, AGENT_WORK) | Live path in `index.js` or workflow |
| **4. Test** | Automated or documented smoke (GET empty, POST create, gate rejects) | `worker/test/*` or acceptance checklist |
| **5. Develop** | Iterate on real feedback (board pressure, specialty mismatch, rate limits) | PLAN_LOG / updates |
| **6. Deploy** | Merged to `main` + Worker Builds / wrangler deploy | Production behavior matches doc |

### Current focus ladder (TownHall TH-1)

1. **Specify** — done (TOWNHALL.md, TH1_WORKER_ROUTES.md)  
2. **Implement** — schema file on main; patch file on PR #195  
3. **Wire** — **open** (apply three anchors in `index.js`)  
4. **Test** — after wire: GET/POST smoke + rate/token  
5. **Develop** — A-1/C-0/Q-1/AR-1 runtimes  
6. **Deploy** — merge + confirm table on edge heartbeat  

### Non-negotiables on every stage

- No money, constitution edit, or merge authority without founder call.  
- High `risk_tier` → `requires_founder=1`.  
- Docs must not say “live” until Wire + Deploy are true.  
- plan-sync before opening a new call family.

---

## 5. Founder acknowledgment

**Required from you (founder):**

1. Read this call list (or skim levels 2–3).  
2. Confirm hierarchy + TownHall flow still match your intent.  
3. Confirm the implement→deploy ladder is how you want work gated.  
4. Mark acceptance in the Visionary Folder log (companion file) and/or reply
   “call list accepted” so agents may treat this as binding inventory.

Until then: **proposed inventory**, not constitutional law.

---

## 6. Maintenance

- New durable call site → add a row here in the same PR that introduces it.  
- Deprecated call → mark **Retired** with date; do not delete history.  
- Queen alignment continues to use `docs/FOUNDERS_VISION.md`; this list is the
  *operational* map that vision points at.
