import React from "react";
import { motion } from "framer-motion";
import { IconX as X, IconSword as Sword, IconShield as Shield, IconStar as Star, IconClock as Clock, IconUsers as Users, IconMap as Map, IconCoins as Coins } from "nucleo-sharp";

interface MissionDetailsProps {
  mission: {
    id: string;
    title: string;
    description: string;
    type: 'combat' | 'exploration' | 'crafting' | 'social' | 'story';
    difficulty: 'easy' | 'medium' | 'hard' | 'epic';
    reward: string;
    duration: string;
    participants: number;
    location?: string;
    requirements?: string[];
    objectives?: string[];
    story?: string;
  };
  onClose?: () => void;
}

const typeIcons = {
  combat: Sword,
  exploration: Map,
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

const difficultyStars = {
  easy: 1,
  medium: 2,
  hard: 3,
  epic: 4,
};

export default function MissionDetails({ mission, onClose }: MissionDetailsProps) {
  const TypeIcon = typeIcons[mission.type] || Star;
  const typeColor = typeColors[mission.type] || '#9333ea';
  const stars = difficultyStars[mission.difficulty] || 2;

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
        className="w-full max-w-2xl rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-600/50 shadow-2xl shadow-purple-500/10 overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-6 border-b border-slate-600/50"
          style={{
            background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}11)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br"
              style={{
                background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
              }}
            >
              <TypeIcon className="h-7 w-7" style={{ color: typeColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                {mission.title}
              </h2>
              <p className="text-sm text-slate-300" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {mission.type.charAt(0).toUpperCase() + mission.type.slice(1)} Mission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <XIcon className="h-6 w-6 text-slate-300" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
              Mission Overview
            </h3>
            <p className="text-slate-300" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              {mission.description}
            </p>
          </div>

          {mission.story && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                Story
              </h3>
              <p className="text-slate-300 italic" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                {mission.story}
              </p>
            </div>
          )}

          {mission.objectives && mission.objectives.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                Objectives
              </h3>
              <div className="space-y-2">
                {mission.objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600/30"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-slate-300" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mission.requirements && mission.requirements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                Requirements
              </h3>
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
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm">Duration: {mission.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm">Participants: {mission.participants}</span>
            </div>
            {mission.location && (
              <div className="flex items-center gap-2 text-slate-300 col-span-2">
                <Map className="h-4 w-4 text-slate-400" />
                <span className="text-sm">Location: {mission.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-300 col-span-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Reward: {mission.reward}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-600/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Difficulty</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= stars ? 'text-yellow-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}