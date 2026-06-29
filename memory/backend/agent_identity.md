# agent_identity

Agent Identity — Ed25519 key generation, action signing, and verification.

## Classes

- `AgentIdentity` — Manages Ed25519 cryptographic identities for agents.

## Functions

- `generate_keypair()` — Generate a new Ed25519 keypair. Returns (private_key_pem, public_key_pem).
- `sign_action()` — Sign an action dict with the agent's private key.
- `verify_action()` — Verify an action signature against the agent's public key.
- `compute_action_hash()` — Compute SHA-256 hash of an action for audit chain.

## Links

[[database]]
