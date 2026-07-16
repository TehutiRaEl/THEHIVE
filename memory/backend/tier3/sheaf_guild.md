# tier3/sheaf_guild

SHEAF GUILD — Sovereign Hive v11.0 Tier 3

## Classes

- `ShamirSSS` — Split a secret s into n shares such that any t shares reconstruct s.
- `GuildKeyManager` — Manages Shamir share distribution for each guild.
- `SheafCipher` — XOR stream cipher using guild key.
- `GuildMessenger` — Send encrypted messages within a guild.

## Functions

- `split()` — Split secret into n shares, t required to reconstruct.
- `reconstruct()` — Lagrange interpolation to recover f(0) = secret.
- `verify_share()` — Verify that a share is consistent with a t-subset reconstruction.
- `create_guild_key()` — Generate a new key for a guild, distribute shares to members.
- `get_member_share()` — Retrieve a member's share (their stalk).
- `reconstruct_key()` — Reconstruct the guild's symmetric key from t member shares.
- `verify_stalk()` — Sheaf condition: verify member's stalk is consistent.
- `encrypt()` — Returns (ciphertext, iv, mac).
- `decrypt()` — Returns plaintext or None if MAC fails.
- `setup_all_guilds()` — Initialize SSS keys for all guilds.
- `send()` — Encrypt and send a guild message.
- `receive()` — Decrypt message if enough shares presented.
- `list_topics()` — Public ledger: topics only, no content.
- `request_cross_guild()` — City Hall consent mechanism for cross-guild queries.
- `approve_cross_guild()` — City Hall approves or denies cross-guild access.

## Links

[[core.config]]
