import type { ResourceAmounts } from './resource';

// The 10 repos in the Sovereign Hive federation (matches utils/constants.ts COLONY_BASE_URLS).
export type ColonyId =
  | 'THEHIVE' | 'NAR2' | '4DBRAIN' | 'aether' | 'automatisch'
  | 'Kimi-K2' | 'LocalAGI' | 'freeCodeCamp' | 'free-programming-books' | 'build-your-own-x';

export interface Colony {
  id: string;
  name: string;
  description: string;
  location: string;
  population: number;
  resources: ResourceAmounts;
  specialization: string;
  founded: string;
  leader: string;
  status: 'active' | 'developing' | 'struggling' | 'abandoned';
  tier: 1 | 2 | 3 | 4 | 5;
}

export interface ColonySummary {
  total: number;
  byTier: Record<number, number>;
  byStatus: Record<string, number>;
  totalPopulation: number;
}

export type ColonyStatus = 'healthy' | 'warning' | 'error' | 'offline' | 'maintenance';

export interface ColonyConfig {
  icon: string;
  name: string;
  description: string;
}

// Static display config per colony — icon/name/description shown by ColonyHeader,
// used to derive default status by HealthDashboard's baseStatuses map.
export const COLONY_CONFIGS: Record<ColonyId, ColonyConfig> = {
  THEHIVE: { icon: '🐝', name: 'THEHIVE', description: 'The Queen — constitutional governance, agent economy, edge Worker' },
  NAR2: { icon: '🧠', name: 'NAR2', description: 'Colony repo — federated agent workflows' },
  '4DBRAIN': { icon: '🧬', name: '4DBRAIN', description: 'Colony repo — 4D visualization and math' },
  aether: { icon: '🌬️', name: 'aether', description: 'Colony repo — licensing, revenue split, kill switch' },
  automatisch: { icon: '🔁', name: 'automatisch', description: 'Colony repo — workflow automation' },
  'Kimi-K2': { icon: '🌙', name: 'Kimi-K2', description: 'Colony repo — model/agent integration' },
  LocalAGI: { icon: '🖥️', name: 'LocalAGI', description: 'Colony repo — local agent runtime (Go)' },
  freeCodeCamp: { icon: '📚', name: 'freeCodeCamp', description: 'Knowledge fork — learning resources' },
  'free-programming-books': { icon: '📖', name: 'free-programming-books', description: 'Knowledge fork — book index' },
  'build-your-own-x': { icon: '🛠️', name: 'build-your-own-x', description: 'Knowledge fork — from-scratch guides' },
};
