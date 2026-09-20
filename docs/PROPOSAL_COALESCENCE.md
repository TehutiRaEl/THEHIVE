# Proposal Coalescence — One Problem → One Expandable Master

**Date:** 2026-09-20  
**Founder rule:** A single Kai proposal on a problem/task/job/opportunity/change should **not** spawn a swarm of near-duplicate pending rows. Related filings **expand the same proposal**. Kai may widen that master into grey areas and loopholes. The Proposals surface stays **hive autonomy + human-in-the-loop**.

**Surface:** Kai EL OS → Proposals panel (`ProposalsPanel.tsx` → `/v11/proposals`)  
**Companion doctrine:** Intellectual Omnivore vision (appetite); this doc (digestion into the queue)

---

## 1. Why this exists

Historical failure mode:

- One real issue (e.g. Claude 401) → dozens of near-identical `architect-proposal` rows  
- Panel becomes unusable  
- Founder cannot tell signal from echo  
- UNIFIED_PROPOSAL (2026-09-20) was a **manual** compression of that spam

New rule: **coalesce by problem identity**, not by “every firing gets a new id.”

---

## 2. Core rules

| Rule | Meaning |
|------|--------|
| **R1 — One master per problem** | Same problem / task / job / opportunity / change / improvement → **one** pending (or decided) master proposal |
| **R2 — Expand, don’t fork** | New insight, grey area, loophole, related fix, or deeper meal attaches as **extension** of that master (body growth, child notes, or `modifies_id` lineage) — not a sibling pending clone |
| **R3 — Kai may widen** | Inside the master, Kai is allowed to extend scope into adjacent grey areas and loopholes (Intellectual Omnivore digestion) so the founder sees the **full plate**, not a polite fragment |
| **R4 — Human still decides** | Approve / Reject / Modify remain founder-gated (Access or FOUNDER_KEY). Nothing auto-applies |
| **R5 — Diffs stay first-class** | Architect masters that claim code must carry reviewable `diff` + `diff_check` when available; prose-only clones of an existing master are rejected or folded |
| **R6 — Autonomy is drafting + coalescing** | Hive autonomy = propose, research, expand, coalesce, surface. Autonomy ≠ silent merge, spend, or entity formation |

---

## 3. What “same problem” means (operational)

Two filings are the **same problem** when any of these hold:

1. Same root symptom (e.g. provider 401, missing Body tab, TH-1 wire gap)  
2. Same target artifact or route (same file set, same `/v11/...` surface, same constitution clause)  
3. Same opportunity class already named in an open master (e.g. “Option A surface,” “proposal hygiene”)  
4. Explicit `modifies_id` / “extends proposal N” reference  

When in doubt: **fold into the existing open master** and widen the body. Creating a second pending row requires a **distinct** problem identity.

---

## 4. Expansion mechanics (design; wire in stages)

### Stage 0 — Doctrine only (this PR)

- Rules R1–R6 binding for Kai when filing  
- Founder + operators treat UNIFIED_PROPOSAL + this doc as the compression standard  
- Manual / MCP hygiene still allowed: reject clones, keep masters

### Stage 1 — Generator behavior (worker / automaton)

Before `INSERT` a new pending proposal:

1. Search open pending masters for problem match (title embedding / keyword / kind+target)  
2. If match → **UPDATE** master body (append section: new evidence, grey area, proposed extension) **or** create a child row with `modifies_id = master` and status that does not flood “Pending” as a peer  
3. If no match → create new master  
4. Never open N clones for the same auth-error / same missing-diff symptom

### Stage 2 — Panel UX

- Group by master; show expansion count / last extended  
- “Expand this proposal” action (Kai or founder) widens body in place  
- Modify remains the human counter-proposal path (already implemented)

### Stage 3 — Optional API

- `POST /v11/proposals` accepts `extends_id`  
- `POST /v11/proposals/:id/extend` for Kai-authenticated append  
- Decide still only on the master (or explicit child if product requires)

**No stage auto-approves. No stage flips money switches.**

---

## 5. Relationship to UNIFIED_PROPOSAL

`docs/UNIFIED_PROPOSAL_2026-09-20.md` is the **worked example** of coalescence applied after the fact to historical spam.

Going forward:

- New work should land as **extensions of that master** or as **new masters with distinct problem ids**  
- Auth-error / no-diff clones remain rejectable under §3.B of UNIFIED_PROPOSAL  
- Intellectual Omnivore meals that touch the same foundation (Option A, Body, charter, 508 honesty) extend those masters rather than opening parallel queues

---

## 6. Success criteria

1. Founder can open Proposals and see **few masters**, each deep, not a wall of clones  
2. Kai’s next filing on an existing problem **grows** that proposal instead of adding a twin  
3. Grey areas appear **inside** the master as explicit sections the founder can accept, reject, or modify  
4. Human-in-the-loop decide path unchanged  
5. Omnivore appetite is satisfied in **research + master body**, not in row count

---

## 7. Non-claims

- This doc does not by itself change `worker/src/index.js` behavior until Stage 1 is implemented and merged  
- Does not authorize autonomous apply of diffs  
- Does not expand constitution spend/merge powers  

---

*Grok · 2026-09-20 · founder directive: one proposal expands; Kai widens grey areas; human decides*
