import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ColonyCard from '../ColonyCard/ColonyCard';
import QuickStats from '../QuickStats/QuickStats';
import ResourceBar from '../ResourceBar/ResourceBar';
import MissionBoard from '../MissionBoard/MissionBoard';
import ConstitutionHall from '../ConstitutionHall/ConstitutionHall';
import TesseractChamber from '../TesseractChamber/TesseractChamber';
import MemoryVault from '../MemoryVault/MemoryVault';
import AgentAvatar from '../AgentAvatar/AgentAvatar';
import { colonies } from '../../data/colonies';
import { missions } from '../../data/missions';
import { memories } from '../../data/memories';
import { constitution } from '../../data/constitution';
import { Colony, Mission, Memory, Law } from '../../types';

export default function HiveDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'colonies' | 'missions' | 'memory' | 'constitution' | 'tesseract'>('overview');
  const [selectedColony, setSelectedColony] = useState<Colony | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'colonies', label: 'Colonies', icon: '🌍' },
    { id: 'missions', label: 'Missions', icon: '⚔️' },
    { id: 'memory', label: 'Memory Vault', icon: '🧠' },
    { id: 'constitution', label: 'Constitution', icon: '📜' },
    { id: 'tesseract', label: 'Tesseract', icon: '🔮' },
  ];

  const totalResources = {
    energy: 45000,
    minerals: 32000,
    food: 58000,
    knowledge: 72000,
    influence: 48000,
  };

  return (
    <div className="min-h-screen p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-cinzel">
              THE HIVE
            </h1>
            <p className="text-slate-400 font-exo">Command & Control Interface</p>
          </div>
          <div className="flex items-center gap-4">
            <AgentAvatar
              agent={{ id: 'cmdr-1', name: 'Commander', role: 'Commander', level: 45, xp: 8500, xpToNextLevel: 10000 }}
              size="medium"
            />
            <div className="text-right">
              <p className="text-white font-medium font-cinzel">Commander Ra</p>
              <p className="text-sm text-slate-400 font-exo">Level 45</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-6"
      >
        <ResourceBar resources={totalResources} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-6"
      >
        <QuickStats
          stats={{
            colonies: { value: colonies.length, label: 'Colonies', trend: '+2' },
            missions: { value: missions.filter(m => m.isActive).length, label: 'Active Missions', trend: '+3' },
            agents: { value: 156, label: 'Agents', trend: '+7' },
            memories: { value: memories.length, label: 'Memories', trend: '+12' },
          }}
        />
      </motion.div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={'px-6 py-3 rounded-xl font-medium transition-all font-exo ' + 
              (activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30')}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="min-h-[60vh]"
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-cinzel">Colonies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colonies.slice(0, 4).map((colony) => (
                    <ColonyCard
                      key={colony.id}
                      colony={colony}
                      onClick={() => setSelectedColony(colony)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4 font-cinzel">Active Missions</h2>
                <MissionBoard
                  missions={missions.filter(m => m.isActive)}
                  onMissionSelect={(mission) => setSelectedMission(mission)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colonies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colonies.map((colony) => (
              <ColonyCard
                key={colony.id}
                colony={colony}
                onClick={() => setSelectedColony(colony)}
              />
            ))}
          </div>
        )}

        {activeTab === 'missions' && (
          <MissionBoard
            missions={missions}
            onMissionSelect={(mission) => setSelectedMission(mission)}
            showAll
          />
        )}

        {activeTab === 'memory' && (
          <MemoryVault memories={memories} />
        )}

        {activeTab === 'constitution' && (
          <ConstitutionHall laws={constitution} />
        )}

        {activeTab === 'tesseract' && (
          <div className="flex justify-center">
            <TesseractChamber isActive={true} dimensions={[600, 500]} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
