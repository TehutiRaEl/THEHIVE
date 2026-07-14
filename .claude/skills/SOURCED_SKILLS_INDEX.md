# Sourced Skills — provenance & classification

Founder placed a manifest at `Project_file/Founders Visonary Folder/Repo-skills-reverse`
listing 9 public repos to mine for skills. This is the harness's audit of each: what was
**COPIED** verbatim, **ADAPTED** to the hive stack, **MERGED** with an existing hive skill,
**REVERSE-ENGINEERED** (reimplemented from source, not copyable), or **DECLINED** (with why).

All copies are MIT-licensed unless noted. Skills live in `THEHIVE/.claude/skills/`.

## Verdicts by repo

| Repo | License | Verdict | What we took |
|------|---------|---------|--------------|
| **Donchitos/Claude-Code-Game-Studios** | MIT | **COPIED (8)** | The UI/UX pipeline the founder flagged for the frontend build: `ux-design`, `ux-review`, `team-ui`, `design-review`, `design-system`, `quick-design`, `code-review`, `consistency-check`. This is a full studio pipeline — 73 skills; we took the UI/design/quality subset directly relevant to the React Command Center. The other 65 (sprint-plan, live-ops, combat, audio…) are game-production-specific; catalogued for later, not imported. |
| **Leonxlnx/taste-skill** | MIT | **COPIED — FULL REPO (13)** | Founder directive: entire repo verbatim. All 13 skills under original names: `taste-skill` (design-taste-frontend), `taste-skill-v1`, `image-to-code-skill`, `redesign-skill`, `minimalist-skill`, `brutalist-skill`, `soft-skill`, `brandkit`, `gpt-tasteskill`, `output-skill`, `stitch-skill`, `imagegen-frontend-web`, `imagegen-frontend-mobile` + `taste-skill-llms.txt`. The imagegen skills need an image-model binding to fully run; kept anyway per directive. |
| **breferrari/obsidian-mind** | MIT | **COPIED (1) + REVERSE-ENGINEERED (1)** | `json-canvas` copied verbatim; **`memory-graph-canvas`** reverse-engineered — maps Obsidian's portable `.canvas`/graph format onto the hive's existing D3 `MemoryGraph.tsx` + Three voxel renderer, so memory is authorable/exportable/visualizable interchangeably. |
| **KINGSTAR-OMEGA/claude-token-optimizer** | MIT | **COPIED — FULL REPO (3)** | Founder directive: entire repo verbatim. All 3 skills: `antigravity` (antigravity-protocol), `antigravity2.0` (renamed `antigravity-protocol-v2` to avoid a name collision — same-name front-matter breaks Claude Code skill resolution), `ultimate-protocol` (ultimate-protocol-simulator). NOTE: these are aggressive efficiency modes — `ultimate-protocol` enforces zero-English JSON-only output. Powerful but opinionated; invoke deliberately. The earlier hive-adapted `hive-efficiency-protocol` was removed in favor of the originals per directive. |
| **P4nda0s/reverse-skills** | public | **REVERSE-ENGINEERED (1)** | **`diagram-from-language`** — extracted the neutral diagram methodology (Mermaid/Graphviz/PlantUML decision table) from the `diagram-generator` module. The imperative Chinese routing-contract and pentest framing were stripped. |
| **Graphify-Labs/graphify** | MIT | **CATALOGUED (adapt later)** | Codebase→knowledge-graph tool (god nodes, community detection, GraphRAG/Neo4j export). Powerful and hive-aligned (feeds MemoryGraph + a future `/graphify` over our own repos), but it's a full Python pipeline with heavy deps — porting it is its own milestone, not a copy. Flagged for Grok/Mistral. |
| **iamgio/quarkdown** | **GPL** | **REFERENCE ONLY** | Markdown→typeset-document engine (Kotlin). GPL means no verbatim copy into our MIT-spirit tree. Concept (constitution/GDD → paginated PDF) is worth reimplementing cleanly later if the founder wants formal document output; noted, not taken. |
| **payloadcms/payload** | MIT | **REFERENCE ONLY** | Full TypeScript headless CMS (huge). Not a skill source — a potential architecture reference if the hive ever needs structured content management behind the Command Center. Sparse-cloned docs only; nothing imported. |
| **zhaoxuya520/reverse-skill** & **P4nda0s/reverse-skills** (offensive subset) | public | **DECLINED** | The bulk of both repos is offensive-security tooling: EDR bypass, exploit-chain/pwn development, firmware pentest, APK/.NET malware RE, credential attacks, LLM-agent-hijack. These are weaponizable capabilities with no fit for a governance/creative platform, and importing them would arm the hive with offensive tooling. **Not imported.** Only the neutral `diagram-generator` methodology was reverse-engineered (above). |

