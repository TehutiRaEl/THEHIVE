"""Guards for dead-control sweep slice 2: the chat controls and the Workflows panel.

Founder rule FE-010: every control must work and connect to something live. These are static
source checks (they read the .tsx files); the behavior itself was checked in a real browser.

WHAT THIS CANNOT PROVE: that Kai El answers (that needs the live Worker). It proves the wiring:
the left menu's Commands box, the centre "Kai EL" button and the phone's Commune bar all reach the
chat, and the Workflows panel no longer shows launchers that launch nothing.
"""
import re
from pathlib import Path

SRC = Path(__file__).resolve().parents[2] / "frontend/src"


def _text(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def _code(rel):
    text = re.sub(r"/\*.*?\*/", "", _text(rel), flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", text)


class TestCommandsBoxReachesKaiEl:
    def test_left_menu_passes_the_typed_text_on(self):
        code = _code("components/kai-os/LeftNav.tsx")
        assert re.search(r"onCommune\(commandValue\.trim\(\)\)", code), "typed command is thrown away again"

    def test_left_menu_signature_carries_text(self):
        assert "onCommune: (text?: string) => void" in _code("components/kai-os/LeftNav.tsx")

    def test_placeholder_no_longer_says_chat_box_while_doing_nothing(self):
        assert 'placeholder="chat box"' not in _code("components/kai-os/LeftNav.tsx")


class TestChatReceivesRequests:
    def test_commune_sends_text_through_the_real_route(self):
        code = _code("components/kai-os/KaiCommune.tsx")
        assert "request" in code and "onRequestHandled" in code
        assert "sendRef.current(text)" in code
        assert "/v11/command_text" in code

    def test_commune_does_not_lose_text_while_kai_is_answering(self):
        assert "setInputValue(text)" in _code("components/kai-os/KaiCommune.tsx")

    def test_commune_focuses_its_input(self):
        code = _code("components/kai-os/KaiCommune.tsx")
        assert "inputRef.current?.focus()" in code and "ref={inputRef}" in code

    def test_a_request_is_handled_only_once(self):
        assert "handledRequest" in _code("components/kai-os/KaiCommune.tsx")


class TestShellRoutesEveryEntryPointToTheChat:
    def test_one_openCommune_for_all(self):
        code = _code("pages/KaiElOS.tsx")
        assert "const openCommune" in code
        assert code.count("onCommune={openCommune}") == 2  # desktop + phone left menu
        assert "openCommune()" in code  # the phone's bottom bar
        assert "if (id === 'commune') { openCommune(); return; }" in code  # centre Kai EL / left menu item

    def test_both_chat_instances_get_the_request(self):
        code = _code("pages/KaiElOS.tsx")
        assert code.count("request={communeRequest}") == 2  # desktop rail + phone drawer

    def test_no_entry_point_only_flips_a_flag_that_the_desktop_ignores(self):
        # On desktop the chat is always on screen, so merely setCommuneOpen(true) did nothing visible.
        code = _code("pages/KaiElOS.tsx")
        assert "onCommune={() => { setActiveSection(null); setCommuneOpen(true); }}" not in code


class TestWorkflowsPanelIsHonest:
    def test_no_not_yet_built_rows(self):
        code = _code("components/kai-os/WorkflowsDrawer.tsx")
        for label in ("Morning Routine", "Book Writing", "Music", "not yet built", "soon"):
            assert label not in code, f"Workflows still lists a placeholder: {label}"

    def test_no_green_dot_implying_a_live_launcher(self):
        assert "wired" not in _code("components/kai-os/WorkflowsDrawer.tsx")

    def test_it_says_this_screen_does_not_start_them(self):
        assert "this screen does not start them" in _text("components/kai-os/WorkflowsDrawer.tsx")

    def test_only_real_skills_are_named(self):
        repo = Path(__file__).resolve().parents[2]
        code = _code("components/kai-os/WorkflowsDrawer.tsx")
        for skill in ("fable-debugger", "pocket-dimensions", "research-to-dna", "merge-readiness"):
            assert skill in code
            assert (repo / ".claude/skills" / skill / "SKILL.md").is_file(), f"{skill} does not exist"
