import { useEffect, useRef } from 'react';
import CenterGraph from './CenterGraph';
import type { HiveData } from '../../hooks/useHiveData';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ObservatoryProps {
  active: boolean;
  onClose: () => void;
  hive: HiveData;
  speaking: boolean;
  onSelect: (id: string) => void;
}

// Press Space: the chrome disappears, only the graph remains, full-screen.
export default function Observatory({ active, onClose, hive, speaking, onSelect }: ObservatoryProps) {
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
      aria-label="The Observatory"
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-void-black animate-fadeIn"
      onClick={onClose}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 text-slate-500 text-xs tracking-widest uppercase">
        <span>The Observatory — press Esc or click to exit</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close Observatory"
          className="h-8 px-2 rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40 normal-case tracking-normal"
        >
          Close
        </button>
      </div>
      <div className="w-full h-full p-16" onClick={(e) => e.stopPropagation()}>
        <CenterGraph hive={hive} speaking={speaking} onSelect={(id) => { onSelect(id); onClose(); }} />
      </div>
    </div>
  );
}
