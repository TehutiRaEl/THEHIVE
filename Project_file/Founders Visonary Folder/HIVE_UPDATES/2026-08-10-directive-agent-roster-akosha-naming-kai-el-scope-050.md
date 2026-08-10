# Founder directive — agent roster ceiling, Akosha's naming, D1 headroom, Kai El scope

**Date:** 2026-08-10
**Captured by:** session continuing `claude/provider-failure-queens-orchestrator-atvpaz`
**Why this file exists:** `founder-directive-capture`'s standing rule — these are real,
substantive decisions shaping the hive's direction that would otherwise die with this
session's context. Preserved close to verbatim where the founder's own wording matters;
not a summary of the surrounding conversation, which ranged far outside THEHIVE scope and
is not repeated here.

## 1. Branch deploys (task 46) — confirmed, not just suspected

Asked directly what the Cloudflare Workers Builds branch-trigger setting shows. Founder's
answer, checking the real dashboard: **"Main and other branches."** Feature branches do
reach production, not just `main`. This confirms task 46's standing concern rather than
resolving it — the never-self-merge review gate is weaker in practice than the review
process assumes, since pushing a branch is effectively deploying it.

## 2. Agent roster ceiling (task 47) — real number given, not 189 or 222

Asked how many agents the hive should really have. Founder's answer, verbatim intent:
**"I need a total of 13 right now in total until next expansion."** Asked whether agents
should be real (LLM-backed) or acceptable as labels: **"All of them, eventually."** Asked
about sequencing against the 6-Elder pilot and task 41 (pay-to-exist): **"Wait for both to
finish first."**

The founder separately clarified the larger intent behind that number, unprompted: the real
goal is **"over 100's of agents per colony"** eventually, but reached by **scaling up
deliberately rather than building that immediately** — each new agent automated,
individually reviewed and fine-tuned during its own build process, and tested before it
ever deploys. 13 is the current target, not the ceiling; it is the next checkpoint on a
path that is meant to grow far larger, on purpose, slowly.

Task 47 stays logged as **unblocked but not started** — all three of its original
acceptance questions now have real answers, but the founder's own next instruction (below)
is to finish Kai El's own capability build first, not to start seating new agents today.

## 3. Token ceiling (task 51) — reconfirmed, already shipped

Asked to re-pick among the three options from task 51's original founder-blocked write-up.
Chosen again: **"Count only real work tokens"** — i.e., option (a), ignore cache-creation
cost. This matches what was already shipped 2026-08-08 (`session-usage.sh` summing
`total_in + total_out`, cache creation reported but not counted). No code change needed;
recorded here as a second, independent confirmation of the same decision.

## 4. D1 real quota — headroom is real, not tight

Founder pulled the actual Cloudflare D1 dashboard numbers, verbatim:

- Total Databases: **2/10**
- Rows read: **1.24M/5M**
- Rows written: **28.3k/100k**
- Total storage: **91.44 MB/5 GB**

