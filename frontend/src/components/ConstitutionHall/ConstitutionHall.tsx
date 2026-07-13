import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Law } from '../../types/constitution';

interface ConstitutionHallProps {
  laws: Law[];
}

export default function ConstitutionHall({ laws }: ConstitutionHallProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'fixed' | 'cardinal' | 'mutable'>('all');
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);

  const categoryData: Record<string, { icon: string; color: string; label: string; description: string }> = {
    fixed: { icon: '🛡️', color: '#ef4444', label: 'Fixed Laws', description: 'Unchangeable foundational principles' },
    cardinal: { icon: '⚖️', color: '#f59e0b', label: 'Cardinal Laws', description: 'Core operational guidelines' },
    mutable: { icon: '✨', color: '#10b981', label: 'Mutable Laws', description: 'Adaptable rules and procedures' },
  };

  const filteredLaws = selectedCategory === 'all' 
    ? laws 
    : laws.filter(law => law.category === selectedCategory);

  const groupedLaws = filteredLaws.reduce((acc: Record<string, Law[]>, law) => {
    if (!acc[law.category]) acc[law.category] = [];
    acc[law.category].push(law);
    return acc;
  }, {});

  const categoryStyle = (cat: string) => ({
    background: selectedCategory === cat ? 'rgba(147, 51, 234, 0.2)' : 'rgba(51, 65, 85, 0.4)',
    border: selectedCategory === cat ? '1px solid rgba(147, 51, 234, 0.4)' : '1px solid rgba(51, 65, 85, 0.3)',
    color: selectedCategory === cat ? categoryData[cat as keyof typeof categoryData].color : 'rgba(191, 212, 245, 0.7)',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-800/50 border border-slate-600/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-600/50 bg-gradient-to-r from-purple-900/20 to-slate-800/20">
        <div className="flex items-center gap-4">
          <span className="text-2xl">📜</span>
          <div>
            <h2 className="text-2xl font-bold text-white font-cinzel">Constitution Hall</h2>
            <p className="text-sm text-slate-300 font-exo">The Governing Laws of THEHIVE</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-4 border-b border-slate-600/50 bg-slate-800/50">
        <button
          onClick={() => setSelectedCategory('all')}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-all font-exo ' + 
            (selectedCategory === 'all'
              ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50')}
        >
          All Laws
        </button>
        {(['fixed', 'cardinal', 'mutable'] as const).map((cat) => {
          const data = categoryData[cat];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 font-exo"
              style={categoryStyle(cat)}
            >
              <span>{data.icon}</span>
              {data.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {selectedCategory === 'all' ? (
          Object.entries(groupedLaws).map(([category, categoryLaws]) => {
            const data = categoryData[category as keyof typeof categoryData];
            if (!data) return null;
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 pb-2 border-b border-slate-600/50">
                  <span className="text-xl">{data.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-cinzel">{data.label}</h3>
                    <p className="text-xs text-slate-400">{data.description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {categoryLaws.map((law) => (
                    <motion.div
                      key={law.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
                      className={'cursor-pointer rounded-lg border border-slate-600/50 bg-slate-700/30 p-4 transition-all ' + 
                        (expandedLaw === law.id ? 'border-purple-500/50 bg-slate-600/50' : '')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-slate-400">📜</span>
                            <div>
                              <h4 className="text-sm font-medium text-white font-cinzel">
                                Article {law.article}: {law.title}
                              </h4>
                              {expandedLaw === law.id && (
                                <p className="text-sm text-slate-300 mt-2 font-exo">
                                  {law.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={'px-2 py-1 rounded-full text-xs font-medium ' + 
                              (law.isActive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-600/50 text-slate-400')}
                          >
                            {law.isActive ? 'Active' : 'Archived'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="space-y-3">
            {filteredLaws.map((law) => (
              <motion.div
                key={law.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
                className={'cursor-pointer rounded-lg border border-slate-600/50 bg-slate-700/30 p-4 transition-all ' + 
                  (expandedLaw === law.id ? 'border-purple-500/50 bg-slate-600/50' : '')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-slate-400">📜</span>
                      <div>
                        <h4 className="text-sm font-medium text-white font-cinzel">
                          Article {law.article}: {law.title}
                        </h4>
                        {expandedLaw === law.id && (
                          <p className="text-sm text-slate-300 mt-2 font-exo">
                            {law.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={'px-2 py-1 rounded-full text-xs font-medium ' + 
                        (law.isActive
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-600/50 text-slate-400')}
                    >
                      {law.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
