# Plan v2's three unverified phases — verified for real, 2026-08-19

**Date:** 2026-08-19
**Subject:** `memory/planning/2026-08-18-unified-forward-plan-v2.md` honestly flagged three
phases it could not verify at the time. This document verifies each one.
**Method:** direct reads and real command runs against the checked-out repo and its sibling
colony checkouts. No live production probing (this container has no reach to
`*.workers.dev`). Every claim below names the file, line, or command that produced it.
**Level:** `verified` for Phases 6 and 10. `verified` for Phase 1b's facts, with one genuine
founder judgment left open about what "done" means for it.
**Boundary note:** this document does not edit `memory/planning/*` — another lane owns those
files. It reports what should change there.

---

## Plain English first

Yesterday's plan was honest about three things it had not checked. That honesty is why this
check was possible at all, so it was worth doing properly rather than assuming.

The first one, about the difference between "skills" and "commands" in the hive's toolbox, is
still genuinely unfinished — but only just. Somebody already did the hard part on 18 August:
they went through all nine of the old command files and worked out exactly what each one is
and whether a newer skill already does the same job. What nobody did afterwards was write a
single line into each of those nine files saying "this is the old version of X" or "this is
still the only thing that does Y." So the knowledge exists in a report and not in the files
themselves, which means the next person who opens one of those files still learns nothing. It
is about fifteen minutes of work, not a project.

The second one, about whether each colony needed its own settings file, turned out to be
mostly solved but not entirely. One shared file already covers six of the colonies properly,
and I ran the real checking script against all six and all six passed. But two colonies from
the original list — the two that are just big collections of programming books and course
material — are not covered at all. That is probably fine, because they are not running
software and there is nothing to check. But "probably fine" is your call to make, not mine.

The third one had the simplest answer of all: the plan said a piece of shared code could not
be found and might have gone missing. It had not gone missing. It was simply in a different
folder than the plan expected — one level up rather than inside the backend folder. I found
it, confirmed it is real working code, and then confirmed that three separate colony
repositories are genuinely installing it from this repository as a proper dependency. That one
is closed, with no ambiguity left.

---

## Phase 1b — "skills vs. commands split"

### v2's own words

> **Phase 1b (skills vs. commands split)** — not re-verified this pass (flagged
> could-not-verify in the fresh audit) — carries forward from v1 unchanged, still open.

### v1's original definition and its "done when"

`memory/planning/2026-07-19-unified-forward-plan.md:77-84`:

> **1b. Skills vs. commands split.** `.claude/skills/` (67 skills, actively used) and
> `.claude/commands/` (9 slash-command files … zero cross-references to the skills set) have
> never been reconciled … **Either cross-link each command to its skill/harness-manifest
> equivalent, or mark it deprecated with a one-line reason; re-run `skill-census`.**
> **Done when:** the re-run census shows zero unaccounted `.claude/commands/` entries.

### VERDICT: **STILL OPEN** — diagnosis done, remedy not applied

Two halves. The first is genuinely finished. The second was never started.

**Half one — the census: DONE.** `SKILL_CENSUS_REPORT_2026-08-18.md` exists, was run for real
(its own line 3 states it "answers v1 plan's Phase 1b"), and accounts for all nine commands
individually. Its substantive findings, re-verified by me today:

| Census claim | My re-check | Result |
|---|---|---|
| All nine System-A items are `.claude/commands/*.md`, not skills | `ls .claude/commands/` → exactly 9 `.md` files | **CONFIRMED** |
| Skill-to-command cross-referencing is zero | See table below | **CONFIRMED** |
| `/merge-verify` (command) duplicates `merge-readiness` (skill) | Both present: `.claude/commands/merge-verify.md`, `.claude/skills/merge-readiness/` | **CONFIRMED** |
| `/soul-check` and `checks-and-balances` are a non-overlapping pair | Both present, different scopes | **CONFIRMED** |

**Half two — the file-level remedy: NOT DONE.** This is the part v1 actually specified, and it
is measurably zero:

```
for f in .claude/commands/*.md; do grep -ciE "\.claude/skills|skill:|deprecat|superseded|see skill" "$f"; done
```

| Command file | Cross-link or deprecation marker present? |
|---|---|
| `.claude/commands/brain-query.md` | **0** |
| `.claude/commands/colony-zoom.md` | **0** |
| `.claude/commands/hive-status.md` | **0** |
| `.claude/commands/link-nodes.md` | **0** |
| `.claude/commands/merge-verify.md` | **0** |
| `.claude/commands/remember.md` | **0** |
| `.claude/commands/role-deliver.md` | **0** |
| `.claude/commands/soul-check.md` | **0** |
| `.claude/commands/update-nav.md` | **0** |

