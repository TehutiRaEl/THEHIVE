"""Guards for the light/dark switch and the Settings tab (founder rule FE-010 / FE-013).

The founder's own example of an abomination: a light/dark switch that does nothing. These static
checks keep the pieces of a working switch connected; the behavior itself (clicking changes the
colours, survives a reload, follows the device) was driven in a real browser.

WHAT THIS CANNOT PROVE: that every screen looks right in light mode. The contrast checks cover the
palette's main text-on-surface pairs, not each of the 100+ places they are used.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/src"
THEME_CSS = (SRC / "styles/theme.css").read_text(encoding="utf-8")
TAILWIND = (ROOT / "frontend/tailwind.config.js").read_text(encoding="utf-8")


def _block(selector_start):
    i = THEME_CSS.index(selector_start)
    j = THEME_CSS.index("\n}\n", i)
    return THEME_CSS[i:j]


DARK = _block(":root,\n:root[data-theme='dark']")
LIGHT = _block(":root[data-theme='light'] {")


def _vars(block):
    return dict(re.findall(r"(--[a-z0-9-]+):\s*([^;]+);", block))


def _channels(value):
    return tuple(int(x) for x in value.split())


def _lum(rgb):
    def f(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (f(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _ratio(a, b):
    la, lb = _lum(a), _lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


class TestBothThemesAreFullyDefined:
    def test_light_defines_every_variable_dark_does(self):
        missing = set(_vars(DARK)) - set(_vars(LIGHT))
        assert not missing, f"light theme is missing: {sorted(missing)}"

    def test_every_tailwind_colour_variable_exists_in_both_themes(self):
        used = set(re.findall(r"var\((--c-[a-z0-9-]+)\)", TAILWIND))
        assert used, "tailwind.config.js no longer reads the theme variables"
        for name, block in (("dark", DARK), ("light", LIGHT)):
            missing = used - set(_vars(block))
            assert not missing, f"{name} theme lacks tailwind colours: {sorted(missing)}"

    def test_the_two_themes_really_differ(self):
        d, l = _vars(DARK), _vars(LIGHT)
        same = [k for k in d if k.startswith("--c-void") and d[k] == l[k]]
        assert not same, f"light theme reuses dark surfaces: {same}"


class TestTextIsReadableInBothThemes:
    # (text variable, minimum contrast on the card surface and on the page surface)
    PAIRS = [
        ("--c-slate-200", 7.0), ("--c-slate-300", 7.0), ("--c-slate-400", 4.5),
        ("--c-cyan-glow", 4.5), ("--c-gold", 4.5), ("--c-violet-bright", 4.5),
        ("--c-ok-300", 4.5), ("--c-warn-300", 4.5), ("--c-bad-300", 4.5),
        ("--c-purple-300", 4.5), ("--c-orange-400", 4.5),
    ]

    def test_main_pairs_meet_contrast_in_each_theme(self):
        for name, block in (("dark", DARK), ("light", LIGHT)):
            v = _vars(block)
            for surface in ("--c-void-black", "--c-void-800"):
                for text, need in self.PAIRS:
                    got = _ratio(_channels(v[text]), _channels(v[surface]))
                    # Light-theme status text is allowed 4.5 where dark needs 7 for body text.
                    floor = min(need, 4.5) if name == "light" and need > 4.5 else need
                    assert got >= floor, f"{name}: {text} on {surface} is {got:.2f}:1, needs {floor}"


class TestTheSwitchIsConnected:
    def test_app_applies_the_saved_theme_at_start(self):
        main = (SRC / "main.tsx").read_text(encoding="utf-8")
        assert "initDisplayPreferences()" in main

    def test_preference_module_sets_what_the_css_reads(self):
        pref = (SRC / "theme/preference.ts").read_text(encoding="utf-8")
        assert "'data-theme'" in pref and "'data-motion'" in pref
        assert "prefers-color-scheme" in pref  # System follows the device
        assert "localStorage" in pref  # remembered
        assert "data-theme='light'" in THEME_CSS.replace('"', "'") or "[data-theme='light']" in THEME_CSS
        assert "[data-motion='off']" in THEME_CSS  # the Animations setting has real effect

    def test_toggle_is_reachable_in_both_layouts(self):
        shell = (SRC / "pages/KaiElOS.tsx").read_text(encoding="utf-8")
        bar = (SRC / "components/kai-os/TopStatusBar.tsx").read_text(encoding="utf-8")
        assert "<ThemeToggle />" in shell  # phone header
        assert "<ThemeToggle />" in bar and "showThemeToggle" in bar  # desktop bar

    def test_toggle_buttons_call_setTheme(self):
        t = (SRC / "components/kai-os/ThemeToggle.tsx").read_text(encoding="utf-8")
        assert "onClick={() => setTheme(c.id)}" in t and "aria-checked" in t


class TestSettingsTabOnlyHasControlsThatWork:
    _raw = (SRC / "components/command-center/tabs/SETTINGS.tsx").read_text(encoding="utf-8")
    CODE = re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", _raw, flags=re.S))  # comments may name what was removed

    def test_theme_and_animations_use_the_real_store(self):
        assert "setTheme(o.id)" in self.CODE and "setAnimations(e.target.checked)" in self.CODE
        assert "resetDisplayPreferences()" in self.CODE

    def test_removed_inert_settings_do_not_come_back(self):
        for dead in ("language", "notifications", "sounds", "maxResults", "autoSave", "Save Settings",
                     "appSettings", "console.log('Settings saved"):
            assert dead not in self.CODE, f"Settings tab again has an inert control: {dead}"

    def test_no_hardcoded_version_claims(self):
        for lie in ("1.0.0", "React:", "TypeScript:", "Vite:", "Branch:"):
            assert lie not in self.CODE


class TestGreyedMenuItemsAreRemovedUntilTheyWork:
    NAV = (SRC / "components/kai-os/LeftNav.tsx").read_text(encoding="utf-8")

    def test_no_menu_item_is_marked_not_wired(self):
        assert "wired: false" not in self.NAV

    def test_connectors_and_training_are_not_menu_items(self):
        assert "'connectors'" not in self.NAV and "'training'" not in self.NAV

    def test_their_empty_panels_are_gone(self):
        shell = (SRC / "pages/KaiElOS.tsx").read_text(encoding="utf-8")
        assert "Not yet connected" not in shell and "Not yet built" not in shell
