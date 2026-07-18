import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

interface Proposal {
  id: number;
  ts: string;
  kind: string;
  title: string;
  body?: string;
  status: 'pending' | 'approved' | 'rejected';
  decided_at?: string;
  founder_note?: string;
}

const V11 = `${API_BASE_URL}/v11`;
const KEY_STORAGE = 'hive_founder_key';

// The hive's standing suggestion box: new implementations, goals, and
// changes it thinks are worth doing — surfaced here, never applied on their
// own. Approve/Reject calls the founder-key-gated /decide endpoint, which
// fails closed (nothing decidable by anyone) until that key is bound —
// deliberately stricter than every other gate in this app, because "the
// founder said yes" has to be verifiably true here, not just plausible.
export default function ProposalsPanel() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [authBound, setAuthBound] = useState(false);
  const [key, setKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '');
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${V11}/proposals`, { signal: AbortSignal.timeout(8000) });
      const d = await r.json();
      setProposals(d.proposals ?? []);
      setAuthBound(!!d.founder_auth_bound);
    } catch {
      setError('hive unreachable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveKey = (v: string) => {
    setKey(v);
    localStorage.setItem(KEY_STORAGE, v);
  };

  const decide = async (id: number, decision: 'approved' | 'rejected') => {
    setBusy(id);
    setError(null);
    try {
      const r = await fetch(`${V11}/proposals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ decision }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.detail || `HTTP ${r.status}`); return; }
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <p className="text-slate-500 text-sm">Reading the suggestion box…</p>;

  const pending = proposals.filter((p) => p.status === 'pending');
  const decided = proposals.filter((p) => p.status !== 'pending');

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-slate-400 text-sm leading-relaxed">
        The hive's own suggestions for how it should evolve — new implementations, goals, and
        changes. Nothing here is ever applied automatically; every item waits for your explicit
        approve or reject.
      </p>

      {!authBound && (
        <div className="rounded-lg border border-amber-400/20 bg-void-800/60 p-3 text-xs text-slate-400 space-y-1">
          <div className="text-amber-300/90 uppercase tracking-widest text-[10px] mb-1">
            Founder — nothing can be decided yet
          </div>
          <div>No <code className="text-cyan-glow">FOUNDER_KEY</code> is bound, so approve/reject is
            locked for everyone, including you, on purpose — fails closed, not open.</div>
          <div><code className="text-cyan-glow">npx wrangler secret put FOUNDER_KEY</code> (pick any
            strong value), then paste that same value below.</div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => saveKey(e.target.value)}
          placeholder="Founder key (stored only in this browser)"
          className="flex-1 bg-void-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
      </div>

      {error && <p className="text-xs text-amber-300">{error}</p>}

      <div className="space-y-2">
        <div className="text-slate-500 uppercase tracking-wider text-[10px]">
          Pending ({pending.length})
        </div>
        {pending.length === 0 ? (
          <p className="text-slate-600 text-sm">Nothing pending right now.</p>
        ) : pending.map((p) => (
          <div key={p.id} className="rounded-lg border border-cyan-glow/20 bg-void-800/60 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/10 text-slate-500">{p.kind}</span>
              <span className="text-sm text-slate-100">{p.title}</span>
            </div>
            {p.body && <p className="text-xs text-slate-400 leading-relaxed">{p.body}</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => decide(p.id, 'approved')}
                disabled={busy === p.id || !key}
                className="px-2.5 py-1 rounded border border-emerald-400/40 text-emerald-300 text-xs hover:bg-emerald-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => decide(p.id, 'rejected')}
                disabled={busy === p.id || !key}
                className="px-2.5 py-1 rounded border border-red-400/40 text-red-300 text-xs hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="space-y-2">
          <div className="text-slate-500 uppercase tracking-wider text-[10px]">Decided</div>
          {decided.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/5 bg-void-800/30 p-2.5 text-xs">
              <span className={p.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}>
                {p.status === 'approved' ? '✓' : '✕'} {p.title}
              </span>
              {p.founder_note && <div className="text-slate-500 mt-1">"{p.founder_note}"</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