Zero of nine. The census's own conclusion agrees, in its own words
(`SKILL_CENSUS_REPORT_2026-08-18.md:139`): *"skill-to-command cross-referencing is still
zero."*

Current inventory, re-counted today: **80 `SKILL.md` files** under `.claude/skills/`
(v1's "67" is stale — the set has grown), **9** command files, **5** agent files under
`.claude/agents/`.

### The genuine founder judgment here

v1's "done when" is ambiguous, and the ambiguity is real rather than pedantic:

- **Reading A — already done.** "Zero unaccounted entries" means the census report accounts
  for every command. It does. Under this reading Phase 1b closed on 2026-08-18.
- **Reading B — not done.** v1's action sentence says "cross-link each command … or mark it
  deprecated," which is an instruction to edit the nine files. Zero were edited.

**My recommendation: Reading B, and finish it — it is small.** The whole reason this phase
exists is that someone opening `.claude/commands/merge-verify.md` has no way to know
`merge-readiness` supersedes it. A report in a separate file does not fix that; a one-line
header in each of the nine files does. Concretely, nine one-line edits:

| File | Suggested one-line header |
|---|---|
| `merge-verify.md` | Superseded by the `merge-readiness` skill (which also autofixes and re-pushes). Kept as the check-only version. |
| `soul-check.md` | Complements the `checks-and-balances` skill — this checks a change against F-001–F-006; that one checks authority distribution. Not duplicates. |
| The other seven | No skill equivalent exists; this command is the only implementation. Dispatches to `.claude/agents/…` where applicable. |

**What should change in `memory/planning/2026-08-18-unified-forward-plan-v2.md`** (for the lane
that owns it): replace *"not re-verified this pass … still open"* with *"re-verified
2026-08-19: census half DONE (`SKILL_CENSUS_REPORT_2026-08-18.md`), file-level cross-linking
half NOT done — 0 of 9 command files carry a marker. Remaining work is nine one-line edits."*

---

## Phase 6 — per-colony harness manifests

### v2's own words

> **Phase 6 (harness manifests for remaining colonies)** — the literal per-colony files v1
> names (`aether.json` etc.) still don't exist, but the real underlying need looks addressed
> differently: `colonies.json` … already exists per Phase 10 below. Recommend closing Phase 6
> as "addressed via a different, arguably more efficient route" … flagged here for the founder
> to confirm, not unilaterally closed.

### v1's original definition and its "done when"

`memory/planning/2026-07-19-unified-forward-plan.md:186-195`:

> **Goal:** `write-harness-manifests-for-remaining-colonies` — new
> `assets/harnesses/{aether,automatisch,kimi-gateway,academy-books,academy-camp}.json` …
> NAR2/4DBRAIN deferred until repo access clarifies.
> **Done when:** a schema-validation pass confirms each new manifest lists only real,
> existing skill/tool paths for its colony.

### VERDICT: **NEEDS FOUNDER DECISION** — v2's recommendation is *mostly* right, and the gap is now precisely measured

v2's claim that `colonies.json` "covers all six colonies" is true of *its own* six. But v1
named a **different** five. The two lists overlap only partially, and v2's summary did not
catch that. Here is the real mapping:

| v1's named colony | Covered by `colonies.json`? | Evidence |
|---|---|---|
| `aether` | **YES** — entry `aether`, path `../aether` | `.claude/skills/agent-harness/assets/harnesses/colonies.json` |
| `automatisch` | **YES** — entry `automatisch`, path `../automatisch` | same |
| `kimi-gateway` | **YES**, under a different name — `colonies.json` calls it `kimi-k2`, and `.queen/hive.yml` confirms `kimi-gateway`'s repo *is* `TehutiRaEl/Kimi-K2`. Same colony, two names. | `.queen/hive.yml` (kimi-gateway block); `colonies.json` (`kimi-k2` entry) |
| `academy-books` | **NO** | Not in `colonies.json`. Not a supported id in `colony_verify.py` (its six ids are `nar2`, `4dbrain`, `aether`, `automatisch`, `kimi-k2`, `localagi` — `.claude/skills/agent-harness/scripts/colony_verify.py:44,60,77,91,107,121`). |
| `academy-camp` | **NO** | Same. |

**Bonus coverage v1 did not ask for:** `colonies.json` additionally covers `nar2` and `4dbrain`
(which v1 explicitly deferred) and `localagi` (not in v1's list at all). So the shared manifest
over-delivers on three colonies and under-delivers on two.

**I ran the real verification, which is v1's own literal "done when."** All six entries in
`colonies.json` name `colony_verify.py` as their verification tool. Executed today against the
sibling checkouts:

| Colony | `colony_verify.py --colony <id> --repo-root ..` | Result |
|---|---|---|
| `nar2` | ran | **passed: true** |
| `4dbrain` | ran | **passed: true** |
| `aether` | ran | **passed: true** |
| `automatisch` | ran | **passed: true** |
| `kimi-k2` | ran | **passed: true** |
| `localagi` | ran | **passed: true** |

Six for six, real exit-0 runs, not assumed. **For the four v1 colonies that are covered, v1's
"done when" is genuinely satisfied** — by a shared manifest rather than five separate files,
which is exactly the substitution v2 described.

### The two real gaps, and why they may not matter

`../free-programming-books` and `../freeCodeCamp` **do exist** as sibling checkouts — these are
not phantom colonies. But look at what `.queen/hive.yml` says about them:

- `academy-books` → `role: knowledge`, `health_path: ""`, `base_url` is a raw
  `githubusercontent.com` content URL.
- `academy-camp` → `role: curriculum`, `health_path: ""`, same shape.

Neither runs a service. Neither has a `/colony/health` endpoint. Neither has skills or tools to
enumerate. A harness manifest for a static corpus of Markdown files would have nothing real to
verify — which is precisely the failure mode v1's own "done when" was written to prevent
("lists only *real, existing* skill/tool paths").

**Recommendation: close Phase 6, with the two exclusions stated explicitly rather than
silently.** Not "addressed via a different route" as a blanket statement, but: *"addressed via
`colonies.json` for the four service colonies from v1's list plus three more; `academy-books`
and `academy-camp` deliberately excluded because they are content repos with no service, no
health endpoint, and no tools to verify."* That is an honest close. v2's blanket version would
have quietly dropped two named items.

### A second, previously-undocumented finding

**The two colony registries disagree with each other.** `LocalAGI` is a full entry in
`colonies.json` (with a passing verification) but does **not** appear anywhere in
`.queen/hive.yml`, which calls itself *"the authoritative registry of all hive colonies"*
(`.queen/hive.yml:2`). Conversely, `.queen/hive.yml` still lists `NAR2` and `4DBRAIN` under
placeholder names `outer-colony-a` / `outer-colony-b` with `role: unknown` and
`description: "Private colony — role TBD pending repo access"` — access that has plainly since
been resolved, since both are checked out and both pass verification.

This is not Phase 6's problem to solve, but it is a real drift between two files that both
claim to be the colony roster, and it is exactly the two-copy drift Phase 1c exists to prevent.
**Flagged as a new, small, separate item — not folded into Phase 6, and not fixed here.**

---

## Phase 10 — colony deep-integration

### v2's own words

> **Phase 10 (colony deep-integration)** — ✅ CLOSED per v1, spot-checked (not fully
> re-audited) today: `backend/mcp_server/` confirmed present and real; `backend/colony_sdk/`
> **not found locally as a top-level directory — ambiguous**, plausibly consistent with v1's
> own "promoted into a real, pinned-dependency package" framing … rather than confirmed
> hallucinated.

### VERDICT: **CLOSED** — the ambiguity is resolved, and there is no regression

**v2 was looking one directory too deep.** `colony_sdk/` is not under `backend/`. It is at the
**repo root**: `/home/user/THEHIVE/colony_sdk/`. That is why the check came back empty.

```
$ find . -type d -name colony_sdk
./colony_sdk
```

What is actually there — verified by reading both files:

| File | What it is |
|---|---|
| `colony_sdk/pyproject.toml` | A real, buildable package: `name = "sovereign-hive-colony-sdk"`, `version = "1.0.0"`, setuptools backend, deps `fastapi>=0.100.0` + `pydantic>=2.0.0`, license MIT. Its own description: *"canonically owned by THEHIVE (the Queen), consumed by every colony as a pinned dependency."* |
| `colony_sdk/__init__.py` | 6,338 bytes of real code — `ColonyConfig`, `make_colony_router()`, HMAC signature verification (`_verify_hive_signature`). Its docstring records the consolidation: *"Consolidated 2026-07-22 from three byte-identical hand-copied files (NAR2/backend/colony_sdk.py, 4DBRAIN/backend/colony_sdk.py, Kimi-K2/colony_sdk.py)."* |
| Git history | `7ac6d8e feat: colony_sdk package + fix missing HMAC on the Queen's own /colony/events` |

**And the consumption side is real too** — this is the part that turns "a package exists" into
"the promotion actually happened." All three Python colonies pin it as a git dependency, and
all three have deleted their old hand-copied file:

| Colony | Pin | Old hand-copied file |
|---|---|---|
| NAR2 | `../NAR2/backend/requirements.txt:65` — `sovereign-hive-colony-sdk @ git+https://github.com/TehutiRaEl/THEHIVE.git#subdirectory=colony_sdk` | `backend/colony_sdk.py` — **gone** |
| 4DBRAIN | `../4DBRAIN/backend/requirements.txt:22` — same pin | `backend/colony_sdk.py` — **gone** |
| Kimi-K2 | `../Kimi-K2/requirements.txt:10` — same pin | `colony_sdk.py` — **gone** |

Note the pin URL: `#subdirectory=colony_sdk`, with no `backend/` in the path. The colonies
themselves confirm where the package lives.

**The rest of Phase 10's claims, spot-checked while here:**

| v1 Phase 10 claim | Check | Result |
|---|---|---|
| `backend/mcp_server/` present (Phase E) | `ls -d backend/mcp_server` | **present** |
| tesseract math moved into 4DBRAIN (Phase B) | `ls -d ../4DBRAIN/tesseract_math` | **present** |
| This repo's `backend/tier2/*.py` are thin re-export shims | `ls backend/tier2/` → `argnn.py`, `dream_engine.py`, `hypercomplex_layers.py`, `tesseract_core.py` | **present**, consistent with CLAUDE.md's own description |
| Kimi-K2's duplicate Node bridge retired (Phase A) | `colony_verify.py --colony kimi-k2` includes a `not_exists` check on `colony-server.js` and **passed** | **confirmed by a real run** |

**Nothing regressed. Nothing was hallucinated. v1's framing — "promoted into a real,
pinned-dependency package" — was accurate, and is now proven from both ends: the package
exists here, and three separate repos really install it from here.**

**What should change in `memory/planning/2026-08-18-unified-forward-plan-v2.md`** (for the lane
that owns it): replace the *"not found locally as a top-level directory — ambiguous"* sentence
with *"resolved 2026-08-19: `colony_sdk/` is at the repo root (not `backend/colony_sdk/`),
a real `sovereign-hive-colony-sdk` v1.0.0 package, pinned as a git dependency by NAR2,
4DBRAIN and Kimi-K2, each of which has deleted its old hand-copied copy. Phase 10 stays
CLOSED with no ambiguity."*

---

## Summary

| Phase | v2 said | Real verdict now | Evidence |
|---|---|---|---|
| **1b** — skills vs. commands | "not re-verified … still open" | **STILL OPEN** — census half done, file-level remedy at 0/9 | `SKILL_CENSUS_REPORT_2026-08-18.md`; grep across `.claude/commands/*.md` |
| **6** — per-colony manifests | "recommend closing as addressed differently, founder to confirm" | **NEEDS FOUNDER DECISION** — close, but with two named exclusions, not blanket | `colonies.json`; 6/6 real `colony_verify.py` runs; `.queen/hive.yml` |
| **10** — colony deep-integration | "ambiguous — `backend/colony_sdk/` not found" | **CLOSED** — no ambiguity, no regression | `colony_sdk/pyproject.toml`; three colony `requirements.txt` pins |

## What needs the founder's word

1. **Phase 1b:** is the census report enough (Reading A, already closed), or do the nine
   command files each need their one-line marker (Reading B, ~15 minutes)?
   **Recommended: Reading B.**
2. **Phase 6:** confirm closing it as addressed by `colonies.json`, **with `academy-books` and
   `academy-camp` explicitly excluded** as content-only repos with nothing verifiable.
   **Recommended: yes, close with the exclusions named.**
3. **New, separate:** `.queen/hive.yml` calls itself the authoritative colony registry but
   omits LocalAGI and still describes NAR2/4DBRAIN as `role: unknown … pending repo access`
   that has plainly since been granted. Should it be reconciled against `colonies.json`?
   **Recommended: yes, as its own small item — not folded into Phase 6.**

Phase 10 needs nothing from the founder. It is closed.
