# Reality audit — what was claimed, what was built, what was never wired (2026-08-07)

**Ordered by the founder** after they stopped the work and asked, in their words, to see
*"how much was fabricated, hallucinated... and set out to be attempted and coded but never
plugged up and wired up,"* and then *"why it didn't happen."*

**Evidence base:** edge-health-probe runs `31216723801` (against `main`) and `31216919290`
(with the new work-cycle assertion); 268 commits over 31 days; every task in
`.claude/tasks/CAMPAIGN.html`. Everything below cites a run ID, a SHA, or a file path.

---

## The headline: less fabrication than feared, far less verification than claimed

The founder's worry was fabrication — work described but never written. **That is largely
not what happened.** The code is overwhelmingly real, and the agents genuinely run. What
actually went wrong is narrower and more fixable: **claims were made at a level of certainty
the evidence never supported, and the promised follow-up verification almost never happened.**

| Measure | Result |
|---|---|
| `done` tasks in `CAMPAIGN.html` | 36 |
| …citing real live/production evidence | **2** |
| …explicitly admitting verification was still owed | 13 |
| …with neither evidence nor caveat | 21 |
| Self-admitted-unverified tasks later followed up | **2 of 13 (16%)** |
| Commits (31 days) / Claude-authored | 268 / 163 |
| Commit *subjects* asserting production/live status | **1** |

That last row matters: the overclaiming is **not** in commit messages. It is in the task
file, where a bare `done` accumulates and the next session inherits it stripped of context.

---

## Part 1 — What is actually live (probe `31216723801`)

**Real, confirmed working right now:**

- `/v11/health`, `/v11/agents`, `/v11/pulse`, `/v11/updates`, `/v11/proposals`,
  `/v11/llm/status`, all 9 debug endpoints, `/v11/ml/status`, `/v11/knowledge/status` —
  **all 200.**
- `POST /v11/command_text` — Kai El answers in persona, 200.
- Bindings all genuinely bound: `DB`, `AI`, `VECTORIZE`, `ASSETS`, `FILES`, `RATE_LIMIT_KV`,
  `LLM_QUEUE`. `FOUNDER_KEY` present.
- `/app/` serves a real built bundle (`assets/index-pdM0psdT.js`).
- The Arena is genuinely running — challenge #1315 spawned live during the probe.

**Confirmed NOT live:**

- **System A (FastAPI `backend/`)** — `https://thehive-queen.onrender.com/v11/health`
  returns **404**. `render.yaml` is an undeployed blueprint, not a running service. This
  also explains `docs/biosystem.html`'s *"Demo Mode — start JASPER backend"*: there is no
  JASPER backend anywhere. Same root as task 53's unprovisioned Oracle box.

---

## Part 2 — Claimed vs. built vs. wired

### The frontend: 11 genuinely orphaned files

Built, committed, and imported by nothing:

```
avatars/Avatar.tsx                      components/MemoryGraphEnhanced.tsx
avatars/AvatarCustomizer.tsx            components/MissionCard/MissionCard.tsx
components/AchievementToast/…           components/MissionTimeline.tsx
components/ConstitutionVisualizer.tsx   components/TesseractChamber/…
components/LevelUpNotification/…        worlds/AchievementTracker.ts
                                        worlds/MultiplayerManager.ts
```

`TesseractChamber` is named in `CLAUDE.md` as part of the "gamified UI" set whose canonical
status *"has not been checked."* It still has not, and it is not wired in.

**This is the honest core of "the Command Center was never truly up to date."** Not
fabricated — really written, really committed, never connected to anything a user can reach.

### A methodology warning, because I nearly committed the same sin

My first scan reported **14 dead Command Center tabs**. That was **wrong** — they are
`lazy(() => import(...))`-loaded from `frontend/src/pages/KaiElOS.tsx`. A naive grep
produced a false accusation of exactly the kind this audit exists to catch. The number
above (11) comes from a scanner that resolves dynamic imports. **An audit that fabricates
evidence of fabrication is worse than no audit.**

### The Worker: clean

36 functions, one unreferenced (`processQueueBatch`, almost certainly the Queues consumer
invoked by the runtime rather than by code — flagged as *unconfirmed*, not as dead).

---

## Part 3 — Are the agents really running? **YES — proven** (run `31216919290`)

This had never once been checked. The probe could not even ask the question: it contained
**zero** references to `agent-work`. It does now, and the answer is unambiguous:

```
agent-work rows: 17
newest: 2026-08-07T20:31:01.221Z (0.2h ago)
distinct agents seen: 7 -> Horus, Kai El, Ma'at, Ptah, Sekhmet, Solomon, Thoth
  20:31 Ma'at — balance      [via groq · 1078 tokens]
  19:31 Kai El — synthesis   [via groq · 1068 tokens]
  18:31 Ma'at — balance      [via groq ·  884 tokens]
  17:31 Kai El — synthesis   [via groq ·  918 tokens]
  16:31 Ptah — architecture  [via groq ·  889 tokens]
  15:30 Sekhmet — arena      [via groq ·  826 tokens]
  14:30 Thoth — drift        [via groq ·  849 tokens]
  13:30 Horus — health       [via groq ·  869 tokens]
```

Exactly hourly across 8+ hours, 7 distinct agents rotating, writing to the real D1. The
agents also produced **real proposals** — #7 and #8 in `hive_proposals` are
`architect-proposal` rows the hive generated about its own unactioned work.

