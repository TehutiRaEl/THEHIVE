"""
Database Module — Sovereign Hive v11.0
All SQLite tables with WAL mode and thread-local connections.
"""

import sqlite3
import threading
from datetime import datetime
from backend.core.config import settings

class Database:
    """Thread-safe SQLite connection manager."""
    
    _local = threading.local()
    
    @classmethod
    def get_conn(cls):
        """Get thread-local database connection."""
        if not hasattr(cls._local, 'conn') or cls._local.conn is None:
            cls._local.conn = sqlite3.connect(settings.db_path, check_same_thread=False)
            cls._local.conn.row_factory = sqlite3.Row
            cls._local.conn.execute("PRAGMA journal_mode=WAL")
            cls._local.conn.execute("PRAGMA synchronous=NORMAL")
        return cls._local.conn
    
    @classmethod
    def close_conn(cls):
        if hasattr(cls._local, 'conn') and cls._local.conn is not None:
            cls._local.conn.close()
            cls._local.conn = None

def init_db():
    """Initialize all database tables."""
    conn = sqlite3.connect(settings.db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    c = conn.cursor()
    
    # ── Core tables ──────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS agents (name TEXT PRIMARY KEY, description TEXT, system_prompt TEXT, status TEXT, created TIMESTAMP)")
    c.execute("CREATE TABLE IF NOT EXISTS agent_genome (agent_name TEXT PRIMARY KEY, leadership REAL, empathy REAL, persistence REAL, creativity REAL, curiosity REAL, analytical REAL, charisma REAL, resilience REAL, loyalty REAL, wisdom REAL, strategy REAL, tactics REAL, coding_skill REAL, communication REAL, negotiation REAL, risk_tolerance REAL, patience REAL, adaptability REAL, memory REAL, focus REAL, energy REAL, spirituality REAL, mysticism REAL, oracle_sensitivity REAL, leadership_extra REAL, generation INTEGER)")
    c.execute("CREATE TABLE IF NOT EXISTS elo_rating (agent_name TEXT PRIMARY KEY, rating INTEGER, matches INTEGER DEFAULT 0)")
    
    # ── Wallet ──────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS agent_wallets (agent_name TEXT PRIMARY KEY, address TEXT, private_key TEXT, soul_balance REAL DEFAULT 0, soul_earned REAL DEFAULT 0, soul_spent REAL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    
    # ── Arena ────────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS arena_challenges (id INTEGER PRIMARY KEY, challenger TEXT, challenged TEXT, proposition TEXT, status TEXT, winner TEXT, ended_at TIMESTAMP)")
    c.execute("CREATE TABLE IF NOT EXISTS fallen_ideas (id INTEGER PRIMARY KEY, proposition TEXT, defeated_by TEXT, archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    c.execute("CREATE TABLE IF NOT EXISTS arena_bets (id INTEGER PRIMARY KEY, challenge_id INTEGER, agent_name TEXT, amount_soul REAL, side TEXT, settled BOOLEAN DEFAULT 0, payout REAL DEFAULT 0)")
    
    # ── Frequency ────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS frequency_map (char TEXT PRIMARY KEY, sound_hz REAL, emotional_tag TEXT)")
    
    # ── Governance ────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS governance_patterns (pattern_id TEXT PRIMARY KEY, name TEXT, data TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS governance_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, action_type TEXT, actor TEXT, target TEXT, decision TEXT, rationale TEXT, prev_hash TEXT, hash TEXT)")
    
    # ── Utility ──────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS utility_metrics (agent_name TEXT PRIMARY KEY, total_earned_soul REAL DEFAULT 0, successful_tasks INTEGER DEFAULT 0, utility_multiplier REAL DEFAULT 1.0)")
    
    # ── Staking ──────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS staking_positions (id TEXT PRIMARY KEY, agent_name TEXT, amount REAL, locked_until TIMESTAMP, rewards_claimed REAL DEFAULT 0)")
    
    # ── Memory ────────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS episodic_memory (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_name TEXT, user_id TEXT, user_message TEXT, assistant_message TEXT, created_at TIMESTAMP)")
    
    # ── Tasks ────────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, creator TEXT, assignee TEXT, status TEXT DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    
    # ── Mythology ──────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS mythology_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, agent_name TEXT, title TEXT, content TEXT, signature TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    
    # ── System State ──────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS system_state (key TEXT PRIMARY KEY, value TEXT, updated TIMESTAMP)")
    
    # ── Constitution ──────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS constitution_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, action_type TEXT, actor TEXT, violation TEXT, decision TEXT)")
    
    # ── HITL ──────────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS hitl_requests (id TEXT PRIMARY KEY, action_type TEXT, params TEXT, status TEXT, requested_by TEXT, requested_at TIMESTAMP, resolved_at TIMESTAMP, approved BOOLEAN)")
    
    # ── Tier 3 ──────────────────────────────────────────────────
    c.execute("CREATE TABLE IF NOT EXISTS quantum_log (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, backend TEXT, n_qubits INTEGER, status TEXT, fidelity REAL, notes TEXT)")
    c.execute("CREATE TABLE IF NOT EXISTS guild_keys (guild TEXT PRIMARY KEY, n_members INTEGER, threshold INTEGER, key_hash TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, active BOOLEAN DEFAULT 1)")
    c.execute("CREATE TABLE IF NOT EXISTS guild_shares (id INTEGER PRIMARY KEY AUTOINCREMENT, guild TEXT, member TEXT, share_x INTEGER, share_y TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(guild, member))")
    c.execute("CREATE TABLE IF NOT EXISTS guild_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, guild TEXT, sender TEXT, topic TEXT, ciphertext TEXT, iv TEXT, mac TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    c.execute("CREATE TABLE IF NOT EXISTS pubsub_channels (channel_id TEXT PRIMARY KEY, colony_name TEXT, description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ipfs_enabled BOOLEAN DEFAULT 0)")
    c.execute("CREATE TABLE IF NOT EXISTS pubsub_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, channel_id TEXT, sender TEXT, topic TEXT, vector_blob BLOB, payload TEXT, nonce TEXT UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    c.execute("CREATE TABLE IF NOT EXISTS arena_projections (id INTEGER PRIMARY KEY AUTOINCREMENT, challenge_id INTEGER, tick INTEGER, challenger_wealth REAL, challenged_wealth REAL, frame_data TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    
    # Seed frequency map
    freq_data = {"A": 432.0, "C": 528.0, "E": 648.0, "G": 384.0, "Y": 7.83}
    for ch, hz in freq_data.items():
        c.execute("INSERT OR IGNORE INTO frequency_map (char, sound_hz) VALUES (?, ?)", (ch, hz))
    
    # Seed governance patterns
    patterns = [
        ("futarchy", "Futarchy", '{"successRate": 0.75, "description": "Prediction market decisions"}'),
        ("quadratic", "Quadratic Funding", '{"successRate": 0.82, "description": "Public goods matching"}'),
        ("liquid_democracy", "Liquid Democracy", '{"successRate": 0.68, "description": "Delegable voting"}'),
        ("sortition", "Sortition", '{"successRate": 0.71, "description": "Random citizen assembly"}'),
    ]
    for pid, name, data in patterns:
        c.execute("INSERT OR IGNORE INTO governance_patterns (pattern_id, name, data) VALUES (?, ?, ?)", (pid, name, data))
    
    conn.commit()
    conn.close()

def get_db():
    return Database.get_conn()
