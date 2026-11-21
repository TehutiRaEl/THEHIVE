import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import type { TownHallData } from '../../hooks/useHiveData';

// The Town Hall board, read-only: what the Core · Town Hall circle counts. One live route,
// GET /v11/townhall (the highest-signal items first). DISPLAY ONLY: posting to the board needs a
// visitor token and is not offered here. A Hive that does not answer shows "No data", an empty
// board says it is empty. Guarded by tests/unit/test_frontend_live_data.py
// (TestKaiBrainAndTownHallPanels).

async function load(): Promise<TownHallData | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/v11/townhall`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const d = (await r.json()) as TownHallData;
    return Array.isArray(d.items) && !d.detail ? d : null;
  } catch {
    return null;
  }
}

export default function TownHallPanel() {
  const [state, setState] = useState<{ loading: boolean; data: TownHallData | null; at: Date | null }>({ loading: true, data: null, at: null });
  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    setState({ loading: false, data: await load(), at: new Date() });
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const items = state.data?.items ?? [];
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Live from <code className="text-cyan-glow">GET /v11/townhall</code>{state.at ? <> · read {state.at.toLocaleTimeString()}</> : null}. Display only.
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
      {state.loading && !state.data ? <p className="text-sm text-slate-500">Reading…</p> : !state.data ? (
        <p className="text-sm text-slate-400">No data: the Hive did not answer for the Town Hall board. Nothing is shown in its place.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">The board is empty: no one has posted an item yet.</p>
      ) : (
        <>
          <p className="text-xs text-slate-400">{items.length} item{items.length === 1 ? '' : 's'} (latest page, highest signal first).</p>
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="rounded border border-white/10 bg-void-800/50 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{it.ts}</span>
                  {it.kind ? <span className="uppercase tracking-wider text-violet-bright">{it.kind}</span> : null}
                  {it.status ? <span>{it.status}</span> : null}
                  {it.author_agent ? <span>by {it.author_agent}</span> : null}
                  {it.claimed_by ? <span>claimed by {it.claimed_by}</span> : null}
                  {it.requires_founder ? <span className="text-gold-neon">needs the founder</span> : null}
                </div>
                <p className="mt-1 text-slate-200">{it.title}</p>
                {it.body ? <p className="mt-1 text-xs text-slate-400 whitespace-pre-wrap">{it.body}</p> : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
