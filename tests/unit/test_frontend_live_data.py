"""
Live-data guard for the Command Center (front-end batch F3).

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
QUEEN = ROOT / "frontend/src/components/kai-os/QueenPanel.tsx"
HIVE_DATA = ROOT / "frontend/src/hooks/useHiveData.ts"
MISSIONS = ROOT / "frontend/src/components/command-center/tabs/MISSIONS.tsx"


def _strip_comments(text):
    """Drop // and /* */ comments so a comment that DESCRIBES the old bug cannot trip a test."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return "\n".join(re.sub(r"(?<![:'\"`])//.*$", "", line) for line in text.splitlines())


def _node_rows(code):
    """Each circle is one object literal on one line with an id and a count."""
    return [ln for ln in code.splitlines() if re.search(r"\{\s*id:\s*'", ln) and "count:" in ln]


class TestCentreGraph:
    def test_file_exists_and_has_the_fifteen_circles(self):
        assert GRAPH.is_file()
        rows = _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8")))
        assert len(rows) == 15, f"expected 15 circles, found {len(rows)}"

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


class TestQueenAndTreasuryCircles:
    """Circles 14 and 15 (founder decision FE-002). Words, never numbers; Treasury never a balance."""

    def _rows(self):
        return {re.search(r"id:\s*'([^']+)'", r).group(1): r for r in _node_rows(_strip_comments(GRAPH.read_text(encoding="utf-8")))}

    def test_queen_is_first_so_she_takes_the_top_seat(self):
        rows = list(self._rows())
        assert rows[0] == "queen", "the ring starts at 12 o'clock with index 0; the Queen must be index 0"

    def test_badges_are_words_not_numbers(self):
        for rid, row in self._rows().items():
            m = re.search(r"badge:\s*'([^']*)'", row)
            if m:
                assert not re.search(r"[0-9]", m.group(1)), f"badge on '{rid}' contains a digit: {m.group(1)}"
                assert rid in ("queen", "treasury"), f"unexpected badge on '{rid}'"

    def test_treasury_is_gated_and_opens_nothing(self):
        row = self._rows()["treasury"]
        assert "wired: false" in row and "badge: 'gated'" in row and "count: null" in row

    def test_the_crown_is_decorative_only(self):
        code = _strip_comments(GRAPH.read_text(encoding="utf-8"))
        assert 'aria-hidden="true"' in code and "pointer-events-none" in code
        assert "motion-safe:animate-pulse" in code, "the halo must respect reduced motion"


class TestQueenPanel:
    """The Queen's panel is read-only and shows only what her three routes return."""

    def _code(self):
        return _strip_comments(QUEEN.read_text(encoding="utf-8"))

    def test_reads_her_three_routes(self):
        code = self._code()
        for route in ("/nanuet/brain", "/nanuet/autonomy", "/nanuet/digest"):
            assert route in code

    def test_it_writes_nothing(self):
        code = self._code()
        for write in ("method: 'POST'", "method: 'PUT'", "method: 'PATCH'", "method: 'DELETE'", 'method: "POST"'):
            assert write not in code, f"the Queen panel must be display only, found {write}"

    def test_no_switch_is_typed_in(self):
        code = self._code()
        for typed in ("QUEEN_AUTONOMOUS_APPROVAL", "NANUET_BRAIN_WRITE", "NANUET_DOMAIN_ROUTING", "NANUET_REVIEW_LOG"):
            assert typed not in code, f"'{typed}' is typed into the panel; switch names must come from the route"

    def test_unreachable_says_no_data(self):
        code = self._code()
        assert "No data:" in code and "NoData" in code

    def test_the_only_control_is_reload_and_it_is_live(self):
        code = self._code()
        assert code.count("<button") == 1 and "onClick={load}" in code
