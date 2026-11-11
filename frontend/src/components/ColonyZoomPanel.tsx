import { useEffect, useState, useRef } from 'react'
import { API_BASE_URL, COLONY_COLORS } from '../utils/constants'
import { colonies } from '../data/colonies'
import type { ColonyId } from '../types'
import type { ColonyPingResponse } from '../hooks/useColonyPing'

interface ColonyHealth {
  status?: string
  version?: string
  colony?: string
  runtime?: string
}

interface Props {
  colonyId?: ColonyId | null
  onClose?: () => void
}

export function ColonyZoomPanel({ colonyId = null, onClose = () => {} }: Props) {
  const [ping, setPing] = useState<ColonyPingResponse | null>(null)
  const [health, setHealth] = useState<ColonyHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Live data comes from the Worker itself, same-origin — never from the
  // colony's own base URL. The old code fetched ${base}/colony/capabilities
  // and ${base}/colony/health from a localhost map (Jasper's ports), so the
  // panel always read "offline". GET /v11/debug/colony-ping is the roster +
  // CI-checked status; GET /v11/colony/health is the Queen's liveness.
  // Per-colony capabilities are NOT served by any Worker route yet (founder
  // decision Q1), so this panel shows no capabilities section.
  useEffect(() => {
    if (!colonyId) return
    setLoading(true)
    setPing(null)
    setHealth(null)
    setError(null)

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)

    Promise.all([
      fetch(`${API_BASE_URL}/v11/debug/colony-ping`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`colony-ping HTTP ${r.status}`)
        return r.json() as Promise<ColonyPingResponse>
      }),
      fetch(`${API_BASE_URL}/v11/colony/health`, { signal: ctrl.signal }).then((r) => {
        if (!r.ok) throw new Error(`colony/health HTTP ${r.status}`)
        return r.json() as Promise<ColonyHealth>
      }),
    ])
      .then(([pingBody, healthBody]) => {
        setPing(pingBody)
        setHealth(healthBody)
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => {
        clearTimeout(timer)
        setLoading(false)
      })

    return () => {
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [colonyId])

  const accent = colonyId ? COLONY_COLORS[colonyId] ?? '#6b7280' : '#6b7280'
  const manifest = colonyId ? colonies.find((c) => c.id === colonyId) ?? null : null
  const entry = ping?.colonies.find((c) => c.name === colonyId) ?? null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: 'min(660px, 95vw)',
        height: '100vh',
        background: 'rgba(10,10,20,0.97)',
        borderLeft: `1px solid ${accent}44`,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: `1px solid ${accent}33`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ color: accent, fontWeight: 'bold', fontSize: '1rem' }}>{colonyId ?? 'Colony'}</span>
          {entry && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#10b981' }}>
              ✅ {entry.reachable}
            </span>
          )}
          {error && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#ef4444' }}>
              ⚠️ unreachable
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${accent}55`,
            color: accent,
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* No selection yet */}
      {!colonyId && (
        <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
          Select a colony card to inspect its live status — roster and
          CI-checked status come from GET /v11/debug/colony-ping.
        </div>
      )}

      {/* Loading / error */}
      {colonyId && loading && (
        <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
          Loading colony data…
        </div>
      )}
      {colonyId && error && !loading && (
        <div style={{ padding: '1rem', color: '#ef4444', fontSize: '0.8rem' }}>
          Failed to reach the Worker: {error}
        </div>
      )}

      {/* Live status from the Worker */}
      {colonyId && entry && !error && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#d1d5db', borderBottom: `1px solid ${accent}22` }}>
          <div>Status: {entry.reachable}</div>
          {health && (
            <div>Queen: {health.status ?? 'unknown'}{health.version ? ` · ${health.version}` : ''}</div>
          )}
          {ping?.note && (
            <div style={{ marginTop: '0.5rem', color: '#9ca3af' }}>{ping.note}</div>
          )}
        </div>
      )}
      {colonyId && !entry && !loading && !error && ping && (
        <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
          Not in the colony-ping roster.
        </div>
      )}

      {/* Colony facts (manifest, not a fetch) */}
      {manifest && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#d1d5db', borderBottom: `1px solid ${accent}22` }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>{manifest.description}</p>
          <p style={{ margin: '0 0 0.5rem 0' }}>Role: {manifest.role} · Layer {manifest.layer} · {manifest.language}</p>
          {manifest.guilds.length > 0 && (
            <p style={{ margin: '0 0 0.5rem 0' }}>Guilds: {manifest.guilds.join(', ')}</p>
          )}
          <a href={manifest.repoUrl} target="_blank" rel="noreferrer" style={{ color: accent }}>
            {manifest.repo} ↗
          </a>
        </div>
      )}

      {/* Capabilities: not served by any Worker route yet (founder decision Q1) */}
      {colonyId && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#6b7280' }}>
          Per-colony capabilities are not served by the Worker yet (founder decision Q1).
        </div>
      )}
    </div>
  )
}

export default ColonyZoomPanel
