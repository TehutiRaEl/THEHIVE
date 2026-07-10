# SKILL: Deploy/modify the unified Cloudflare Worker (UI + API + D1)
Origin: Fable 5, 2026-07-07, PR #27 (+ bot-PR #26 lesson)
Use when: touching worker/src/index.js, wrangler.jsonc, or docs/ assets in production.
Steps:
1. Root `wrangler.jsonc` is canonical: name `thehive`, main worker/src/index.js, assets docs/, D1 binding `thehive-queen` (70212689-5633-4c09-9e1d-ae6294ce19eb).
2. Push to main → Workers Builds auto-deploys. Assets answer GET page routes; EVERYTHING else hits the worker (/v11/*).
3. Verify: `curl <workers.dev URL>/v11/health` → healthy JSON; page boot screen enters LIVE (same-origin discovery).
Gotchas:
- NEVER merge Cloudflare's autoconfig bot PR — it writes a static-only config and severs the API (we closed #26).
- workers.dev URLs are DEAD until the account registers its subdomain (one-time dashboard step); 'server can't be found' = DNS, not your code.
- D1 batch() for multi-statement writes; frames table PK (challenge_id, tick).
