import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface FullPlanOverlayProps {
  active: boolean;
  onClose: () => void;
}

// The hive's unabridged planning reference — .claude/tasks/FULL_PLAN.html, including
// "THE PROJECT LEDGER" (the real P0-P7 dependency-ordered resume contract). Same
// same-origin-iframe pattern as GatewayConsoleOverlay/BiosystemOverlay: served at
// /full-plan.html, a build artifact regenerated on every push to the real source file
// by .github/workflows/sync-planning-docs.yml — never a hand-maintained second copy.
// The Roadmap panel's "Project Ledger (P0-P7)" section (roadmap-digest.yml) shows a
// live summary; this shows the real, complete document with every domain tab.
export default function FullPlanOverlay({ active, onClose }: FullPlanOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(active, panelRef);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Full Project Plan"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-void-black animate-fadeIn flex flex-col"
    >
      <div className="flex items-center justify-between px-4 h-11 shrink-0 bg-void-900/90 border-b border-white/10">
        <span className="text-slate-400 text-xs tracking-widest uppercase">
          Full Project Plan (FULL_PLAN.html) — press Esc to exit
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Full Project Plan"
          className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40"
        >
          ✕
        </button>
      </div>
      <iframe
        src="/full-plan.html"
        title="THEHIVE — Full Project Plan"
        className="flex-1 w-full border-0 bg-void-black"
      />
    </div>
  );
}
