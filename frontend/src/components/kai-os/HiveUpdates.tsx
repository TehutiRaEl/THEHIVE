import type { HiveData } from '../../hooks/useHiveData';

interface HiveUpdatesProps {
  hive: HiveData;
}

// Hive → founder updates. The hive ADDS updates here (from live /v11/updates);
// it never amends its own law or vision. Newest first, plain language.
export default function HiveUpdates({ hive }: HiveUpdatesProps) {
  const updates = hive.updates;

  if (!updates.length) {
    return (
      <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
        No updates yet. The hive posts here from live data as it works —
        what it did each cycle and anything it needs from you. This channel is
        add-only: the hive can add updates, never amend its own law or vision.
      </p>
    );
  }

  const fmt = (ts: string) => {
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
  };

  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      {updates.map((u) => (
        <div key={u.id} className="rounded-xl border border-white/10 bg-void-800/60 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border
              ${u.kind === 'milestone' ? 'border-gold/40 text-gold' : 'border-cyan-glow/40 text-cyan-glow'}`}>
              {u.kind}
            </span>
            <span className="text-[11px] text-slate-500">{fmt(u.ts)}</span>
          </div>
          <h3 className="text-slate-100 font-body text-sm font-semibold">{u.title}</h3>
          {u.body && <p className="text-slate-400 text-sm leading-relaxed mt-1">{u.body}</p>}
          {u.needs && (
            <p className="text-amber-300/80 text-xs leading-relaxed mt-2">
              <span className="uppercase tracking-widest text-[10px] text-amber-400/70">Needs · </span>
              {u.needs}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
