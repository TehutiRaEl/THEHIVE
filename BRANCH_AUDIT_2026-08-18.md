# Branch Audit — 2026-08-18

This supersedes Phase 1d of `memory/planning/2026-07-19-unified-forward-plan.md`
("Stale branch audit — write `BRANCH_AUDIT_2026-07-19.md`"), which was scoped but
never actually written. That file does not exist in the repo; this one is the real,
first version, dated the day it was actually done.

**Method:** read-only, Tier 1. For every branch: `git fetch origin`, then
`git merge-base --is-ancestor origin/<branch> origin/main` to test real merge
status, then (for anything not already merged) commit-log and tree-diff inspection
against `origin/main` to judge real content. No branch was deleted, merged, pushed
to, or force-touched. No PR was opened against any of these branches — this file's
own delivery PR is the only PR this task produced.

**Baseline:** `origin/main` at `f211940` (2026-08-18).

## Not re-audited here: `feature/gamified-ui-components`

This branch already received a full, methodical dissection this session using the
now-codified `.claude/skills/branch-dissection/SKILL.md` method — 579 commits, no
shared history with `main`, mostly an unrelated early backend scaffold plus 5 real
UI components (`HiveDashboard`, `ColonyCard`, `ConstitutionHall`, `MemoryVault`, and
`TesseractChamber` — the last of which has already been separately merged to
`main`). The founder gave real, specific direction on it (genuinely wanted work,
not an experiment; "Colony" gets re-skinned with real federation data; gamification
is a real separate initiative; a real two-constitution discovery came out of
investigating it). It is still being absorbed/documented — **not** deleted. This
audit does not re-analyze it; see this session's own dissection findings instead.
Tag: **in-progress (already dissected)**.

---

## Summary table

| Branch | Tag | Evidence basis |
|---|---|---|
| `grok/detective-fullstack` | already-merged | ancestor of main |
| `grok/pr-133-s1-did` | already-merged | ancestor of main |
| `TehutiRaEl-patch-1` | already-merged | ancestor of main |
| `claude/ecstatic-rubin-9zqjoc` | already-merged | ancestor of main |
| `claude/fable-5-handoff-setup-vefwlb` | already-merged | ancestor of main |
| `claude/founder-cloudflare-access` | already-merged | ancestor of main |
| `claude/founder-key-hardening` | already-merged | ancestor of main |
| `claude/founder-key-name-revert` | already-merged | ancestor of main |
| `claude/founder-key-secret-fix` | already-merged | ancestor of main |
| `claude/roadmap-command-center-sync` | already-merged | ancestor of main |
| `claude/thehive-handoff-scope-gtn2rw` | already-merged | ancestor of main |
| `feature/gamified-ui-components` | in-progress (already dissected) | see above, not re-audited |
| `claude/session-continuation-owj5wr` | safe-to-delete | tree-identical to gamified-ui-components |
| `cloudflare/workers-autoconfig` | safe-to-delete | tree-identical to gamified-ui-components |
| `grok-strategist-main` | safe-to-delete | tree-identical to gamified-ui-components |
| `mistral/frontend-command-center` | safe-to-delete | tree-identical to gamified-ui-components |
| `security/redact-env-example-secrets` | safe-to-delete | its one real fix already landed on main via PR #130 |
| `feature/voxel-world` | salvage-candidate | real, distinct, substantial unmerged gamification/voxel work |

---

## Already-merged branches (11)

All 11 below pass `git merge-base --is-ancestor origin/<branch> origin/main` —
every commit on the branch is already reachable from `main`. These are stale
remote refs left over after their PRs merged; nothing on them is unmerged work.

- **`grok/detective-fullstack`** — merged.
- **`grok/pr-133-s1-did`** — merged.
- **`TehutiRaEl-patch-1`** — merged.
- **`claude/ecstatic-rubin-9zqjoc`** — merged.
- **`claude/fable-5-handoff-setup-vefwlb`** — merged. (Note: `git fetch` this
  morning showed this ref still receiving new commits, `2d3a5ee..86e4af7` — it may
  be an actively-used integration branch for the parallel session's PR flow, not a
  dead one. Merged-status is still correct as of this audit's fetch; recommend a
  human confirm whether it is still in active use before any deletion.)
- **`claude/founder-cloudflare-access`** — merged.
- **`claude/founder-key-hardening`** — merged.
- **`claude/founder-key-name-revert`** — merged.
- **`claude/founder-key-secret-fix`** — merged.
- **`claude/roadmap-command-center-sync`** — merged.
- **`claude/thehive-handoff-scope-gtn2rw`** — merged.

**Recommendation:** all safe to delete as stale refs *except*
`claude/fable-5-handoff-setup-vefwlb`, which should get a founder/session check
first since it looked live at fetch time. Deleting a merged branch loses no code —
it stays in `main`'s history — but that decision belongs to whoever is still using
the ref, not this audit.

---

## Duplicate-content branches (4) — tag: safe-to-delete

