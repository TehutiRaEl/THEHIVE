# Branch Dissection — `feature/voxel-world` — 2026-08-18

Full `.claude/skills/branch-dissection/SKILL.md` pass. This is branch 2 of the
session's standing 7-branch dissection queue (branch 1,
`feature/gamified-ui-components`, already dissected). Starting facts taken from
`BRANCH_AUDIT_2026-08-18.md` (not re-derived): 523 commits, no shared history with
`main`, 602 files changed vs `main`, 19,127 insertions, tagged **salvage-candidate**.
This pass goes further than that audit's quick pass — full commit/tree read,
verdict-per-piece, both lenses, real open questions.

**Method:** read-only, Tier 1/2 boundary (per this repo's Tier convention — this is
a doc, not a merge). No delete, no merge, no push to `feature/voxel-world`, no PR
proposing to land its content. `git fetch origin`, `git diff --name-status` against
both `origin/main` and `origin/feature/gamified-ui-components` (the already-
dissected sibling), plus targeted content diffs. Baseline: `origin/main` at
`f211940` (2026-08-18).

## Headline finding: this branch is not primarily new content

The raw diff against `main` (602 files, 19,127 insertions, 142,624 deletions) looks
enormous, but nearly all of it is an artifact of diffing two branches with **no
shared root** — every file `main` has that this old snapshot predates shows as a
"deletion," and vice versa. The real question isn't "what differs from `main`" but
"what does this branch carry that isn't already accounted for by `main` or by the
already-dissected `feature/gamified-ui-components`." Diffed directly against
`feature/gamified-ui-components`: **134 files differ, but only 15 are genuinely new
(`A`) — the rest are 70 files gamified-ui-components has that voxel-world lacks, 43
modified, and 6 renames.** Net unique insertions: 2,208 (not 19,127).

`feature/voxel-world` and `feature/gamified-ui-components` are two snapshots of the
**same lineage** at slightly different points — voxel-world is the earlier one. It
predates the addition of `automaton/` to that lineage entirely (automaton diffs as
pure deletion against voxel-world, meaning voxel-world never had it), predates most
of `.claude/skills/` (session-harvest, skill-census, hive-memory, pocket-dimensions,
merge-readiness, anomaly-triage, nine-miss-truths, research-to-dna all show as
missing from voxel-world relative to gamified-ui-components), and predates the
per-colony `CLAUDE.md` navigation files and several `.claude/agents/*`. It is not a
parallel, independent effort — it is an older checkpoint of the same branch history
gamified-ui-components already carries forward.

## Verdict per real piece

### 1. `frontend/src/worlds/` (PortalManager, NPCManager, MultiplayerManager,
   AchievementTracker, MissionTracker, WorldManager, Colony.tsx, NPC.tsx, etc.)
**Verdict: already absorbed — no action needed.** Diffed directly against `main`,
this directory is byte-identical except two trivial lines (`Portal.tsx` 1-line,
`PortalManager.ts` 1-line deletion). This content is **already live on `main`** —
not a gap, not salvage. The original quick audit's framing of this as "distinct
real content" undercounted; a direct diff against `main` (not just eyeballing file
names) shows it already landed.

### 2. `frontend/src/components/colony/` (10 per-colony consoles, `ColonyConsole.tsx`,
   `ColonyHeader.tsx`, `HealthDashboard.tsx`, `index.ts`)
**Verdict: needs a second look — but already covered by branch 1's dissection, not
new to this one.** Byte-identical between voxel-world and gamified-ui-components
(doesn't appear in their mutual diff at all); absent from `main`. This is the same
content branch 1 already catalogued and verdicted. Nothing here is unique to
voxel-world — re-verdicting it here would double-count branch 1's findings. Refer
to branch 1's dissection output for its actual verdict; this pass adds only the
confirmation that voxel-world carries the identical files, not a divergent version.

### 3. `frontend/src/components/gamified/` (App.tsx, MissionCard, MissionDetails,
   MemoryVault, MemoryItem, MemoryDetails, AchievementToast, LevelUpNotification,
   TesseractChamber, ConstitutionHall, index.ts) — 11 files, genuinely unique to
   voxel-world (not on `main`, not on `feature/gamified-ui-components`)
