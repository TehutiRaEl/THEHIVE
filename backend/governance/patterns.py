"""
Governance Patterns — Sovereign Hive v11.0
12+ governance patterns with success rates and recommendations.
"""

import random
from typing import List, Dict, Any

GOVERNANCE_PATTERNS = [
    {
        "patternId": "futarchy",
        "name": "Futarchy",
        "description": "Decision making via prediction markets. Proposals pass when prediction market prices exceed threshold.",
        "successRate": 0.75,
        "complexityScore": 8,
        "applicability": {"minAgents": 10, "maxAgents": None, "suitableFor": ["financial decisions", "resource allocation"]},
        "pros": ["Market-based wisdom", "Real-time feedback", "Incentive aligned"],
        "cons": ["Complex to implement", "Requires liquid markets", "Can be gamed"]
    },
    {
        "patternId": "quadratic_funding",
        "name": "Quadratic Funding",
        "description": "Public goods funding where matching funds are allocated based on the square root of contributions.",
        "successRate": 0.82,
        "complexityScore": 6,
        "applicability": {"minAgents": 5, "maxAgents": 100, "suitableFor": ["public goods", "community projects"]},
        "pros": ["Democratizes funding", "Encourages broad participation", "Reduces plutocracy"],
        "cons": ["Requires matching funds", "Sybil attack vulnerability", "Complex calculation"]
    },
    {
        "patternId": "liquid_democracy",
        "name": "Liquid Democracy",
        "description": "Delegable voting where agents can vote directly or delegate their vote to trusted representatives.",
        "successRate": 0.68,
        "complexityScore": 7,
        "applicability": {"minAgents": 3, "maxAgents": 1000, "suitableFor": ["general governance", "policy decisions"]},
        "pros": ["Flexible", "Efficient for large groups", "Expertise can be leveraged"],
        "cons": ["Delegation chains can become opaque", "Power concentration", "Complex to implement"]
    },
    {
        "patternId": "sortition",
        "name": "Sortition",
        "description": "Random selection of decision makers from the population. Used in ancient Athens.",
        "successRate": 0.71,
        "complexityScore": 4,
        "applicability": {"minAgents": 20, "maxAgents": None, "suitableFor": ["committees", "juries", "policy panels"]},
        "pros": ["Truly democratic", "Avoids elite capture", "Reduces polarization"],
        "cons": ["Lack of expertise", "Randomness can produce unbalanced groups", "Low participation engagement"]
    },
    {
        "patternId": "holacracy",
        "name": "Holacracy",
        "description": "Distributed authority through self-organizing circles. Tactical and governance meetings separated.",
        "successRate": 0.65,
        "complexityScore": 9,
        "applicability": {"minAgents": 8, "maxAgents": 100, "suitableFor": ["organizations", "complex projects"]},
        "pros": ["Clear role definitions", "Distributed authority", "Adaptable"],
        "cons": ["Complex to implement", "Requires training", "Can be bureaucratic"]
    },
    {
        "patternId": "benevolent_dictator",
        "name": "Benevolent Dictator (with Term Limits)",
        "description": "Single leader with decision authority, limited by term limits and recall mechanisms.",
        "successRate": 0.62,
        "complexityScore": 3,
        "applicability": {"minAgents": 2, "maxAgents": 50, "suitableFor": ["startups", "rapid decision environments"]},
        "pros": ["Fast decisions", "Clear accountability", "Efficient"],
        "cons": ["Single point of failure", "Power concentration", "Succession risk"]
    },
    {
        "patternId": "sociocracy_circles",
        "name": "Delegate Circles",
        "description": "Sociocracy 3.0 pattern: circles with delegates to higher circles. Consent-based decision making.",
        "successRate": 0.73,
        "complexityScore": 8,
        "applicability": {"minAgents": 10, "maxAgents": 500, "suitableFor": ["organizations", "communities"]},
        "pros": ["Inclusive", "Consent-based", "Scalable"],
        "cons": ["Complex structure", "Requires training", "Can be slow"]
    },
    {
        "patternId": "retroactive_funding",
        "name": "Retroactive Public Goods Funding",
        "description": "Projects funded after they deliver value (Optimism style).",
        "successRate": 0.78,
        "complexityScore": 6,
        "applicability": {"minAgents": 5, "maxAgents": None, "suitableFor": ["public goods", "open source"]},
        "pros": ["Rewards impact", "Encourages innovation", "Low upfront risk"],
        "cons": ["Requires assessment", "Can be subjective", "Delayed funding"]
    },
    {
        "patternId": "conviction_voting",
        "name": "Conviction Voting",
        "description": "Continuous voting with decaying power over time. Proposals pass when conviction threshold is reached.",
        "successRate": 0.76,
        "complexityScore": 7,
        "applicability": {"minAgents": 5, "maxAgents": None, "suitableFor": ["ongoing decisions", "budget allocation"]},
        "pros": ["Continuous participation", "Reduces last-minute influence", "Patient capital"],
        "cons": ["Complex to implement", "Can be slow", "Requires continuous engagement"]
    },
    {
        "patternId": "quadratic_voting",
        "name": "Quadratic Voting",
        "description": "Votes are quadratic in cost: buying n votes costs n² credits.",
        "successRate": 0.74,
        "complexityScore": 6,
        "applicability": {"minAgents": 3, "maxAgents": 1000, "suitableFor": ["high-stakes decisions", "resource allocation"]},
        "pros": ["Reduces plutocracy", "Expresses preference intensity", "Sybil resistant"],
        "cons": ["Complex to implement", "Requires credit system", "Can be manipulated"]
    },
    {
        "patternId": "bdfL_term_limits",
        "name": "BDFL with Term Limits",
        "description": "Benevolent dictator for life with term limits and succession planning.",
        "successRate": 0.60,
        "complexityScore": 4,
        "applicability": {"minAgents": 3, "maxAgents": 100, "suitableFor": ["open source projects", "startups"]},
        "pros": ["Clear leadership", "Stability", "Accountability"],
        "cons": ["Power concentration", "Succession risk", "Can become stagnant"]
    },
    {
        "patternId": "citizens_assembly",
        "name": "Citizens Assembly (Sortition + Deliberation)",
        "description": "Randomly selected citizens deliberate and make recommendations.",
        "successRate": 0.79,
        "complexityScore": 7,
        "applicability": {"minAgents": 20, "maxAgents": 500, "suitableFor": ["complex policy decisions", "constitutional questions"]},
        "pros": ["Deliberative quality", "Representative", "Reduces polarization"],
        "cons": ["Resource intensive", "Requires facilitation", "Can be gamed"]
    }
]

