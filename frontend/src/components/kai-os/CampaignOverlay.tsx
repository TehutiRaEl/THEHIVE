import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface CampaignOverlayProps {
  active: boolean;
  onClose: () => void;
}

// The hive's own live task queue — .claude/tasks/CAMPAIGN.html, the protocol every
// autonomous firing follows and the full log of what it actually did. Same
// same-origin-iframe pattern as GatewayConsoleOverlay/BiosystemOverlay: served at
// /campaign.html, a build artifact regenerated on every push to the real source file
// by .github/workflows/sync-planning-docs.yml — never a hand-maintained second copy.
// The Roadmap panel's "Live Task Queue" section (campaign-roadmap-digest.yml) shows a
// live summary; this shows the real, complete document.
export default function CampaignOverlay({ active, onClose }: CampaignOverlayProps) {
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
      aria-label="Live Task Queue"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-void-black animate-fadeIn flex flex-col"
    >
      <div className="flex items-center justify-between px-4 h-11 shrink-0 bg-void-900/90 border-b border-white/10">
        <span className="text-slate-400 text-xs tracking-widest uppercase">
          Live Task Queue (CAMPAIGN.html) — press Esc to exit
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Live Task Queue"
          className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40"
        >
          ✕
        </button>
      </div>
      <iframe
        src="/campaign.html"
        title="THEHIVE — Live Task Queue"
        className="flex-1 w-full border-0 bg-void-black"
      />
    </div>
  );
}
