---
name: connection-audit
description: The Fable-5-level expanded connection audit. Use when the question is "is everything in this system actually connected to what it is supposed to serve?" and not "why is this one thing broken?": before trusting a plan, a status board, a feature list or a "done" claim across a whole repo, front end plus back end plus automation plus the instructions an AI is given. Models the Hive as producers and consumers joined by edges, classifies every broken edge (nobody reads it, it reads something missing, it reads the wrong thing, it exists only on paper, it lies), grades each artifact on the five FABLE-5 levels, and produces ranked, evidence-backed, deduplicated findings with a forward check for each pattern. Born from GitHub issue 243 (the Queen and Kai El cannot see what they are supposed to know), whose real size was far larger than its first read. Not for a single known bug (use fable-debugger), not for re-checking one past "done" (use devils-advocate-audit), not for a skill census (use skill-census).
---

# connection-audit: the Fable-5 audit method, written down so any model can run it

`docs/FABLE-5_SPEC.md` defines the five levels. `fable-debugger` is the method for ONE broken
thing. This skill is the method for the whole body: it takes the same five levels and the same
discipline (probe before claim, compare against a working sibling, find the coupled bug, never
fake a green) and runs them across every file, route, table, workflow, skill and instruction in
the repo, in parallel, with a fixed report format so the results can be merged.

It complements and does not replace the spec. When they disagree, the spec's definitions of the
levels win; this skill adds the connection model, the orchestration and the report.

## Why it exists (the first run, 2026-11)

Issue 243 said: the Queen (Nanuet) and Kai El cannot see what they are supposed to know. It
checked 11 knowledge sources, in one direction (what the live Worker reads). The founder suspected
the problem was bigger than written and ordered a full audit. It was. Seven auditors found, among
other things: the Queen's review saw no constitution; two brains no prompt read; write routes that
fed a mind's prompt open to anyone; a "token required" check that handed a token to anyone; 40
buttons that did nothing; five tabs no control could open; a decision record 22 decisions deep with
nothing built behind them. One question ("what does the live system read?") had hidden all of it.
The lesson: **an audit that checks one direction finds one kind of defect.**

## The model: producers, consumers, edges

Every artifact is a producer, a consumer, or both: a file, a route, a table, a function, a skill,
a workflow, a plan, a screen, an instruction. An **edge** is healthy only when the producer exists,
the consumer exists, the consumer really reads the producer at runtime, and what it reads is the
right thing. A broken edge is one of five classes:

| # | Class | Meaning | FABLE-5 tags |
|---|---|---|---|
| 1 | Producer with no consumer | made, never used | `[orphan]` `[documented-only]` `[test-only]` |
| 2 | Consumer with no producer | cites or calls something that is not there (dangling) | |
| 3 | Wrong producer | reads a stale, duplicate or non-canonical thing | `[stale-claim]` `[redundant]` `[doc-hallucination]` |
| 4 | Edge on paper only | decided, approved or planned, never built, deployed or switched on | `[half-deployed]` `[unbound]` `[not-deployed]` |
| 5 | Edge that lies | a status, count or label that does not reflect reality | `[lying]` `[live-hallucination]` `[theater]` `[hollow]` |

For every artifact name **who is supposed to consume it** (the Queen, Kai El, another agent, the
founder through the screen, a colony, an AI that boots in the repo, CI) and **where that intent is
written**. No stated reader is itself a finding.

## The five levels (report the highest actually reached, with evidence)

L1 DISK (exists, claims what it does) → L2 WIRED (reachable from a real runtime path) → L3 TESTED
(a test proves the behavior) → L4 DEPLOYED (in the production build, bound, configured) → L5
VERIFIED-LIVE (observed working in production with a citable run ID). Levels are not cumulative by
assumption: merged is not deployed, deployed is not anything ever ran it. Tags and definitions:
`docs/FABLE-5_SPEC.md`. Escalation tags override the rest: `[safety-signal]` (security, money, the
constitution, privacy, irreversible), `[systemic]` (same defect across many unrelated artifacts),
`[contradicts-prior]`, `[new-class]`, `[unclassified]`.

For knowledge a mind is supposed to have, also give the **absorption tier**: T0 exists, T1
reachable by the live system, T2 actually fetched at runtime, T3 changes a decision or answer, T4
verified live with the right content, T5 learned (written back), T6 lived (acted on unprompted).

## The loop (per artifact)

INTAKE (what is it, who is it for) → PREMISE-CHECK (what am I assuming) → PROBE (grep, read, trace)
→ COMPARE (evidence versus claim) → CLASSIFY (edge class, level, tag) → ESCALATE (severity, owner,
smallest fix).

Rules that earned their place:

1. **Probe before claim.** No finding without `path:line` you personally read. "Probably" with no
   line number is dropped or read.
2. **Compare against a working sibling.** When one path is wired and a similar one is not, the
   difference is the finding.
