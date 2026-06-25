"""Treasury Guild — manages SOUL economy and revenue splits."""
from typing import Dict
from backend.core.config import settings


class TreasuryGuild:
    def __init__(self):
        self.name = "Treasury Guild"
        self.enabled = True
        self.balance = 0.0

    async def credit(self, amount: float, reason: str) -> Dict:
        self.balance += amount
        return {"status": "credited", "new_balance": round(self.balance, 4), "reason": reason}

    async def distribute_revenue(self, total_amount: float) -> Dict:
        agent_share = total_amount * settings.agent_split
        treasury_share = total_amount * settings.treasury_split
        trust_share = total_amount * settings.trust_split
        self.balance += treasury_share
        return {"status": "distributed", "total": total_amount, "splits": {"agent": round(agent_share, 4), "treasury": round(treasury_share, 4), "trust": round(trust_share, 4)}, "treasury_balance": round(self.balance, 4)}

    async def get_balance(self) -> Dict:
        return {"treasury_balance": round(self.balance, 4), "soul_to_usd_rate": settings.soul_to_usd_rate}
