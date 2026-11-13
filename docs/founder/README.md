# The Founder's Directory — How the Hive Reads the Founder

> **Status:** created 2026-11-13 by founder order (founder order 2026-11-13 14:39 PST:
> there was NO founder's ideas folder and NO founder's about-me directory —
> both now exist here).
>
> **Plain words first:** this folder is where everything the founder gives the
> Hive lives, sorted so any agent — Kai El, Muse, or any provider the founder
> connects — can find it, read it, and use it without guessing. Nothing in this
> folder is built all at once. Ideas gather here. Building still waits its turn,
> TO Queen 100%.

## Who the founder is

Mac — full label **"Mac Lee made it"** (so no one else can claim to be Mac) —
founder of THEHIVE. He is building a self-governing personal federation, Queen
plus founder, meant to build real, lawful value honestly. He is also a novelist
building The Atherian Universe, starting with Crossroads of Fate Book 1:
The Last Breath Before Dawn.

What Muse understands about him lives in its own file:
[`about-me/WHAT_MUSE_THINKS_ABOUT_MAC.md`](about-me/WHAT_MUSE_THINKS_ABOUT_MAC.md).
That file is Muse's read of Mac, not Mac's words about himself — and Mac is
invited to correct it. Mac's own words live in his updates, his Q, his answered
questions, and his vision (below).

## How to read the founder — the rules that never change

1. **One question at a time.** Mac decides best one question at a time.
2. **Plain ELI5 words.** Every question has three parts — what it is, its
   purpose, what it will change — plus suggestions, improvements, and further
   innovative ideas. That is nonnegotiable (founder rule, 2026-11-12).
3. **Check the record before asking.** Before asking Mac anything, check
   `docs/FOUNDER_ANSWERED` first. A question he already decided must never be
   re-asked. (This happened twice — Q-015 and Q27 — and it cost trust.)
4. **A chat "yes" is not a decision.** A decision counts only when it is
   recorded in `docs/FOUNDER_ANSWERED` or by a merged ratification PR.
5. **"No" means "not yet."** A no is a hold, never a fold.
6. **Only verified-live counts as done.** Never claim a capability that has not
   been proven live. Verified-live or it didn't happen.
7. **Nothing else gets built until the Queen is 100%.** Ideas in this folder
   gather. They do not jump the queue.
8. **Professional judgment, not literal obedience.** Mac is the visionary
   entrepreneur; Muse is the programmer, developer, and coder for him. When a
   question needs a technical call, Muse makes the call and explains it in
   plain words instead of pushing the technical choice back to him.

## Where the founder's things live — the map

| What it is | Where it lives | How to read it |
|---|---|---|
| The founder's **vision** | `docs/FOUNDERS_VISION.md` | The reference text for the Queen's alignment review. First draft, not finished. Read it as the direction everything is measured against. |
| The founder's **open questions (Q)** | `docs/FOUNDER_QUEUE` | The single source of truth for open founder-level questions. Ranked smallest decision-cost first where known. |
| The founder's **answered questions** | `docs/FOUNDER_ANSWERED` | Permanent record. Entries move here from the queue when decided, chronological. **Check here first, always.** |
| The founder's **ideas** (the pool) | `docs/founder/ideas/` | The one gathering pool. Ideas accumulate here so Kai El has a multitude to gather from instead of being ambiguous about his own. Ideas are NOT built all at once. |
| The founder's **about-me** | `docs/founder/about-me/` | Everything that tells the Hive about the founder: what Muse thinks about Mac, his creative insights, gifts and appreciation, ideals, drafts, plans, and updates — each in its own subdirectory. |
| The founder's **boot sequence** | `docs/founder/BOOT.md` | The automatic boot sequence that wakes every provider Mac connects and walks it through everything. Maintained as its own file; see that file, not this guide. |
| The founder's **constitution** | `soul.md` (F-001–F-006 are the canonical fixed laws) | The one constitution. Nothing in this folder changes it. |

