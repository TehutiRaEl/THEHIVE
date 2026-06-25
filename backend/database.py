"""
Async SQLite database with aiosqlite, WAL mode, and all required tables.
"""
import aiosqlite
import sqlite3
import re
from datetime import datetime
from typing import List, Dict, Optional
from backend.core.config import settings

DB_PATH = settings.db_path


class Database:
    def __init__(self, path: str = None):
        self.path = path or DB_PATH

    async def _init_tables(self):
        async with aiosqlite.connect(self.path) as conn:
            await conn.execute("PRAGMA journal_mode=WAL")
            await conn.execute("PRAGMA synchronous=NORMAL")
            await conn.execute("PRAGMA foreign_keys=ON")

            # Core tables
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    name TEXT PRIMARY KEY,
                    description TEXT,
                    status TEXT DEFAULT 'active',
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    public_key TEXT,
                    private_key_encrypted TEXT
                )
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT,
                    description TEXT,
                    creator TEXT,
                    assignee TEXT,
                    status TEXT DEFAULT 'pending',
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS resonance_log (
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    rho REAL
                )
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS constitution_log (
                    action TEXT,
                    actor TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    hash TEXT,
                    violation TEXT
                )
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS governance_votes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    proposal TEXT,
                    votes_for INTEGER DEFAULT 0,
                    votes_against INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    deadline TIMESTAMP
                )
            """)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS guilds (
                    name TEXT PRIMARY KEY,
                    enabled BOOLEAN DEFAULT 0,
                    config TEXT
                )
            """)
            # Ed25519 keys for agent identity
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS agent_keys (
                    agent_name TEXT PRIMARY KEY,
                    public_key TEXT NOT NULL,
                    private_key_encrypted TEXT NOT NULL,
                    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (agent_name) REFERENCES agents(name)
                )
            """)
            # Tamper-evident audit chain
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_chain (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT,
                    actor TEXT,
                    target TEXT,
                    decision TEXT,
                    rationale TEXT,
                    prev_hash TEXT,
                    hash TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Guild secrets with sheaf encryption
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS guild_secrets (
                    guild_name TEXT PRIMARY KEY,
                    secret_encrypted TEXT NOT NULL,
                    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Phase state tracking
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS phase_state (
                    phase INTEGER PRIMARY KEY,
                    name TEXT,
                    achieved_at TIMESTAMP,
                    triggers TEXT
                )
            """)
            # Wallet / economy
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS wallets (
                    agent_name TEXT PRIMARY KEY,
                    balance REAL DEFAULT 0.0,
                    earned REAL DEFAULT 0.0,
                    spent REAL DEFAULT 0.0
                )
            """)
            # Staking
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS staking (
                    id TEXT PRIMARY KEY,
                    agent_name TEXT,
                    amount REAL,
                    locked_until TIMESTAMP,
                    rewards_claimed REAL DEFAULT 0.0
                )
            """)
            # Arena challenges
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS arena_challenges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    challenger TEXT,
                    challenged TEXT,
                    proposition TEXT,
                    status TEXT DEFAULT 'pending',
                    winner TEXT,
                    ended_at TIMESTAMP
                )
            """)
            # Agent genome
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS agent_genome (
                    agent_name TEXT PRIMARY KEY,
                    spirituality REAL DEFAULT 0.5,
                    mysticism REAL DEFAULT 0.5,
                    energy REAL DEFAULT 0.5
                )
            """)
            # ELO ratings
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS elo_rating (
                    agent_name TEXT PRIMARY KEY,
                    rating INTEGER DEFAULT 1200,
                    matches INTEGER DEFAULT 0
                )
            """)
            # Episodic memory
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS episodic_memory (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    agent_name TEXT,
                    user_id TEXT,
                    user_message TEXT,
                    assistant_message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # Retry queue
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS retry_queue (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_type TEXT,
                    payload TEXT,
                    attempts INTEGER DEFAULT 0,
                    next_retry_at TIMESTAMP,
                    last_error TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # API key rotation
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS api_key_rotation (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key_hash TEXT,
                    created_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT 0
                )
            """)
            # HITL requests
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS hitl_requests (
                    id TEXT PRIMARY KEY,
                    action_type TEXT,
                    params TEXT,
                    status TEXT DEFAULT 'pending',
                    requested_by TEXT,
                    requested_at TIMESTAMP,
                    resolved_at TIMESTAMP,
                    approved BOOLEAN
                )
            """)
            # Frequency map
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS frequency_map (
                    char TEXT PRIMARY KEY,
                    sound_hz REAL
                )
            """)
            # System state
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS system_state (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            await conn.commit()

    async def create_agent(self, name: str, description: str, public_key: str = None, private_key_encrypted: str = None):
        if not name or len(name) > 64:
            raise ValueError("Agent name must be 1-64 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", name):
            raise ValueError("Agent name must be alphanumeric with underscores")

        async with aiosqlite.connect(self.path) as conn:
            await conn.execute(
                "INSERT OR IGNORE INTO agents (name, description, status, public_key, private_key_encrypted) VALUES (?, ?, 'active', ?, ?)",
                (name, description, public_key, private_key_encrypted)
            )
            await conn.commit()

    async def list_agents(self) -> List[Dict]:
        async with aiosqlite.connect(self.path) as conn:
            conn.row_factory = aiosqlite.Row
            async with conn.execute("SELECT name, description, status, created FROM agents") as cursor:
                rows = await cursor.fetchall()
                return [dict(r) for r in rows]

    async def count_agents(self) -> int:
        async with aiosqlite.connect(self.path) as conn:
            async with conn.execute("SELECT COUNT(*) FROM agents") as cursor:
                row = await cursor.fetchone()
                return row[0]

    async def update_agent_status(self, name: str, status: str):
        """Update agent status — e.g., to 'dormant' (never delete per Fixed Law)."""
        if status not in ("active", "dormant", "suspended"):
            raise ValueError("Invalid status")
        async with aiosqlite.connect(self.path) as conn:
            await conn.execute("UPDATE agents SET status = ? WHERE name = ?", (status, name))
            await conn.commit()

    async def log_violation(self, action: str, actor: str, violation: str):
        async with aiosqlite.connect(self.path) as conn:
            await conn.execute(
                "INSERT INTO constitution_log (action, actor, violation) VALUES (?, ?, ?)",
                (action, actor, violation)
            )
            await conn.commit()

    async def get_violation_count(self, hours: int = 24) -> int:
        async with aiosqlite.connect(self.path) as conn:
            async with conn.execute(
                "SELECT COUNT(*) FROM constitution_log WHERE timestamp > datetime('now', ? || ' hours')",
                (f"-{int(hours)}",)
            ) as cursor:
                row = await cursor.fetchone()
                return row[0]


# Sync initializer for scripts
def init_db_sync(path: str = None):
    path = path or DB_PATH
    conn = sqlite3.connect(path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA foreign_keys=ON")

    tables = [
        "CREATE TABLE IF NOT EXISTS agents (name TEXT PRIMARY KEY, description TEXT, status TEXT DEFAULT 'active', created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, public_key TEXT, private_key_encrypted TEXT)",
        "CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, creator TEXT, assignee TEXT, status TEXT DEFAULT 'pending', created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS resonance_log (timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, rho REAL)",
        "CREATE TABLE IF NOT EXISTS constitution_log (action TEXT, actor TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, hash TEXT, violation TEXT)",
        "CREATE TABLE IF NOT EXISTS governance_votes (id INTEGER PRIMARY KEY AUTOINCREMENT, proposal TEXT, votes_for INTEGER DEFAULT 0, votes_against INTEGER DEFAULT 0, status TEXT DEFAULT 'pending', created TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deadline TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS guilds (name TEXT PRIMARY KEY, enabled BOOLEAN DEFAULT 0, config TEXT)",
        "CREATE TABLE IF NOT EXISTS agent_keys (agent_name TEXT PRIMARY KEY, public_key TEXT NOT NULL, private_key_encrypted TEXT NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS audit_chain (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, actor TEXT, target TEXT, decision TEXT, rationale TEXT, prev_hash TEXT, hash TEXT NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS guild_secrets (guild_name TEXT PRIMARY KEY, secret_encrypted TEXT NOT NULL, updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS phase_state (phase INTEGER PRIMARY KEY, name TEXT, achieved_at TIMESTAMP, triggers TEXT)",
        "CREATE TABLE IF NOT EXISTS wallets (agent_name TEXT PRIMARY KEY, balance REAL DEFAULT 0.0, earned REAL DEFAULT 0.0, spent REAL DEFAULT 0.0)",
        "CREATE TABLE IF NOT EXISTS staking (id TEXT PRIMARY KEY, agent_name TEXT, amount REAL, locked_until TIMESTAMP, rewards_claimed REAL DEFAULT 0.0)",
        "CREATE TABLE IF NOT EXISTS arena_challenges (id INTEGER PRIMARY KEY AUTOINCREMENT, challenger TEXT, challenged TEXT, proposition TEXT, status TEXT DEFAULT 'pending', winner TEXT, ended_at TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS agent_genome (agent_name TEXT PRIMARY KEY, spirituality REAL DEFAULT 0.5, mysticism REAL DEFAULT 0.5, energy REAL DEFAULT 0.5)",
        "CREATE TABLE IF NOT EXISTS elo_rating (agent_name TEXT PRIMARY KEY, rating INTEGER DEFAULT 1200, matches INTEGER DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS episodic_memory (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_name TEXT, user_id TEXT, user_message TEXT, assistant_message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS retry_queue (id INTEGER PRIMARY KEY AUTOINCREMENT, task_type TEXT, payload TEXT, attempts INTEGER DEFAULT 0, next_retry_at TIMESTAMP, last_error TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "CREATE TABLE IF NOT EXISTS api_key_rotation (id INTEGER PRIMARY KEY AUTOINCREMENT, key_hash TEXT, created_at TIMESTAMP, expires_at TIMESTAMP, is_active BOOLEAN DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS hitl_requests (id TEXT PRIMARY KEY, action_type TEXT, params TEXT, status TEXT DEFAULT 'pending', requested_by TEXT, requested_at TIMESTAMP, resolved_at TIMESTAMP, approved BOOLEAN)",
        "CREATE TABLE IF NOT EXISTS frequency_map (char TEXT PRIMARY KEY, sound_hz REAL)",
        "CREATE TABLE IF NOT EXISTS system_state (key TEXT PRIMARY KEY, value TEXT, updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    ]
    for t in tables:
        conn.execute(t)
    conn.commit()
    conn.close()
