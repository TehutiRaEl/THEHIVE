import { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { API_BASE_URL } from '../../utils/constants';

interface BiosystemOverlayProps {
  active: boolean;
  onClose: () => void;
}

const V11 = `${API_BASE_URL || ''}/v11`;

/**
 * Biosystem Architecture overlay — LIVE against Hive Queen /v11.
 * Legacy docs/biosystem.html (JASPER-era localhost:8080 demo) is still
 * reachable via "Open legacy atlas" but is no longer the primary surface.
 */
export default function BiosystemOverlay({ active, onClose }: BiosystemOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(active, panelRef);
  const [tab, setTab] = useState<'live' | 'legacy'>('live');
  const [llm, setLlm] = useState<Record<string, unknown> | null>(null);
  const [agents, setAgents] = useState<unknown[] | null>(null);
  const [proposals, setProposals] = useState<{ pending?: number; total?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [rLlm, rAgents, rProp] = await Promise.all([
        fetch(`${V11}/llm/status`, { signal: AbortSignal.timeout(8000) }),
        fetch(`${V11}/agents`, { signal: AbortSignal.timeout(8000) }),
        fetch(`${V11}/proposals`, { signal: AbortSignal.timeout(8000) }),
      ]);
      if (!rLlm.ok && !rAgents.ok) {
        setErr(`Hive /v11 unreachable (llm ${rLlm.status}, agents ${rAgents.status})`);
      }
      if (rLlm.ok) setLlm(await rLlm.json());
      else setLlm(null);
      if (rAgents.ok) {
        const d = await rAgents.json();
        setAgents(Array.isArray(d) ? d : d.agents ?? d.items ?? []);
      } else setAgents(null);
      if (rProp.ok) {
        const d = await rProp.json();
        const list = d.proposals ?? [];
        setProposals({
          total: list.length,
          pending: list.filter((p: { status?: string }) => p.status === 'pending').length,
        });
      } else setProposals(null);
    } catch (e) {
      setErr(String(e));
      setLlm(null);
      setAgents(null);
      setProposals(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    if (tab === 'live') load();
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose, tab, load]);

  if (!active) return null;

  const provider =
    (llm && (llm as { active_provider?: string }).active_provider) ||
    (llm && (llm as { provider?: string }).provider) ||
    '—';

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Biosystem Architecture"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-void-black animate-fadeIn flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 px-4 h-11 shrink-0 bg-void-900/90 border-b border-white/10">
        <span className="text-slate-400 text-xs tracking-widest uppercase truncate">
          Biosystem — Hive /v11 live · Esc to exit
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setTab('live')}
            className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${
              tab === 'live'
                ? 'border-cyan-glow/50 text-cyan-glow bg-void-800'
                : 'border-white/10 text-slate-500'
            }`}
          >
            Live
          </button>
          <button
            type="button"
            onClick={() => setTab('legacy')}
            className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${
              tab === 'legacy'
                ? 'border-amber-400/40 text-amber-300 bg-void-800'
                : 'border-white/10 text-slate-500'
            }`}
            title="Legacy 72-system atlas HTML (was JASPER-oriented)"
          >
            Legacy atlas
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Biosystem"
            className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40"
          >
            ✕
          </button>
        </div>
      </div>

      {tab === 'legacy' ? (
        <iframe
          src="/biosystem.html"
          title="Sovereign Hive — Legacy Biosystem Atlas"
          className="flex-1 w-full border-0 bg-void-black"
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-gold text-lg tracking-wide">Body of the Hive — live</h2>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="text-xs px-2 py-1 rounded border border-white/10 text-cyan-glow hover:bg-void-800 disabled:opacity-50"
            >
              {loading ? 'Reading…' : 'Refresh'}
            </button>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed">
            Primary biosystem surface reads the <strong className="text-slate-200">Hive Queen Worker</strong>{' '}
            at <code className="text-cyan-glow">/v11</code>. There is no separate JASPER process to start.
            Legacy atlas (72-system HTML) remains under "Legacy atlas" for the older map.
          </p>

          {err && (
            <div className="rounded-lg border border-amber-400/30 bg-void-800/80 p-3 text-xs text-amber-200">
              {err}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-void-900/80 p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">LLM</div>
              <div className="text-sm text-slate-100">{String(provider)}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                {llm ? 'bound surface responded' : 'no data'}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-void-900/80 p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Agents</div>
              <div className="text-sm text-slate-100">
                {agents ? agents.length : '—'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">from GET /v11/agents</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-void-900/80 p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Proposals</div>
              <div className="text-sm text-slate-100">
                {proposals ? `${proposals.pending ?? '—'} pending / ${proposals.total ?? '—'} total` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">from GET /v11/proposals</div>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-glow/20 bg-void-900/60 p-3 text-xs text-slate-400 space-y-1">
            <div className="text-cyan-glow/90 uppercase tracking-widest text-[10px]">Stack map (proprioception)</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong className="text-slate-200">Head</strong> — KAIEL / commune</li>
              <li><strong className="text-slate-200">Joints</strong> — PLC sense → route → constrain → remember</li>
              <li><strong className="text-slate-200">Fascia</strong> — HiveMesh</li>
              <li><strong className="text-slate-200">Gut</strong> — LocalAGI enteric (when bound)</li>
              <li><strong className="text-slate-200">Skeleton</strong> — Constitution F-laws</li>
            </ul>
          </div>

          <p className="text-[11px] text-slate-600">
            Honesty: gauges above are live API presence, not fabricated neuro telemetry.
            Cloudflare Access founder login still requires ACCESS_* vars in wrangler (see
            docs/ACCESS_BIOSYSTEM_STATUS_2026-09-20.md).
          </p>
        </div>
      )}
    </div>
  );
}
