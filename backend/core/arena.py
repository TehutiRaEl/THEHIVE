"""
GLADIATOR ARENA — Conflict by Projection, Not Termination
TITLE XII: Conflicts resolved by projection, never deletion.
"""

import math
import json
import random
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional

from .frequency_guild import frequency_guild
from .wallet import wallet_manager

class GladiatorArena:
    TREASURY_CUT = 0.01

    def create(self, challenger: str, challenged: str, proposition: str, params: Optional[Dict] = None) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO arena_challenges(challenger,challenged,proposition,projection_params) VALUES(?,?,?,?)",
            (challenger, challenged, proposition, json.dumps(params or {"ticks": 100, "metric": "colony_wealth"}))
        )
        cid = c.lastrowid
        conn.commit()
        conn.close()
        return {"challenge_id": cid, "status": "pending"}

    def bet(self, cid: int, agent: str, amount: float, side: str) -> Dict:
        if not wallet_manager.debit(agent, amount):
            return {"success": False, "error": "Insufficient SOUL"}
        wallet_manager.credit("TREASURY", amount * self.TREASURY_CUT, "arena_cut")
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO arena_bets(challenge_id,agent_name,amount_soul,side) VALUES(?,?,?,?)",
            (cid, agent, amount, side)
        )
        conn.commit()
        conn.close()
        return {"success": True, "challenge_id": cid, "bet": amount, "side": side}

    async def run(self, cid: int) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT challenger,challenged,proposition,projection_params FROM arena_challenges WHERE id=?", (cid,))
        r = c.fetchone()
        conn.close()
        if not r:
            return {"error": "Not found"}
        challenger, challenged, prop, pp = r
        params = json.loads(pp or "{}")
        ticks = params.get("ticks", 100)

        fa = frequency_guild.agent_hz(challenger)
        fb = frequency_guild.agent_hz(challenged)

        def sim(hz: float, ticks: int) -> float:
            w = 1000.0
            for t in range(1, ticks + 1):
                h = abs(math.sin(2 * math.pi * hz * t / 7.83))
                w *= max(0.95, 1 + 0.01 * h + random.gauss(0, 0.02))
            return round(w, 2)

        sa = sim(fa, ticks)
        sb = sim(fb, ticks)
        winner = challenger if sa >= sb else challenged
        loser = challenged if winner == challenger else challenger

        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO fallen_ideas(challenge_id,proposition,projection_summary,defeated_by) VALUES(?,?,?,?)",
            (cid, prop, f"Score {min(sa,sb):.0f} vs {max(sa,sb):.0f}", winner)
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
            "freq_a_hz": fa,
            "freq_b_hz": fb,
            "payouts": payouts,
        }

    def _settle(self, c, cid: int, winner: str, challenger: str) -> Dict:
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
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        q = "SELECT * FROM arena_challenges" + (f" WHERE status='{status}'" if status else "") + " ORDER BY started_at DESC LIMIT 20"
        c.execute(q)
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def fallen(self, limit: int = 20) -> List[Dict]:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT * FROM fallen_ideas ORDER BY archived_at DESC LIMIT ?", (limit,))
        rows = c.fetchall()
        cols = [d[0] for d in c.description]
        conn.close()
        return [dict(zip(cols, r)) for r in rows]

    def resurrect(self, fid: int, agent: str) -> Dict:
        conn = sqlite3.connect("jasper_memory.db")
        c = conn.cursor()
        c.execute("SELECT proposition,resurrection_count FROM fallen_ideas WHERE id=?", (fid,))
        r = c.fetchone()
        if not r:
            conn.close()
            return {"error": "Not found"}
        c.execute("UPDATE fallen_ideas SET resurrection_count=?,last_resurrected=? WHERE id=?", (r[1] + 1, datetime.now(), fid))
        conn.commit()
        conn.close()
        return {"resurrected": True, "proposition": r[0], "times": r[1] + 1, "by": agent}

arena = GladiatorArena()
