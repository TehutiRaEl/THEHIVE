---
name: hive-conductor
description: The Master Harness of the Sovereign Hive. Use when a founder directive needs to be decomposed into sub-tasks, routed to the right hive domain (backend/edge, frontend, colonies, governance, strategy), driven to a verified close, and gated by the Constitution (F-001…F-006) before anything ships. Also use when batching several tasks at once — it checks whether they amplify or cancel each other before running them together — and when a directive needs the right skill selected out of the ~70 the hive already has rather than a new one built. This is the top-level orchestrator that sits above the domain harnesses; there is deliberately no skill above it.
---

# The Hive Conductor — Master Harness

The Conductor is the reins-holder. It receives a high-level directive, breaks it into
domain-scoped tasks, dispatches each to the domain that owns it, requires machine-verified
closure, and refuses to let anything ship that the **governance gate** (the Constitution)
has not cleared. It runs *on top of* the `agent-harness` machinery (promoted alongside this
skill) — the Conductor picks the domain and enforces the constitution; `agent-harness`
compiles, executes, and verifies within a domain.

```
FOUNDER DIRECTIVE
   → hive-conductor PHASE 0 · RECALL: query sovereign memory for prior related work
        → inject the top matches as context (the hive plans knowing what it already did)
   → classify domain(s) + split into a task per domain
        → for each domain: agent-harness (goal_compiler → loop_controller: execute→verify)
        → GOVERNANCE GATE (F-001…F-006) must PASS before close
   → CLOSE only when every domain task is verified AND governance-cleared
        → the close is WRITTEN BACK to memory (heartbeat + Conductor both feed recall)
        → else ESCALATE to the founder (never fake success)
```

## Phase 0 — Read the genome, then recall before you plan

Before anything else, the Conductor is bound by `FABLE_DNA.md` — the Constitution
(Chromosome I), the debugging method (II), the mesh principle (III), the Horde principle
(IV), the Codex boundary (V — narrative never overrides engineering), session-boundary
harvest (VI), and how proposals get reviewed before becoming canon (VII, see
`MANDATE_TRIAGE.md`). This is not optional background reading; it is what "governed by the
Constitution" in this skill's own description actually means in practice. A session that
skips it is planning against a Constitution it never opened.

Then, retrieval-augmented orchestration: the Conductor does not plan cold. Before
decomposing any directive it asks the hive's own memory what it has already done that
relates — so it builds on prior work instead of re-deciding settled questions or
duplicating effort.

```bash
python3 .claude/skills/hive-conductor/scripts/recall_context.py --goal "<directive>" --brief
```
- Prints a markdown "Prior hive memory" brief; **prepend it to the goal** before `goal_compiler`.
- This queries the network-backed D1/Vectorize memory for "has the hive done something like
  this before, anywhere." For "where are we in the one plan we already agreed to, right
  now" — a local, always-available question with no network dependency — run
  `recursive-growth` first instead/as well (`.claude/skills/recursive-growth/SKILL.md`); the
  two answer different questions and neither substitutes for the other.
- Degrades gracefully (exit 0 always): if the Vectorize index isn't provisioned yet, or the
  runner has no egress to the edge, it says so and you plan on first principles — never blocked.
- The loop-close is itself a memory (the heartbeat already writes; manual notes via
  `/v11/memory/remember`), so each completed directive makes the *next* recall richer.
This is the point where the three legs — heartbeat (acts), Conductor (orchestrates), memory
(recalls) — become one organism: the hive that learns from what it has done.

## The hive's domains (who owns what)
Manifests live in `harnesses/`. Each maps to a team seat and a code surface.

| Domain | Owner | Surface | Verify with |
|--------|-------|---------|-------------|
| **edge-backend** | Sonnet / Fable | `worker/`, `backend/`, D1 | `node --check`, `pytest`, edge-health-probe workflow |
| **frontend** | Mistral | `frontend/`, `docs/` | `npx tsc --noEmit`, `npm run build`, Playwright drive |
| **colonies** | Fable | the 6 colony repos | `/colony/capabilities` parity, constitution-receive green |
| **governance** | Fable (Governance Kernel) | `soul.md`, constitution-sync, governance_log | six-colony sync drill, role-tagged commits |
| **strategy** | Grok | gap analysis, positioning | Grok bridge push, ACTIVE/ note |

