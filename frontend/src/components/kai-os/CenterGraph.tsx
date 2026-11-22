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
  // A word shown instead of "no data" when the circle has no number but IS something: the Queen's
  // name ("Nanuet"), or "gated" for a circle held behind a founder decision. Never a number.
  badge?: string;
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
// that is three circles: Tasks (/v11/tasks), Agents (/v11/agents) and Ventures (/v11/ventures).
// The Queen shows her name and Treasury shows "gated": words, never numbers. Every other
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
// The Queen's halo and crown: an original drawing in the silhouette of a British state crown
// (a jewelled band, crosses pattee and fleurs-de-lis along the rim, two arches meeting at an
// orb and cross), under a floating halo ring. Decorative only (aria-hidden, no pointer events);
// the halo breathes slowly unless the visitor asks for reduced motion.
function QueenCrown() {
  return (
    <svg
      viewBox="0 0 100 60"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-3px)] w-14 h-8 sm:w-24 sm:h-14 overflow-visible"
      style={{ filter: 'drop-shadow(0 0 5px var(--queen-halo))' }}
    >
      <defs>
        <linearGradient id="queenGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: 'var(--queen-crown)', stopOpacity: 0.75 }} />
          <stop offset="55%" style={{ stopColor: 'var(--queen-crown)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--queen-crown-deep)' }} />
        </linearGradient>
      </defs>
      {/* the halo ring floating above the circle */}
      <ellipse cx="50" cy="52" rx="40" ry="6.5" fill="none" stroke="url(#queenGold)" strokeWidth="1.6" className="motion-safe:animate-pulse" />
      {/* arches */}
      <path d="M29 41 Q30 15 50 15 Q70 15 71 41" fill="none" stroke="url(#queenGold)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M39 41 Q40 23 50 23 Q60 23 61 41" fill="none" stroke="url(#queenGold)" strokeWidth="1.8" strokeLinecap="round" />
      {/* orb and cross */}
      <circle cx="50" cy="11.5" r="3.4" fill="url(#queenGold)" />
      <path d="M50 1 V8 M46.5 4 H53.5" stroke="url(#queenGold)" strokeWidth="2" strokeLinecap="round" />
      {/* jewelled band */}
      <rect x="23" y="41" width="54" height="8" rx="1.5" fill="url(#queenGold)" stroke="var(--queen-crown-deep)" strokeWidth="0.6" />
      <circle cx="33" cy="45" r="1.5" fill="#7a1f3d" /><circle cx="42" cy="45" r="1.5" fill="#1d5fa8" />
      <circle cx="50" cy="45" r="1.7" fill="#7a1f3d" /><circle cx="58" cy="45" r="1.5" fill="#1d5fa8" />
      <circle cx="67" cy="45" r="1.5" fill="#7a1f3d" />
      {/* crosses pattee on the rim, left and right */}
      <path d="M27 41 V33 M23.5 36 H30.5" stroke="url(#queenGold)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M73 41 V33 M69.5 36 H76.5" stroke="url(#queenGold)" strokeWidth="2.6" strokeLinecap="round" />
      {/* fleurs-de-lis between them */}
      <path d="M37 41 Q36 36 37 32 Q38.5 36 37 41 M37 41 Q33.5 38 34 34.5 Q36.5 37 37 41 M37 41 Q40.5 38 40 34.5 Q37.5 37 37 41" fill="url(#queenGold)" />
      <path d="M63 41 Q62 36 63 32 Q64.5 36 63 41 M63 41 Q59.5 38 60 34.5 Q62.5 37 63 41 M63 41 Q66.5 38 66 34.5 Q63.5 37 63 41" fill="url(#queenGold)" />
    </svg>
  );
}

