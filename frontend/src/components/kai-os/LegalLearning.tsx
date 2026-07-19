// Legal-Learning surface. The hive studies the actual rules it must operate
// under — to LEARN to abide by them, not to stand above them (FABLE_DNA
// Chromosome IX). These are curated links to reputable, mostly free/public-domain
// legal references. Opening them is Tier-1 (reading/learning) per PERMISSIONS.md;
// nothing here transacts or acts in the world.

import { useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

const V11 = `${API_BASE_URL}/v11`;

interface RefLink {
  label: string;
  href: string;
  note: string;
}

interface RefGroup {
  heading: string;
  links: RefLink[];
}

const GROUPS: RefGroup[] = [
  {
    heading: 'Primary law & the Constitution',
    links: [
      { label: 'U.S. Constitution (National Archives)', href: 'https://www.archives.gov/founding-docs/constitution-transcript', note: 'The founding text, verbatim.' },
      { label: 'Constitution Annotated (Congress.gov)', href: 'https://constitution.congress.gov/', note: 'Each clause explained with the case law interpreting it.' },
      { label: 'Cornell LII — Constitution', href: 'https://www.law.cornell.edu/constitution', note: 'The Legal Information Institute’s annotated Constitution.' },
    ],
  },
  {
    heading: 'Statutes, regulations & case law',
    links: [
      { label: 'Cornell LII (Legal Information Institute)', href: 'https://www.law.cornell.edu/', note: 'Free U.S. Code, CFR, Supreme Court opinions, and more.' },
      { label: 'Cornell LII — Wex', href: 'https://www.law.cornell.edu/wex', note: 'A free legal dictionary + encyclopedia written by law faculty.' },
    ],
  },
  {
    heading: 'Common law & legal dictionaries',
    links: [
      { label: "Bouvier's Law Dictionary (1856)", href: 'https://en.wikisource.org/wiki/Bouvier%27s_Law_Dictionary', note: 'Public-domain American common-law dictionary, full text.' },
      { label: 'Wex — Latin legal terms & maxims', href: 'https://www.law.cornell.edu/wex/category/latin', note: 'Terms of art the law still uses, defined plainly.' },
    ],
  },
  {
    heading: 'Language, Latin & etymology',
    links: [
      { label: 'Online Etymology Dictionary', href: 'https://www.etymonline.com/', note: 'Where legal words come from — root meanings, Latin origins.' },
      { label: 'Perseus — Latin word study', href: 'https://www.perseus.tufts.edu/hopper/', note: 'Classical Latin lexicon for reading terms at the source.' },
    ],
  },
];

// Legal Guild v1 — the founder's explicit scope choice (2026-07-18): a real
// research assistant with a hard disclaimer, not a false-authority persona
// that role-plays as having passed the bar. Every answer, success or
// failure, carries the same disclaimer — it is never omitted based on how
// confident the answer sounds.
function LegalGuildQA() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const r = await fetch(`${V11}/legal/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) { setError(d.detail || `HTTP ${r.status}`); return; }
      setAnswer(d.answer);
      setProvider(d.provider);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gold/20 bg-void-800/60 p-3 mb-6 space-y-3">
      <h3 className="text-[11px] uppercase tracking-widest text-gold/80">Ask the Legal Guild</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        A real research assistant, not a licensed attorney — it cites the kind of source that
        would confirm an answer (Cornell LII, Bouvier's, actual code sections) rather than
        fabricating specifics, and it is built to explain the real difference between
        sovereignty/jurisdiction questions and the "sovereign citizen" theory courts have
        uniformly rejected.
      </p>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. what's the actual legal difference between a sovereign and a sovereign citizen?"
        rows={2}
        className="w-full bg-void-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-gold/50"
      />
      <button
        onClick={ask}
        disabled={loading || !question.trim()}
        className="px-2.5 py-1 rounded border border-gold/40 text-gold text-xs hover:bg-gold/10 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Researching…' : 'Ask'}
      </button>
      {error && <p className="text-xs text-amber-300">{error}</p>}
      {answer && (
        <div className="space-y-2">
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
          {provider && <p className="text-[10px] text-slate-600">via {provider}</p>}
        </div>
      )}
      <p className="text-[10px] text-amber-300/80 border-t border-white/5 pt-2">
        Not a lawyer. Not legal advice. For anything with real stakes, consult licensed counsel.
      </p>
    </div>
  );
}

export default function LegalLearning() {
  return (
    <div className="max-w-2xl">
      <p className="text-slate-400 text-sm leading-relaxed mb-5">
        The hive studies the actual rules it must operate under — <span className="text-cyan-glow">to learn
        to abide by them, not to stand above them</span>. Reading these is a Tier-1 act
        (learning) under <code className="text-cyan-glow">PERMISSIONS.md</code>; nothing here transacts or
        speaks for the hive. Anything with real legal weight stays founder-only, with qualified
        human counsel.
      </p>

      <LegalGuildQA />

      <div className="flex flex-col gap-5">
        {GROUPS.map((g) => (
          <div key={g.heading}>
            <h3 className="text-[11px] uppercase tracking-widest text-gold/80 mb-2">{g.heading}</h3>
            <div className="flex flex-col gap-1.5">
              {g.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border border-white/10 bg-void-800/60 px-3 py-2 hover:border-cyan-glow/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-slate-200 group-hover:text-cyan-glow">{l.label}</span>
                    <span className="text-[10px] text-slate-500">↗</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{l.note}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-slate-600 text-xs leading-relaxed mt-6">
        Curated public / free references. This is education, not legal advice — the hive learns
        to reason about the rules, and defers every binding step to the founder and licensed
        counsel (FABLE_DNA Chromosome IX).
      </p>
    </div>
  );
}
