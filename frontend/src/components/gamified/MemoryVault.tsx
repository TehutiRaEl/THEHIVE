import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArchive as Archive, IconClock as Clock, IconUser as User, IconTag as Tag, IconSearch as Search, IconFilter as Filter } from "nucleo-sharp";

interface Memory {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  author: string;
  tags: string[];
  type: 'system' | 'user' | 'agent' | 'event';
}

interface MemoryVaultProps {
  memories: Memory[];
  onMemorySelect?: (memory: Memory) => void;
}

const typeColors = {
  system: '#ef4444',
  user: '#3b82f6',
  agent: '#10b981',
  event: '#f59e0b',
};

const typeIcons = {
  system: Archive,
  user: User,
  agent: User,
  event: Clock,
};

export default function MemoryVault({ memories, onMemorySelect }: MemoryVaultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

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
      className="rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-600/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-600/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="flex items-center gap-4">
          <Archive className="h-8 w-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
              Memory Vault
            </h2>
            <p className="text-sm text-slate-300" style={{ fontFamily: 'Exo 2, sans-serif' }}>
              {memories.length} memories archived
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-600/50 bg-slate-800/50">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
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
              const TypeIcon = typeIcons[memory.type] || Archive;
              const typeColor = typeColors[memory.type] || '#9333ea';
              
              return (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onMemorySelect?.(memory)}
                  className="cursor-pointer rounded-lg border border-slate-600/50 bg-slate-700/30 p-4 hover:border-slate-400/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br"
                          style={{
                            background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
                          }}
                        >
                          <TypeIcon className="h-5 w-5" style={{ color: typeColor }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white" style={{ fontFamily: 'Cinzel, sans-serif' }}>
                            {memory.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{memory.author}</span>
                            <span className="text-xs text-slate-500">·</span>
                            <span className="text-xs text-slate-400">{memory.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2" style={{ fontFamily: 'Exo 2, sans-serif' }}>
                        {memory.content}
                      </p>
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
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No memories found matching your criteria</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-slate-600/50 bg-slate-800/50">
        <p className="text-sm text-slate-400">
          Showing {filteredMemories.length} of {memories.length} memories
        </p>
      </div>
    </motion.div>
  );
}