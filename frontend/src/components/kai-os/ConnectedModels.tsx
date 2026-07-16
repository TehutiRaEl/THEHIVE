import type { HiveData } from '../../hooks/useHiveData';

interface ConnectedModelsProps {
  hive: HiveData;
}

const ROSTER = [
  { name: 'Cloudflare Workers AI', role: 'Deployment + runtime inference', live: true },
  { name: 'Claude', role: 'Reasoning (builds the hive; not bound as a runtime API)', live: false },
  { name: 'Groq', role: 'Speed', live: false },
  { name: 'Mistral', role: 'Local intelligence', live: false },
];

// Kai delegates automatically — but only what's actually bound is shown as
// "live." The rest is the real, honestly-labeled future roster, not a claim.
export default function ConnectedModels({ hive }: ConnectedModelsProps) {
  return (
    <div className="text-[11px] space-y-1.5 px-1">
      <div className="text-slate-500 uppercase tracking-wider text-[9px] mb-1">Hive · Kai EL</div>
      {ROSTER.map((m) => {
        const isBoundRuntime = m.name === 'Cloudflare Workers AI' && hive.aiBound;
        return (
          <div key={m.name} className="flex items-start gap-2">
            <span className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${isBoundRuntime ? 'bg-emerald-400' : m.live ? 'bg-cyan-glow' : 'bg-slate-700'}`} />
            <div className="min-w-0">
              <div className={isBoundRuntime ? 'text-slate-200' : 'text-slate-500'}>{m.name}</div>
              <div className="text-slate-600 truncate">{m.role}</div>
            </div>
          </div>
        );
      })}
      {hive.llm?.active_provider && (
        <div className="pt-1 text-slate-600">active: {hive.llm.active_provider}</div>
      )}
    </div>
  );
}
