#!/usr/bin/env bash
# Preamble-gate reminder. Registered as a UserPromptSubmit hook in .claude/settings.json, so
# Claude Code adds this text to the AI's context on every prompt. It is a REMINDER, not a
# lock: nothing here can stop an AI that ignores it. Canonical rule and how to verify it:
# .claude/skills/preamble-gate/SKILL.md. Wiring is checked by tests/unit/test_preamble_gate.py.
# Keep this short -- it is paid for in tokens on every single prompt.
cat <<'EOF'
PREAMBLE GATE (founder rule 2026-11-10): before ANY edit, commit, push, PR, workflow dispatch, scheduled trigger/timer, or agent spawn, first tell the founder in plain language: WHAT you will do, WHY, HOW, why it is NECESSARY, the PROJECTED IMPROVEMENT, and COST/RISK. Consequential work (governance, security, money, CI/triggers, history rewrites, multi-agent) also waits for their go-ahead; an approval covers only the steps it described. Read-only investigation is exempt. Rules: .claude/skills/preamble-gate/SKILL.md
EOF
exit 0