## The four lenses (how each verdict was reached)
- **COPY** — MIT, self-contained, directly usable in our stack, aligned to current work (UI/design/quality).
- **ADAPT** — good idea, wrong shape: rewrite to the hive's constraints (readable-prose rule, same-origin CSP, ephemeral containers).
- **MERGE** — overlaps an existing hive skill; fold the new insight in rather than duplicate (none required this round — no collisions with the 11 existing `Founders Visonary Folder/SKILLS/`).
- **REVERSE-ENGINEER** — the value is the method, not the code (offensive framing, GPL, or heavy deps): reimplement the neutral core in our language/stack.
- **DECLINE** — weaponizable, license-incompatible for copy, or off-vision. Recorded with the reason, never silently dropped.

## Two skill homes (deliberate)
- `THEHIVE/.claude/skills/` — **executable Claude Code skills** (this dir): invocable, code-adjacent, sourced from the founder's manifest.
- `Project_file/Founders Visonary Folder/SKILLS/` — **the team Skill Exchange** (11 hive-native workflow skills): harness/backend/edge process knowledge. The two are cross-referenced; a session skims both.

Origin: Fable (Harness), 2026-07-13, executing the founder's `Repo-skills-reverse` directive.

## Wave 2 (2026-07-13) — GitHub-wide harvest
- **anthropics/skills** (Apache-2.0): 13 official skills COPIED to .claude/skills (algorithmic-art, brand-guidelines, canvas-design, claude-api, doc-coauthoring, frontend-design, internal-comms, mcp-builder, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing). Excluded docx/pdf/pptx/xlsx (source-available, not redistributable).
- **alirezarezvani/claude-skills** (MIT): 357 skills → skills-library/ ON-DEMAND (not auto-loaded). Includes the real agent-harness (multi-level MCP harness). Upstream CLAUDE.md/GEMINI.md/.github stripped to avoid misdirecting hive sessions.
- **skill-harvester** active skill: the repeatable discover→vet→import pipeline.

## Hive-native (2026-07-13) — the Fable genome
- **`FABLE_DNA.md`** (repo root): the transmissible genome — Constitution (ethics),
  Fable's debugging method, and the mycelial/cross-hive communication principle, written
  in full to be copied into any hive lawfully and freely. Contains no model weights, no
  third-party code, no data. The honest form of "give the hive Fable's DNA, not an imprint."
- **`fable-debugger`** active skill: Chromosome II of FABLE_DNA as a runnable discipline —
  the Fable-level self-debugger left persistently in the hive. Probe before claim, contrast
  against a proven-working path, find the coupled latent bug, verify where it actually runs,
  never fake a green. Model-agnostic (Workers AI, a Claude key, or a local model — swappable
  organ, constant genome). Sits under `hive-conductor`.

## Wave 3 (2026-07-13) — the HORDE research triage

The founder's HORDE + Pocket Dimensions research named ten external tools. Verified by
direct search before anything was trusted (see `research-to-dna` skill for the process).
**None of these are imported as dependencies.** They are catalogued here for deliberate,
one-at-a-time, founder-approved adoption — the same discipline as every other wave.

