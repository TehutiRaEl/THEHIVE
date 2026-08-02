# Command Center audit — core navigation/shell (task 2a)

Part of the task-2 decomposition (2a-2e) from `CAMPAIGN.html`, test run #2. Scope: the
always-visible chrome — `LeftNav.tsx`, `TopStatusBar.tsx`, `CenterGraph.tsx`,
`KaiSigil.tsx`, `BottomActivityFeed.tsx`, `WorkflowsDrawer.tsx`. Method: read each file in
full, checked for real data wiring vs. static/fake, not assumed from names.

## Findings

- **CenterGraph.tsx** — PASS. All node counts wired to real `HiveData` fields
  (`hive.tasks`, `hive.governance`, `hive.pulse`, `hive.agents`), each explicitly marked
  `wired: true`.
- **BottomActivityFeed.tsx** — PASS. Real live data (`hive.tasks`, `hive.challenges`,
  `hive.pulse`, `hive.governance`, `hive.online`), honest online/offline indicator.
- **LeftNav.tsx** — PASS, and a good pattern worth naming: nav items that don't have a
  real backing capability yet (`connectors`, `training`) are explicitly marked
  `wired: false` and rendered dimmed with a "soon" label + `aria-disabled` — honest
  degradation, not a fake/dead button pretending to work.
- **KaiSigil.tsx** — PASS. Pure presentational (decorative sigil), correctly driven by
  `online`/`speaking` props from its parent rather than fetching its own data — appropriate
  for what it is, not a gap.
- **TopStatusBar.tsx** — PASS. Already reviewed/extended this session (task 1's readiness
  meter) — confirmed real live data throughout, degrades honestly.
- **WorkflowsDrawer.tsx** — REAL FINDING, FIXED: the "Automation" workflow's detail text
  read `merge-readiness (verify → PR → CI-autofix → merge)` — stale as of tonight's
  merge-authority tightening (automation never self-merges, `CAMPAIGN.html` protocol,
  2026-08-01/02). Updated to `→ hold for founder review`. Everything else in this file
  (the `wired: false` "soon" items) was already honest.

## Verdict

5 of 6 components: real, honestly wired, no action needed. 1 of 6: one real stale-text bug
found and fixed (small, safe, no build risk — a label string, not logic).
