# The Queen's Campaign Orchestration — master plan

*New planning doc, 2026-08-19. Not a replacement for
`memory/planning/2026-08-18-unified-forward-plan-v2.md` (the repo's overall master plan) —
this is a focused sub-plan for one thing the founder asked for directly: "the Queen's
[Nanuet's] campaign orchestration full build and deployment." Cross-referenced from v2 as a
new Phase 12 (see that file) per this repo's own Phase 1c rule — two planning docs must
always point at each other, never drift apart silently.*

## How this doc was built

The founder asked, verbatim: *"check all conversation logs and recent commits that way you
can dial in the full scope directions... build the master plan doc from the conversation,
logs and recent commits that way you keep what I have in mind."* No further clarifying
questions — this plan is built from real, cited evidence instead. Sources actually read:

- `Project_file/Founders Visonary Folder/HIVE_UPDATES/2026-08-10-directive-agent-roster-
  akosha-naming-kai-el-scope-050.md` (the founder's own words, captured verbatim)
- `Project_file/Founders Visonary Folder/Visionary-Conversation-logs/Log(3).md` (lines
  ~21020-21148, the original "Queen Bee" swarm-orchestration brainstorm that seeded the
  whole Sovereign Hive concept) and a `campaign` grep across `Log(4).md`/`Log(5).md`
  (no hits — confirms "campaign" is this repo's own `CAMPAIGN.html` term, not a leftover
  from the origin brainstorm)
- `2026-08-06-kai-el-commune-full-log.md` (full read) — the founder's real, live
  conversation with Kai El about Nanuet's status, read in full
- PR #186 (`research/queen-orchestration-build`, merged 2026-08-18 04:25, this morning
  before this session started) and its full body
- `worker/src/index.js` — Akosha's real code (lines 679-689, 1055-1060, 1165-1171,
  1228, 1958) and `.claude/skills/hive-conductor/SKILL.md` (domain table, lines 58-67)
- `.claude/skills/autonomous-hive-agent/SKILL.md` — grepped for `Nanuet`/`Queen`: **zero
  matches**, a real, confirmed gap (see below)

## What "the Queen's campaign orchestration" already has — three real, separate threads

Three different sessions already built three different pieces that all answer to some
version of "the Queen's orchestration" — none of them the same thing, none of them
previously reconciled against each other. Naming all three honestly, instead of picking
one and pretending the others don't exist (this repo's own standing discipline):

### Thread A — Akosha, the coordination agent under Kai El. **DONE, this session.**

Built earlier this same session, matching the founder's pasted spec exactly: a new agent
reporting to Kai El (`reports_to='Kai El'`, `worker/src/index.js:689`), owning provider-
health coordination and summarizing the six Elders' council findings for Kai El — **not**
Nanuet, and **not** replacing Nanuet's own review. Confirmed present at
`worker/src/index.js:679-689` (D1 row + idempotent migration from the old `Orchestrator`
label), `:1055-1060` (`AGENT_JOBS` description), `:1165-1171` (`AGENT_WORK` entry + system
prompt). Level: **tested** (full worker suite green post-rename, 132/132 at the time).

### Thread B — `hive-conductor`'s real domain routing. **DONE this morning, tested, not verified-live.**

PR #186, merged 2026-08-18 04:25:37 (before this session began), titled *"hive-conductor:
wire real domain routing + manifests (Queen orchestration gap)"*. Its own body records a
prior session's research task: *"find and continue 'the Queen's fully orchestrated
build.'"* That session's own reading of the phrase was structural/mechanical: `hive-
conductor` is named in root `CLAUDE.md` as *"the top-level orchestrator... there is
deliberately no skill above it,"* but its own Quick Start had never actually been run —
`harness_manifest_builder.py` returned `{"skill_count": 0}` for every real domain because
it only knows how to scan for `SKILL.md` files, and `worker/`, `frontend/`, `backend/` are
code surfaces with none.

