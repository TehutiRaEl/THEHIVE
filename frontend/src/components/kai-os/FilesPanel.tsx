import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../../utils/constants';

interface HiveFile {
  key: string;
  size: number;
  uploaded?: string;
}

interface FilesState {
  loading: boolean;
  available: boolean;
  files: HiveFile[];
  error?: string;
}

const V11 = `${API_BASE_URL}/v11`;

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// The real Files surface: lists and uploads against the Worker's R2-backed
// /v11/files endpoints. When the bucket isn't provisioned yet it says so
// honestly — with the exact flip-the-switch steps — instead of a fake listing.
export default function FilesPanel() {
  const [state, setState] = useState<FilesState>({ loading: true, available: false, files: [] });
  const [busy, setBusy] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${V11}/files`, { signal: AbortSignal.timeout(8000) });
      const d = await r.json();
      setState({ loading: false, available: !!d.available, files: d.files ?? [], error: d.error });
    } catch {
      setState({ loading: false, available: false, files: [], error: 'hive unreachable' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = async (file: File) => {
    setBusy(`Uploading ${file.name}…`);
    try {
      const tok = await fetch(`${V11}/auth/token`).then((r) => r.json()).catch(() => null);
      const r = await fetch(`${V11}/files/upload?key=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'content-type': file.type || 'application/octet-stream',
          ...(tok?.access_token ? { Authorization: `Bearer ${tok.access_token}` } : {}),
        },
        body: file,
      });
      const d = await r.json().catch(() => ({}));
      setBusy(r.ok && d.ok ? null : `Upload failed: ${d.detail || d.error || r.status}`);
      if (r.ok && d.ok) await load();
    } catch (e) {
      setBusy(`Upload failed: ${String(e)}`);
    }
  };

  if (state.loading) return <p className="text-slate-500 text-sm">Reading the file store…</p>;

  if (!state.available) {
    return (
      <div className="max-w-lg space-y-3">
        <p className="text-slate-400 text-sm leading-relaxed">
          The Files store is built but <span className="text-amber-300">not yet provisioned</span> —
          the upload/list code is live in the Worker, waiting on its R2 bucket. No fake listing is
          shown on purpose.
        </p>
        <div className="rounded-lg border border-amber-400/20 bg-void-800/60 p-3 text-xs text-slate-400 space-y-1">
          <div className="text-amber-300/90 uppercase tracking-widest text-[10px] mb-1">Founder — flip the switch (one time)</div>
          <div><code className="text-cyan-glow">npx wrangler r2 bucket create hive-files</code></div>
          <div>then uncomment the <code className="text-cyan-glow">r2_buckets</code> block in <code className="text-cyan-glow">wrangler.jsonc</code> and push — this panel goes live on the next deploy.</div>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">
          Repo-side sources (PDFs, clippings, research) still live in
          <code className="mx-1 text-cyan-glow">Project_file/Founders Visonary Folder/SOURCES/</code>
          and are routed through <code className="text-cyan-glow">research-to-dna</code> before becoming hive knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-yale/40 border border-cyan-glow/40 text-cyan-neon text-sm shadow-neon-cyan hover:bg-yale/60"
        >
          ⬆ Upload file
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
        />
        {busy && <span className="text-xs text-amber-300">{busy}</span>}
        <button onClick={load} className="ml-auto text-xs text-slate-500 hover:text-cyan-glow">↻ refresh</button>
      </div>

      {state.files.length === 0 ? (
        <p className="text-slate-500 text-sm">The store is live and empty — upload the first file.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {state.files.map((f) => (
            <a
              key={f.key}
              href={`${V11}/files/get?key=${encodeURIComponent(f.key)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-white/10 bg-void-800/60 px-3 py-2 hover:border-cyan-glow/50"
            >
              <span className="text-base">📄</span>
              <span className="text-sm text-slate-200 group-hover:text-cyan-glow truncate">{f.key}</span>
              <span className="ml-auto text-[11px] text-slate-500 shrink-0">{fmtSize(f.size)}</span>
            </a>
          ))}
        </div>
      )}

      <p className="text-slate-600 text-xs leading-relaxed">
        Uploads are visitor-token gated and capped at 10 MB. Repo-side sources still flow through
        <code className="mx-1 text-cyan-glow">SOURCES/</code> + <code className="text-cyan-glow">research-to-dna</code>.
      </p>
    </div>
  );
}
