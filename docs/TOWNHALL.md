# TownHall — Bulletin Board Protocol (TH-0)

> **Status:** TH-0 shipped as protocol + schema design. Runtime table + routes are a follow-on (TH-1).
> **Authority:** Founder-directed 2026-08-29. Hierarchy: Nanuet → Kai El → Akosha; Council (RA) is a separate body; TownHall is the shared work surface.

## Purpose

TownHall is the **bulletin board** every agent (including Kai) works from — not a rename of Roadmap, Proposals, or Venture Planner. Those remain specialized channels. TownHall is the **shared substrate** so a later horde/swarm can scale without the system eating itself: posts leave traces, specialists claim by affinity, failures become innovation items, and the Queen/Council loop can read one place.

Founder task / plan / vision lands here → Kai builds, plans, directs, and prompt-injects Akosha → Akosha assigns by specialty → agent outputs return here → Council review → wisdom to Queen → Queen digests against founder vision/logs → new or strengthened items on the board (loop engineering).

## Non-goals (TH-0 / TH-1)

- No auto-merge to main, no spend, no secret writes, no unbounded tool use.
- Akosha auto-assign, Council RA colony runtime, Arena dispute cases: later slices (A-1, C-0, AR-1).
- Not a second CAMPAIGN.html; CAMPAIGN stays the engineering task queue.

## Who may act

| Actor | Post | Claim / assign | Close / promote | Approve money / constitution |
|-------|------|----------------|-----------------|------------------------------|
| Founder | yes | yes | yes | yes (only) |
| Kai El | yes | recommend | no (unless founder-gated path) | no |
| Akosha | yes | **yes** (A-1) | no | no |
| Specialist agents | yes (findings) | claim matching specialty | no | no |
| Council (protocols → agents) | review notes | no | recommend | no |
| Queen / Nanuet | digest items | no | correlate | no |

## Item kinds

| kind | Meaning |
|------|--------|
| `founder_task` | Direct founder ask |
| `plan` | Build/plan directive from Kai or founder |
| `venture_pointer` | Link to venture brief / sandbox |
| `agent_ask` | Capability or clarification request |
| `assignment` | Akosha-issued work package (A-1) |
| `finding` | Agent work product returned to the board |
| `council_queue` | Awaiting Council review |
| `council_note` | Council protocol output |
| `queen_digest` | Queen correlate/digest against vision |
| `innovation` | Failure or gap turned into a build opportunity |
| `dispute` | Arena or colony conflict (AR-1) |
| `mesh_event` | Cross-colony signal (HiveMesh-shaped) |

## Status machine

`open` → `claimed` → `in_progress` → `in_review` → `digested` → `closed`  
Side paths: `blocked` (needs founder), `decayed` (TTL / pressure decay without claim).

Approved proposal work and TownHall items stay **distinct**: a TownHall item may *link* `proposal_id` / `actioned` state; it does not replace `hive_proposals`.

---

## Refined data schema (TH-0 design)

Fields below are **must-haves** after research into blackboard systems, stigmergy, agentic mesh, harness reliability, and swarm models — beyond the original minimal list (id, ts, author, kind, title, body, status, claimed_by, links, founder_visible).

### Identity and body

