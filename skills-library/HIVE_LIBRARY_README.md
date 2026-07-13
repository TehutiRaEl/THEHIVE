# skills-library — the hive's on-demand skill vault

**This directory is NOT `.claude/skills/`, and that is deliberate.**

Claude Code auto-loads the frontmatter of every skill under `.claude/skills/` into
*every* session. Auto-loading 350+ community skills would bloat context catastrophically.
So the hive keeps two tiers:

| Tier | Location | Loaded | Contents |
|------|----------|--------|----------|
| **Active** | `.claude/skills/` | auto, every session | curated + trusted: official Anthropic skills, hive-native skills, taste/optimizer sets |
| **Library** | `skills-library/` (here) | on demand only | full harvested community collection — searched and promoted when needed |

## Use it via the `skill-harvester` active skill
Or by hand:
1. Search: `grep -rl "<capability>" skills-library/*/skills/*/SKILL.md`
2. Read the candidate `SKILL.md`.
3. Promote: copy that skill dir into `.claude/skills/` (that's what makes it auto-load).

## Directly hive-aligned categories
- `engineering/agent-harness/` — **the multi-level MCP-harness pattern** (goal→plan→verify→loop, per-domain manifests). This is the exact architecture in the founder's research; promote it when building the Hive Conductor.
- `engineering/mcp-*`, `agents/`, `orchestration/` — MCP servers + multi-agent orchestration.
- `compliance-os/`, `ra-qm-team/`, `audit/`, `standards/security/` — governance/constitutional enforcement.
- `research/`, `research-ops/` — research + gap-analysis (Grok's lane).

## Provenance & trust
- Source: `alirezarezvani/claude-skills` (MIT), harvested 2026-07-13. 357 skills.
- **Third-party community content**, import-scanned for injection/secret patterns but not
  individually vetted. Nothing here loads or runs unless a session explicitly promotes/invokes it.
- Upstream maintainer-workflow files (`CLAUDE.md`, `GEMINI.md`, `.github/`, `scripts/`) were
  **removed on import** — they carried "PR target is always dev" and other rules that do NOT
  apply to THEHIVE and would misdirect a session. The skills themselves are untouched.
