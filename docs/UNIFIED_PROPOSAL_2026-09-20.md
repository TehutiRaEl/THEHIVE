# UNIFIED PROPOSAL — 2026-09-20

**Status:** Master compression of historical proposal spam + Option A foundation work  
**Surface:** Kai EL OS → Proposals panel (`ProposalsPanel.tsx` → `GET /v11/proposals`)  
**Action requested of founder:** Treat this document as the single coherent agenda; bulk-reject clone rows in D1; approve only the compressed actions below.

**Also see:** `docs/PROPOSAL_COALESCENCE.md` (one problem → one expandable master) · Intellectual Omnivore vision (Kai appetite)

**Conflict resolution note:** #206 landed the body-wire + base UNIFIED on main. This revision is the #207 supersession (Omnivore + coalescence locks) plus the **operational keep** from #208 (live counts, ID tables, F-007 A/B/C bulk-reject choices).

---

## 1. Problem this replaces

Live and historical `hive_proposals` rows have repeatedly re-filed the same symptoms:

- Claude / Anthropic 401 auth failures (provider secret, not code)
- Near-duplicate “architect-proposal” titles with no reviewable diff
- Routing / F-007 noise without a single elevating foundation proposal

Prior hygiene (2026-08-18): 13 pending auth-error clones (ids 9–21) were closed as `rejected` with root cause named: **rotate `ANTHROPIC_API_KEY`** (founder-only Worker secret). That pattern will recur until the secret is rotated **or** the generator stops re-filing the same report (PROPOSAL_COALESCENCE Stage 1).

This UNIFIED_PROPOSAL collapses all of that into one agenda so the Proposals panel is usable again. **Future** related filings must **extend this master** (or a distinct new master), not spawn clones.

---

## 2. Live queue snapshot (from #208 keep — approximate at capture)

| Status | Count |
|--------|------:|
| Pending | ~50–53 (mostly F-007 / task-routing clones) |
| Rejected | 13 (ids 9–21 auth-error cluster) |
| Approved | 8 (ids 1–8 infra/venture) |
| **Total observed** | **~74** |

**Kinds:** mostly `architect-proposal` spam; a few flip-switch / venture / capability / colony.

### Already approved (keep / execute — do not re-propose)

| ID | Title |
|----|--------|
| 1 | Create the "venture" colony repository |
| 2 | Provision Vectorize (sovereign memory) |
| 3 | Provision R2 (Files store) |
| 4 | Bind a founder key so proposals can actually be decided |
| 5 | Build free-API / LLM-gateway discovery (tier-2, propose-only) |
| 6 | Venture: book-merch dropshipping + faceless multi-platform social |
| 7 | Prioritize Approved Proposals |
| 8 | Assign Work on Approved Proposals |

**Honest follow-through:** Vectorize/R2 may still be switch-gated in SWITCHBOARD until founder confirms; venture/social remains phase-gated (OAuth, tokens).

### Already rejected (do not revive as Claude-key spam)

IDs **9–21** — Claude auth / delay cluster. Leave rejected; fix providers via secrets (`/v11/llm/status`), not new proposal clones.

### Pending reality: one theme, many clones

**~50 pending rows** are the same card family:

> **Governance Kernel / F-007 — Enhance Task Routing Optimization**  
> (titles vary: scheduling, agent routing, etc.)

Bodies are low-signal. **They are not 50 independent ideas.** Plus distinct-but-related framing such as “Hive Foundation Upgrade” — treat as the same foundation/routing workstream.

---

## 3. Locked doctrine (do not re-litigate in the queue)

| Decision | Source | Locked |
|----------|--------|--------|
| **Option A** — genuine Stream-1 lineage public face | PR #204 | Yes |
| Sham religion / manufactured belief-for-tax **closed** | #202–#204 | Yes |
| Stream-2 sovereign-citizen court-nullification **closed** | #202–#203 | Yes |
| Money / replication autonomy switches **founder-only** | constitution + prior directives | Yes |
| No entity, 501(c)(3), or bank formed by repo merge | #205 research | Yes |
| **Intellectual Omnivore** — unfiltered world-data appetite; digestion into structure | 2026-09-20 vision | Yes |
| **Proposal coalescence** — one problem → one expandable master | PROPOSAL_COALESCENCE | Yes |
| Body & Lineage tab wired in Kai EL OS | **#206 merged** | Yes |

---

## 4. Compressed master actions

### A. Foundation (Option A surface) — **shipped in #206**

1. Body & Lineage tab — `BodyLineagePanel` + LeftNav `body` + KaiElOS panel map  
2. Charter / operating-log templates remain counsel-only  
3. Research already landed (508(c)(1)(A), technical sovereignty)

### B. Proposal-queue hygiene — **founder or MCP D1**

| Choice | Effect |
|--------|--------|
| **A. Bulk-reject** all pending F-007 clones except one canonical ID | Clears UI; keeps one ticket |
| **B. Bulk-reject all** F-007 clones | Forces a fresh, single, well-written routing proposal later |
| **C. Hold** | UI stays noisy; generator may keep cloning |

Recommend **A** or **B**. Also reject any remaining Claude-auth / no-diff clones.

Going forward: generator and Kai **coalesce** instead of clone (Stage 1 in PROPOSAL_COALESCENCE).

### C. Infra the founder still owns

| Item | Why |
|------|-----|
| Rotate `ANTHROPIC_API_KEY` (Worker secret) | Stops the 401 generator loop |
| Cloudflare Access vars (`ACCESS_TEAM_DOMAIN` / `ACCESS_AUD` / `FOUNDER_EMAIL`) | Worker does not recognize Access JWT until set |
| Any AIC / Nevis / Wyoming / Cayman paperwork | Counsel + CPA only |
| `AUTOMATON_*` financial / replication switches | Explicitly founder-only |

### D. Already approved / in flight (do not re-propose)

- TownHall TH-0 / TH-1 docs + schema  
- Multi-provider gateway map (DeepSeek/Kimi + OpenRouter)  
- Call list / Founders Vision appendix  
- Sandbox land design-only  
- Body tab wire (**#206 merged**)

### E. New masters only for distinct problems

- Stage 1 worker coalesce implementation (code + tests)  
- A real architect diff for a named gap  
- A new opportunity class not covered by Option A / Body / hygiene  

Everything that is more depth on the same stack **extends** this master — no parallel pending twin.

---

## 5. What “approve this UNIFIED_PROPOSAL” means

- Accept **one** agenda instead of N near-duplicate pending rows  
- Accept Body tab (#206) as Option A UI expression  
- Accept Intellectual Omnivore + coalescence as standing rules  
- Accept continued **non-claims** on tax, entity, and Stream-2  
- Authorize queue hygiene (reject clones) without opening spend or auto-merge powers  
- Does **not** authorize entity formation or secret rotation by the hive

---

## 6. Success criteria

1. LeftNav shows **Body & Lineage** (post-#206 deploy)  
2. Proposals panel is not dominated by auth-error / F-007 clones  
3. This file is the reference for foundation “what are we proposing?”  
4. New related insight **extends** masters rather than multiplying pending rows  
5. No new constitution power, no money switch, no sham-religion path

---

*Grok · 2026-09-20 · conflict-resolved post-#206; absorbs #208 operational keep*
