import { create } from 'zustand'
import type { ColonyId } from '../types'

interface Zone {
  id: string
  name: string
  x: number
  y: number
  radius: number
  colonyId?: ColonyId
}

interface WorldAgent {
  id: string
  name: string
  x: number
  y: number
  zone: string
  elo: number
  soul: number
}

type WeatherType = 'clear' | 'aurora' | 'rain' | 'embers' | 'storm'

interface GameState {
  // World state
  zones: Zone[]
  agents: WorldAgent[]
  weather: WeatherType
  timeOfDay: number
  schumannPhase: number
  // Camera
  cameraX: number
  cameraY: number
  zoom: number
  // Selection
  selectedZone: string | null
  selectedColony: ColonyId | null
  // Actions
  setZones: (zones: Zone[]) => void
  setAgents: (agents: WorldAgent[]) => void
  setWeather: (weather: WeatherType) => void
  tickTime: () => void
  tickSchumann: () => void
  moveCamera: (dx: number, dy: number) => void
  setZoom: (zoom: number) => void
  selectZone: (zoneId: string | null) => void
  selectColony: (colonyId: ColonyId | null) => void
  updateAgent: (id: string, updates: Partial<WorldAgent>) => void
}

const DEFAULT_ZONES: Zone[] = [
  { id: 'soul-realm', name: 'SOUL REALM', x: 600, y: 400, radius: 120 },
  { id: 'frequency-lands', name: 'FREQUENCY LANDS', x: 1100, y: 350, radius: 100 },
  { id: 'arena-badlands', name: 'ARENA BADLANDS', x: 900, y: 700, radius: 130 },
  { id: 'trust-citadel', name: 'TRUST CITADEL', x: 400, y: 700, radius: 110, colonyId: 'NAR2' },
  { id: 'r-and-d', name: 'R&D ARCHIPELAGO', x: 1400, y: 550, radius: 115 },
  { id: 'crypto-exchange', name: 'CRYPTO EXCHANGE', x: 1300, y: 900, radius: 95 },
  { id: 'aether-citadel', name: 'AETHER CITADEL', x: 700, y: 1000, radius: 105, colonyId: 'aether' },
  { id: 'automatisch-nexus', name: 'AUTOMATISCH NEXUS', x: 1600, y: 300, radius: 95, colonyId: 'automatisch' },
  { id: 'kimi-oracle', name: 'KIMI ORACLE', x: 1700, y: 750, radius: 100, colonyId: 'Kimi-K2' },
  { id: 'academy-district', name: 'ACADEMY DISTRICT', x: 500, y: 1200, radius: 110 },
  { id: 'outer-colonies', name: 'OUTER COLONIES', x: 1800, y: 1200, radius: 85 },
  { id: 'ml-crucible', name: 'ML CRUCIBLE', x: 1200, y: 1300, radius: 90, colonyId: '4DBRAIN' },
]

export const useGameStore = create<GameState>((set) => ({
  zones: DEFAULT_ZONES,
  agents: [],
  weather: 'clear',
  timeOfDay: 0,
  schumannPhase: 0,
  cameraX: 0,
  cameraY: 0,
  zoom: 1,
  selectedZone: null,
  selectedColony: null,

  setZones: (zones) => set({ zones }),
  setAgents: (agents) => set({ agents }),
  setWeather: (weather) => set({ weather }),
  tickTime: () => set((s) => ({ timeOfDay: (s.timeOfDay + 1) % 200 })),
  tickSchumann: () => set((s) => ({ schumannPhase: (s.schumannPhase + 7.83 / 60) % (2 * Math.PI) })),
  moveCamera: (dx, dy) => set((s) => ({ cameraX: s.cameraX + dx, cameraY: s.cameraY + dy })),
  setZoom: (zoom) => set({ zoom: Math.max(0.3, Math.min(3, zoom)) }),
  selectZone: (zoneId) => set({ selectedZone: zoneId }),
  selectColony: (colonyId) => set({ selectedColony: colonyId }),
  updateAgent: (id, updates) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)) })),
}))
