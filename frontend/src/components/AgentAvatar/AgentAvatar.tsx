import React from 'react';
import { motion } from 'framer-motion';

interface AgentAvatarProps {
  agent: {
    id: string;
    name: string;
    role: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    avatar?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export default function AgentAvatar({ agent, size = 'medium', showDetails = false }: AgentAvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg',
  };

  const roleColors: Record<string, string> = {
    Commander: 'from-purple-500 to-pink-500',
    Scientist: 'from-blue-500 to-cyan-500',
    Engineer: 'from-orange-500 to-yellow-500',
    Soldier: 'from-red-500 to-rose-500',
    Diplomat: 'from-emerald-500 to-teal-500',
    Scout: 'from-sky-500 to-indigo-500',
  };

  const color = roleColors[agent.role] || 'from-slate-500 to-slate-400';
  const xpPercentage = Math.min((agent.xp / agent.xpToNextLevel) * 100, 100);

  const gradientStyle = {
    background: 'linear-gradient(135deg, ' + color.replace('from-', '').replace(' to-', ', ') + ')',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={'rounded-full flex items-center justify-center ' + sizeClasses[size] + (showDetails ? ' mb-1' : '')}
        style={gradientStyle}
      >
        <span className="text-white">{agent.avatar || agent.name.charAt(0).toUpperCase()}</span>
      </div>

      {showDetails && (
        <div className="text-center">
          <p className="text-white font-medium text-sm font-cinzel">{agent.name}</p>
          <p className="text-slate-400 text-xs font-exo">{agent.role}</p>
          <div className="mt-1">
            <div className="w-full h-1 bg-slate-700 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: xpPercentage + '%' }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Lvl {agent.level} ({agent.xp}/{agent.xpToNextLevel} XP)
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
