"""Guards for wiring the centre-graph circles to live data (founder rules F3 and FE-010).

Memories, Training, Core · Town Hall and Files used to say "no data" although the Worker already
serves their numbers. Each now reads its route; a route that does not answer still shows
"no data". The numbers must come from the Hive, never be typed in.

WHAT THIS CANNOT PROVE: that the live Worker returns these routes with data (this container cannot
reach it). The route names are checked against worker/src/index.js so a typo cannot pass.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/src"
WORKER = (ROOT / "worker/src/index.js").read_text(encoding="utf-8")


def _code(rel):
    t = (SRC / rel).read_text(encoding="utf-8")
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", t)


class TestRoutesExistInTheWorker:
    def test_the_three_routes_are_real(self):
        for route in ("/kai/brain", "/townhall", "/files"):
            assert f"p === '{route}'" in WORKER, f"the Worker has no {route} route"

    def test_the_hook_polls_exactly_those_routes(self):
        hook = _code("hooks/useHiveData.ts")
        for route in ("'/kai/brain'", "'/townhall'", "'/files'"):
            assert f"j<" in hook and route in hook, f"useHiveData does not read {route}"


class TestCirclesUseTheLiveValues:
    GRAPH = _code("components/kai-os/CenterGraph.tsx")

    def test_counts_come_from_the_hook_not_typed_numbers(self):
        for expr in ("hive.kaiBrain", "hive.townhall", "hive.files"):
            assert expr in self.GRAPH
        assert re.search(r"label: 'Memories'.*?count: memoriesCount", self.GRAPH)
        assert re.search(r"label: 'Training'.*?count: trainingCount", self.GRAPH)
        assert re.search(r"label: 'Core · Town Hall'.*?count: townhallCount", self.GRAPH)
        assert re.search(r"label: 'Files'.*?count: filesCount", self.GRAPH)

    def test_no_count_when_the_route_does_not_answer(self):
        for expr in ("const memoriesCount", "const trainingCount", "const townhallCount", "const filesCount"):
            line = next(l for l in self.GRAPH.splitlines() if expr in l)
            assert "null" in line or "?" in line, f"{expr} has no 'no answer' branch"

    def test_files_not_provisioned_is_said_plainly(self):
        assert "'not set up'" in self.GRAPH

    def test_training_circle_is_no_longer_a_dead_greyed_circle(self):
        row = next(l for l in self.GRAPH.splitlines() if "label: 'Training'" in l)
        assert "wired: true" in row and "wired: false" not in row

    def test_circle_keys_are_unique_even_though_two_circles_share_a_panel(self):
        assert "key={n.label}" in self.GRAPH and "key={n.id}" not in self.GRAPH


class TestPanelsBehindTheCircles:
    def test_each_circle_opens_a_real_panel(self):
        shell = _code("pages/KaiElOS.tsx")
        assert "'kai-brain':" in shell and "<KaiBrainPanel />" in shell
        assert "townhall:" in shell and "<TownHallPanel />" in shell

    def test_panels_are_display_only_and_say_no_data_on_failure(self):
        for rel in ("components/kai-os/KaiBrainPanel.tsx", "components/kai-os/TownHallPanel.tsx"):
            code = _code(rel)
            assert "No data: the Hive did not answer" in code
            assert "method: 'POST'" not in code and "method: 'PUT'" not in code and "method: 'DELETE'" not in code
            assert "onClick={reload}" in code  # the one control, and it works

    def test_panels_read_the_route_their_circle_counts(self):
        assert "/v11/kai/brain" in _code("components/kai-os/KaiBrainPanel.tsx")
        assert "/v11/townhall" in _code("components/kai-os/TownHallPanel.tsx")


class TestDreamLogsSkillsAndWorld:
    GRAPH = _code("components/kai-os/CenterGraph.tsx")

    def test_dream_logs_counts_the_heartbeats_the_panel_lists(self):
        assert re.search(r"label: 'Dream Logs'.*?count: dreamCount", self.GRAPH)
        assert "p.action === 'heartbeat'" in self.GRAPH  # same filter as DreamLogs.tsx
        assert "p.action === 'heartbeat'" in _code("components/kai-os/DreamLogs.tsx")

    def test_skills_circle_opens_the_skills_panel_not_the_arena(self):
        row = next(l for l in self.GRAPH.splitlines() if "label: 'Skills'" in l)
        assert "id: 'skills'" in row and "id: 'arena'" not in row
        assert "skills:" in _code("pages/KaiElOS.tsx")  # the panel it opens exists

    def test_world_tab_colony_count_is_the_roster_not_a_typed_number(self):
        world = _code("components/command-center/tabs/WORLD.tsx")
        assert "colonies.length" in world
        assert not re.search(r'className="stat-value">\s*10\s*<', world)
