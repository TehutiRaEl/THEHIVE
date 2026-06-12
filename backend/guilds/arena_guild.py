"""Arena Guild — Gladiator Arena for conflict resolution (not termination)."""
import random
from typing import Dict, List


class ArenaGuild:
    def __init__(self):
        self.name = "Arena Guild"
        self.enabled = True
        self.challenges: List[Dict] = []

    async def create_challenge(self, agent1: str, agent2: str, topic: str = "") -> Dict:
        challenge_id = len(self.challenges) + 1
        challenge = {"id": challenge_id, "agent1": agent1, "agent2": agent2, "topic": topic, "status": "pending", "created_at": "2026-01-01T00:00:00Z"}
        self.challenges.append(challenge)
        return {"challenge_id": challenge_id, "status": "pending", "topic": topic, "participants": [agent1, agent2]}

    async def resolve_challenge(self, challenge_id: int) -> Dict:
        challenge = next((c for c in self.challenges if c["id"] == challenge_id), None)
        if not challenge:
            return {"error": "Challenge not found"}
        freq1 = random.uniform(0.5, 1.0)
        freq2 = random.uniform(0.5, 1.0)
        winner = challenge["agent1"] if freq1 >= freq2 else challenge["agent2"]
        loser = challenge["agent2"] if winner == challenge["agent1"] else challenge["agent1"]
        challenge["status"] = "completed"
        challenge["winner"] = winner
        challenge["loser"] = loser
        return {"challenge_id": challenge_id, "winner": winner, "loser": loser, "method": "frequency_evaluation", "note": "In production: LLM-based debate evaluation"}

    async def list_challenges(self, status: str = None) -> Dict:
        challenges = self.challenges
        if status:
            challenges = [c for c in challenges if c["status"] == status]
        return {"challenges": challenges, "count": len(challenges)}
