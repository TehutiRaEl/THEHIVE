import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconTrophy as Trophy, IconMedal as Medal, IconStar as Star, IconCheck as Check, IconSparkles as Sparkles } from "nucleo-sharp";

interface AchievementToastProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon?: 'trophy' | 'medal' | 'star' | 'check';
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    points?: number;
  };
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const rarityColors = {
  common: {
    bg: 'from-slate-700 to-slate-800',
    border: 'slate-500',
    text: 'text-slate-200',
    glow: 'slate-500',
  },
  rare: {
    bg: 'from-blue-700 to-blue-900',
    border: 'blue-500',
    text: 'text-blue-100',
    glow: 'blue-500',
  },
  epic: {
    bg: 'from-purple-700 to-purple-900',
    border: 'purple-500',
    text: 'text-purple-100',
    glow: 'purple-500',
  },
  legendary: {
    bg: 'from-orange-600 to-red-700',
    border: 'orange-500',
    text: 'text-orange-100',
    glow: 'orange-500',
  },
};

const iconComponents = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  check: Check,
};

const positionClasses = {
  'top-left': 'top-6 left-6',
  'top-right': 'top-6 right-6',
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
};

export default function AchievementToast({
  achievement,
  position = 'top-right',
  onDismiss,
  autoDismiss = true,
  duration = 4000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const rarity = achievement.rarity || 'common';
  const colors = rarityColors[rarity];
  const Icon = iconComponents[achievement.icon || 'star'] || Sparkles;

  useEffect(() => {
    setIsVisible(true);
    
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [achievement.id, autoDismiss, duration, onDismiss]);

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isVisible, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className={`fixed z-50 w-72 ${positionClasses[position]}`}
        >
          <div className={`relative rounded-xl bg-gradient-to-br ${colors.bg} border border-${colors.border}/50 shadow-2xl shadow-${colors.glow}/20 overflow-hidden`}
          >
            <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br from-${colors.glow}/20 to-transparent`} />

            <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/20">
              <motion.div
                className={`h-full bg-${colors.glow}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-${colors.glow}/30 to-${colors.glow}/10`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 400 }}
                >
                  <Icon className="h-6 w-6" style={{ color: colors.glow }} />
                </motion.div>

                <div className="flex-1">
                  <motion.h4
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-bold text-sm ${colors.text}`}
                    style={{ fontFamily: 'Cinzel, sans-serif' }}
                  >
                    {achievement.title}
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-xs ${colors.text}/80 mt-1`}
                    style={{ fontFamily: 'Exo 2, sans-serif' }}
                  >
                    {achievement.description}
                  </motion.p>
                </div>

                {achievement.points !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-${colors.glow}/20`}
                  >
                    <Star className="h-3.5 w-3.5" style={{ color: colors.glow }} />
                    <span className={`text-xs font-medium ${colors.text}`}>
                      +{achievement.points}
                    </span>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVisible(false)}
                  className="p-1.5 rounded-lg hover:bg-black/20 transition-colors"
                >
                  <XIcon className="h-4 w-4 text-white/70" />
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center gap-2"
              >
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-${colors.glow}/20 ${colors.text}`}>
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}