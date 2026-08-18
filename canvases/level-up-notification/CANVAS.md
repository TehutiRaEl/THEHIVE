---
name: "level-up-notification"
title: "Level Up Notification Component"
type: "react"
---

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowUp as ArrowUp, IconStar as Star, IconSparkles as Sparkles, IconCrown as Crown } from "nucleo-sharp";

interface LevelUpNotificationProps {
  level: number;
  title?: string;
  message?: string;
  rewards?: string[];
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

export default function LevelUpNotification({ level, title = 'Level Up!', message = 'You have reached a new level!', rewards = [], onDismiss, autoDismiss = true, duration = 5000 }: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    if (autoDismiss) {
      const timer = setTimeout(() => { setIsVisible(false); onDismiss?.(); }, duration);
      return () => clearTimeout(timer);
    }
  }, [level, autoDismiss, duration, onDismiss]);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (duration / 100)), 100));
    }, 100);
    return () => clearInterval(interval);
  }, [isVisible, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed bottom-6 right-6 z-50 w-80"
        >
          <div className="relative rounded-2xl bg-gradient-to-br from-purple-900/90 via-purple-800/80 to-slate-900/90 border border-purple-500/50 shadow-2xl shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <motion.div
                animate={['radial-gradient(circle at 20% 80%, #9333ea 0%, transparent 50%)', 'radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 50%)', 'radial-gradient(circle at 40% 60%, #9333ea 0%, transparent 50%)']}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0"
              />
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
              <motion.div className="h-full bg-gradient-to-r from-purple-400 to-orange-400" initial={{ width: 0 }} animate={{ width: progress + '%' }} transition={{ duration: 0.1 }} />
            </div>
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-orange-500"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 10, stiffness: 400 }}
                  >
                    <Crown className="h-7 w-7 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-purple-200">Level {level}</motion.p>
                  </div>
                </div>
                <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsVisible(false)} className="p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                  <X className="h-5 w-5 text-white" />
                </motion.button>
              </div>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-200">{message}</motion.p>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 py-3">
                <ArrowUp className="h-8 w-8 text-purple-400" />
                <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">{level}</span>
                <Sparkles className="h-6 w-6 text-orange-400" />
              </motion.div>
              {rewards.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-400 mb-2">Rewards Unlocked:</p>
                  <div className="flex flex-wrap gap-2">
                    {rewards.map((reward, index) => (
                      <motion.span key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="px-3 py-1 rounded-lg bg-white/10 text-sm text-white">
                        {reward}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute -bottom-4 -right-4">
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i} animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} className="absolute" style={{ right: i * 12 }}>
                    <Star className="h-4 w-4 text-orange-400" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function X({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>;
}
