"""Wiring checks for the connection-audit skill (the Fable-5-level whole-repo audit method).

WHAT THESE PROVE: the skill and its two companion files exist and are well formed; they carry the
method's load-bearing content (the five broken-edge classes, the five levels, the absorption tiers,
the severity scale, the orchestration limits, the report sections); the files they point at exist;
and the skill is reachable from the instruction surfaces an AI reads (CLAUDE.md, the Fable-5 spec,
the fable-debugger skill).

WHAT THEY CANNOT PROVE: that any AI runs the method well. A green run means the wiring and the
content are intact, not that an audit was done.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / ".claude/skills/connection-audit"
SKILL = DIR / "SKILL.md"
BRIEF = DIR / "agent-brief.md"
TEMPLATE = DIR / "report-template.md"


def _read(p):
    return p.read_text(encoding="utf-8")


class TestFilesExistAndAreWellFormed:
    def test_three_files_exist(self):
        for f in (SKILL, BRIEF, TEMPLATE):
            assert f.is_file(), f"missing {f.relative_to(ROOT)}"

    def test_frontmatter_names_the_skill_and_says_when_to_use_it(self):
        text = _read(SKILL)
        assert text.startswith("---\n")
        fm = text[4:text.index("\n---", 4)]
        assert re.search(r"^name:\s*connection-audit\s*$", fm, re.M)
        desc = re.search(r"^description:\s*(.+)$", fm, re.M).group(1)
        assert len(desc) > 200 and "Not for" in desc, "description must say when NOT to use it too"

    def test_it_points_only_at_files_that_exist(self):
        text = _read(SKILL)
        for rel in re.findall(r"`((?:docs|\.claude)/[A-Za-z0-9_./-]+\.md)`", text):
            assert (ROOT / rel).is_file(), f"SKILL.md points at a missing file: {rel}"
        for name in ("fable-debugger", "wired-or-not", "devils-advocate-audit", "skill-census", "plan-reality-audit"):
            assert (ROOT / ".claude/skills" / name / "SKILL.md").is_file(), f"related skill missing: {name}"


class TestTheMethodIsAllThere:
    TEXT = _read(SKILL)

    def test_the_five_broken_edge_classes(self):
        for phrase in ("Producer with no consumer", "Consumer with no producer", "Wrong producer",
                       "Edge on paper only", "Edge that lies"):
            assert phrase in self.TEXT

    def test_the_five_levels_and_the_tiers(self):
        for level in ("L1 DISK", "L2 WIRED", "L3 TESTED", "L4 DEPLOYED", "L5"):
            assert level in self.TEXT
        for tier in ("T0", "T1", "T2", "T3", "T4", "T5", "T6"):
            assert tier in self.TEXT

    def test_severity_scale_and_report_sections(self):
        for sev in ("S1", "S2", "S3", "S4"):
            assert sev in self.TEXT
        assert "Probe before claim" in self.TEXT and "forward check" in self.TEXT

    def test_orchestration_limits_that_the_budget_lesson_taught(self):
        assert "At most two agents at a time" in self.TEXT
        assert "Save as you go" in self.TEXT
        assert "READ-ONLY" in _read(BRIEF) or "Read-only" in self.TEXT

    def test_reports_with_open_weaknesses_stay_out_of_the_public_repo(self):
        assert "must NOT be committed to a public repository" in self.TEXT


class TestCompanions:
    def test_brief_has_placeholders_to_fill_and_the_mandatory_report_format(self):
        brief = _read(BRIEF)
        for ph in ("{REPO_PATH}", "{PIN_COMMIT}", "{SCOPE_TEXT}", "{REPORT_PATH}", "{SCOPE_CODE}"):
            assert ph in brief
        assert "## 6. Top 10 by severity" in brief
        assert "constitution-receive.yml" in brief  # the never-touch list travels with the brief

    def test_template_has_every_report_section(self):
        t = _read(TEMPLATE)
        for h in ("## 1. Scope covered", "## 2. Findings", "## 3. Prior findings", "## 4. Patterns",
                  "## 5. What I could not verify", "## 6. Top 10 by severity"):
            assert h in t


class TestItIsReachable:
    def test_named_in_claude_md(self):
        assert "connection-audit" in _read(ROOT / "CLAUDE.md")

    def test_pointed_at_from_the_fable_5_spec_and_the_debugger_skill(self):
        assert ".claude/skills/connection-audit/SKILL.md" in _read(ROOT / "docs/FABLE-5_SPEC.md")
        assert "connection-audit" in _read(ROOT / ".claude/skills/fable-debugger/SKILL.md")
