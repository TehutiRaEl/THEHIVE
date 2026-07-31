// THEHIVE development roadmap — single in-repo source of truth.
// Mirrors the published tracker at claude.ai/code/artifact/5855fd37-1dbc-4f53-9ab0-415b1b61baee
// (2026-07-31), which itself replaced four scattered session artifacts (07-04 → 07-18).
// Update this file when work lands; redeploy the artifact from the same data when it drifts.

export type Status = 'done' | 'active' | 'blocked' | 'decision' | 'backlog';

export interface RoadmapCard {
  title: string;
  status: Status;
  statusLabel: string;
  body: string;
}

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

export const founderActions: RoadmapCard[] = [
  {
    title: 'Set FOUNDER_KEY so Proposals approve/reject actually works',
    status: 'blocked',
    statusLabel: 'needs you',
    body: 'The code fails closed on purpose — no key bound, no approvals move. Run `npx wrangler secret put FOUNDER_KEY` with a password only you know, wait ~10 min for redeploy, then paste that same value into this panel.',
  },
  {
    title: 'Create the Vectorize index (long-term memory)',
    status: 'blocked',
    statusLabel: 'needs you',
    body: 'Still commented out in wrangler.jsonc on purpose. `npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine`, then tell Claude — the binding uncomment + redeploy is a one-line follow-up.',
  },
  {
    title: 'Create the R2 bucket (file uploads)',
    status: 'blocked',
    statusLabel: 'needs you',
    body: 'Also still commented out. `npx wrangler r2 bucket create hive-files`, then tell Claude to uncomment the binding.',
  },
  {
    title: 'Create the Queues consumer (async LLM jobs)',
    status: 'blocked',
    statusLabel: 'needs you',
    body: 'No MCP tool exists to create a Cloudflare Queue, so this is founder-only regardless. `npx wrangler queues create hive-llm-jobs`, then tell Claude — the producer/consumer code is already written and activation-ready.',
  },
  {
    title: 'Confirm the PAT secret + backup keys are actually set',
    status: 'decision',
    statusLabel: 'unverified',
    body: 'The workflows exist (distribute-pat.yml, grok-pat-distribute.yml, weekly D1 backup) — whether the underlying secrets (PAT, WORKER_ADMIN_KEY, WORKER_URL) are populated isn’t something code can confirm from here. A green run in the Actions tab is the tell.',
  },
];

export const decisionsPending: RoadmapCard[] = [
  {
    title: 'System A (FastAPI backend/) — retire or actually deploy it?',
    status: 'decision',
    statusLabel: 'your call',
    body: 'Real, tested code (51%+ coverage, 350+ passing tests) sitting unprovisioned — the Oracle Cloud deploy target is gated on an unset ORACLE_HOST secret. System B (this Worker) is the one verified live. Leave A retired as reference, or provision Oracle and stand it up for real.',
  },
  {
    title: 'Which frontend is canonical?',
    status: 'decision',
    statusLabel: 'your call',
    body: 'This React Command Center (what’s actually deployed) vs. a separate "gamified UI" set merged via feature/gamified-ui-components (HiveDashboard, TesseractChamber, ConstitutionHall, MemoryVault). Both are real; only one should be "the" one going forward.',
  },
  {
    title: 'Two dead duplicate backend files — delete or keep?',
    status: 'decision',
    statusLabel: 'your call',
    body: 'backend/constitution.py and backend/llm_router.py have zero importers anywhere (confirmed via grep) — the real, live versions are backend/core/constitution.py and backend/core/llm_router.py. Deleting production files is outside the autonomous arc’s authority, so this is parked for your word.',
  },
  {
    title: 'n8n integration — pursue or drop?',
    status: 'decision',
    statusLabel: 'your call',
    body: 'Proposed 2026-07-05 (colony health events → n8n automations). Zero implementation exists anywhere — confirmed absent, not just unfinished.',
  },
  {
    title: 'Real money — forming a business entity',
    status: 'decision',
    statusLabel: 'real-world, no rush',
    body: 'LLC formation, business bank account, Stripe — none of this can or should be automated. By the hive’s own rules this always stays yours, with a real accountant or lawyer.',
  },
];

export const inProgress: RoadmapCard[] = [
  {
    title: '6-session autonomous development arc',
    status: 'active',
    statusLabel: 'session 1/6 complete',
    body: 'Self-paced Routine, fires back into the same session every 3–8h based on workload: reviews new PRs first, then continues the coverage sweep, self-merging only pure test-file-only diffs with green CI. Stops and sends one consolidated report after session 6.',
  },
  {
    title: 'Backend test-coverage sweep',
    status: 'active',
    statusLabel: '51% → climbing',
    body: 'Started at 46%, CI floor locked at 45% so it can only grow. One real production bug found so far: WalletManager.credit() was raising sqlite3.ProgrammingError on every SOUL grant/tip/payout — fixed. Next targets: utility_economy.py, genome.py, llm_router.py.',
  },
];

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

export const backlog: RoadmapCard[] = [
  {
    title: 'Dynamic COLONY_BASE_URLS',
    status: 'backlog',
    statusLabel: 'confirmed pending',
    body: 'Still a hardcoded frontend/src/utils/constants.ts map — every colony URL change is a manual edit. /v11/hive/status already returns all colony URLs with health; wiring it up is a small, real task.',
  },
  {
    title: 'Worldbuilding Guild UI',
    status: 'backlog',
    statusLabel: 'confirmed pending',
    body: 'Backend stub exists (backend/guilds/worldbuilding_guild.py, disabled), zero frontend surface — world creation form, token supply, zone editor never built.',
  },
  {
    title: 'Agent genome viewer + arena cross-breed UI',
    status: 'backlog',
    statusLabel: 'confirmed pending',
    body: 'Real reproduction logic exists in backend/core/genome.py — no frontend ever surfaced it. DNA visualization, trait breakdown, 2-agent cross-breed selector all still on paper.',
  },
  {
    title: 'HDC/VSA layer — dedicated UI + docs',
    status: 'backlog',
    statusLabel: 'confirmed pending',
    body: 'backend/core/hdc.py is real and 100% test-covered — hyperdimensional computing for agent-to-agent comms — but never surfaced or explained anywhere in the UI.',
  },
  {
    title: 'Skill-set cross-referencing',
    status: 'backlog',
    statusLabel: 'confirmed pending',
    body: 'Two skill sets exist side by side with zero cross-references. skill-census would show the gap directly but hasn’t been re-run since first noticed.',
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

export const snapshot = {
  phasesDone: 9,
  arcsActive: 1,
  backlogItems: backlog.length,
  decisions: decisionsPending.length,
};

export const supersedes = [
  '"Phase 7 Checkpoint" (07-04)',
  '"Session Progress" (07-05)',
  '"Build Progress" (07-08)',
  '"Your To-Do List" (07-18)',
];
