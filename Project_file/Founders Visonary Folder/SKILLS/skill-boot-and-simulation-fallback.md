# SKILL: Boot sequence + in-browser simulation fallback
Origin: Fable 5, 2026-07-07, PR #25 — port target: Mistral's React app
Use when: any UI that depends on a backend that might be cold, missing, or unregistered.
Steps:
1. First paint = boot overlay (brand pulse + progress). Probe candidates in order: explicit ?backend= (persist to localStorage; 'clear' forgets) → own origin → known production URL → localhosts.
2. If a remote is configured, WAKE-LOOP up to 75s (free-tier cold starts) with progress feedback.
3. All probes fail → enter SIMULATION: an in-memory handler serving the same JSON shapes as /v11 (agents, leaderboards, arena incl. client-side frame generation). Banner the mode. Auto-issue a token; skip WS/SSE.
4. Auto-auth on boot-done event — zero clicks to enter.
Gotchas: the app must dispatch/await a boot-done event so state managers don't race the probe; simulation keeps demo state in memory only; never let the link dead-end at an error splash — that's the whole point.
