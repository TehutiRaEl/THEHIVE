import type { HiveData } from '../../hooks/useHiveData';

interface HiveTerminalProps {
  hive: HiveData;
}

// Styled like a dev terminal, per the brief — but this is a real activity/log
// reader (heartbeat + governance events), not a shell that executes arbitrary
// commands from the browser. Wiring a public frontend to run real commands
// would be a genuine remote-code-execution hole, so that part of the brief is
// deliberately not built as literally described.
export default function HiveTerminal({ hive }: HiveTerminalProps) {
  const lines = [
    { tag: 'status', text: hive.online ? 'connected to edge Worker' : 'disconnected' },
    { tag: 'branch', text: 'main' },
    ...hive.pulse.slice(0, 6).map((p) => ({
      tag: (p.ts || '').slice(11, 19) || 'pulse',
      text: p.detail || p.action,
    })),
  ];

  return (
    <div className="flex flex-col h-full bg-void-black/80 border border-white/10 rounded-lg overflow-hidden font-mono text-[11px]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/5">
        <span className="text-slate-300 tracking-wide">Hive Terminal</span>
        <span className="text-slate-600">— □ ×</span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 text-slate-400">
            <span className="text-cyan-glow/70 shrink-0">{l.tag}</span>
            <span className="truncate">{l.text}</span>
          </div>
        ))}
        {hive.pulse.length === 0 && (
          <div className="text-slate-600">awaiting first heartbeat…</div>
        )}
      </div>
      <div className="border-t border-white/10 px-3 py-1.5 text-slate-600">
        &gt; read-only activity feed — not a shell
      </div>
    </div>
  );
}
