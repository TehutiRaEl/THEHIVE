import { useEffect, useState, useCallback } from 'react'
import { API_BASE_URL } from '../utils/constants'

// One hook, the whole live hive. Polls the edge Queen's /v11 surface and
// exposes health + agents + arena challenges + the heartbeat pulse trail.
// Degrades gracefully: any endpoint that fails leaves its slice empty and
// sets `online=false` — the tab renders its static shell rather than crashing.

export interface Agent { name: string; elo?: number; soul?: number }
export interface Challenge {
  id: number; challenger: string; challenged: string
  proposition: string; status: string; winner: string | null; created_at?: string
}
export interface Pulse { ts: string; action: string; detail: string }
export interface GovEntry { action: string; article: string; ts?: string }
export interface SoulEntry { agent: string; soul: number }
export interface EloEntry { agent_name: string; rating: number }
export interface TaskEntry { id: number; title?: string; status?: string; [k: string]: unknown }
export interface FallenIdea { id: number; proposition?: string; challenger?: string; challenged?: string; [k: string]: unknown }
export interface ProviderInfo { id: string; label: string; role: string; bound: boolean; how?: string }
export interface LlmStatus { active_provider: string; providers: string[]; roster?: ProviderInfo[] }
export interface HiveUpdate { id: number; ts: string; kind: string; title: string; body?: string; needs?: string }
export interface RoadmapEntry {
  agent: string; elo?: number; stage: string; nextStage: string
  soul: number; soulToNext: number; progressPct: number
}
export interface RoadmapHoard extends RoadmapEntry { agentCount: number; totalSoul: number }
export interface Roadmap { agents: RoadmapEntry[]; hoard: RoadmapHoard | null; stages: string[]; note?: string }

export interface HiveData {
  online: boolean
  loading: boolean
  health: { status?: string; version?: string; runtime?: string } | null
  agents: Agent[]
  challenges: Challenge[]
  pulse: Pulse[]
  governance: GovEntry[]
  soulBoard: SoulEntry[]
  eloBoard: EloEntry[]
  tasks: TaskEntry[]
  fallen: FallenIdea[]
  llm: LlmStatus | null
  tier3: Record<string, unknown> | null
  updates: HiveUpdate[]
  roadmap: Roadmap | null
  memoryBound: boolean
  aiBound: boolean
  refresh: () => void
}

const V11 = `${API_BASE_URL}/v11`

async function j<T>(path: string, timeoutMs = 6000): Promise<T | null> {
  try {
    const r = await fetch(V11 + path, { signal: AbortSignal.timeout(timeoutMs) })
    if (!r.ok) return null
    return (await r.json()) as T
  } catch {
    return null
  }
}

export function useHiveData(pollMs = 30000): HiveData {
  const [state, setState] = useState<Omit<HiveData, 'refresh'>>({
    online: false, loading: true, health: null,
    agents: [], challenges: [], pulse: [], governance: [], soulBoard: [],
    eloBoard: [], tasks: [], fallen: [], llm: null, tier3: null, updates: [],
    roadmap: null,
    memoryBound: false, aiBound: false,
  })

  const load = useCallback(async () => {
    const [health, agents, challenges, pulse, gov, soul, mem, elo, tasks, fallen, llm, tier3, updates, roadmap] = await Promise.all([
      j<{ status: string; version: string; runtime: string }>('/health'),
      j<{ agents: Agent[] }>('/agents'),
      j<{ challenges: Challenge[] }>('/arena/challenges'),
      j<{ pulse: Pulse[] }>('/pulse'),
      j<GovEntry[]>('/governance/log'),
      j<{ leaderboard: SoulEntry[] }>('/wallet/leaderboard/soul'),
      j<{ vectorize_bound: boolean; ai_bound: boolean }>('/memory/status'),
      j<{ leaderboard: EloEntry[] }>('/grading/leaderboard'),
      j<{ tasks: TaskEntry[] }>('/tasks'),
      j<{ hall_of_fallen_ideas: FallenIdea[] }>('/arena/fallen'),
      j<LlmStatus>('/llm/status'),
      j<Record<string, unknown>>('/tier3/status'),
      j<{ updates: HiveUpdate[] }>('/updates'),
      j<Roadmap>('/roadmap'),
    ])
    setState({
      online: !!health,
      loading: false,
      health,
      agents: agents?.agents ?? [],
      challenges: challenges?.challenges ?? [],
      pulse: pulse?.pulse ?? [],
      governance: Array.isArray(gov) ? gov : [],
      soulBoard: soul?.leaderboard ?? [],
      eloBoard: elo?.leaderboard ?? [],
      tasks: tasks?.tasks ?? [],
      fallen: fallen?.hall_of_fallen_ideas ?? [],
      llm: llm ?? null,
      tier3: tier3 ?? null,
      updates: updates?.updates ?? [],
      roadmap: roadmap ?? null,
      memoryBound: !!mem?.vectorize_bound,
      aiBound: !!mem?.ai_bound,
    })
  }, [])

  useEffect(() => {
    load()
    if (pollMs <= 0) return
    const t = setInterval(load, pollMs)
    return () => clearInterval(t)
  }, [load, pollMs])

  return { ...state, refresh: load }
}
