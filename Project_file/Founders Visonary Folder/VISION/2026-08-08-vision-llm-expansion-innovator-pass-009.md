# The innovator pass — real ideas mined from the LLM documents, not just fact-checks (2026-08-08)

**Sources:**
`SOURCES/research-notes/2026-08-08-llm-from-scratch-course-integration-report.md` (doc 1) and
`SOURCES/research-notes/2026-08-08-llm-expansion-resources-list.md` (doc 2).

**Companion file:** `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md` — that pass
verified claims (what's true/false in doc 1). **This pass does the other half**, per the
founder's direct correction: *"the last large query I provided you wasn't to check to see if
any of it was in the hive... utilize the devil's advocate lens and compare and contrast what
all can be used in the hive that may not have ever been spoken about or thought of, like an
innovator would."*

**The correction, stated plainly:** file 008 spent nearly all its effort asking "is this
true," and almost none asking "what's genuinely new here that we could use." Both are real
uses of devil's advocate — one interrogates claims, the other interrogates *gaps in what the
hive has already thought of*. This file is the second half that was missing.

**Method:** for every idea below — the ML/research concept it comes from, the exact hive
mechanism it maps onto (with a real file/function cited, not a vague gesture), the concrete
change, and a devil's-advocate catch. Nothing here is built. This is mining and logging only,
per the founder's standing choice on doc 1 to atomize before building anything.

---

## From doc 1 — the course integration report

**1. KV caching → stop rebuilding the whole snapshot every turn.**
KV caching means: don't recompute what you already computed, reuse it. `hiveSnapshot()`
(`worker/src/index.js:812`) rebuilds the entire context from scratch on every single agent
turn — a real contributor to task 51's cache-creation problem. Split it into a slow-changing
part (roster, provider roles) built once an hour and reused, and a fast-changing part (recent
updates, health) rebuilt every turn. *Catch:* a stale cached part could be reasoned on without
anyone knowing it's stale — needs a visible timestamp.

**2. Speculative decoding → race providers instead of waiting in line.**
A fast draft answer, verified by a slower accurate one, beats waiting for the slow one
serially. `providerOrder()`'s real loop (`worker/src/index.js:1128`) tries providers strictly
one at a time, each with its own timeout. Fire the preferred provider and a fast backup at the
same time; take whichever answers first and passes; drop the other. *Catch:* pays for two
calls on some turns — worth it only where latency matters more than the extra cost.

**3. Mixture of Experts → weight agent turns by real relevance, not blind rotation.**
MoE wakes only the experts relevant to the input, not all of them. The round-robin
(`AGENT_WORK`, verified fair over 32 ticks) ignores what's actually happening in the hive.
If `provider_health` just recorded a new failure, bump Horus next — health is his job. If
proposals are piling up, bump Ma'at. *Catch:* needs a fairness floor so no agent is starved
by never being "relevant" by the heuristic's own measure.

**4. "Loss isn't enough" → grade findings before they reach the founder's screen.**
The single most correct point in doc 1's own devil's-advocate section, applied to the hive
itself: every work-cycle turn posts to `hive_updates` unfiltered, including the generic
"everything looks fine" ones. A lightweight pass that checks for a specific claim vs. filler
before it's shown as a founder-facing update. *Catch:* must flag "held back," never silently
delete — a real finding hidden by an overzealous filter is worse than a boring one shown.

**5. Quantization → send a compressed snapshot most of the time, full detail only when needed.**
Trade precision for cost, deliberately. Build a short, number-heavy digest refreshed hourly;
fall back to the full verbose snapshot only when an agent's job actually needs the nuance.
Directly attacks task 51's real number. *Catch:* over-compress and an agent loses the detail
it needs to make a real judgment instead of a shallow one.

**6. Instruction tuning → teach agents by real example, not description alone.**
Static system prompts describe the bar; they never show it. Pull real "this was a genuinely
useful finding" examples from `hive_updates` history into each agent's prompt. *Catch:* if a
bad example gets mistakenly curated as good, the hive is now training itself to repeat the
mistake on purpose — the curation step needs its own check.

**7. RAG grounding → check for duplicates before a new proposal gets filed.**
Vectorize memory already exists (`/v11/memory/search`). Before Ptah drafts a `PROPOSAL:`,
search for anything similar already tried, rejected, or done — directly prevents the "standing
wave" `resonance-interference.md` already names (tasks 37→38→48→52 stacking without
verification). *Catch:* "similar" isn't "identical" — mustn't block a genuinely new idea for
sharing vocabulary with an old one.

**8. A frozen benchmark → detect agent quality drift over time, not just whether it ran.**
Run the same fixed fake snapshot through each agent on a schedule; diff this week's answer
against last week's. Nothing today checks *quality* drift, only whether a turn executed at
all. *Catch:* real token spend for a diagnostic — keep it cheap and infrequent.

---

## From doc 2 — the expansion resources list

**Verification note, and a real contrast worth recording.** Two of the more specific,
checkable claims — the GitHub repos `ryankillian/karpathy-lectures-notebooks` and
`vukrosic/zero-to-ai-researcher` — were fetched directly and are **real**, matching their
description. **Unlike doc 1, this document did not invent internal hive concepts.** Its
citations are of independently famous, real public resources (Karpathy's lectures, Stanford
CS224N, the Attention/BERT/GPT-2/GPT-3/LLaMA/DeepSeek-V3/MoE/Bahdanau papers). Recorded as a
real difference in kind between the two documents, not assumed.

