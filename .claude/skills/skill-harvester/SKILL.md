---
name: skill-harvester
description: Use when the founder asks to find, scan, import, or add open-source skills/code from GitHub into the hive. The repeatable process for discovering public skill collections, cloning them under the container's network constraints, vetting for safety, and importing — either as active skills or into the on-demand skills-library. Also the promote-from-library flow.
---

# Skill Harvester

The founder wants GitHub's open-source skill wealth flowing into the hive continuously.
This is that process, made repeatable so it isn't re-derived each time.

## Hard environment facts (learned, don't retest each run)
- `api.github.com` and `codeload.github.com` return **403** through the container proxy —
  so **GitHub code-search API and tarball download do NOT work.**
- `git clone https://github.com/<owner>/<repo>` **DOES** work. `raw.githubusercontent.com` works.
- Discovery therefore = **WebSearch** (find repos) → **git clone** (fetch them). Not the search API.
- `add_repo` (MCP) only accepts repos from an owner already in the session — useless for public discovery.

## The pipeline
1. **Discover** — WebSearch for the capability + "github claude skills" / "awesome agent skills".
   Canonical high-trust sources: `anthropics/skills` (official, Apache-2.0 examples),
   `alirezarezvani/claude-skills` + `VoltAgent/awesome-agent-skills` (large MIT community).
2. **Clone** — shallow into scratch: `git clone --depth 1 <url> <name>`. For huge repos use
   `--filter=blob:none --sparse` then `git sparse-checkout set <subdir>`.
3. **License-gate** — check `LICENSE`. MIT/Apache-2.0 → may copy verbatim (keep attribution).
   GPL → reference/reimplement only, no verbatim copy into our MIT-spirit tree.
   "Source-available, not open source" (e.g. Anthropic docx/pdf/pptx/xlsx) → do NOT redistribute.
4. **Safety-gate (MANDATORY before import)** — grep the tree:
   `ignore (all )?previous instructions|exfiltrat|curl .*\| ?(ba)?sh|rm -rf /|BEGIN OPENSSH|ghp_[A-Za-z0-9]{30}`.
   Read any hit. **DECLINE** offensive-security tooling (EDR bypass, exploit/pwn chains, malware RE,
   credential attacks) — weaponizable, off-vision. Record declines with the reason; never silent-drop.
5. **Strip behavioral pollution** — remove the source repo's own `CLAUDE.md`/`AGENTS.md`/`GEMINI.md`/
   `.github/` before import; they carry workflow rules (branch targets, etc.) that misdirect hive sessions.
6. **Place by trust + volume:**
   - Few, trusted, directly-needed → `.claude/skills/` (auto-loaded every session — keep this lean).
   - Many, or unvetted, or reference → `skills-library/` (on-demand; NOT auto-loaded).
   - **Never dump hundreds into `.claude/skills/`** — every frontmatter there costs context in every turn.
7. **De-dupe skill names** — two SKILL.md with the same front-matter `name:` break resolution.
   Rename the newer (e.g. `-v2`) if they collide.
8. **Record** — update `.claude/skills/SOURCED_SKILLS_INDEX.md`: repo, license, verdict
   (COPY/ADAPT/MERGE/REVERSE-ENGINEER/DECLINE), what landed where. Attribution footers on verbatim copies.
9. **Ship** — one PR per harvest wave, role-tagged. Post-merge sweep (skill-merge-order-and-regression-verify).

## Promote from library → active
`cp -r skills-library/<domain>/skills/<skill> .claude/skills/<skill>` — then it auto-loads. Do this
only for skills a current task needs; leave the rest catalogued.

## The four lenses (every candidate gets a verdict)
COPY (MIT/Apache, self-contained, aligned) · ADAPT (good idea, rewrite to hive constraints) ·
MERGE (overlaps an existing skill, fold in) · REVERSE-ENGINEER (value is the method: GPL/heavy-deps/
offensive-framing → reimplement neutral core) · DECLINE (weaponizable / license-incompatible / off-vision).

Origin: Fable (Harness), 2026-07-13, executing the founder's continuous-harvest directive.