**Verdict: rebuild.** This is a self-contained demo assembly page
(`GamifiedApp` in `App.tsx`) that imports the same component set
gamified-ui-components already has (in a different directory layout —
`components/gamified/Foo.tsx` flat files here vs. `components/Foo/Foo.tsx` +
`Foo.css` there) and wires them into one demo screen titled "THEHIVE Gamified UI
Components." Content is placeholder sci-fi fiction exactly matching the pattern
branch 1 already flagged repeatedly across this lineage: mission "Explore the
Nebula," memory entries authored by "Commander Ra" and "Scientist El" describing
"first contact" with an "alien civilization in the Andromeda sector" and a
"quantum tesseract in sector 7-G." The demo-page *shape* (one screen showing every
gamified component together) is a genuinely useful pattern for a component-gallery
page — but every string in it needs replacing with real federation data (the real
6 colonies in `.queen/hive.yml`, real mission/memory content), same as the rest of
this lineage.

### 4. `worker/src/index.js` — differs from `feature/gamified-ui-components` (96
   lines)
**Verdict: needs a second look — real security regression risk if ever merged
naively.** Content diff shows voxel-world's copy of the Worker **lacks** rate
limiting (`rateLimitOk`, 30 POSTs/IP/min sliding window), token validation on
write endpoints (`tokenOk`, `WORKER_ADMIN_KEY`-gated), the `/admin/d1-export`
backup route, and token-table pruning — all present in gamified-ui-components's
copy and (per `CLAUDE.md`'s own account of `worker/src/index.js`) in the version
actually running production today. Voxel-world's copy is simply an earlier
snapshot from before that hardening was added to this lineage, not an
intentional rollback. Flagging as "needs a second look" only in the sense that
**nobody should ever copy this specific file forward** — it is not a competing
design, it is stale by omission. Worth a one-line note in this branch's own
future handling: exclude `worker/src/index.js` explicitly from any salvage pass.

### 5. `backend/guilds/{arena,constitutional,dream,frequency,security}_guild.py`,
   `backend/llm_router.py`, `backend/utils/rate_limiter.py` — show as "added" vs.
   `main`
**Verdict: already-resolved, not a gap.** Checked `git log --oneline -- backend/
guilds/arena_guild.py` on `main`: these files were deliberately removed by
`545240f "[ROLE: Governance Kernel] dead-code cleanup per founder's 19-question
round"` — the exact same founder-reviewed cleanup commit branch 1's dissection
already identified for `arena_guild.py`/`constitutional_guild.py`. `main` keeps
their documentation (`memory/backend/guilds/*.md`) but not the code. Voxel-world
simply predates that cleanup. No action — same precedent as branch 1, confirmed
via history rather than assumed.

### 6. `Project_file/Fable_memory.md`, `Project_file/Claude_memory.md`,
   `Project_file/Grok_memory.md` (old session-log snapshots, renamed/relocated
   relative to gamified-ui-components)
**Verdict: rebuild / historical-only, not salvage.** These are stale point-in-time
continuity logs (Fable's dated 2026-07-10, Claude's dated 2026-07-08) describing
work and state from that period — superseded by the current `.claude/
Fable_memory.md` and current `Project_file/Project_memory/Claude_memory.md`. Real
historical value (they document real milestones — the PAT-distribution fix, the
M1/M2/M4/M7 arena/tier3/constitution work) but nothing actionable that isn't
already folded into current continuity docs. No merge needed; if anything, worth a
footnote in current `Fable_memory.md` only if a specific milestone in the old log
turns out to be undocumented anywhere current (not checked line-by-line here —
low priority, the current log already summarizes the same period).

### 7. `docs/app/assets/*.js`/`*.css` (built bundle hashes) and `wrangler.jsonc`
**Verdict: copy-paste is meaningless here — these are build artifacts, not
source.** Different content hashes than `main`/gamified-ui-components because
they're compiled output from a different point in the frontend's history.
`wrangler.jsonc` is byte-identical to gamified-ui-components (no diff at all) —
confirms same-lineage, same-config snapshot. Nothing to absorb; rebuilding the
frontend from source regenerates these regardless of which branch's copy exists.

### 8. Everything else in the 602-file `main` diff (memory-vault `.md` docs,
   `.claude/agents/*`, `.claude/commands/*`, `.claude/skills/*` present on
   `main`/gamified but absent here, `CLAUDE.md`, `THE_CODEX.md`,
   `MANDATE_TRIAGE.md`, per-directory `CLAUDE.md` nav files)
