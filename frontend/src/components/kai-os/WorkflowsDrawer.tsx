import { useState } from 'react';

interface Playbook {
  label: string;
  skill: string;
  detail: string;
}

// The Hive's written-down playbooks that really exist in the repo
// (.claude/skills/). They are run by an AI working in a coding session, not
// launched from this screen, so this list is information, not a set of
// launchers: no status dots, no buttons that would pretend to start anything.
// Playbooks that were only ever "not yet built" are not listed at all.
const PLAYBOOKS: Playbook[] = [
  { label: 'Coding', skill: 'fable-debugger + pocket-dimensions', detail: 'Find the root cause of a bug; try risky changes in a throwaway copy first.' },
  { label: 'Research', skill: 'research-to-dna', detail: 'Check research before it becomes Hive knowledge.' },
  { label: 'Automation', skill: 'merge-readiness', detail: 'Verify, open the PR, fix CI, then hold for the founder to merge.' },
];

export default function WorkflowsDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/10">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
      >
        <span className="flex items-center gap-2">
          <span className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}>▾</span>
          Workflows
        </span>
        <span className="text-[10px] text-slate-500">{PLAYBOOKS.length} playbooks</span>
      </button>
      {open && (
        <div className="px-3 pb-2 space-y-1">
          <p className="text-[10px] text-slate-500 leading-snug px-1 pb-1">
            Playbooks written into the repo. An AI follows them in a coding session; this screen does not start them.
          </p>
          {PLAYBOOKS.map((w) => (
            <div key={w.label} className="px-2 py-1.5 rounded-md text-[11px] bg-white/5">
              <div className="text-slate-200">{w.label}</div>
              <div className="text-slate-500 font-mono text-[10px]">{w.skill}</div>
              <div className="text-slate-400 leading-snug">{w.detail}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
