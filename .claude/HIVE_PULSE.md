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

## Right now (updated 2026-08-15 — read this section first)

- **This section was stale from 2026-08-08 to 2026-08-15** (7 days, 3 real firings —
  08-09/08-11/08-14 — none updated it despite the standing instruction at the top of this
  file). Nothing in it was actively wrong the way the 08-04→08-08 incident was, just
  behind: task 15 finished, tasks 19/21/22/24/25 done, tasks 16/17/20/23 corrected to
  `blocked`, PR #171 open covering all of it. Compressed and refreshed here rather than
  left to compound further — this is exactly the discipline this file's own opening asks
  for and the exact failure mode its own second bullet used to warn about.
- **The "2 AM automation" is two different triggers, and only one of them ever fired at
  2 AM** (resolved 2026-08-08, still true): the deleted `trig_013BTxUthvLX3C4nLs7MypVC`
  fired `09:00Z` = 2 AM PT; its replacement `trig_01CJsVYwDs4pHMoFEC5JFi7V` fires
  `0 4 * * *` UTC = 9 PM PT, not 2 AM. Do not "fix" the 9 PM cron to 2 AM without the
  founder saying that is what they want.
- **`trig_01CJsVYwDs4pHMoFEC5JFi7V`'s live state is STILL `unverified`.** `list_triggers`
  approval has never been granted across at least 5 separate asks now (2026-08-07,
  2026-08-08 ×2, and implicitly skipped in the 08-09/08-11/08-14/08-15 firings since none
  re-requested it). Per `wired-or-not`, the honest level stays `unverified`, not "wired".
  This firing did not re-ask either — flagging that skip explicitly rather than silently
  repeating it forever. Never call `fire_trigger`.
- **Open PRs: #171 only**, on this branch, covering the 08-11 and 08-14 firings (task
  15/19/21/22/23/24/25 work). Unmerged, per the standing never-self-merge rule.
- **Task 46 (branch-deploy reliability) has a live, unresolved recurrence (2026-08-15):**
  the work-cycle round-robin fix (759775b, merged 08-11) worked for a real, confirmed
  window (08-13→08-14) and then got stuck on Ma'at again for 8+ hours straight as of
  08-15, with no code-side regression found — the fixed logic tests correct in isolation
  against the real production title string. Full investigation in `CAMPAIGN.html` task 46.
  This is now the second time this task has caught a real gap between what `origin/main`
  says and what production actually does. Still blocked on the founder checking the
  Cloudflare Workers Builds dashboard directly — nothing in this repo can resolve it.
- **The 2026-08-01 incident — kept, because it is why the rule exists.** Every recurring
  Routine then — the hourly PR-heartbeat cron AND the nightly 2 AM arc AND an earlier
  `send_later` chain — used `persist_session:true` pointed at one long-lived session, so
  24+ resumes/day snowballed ONE conversation's context instead of firing clean; a literal
  6+-firing identical-message chain from 2026-07-31 compounded it, and it cost real money.
  Founder's design brief from that day still stands: fresh session per firing, never this
  one; `subscribe_pr_activity` (event-driven, zero-cost when idle) instead of polling; each
  unit of background work in its own file/directory with its own prompt and a README
  stating what's next and what "done right" means, so the trigger's stored prompt stays
  tiny — "go there, do it, update it, stop". **Still do not create any NEW Routine without
  the founder's approval.** (That rule is about creating new ones; it never meant "assume
  none exist" — which is exactly how this section went stale.)
- **Task 51 is DECIDED (2026-08-08) — the token ceiling now counts real input + output
  only.** It had stopped two consecutive firings before either did any work; three
  measurements agree that ~90-96% of what it used to count was cache creation, which
  scales with how long this persistent conversation has grown rather than with how much
  work a firing does. `session-usage.sh` changed accordingly; cache creation is still
  reported, labelled, and deliberately non-summable. A firing's ceiling check is
  meaningful again — run it, don't skip it.
