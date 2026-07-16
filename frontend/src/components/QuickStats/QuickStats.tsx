import { motion } from 'framer-motion';

interface Stat {
  value: number;
  label: string;
  trend?: string;
  icon?: string;
}

interface QuickStatsProps {
  stats: Record<string, Stat>;
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const statEntries = Object.entries(stats);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statEntries.map(([key, stat]) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * Object.keys(stats).indexOf(key) }}
          className="rounded-xl bg-slate-800/50 border border-slate-600/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white text-lg">{stat.icon || '📊'}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-cinzel">{stat.value.toLocaleString()}</p>
              <p className="text-sm text-slate-400 font-exo">{stat.label}</p>
            </div>
          </div>
          {stat.trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                {stat.trend}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
