import { useState, useEffect, useCallback } from 'react'
import { getHiveStatus } from '../services/api'
import type { ColonyId } from '../types'

export interface ColonyHealthEntry {
  id: ColonyId
  status: 'healthy' | 'degraded' | 'offline'
  latencyMs: number
  lastChecked: string
}

export function useColonyHealth(pollIntervalMs = 30_000) {
  const [health, setHealth] = useState<Record<string, ColonyHealthEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const t0 = Date.now()
      const data = await getHiveStatus()
      const latency = Date.now() - t0
      const colonies = data.colonies as Record<string, unknown>
      const entries: Record<string, ColonyHealthEntry> = {}
      for (const [id, info] of Object.entries(colonies)) {
        const c = info as Record<string, unknown>
        entries[id] = {
          id: id as ColonyId,
          status:
            c.status === 'healthy' ? 'healthy' : c.status === 'degraded' ? 'degraded' : 'offline',
          latencyMs: latency,
          lastChecked: new Date().toISOString(),
        }
      }
      setHealth(entries)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, pollIntervalMs)
    return () => clearInterval(interval)
  }, [refresh, pollIntervalMs])

  return { health, loading, error, refresh }
}
