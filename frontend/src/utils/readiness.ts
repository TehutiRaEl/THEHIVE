import type { DebugEnv } from '../hooks/useHiveData'

// "Queen's Progress" — production-readiness %. Every number here is either
// computed live from a real endpoint (switches, cited) or a curated constant
// with its own last-verified date (coverage, open items) — never asserted.
// See CAMPAIGN.html task 1 and SWITCHBOARD.md for the source of each figure.

export interface ReadinessBreakdown {
  pct: number | null
  switchesPct: number | null   // live, from /v11/debug/env
  coveragePct: number          // curated — see COVERAGE_LAST_MEASURED below
  openItemsPct: number         // curated — see OPEN_ITEMS below
  degraded: boolean            // true if the live half couldn't be probed
}

// Last real `pytest tests/unit/ -q --cov=backend --cov-report=term` run.
// Update this pair together when re-measured — don't let one go stale alone.
const COVERAGE_ACTUAL = 52
const COVERAGE_FLOOR = 45 // ci.yml --cov-fail-under
const COVERAGE_LAST_MEASURED = '2026-08-01'

// Founder-decision items still genuinely open (not yet answered/resolved).
// Update this count as items resolve — see CAMPAIGN.html's blocked tasks and
// HIVE_PULSE.md's "Right now" section for the current list.
const OPEN_ITEMS_OPEN = 2 // treasury_guild.py revenue-split ("discuss later"), Kai El raw terminal access (tabled)
const OPEN_ITEMS_TOTAL = 3 // + Grok bridge activation ("not sure yet")
const OPEN_ITEMS_LAST_REVIEWED = '2026-08-01'

// automaton's 2 switches aren't exposed by /v11/debug/env (they're env vars
// on a different system, not Worker bindings) — curated from
// automaton/FLIP_THE_SWITCHES.md, both still off as of this date.
const AUTOMATON_SWITCHES_FLIPPED = 0
const AUTOMATON_SWITCHES_TOTAL = 2
const AUTOMATON_LAST_REVIEWED = '2026-08-01'

export function computeReadiness(debugEnv: DebugEnv | null): ReadinessBreakdown {
  let switchesPct: number | null = null
  let degraded = false

  if (debugEnv) {
    const b = debugEnv.bindings
    const hiveWideFlipped =
      (b.VECTORIZE ? 1 : 0) +
      (b.FILES ? 1 : 0) +
      (b.RATE_LIMIT_KV ? 1 : 0) +
      (b.LLM_QUEUE ? 1 : 0) +
      (debugEnv.secrets_present.some(s => /API_KEY/.test(s)) ? 1 : 0) +
      (debugEnv.secrets_present.includes('FOUNDER_KEY') ? 1 : 0)
    const flipped = hiveWideFlipped + AUTOMATON_SWITCHES_FLIPPED
    const total = 6 + AUTOMATON_SWITCHES_TOTAL
    switchesPct = Math.round((flipped / total) * 100)
  } else {
    degraded = true
  }

  const coveragePct = Math.min(100, Math.round((COVERAGE_ACTUAL / COVERAGE_FLOOR) * 100))
  const openItemsPct = Math.round(((OPEN_ITEMS_TOTAL - OPEN_ITEMS_OPEN) / OPEN_ITEMS_TOTAL) * 100)

  // Weighted: switches matter most (real capability gates), coverage and
  // open-decision-resolution are supporting signals. Weights are a judgment
  // call, documented here rather than hidden — revisit if they feel wrong.
  const pct = switchesPct == null
    ? null
    : Math.round(switchesPct * 0.5 + coveragePct * 0.25 + openItemsPct * 0.25)

  return { pct, switchesPct, coveragePct, openItemsPct, degraded }
}

export const READINESS_SOURCES = {
  coverageLastMeasured: COVERAGE_LAST_MEASURED,
  openItemsLastReviewed: OPEN_ITEMS_LAST_REVIEWED,
  automatonLastReviewed: AUTOMATON_LAST_REVIEWED,
}
