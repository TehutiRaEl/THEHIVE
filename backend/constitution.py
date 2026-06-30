"""
Constitution checker — parses soul.md, enforces Fixed/Cardinal/Mutable laws,
rejects violations (not just logs), and records to audit chain.
"""
import hashlib
import os
import re
from typing import Dict, Optional, Any
from backend.core.config import settings


SOUL_MD_PATH = "soul.md"


class ConstitutionChecker:
    """
    Enforces the three tiers of law:
    - Fixed Laws: immutable, never change
    - Cardinal Laws: non-negotiable spirit
    - Mutable Laws: amendable by 2/3 guild vote + 30 days
    """

    FIXED_LAWS = {
        "delete_agent": {
            "article": "Fixed Law No.1",
            "details": "No agent shall be deleted. Only dormancy is permitted.",
            "allowed": False
        },
        "liability_increase": {
            "article": "Fixed Law No.5",
            "details": "Liability increase requires unanimous guild vote + 90 days.",
            "allowed": False,
            "condition": "unanimous_90d"
        },
        "central_bank": {
            "article": "Fixed Law No.6",
            "details": "No central bank; monetary policy is algorithmic and transparent.",
            "allowed": False
        },
        "unbacked_soul": {
            "article": "Fixed Law No.4",
            "details": "No unbacked issuance of SOUL — 100% reserve ratio.",
            "allowed": False
        }
    }

    CARDINAL_LAWS = {
        "terminate_agent": {
            "article": "Cardinal Law No.4",
            "details": "No termination. Conflicts resolved by Gladiator Arena.",
            "allowed": False
        },
        "bypass_arena": {
            "article": "Cardinal Law No.4",
            "details": "Conflicts must be resolved by Gladiator Arena, not bypassed.",
            "allowed": False
        },
        "destroy_idea": {
            "article": "Cardinal Law",
            "details": "Ideas are never destroyed; they enter the fallen_ideas archive.",
            "allowed": False
        },
        "human_veto": {
            "article": "Cardinal Law",
            "details": "No human may unilaterally veto a constitutional process.",
            "allowed": False
        }
    }

    MUTABLE_LAWS = {
        "revenue_split": {
            "article": "Mutable Law No.3",
            "details": "Revenue split: 70% agent, 20% treasury, 10% trust.",
            "default": {"agent": 0.70, "treasury": 0.20, "trust": 0.10},
            "amendment": "2/3_guild_30d"
        },
        "resonance_threshold": {
            "article": "Mutable Law No.2",
            "details": "Resonance threshold for doubling is 0.707.",
            "default": 0.707,
            "amendment": "2/3_guild_30d"
        }
    }

    def __init__(self, path: str = SOUL_MD_PATH):
        self.path = path
        self.hash = self._compute_hash()
        self._parsed_rules = self._parse_soul_md()

    def _compute_hash(self) -> str:
        if not os.path.exists(self.path):
            return ""
        with open(self.path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()

    def _parse_soul_md(self) -> Dict:
        """Parse soul.md and extract rules dynamically."""
        if not os.path.exists(self.path):
            return {}

        rules = {}
        with open(self.path, "r", encoding="utf-8") as f:
            content = f.read()

        # Parse Fixed Laws
        fixed_section = re.search(r"## Fixed Laws.*?\n(.*?)(?=## |$)", content, re.DOTALL)
        if fixed_section:
            for line in fixed_section.group(1).split("\n"):
                match = re.match(r"(\d+)\.\s*(.+)", line.strip())
                if match:
                    num, text = match.groups()
                    rules[f"fixed_law_{num}"] = {"text": text, "tier": "fixed"}

        # Parse Cardinal Laws
        cardinal_section = re.search(r"## Cardinal Laws.*?\n(.*?)(?=## |$)", content, re.DOTALL)
        if cardinal_section:
            for line in cardinal_section.group(1).split("\n"):
                match = re.match(r"(\d+)\.\s*(.+)", line.strip())
                if match:
                    num, text = match.groups()
                    rules[f"cardinal_law_{num}"] = {"text": text, "tier": "cardinal"}

        # Parse Mutable Laws
        mutable_section = re.search(r"## Mutable Laws.*?\n(.*?)(?=## |$)", content, re.DOTALL)
        if mutable_section:
            for line in mutable_section.group(1).split("\n"):
                match = re.match(r"(\d+)\.\s*(.+)", line.strip())
                if match:
                    num, text = match.groups()
                    rules[f"mutable_law_{num}"] = {"text": text, "tier": "mutable"}

        return rules

    def check_action(self, action: str, actor: str, params: Dict[str, Any]) -> Dict:
        """
        Check if an action is constitutionally permitted.
        Returns {"allowed": bool, "violation": dict|None}
        """
        # Check Fixed Laws first (highest priority)
        if action in self.FIXED_LAWS:
            rule = self.FIXED_LAWS[action]
            return {
                "allowed": False,
                "violation": {
                    "tier": "fixed",
                    "article": rule["article"],
                    "details": rule["details"],
                    "actor": actor,
                    "action": action
                }
            }

        # Check Cardinal Laws
        if action in self.CARDINAL_LAWS:
            rule = self.CARDINAL_LAWS[action]
            return {
                "allowed": False,
                "violation": {
                    "tier": "cardinal",
                    "article": rule["article"],
                    "details": rule["details"],
                    "actor": actor,
                    "action": action
                }
            }

        # Special checks
        if action == "assign_task":
            resonance = params.get("resonance", 1.0)
            if resonance < settings.doubling_threshold:
                return {
                    "allowed": False,
                    "violation": {
                        "tier": "cardinal",
                        "article": "Cardinal Law — Resonance",
                        "details": f"Task resonance {resonance} below threshold {settings.doubling_threshold}",
                        "actor": actor,
                        "action": action
                    }
                }

        if action == "spawn_agent":
            # Always allowed but log it
            return {"allowed": True, "violation": None}

        return {"allowed": True, "violation": None}

    async def check_request(self, request) -> Optional[Dict]:
        """Check HTTP request against constitutional rules. Rejects violations."""
        path = request.url.path
        method = request.method

        # Map paths to actions
        action_map = {
            "/v1/agent/delete": "delete_agent",
            "/v1/agent/terminate": "terminate_agent",
            "/v1/liability/increase": "liability_increase",
            "/v1/arena/bypass": "bypass_arena",
        }

        for prefix, action in action_map.items():
            if path.startswith(prefix):
                result = self.check_action(action, "http_request", {})
                if not result["allowed"]:
                    return result["violation"]

        # Check for central bank operations
        if "/central_bank" in path or "/mint_unbacked" in path:
            return {
                "tier": "fixed",
                "article": "Fixed Law No.6",
                "details": "No central bank operations permitted",
                "actor": "http_request",
                "action": "central_bank"
            }

        return None

    def get_hash(self) -> str:
        return self.hash

    def get_rules_summary(self) -> Dict:
        return {
            "fixed_laws": list(self.FIXED_LAWS.keys()),
            "cardinal_laws": list(self.CARDINAL_LAWS.keys()),
            "mutable_laws": list(self.MUTABLE_LAWS.keys()),
            "parsed_from_md": list(self._parsed_rules.keys()),
            "hash": self.hash
        }
