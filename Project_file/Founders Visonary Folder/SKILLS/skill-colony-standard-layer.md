# SKILL: Colony Standard Layer (add/upgrade a colony)
Origin: Sonnet + Fable, 2026-07-05 (capabilities wave PRs; HMAC parity fixes)
Use when: onboarding a new colony repo or bringing one to parity.
Steps:
1. Endpoints: /colony/{health,info,manifest,events,agents,capabilities}. Python: mount `make_colony_router(ColonyConfig(...))` from colony_sdk.py. Node: mirror the zero-dep handler map.
2. `capabilities` = colony.json identity + status/uptime_s/soul_md_hash + endpoint pointers (Queen-parity shape).
3. POST /colony/events MUST verify `X-Hive-Signature` (HMAC-SHA256 of raw body, key HIVE_JWT_SECRET) — permissive ONLY when the secret is unset; timingSafeEqual/compare_digest.
4. constitution-receive.yml from the template (Queen URL = THEHIVE/main/soul.md).
Gotchas: repos with TWO servers (python+node, express+sidecar) drift — audit BOTH for the HMAC contract; colony.json path resolves relative to the SDK file, try ./ then ../.