- **Dead-code 19-question round: answered by founder 2026-08-01, mostly executed.**
  Deleted for real (verified zero-importer, full suite re-run, 375 passed):
  `arena_guild.py`, `constitutional_guild.py`, `dream_guild.py`, `frequency_guild.py`,
  `security_guild.py`, root-level `backend/llm_router.py` orphan, `backend/utils/
  rate_limiter.py` orphan (ported into `middleware.py`'s live limiter as asyncio).
  `treasury_guild.py` trimmed (ledger half removed, revenue-split idea kept per founder
  — "real plan, discuss later"). **Correction to the prior audit**: `workflow_guild.py`
  was wrongly filed as "safe to delete" — re-check found it's genuinely unfinished
  scaffolding (hardcoded placeholder IPFS hash), not superseded anywhere; moved to the
  "still on roadmap" bucket instead, not deleted. Full detail →
  `AUDIT_LEDGER.md`'s 2026-08-01 entry. **Not yet done**: second-frontend skip-bucket
  deletion (an `Explore` pass is re-verifying the exact file list; `TesseractChamber` is
  explicitly held out — founder says it's essential to 4DBRAIN's real work and wants to
  review it together before any decision, not delete), `sentry.ts` wiring, shared
  `components/common` library, `services/github.ts` UI trigger, `stores/uiStore.ts`
  adoption, `hive_proposals` extension for Kai El execution access, cross-session
  token-tracking infra, SPORE_ROSTER's 3 new gaps — all founder-approved, still queued,
  not started. Backlog order unchanged (founder confirmed, Q15): (2) production-readiness
  %% meter next, then (3) Command Center audit, (4) Venture Planner overhaul.
- **Second-frontend skip bucket: DELETED for real 2026-08-01** (51 files, PR #144) —
  fake colony consoles, invented data files, the dead HiveDashboard shell built on them,
  buggy hooks, dead page/router shell. Verified zero-importer via a fresh `Explore` pass
  before deletion (full method + file list in `AUDIT_LEDGER.md`'s 2026-08-01 entry).
  `TesseractChamber/` excluded and confirmed to survive as a clean standalone orphan
  (its only importer was the now-deleted `HiveDashboard.tsx`) — held for joint founder
  review, not touched. `MissionCard.tsx`/`MissionTimeline.tsx` also excluded — they call
  the real API, just unwired; that's a separate founder decision, not skip-bucket trash.
  **Found along the way, unrelated to this change:** `npm run build` is currently broken
  on pre-existing `src/worlds/`/`src/xp/` TypeScript errors — confirmed via `git stash`
  that the exact same errors exist with or without this PR's diff. Not fixed here, not
  caused here — flagging so a future firing doesn't waste time re-diagnosing it as new.
- **Real correction delivered to the founder 2026-08-01**: the Worker's API rate limiter
  (30/min/IP, `backend/api/middleware.py`) is unrelated to Claude Code session/token
  cost — a real $40-in-7-minutes incident was the Routine snowball above, not this file.
  Don't let a future firing re-conflate the two.
- **Grok bridge activation (L2):** founder said "not sure yet" — tracked as **undecided**,
  not open, not dropped. Don't nag about it; don't drop it either.
- **~~Autonomous arc: uncapped, nightly 2 AM PT~~ — DELETED 2026-08-01.**
  `trig_013BTxUthvLX3C4nLs7MypVC` fired at `09:00Z` = 2 AM PT. This is the trigger the
  founder remembers as "the 2 AM automation"; it no longer exists. Struck through rather
  than removed, because its identity is what resolves the 2 AM/9 PM confusion above.
- **~~PR-heartbeat: native hourly cron~~ — DELETED 2026-08-01.**
  `trig_01Dd9ysNpDiCcfVVEKzM54DX` (`58 * * * *`). Replaced in principle by
  `subscribe_pr_activity` (event-driven, zero-cost when idle) per the founder's own design
  brief — but note that is a *principle*, not a running subscription: nothing is currently
  watching any PR. Do not start a `send_later` chain to substitute for it.
- **Scheduled GitHub workflows — nine, and these DO run** (unlike the Routines above;
  inventoried 2026-08-08, none at 2 AM PT / `09:00Z`): `colony-health.yml` `0 6 * * *` ·
  `d1-backup.yml` `0 3 * * 0` · `edge-health-probe.yml` `17 */6 * * *` ·
  `federation-issue-triage.yml` `41 */3 * * *` · `federation-pr-review.yml` `23 */6 * * *` ·
  `kai-el-bridge.yml` `11 */2 * * *` · `roadmap-digest.yml` `25 */6 * * *` ·
  `task-digest.yml` `5 */4 * * *` · `ui-live-probe.yml` `37 */6 * * *`.
  `edge-health-probe.yml` remains the hive's only real eyes on production.
- **Kai El bridge: live, verified real round trip** (issue #137, `hive_updates`/
  `hive_proposals` D1 tables, `.github/workflows/kai-el-bridge.yml`). Harness→Kai-El
  direction (`directive_text` dispatch) still genuinely untested. Calibration flag:
  now 3+ real `CONCERN`s observed (latest two: `hive_updates` id 745 "The Discorda...",
  id-746-adjacent "The Qapun's Lament" — both fired 2026-08-01, both still
  vague/generic, still on the small unbound-keys edge model) — pattern holding, not
  yet enough to unilaterally decide the marker wording needs tightening, still a
  founder-input item.
- **`devils-advocate-audit` sweep:** 4 modules checked (`wallet.py` bug found+fixed;
  `staking.py`/`agency.py`/`colony.py` confirmed correct). Next target →
  `AUDIT_LEDGER.md`'s "Not yet audited" section, don't re-derive.
- **Coverage sweep next targets:** `utility_economy.py` (24%), `genome.py` (24%),
  `llm_router.py` (17%, the real `core/` one).
- **Token economy:** `.claude/TOKEN_ECONOMY_LEDGER.md` — `caveman` measured at 65%
  (`/caveman-stats`); founder's 96% target not yet reached/fully measured. Two open
  macro questions there for founder input, not decided unilaterally.
- **`SPORE_ROSTER.md`:** 189 roles total (78 from CANVAS.md's speculative game-studio
  plan + 111 from `docs/ROLES.md`'s real, live federation role-tag convention). 3 new
  gaps found: no per-colony pulse-file equivalent, no cross-repo PR-review spore, no
  issue-triage automation.
- **Backlog: (1) DONE — `SWITCHBOARD.md` built** (2026-08-01, autonomous arc firing).
  Unifies both `FLIP_THE_SWITCHES.md` files into one live-probed table, doesn't
  duplicate either source's mechanical instructions. Fresh probe at build time:
  only switch #5 (KV rate-limit) is flipped; everything else (Vectorize, R2, extra
  LLM keys, founder key, Queues, both automaton switches) still off, `secrets_present:
  []` confirms zero secrets bound at all. **Remaining priority order:** (2)
  production-readiness % / Queen's Progress meter UI; (3) Command Center button/tab
  audit + cohesion review; (4) Venture Planner + Legal-research overhaul. Also queued,
  no scope agreed yet: Kai El execution-access design (recommended shape: extend
  `hive_proposals`, never raw terminal access — see `Fable_memory.md` for the analysis).
- **19 numbered questions sent to the founder 2026-07-31, awaiting answers** — covers
  every dead-code/second-frontend disposition item above, the backlog order, Kai El
  execution access, and the two token-economy open questions. Do NOT re-ask, re-decide,
  or act unilaterally on any of these until an actual answer arrives. Full list was
  sent directly in chat, not written to a file — check this session's own recent
  messages for the exact numbered list if picking this up cold.
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

## Never write a bare "done" (2026-08-07, founder-ordered audit)

A reality audit measured it: **34 of 36 `done` tasks had never been confirmed against
production**, and **11 of 13 tasks that promised "verification owed post-merge" never got
it (84%)** — because the caveat lived in a session's context and died with it, while
`data-status="done"` survived as a binary.

So: every completion claim names its level — `compiles` → `tested` → `merged` → `deployed`
→ `verified-live` — and the levels are **not** cumulative by assumption. A `verified-live`
claim needs a reference someone can check without trusting you (run ID / SHA / committed
test path); `scripts/check-claims.py` fails CI otherwise. A `done` inherited from before
this date carries **no** level — treat it as `unverified` until re-derived.

Full reasoning → `.claude/skills/wired-or-not/SKILL.md`. Findings →
`Project_file/Founders Visonary Folder/VISION/2026-08-07-vision-reality-audit-007.md`.

**Proven live 2026-08-07** (edge-health-probe run `31216919290`): the work cycle really
does fire the real cron against the real D1 — 17 `agent-work` rows, exactly hourly, 7
agents rotating, ~900 tokens/turn. `edge-health-probe.yml` now asserts this every run.

## The loop — five triggers, nothing auto-loads (updated 2026-08-08)

Pointer only, deliberately: the full skills load **on trigger**, not at session start. (This
line previously said "because task 51's token ceiling is still unresolved" — **task 51 was
decided 2026-08-08**, count-real-work-only; the pointer-only discipline stays regardless, on
its own merits, not because of an unresolved ceiling.)

| When | Run |
|---|---|
| Founder sends new info **mid-work** | `founder-input-intake` — triage INVALIDATES / CHANGES / CONFIRMS / EXTENDS *before* the next action, write the result into the plan. Then `founder-directive-capture` for the verbatim archive. |
| An **architectural decision** is on the table | `dual-lens` — devils-advocate **then** childlike-wonder. One lens = `single-lens, incomplete`. When the subject is source material (a document, external research) rather than the hive's own design, `dual-lens` runs `fabrication-mining` as a conditional third stage on whatever Stage 1 found false. |
| A claim was just judged **false or fabricated** | `fabrication-mining` — don't just discard it; ask what it was reaching for. Five verdicts, including the load-bearing null result `NO-SIGNAL`. Never for confirmed security threats — those go to `anomaly-triage` tier 3. |
| **Batching** several tasks | `hive-conductor` Phase 0.6 — amplify in phase, cancel out of phase. Sequence the out-of-phase. |
| About to say something **works** | `wired-or-not` — name the level, bring evidence. |

`memory/philosophy/` holds the doctrine: `dual-lens-framework.md` (both lenses
non-negotiable), `childlike-wonder.md`, `devils-advocate.md`, `resonance-interference.md`
(the founder's amplify/cancel framing). `hive-conductor` is the top orchestrator — **nothing
sits above it**, on purpose.

## Kai El bridge — quick reference

Kai El's `/command_text` reply starting `CONCERN: <title>` or `PROPOSAL: <title>`
persists to `hive_updates`/`hive_proposals`; `kai-el-bridge.yml` mirrors both into
issue #137 every 2h. To send Kai El something: dispatch `kai-el-bridge.yml` with a
`directive_text` input (lands in Vectorize via `/v11/memory/remember`). Full design →
`.claude/skills/autonomous-hive-agent/SKILL.md`'s "Kai El bridge" section.

## Not yet built / open questions

See "Backlog, priority order" above — that list is current. Nothing else outstanding
beyond what's already named there.
