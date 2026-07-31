---
name: autonomous-hive-agent
description: >
  The organism-level coordinating skill that names how THEHIVE's existing autonomy
  pieces work together as one body, plus the scheduling backbone (native cron Routines
  + a single compact pulse file) that makes frequent, cheap, always-on background work
  possible without every firing re-reading the whole repo. Use when reasoning about "the
  hive's autonomous operation" as a whole, when setting up or auditing any new scheduled
  Routine, or when asked to make the hive feel continuously present/self-directed without
  ballooning token cost (the founder's own framing: "Jarvis feel," "unlimited work" via
  reduced per-firing cost, not via running more expensive sessions more often).
---

# autonomous-hive-agent

Not a new engine — a map of organs THEHIVE already has, plus the one missing piece
(a cheap, reliable heartbeat) that makes them act as a single continuously-present
organism instead of a pile of separately-invoked skills.

## The organism

- **Head — `devils-advocate-audit`.** Decides what deserves suspicion among things
  already marked "done"; drives the reproduce-and-verify loop.
- **Arms — `hive-conductor` + `agent-harness`.** Domain routing, the governance gate
  (F-001–F-006 before close), and the compile→execute→verify→escalate loop that actually
  does bounded work per domain.
- **Legs — `skill-creator`, gated.** Any autonomously-drafted skill walks through
  `MANDATE_TRIAGE.md`'s devil's-advocate-first review and ships as a normal PR before
  it's "real" — same authority rules as any other production change. A drafted skill is
  a proposal, not a fact, until that gate clears.
- **Pineal gland — `workflow-optimizer` + `recursive-growth`.** The compounding-efficiency
  organ: don't re-derive what a prior firing already worked out, log the lesson once,
  measure whether repetition actually got cheaper (not just assert it did).
- **Heart — `polymath-lens`.** Cross-domain synthesis, applied only to final
  deliverables — the one organ that adds anything at all to output, deliberately scoped
  narrow so it never taxes ordinary work.
- **Circulatory system — scheduling.** See below. This is the part that was actually
  missing, and the direct answer to "how does this feel continuously present without
  costing continuously more."

## Circulatory system — the actual "Jarvis feel" mechanism

The founder's ask was specific: reduce token/context cost enough that background hive
work *feels* unlimited, by using and expanding the scheduling system already built
(`create_trigger`/`update_trigger`/`list_triggers`/`send_later`). Two real, separate
levers, not one — conflating them is the mistake to avoid:

**Lever 1 — make each heartbeat cheap, not just frequent.** Auditing this system while
building this skill (2026-07-31) found the literal thing the founder was worried about:
the PR-check-in heartbeat had been implemented as a chain of `send_later` one-shots,
each firing responsible for creating the *next* one-shot before it ended — 13 of them
accumulated across one day. This is the exact same fragile shape that silently stalled
the 6-session coverage arc after Session 1 (the end-of-firing reschedule call was simply
never made, and nothing forced it to happen). **Fixed**: replaced with one native
`cron_expression` Routine (`trig_01Dd9ysNpDiCcfVVEKzM54DX`, hourly) — the platform
re-fires it forever with no reschedule call to forget. Any future recurring job in this
hive should default to `cron_expression`, not a self-rescheduling `send_later` chain;
reserve `send_later`/`run_once_at` for genuinely one-off future actions (which is what
it's for) or for a fixed-count arc with a real stop condition (the 6-session arc, which
has an explicit end and self-deletes — a legitimate, different use case from an
open-ended heartbeat).

**Lever 2 — make each heartbeat read less, not just run less code.** A cron firing that
still re-reads `CLAUDE.md`, `Fable_memory.md`, `AUDIT_LEDGER.md`, and the full PR history
every hour has *not* gotten cheaper, only more frequent. `.claude/HIVE_PULSE.md` is the
fix: one page, read first and in full, that tells a firing what's still true and which
full files are worth opening — most hourly firings should need zero additional reads
beyond the pulse page itself. Every autonomous firing (cron or arc) must update this
page before ending, or the next firing pays the cost this page exists to avoid.

**Combined effect:** a heartbeat that costs a small, roughly-constant amount per fire,
firing on a schedule the platform maintains without help, is what produces the
"continuously present, doesn't feel expensive" experience the founder described — not
running more sessions, and not making sessions individually larger. If a future ask
implies *more* frequent ticks (sub-hourly), evaluate lever 1+2 hold at that cadence
before creating the trigger — cost scales with tick frequency even when each tick is
cheap, so cadence is still a real tradeoff to name, not a free dial.

