# Access + Biosystem live-wire status — 2026-09-20

## Screenshot diagnosis (founder phone)

### 1. Proposals — PENDING (50)
Live surface shows F-007 / architect-proposal spam. Matches UNIFIED_PROPOSAL + PROPOSAL_COALESCENCE: coalesce, do not multiply. Stage 1 generator wire waits on green merges of #206/#207.

### 2. "Sign in as founder (Cloudflare Access)"
Message on `/v11/founder/login`:

> Cloudflare Access let this request through, but this Worker doesn't recognize it yet.
> Check that ACCESS_TEAM_DOMAIN / ACCESS_AUD / FOUNDER_EMAIL are set in wrangler.jsonc …

**Root cause (code-confirmed):** In `wrangler.jsonc` the Access `vars` block is still **commented out**. Access Application exists (request reaches the Worker), but `verifyAccessJWT()` fails closed without TEAM_DOMAIN + AUD + FOUNDER_EMAIL.

**This cannot be fixed by a repo-only PR** without the founder's real values:

1. Zero Trust → Access → Application for `thehive.sovereignhive.workers.dev` path `/v11/founder/*`
2. Copy **Audience (AUD)** tag and **team domain** (`<team>.cloudflareaccess.com`)
3. Set **FOUNDER_EMAIL** to the allow-listed email
4. Uncomment and fill `vars` in `wrangler.jsonc` (template already in file), redeploy

Until then: paste **FOUNDER_KEY** in the Proposals panel (Secrets Store binding already flipped). Approve/Reject still works that path.

### 3. Biosystem — "Demo Mode / JASPER backend"
`BiosystemOverlay` iframes `/biosystem.html` (docs asset). That HTML was built against legacy **JASPER** FastAPI on `localhost:8080`, which is not the live Queen.

**This PR:** rewires `HiveClient` to same-origin **`/v11`** (`/v11/llm/status`, `/v11/agents`, `/v11/proposals`, commune attempt). Removes "start JASPER backend" copy. Offline fallback remains honest when `/v11` is unreachable.

Research comments that cite historical JASPER SOUL.MD / arena.py are left as citations, not as a required process.

## CI / merge order

Open PRs: **#206** (Body tab), **#207** (Omnivore + coalescence), **#208** (related body branch), **#209** (this).

GitHub check-runs API returned **403 / pending with zero statuses** from this integration — **do not treat as green**. Founder: confirm green in the GitHub UI, then merge in order:

1. #206 Body tab + UNIFIED_PROPOSAL  
2. #207 Omnivore + coalescence  
3. #209 Biosystem live /v11 + this status doc  
4. Close or supersede #208 if duplicate of #206  

**Stage 1 proposal coalescence (worker generator)** starts only after those land green.

## Non-claims

- Access vars not invented or committed with placeholders that would break deploy  
- No money switch flipped  
- Biosystem live wire uses existing public `/v11` reads; does not claim every Brain/Body gauge is a real sensor
