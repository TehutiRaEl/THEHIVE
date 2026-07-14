# Sovereign Hive — Harness Plan (revised & compressed, 2026-07-10)

## ✅ COMPLETION RECORD — Phase E Worker Hardening (2026-07-14)

All Phase E items landed on `claude/session-continuation-owj5wr`:
- **`worker/src/index.js`** — `ensureTables()` + `rateLimitOk()` (D1 sliding window, 30 req/min/IP) + `tokenOk()` (visitor_tokens table, fail-open when WORKER_ADMIN_KEY unset) — wired to POST /arena/challenge, /arena/resolve/:id, /arena/project/:id; `/auth/token` now stores issued token in D1 with 1-hour TTL; `GET /admin/d1-export` (WORKER_ADMIN_KEY protected, exports 6 tables); `scheduled()` prunes expired tokens + stale rate rows each heartbeat
- **`.github/workflows/d1-backup.yml`** — weekly Sunday 03:00 UTC cron; hits WORKER_URL/v11/admin/d1-export with X-Admin-Key; uploads JSON artifact (90-day retention); also available on workflow_dispatch

**PR #82** — Phase E hardening.

---

## ✅ COMPLETION RECORD — HDC Unit Tests (2026-07-14)

- **`tests/unit/test_hdc.py`** — 68 tests across 17 classes covering all public methods of `HyperDimensionalComputing`: self-inverse unbind, orthogonality, bipolar unit norm, sequence/message encoding, role-filler extraction, serialize/deserialize round-trip, operation counting, production singleton.

---

## ✅ COMPLETION RECORD — Second/Third Brain Harness (2026-07-14)

All 5 commits from the second/third brain plan landed on `claude/session-continuation-owj5wr`:
- **Commit `e3ad056`** — Root CLAUDE.md + 8 per-folder nav docs + `.queen/CLAUDE.md`
- **Commit above** — `.claude/` harness: settings.json, 4 sub-agents, 9 slash commands, `/v11/brain/*` API (5 routes), memory-vault-update.yml CI
- **Continuation commit** — `.claude/memory/memory.md` (LangGraph+Obsidian rebuild maps), `.claude/skills/hive-memory.md` (formalized skill), knowledge-cartographer.md `links` bug fix

**PR #80** and **PR #81** merged at `TehutiRaEl/THEHIVE`.

**What's now wired:**
- Layer 0 (Harness): `.claude/` fully populated — nav docs, agents, commands, memory ref, skills
- Layer 1 (Vault): `memory/` PARA-structured, auto-updated via CI
- Layer 2 (Associative): `/v11/brain/*` API — remember/query/associate/recall/map
- Layer 3 (Quantum): pre-existing tier3/ (not modified)

**Next open work:** See P0 register below + forward phases A-E.

---

## Context
All prior plans (hive-master-plan M1–M7, team-status M1–M10, workflow audit) are shipped or superseded; the team is now four seats (Founder, Fable=Harness, Sonnet=Backend/Edge, Mistral=Frontend, Grok=Strategy) coordinating through `Project_file/Founders Visonary Folder/` with the Skill Exchange (`SKILLS/`, 10 skills) and per-member charters. This plan compresses everything still open into one execution sheet. Canonical copies live in-repo (harness doc + Fable_memory.md).

## Immediate merge queue (Founder)
1. **PR #40** — Mistral frontend (conflicts resolved by harness; union-merged mistral_memory.md)
2. **PR #42** — harness org + charters + Skill Exchange + **L1 hostname fix** (`thehive.sovereignhive.workers.dev`)

## P0 register (live)
| ID | Item | Owner | State |
|----|------|-------|-------|
| L1 | sovereignhive hostname in auto-discovery | Fable | ✅ fixed, in PR #42 |
| L2 | Grok bridge activation (5 steps, docs/GROK_BRIDGE.md) | Founder | open |
| L3 | LocalAGI /colony/capabilities (Go, mirror colony_sdk shape) | Sonnet/Fable | ✅ done (PR #81) |
| L4 | CORS allowlist: Worker + Pages origins in backend config | Sonnet | ✅ done (PR merged) |
| L5 | Merge stragglers: colony PRs (NAR2#5, 4DBRAIN#5, Kimi-K2#4, aether#4, automatisch#4, LocalAGI#4, fCC#2, FPB#2) | Founder | verify |

## Phases forward (post-merge)
**A — Production proof (Fable, first session with shell):**
Curl `https://thehive.sovereignhive.workers.dev/v11/health` → healthy; page boots LIVE same-origin; github.io copy auto-discovers Queen. Evidence link into harness doc. If DNS still dead → subdomain not registered (skill-edge-worker-d1-deploy gotcha #2).

**B — Backend queue (Sonnet):** P3 CORS (=L4) → P4 `GET /v11/constitution/history` (git log of soul.md) → P5 endpoint-drift audit (UI calls vs route table; reuse gap-#11 method) → L3 → P7 Grafana JSON → P8 dynamic COLONY_BASE_URLS. Every new endpoint: update services/api.ts + endpoint map + ACTIVE/ note.

**C — Frontend M5 (Mistral):** batch order: ColonyGraphPage → constitutional HOCs → LiveArenaViewer (adopt skill-voxel-projection-pipeline; r128 setColorAt gotcha) → PhaserScene → remaining tabs. DoD per batch: `npm run type-check && lint && build` clean, committed with batch. M5 done = React app replaces docs/index.html as primary; docs/ becomes fallback.

**D — Strategy M9 (Grok, unblocks on L2):** push gap analysis via skill-grok-bridge-push; rank Sonnet queue; external-positioning brief (constitution+EVW story). Debt noted: bridge PAT plaintext in D1 → AES-GCM upgrade ticket.

**E — Observability & hardening (M10):** ✅ Grafana dashboard (P7 — monitoring/grafana/dashboards/sovereign-hive-overview.json); ✅ Worker rate limits + visitor-token validation + D1 backup workflow (Phase E complete 2026-07-14).

## Standing rules (unchanged)
Probe before claim · role-tagged commits · one writer per memory file · ACTIVE/ is the bus · plans live in the repo · free tier only · dual-lens on every decision.

## Verification
- A: live curls + browser boot (Playwright if in-sandbox; skill-playwright-real-ui-verification).
- B: pytest suites green (65+ baseline) + curl per new endpoint.
- C: build gates per batch + Playwright drive of each tab against live backend.
- Whole-hive drill after any soul.md edit: six-colony Constitution Receive green (skill-constitution-sync-drill).