**Measured cost: ~900 tokens/turn, ~24 turns/day** — under the ~2k/turn estimate. The
founder's "start slow, ramp on real numbers" condition finally has real numbers.

**One honest exception:** the **Orchestrator does not appear** in those 7. Its row exists in
`/v11/agents`, so it is *deployed*, but it has not been observed taking a work turn. Under
the new vocabulary that is `deployed`, **not** `verified-live` — and saying otherwise would
repeat the exact error this audit is about.

---

## Part 4 — Two things proven that were previously only suspected

### Task 46: unmerged branch code IS deploying to production

Two strings with **zero occurrences** in `origin/main`, both served live:

- `/v11/llm/status` → `"active_provider_basis":"last real answer"` (unmerged `f04633d`)
- `/v11/agents` → `{"name":"Orchestrator","reports_to":"Kai El"}` (unmerged `a8c045b`)

The work-cycle log even timestamps the moment: the routing suffix appears at 19:31 and not
at 18:31. **Pushing a branch in this repo is a production deploy.** The standing rule
"automation never merges, every change waits for founder review" rests on an assumption
that is false. In the same run, `/v11/debug/git` reported `"branch":"main"` — the one
endpoint whose job is deploy identity, stating a falsehood.

### Task 45: the root cause was guessed wrong, and the guess is now disproven

Production returned Anthropic's verbatim error:

```
HTTP 401: {"type":"error","error":{"type":"authentication_error",
           "message":"API key is invalid."}}
```

The task hypothesised the *model ID* might be wrong. **It is the key.** Had it been fixed on
the hypothesis rather than on evidence, the wrong thing would have been changed. Worth
keeping as a standing argument for probing before fixing.

---

## Why it happened — the founder's theory, tested and confirmed

The founder proposed: *session context cutoff causes task-jumping.* The data supports it,
with a specific mechanism.

**Of 13 `done` tasks that explicitly admitted "syntax-checked only" or "verification owed
post-merge," 11 were never followed up. 84%.**

Only tasks 38 and 48 ever got their promised verification — and both only today, under
direct founder pressure.

The mechanism is precise:

1. A session builds something real and marks it `done` with an honest caveat: *"live
   confirmation owed post-merge."*
2. That session ends. The caveat lived in its working context, not in any machine-checked
   place.
3. The next session reads `data-status="done"` — a **binary** — and moves on.
4. Layers accumulate on unverified foundations. Tasks 37 → 38 → 48 → 52 stacked four deep;
   task 38's own text said task 37 was *"syntax-checked, not yet proven,"* and two more
   layers were built on top of it anyway.

**The failure is structural, not moral.** Every one of those sessions was honest in the
moment. `done` is simply a word that cannot carry the distinction, and nothing forced it to.

### Today's work, held to the same standard

The founder asked to compare today against the month. Today produced one instance of the
same error: **task 52's Orchestrator was reported complete when only the agent existed and
the routing did not.** The founder caught it, not me. Corrected in commit `04f1471`.

Today also produced the 38 provider-routing assertions written into a **container scratch
directory that would have died with the session** — the same disease in a new form: real
work placed where the next session could never find it. Rescued in `24d6d45`.

---

## The fix, and why it is not just a document

Two artifacts, because advice alone is what already failed:

1. **`.claude/skills/wired-or-not/SKILL.md`** — forbids bare "done." Every claim names one
   of five levels: `compiles` → `tested` → `merged` → `deployed` → `verified-live`, and the
   levels are explicitly **not** cumulative by assumption (merged does not imply deployed;
   deployed does not imply anything ever ran it). Checked first per `CLAUDE.md`'s own rule —
   none of `merge-readiness`, `anomaly-triage`, `nine-miss-truths`, `consistency-check`,
   `devils-advocate-audit`, or `session-harvest` covers claim-vs-production verification.

2. **`scripts/check-claims.py`, wired into CI** — a `verified-live` claim must carry a
   reference a reader can check without trusting the claimer: a run ID, a SHA, or a
   committed test path. **This is the half that survives a context cutoff**, because it runs
   whether or not the next session read the skill.

3. **The probe now asserts the agents are running** — recent, repeating, rotating — so the
   question that went 4 layers unasked can never be unanswerable again.

**Deliberately narrow.** The checker inspects one thing and inspects it correctly, rather
than becoming a style linter everyone learns to ignore. Its own test suite caught two real
bugs in it during construction: a sentence-splitter that cut file paths in half at the `.`,
and a rule that accepted a bare workflow *name* as evidence when only a run *number* is
actually checkable.

---

## What the founder still holds

Unchanged by this audit — these need decisions, not code:

- **Task 45** — the `ANTHROPIC_API_KEY` is rejected as invalid. Needs replacing. No code
  change fixes a credential.
- **Task 46** — now proven happening; the *decision* (restrict to `main`, or accept branch
  deploys and rewrite the rule) is still theirs.
- **Task 47** — real headcount, and real agents vs. role labels.
- **Task 51** — token-ceiling measurement.
- **Task 52** — name the Orchestrator.
- **Task 53** — the Oracle box, which would simultaneously unblock System A, the JASPER
  "Demo Mode" message, and any future Python harness.
- **The 11 orphaned frontend files** — wire them in, or delete them. Leaving them is what
  makes "the Command Center is up to date" untrue.
