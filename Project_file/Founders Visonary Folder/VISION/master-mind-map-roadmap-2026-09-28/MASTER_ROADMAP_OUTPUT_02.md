# THE COMPLETE ROADMAP — Output 2 of 3

Every Campaign, Every File, Every Schema, Every Code Artifact

**Source:** Founder-supplied Master Mind Map & Roadmap (2026-09-28). Unabridged.

---

## CAMPAIGN DEPENDENCY GRAPH

```
CAMPAIGN 0 (Spark)
    ↓
CAMPAIGN 1 (Memory)
    ↓
CAMPAIGN 2 (Closed Loop)
    ↓
CAMPAIGN 3 (Goal-Directed)
    ↓
CAMPAIGN 4 (Swarm)
    ↓
CAMPAIGN 5 (Tree)
    ↓
CAMPAIGN 6 (Legal Fence) — runs alongside all
    ↓
CAMPAIGN 7 (Full Autonomy)
    ↓
CAMPAIGN 8 (The Game)
    ↓
RETURN CAMPAIGN (Lessons feed next cycle)
```

---

## CAMPAIGN 0: THE SPARK — Minimum Viable Loop

**Tier:** 1 (Scheduled) · **Goal:** Prove the loop · **Duration:** ~1 hour setup

| Artifact | Purpose |
|----------|--------|
| `ghost.md` | Plain task list every run reads |
| `.github/workflows/ghost.yml` | Hourly + dispatch: read tasks + FOUNDERS_DIRECTORY, call free LLM (Groq), append `logs/ghost-log.md`, commit as ghost |
| `FOUNDERS_DIRECTORY.md` | Vision reference in plain language |
| Secret `GROQ_KEY` | Spark |

**Exit gate:** Workflow runs on schedule; log shows LLM output; system alive.

---

## CAMPAIGN 1: THE MEMORY — The HOARD

**Tier:** 2 · **Goal:** Persistent memory read/write

| File | Purpose |
|------|--------|
| `STATE.md` | Phase, last run, goals, blocked |
| `OUTCOMES.md` | Timestamp · Action · Expected · Actual · Delta · Lesson |
| `MEMORY.md` | What works / does not / patterns |
| Cloudflare D1 `thehive-memory` | Structured state |
| Vectorize `thehive-vectors` | Semantic recall |
| Durable Objects Queen/Hive | Session state |

**Schema tables:** ghost_runs · evolution_candidates (rung, forensic_report, status) · evolution_outcomes (30-day measurement) · kaiel_directives + history · hive_federation (parent, depth, lineage, soul_mode) · audit_chain · memory_md

```bash
wrangler d1 create thehive-memory
wrangler d1 execute thehive-memory --file=migrations/0001_initial.sql
wrangler vectorize create thehive-vectors --dimensions=768 --metric=cosine
```

**Exit gate:** Reads prior state each run; carries memory forward.

---

## CAMPAIGN 2: THE CLOSED LOOP

**Tier:** 3 · **Key word:** ADJUSTS

`PLAN.md` + `closed-loop.yml` (every 2h): read state → check previous outcome via LLM → act → observe → update STATE/OUTCOMES.

**Exit gate:** Behavior changes based on history — automation begins.

---

## CAMPAIGN 3: GOAL-DIRECTED

**Tier:** 4 · `GOALS.md` · `PROGRESS.md` · system generates prioritized sub-tasks from founder goal.

**Exit gate:** System decides next steps; founder reviews; system executes.

---

## CAMPAIGN 4: THE SWARM

**Tier:** 4–5 · `agents/mind.py` (AZR) · `body.py` · `soul.py` · `daemon.py` · `solomon.py` (blocks HARD_RULES / verify_auth / API keys) · `orchestrator.py` (security → execute → verify → remember)

**Exit gate:** Multi-agent coordination works.

---

## CAMPAIGN 5: THE TREE

**Tier:** 5 · `federation/messages.py` (DESCEND/ASCEND/BROADCAST + signature rules) · `signature.py` (Ed25519) · `soul_economy.py` (isolated / bridged+founder sig / shared deferred)

**Exit gate:** Two hives heartbeat + exchange.

---

## CAMPAIGN 6: LEGAL FENCE (parallel all tiers)

`fence/playground.py` — four checks · `risk.py` — HIGH sandbox / MEDIUM founder / LOW+ZERO execute · `audit.py` — SHA-256 chain

**Law notes:** public data readable; robots.txt ≠ DMCA TPM; ToS compliance guardrails; GDPR/EU AI Act; liability is human → fence in code.

**Exit gate:** Every action through fence; audit records all.

---

## CAMPAIGN 7: FULL AUTONOMY

**Tier:** 6–7 · self_modify · self_repair · self_reproduce · queen_presence (absorb → sync HOARD)

**Exit gate:** Runs without constant intervention; founder supplies vision.

---

## CAMPAIGN 8: THE GAME — the gamified form

**Added by founder decision 2026-11-11 (cross-reference Q2) — not part of the original 2026-09-28 road map text.**

**Tier:** Later — after Full Autonomy · **Status:** Far-ahead planning, not live.

**Goal:** The gamified expression of the federated AI Nation — the commercial game studio form of the Hive. The game is the Nation made playable as a world.

**Plan:** Unity first, then Unreal, per the July 15 Unity plan (`Project_file/Founders Visonary Folder/MODIFICATIONS/unity-migration-unreal-engine-architecture-plan`); 1,000+ players. The game's own phase timing (Unity MMORPG, then Unreal AAA, then metaverse expansion) is the game's timeline, to be set when the game form begins — it is not the Hive's current schedule.

**Team:** 101 roles with a $3.7M–$7.56M budget for Campaign 8 (per idea#1.md, 2026-07-15) — the current Hive runs on five AI seats plus the founder (per TEAM_CHARTERS.md, 2026-07-10/18). The two team sizes are for different phases, not in conflict.

**Navigation:** The floating menu hub (`Project_file/Founders Visonary Folder/MODIFICATIONS/floating-menu-hub`, 2026-07-15; also `canvases/thehive-floating-menu/CANVAS.md`) is the visual prototype for the game form's navigation surface — not the current Hive's navigation, and not to be wired into the live app.

**Exit gate:** The gamified form is live; the Nation is playable as a world.

---

## FILE TREE (blueprint target)

```
THEHIVE/
├── .github/workflows/{ghost,closed-loop,goal-directed,return}.yml
├── agents/{mind,body,soul,daemon,solomon}.py + orchestrator.py
├── federation/{messages,signature,soul_economy}.py
├── fence/{playground,risk,audit}.py
├── autonomy/{self_modify,self_repair,self_reproduce,queen_presence}.py
├── migrations/0001_initial.sql
├── logs/ · ghost.md · FOUNDERS_DIRECTORY.md · STATE/OUTCOMES/MEMORY/PLAN/GOALS/PROGRESS.md · SOUL.MD
├── wrangler.toml · requirements.txt · README.md
```

## FREE STACK

OmniRoute/gateways · Workers AI · Groq · Google AI Studio · Cerebras · GitHub Actions · D1 · Vectorize · Durable Objects · n8n · LangGraph · CrewAI · Open Deep Research — all free-tier first.

---

*End of Output 2 of 3.*
