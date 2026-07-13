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