This matters because task 47's and task 52's own text both cited "D1 space is a real named
constraint" as a reason to hold off multiplying agent rows or new tables. The real numbers
say otherwise — storage is under 2% used, rows read/written are both under 30% of quota.
D1 space is not the blocker it was assumed to be. This does not by itself unblock building
13+ agents (task 47 is still sequenced behind Kai El's build and the pilot/task 41), but the
constraint that was previously cited as a reason for caution should not be cited that way
again without new numbers — this is now the real baseline.

## 5. The Orchestrator's real name — Akosha

Task 52 shipped 2026-08-07 with 'Orchestrator' as an explicit working label, flagged in its
own code comments as an open founder decision because inventing hive mythology mid-build
would cross `FABLE_DNA.md` Chromosome V's Codex boundary. The founder first picked
"Chamberlain" from a multiple-choice round this session, then corrected it directly:
**"Chamberlain's name is akosha."** Akosha is the real, final name.

Renamed in code this session (`worker/src/index.js`): the `agents` table seed (now an
`UPDATE ... WHERE name='Orchestrator'` followed by an idempotent insert, so a live row
already seeded under the old name migrates instead of forking into a duplicate row), the
`AGENT_JOBS` entry, the `AGENT_WORK` entry (`agent:`, system prompt), and the two remaining
prose references in `hiveSnapshot()`/Nanuet's proposal-review prompt. `node --check` clean;
full worker suite re-run after the rename, 132/132 passing. Live confirmation still owed
post-merge: dispatch `edge-health-probe`, confirm `GET /v11/agents` shows `Akosha` (not
`Orchestrator`) in production.

## 6. Knowledge graph wiring — founder wants it done, as its own task

Asked whether `memory/_graph.json` (System A's 101-node knowledge graph, real on disk,
never wired into the live Worker) should ever be connected to System B's production Worker.
Founder: **"Yes, wire it in as its own task."** Not scoped or built this session — logged
as a real, founder-approved future task, separate from today's work.

## 7. JASPER / biosystem.html — founder wants to pursue making it live

Asked whether `docs/biosystem.html`'s "Demo Mode — start JASPER backend to enable LLM"
message should be resolved by actually deploying a live backend. Founder: **"Yes, pursue
that."** This is the same decision task 53 (the Oracle Always Free box) is already gated
on — provisioning real infrastructure and accepting its cost. Founder's directional intent
is now on record; the concrete unblock (setting `ORACLE_HOST`/`ORACLE_USER`/`ORACLE_SSH_KEY`)
is still outstanding and still founder-only by definition.

## 8. Today's real priority — finalize Kai El before growing the roster

Stated directly, unprompted, after the roster and naming questions were answered: **"today
I think it's best we finalize Kai El first. There's a lot he should be doing especially
being able to fully automate work within the command center user interface, providing me
with more than just updates. He needs to be able to fill the task, initiate deep learning
and thinking to brainstorm and outline each scoped task whether Kai picks up from the
roadmap tab, the venture planner tab, or the project tab. He lives consciously within the
hive."**

This is a real, structurally significant expansion of Kai El's role — not a small addition
to the existing chat surface. Breaking down what was asked, as stated, without inventing
detail the founder didn't give:

- Kai El should be able to originate and drive work from at least three different Command
  Center UI surfaces (the Roadmap tab, the Venture Planner tab, the Project tab), not just
  respond to chat.
- Kai El should be able to "fill the task" — populate/flesh out a task's scope, not just
  discuss it (exact mechanics of what "fill" means operationally still need scoping).
- Kai El should have some form of deliberate "deep thinking/brainstorm" mode specifically
  for outlining scoped tasks, distinct from a normal chat reply.
- Kai El should surface more than status updates to the founder through the UI — implying
  some form of two-way, actionable interface rather than a read-only feed.
- "Lives consciously within the hive" — a persistent, ongoing presence rather than a purely
  reactive one.

**Not built this session.** Per this repo's own `dual-lens` standing rule, a structural
change of this size (new agent capability, new UI-driving surface, new task-authoring
mechanism) needs scoping before code, not silent invention of the missing detail. Scoping
questions were queued for the founder as the next step after this directive was logged.

## 9. A real, connected follow-on flagged, not yet scoped

The founder separately raised that a "memory problem" is coming for the hive soon, tied to
Kai El's expanded role above (deep-thinking/brainstorming work and a persistent presence
both cost more context per turn than the current work-cycle pattern uses). The concrete,
buildable version of that concern — giving Kai El real persistent memory/retrieval (e.g., a
vector store or structured D1 lookup) instead of relying solely on the current context
window — is a legitimate next question, directly connected to item 8, but is explicitly
**not scoped or decided yet.** Recorded here so it isn't lost, not as a decision.

## 10. Kai El capability scoping — finalized, addendum same day

Follow-up scoping round on item 8. Grounded first against real code rather than treated as
a blank slate: Kai El already has a real, live semantic memory system —
`remember()`/`recall()` (`worker/src/index.js:1431`/`:1442`), backed by a provisioned
Cloudflare Vectorize index + Workers AI embeddings, already firing on every chat message
(`:2454` reads 3 relevant memories into his prompt before replying, `:2522` stores the
exchange after). Confirmed via `git grep`, not assumed. One known real gap already on
record from task 53's audit: `recall()` does pure cosine similarity and never reads the
`ts` it stores, so an old memory can outrank a fresher one purely on wording.

**Founder's finalized answers, three rounds:**

- **Memory scope:** not "extend the shared memory to more tabs" — the founder wants
  **Kai El to have his own dedicated memory database**, plus a connected **decision/outcome
  log ("training database" + "training logs")**, and **the same for Nanuet later**, when
  work on the Queen resumes (not this pass).