Fixed: a new `domain_router.py` (routes a directive's own keywords to one of 5 domains —
edge-backend/frontend/colonies/governance/strategy, table at `hive-conductor/SKILL.md:58-
67`) plus five hand-authored `harnesses/*.json` manifests naming each domain's real
verification commands. Full pipeline run locally and confirmed real. **Not** run against
an actual founder directive end-to-end yet — that's the honest gap between `tested` and
`verified-live` here.

### Thread C — Nanuet's own brain (memory + decision log + staged autonomy). **NOT built. Founder-deferred, on record.**

This is the one directly named by the founder, verbatim, in HIVE_UPDATES 050 (2026-08-10):
Kai El got his own dedicated D1 database (`kai-el-brain`), a decision/outcome log, and a
staged-autonomy ladder — real infrastructure, shipped same session (commit `c347a6a`,
*"Kai El's brain, Phase A: own D1 database, recency-weighted recall, staged autonomy"*).
The founder's own words on doing the same for Nanuet: **"the same for Nanuet later, when
work on the Queen resumes (not this pass)."** That deferral is the reason this thread has
sat untouched for nine days — not an oversight, a scheduled resumption point. This session
is that resumption.

## The real, confirmed gap: nothing connects any of the three threads to the actual campaign queue

Grepped `.claude/skills/autonomous-hive-agent/SKILL.md` (the skill that names how the
hive's autonomy pieces — audit, execution, scheduling — work together, and that
`.claude/HIVE_PULSE.md`/`CLAUDE.md` both say every autonomous firing should read first) for
`Nanuet` and `Queen`: **zero matches.** The thing that actually drives `.claude/tasks/
CAMPAIGN.html` — the daily-firing protocol this very session is running under — has no
concept of Nanuet as an agent at all. It is driven entirely by an external Claude Code
session reading a checklist, once a day, with no in-hive agent owning the loop.

That is what "the Queen's campaign orchestration full build and deployment" concretely
means, triangulated from real evidence rather than guessed: **Nanuet does not yet
orchestrate anything.** Kai El has a brain and a chat surface. Akosha coordinates provider
health and council summaries for Kai El. `hive-conductor` can route a directive to the
right domain. But the actual campaign — the task queue this session works through every
day — runs with no Queen in the loop at all. Building that connection, on top of the real
infrastructure the other two threads already proved out, is the genuinely new, unbuilt
piece.

## Proposed build — mirrors Kai El's own already-approved phase shape

The founder already approved this exact phase pattern once (Kai El, HIVE_UPDATES 050,
item 10) and said to repeat it for Nanuet. Reusing it rather than inventing a new shape:

### Phase Q-A — foundation (backend only, smallest, no new infra decisions)

- Nanuet's own D1 database, same pattern as `kai-el-brain` (a physically separate DB, not
  more tables in `thehive-queen` — the founder's own reasoning for Kai El's DB, D1 slot
  count 2/10 used per the 050 directive's real dashboard numbers, applies identically).
- A decision/outcome log: every proposal Nanuet reviews, every campaign task she'll
  eventually touch in Phase Q-C, written as a real row — not a training-weights claim (same
  "log now, real fine-tuning later" distinction the founder drew for Kai El).
- Recency-weighted recall from day one — Kai El's `recall()` shipped *without* it and
  needed a follow-up fix (050, item 10); building it in from the start here avoids
  repeating that known gap.
- Staged-autonomy switches, **all off by default** — same precedent as
  `AUTOMATON_FINANCIAL_AUTONOMY`/`AUTOMATON_REPLICATION_AUTONOMY` and Kai El's own ladder.

### Phase Q-B — wire Nanuet into `hive-conductor`'s real routing (Thread B)

Thread B already built the mechanism (`domain_router.py` + 5 domain manifests) but has
never been exercised against a real founder directive. The natural first real user of it
is Nanuet's own review pipeline: when she reviews a proposal or campaign task, route it
through `domain_router.py` to find out which real domain (edge-backend/frontend/colonies/
governance/strategy) it actually touches, instead of the current one-line proposal-scoring
call at `worker/src/index.js:1019` that has no domain awareness at all. This is also
Thread B's first `verified-live` proof — a real, non-synthetic directive going through it.

### Phase Q-C — Nanuet owns the campaign queue (the literal "campaign orchestration")

