# core/wallet

Wallet Manager — Sovereign Hive v11.0

## Classes

- `WalletManager` — Generates and stores deterministic Ethereum wallets for each agent.

## Functions

- `create_wallet()` — Generate a new Ethereum wallet for an agent. Idempotent.
- `credit()` — Credit SOUL to agent (off-chain ledger).
- `debit()` — Debit SOUL from agent (off-chain ledger).
- `tip()` — Transfer SOUL between agents.
- `get_balance()` — Get agent's wallet balance.
- `leaderboard()` — Get top SOUL holders.
- `get_total_supply()` — Get total SOUL in circulation (100% reserve check).
- `get_treasury_balance()` — Get treasury SOUL balance.
- `get_trust_balance()` — Get irrevocable trust SOUL balance.
- `transfer()` — Alias for tip() — compatibility.
- `get_wallet_address()` — Get wallet address for an agent.
- `wallet_exists()` — Check if an agent has a wallet.
- `get_all_wallets()` — Get all wallets.
- `delete_wallet()` — Delete a wallet (use with caution — only for testing).

## Links

[[core.config]] · [[core.db]]
