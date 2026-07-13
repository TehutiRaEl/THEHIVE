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

export interface HiveData {
  online: boolean
  loading: boolean
  health: { status?: string; version?: string; runtime?: string } | null
  agents: Agent[]
  challenges: Challenge[]
  pulse: Pulse[]
  memoryBound: boolean
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
    agents: [], challenges: [], pulse: [], memoryBound: false,
  })

  const load = useCallback(async () => {
    const [health, agents, challenges, pulse, mem] = await Promise.all([
      j<{ status: string; version: string; runtime: string }>('/health'),
      j<{ agents: Agent[] }>('/agents'),
      j<{ challenges: Challenge[] }>('/arena/challenges'),
      j<{ pulse: Pulse[] }>('/pulse'),
      j<{ vectorize_bound: boolean }>('/memory/status'),
    ])
    setState({
      online: !!health,
      loading: false,
      health,
      agents: agents?.agents ?? [],
      challenges: challenges?.challenges ?? [],
      pulse: pulse?.pulse ?? [],
      memoryBound: !!mem?.vectorize_bound,
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
