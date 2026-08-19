# Kai El — Phase C: brainstorm / deep-think mode (design only, no code)

**Date:** 2026-08-19
**Status:** DESIGN FOR FOUNDER SIGN-OFF — no production code was written, and none should be
written from this document until Phase B's risk list is approved.
**Source directive:** `Project_file/Founders Visonary Folder/HIVE_UPDATES/2026-08-10-directive-agent-roster-akosha-naming-kai-el-scope-050.md`
item 10 — "Brainstorm mode — both entry points: an explicit trigger AND automatic detection
when a task is underspecified, both routing to the same underlying deep-reasoning pass," with
the output written as "a real `hive_proposals`/`roadmap_items` row (not just a chat reply) so
it's actually actionable, not decoration."
**Level:** `verified` as a reading of the code. Nothing here is built, tested, or deployed.
**Boundary respected:** this lane does not own `worker/src/index.js`. Nothing here edits it.

---

## Plain English first

Right now when you ask Kai El something, he thinks for about one short paragraph and answers.
That is fine for "what's the status," but it is not enough when you hand him a half-formed
idea and want it turned into a real, scoped plan. You asked for a second, slower mode — a
deep-think pass — and you asked for it to start in two different ways: sometimes because you
explicitly ask for it, and sometimes because Kai El notices on his own that what he has been
handed is too vague to act on. You also said the result must not be just another chat message
that scrolls away; it has to become a real row in the hive's queue so it is something you can
actually approve or reject later.

The good news is that almost none of this needs new infrastructure. The engine that would run
the deep pass already exists — it is the same `generate()` function every other part of the
hive already uses, which now waterfalls across five providers and prefers whichever one is
actually answering. The place the output would land already exists too: the `hive_proposals`
table, which already accepts different kinds of proposal and already runs each one through the
Queen's review and the Elders' veto. Even the two on/off switches already exist, sitting off,
with their turn-on instructions already written down.

What is genuinely new is small: one route, one way of deciding "is this task underspecified,"
and one decision about how much a deep pass is allowed to cost. My strong recommendation on the
detection question is that it should be a plain, boring checklist — does the task have a
stated outcome, a scope, a first step — and not a judgment the model makes about itself. If the
model decides when to spend more of your tokens, the incentive is pointed the wrong way. A
checklist can be read, argued with, and changed; a model's self-assessment cannot.

The one number you should hold onto: a deep pass is roughly four to six times the cost of a
normal chat reply. Not fifty times. It is a bigger answer, not a different category of
spending — and the ladder already says to measure it for real at stage 2 before letting it fire
on its own at stage 4.

---

## What already exists — verified, so Phase C does not rebuild it

| Piece | Where it really is | State |
|---|---|---|
| The reasoning engine | `generate()`, `worker/src/index.js:1453` | Live. Five providers: claude → groq → mistral → openai → openrouter → workers-ai (`PROVIDERS`, `:1369`). |
| Role-aware routing | `providerOrder()`, `worker/src/index.js:1412` | Live. Accepts `prefer` as a provider id **or a role word**; `'Reasoning'` resolves to Claude (`:1423`). Real health outranks preference — a provider that failed in the last 30 min is tried last (`PROVIDER_RETRY_AFTER_MS`, `:1393`). |
| Kai El's context builder | `POST /v11/command_text`, `worker/src/index.js:2984` | Live. Builds `ctxLines` from agents, governance, pulse, colony reports, provider health + real usage totals, rate limit, recent proposals, genome chromosomes, recalled memory, and the real constitution hash (`:3007-3163`). |
| Recency-weighted memory recall | `kaiRecall()`, `worker/src/index.js:1766` | Live. Over-fetches 3x then re-ranks by age before truncating (`recencyWeight()`, `:1758`). |
| Proposal creation with governance | `hive_proposals` (`:583`) + `queenDecide()` (`:2061`) | Live. Every proposal passes the Queen's alignment score and the Elders' Council veto. |
| Roadmap rows | `roadmap_items` (`:618`), `upsertRoadmapItems()` (`:808`) | Live, but **write is founder-gated** (`:2397`). See Phase B item F8. |
| Kai El's own brain | `kai-el-brain` D1, `logDecision()` (`:1793`) | Live, gated by `KAI_BRAIN_WRITE`. High-risk rows refuse to log without a reason and handling plan (`:1796-1799`). |
| **Async job path** | `LLM_QUEUE` producer **and** consumer bound (`wrangler.jsonc:53-59`), `queue: processQueueBatch` exported (`worker/src/index.js:2290`), `async_jobs` table (`:593`), poll route `GET /v11/jobs` (`:2966`) | **Live and fully activated.** The stale comment at `worker/src/index.js:2083-2090` says the consumer is "DELIBERATELY NOT EXPORTED" — that was true in July and is no longer true. Worth correcting when the file's owning lane next touches it. |
| The two switches | `KAI_BRAINSTORM_EXPLICIT` (stage 2), `KAI_BRAINSTORM_AUTO` (stage 4) — `KAI_SWITCHES`, `worker/src/index.js:1682-1699`; documented in `autonomy_registry` (`worker/schema/kai-el-brain.sql`) | Both **off**. Turn-on steps already written. `KAI_BRAINSTORM_AUTO` already `requires` `KAI_BRAINSTORM_EXPLICIT`. |

