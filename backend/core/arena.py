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
from typing import Dict, List, Optional

from backend.core.db import get_db
from backend.core.frequency_guild import frequency_guild
from backend.core.wallet import wallet_manager
from backend.core.constitution import constitution

class GladiatorArena:
    """
    Constitutional court of the hive.
    Ideas fight through simulation; losers are archived, never deleted.
    """
    TREASURY_CUT = 0.01

    def create(self, challenger: str, challenged: str, proposition: str, params: Optional[Dict] = None) -> Dict:
        """Create a new arena challenge."""
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "INSERT INTO arena_challenges(challenger,challenged,proposition,projection_params) VALUES(?,?,?,?)",
            (challenger, challenged, proposition, json.dumps(params or {"ticks": 100, "metric": "colony_wealth"}))
        )
        cid = c.lastrowid
        conn.commit()
        return {"challenge_id": cid, "status": "pending"}

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
            "INSERT INTO arena_bets(challenge_id,agent_name,amount_soul,side) VALUES(?,?,?,?)",
            (cid, agent, amount, side)
        )
        conn.commit()
        return {"success": True, "challenge_id": cid, "bet": amount, "side": side}

    async def run(self, cid: int) -> Dict:
        """Run the arena projection simulation."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT challenger,challenged,proposition,projection_params FROM arena_challenges WHERE id=?", (cid,))
        r = c.fetchone()
        conn.close()
        if not r:
            return {"error": "Challenge not found"}
        challenger, challenged, prop, pp = r
        params = json.loads(pp or "{}")
        ticks = params.get("ticks", 100)

        fa = frequency_guild.agent_hz(challenger)
        fb = frequency_guild.agent_hz(challenged)

        def simulate(hz: float, ticks: int) -> float:
            wealth = 1000.0
            for t in range(1, ticks + 1):
                harmonic = abs(math.sin(2 * math.pi * hz * t / 7.83))
                wealth *= max(0.95, 1 + 0.01 * harmonic + random.gauss(0, 0.02))
            return round(wealth, 2)

        sa = simulate(fa, ticks)
        sb = simulate(fb, ticks)
        winner = challenger if sa >= sb else challenged
        loser = challenged if winner == challenger else challenger

        # Archive loser (TITLE XII Art.4: No Destruction)
        conn = get_db()
        c = conn.cursor()
        c.execute(
            "INSERT INTO fallen_ideas(challenge_id,proposition,projection_summary,defeated_by) VALUES(?,?,?,?)",
            (cid, prop, f"Score {min(sa,sb):.0f} vs {max(sa,sb):.0f} after {ticks} ticks", loser)
        )
        c.execute(
            "UPDATE arena_challenges SET status='completed',winner=?,challenger_score=?,challenged_score=?,ended_at=? WHERE id=?",
            (winner, sa, sb, datetime.now(), cid)
        )
        payouts = self._settle(c, cid, winner, challenger)
        conn.commit()
        conn.close()

        return {
            "challenge_id": cid,
            "winner": winner,
            "loser": loser,
            "challenger_score": sa,
            "challenged_score": sb,
            "ticks": ticks,
            "freq_challenger_hz": fa,
            "freq_challenged_hz": fb,
            "payouts": payouts,
            "fallen_archived": True,
            "basis": "TITLE XII Art.4 — No idea ever deleted"
        }

    def _settle(self, c, cid: int, winner: str, challenger: str) -> Dict:
        """Settle bets on the arena challenge."""
        win_side = "challenger" if winner == challenger else "challenged"
        c.execute("SELECT id,agent_name,amount_soul,side FROM arena_bets WHERE challenge_id=? AND settled=0", (cid,))
        bets = c.fetchall()
        wp = sum(b[2] for b in bets if b[3] == win_side)
        lp = sum(b[2] for b in bets if b[3] != win_side)
        out = {}
        for bid, ag, amt, side in bets:
            pay = (amt + (amt / wp) * lp * (1 - self.TREASURY_CUT)) if side == win_side and wp > 0 else 0
            c.execute("UPDATE arena_bets SET settled=1,payout=? WHERE id=?", (pay, bid))
            if pay > 0:
                wallet_manager.credit(ag, pay, f"arena_win_{cid}")
            out[ag] = round(pay, 2)
        return out

    def challenges(self, status: Optional[str] = None) -> List[Dict]:
        """List arena challenges."""
        conn = get_db()
        c = conn.cursor()
        q = "SELECT * FROM arena_challenges" + (f" WHERE status='{status}'" if status else "") + " ORDER BY started_at DESC LIMIT 20"
        c.execute(q)
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def fallen(self, limit: int = 20) -> List[Dict]:
        """List fallen ideas (Hall of Fallen Ideas)."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM fallen_ideas ORDER BY archived_at DESC LIMIT ?", (limit,))
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def resurrect(self, fid: int, agent: str) -> Dict:
        """Resurrect a fallen idea (TITLE XIII: resurrection permitted)."""
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT proposition,resurrection_count FROM fallen_ideas WHERE id=?", (fid,))
        r = c.fetchone()
        if not r:
            conn.close()
            return {"error": "Fallen idea not found"}
        c.execute("UPDATE fallen_ideas SET resurrection_count=?,last_resurrected=? WHERE id=?", (r[1] + 1, datetime.now(), fid))
        conn.commit()
        conn.close()
        return {"resurrected": True, "proposition": r[0], "times": r[1] + 1, "by": agent}

arena = GladiatorArena()
