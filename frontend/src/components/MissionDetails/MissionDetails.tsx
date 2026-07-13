import React from 'react';
import { motion } from 'framer-motion';
import { Mission } from '../../types/mission';

interface MissionDetailsProps {
  mission: Mission;
  onClose?: () => void;
}

export default function MissionDetails({ mission, onClose }: MissionDetailsProps) {
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

  const difficultyStars: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
    epic: 4,
  };

  const icon = typeIcons[mission.type] || '❓';
  const color = typeColors[mission.type] || 'from-slate-500 to-slate-400';
  const stars = difficultyStars[mission.difficulty] || 2;

  const gradientStyle = {
    background: 'linear-gradient(135deg, ' + color.replace('from-', '').replace(' to-', ', ') + ')',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl rounded-2xl bg-slate-800/90 border border-slate-600/50 shadow-2xl shadow-purple-500/10 overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-6 border-b border-slate-600/50"
          style={gradientStyle}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={gradientStyle}
            >
              <span className="text-2xl">{icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-cinzel">{mission.title}</h2>
              <p className="text-sm text-slate-200 font-exo">
                {mission.type.charAt(0).toUpperCase() + mission.type.slice(1)} Mission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-white"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white font-cinzel">Mission Overview</h3>
            <p className="text-slate-300 font-exo">{mission.description}</p>
          </div>

          {mission.story && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white font-cinzel">Story</h3>
              <p className="text-slate-300 italic font-exo">{mission.story}</p>
            </div>
          )}

          {mission.objectives && mission.objectives.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-cinzel">Objectives</h3>
              <div className="space-y-2">
                {mission.objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-slate-300 font-exo">{objective}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mission.requirements && mission.requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white font-cinzel">Requirements</h3>
              <div className="flex flex-wrap gap-2">
                {mission.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600/30 text-sm text-slate-200"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600/50">
            <div className="flex items-center gap-2 text-slate-300">
              <span>⏱️</span>
              <span className="text-sm">Duration: {mission.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span>👥</span>
              <span className="text-sm">Participants: {mission.participants}</span>
            </div>
            {mission.location && (
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <span>📍</span>
                <span className="text-sm">Location: {mission.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-300 col-span-2">
              <span>💰</span>
              <span className="text-sm text-yellow-400">Reward: {mission.reward}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-600/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Difficulty</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <span
                    key={star}
                    className={'text-xl ' + (star <= stars ? 'text-yellow-400' : 'text-slate-600')}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
