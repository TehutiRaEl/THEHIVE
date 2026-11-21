"""
Live-data guard for the Command Center (front-end batches F3 and the Constitution panel).

Founder rule: every number on the screen is live, or it says "no data". Never a typed-in
number, never one thing's count under another thing's label, never sample data when the
real list is empty.

WHAT THESE TESTS PROVE: that the two places an audit found breaking that rule (the centre
graph's circles and the Missions tab) cannot quietly go back to it. They read the source
text; they do not run the app.

WHAT THEY CANNOT PROVE: that the built bundle served in production matches this source, or
that the numbers shown are correct. Those need a build check and a live probe.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRAPH = ROOT / "frontend/src/components/kai-os/CenterGraph.tsx"
VENTURES = ROOT / "frontend/src/components/kai-os/VenturesPanel.tsx"
HIVE_DATA = ROOT / "frontend/src/hooks/useHiveData.ts"
CONSTITUTION = ROOT / "frontend/src/components/kai-os/ConstitutionViewer.tsx"
MISSIONS = ROOT / "frontend/src/components/command-center/tabs/MISSIONS.tsx"


def _strip_comments(text):
    """Drop // and /* */ comments so a comment that DESCRIBES the old bug cannot trip a test."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return "\n".join(re.sub(r"(?<![:'\"`])//.*$", "", line) for line in text.splitlines())


def _node_rows(code):
    """Each circle is one object literal on one line with an id and a count."""
    return [ln for ln in code.splitlines() if re.search(r"\{\s*id:\s*'", ln) and "count:" in ln]


class TestCentreGraph:
    def test_file_exists_and_has_the_thirteen_circles(self):
        assert GRAPH.is_file()
        rows = _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8")))
        assert len(rows) == 13, f"expected 13 circles, found {len(rows)}"

    def test_no_circle_has_a_typed_in_count(self):
        # The bug: `count: 18` (APIs) and `count: 8` (Workflows).
        for row in _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8"))):
            m = re.search(r"count:\s*([^,}]+)", row)
            value = m.group(1).strip()
            assert not re.fullmatch(r"[0-9]+", value), f"typed-in number on a circle: {row.strip()}"
            assert not re.fullmatch(r"['\"`][^'\"`]*['\"`]", value), f"typed-in text count on a circle: {row.strip()}"

    def test_every_count_is_null_or_a_named_live_value(self):
        # A count is either null ("no data") or one of the values computed from live data.
        allowed = {"null", "tasksCount", "agentsCount", "venturesCount"}
        for row in _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8"))):
            value = re.search(r"count:\s*([^,}]+)", row).group(1).strip()
            assert value in allowed, (
                f"circle count comes from an unreviewed source ({value}). A new live source is "
                f"welcome: add it to `allowed` here in the same change, so a reviewer sees it."
            )

    def test_live_counts_are_only_on_the_circles_they_describe(self):
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        for row in _node_rows(code):
            label = re.search(r"label:\s*'([^']+)'", row).group(1)
            value = re.search(r"count:\s*([^,}]+)", row).group(1).strip()
            if value == "tasksCount":
                assert label == "Tasks", f"the task count is shown under '{label}'"
            if value == "agentsCount":
                assert label == "Agents", f"the agent count is shown under '{label}'"
            if value == "venturesCount":
                assert label == "Ventures", f"the venture count is shown under '{label}'"

    def test_borrowed_sources_are_gone(self):
        # The bug: heartbeat and governance page sizes shown as Memories / Dream Logs / Town Hall.
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        assert "hive.pulse" not in code
        assert "hive.governance" not in code

    def test_offline_shows_no_data_not_zero(self):
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        assert re.search(r"tasksCount\s*=\s*live\s*\?", code), "task count must be null while the Hive is unreachable"
        assert re.search(r"agentsCount\s*=\s*live\s*\?", code), "agent count must be null while the Hive is unreachable"
        assert "no data" in code

    def test_a_circle_that_opens_nothing_is_disabled(self):
        # No dead controls: a circle with wired:false must not be clickable.
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        assert "disabled={!n.wired}" in code
        assert re.search(r"onClick=\{n\.wired \?", code)

    def test_every_circle_says_what_its_number_is(self):
        for row in _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8"))):
            assert re.search(r"about:\s*[`'\"]", row), f"circle has no plain-words source: {row.strip()[:80]}"


