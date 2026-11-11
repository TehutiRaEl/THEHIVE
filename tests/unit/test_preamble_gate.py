"""
Wiring checks for the preamble gate (founder rule, 2026-11-10).

The rule: before any edit, commit, push, PR, workflow dispatch, scheduled trigger/timer or
agent spawn, an AI must tell the founder WHAT / WHY / HOW / NECESSITY / PROJECTED
IMPROVEMENT / COST&RISK in plain language. Canonical text:
.claude/skills/preamble-gate/SKILL.md.

WHAT THESE TESTS PROVE: that the rule is *delivered* -- the skill exists and is well formed,
every instruction surface points at it, the hook is registered in .claude/settings.json, and
the configured hook command really runs and prints the reminder.

WHAT THEY CANNOT PROVE: that any AI *obeys* it, or that Claude Code actually invokes the
hook on each prompt. Those need a human to look -- see "How to confirm it is working" in the
skill. A green run here means the wiring is intact, not that the behaviour is guaranteed.
"""
import json
import os
import re
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
SKILL = ROOT / ".claude/skills/preamble-gate/SKILL.md"
SETTINGS = ROOT / ".claude/settings.json"
HOOK = ROOT / ".claude/hooks/preamble-reminder.sh"
SKILL_REL = ".claude/skills/preamble-gate/SKILL.md"

# The six fields every statement of the rule must carry (matched case-insensitively).
FIELDS = ["what", "why", "how", "necess", "projected improvement", "cost"]  # "necess" = necessity/necessary

# Every place an AI might be told the rule. All must point at the canonical skill.
POINTER_SURFACES = [
    "CLAUDE.md",
    ".claude/INSTRUCTIONS.md",
    ".mistral/INSTRUCTIONS.md",
    "AGENTS.md",
]


def _read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def _frontmatter(text):
    assert text.startswith("---\n"), "skill must start with YAML front matter"
    end = text.index("\n---", 4)
    return text[4:end], text[end + 4:]


# ── the canonical skill ──────────────────────────────────────────────────────

class TestSkill:
    def test_exists_with_valid_frontmatter(self):
        assert SKILL.is_file(), f"missing {SKILL_REL}"
        fm, _ = _frontmatter(SKILL.read_text(encoding="utf-8"))
        assert re.search(r"^name:\s*preamble-gate\s*$", fm, re.M)
        assert "description:" in fm

    def test_description_names_the_triggers_and_the_exemption(self):
        fm, _ = _frontmatter(SKILL.read_text(encoding="utf-8"))
        d = fm.lower()
        for word in ("edit", "commit", "push", "trigger", "agent", "read-only"):
            assert word in d, f"description must mention '{word}' so the skill auto-fires"

    def test_body_defines_all_six_fields(self):
        _, body = _frontmatter(SKILL.read_text(encoding="utf-8"))
        for heading in ("WHAT", "WHY", "HOW", "NECESSITY", "PROJECTED IMPROVEMENT", "COST & RISK"):
            assert f"**{heading}**" in body, f"skill body missing the {heading} field"

    def test_states_its_own_limits(self):
        # The repo's wired-or-not discipline: never imply machine backing that isn't there.
        _, body = _frontmatter(SKILL.read_text(encoding="utf-8"))
        assert "cannot force an AI to comply" in body
        assert "unverified live" in body


# ── every instruction surface points at it ───────────────────────────────────

class TestSurfaces:
    @pytest.mark.parametrize("rel", POINTER_SURFACES)
    def test_surface_exists_and_points_at_the_skill(self, rel):
        assert (ROOT / rel).is_file(), f"missing instruction surface {rel}"
        assert SKILL_REL in _read(rel), f"{rel} does not reference {SKILL_REL}"

    @pytest.mark.parametrize("rel", POINTER_SURFACES)
    def test_surface_mentions_the_rule_by_name(self, rel):
        assert "preamble" in _read(rel).lower()

    def test_agents_md_is_self_contained(self):
        # AGENTS.md is read by tools that may not follow a pointer, so it carries all six fields.
        text = _read("AGENTS.md").lower()
        for field in FIELDS:
            assert field in text, f"AGENTS.md is missing the '{field}' field"


# ── the hook ─────────────────────────────────────────────────────────────────

def _configured_hook_commands():
    cfg = json.loads(SETTINGS.read_text(encoding="utf-8"))
    entries = cfg.get("hooks", {}).get("UserPromptSubmit", [])
    return [h["command"] for e in entries for h in e.get("hooks", []) if h.get("type") == "command"]


class TestHook:
    def test_settings_is_valid_json(self):
        json.loads(SETTINGS.read_text(encoding="utf-8"))

    def test_hook_is_registered_for_every_prompt(self):
        cmds = _configured_hook_commands()
        assert any(".claude/hooks/preamble-reminder.sh" in c for c in cmds), (
            "no UserPromptSubmit hook points at preamble-reminder.sh"
        )

    def test_script_exists_and_is_executable(self):
        assert HOOK.is_file()
        assert os.access(HOOK, os.X_OK), "hook script should keep its executable bit"

    def test_configured_command_runs_and_injects_the_reminder(self):
        # Run the exact string from settings.json, from an unrelated cwd, with only
        # CLAUDE_PROJECT_DIR set -- the way Claude Code would. Tests the wiring, not the file.
        cmd = next(c for c in _configured_hook_commands() if "preamble-reminder.sh" in c)
        res = subprocess.run(
            cmd, shell=True, cwd="/", capture_output=True, text=True, timeout=15,
            env={**os.environ, "CLAUDE_PROJECT_DIR": str(ROOT)},
        )
        assert res.returncode == 0, res.stderr
        out = res.stdout
        assert "PREAMBLE GATE" in out
        for field in FIELDS:
            assert field in out.lower(), f"reminder is missing the '{field}' field"
        # it must point at a canonical file that actually exists
        assert SKILL_REL in out and (ROOT / SKILL_REL).is_file()

    def test_reminder_stays_cheap(self):
        # It is paid for in tokens on every prompt; cost is why the automation was stopped.
        out = subprocess.run(["bash", str(HOOK)], capture_output=True, text=True, timeout=15).stdout
        assert len(out) < 1200, f"reminder grew to {len(out)} chars; keep it short"
