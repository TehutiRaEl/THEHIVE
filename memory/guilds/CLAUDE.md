# Guilds — Navigation Guide

## What Lives Here

One knowledge page per guild (12 total). Each page has: guild purpose, responsible module,
relevant `/v11/*` endpoints, and current UI representation status.

## Guild Registry

| Guild | Module | Key Endpoints | UI Tab |
|-------|--------|--------------|--------|
| Academy | backend/guilds/ | /v11/knowledge/* | None yet |
| Arcane | backend/guilds/ | /v11/ml/* | None yet |
| Arena | backend/tier3/arena_renderer.py | /v11/arena/* | ARENA tab |
| Audit | backend/audit_chain.py | /v11/governance/log | GOVERN tab |
| Commerce | backend/economy/ | /v11/wallet/*, /v11/staking/* | SOUL tab |
| Constitutional | backend/core/constitution.py | /v11/constitution/* | GOVERN tab |
| Dream | backend/tier2/dream_engine.py | /v11/dream/* | None yet |
| Frequency | backend/resonance.py | /v11/frequency/* | FREQ tab |
| Security | backend/core/hive_mesh.py | HMAC colony layer | Backend only |
| Treasury | backend/economy/wealth.py | /v11/wealth/* | SOUL tab (partial) |
| Workflow | automatisch integration | via colony events | Automatisch UI |
| Worldbuilding | backend/tier2/dream_engine.py | — | None yet |

## Guild Gaps (Frontend work — Mistral's domain)

Dream, Arcane, Worldbuilding, and Academy have zero UI representation. The Arcane guild
maps to the ML Observatory (ARCANE tab in Mistral's vision). The Dream guild and
Worldbuilding guild have full backends but no frontend. Do not build UI here — flag to Mistral.
