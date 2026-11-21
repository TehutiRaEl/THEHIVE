import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import type { KaiBrainStatus } from '../../hooks/useHiveData';

// Kai El's brain, read-only: what the Memories and Training circles count.
// One live route, GET /v11/kai/brain. DISPLAY ONLY: nothing here writes memory or flips a switch.
// When the Hive does not answer it says "No data" and shows nothing in its place; when his memory
// database is not bound it says that instead of showing zeros. Guarded by
// tests/unit/test_frontend_live_data.py (TestKaiBrainAndTownHallPanels).

async function load(): Promise<KaiBrainStatus | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/v11/kai/brain`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return (await r.json()) as KaiBrainStatus;
  } catch {
    return null;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 tabular-nums">{children}</span>
    </div>
  );
}

export default function KaiBrainPanel() {
  const [state, setState] = useState<{ loading: boolean; brain: KaiBrainStatus | null; at: Date | null }>({ loading: true, brain: null, at: null });
  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    setState({ loading: false, brain: await load(), at: new Date() });
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const { brain } = state;
  const counts = brain?.counts ?? null;
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Live from <code className="text-cyan-glow">GET /v11/kai/brain</code>{state.at ? <> · read {state.at.toLocaleTimeString()}</> : null}. Display only.
        </p>
        <button
          type="button"
          onClick={reload}
          disabled={state.loading}
          className="shrink-0 px-3 py-1 rounded border border-cyan-glow/40 text-cyan-glow text-xs hover:bg-cyan-glow/10 disabled:opacity-50"
        >
          {state.loading ? 'Reading…' : 'Reload'}
        </button>
      </div>
      {state.loading && !brain ? <p className="text-sm text-slate-500">Reading…</p> : !brain ? (
        <p className="text-sm text-slate-400">No data: the Hive did not answer for Kai El&apos;s brain. Nothing is shown in its place.</p>
      ) : (
        <div>
          <Row label="Memory database bound">{brain.bound ? 'yes' : 'no'}</Row>
          <Row label="Writes to his brain">{brain.write_enabled ? 'on' : 'off'}</Row>
          {counts ? (
            <>
              <Row label="Memories">{counts.memories ?? 'no data'}</Row>
              <Row label="Decisions logged">{counts.decisions ?? 'no data'}</Row>
              <Row label="Training samples">
                {counts.training_samples ?? 'no data'}
                {typeof counts.training_eligible === 'number' ? ` (${counts.training_eligible} eligible)` : ''}
              </Row>
            </>
          ) : (
            <p className="py-2 text-sm text-slate-400">
              {brain.bound ? 'No counts came back' + (brain.error ? `: ${brain.error}` : '.') : 'No counts: his memory database is not bound on this Hive.'}
            </p>
          )}
          {brain.recency && (
            <Row label="Memory recency">
              half-life {brain.recency.half_life_days ?? '?'} days, floor {brain.recency.floor ?? '?'}
            </Row>
          )}
          {brain.fourdbrain?.note && <p className="mt-2 text-xs text-slate-500">4DBRAIN bridge: {brain.fourdbrain.note}</p>}
        </div>
      )}
    </div>
  );
}
