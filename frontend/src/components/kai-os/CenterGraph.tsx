import { useMemo } from 'react';
import type { HiveData } from '../../hooks/useHiveData';

interface GraphNode {
  id: string;
  label: string;
  icon: string;
  // false = the circle opens nothing yet. It is rendered disabled, so it never
  // looks like a control that works.
  wired: boolean;
  // The live number, as text. null = no live source counts this thing yet, and
  // the circle says "no data". Never a typed-in number, never a different
  // thing's count under this label.
  count: string | null;
  // Plain words: what the number counts, or what the circle still needs.
  about: string;
}

// GET /v11/tasks returns one page (the Worker's default page size). When the
// page is full there may be more tasks than were loaded, so the count gets a "+".
const TASK_PAGE_SIZE = 20;

interface CenterGraphProps {
  hive: HiveData;
  speaking: boolean;
  onSelect: (id: string) => void;
}

// The center IS the navigator, per the brief — a connected living web, not
// scattered bubbles.
//
// LIVE DATA ONLY (founder rule): a circle shows a number only when a live
// Worker route returns the count of exactly the thing the circle names. Today
// that is two circles: Tasks (/v11/tasks) and Agents (/v11/agents). Every other
// circle says "no data" and its tooltip names what it still needs. Before this,
// APIs and Workflows showed typed-in numbers (18 and 8), and Projects, Town
// Hall, Memories, Dream Logs, Swarms and Skills showed some other thing's count
// (tasks, the governance log page, the heartbeat page, the agent count).
// While the Hive is unreachable, every circle says "no data" instead of 0.
// Guarded by tests/unit/test_frontend_live_data.py.
//
// COORDINATE FIX: the connecting lines and the node bubbles used to live in two
// different coordinate systems — the SVG was square-centered (xMidYMid) while
// the buttons were %-positioned over the whole rectangle, so on wide screens
// the lines never reached the nodes and the "web" read as disconnected dots.
// preserveAspectRatio="none" makes the SVG's 0-100 space stretch to the exact
// same rectangle the % positions use — lines now land on their nodes at every
// viewport shape.
export default function CenterGraph({ hive, speaking, onSelect }: CenterGraphProps) {
  const nodes: GraphNode[] = useMemo(() => {
    const live = hive.online;
    const openTasks = hive.tasks.filter(t => t.status !== 'completed').length;
    const tasksCount = live ? `${openTasks}${hive.tasks.length >= TASK_PAGE_SIZE ? '+' : ''}` : null;
    const agentsCount = live ? String(hive.agents.length) : null;
    return [
      { id: 'world', label: 'Projects', icon: '📂', wired: true, count: null, about: 'no live count yet: no route counts projects' },
      { id: 'govern', label: 'Core · Town Hall', icon: '🏛', wired: true, count: null, about: 'no live count yet: the Town Hall board (/v11/townhall) is not shown on screen yet' },
      { id: 'dream-logs', label: 'Memories', icon: '🧠', wired: true, count: null, about: "no live count yet: Kai El's memory count (/v11/kai/brain) is not wired to this circle yet" },
      { id: 'hive', label: 'Swarms', icon: '🐝', wired: true, count: null, about: 'no live count yet: no route counts swarms' },
      { id: 'missions', label: 'Tasks', icon: '✓', wired: true, count: tasksCount, about: `open tasks among the latest ${TASK_PAGE_SIZE} loaded from /v11/tasks` },
      { id: 'dream', label: 'Dream Logs', icon: '🌙', wired: true, count: null, about: 'no live count yet: no route counts dream logs' },
      { id: 'training', label: 'Training', icon: '🎓', wired: false, count: null, about: 'not connected yet: there is no Training panel to open' },
      { id: 'arena', label: 'Skills', icon: '⚡', wired: true, count: null, about: 'no live count yet: no route counts skills' },
      { id: 'sources', label: 'Files', icon: '📁', wired: true, count: null, about: 'no live count yet: the file store count is not wired to this circle yet' },
      { id: 'api', label: 'APIs', icon: '</>', wired: true, count: null, about: 'no live count yet: the Worker does not publish a measured route count' },
      { id: 'workflows-panel', label: 'Workflows', icon: '🕸', wired: true, count: null, about: 'no live count yet: no route counts workflows' },
      { id: 'soul', label: 'Agents', icon: '🤖', wired: true, count: agentsCount, about: 'active agents, from /v11/agents' },
    ];
  }, [hive]);

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
            type="button"
            disabled={!n.wired}
            onClick={n.wired ? () => onSelect(n.id) : undefined}
            aria-label={`${n.label}: ${n.count ?? 'no data'}. ${n.about}`}
            className={`absolute z-10 flex flex-col items-center justify-center gap-0 -translate-x-1/2 -translate-y-1/2 rounded-full
              w-14 h-14 sm:w-20 sm:h-20 border backdrop-blur-xs transition-all
              ${n.wired
                ? 'border-cyan-glow/50 bg-void-800/85 shadow-glow hover:border-cyan-glow hover:scale-110'
                : 'border-white/10 bg-void-800/50 opacity-45 cursor-not-allowed'}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={`${n.label} — ${n.count ?? 'no data'} (${n.about})`}
          >
            <span className="text-[13px] sm:text-base leading-none">{n.icon}</span>
            <span className="text-[8px] sm:text-[10px] font-body text-slate-200 text-center leading-tight px-1">{n.label}</span>
            {n.count !== null
              ? <span className="text-[9px] sm:text-[10px] text-cyan-glow font-semibold">{n.count}</span>
              : <span className="text-[8px] sm:text-[9px] text-slate-500">no data</span>}
          </button>
        );
      })}
    </div>
  );
}
