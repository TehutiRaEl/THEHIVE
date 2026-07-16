import type { HiveData } from '../../hooks/useHiveData';

interface BottomActivityFeedProps {
  hive: HiveData;
}

// "You literally watch Kai think" — real data, not a canned "Thinking…" spinner.
// Jobs/Goals/Plans come from actual task and arena state; "Thinking" surfaces
// the most recent heartbeat detail or a pending arena proposition verbatim.
export default function BottomActivityFeed({ hive }: BottomActivityFeedProps) {
  const activeJobs = hive.tasks.filter(t => t.status === 'active' || t.status === 'in_progress').length;
  const pendingChallenges = hive.challenges.filter(c => c.status === 'pending');
  const lastPulse = hive.pulse[0]?.detail;
  const thinking = pendingChallenges[0]?.proposition || lastPulse || (hive.online ? 'Awaiting the next heartbeat…' : 'Disconnected from the hive.');

  const columns = [
    { label: 'Jobs', value: `${activeJobs} running`, color: 'text-cyan-glow' },
    { label: 'Goals', value: `${pendingChallenges.length} active`, color: 'text-gold' },
    { label: 'Plans', value: `${hive.governance.length} logged`, color: 'text-emerald-400' },
    { label: 'Thinking / Demands', value: thinking, color: 'text-slate-200', wide: true },
  ];

  return (
    <div className="flex items-stretch gap-4 px-4 py-2 bg-void-900/95 border-t border-white/5 text-[11px] font-body overflow-hidden">
      {columns.map((c) => (
        <div key={c.label} className={`flex flex-col justify-center ${c.wide ? 'flex-1 min-w-0' : 'shrink-0 w-28'}`}>
          <span className="text-slate-500 uppercase tracking-wider text-[9px]">{c.label}</span>
          <span className={`${c.color} truncate`} title={typeof c.value === 'string' ? c.value : undefined}>
            {c.value}
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-2 shrink-0 text-slate-500">
        <span className={`h-1.5 w-1.5 rounded-full ${hive.online ? 'bg-emerald-400' : 'bg-red-500'}`} />
        {hive.online ? 'All systems operational' : 'Degraded — see Debugger'}
      </div>
    </div>
  );
}
