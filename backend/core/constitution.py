"""
Constitution Module — Sovereign Hive v11.0
soul.md enforced as code, parsed live from the real file (CAMPAIGN.html task 12,
2026-08-06).

Real finding this rewrite fixes: this file previously enforced an entirely
different, fabricated "v4.0" document (Titles IX-XVI, Cardinal Laws, DR-Axioms)
that never matched the real soul.md at the repo root at all — not even close in
wording or structure. GET /v11/constitution/soul_md was handing that fake text
to any caller, labeled as "the" constitution. Confirmed with the founder
(2026-08-06) before rewriting: switch this file to read and enforce the real,
current soul.md (F-001 through F-006) instead of preserving the fabricated text.

Two things did NOT come from that fake document and are kept, honestly relabeled
rather than removed — see OPERATIONAL_SAFETY_RULES below for why.
"""

import hashlib
import os
import re
from typing import Dict, Optional, Any, List

from backend.core.validator import validator

SOUL_MD_PATH = "soul.md"

# Real, active per-path safety gates (check_request(), used on every HTTP
# request via ConstitutionMiddleware). These never actually corresponded to
# soul.md text, before or after this rewrite — they're standing operational
# safety rules (no agent deletion, no unbacked SOUL issuance, conflicts via
# Arena, no bypassing audit/constitution checks). Keeping them ACTIVE and
# UNCHANGED is the safety-preserving choice: soul.md's F-001-F-006 govern the
# user's rights (data, wealth, autonomy), a genuinely different domain from
# these operational/agent-lifecycle rules, so switching to F-001-F-006
# enforcement does not make these redundant or supersede them. Labeled
# honestly as "Hive Operational Policy" rather than a fake TITLE citation —
# whether any of these should become real, formal soul.md law is a separate,
# real question for the founder, not decided here.
OPERATIONAL_SAFETY_RULES = {
    "no_agent_deletion": "Hive Operational Policy: no agent shall be deleted, dormancy only.",
    "liability_process": "Hive Operational Policy: liability increases require a full guild review process.",
    "arena_required": "Hive Operational Policy: conflicts are resolved via the Gladiator Arena, not bypassed.",
    "no_human_veto": "Hive Operational Policy: constitutional amendments cannot carry a human-veto flag.",
    "soul_reserve": "Hive Operational Policy: no unbacked SOUL issuance.",
    "audit_required": "Hive Operational Policy: all actions must remain auditable (resonates with F-004 Explainability, not identical to it).",
    "no_constitution_bypass": "Hive Operational Policy: constitutional checks cannot be bypassed.",
}


def parse_soul_md(path: str = SOUL_MD_PATH) -> Dict[str, Any]:
    """Parse the real soul.md into structured data. Returns {} if the file is
    missing rather than raising — callers must treat an empty parse as 'we
    don't know', never as 'zero laws exist'."""
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    preamble = ""
    m = re.search(r"## Preamble\s*\n(.*?)(?=\n## |\Z)", content, re.DOTALL)
    if m:
        preamble = " ".join(m.group(1).strip().split())

    fixed: Dict[str, Dict[str, str]] = {}
    m = re.search(r"## Fixed Laws.*?\n(.*?)(?=\n## |\Z)", content, re.DOTALL)
    if m:
        for fm in re.finditer(r"### (F-\d{3}): (.+?)\n(.*?)(?=\n### F-|\Z)", m.group(1), re.DOTALL):
            num, title, body = fm.groups()
            fixed[num] = {"title": title.strip(), "text": " ".join(body.strip().split())}

    mutable: Dict[str, str] = {}
    m = re.search(r"## Mutable Laws.*?\n(.*?)(?=\n## |\Z)", content, re.DOTALL)
    if m:
        for mm in re.finditer(r"^(\d+)\.\s*(.+)$", m.group(1), re.MULTILINE):
            num, text = mm.groups()
            mutable[num] = text.strip()

    return {"preamble": preamble, "fixed": fixed, "mutable": mutable}


