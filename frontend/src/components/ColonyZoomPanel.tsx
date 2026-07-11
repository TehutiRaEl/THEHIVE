import { useEffect, useState, useRef } from 'react'
import { COLONY_BASE_URLS, COLONY_COLORS } from '../utils/constants'
import type { ColonyId } from '../types'

interface CapabilitiesData {
  colony_id: string
  status?: string
  capabilities?: Record<string, unknown>
}

interface Props {
  colonyId: ColonyId | null
  onClose: () => void
}

export function ColonyZoomPanel({ colonyId, onClose }: Props) {
  const [caps, setCaps] = useState<CapabilitiesData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!colonyId) return
    setLoading(true)
    setCaps(null)
    setError(null)

    const base = COLONY_BASE_URLS[colonyId]
    if (!base) {
      setError('No base URL configured for this colony')
      setLoading(false)
      return
    }

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 5000)

    fetch(`${base}/colony/capabilities`, { signal: ctrl.signal })
      .then((r) => r.json())
      .catch(() => fetch(`${base}/colony/health`, { signal: ctrl.signal }).then((r) => r.json()))
      .then((data) => setCaps(data as CapabilitiesData))
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

  if (!colonyId) return null

  const accent = COLONY_COLORS[colonyId] ?? '#6b7280'
  const base = COLONY_BASE_URLS[colonyId]
  const consoleUrl = base ? `${base}/colony-console` : null

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
          <span style={{ color: accent, fontWeight: 'bold', fontSize: '1rem' }}>{colonyId}</span>
          {caps && !error && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#10b981' }}>
              ✅ {caps.status ?? 'healthy'}
            </span>
          )}
          {error && (
            <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#ef4444' }}>
              ⚠️ offline
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

      {/* Capabilities summary */}
      {loading && (
        <div style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
          Loading colony data…
        </div>
      )}
      {caps && !error && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#d1d5db', borderBottom: `1px solid ${accent}22` }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(caps.capabilities ?? caps, null, 2).slice(0, 400)}
          </pre>
        </div>
      )}

      {/* Console iframe */}
      {consoleUrl && (
        <iframe
          src={consoleUrl}
          title={`${colonyId} console`}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ flex: 1, border: 'none', background: '#0a0a14' }}
        />
      )}
      {!consoleUrl && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', fontSize: '0.85rem' }}>
          No console URL configured
        </div>
      )}
    </div>
  )
}

export default ColonyZoomPanel
