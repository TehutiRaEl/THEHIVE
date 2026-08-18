import { useCallback, useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';
import { Button } from '../common';

interface Proposal {
  id: number;
  ts: string;
  kind: string;
  title: string;
  body?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  decided_at?: string;
  founder_note?: string;
  // These four were already returned by GET /v11/proposals and already stored in D1,
  // but this interface never declared them, so the panel silently dropped all four
  // (task 50, 2026-08-06). That is why the founder's screen showed six flat "decided"
  // rows while three of them had real work untouched: the distinction existed in the
  // database and in Kai El's context, and only the human-facing surface was blind to it.
  actioned_at?: string | null;
  alignment_score?: number | null;
  decided_by?: string | null;
  elder_note?: string | null;
  // modifies_id (task 22, 2026-08-14): set only on a counter-proposal row —
  // points back at the original pending proposal it replaced, so the panel
  // can show real lineage instead of two unrelated-looking rows.
  modifies_id?: number | null;
  // Kai El's first evolution into an architect agent (2026-08-10): an
  // 'architect-proposal' can now carry a real, reviewable code diff instead of
  // only prose describing one. All three are null on every other proposal kind
  // and on architect-proposals with no diff — nothing here changes what those
  // look like. diff_check is written only by .github/workflows/
  // architect-proposal-check.yml, the one place that actually has git.
  diff?: string | null;
  diff_files?: string | null; // JSON array of touched paths, as stored
  diff_check?: string | null; // null | 'pending' | 'applies_clean' | 'failed: <reason>'
}

const V11 = `${API_BASE_URL}/v11`;
const KEY_STORAGE = 'hive_founder_key';

// A real, reviewable diff — collapsed by default so a founder scanning many
// proposals isn't forced past raw diff text to see the title/body. The
// diff_check badge reports the ONE thing that matters before deciding: does
// this actually apply, or would approving it approve something unusable.
function DiffBlock({ p }: { p: Proposal }) {
  if (!p.diff) return null;
  let files: string[] = [];
  try { files = JSON.parse(p.diff_files || '[]'); } catch { /* malformed stored JSON — show no file list rather than crash the panel */ }

  const check = p.diff_check || 'pending';
  const badge =
    check === 'applies_clean'
      ? { text: 'applies cleanly', cls: 'border-emerald-400/40 text-emerald-300' }
      : check.startsWith('failed')
        ? { text: 'does NOT apply', cls: 'border-red-400/40 text-red-300' }
        : { text: 'checking…', cls: 'border-amber-400/40 text-amber-300' };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span
          title={check.startsWith('failed') ? check : undefined}
          className={`shrink-0 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border ${badge.cls}`}
        >
          {badge.text}
        </span>
        {files.length > 0 && (
          <span className="text-[10px] text-slate-500">{files.join(', ')}</span>
        )}
      </div>
      {check.startsWith('failed') && (
        <div className="text-[10px] text-red-300/80">{check}</div>
      )}
      <details className="text-xs">
        <summary className="cursor-pointer text-cyan-glow/80 select-none">View diff</summary>
        <pre className="mt-1 max-h-64 overflow-auto rounded bg-black/40 p-2 text-[10px] text-slate-300 whitespace-pre-wrap">
          {p.diff}
        </pre>
      </details>
      <p className="text-[10px] text-slate-600">
        Drafted by Kai El, never applied automatically — review, then apply it yourself.
      </p>
    </div>
  );
}

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
  // Which pending proposal has its modify/counter-propose textarea open, and
  // the draft text typed into it — kept separate per-id so opening one
  // doesn't clobber a draft in progress on another.
  const [modifyOpenId, setModifyOpenId] = useState<number | null>(null);
  const [modifyDraft, setModifyDraft] = useState('');

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

  // 2026-08-09: tries the Cloudflare Access route first. No Authorization header
  // needed here at all — a founder with an active Access session automatically
  // carries the CF_Authorization cookie on this same-origin fetch, so a matching
  // request just succeeds with zero key handling. A 401 from THIS route means "no
  // Access session yet" (or Access isn't provisioned), not a real error, so it
  // falls through silently to the original FOUNDER_KEY path below rather than
  // surfacing anything — that path's own errors are still shown normally.
  const decide = async (id: number, decision: 'approved' | 'rejected' | 'modified', extra?: { modified_body: string; modified_title?: string }) => {
    setBusy(id);
    setError(null);
    try {
      try {
        const accessRes = await fetch(`${V11}/founder/proposals/${id}/decide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, ...extra }),
        });
        if (accessRes.ok) {
          await load();
          return;
        }
        if (accessRes.status !== 401) {
          const d = await accessRes.json().catch(() => ({}));
          setError(d.detail || `HTTP ${accessRes.status}`);
          return;
        }
      } catch {
        // Network/CORS trouble on the Access route — fall through to FOUNDER_KEY
        // too, same as a 401, rather than surfacing a confusing error for the
        // happy path (most visitors won't have Access set up at all yet).
      }

      if (!key) {
        setError('Not signed in with Cloudflare Access, and no FOUNDER_KEY entered — use "Sign in as founder" above or paste a key.');
        return;
      }

      const r = await fetch(`${V11}/proposals/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ decision, ...extra }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setError(d.detail || `HTTP ${r.status}`); return; }
      if (decision === 'modified') { setModifyOpenId(null); setModifyDraft(''); }
      await load();
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(null);
    }
  };

  const submitModify = (id: number) => {
    const text = modifyDraft.trim();
    if (!text) return;
    decide(id, 'modified', { modified_body: text });
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

      {/* 2026-08-09: a plain top-level link, not a fetch — visiting it is what
          actually triggers Cloudflare Access's login flow (redirect → email PIN
          → redirect back). Once signed in, Approve/Reject above never touches
          the key field again; this is here so a founder who hasn't set up
          Access yet has an obvious way to start, rather than only discovering
          it via a silent background retry. Optional: the key field below still
          works on its own if Access isn't configured. */}
      <a
        href={`${V11}/founder/login`}
        className="inline-block text-xs text-cyan-glow hover:underline"
      >
        Sign in as founder (Cloudflare Access) →
      </a>

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
            <DiffBlock p={p} />
            <div className="flex items-center gap-2 pt-1">
              {/* First real consumer of components/common (task 13, 2026-08-06). The
                  shared Button also gives these two a real in-flight spinner via
                  isLoading, which the hand-written versions never had — previously a
                  click just dimmed the button with no sign anything was happening. */}
              <Button
                variant="success"
                size="xs"
                onClick={() => decide(p.id, 'approved')}
                disabled={!key}
                isLoading={busy === p.id}
              >
                ✓ Approve
              </Button>
              <Button
                variant="danger"
                size="xs"
                onClick={() => decide(p.id, 'rejected')}
                disabled={!key}
                isLoading={busy === p.id}
              >
                ✕ Reject
              </Button>
              {/* Modify/counter-propose (task 22, 2026-08-14): the panel only ever
                  supported a binary decision. This opens an inline draft instead of
                  a third same-weight button, since the action needs real text first. */}
              <Button
                variant="secondary"
                size="xs"
                onClick={() => {
                  if (modifyOpenId === p.id) { setModifyOpenId(null); return; }
                  setModifyOpenId(p.id);
                  setModifyDraft(p.body || '');
                }}
                disabled={!key}
              >
                ✎ Modify
              </Button>
            </div>
            {modifyOpenId === p.id && (
              <div className="space-y-1.5 pt-1">
                <textarea
                  value={modifyDraft}
                  onChange={(e) => setModifyDraft(e.target.value)}
                  rows={3}
                  placeholder="Counter-proposal text — files as a new pending proposal; this one closes as 'modified'."
                  className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
                />
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => submitModify(p.id)}
                  disabled={!key || !modifyDraft.trim()}
                  isLoading={busy === p.id}
                >
                  Submit counter-proposal
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {decided.length > 0 && (
        <div className="space-y-2">
          <div className="text-slate-500 uppercase tracking-wider text-[10px]">Decided</div>
          {decided.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/5 bg-void-800/30 p-2.5 text-xs space-y-1">
              <div className="flex items-start justify-between gap-2">
                <span className={
                  p.status === 'approved' ? 'text-emerald-400'
                    : p.status === 'modified' ? 'text-cyan-glow'
                    : 'text-red-400'
                }>
                  {p.status === 'approved' ? '✓' : p.status === 'modified' ? '✎' : '✕'} {p.title}
                </span>
                {/* The distinction the founder could not see before: "approved" and
                    "approved AND the work actually happened" are different states, and
                    only actioned_at separates them. Rejected rows get no badge — the
                    concept does not apply to them. */}
                {p.status === 'approved' && (
                  p.actioned_at ? (
                    <span
                      title={`Work done ${p.actioned_at}`}
                      className="shrink-0 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300"
                    >
                      work done
                    </span>
                  ) : (
                    <span
                      title="Approved, but no firing has picked this up yet"
                      className="shrink-0 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full border border-amber-400/40 text-amber-300"
                    >
                      not started
                    </span>
                  )
                )}
              </div>
              {/* Who decided it, and — when the Queen auto-approved — how aligned she
                  scored it. Both were already stored and returned; neither was shown. */}
              {(p.decided_by || typeof p.alignment_score === 'number') && (
                <div className="text-slate-500">
                  {/* decided_by is only ever 'queen' (set by queenDecide) or null — null
                      means the founder used the founder-key-gated /decide endpoint. The
                      explicit 'founder' case is handled too so it never renders the
                      ungrammatical "Decided by founder" if that value ever appears. */}
                  {p.decided_by === 'queen'
                    ? 'Decided by the Queen'
                    : (!p.decided_by || p.decided_by === 'founder')
                      ? 'Decided by the founder'
                      : `Decided by ${p.decided_by}`}
                  {typeof p.alignment_score === 'number' && ` · alignment ${p.alignment_score}/100`}
                </div>
              )}
              {/* An Elder's veto reason. If this is present the Queen wanted to approve
                  and Ma'at or Solomon objected — the founder should always see why. */}
              {p.elder_note && (
                <div className="text-amber-300/80 border-l-2 border-amber-400/40 pl-2">
                  Elders' Council: {p.elder_note}
                </div>
              )}
              {p.founder_note && <div className="text-slate-500">"{p.founder_note}"</div>}
              {/* modifies_id is only ever set on the NEW row a modify/counter-propose
                  created — points back at the original it replaced (task 22, 2026-08-14). */}
              {typeof p.modifies_id === 'number' && (
                <div className="text-cyan-glow/80">Counter-proposes #{p.modifies_id}</div>
              )}
              <DiffBlock p={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
