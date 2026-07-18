import { useEffect, useState } from 'react';

interface ConstState {
  loading: boolean;
  text: string | null;
  error?: string;
}

// The live Constitution, straight from docs/GOVERNANCE.md — served same-origin
// as a static file (same pattern as /biosystem.html), so whatever the founder
// commits there is what this panel shows. No caching, no stale copy pasted
// into a component: fetched fresh every time the panel opens.
export default function ConstitutionViewer() {
  const [state, setState] = useState<ConstState>({ loading: true, text: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`/GOVERNANCE.md?ts=${Date.now()}`, { signal: AbortSignal.timeout(8000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => { if (!cancelled) setState({ loading: false, text }); })
      .catch((e) => { if (!cancelled) setState({ loading: false, text: null, error: String(e) }); });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) return <p className="text-slate-500 text-sm">Reading the Constitution…</p>;

  if (!state.text) {
    return (
      <p className="text-amber-300 text-sm">
        Couldn't reach the live Constitution ({state.error || 'unknown error'}). It lives at{' '}
        <code className="text-cyan-glow">docs/GOVERNANCE.md</code> in the repo.
      </p>
    );
  }

  return (
    <div className="max-w-3xl space-y-1 text-sm leading-relaxed">
      {renderMarkdown(state.text)}
    </div>
  );
}

// Minimal, dependency-free markdown rendering — just enough for this
// document's shape (headers, blockquotes, bold labels, hr, plain paragraphs).
// Builds React elements directly; never injects raw HTML.
function renderMarkdown(md: string) {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let key = 0;

  const inline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="text-cyan-glow bg-void-800/60 px-1 rounded">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { continue; }
    if (line.trim() === '---') {
      nodes.push(<hr key={key++} className="border-white/10 my-3" />);
    } else if (line.startsWith('### ')) {
      nodes.push(<h4 key={key++} className="text-gold-neon font-display text-sm mt-4 mb-1">{inline(line.slice(4))}</h4>);
    } else if (line.startsWith('## ')) {
      nodes.push(<h3 key={key++} className="text-gold-neon font-display text-base mt-5 mb-1.5 tracking-wide">{inline(line.slice(3))}</h3>);
    } else if (line.startsWith('# ')) {
      nodes.push(<h2 key={key++} className="text-gold font-display text-lg mt-2 mb-2 tracking-wide">{inline(line.slice(2))}</h2>);
    } else if (line.startsWith('> ')) {
      nodes.push(<blockquote key={key++} className="border-l-2 border-cyan-glow/40 pl-3 italic text-slate-400 my-1">{inline(line.slice(2))}</blockquote>);
    } else if (line.startsWith('- ')) {
      nodes.push(<div key={key++} className="pl-4 text-slate-300">• {inline(line.slice(2))}</div>);
    } else {
      nodes.push(<p key={key++} className="text-slate-300 my-1">{inline(line)}</p>);
    }
  }
  return nodes;
}
