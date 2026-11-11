import type { ColonyId, TabId } from '../types'

// Colony base URLs — deliberately empty. The colonies have no separate HTTP
// origin to call: colony status comes from the live Worker itself,
// GET /v11/debug/colony-ping (same-origin), not from each colony's own
// server. The old localhost map (THEHIVE :8080, NAR2 :8000, …) pointed at
// the dead Jasper backend and made every colony read "offline". Kept as a
// record keyed by ColonyId so callers can look a colony up by id; the value
// is '' (same-origin) for every colony.
export const COLONY_BASE_URLS: Record<ColonyId, string> = {
  THEHIVE: '',
  NAR2: '',
  '4DBRAIN': '',
  aether: '',
  automatisch: '',
  'Kimi-K2': '',
  LocalAGI: '',
  freeCodeCamp: '',
  'free-programming-books': '',
  'build-your-own-x': '',
}

// Same-origin by default: the Worker serves /v11 on the same origin as the
// app, so '' is the live value in production. In local dev, set
// VITE_API_BASE_URL to the live Worker origin (see frontend/README.md) —
// without it, dev reads same-origin and the Vite dev server has no /v11,
// so the app reads OFFLINE. Never fall back to localhost: the Jasper
// backend that used to answer there runs nowhere now.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

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
  { id: 'no-mans-sky', label: 'NMS', icon: '🚀' },
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
