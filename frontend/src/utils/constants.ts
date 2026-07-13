import type { ColonyId, TabId } from '../types'

export const COLONY_BASE_URLS: Record<ColonyId, string> = {
  THEHIVE: 'http://localhost:8080',
  NAR2: 'http://localhost:8000',
  '4DBRAIN': 'http://localhost:8001',
  aether: 'http://localhost:3000',
  automatisch: 'http://localhost:3001',
  'Kimi-K2': 'http://localhost:8002',
  LocalAGI: 'http://localhost:8081',
  freeCodeCamp: '',
  'free-programming-books': '',
  'build-your-own-x': '',
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '')
export const WS_URL = import.meta.env.VITE_ARENA_WS_URL || 'ws://localhost:8080'

export interface TabDef {
  id: TabId
  label: string
  icon: string
}

export const TAB_DEFS: TabDef[] = [
  { id: 'hive', label: 'HIVE', icon: '🐝' },
  { id: 'dream', label: 'DREAM', icon: '🌙' },
  { id: 'arcane', label: 'ARCANE', icon: '🔮' },
  { id: 'world', label: 'WORLD', icon: '🌍' },
  { id: 'soul', label: 'SOUL', icon: '💎' },
  { id: 'govern', label: 'GOVERN', icon: '⚖' },
  { id: 'missions', label: 'MISSIONS', icon: '🏛' },
  { id: 'api', label: 'API', icon: '🔧' },
  { id: '4d', label: '4D', icon: '⬡' },
  { id: 'arena', label: 'ARENA', icon: '⚔' },
  { id: 'wow', label: 'WOW', icon: '🗺' },
  { id: 'nomanssky', label: 'NMS', icon: '🚀' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

export const COLONY_COLORS: Record<ColonyId, string> = {
  THEHIVE: '#f59e0b',
  NAR2: '#ef4444',
  '4DBRAIN': '#8b5cf6',
  aether: '#06b6d4',
  automatisch: '#10b981',
  'Kimi-K2': '#f97316',
  LocalAGI: '#3b82f6',
  freeCodeCamp: '#0ea5e9',
  'free-programming-books': '#84cc16',
  'build-your-own-x': '#ec4899',
}

export const SCHUMANN_HZ = 7.83

export const MISSION_STATUS_LABELS: Record<string, string> = {
  proposed: 'Proposed',
  formalized: 'Formalized',
  active: 'Active',
  completed: 'Completed',
  failed: 'Failed',
}
