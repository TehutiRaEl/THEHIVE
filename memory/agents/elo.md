# ELO Rating System

Standard Elo rating (K=32) adapted for multi-agent arena battles and task competitions.

- Default rating: 1200
- K-factor: 32 (volatile early, 16 after 30 matches)
- Floor: 600 (below this = death trigger)
- Ceiling: uncapped

## Arena Application

`POST /v11/arena/battle` resolves a battle, updates both agents' ELO.

## Links

[[lifecycle]] · [[arena]] · [[genome]]
