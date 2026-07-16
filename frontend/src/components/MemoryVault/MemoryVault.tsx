import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memory } from '../../types/memory';

interface MemoryVaultProps {
  memories: Memory[];
  onMemorySelect?: (memory: Memory) => void;
}

export default function MemoryVault({ memories, onMemorySelect }: MemoryVaultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const typeColors: Record<string, string> = {
    system: '#ef4444',
    user: '#3b82f6',
    agent: '#10b981',
    event: '#f59e0b',
  };

  const typeIcons: Record<string, string> = {
    system: '📋',
    user: '👤',
    agent: '🤖',
    event: '🎭',
  };

  const allTags = [...new Set(memories.flatMap(m => m.tags))];

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         memory.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => memory.tags.includes(tag));
    const matchesType = selectedType === null || memory.type === selectedType;
    return matchesSearch && matchesTags && matchesType;
  });

  const sortedMemories = [...filteredMemories].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-800/50 border border-slate-600/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-600/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🧠</span>
          <div>
            <h2 className="text-2xl font-bold text-white font-cinzel">Memory Vault</h2>
            <p className="text-sm text-slate-300 font-exo">{memories.length} memories archived</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-600/50 bg-slate-800/50">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 font-exo"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🎯</span>
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50 font-exo"
            >
              <option value="">All Types</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(tags => 
                  tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
                )}
                className={'px-3 py-1 rounded-full text-xs font-medium transition-all font-exo ' + 
                  (selectedTags.includes(tag)
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50')}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {sortedMemories.length > 0 ? (
            sortedMemories.map((memory, index) => {
              const icon = typeIcons[memory.type] || '📄';
              const color = typeColors[memory.type] || '#9333ea';
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMemorySelect && onMemorySelect(memory)}
                  className="cursor-pointer rounded-lg border border-slate-600/50 bg-slate-700/30 p-4 hover:border-slate-400/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(' + color + ', 0.2)' }}
                        >
                          <span className="text-lg" style={{ color }}>{icon}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white font-cinzel">{memory.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{memory.author}</span>
                            <span className="text-xs text-slate-500">·</span>
                            <span className="text-xs text-slate-400">{new Date(memory.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2 font-exo">{memory.content}</p>
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-xs text-slate-300 bg-slate-600/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-slate-400"
            >
              <span className="text-4xl">📋</span>
              <p className="mt-4">No memories found matching your criteria</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-600/50 bg-slate-800/50">
        <p className="text-sm text-slate-400 font-exo">
          Showing {filteredMemories.length} of {memories.length} memories
        </p>
      </div>
    </motion.div>
  );
}
