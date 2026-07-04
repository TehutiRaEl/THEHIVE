# Sovereign Hive — Master Plan (2026-07-04)

Written from scratch from verified repo state, per the standing instruction that the new
session author the entire plan anew. The previous planning document was lost with its
ephemeral container; see [[reconstructed-state-2026-07-04]] (PR #21) for the forensic
reconstruction this plan builds on. **Continuity protocol, rule zero: plans live here, in
`memory/planning/`, committed and pushed — never only in a session container.**

Every item below passed both lenses of [[dual-lens-framework]]:
**devil's advocate** (what breaks, what's fake, what's the simpler path) and
**childlike wonder** (what would make someone gasp, what could this become).

---

## 1. State of the hive — verified, not remembered

| Layer | Real and wired | Scaffolding (exists, unwired) | Aspirational |
|---|---|---|---|
| Governance | soul.md F-001–F-006, advisory CI (`governance-advisory.yml`), ROLES.md (110 roles), GOVERNANCE.md commit convention | — | — |
| Federation | colony health/info/events across 6 colonies, HMAC in NAR2/4DBRAIN/automatisch/Kimi-K2, `/colony/capabilities`, Colony Zoom Panel | `_sse_publish` event bus (first publisher lands in Milestone 1), LocalAGI HMAC (PR #3 open) | `.queen/hive.yml` placeholder colonies (n8n, postgres, redis, ml-pipeline) |
| UI | `docs/index.html` 13 tabs (Phaser world, D3 graph, CortanaHead), `frontend/index.html` 10 tabs, `see-app.html` 9 tiles | Arena voxel viewer (wired in Milestone 1) | GitHub Pages → production backend (no URL committed) |
| Economy/Arena | GladiatorArena challenge/resolve/bet/fallen/resurrect, SOUL wallet, staking | ArenaProjectionEngine voxel sim (wired in Milestone 1) | — |
| Math/Tier 3 | tesseract model (tests exist); quantum/sheaf/pubsub/tesseract/voxel wired behind guarded imports with truthful `/v11/tier3/status` (Milestone 4, this branch) | — | MATHEMATICAL_TEARDOWN.md claims beyond the modules |

## 2. Gap register — each traced to evidence

1. **Arena voxel engine orphaned end-to-end** — `backend/tier3/arena_renderer.py` imported by
   nothing; ARENA tab button called nonexistent `POST /arena/run/{id}`; `GET /v11/arena/history/{id}`
   read a table nothing wrote. → **Closed by Milestone 1 (this branch).**
2. **SSE bus had no publisher** — `_sse_publish()` (`backend/api/routes.py`) defined, never called.
   → First publishers (`arena_frame`, `arena_resolved`, `arena_projection_complete`) land in Milestone 1.
3. **No frontend SSE consumer** — realtime is WebSocket-only; `EventSource` appears nowhere.
4. **GitHub Pages UI cannot reach a production backend** — `docs/index.html` backend probe
   excludes `github.io` origin and falls back to localhost; no `window.JASPER_BACKEND` is injected
   anywhere. The public Command Center is a beautiful offline splash.
5. **Tier 3 math modules unverified** — quantum/sheaf/pubsub modules exist with unit tests but
   `/v11/tier3/status` reports all "Not loaded". → **Closed by Milestone 4 (this branch)**: all five
   modules route-wired behind guarded imports (`/v11/quantum/*`, `/v11/sheaf/*`, `/v11/pubsub/*`,
   `/v11/tesseract/*`, `/v11/arena/render/voxels/{colony}`); status endpoint now reports truth.
6. **`frontend/index.html` is a stale parallel build** of `docs/index.html` — drift risk, double
   maintenance; ARENA exists there only as a Phaser zone.
7. **`.queen/hive.yml` placeholder colonies** (n8n, postgres, redis, ml-pipeline) are drawn as world
   zones in the UI but have no configuration behind them.
8. **LocalAGI is the only colony without merged HMAC verification** — PR #3 open, awaiting merge.
9. **Repo descriptions unset** — THEHIVE PR #20's workflow is ready; needs `secrets.PAT` + manual run.
10. **Session continuity was a single point of failure** — the lost briefing proved it. This
    document and its successors are the fix.
11. **Frontend/backend drift** (found while verifying Milestone 1 in a real browser): the Command
    Center calls `/v11/auth/token`, `/v11/agents`, `/v11/governance/log`, `/v11/llm/status`,
    `/v11/wallet/leaderboard/soul` — none exist in `backend.main`'s route table, and the `/ws`
    handshake answers 403 — the UI was built against the retired `jasper_v9_complete` entrypoint.
    `tests/integration/test_tier3.py` imported that same dead module, aborting the whole advisory
    integration collection — **rewritten against `backend.main` in Milestone 4 (this branch)**;
    the remaining UI-endpoint drift folds into Milestones 3 and 5.

## 3. Roadmap

### Milestone 1 — Arena voxel projection, end-to-end ✅ (this branch)
**[ROLE: Performance Engineer]** tier3 persistence + stable seeds · **[ROLE: Federation Engineer]**
`POST /v11/arena/project/{id}` + `GET /v11/arena/projection/{id}/frames` + first SSE publishers ·
**[ROLE: Frontend Engineer]** Three.js `VoxelArenaViewer` in the ARENA tab, resolve button fixed ·
**[ROLE: Test Engineer]** `tests/test_arena_projection.py`.
*Devil's advocate*: projection must never decide outcomes — GladiatorArena stays authoritative;
free-tier guards (tick clamp 1–60, delay clamp ≤0.3s, concurrent-run set).
*Childlike wonder*: two living colonies grow voxel by voxel as ideas do battle — TITLE XII made visible.

### Milestone 2 — Let the world watch: SSE consumer + live feed ✅ (this branch)
Wire an `EventSource` client into `docs/index.html` (auth-free endpoint, ~15 lines), surface
`arena_frame`/`arena_resolved`/`task_completed` in the chat feed, and publish economy + agent-birth
events through `_sse_publish` at their source. *DA*: SSE behind nginx may need `X-Accel-Buffering: no`.
*CW*: the hive narrates itself in real time.

### Milestone 3 — Take the Command Center public (entry hook ✅: `?backend=` override)
Commit a `window.JASPER_BACKEND` injection mechanism (a `docs/config.js` generated by deploy CI, or
query-param override) so GitHub Pages can point at the Oracle free-tier backend; CORS list update in
`backend/core/config.py`. *DA*: never hardcode a secret; health-probe timeout already handles outages.
*CW*: strangers can watch the arena from a URL.

### Milestone 4 — Tier 3 truth audit ✅ (this branch)
All five tier3 modules (quantum_bridge, sheaf_guild, ipfs_pubsub, tesseract_model, arena_renderer)
wired behind guarded imports with settings-based DB paths; new routes `/v11/quantum/{qrng,bb84,
ibmq/status,encode}`, `/v11/sheaf/{guilds,setup/all}`, `/v11/pubsub/{channels,channel}`,
`/v11/tesseract/{status,forecast}`, `/v11/arena/render/voxels/{colony}`; `/v11/tier3/status`
derives every line from the real import result. Legacy integration suite rewritten and green.
*DA*: aspirational docs rot into lies — status now cannot disagree with reality.
*CW*: the math teardown became a demo menu you can curl.

### Milestone 5 — One frontend to rule them
Fold `frontend/index.html`'s unique features into `docs/index.html` (or an explicit build step),
then retire the stale copy. *DA*: three hand-maintained 70KB HTML files is how bugs breed.
*CW*: every improvement lands everywhere at once.

### Milestone 6 — Colony intelligence round-out
LocalAGI HMAC (merge PR #3), then capabilities endpoints + zoom-panel parity for NAR2/4DBRAIN/
Kimi-K2/automatisch mirroring THEHIVE's `/colony/capabilities`. Placeholder colonies in
`.queen/hive.yml` either get real configs or move to an "aspirational" block the UI renders as
under construction. *DA*: a registry that lists fiction breaks federation trust.
*CW*: zoom into any colony and see a living dashboard.

## 4. Standing constraints (unchanged, re-affirmed)

- **Free tier only** — Oracle Cloud Always Free (4 ARM cores / 24 GB), SQLite, free-tier LLM
  providers via the Kimi gateway waterfall.
- **Branch/PR policy** — feature branches per session (`claude/…`), one PR to `main`, ready for
  review, role-tagged commits per GOVERNANCE.md; no silent destructive action; human approval for
  cross-repo changes.
- **HMAC permissive mode** — colonies skip signature verification when no secret is configured;
  production hardening = set `HIVE_JWT_SECRET` everywhere, flip nothing in code.
- **Advisory-only governance** — CI advises (`continue-on-error: true`), never blocks.

## 5. Continuity protocol

1. Every session that plans, commits the plan here before its container dies.
2. Plans reference their predecessors by wiki-link, forming a chain the memory graph can index.
3. A session inheriting a lost plan reconstructs from repo evidence first (see
   [[reconstructed-state-2026-07-04]]), memory second, and marks unverifiable claims as such.

## Links

[[reconstructed-state-2026-07-04]] · [[dual-lens-framework]] · [[devils-advocate]] ·
[[childlike-wonder]] · [[alchemical-process]] · [[soul.md]]
