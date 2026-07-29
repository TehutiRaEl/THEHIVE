# Security Deep Pass — Edge Worker `/v11`

**Author:** Grok (Detective)  
**Date:** 2026-07-29  
**PR:** #132  
**Policy locked:** D5 founder-key default for *new* state-changers Grok builds; D6 checklist on this PR.

This is an inventory of **what exists today**, not a claim that every path is perfect.

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
| `POST /command_text` | **No tokenOk** (open POST) | LLM cost / spam if providers bound |
| `POST /files/upload` | `tokenOk` + R2 bound + 10MB cap | Storage abuse if R2 live |
| `POST /memory/remember` | **No tokenOk** | Writes to Vectorize if bound |
| `POST /arena/challenge` | rate limit + `tokenOk` | Arena spam |
| `POST /arena/resolve/{id}` | rate limit + `tokenOk` | Elo/soul mutation |
| `POST /arena/project/{id}` | rate limit + `tokenOk` | Projection write |
| `GET /admin/d1-export` | `WORKER_ADMIN_KEY` via `X-Admin-Key` | Full data snapshot |
| `POST /admin/grok-token` | body `admin_key` == `WORKER_ADMIN_KEY` | Stores GitHub PAT in D1 |
| `GET /bridge/grok-token` | `X-Grok-Key` / hash match | Returns stored PAT |

---

## Findings (honest)

1. **Founder decide path is correctly strict** — matches D5 spirit for high-stakes actions.  
2. **`tokenOk` fails open without `WORKER_ADMIN_KEY`** — intentional for dev; production should keep admin key bound so visitor tokens matter.  
3. **`POST /command_text` and `POST /memory/remember` are weaker** than other writes (no visitor token). Acceptable for public commune if rate limits apply globally to POSTs — **verify rate limit runs on those paths** (currently rate limit is applied explicitly on arena POSTs; command_text may rely only on provider cost).  
4. **Bridge stores a GitHub PAT in D1** — high sensitivity; admin + grok key must stay secret; prefer rotating PAT.  
5. **Secrets never returned** on `/debug/env` (presence only) — good F-001 hygiene.  
6. **Grok new endpoints policy:** any *new* state-changing route on this lane defaults to founder-key unless founder opens it (D5).

---

## Recommended follow-ups (founder choose later)

| ID | Option | Why |
|----|--------|-----|
| S1 | Add rateLimitOk to `/command_text` and `/memory/remember` | Cheap anti-spam |
| S2 | Optionally require tokenOk on `/command_text` when `WORKER_ADMIN_KEY` set | Align with other writes |
| S3 | Leave as-is until traffic forces it | Lowest churn |

**Not done in this pass:** code changes to worker (docs only). Implementation waits on your pick of S1–S3.

---

## Relation to campaign

- Security baseline documented → **DID near-term spike (D7)** can start next without inventing auth policy.  
- A11y / M2 tokens remain available parallel tracks.
