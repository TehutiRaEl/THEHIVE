"""
Core Package — Sovereign Hive v11.0
"""

from backend.core.config import settings
from backend.core.db import get_db, init_db
from backend.core.constitution import constitution, SOUL_MD
from backend.core.hdc import hdc
from backend.core.frequency_guild import frequency_guild
from backend.core.arena import arena
from backend.core.wallet import wallet_manager
from backend.core.genome import genome_reproduction

__all__ = [
    "settings",
    "get_db",
    "init_db",
    "constitution",
    "SOUL_MD",
    "hdc",
    "frequency_guild",
    "arena",
    "wallet_manager",
    "genome_reproduction",
]
