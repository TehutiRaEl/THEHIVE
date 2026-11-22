"""Guards for the founder-only Commune lock (decision S-4, 2026-11-22; FQ-Q-011).

POST /v11/command_text now needs the founder key. The Command Center must therefore ask for the key
once, keep it in this browser, send it only as a Bearer header, and tell the truth when it is missing
or refused. Static source checks; the behaviour was driven in a real browser.

WHAT THIS CANNOT PROVE: that the live Worker has been redeployed with the lock (merge, then the
edge-health-probe workflow's "WITHOUT a key must be 401" step is the live proof).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/src"


def _code(rel):
    t = (SRC / rel).read_text(encoding="utf-8")
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", t)


class TestWorkerRouteOrder:
    WORKER = (ROOT / "worker/src/index.js").read_text(encoding="utf-8")

    def test_command_text_checks_the_founder_key_before_the_rate_limit_and_the_model(self):
        i = self.WORKER.index("p === '/command_text' && method === 'POST'")
        block = self.WORKER[i:i + 20000]
        assert "founderAuthOk(request, env)" in block
        assert block.index("founderAuthOk(request, env)") < block.index("rateLimitOk(DB, ipCmd, env)")
        # the instructions Kai El is given (and so the model call) are built after the gate
        assert block.index("founderAuthOk(request, env)") < block.index("const SYSTEM =")


class TestKeyStorage:
    KEY = _code("utils/founderKey.ts")

    def test_key_is_kept_in_the_browser_and_can_be_forgotten(self):
        assert "localStorage.setItem" in self.KEY and "localStorage.removeItem" in self.KEY
        assert "export function clearFounderKey" in self.KEY

    def test_key_only_ever_travels_as_a_bearer_header(self):
        assert "Authorization: `Bearer ${current}`" in self.KEY
        # never in a URL, a log or a query string
        for bad in ("console.log", "?key=", "&key=", "location."):
            assert bad not in self.KEY


class TestBothChatsSendAndHandleTheKey:
    def _check(self, rel):
        c = _code(rel)
        assert "...founderAuthHeader()" in c, f"{rel} does not send the founder key"
        assert "getFounderKey()" in c, f"{rel} fires requests the Hive will certainly refuse"
        assert "res.status === 401" in c, f"{rel} does not tell the founder when the key is refused"
        assert "<FounderKeyBox" in c, f"{rel} gives no way to enter the key"
        assert "founder-only" in c

    def test_docked_commune(self):
        self._check("components/kai-os/KaiCommune.tsx")

    def test_legacy_floating_chat(self):
        self._check("components/KaiChatBox.tsx")

    def test_no_chat_sends_without_a_key(self):
        for rel in ("components/kai-os/KaiCommune.tsx", "components/KaiChatBox.tsx"):
            c = _code(rel)
            assert c.index("if (!getFounderKey())") < c.index("fetch(`${API_BASE_URL}/v11/command_text`")


class TestKeyBox:
    BOX = _code("components/FounderKeyBox.tsx")

    def test_input_is_a_password_field_and_has_a_working_forget_button(self):
        assert 'type="password"' in self.BOX
        assert "onClick={clearFounderKey}" in self.BOX and "Forget key" in self.BOX
        assert "setFounderKey(draft)" in self.BOX

    def test_says_plainly_why_commune_is_locked(self):
        assert "founder-only" in self.BOX and "refused" in self.BOX


class TestHealthProbeProvesTheLock:
    WF = (ROOT / ".github/workflows/edge-health-probe.yml").read_text(encoding="utf-8")

    def test_probe_requires_401_without_a_key(self):
        assert "WITHOUT a key must be 401" in self.WF and '[ "$st" = "401" ]' in self.WF

    def test_probe_still_checks_the_chat_with_the_founder_key(self):
        assert "FOUNDER_KEY: ${{ secrets.FOUNDER_KEY }}" in self.WF
        assert 'Authorization: Bearer ${FOUNDER_KEY}' in self.WF
