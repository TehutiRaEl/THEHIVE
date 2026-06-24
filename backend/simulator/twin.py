"""
Digital Twin Simulator — Sovereign Hive v11.0
Monte Carlo simulations for governance proposals and colony growth.
"""

import random
import math
from typing import Dict, List, Optional
import numpy as np

from backend.core.config import settings

class DigitalTwinSimulator:
    """
    Monte Carlo simulation engine for the Sovereign Hive.
    Simulates proposal passage, resonance trajectories, and colony growth.
    """

    @staticmethod
    def monte_carlo_proposal(
        n_agents: int = 50,
        trials: int = 1000,
        base_rho: float = 0.7,
        quorum: float = 0.6,
        decay_factor: float = 0.95
    ) -> Dict:
        """
        Simulate proposal passage using Monte Carlo.

        Args:
            n_agents: Number of agents voting
            trials: Number of simulation trials
            base_rho: Base resonance (0-1)
            quorum: Required fraction of votes to pass
            decay_factor: Decay per simulation step

        Returns:
            Dict with success probability, expected days, resonance trajectory
        """
        successes = 0
        trajectories = []

        for _ in range(trials):
            # Simulate resonance with Gaussian noise
            rho = base_rho * (1 + random.gauss(0, 0.15))
            rho = max(0.0, min(1.0, rho))

            # Simulate votes
            votes = 0
            traj = []
            for t in range(7):  # 7 time steps
                # Each agent votes with probability rho * decay^t
                vote_prob = rho * (decay_factor ** t)
                for _ in range(n_agents):
                    if random.random() < min(1.0, vote_prob):
                        votes += 1
                traj.append(round(rho * (decay_factor ** t), 3))

            if votes / n_agents >= quorum:
                successes += 1
            trajectories.append(traj)

        prob = successes / trials

        # Compute resonance trajectory (average across trials)
        avg_trajectory = [
            round(sum(traj[i] for traj in trajectories) / len(trajectories), 3)
            for i in range(7)
        ]

        return {
            "success_probability": round(prob, 4),
            "expected_days": round(1.5 + 8 * (1 - prob), 1),
            "resonance_trajectory": avg_trajectory,
            "trials": trials,
            "n_agents": n_agents,
            "quorum_required": quorum,
            "decay_factor": decay_factor,
            "confidence_interval": {
                "lower": round(max(0, prob - 1.96 * math.sqrt(prob * (1 - prob) / trials)), 4),
                "upper": round(min(1, prob + 1.96 * math.sqrt(prob * (1 - prob) / trials)), 4)
            },
            "basis": "V11.0 Monte Carlo Simulator (1000 trials, 95% CI)"
        }

    @staticmethod
    def colony_growth_simulation(
        initial_wealth: float = 1000.0,
        growth_rate: float = 0.02,
        volatility: float = 0.05,
        ticks: int = 100,
        resonance: float = 0.7
    ) -> Dict:
        """
        Simulate colony wealth growth over time.
        Uses geometric Brownian motion with resonance modulation.
        """
        wealth = initial_wealth
        history = [wealth]

        for t in range(1, ticks + 1):
            # Resonance modulates growth
            resonance_mod = 1 + 0.3 * resonance * math.sin(t / 10)
            noise = random.gauss(0, volatility)
            growth = growth_rate * resonance_mod + noise
            wealth = wealth * (1 + growth)
            wealth = max(0.1, wealth)
            history.append(round(wealth, 2))

        return {
            "initial_wealth": initial_wealth,
            "final_wealth": round(wealth, 2),
            "total_growth_pct": round((wealth / initial_wealth - 1) * 100, 2),
            "wealth_history": history,
            "ticks": ticks,
            "growth_rate_used": growth_rate,
            "volatility_used": volatility,
            "resonance_input": resonance,
            "basis": "V11.0 Colony Growth Simulator (Geometric Brownian Motion)"
        }

    @staticmethod
    def hyperparameter_optimization(
        param_grid: Dict,
        objective: str = "minimize_loss",
        n_trials: int = 50
    ) -> Dict:
        """
        Simple hyperparameter optimization using random search.
        """
        best_params = None
        best_score = float('inf') if objective == "minimize_loss" else -float('inf')

        for _ in range(n_trials):
            # Sample random parameters from grid
            params = {}
            for key, values in param_grid.items():
                params[key] = random.choice(values)

            # Simulate training (placeholder — replace with actual evaluation)
            score = random.uniform(0.1, 0.9)  # Placeholder

            if objective == "minimize_loss" and score < best_score:
                best_score = score
                best_params = params
            elif objective == "maximize_accuracy" and score > best_score:
                best_score = score
                best_params = params

        return {
            "best_params": best_params,
            "best_score": round(best_score, 4),
            "trials": n_trials,
            "objective": objective,
            "basis": "V11.0 Random Search Hyperparameter Optimizer"
        }

simulator = DigitalTwinSimulator()
