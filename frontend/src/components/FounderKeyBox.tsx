import { useState } from 'react';
import { clearFounderKey, setFounderKey, useFounderKey } from '../utils/founderKey';

// The small control that lets the founder unlock Commune with Kai El on this device. Commune is
// founder-only, so without a key the chat cannot work; this says so and takes the key. Shown inside
// both chat panels. `refused` is true when the Hive just rejected the key that was sent.
export default function FounderKeyBox({ refused = false, compact = false }: { refused?: boolean; compact?: boolean }) {
  const key = useFounderKey();
  const [draft, setDraft] = useState('');

  if (key && !refused) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-1 border-b border-white/10 text-[10px] text-slate-500">
        <span>🔑 Founder key set in this browser</span>
        <button
          type="button"
          onClick={clearFounderKey}
          className="px-2 py-0.5 rounded border border-white/15 text-slate-400 hover:bg-white/5"
        >
          Forget key
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (setFounderKey(draft)) setDraft(''); }}
      className={`px-3 ${compact ? 'py-1.5' : 'py-2'} border-b border-white/10 space-y-1`}
    >
      <p className="text-[11px] text-slate-400">
        {refused
          ? 'The Hive refused this key. Check it and save it again.'
          : '🔒 Commune with Kai El is founder-only. Enter the founder key to unlock it on this device.'}
      </p>
      <div className="flex gap-1">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Founder key"
          autoComplete="off"
          aria-label="Founder key"
          className="flex-1 min-w-0 bg-void-900 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="px-2 py-1 rounded border border-cyan-glow/40 text-cyan-glow text-xs hover:bg-cyan-glow/10 disabled:opacity-40"
        >
          Save key
        </button>
      </div>
    </form>
  );
}