**What this explicitly does not do:** it does not create a second, competing heartbeat
for the same job (one PR gets one recurring check, not two), and it does not silently
expand scope beyond what's asked — new cron Routines are reversible (`delete_trigger`
is one call) but still a standing resource commitment, named plainly to the founder when
created, same as any other durable decision.

## Kai El bridge — the organism gets a second voice

Built 2026-07-31, same request that named the organism: "put Kai El to work as the
architect he is" — Kai El (the live `/command_text` chat persona in `worker/src/index.js`,
System B, the thing the founder actually talks to in the Command Center) had no way to
durably reach the founder beyond one stateless reply, and no way for this harness to hand
it anything either. Built on infrastructure that already existed rather than inventing new
tables:

- **Kai El → founder, through the harness.** Kai El's own system prompt (unchanged
  otherwise) now permits — rarely, only when genuinely warranted — starting a reply's
  first line with `CONCERN: <title>` or `PROPOSAL: <title>`. The worker code detects that
  marker and persists it: `CONCERN` → `hive_updates` (kind=`concern`, the table's own
  header comment already calls it the "hive → founder update channel" — nothing before
  this wrote to it from chat, only from heartbeat/status code); `PROPOSAL` →
  `hive_proposals` (kind=`architect-proposal`, the existing hive-suggests/founder-decides
  table, `POST /proposals/:id/decide` already founder-key-gated — Kai El proposing
  architecture and the founder deciding is exactly what this table was built for, just
  never fed from the chat persona before). The reply shown to the founder is unchanged
  either way — the marker is a durable side-effect, not a UI change.
- **The relay.** This container cannot reach `*.workers.dev` (same constraint
  `edge-health-probe.yml` exists for) — so `.github/workflows/kai-el-bridge.yml` (a
  GitHub-hosted runner, which can reach production) polls `hive_updates`/`hive_proposals`
  every 2 hours and mirrors the current concern/pending-proposal list into one fixed,
  fully-overwritten-each-run GitHub issue ("Kai El — Concerns & Architect Proposals
  Queue"). An autonomous firing reads that issue via the GitHub MCP tools it already has
  — no new production reach needed on this side either.
- **Harness → Kai El.** The same workflow accepts a `workflow_dispatch` input
  (`directive_text`) that POSTs straight to the already-public `POST /v11/memory/remember`
  endpoint, tagged `kind=architect-directive` — Vectorize's `recall()` (already called by
  `/command_text` on every turn) surfaces it the next time it's semantically relevant.
  This is genuinely how "you being able to send certain messages to Kai El" works: not a
  new channel, the existing memory-recall path, fed deliberately instead of only from
  chat exhaust.
- **Honest status:** shipped, syntax-checked, not yet exercised against live production
  by this session (can't reach it directly) — first real confirmation is
  `kai-el-bridge.yml`'s own next scheduled run or a manual `workflow_dispatch`. Say so
  plainly until then; this is exactly the discipline `devils-advocate-audit` exists to
  enforce, applied to this skill's own newest work rather than only to older code.

## Where this leaves the caveman question

Always-on caveman (terse day-to-day replies) and `polymath-lens` (verbose only at
deliverable-close) are two ends of the same economy: minimize tokens on every ordinary
turn, spend a little more only where synthesis is genuinely worth reading. See
`CLAUDE.md`'s standing-style note for the always-on caveman default; see
`polymath-lens/SKILL.md` for its narrow trigger.

## What this is not

Not a new execution engine, not a replacement for any of the six named skills, not a
license to spin up scheduling infrastructure beyond what's asked. Its only job is
naming how the existing organs compose, and owning the one structural fix (cron over
self-rescheduling one-shots, plus the pulse file) that the founder's question surfaced
as genuinely missing.

## Origin

Built 2026-07-31 at the founder's direct request — framed as head/arms/legs/pineal
gland/heart, with an explicit follow-up asking how the hive's existing scheduling could
be expanded to feel continuously present ("Jarvis feel") without ballooning cost. The
send_later chain-of-one-shots pattern (found while answering that follow-up) is the same
failure class as the 6-session arc's earlier silent stall — both are now on record as
one lesson, not two: **anything meant to recur should recur natively, not via a chain of
firings each trusting the last one to reschedule it.**
