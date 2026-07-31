# SPORE_ROSTER — the 101 roles, reframed as autonomous agentic spores

Source: `canvases/thehive-unity-migration/canvases/thehive-studio-onboarding/CANVAS.md`
("THE HIVE: Complete Studio Onboarding & Role Creation Plan") — a 101-role, $3.6M-7.4M,
150-human-headcount plan to turn THE HIVE into a funded Unity/Unreal AAA-MMORPG studio.

## Read this before the table — the honest reframe

Per this hive's own MANDATE_TRIAGE discipline (devil's-advocate first, extract genuine
value, verdict — never rubber-stamp): the CANVAS.md plan's literal content is a *human*
hiring and funding plan for a business THEHIVE is not currently building (a funded game
studio with a $500K-1M/month payroll, physical office, VC rounds). Adopting *that* wholesale
would be exactly the kind of unfalsifiable, ungrounded claim `soul.md`'s F-004
(Explainability) and this hive's "probe before claim" discipline exist to prevent.

**What's genuinely valuable and what this document actually does:** the CANVAS.md plan is a
comprehensive, well-organized division-of-labor taxonomy — 7 departments, ~78 distinct role
*types* (headcount multipliers like "x3" collapse to one role-type each, since a spore scales
itself rather than needing 3 duplicate hires). That taxonomy is worth keeping. Below, every
role is re-targeted at what THEHIVE actually is (an edge Worker + SOUL economy + colony
federation + Command Center), mapped to whichever existing skill/subagent already covers it —
most do — with genuine gaps marked **NEW** (not yet built) and roles with no honest THEHIVE
analog marked **DECLINED** (a human-studio concept that doesn't port, same as MANDATE_TRIAGE's
own DECLINED verdicts for the unfalsifiable mandates).

**Status key:**
- **ACTIVE** — an existing hive skill/subagent/system already does this job (cited)
- **ACTIVE (reframed)** — same, but the *literal* CANVAS.md role (Unity/3D-art/etc.) had to be
  retargeted at THEHIVE's real surface (edge Worker, SOUL economy, arena renderer) to make
  sense — noted so the reframe is visible, not silently substituted
- **PARTIAL** — something covers part of this role; the rest is a real gap
- **NEW** — genuinely not built yet; a real candidate for `skill-creator`, gated by
  `MANDATE_TRIAGE.md` before it's real, same as any other new capability