**9. BERT's bidirectionality → audit drift by reading both directions, not just backward.**
GPT reads only what came before; BERT deliberately reads both directions to build fuller
context. Thoth's drift check (`AGENT_WORK`, focus `'drift'`) only ever looks recent-backward.
An occasional deeper pass that compares the *earliest* mention of a topic against the latest,
not just latest-against-current, catches contradictions that built up gradually rather than in
one obvious jump. *Catch:* doubles the context for that one check — scheduled occasionally,
not every turn.

**10. GPT-2's zero-shot surprise → test whether the shared context is actually shared.**
GPT-2's finding was that scale + a rich shared representation let it do tasks it was never
specifically trained for. Every hive agent has one locked lens (Ma'at=balance, Horus=health).
An occasional real test: ask an agent a question *outside* its specialty using the same shared
`hiveSnapshot()` everyone gets, and see if it can reason about it sensibly. If it can't, that's
a real signal the shared context isn't actually rich enough — a genuine audit of whether the
"shared memory" design is working or whether agents are just parroting their role label.
*Catch:* pure token cost for a diagnostic, and a bad answer here is expected sometimes, not a
failure — this measures the *system*, not that one agent.

**11. GPT-3's few-shot learning → let the founder teach an agent on the spot, no redeploy.**
Few-shot means: show examples in the prompt itself, no retraining. Today, changing an agent's
behavior means editing `worker/src/index.js` and deploying. A founder-input-intake extension:
a stored, temporary "for now, treat X like this: `<example>`" instruction appended to one
agent's prompt from D1, no code change, auto-expiring. *Catch:* a real new capability surface —
needs the same founder-gating as everything else, and it must expire on its own so a temporary
tweak can't quietly become permanent undocumented behavior.

**12. DeepSeek's auxiliary-loss-free load balancing → sharpen idea 3 with a real measure.**
DeepSeek routes to experts by genuine signal instead of a separate "fairness tax" that costs
quality. This is idea 3 (MoE), made concrete: once idea 4's grading pass exists, track each
agent's real hit rate — how often their finding was actually specific and non-generic — and
skew future turns toward agents who are genuinely finding things, with the same fairness floor
idea 3 already named. Not a new idea on its own; the mechanism that would make idea 3 real
instead of a heuristic guess.

**13. LLaMA's "competitive on public data alone" → the hive's own history is its free data.**
LLaMA's real lesson: you don't need proprietary data to build something good, if you use what
you already have well. The hive's own already-public git history, `CAMPAIGN.html`, and VISION
docs are exactly this kind of free, public, already-owned material. Concretely: log founder
corrections — moments like this one, where a session missed the actual ask — as their own
structured category, distinct from ordinary directives, specifically so a future session can
be shown "here is a correction pattern to watch for." A sharper, evidenced version of idea 6.
*Catch:* only useful if corrections are tagged honestly as corrections, not folded quietly into
ordinary directive logs where the pattern disappears.

**14. Bahdanau's alignment → require agents to cite which line of the snapshot they used.**
The original attention paper's whole point was making the model's reasoning traceable —
showing exactly which input it was "aligning" to for each output, instead of a black box.
Right now a finding from Ma'at can't be checked against what she actually saw. Require each
finding to name the specific snapshot line or ID it's grounded in, like a citation. This is a
direct extension of task 45's whole visibility fix and `wired-or-not`'s evidence-over-assertion
principle into the agents' own reasoning, not just their claims of completion. *Catch:* adds a
small amount of prompt overhead per turn; worth it specifically because it makes a bad finding
checkable instead of just trusted.

**15. Multi-head attention → run several relevant lenses on the same moment, not spread over hours.**
Multiple heads look at the same input for different relationship types, at the same time —
which is the exact design idea already behind `dual-lens` (devil's advocate + wonder, together,
not sequentially over separate sessions). Extend it past design decisions: for a moment that
actually matters — right after a real production incident, right before a founder decision —
spin up two or three relevant agents on the *same current tick's* snapshot together, instead of
waiting for the round-robin to reach each of them naturally over several hours. *Catch:*
several paid calls in one tick instead of one — reserve for flagged "this moment matters"
triggers, never routine ticks, or it quietly defeats task 51's own cost discipline.

---

## What this file is, and isn't

Fifteen ideas, each with a real hive mechanism it plugs into and a real risk named alongside
it. **Nothing has been built.** No `CAMPAIGN.html` tasks were opened — these are logged as
mined ideas, not queued work, until the founder picks which (if any) are worth building.

Worth naming as its own pattern: several of these ideas sharpen or connect to each other
(12 sharpens 3; 13 sharpens 6; 14 extends task 45's own visibility principle into agent
reasoning itself; 15 is `dual-lens`'s own design principle, generalized). That kind of
cross-idea reinforcement is itself the `resonance-interference.md` doctrine in action — these
ideas amplify each other and would likely be worth building in clusters, not picked one at a
time in isolation, if the founder chooses to build any of them at all.
