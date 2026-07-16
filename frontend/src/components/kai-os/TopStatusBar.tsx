import { useEffect, useState } from 'react';
import type { HiveData } from '../../hooks/useHiveData';

// Thematic constant, not a computed metric — same spirit as utils/constants.ts's
// SCHUMANN_HZ. Displayed plainly as branding, never implied to be measured.
const KAI_FREQUENCY_HZ = 432;

interface TopStatusBarProps {
  hive: HiveData;
}

export default function TopStatusBar({ hive }: TopStatusBarProps) {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const measure = async () => {
      const start = performance.now();
      const res = await fetch(`${(import.meta as any).env.VITE_API_BASE_URL || ''}/v11/health`, {
        signal: AbortSignal.timeout(6000),
      }).catch(() => null);
      if (!cancelled && res) setLatencyMs(Math.round(performance.now() - start));
    };
    measure();
    const t = setInterval(measure, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const topSoul = hive.soulBoard[0]?.soul;
  const topElo = hive.eloBoard[0]?.rating;

  return (
    <div className="flex items-center gap-6 px-5 h-11 bg-void-900/90 border-b border-white/5 backdrop-blur-xs text-xs font-body overflow-x-auto whitespace-nowrap">
      <span className="flex items-center gap-1.5 font-display tracking-wider">
        <span className={`h-1.5 w-1.5 rounded-full ${hive.online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
        {hive.online ? 'LIVE' : 'OFFLINE'}
      </span>
      <span className="text-slate-500">|</span>
      <span className="text-slate-400">
        Soul <span className="text-gold font-semibold">{topSoul != null ? topSoul.toFixed(1) : '—'}</span>
      </span>
      <span className="text-slate-400">
        ELO <span className="text-cyan-glow font-semibold">{topElo != null ? Math.round(topElo) : '—'}</span>
      </span>
      <span className="text-slate-400">{KAI_FREQUENCY_HZ}Hz</span>
      <span className="text-slate-400">
        Hive <span className="text-slate-200">{hive.agents.length} agents</span>
      </span>
      <span className="text-slate-400">
        Models <span className="text-slate-200">{hive.aiBound ? (hive.llm?.active_provider ?? 'bound') : 'simulation'}</span>
      </span>
      <span className="ml-auto text-slate-500">
        Latency <span className="text-slate-300">{latencyMs != null ? `${latencyMs}ms` : '—'}</span>
      </span>
    </div>
  );
}
