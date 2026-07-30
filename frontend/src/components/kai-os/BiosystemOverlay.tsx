import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface BiosystemOverlayProps {
  active: boolean;
  onClose: () => void;
}

// The founder's standalone "Sovereign Hive — Biosystem Architecture" dashboard
// (72-system Brain/Body/Neuro/Health registry) — self-contained HTML/CSS/JS,
// served same-origin at /biosystem.html and framed in full-screen, same pattern
// as the Observatory overlay. Its internal mock constitution/economy text is
// that page's own simulation only — not the hive's actual soul.md/FABLE_DNA.
export default function BiosystemOverlay({ active, onClose }: BiosystemOverlayProps) {
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
      aria-label="Biosystem Architecture"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-void-black animate-fadeIn flex flex-col"
    >
      <div className="flex items-center justify-between px-4 h-11 shrink-0 bg-void-900/90 border-b border-white/10">
        <span className="text-slate-400 text-xs tracking-widest uppercase">
          Biosystem Architecture — press Esc to exit
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Biosystem"
          className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40"
        >
          ✕
        </button>
      </div>
      <iframe
        src="/biosystem.html"
        title="Sovereign Hive — Biosystem Architecture"
        className="flex-1 w-full border-0 bg-void-black"
      />
    </div>
  );
}
