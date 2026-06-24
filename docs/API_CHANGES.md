# API Changes Log

## v9.0.0 (Current)

### New Endpoints

#### LLM Router
- `GET /llm/status` – Show active provider
- `POST /llm/switch` – Switch provider

#### Wallet
- `POST /wallet/create/{agent_name}` – Create wallet
- `GET /wallet/{agent_name}` – Get balance
- `POST /wallet/tip` – Transfer SOUL
- `POST /wallet/credit` – Credit SOUL
- `GET /wallet/leaderboard/soul` – Top holders

#### Reproduction
- `GET /agents/compatibility` – Genome similarity
- `POST /agents/reproduce` – Spawn child
- `GET /agents/genealogy/{name}` – Mythology ledger

#### Tasks
- `GET /tasks` – List all tasks
- `PUT /tasks/{id}/complete` – Complete + reward

## v8.0.0

### Added
- SOUL Token (ERC-20)
- Phaser Town Hall v2
- Genome Reproduction

## v7.0.0

### Added
- LLM Router (Ollama → Claude)
- Agent Wallets
- ELO Leaderboard
