# 2026-07-19 — Session harvest: agent-harness wired as the standing build loop (PR #126)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(commit `76425d4`, pushed onto the still-open PR #126). Set up the founder-requested
build→verify→checkpoint→continue loop as a real, invocable mechanism, using the `agent-harness`
skill already available in this environment — and proved it end-to-end on a real fix rather
than declaring it done unverified.

## Did

- Generated and committed `.claude/skills/agent-harness/assets/harnesses/thehive.json` by
  scanning `.claude/skills/` (66 real skills). This is THEHIVE's own domain manifest — the
  "what tools/skills exist" layer the harness's goal compiler matches against.
- Answered the skill's five forcing questions concretely for THEHIVE (DONE criteria =
  `npm run build:app` / `node --check` / targeted `tsc`; no-touch = `soul.md`, `.queen/`,
  secrets, any Tier-3 action; escalation reviewer = the founder, no fixed SLA, blocks by
  design; budget = the skill's own default, unraised).
- **Proved it, not just configured it**: compiled a real goal ("fix the stale TypeScript
  errors in `frontend/src/xp/system.ts` using the fable-debugger method"), ran it through
  init→next→execute→verify→close, and in the process root-caused and fixed 4 genuine
  pre-existing bugs in that file (`Array.prototype.findLast` needing `es2023` lib, an unused
  import, a return-shape mismatch) — verified against real `tsc` output (4 errors before, 0
  after), recorded as evidence rather than asserted. Separately confirmed the negative path:
  calling `close` on a fresh, unverified state returned `CLOSE-REFUSED` with exit 4, naming
  the blocking task — the refusal is real machinery, not documentation claiming it exists.
- `.gitignore`: added `.agent-harness/` (per-run state, not durable — the manifest is the
  durable, committed artifact).
- Wrote up the standing workflow in `HIVE_UPDATES/2026-07-19-agent-harness-standing-build-
  loop-017.md` so a future session can run this without re-deriving the setup.

## Learned

- **The goal compiler is a keyword/skill matcher, not a semantic planner** — an important,
  honest finding surfaced by testing rather than assuming. A generically-phrased goal ("fix
  this TypeScript bug") matched irrelevant skills (`pr-retrospective`, `design-system`) at
  low scores, because THEHIVE's skill library is mostly prose/discipline skills (how to
  debug, how to review, how to harvest), not atomic code-editing tools. Rephrasing the goal
  around one of this repo's actual named skills (`fable-debugger`) immediately produced a
  clean, high-confidence match. This is now documented so future invocations don't get poor
  matches by phrasing goals generically.
- **"Manual-evidence" tasks are a real, first-class category, not a fallback failure** — most
  of THEHIVE's skills don't have wired scripts (they're methodology docs), so most real tasks
  in this domain will require `record --phase verify --evidence "..."` with a genuine,
  specific observation rather than the fully-automated `verify` subcommand. The skill's own
  verification ladder treats this as legitimate (rank 3 of 4), as long as the evidence is a
  real, checkable observation and not an assertion — which is exactly the same discipline
  `fable-debugger` already demands of this session's own work.
- **Proving a setup and configuring a setup are different deliverables.** The instinct to
  stop after wiring the manifest and writing docs would have left an unverified claim
  ("this works") sitting in the repo — the same category of failure this hive's own honesty
  discipline exists to catch. Running one real, small, verifiable goal through the entire
  state machine (including the deliberate negative-path check) is what makes "set it up" a
  true statement rather than a plausible-sounding one.

## Needs

- The founder's own first real goal to run through this loop — everything so far is either
  the setup itself or a self-contained proof, not a task the founder asked for directly.
- If useful beyond THEHIVE, per-colony manifests for the other 6 colonies are a real, separate
  follow-up — not built here.
- PR #126 still open, now seven commits, retitled/re-described to reflect full scope.
