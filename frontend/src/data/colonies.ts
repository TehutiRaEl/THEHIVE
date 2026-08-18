// Real Sovereign Hive federation colonies — re-skinned 2026-08-18 from the
// fictional sci-fi placeholder data on the orphaned feature/gamified-ui-components
// branch (see branch-dissection pass, Project_file/Founders Visonary Folder/HIVE_UPDATES/).
//
// Source of truth for the "6 colonies" roster: GET /v11/debug/colony-ping's own
// `roster` array (worker/src/index.js) — the live endpoint this card calls for
// status. That roster (NAR2, 4DBRAIN, aether, automatisch, Kimi-K2, LocalAGI)
// is also what frontend/src/types/colony.ts's COLONY_CONFIGS and
// frontend/src/data/roadmapData.ts's `federation` table already use — it is
// the newer, correct list. .queen/hive.yml is a partially stale manifest
// (uses different node names — outer-colony-a/b, kimi-gateway — and omits
// LocalAGI entirely) so it is NOT used as the roster source here, only cross-
// referenced for description text where it agrees.
//
// "tier"/"layer" is real: the hive's own layered architecture assigns each
// colony a numbered layer (see roadmapData.ts `federation`, README.md's
// architecture diagram). "population", "founded date", and "leader" have no
// real counterpart anywhere in the hive's data — they are NOT invented here;
// this shape simply omits them rather than filling them with fiction.

export type RealColonyId = 'NAR2' | '4DBRAIN' | 'aether' | 'automatisch' | 'Kimi-K2' | 'LocalAGI';

export interface RealColony {
  id: RealColonyId;
  name: string;
  /** GitHub repo, owner/name (TehutiRaEl org, per .github/workflows/set-repo-descriptions.yml) */
  repo: string;
  repoUrl: string;
  /** Real repo description as set by set-repo-descriptions.yml */
  description: string;
  /** Real role text from roadmapData.ts's federation table, e.g. "Security · Layer 5" */
  role: string;
  /** Numeric layer parsed out of `role` — the closest real analogue to a "tier" badge */
  layer: number;
  /** Primary language/runtime, from roadmapData.ts's federation table */
  language: string;
  /** Guild assignments from .queen/hive.yml where that colony has an entry there */
  guilds: string[];
  icon: string;
  /** Base URL env var name this colony resolves from at runtime (utils/constants.ts, colony-health.yml) */
  baseUrlEnvVar: string;
}

export const colonies: RealColony[] = [
  {
    id: 'NAR2',
    name: 'NAR2',
    repo: 'TehutiRaEl/NAR2',
    repoUrl: 'https://github.com/TehutiRaEl/NAR2',
    description: 'Solomon security colony — nocturnal swarm with free LLM gateways, deep search, and ephemeral blueprint wipe',
    role: 'Security · Layer 5',
    layer: 5,
    language: 'Python',
    guilds: [],
    icon: '🧠',
    baseUrlEnvVar: 'NAR2_URL',
  },
  {
    id: '4DBRAIN',
    name: '4DBRAIN',
    repo: 'TehutiRaEl/4DBRAIN',
    repoUrl: 'https://github.com/TehutiRaEl/4DBRAIN',
    description: 'Mind extension colony — 4D ReAct AI orchestrator with hybrid cloud/local LLM and real-time WebSocket streaming',
    role: 'Cognitive · Layer 3',
    layer: 3,
    language: 'Python',
    guilds: [],
    icon: '🧬',
    baseUrlEnvVar: 'FOURDBRAIN_URL',
  },
  {
    id: 'aether',
    name: 'aether',
    repo: 'TehutiRaEl/aether',
    repoUrl: 'https://github.com/TehutiRaEl/aether',
    description: 'Commerce colony — License Authority Server with Stripe Connect, JWT licensing, and SOUL ledger settlement',
    role: 'Commerce · Layer 7',
    layer: 7,
    language: 'TypeScript / Next.js',
    guilds: ['treasury', 'commerce'],
    icon: '🌬️',
    baseUrlEnvVar: 'AETHER_URL',
  },
  {
    id: 'automatisch',
    name: 'automatisch',
    repo: 'TehutiRaEl/automatisch',
    repoUrl: 'https://github.com/TehutiRaEl/automatisch',
    description: 'Workflow colony — open-source Zapier alternative and hive automation bus (1000+ app integrations)',
    role: 'Workflow · Layer 7',
    layer: 7,
    language: 'Node.js / Express',
    guilds: ['workflow'],
    icon: '🔁',
    baseUrlEnvVar: 'AUTOMATISCH_URL',
  },
  {
    id: 'Kimi-K2',
    name: 'Kimi-K2',
    repo: 'TehutiRaEl/Kimi-K2',
    repoUrl: 'https://github.com/TehutiRaEl/Kimi-K2',
    description: 'Mind colony — Kimi K2 language model interface and reasoning gateway for the Sovereign Hive',
    role: 'Mind · Layer 3',
    layer: 3,
    language: 'Python',
    guilds: [],
    icon: '🌙',
    baseUrlEnvVar: 'KIMI_K2_URL',
  },
  {
    id: 'LocalAGI',
    name: 'LocalAGI',
    repo: 'TehutiRaEl/LocalAGI',
    repoUrl: 'https://github.com/TehutiRaEl/LocalAGI',
    description: 'Body colony (The Swarm) — local-first AI agent platform with skills, RAG, and multimodal support',
    role: 'Body / swarm · Layer 3',
    layer: 3,
    language: 'Go',
    guilds: [],
    icon: '🖥️',
    baseUrlEnvVar: 'LOCALAGI_URL',
  },
];

export default colonies;
