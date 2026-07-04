# Sovereign Hive — Reconstructed State (2026-07-04)

The original planning doc (`heres-my-last-session-expressive-ladybug.md`) did not survive the
container reset — it was never committed anywhere. Everything below is reconstructed by reading
what's actually committed across the ten repos, not recalled from the lost file.

## 1. UI inventory — confirmed in code

THEHIVE ships **three** separate frontends, which is where "13 tabs" comes from:

| Surface | File | Tabs / content |
|---|---|---|
| Command Center (Pages) | `docs/index.html` | 13 tabs: world, chat, agents, arena, freq, soul, tasks, gov, llm, hive, graph, memory, debug |
| Production Command Center | `frontend/index.html` | 10 tabs (no graph/memory/debug) |
| SEE / JASPER | `frontend/see-app.html` | 9-tile picker iframing `/ui/index` |

Confirmed sub-features:
- **D3 force graph** (GRAPH tab) — fed by committed `memory/_graph.json`.
- **Colony Zoom Panel** — real, `docs/index.html` + `backend/api/colony.py:166`, live-pings `/colony/health`.
- **Phaser world** — `frontend/js/phaser_scene_v2.js` + embedded scene in `docs/index.html` (day/night, weather, landmarks).
- **Three.js "CortanaHead"** — particle face driven by Schumann/ELO/SOUL params (a real 3rd 3D visual, not previously named).
- **Tesseract math** — `tesseract/tesseract_model.py`, `backend/tier3/tesseract_model.py`, documented in `docs/MATHEMATICAL_TEARDOWN.md` §19.
- **Arena voxel stream** — **backend exists, frontend does not**. `backend/tier3/arena_renderer.py` (`ColonyState` 16×16×8 grid, delta streaming) is live at `GET /arena/render/voxels/{colony}`, but the ARENA tab in every frontend only renders challenge cards — no canvas is wired up. **This is a real, concrete, actionable gap.**

## 2. Role-tagging convention — confirmed exactly

`THEHIVE/docs/ROLES.md`: **101 roles / 10 tiers + 9 Federation AI Session Roles (#102–110) = 110 roles total.**
Commit convention (`docs/GOVERNANCE.md`):
```
[ROLE: <Role Title>] type(scope): description
Rationale: <one sentence>
```
Real examples: `[ROLE: Federation Engineer]`, `[ROLE: Security Engineer]`, `[ROLE: Performance Engineer]`, `[ROLE: Governance Kernel]`. Each colony's `docs/GOVERNANCE.md` links back to THEHIVE's canonical `ROLES.md` rather than duplicating it.

## 3. Gaps / roadmap — no consolidated doc; two false leads to avoid

- `backend/core/genesis.py::GapDetector` — an in-narrative constitutional feature (finds under-explored graph nodes), not a project-planning list.
- `docs/phases.md` (Phase 0–8, "Spore"→"Infinite") is a **narrative game-progression ladder**, separate from the git-history "Phase 2/3/5/6/7/F" delivery phases seen in merge commits. Don't conflate the two.

No 25-item/6-category gap list exists as a document. The one category with a real trace: `claude/federation-intelligence` is an actual merged branch (PR #16, capabilities endpoint + SSE + zoom panel). "New territories" plausibly maps to stale placeholder entries in `.queen/hive.yml` (`n8n`, `postgres`, `redis`, `ml-pipeline` — unconfigured, aspirational).

## 4. Philosophical lenses — confirmed exactly, in `THEHIVE/memory/philosophy/`

- `dual-lens-framework.md` — every architecture decision must pass both lenses.
- `devils-advocate.md` — 10-step interrogation ("single point of failure?", "simpler path?").
- `childlike-wonder.md` — 5-step expansion ("what would make someone gasp?").
- `alchemical-process.md` — 4-stage (Nigredo/Albedo/Citrinitas/Rubedo) process for absorbing external repos.

## 5. Constitution / governance — confirmed, extensive

- `soul.md` (root, master) / `.queen/soul.md` — F-001–F-006 constitution, 14-layer architecture, named entities (Ma'at, Nanuet/MATER, Kai El/PATER, Solomon, the Daemon).
- `docs/GOVERNANCE.md` — advisory-only federation convention, enforced via `.github/workflows/governance-advisory.yml` (`continue-on-error: true` — never blocking).
- Each colony syncs `soul.md`/`colony.json` from the Queen via `constitution-sync.yml`.

## 6. Standing constraints — confirmed

- **Free tier only**: Oracle Cloud Always Free (4 ARM cores/24GB), all LLM providers free-tier.
- **Working branch**: `claude/session-continuation-owj5wr` referenced across colonies' governance docs; current checkout everywhere is `claude/fable-5-handoff-setup-t4s64n`.
- **PR policy**: no standalone doc — enforced via `GOVERNANCE.md` principles ("no silent destructive action," "human approval for cross-repo changes") and the advisory workflow.
- **HMAC permissive mode**: confirmed verbatim in `colony_sdk.py`/`colony.js` across NAR2, 4DBRAIN, Kimi-K2, automatisch — skips verification when no secret is configured.

## The one clear, scoped, actionable item

**LocalAGI is the only colony without merged HMAC-SHA256 verification** on `/colony/events`. NAR2, 4DBRAIN, automatisch, and Kimi-K2 all merged this (`[ROLE: Security Engineer]` commits, PRs #3/#4). LocalAGI PR #3 (open, `claude/session-continuation-owj5wr`) is exactly this fix, still pending merge. THEHIVE PR #20 (open, same branch) is the repo-description workflow, also just waiting on `secrets.PAT` + a manual trigger.

## What's unverified / aspirational

`docs/MATHEMATICAL_TEARDOWN.md` describes quantum/crypto/VSA math (Shamir's Secret Sharing, BB84 QKD, Grover's search, quaternion SLERP, Ollivier-Ricci curvature) with standalone modules (`quantum/quantum_bridge.py`, `sheaf/sheaf_guild.py`, `pubsub/ipfs_pubsub.py`) that were **not verified as wired into the main FastAPI route table**. Treat as aspirational until checked.
