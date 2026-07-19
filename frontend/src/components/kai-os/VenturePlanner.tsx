import { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

interface VenturePlan {
  goal: string;
  departments: { name: string; mandate: string; tasks: string[] }[];
}

const V11 = `${API_BASE_URL}/v11`;

// The Sub-Architect's first workflow (TEAM_CHARTERS.md, 2026-07-18): the
// founder describes a venture, a real LLM call decomposes it into a
// CEO -> departments -> tasks plan, and — critically — nothing executes.
// The plan is a draft; "Submit as proposal" is the only way it goes
// anywhere, and even then it just lands in the same founder-gated
// Proposals channel as everything else. No real account, post, or dollar
// moves without the founder's own hands, same as every other Tier-3 gate.
export default function VenturePlanner() {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<VenturePlan | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawFallback, setRawFallback] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const runPlan = async () => {
    const b = brief.trim();
    if (!b) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    setRawFallback(null);
    setSubmitted(false);
    try {
      const r = await fetch(`${V11}/venture/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: b }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) {
        setError(d.detail || `HTTP ${r.status}`);
        if (d.raw) setRawFallback(d.raw);
        return;
      }
      setPlan(d.plan);
      setProvider(d.provider);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const submitAsProposal = async () => {
    if (!plan) return;
    try {
      const body =
        `Goal: ${plan.goal}\n\n` +
        plan.departments.map((d) => `## ${d.name}\n${d.mandate}\n- ${d.tasks.join('\n- ')}`).join('\n\n');
      const r = await fetch(`${V11}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'venture', title: `Venture: ${brief.trim().slice(0, 120)}`, body }),
      });
      if (r.ok) setSubmitted(true);
    } catch { /* leave submitted=false, the button stays available to retry */ }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-slate-400 text-sm leading-relaxed">
        Describe a venture — a storefront, a content pipeline, a service — and the Sub-Architect
        drafts a structured plan (goal → departments → tasks) using whichever LLM provider is
        currently bound. This only plans and drafts. It never creates a real account, posts
        content, spends money, or deploys anything live — that always needs your own decision,
        via "Submit as proposal" below.
      </p>

      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder='e.g. "A merch dropshipping storefront for my upcoming book, with a faceless multi-platform social presence driving traffic to it"'
        rows={3}
        className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
      />
      <button
        onClick={runPlan}
        disabled={loading || !brief.trim()}
        className="px-3 py-1.5 rounded border border-violet-bright/40 text-violet-bright text-xs hover:bg-violet-bright/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Drafting…' : 'Draft venture plan'}
      </button>

      {error && (
        <div className="text-xs text-amber-300 space-y-1">
          <p>{error}</p>
          {rawFallback && (
            <pre className="whitespace-pre-wrap bg-void-800/60 border border-white/10 rounded-lg p-2 text-slate-400 max-h-48 overflow-y-auto">{rawFallback}</pre>
          )}
        </div>
      )}

      {plan && (
        <div className="rounded-lg border border-cyan-glow/20 bg-void-800/60 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <strong className="text-cyan-glow text-sm">{plan.goal}</strong>
            {provider && <span className="text-[10px] text-slate-500">via {provider}</span>}
          </div>
          <div className="space-y-2.5">
            {plan.departments.map((d) => (
              <div key={d.name} className="border-l-2 border-white/10 pl-2.5">
                <div className="text-sm text-slate-100">{d.name}</div>
                <div className="text-xs text-slate-400">{d.mandate}</div>
                <ul className="text-xs text-slate-500 list-disc list-inside mt-1 space-y-0.5">
                  {d.tasks.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <button
            onClick={submitAsProposal}
            disabled={submitted}
            className="px-2.5 py-1 rounded border border-emerald-400/40 text-emerald-300 text-xs hover:bg-emerald-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitted ? '✓ Submitted to Proposals' : 'Submit as proposal'}
          </button>
        </div>
      )}
    </div>
  );
}