**So Phase C's real new surface is: one route, one detector, one output writer, one cost
policy.** Everything else is wiring already-shipped parts together.

---

## 1. Route shape

### `POST /v11/kai/brainstorm`

A dedicated route rather than a flag on `/v11/command_text`. Three reasons, all concrete:

1. `/v11/command_text` is the chat surface and is rate-limited at 30 POST/min/IP
   (`worker/src/index.js:2990`). A deep pass at that rate would be a real cost hazard; it needs
   its own, much tighter limit.
2. `/v11/command_text` caps output at 400 tokens, or 1200 in architect mode
   (`worker/src/index.js:3253`). A deep pass needs its own budget, and burying a 4x cost
   difference behind an optional body field is exactly the kind of invisible-spend shape this
   repo's audits keep catching after the fact.
3. A separate route means a separate line in `GET /v11/debug/endpoints` (`:3680`) — the pass is
   visible in the route census rather than hidden inside another handler.

**Request:**

```
POST /v11/kai/brainstorm
{
  "task":     "<required, the thing to think about, ≤4000 chars>",
  "surface":  "roadmap" | "venture" | "project" | "chat",   // required — which tab asked
  "ref":      { "section": "backlog", "title": "..." },      // optional, links to a real row
  "reason":   "explicit" | "auto",                           // who initiated
  "async":    true | false                                   // default false
}
```

**Gating, in order — each one fails closed:**

| Check | Behaviour when it fails |
|---|---|
| `tokenOk()` (`worker/src/index.js:2796` pattern) | `401` — same visitor-token gate as `/venture/plan` and `/legal/research`. |
| Dedicated rate limit, **3/hour**, not 30/min | `429` with the real remaining count. |
| `reason: "explicit"` → requires `KAI_BRAINSTORM_EXPLICIT` on | `403` naming the switch and its exact turn-on steps, read from `autonomy_registry`. |
| `reason: "auto"` → requires `KAI_BRAINSTORM_AUTO` on | Same. The registry already encodes that `AUTO` requires `EXPLICIT` first (`requires` column), so the ladder is enforced by data, not by a second hand-written rule. |

**Responses:**

- `200` — `{ ok, outline, proposal_id, provider, tokens, order }`
- `202` — `{ ok, job_id, status:"queued", poll:"/v11/jobs?id=..." }` when `async:true` and
  `LLM_QUEUE` is bound (it is).
- `403` — switch off, with the real turn-on steps quoted.
- `503` — no provider reachable. **Never a fabricated outline.** Same discipline as
  `/venture/plan`'s "nothing was fabricated in its place" (`worker/src/index.js:2825`).

**Recommendation on async: make `async:true` the default for this route specifically**, unlike
`/venture/plan` where it is opt-in. A deep pass is the one call in the hive most likely to
exceed a comfortable request lifetime, the queue path is fully activated and proven, and a
brainstorm result is not something anyone stares at a spinner for. This is a design choice, not
a requirement — flagged as such.

---

## 2. The two entry points, both landing in the same pass

You chose both. Here is how both reach the identical code path.

### Entry point 1 — explicit

A "Think this through" control on the Roadmap / Venture Planner / Projects tab, and the typed
form `brainstorm: <task>` in chat. Both POST the route with `reason:"explicit"`.
Requires stage 2 (`KAI_BRAINSTORM_EXPLICIT`). This is the entry point that should ship first,
alone, and be watched — which is exactly what the ladder's own stage-4 turn-on note already
says: *"Recommended only after watching stage 2 long enough to know the real per-invocation
cost."*