`claude/session-continuation-owj5wr`, `cloudflare/workers-autoconfig`,
`grok-strategist-main`, and `mistral/frontend-command-center` all: (a) fail the
merge-base ancestor check (no shared history with `main`, same as
`feature/gamified-ui-components`), (b) share the identical root commit
(`c15efb0 "Add files via upload"`), (c) have ~579-581 commits each, and (d) —
the load-bearing check — produce a **completely empty** `git diff --stat` against
each other's trees. Cross-checked against `feature/gamified-ui-components`
(`b596ac93...`) directly: also empty diff. All five branches point at commits with
different SHAs (different merge-commit tails from syncing with `main` at slightly
different points) but **byte-identical file trees**.

```
git diff --stat origin/claude/session-continuation-owj5wr origin/cloudflare/workers-autoconfig   -> (empty)
git diff --stat origin/claude/session-continuation-owj5wr origin/grok-strategist-main             -> (empty)
git diff --stat origin/claude/session-continuation-owj5wr origin/mistral/frontend-command-center  -> (empty)
git diff --stat origin/claude/session-continuation-owj5wr origin/feature/gamified-ui-components   -> (empty)
```

Every real file these 4 branches carry is already covered by the
`feature/gamified-ui-components` dissection. There is no unique content in any of
them — they are redundant remote copies of the same snapshot, not 4 separate
salvage targets.

**Recommendation:** safe to delete once `feature/gamified-ui-components` itself is
fully absorbed (don't delete these ahead of the branch they duplicate — keep one
name, not five, as the reference until that work closes).

---

## `security/redact-env-example-secrets` — tag: safe-to-delete

678 commits, no shared history with `main` (same disjoint-root pattern as above).
Its named purpose — redacting exposed API keys from `.env.example` — is real: the
branch's tip commit is literally `90135de "security: redact exposed API keys from
.env.example"`. Checked whether that fix is actually still missing from `main`:

```
git show origin/security/redact-env-example-secrets:.env.example  ->  48 lines
git show origin/main:.env.example                                 ->  48 lines, byte-identical (diff exit 0)
git log --oneline origin/main -- .env.example
  e084390 Merge pull request #130 from TehutiRaEl/security/redact-env-example-secrets
```

`main` already has this exact fix, landed via PR #130 (title makes the source
explicit). The branch also carries unrelated noise commits mixed in with the real
fix (`Implement dropshipping and copywriting capabilities`, repeated `Hello`→
`Goodbye` print-statement commits) — leftover churn from the same shared-snapshot
lineage as the duplicate branches above, not additional real work.

**Recommendation:** safe to delete. Its one real contribution is already on `main`;
nothing else on it is worth carrying forward.

---

## `feature/voxel-world` — tag: salvage-candidate

523 commits, no shared history with `main` (same disjoint-root pattern). Real,
substantial diff vs. `main`: 602 files changed, 19,127 insertions. This is
**not** a duplicate of `feature/gamified-ui-components` — direct tree diff against
it is non-empty (134 files differ, 10,018 insertions unique to this branch).

Distinct real content confirmed by file inspection (not just commit messages):
new/changed files under `frontend/src/worlds/` (`PortalManager.ts`, `Portal.tsx`,
`NPCManager`, `MultiplayerManager`, `AchievementTracker`, `MissionTracker`), a full
`frontend/src/components/colony/` console set (`ColonyConsole.tsx`,
`ColonyHeader.tsx`, per-colony consoles for 4DBRAIN/Aether/Automatisch/
BuildYourOwnX/FreeCodeCamp/FreeProgrammingBooks/KimiK2/LocalAGI/NAR2/THEHIVE),
`ColonyCard`, `MissionBoard`, `MissionDetails`, `useColonyHealth.ts`, and a
`ColonyGraphPage.tsx`. Recent commit history (`git log origin/main...origin/
feature/voxel-world`) is coherent, task-shaped work: "implement AchievementTracker
for unlockable accomplishments," "implement MultiplayerManager for real-time
sync," "add Colony React component for 3D rendering," etc. — reads as a real,
in-progress voxel-world/colony-gamification feature build, not scaffold noise.

This overlaps thematically with the founder's confirmed direction on
`feature/gamified-ui-components` (gamification is a real separate initiative;
"Colony" should be re-skinned with real federation data) — the per-colony console
components here look like exactly that kind of work, possibly further along than
what `feature/gamified-ui-components` has.

**Recommendation:** salvage-candidate. Worth a full `branch-dissection`-method pass
of its own — do not delete, and do not casually merge without that pass, since it's
523 commits of unknown quality mixed with clearly-real feature work.

---

## Branches in the task list not found on `origin` at fetch time

None — all 17 named branches (16 individually audited + `feature/gamified-ui-
components` already covered) resolved on `origin` after `git fetch origin`.

## Tag counts

- already-merged: 11
- safe-to-delete: 5 (4 duplicate-content branches + `security/redact-env-example-secrets`)
- salvage-candidate: 1 (`feature/voxel-world`)
- in-progress / already dissected (not re-verdicted here): 1 (`feature/gamified-ui-components`)
- needs-founder-look: 0 standalone — but see the `claude/fable-5-handoff-setup-vefwlb`
  note above (tagged already-merged, flagged for a live-use check before deletion)

Total branches covered: 17.
