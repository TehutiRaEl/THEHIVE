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

## Right now (updated 2026-07-31, ~22:47 UTC, daily heartbeat)

- **Open PRs: none.** #140 (parallel session's Phase G/H/I, reviewed clean) and #141
  (this session's own pulse sync) both merged to `main` (`d4c69ea`, `4854470`). Session
  branch reset to fresh `main`.
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

## Multi-session reality (confirmed 2026-07-31, founder shared two backup documents)

THEHIVE has **multiple concurrent Claude Code sessions** committing to `main` the same
day, not just this one — confirmed via that parallel session's own full backup
(session `session_017RexigvxMvRGu2pjomPrvy`, branch `claude/ecstatic-rubin-9zqjoc`,
the same session behind PR #140, reviewed clean above). That session documented its own
**build-alongside rules**, worth this session adopting too:

1. **Use `[ROLE: <Title>]` commit-message prefixes** — the titles from `docs/ROLES.md`
   (e.g. `[ROLE: Governance Kernel]`, `[ROLE: Federation Engineer]`). This session has
   NOT been doing this — start now, going forward.
2. Base new work on `origin/main`, never a dangling branch (already this session's
   practice via the merged-PR branch-reset rule).
3. **Never rewrite a file another session owns — extend only, append not overwrite.**
   Directly consistent with `autonomous-hive-agent/SKILL.md`'s own restraint.
4. `colony.json` is the shared discovery contract — read it, never duplicate its data
   into separate config.

**Genuinely new open items from their backup, not yet in this session's backlog:**
NAR2's `requirements-deploy.txt` (Render free-tier OOM risk from torch/sentence-transformers,
still unguarded); Kimi-K2 needs a `render.yaml` blueprint (NAR2/4DBRAIN already have one).
Neither started by this session.

**One stale item in their list, corrected here so it doesn't get redone:** they flagged
"FABLE_DNA.md Chromosome I alignment" as still open — it isn't; `CLAUDE.md`'s own
changelog confirms this was reconciled 2026-07-30, three real drifts found and fixed,
full test suite reverified. Their backup pre-dates that fix's own documentation reaching
them, evidently — corrected here, not re-done.

Older backup (a founder-shared `.md`, session `b6c97b71...`, ~2026-07-14, PR #82 "Phase E
hardening" — D1-backed visitor tokens, rate-limit gates on arena POST routes,
`/admin/d1-export` + weekly `d1-backup.yml`) is now historical — treated as archive, not
an active task list; that PR's own P0 register items (L1/L3/L4 done, L2/L5 founder-side)
predate months of subsequent work already covered elsewhere in this file. Two of its
listed gaps are still real today, confirmed via this session's own live probe earlier:
Vectorize (`vectorize_bound:false`) and R2/Files (`FILES:false`) remain unprovisioned —
both are `FLIP_THE_SWITCHES.md` items #1/#2, unchanged, founder-action-gated.

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