### Entry point 2 — automatic, on an underspecified task

When Kai El picks up work from a tab under Phase B and the task fails the underspecification
check below, he routes it here instead of acting on it. Requires stage 4
(`KAI_BRAINSTORM_AUTO`). This is the first switch on the whole ladder where he spends real
tokens without you initiating, and the registry says so in its own words.

**Both call the same internal function.** One pass, two doors — as you specified. The only
difference that survives into the data is the `reason` field, recorded on the output row so you
can always tell which brainstorms you asked for and which he started himself.

---

## 3. What "underspecified" is detected by

**This must be a deterministic checklist, not a model judgment.** The reasoning is the same one
that already governs `logDecision()`'s high-risk enforcement: the code comment at
`worker/src/index.js:1801-1804` says a prompt-only rule is "one bad generation away" from
failing. Letting the model decide when to spend more of your tokens has the incentive pointed
the wrong way, and it produces a rule nobody can read, argue with, or change.

**Proposed rule: a task is UNDERSPECIFIED if it fails 2 or more of these 5 checks.**

| # | Check | Passes when | How it is computed |
|---|---|---|---|
| U1 | **Has a body at all** | The row's `body` is non-empty and ≥ 120 chars | `roadmap_items.body` / proposal `body` length |
| U2 | **Names an outcome** | Text contains a "done when" / "so that" / "result is" style clause | Regex over a small, committed phrase list |
| U3 | **Names a first step** | Text contains at least one imperative verb from a committed list (`add`, `write`, `wire`, `probe`, `migrate`, `remove`, `measure`, …) | Regex over a committed verb list |
| U4 | **Names a surface** | Text mentions at least one real path, route, table, or file that exists in the repo | Substring match against a small committed list of real surfaces — never a guess |
| U5 | **Is not a bare title** | The title is not the entire content (body ≠ title, body ≠ empty) | Direct comparison |

**Why a threshold of 2, not 1:** at 1 the detector fires on almost every genuinely small task
("bump the retry window to 45 min" legitimately has no stated outcome clause and does not need
a brainstorm). At 3 it almost never fires and stage 4 becomes decoration. 2 is the honest
middle, and it is a number you can change in one line after seeing real data.

**Non-negotiable properties of this detector:**

- It runs **before** any LLM call, so a task that is already well-specified costs zero extra
  tokens to check.
- Its result is recorded on the output row (`which checks failed`), so a mis-fire is visible and
  diagnosable rather than mysterious.
- Kai El cannot change it. It lives in code, in the same place the risk classifier lives — not
  in `kai-el-brain`, for the same reason `autonomy_registry` deliberately has no `enabled`
  column (`worker/schema/kai-el-brain.sql`).

