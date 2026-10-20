# FOUNDERS_VENTURES/

The home for **one definition file per founder venture**: the businesses you assign to Kai to build and run, each in its own isolated laboratory, with you holding merge authority over everything they produce.

> **Status: empty.** As of 2026-10-19 this directory holds no venture definitions. Nothing else in the repo links to it yet. This README describes how it is meant to be used so the first venture lands in a consistent shape.

---

## Where this comes from

The frame is recorded in `Project_file/Founders Visonary Folder/`:

- `HIVE_UPDATES/2026-10-12-directive-peer-review-cockpit-kai-fork-audit-060`: **cockpit over portfolio**: one observation deck over a portfolio of AI-operated ventures, Kai as operator, a laboratory per venture, founder merge authority.
- `ACTIVE/2026-10-12-batch-plan-cockpit-audit-kai-fork`: the active batch. Its **founder decision #4** is *which single venture goes first (faceless channels / podcast / other)*, to be decided **after** the plan/vision audit, not before.
- `docs/FOUNDER_QUEUE` **Q-008**: whether to create a separate venture colony repo. Recommendation on file: defer until the cockpit and one venture loop are proven.

Ventures named so far in the founder's vision (060 §2): background podcasts with invited speakers; faceless YouTube channels driven by trending feeds; a crypto/stocks command center.

---

## What is in here

| File | Notes |
|------|-------|
| `Venture(1).md` | **Empty placeholder.** Rename it to the first venture's name once you pick one, or delete it. |

---

## How to use it

### Adding a venture
1. Don't add one until founder decision #4 (which venture is first) is made.
2. Create `<venture-slug>.md`, for example `faceless-channels.md`. One file per venture.
3. Fill in the headings below. They are a **proposed** convention taken from the open questions logged in 060 §3. They are not ratified, so change them if they don't fit.
4. Link the file from the ACTIVE batch plan or a HIVE_UPDATE so it is discoverable.

```
# <Venture name>
**Status:** idea | defined | lab-running | live
**Assigned to:** Kai (operator)        **Founder decision:** <Q-NNN / date>

## What it makes and for whom
## How value is created (the mechanism, not the hope)
## Laboratory (the isolated place it is built and run)
## Legal fence (platform terms of service that apply; legal entity; what is NOT allowed)
## Review cadence (how often you look, and what gets queued for you)
## Money rules (default: none)
## First PR (the very first thing Kai ships for this venture)
## Kill criteria (what makes you stop)
## Links (visionary-log entries, queue items, audit findings)
```

### Working a venture
The intended path is: you pick the venture, Kai works in his own fork of the repository, opens a pull request, and **you merge it by hand**. The fork workflow is **not wired yet**; it is queued as task C2 in the ACTIVE batch plan. Until it is, treat these files as definitions, not as running automation.

---

## Rules (from the active batch plan's explicit non-goals)

- **No autonomous real-money trading.**
- **No mass cross-account credential grant** without a legal fence in place first.
- **No self-merge.** Every venture output goes through your review.
- **No money or replication switches** (`AUTOMATON_FINANCIAL_AUTONOMY`, `AUTOMATON_REPLICATION_AUTONOMY`); each is a separate open founder decision (Q-004, Q-005).
- **Don't call the portfolio "live"** until the cockpit and one venture loop are proven.
- **No secrets** (API keys, tokens, account credentials) in any file here.

Open risks logged in 060 §3 that each venture file should answer for itself: cross-account ingestion vs provider terms of service, regulatory exposure of real-money activity, deplatforming risk for faceless-content fleets, the blast radius of giving Kai broad account access, an undefined review cadence, and how the vision is versioned when it changes.

---

## Related

- `Project_file/FOUNDERS_VISONARY_PLAN/`: step-by-step founder build guides
- `Project_file/Founders Visonary Folder/`: strategic inbox and visionary logs
- `docs/FOUNDER_QUEUE`: open founder decisions
- `Project_file/README.md`: map of everything under `Project_file/`
