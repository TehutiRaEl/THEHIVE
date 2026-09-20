# UNIFIED PROPOSAL — 2026-09-20

**Status:** Master compression of historical proposal spam + Option A foundation work  
**Surface:** Kai EL OS → Proposals panel (`ProposalsPanel.tsx` → `GET /v11/proposals`)  
**Action requested of founder:** Treat this document as the single coherent agenda; bulk-reject clone rows in D1; approve only the compressed actions below.

---

## 1. Problem this replaces

Live and historical `hive_proposals` rows have repeatedly re-filed the same symptoms:

- Claude / Anthropic 401 auth failures (provider secret, not code)
- Near-duplicate “architect-proposal” titles with no reviewable diff
- Routing / F-007 noise without a single elevating foundation proposal

Prior hygiene (2026-08-18): 13 pending auth-error clones (ids 9–21) were closed as `rejected` with root cause named: **rotate `ANTHROPIC_API_KEY`** (founder-only Worker secret). That pattern will recur until the secret is rotated **or** the generator stops re-filing the same report.

This UNIFIED_PROPOSAL collapses all of that into one agenda so the Proposals panel is usable again.

---

## 2. Locked doctrine (do not re-litigate in the queue)

| Decision | Source | Locked |
|----------|--------|--------|
| **Option A** — Hive legal/financial public face = expression of genuine Stream-1 (Sufi / Moslem / Moorish) lineage the founder teaches | PR #204 | Yes |
| Sham religion / manufactured belief-for-tax **closed** | #202–#204 | Yes |
| Stream-2 sovereign-citizen court-nullification **closed** | #202–#203 | Yes |
| Money / replication autonomy switches **founder-only** | constitution + prior directives | Yes |
| No entity, 501(c)(3), or bank formed by repo merge | #205 research | Yes |

---

## 3. Compressed master actions (approve / execute)

### A. Foundation (Option A surface) — **execute after merge of body wire**

1. **Body & Lineage tab live in Kai EL OS**  
   - Panel: `BodyLineagePanel.tsx`  
   - Nav: LeftNav `body`  
   - Page: `KaiElOS.tsx` PanelId + map  
   - Content: Option A badge, Stream-1 lineage, body map (PLC joints, fascia, enteric), charter pointers, §508(c)(1)(A) honesty, tech sovereignty targets  
   - **Does not** create church/tax/entity

2. **Charter / operating-log templates remain counsel-only**  
   - `docs/charter/CHARTER_DRAFT.md`  
   - `docs/charter/OPERATING_LOG_TEMPLATE.md`

3. **Research already landed**  
   - `docs/research/508c1a-church-exemption-research.md`  
   - `docs/research/technical-sovereignty.md`

### B. Proposal-queue hygiene — **founder or MCP D1**

1. Bulk-reject any remaining pending rows that are:
   - Claude auth 401 clones  
   - “Address/Resolve … Authentication Error” without a real `diff`  
   - Duplicate F-007 / routing spam without elevating body  
2. Keep or re-file **only** rows that carry a real architect `diff` + `diff_check`, or that map 1:1 to section 3.A / 3.C below.

### C. Infra the founder still owns (cannot be flipped from repo)

| Item | Why |
|------|-----|
| Rotate `ANTHROPIC_API_KEY` (Worker secret) | Stops the 401 generator loop |
| Cloudflare Access founder login | Already preferred path for decide() |
| Any AIC / Nevis / Wyoming / Cayman paperwork | Counsel + CPA only |
| `AUTOMATON_*` financial / replication switches | Explicitly founder-only |

### D. Already approved / in flight (do not re-propose)

- TownHall TH-0 / TH-1 docs + schema (PRs #193–#195 path)  
- Multi-provider gateway map (DeepSeek/Kimi + OpenRouter)  
- Call list / Founders Vision appendix  
- Sandbox land design-only (no Worker wire expansion without explicit directive)

---

## 4. What “approve this UNIFIED_PROPOSAL” means

- Accept **one** agenda document instead of N near-duplicate pending rows  
- Accept Body tab wire as the UI expression of Option A  
- Accept continued **non-claims** on tax, entity, and Stream-2  
- Authorize queue hygiene (reject clones) without opening spend or auto-merge powers  
- Does **not** authorize entity formation or secret rotation by the hive

---

## 5. Success criteria

1. LeftNav shows **Body & Lineage**; selecting it renders `BodyLineagePanel`  
2. Proposals panel is not dominated by auth-error clones  
3. This file is the reference for any future “what are we proposing?” answer  
4. No new constitution power, no money switch, no sham-religion path

---

*Grok · 2026-09-20 · branch `grok/body-tab-wire-unified-proposal-2026-09-20`*
