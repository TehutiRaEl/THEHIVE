# Security Deep Pass — Edge Worker `/v11`

**Author:** Grok (Detective)  
**Updated:** 2026-07-30  
**PR:** #132  
**Policy locked:** D5 founder-key default for *new* state-changers Grok builds; D6 checklist on this PR.

---

## Plain language layers

| Layer | What it does |
|-------|----------------|
| **CORS allowlist** | Only listed browser origins can *read* cross-origin responses from page JS |
| **Rate limit** | ~30 POSTs / IP / minute (KV if bound, else D1; fails open on infra errors) |
| **Visitor token** (`tokenOk`) | Bearer from `GET /auth/token`; **fails open** if `WORKER_ADMIN_KEY` unset (dev) |
| **Founder key** (`founderAuthOk`) | Must match `FOUNDER_KEY` secret; **fails closed** if secret unbound |
| **Admin key** | `WORKER_ADMIN_KEY` for admin export / grok-token store |
| **Grok bridge key** | `X-Grok-Key` hashed lookup for bridge PAT retrieval |

---

## Write / sensitive endpoints

| Method + path | Gate today | Risk if abused |
|---------------|------------|----------------|
| `POST /auth/token` | Open (issues visitor token) | Token spam; mitigated by rate limit on other POSTs |
| `POST /proposals` | `tokenOk` | Creates suggestions only; does not decide |
| `POST /proposals/{id}/decide` | **`founderAuthOk` (fail closed)** | Approves/rejects evolution proposals |
| `POST /venture/plan` | `tokenOk` | LLM cost / spam; no real-world execution |
| `POST /legal/research` | `tokenOk` | LLM cost / spam |
| `POST /automaton/infer` | `tokenOk` | LLM cost / spam |
| `POST /command_text` | **`rateLimitOk` (S1 PR #132)** | LLM cost / spam if providers bound |
| `POST /files/upload` | `tokenOk` + R2 bound + 10MB cap | Storage abuse if R2 live |
| `POST /memory/remember` | **`rateLimitOk` (S1 PR #132)** | Writes to Vectorize if bound |
| `POST /arena/challenge` | rate limit + `tokenOk` | Arena spam |
| `POST /arena/resolve/{id}` | rate limit + `tokenOk` | Elo/soul mutation |
| `POST /arena/project/{id}` | rate limit + `tokenOk` | Projection write |
| `GET /admin/d1-export` | `WORKER_ADMIN_KEY` via `X-Admin-Key` | Full data snapshot |
| `POST /admin/grok-token` | body `admin_key` == `WORKER_ADMIN_KEY` | Stores GitHub PAT in D1 |
| `GET /bridge/grok-token` | `X-Grok-Key` / hash match | Returns stored PAT |

---

## S1 status (2026-07-30)

Rate limit applied to `POST /command_text` and `POST /memory/remember` using existing `rateLimitOk` (see `docs/S1_RATE_LIMIT_PATCH.md` for exact inserts). Same 30/min/IP as arena; fail-open on infra errors.

Optional later: **S2** require `tokenOk` on `/command_text` when `WORKER_ADMIN_KEY` is set.

---

## Findings (honest)

1. **Founder decide path is correctly strict** — matches D5 spirit for high-stakes actions.  
2. **`tokenOk` fails open without `WORKER_ADMIN_KEY`** — intentional for dev; production should keep admin key bound.  
3. **Bridge stores a GitHub PAT in D1** — high sensitivity; rotate PAT if exposed.  
4. **Secrets never returned** on `/debug/env` (presence only) — good F-001 hygiene.  
5. **Grok new endpoints policy:** any *new* state-changing route defaults to founder-key unless founder opens it (D5).
