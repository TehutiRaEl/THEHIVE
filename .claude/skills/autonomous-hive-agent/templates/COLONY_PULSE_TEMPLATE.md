# <COLONY_NAME>_PULSE — read this first, every autonomous firing in this colony

Modeled directly on THEHIVE's own `.claude/HIVE_PULSE.md` (same discipline, same reason
for existing: one page, read in full before anything else, so a firing in this colony
never re-derives context it already wrote down last time). Kept small on purpose — if
this file starts growing past what's actually current, compress it rather than let it
accumulate resolved history, same rule as THEHIVE's copy.

**Update this file at the end of every autonomous firing in this colony.**
Stale-but-wrong is worse than short — keep every line true.

---

## Right now (updated <DATE>)

- **What this colony is for:** <one line — role from `.queen/hive.yml` in THEHIVE,
  e.g. "revenue" / "automation" / "llm gateway" / "knowledge corpus">
- **Open PRs:** <list, or "none open">
- **Last real thing done:** <one line, dated, with evidence — a commit/PR, not a claim>
- **Known gaps / blockers:** <what's real and unresolved, one line each>
- **Queen-side context:** THEHIVE is the Queen node of this federation (see THEHIVE's
  `CLAUDE.md` and `.queen/hive.yml`) — this colony's own decisions still respect
  `soul.md`'s F-001…F-006 where they apply (data minimization, consent, no irreversible
  unattended action). Nothing here overrides that.

## Circulatory system — how this colony's heartbeats stay cheap

Read this file first → do the work → update this file → stop. Never re-read this
colony's whole history/README/every source file from scratch on a routine firing — that
defeats the reason this file exists. Full design of the pattern this implements →
THEHIVE's `.claude/skills/autonomous-hive-agent/SKILL.md`.

## Not yet built / open questions

<real, current list — delete this section entirely if there's nothing open>

---

*Instantiated from THEHIVE's `.claude/skills/autonomous-hive-agent/templates/
COLONY_PULSE_TEMPLATE.md` (CAMPAIGN.html task 9a). Fill in every `<...>` placeholder with
real, checked information about THIS colony before committing — an uninstantiated
template committed as-is is worse than no pulse file at all, since a future firing would
trust it as current.*
