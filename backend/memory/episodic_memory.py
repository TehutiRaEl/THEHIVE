"""Episodic Memory — SQLite-backed conversation history."""
import sqlite3
from datetime import datetime
from typing import List, Dict
from backend.config import settings


class EpisodicMemory:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.db_path

    def add(self, episode: Dict):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("""INSERT INTO episodic_memory (agent_name, user_id, user_message, assistant_message, created_at) VALUES (?, ?, ?, ?, ?)""", (
            episode.get("agent_name", "system"), episode.get("user_id", "anonymous"),
            episode.get("user_message", ""), episode.get("assistant_message", ""), datetime.now()
        ))
        conn.commit()
        conn.close()

    def recall(self, agent_name: str = None, user_id: str = None, limit: int = 10) -> List[Dict]:
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        if agent_name and user_id:
            c.execute("SELECT * FROM episodic_memory WHERE agent_name = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?", (agent_name, user_id, limit))
        elif agent_name:
            c.execute("SELECT * FROM episodic_memory WHERE agent_name = ? ORDER BY created_at DESC LIMIT ?", (agent_name, limit))
        else:
            c.execute("SELECT * FROM episodic_memory ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = c.fetchall()
        conn.close()
        return [{"id": r[0], "agent_name": r[1], "user_id": r[2], "user_message": r[3], "assistant_message": r[4], "created_at": r[5]} for r in rows]
