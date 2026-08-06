import { useState } from 'react';
import { completedPhases, federation, supersedes } from '../../data/roadmapData';
import { useHiveData } from '../../hooks/useHiveData';
import type { RoadmapCard } from '../../hooks/useHiveData';

const STATUS_STYLE: Record<string, string> = {
  done: 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10',
  active: 'border-cyan-glow/40 text-cyan-glow bg-cyan-glow/10',
  blocked: 'border-red-400/40 text-red-300 bg-red-400/10',
  decision: 'border-violet-bright/40 text-violet-bright bg-violet-bright/10',
  backlog: 'border-white/15 text-slate-400 bg-white/5',
};

function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span className={`shrink-0 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLE[status] ?? STATUS_STYLE.backlog}`}>
      {label}
    </span>
  );
}

function Card({ card }: { card: RoadmapCard }) {
  return (
    <div className="rounded-lg border border-white/10 bg-void-800/60 p-3.5 space-y-1.5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm text-slate-100 font-medium leading-snug">{card.title}</h4>
        <StatusPill status={card.status} label={card.statusLabel} />
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{card.body}</p>
    </div>
  );
}

function StatTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-void-800/60 px-3 py-2.5 text-center">
      <div className={`font-display text-2xl ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-white/10">
      <h3 className="text-gold font-display text-[13px] tracking-wide">{title}</h3>
      <span className="text-[11px] text-slate-500">{sub}</span>
    </div>
  );
}

export default function RoadmapPanel() {
  const [openPhase, setOpenPhase] = useState<number | null>(0);
  const hive = useHiveData();
  const dev = hive.developmentRoadmap;
  const phasesDone = completedPhases.length;
  const arcsActive = dev?.inProgress.length ?? 0;
  const backlogItems = dev?.snapshot.backlogItems ?? 0;
  const decisions = dev?.snapshot.decisions ?? 0;

  return (
    <div className="max-w-2xl space-y-8">
      <p className="text-slate-400 text-sm leading-relaxed">
        Founder actions, decisions, in-progress work, and backlog below are live —
        pulled from <code className="text-cyan-glow">GET /v11/roadmap/development</code>{' '}
        every 30s, never a hand-maintained file that can drift out of date.
        {' '}
        <span style={{ color: hive.online ? '#00e888' : '#ff6b6b' }}>
          {hive.online ? '● live' : hive.loading ? '○ connecting…' : '○ offline (showing last known / none)'}
        </span>
        {' '}Completed history and the federation table below remain a static,
        append-only record of what already shipped.
      </p>

      <div className="grid grid-cols-4 gap-2">
        <StatTile value={phasesDone} label="Phases shipped" color="text-emerald-300" />
        <StatTile value={arcsActive} label="Arcs in progress" color="text-cyan-glow" />
        <StatTile value={backlogItems} label="Backlog items" color="text-slate-300" />
        <StatTile value={decisions} label="Founder decisions" color="text-violet-bright" />
      </div>

      <section>
        <SectionHead title="Founder actions" sub="only you can do these — derived live from real binding presence" />
        <div className="space-y-2">
          {dev?.founderActions.length
            ? dev.founderActions.map((c) => <Card key={c.title} card={c} />)
            : <p className="text-xs text-slate-500">{hive.loading ? 'loading…' : 'unavailable — edge unreachable'}</p>}
        </div>
      </section>

      <section>
        <SectionHead title="Decisions pending" sub="your call, not a task" />
        <div className="space-y-2">
          {dev?.decisionsPending.length
            ? dev.decisionsPending.map((c) => <Card key={c.title} card={c} />)
            : <p className="text-xs text-slate-500">{hive.loading ? 'loading…' : 'none open right now'}</p>}
        </div>
      </section>

      <section>
        <SectionHead title="In progress" sub="running now, unattended" />
        <div className="space-y-2">
          {dev?.inProgress.length
            ? dev.inProgress.map((c) => <Card key={c.title} card={c} />)
            : <p className="text-xs text-slate-500">{hive.loading ? 'loading…' : 'nothing in progress right now'}</p>}
        </div>
      </section>

      <section>
        <SectionHead title="Completed" sub="verified against the live repo" />
        <div className="space-y-1.5">
          {completedPhases.map((phase, i) => {
            const open = openPhase === i;
            return (
              <div key={phase.title} className="rounded-lg border border-white/10 bg-void-800/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenPhase(open ? null : i)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left"
                >
                  <span
                    className="text-slate-500 text-[10px] transition-transform"
                    style={{ transform: open ? 'rotate(90deg)' : 'none' }}
                    aria-hidden="true"
                  >
                    &#9656;
                  </span>
                  <span className="text-sm text-slate-100 font-medium flex-1">{phase.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{phase.span}</span>
                </button>
                {open && (
                  <ul className="px-3.5 pb-3.5 pl-9 space-y-1.5 list-disc marker:text-slate-600">
                    {phase.items.map((item) => (
                      <li key={item} className="text-xs text-slate-400 leading-relaxed">{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead title="Backlog" sub="confirmed not built, not just unfinished" />
        <div className="space-y-2">
          {dev?.backlog.length
            ? dev.backlog.map((c) => <Card key={c.title} card={c} />)
            : <p className="text-xs text-slate-500">{hive.loading ? 'loading…' : 'backlog empty'}</p>}
        </div>
      </section>

      <section>
        <SectionHead title="Federation snapshot" sub="10 repos, 7 active colonies" />
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-void-800/80">
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-500 px-3 py-2 whitespace-nowrap">Colony</th>
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-500 px-3 py-2 whitespace-nowrap">Role</th>
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-500 px-3 py-2 whitespace-nowrap">Language</th>
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-500 px-3 py-2 whitespace-nowrap">HMAC</th>
                <th className="text-left font-mono text-[9px] uppercase tracking-widest text-slate-500 px-3 py-2 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {federation.map((row) => (
                <tr key={row.colony} className="border-t border-white/10">
                  <td className="px-3 py-2 font-mono font-semibold text-slate-100 whitespace-nowrap">{row.colony}</td>
                  <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{row.role}</td>
                  <td className="px-3 py-2 text-slate-400 whitespace-nowrap">{row.lang}</td>
                  <td className="px-3 py-2 text-emerald-400">{row.hmac ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-400/40 text-emerald-300 bg-emerald-400/10">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pt-4 border-t border-white/10 text-[11px] text-slate-500 font-mono leading-relaxed">
        Supersedes: {supersedes.join(' · ')} — all four are historical only now.
      </footer>
    </div>
  );
}
