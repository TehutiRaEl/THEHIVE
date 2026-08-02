import { useEffect, useRef, useState } from 'react';
import { sendGrokBridgeDispatch, fetchGrokToken, findGrokBridgeRun, type GrokBridgeRun } from '../../services/github';

type Phase = 'idle' | 'authing' | 'dispatching' | 'watching' | 'done' | 'error';

// Real UI trigger for the existing grok-bridge-dispatch endpoints (task 5,
// 2026-08-02) — was built (services/github.ts) but had zero live importers
// until now. Real, bidirectional: dispatch happens for real (a genuine
// repository_dispatch event, received by .github/workflows/grok-bridge.yml,
// which commits real files to grok-strategist-main), and the return path is
// real too — repository_dispatch's own response is a bare 204 with no run
// id, so this polls the Actions runs list (bounded: 20 tries, ~2 minutes,
// then gives up honestly) to find and show the actual run status/outcome,
// not fire-and-forget.
export default function GrokBridgePanel() {
  const [bridgeKey, setBridgeKey] = useState('');
  const [message, setMessage] = useState('');
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<GrokBridgeRun | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);

  const utf8ToBase64 = (s: string) => {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  };

  const watchRun = async (token: string, dispatchedAt: string, attempt = 0) => {
    if (attempt >= 20) {
      setPhase('error');
      setError('Dispatched, but no matching workflow run showed up within ~2 minutes. Check the Actions tab directly — this UI gave up polling, it did not fake a result.');
      return;
    }
    try {
      const r = await findGrokBridgeRun(token, dispatchedAt);
      if (r) {
        setRun(r);
        if (r.status === 'completed') { setPhase('done'); return; }
      }
    } catch (e) {
      // A transient lookup failure doesn't mean the dispatch failed — the
      // real workflow run may still be happening. Keep watching rather than
      // reporting a false failure, up to the same attempt cap.
    }
    pollRef.current = window.setTimeout(() => watchRun(token, dispatchedAt, attempt + 1), 6000);
  };

  const runDispatch = async () => {
    setError(null);
    setRun(null);
    if (!bridgeKey.trim()) { setError('Grok Bridge key required.'); return; }
    if (!path.trim()) { setError('A file path is required (single-file trigger for now).'); return; }
    setPhase('authing');
    try {
      const token = await fetchGrokToken(bridgeKey.trim());
      setPhase('dispatching');
      const dispatchedAt = new Date().toISOString();
      await sendGrokBridgeDispatch(token, [{ path: path.trim(), content: utf8ToBase64(content) }], message.trim() || 'manual dispatch from Command Center');
      setPhase('watching');
      watchRun(token, dispatchedAt, 0);
    } catch (e) {
      setPhase('error');
      setError(String(e instanceof Error ? e.message : e));
    }
  };

  const busy = phase === 'authing' || phase === 'dispatching' || phase === 'watching';

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-slate-400 text-sm leading-relaxed">
        Real trigger for the Grok bridge (<code className="text-cyan-glow">services/github.ts</code>):
        dispatches a genuine GitHub <code className="text-cyan-glow">repository_dispatch</code> event,
        received by <code className="text-cyan-glow">grok-bridge.yml</code>, which commits the file(s)
        to <code className="text-cyan-glow">grok-strategist-main</code> for real. Works both ways — this
        panel watches the Actions run it triggered and reports the real outcome, not just fire-and-forget.
      </p>

      <div className="space-y-2">
        <label className="block text-xs text-slate-500 uppercase tracking-widest">Grok Bridge key</label>
        <input
          type="password"
          value={bridgeKey}
          onChange={(e) => setBridgeKey(e.target.value)}
          placeholder="X-Grok-Key value"
          className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
        <p className="text-slate-600 text-xs">Held only in this component's memory — never persisted, never sent anywhere but the bridge token lookup.</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="File path, e.g. sandbox/note.md"
          className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="File content (plain text — base64-encoded automatically before sending)"
          className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Commit message (optional)"
          className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
      </div>

      <button
        onClick={runDispatch}
        disabled={busy}
        className="px-3 py-1.5 rounded border border-violet-bright/40 text-violet-bright text-xs hover:bg-violet-bright/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {phase === 'authing' && 'Authenticating…'}
        {phase === 'dispatching' && 'Dispatching…'}
        {phase === 'watching' && 'Watching for the run…'}
        {(phase === 'idle' || phase === 'done' || phase === 'error') && 'Dispatch to Grok bridge'}
      </button>

      {error && <p className="text-xs text-amber-300">{error}</p>}

      {run && (
        <div className="rounded-lg border border-white/10 bg-void-800/60 p-3 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 uppercase tracking-widest text-[10px]">Run status</span>
            <span className={
              run.conclusion === 'success' ? 'text-emerald-300'
                : run.conclusion === 'failure' ? 'text-red-300'
                : 'text-cyan-glow'
            }>
              {run.status}{run.conclusion ? ` · ${run.conclusion}` : ''}
            </span>
          </div>
          <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">
            View run on GitHub →
          </a>
        </div>
      )}
    </div>
  );
}
