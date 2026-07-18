import { useEffect } from 'react';

interface GatewayConsoleOverlayProps {
  active: boolean;
  onClose: () => void;
}

// The founder's standalone "Sovereign Hive — Command Center v9" gateway console —
// self-contained HTML/CSS/JS, served same-origin at /gateway-console.html and
// framed in full-screen, same pattern as the Biosystem/Observatory overlays.
// Left panel: LLM gateway management (BYO-key, browser-only storage). Center:
// chat against whichever gateway is connected. Right panel: a Tool Registry
// (RivalSearch/DeepCrawl/OpenAlexSearch/DuckDuckGoSearch) and Activity Log —
// every tool makes a real, keyless network call rather than faking data.
export default function GatewayConsoleOverlay({ active, onClose }: GatewayConsoleOverlayProps) {
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
    <div className="fixed inset-0 z-50 bg-void-black animate-fadeIn flex flex-col">
      <div className="flex items-center justify-between px-4 h-11 shrink-0 bg-void-900/90 border-b border-white/10">
        <span className="text-slate-400 text-xs tracking-widest uppercase">
          Gateway Console — press Esc to exit
        </span>
        <button
          onClick={onClose}
          aria-label="Close Gateway Console"
          className="h-8 w-8 grid place-items-center rounded-lg bg-void-800 border border-white/10 text-slate-300 hover:text-cyan-glow hover:border-cyan-glow/40"
        >
          ✕
        </button>
      </div>
      <iframe
        src="/gateway-console.html"
        title="Sovereign Hive — Gateway Console"
        className="flex-1 w-full border-0 bg-void-black"
      />
    </div>
  );
}
