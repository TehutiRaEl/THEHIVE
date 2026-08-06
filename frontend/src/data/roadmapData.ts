// THEHIVE development roadmap — the STATIC, append-only half only (2026-08-04, task 30).
// Founder actions / decisions / in-progress / backlog used to live here too, as a
// hand-maintained literal with no fetch — which is exactly why the Command Center's
// roadmap panel went stale and told the founder to go provision things already bound.
// Those four sections now come live from GET /v11/roadmap/development (worker/src/
// index.js) instead — see RoadmapPanel.tsx. What's left here is genuinely historical
// (completed phases) or a real, slow-changing federation table — safe to hand-maintain
// because it isn't the thing that drifted.

export interface CompletedPhase {
  title: string;
  span: string;
  items: string[];
}

export interface FederationRow {
  colony: string;
  role: string;
  lang: string;
  hmac: boolean;
  status: string;
}

export const completedPhases: CompletedPhase[] = [
  {
    title: 'Foundation — Colony Standard Layer, Core Engine, Governance',
    span: 'Phases 1–3',
    items: [
      'All 7 colonies speak the same /colony/{health,info,manifest,events,agents,capabilities} contract, HMAC-signed, permissive-when-unset by design.',
      'Core: WAL SQLite + 10 indexes, batched event protocol (50ms window, no Redis — a deliberate rule), 60s wealth-cache TTL, JWT iss claim.',
      'Governance: GOVERNANCE.md, 110-role ROLES.md across 11 tiers, advisory (non-blocking) CI across Tier-1 repos.',
    ],
  },
  {
    title: 'Colony consoles, memory vault, full-federation HMAC',
    span: 'Phases 4–6',
    items: [
      'Per-colony consoles, D3 colony-zoom panel, auto-generated 101-node memory vault.',
      'Every 07-04/07-05-era build blocker resolved (aether package.json, 4DBRAIN port, LocalAGI URL, colony.json).',
      'Non-Python HMAC shipped for real: timingSafeEqual (automatisch/Express), hmac.Equal (LocalAGI/Go).',
    ],
  },
  {
    title: 'Command Center UI — all 13 tabs, live data, no mocks',
    span: 'supersedes the 25-gap 2026-07-05 plan',
    items: [
      '4D tesseract tab, DREAM guild tab, ARCANE (ML) guild tab, MISSIONS lifecycle tab, API explorer tab — all built; three separate constitution surfaces exist across the two frontend efforts.',
      'Grafana dashboards — monitoring/grafana/ and docker/grafana/ both exist now; two older artifacts had this marked pending.',
      'GET /v11/constitution/history is a real, live endpoint.',
      'Roadmap/evolution bars in SOUL, Legal Guild research assistant, real (not mock) gateway-console tool registry, R2 file panel, honest LLM provider status, venture reasoning-tree panel (built inside THEHIVE instead of a separate colony repo).',
    ],
  },
  {
    title: 'Edge Worker (System B) — the live production system',
    span: 'Phase 8 + heartbeat',
    items: [
      'CORS scoping, list-endpoint pagination, Cache API for slow-changing GETs.',
      'KV rate-limiting flipped live — 30 req/min on write endpoints, real namespace bound.',
      'Queues producer/consumer fully written, activation-ready — blocked only on the founder creating the queue.',
      'Heartbeat cron (resolve/spawn/pulse), Workers-AI-generated propositions.',
      '/v11/automaton/infer reuses the existing generate() provider waterfall verbatim — no new attack surface.',
    ],
  },
  {
    title: 'Colony deep-integration',
    span: 'Phases A–G, shipped 2026-07-22',
    items: [
      'A — proprietary LICENSE across NAR2/4DBRAIN/aether; aether’s missing HMAC fixed; Kimi-K2’s duplicate Node bridge retired.',
      'B — tesseract/hypercomplex/dream-engine math repatriated into 4DBRAIN’s own tesseract_math package.',
      'C — colony_sdk consolidated into one real shared Python package (was hand-copied into 3 repos) + a Node equivalent.',
      'D — automatisch native apps/thehive/ trigger + action, AGPL-clean (HTTP-only boundary).',
      'E — a real THEHIVE MCP server for LocalAGI (not the older fake tool registry).',
      'F — PERMISSIONS.md tiers enforced in code before hive_mesh.dispatch() fires.',
      'G — colonies.json cross-repo harness manifest.',
    ],
  },
  {
    title: 'The automaton — rebuilt from a 5-gap security review',
    span: '2026-07-21',
    items: [
      'Reverse-engineered from Conway-Research’s MIT original, then independently reviewed: a fake "human confirmation" deny, uncapped replication funding, self-editable authority rules, an unencrypted wallet key, non-functional approval scaffolding.',
      'All five closed with real tests (15/15 green, zero runtime deps). Two master switches default off; replication approval is never optional regardless of switch state.',
    ],
  },
  {
    title: 'Constitution reconciliation — FABLE_DNA.md vs. soul.md',
    span: '2026-07-30',
    items: [
      'Three real drifts found in the genome’s Chromosome I vs. soul.md’s precise text (dropped mechanics in F-001/F-002, inverted autonomy direction in F-003).',
      'Cross-checked against validator.py’s real enforcement first — confirmed the drift was in prose, not enforced law, before correcting.',
    ],
  },
  {
    title: 'PR review + environment recovery + SOUL-ledger bug fix',
    span: '2026-07-30/31',
    items: [
      'Three PRs actually reviewed, not glanced at: a truncated class + syntax error; S1 rate-limiting documented but missing from Worker code plus a broken build from an undeclared dependency; a PR clean-looking by diff but with mergeable_state "dirty" (now PR_LESSONS.md L-09).',
      'System Python kept hitting RECORD-file conflicts on repeated pip installs — a project-local .venv sidesteps the whole class of problem.',
      'wallet.py coverage work surfaced a real bug on first run: credit() operating on a connection its own nested call had already closed — every SOUL grant/tip/payout was silently broken. Fixed, covered by 26 tests including a total-supply invariance check (Fixed Law #4).',
    ],
  },
];

export const federation: FederationRow[] = [
  { colony: 'THEHIVE', role: 'Queen · governance · Layer 1', lang: 'Python / FastAPI + Worker', hmac: true, status: 'live' },
  { colony: 'NAR2', role: 'Security · Layer 5', lang: 'Python', hmac: true, status: 'integrated' },
  { colony: '4DBRAIN', role: 'Cognitive · tesseract math · Layer 3', lang: 'Python', hmac: true, status: 'integrated' },
  { colony: 'Kimi-K2', role: 'Mind · Layer 3', lang: 'Python', hmac: true, status: 'integrated' },
  { colony: 'aether', role: 'Commerce · Layer 7', lang: 'TypeScript / Next.js', hmac: true, status: 'integrated' },
  { colony: 'automatisch', role: 'Workflow · Layer 7', lang: 'Node.js / Express', hmac: true, status: 'integrated' },
  { colony: 'LocalAGI', role: 'Body / swarm · Layer 3', lang: 'Go', hmac: true, status: 'integrated + MCP consumer' },
];

export const supersedes = [
  '"Phase 7 Checkpoint" (07-04)',
  '"Session Progress" (07-05)',
  '"Build Progress" (07-08)',
  '"Your To-Do List" (07-18)',
];