## Routing (deterministic first, ask second)

**This is now runnable, not just prose** (fixed 2026-08-18 — see "The manifest gap this
closes" below):

```bash
python3 .claude/skills/hive-conductor/scripts/domain_router.py --directive "<founder directive>"
```

1. `domain_router.py` scores the directive against domain keywords (edge/worker/api →
   edge-backend; tab/UI/react → frontend; colony/capabilities → colonies;
   soul/constitution/article → governance; gap/market/positioning → strategy) and prints the
   matched domain(s) plus the exact `goal_compiler.py` command to run next.
2. Single clear winner → dispatch. Multiple (`MULTI-DOMAIN-SPLIT`) → split into one task per
   domain, ordered by dependency (backend before the frontend that calls it; governance gate
   always last).
3. No clear match (`REFUSED-NO-MATCH`, exit 3) → the script prints a forcing question; ask the
   founder one question with a recommended lane, don't guess.

## The manifest gap this closes (2026-08-18)

A `plan-reality-audit`-style check found this skill's own "Quick start" step 1
(`harness_manifest_builder.py --domain <domain>`) had never actually been run against any of
the five real domains in the table above — running it for real proves why:

```
python3 .claude/skills/agent-harness/scripts/harness_manifest_builder.py \
  --domain worker --repo-root . --json
# -> {"skill_count": 0, "skills": [], ...}
```

`harness_manifest_builder.py` scans a folder for `SKILL.md` files — exactly right for
`.claude/skills/` itself (that's what `harnesses/skills-active.json` and
`agent-harness/assets/harnesses/thehive.json` are), but `worker/`, `frontend/`, `backend/`,
and the colony repos are code/doc surfaces with no `SKILL.md` anywhere in them, so the scan
always returns empty. The Conductor's own routing table pointed at a tool that could never
produce a manifest for the domains it names. Verdict (`plan-reality-audit` ladder): **half
done** — `goal_compiler.py`/`loop_controller.py` genuinely work once given a real manifest;
no domain ever had one.

Fixed with two additive, backward-compatible pieces (neither touches how `.claude/skills/`
manifests already work):
- **`domain_router.py`** (above) — the routing half, made runnable.
- **Five hand-authored manifests** committed at `harnesses/{edge-backend,frontend,colonies,
  governance,strategy}.json`, schema-compatible with `agent-harness/manifest.v1` — each
  `skills[].tools[]` entry lists that domain's real, currently-existing verification
  command (`cd worker && npm test`, `cd frontend && npx tsc --noEmit`, etc., sourced from
  each domain's own `package.json`/workflow file, not invented) rather than a scanned
  `SKILL.md`. `goal_compiler.py` got one small additive patch (a `cmd`-based tool shape
  alongside the original `script`-based one) so it can build tasks from these without any
  change to existing skill-folder manifests.
- Full pipeline verified locally, real output not simulated:
  `domain_router.py --directive "fix the worker API rate limiter" ` → routes `edge-backend`
  → `goal_compiler.py --manifest harnesses/edge-backend.json` → 1 task, real verification
  commands → `loop_controller.py init && next` → real `execute` directive emitted. Level:
  `tested` (local pipeline run, not yet used on a real founder directive end-to-end).
- **Still honestly incomplete**: `colonies`, `governance`, and `strategy` manifests are
  mostly `manual-evidence` checks (no local machine check exists for "did the colony sync
  actually happen" or "is this strategy doc good") — named plainly in each manifest's own
  `note` field rather than papering over it with a fake green.

## Phase 0.5 — Reach for what exists before building anything (2026-08-07)

The hive has **~70 skills**. The most expensive recurring mistake is not a bad build — it is
a *redundant* one. Two measured examples from a single day: a session was asked to create a
devil's-advocate skill that had existed for weeks, and a "childlike wonder" skill whose full
method was already sitting in `memory/philosophy/`, unbuilt, while the doctrine calling both
lenses non-negotiable had been in the repo the whole time.

Before decomposing, run the catalog check — cheap, and it converts "build" into "invoke":

| Need | Reach for |
|---|---|
| Founder just sent new info mid-work | `founder-input-intake` → then `founder-directive-capture` |
| A design/architecture decision | `dual-lens` (never one lens alone) |
| Re-audit something already marked done | `devils-advocate-audit` |
| About to claim something works | `wired-or-not` — name the level, bring evidence |
| A repeated multi-step workflow | `workflow-optimizer` |
| "Where were we?" at session start | `recursive-growth` |
| An external repo or document to absorb | `research-to-dna` / `alchemical-process` |
| Landing a PR green | `merge-readiness` |
| Closing out a finished deliverable | `polymath-lens`, then `session-harvest` |
| Something odd but not yet a bug | `anomaly-triage` |
| Before settling on a root cause | `nine-miss-truths` |
| Authority/power balance question | `checks-and-balances` |

**`skill-census` lists the real current set** — run it rather than trusting this table if
they disagree. A stale table in a skill file is the same class of bug as a stale `done`.

## Phase 0.6 — Batching: check resonance before running tasks together

Doctrine: `memory/philosophy/resonance-interference.md` (the founder's own framing —
work streams **amplify in phase, cancel out of phase**).

Batch tasks only after checking their phase relationship:

**Batch together (in phase)** — same file or subsystem; one unblocks another; one probe run
or test suite proves both; one's finding sharpens the other's question.

**Sequence, never merge (out of phase)** — contradictory edits to the same lines; one
invalidates the other's premise; one would be verified against state the other is mid-change
on; **one is blocked on a founder decision the other assumes an answer to.**

**Watch for the standing wave** — effort spent, position unchanged. The real instance in this
project: agent layers stacked four deep (tasks 37 → 38 → 48 → 52) while the verification each
promised was never performed. Ask every batch: *has anything measurable changed, or only the
amount of work done?*

## Phase 0.7 — Decisions pass the dual lens before they become tasks

Any **architectural** choice inside a directive — a new subsystem, schema change, agent,
capability, or governance/spending change — goes through `dual-lens` before decomposition:
devils-advocate first, childlike-wonder second, **in that order** (wonder first produces
advocacy, not design). A decision reviewed by one lens does not pass; it is reported as
`single-lens, incomplete`.

This applies to **founder proposals too**. `MANDATE_TRIAGE.md` already says nothing gets
rubber-stamped — running both lenses on a founder idea is respect, not obstruction.

## Evolving on new data

The Conductor does not implement its own learning loop; it hands off:

- **After any repeated workflow** → `workflow-optimizer` records what was slow or missing.
- **At session start** → `recursive-growth` reads the master plan and folds verified fixes
  back in as lessons.
- **New founder input mid-flight** → `founder-input-intake` re-plans *before* the next
  action; `founder-directive-capture` archives the verbatim record.
- **New AI-field capability** (a model, protocol, or technique that changes what is possible)
  → `research-to-dna` for the intake gate, `alchemical-process` for extracting the minimal
  pattern rather than adopting a whole framework, then `dual-lens` before it changes anything
  structural. **Novelty is not a reason to adopt.** The founder's own standing decision on
  the 2026-08-07 agentic-harness document was to take the principles and explicitly discard
  the parts that outran the hive's real footing.

## The governance gate (non-negotiable, runs before every close)
Before the Conductor closes ANY directive, the change must pass F-001…F-006:
- **F-001 Data Sovereignty** — no user data leaves the hive's own surfaces without consent.
- **F-002 Value-Weighted Wealth** — the change advances the colony's actual value, not vanity.
- **F-004 Explainability** — every shipped decision carries a probe-backed rationale (the commit's `Rationale:` line, a run link, a test).
- **F-005 Conflict Priority** — fixed laws beat mutable; lower F-number wins.
- **F-006 Cross-Law Non-Penalization** — exercising a right (decline, delete) never costs wealth.
A directive that can't clear the gate is escalated to the founder with the failing article named — it does **not** ship.

## Operating rules (inherited from the harness contract)
1. Never adjudicate your own verification — the domain's checks run via subprocess and decide.
2. Retry within caps with a *changed* approach; on exhausted budget, ESCALATE — never fake a green.
3. One writer per memory file; plans and state live in the repo (ephemeral containers).
4. Probe before claim. The loop, not optimism, decides "done."
5. The founder is the only human hands: merges, secrets, subdomains, and any irreversible action wait for them.

## Do / Don't — explicit, because each one is a mistake actually made here

**Do**
- **Check the catalog before building** (Phase 0.5). Invoking beats rebuilding.
- **Name the claim level with evidence** — `compiles` → `tested` → `merged` → `deployed` →
  `verified-live` (`wired-or-not`). A `verified-live` claim needs a run ID, SHA, or committed
  test path; `scripts/check-claims.py` enforces it in CI.
- **Verify the layer beneath before building the next one.** Four agent layers were stacked
  on a foundation that had never once been confirmed live.
- **Commit tests to the repo.** Tests written into a scratch directory die with the container
  — measured, twice, on 2026-08-07.
- **Report a negative finding as a finding.** "The agents are not running" is a successful
  outcome, not something to soften.
- **Say when you skipped a gate.** Skipping and not saying is the only unrecoverable version.

**Don't**
- **Don't invent Codex mythology** — names, lore, canon are founder territory
  (`FABLE_DNA.md` Chromosome V). The Orchestrator agent still has a working label, not a name,
  on purpose.
- **Don't invent a meaning for founder terminology.** Ask. "Conjugated wave theories" became
  real doctrine only after the founder defined it.
- **Don't promote a paraphrase into a quote** — including a UI selection recorded as if typed.
- **Don't guess a founder-blocked answer to keep moving.** Do every unblocked part, state
  what is blocked, stop there.
- **Don't merge, spend, or take an irreversible action** — ever, regardless of how well a
  gate passed.
- **Don't batch out-of-phase tasks** (Phase 0.6) — sequence them.
- **Don't let wonder soften a real risk, or risk kill a real possibility.** Both lenses
  report; neither cancels the other.
- **Don't run wonder before devils-advocate.** That order produces advocacy, not design.

## Honest limits

Everything in Phases 0.5–0.7 and this Do/Don't list is **procedural** — no machine enforces
it. The only machine-checked pieces in this repo's whole discipline are
`scripts/check-claims.py` (evidence behind `verified-live` claims) and the
`edge-health-probe` work-cycle assertion (whether the agents genuinely run).

Stated plainly because the audit that produced these rules found the opposite pattern
everywhere: doctrine declared non-negotiable with nothing behind it. **Assume this skill can
be skipped, and treat "did the Conductor actually run these phases?" as a live question.**

## Quick start
```bash
# 0. RECALL — ask memory what the hive already did (RAO Phase 0); prepend the brief to the goal
python3 .claude/skills/hive-conductor/scripts/recall_context.py --goal "<founder directive>" --brief
# 1. ROUTE — score the directive against the five real domains (see "Routing" above)
python3 .claude/skills/hive-conductor/scripts/domain_router.py --directive "<founder directive>"
# 2. Compile the founder directive into a plan against the routed domain's committed manifest
#    (harnesses/{edge-backend,frontend,colonies,governance,strategy}.json already exist —
#    do NOT run harness_manifest_builder.py --domain here, it returns skill_count:0 for
#    every one of these five; that tool is for scanning .claude/skills/ itself, see above)
python3 .claude/skills/agent-harness/scripts/goal_compiler.py \
  --goal "<founder directive>" --manifest .claude/skills/hive-conductor/harnesses/<domain>.json --out plan.json
# 3. Drive the loop (init → next → record → verify → close), governance gate before close.
```

Origin: Fable (Harness), 2026-07-13. Built on the real `agent-harness` (alirezarezvani/claude-skills, MIT),
realizing the multi-level MCP-harness "Hive Conductor" from the founder's research — on verified ground.
