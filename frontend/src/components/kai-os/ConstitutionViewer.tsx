import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

interface ConstState {
  loading: boolean;
  text: string | null;
  hash?: string;
  source?: string;
  canonicalSource?: string;
  error?: string;
}

// The Constitution, as the live Hive serves it: GET /v11/constitution, which returns
// docs/CONSTITUTION.md, a generated view of soul.md (the ONE constitution, F-001 to
// F-006). This panel used to read docs/GOVERNANCE.md, which presents F-001 to F-013 as
// "the constitution"; F-007 to F-013 were never ratified. It no longer reads that file,
// and it never falls back to it or to any text of its own: if the route does not answer,
// the panel says so and shows nothing in its place.
// Guarded by tests/unit/test_frontend_live_data.py (TestConstitutionPanel).
export default function ConstitutionViewer() {
  const [state, setState] = useState<ConstState>({ loading: true, text: null });

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE_URL}/v11/constitution`, { signal: AbortSignal.timeout(8000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (!d || d.available !== true || typeof d.content !== 'string' || !d.content.trim()) {
          throw new Error(d?.reason || 'the Hive reports the constitution as not available');
        }
        if (!cancelled) {
          setState({
            loading: false,
            text: d.content,
            hash: typeof d.hash === 'string' ? d.hash : undefined,
            source: typeof d.source === 'string' ? d.source : undefined,
            canonicalSource: typeof d.canonical_source === 'string' ? d.canonical_source : undefined,
          });
        }
      })
      .catch((e) => { if (!cancelled) setState({ loading: false, text: null, error: String(e?.message || e) }); });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) return <p className="text-slate-500 text-sm">Reading the Constitution…</p>;
  if (!state.text) {
    return (
      <p className="text-amber-300 text-sm">
        No data: couldn't read the Constitution from the Hive ({state.error || 'unknown error'}). The canonical text
        is <code className="text-cyan-glow">soul.md</code> in the repo. Nothing else is shown in its place.
      </p>
    );
  }
  return (
    <div className="max-w-3xl space-y-1 text-sm leading-relaxed">
      <p className="text-[11px] text-slate-500 mb-3">
        Live from <code className="text-cyan-glow">GET /v11/constitution</code>
        {state.source ? <> · {state.source}</> : null}
        {state.canonicalSource ? <> · derived from <code className="text-cyan-glow">{state.canonicalSource}</code>, the one constitution</> : null}
        {state.hash ? <> · sha256 <code className="text-cyan-glow">{state.hash.slice(0, 12)}…</code></> : null}
      </p>
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
