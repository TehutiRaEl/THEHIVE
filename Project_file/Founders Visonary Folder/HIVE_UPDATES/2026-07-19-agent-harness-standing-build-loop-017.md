# 2026-07-19 — The standing build loop: agent-harness wired to THEHIVE (PR pending)

**Summary:** Set up the founder-requested loop — build a phase, verify it for real, stop and
show the founder what changed, wait for a go-ahead, continue — as a real, invocable mechanism
rather than just "however Claude happens to work this session." Uses the `agent-harness`
skill already available in this environment. Proven end-to-end on a real, small, verified
fix before being called done, not just configured and asserted.

## What this actually is

Three files, all machine-readable JSON, all documented in
`.claude/skills/agent-harness/SKILL.md`:

1. **A committed manifest** — `.claude/skills/agent-harness/assets/harnesses/thehive.json`.
   Scans `.claude/skills/` (66 skills: `fable-debugger`, `threat-sandbox`,
   `pocket-dimensions`, `research-to-dna`, `session-harvest`, `merge-readiness`,
   `anomaly-triage`, `nine-miss-truths`, `skill-census`, `founder-directive-capture`, etc.)
   and lists what each skill offers as a tool. Regenerate after adding/changing skills:
   ```
   python3 .claude/skills/agent-harness/scripts/harness_manifest_builder.py \
     --domain .claude/skills --repo-root . --out-dir .claude/skills/agent-harness/assets/harnesses \
     --no-timestamp
   mv .claude/skills/agent-harness/assets/harnesses/.claude-skills.json \
      .claude/skills/agent-harness/assets/harnesses/thehive.json
   ```
2. **A per-goal plan** — compiled fresh each time from a goal statement + the manifest.
3. **A per-run state file** — lives in `.agent-harness/` (gitignored on purpose — this is
   working state for one goal, not durable history; the durable record of what happened is
   this HIVE_UPDATES file plus the normal git/PR trail).

## How to actually run it

```bash
cd .claude/skills/agent-harness

# 1. Compile a goal into tasks
python3 scripts/goal_compiler.py --goal "<goal text>" \
  --manifest assets/harnesses/thehive.json --out /tmp/plan.json

# 2. Start the loop
python3 scripts/loop_controller.py init --plan /tmp/plan.json --state ../../../.agent-harness/state.json

# 3. Drive it — repeat until the directive says "close" or "escalate"
python3 scripts/loop_controller.py next --state ../../../.agent-harness/state.json
#   -> {"action":"execute", "task":"T1", ...}: do the real work using that task's skill
python3 scripts/loop_controller.py record --state ../../../.agent-harness/state.json \
  --task T1 --phase execute --exit-code 0
python3 scripts/loop_controller.py verify --state ../../../.agent-harness/state.json --task T1 --cwd ../../..
#   (or, for a skill with no wired script — most of THEHIVE's skills are prose/discipline,
#   not scripts — record the verify phase directly with real, specific evidence:)
python3 scripts/loop_controller.py record --state ../../../.agent-harness/state.json \
  --task T1 --phase verify --exit-code 0 --evidence "<the actual command you ran and its actual output, not an assertion>"

# 4. Close — refuses (exit 4) while any task is unverified and unwaived
python3 scripts/loop_controller.py close --state ../../../.agent-harness/state.json
```

## The forcing questions, answered for THEHIVE specifically

1. **What single observable outcome means DONE?** — Whichever of this repo's real gates
   applies to the task: `npm run build:app` (the actual deploy build) for anything touching
   `frontend/`, `node --check worker/src/index.js` for anything touching the Worker,
   `tsc --noEmit -p tsconfig.json` output for a specific file when the task is narrower than
   a full build. A task with no such check is honestly marked `manual-evidence` by the
   compiler — it still requires a real, specific observation, never an assertion of "done."
2. **Which domain harness applies?** — `thehive.json` (above). One domain for now; the
   founder's other colonies (NAR2, 4DBRAIN, etc.) would each get their own manifest if this
   proves out and extends there.
3. **What must NOT change** — `soul.md` (the canonical Constitution — amendments go through
   the founder/guild-vote process in `soul.md` itself, never a code task), anything under
   `.queen/`, any Worker secret, and — the load-bearing one — **no task in this loop may ever
   merge its own PR or take a Tier-3 action from `PERMISSIONS.md`** (creating real accounts,
   spending real money, deploying a live storefront, etc.). The loop can build, verify, and
   open a PR; a human merges it, same as every PR this whole session.
4. **Who reviews escalations, and how fast?** — The founder, via the same conversation this
   whole session has used. No fixed SLA; an escalation blocks the loop until answered, by
   design (per the founder's own "never remove the human in the loop" instruction).
5. **Iteration budget** — the skill's own default: 12 loop iterations, 3 attempts per task.
   Not raised — no real experience yet to justify a different number.

## Proof it actually works (not just configured)

Ran a real, small, verifiable goal through the full loop before calling this "set up":
*"Debug and fix the stale TypeScript errors in `frontend/src/xp/system.ts` using the
fable-debugger method... verify against the real tsc compiler output, never fake a green."*
- Compiled: matched `fable-debugger` (score 14) as the top skill — confirms goals phrased
  around THEHIVE's own named skills match well; a generic "fix this bug" phrasing matched
  poorly (irrelevant skills like `pr-retrospective`, `design-system`) since the compiler is a
  keyword/skill matcher, not a semantic planner. **Lesson for future use: phrase goals around
  one of this repo's actual named skills/methods, not generic task language.**
- Executed: root-caused and fixed 4 real TS errors in that one file (`findLast` needing
  `es2023` lib, an unused import, a return-shape mismatch) — all real, pre-existing bugs, not
  fabricated for the demo.
- Verified: `tsc --noEmit -p tsconfig.json` showed 4 error lines for that file before, 0
  after — recorded as the evidence, not asserted.
- Confirmed the negative path too: running `close` on a fresh, unverified state returned
  `CLOSE-REFUSED`, exit 4, naming the blocking task — the refusal is real, not decorative.
- Confirmed `npm run build:app` (the real deploy build) still passes after the fix.

## Needs

- The founder's own first real goal to run through this, whenever ready — the demo above was
  a self-contained proof, not itself a task the founder asked for.
- If it proves useful beyond THEHIVE, manifests for the other 6 colonies are the natural next
  step — not built here, since that's real, separate work per colony.
