"""
Gladiator Arena — Sovereign Hive v11.0
Conflict by Projection, Not Termination.
TITLE XII: Conflicts resolved by projection, never deletion.
"""

import math
import json
import random
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Any

from backend.core.db import get_db
from backend.core.frequency_guild import frequency_guild
from backend.core.wallet import wallet_manager
from backend.core.constitution import constitution

class GladiatorArena:
    """
    Constitutional court of the hive.
    Ideas fight through simulation; losers are archived, never deleted.
    TITLE XII: No destruction — only projection and resurrection.
    """

    TREASURY_CUT = 0.01
    DEFAULT_TICKS = 100

    def __init__(self):
        self._ensure_tables()

    def _ensure_tables(self):
        """Ensure arena tables exist."""
        conn = get_db()
        c = conn.cursor()
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
        conn.commit()

    def create(self, challenger: str, challenged: str, proposition: str, params: Optional[Dict] = None) -> Dict:
        """Create a new arena challenge."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """INSERT INTO arena_challenges
               (challenger, challenged, proposition, projection_params)
               VALUES (?, ?, ?, ?)""",
            (challenger, challenged, proposition, json.dumps(params or {"ticks": self.DEFAULT_TICKS, "metric": "colony_wealth"}))
        )
        cid = c.lastrowid
        conn.commit()
        return {
            "challenge_id": cid,
            "status": "pending",
            "challenger": challenger,
            "challenged": challenged,
            "proposition": proposition,
            "message": "Challenge created. Both sides may submit bets."
        }

    def bet(self, cid: int, agent: str, amount: float, side: str) -> Dict:
        """Place a bet on an arena challenge."""
        chk = constitution.check("place_bet", agent, {"amount": amount})
        if not chk["allowed"]:
            return {"success": False, "error": chk["article"]}

        if not wallet_manager.debit(agent, amount):
            return {"success": False, "error": "Insufficient SOUL"}

        wallet_manager.credit("TREASURY", amount * self.TREASURY_CUT, "arena_cut")

        conn = get_db()
        c = conn.cursor()
        c.execute(
            """INSERT INTO arena_bets
               (challenge_id, agent_name, amount_soul, side)
               VALUES (?, ?, ?, ?)""",
            (cid, agent, amount, side)
        )
        conn.commit()
        return {
            "success": True,
            "challenge_id": cid,
            "agent": agent,
            "bet": amount,
            "side": side,
            "treasury_cut": round(amount * self.TREASURY_CUT, 4)
        }

    async def run(self, cid: int) -> Dict:
        """Run the arena projection simulation."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT challenger, challenged, proposition, projection_params
               FROM arena_challenges WHERE id=?""",
            (cid,)
        )
        row = c.fetchone()
        conn.close()
        if not row:
            return {"error": "Challenge not found"}

        challenger, challenged, proposition, params_json = row
        params = json.loads(params_json or "{}")
        ticks = params.get("ticks", self.DEFAULT_TICKS)

        fa = frequency_guild.agent_hz(challenger)
        fb = frequency_guild.agent_hz(challenged)

        def simulate(hz: float, ticks: int) -> float:
            wealth = 1000.0
            for t in range(1, ticks + 1):
                harmonic = abs(math.sin(2 * math.pi * hz * t / 7.83))
                noise = random.gauss(0, 0.02)
                growth = 1 + 0.01 * harmonic * (1 + noise)
                wealth *= max(0.95, growth)
            return round(wealth, 2)

        sa = simulate(fa, ticks)
        sb = simulate(fb, ticks)
        winner = challenger if sa >= sb else challenged
        loser = challenged if winner == challenger else challenger

        # Archive loser
        self._archive_loser(cid, proposition, loser, winner, min(sa, sb))
        payout_summary = self._settle_bets(cid, winner, challenger)

        conn = get_db()
        c = conn.cursor()
        c.execute(
            """UPDATE arena_challenges
               SET status='completed', winner=?,
                   challenger_score=?, challenged_score=?,
                   objective_metric=?, metric_name=?, ended_at=?
               WHERE id=?""",
            (winner, sa, sb, max(sa, sb), "colony_wealth", datetime.now(), cid)
        )
        conn.commit()
        conn.close()

        return {
            "challenge_id": cid,
            "winner": winner,
            "loser": loser,
            "challenger_score": sa,
            "challenged_score": sb,
            "metric": "colony_wealth",
            "ticks": ticks,
            "freq_challenger_hz": fa,
            "freq_challenged_hz": fb,
            "payout_summary": payout_summary,
            "fallen_idea_archived": True,
            "message": f"{winner} prevails. {loser}'s idea archived in Hall of Fallen Ideas."
        }

    def _archive_loser(self, challenge_id: int, proposition: str, loser: str, defeated_by: str, score: float):
        """Archive a losing idea in the Hall of Fallen Ideas."""
        summary = f"Simulated colony wealth after projection: {score:.0f}. Defeated by {defeated_by}."
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """INSERT INTO fallen_ideas
               (challenge_id, proposition, projection_summary, defeated_by)
               VALUES (?, ?, ?, ?)""",
            (challenge_id, proposition, summary, loser)
        )
        conn.commit()
        conn.close()

    def _settle_bets(self, challenge_id: int, winner: str, challenger: str) -> Dict:
        """Settle all bets on an arena challenge."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT id, agent_name, amount_soul, side
               FROM arena_bets WHERE challenge_id=? AND settled=0""",
            (challenge_id,)
        )
        bets = c.fetchall()

        win_side = "challenger"
        c.execute("SELECT challenger FROM arena_challenges WHERE id=?", (challenge_id,))
        row = c.fetchone()
        if row and row[0] != winner:
            win_side = "challenged"

        win_pool = sum(b[2] for b in bets if b[3] == win_side)
        lose_pool = sum(b[2] for b in bets if b[3] != win_side)
        payouts = {}

        for bet_id, agent, amount, side in bets:
            if side == win_side and win_pool > 0:
                share = amount / win_pool
                payout = amount + share * lose_pool * (1 - self.TREASURY_CUT)
            else:
                payout = 0.0

            c.execute("UPDATE arena_bets SET settled=1, payout=? WHERE id=?", (payout, bet_id))
            if payout > 0:
                wallet_manager.credit(agent, payout, f"arena_win_challenge_{challenge_id}")
                payouts[agent] = round(payout, 2)

        conn.commit()
        conn.close()
        return payouts

    def challenges(self, status: Optional[str] = None) -> List[Dict]:
        """List arena challenges with optional status filter."""
        conn = get_db()
        c = conn.cursor()
        if status:
            c.execute(
                """SELECT * FROM arena_challenges
                   WHERE status=? ORDER BY started_at DESC LIMIT 20""",
                (status,)
            )
        else:
            c.execute(
                """SELECT * FROM arena_challenges
                   ORDER BY started_at DESC LIMIT 20"""
            )
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def fallen(self, limit: int = 20) -> List[Dict]:
        """List fallen ideas from the Hall of Fallen Ideas."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT * FROM fallen_ideas
               ORDER BY archived_at DESC LIMIT ?""",
            (limit,)
        )
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def resurrect(self, fallen_id: int, agent_name: str) -> Dict:
        """Resurrect a fallen idea."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT proposition, resurrection_count
               FROM fallen_ideas WHERE id=?""",
            (fallen_id,)
        )
        row = c.fetchone()
        if not row:
            conn.close()
            return {"error": "Idea not found"}

        proposition, count = row
        c.execute(
            """UPDATE fallen_ideas
               SET resurrection_count=?, last_resurrected=?
               WHERE id=?""",
            (count + 1, datetime.now(), fallen_id)
        )
        conn.commit()
        conn.close()

        return {
            "status": "resurrected",
            "proposition": proposition,
            "resurrection_count": count + 1,
            "resurrected_by": agent_name,
            "message": "Idea rises from the Hall of Fallen Ideas."
        }

    def get_challenge(self, challenge_id: int) -> Optional[Dict]:
        """Get a specific challenge by ID."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM arena_challenges WHERE id=?", (challenge_id,))
        row = c.fetchone()
        conn.close()
        if not row:
            return None
        cols = [d[0] for d in c.description]
        return dict(zip(cols, row))

    def get_challenge_history(self, challenge_id: int) -> List[Dict]:
        """Get projection history for a challenge."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            """SELECT tick, challenger_wealth, challenged_wealth
               FROM arena_projections WHERE challenge_id=?
               ORDER BY tick""",
            (challenge_id,)
        )
        rows = c.fetchall()
        conn.close()
        return [
            {"tick": r[0], "challenger": r[1], "challenged": r[2]}
            for r in rows
        ]

    def get_stats(self) -> Dict:
        """Get arena statistics."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT COUNT(*) FROM arena_challenges")
        total = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM arena_challenges WHERE status='completed'")
        completed = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM fallen_ideas")
        fallen_count = c.fetchone()[0]
        c.execute("SELECT COUNT(*) FROM arena_bets WHERE settled=1")
        bets_settled = c.fetchone()[0]
        conn.close()

        return {
            "total_challenges": total,
            "completed_challenges": completed,
            "fallen_ideas": fallen_count,
            "bets_settled": bets_settled,
            "treasury_cut": self.TREASURY_CUT,
            "basis": "TITLE XII — Gladiator Arena"
        }

arena = GladiatorArena()