The actual ask. Staged, not all-at-once, same as every other autonomy ladder in this repo:

1. **Observe-only.** Nanuet reads `.claude/tasks/CAMPAIGN.html`'s task queue (same content
   this session reads every firing) and writes her own read of it — which task she'd pick
   next and why — into her new decision log (Phase Q-A). Visible to the founder, changes
   nothing about how the daily firing actually runs.
2. **Advise, human/session executes.** The daily-firing protocol (this session's own
   instructions) starts by reading Nanuet's logged recommendation before picking a task,
   the same way it already reads `HIVE_PULSE.md` first. Still no autonomous execution —
   the external session remains the one that actually does the work.
3. **Delegate through Akosha, founder-gated per action.** Nanuet can hand a task to Akosha
   (Thread A) for coordination, but every real action (a commit, a PR) still requires the
   same founder-only gates every other agent has — Nanuet gains a voice in the loop, not a
   bypass of it. This tier is explicitly the furthest this plan proposes building without a
   fresh founder sign-off — matching the founder's own "he's given more autonomous
   behaviors instead of all at once" instruction for Kai El.

## Deployment target

System B (the live Cloudflare Worker) — Nanuet, Kai El, and Akosha all already live there
today; there is no version of Nanuet in System A (`backend/`) to build onto, and System A
is confirmed not deployed anywhere (`CLAUDE.md`'s own answered-2026-08-07 finding). The
founder's own answer earlier this session ("Both, reconciled") is noted, not silently
narrowed: reconciling System A and B is real, separate, larger work already tracked as
Phase 1a/Phase 3 in `2026-08-18-unified-forward-plan-v2.md` and still founder-blocked
there (the `soul.md` vs `.queen/soul.md` vs `docs/GOVERNANCE.md` question). This plan does
not resolve that — it builds Nanuet's orchestration on System B, where she actually runs
today, and treats full A/B reconciliation as a dependency only if the founder later wants
System A folded into the same Queen.

## Explicitly not in scope

- No change to any `AUTOMATON_*_AUTONOMY` switch, `QUEEN_AUTONOMOUS_APPROVAL` (switch 9),
  or any existing founder-only gate. Phase Q-C tier 3 adds Nanuet as a participant, never
  a bypass.
- No new agent-roster seats beyond Nanuet's own build — task 47's roster (13 agents) stays
  exactly as sequenced (behind the 6-Elder pilot + task 41), untouched by this plan.
- No resolution of the System A/B reconciliation question (Phase 1a) — flagged as a
  dependency only, not silently decided here.
- Phase Q-C tier 3 (delegate through Akosha) is proposed, not built — needs the founder's
  own sign-off the same way Kai El's Phase B needed a risk-classification list before code.

## Founder decisions still needed before Phase Q-C ships

1. **Confirm the interpretation itself** — is "Nanuet owns the campaign queue,
   observe-then-advise-then-delegate" the right shape, or something else?
2. **Risk classification for delegated actions** (Phase Q-C tier 3) — same open question
   Kai El's Phase B still has: which task types are low-risk (autonomous-within-limits),
   normal (draft-then-approve), or high-risk (explicit-invoke-only, Nanuet must state why)?
3. **Timing** — build all of Q-A/Q-B/Q-C now, or Q-A first (foundation only, same
   incremental pattern Kai El's build used) with Q-B/Q-C as their own follow-up sign-offs?

## Verification (for whichever phase actually gets built)

- Same discipline as every other phase in this repo: `node --check`, full worker suite
  green, `python3 scripts/check-claims.py` passes, real PR, **never self-merged**.
- Level claimed never exceeds what's actually proven: Q-A ships as `tested` until a real
  `edge-health-probe` run confirms Nanuet's D1 rows exist in production
  (`verified-live` needs that run ID, per `wired-or-not`).
- Q-B's `verified-live` proof is a real, non-synthetic directive routed through
  `domain_router.py` by Nanuet herself, not another synthetic self-test.
- Q-C tier 1 (observe-only) is checked by confirming the daily-firing session actually
  reads Nanuet's logged recommendation — a real committed line in a real firing's own
  session transcript/PR, not a claim.
