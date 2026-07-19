import { motion } from 'framer-motion';
import type { RoadmapEntry } from '../../hooks/useHiveData';

// Adapted from the orphaned feature/gamified-ui-components branch's
// AgentAvatar.tsx (Mistral's own real, unmerged work — never wired into the
// live app). That original drove itself off a fictional level/xp/role model;
// this version keeps its visual polish (the animated fill, the avatar disc)
// but is reskinned to consume the hive's real per-agent roadmap data
// (F-008D/F-009E stage + live soul score) instead.
interface RoadmapAvatarProps {
  entry: RoadmapEntry;
  size?: 'small' | 'medium' | 'large';
  emphasize?: boolean;
}

const STAGE_GRADIENT: Record<string, string> = {
  Germination: 'linear-gradient(135deg, #22c55e, #84cc16)',
  Mycelium: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  Fruiting: 'linear-gradient(135deg, #eab308, #f59e0b)',
  Transformation: 'linear-gradient(135deg, #a855f7, #ec4899)',
  Senescence: 'linear-gradient(135deg, #ef4444, #f43f5e)',
  Seed: 'linear-gradient(135deg, #8b5cf6, #00e5ff)',
};

const SIZE_PX = { small: 30, medium: 42, large: 56 };

export default function RoadmapAvatar({ entry, size = 'medium', emphasize = false }: RoadmapAvatarProps) {
  const px = SIZE_PX[size];
  const gradient = STAGE_GRADIENT[entry.stage] ?? 'linear-gradient(135deg, #64748b, #94a3b8)';

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-3 ${emphasize ? 'p-2.5 rounded-lg border border-violet-bright/30' : ''}`}
    >
      <div
        className="rounded-full grid place-items-center shrink-0 text-white font-display font-semibold relative"
        style={{ width: px, height: px, fontSize: px * 0.4, background: gradient, boxShadow: '0 0 14px rgba(139,92,246,0.35)' }}
      >
        {entry.agent.charAt(0).toUpperCase()}
        <span
          className="absolute -bottom-1 -right-1 rounded-full bg-void-900 border border-white/20 text-white grid place-items-center font-display"
          style={{ width: px * 0.42, height: px * 0.42, fontSize: px * 0.19 }}
          title={`Level ${entry.level} — same real data as the stage name, just the game-framing view`}
        >
          {entry.level}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <strong className="text-cyan-glow truncate text-sm">{entry.agent}</strong>
          <span className="text-[11px] text-slate-400 whitespace-nowrap">Lvl {entry.level} · {entry.stage} → {entry.nextStage}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: gradient }}
            initial={{ width: 0 }}
            animate={{ width: `${entry.progressPct}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          {entry.xp.toFixed(1)} / {entry.xpToNextLevel.toFixed(1)} XP ({entry.soul.toFixed(1)} Ψ) · {entry.progressPct}%
          {entry.soulToNext > 0 ? ` · ${entry.soulToNext.toFixed(1)} to next level` : ''}
        </div>
      </div>
    </motion.div>
  );
}
