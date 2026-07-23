# Phase H — Deploying the federation for real (founder runbook)

*Prepared 2026-07-23 at the founder's "go for phase 8" (Phase H being the parked 8th phase
of the colony deep-integration plan). Everything below is prepared up to the credential
boundary: the steps marked **[YOU]** need your Render/Vercel account — Tier 3, founder-only
per PERMISSIONS.md — and everything else is already committed and waiting.*

## What already exists (no work needed)

| Repo | Blueprint | Entry point | Health check |
|---|---|---|---|
| THEHIVE (System A Queen) | `render.yaml` (since the boot-sequence pass) | `uvicorn backend.main:app` | `/v11/health` |
| 4DBRAIN | `render.yaml` (pre-existing) | `cd backend && uvicorn main:app` | add `healthCheckPath: /colony/health` when deploying |
| NAR2 | `render.yaml` (added this pass) | `cd backend && uvicorn main:app` | `/colony/health` |
| aether | `render.yaml` (added this pass, docker runtime) | Dockerfile → `node server.js` | `/api/colony/health` |
| automatisch | upstream's own Docker deployment (AGPL fork) | `docker compose up` per upstream docs | `/colony/health` (Express route) |
| Kimi-K2 | not blueprinted yet — Python app, same shape as NAR2/4DBRAIN | `uvicorn main:app` | `/colony/health` |
| LocalAGI | Go binary / upstream Docker image | per upstream README | `/colony/health` |

## The one secret that binds the mesh

Every colony verifies `X-Hive-Signature` (HMAC-SHA256 over the raw body) against the env var
**`HIVE_JWT_SECRET`** — one shared value across the whole federation, and it must equal the
Queen's own `JWT_SECRET_KEY` (System A signs outbound dispatches with `settings.jwt_secret_key`
in `backend/core/hive_mesh.py`). Generate once, set everywhere:

```bash
openssl rand -hex 32
```

While the secret is **unset**, every colony's `/colony/events` is deliberately permissive
(accepts unsigned events) — fine for testing, not for staying live. Set it on day one.

## Deploy order

1. **[YOU] Queen first** — Render → New → Blueprint → `TehutiRaEl/THEHIVE`. Accept defaults.
   Set `JWT_SECRET_KEY` to the shared secret. Note the URL (e.g.
   `https://thehive-queen.onrender.com`). Free-tier: sleeps after 15 idle min; SQLite state
   is ephemeral (resets on redeploy) — acceptable for the simulation-economy phase.
2. **[YOU] Colonies, any order** — same Blueprint flow for `NAR2`, `4DBRAIN`, `aether`.
   Set `HIVE_JWT_SECRET` on each. (4DBRAIN's blueprint predates the colony work — when
   Render prompts, also add `HIVE_JWT_SECRET` there; its `render.yaml` doesn't list it yet.)
   - **NAR2 honest warning**: its requirements pull torch via sentence-transformers plus
     playwright/chromadb/faiss — the free tier may fail the build or OOM. If it does, the
     right fix is a slim `requirements-deploy.txt` with the heavy imports guarded (a real
     follow-up task for a session, ~an hour — ask and it will be built and verified).
   - automatisch / Kimi-K2 / LocalAGI can wait — the mesh degrades gracefully (skipped/
     circuit-open) for colonies that aren't up yet. Deploy them whenever.
3. **[YOU] Point the Queen at the colonies** — on the Render service for THEHIVE, add env vars:
   ```
   NAR2_URL        = https://nar2-colony.onrender.com
   FOURDBRAIN_URL  = https://4d-brain-api.onrender.com
   AETHER_URL      = https://aether-colony.onrender.com/api   ← note the /api suffix:
                     aether's colony routes live at /api/colony/* (Next.js app router),
                     and hive_mesh appends /colony/... to this base
   ```
   (Leave `AUTOMATISCH_URL`/`KIMI_K2_URL`/`LOCALAGI_URL` at their localhost defaults until
   those are actually up — health-gating handles it.)
4. **Verify (a session can do this part on request)** — from any machine:
   ```bash
   curl https://thehive-queen.onrender.com/v11/hive/status         # Queen sees colonies
   curl https://nar2-colony.onrender.com/colony/health              # each colony alive
   # signed round-trip: POST /v11/hive/dispatch with event_type=ping (Tier-1-safe,
   # passes the hive_mesh tier gate) and confirm per-colony event_ids come back
   ```
   The `edge-health-probe` workflow remains the eyes on the Worker (System B); System A and
   the colonies get their live verification through `/v11/hive/status` once deployed.
   `.claude/skills/agent-harness/scripts/colony_verify.py` is the structural check and is
   already flagged for upgrade to live-probe mode once URLs exist (its own docstring says how).

## What this unlocks once done

- `hive_mesh.dispatch()` fans out to real colonies instead of localhost — with the Phase F
  tier gate, only Tier-1-safe events fire autonomously; everything else queues for you (HITL).
- The MCP server (`backend/mcp_server/`) becomes attachable by LocalAGI agents against a real
  public Queen (Phase E's "Tier 2 once publicly reachable" condition).
- automatisch's `apps/thehive/` trigger can receive real `task_dispatch` events end to end
  (Phase D's done-when), pending its own deploy + the founder flipping that flow on.

## Explicitly NOT done here

- No accounts created, nothing deployed, no money spent — every **[YOU]** step above is
  untouched, per PERMISSIONS.md Tier 3.
- Kimi-K2/LocalAGI/automatisch blueprints — deferred until the first three prove the loop.
- NAR2's slim deploy requirements — flagged above, built on request if the free tier chokes.