- **DECLINED** — no honest THEHIVE analog exists (a human-studio-specific concept:
  physical office, VC funding, game-engine-specific tooling THEHIVE doesn't run)

Spore lifecycle terms (`THE_CODEX.md`): dormant → germinating → propagating → fruiting.
ACTIVE roles are **fruiting** (already producing); NEW roles are **dormant** (named, not yet
germinated); PARTIAL roles are **germinating**.

---

## Department 1 — Executive Leadership (7 role-types)

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 1 | CEO / Studio Director | The founder — not a spore, the seat this whole system serves | N/A (human-held, by design) |
| 2 | CTO / Technical Director | `hive-conductor` + `agent-harness` | ACTIVE |
| 3 | CPO / Product Director | Roadmap ownership (`roadmapData.ts`, `RoadmapPanel`) | ACTIVE — vision judgment stays the founder's |
| 4 | CFO / Finance Director | `backend/core/wallet.py`, `economy/staking.py`, `utility_economy.py` | PARTIAL — the ledger exists; no agentic "finance directorate" persona wraps it yet |
| 5 | CMO / Marketing Director | `internal-comms`, `gpt-tasteskill` | PARTIAL — comms tooling exists, no dedicated marketing-strategy spore |
| 6 | COO / Operations Director | `hive-conductor`'s governance gate + `merge-readiness` | ACTIVE |
| 7 | Studio Producer | `agent-harness`'s `loop_controller` | ACTIVE |

## Department 2 — Engineering (25 headcount / 22 role-types)

**Core Engineering**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 8 | Lead Unity Engineer | `fable-debugger` + `agent-harness` (engineering domain) — reframed to the real surface, `worker/src/index.js` | ACTIVE (reframed) |
| 9 | Senior Unity Engineer x3 | `backend/core/` module ownership (hdc.py/protocol.py/hive_mesh.py) | ACTIVE (reframed) |
| 10 | Unity Engineer x4 | `fable-debugger` + `refactor-safely` | ACTIVE (reframed) |
| 11 | Network Engineer | `hive_mesh.py` + `colony-health-monitor` subagent | ACTIVE |
| 12 | Backend Engineer | `backend/api/*` + `agent-harness` | ACTIVE |
| 13 | Tools Engineer | `skill-creator` | ACTIVE |
| 14 | DevOps Engineer | `merge-readiness` + `.github/workflows/*` | ACTIVE |
| 15 | QA Engineer | `webapp-testing` + the coverage sweep (`devils-advocate-audit`) | ACTIVE |
| 16 | Technical Artist | `theme-factory` / `frontend-design` — reframed from shaders to Kai EL OS's visual system | ACTIVE (reframed) |
| 17 | Build Engineer | `ci.yml` + `merge-readiness` | ACTIVE |

**Unreal Engineering** — CANVAS.md lists 5 role-lines here (header says "8" but only enumerates 5; not corrected, just noted)

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 18-22 | Lead/Senior/Unreal Engineer, VFX Engineer, Technical Artist (UE) | — | DECLINED — no game-engine surface exists in THEHIVE; forcing a mapping here would be the exact kind of ungrounded claim this document exists to avoid |

**AI & Automation**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 23 | AI Systems Engineer | `backend/core/agency.py` (SwarmAgency ladder) | ACTIVE |
| 24 | AI Content Designer | `THE_CODEX.md` + `research-to-dna` | ACTIVE |
| 25 | AI Automation Engineer | `agent-harness` + `hive-organism` (this session's new subagent) | ACTIVE |
| 26 | AI Research Engineer | 4DBRAIN's `tesseract_math` package | ACTIVE (in the 4DBRAIN colony) |
| 27 | AI Tooling Engineer | `skill-creator` | ACTIVE |
| 28 | AI QA Engineer | `devils-advocate-audit` | ACTIVE |
| 29 | AI Content Generator | `research-to-dna` + `polymath-lens` | ACTIVE |

## Department 3 — Art & Animation (20 headcount / 14 role-types)

**3D Art**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 30 | Art Director | `taste-skill` / `theme-factory` — reframed to Kai EL OS + roadmap artifact visual direction | ACTIVE (reframed) |
| 31 | Lead 3D Artist | `algorithmic-art` / `canvas-design` | PARTIAL (reframed, no literal 3D pipeline) |
| 32 | Character Artist x3 | `backend/tier3` arena renderer (agent avatars in Gladiator Arena battles) | ACTIVE (reframed) |
| 33 | Environment Artist x2 | arena renderer's world/voxel generation | ACTIVE (reframed) |
| 34 | Prop Artist x2 | — | DECLINED — no prop system exists |
| 35 | VFX Artist x2 | arena renderer's frame effects | PARTIAL |

**2D Art**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 36 | Lead 2D Artist | `imagegen-frontend-web` / `brand-guidelines` | ACTIVE |
| 37 | UI/UX Designer x2 | `ux-design` + `frontend-design` (Kai EL OS panels) | ACTIVE |
| 38 | Texture Artist | `theme-factory` (token/palette system) | ACTIVE (reframed) |
| 39 | Concept Artist | `imagegen-frontend-web` / `algorithmic-art` | ACTIVE |

**Animation**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 40 | Lead Animator | arena renderer's 30-frame battle simulation | ACTIVE (reframed) — a genuinely direct fit: the arena already produces real frame-by-frame animation |
| 41 | Character Animator x2 | arena renderer | ACTIVE |
| 42 | Creature Animator | arena renderer | ACTIVE |
| 43 | Technical Animator | tier3 quantum-bridge math (rigging-equivalent simulation) | PARTIAL |

## Department 4 — Design (18 headcount / 10 role-types)

**Game Design**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 44 | Lead Game Designer | `design-system` / `gpt-tasteskill` (GDD authoring already exists as a skill) | ACTIVE |
| 45 | Systems Designer x2 | `backend/economy/*` — combat/progression/economy reframed as the real SOUL economy | ACTIVE (reframed) |
| 46 | Level Designer x3 | arena renderer's challenge generation | ACTIVE (reframed) |
| 47 | Content Designer x2 | `THE_CODEX.md` + `research-to-dna` | ACTIVE |
| 48 | Narrative Designer | `THE_CODEX.md` itself (Naunet/Nun, the Trinity) | ACTIVE — direct fit |
| 49 | UI/UX Designer | `ux-design` / `frontend-design` (same as #37) | ACTIVE |

**World Design**

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 50 | World Director | the six-colony federation map (`.queen/hive.yml`) — colonies **are** the worlds | ACTIVE (reframed) — a genuinely direct fit |
| 51 | Senior World Builder x2 | `colony-health-monitor` + each colony repo's own dev work | ACTIVE |
| 52 | World Builder x3 | per-colony feature work (NAR2/4DBRAIN/aether/automatisch/Kimi-K2/LocalAGI) | ACTIVE |
| 53 | Dungeon Designer x2 | arena renderer's per-challenge instanced content | ACTIVE (reframed) |

## Department 5 — Production & Management (10 headcount / 6 role-types)

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 54 | Head of Production | `hive-conductor` (the Master Harness) | ACTIVE — direct fit |
| 55 | Senior Producer x2 | `agent-harness`'s `loop_controller`, per domain | ACTIVE |
| 56 | Producer x3 | whichever subagent/skill is doing the task at hand | ACTIVE |
| 57 | Associate Producer x2 | `TodoWrite` task tracking within a session | ACTIVE |
| 58 | Project Coordinator | `.claude/HIVE_PULSE.md` + `roadmapData.ts` | ACTIVE — direct fit, this literally is that job |
| 59 | Scrum Master | `workflow-optimizer` (`WORKFLOW_NOTES.md`) | ACTIVE |

## Department 6 — Community & Marketing (12 headcount / 8 role-types)

The weakest-covered department — most of these are genuine gaps, not reframes.

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 60 | Head of Community | — | NEW |
| 61 | Community Manager x2 | Slack connector exists, connected, unused | NEW — connector present, no skill wraps it into autonomous community management |
| 62 | Social Media Manager | Zapier connector (9,000+ app bridge) exists, unused | NEW |
| 63 | Content Creator x2 | `internal-comms` + `research-to-dna` for text; no video/stream generation | PARTIAL |
| 64 | PR Manager | — | NEW |
| 65 | Influencer Manager | — | DECLINED — not a real need for a single-founder-user system; flagged rather than force-built |
| 66 | Event Coordinator | — | DECLINED — no events program exists |
| 67 | Localization Manager | `caveman`'s "preserve user's dominant language" rule is the only trace of this today | NEW — a real, genuinely useful gap |
| 68 | Customer Support Lead | Kai El's `/command_text` — the founder is the only "customer" | ACTIVE (narrow) |
| 69 | Support Specialist x2 | the Kai El bridge (`CONCERN`/`PROPOSAL` markers, this session's build) | ACTIVE — direct fit |

## Department 7 — Operations & Support (9 role-types)

| # | CANVAS.md role | Spore / hive equivalent | Status |
|---|---|---|---|
| 70 | HR Manager | `skill-creator`, gated by `MANDATE_TRIAGE.md` — the hive "hires" by drafting new skills | ACTIVE (reframed) |
| 71 | Recruiter | `skill-census` (finds what's active vs. orphaned) | PARTIAL (reframed — an audit, not literal recruiting) |
| 72 | IT Manager | `.venv` environment-recovery discipline + `agent-harness` infra | ACTIVE |
| 73 | IT Support | `fable-debugger` | ACTIVE |
| 74 | Legal Counsel | the Worker's `/legal/research` Legal Guild endpoint | ACTIVE — founder has already asked to expand this (Supreme Court case law, treaties); tracked separately, not yet done |
| 75 | Finance Manager | `backend/economy/*` + `wallet.py` | ACTIVE |
| 76 | Office Manager | — | DECLINED — no physical office exists |
| 77 | Data Analyst | `dataviz` | ACTIVE — direct fit |
| 78 | Security Officer | `threat-sandbox` + `security-review` + `devils-advocate-audit` | ACTIVE |

---

## Tally

- **ACTIVE / ACTIVE (reframed):** 54 of 78 role-types (~69%) — already fruiting
- **PARTIAL:** 8 (~10%) — germinating, real gap in the covered portion
- **NEW:** 8 (~10%) — dormant, genuine candidates for `skill-creator` (Community &
  Marketing accounts for 5 of these 8 — the honestly weakest department)
- **DECLINED:** 7 (~9%) — no honest THEHIVE analog; not silently dropped, recorded here
- **N/A (human-held):** 1 — the founder's own seat, by design, never a spore

## What this document is not

Not an adoption of CANVAS.md's literal business plan (funding rounds, physical office,
150 human hires, Unity/Unreal engines) — that content stays exactly what it always was, a
speculative pivot document, un-acted-on. This document only extracts and re-targets its
role taxonomy, per this hive's own MANDATE_TRIAGE discipline.

## Next

The 8 **NEW** roles (mostly Community & Marketing) are real candidates for a future
`skill-creator` pass, gated by `MANDATE_TRIAGE.md` before any of them ship as real. Not
built in this pass — named here so a future session doesn't have to re-derive this table
to find the actual gaps.
