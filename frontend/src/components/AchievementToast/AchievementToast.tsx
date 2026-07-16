import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function AchievementToast({
  achievement,
  position = 'top-right',
  onDismiss,
  autoDismiss = true,
  duration = 4000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    common: { bg: 'from-slate-700 to-slate-800', border: '#64748b', text: '#cbd5e1', glow: 'rgba(100, 116, 139, 0.3)' },
    rare: { bg: 'from-blue-700 to-blue-900', border: '#3b82f6', text: '#93c5fd', glow: 'rgba(59, 130, 246, 0.3)' },
    epic: { bg: 'from-purple-700 to-purple-900', border: '#a855f7', text: '#c4b5fd', glow: 'rgba(168, 85, 247, 0.3)' },
    legendary: { bg: 'from-orange-600 to-red-700', border: '#f97316', text: '#fbbf24', glow: 'rgba(249, 115, 22, 0.3)' },
  };

  const iconMap: Record<string, string> = {
    trophy: '🏆',
    medal: '🥇',
    star: '⭐',
    check: '✓',
  };

  const positionClasses: Record<string, string> = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const rarity = achievement.rarity || 'common';
  const colors = rarityColors[rarity];
  const icon = iconMap[achievement.icon || 'star'] || '✨';

  const bgGradient = 'linear-gradient(135deg, ' + colors.bg.replace('from-', '').replace(' to-', ', ') + ')';

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
          className={'fixed z-50 w-72 ' + positionClasses[position]}
        >
          <div
            className="relative rounded-xl overflow-hidden"
            style={{
              background: bgGradient,
              border: '1px solid ' + colors.border + '80',
              boxShadow: '0 10px 30px ' + colors.glow,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom right, ' + colors.glow + ', transparent)' }}
            />

            <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/20">
              <motion.div
                className="h-full"
                style={{ background: colors.border }}
                initial={{ width: 0 }}
                animate={{ width: progress + '%' }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  className="flex w-10 h-10 items-center justify-center rounded-lg"
                  style={{ background: 'rgba(' + colors.border + ', 0.2)' }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 400 }}
                >
                  <span className="text-xl" style={{ color: colors.border }}>{icon}</span>
                </motion.div>

                <div className="flex-1">
                  <motion.h4
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-bold text-sm"
                    style={{ color: colors.text, fontFamily: 'Cinzel, sans-serif' }}
                  >
                    {achievement.title}
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs mt-1"
                    style={{ color: colors.text + '80', fontFamily: 'Exo 2, sans-serif' }}
                  >
                    {achievement.description}
                  </motion.p>
                </div>

                {achievement.points !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(' + colors.border + ', 0.2)' }}
                  >
                    <span className="text-lg" style={{ color: colors.border }}>⭐</span>
                    <span className="text-xs font-medium" style={{ color: colors.text }}>
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
                  <span className="text-lg text-white/70">×</span>
                </motion.button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 flex items-center gap-2"
              >
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(' + colors.border + ', 0.2)', color: colors.text }}
                >
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
