import { useEffect } from 'react';
import CenterGraph from './CenterGraph';
import type { HiveData } from '../../hooks/useHiveData';

interface ObservatoryProps {
  active: boolean;
  onClose: () => void;
  hive: HiveData;
  speaking: boolean;
  onSelect: (id: string) => void;
}

// Press Space: the chrome disappears, only the graph remains, full-screen.
export default function Observatory({ active, onClose, hive, speaking, onSelect }: ObservatoryProps) {
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
    <div className="fixed inset-0 z-50 bg-void-black animate-fadeIn" onClick={onClose}>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-500 text-xs tracking-widest uppercase">
        The Observatory — press Esc or click to exit
      </div>
      <div className="w-full h-full p-16" onClick={(e) => e.stopPropagation()}>
        <CenterGraph hive={hive} speaking={speaking} onSelect={(id) => { onSelect(id); onClose(); }} />
      </div>
    </div>
  );
}
