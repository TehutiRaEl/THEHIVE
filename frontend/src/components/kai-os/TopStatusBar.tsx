import { useEffect, useState } from 'react';
import type { HiveData } from '../../hooks/useHiveData';

// Thematic constant, not a computed metric — same spirit as utils/constants.ts's
// SCHUMANN_HZ. Displayed plainly as branding, never implied to be measured.
const KAI_FREQUENCY_HZ = 432;

interface TopStatusBarProps {
  hive: HiveData;
  onOpenBiosystem?: () => void;
}

export default function TopStatusBar({ hive, onOpenBiosystem }: TopStatusBarProps) {
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
    <div className="relative flex items-center gap-6 px-5 h-11 bg-void-900/80 backdrop-blur-xs text-xs font-body overflow-x-auto whitespace-nowrap">
      {/* neon underline — the live wire under the status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.55) 20%, rgba(139,92,246,0.55) 60%, rgba(255,209,102,0.4) 85%, transparent)' }} />
      <span className="flex items-center gap-1.5 font-display tracking-wider">
        <span className={`h-1.5 w-1.5 rounded-full ${hive.online ? 'bg-emerald-400 animate-pulse shadow-neon-cyan' : 'bg-slate-600'}`} />
        <span className={hive.online ? 'text-emerald-300' : 'text-slate-500'} style={hive.online ? { textShadow: '0 0 10px rgba(52,211,153,0.7)' } : undefined}>
          {hive.online ? 'LIVE' : 'OFFLINE'}
        </span>
      </span>
      <span className="text-slate-600">|</span>
      <span className="text-slate-400">
        Soul <span className="text-gold-neon font-semibold" style={{ textShadow: '0 0 10px rgba(255,209,102,0.5)' }}>{topSoul != null ? topSoul.toFixed(1) : '—'}</span>
      </span>
      <span className="text-slate-400">
        ELO <span className="text-cyan-neon font-semibold" style={{ textShadow: '0 0 10px rgba(0,229,255,0.5)' }}>{topElo != null ? Math.round(topElo) : '—'}</span>
      </span>
      <span className="text-violet-bright" style={{ textShadow: '0 0 10px rgba(139,92,246,0.5)' }}>{KAI_FREQUENCY_HZ}Hz</span>
      <span className="text-slate-400">
        Hive <span className="text-slate-100">{hive.agents.length} agents</span>
      </span>
      <span className="text-slate-400">
        Models <span className="text-slate-100">{hive.aiBound ? (hive.llm?.active_provider ?? 'bound') : 'simulation'}</span>
      </span>
      {onOpenBiosystem && (
        <button
          onClick={onOpenBiosystem}
          className="ml-auto px-2 py-0.5 rounded border border-violet-bright/30 text-violet-bright hover:bg-violet-bright/10 hover:border-violet-bright/60 shrink-0"
          style={{ textShadow: '0 0 8px rgba(139,92,246,0.5)' }}
          title="Open the Biosystem Architecture dashboard"
        >
          🧬 Biosystem
        </button>
      )}
      <span className={onOpenBiosystem ? 'text-slate-500' : 'ml-auto text-slate-500'}>
        Latency <span className="text-emerald-300">{latencyMs != null ? `${latencyMs}ms` : '—'}</span>
      </span>
    </div>
  );
}