| Column | Type | Why |
|--------|------|-----|
| `id` | INTEGER PK | Stable handle |
| `ts` | TEXT ISO | Created |
| `updated_at` | TEXT ISO | Last trace (stigmergy needs mutability of signals, not only append) |
| `author_agent` | TEXT | Who posted (Nanuet, Kai El, Akosha, Ma'at, founder, colony:…) |
| `kind` | TEXT | See kinds table |
| `title` | TEXT ≤200 | Board scan line |
| `body` | TEXT ≤4000 | Substance |
| `status` | TEXT | Status machine |

### Coordination (blackboard + orchestrator hybrid)

| Column | Type | Why |
|--------|------|-----|
| `claimed_by` | TEXT NULL | Specialist or Akosha assignee |
| `assigned_by` | TEXT NULL | Usually Akosha or founder |
| `preferred_specialty` | TEXT NULL | e.g. balance, wisdom, health, drift, arena, architecture, synthesis, coordination |
| `specialty_tags` | TEXT NULL | JSON array of tags for multi-affinity claim |
| `priority` | INTEGER 0–100 | Explicit urgency |
| `pressure` | REAL | Soft signal: rises with age/unclaimed founder_task; falls on claim (pheromone-like) |
| `signal_score` | REAL | Composite ranking for board views (priority + pressure + vision_weight − decay) |
| `ttl_at` | TEXT NULL | Expiry → `decayed` if unclaimed (anti-stale trail) |

### Lineage and loop engineering

| Column | Type | Why |
|--------|------|-----|
| `parent_id` | INTEGER NULL | Prior item this continues or repairs |
| `root_id` | INTEGER NULL | Original founder_task / plan in the chain |
| `loop_phase` | TEXT NULL | `intake` \| `orchestrate` \| `execute` \| `council` \| `queen` \| `innovate` |
| `failure_of_id` | INTEGER NULL | If `kind=innovation`, which item/gap failed |
| `innovation_note` | TEXT NULL | How the hole becomes a build opportunity |

### Federation and mesh

| Column | Type | Why |
|--------|------|-----|
| `colony_id` | TEXT NULL | `thehive`, `aether`, `council`, … |
| `mesh_targets` | TEXT NULL | JSON list of colony ids for fan-out intent |
| `gateway_hint` | TEXT NULL | Preferred provider *role* (reasoning/speed/…) — not a secret; aligns with existing waterfall |

### Governance, vision, risk (harness)

| Column | Type | Why |
|--------|------|-----|
| `founder_visible` | INTEGER 0/1 | Default 1 for founder_task / queen_digest |
| `risk_tier` | TEXT | `low` \| `normal` \| `high` — high never auto-closes |
| `vision_ref` | TEXT NULL | Anchor to FOUNDERS_VISION section or log id |
| `alignment_score` | REAL NULL | Optional Queen/Council fill |
| `council_status` | TEXT NULL | `none` \| `queued` \| `clear` \| `object` |
| `elder_note` | TEXT NULL | Reuse concept from proposals; Council protocol note |
| `requires_founder` | INTEGER 0/1 | Hard stop for money/constitution/external exec |

### Provenance and links

| Column | Type | Why |
|--------|------|-----|
| `proposal_id` | INTEGER NULL | FK-ish to hive_proposals |
| `roadmap_ref` | TEXT NULL | section/title or item id |
| `output_ref` | TEXT NULL | update id, PR url, sandbox run id |
| `provenance` | TEXT NULL | JSON: sources, providers used, token cost if known |
| `contradiction_flag` | INTEGER 0/1 | Blackboard gap/conflict marker |
| `gap_label` | TEXT NULL | What is missing (capability, colony, evidence) |

### Suggested D1 DDL (TH-1)

```sql
CREATE TABLE IF NOT EXISTS townhall_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  author_agent TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  claimed_by TEXT,
  assigned_by TEXT,
  preferred_specialty TEXT,
  specialty_tags TEXT,
  priority INTEGER NOT NULL DEFAULT 50,
  pressure REAL NOT NULL DEFAULT 0,
  signal_score REAL NOT NULL DEFAULT 0,
  ttl_at TEXT,
  parent_id INTEGER,
  root_id INTEGER,
  loop_phase TEXT,
  failure_of_id INTEGER,
  innovation_note TEXT,
  colony_id TEXT,
  mesh_targets TEXT,
  gateway_hint TEXT,
  founder_visible INTEGER NOT NULL DEFAULT 1,
  risk_tier TEXT NOT NULL DEFAULT 'normal',
  vision_ref TEXT,
  alignment_score REAL,
  council_status TEXT,
  elder_note TEXT,
  requires_founder INTEGER NOT NULL DEFAULT 0,
  proposal_id INTEGER,
  roadmap_ref TEXT,
  output_ref TEXT,
  provenance TEXT,
  contradiction_flag INTEGER NOT NULL DEFAULT 0,
  gap_label TEXT
);
-- Bound growth: prune closed+decayed older than N days in a later maintenance job (same discipline as hive_updates cap).
```

### API shape (TH-1, not wired in TH-0)

- `GET /v11/townhall` — list by status/kind/specialty; order by `signal_score` DESC
- `POST /v11/townhall` — token-gated create (anti-spam); high risk_tier forces `requires_founder=1`
- `POST /v11/townhall/:id/claim` — specialist claim if specialty matches (A-1 tightens)
- `POST /v11/townhall/:id/assign` — Akosha/founder only (A-1)
- Founder decide paths unchanged for proposals; TownHall does not replace them

---

## Technique synthesis (why this schema)

### 1. Blackboard architecture
Classic AI blackboard: specialists read/write a shared board; selection follows board content, not only a fixed workflow. Recent LLM-MAS work (e.g. arXiv:2507.01701) shows dynamic selection from shared state can match stronger static graphs with fewer tokens. **TownHall = the board.**

### 2. Stigmergy / swarm intelligence
Coordination via **traces in the environment** (pheromone-like), not only direct messages. Pressure, TTL decay, claim reinforcement, and `innovation` items from failures implement digital stigmergy so a horde does not need full mesh chat. SwarmSys-style explorer/worker/validator cycles map to: post → assign/claim → finding → council_queue.

### 3. Hive mesh
README HiveMesh fans events to colonies. `colony_id` + `mesh_targets` + `kind=mesh_event` make the board federation-aware without requiring System A to be live. Empty space: **Council as its own colony** (`colony_id=council`, head RA) is representable before the colony repo exists.

### 4. Waterfall (providers)
Existing Worker `providerOrder` / health deprioritisation stays the LLM substrate. `gateway_hint` only expresses *role* preference on an item so Akosha/Kai do not fight the gateway; real routing still uses live health.

### 5. Harness techniques
Bounded actions, risk tiers, `requires_founder`, provenance, and separation from execute paths mirror the hive’s existing ACTION_ALLOWLIST / FOUNDER_KEY discipline. Agent-mesh reliability research stresses **delegation-level** identity and evidence — `provenance`, `output_ref`, and high-risk stops are the board-level equivalent.

### 6. Loop engineering
Not a counter-limited “retry loop.” Phases on the item (`loop_phase`) + `failure_of_id` / `innovation` turn holes into structured intake. Queen digest writes new board items rather than only scoring a one-off proposal.

### 7. Hybrid (the empty space)
Most public stacks pick **one** of: central orchestrator, pure swarm, or pure chat mesh. They fail at: (a) founder-gated irreversibility, (b) specialty-true assignment, (c) colony federation, (d) failure→innovation without silent drift.

**TownHall hybrid:**

| Layer | Pattern |
|-------|--------|
| Substrate | Blackboard + stigmergic signals |
| Assignment | Orchestrator-subagent (Akosha) when explicit assign is needed |
| Specialists | Claim by affinity (swarm) on open items |
| Review | Council protocols (generator-verifier style) |
| Authority | Queen ↔ vision; founder gates |
| Fabric | Mesh fields for colonies |
| Energy | Provider waterfall under Gateway Console |

Widespread systems go quiet or brittle on: unbounded agent self-permission, no decay of stale tasks, no contradiction flag, chat-only coordination that does not scale, and “recursive” labels that are just while-loops. Those are the playground: **decay + pressure + contradiction + innovation lineage + risk_tier**, under constitution.

---

## Slice roadmap

| Slice | Deliverable |
|-------|-------------|
| **TH-0** | This document (protocol + schema) |
| **TH-1** | D1 table + GET/POST routes on Worker |
| **C-0** | Council protocols; RA seat; Elders return to duties as backing agents |
| **A-1** | Akosha assign/claim enforcement by specialty |
| **Q-1** | Queen digest → board items |
| **AR-1** | Arena dispute → board |

## Acceptance (TH-0)

- [x] Spec in `docs/TOWNHALL.md`
- [x] Schema lists must-have fields beyond minimal bulletin
- [x] No change to approve/merge/spend code paths
- [ ] TH-1 runtime when founder schedules it
