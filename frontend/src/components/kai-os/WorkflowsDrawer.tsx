import { useState } from 'react';

interface WorkflowItem {
  label: string;
  wired: boolean;
  detail: string;
}

// Real mapping to skills the hive actually has, where one exists. The rest
// are named in the brief but have no backing automation yet — marked "soon"
// rather than presented as functional multi-agent launchers.
const WORKFLOWS: WorkflowItem[] = [
  { label: 'Coding', wired: true, detail: 'fable-debugger + pocket-dimensions' },
  { label: 'Research', wired: true, detail: 'research-to-dna' },
  { label: 'Automation', wired: true, detail: 'merge-readiness (verify → PR → CI-autofix → merge)' },
  { label: 'Morning Routine', wired: false, detail: 'not yet built' },
  { label: 'Content', wired: false, detail: 'not yet built' },
  { label: 'Book Writing', wired: false, detail: 'not yet built' },
  { label: 'Music', wired: false, detail: 'not yet built' },
  { label: 'Business', wired: false, detail: 'not yet built' },
];

export default function WorkflowsDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          <span className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}>▾</span>
          Workflows
        </span>
      </button>
      {open && (
        <div className="px-3 pb-2 space-y-1">
          {WORKFLOWS.map((w) => (
            <div
              key={w.label}
              className={`flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] ${w.wired ? 'bg-white/5' : 'opacity-45'}`}
              title={w.detail}
            >
              <span className="text-slate-300">{w.label}</span>
              <span className={w.wired ? 'text-cyan-glow' : 'text-slate-600'}>{w.wired ? '●' : 'soon'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
