// Sovereign Hive - Colony Types

export type ColonyId = 
  | 'THEHIVE'
  | 'NAR2'
  | 'LocalAGI'
  | 'automatisch'
  | '4DBRAIN'
  | 'Kimi-K2'
  | 'aether'
  | 'freeCodeCamp'
  | 'free-programming-books'
  | 'build-your-own-x'

// Colony Configuration
export interface ColonyConfig {
  id: ColonyId
  name: string
  description: string
  icon: string
  color: string
  secondaryColor: string
  theme: 'queen' | 'volcanic' | 'garden' | 'cyber' | 'neural' | 'military' | 'commerce' | 'library' | 'archive' | 'workshop'
  capabilities: string[]
  workflows: string[]
  isKnowledgeFork: boolean
}

// Colony Status
export type ColonyStatus = 'healthy' | 'warning' | 'error' | 'offline' | 'maintenance'

export interface ColonyHealth {
  id: ColonyId
  status: ColonyStatus
  cpu: number // percentage
  memory: number // percentage
  disk: number // percentage
  uptime: number // days
  lastPing: string
  lastError?: string
  history: HealthHistory[]
}

export interface HealthHistory {
  timestamp: string
  cpu: number
  memory: number
  disk: number
  status: ColonyStatus
}

// Colony Capabilities
export interface ColonyCapability {
  id: string
  name: string
  description: string
  category: 'workflow' | 'api' | 'data' | 'security' | 'ui'
  status: 'active' | 'inactive' | 'maintenance'
  lastUsed: string
  usageCount: number
}

// Colony Information
export interface Colony {
  id: ColonyId
  config: ColonyConfig
  health: ColonyHealth
  capabilities: ColonyCapability[]
  workflows: Workflow[]
  issues: ColonyIssue[]
  lastUpdated: string
}

// Colony Issues
export interface ColonyIssue {
  id: string
  type: 'workflow' | 'dependency' | 'security' | 'performance' | 'configuration'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

// Predefined Colony Configs
export const COLONY_CONFIGS: Record<ColonyId, ColonyConfig> = {
  THEHIVE: {
    id: 'THEHIVE',
    name: 'THEHIVE',
    description: 'Queen of the Sovereign Hive — constitutional governance, agent economy, and hive coordination',
    icon: '🏰',
    color: '#FFD700',
    secondaryColor: '#F8F9FA',
    theme: 'queen',
    capabilities: ['constitution', 'governance', 'coordination', 'memory', 'cycle'],
    workflows: ['ci.yml', 'deploy.yml', 'constitution-sync.yml', 'distribute-pat.yml', 'governance-advisory.yml', 'colony-health.yml', 'pages.yml', 'set-repo-descriptions.yml'],
    isKnowledgeFork: false
  },
  NAR2: {
    id: 'NAR2',
    name: 'NAR2',
    description: 'Neural Architecture Repository 2 - Workflow execution and processing',
    icon: '🔥',
    color: '#FF6B35',
    secondaryColor: '#0A0E2A',
    theme: 'volcanic',
    capabilities: ['workflow-execution', 'data-processing', 'automation'],
    workflows: ['hive.yml', 'nightly.yml'],
    isKnowledgeFork: false
  },
  LocalAGI: {
    id: 'LocalAGI',
    name: 'LocalAGI',
    description: 'Local AI agent framework - Cognitive processing and development',
    icon: '🌿',
    color: '#00C851',
    secondaryColor: '#33B5E5',
    theme: 'garden',
    capabilities: ['cognitive-processing', 'development', 'testing'],
    workflows: ['tests.yml', 'goreleaser.yml', 'governance-check.yml'],
    isKnowledgeFork: true
  },
  automatisch: {
    id: 'automatisch',
    name: 'automatisch',
    description: 'Automation workflow system - Security and coordination',
    icon: '🤖',
    color: '#F8F9FA',
    secondaryColor: '#00BCD4',
    theme: 'cyber',
    capabilities: ['automation', 'security', 'coordination'],
    workflows: ['backend.yml', 'ci.yml'],
    isKnowledgeFork: true
  },
  '4DBRAIN': {
    id: '4DBRAIN',
    name: '4DBRAIN',
    description: '4D Brain - Neural network processing and memory',
    icon: '🧠',
    color: '#6B3FA0',
    secondaryColor: '#E91E63',
    theme: 'neural',
    capabilities: ['neural-processing', 'memory', 'learning'],
    workflows: ['constitution-receive.yml'],
    isKnowledgeFork: false
  },
  'Kimi-K2': {
    id: 'Kimi-K2',
    name: 'Kimi-K2',
    description: 'Kimi-K2 - Security and military operations',
    icon: '🛡️',
    color: '#FF4444',
    secondaryColor: '#0A0E2A',
    theme: 'military',
    capabilities: ['security', 'protection', 'defense'],
    workflows: ['constitution-receive.yml'],
    isKnowledgeFork: false
  },
  aether: {
    id: 'aether',
    name: 'aether',
    description: 'Commerce colony — License Authority Server with Stripe Connect, JWT licensing, and SOUL ledger settlement',
    icon: '💰',
    color: '#FFD700',
    secondaryColor: '#00C851',
    theme: 'commerce',
    capabilities: ['commerce', 'licensing', 'settlement'],
    workflows: ['constitution-receive.yml'],
    isKnowledgeFork: false
  },
  freeCodeCamp: {
    id: 'freeCodeCamp',
    name: 'freeCodeCamp',
    description: 'Knowledge fork - Free programming resources and curriculum',
    icon: '📚',
    color: '#33B5E5',
    secondaryColor: '#F8F9FA',
    theme: 'library',
    capabilities: ['knowledge', 'education', 'resources'],
    workflows: [],
    isKnowledgeFork: true
  },
  'free-programming-books': {
    id: 'free-programming-books',
    name: 'free-programming-books',
    description: 'Knowledge fork - Free programming books collection',
    icon: '📖',
    color: '#00BCD4',
    secondaryColor: '#F8F9FA',
    theme: 'archive',
    capabilities: ['knowledge', 'archive', 'collection'],
    workflows: [],
    isKnowledgeFork: true
  },
  'build-your-own-x': {
    id: 'build-your-own-x',
    name: 'build-your-own-x',
    description: 'Knowledge fork - Build your own X collection',
    icon: '🛠️',
    color: '#FF6B35',
    secondaryColor: '#F8F9FA',
    theme: 'workshop',
    capabilities: ['knowledge', 'building', 'creation'],
    workflows: [],
    isKnowledgeFork: true
  }
}
