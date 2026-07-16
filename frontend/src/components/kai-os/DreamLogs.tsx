import type { HiveData } from '../../hooks/useHiveData';

interface DreamLogsProps {
  hive: HiveData;
}

// The brief's "Dream #402, 81% confidence, Y/N review" is evocative but the
// confidence number and review workflow don't exist — nothing computes them.
// Real, honestly-presented substitute: the arena's actual AI-generated
// propositions and heartbeat resolutions ARE genuinely novel connections the
// hive draws between its agents each cycle — shown as dream entries without
// a fabricated score attached.
export default function DreamLogs({ hive }: DreamLogsProps) {
  const dreams = hive.pulse.filter(p => p.action === 'heartbeat');

  return (
    <div className="space-y-3">
      {dreams.length === 0 && (
        <p className="text-slate-500 text-sm">{hive.loading ? 'loading…' : 'no dreams logged yet — the heartbeat runs every 30 minutes'}</p>
      )}
      {dreams.slice(0, 10).map((d, i) => (
        <div key={i} className="border border-white/10 rounded-lg p-3 bg-void-800/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gold text-xs font-display tracking-wide">
              Dream #{dreams.length - i}
            </span>
            <span className="text-slate-600 text-[10px]">{(d.ts || '').slice(0, 19).replace('T', ' ')}</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{d.detail}</p>
        </div>
      ))}
    </div>
  );
}
