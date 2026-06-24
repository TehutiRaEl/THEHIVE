"""
Database Module — Sovereign Hive v11.0
All SQLite tables with WAL mode and thread-local connections.
"""

import sqlite3
import threading
from datetime import datetime
from typing import Optional, List, Dict, Any

from backend.core.config import settings

class Database:
    """Thread-safe SQLite connection manager with WAL mode."""
    
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
        """Close the thread-local connection."""
        if hasattr(cls._local, 'conn') and cls._local.conn is not None:
            cls._local.conn.close()
            cls._local.conn = None

def init_db():
    """Initialize all database tables with full schema."""
    conn = sqlite3.connect(settings.db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    c = conn.cursor()

    # ─── Core tables ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS agents (
            name TEXT PRIMARY KEY,
            description TEXT,
            system_prompt TEXT,
            capabilities TEXT,
            tools TEXT,
            status TEXT,
            role TEXT DEFAULT 'Agent',
            drive REAL DEFAULT 0.5,
            version INTEGER DEFAULT 1,
            created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS agent_genome (
            agent_name TEXT PRIMARY KEY,
            leadership REAL DEFAULT 0.5,
            empathy REAL DEFAULT 0.5,
            persistence REAL DEFAULT 0.5,
            creativity REAL DEFAULT 0.5,
            curiosity REAL DEFAULT 0.5,
            analytical REAL DEFAULT 0.5,
            charisma REAL DEFAULT 0.5,
            resilience REAL DEFAULT 0.5,
            loyalty REAL DEFAULT 0.5,
            wisdom REAL DEFAULT 0.5,
            strategy REAL DEFAULT 0.5,
            tactics REAL DEFAULT 0.5,
            coding_skill REAL DEFAULT 0.5,
            communication REAL DEFAULT 0.5,
            negotiation REAL DEFAULT 0.5,
            risk_tolerance REAL DEFAULT 0.5,
            patience REAL DEFAULT 0.5,
            adaptability REAL DEFAULT 0.5,
            memory REAL DEFAULT 0.5,
            focus REAL DEFAULT 0.5,
            energy REAL DEFAULT 0.5,
            spirituality REAL DEFAULT 0.5,
            mysticism REAL DEFAULT 0.5,
            oracle_sensitivity REAL DEFAULT 0.5,
            leadership_extra REAL DEFAULT 0.5,
            generation INTEGER DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS elo_rating (
            agent_name TEXT PRIMARY KEY,
            rating INTEGER DEFAULT 1200,
            matches INTEGER DEFAULT 0
        )
    """)

    # ─── Wallet ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS agent_wallets (
            agent_name TEXT PRIMARY KEY,
            address TEXT NOT NULL,
            private_key TEXT NOT NULL,
            soul_balance REAL DEFAULT 0,
            soul_earned REAL DEFAULT 0,
            soul_spent REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Arena ────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS arena_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenger TEXT NOT NULL,
            challenged TEXT NOT NULL,
            proposition TEXT NOT NULL,
            projection_params TEXT,
            status TEXT DEFAULT 'pending',
            winner TEXT,
            objective_metric REAL,
            metric_name TEXT,
            challenger_score REAL,
            challenged_score REAL,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ended_at TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS fallen_ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER,
            proposition TEXT,
            projection_summary TEXT,
            defeated_by TEXT,
            archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resurrection_count INTEGER DEFAULT 0,
            last_resurrected TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS arena_bets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER,
            agent_name TEXT,
            amount_soul REAL,
            side TEXT,
            settled BOOLEAN DEFAULT 0,
            payout REAL DEFAULT 0,
            placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Frequency ────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS frequency_map (
            char TEXT PRIMARY KEY,
            numeric_val INTEGER,
            sound_hz REAL,
            note_name TEXT,
            color_hex TEXT,
            emotional_tag TEXT,
            solfeggio_hz REAL,
            source TEXT
        )
    """)

    # ─── Governance ────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS governance_patterns (
            pattern_id TEXT PRIMARY KEY,
            name TEXT,
            data TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS governance_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            action_type TEXT,
            actor TEXT,
            target TEXT,
            decision TEXT,
            rationale TEXT,
            prev_hash TEXT,
            hash TEXT
        )
    """)

    # ─── Utility ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS utility_metrics (
            agent_name TEXT PRIMARY KEY,
            total_earned_soul REAL DEFAULT 0,
            total_earned_fiat REAL DEFAULT 0,
            successful_tasks INTEGER DEFAULT 0,
            failed_tasks INTEGER DEFAULT 0,
            utility_multiplier REAL DEFAULT 1.0,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Staking ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS staking_positions (
            id TEXT PRIMARY KEY,
            agent_name TEXT,
            amount REAL,
            locked_until TIMESTAMP,
            rewards_claimed REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Memory ────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS episodic_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            user_id TEXT,
            user_message TEXT,
            assistant_message TEXT,
            created_at TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS semantic_memory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_id TEXT UNIQUE,
            content TEXT,
            embedding BLOB,
            metadata TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Tasks ────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            creator TEXT NOT NULL,
            assignee TEXT,
            status TEXT DEFAULT 'open',
            resonance_hz REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deadline TIMESTAMP,
            completed_at TIMESTAMP
        )
    """)

    # ─── Mythology ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS mythology_ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            title TEXT,
            content TEXT,
            signature TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Constitution ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS constitution (
            version INTEGER PRIMARY KEY,
            content TEXT,
            active BOOLEAN DEFAULT 0,
            approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS constitution_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER,
            agent_name TEXT,
            vote INTEGER,
            voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS constitution_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            action_type TEXT,
            actor TEXT,
            violation TEXT,
            decision TEXT
        )
    """)

    # ─── System State ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS system_state (
            key TEXT PRIMARY KEY,
            value TEXT,
            version INTEGER DEFAULT 1,
            updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── HITL ──────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS hitl_requests (
            id TEXT PRIMARY KEY,
            action_type TEXT,
            params TEXT,
            status TEXT,
            requested_by TEXT,
            requested_at TIMESTAMP,
            resolved_at TIMESTAMP,
            approved BOOLEAN
        )
    """)

    # ─── Guild Secrets ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS guild_secrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild TEXT,
            sender TEXT,
            ciphertext TEXT,
            topic TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Guild Shares ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS guild_shares (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild TEXT,
            member TEXT,
            share_x INTEGER,
            share_y TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild, member)
        )
    """)

    # ─── Guild Messages ──────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS guild_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild TEXT,
            sender TEXT,
            topic TEXT,
            ciphertext TEXT,
            iv TEXT,
            mac TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── PubSub ──────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS pubsub_channels (
            channel_id TEXT PRIMARY KEY,
            colony_name TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ipfs_enabled BOOLEAN DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS pubsub_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id TEXT,
            sender TEXT,
            topic TEXT,
            vector_blob BLOB,
            payload TEXT,
            nonce TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Arena Projections ──────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS arena_projections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER,
            tick INTEGER,
            challenger_wealth REAL,
            challenged_wealth REAL,
            frame_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Quantum Log ────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS quantum_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            backend TEXT,
            n_qubits INTEGER,
            status TEXT,
            fidelity REAL,
            notes TEXT
        )
    """)

    # ─── Tesseract Model Log ────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS tesseract_model_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            colony_name TEXT,
            run_id TEXT,
            n_frames INTEGER,
            final_wealth REAL,
            trend TEXT,
            backend TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Feedback ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            task_id TEXT,
            rating INTEGER,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Dream Log ──────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS dream_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            agent_name TEXT,
            dream_type TEXT,
            content TEXT,
            anomaly_score REAL DEFAULT 0,
            consolidated BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # ─── Seed Data ──────────────────────────────────────────────

    # Seed frequency map (Schumann + Solfeggio)
    freq_data = [
        ("A", 1, 432.0, "A4", "#FF0000", "grounding", None, "Verdi A"),
        ("C", 3, 528.0, "C5", "#FF7F00", "transformation", 528.0, "solfeggio Mi"),
        ("E", 5, 648.0, "E5", "#ADFF2F", "expansion", None, "harmonic"),
        ("G", 7, 384.0, "G4", "#00CED1", "healing", None, "harmonic"),
        ("Y", 25, 7.83, "—", "#228B22", "Schumann", None, "Earth resonance"),
        ("H", 8, 396.0, "G4", "#1E90FF", "liberation", 396.0, "solfeggio Ut"),
        ("I", 9, 417.0, "Ab4", "#4169E1", "change", 417.0, "solfeggio Re"),
        ("K", 11, 528.0, "C5", "#9400D3", "DNA repair", 528.0, "solfeggio Mi"),
        ("L", 12, 639.0, "Eb5", "#C71585", "connection", 639.0, "solfeggio Fa"),
        ("M", 13, 741.0, "Gb5", "#FF1493", "intuition", 741.0, "solfeggio Sol"),
        ("N", 14, 852.0, "Ab5", "#FF69B4", "spiritual order", 852.0, "solfeggio La"),
        ("O", 15, 963.0, "B5", "#FFB6C1", "divine", 963.0, "solfeggio Si"),
    ]
    for data in freq_data:
        c.execute("""
            INSERT OR IGNORE INTO frequency_map (
                char, numeric_val, sound_hz, note_name, color_hex,
                emotional_tag, solfeggio_hz, source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, data)

    # Seed governance patterns
    patterns = [
        ("futarchy", "Futarchy", '{"successRate": 0.75, "complexityScore": 8, "description": "Prediction market decisions"}'),
        ("quadratic_funding", "Quadratic Funding", '{"successRate": 0.82, "complexityScore": 6, "description": "Public goods matching"}'),
        ("liquid_democracy", "Liquid Democracy", '{"successRate": 0.68, "complexityScore": 7, "description": "Delegable voting"}'),
        ("sortition", "Sortition", '{"successRate": 0.71, "complexityScore": 4, "description": "Random citizen assembly"}'),
        ("holacracy", "Holacracy", '{"successRate": 0.65, "complexityScore": 9, "description": "Distributed authority"}'),
        ("benevolent_dictator", "Benevolent Dictator", '{"successRate": 0.62, "complexityScore": 3, "description": "Term-limited leadership"}'),
        ("sociocracy_circles", "Delegate Circles", '{"successRate": 0.73, "complexityScore": 8, "description": "Sociocracy 3.0"}'),
        ("retroactive_funding", "Retroactive Funding", '{"successRate": 0.78, "complexityScore": 6, "description": "Post-value funding"}'),
        ("conviction_voting", "Conviction Voting", '{"successRate": 0.76, "complexityScore": 7, "description": "Continuous voting"}'),
        ("quadratic_voting", "Quadratic Voting", '{"successRate": 0.74, "complexityScore": 6, "description": "Quadratic cost voting"}'),
    ]
    for pid, name, data in patterns:
        c.execute("INSERT OR IGNORE INTO governance_patterns (pattern_id, name, data) VALUES (?, ?, ?)", (pid, name, data))

    conn.commit()
    conn.close()

def get_db():
    """Get database connection."""
    return Database.get_conn()

def close_db():
    """Close database connection."""
    Database.close_conn()
