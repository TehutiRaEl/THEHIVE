# Command Center audit — legacy tabs (task 2b)

Part of the task-2 decomposition. Scope: the 13 legacy command-center tabs (4D, API,
ARCANE, ARENA, DREAM, GOVERN, HIVE, MISSIONS, NO_MANS_SKY, SETTINGS, SOUL, WORLD, WOW).
Method: grep-scanned all 13 for real data wiring vs. static, then read the 4 lowest/zero-
signal ones in full plus one spot-check of the strongest-signal group.

## Findings

- **10 of 13 tabs** (API, ARCANE, ARENA, DREAM, GOVERN, HIVE, MISSIONS, SOUL, WORLD, WOW) —
  PASS. Real `hive.*` data wiring confirmed (spot-checked WOW.tsx in full: `hive.online`,
  `hive.loading`, `hive.agents.length`, degrades correctly to "checking…"/"unreachable").
  `MISSIONS.tsx`'s one `Math.random()` hit is a benign fallback-ID generator for a missing
  `mission.id`, not fake data — a structurally different (and fine) use from the invented
  stat/value generation already found and deleted from the second-frontend leftovers.
- **4D.tsx** — genuinely incomplete, but ALREADY honestly self-labeled: "⚠️ Math needs real
  geometry (currently stubs)" is in the component's own rendered output. Not a bug — a
  known, disclosed gap. No action needed here.
- **NO_MANS_SKY.tsx** — uses `PlannedControl` (a real, deliberate shared component: a
  disabled button explicitly titled "not yet wired," opacity-dimmed) instead of a
  fake-clickable button. Same honest-degradation discipline as `LeftNav`'s `wired: false`
  pattern. Confirmed correct, not a gap.
- **SETTINGS.tsx** — REAL FINDING, not fixed here (out of this task's scope, logged for
  task 6 instead): settings genuinely persist via `localStorage.setItem('appSettings', ...)`
  — real, functional, not fake. But the save confirmation is a raw browser `alert()` +
  `console.log`, exactly the kind of one-off notification handling task 6
  (`stores/uiStore.ts` adoption) already describes replacing. Cross-referenced there rather
  than fixed here, since task 6 owns that scope.

## Verdict

13 of 13 tabs: no dishonest/fake-data patterns found. 1 genuinely incomplete but already
disclosed (4D.tsx). 1 real cross-reference logged for task 6 (SETTINGS.tsx's alert()).
Zero bugs needing a fix in this task's own scope.
