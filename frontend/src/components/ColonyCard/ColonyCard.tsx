import React from 'react';
import { motion } from 'framer-motion';
import { Colony } from '../../types/colony';

interface ColonyCardProps {
  colony: Colony;
  onClick?: () => void;
}

export default function ColonyCard({ colony, onClick }: ColonyCardProps) {
  const tierColors = {
    1: { bg: 'bg-slate-700', border: 'border-slate-500', text: 'text-slate-300' },
    2: { bg: 'bg-blue-900/50', border: 'border-blue-500', text: 'text-blue-300' },
    3: { bg: 'bg-green-900/50', border: 'border-green-500', text: 'text-green-300' },
    4: { bg: 'bg-purple-900/50', border: 'border-purple-500', text: 'text-purple-300' },
    5: { bg: 'bg-orange-900/50', border: 'border-orange-500', text: 'text-orange-300' },
  };

  const statusColors = {
    active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Active' },
    developing: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Developing' },
    struggling: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Struggling' },
    abandoned: { bg: 'bg-slate-600/50', text: 'text-slate-400', label: 'Abandoned' },
  };

  const colors = tierColors[colony.tier] || tierColors[1];
  const status = statusColors[colony.status] || statusColors.active;

  const totalResources = Object.values(colony.resources).reduce((sum, val) => sum + (val || 0), 0);
  const resourcePercentage = Math.min((totalResources / 30000) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={'cursor-pointer rounded-2xl border border-slate-600/50 bg-slate-800/50 p-5 transition-all duration-300 ' + colors.bg + ' ' + colors.border}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + colors.bg + ' ' + colors.border}>
              <span className={'text-xl ' + colors.text}>🏙️</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-cinzel">{colony.name}</h3>
              <p className="text-xs text-slate-400 font-exo">{colony.location}</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-300 line-clamp-2 mb-3 font-exo">
            {colony.description}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">👥</span>
              <span className="text-slate-300">{colony.population.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">⭐</span>
              <span className="text-slate-300">Tier {colony.tier}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">👑</span>
              <span className="text-slate-300">{colony.leader}</span>
            </div>
          </div>
        </div>

        <div className={'px-3 py-1 rounded-full text-xs font-medium ' + status.bg + ' ' + status.text}>
          {status.label}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-600/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">Specialization</p>
            <p className="text-sm font-medium text-purple-300">{colony.specialization}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Founded</p>
            <p className="text-sm font-medium text-slate-200">{colony.founded}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Resources:</span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: resourcePercentage + '%' }}
                transition={{ duration: 1 }}
              />
            </div>
            <span className="text-slate-300">{totalResources.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
