# Vision triage — the MCP waterfall agentic-harness document (2026-08-07)

**Source:** `SOURCES/research-notes/2026-08-07-agentic-harness-mcp-waterfall.md` (extracted
from the founder's uploaded `AI.docx` — research they did with another AI).
**Founder's decisions on it:** `HIVE_UPDATES/2026-08-07-directive-agentic-harness-decisions-045.md`.
**Precedent for this file:** `VISION/2026-07-21-vision-automaton-devils-advocate-005.md` — same
shape, a session-written critical review of an external system the founder asked about.

**Boundary honored:** this file *adds* an analysis. It does not edit `soul.md`, `FABLE_DNA.md`
Chromosome I, or any existing vision or law text. Amending those is founder-only
(`HIVE_UPDATES/README.md`, and Chromosome I's own amendment process).

---

## What the document actually is

Seven distinct things stacked in one chat log, of very different maturity:

1. An argument that autonomous coding agents make **waterfall** viable again ("spec-driven
   development", "hyper-waterfall") — planning becomes an expression of intent rather than
   manual labor.
2. A **deterministic state-machine harness** design built on MCP, with the LLM as a worker
   inside an isolated phase and external code owning state transitions.
3. A **custom Filesystem MCP server** in Python (`FastMCP`, stdio transport, ~60 lines,
   directory-traversal guard included).
4. A **master waterfall orchestrator** — pure async Python, deliberately avoiding LangChain
   and CrewAI.
5. A **100,000-agent scaling architecture** — 100 agents × 10 colonies × 100 trees, on Ray or
   Erlang/OTP, an anycast MCP mesh, Redis Cluster, and self-hosted GPU inference.
6. A **scaled-down 8-agent prototype** — 1 Architect, 1 Director, 4 Builders, 2 Reviewers.
7. An **AUTOMATON reverse-engineering rig** reusing those same 8 agents as an analysis matrix.

---

## Calibration first: the code in this document does not run

Stated up front because it changes how much weight the rest deserves.

The orchestrator's main execution loop contains:

```python
json.dump(plan_data, indent=2, f)
```

That is a `SyntaxError` — a positional argument following a keyword argument. Python will not
compile the file. **Verified with `py_compile`, not by eye.**

Nearby, the JSON-cleanup line is wrong in kind rather than in syntax:

```python
clean_json = plan_raw.strip().strip("```json").strip("```")
```

`str.strip()` takes a *set of characters*, not a substring — so this strips any of
`` ` ``, `j`, `s`, `o`, `n` from both ends. It happens to survive well-formed JSON (which ends
in `}` or `]`), which is exactly what makes it the kind of bug that ships and then bites later.

**Conclusion:** treat this document as a genuine architecture sketch and a source of good
principles. Do not copy its code. The ideas are worth considerably more than the
implementation.

---

## 🔴 Risky

**1. The 100,000-agent architecture.** The document is honest about its own danger:
*"100,000 active contexts calling commercial LLMs simultaneously will hit rate limits
instantly and cost thousands of dollars per minute."* THEHIVE has already had a real
$40-in-7-minutes incident, and task 51 documents the token ceiling tripping at 3M. This is the
same failure mode scaled by three orders of magnitude. **Founder decision: dropped.**

**2. Dynamic MCP server creation (the "outer loop").** Agents that detect a missing capability,
write a new MCP server, register it, and hot-reload their own connections. This is
capability self-expansion with no human in the loop — and THEHIVE's own automaton review
(`VISION/...-005.md`) found and *closed* precisely this class of gap: "the agent able to edit
its own financial/authority rule files." The document proposes reopening it as a feature.
**Founder decision: gated behind a default-off founder switch, like
`AUTOMATON_FINANCIAL_AUTONOMY`.**

**3. Agents rewriting each other's system prompts.** *"Agent 8 must be able to automatically
modify the system instructions of the builder agents."* A system that can silently rewrite
what its own agents are told to be, with no record of when or why it drifted. Same gate.

---

## 🟠 High stakes

**1. This cannot live inside the current architecture — it would become a third system.**
The blueprint requires a long-running process, a real filesystem, and Docker. A Cloudflare
Worker has none of those. THEHIVE already carries an unreconciled System A (FastAPI) and
System B (the Worker); adopting this naively creates a System C. The reconciliation debt is
already flagged in `CLAUDE.md` as open work.

**2. "Do not let the AI orchestrate itself."** The single most valuable sentence in the
document. Write deterministic code to manage execution phases, session state, and tool
routing; let the LLM act purely as a worker inside one isolated phase. This is a direct,
independent answer to the founder's own earlier diagnosis that the hive's work cycle was
theater — the 30-minute heartbeat resolved Arena challenges and nothing else, because nothing
deterministic was ever driving real work.

**3. Local LLM clusters (vLLM / Ollama / Llama-3-8B / Mistral-7B).** The document's answer to
per-token cost. This is also the honest answer to task 41 ("the Hoard paying for its own
existence") and to task 51's ceiling. But it is a real hardware and money commitment, and it
is not a small step.

---

## 🍰 Icing on the cake

Real ideas, wrong order — none of these matter until a basic loop works end to end:

- Differential testing (run original and replica on identical input, compare behavior).
- Dynamic code graphing (trace variables through executions to find which prompt segments
  drive which logic changes).
- The man-in-the-middle MCP logging proxy.
- Least-privilege interception at the proxy layer.

---

## 🍚 White on rice — already a natural fit, some of it already built

**The waterfall itself already exists here in another form.** `.claude/tasks/CAMPAIGN.html` is
a spec *and* a task queue; the work cycle is an execution loop; every task carries an explicit
Acceptance section. The document describes, formally, a thing THEHIVE built by instinct.

**Context budget isolation independently confirms task 51.** The document: *"Never pass your
entire project codebase into a single LLM prompt window. Keep context windows highly focused
to drastically reduce hallucinations."* It argues from output quality; task 51 arrived at the
same place from token cost (96% of the measured ceiling being cache creation driven by one
enormous persistent context). Two unrelated sources, same structural finding.

**Three-strikes-then-a-human is already law.** *"If a validation loop fails more than three
consecutive times, pause execution and wait for human review."* That is the founder-holds-
anything-irreversible rule already written into `soul.md` and honored throughout the Worker.

**Eight agents, eight agents.** The prototype's headcount matches THEHIVE's live `agents` table
exactly — though the roles differ entirely (Architect/Director/4 Builders/2 Reviewers vs.
Nanuet/Kai El/Ma'at/Solomon/Thoth/Sekhmet/Ptah/Horus, now nine with the Orchestrator). The
document's own argument for starting there is the strongest case against the 100k section:
*"If these 8 agents cannot work together without error, a larger system will fail
immediately."*

---

## 🚶 Walk in the park

- The Filesystem MCP server — roughly 60 lines, with the directory-traversal guard already
  written.
- `temperature=0.0` — one line, and it buys reproducibility across agent runs.
- Resume-from-`plan.json` after a crash — THEHIVE already has this pattern in D1
  (`hive_proposals.actioned_at` exists precisely so a firing never re-picks completed work).
- State artifacts on disk — again, already present in a different shape.

---

## The finding that matters most: the hosting answer may already be in this repo

The founder answered "nowhere yet" when asked where a Python/Docker harness would run. That
is very likely more settled than it appears.

`.github/workflows/deploy.yml`, lines 24–58, already targets an **Oracle Always Free box**:

```yaml
# The Oracle Always Free box is part of the vision but not provisioned
# yet. Until its secrets exist, skip gracefully instead of failing after
# every CI run (this workflow accumulated 165 straight failures that way).
```

It SSHes in, runs `docker-compose down && docker-compose up -d --build`, then health-checks
`http://localhost:8080/v11/health`. It is inert only because `ORACLE_HOST`, `ORACLE_USER`, and
`ORACLE_SSH_KEY` are unset.

Oracle's always-free tier provides a persistent ARM instance with a real filesystem and Docker
— which is exactly what this blueprint needs, and exactly what the Worker cannot offer.

**One provisioning decision would unblock three separate stalled things:**

| Stalled thing | Why it's stalled |
|---|---|
| This harness | No long-running host with a filesystem |
| System A (FastAPI `backend/`) | Real, tested code sitting unprovisioned — same `ORACLE_HOST` gate |
| `docs/biosystem.html` "Demo Mode" | Shows *"start JASPER backend to enable LLM"* because no JASPER backend is reachable |

That is not a recommendation to provision it — the founder has real reasons to weigh (cost,
maintenance, whether System A should be retired instead of revived, all of which
`ROADMAP_SEED` already lists as open founder decisions). It is a statement that the three
questions are **one** question, and were not previously recorded as such.

---

## Recommended sequence, if this is ever picked up

Explicitly **not** started — the founder chose triage only. Recorded so a future session
inherits the reasoning rather than re-deriving it:

1. **Decide the host** (task 53). Nothing below is possible without it.
2. **Build the deterministic phase-runner first**, not the agents. "Do not let the AI
   orchestrate itself" is the load-bearing idea; everything else is decoration on top of it.
3. **Reuse THEHIVE's existing 8 (now 9) agents**, do not invent the document's roles. The
   Architect/Director/Builder/Reviewer split is one valid decomposition, not the only one, and
   THEHIVE's agents already have real jobs and a real `reports_to` chain.
4. **Self-expansion last, and gated**, per the founder's standing decision.
5. **Never** the 100k layer without a local model cluster already proven and paying for itself
   (tasks 41 and 51).
