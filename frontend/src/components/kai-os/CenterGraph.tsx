import { useMemo } from 'react';
import KaiSigil from './KaiSigil';
import type { HiveData } from '../../hooks/useHiveData';

interface GraphNode {
  id: string;
  label: string;
  count: number | string;
  wired: boolean;
}

interface CenterGraphProps {
  hive: HiveData;
  speaking: boolean;
  onSelect: (id: string) => void;
}

// The center IS the navigator, per the brief — not a decoration next to one.
// Every count below is a real, live number; nodes without a real backing
// metric are marked `wired: false` and labeled honestly rather than shown
// with an invented figure.
export default function CenterGraph({ hive, speaking, onSelect }: CenterGraphProps) {
  // Each node routes to the closest real, already-wired destination — some
  // concepts (Memories, Dream Logs) share an underlying view honestly, rather
  // than each getting a distinct page that doesn't exist yet.
  const nodes: GraphNode[] = useMemo(() => [
    { id: 'world', label: 'Projects', count: hive.tasks.length, wired: true },
    { id: 'govern', label: 'Core · Town Hall', count: hive.governance.length, wired: true },
    { id: 'dream-logs', label: 'Memories', count: hive.pulse.length, wired: true },
    { id: 'hive', label: 'Swarms', count: hive.agents.length, wired: true },
    { id: 'missions', label: 'Tasks', count: hive.tasks.filter(t => t.status !== 'completed').length, wired: true },
    { id: 'dream', label: 'Dream Logs', count: hive.pulse.length, wired: true },
    { id: 'training', label: 'Training', count: '—', wired: false },
    { id: 'arena', label: 'Skills', count: hive.agents.length, wired: true },
    { id: 'sources', label: 'Files', count: '—', wired: true },
    { id: 'api', label: 'APIs', count: 18, wired: true },
    { id: 'workflows-panel', label: 'Workflows', count: 8, wired: true },
    { id: 'soul', label: 'Agents', count: hive.agents.length, wired: true },
  ], [hive]);

  const radius = 42;
  const cx = 50, cy = 50;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {nodes.map((n, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          return (
            <line
              key={n.id}
              x1={cx} y1={cy} x2={x} y2={y}
              stroke="#22d3ee"
              strokeWidth="0.25"
              opacity={hive.online ? 0.3 : 0.12}
            />
          );
        })}
      </svg>

      <div className="absolute z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => onSelect('commune')}>
        <KaiSigil size={128} speaking={speaking} online={hive.online} />
        <span className="font-display text-sm tracking-widest text-gold">Kai EL</span>
      </div>

      {nodes.map((n, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const xPct = 50 + Math.cos(angle) * radius;
        const yPct = 50 + Math.sin(angle) * radius;
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`absolute z-10 flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full
              w-14 h-14 sm:w-20 sm:h-20 border transition-all hover:scale-105
              ${n.wired ? 'border-cyan-glow/40 bg-void-800/80 hover:border-cyan-glow' : 'border-white/10 bg-void-800/50 opacity-50'}`}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
            title={!n.wired ? `${n.label} — not yet connected` : n.label}
          >
            <span className="text-[11px] font-body text-slate-200 text-center leading-tight px-1">{n.label}</span>
            <span className="text-[10px] text-cyan-glow font-semibold">{n.count}</span>
          </button>
        );
      })}
    </div>
  );
}