3. **Find the coupled latent bug.** One broken edge hides a second behind it.
4. **Mark each claim** `[verified]` (you read it), `[inferred]`, or `[cannot verify from here]`.
   Never fake a green, never inflate a red.
5. **A finding without a forward check is a note.** Each pattern names the mechanical check that
   would catch it next time (a grep, a CI test, a probe). Then build the check: this repo's
   `tests/unit/test_frontend_*.py` are exactly that.
6. **Trace what your own change newly depends on.** Fixing an edge moves load onto its neighbours.
   Locking a chat with a key kept in the browser made an unrelated file route (serving uploads from
   the same origin) dangerous; that was found by tracing the change, not by the audit.
7. **Drive it in a real browser, not just a test.** A click-through found two bugs unit tests could
   not see (a tab that crashed on open since the day it was written; a refused-key flag that never
   cleared).

## Traps that already fooled auditors here

- Non-breaking hyphens: `F‑001` with U+2011 does not match `grep "F-001"`. Search `F.001`.
- Worker route matching is `p === '/path'` after `/v11` plus `p.match(regex)`: grep both forms.
- URLs assembled at runtime hide from string search: check how a base URL is built.
- A file referenced in a doc is not a file read by code.
- Page sizes posing as totals (a list route returns 20 rows; the screen shows `.length` as a total).
- Large files: never `cat`; `grep -n` then `sed -n 'A,Bp'`, cut long lines.
- A shallow clone: never conclude "this never existed" from `git log`.
- A name that promises more than the code does (`tokenOk` was a speed bump, not a lock).

## Orchestration (how to run it at scale without burning the budget)

The first run used seven large agents at once and exhausted the founder's five-hour limit three
times. The rules that fixed it:

- **At most two agents at a time.** Reading-heavy scopes can run on a smaller model.
- **Each agent gets**: `agent-brief.md` (fill the placeholders), exactly one scope, a pinned
  read-only checkout (`git worktree add --detach <path> origin/main`, note the commit), and a
  report file path.
- **Save as you go**: the agent creates its report file within its first three tool calls and
  appends each finding the moment it is confirmed. It may be cut off at any time.
- **Read-only, absolutely**: no edits, no commits, no GitHub writes, no workflow dispatches, no
  scheduled tasks, no running tests or builds in the repo tree, no live probes it cannot make, no
  touching `soul.md`, `.queen/soul.md` or the constitution workflows. Credentials found are
  reported by file and line, never copied.
- **Each agent's final message is under 400 words**: report path, counts by severity, top five
  with `path:line`, safety signals, the one thing it could not verify.
- **Scopes do not overlap** (front end; the record versus reality; what reaches each prompt; the
  back end; the Worker internals; automation and federation; the AI harness). A scope wandering
  into another is the main source of duplicate findings.
- **Merge** the reports into one consolidated report: deduplicate, rank by severity then
  confidence, mark each finding with whether it needs a founder decision, and keep the smallest fix
  next to each.

## The report format (mandatory; `report-template.md` is the fill-in copy)

Sections: 1 scope covered and skipped; 2 findings table (ID, artifact `path:line`, supposed
consumer/producer and where that is written, what actually happens with evidence, level + tag,
severity, confidence, smallest fix and whether it needs a founder decision); 3 prior findings
re-checked (`CONFIRMED` / `FIXED-SINCE` / `WRONG` / `CANNOT-VERIFY`); 4 patterns with their forward
checks; 5 what could not be verified and exactly what would verify it; 6 top ten by severity.
Severity: **S1** safety, constitution, money, security, privacy; **S2** a mind or the founder is
blind to, or wrong about, something in the live path; **S3** dead, orphaned or misleading but not in
a live decision path; **S4** hygiene. IDs are prefixed with the agent's scope code (`W2-07`).
Quality bar: 20 well-evidenced findings beat 80 vague ones.

## Where the reports go (important)

A report that describes an open security weakness must NOT be committed to a public repository,
and `docs/` is served publicly by the Worker and by GitHub Pages. Keep raw reports in a private
place the founder chooses. What may go in the repo: the pattern names, the forward-check tests, and
fixes after they are merged. (Which private place is a standing question for the founder.)

## Truth levels for the audit itself

The audit is static unless a run ID says otherwise. This container cannot reach `*.workers.dev`;
nothing is `verified-live` from here. If the repo holds a citable probe, cite the run ID and say
how old it is.

## Related

`docs/FABLE-5_SPEC.md` (the levels), `fable-debugger` (one broken thing), `wired-or-not` (the
completion vocabulary), `devils-advocate-audit` (re-check past "done"), `skill-census` (which
skills are wired), `plan-reality-audit` (plans versus reality), `dual-lens` (the design gate).
Origin: the 2026-11 audit of THEHIVE (`HIVE_UPDATES`, issue 243 and the registers it fed).
