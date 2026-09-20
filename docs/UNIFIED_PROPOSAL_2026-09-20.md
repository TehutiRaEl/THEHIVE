# UNIFIED PROPOSAL — Compact Master (2026-09-20)

**Source:** Live `GET /v11/proposals` (74 rows) + founder vision (Option A, body, sovereignty).  
**Purpose:** One cohesive decision surface instead of 50+ near-duplicate pending cards.  
**Panel:** Kai EL OS → **Proposals** (left nav). This doc is the compressed reading of that channel.

---

## Snapshot (live)

| Status | Count |
|--------|------:|
| Pending | 53 |
| Rejected | 13 |
| Approved | 8 |
| **Total** | **74** |

**Kinds:** mostly `architect-proposal` spam; a few flip-switch / venture / capability / colony.

---

## Already approved (keep / execute — do not re-propose)

| ID | Title |
|----|--------|
| 1 | Create the "venture" colony repository |
| 2 | Provision Vectorize (sovereign memory) |
| 3 | Provision R2 (Files store) |
| 4 | Bind a founder key so proposals can actually be decided |
| 5 | Build free-API / LLM-gateway discovery (Tier-2, propose-only) |
| 6 | Venture: book-merch dropshipping + faceless multi-platform social |
| 7 | Prioritize Approved Proposals |
| 8 | Assign Work on Approved Proposals |

**Honest follow-through owed:** Vectorize/R2 still switch-gated in SWITCHBOARD until founder flips infra; venture/social remains phase-gated (OAuth, tokens).

---

## Already rejected (do not revive as Claude-key spam)

IDs **9–21** cluster on Claude auth errors and “delay on approved proposals.”  
**Action:** leave rejected; fix providers via secrets/health (`/v11/llm/status`), not new proposal clones.

---

## Pending reality: one theme, many clones

**~50 pending rows** are the same card:

> **Governance Kernel / F-007 — Enhance Task Routing Optimization**  
> (titles vary: #48, #56, #63, #66, “Agent Scheduling”, etc.)

Bodies are low-signal (self-referential, “612 calls 0 in 0 out”, blocked-task hand-waving).  
**They are not 50 independent ideas.** They are one stuck generator.

**Plus one distinct pending:**

| ID | Title |
|----|--------|
| 43 | Hive Foundation Upgrade Proposal |

(Still mostly framed as unblocking F-007 — treat as the same foundation/routing workstream, not a second product.)

---

## THE ONE COHESIVE PROPOSAL (founder decide)

### Title
**Master: Task-routing hygiene + foundation readiness + Option A body (no new spam)**

### Intent
1. **Collapse** all pending F-007 / task-routing / scheduling clones into **one** work item (or bulk-reject clones and keep a single canonical pending ID of your choice).  
2. **Define “done” for routing** in engineering terms (not more architect prose):
   - Prefer capability/specialty fields on TownHall (A-1 path) over vague “kernel”
   - Stop auto-emitting duplicate `architect-proposal` titles for the same F-007 string
   - Optional: rate-limit or dedupe proposal create when title matches last N pending
3. **Foundation readiness** = execute already-approved switches where still open (Vectorize, R2, provider keys) — not another abstract “upgrade Hive Foundation” essay.  
4. **Option A / Body** = already chosen in visionary logs; surface is **Body & Lineage** nav (this PR). Not a money/constitution auto-approve.  
5. **Do not** reopen Claude-key proposal spam; fix auth in secrets.

### Explicit non-goals
- No spend, no constitution rewrite, no Stream-2 court claims  
- No manufactured religion / unlicensed therapy product  
- No automatic merge of Worker money paths  

### Founder decision options

| Choice | Effect |
|--------|--------|
| **A. Bulk-reject** all pending F-007 clones except one canonical ID | Clears Proposals UI; keeps one ticket |
| **B. Bulk-reject all** F-007 clones | Forces a fresh, single, well-written routing proposal later |
| **C. Hold** | UI stays noisy; generator may keep cloning |

Recommend **A** or **B** after you open Proposals and paste founder key for decide.

### Engineering follow-ups (after decide)
1. Dedupe / anti-clone on `POST /v11/proposals` for identical titles  
2. Wire TownHall claim/assign (A-1) when scheduled  
3. Providers DeepSeek/Kimi wire PR if still open  
4. Body panel live after frontend deploy of this branch  

---

## One sentence

Almost every open proposal is the same F-007 routing clone — approve real work by **collapsing or rejecting the swarm**, execute the **already-approved** infra/venture items, and use **Body & Lineage** for Option A awareness instead of filing more architect noise.