**Open question genuinely for you:** should an auto-detected brainstorm fire silently, or should
it post a one-line note to `hive_updates` ("started a deep pass on X because it was
underspecified") so you see it happening in real time? **Recommended: post the note.** Stage 4 is
the first unattended spend on the ladder; making it silent optimises for tidiness over the thing
you have repeatedly said matters most — knowing what is really happening.

---

## 4. What the pass actually does

```
1. Detector runs (no LLM).                                    cost: 0
2. Build context: the same ctxLines block command_text builds  cost: ~3,000 tok in
   (worker/src/index.js:3007-3163) — reused verbatim, not
   reimplemented, so the two surfaces can never drift.
3. Add kaiRecall(task, topK=5) instead of chat's topK=3        cost: ~300 tok in
   (worker/src/index.js:3149 uses 3) — a deep pass earns
   more memory than a chat turn.
4. Add the target row's real content when `ref` is given.      cost: ~200 tok in
5. generate({ prefer: 'Reasoning', maxTokens: 1500 })          cost: ≤1,500 tok out
   — `prefer` is a role word, resolved by providerOrder()
   at worker/src/index.js:1423, so this asks for the KIND
   of work rather than pinning a vendor. Health still
   outranks it: if Claude is down, the pass still happens
   on whoever is answering, and the response reports which.
6. Parse the outline into a fixed shape (below).
7. Write the output row(s). Write the decision_log row.
```

**System prompt shape** (not final wording — that belongs to the implementing lane):
a deep-scoping instruction that must inherit, verbatim, the existing capability-ceiling
paragraph from `worker/src/index.js:3113-3122` ("your providers are TEXT-GENERATION APIs only…
you cannot RESEARCH anything"). A longer reasoning pass is *more* likely to drift into
inventing capabilities, not less, so the ceiling text gets stronger here, never weaker.

**Required output shape**, so the result is parseable rather than prose:

```json
{
  "title":        "string, ≤200 chars",
  "outcome":      "string — what 'done' looks like",
  "steps":        ["string", "..."],          // 3-8 concrete steps
  "unknowns":     ["string", "..."],          // what is genuinely not known yet
  "risk_tier":    "low" | "normal" | "high",  // per the Phase B table, NOT model-judged
  "risk_reason":  "string, required when high",
  "risk_handling":"string, required when high"
}
```

Note `risk_tier` here is **filled by the Phase B classifier lookup, not by the model.** The
model proposes steps; the code assigns the tier. This is why Phase B has to be approved before
Phase C is built — Phase C's output row has a hole in it shaped exactly like Phase B's table.

**Failure handling:** if the model returns unparseable output, return `502` with the raw text,
exactly as `/venture/plan` already does (`worker/src/index.js:2830-2836`) — never a fabricated
fallback outline.

---

## 5. What the output row looks like

Your directive says the output must be a real `hive_proposals`/`roadmap_items` row, not a chat
reply. Here is the concrete shape.

### Primary output — always: one `hive_proposals` row

| Column | Value | Note |
|---|---|---|
| `kind` | `'brainstorm'` | A new kind on the already-generic `kind` field. **Zero schema change** — `kind` is a free TEXT column (`worker/src/index.js:583`) and this repo already added `revenue-proposal`/`agent-proposal`/`architect-proposal` the same way. |
| `title` | the outline's `title` | |
| `body` | the full outline, rendered | Includes `outcome`, `steps`, `unknowns`, and the failed detector checks. |
| `status` | whatever `queenDecide()` returns | **Goes through the identical governance chain as every other proposal** — Queen alignment score, Elders' Council veto (`worker/src/index.js:2061`). No bypass. |
| `alignment_score`, `decided_by`, `decided_at`, `elder_note` | from `queenDecide()` | |
| `diff`, `diff_files`, `diff_check` | `NULL` | A brainstorm outlines; it does not draft code. If it should also draft a diff, that is the *architect* path (`:3290`) and should stay separate. |

### Secondary output — conditional: a `roadmap_items` row

**Only if you approve Phase B item F8-b** (Kai El may write `section='backlog'`, insert/update
only, never delete). Then a brainstorm on the Roadmap tab also upserts a backlog row carrying
the outline as its `body`, which is the literal meaning of "fill the task."

**If F8-a is chosen instead**, the proposal row is the entire output and you apply the roadmap
row yourself. Phase C works either way; it just does less. This is the one place Phase C is
directly blocked on a Phase B answer.

### Always: one `decision_log` row

Via the existing `logDecision()` (`worker/src/index.js:1793`), with:
`surface` = the tab, `request` = the task, `reasoning` = the outline's `unknowns`,
`action` = the created proposal id, `autonomy_mode` = `'explicit-invoke'` or
`'draft-approve'` depending on entry point, `provider` / `tokens_in` / `tokens_out` = the
**real** values from `generate()`'s return, not estimates.

This is the whole point of the decision log existing: after a month of stage-2 brainstorms you
can query `decision_log` and answer "what did this actually cost, and were the outlines any
good" with real numbers rather than an impression.

---

## 6. Cost per invocation — honest numbers with their basis shown

**These are estimates, clearly labelled.** The real number is measurable and the ladder already
says to measure it: stage 4's own `turn_on_steps` say to enable it only "after watching stage 2
long enough to know the real per-invocation cost."

Basis: `command_text`'s static system prompt measured at **3,119 characters**
(`worker/src/index.js:3044-3113`); the hard-coded `ctxLines` literal text measured at roughly
**10,000-15,000 characters** upper bound (`:3007-3163`). At ~4 chars/token:

| | Normal chat reply (today, live) | Deep-think pass (proposed) |
|---|---|---|
| System prompt | ~780 tok | ~900 tok (adds the scoping instruction) |
| Hive context | ~2,500-3,000 tok | ~2,500-3,000 tok (identical block, reused) |
| Memory recall | ~200 tok (topK=3) | ~350 tok (topK=5) |
| Target row + history | ~150 tok | ~350 tok |
| **Input total** | **~3,600-4,100 tok** | **~4,100-4,600 tok** |
| **Output cap** | **400 tok** (`worker/src/index.js:3253`) | **1,500 tok** (proposed) |
| **Total per call** | **~4,000-4,500 tok** | **~5,600-6,100 tok** |

**The honest headline: a deep pass is about 1.4x the total tokens of a chat turn, but roughly
4x the output tokens** — and output is the expensive half on every provider in the waterfall.
So the practical cost multiplier is closer to **4-6x a chat reply, not 1.4x.** Do not let the
input-heavy total mislead the decision.

**What this means at real volumes**, at the proposed 3/hour rate limit:

| Scenario | Deep passes/day | Extra tokens/day vs. same count of chat replies |
|---|---|---|
| Stage 2 only, you click it a few times a day | 3-5 | ~6,000-9,000 |
| Stage 4 on, detector firing at threshold 2 | 10-20 (rate-limited to ≤72) | ~20,000-40,000 |
| Stage 4 with a broken detector (threshold 1) | hits the 72/day cap | ~145,000 |

**Dollar cost is deliberately not stated here.** It depends entirely on which provider actually
answers, and `providerOrder()` (`worker/src/index.js:1412`) makes that genuinely variable by
design — health outranks preference, so a pass that asks for Claude may land on OpenRouter's
free open-source model instead. Inventing a per-call dollar figure would be exactly the kind of
confident-but-unfounded number this repo's own audits exist to catch. The real figure is
already being accumulated: `provider_health.total_calls / total_tokens_in / total_tokens_out`
(`worker/src/index.js:634`), surfaced in `GET /v11/llm/status` and in Kai El's own context
(`:3084-3095`).

**Three cost controls, all recommended:**

1. **Rate limit 3/hour** on this route specifically — a separate, tighter limit than
   `command_text`'s 30/min.
2. **A hard daily cap** (recommended: 20) that returns `429` and posts a `hive_updates` note
   rather than silently stopping. Silent stopping is how a broken detector goes unnoticed.
3. **`maxTokens: 1500`, not higher.** Above ~1500 the marginal quality of an outline drops fast
   while cost keeps climbing linearly. If the outline is genuinely too big for 1500 tokens, the
   task should be split — which is itself a useful signal.

---

## 7. Build order, and what blocks what

| Step | Depends on | Ships behind |
|---|---|---|
| 1. The underspecification detector (pure function + tests, zero LLM) | nothing | no switch — it is inert until something calls it |
| 2. `POST /v11/kai/brainstorm`, explicit entry only, output = `hive_proposals` row | step 1; **Phase B's risk table** (for `risk_tier`) | `KAI_BRAINSTORM_EXPLICIT` (stage 2) |
| 3. Frontend "Think this through" control on the three tabs | step 2 | same |
| 4. Auto entry — the detector wired into Phase B's tab pickup | steps 1-3, plus a real cost reading from `decision_log` | `KAI_BRAINSTORM_AUTO` (stage 4) |
| 5. `roadmap_items` write | **Phase B item F8** resolving to F8-b | whatever switch F8-b defines |

**Phase C is blocked on exactly one thing from Phase B: the risk-tier table**, because the
output row has a `risk_tier` field the model must not fill in. Everything else in Phase C can
be built in parallel with Phase B's frontend work.

---

## 8. Decisions this design needs from you

| # | Question | Recommendation |
|---|---|---|
| 1 | Detector: deterministic checklist, or let the model judge? | **Checklist.** Strongly. |
| 2 | Underspecification threshold: fail 1, 2, or 3 of 5 checks? | **2** |
| 3 | Default `async:true` on this route? | **Yes** |
| 4 | Rate limit: 3/hour + 20/day hard cap? | **Yes** |
| 5 | `maxTokens` for the deep pass: 1500? | **Yes** |
| 6 | Does an auto-fired brainstorm post a visible `hive_updates` note? | **Yes** |
| 7 | Does a brainstorm proposal go through `queenDecide()` like every other kind? | **Yes** — no bypass |
| 8 | Does it also write a `roadmap_items` row? | **Only if Phase B F8-b is approved** |

## What this design deliberately does NOT do

- No new agent, no new name, no mythology. `FABLE_DNA.md` Chromosome V holds; naming is
  founder-only.
- No new database and no schema change — `kind` is already a free TEXT column.
- No self-modification: the detector, the risk classifier, and the switches all live where Kai
  El cannot write them, matching the reason `autonomy_registry` has no `enabled` column.
- No diff drafting. That is the architect path (`worker/src/index.js:3290`) and stays separate.
- No production code. Another lane owns `worker/src/index.js`; this is a design, and it says so.
