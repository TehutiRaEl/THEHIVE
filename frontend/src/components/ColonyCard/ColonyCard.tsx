import { motion } from 'framer-motion';
import type { RealColony } from '../../data/colonies';
import type { ColonyPingEntry } from '../../hooks/useColonyPing';
import './ColonyCard.css';

interface ColonyCardProps {
  colony: RealColony;
  /** This colony's entry from GET /v11/debug/colony-ping, or null if not yet loaded. */
  ping: ColonyPingEntry | null;
  /** When the ping response currently shown was actually fetched — null if never. */
  lastVerified: Date | null;
  pingLoading: boolean;
  pingError: string | null;
  onClick?: () => void;
}

const layerColors: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-amber-900/50', border: 'border-amber-500', text: 'text-amber-300' },
  3: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-300' },
  5: { bg: 'bg-red-900/50', border: 'border-red-500', text: 'text-red-300' },
  7: { bg: 'bg-cyan-900/50', border: 'border-cyan-500', text: 'text-cyan-300' },
};

function timeAgo(d: Date | null): string {
  if (!d) return 'never';
  const secs = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

export default function ColonyCard({ colony, ping, lastVerified, pingLoading, pingError, onClick }: ColonyCardProps) {
  const colors = layerColors[colony.layer] || layerColors[1];

  // colony-ping's own roster entries are 'checked-in-ci' today (the edge Worker
  // cannot reach colony origins directly — see the hook's comment). We surface
  // that string honestly rather than repainting it as "online"/"active".
  const statusLabel = pingError ? 'ping failed' : ping ? ping.reachable : pingLoading ? 'checking…' : 'unknown';
  const statusTone = pingError
    ? { bg: 'bg-red-500/20', text: 'text-red-400' }
    : ping
      ? { bg: 'bg-emerald-500/20', text: 'text-emerald-400' }
      : { bg: 'bg-slate-600/50', text: 'text-slate-400' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={'colony-card cursor-pointer rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5 transition-all duration-300 ' + colors.bg + ' ' + colors.border}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={'colony-icon w-10 h-10 rounded-xl flex items-center justify-center ' + colors.bg + ' ' + colors.border}>
              <span className={'text-xl ' + colors.text}>{colony.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cinzel">{colony.name}</h3>
              <a
                href={colony.repoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-slate-400 font-exo hover:text-slate-200 underline decoration-dotted"
              >
                {colony.repo}
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 mb-3 font-exo">
            {colony.description}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">🧩</span>
              <span className="text-slate-300">{colony.language}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">⭐</span>
              <span className="text-slate-300">Layer {colony.layer}</span>
            </div>
          </div>
        </div>

        <div className={'px-3 py-1 rounded-full text-xs font-medium ' + statusTone.bg + ' ' + statusTone.text}>
          {statusLabel}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">Role</p>
            <p className="text-sm font-medium text-purple-300">{colony.role}</p>
          </div>
          {colony.guilds.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Guilds</p>
              <p className="text-sm font-medium text-slate-200">{colony.guilds.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Staleness indicator — named, decided requirement from this session's own
            dual-lens pass: rendering live colony data with no staleness indicator
            risks silently showing stale info if the manifest or the ping drifts. */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Last verified:</span>
          <span className={pingError ? 'text-red-400' : 'text-slate-300'} title={lastVerified ? lastVerified.toISOString() : undefined}>
            {timeAgo(lastVerified)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
