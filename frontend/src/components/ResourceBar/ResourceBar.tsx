import React from 'react';
import { motion } from 'framer-motion';

interface ResourceAmounts {
  [key: string]: number;
}

interface ResourceBarProps {
  resources: ResourceAmounts;
}

export default function ResourceBar({ resources }: ResourceBarProps) {
  const resourceOrder = ['energy', 'minerals', 'food', 'knowledge', 'influence'];
  const resourceColors: Record<string, string> = {
    energy: 'from-purple-500 to-pink-500',
    minerals: 'from-orange-500 to-yellow-500',
    food: 'from-emerald-500 to-teal-500',
    knowledge: 'from-blue-500 to-cyan-500',
    influence: 'from-rose-500 to-pink-500',
  };

  const resourceIcons: Record<string, string> = {
    energy: '⚡',
    minerals: '⛏️',
    food: '🍎',
    knowledge: '🧠',
    influence: '👑',
  };

  const totalResources = Object.values(resources).reduce((sum, val) => sum + val, 0);

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-600/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white font-cinzel">Resources</h3>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Total:</span>
          <span className="text-xl font-bold text-purple-300">{totalResources.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {resourceOrder.map((key) => {
          const amount = resources[key] || 0;
          const percentage = (amount / totalResources) * 100;
          const color = resourceColors[key] || 'from-slate-500 to-slate-400';
          const icon = resourceIcons[key] || '💎';

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * resourceOrder.indexOf(key) }}
              className="rounded-xl bg-slate-700/50 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <span className="text-sm font-medium text-white capitalize">{key}</span>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-purple-300">{amount.toLocaleString()}</p>
                <div className="w-full h-1.5 bg-slate-600 rounded-full overflow-hidden">
                  <motion.div
                    className={'h-full bg-gradient-to-r ' + color}
                    initial={{ width: 0 }}
                    animate={{ width: percentage + '%' }}
                    transition={{ duration: 1, delay: 0.2 * resourceOrder.indexOf(key) }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
