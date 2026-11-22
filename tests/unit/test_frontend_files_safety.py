"""Guards for the Files panel after decision S-5 (2026-11-22): uploads are founder-only and files
never open as pages. Static source checks; the Worker side is covered by worker/test/files-safety.test.js.

WHAT THIS CANNOT PROVE: that the live Worker has been redeployed with the fix.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PANEL = (ROOT / "frontend/src/components/kai-os/FilesPanel.tsx").read_text(encoding="utf-8")
WORKER = (ROOT / "worker/src/index.js").read_text(encoding="utf-8")


def _code(t):
    t = re.sub(r"/\*.*?\*/", "", t, flags=re.S)
    return re.sub(r"(?m)^\s*//.*$", "", t)


class TestFilesPanel:
    CODE = _code(PANEL)

    def test_upload_sends_the_founder_key_not_a_visitor_token(self):
        assert "...founderAuthHeader()" in self.CODE
        assert "/auth/token" not in self.CODE

    def test_upload_button_only_exists_with_a_key_and_the_box_is_offered_otherwise(self):
        assert "founderKey && !refused" in self.CODE
        assert "<FounderKeyBox" in self.CODE
        assert "Uploading is founder-only" in self.CODE

    def test_a_refused_key_is_reported(self):
        assert "r.status === 401" in self.CODE

    def test_file_links_open_the_download_route(self):
        assert "/files/get?key=" in self.CODE


class TestWorkerRoutes:
    def test_upload_requires_the_founder_key(self):
        i = WORKER.index("p === '/files/upload' && method === 'POST'")
        block = WORKER[i:i + 1500]
        assert "founderAuthOk(request, env)" in block and "visitorSpeedBumpOk" not in block

    def test_get_never_serves_a_page(self):
        i = WORKER.index("p === '/files/get' && method === 'GET'")
        block = WORKER[i:i + 2500]
        assert "'content-type': 'application/octet-stream'" in block
        assert "attachment; filename=" in block and "inline" not in block.split("return new Response")[1]
        assert "'x-content-type-options': 'nosniff'" in block
        assert "sandbox" in block
        assert "obj.httpMetadata?.contentType" not in block  # the uploader's claimed type is ignored


class TestRefusalDoesNotStickAfterANewKey:
    """A browser test caught this: after a refused key, saving a new one left 'refused' set, so the
    Files upload button never came back. Each component must clear it when the key changes."""

    def test_all_three_clear_the_refusal_when_the_key_changes(self):
        for rel in ("components/kai-os/FilesPanel.tsx", "components/kai-os/KaiCommune.tsx", "components/KaiChatBox.tsx"):
            code = _code((ROOT / "frontend/src" / rel).read_text(encoding="utf-8"))
            assert "setRefused(false); }, [founderKey])" in code, rel
