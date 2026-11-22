"""Guards for the previously unreachable tabs (founder rules FE-010, FE-013, SR-001).

Four tabs (WOW, 4D, ARCANE and, before the Dream Logs circle, DREAM) shipped in the bundle but no
control could open them, and they told things that were not true (a "World of Warcraft integration",
"stub math", "Implemented" capabilities that were not, a goals list frozen in July). They are now
reachable from the left menu, say only true things, and the one tab that has nothing real to show
(NO_MANS_SKY) was PARKED by founder decision FE-014 (2026-11-22): moved out of the build.

WHAT THIS CANNOT PROVE: that a tab's content is complete, only that it is reachable, honest about
its source, and free of the removed false claims.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/src"


def _raw(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def _code(rel):
    t = re.sub(r"/\*.*?\*/", "", _raw(rel), flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", t)


def _full_tab_keys():
    block = re.search(r"const FULL_TABS[^=]*=\s*\{(.*?)\};", _raw("pages/KaiElOS.tsx"), re.S).group(1)
    return set(re.findall(r"(?:'([a-z0-9-]+)'|\b([a-z0-9]+)):\s*[A-Z_0-9]+", block) and
               [a or b for a, b in re.findall(r"(?:'([a-z0-9-]+)'|\b([a-z0-9]+)):\s*[A-Z_0-9]+", block)])


def _reachable_ids():
    ids = set(re.findall(r"id:\s*'([a-z0-9-]+)'", _code("components/kai-os/LeftNav.tsx")))
    ids |= set(re.findall(r"id:\s*'([a-z0-9-]+)'", _code("components/kai-os/CenterGraph.tsx")))
    shell = _code("pages/KaiElOS.tsx")
    rewrites = re.findall(r"if \(id === '([a-z0-9-]+)'\) \{ setActiveSection\('([a-z0-9-]+)'\)", shell)
    # An id that handleSelect rewrites opens its target instead of itself.
    return (ids - {src for src, _ in rewrites}) | {dst for _, dst in rewrites}


# Tabs no control opens, each named here with the reason. Shrink this set; never grow it silently.
KNOWN_UNREACHABLE = set()  # empty since FE-014 parked the last one; do not add to it silently


class TestEveryTabIsReachable:
    def test_full_tab_registry_parsed(self):
        keys = _full_tab_keys()
        assert {"hive", "dream", "wow", "4d", "arcane", "settings"} <= keys

    def test_unreachable_tabs_are_exactly_the_named_exceptions(self):
        unreachable = _full_tab_keys() - _reachable_ids()
        assert unreachable == KNOWN_UNREACHABLE, (
            f"tabs no control can open: {sorted(unreachable)}. Add a menu entry, or name it in "
            f"KNOWN_UNREACHABLE with the reason (and queue it in the plan)."
        )

    def test_swarms_menu_item_opens_something(self):
        shell = _code("pages/KaiElOS.tsx")
        assert "if (id === 'swarms') { setActiveSection('hive'); return; }" in shell


class TestColoniesTabIsReal:
    CODE = _code("components/command-center/tabs/WOW.tsx")

    def test_reads_the_real_roster_and_the_real_route(self):
        assert "from '../../../data/colonies'" in self.CODE
        assert "/v11/colony/reports" in self.CODE
        assert "p === '/colony/reports'" in (ROOT / "worker/src/index.js").read_text(encoding="utf-8")

    def test_no_invented_features_or_inert_buttons(self):
        for gone in ("World of Warcraft", "PlannedControl", "Explore", "Scan All Colonies", "Collect Resources",
                     "Send Agents", "Quest System", "D3.js", "✅ Online"):
            assert gone not in self.CODE, f"Colonies tab again claims or shows: {gone}"

    def test_does_not_pretend_to_know_colony_health(self):
        assert "not visible from the browser" in self.CODE

    def test_only_control_is_a_working_reload(self):
        for tag in re.findall(r"<button[^>]*>", self.CODE):
            assert "onClick={load}" in tag


class TestFourDAndArcaneAndDreamAreHonest:
    def test_4d_has_no_false_claims(self):
        c = _code("components/command-center/tabs/4D.tsx")
        for gone in ("Option B", "stubs", "All 5 movement modes", "WASD", "Math needs real geometry", "✅"):
            assert gone not in c
        assert "Not live Hive data" in c

    def test_arcane_lists_only_live_wiring(self):
        c = _code("components/command-center/tabs/ARCANE.tsx")
        for gone in ("Implemented", "Phaser Integration", "Available Spells", "Space Navigation: WASD",
                     "stub math", "simulation"):
            assert gone not in c
        assert "hive.aiBound" in c and "hive.memoryBound" in c

    def test_dream_has_no_frozen_goals_or_stale_claims(self):
        c = _code("components/command-center/tabs/DREAM.tsx")
        for gone in ("Strategic Goals", "Complete all 13 SEE", "14-Layer System", "13-page interface",
                     "Merge to main branch"):
            assert gone not in c


class TestTesseractRendererDoesNotCrash:
    def test_no_useFrame_outside_the_canvas(self):
        c = _code("components/TesseractRenderer.tsx")
        top = c[c.index("const TesseractRenderer:"): c.index("<Canvas>")]
        assert "useFrame(" not in top, "useFrame outside <Canvas> throws and sends the 4D tab to the error screen"
        assert "<AngleDriver" in c and "useFrame((_state, delta) => onTick(delta))" in c


class TestNoMansSkyIsParkedNotLeftBehind:
    """FE-014: parked (kept, out of the build), not deleted and not left unreachable in the bundle."""

    def test_the_files_are_kept_under_parked(self):
        assert (SRC / "parked/NO_MANS_SKY.tsx").is_file() and (SRC / "parked/PhaserScene.tsx").is_file()
        assert "PARKED" in _raw("parked/NO_MANS_SKY.tsx") and "FE-014" in _raw("parked/NO_MANS_SKY.tsx")

    def test_the_old_locations_are_gone(self):
        assert not (SRC / "components/command-center/tabs/NO_MANS_SKY.tsx").exists()
        assert not (SRC / "components/PhaserScene.tsx").exists()

    def test_the_shell_no_longer_registers_it(self):
        shell = _code("pages/KaiElOS.tsx")
        assert "NO_MANS_SKY" not in shell and "no-mans-sky" not in shell

    def test_parked_code_is_excluded_from_the_build(self):
        assert '"src/parked"' in (ROOT / "frontend/tsconfig.build.json").read_text(encoding="utf-8")

    def test_nothing_in_the_built_app_imports_parked_code(self):
        for f in SRC.rglob("*.ts*"):
            if "parked" in f.parts:
                continue
            assert "/parked/" not in f.read_text(encoding="utf-8"), f"{f} imports parked code"

    def test_return_condition_is_on_the_plan(self):
        plan = (ROOT / "docs/FRONTEND_MASTER_PLAN_2026-11-14.md").read_text(encoding="utf-8")
        assert "PARKED" in plan and "FE-014" in plan
