# Agent Genome

Ed25519 public/private key pair forms the identity core. Traits encoded as HDC vectors.

## Fields

- `agent_id`: UUID
- `public_key`: Ed25519 hex
- `traits`: dict of float values (curiosity, persistence, creativity, etc.)
- `elo`: current ELO rating (default 1200)
- `guild`: primary guild membership
- `memory_id`: pointer to ChromaDB collection

## Inheritance

Spawning from a parent agent inherits 50% of parent traits with Gaussian noise (σ=0.1).

## Links

[[lifecycle]] · [[elo]] · [[agents/memory]] · [[hdc]] · [[SOUL-token]]
