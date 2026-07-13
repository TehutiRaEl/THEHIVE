import React from "react";
import { motion } from "framer-motion";
import { IconSword as Sword, IconShield as Shield, IconStar as Star, IconClock as Clock, IconUsers as Users } from "nucleo-sharp";

interface MissionCardProps {
  mission: {
    id: string;
    title: string;
    description: string;
    type: 'combat' | 'exploration' | 'crafting' | 'social' | 'story';
    difficulty: 'easy' | 'medium' | 'hard' | 'epic';
    reward: string;
    duration: string;
    participants: number;
    isActive?: boolean;
    isCompleted?: boolean;
  };
  onClick?: () => void;
}

const typeIcons = {
  combat: Sword,
  exploration: Sword,
  crafting: Shield,
  social: Users,
  story: Star,
};

const typeColors = {
  combat: '#ef4444',
  exploration: '#f59e0b',
  crafting: '#10b981',
  social: '#8b5cf6',
  story: '#e879f9',
};

const difficultyColors = {
  easy: '#10b981',
  medium: '#f59e0b',
  hard: '#ef4444',
  epic: '#8b5cf6',
};

export default function MissionCard({ mission, onClick }: MissionCardProps) {
  const TypeIcon = typeIcons[mission.type] || Star;
  const typeColor = typeColors[mission.type] || '#9333ea';
  const difficultyColor = difficultyColors[mission.difficulty] || '#f59e0b';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border-2 bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-4 transition-all duration-300 ${
        mission.isCompleted
          ? 'border-emerald-400/50 opacity-60'
          : mission.isActive
          ? 'border-orange-400/80 shadow-lg shadow-orange-500/20'
          : 'border-slate-600/50 hover:border-slate-400/50'
      }`}
      style={{
        borderColor: mission.isActive ? typeColor : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br"
              style={{
                background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
              }}
            >
              <TypeIcon className="h-5 w-5" style={{ color: typeColor }} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                {mission.title}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: difficultyColor + '22',
                    color: difficultyColor,
                  }}
                >
                  {mission.difficulty.toUpperCase()}
                </span>
                {mission.isCompleted && (
                  <span className="text-xs text-emerald-400">✓ Completed</span>
                )}
                {mission.isActive && (
                  <span className="text-xs text-orange-400">▶ Active</span>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-300 line-clamp-2 mb-3" style={{ fontFamily: 'Exo 2, sans-serif' }}>
            {mission.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{mission.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{mission.participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-yellow-400">{mission.reward}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}