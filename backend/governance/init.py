"""
Governance Package — Sovereign Hive v11.0
Constitution enforcement and governance patterns.
"""

from backend.governance.patterns import patterns, GOVERNANCE_PATTERNS
from backend.governance.constitution_middleware import constitution_middleware

__all__ = [
    "patterns",
    "GOVERNANCE_PATTERNS",
    "constitution_middleware",
]
