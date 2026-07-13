import React from 'react';
import { motion } from 'framer-motion';
import MissionCard from '../MissionCard/MissionCard';
import { Mission } from '../../types/mission';

interface MissionBoardProps {
  missions: Mission[];
  onMissionSelect?: (mission: Mission) => void;
  showAll?: boolean;
}

export default function MissionBoard({ missions, onMissionSelect, showAll = false }: MissionBoardProps) {
  const displayedMissions = showAll ? missions : missions.slice(0, 4);

  if (displayedMissions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-xl">🎯 No missions available</p>
        <p className="text-sm mt-2">Check back later for new assignments</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-600/50 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-white font-cinzel">Mission Board</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Active:</span>
          <span className="text-lg font-bold text-purple-300">{missions.filter(m => m.isActive).length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedMissions.map((mission, index) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MissionCard
              mission={mission}
              onClick={() => onMissionSelect && onMissionSelect(mission)}
            />
          </motion.div>
        ))}
      </div>

      {!showAll && missions.length > 4 && (
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/50 transition-colors"
          >
            View All {missions.length} Missions
          </motion.button>
        </div>
      )}
    </div>
  );
}
