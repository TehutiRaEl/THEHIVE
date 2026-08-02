"""Treasury Guild — 70/20/10 revenue-split proposal. Not wired to anything live yet
(see AUDIT_LEDGER.md 2026-07-31 depth pass); the ledger-half of this file (credit/
get-balance bookkeeping) was removed 2026-08-01 as superseded-for-real by wallet.py —
this class now holds only the still-undecided revenue-split idea, per founder Q2."""
from typing import Dict
from backend.core.config import settings


class TreasuryGuild:
    def __init__(self):
        self.name = "Treasury Guild"
        self.enabled = True
        self.balance = 0.0

    async def distribute_revenue(self, total_amount: float) -> Dict:
        agent_share = total_amount * settings.agent_split
        treasury_share = total_amount * settings.treasury_split
        trust_share = total_amount * settings.trust_split
        self.balance += treasury_share
        return {"status": "distributed", "total": total_amount, "splits": {"agent": round(agent_share, 4), "treasury": round(treasury_share, 4), "trust": round(trust_share, 4)}, "treasury_balance": round(self.balance, 4)}

    async def get_balance(self) -> Dict:
        return {"treasury_balance": round(self.balance, 4), "soul_to_usd_rate": settings.soul_to_usd_rate}
