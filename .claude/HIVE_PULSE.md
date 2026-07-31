# HIVE_PULSE — read this first, every autonomous firing

One page, kept small on purpose (target: under ~1000 tokens). Every scheduled
Routine/heartbeat firing reads **this file first, in full — nothing else** — and only
opens a linked file below if this page says that specific thing changed since the last
firing. This is the token/context-economy mechanism described in
`.claude/skills/autonomous-hive-agent/SKILL.md`'s "circulatory system" section.

**Update this file at the end of every autonomous firing.** Stale-but-wrong is worse
than short — keep every line true. When a section grows past what's actually current,
compress it (like this pass did) rather than let it accumulate resolved history —
that's the discipline this file exists to model, not just describe.

---

## Right now (updated 2026-07-31, ~22:32 UTC)

- **Open PRs on THEHIVE, two:**
  - **#141** (this session's own, doc-only: HIVE_PULSE.md sync) — trivial, low risk.
  - **#140 — reviewed clean, opened by a DIFFERENT parallel session** (branch
    `claude/ecstatic-rubin-9zqjoc`, session `session_017RexigvxMvRGu2pjomPrvy`):
    Phase G/H/I federation snapshot + SSE wiring + constitution-hash CI guard. Checked
    for real, not just the diff: `mergeable_state: clean`, all 12 checks green, and its
    "extends existing infra, no rewrites" claim verified true by grepping `main`
    directly (`_sse_publish`/`_sse_subscribers` in `routes.py`, `scan_federation_repos`/
    `FEDERATION_ROOT` in `generate_memory_vault.py` both genuinely pre-existed this PR).
    No bugs found. One minor non-blocking note: the new `_federation.json` snapshot code
    re-walks `FEDERATION_ROOT` independently instead of reusing the existing
    `scan_federation_repos()` — duplication, not a bug. Ready for the founder's own
    merge call; this session does not merge another session's PR.
- **Autonomous arc: uncapped, nightly 2 AM PT.** `trig_013BTxUthvLX3C4nLs7MypVC` — no
  more "Session N/6" framing (removed 2026-07-31, backlog outgrew 6 sessions). Next
  fire `2026-08-01T09:00:00Z`. Maximize each firing's own window rather than cramming;
  read that trigger's own prompt (`list_triggers`) for the full current priority order.
- **PR-heartbeat: native hourly cron only** — `trig_01Dd9ysNpDiCcfVVEKzM54DX`
  (`58 * * * *`). Don't start a new `send_later` chain for the next PR; this cron
  already checks whatever this file lists as open.
- **Kai El bridge: live, verified real round trip** (issue #137, `hive_updates`/
  `hive_proposals` D1 tables, `.github/workflows/kai-el-bridge.yml`). Harness→Kai-El
  direction (`directive_text` dispatch) still genuinely untested. Calibration flag:
  first real `CONCERN` was vague/generic, fired on the small unbound-keys edge model —
  watch a few more via issue #137 before deciding the marker wording needs tightening.
- **`devils-advocate-audit` sweep:** 4 modules checked (`wallet.py` bug found+fixed;
  `staking.py`/`agency.py`/`colony.py` confirmed correct). Next target →
  `AUDIT_LEDGER.md`'s "Not yet audited" section, don't re-derive.
- **Coverage sweep next targets:** `utility_economy.py` (24%), `genome.py` (24%),
  `llm_router.py` (17%, the real `core/` one).
- **Dead-code sweep: done, logged in `AUDIT_LEDGER.md`** (2026-07-31 entry). Headline:
  12 orphaned `backend/guilds/*.py` modules + 2 more duplicate files (4 total now, not
  2) + `backend/mcp/` — all need a founder-confirmed batch-delete pass, not yet deleted.
  Bigger finding: 56 of frontend's "unreachable" files are a coherent second app
  (`pages/CommandCenter.tsx`, `HiveDashboard`, `ConstitutionHall`, etc.,
  self-identified as the "Mistral Frontend Command Center Branch") — the physical
  presence of `CLAUDE.md`'s already-flagged unreconciled second frontend effort.
  Founder decision needed: delete or revive.
- **Token economy:** `.claude/TOKEN_ECONOMY_LEDGER.md` — `caveman` measured at 65%
  (`/caveman-stats`); founder's 96% target not yet reached/fully measured. Two open
  macro questions there for founder input, not decided unilaterally.
- **`SPORE_ROSTER.md`:** 189 roles total (78 from CANVAS.md's speculative game-studio
  plan + 111 from `docs/ROLES.md`'s real, live federation role-tag convention). 3 new
  gaps found: no per-colony pulse-file equivalent, no cross-repo PR-review spore, no
  issue-triage automation.
- **Backlog, priority order:** (1) unified flip-the-switch checklist (both
  `FLIP_THE_SWITCHES.md` files); (2) production-readiness % / Queen's Progress meter
  UI; (3) Command Center button/tab audit + cohesion review; (4) Venture Planner +
  Legal-research overhaul. Also queued, no scope agreed yet: Kai El execution-access
  design (recommended shape: extend `hive_proposals`, never raw terminal access — see
  `Fable_memory.md` for the analysis).
- **Roadmap:** published artifact + in-app panel both read `frontend/src/data/roadmapData.ts`
  — update that file, not the two surfaces separately.
- **Rolling logs — check dates, don't assume stale:** `.claude/Fable_memory.md`,
  `.claude/skills/recursive-growth/LESSONS.md` + `SKILL_CHANGELOG.md`, `PR_LESSONS.md`
  (latest: L-09).

## Circulatory system — how heartbeats stay cheap

Native `cron_expression` Routines for anything truly recurring — never a
self-rescheduling `send_later` chain (that pattern silently stalled this arc once
already). Each firing: read this file first → do the work → update this file → stop.
Full design → `.claude/skills/autonomous-hive-agent/SKILL.md`.

## Kai El bridge — quick reference

Kai El's `/command_text` reply starting `CONCERN: <title>` or `PROPOSAL: <title>`
persists to `hive_updates`/`hive_proposals`; `kai-el-bridge.yml` mirrors both into
issue #137 every 2h. To send Kai El something: dispatch `kai-el-bridge.yml` with a
`directive_text` input (lands in Vectorize via `/v11/memory/remember`). Full design →
`.claude/skills/autonomous-hive-agent/SKILL.md`'s "Kai El bridge" section.

## Not yet built / open questions

See "Backlog, priority order" above — that list is current. Nothing else outstanding
beyond what's already named there.