export default function CenterGraph({ hive, speaking, onSelect }: CenterGraphProps) {
  const nodes: GraphNode[] = useMemo(() => {
    const live = hive.online;
    const openTasks = hive.tasks.filter(t => t.status !== 'completed').length;
    const tasksCount = live ? `${openTasks}${hive.tasks.length >= TASK_PAGE_SIZE ? '+' : ''}` : null;
    const agentsCount = live ? String(hive.agents.length) : null;
    // Ventures: the manifest the Hive serves (GET /v11/ventures). null while the route is not answering.
    const venturesCount = hive.ventures ? String(hive.ventures.ventures.length) : null;
    // Kai El's brain (GET /v11/kai/brain). Counts exist only when his memory database is bound.
    const brainCounts = hive.kaiBrain?.counts ?? null;
    const memoriesCount = brainCounts && typeof brainCounts.memories === 'number' ? String(brainCounts.memories) : null;
    const trainingCount = brainCounts && typeof brainCounts.training_samples === 'number' ? String(brainCounts.training_samples) : null;
    // Town Hall board (GET /v11/townhall): one page of items, "+" when the page is full.
    const th = hive.townhall;
    const townhallCount = th ? `${th.items.length}${th.items.length >= (th.limit ?? 50) ? '+' : ''}` : null;
    // Files (GET /v11/files): the R2 store. Not provisioned is a real answer, shown as such.
    const filesCount = hive.files && hive.files.available ? `${hive.files.files.length}${hive.files.files.length >= 200 ? '+' : ''}` : null;
    const filesBadge = hive.files && !hive.files.available ? 'not set up' : undefined;
    // Dream Logs: heartbeat "dreams" among the latest page of GET /v11/pulse (the page is 20 rows).
    const dreamCount = live ? `${hive.pulse.filter((p) => p.action === 'heartbeat').length}${hive.pulse.length >= 20 ? '+' : ''}` : null;
    return [
      // The Queen takes the top seat (the 12 o'clock position of the ring), with a halo and crown.
      { id: 'queen', label: 'Queen', icon: '👑', wired: true, count: null, badge: 'Nanuet', about: 'the Queen, Nanuet: her brain, her switches (display only) and what she has learned' },
      { id: 'world', label: 'Projects', icon: '📂', wired: true, count: null, about: 'no live count yet: no route counts projects' },
      { id: 'townhall', label: 'Core · Town Hall', icon: '🏛', wired: true, count: townhallCount, about: 'items on the Town Hall board (the latest page, up to 50), from /v11/townhall' },
      { id: 'kai-brain', label: 'Memories', icon: '🧠', wired: true, count: memoriesCount, about: "memories in Kai El's brain, from /v11/kai/brain (no number while his memory database is not bound)" },
      { id: 'hive', label: 'Swarms', icon: '🐝', wired: true, count: null, about: 'no live count yet: no route counts swarms' },
      { id: 'missions', label: 'Tasks', icon: '✓', wired: true, count: tasksCount, about: `open tasks among the latest ${TASK_PAGE_SIZE} loaded from /v11/tasks` },
      { id: 'dream', label: 'Dream Logs', icon: '🌙', wired: true, count: dreamCount, about: 'heartbeat dreams among the latest 20 pulses, from /v11/pulse' },
      { id: 'kai-brain', label: 'Training', icon: '🎓', wired: true, count: trainingCount, about: "training samples in Kai El's brain, from /v11/kai/brain" },
      { id: 'skills', label: 'Skills', icon: '⚡', wired: true, count: null, about: 'no live count yet: no route counts skills' },
      { id: 'sources', label: 'Files', icon: '📁', wired: true, count: filesCount, badge: filesBadge, about: 'files in the Hive file store, from /v11/files (the store is not set up until the R2 bucket exists)' },
      { id: 'api', label: 'APIs', icon: '</>', wired: true, count: null, about: 'no live count yet: the Worker does not publish a measured route count' },
      { id: 'workflows-panel', label: 'Workflows', icon: '🕸', wired: true, count: null, about: 'no live count yet: no route counts workflows' },
      { id: 'soul', label: 'Agents', icon: '🤖', wired: true, count: agentsCount, about: 'active agents, from /v11/agents' },
      // Treasury is held behind two founder decisions (money, Q-004; the Mogul, Q-041). No treasury route exists. It never shows a balance.
      { id: 'treasury', label: 'Treasury', icon: '🏦', wired: false, count: null, badge: 'gated', about: 'gated: money (Q-004) and the Mogul (Q-041) are founder decisions, and no treasury route exists' },
      { id: 'ventures', label: 'Ventures', icon: '🚀', wired: true, count: venturesCount, about: 'ventures in the manifest the Hive serves, from /v11/ventures' },
    ];
  }, [hive]);

  const cx = 50, cy = 50;
  const positions = useMemo(() => nodes.map((_, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    // slight radius variance so the web feels organic, not mechanical
    const r = 38 + (i % 3) * 3;
    // Keep every circle fully on screen: with 15 circles one landed on the 44% radius at the
    // left edge and was clipped on a phone. 8.5% of a 390px phone is about one circle radius.
    const clamp = (v: number) => Math.min(91.5, Math.max(8.5, v));
    return { x: clamp(cx + Math.cos(angle) * r), y: cy + Math.sin(angle) * r };
  }), [nodes]);

  const online = hive.online;

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* ambient depth — the space the web lives in */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 46%, rgb(var(--c-electric-blue) / 0.10), rgb(var(--c-violet-neon) / 0.05) 45%, transparent 75%)' }} />

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="webLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: 'rgb(var(--c-cyan-glow))' }} />
            <stop offset="100%" style={{ stopColor: 'rgb(var(--c-violet-neon))' }} />
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
              stroke="rgb(var(--c-cyan-glow))" strokeWidth="0.14" opacity={online ? 0.28 : 0.08} />
          );
        })}
        {/* cross-links: every third node, the deeper weave */}
        {positions.map((pos, i) => {
          if (i % 3 !== 0) return null;
          const far = positions[(i + 4) % positions.length];
          return (
            <line key={`x-${i}`} x1={pos.x} y1={pos.y} x2={far.x} y2={far.y}
              stroke="rgb(var(--c-violet-neon))" strokeWidth="0.1" opacity={online ? 0.18 : 0.05} />
          );
        })}
        {/* signal pulses travelling the spokes when live */}
        {online && positions.filter((_, i) => i % 2 === 0).map((pos, i) => (
          <circle key={`p-${i}`} r="0.55" fill="rgb(var(--c-cyan-glow))" opacity="0.85">
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
            key={n.label}
            type="button"
            disabled={!n.wired}
            onClick={n.wired ? () => onSelect(n.id) : undefined}
            aria-label={`${n.label}: ${n.count ?? n.badge ?? 'no data'}. ${n.about}`}
            className={`absolute z-10 flex flex-col items-center justify-center gap-0 -translate-x-1/2 -translate-y-1/2 rounded-full
              w-14 h-14 sm:w-20 sm:h-20 border backdrop-blur-xs transition-all
              ${n.wired
                ? (n.id === 'queen'
                    ? 'border-gold/70 bg-void-800/85 shadow-glow-gold hover:border-gold hover:scale-110'
                    : 'border-cyan-glow/50 bg-void-800/85 shadow-glow hover:border-cyan-glow hover:scale-110')
                : 'border-white/10 bg-void-800/50 opacity-45 cursor-not-allowed'}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            title={`${n.label} — ${n.count ?? n.badge ?? 'no data'} (${n.about})`}
          >
            {n.id === 'queen' && <QueenCrown />}
            <span className="text-[13px] sm:text-base leading-none">{n.icon}</span>
            <span className="text-[8px] sm:text-[10px] font-body text-slate-200 text-center leading-tight px-1">{n.label}</span>
            {n.count !== null
              ? <span className="text-[9px] sm:text-[10px] text-cyan-glow font-semibold">{n.count}</span>
              : n.badge
                ? <span className={`text-[8px] sm:text-[9px] ${n.id === 'queen' ? 'text-gold-neon' : 'text-slate-500'}`}>{n.badge}</span>
                : <span className="text-[8px] sm:text-[9px] text-slate-500">no data</span>}
          </button>
        );
      })}
    </div>
  );
}
