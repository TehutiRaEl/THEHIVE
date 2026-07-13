import React from 'react';
import { motion } from 'framer-motion';
import { Mission } from '../../types/mission';

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
}

export default function MissionCard({ mission, onClick }: MissionCardProps) {
  const typeIcons: Record<string, string> = {
    combat: '⚔️',
    exploration: '🔍',
    crafting: '🛠️',
    social: '👥',
    story: '📖',
  };

  const typeColors: Record<string, string> = {
    combat: 'from-red-500 to-rose-500',
    exploration: 'from-orange-500 to-yellow-500',
    crafting: 'from-emerald-500 to-teal-500',
    social: 'from-blue-500 to-indigo-500',
    story: 'from-purple-500 to-pink-500',
  };

  const difficultyColors: Record<string, string> = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-orange-500/20 text-orange-400',
    hard: 'bg-red-500/20 text-red-400',
    epic: 'bg-purple-500/20 text-purple-400',
  };

  const icon = typeIcons[mission.type] || '❓';
  const color = typeColors[mission.type] || 'from-slate-500 to-slate-400';
  const difficulty = difficultyColors[mission.difficulty] || 'bg-slate-500/20 text-slate-400';

  const gradientStyle = {
    background: 'linear-gradient(135deg, ' + color.replace('from-', '').replace(' to-', ', ') + ')',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-600/50 bg-slate-800/50 p-4 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={gradientStyle}
            >
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cinzel">{mission.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={'px-2 py-0.5 rounded-full text-xs font-medium ' + difficulty}>
                  {mission.difficulty.toUpperCase()}
                </span>
                {mission.isCompleted && (
                  <span className="text-xs text-emerald-400">✓ Completed</span>
                )}
                {mission.isActive && !mission.isCompleted && (
                  <span className="text-xs text-orange-400">▶ Active</span>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-2 mb-3 font-exo">
            {mission.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>{mission.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span>{mission.participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span className="text-yellow-400">{mission.reward}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