**Verdict: not a gap — pre-dates their addition.** All show as "missing" from
voxel-world only because voxel-world's snapshot point is older than when this
lineage added them. Confirmed by the same pattern as items 4–5 above (voxel-world
consistently lacks anything the lineage added after its fork point). No action.

## Verdict summary

| Verdict | Pieces |
|---|---|
| already absorbed (on `main`) | `frontend/src/worlds/*` |
| already covered by branch 1 (not unique here) | `frontend/src/components/colony/*` |
| rebuild | `frontend/src/components/gamified/*` (real shape, placeholder data); old `Project_file/*_memory.md` snapshots (historical only) |
| needs a second look | `worker/src/index.js` (stale/less-secure — flag so nobody copies it forward) |
| already-resolved, not a gap | `backend/guilds/*` deletions, `automaton/` absence, `.claude/skills/*`/`.claude/agents/*` absence |
| not salvage-worthy | build-artifact hashes, `wrangler.jsonc` (identical to sibling branch) |

## Lens pass 1 — `devils-advocate-audit` (10 questions, adapted per that skill's
own guidance for a branch-dissection target rather than shipped code)

1. **Single point of failure** — if anyone runs `git merge feature/voxel-world`
   without reading this file first, `worker/src/index.js` regresses production
   auth/rate-limiting silently (no test would catch a *removed* protection —
   tests check the happy path exists, not that a stale copy didn't undo it).
2. **Hidden assumptions** — the branch's name ("voxel-world") promises 3D/voxel
   content; the actual unique payload is almost entirely 2D React dashboard
   components and one demo page. Same naming mismatch pattern as branch 1
   (`feature/gamified-ui-components` was "90% unrelated backend scaffold"). Don't
   trust a branch's name as a content manifest — confirmed twice now, worth
   treating as a standing rule for the remaining 5 branches in the queue.
3. **Blast radius if this branch's real content silently vanished** — near zero.
   Everything genuinely unique and non-stale (`gamified/` demo page) is a
   convenience assembly of components that already exist elsewhere in richer
   form; nothing here is the only copy of anything load-bearing.
4. **Who is harmed if mis-verdicted** — a future session that trusts the
   `BRANCH_AUDIT_2026-08-18.md` quick-pass framing ("distinct real content...
   possibly further along") without this deeper diff would over-credit
   voxel-world and might merge its stale `worker/src/index.js` believing it's
   equal-or-ahead of `main`. This dissection's job was specifically catching that.
5. **What breaks at an unusual path** — if someone diffs voxel-world against
   `main` only (as the quick audit did) instead of against the actual nearest
   sibling branch, they overstate its uniqueness by roughly 9x (19,127 vs. 2,208
   real insertions). Always diff against the nearest known-relative branch, not
   just `main`, when branches share obvious lineage.
6. **What does an attacker do with this** — nothing new; no secrets or keys
   found in the unique-content set beyond what's already flagged elsewhere in
   this repo's standing security notes.
7. **What's never shown** — the `gamified/` demo page's fictional content (alien
   civilizations, "Commander Ra") reads charmingly, but if it were ever screen-
   shotted or shipped without the founder's context, it would look like this
   hive fabricates lore rather than doing constitutional/federation work — the
   same "no fictional labels shipped as-is" concern branch 1 raised.
8. **What if a dependency disappears** — n/a, no live dependency in this
   branch's unique content.
9. **Simpler path to the same outcome** — yes: the `gamified/` demo-gallery
   *pattern* (one screen showing every gamified component) is worth keeping as
   an idea even though every individual component it imports already exists
   better-organized elsewhere. A future component-gallery/storybook page could
   adopt the pattern without touching this branch at all.
10. **Could this be verified rather than assumed** — yes, and was: every "added"
    claim in the raw `main` diff was cross-checked against `git log` (guild
    cleanup), against `feature/gamified-ui-components` directly (worlds/, colony/
    consoles), and against content itself (`gamified/` demo data), rather than
    taken at face value from file-status letters alone.

## Lens pass 2 — `childlike-wonder` (what this branch's real content could
become)

- **A real component gallery.** The `components/gamified/App.tsx` idea — one
  screen assembling every gamified component with live data — is worth building
  for real, once `main`'s "Colony" re-skin with real federation data (the
  founder's already-confirmed direction from branch 1) exists. It would double as
  a visual regression surface and a founder-facing demo screen without needing
  any of voxel-world's actual files.
- **A "lineage diff" habit for the remaining 5-branch queue.** This dissection's
  most useful general finding wasn't about voxel-world specifically — it's that
  diffing a same-lineage branch only against `main` inflates its apparent
  uniqueness by an order of magnitude. Worth checking each remaining queued
  branch (of the 7) for an obvious nearest-sibling before doing the deep read, so
  the "how much is genuinely new" number is right from the start instead of
  needing a second pass like this one did.
- **The colony-console set (item 2) getting real integration life.** Ten
  per-colony consoles already exist, fully written, in two branches
  independently — that's a strong signal (not proof) that this specific piece is
  further along and more "wanted" than a single branch's existence would
  suggest. Worth weighting it higher in whatever prioritization branch 1's
  absorption work already has under way.

## Open questions for the founder — genuinely unclear, not code-answerable

1. **Is `feature/voxel-world` the founder's own earlier save-point of the same
   `feature/gamified-ui-components` effort** (e.g., an earlier push from the same
   working session, later continued as gamified-ui-components), **or a separate
   branch someone else spun up independently at a similar time?** The file
   evidence strongly suggests "earlier checkpoint, same lineage" — but only the
   founder (or whoever pushed it) knows the actual authorship/session history,
   and that changes whether this branch has any standing as its own initiative
   versus being pure history.
2. **Does the `components/colony/` per-colony console set (present identically in
   both branches) relate to or compete with Kai El OS's own existing
   colony-status surfaces?** This was flagged as a real open question in the
   task brief and remains genuinely unresolved by file inspection alone — it
   needs someone who knows Kai El OS's current design intent.
3. **Now that this dissection shows voxel-world's unique payload is small (11
   files) and mostly redundant with gamified-ui-components's already-catalogued
   components** — is there any reason to keep `feature/voxel-world` as a distinct
   ref once branch 1's absorption work is done, or should it be folded into the
   same "safe to delete once gamified-ui-components is fully absorbed" bucket the
   quick audit already used for the 4 tree-identical duplicate branches? This
   dissection does not recommend deletion on its own (per the skill's hard
   boundary — deletion needs everything gathered/logged first, which this file
   does), but the founder may want to fold voxel-world's disposition decision
   into whatever's already planned for gamified-ui-components rather than
   tracking it separately.

## What this dissection does NOT recommend

No merge, no PR against `feature/voxel-world`, no deletion. Per the skill's hard
boundary, deletion is only appropriate once everything real has been gathered,
absorbed/adapted, and logged — this file is that log for voxel-world's unique
content, but branch 1's own absorption work (colony consoles, gamified component
set) is still open, and this branch's disposition should likely be decided
together with that branch's, not independently.
