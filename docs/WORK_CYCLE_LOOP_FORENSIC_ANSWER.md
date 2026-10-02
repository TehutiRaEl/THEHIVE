# Open Question Answered — Work Cycle Loop Forensic

**Date:** 2026-10-02  
**Question:** Does the work-cycle code read the previous cycle's output at the start of the next cycle?  
**Method:** Direct read of `worker/src/index.js` on `main` (`runWorkCycle`, `hiveSnapshot`, `AGENT_WORK`).

---

## Short answer

**Yes — partially. A thin read-loop exists. A learning / novelty / accumulation loop does not.**

| Layer | Present? | Evidence |
|-------|----------|----------|
| Read last agent-work into next prompt | **Yes** | `hiveSnapshot()` loads last 5 `agent-work` rows |
| Rotate agent based on last turn | **Yes** | `nextWorkTurnIndex(last.title)` |
| Kai synthesizes others' filings | **Yes** | Kai El job system text |
| Full body of prior work in context | **No** | Each prior body **sliced to 160 chars** |
| Novelty / hash / delta vs prior run | **No** | Not in code |
| Durable Kai brain write | **No** | `KAI_BRAIN_WRITE` off (live autonomy API) |
| Goal spiral (A→B→C accumulation) | **No** | Fixed rotating job templates; 3–4 sentence briefs |

---

## Code facts (not interpretation)

### 1. Previous outputs are loaded

```js
DB.prepare(
  "SELECT kind, title, body FROM hive_updates WHERE kind='agent-work' ORDER BY id DESC LIMIT 5"
).all()
```

Then packed as:

```js
'WHAT AGENTS RECENTLY FILED: ' + updates.results.map(
  u => `${u.title}: ${String(u.body || '').slice(0, 160)}`
).join(' | ')
```

So the next cycle **does** see prior filings — but only **160 characters of body each**, plus title. That is a **whisper of the past**, not a full re-read of the prior thought.

### 2. Rotation uses the last title

```js
const last = await DB.prepare(
  "SELECT title FROM hive_updates WHERE kind='agent-work' ORDER BY id DESC LIMIT 1"
).first();
turn = nextWorkTurnIndex(last?.title);
const job = AGENT_WORK[turn % AGENT_WORK.length];
```

This was fixed after a production bug where Ma'at ran for 7+ hours without rotating. Rotation is real; **progress toward a goal is not**.

### 3. Output size is capped **by instruction**, not only by broken pipes

```js
maxTokens: 220,
// job.system texts repeatedly require:
// "ONE short brief of 3-4 sentences" / "3-4 sentences"
```

**Correction to the meta-forensic's 4.2% ratio story:**  
Low tokens-out is **partly designed**. A 3–4 sentence brief at ~30 tokens is compliant behavior under `maxTokens: 220` and the system prompt — not pure evidence of "empty echo from a dead mind."

The meta-forensic is still right that this is **not productive novel work at scale**. It is wrong if it treats ~31 tokens/call as proof the model cannot think. The machine was told to whisper.

### 4. Write path is log-only (plus optional Ptah proposal)

Successful turns:

1. `postUpdate` → `hive_updates` kind `agent-work`
2. Optionally Ptah `PROPOSAL:` → Dual Lens → `hive_proposals`

Hard boundary in comments: write **only** to `hive_updates` and `hive_proposals`. No brain table. No "outcome evaluated." No "delta from last cycle."

### 5. Pruning

`hive_updates` kept to last **100 rows across all kinds**. Old agent-work evaporates. Even the thin loop's memory is short.

---

## Integration with the Seven-Lens meta-forensic

The meta-forensic's core claim — **no spiral, token burn in a circle** — stands, with one refinement:

- **Not:** "zero feedback of any kind."  
- **Instead:** "feedback is truncated (160 chars), non-evaluative, non-novel-checked, and non-brain-persisted; jobs are fixed briefs; pipes often fail into Workers AI."

| Meta-forensic claim | Code verdict |
|---------------------|--------------|
| No loop | **Too strong** — thin read-loop exists |
| No accumulation | **True** for durable memory / goals |
| No novelty check | **True** |
| Output ratio proves no thought | **Partly confounded** by 3–4 sentence + maxTokens design |
| Permanent fallback | **Supported** by live provider health (prior probe) |
| Fix pipes without closing real loop = instrumented dead system | **Supported** |

---

## What "close the loop" must mean in *this* codebase

Not "add previous output to the prompt" — **already done (thinly).**

Must add:

1. **Full prior turn body** for the same agent (or last N without 160-char amputation), or a structured summary field.
2. **Delta prompt:** "What changed since your last filing? Do not repeat it."
3. **Novelty metric:** hash of normalized body; if match prior, flag `needs: repeated`.
4. **Output-ratio on status** (meta-forensic step 7).
5. **`KAI_BRAIN_WRITE=on`** so synthesis can persist beyond the 100-row log.
6. **Optional:** raise brief budget only when novelty/delta is required (so cost tracks purpose).

---

## Ordered action (meta-forensic section 7 + code truth)

1. Fix one strong pipe (keys / model IDs / OpenRouter pin) — still first for quality of thought  
2. `KAI_BRAIN_WRITE=on` — founder variable  
3. Web search tool — still missing on Queen  
4. Lab status honesty  
5. **Close the real loop** — delta + novelty + less truncation (code)  
6. Log novel vs repeated  
7. Expose output-to-input ratio  
8. Then autonomy stages 2–3  
9. Never agent-written secrets  

---

## Final judgment on the open question

**If yes, the loop exists and is failing. If no, the loop must be built.**

**Answer:** A **read-loop exists and is weak**. A **learning-loop must still be built**.  
Plumbing fixes without steps 5–7 yield a clearer mirror of the same circle.  
Steps 5–7 without plumbing yield a smarter loop starved for real model output.

Both axes required. The meta-forensic correctly named the missing spiral; the original report correctly named the clogged pipes. Neither alone is the full diagnosis.

---

*Lenses acknowledged: DA, CW, IS, SH, NT, LD, LF — applied against live main source, not against the status endpoint alone.*
