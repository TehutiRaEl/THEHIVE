# Colonies — Navigation Guide

## What Lives Here

One knowledge page per Sovereign Hive colony. Each page has: colony role, base URL,
standard endpoints, guild assignments, and health status notes.

## Colony Registry (from .queen/hive.yml)

| Colony | Role | Port | Guilds |
|--------|------|------|--------|
| THEHIVE | core (Queen) | 8080 | constitutional, audit, treasury, frequency, arena |
| aether | revenue | 3000 | treasury, commerce |
| automatisch | automation | 3001 | workflow |
| kimi-gateway | llm | 8181 | — |
| NAR2 | security | 8000 | security |
| 4DBRAIN | knowledge | 8001 | academy, arcane |
| LocalAGI | swarm/agent | 8081 | swarm, workflow, agent |
| build-your-own-x | knowledge | — | academy |
| free-programming-books | knowledge | — | academy |
| freeCodeCamp | curriculum | — | academy |

## Standard Colony Endpoints (all active colonies expose these)

```
GET  /colony/health       → status, colony_id, timestamp
GET  /colony/info         → colony_id, name, role, archetype, layer, guilds
GET  /colony/manifest     → endpoints map
GET  /colony/agents       → agents list
GET  /colony/capabilities → capability discovery (sovereign-hive-v11)
POST /colony/events       → HMAC-signed event receiver (X-Hive-Signature header)
```

## How to Check a Colony

```bash
curl http://localhost:<port>/colony/health
curl http://localhost:8080/v11/hive/status  # THEHIVE aggregates all colonies
```
