"""
No-dead-controls guard for the Command Center (founder ruling FE-010, 2026-11-15):

    "being sure there aren't just random buttons that have no real application or calls ...
     everything that's there needs to be working connected to something live"

A DEAD CONTROL is anything that looks usable and does nothing: a <button> with no handler,
a disabled "planned" placeholder, a window-chrome glyph that is only text, a list item that
reads like a menu entry. This file keeps the screens already swept clean. It reads source
text; it does not run the app.

HOW TO EXTEND: when a screen is swept, add its file to SWEPT. A screen that is not listed here
is not yet guaranteed clean (the full audit list is in the front-end audit, section 2.2).

WHAT THIS CANNOT PROVE: that a control with a handler does something USEFUL (a handler that does
nothing real still passes), or that every screen is covered. Browser checks cover behavior.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/src/components"

# Screens that have been swept. Keep every one of them free of dead controls.
SWEPT = [
    "command-center/tabs/GOVERN.tsx",
    "command-center/tabs/ARENA.tsx",
    "command-center/tabs/MISSIONS.tsx",
    "command-center/tabs/WORLD.tsx",
    "command-center/tabs/SOUL.tsx",
    "kai-os/HiveTerminal.tsx",
    "kai-os/CenterGraph.tsx",
    "LiveArenaViewer.tsx",
    "kai-os/WorkflowsDrawer.tsx",
    "kai-os/KaiCommune.tsx",
    "kai-os/LeftNav.tsx",
]


def _code(rel):
    text = (SRC / rel).read_text(encoding="utf-8")
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return "\n".join(re.sub(r"(?<![:'\"`])//.*$", "", ln) for ln in text.splitlines())


def _opening_tags(code, name):
    """Yield each `<name ...>` opening tag in full. JSX attributes can contain `>` inside
    braces (`onClick={() => x}`), so scan with a brace counter instead of a regex."""
    for m in re.finditer(r"<%s(?=[\s>/])" % name, code):
        i, depth, quote = m.end(), 0, None
        while i < len(code):
            c = code[i]
            if quote:
                if c == quote:
                    quote = None
            elif c in "\"'" and depth == 0:
                quote = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
            elif c == ">" and depth == 0:
                yield code[m.start(): i + 1]
                break
            i += 1


class TestTheDetectorItself:
    def test_it_sees_a_dead_button(self):
        tags = list(_opening_tags("<button className='x'>Go</button>", "button"))
        assert tags and "onClick" not in tags[0]

    def test_it_is_not_fooled_by_an_arrow_function_inside_a_handler(self):
        src = "<button type=\"button\" onClick={() => setOpen(true)}>Open</button>"
        tags = list(_opening_tags(src, "button"))
        assert len(tags) == 1 and "onClick" in tags[0]

    def test_it_reads_multiline_tags(self):
        src = "<button\n  className=\"a\"\n  onClick={() => go()}\n>X</button>"
        assert "onClick" in list(_opening_tags(src, "button"))[0]


class TestSweptScreensHaveNoDeadControls:
    def test_every_swept_file_exists(self):
        for rel in SWEPT:
            assert (SRC / rel).is_file(), f"swept file is missing: {rel}"

    def test_every_button_has_a_handler(self):
        for rel in SWEPT:
            for tag in _opening_tags(_code(rel), "button"):
                ok = "onClick" in tag or 'type="submit"' in tag or "{...props}" in tag
                assert ok, f"{rel}: a <button> with no handler (a dead control): {tag[:100]}"

    def test_no_disabled_planned_placeholders(self):
        for rel in SWEPT:
            code = _code(rel)
            assert "PlannedControl" not in code, f"{rel}: a disabled 'planned' placeholder is still used"

    def test_no_clickable_looking_element_without_a_handler(self):
        # A role="button" element or a cursor-pointer container must carry a handler.
        for rel in SWEPT:
            code = _code(rel)
            for m in re.finditer(r'role="button"', code):
                window = code[max(0, m.start() - 200): m.start() + 200]
                assert "onClick" in window, f"{rel}: role=button without a handler"


class TestSpecificFindingsStayFixed:
    def test_terminal_has_no_fake_window_buttons(self):
        assert "— □ ×" not in _code("kai-os/HiveTerminal.tsx")

    def test_govern_has_no_menu_entries_that_do_nothing(self):
        code = _code("command-center/tabs/GOVERN.tsx")
        for entry in ("Add Agent", "Remove Agent", "Modify Permissions", "Feature Flags", "Performance Metrics",
                      "Run Compliance Check", "Create Vote", "Shutdown", "Start All", "Stop All", "Update All"):
            assert entry not in code, f"GOVERN still shows '{entry}', which does nothing"

    def test_govern_status_is_not_a_made_up_timestamp(self):
        code = _code("command-center/tabs/GOVERN.tsx")
        assert "new Date().toISOString()" not in code, "a 'Last Check' time that is just 'now' is not a measurement"
        assert "just now" not in code

    def test_arena_has_no_view_mode_buttons_that_do_nothing(self):
        code = _code("command-center/tabs/ARENA.tsx")
        labels = "First Person|Third Person|Top Down|Isometric|2D|3D|Voxel|Wireframe|Solid|Textured"
        assert not re.search(r'label="(%s)"' % labels, code), "a view/projection/render placeholder is back"

    def test_arena_info_does_not_claim_controls_or_libraries_that_do_not_exist(self):
        code = _code("command-center/tabs/ARENA.tsx")
        # LiveArenaViewer has no camera controls and does not use drei; the card used to claim both.
        assert "Interactive camera controls" not in code
        assert "drei" not in code

    def test_world_has_no_graph_buttons_that_do_nothing(self):
        code = _code("command-center/tabs/WORLD.tsx")
        assert "View Memory Graph" not in code and "View 4D Tesseract" not in code and "View Colony Graph" not in code

    def test_missions_has_no_create_view_edit_without_a_route(self):
        code = _code("command-center/tabs/MISSIONS.tsx")
        for label in ("Create New Mission", 'label="View"', 'label="Edit"'):
            assert label not in code

    def test_soul_has_no_invented_law_statuses_or_compliance_score(self):
        code = _code("command-center/tabs/SOUL.tsx")
        for invented in ("IMPLEMENTED", "PENDING", "Verify Compliance", "checkLaw", "Compliance Dashboard",
                         "Laws Compliant", "No violations detected", "1.0.0", "2026-07-08"):
            assert invented not in code, f"SOUL still carries the invented '{invented}'"

    def test_soul_does_not_cite_unratified_laws_as_law(self):
        code = _code("command-center/tabs/SOUL.tsx")
        assert "F-008D" not in code and "F-009E" not in code