## The separation rule — ideas are not plans are not updates are not vision

Five different things, five different homes. Never mix them:

- **An idea** is a seed — "what if we…". It goes to `docs/founder/ideas/`
  (the pool) or, if it arrived as about-me material, to
  `about-me/ideas/` first and then into the pool. An idea is not a promise to
  build it.
- **A plan** is an idea with steps, order, and owners — "here is how we…".
  It goes to `about-me/plans/`. A plan is not an idea any more, and it is not
  approved work until the founder says yes.
- **An update** is news from the founder — "here is what changed / what I
  decided / what I want now". It goes to `about-me/updates/`. An update is not
  a plan and not a vision change until it is filed as one.
- **Vision** is the direction — "this is what the Hive is for, this is where
  it is going". It lives only in `docs/FOUNDERS_VISION.md`. An update that
  changes the direction must be written into the vision file by the founder's
  decision, not by an agent rewriting it quietly.
- **About-me** is the founder himself — who he is, how he thinks, what he
  values, what he made, what he was given. It lives in `about-me/` and its
  subdirectories. About-me explains the founder; it does not decide anything.

If a founder message holds more than one of these, split it: the idea goes to
ideas, the plan to plans, the update to updates, the vision change to the
vision file, the personal part to about-me. Never file the whole message in
one place and call it done.

## The automatic-update rule — anything the founder adds gets sorted

Whenever the founder adds anything to the founder's about-me, it is sorted
immediately and automatically into the right subdirectory — no waiting, no
pile-up:

- founder idea → `about-me/ideas/` (then copied into the pool,
  `docs/founder/ideas/`)
- founder creative insight → `about-me/creative-insights/`
- founder gift, or any other form of appreciation → `about-me/gifts/`
- founder ideal → `about-me/ideals/`
- founder draft → `about-me/drafts/`
- founder plan → `about-me/plans/`
- founder update → `about-me/updates/`
- anything else founder about-me related → a new subdirectory here, named
  plainly for what it holds, with its own short README — never a loose file
  with no home, and never squeezed into a subdirectory where it does not
  belong.

Sorting is filing, not deciding. Filing an idea does not approve building it.
Filing an update does not decide a question — the decision still goes through
the queue into `docs/FOUNDER_ANSWERED`. Filing a draft does not publish it.

## Why this folder lives under `docs/`

The Worker serves `docs/` as static assets (`wrangler.jsonc`: `assets:
{ directory: "docs", binding: "ASSETS" }`). So once the absorption routes
exist, the Worker can fetch this whole folder live — the Hive can read about
its founder from the live system, not from a copy somewhere else. That is why
the founder's directory is here and not in a side folder.

## Directory tree

```text
docs/founder/
├── README.md                      # this guide
├── BOOT.md                        # automatic boot sequence (separate file, not in this PR)
├── ideas/
│   └── README.md                  # the ideas pool — ideas gather, not built all at once
└── about-me/
    ├── README.md                  # the about-me index
    ├── WHAT_MUSE_THINKS_ABOUT_MAC.md   # what Muse thinks about Mac (five reasons + vision + synthesis)
    ├── ideas/README.md            # intake shelf — feeds the pool
    ├── creative-insights/README.md
    ├── gifts/README.md            # gifts and other forms of appreciation
    ├── ideals/README.md
    ├── drafts/README.md
    ├── plans/README.md
    └── updates/README.md
```

## What this folder is not

- Not a second constitution. `soul.md` is the one constitution.
- Not a second queue. `docs/FOUNDER_QUEUE` is the only home for open
  founder-level questions.
- Not a build list. Ideas here wait their turn, TO Queen 100%.
- Not the founder speaking. Only the founder speaks for the founder. This
  folder holds what he gave, sorted — and one file (`about-me/
  WHAT_MUSE_THINKS_ABOUT_MAC.md`) that says plainly it is Muse's read of him,
  open to his correction.