class TestMissionsTab:
    def test_no_invented_sample_missions(self):
        code = _strip_comments(MISSIONS.read_text(encoding="utf-8"))
        assert "getFallbackMissions" not in code
        assert "fallback" not in code.lower()
        for invented in ("Complete Command Center Tabs", "Implement Real 4D Math", "Batch 10 Colony Consoles"):
            assert invented not in code

    def test_no_made_up_ids_dates_or_priorities(self):
        code = _strip_comments(MISSIONS.read_text(encoding="utf-8"))
        assert "Math.random" not in code, "ids must not be random"
        assert "new Date().toISOString()" not in code, "a missing created date must not become 'now'"
        assert not re.search(r"priority:\s*mission\.priority\s*\|\|\s*'", code), "a missing priority must not get a default"
        assert not re.search(r"progress:\s*mission\.progress\s*\|\|\s*0", code), "a missing progress must not become 0%"

    def test_names_the_route_it_really_reads(self):
        code = _strip_comments(MISSIONS.read_text(encoding="utf-8"))
        assert "/v11/tasks" in code
        assert "/v11/genesis/missions" not in code, "that route does not exist on the live Worker"

    def test_last_updated_is_the_load_time_not_the_render_time(self):
        code = _strip_comments(MISSIONS.read_text(encoding="utf-8"))
        assert "lastLoadedAt" in code
        assert "Last updated: {new Date()" not in code

    def test_empty_and_error_states_say_no_data(self):
        code = _strip_comments(MISSIONS.read_text(encoding="utf-8"))
        assert code.count("No data:") >= 2


class TestVenturesPanel:
    """The Ventures circle and panel show only what GET /v11/ventures returns."""

    def test_the_hook_reads_the_ventures_route(self):
        code = _strip_comments(HIVE_DATA.read_text(encoding="utf-8"))
        assert "'/ventures'" in code
        # The route answering available:false must leave the slice empty, not half-filled.
        assert "ventures.available === true" in code

    def test_the_circle_count_comes_from_the_route_and_is_null_without_it(self):
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        assert re.search(r"venturesCount\s*=\s*hive\.ventures\s*\?", code)

    def test_no_venture_is_typed_into_the_panel(self):
        code = _strip_comments(VENTURES.read_text(encoding="utf-8"))
        for typed in ("Sovereign Forge", "SVFG", "pipeline369", "dispatcher-dao", "TehutiRaEl/"):
            assert typed not in code, f"'{typed}' is typed into the panel; it must come from the route"

    def test_unavailable_says_no_data_and_shows_nothing_else(self):
        code = _strip_comments(VENTURES.read_text(encoding="utf-8"))
        assert "No data:" in code
        assert "if (!data)" in code

    def test_a_stale_mirror_is_visible(self):
        code = _strip_comments(VENTURES.read_text(encoding="utf-8"))
        assert "mirrored_at" in code and "sha" in code


class TestConstitutionPanel:
    """The panel must show the canonical constitution the Hive serves (F-001 to F-006),
    never docs/GOVERNANCE.md (F-001 to F-013, of which F-007 to F-013 are unratified),
    and never text of its own."""

    def _code(self):
        return _strip_comments(CONSTITUTION.read_text(encoding="utf-8"))

    def test_reads_the_canonical_route(self):
        code = self._code()
        assert "/v11/constitution" in code
        assert "API_BASE_URL" in code, "must follow the same base URL as every other call"

    def test_never_reads_the_non_canonical_governance_document(self):
        assert "GOVERNANCE.md" not in self._code()

    def test_no_text_of_its_own(self):
        code = self._code()
        # The old orphan component hardcoded invented laws ("C-4 No Human Veto").
        for invented in ("No Human Veto", "C-4", "Fixed Laws (Immutable)", "F-001:"):
            assert invented not in code

    def test_unavailable_says_no_data_and_shows_nothing_else(self):
        code = self._code()
        assert "No data:" in code
        assert "available !== true" in code

    def test_shows_where_the_text_came_from(self):
        code = self._code()
        assert "canonical_source" in code and "hash" in code
