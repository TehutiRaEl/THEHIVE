---
name: hive-conductor
description: The Master Harness of the Sovereign Hive. Use when a founder directive needs to be decomposed into sub-tasks, routed to the right hive domain (backend/edge, frontend, colonies, governance, strategy), driven to a verified close, and gated by the Constitution (F-001…F-006) before anything ships. This is the top-level orchestrator that sits above the domain harnesses — the "Hive Conductor" in the multi-level MCP-harness architecture.
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
1. Score the directive against domain keywords (edge/worker/api → edge-backend; tab/UI/react
   → frontend; colony/capabilities → colonies; soul/constitution/article → governance;
   gap/market/positioning → strategy).
2. Single clear winner → dispatch. Multiple → split into one task per domain, ordered by
   dependency (backend before the frontend that calls it; governance gate always last).
3. No clear match → ask the founder one question with a recommended lane.

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

## Quick start
```bash
# 0. RECALL — ask memory what the hive already did (RAO Phase 0); prepend the brief to the goal
python3 .claude/skills/hive-conductor/scripts/recall_context.py --goal "<founder directive>" --brief
# 1. Build/refresh a hive-domain manifest (points the harness builder at a hive skill surface)
python3 .claude/skills/agent-harness/scripts/harness_manifest_builder.py \
  --domain <edge-backend|frontend|colonies|governance|strategy> \
  --repo-root . --out-dir .claude/skills/hive-conductor/harnesses --no-timestamp
# 2. Compile the founder directive into a plan against that manifest
python3 .claude/skills/agent-harness/scripts/goal_compiler.py \
  --goal "<founder directive>" --manifest .claude/skills/hive-conductor/harnesses/<domain>.json --out plan.json
# 3. Drive the loop (init → next → record → verify → close), governance gate before close.
```

Origin: Fable (Harness), 2026-07-13. Built on the real `agent-harness` (alirezarezvani/claude-skills, MIT),
realizing the multi-level MCP-harness "Hive Conductor" from the founder's research — on verified ground.