class ConstitutionChecker:
    """
    Enforces soul.md (F-001-F-006) as code, parsed live from the real file —
    plus the separate, real OPERATIONAL_SAFETY_RULES (see module docstring).
    F-001-F-006 enforcement itself is delegated to validator.ConstitutionalValidator
    (backend/core/validator.py), which already implements those checks correctly;
    this class does not duplicate that logic, only translates its own
    (action_type, actor, params) call shape into validator's (action, context)
    shape so every existing call site keeps working unchanged.
    """

    def __init__(self, path: str = SOUL_MD_PATH):
        self.path = path
        self.hash = self._compute_hash()
        self.parsed = parse_soul_md(path)

    def _compute_hash(self) -> str:
        """Compute SHA-256 hash of the real constitution file. Returns a hash
        of an empty string (never a fabricated document) if the file is
        missing — an honest 'unknown' hash, not a fake stand-in."""
        if not os.path.exists(self.path):
            return hashlib.sha256(b"").hexdigest()
        with open(self.path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()

    def get_raw_text(self) -> str:
        """The real, current soul.md text, read fresh every call — so an
        amendment is reflected immediately, no restart or re-parse needed."""
        if not os.path.exists(self.path):
            return ""
        with open(self.path, "r", encoding="utf-8") as f:
            return f.read()

    def check(self, action_type: str, actor: str, params: Optional[Dict] = None) -> Dict:
        """Check an action against F-001-F-006 (via validator) plus the
        standing operational safety rules. Same return shape as before:
        {'allowed': bool, 'article': str, ...} on violation."""
        params = params or {}

        if action_type in OPERATIONAL_SAFETY_RULES:
            return {
                "allowed": False,
                "violation": "CONSTITUTION_VIOLATION",
                "article": OPERATIONAL_SAFETY_RULES[action_type],
                "actor": actor,
                "details": f"Action '{action_type}' blocked by standing hive operational policy.",
            }

        context = dict(params)
        context["actor"] = actor
        result = validator.validate(action_type, context)
        if not result.allowed:
            return {
                "allowed": False,
                "violation": "CONSTITUTION_VIOLATION",
                "article": f"{result.violated_law}: {result.rationale}" if result.violated_law else result.rationale,
                "actor": actor,
                "details": result.rationale,
            }
        return {"allowed": True}

    def log(self, action_type: str, actor: str, result: Dict):
        """Logging is validator.validate()'s own responsibility now (it logs
        every check it runs) — this stays as a real, callable no-op rather
        than a silent removal, since routes.py calls it explicitly after
        check() and a removed method would be a breaking API change for a
        one-line fix that isn't this task's scope."""
        return None

    async def check_request(self, request) -> Optional[Dict]:
        """Per-request operational safety gate — unchanged behavior from
        before this rewrite (same paths, same conditions), only the returned
        'article' text changed to an honest label (see OPERATIONAL_SAFETY_RULES)."""
        path = request.url.path
        method = request.method

        skip_paths = ["/health", "/docs", "/openapi.json", "/", "/favicon.ico"]
        skip_prefixes = ["/ui/", "/static/", "/v11/health", "/v11/board"]
        if path in skip_paths or any(path.startswith(p) for p in skip_prefixes):
            return None

        if "/agent/delete" in path or "/agent/destroy" in path:
            return {
                "article": OPERATIONAL_SAFETY_RULES["no_agent_deletion"],
                "details": "Deletion operation blocked. Use dormancy instead.",
                "required_action": "Set agent status to 'dormant' instead.",
            }

        if "/liability/increase" in path and method == "POST":
            return {
                "article": OPERATIONAL_SAFETY_RULES["liability_process"],
                "details": "Liability increase requires full review process.",
                "required_action": "Initiate the guild review process.",
            }

        if "/conflict/resolve" in path and "/arena" not in path:
            return {
                "article": OPERATIONAL_SAFETY_RULES["arena_required"],
                "details": "Conflict resolution must go through the Gladiator Arena.",
                "required_action": "Create an arena challenge instead.",
            }

        if "/constitution/amend" in path and method == "POST":
            try:
                body = await request.json()
                if body.get("human_veto") == True:
                    return {
                        "article": OPERATIONAL_SAFETY_RULES["no_human_veto"],
                        "details": "Human veto is prohibited.",
                        "required_action": "Amendments require 2/3 guild supermajority + 30 days (soul.md's real amendment process).",
                    }
            except Exception:
                pass

        if "/soul/print" in path or "/soul/mint" in path:
            return {
                "article": OPERATIONAL_SAFETY_RULES["soul_reserve"],
                "details": "Unbacked issuance is prohibited.",
                "required_action": "Only distribute SOUL backed by real utility.",
            }

        if "/audit/bypass" in path:
            return {
                "article": OPERATIONAL_SAFETY_RULES["audit_required"],
                "details": "Audit bypass is prohibited.",
                "required_action": "Ensure all actions are logged in the audit chain.",
            }

        if "/constitution/bypass" in path:
            return {
                "article": OPERATIONAL_SAFETY_RULES["no_constitution_bypass"],
                "details": "Constitution bypass is prohibited.",
                "required_action": "All actions must comply with soul.md.",
            }

        return None

    def get_hash(self) -> str:
        """Get current constitution hash — of the real soul.md file."""
        return self.hash

    def get_laws(self) -> Dict[str, Any]:
        """Get the real, currently-parsed laws from soul.md — not a hard-coded
        snapshot. Returns whatever parse_soul_md() found, honestly, including
        an empty dict if the file couldn't be parsed."""
        return self.parsed

    def is_constitutional(self, action_type: str, actor: str, params: Optional[Dict] = None) -> bool:
        """Quick check if action is constitutional (no logging)."""
        result = self.check(action_type, actor, params)
        return result.get("allowed", False)

    def get_blocked_actions(self) -> List[str]:
        """Get list of permanently blocked (operational-policy) actions."""
        return list(OPERATIONAL_SAFETY_RULES.keys())

    def get_required_resonance(self) -> float:
        """Minimum resonance required for task assignment — real value from
        soul.md's mutable law #2 ('Resonance threshold: 0.707') when parseable,
        falling back to the app-wide default setting otherwise."""
        text = self.parsed.get("mutable", {}).get("2", "")
        m = re.search(r"(\d+\.\d+)", text)
        if m:
            return float(m.group(1))
        from backend.core.config import settings
        return settings.doubling_threshold

    def get_doubling_threshold(self) -> float:
        """Same real value as get_required_resonance() — soul.md's mutable
        law #2 doesn't distinguish the two concepts textually, so neither does
        this parser. Kept as a separate method only for backward API
        compatibility with existing callers of this name."""
        return self.get_required_resonance()

    def get_amendment_requirements(self) -> Dict[str, Any]:
        """Get the real amendment requirements — soul.md's Fixed Laws section
        is titled '(Immutable)' with no amendment path at all (by design,
        F-005: no override); its Mutable Laws section is explicitly titled
        'Amendable by 2/3 Guilds + 30 Days'. No 'unanimous vote + 90 days'
        concept exists in the real file — that was part of the old fabricated
        document and is not carried forward."""
        return {
            "fixed_laws": {
                "amendable": False,
                "note": "Fixed Laws are immutable per soul.md F-005 (no override); no amendment process exists for them.",
            },
            "mutable_laws": {
                "threshold": "2/3 guild supermajority",
                "waiting_period": "30 days",
            },
        }


constitution = ConstitutionChecker()
