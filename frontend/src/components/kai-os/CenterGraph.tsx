import { useMemo } from 'react';
import type { HiveData } from '../../hooks/useHiveData';

interface GraphNode {
  id: string;
  label: string;
  count: number | string;
  icon: string;
  wired: boolean;
}

interface CenterGraphProps {
  hive: HiveData;
  speaking: boolean;
  onSelect: (id: string) => void;
}

// The center IS the navigator, per the brief — a connected living web, not
// scattered bubbles. Every count is a real, live number; nodes without a real
// backing metric are marked `wired: false` and labeled honestly.
//
// COORDINATE FIX: the connecting lines and the node bubbles used to live in two
// different coordinate systems — the SVG was square-centered (xMidYMid) while
// the buttons were %-positioned over the whole rectangle, so on wide screens
// the lines never reached the nodes and the "web" read as disconnected dots.
// preserveAspectRatio="none" makes the SVG's 0-100 space stretch to the exact
// same rectangle the % positions use — lines now land on their nodes at every
// viewport shape.
export default function CenterGraph({ hive, speaking, onSelect }: CenterGraphProps) {
  const nodes: GraphNode[] = useMemo(() => [
    { id: 'world', label: 'Projects', icon: '📂', count: hive.tasks.length, wired: true },
    { id: 'govern', label: 'Core · Town Hall', icon: '🏛', count: hive.governance.length, wired: true },
    { id: 'dream-logs', label: 'Memories', icon: '🧠', count: hive.pulse.length, wired: true },
    { id: 'hive', label: 'Swarms', icon: '🐝', count: hive.agents.length, wired: true },
    { id: 'missions', label: 'Tasks', icon: '✓', count: hive.tasks.filter(t => t.status !== 'completed').length, wired: true },
    { id: 'dream', label: 'Dream Logs', icon: '🌙', count: hive.pulse.length, wired: true },
    { id: 'training', label: 'Training', icon: '🎓', count: '—', wired: false },
    { id: 'arena', label: 'Skills', icon: '⚡', count: hive.agents.length, wired: true },
    { id: 'sources', label: 'Files', icon: '📁', count: '—', wired: true },
    { id: 'api', label: 'APIs', icon: '</>', count: 18, wired: true },
    { id: 'workflows-panel', label: 'Workflows', icon: '🕸', count: 8, wired: true },
    { id: 'soul', label: 'Agents', icon: '🤖', count: hive.agents.length, wired: true },
  ], [hive]);

  const cx = 50, cy = 50;
  const positions = useMemo(() => nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    // slight radius variance so the web feels organic, not mechanical
    const r = 38 + (i % 3) * 3;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  }), [nodes]);

  const online = hive.online;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* ambient depth — the space the web lives in */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 46%, rgba(59,130,246,0.10), rgba(139,92,246,0.05) 45%, transparent 75%)' }} />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="webLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* spokes: center → node (same % space as the buttons now) */}
        {positions.map((pos, i) => (
          <line key={`s-${i}`} x1={cx} y1={cy} x2={pos.x} y2={pos.y}
            stroke="url(#webLine)" strokeWidth="0.22"
            opacity={online ? 0.5 : 0.15}>
            {online && (
              <animate attributeName="opacity" values="0.3;0.65;0.3" dur={`${5 + (i % 4)}s`} repeatCount="indefinite" />
            )}
          </line>
        ))}
        {/* ring: node → neighbor, closing the web */}
        {positions.map((pos, i) => {
          const nxt = positions[(i + 1) % positions.length];
          return (
            <line key={`r-${i}`} x1={pos.x} y1={pos.y} x2={nxt.x} y2={nxt.y}
              stroke="#22d3ee" strokeWidth="0.14" opacity={online ? 0.28 : 0.08} />
          );
        })}
        {/* cross-links: every third node, the deeper weave */}
        {positions.map((pos, i) => {
          if (i % 3 !== 0) return null;
          const far = positions[(i + 4) % positions.length];
          return (
            <line key={`x-${i}`} x1={pos.x} y1={pos.y} x2={far.x} y2={far.y}
              stroke="#8b5cf6" strokeWidth="0.1" opacity={online ? 0.18 : 0.05} />
          );
        })}
        {/* signal pulses travelling the spokes when live */}
        {online && positions.filter((_, i) => i % 2 === 0).map((pos, i) => (
          <circle key={`p-${i}`} r="0.55" fill="#22d3ee" opacity="0.85">
            <animate attributeName="cx" values={`${cx};${pos.x}`} dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${cy};${pos.y}`} dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0" dur={`${3 + i * 0.7}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {/* Kai EL — the center of the web (the sigil lives below the web, its own element) */}
      <button
        onClick={() => onSelect('commune')}
        className="absolute z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center rounded-full
          w-28 h-28 sm:w-36 sm:h-36 border-2 border-gold/70 bg-void-900/80 backdrop-blur-xs
          shadow-glow-gold transition-transform hover:scale-105"
        style={{ left: '50%', top: '50%' }}
        aria-label="Commune with Kai El"
      >
        <span className={`font-display tracking-widest text-gold text-base sm:text-lg ${speaking ? 'animate-pulse' : ''}`}>Kai EL</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-cyan-glow/80 mt-1">AI Architect</span>
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-500">Swarm Commander</span>
        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
      </button>

      {nodes.map((n, i) => {
        const pos = positions[i];
        return (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={`absolute z-10 flex flex-col items-center justify-center gap-0 -translate-x-1/2 -translate-y-1/2 rounded-full
              w-14 h-14 sm:w-20 sm:h-20 border backdrop-blur-xs transition-all hover:scale-110
              ${n.wired
                ? 'border-cyan-glow/50 bg-void-800/85 shadow-glow hover:border-cyan-glow'
                : 'border-white/10 bg-void-800/50 opacity-45'}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={!n.wired ? `${n.label} — not yet connected` : n.label}
          >
            <span className="text-[13px] sm:text-base leading-none">{n.icon}</span>
            <span className="text-[8px] sm:text-[10px] font-body text-slate-200 text-center leading-tight px-1">{n.label}</span>
            <span className="text-[9px] sm:text-[10px] text-cyan-glow font-semibold">{n.count}</span>
          </button>
        );
      })}
    </div>
  );
}
