# AGENTS.md — rules for any AI working in THEHIVE

Read `CLAUDE.md` first. It is written for Claude Code, but it is the accurate, current map
of this repo and every fact in it applies to you too.

## Rule zero: the preamble gate (founder rule, 2026-11-10)

Before you edit a file, commit, push, open or update a PR, dispatch a workflow, create or
change any scheduled trigger or timer, or spawn another agent, tell the founder — in plain
language, for someone who is not reading the code:

1. **WHAT** you are about to do.
2. **WHY** — the problem, with evidence.
3. **HOW** — the steps, how each is checked, how to undo it.
4. **NECESSITY** — why now, what happens if it is not done, any smaller alternative.
5. **PROJECTED IMPROVEMENT** — what gets better and how that will be checked afterwards.
6. **COST & RISK** — tokens, money, what could break, whether it is reversible.

Read-only investigation (reading, grep, `git log`/`diff`, answering questions) is exempt.
Consequential work — governance or constitution files, security gates, money, secrets,
CI or triggers, rewriting history, running several agents — also **waits for the founder's
go-ahead**, and an approval covers only the steps it described. Never create or re-arm a
scheduled trigger, timer or recurring check on your own: that is spending.

Canonical text, scale rules, and how to verify the gate is wired:
`.claude/skills/preamble-gate/SKILL.md`.

## Rules that are never negotiable here

- **Never merge a PR.** The founder reviews and merges.
- **Never write a bare "done".** Name the level reached: compiles, tested, merged,
  deployed, or verified-live (`.claude/skills/wired-or-not/SKILL.md`).
- **The founder holds anything irreversible:** `soul.md` and the constitution, money,
  secrets, agent naming, and any overwrite of remote history.
- **This container cannot reach `*.workers.dev`.** Production is only observable through the
  `edge-health-probe` GitHub Actions workflow — never claim live state without a run ID.