- **"Training database" clarified:** NOT real model fine-tuning today — no GPU/training
  infrastructure exists (same open dependency as task 53's Oracle box). Founder's answer:
  **"log now, real fine-tuning later."** Build the decision/outcome log now on what already
  exists (D1 + Vectorize); treat actual weight-level fine-tuning as a distinct future task
  gated on the same hosting decision as task 53.
- **Tab pickup — all three modes, risk-tiered, not a single choice:** autonomous-within-
  limits for low-risk work, draft-then-founder-approves for normal work, and
  **explicit-invoke-only for high-risk items — where Kai El must write out why it's
  high-risk and how to handle it**, not just flag it.
- **Brainstorm mode — both entry points:** an explicit trigger AND automatic detection when
  a task is underspecified, both routing to the same underlying deep-reasoning pass.

**Phased build plan (not yet started, proposed breakdown for the founder's sign-off):**

1. **Phase A — foundation (backend only, smallest, no new infra decisions).** Give Kai El
   his own memory partition (tag/namespace within Vectorize rather than a second index,
   pending a real reason to split infrastructure) separate from the generic chat memory;
   add a new D1 decision/outcome log table populated wherever Kai El currently acts
   (chat replies, work-cycle turns); fix the known recency-weighting gap in `recall()`
   while already touching this code.
2. **Phase B — tab pickup + risk tiering.** Needs a concrete default risk classification
   (proposed starting list: anything touching money/wallet, deletions, deploys/merges, or
   external communications = high-risk by default) plus frontend wiring across the
   Roadmap/Venture Planner/Project tabs — bigger, touches `frontend/`/`docs/app/`, not
   worker-only.
3. **Phase C — brainstorm/deep-think mode.** New route/function for the longer reasoning
   pass; output written as a real `hive_proposals`/`roadmap_items` row (not just a chat
   reply) so it's actually actionable, not decoration.

**PHASE A SHIPPED, same session.** The founder said proceed, and made two further
decisions when shown the tradeoffs:

- **A physically separate database**, not more tables in `thehive-queen` — chosen after
  being shown that a separate DB costs one of the account's 10 D1 slots and does not
  scale to 13 agents (13 x 2 databases = 26, well past the ceiling). Chosen for Kai El
  specifically, as the hive's second brain; Nanuet, the first brain, gets the same
  treatment later.
- **Staged autonomy, explicitly**: *"he's given more autonomous behaviors instead of all
  at once"*, and each stage must tell the founder exactly what to do to turn it on.

Two things the founder asked for were **not** built as asked, with the reason given at
the time rather than silently substituted:

1. **"Kai El pays for his own upgrades"** — a real financial-autonomy capability, not a
   rider on a database task. It is documented as stage 7 of the ladder with its gate
   spelled out (code-enforced cap, per-transaction record, and the rule that Kai El can
   never raise his own ceiling) and is deliberately NOT reachable by a variable flip.
   `automaton/FLIP_THE_SWITCHES.md`'s `AUTOMATON_FINANCIAL_AUTONOMY` is the existing
   precedent in this repo and defaults off for exactly these reasons.
2. **"Use Cloudflare for now" to host 4DBRAIN** — structurally not possible. 4DBRAIN's
   `tesseract_math` is Python under FastAPI; Cloudflare Workers run JavaScript, and
   Python Workers do not support arbitrary scientific Python packages. The Worker-side
   bridge is built and tested, inert until a real `FOURDBRAIN_URL` exists. Where 4DBRAIN
   actually runs remains open, same class of decision as task 53.

Real infrastructure created (not declared): D1 database `kai-el-brain`
(`7c62dea9-64ba-4d38-a5bf-234d5a504f19`), 4 tables + 9 indexes applied live, bound as
`KAI_BRAIN`, schema committed at `worker/schema/kai-el-brain.sql`. Full detail in
`CAMPAIGN.html`'s 2026-08-10 log entry. Level: **tested**, not verified-live — 189/189
suite green (57 new tests), mutation-tested three ways with every mutation caught.
Live confirmation owed post-merge via `GET /v11/kai/brain` and `GET /v11/kai/autonomy`.

Phases B (tab pickup + risk tiering) and C (brainstorm mode) remain unbuilt — B needs a
concrete risk-classification list agreed with the founder before any code, and both touch
the frontend rather than the Worker alone.

**Incidental finding, flagged not actioned:** the D1 database `sovereign-hive-app` is
completely empty (0 tables, 12 KB, created 2026-07-25) and is occupying one of the ten
account slots for nothing.

## Explicitly not done in this pass

- Task 47's roster is not being built out to 13 today — sequenced behind Kai El's own
  build per item 8, and behind the pilot/task 41 per the founder's own earlier answer.
- No code or scope written yet for Kai El's UI-driving/brainstorm/persistent-memory
  expansion (item 8/9) — needs its own scoping round.
- Task 53 (Oracle box) is not provisioned — the founder's directional answer ("pursue
  that") is recorded, but the actual secrets are still outstanding and founder-only.
