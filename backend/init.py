"""
Jasper Sovereign Hive v11.0 — Backend Package
"""

__version__ = "11.0"
__author__ = "Sovereign Hive Collective"

from backend.core.config import settings
from backend.core.db import init_db
from backend.core.constitution import constitution
from backend.core.wallet import wallet_manager
from backend.core.frequency_guild import frequency_guild
from backend.core.arena import arena
from backend.core.genome import genome_reproduction
from backend.api.routes import router
from backend.api.auth import verify_auth, create_access_token

__all__ = [
    "settings",
    "init_db",
    "constitution",
    "wallet_manager",
    "frequency_guild",
    "arena",
    "genome_reproduction",
    "router",
    "verify_auth",
    "create_access_token",
]
