# Project_file/

The project's **working archive**: the founder's strategic folder, plan and venture material, the audit rulebook, and the team-coordination notes from the early build. It is read by people and by AI sessions. It is **not** imported or executed by the Worker (`worker/`) or the Python backend (`backend/`), though a few docs and UI strings point into it (for example, the Files panel text in the Command Center points to `Founders Visonary Folder/SOURCES/`).

> Directory names keep the repo's existing spellings (`Founders Visonary Folder`, `FOUNDERS_VISONARY_PLAN`). `CLAUDE.md`, `automaton/` docs and frontend code link to them, so don't "correct" a spelling without updating those links.

---

## What is in here (as of 2026-10-19)

| Path | What it is |
|------|------------|
| `Founders Visonary Folder/` | The **strategic inbox and log**: questions, answers, visions, directives and the active batch plan. Start with its own `README.md` and `INDEX.md`. |
| `FOUNDERS_VISONARY_PLAN/` | Step-by-step guides for things only the founder can do by hand (one so far: setting up Cloudflare Access). See its `README.md`. |
| `FOUNDERS_VENTURES/` | One definition file per founder venture. Empty so far. See its `README.md`. |
| `AUDIT_SCHEMA` | The rulebook for plan/vision audits: five truth levels (L1–L5), classifications, hallucination types, the proposed truth hierarchy (production > code > plan > narrative) and the four-lens protocol for orphaned directives. Currently saved **without a `.md` extension**. |
| `VISION.md` | The gamified voxel-world / MMORPG-style interface vision (dual-world design, Unity-then-Unreal migration path). Last updated 2026-08-18. This is **a different document** from the cockpit-over-portfolio frame logged on 2026-10-12. |
| `Project_memory.md` | Team coordination and backend reference as of 2026-07-08 (agent roles, port map, milestones). |
| `Project_memory/` | `Claude_memory.md` (2026-07-14), `mistral_memory.md` (2026-07-10) and `COMPLETE_ARCHITECTURE.md` (Command Center architecture, last changed 2026-07-10): per-agent memory and architecture notes from July. |
| `team-updates/mistral/updates.md` | Mistral's session log, last updated 2026-07-17. |

The `Project_memory*` and `team-updates` files are **dated snapshots**. For what is currently built, wired and live, use `docs/DEPLOY_WIRE_LEDGER.md` and verify against the code.

### Inside `Founders Visonary Folder/`

`ACTIVE/` (items being worked now) · `ANSWERED/` (resolved questions, kept for history) · `ARCHIVE/` · `HIVE_UPDATES/` (dated directive and status logs) · `MODIFICATIONS/` (proposed changes to existing systems) · `SKILLS/` · `SOURCES/` (where you drop PDFs, books and clippings for the hive to build from) · `TEMPLATES/` · `VISION/` (long-horizon ideas) · `Visionary-Conversation-logs/` · `vision-folder/` · `voice-of-the-hive/`, plus `INDEX.md`, `README.md`, `TEAM_CHARTERS.md` and `Repo-skills-reverse`.

---

## How to use it

| I want to… | Do this |
|------------|---------|
| Record a question, vision or modification | Follow `Founders Visonary Folder/README.md`: copy the matching file from `TEMPLATES/`, save it with the name pattern `YYYY-MM-DD-<type>-<topic>-NNN.md`, and add it to `INDEX.md`. |
| Resolve a question | Move it from `ACTIVE/` to `ANSWERED/`, add the answer at the bottom, update `INDEX.md`. |
| Log a directive or thread | Add a dated file to `HIVE_UPDATES/` and register it in `INDEX.md`. |
| Follow a founder how-to (e.g. Access) | Open `FOUNDERS_VISONARY_PLAN/`. |
| Define or review a venture | Use `FOUNDERS_VENTURES/`. |
| Run or review an audit | Read `AUDIT_SCHEMA` first; it is the law for the audit reports. Reports go in `docs/audit/`. |
| Find open founder decisions | `docs/FOUNDER_QUEUE` (decided ones move to `docs/FOUNDER_ANSWERED`). |
| Learn what is live right now | `docs/DEPLOY_WIRE_LEDGER.md`, then check the code or a live probe. Don't rely on the July snapshots above. |

---

## Rules

- **No credentials, API keys or secrets** in anything under this directory.
- **Save files with a `.md` extension.** Without it GitHub shows the file as plain text instead of rendering the Markdown, and links that name the `.md` file break.
- The inbox folder's own rule applies: it is a place to record and decide, and items there are **not binding until moved to `ACTIVE/`**.
- Nothing here is applied automatically. The founder merges.
- Claims about what is built should name the file, line or probe that shows it. Claims that were once true and no longer are should be dated.

---

## Known gaps

- `frontend/src/README.md` points to `Project_file/Grok_memory.md`, which does not exist.
- `CLAUDE.md` records that `Fable_memory.md` moved from here to `.claude/`.
- Several files added on 2026-10-19 have no `.md` extension: `AUDIT_SCHEMA`, and the four 2026-10-12/13 entries (one each in `ACTIVE/` and `ANSWERED/`, two in `HIVE_UPDATES/`).
- `Founders Visonary Folder/INDEX.md` does not yet list the 2026-10-12/13 entries.
