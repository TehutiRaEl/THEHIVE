export type ColonyId = 'THEHIVE' | 'NAR2' | 'LocalAGI' | 'automatisch' | '4DBRAIN' | 'Kimi-K2' | 'aether' | 'freeCodeCamp' | 'free-programming-books' | 'build-your-own-x'

export type TabId = 'hive' | 'dream' | 'arcane' | 'world' | 'soul' | 'govern' | 'missions' | 'api' | '4d' | 'arena' | 'wow' | 'nomanssky' | 'settings'

export interface Colony {
  id: ColonyId
  name: string
  description: string
  status: 'optimal' | 'degraded' | 'critical' | 'offline'
  health: { cpu: number; memory: number; disk: number; uptime: number }
  position: { x: number; y: number; z: number }
  theme: { primary: string; secondary: string }
}

export interface Workflow {
  id: string
  name: string
  file: string
  status: 'passing' | 'failing' | 'pending' | 'inactive'
  lastRun: string | null
  runs: number
  failures: number
}

export interface MemoryNode {
  id: string
  type: 'colony' | 'hive' | 'repo' | 'guild' | 'module' | 'philosophy'
  name: string
  x: number
  y: number
  z: number
  size: number
  color: string
}

export interface MemoryLink {
  source: string
  target: string
  type: string
  weight: number
}

export interface Wealth {
  timeWealth: number
  valueWealth: number
  total: number
}

export interface Agent {
  id: string
  type: 'Mind' | 'Body' | 'Soul' | 'Daemon' | 'Solomon'
  name: string
  level: number
  health: number
  energy: number
  status: 'active' | 'idle' | 'offline'
}

export interface Mission {
  id: string
  title: string
  description: string
  type: 'main' | 'side' | 'daily'
  status: 'pending' | 'in-progress' | 'completed'
  progress: number
  reward: { xp: number; gold: number }
}

export interface ArenaEvent {
  id: string
  type: string
  timestamp: string
  data: Record<string, any>
}

export interface UIState {
  activeTab: TabId
  isSidebarOpen: boolean
  theme: 'dark' | 'light'
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  duration?: number
}

export interface GameState {
  player: { position: { x: number; y: number; z: number }; fuel: number }
  camera: { position: { x: number; y: number; z: number }; mode: string }
  selectedColony: ColonyId | null
}

export type ThemeMode = 'dark' | 'light' | 'cosmic'

// The living theme object the UI store manages; mode is the user-facing switch
export interface Theme {
  mode: ThemeMode
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
}

export interface UserPreferences {
  theme: ThemeMode | 'system'
  language: string
  notifications: boolean
  fontSize?: 'small' | 'medium' | 'large'
  sound?: boolean
  soundEnabled?: boolean
  animations?: boolean
  animationsEnabled?: boolean
  compactMode?: boolean
  timezone?: string
}

export interface Modal {
  id: string
  title: string
  content: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClose?: () => void
  isOpen: boolean
}
