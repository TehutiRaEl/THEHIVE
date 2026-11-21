import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

// The Queen's panel (Nanuet), read-only. Everything here comes from three live routes:
//   GET /v11/nanuet/brain      her memory database: bound or not, write switch, counts
//   GET /v11/nanuet/autonomy   her staged-autonomy switches and ladder
//   GET /v11/nanuet/digest     what she has learned (the Queen Digest)
// DISPLAY ONLY: nothing on this panel changes a switch or writes anything. Switches are flipped
// by the founder in the deployment settings, never from the screen, and a Worker that cannot
// be reached shows "No data" and nothing else. The only control is Reload, which re-reads the
// three routes. Guarded by tests/unit/test_frontend_live_data.py (TestQueenPanel).

interface Brain {
  provisioned?: boolean
  bound?: boolean
  write_enabled?: boolean
  review_log_enabled?: boolean
  counts?: { memories?: number; decisions?: number; training_samples?: number; training_eligible?: number } | null
  note?: string
  phase?: string
}
interface LadderRow { key: string; stage: number; title?: string; enabled?: boolean; blocked_by?: string | null }
interface Autonomy {
  provisioned?: boolean
  ladder?: LadderRow[]
  switches?: Record<string, boolean>
  pre_existing?: Record<string, boolean>
  pre_existing_note?: string
  note?: string
}
interface DigestEntry { id: number; ts: string; kind?: string; subject_kind?: string; subject_id?: string; summary?: string; wisdom?: string; source?: string }
interface Digest { entries?: DigestEntry[]; provisioned?: boolean; note?: string; table_missing?: boolean }

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_BASE_URL}/v11${path}`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function Pill({ on, onLabel = 'ON', offLabel = 'OFF' }: { on: boolean; onLabel?: string; offLabel?: string }) {
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${on ? 'border-emerald-400/50 text-emerald-300' : 'border-white/20 text-slate-400'}`}>
      {on ? onLabel : offLabel}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-1 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 tabular-nums">{children}</span>
    </div>
  );
}

const NoData = ({ what }: { what: string }) => (
  <p className="text-sm text-slate-400">No data: the Hive did not answer for {what}. Nothing is shown in its place.</p>
);

export default function QueenPanel() {
  const [state, setState] = useState<{ loading: boolean; brain: Brain | null; auto: Autonomy | null; digest: Digest | null; at: Date | null }>(
    { loading: true, brain: null, auto: null, digest: null, at: null },
  );

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const [brain, auto, digest] = await Promise.all([
      getJson<Brain>('/nanuet/brain'),
      getJson<Autonomy>('/nanuet/autonomy'),
      getJson<Digest>('/nanuet/digest'),
    ]);
    setState({ loading: false, brain, auto, digest, at: new Date() });
  }, []);

  useEffect(() => { load(); }, [load]);

  const { brain, auto, digest } = state;
  const counts = brain?.counts ?? null;
  const switches = auto?.switches ? Object.entries(auto.switches) : [];
  const preExisting = auto?.pre_existing ? Object.entries(auto.pre_existing) : [];
  const entries = digest?.entries ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Live from <code className="text-cyan-glow">GET /v11/nanuet/brain</code>, <code className="text-cyan-glow">/nanuet/autonomy</code> and{' '}
          <code className="text-cyan-glow">/nanuet/digest</code>{state.at ? <> · read {state.at.toLocaleTimeString()}</> : null}. Display only.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={state.loading}
          className="shrink-0 px-3 py-1 rounded border border-cyan-glow/40 text-cyan-glow text-xs hover:bg-cyan-glow/10 disabled:opacity-50"
        >
          {state.loading ? 'Reading…' : 'Reload'}
        </button>
      </div>

      <section>
        <h3 className="font-display text-gold-neon text-sm tracking-wide mb-1">Her brain</h3>
        {state.loading && !brain ? <p className="text-sm text-slate-500">Reading…</p> : !brain ? <NoData what="her brain" /> : (
          <div>
            <Row label="Memory database bound">{brain.bound ? 'yes' : 'no'}</Row>
            <Row label="Writes to her brain"><Pill on={!!brain.write_enabled} /></Row>
            <Row label="Review log"><Pill on={!!brain.review_log_enabled} /></Row>
            {counts ? (
              <>
                <Row label="Memories">{counts.memories ?? 'no data'}</Row>
                <Row label="Decisions logged">{counts.decisions ?? 'no data'}</Row>
                <Row label="Training samples">{counts.training_samples ?? 'no data'}{typeof counts.training_eligible === 'number' ? ` (${counts.training_eligible} eligible)` : ''}</Row>
              </>
            ) : <Row label="Counts">no data</Row>}
            {brain.note && <p className="mt-2 text-xs text-slate-500">{brain.note}</p>}
            {brain.phase && <p className="mt-1 text-xs text-slate-500">{brain.phase}</p>}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-gold-neon text-sm tracking-wide mb-1">Her switches</h3>
        <p className="text-xs text-slate-500 mb-2">Display only. The founder flips these in the deployment settings; nothing on this screen changes them.</p>
        {state.loading && !auto ? <p className="text-sm text-slate-500">Reading…</p> : !auto ? <NoData what="her switches" /> : (
          <div>
            {switches.map(([k, v]) => <Row key={k} label={k}><Pill on={!!v} /></Row>)}
            {preExisting.map(([k, v]) => <Row key={k} label={`${k} (older switch)`}><Pill on={!!v} /></Row>)}
            {switches.length === 0 && preExisting.length === 0 && <p className="text-sm text-slate-400">No data: the route listed no switches.</p>}
            {auto.ladder && auto.ladder.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">The staged-autonomy ladder</p>
                <ol className="space-y-1 text-xs text-slate-300">
                  {auto.ladder.map((l) => (
                    <li key={l.key} className="flex items-center justify-between gap-3 border-b border-white/5 py-1">
                      <span>Stage {l.stage}{l.title ? `: ${l.title}` : `: ${l.key}`}</span>
                      <span className="flex items-center gap-2 shrink-0">
                        {l.blocked_by ? <span className="text-slate-500">needs {l.blocked_by}</span> : null}
                        <Pill on={!!l.enabled} />
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {auto.note && <p className="mt-2 text-xs text-slate-500">{auto.note}</p>}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-gold-neon text-sm tracking-wide mb-1">What she has learned</h3>
        {state.loading && !digest ? <p className="text-sm text-slate-500">Reading…</p> : !digest ? <NoData what="her digest" /> : entries.length === 0 ? (
          <p className="text-sm text-slate-400">
            No entries yet{digest.provisioned === false ? ': her memory database is not bound' : digest.table_missing ? ': the digest table is not present' : ''}.
            {digest.note ? <span className="block text-xs text-slate-500 mt-1">{digest.note}</span> : null}
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => (
              <li key={e.id} className="rounded border border-white/10 bg-void-800/50 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span>{e.ts}</span>
                  {e.kind ? <span className="uppercase tracking-wider text-violet-bright">{e.kind}</span> : null}
                  {e.subject_kind ? <span>{e.subject_kind}{e.subject_id ? ` ${e.subject_id}` : ''}</span> : null}
                </div>
                {e.summary && <p className="mt-1 text-slate-200">{e.summary}</p>}
                {e.wisdom && <p className="mt-1 text-xs text-slate-400">{e.wisdom}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