class GovernancePatterns:
    """Governance pattern repository with recommendation engine."""

    @staticmethod
    def get_all() -> List[Dict]:
        """Get all governance patterns."""
        return GOVERNANCE_PATTERNS

    @staticmethod
    def get_by_id(pattern_id: str) -> Optional[Dict]:
        """Get a specific pattern by ID."""
        for p in GOVERNANCE_PATTERNS:
            if p["patternId"] == pattern_id:
                return p
        return None

    @staticmethod
    def recommend(context: str = "", n: int = 3) -> List[Dict]:
        """
        Recommend patterns based on context.
        Simple recommendation: random weighted by success rate.
        """
        # Simple relevance scoring (expand with embeddings)
        scores = []
        for p in GOVERNANCE_PATTERNS:
            score = p["successRate"]
            # Boost certain patterns based on context keywords
            context_lower = context.lower()
            if "funding" in context_lower and "quadratic" in p["name"].lower():
                score += 0.15
            if "market" in context_lower and "futarchy" in p["name"].lower():
                score += 0.15
            if "democracy" in context_lower and "liquid" in p["name"].lower():
                score += 0.10
            scores.append((p, score))

        # Sort by score and return top n
        scores.sort(key=lambda x: -x[1])
        return [p for p, _ in scores[:n]]

patterns = GovernancePatterns()
