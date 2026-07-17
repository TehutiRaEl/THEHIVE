import type { HiveData } from '../../hooks/useHiveData';

interface ConnectedModelsProps {
  hive: HiveData;
}

// Static fallback shown only until /v11/llm/status answers — same shape the
// Worker reports, with nothing claimed live.
const FALLBACK = [
  { id: 'claude', label: 'Claude', role: 'Reasoning', bound: false },
  { id: 'groq', label: 'Groq', role: 'Speed', bound: false },
  { id: 'mistral', label: 'Mistral', role: 'Local intelligence', bound: false },
  { id: 'workers-ai', label: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', bound: false },
];

// Kai delegates automatically (Claude → Groq → Mistral → Workers AI waterfall
// in the Worker). This reads the LIVE roster: a provider lights up the moment
// the founder binds its key — and until then it honestly says "key needed".
export default function ConnectedModels({ hive }: ConnectedModelsProps) {
  const roster = hive.llm?.roster?.length ? hive.llm.roster : FALLBACK;
  return (
    <div className="text-[11px] space-y-1.5 px-1">
      <div className="text-slate-500 uppercase tracking-wider text-[9px] mb-1">Hive · Kai EL · Models</div>
      {roster.map((m) => (
        <div key={m.id} className="flex items-start gap-2">
          <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${m.bound ? 'bg-emerald-400 shadow-neon-cyan' : 'bg-slate-700'}`} />
          <div className="min-w-0 flex-1">
            <div className={`flex items-center gap-1.5 ${m.bound ? 'text-slate-200' : 'text-slate-500'}`}>
              <span className="truncate">{m.label}</span>
              <span className={`text-[8px] uppercase tracking-widest px-1 py-px rounded border shrink-0 ${m.bound ? 'border-emerald-400/40 text-emerald-300' : 'border-white/10 text-slate-600'}`}>
                {m.bound ? 'online' : 'key needed'}
              </span>
            </div>
            <div className="text-slate-600 truncate">{m.role}</div>
          </div>
        </div>
      ))}
      {hive.llm?.active_provider && (
        <div className="pt-1 text-slate-500">active voice: <span className="text-cyan-glow">{hive.llm.active_provider}</span></div>
      )}
    </div>
  );
}