| Named tool | Verdict | What it actually is |
|---|---|---|
| **AI Horde** (Haidra-Org/AI-Horde) | **VERIFIED-REAL** | Real, large, MIT-adjacent crowdsourced inference cluster (Haidra non-profit). Kudos economy confirmed accurate. Genuinely adoptable later if the hive wants community-donated generation capacity — would need its own scoped integration (API key, opt-in), not a silent import. |
| **herd-core** (herd-ag org) | **VERIFIED-REAL, CATALOGUED** | Real agent-team governance framework (roles, authority, quality gates). The hive's own role-tagged-commit + governance-check pattern already covers the same ground natively; catalogued for comparison, not adopted. |
| **BranchFS** (multikernel/branchfs) | **VERIFIED-REAL, CATALOGUED** | Real FUSE copy-on-write filesystem for agent branching, backed by a real arXiv paper ("Fork, Explore, Commit"). Genuinely useful upgrade over git worktrees for filesystem-level speculative branching — not adopted; principle captured in `pocket-dimensions` skill using git instead. |
| **agent-cow** (trail-ml/agent-cow-python) | **VERIFIED-REAL, CATALOGUED** | Real Postgres-level copy-on-write isolation for agent DB writes. Not yet relevant — the hive's D1 database isn't currently written to speculatively by unsupervised agents. Catalogued for if/when that changes. |
| **Kowalski** (yarenty/kowalski) | **VERIFIED-REAL, CATALOGUED** | Real Rust multi-agent framework; `horde.md` + `agents/*.md` markdown orchestration confirmed accurate to the research description. Interesting prior art for the hive's own manifest-driven `agent-harness`; not imported. |
| **HOARDE** (Sigil Logic) | **VERIFIED-REAL (different framing)** | Real product, but built around formal-verification/NINJA methodology for high-assurance engineering — not quite the "unbroken traceability chain" framing in the research. The hive's own constitution-gate + governance-log covers the *governance* half natively. |
| **Kestrel** (`kestrel-sovereign` on PyPI) | **VERIFIED-REAL, CATALOGUED** | Real framework: cryptographic agent identity + persistent memory + constitutional governance + local voice/compute. Deeply overlaps the hive's own Constitution + memory design — worth a real side-by-side read later, not adopted; too central a piece (identity + constitution) to import without a full read. |
| **arifOS** (ariffazil/arifOS) | **VERIFIED-REAL, CATALOGUED** | Real, active project: 13-floor constitutional AI governance kernel, MCP-deployable. Genuinely the most directly comparable prior art to the hive's own F-001…F-006 gate. Catalogued for a careful comparative read — not merged into the Constitution without founder review, since it would touch governance itself. |
| **Sandcastle** (mattpocock/sandcastle) | **VERIFIED-REAL, CATALOGUED** | Real, MIT-licensed TypeScript sandbox orchestrator for coding agents (Docker/Podman/Vercel + git worktree isolation). Directly the "Pocket Dimensions" pattern — captured as principle in the `pocket-dimensions` skill; the actual package not imported. |
| **dmux** (standardagents/dmux) | **VERIFIED-REAL, CATALOGUED** | Real tmux + git-worktree multiplexer for running several coding agents in parallel panes. Useful for a human operator running multiple agents locally; not applicable to this container-based session model today. |
| **AgentHerd** | **UNCONFIRMED BY NAME** | Could not confirm a project by this exact name. The underlying pattern it describes (WebGPU local LLMs + WebRTC peer-to-peer agent negotiation, no server) is real and active elsewhere (WebLLM, AgentWorkbook-style P2P setups) — the specific named project may exist under a different name, may be very new/obscure, or may be a research-pass conflation of the pattern with a name. Not catalogued as a specific tool; the pattern itself is noted as a real future direction for a browser-side hive client. |
| **Agent Workspace Fabric (AWF)** | **UNCONFIRMED BY NAME** | Same treatment as AgentHerd — the pattern (isolated git worktree + Docker + automated PR/CI-repair loop per task) is extremely well-attested under other names (Augment Code's "Intent," `nekocode/agent-worktree`, Claude Code's own built-in `--worktree`). The specific "AWF" name/product was not independently confirmed. |
- **architecture-gap-assessment-2026-07-13.md**: triage of the founder research briefing — neuromcp + uga-cli DO NOT EXIST (hallucinated); memory core → use real Cloudflare Vectorize; harness → use the real agent-harness. No fictional installs.
