import type { HiveData, VentureInfo } from '../../hooks/useHiveData';

// The Ventures panel: what the Hive itself knows about the founder's ventures, from
// GET /v11/ventures (the manifest mirror plus the business-plans inventory). Nothing
// here is typed in: every venture, status, repo, plan and number comes from the route,
// and when the route does not answer the panel says "No data" and shows nothing else.
// The mirror's source SHA and date are shown so a stale copy is visible, not silent.
// Guarded by tests/unit/test_frontend_live_data.py (TestVenturesPanel).

const STATUS: Record<string, { label: string; tone: string }> = {
  real_code_active: { label: 'Real code, active', tone: 'border-emerald-400/50 text-emerald-300' },
  real_code_partial: { label: 'Real code, partial', tone: 'border-cyan-glow/50 text-cyan-glow' },
  real_code_needs_restructure: { label: 'Real code, needs restructure', tone: 'border-amber-400/50 text-amber-300' },
  real_spec_unverified_code: { label: 'Spec, code unverified', tone: 'border-amber-400/50 text-amber-300' },
  real_spec_no_code: { label: 'Spec only, no code yet', tone: 'border-white/20 text-slate-300' },
  scaffold_genesis: { label: 'Scaffold (genesis)', tone: 'border-violet-bright/50 text-violet-bright' },
};

function statusOf(status: string) {
  // An unknown status is shown as the manifest wrote it, never relabelled.
  return STATUS[status] ?? { label: status || 'unknown', tone: 'border-white/20 text-slate-400' };
}

function VentureCard({ v }: { v: VentureInfo }) {
  const s = statusOf(v.status);
  return (
    <article className="rounded-lg border border-white/10 bg-void-800/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-display text-gold text-base tracking-wide">{v.real_name}</h3>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${s.tone}`}>{s.label}</span>
      </div>
      <p className="mt-2 text-sm text-slate-300 leading-relaxed">{v.real_purpose}</p>
      {v.repos && v.repos.length > 0 && (
        <p className="mt-2 text-[11px] text-slate-500">
          Repo{v.repos.length > 1 ? 's' : ''}:{' '}
          {v.repos.map((r, i) => (
            <span key={r}>
              {i > 0 ? ', ' : ''}
              <a href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">{r}</a>
            </span>
          ))}
        </p>
      )}
      {v.notes && (
        <details className="mt-2 text-xs text-slate-400">
          <summary className="cursor-pointer text-slate-500 hover:text-cyan-glow">Notes</summary>
          <p className="mt-1 leading-relaxed">{v.notes}</p>
        </details>
      )}
    </article>
  );
}

export default function VenturesPanel({ hive }: { hive: HiveData }) {
  const data = hive.ventures;
  if (!data) {
    return (
      <p className="text-sm text-slate-400">
        {hive.loading
          ? 'Reading the venture manifest…'
          : 'No data: the Hive is not serving the venture manifest right now (GET /v11/ventures). Nothing is shown in its place.'}
      </p>
    );
  }
  const src = data.source;
  return (
    <div className="max-w-4xl space-y-4">
      <p className="text-[11px] text-slate-500">
        Live from <code className="text-cyan-glow">GET /v11/ventures</code>
        {src?.repo ? <> · mirror of <code className="text-cyan-glow">{src.repo}</code>{src.path ? `/${src.path}` : ''}</> : null}
        {src?.sha ? <> at <code className="text-cyan-glow">{src.sha.slice(0, 7)}</code></> : null}
        {src?.mirrored_at ? <> · mirrored {src.mirrored_at}</> : null}
        {' '}· the Hive reads a copy, so if the venture repo has changed since, this list is behind.
      </p>
      <p className="text-sm text-slate-300">
        {data.ventures.length} venture{data.ventures.length === 1 ? '' : 's'} in the manifest.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.ventures.map((v) => <VentureCard key={v.id} v={v} />)}
      </div>
      {(data.plans?.length ?? 0) > 0 && (
        <section>
          <h3 className="font-display text-gold-neon text-sm tracking-wide mb-1">Business plans</h3>
          <p className="text-xs text-slate-400 mb-2">
            {data.plans?.length ?? 0} plans
            {typeof data.plans_total_words === 'number' ? <> · {data.plans_total_words.toLocaleString('en-US')} words in all</> : null}
            . Only the inventory is shown; the plan texts stay in the private venture repo.
          </p>
          <ul className="grid gap-x-6 gap-y-0.5 text-xs text-slate-300 sm:grid-cols-2">
            {(data.plans ?? []).map((p) => (
              <li key={p.slug} className="flex justify-between gap-3 border-b border-white/5 py-0.5">
                <span className="truncate">{p.slug}</span>
                {typeof p.words === 'number' && <span className="text-slate-500 tabular-nums shrink-0">{p.words.toLocaleString('en-US')} words</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
