# SKILL: Push work from Grok's sandbox (the bridge)
Origin: Sonnet 4.6, 2026-07-09, PR #38 + docs/GROK_BRIDGE.md
Use when: Grok (or any sandboxed member with one env var) needs to land commits/analysis in the hive.
Steps:
1. One-time (Founder): set WORKER_ADMIN_KEY (Cloudflare Worker secret + GitHub secret), GROK_BRIDGE_KEY (GitHub secret), run grok-pat-distribute.yml, hand GROK_BRIDGE_KEY to Grok.
2. Grok: `export GROK_BRIDGE_KEY=<value>` then `python scripts/grok_push.py ...` — it fetches the PAT from the Worker (GET /bridge/grok-token, key sent as SHA-256) and dispatches to GitHub.
3. Verify: workflow run appears in THEHIVE Actions; D1 table grok_bridge_tokens holds the relay row.
Gotchas: PAT sits PLAINTEXT in D1 (known debt — AES-GCM upgrade is queued); rotating the PAT = rerun distribute workflow; never commit the bridge key anywhere.
