import React from 'react';
import { motion } from 'framer-motion';
import { Memory } from '../../types/memory';

interface MemoryDetailsProps {
  memory: Memory;
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MemoryDetails({ memory, onClose, onEdit, onDelete }: MemoryDetailsProps) {
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

  const icon = typeIcons[memory.type] || '📄';
  const color = typeColors[memory.type] || '#9333ea';

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-2xl bg-slate-800/90 border border-slate-600/50 shadow-2xl shadow-purple-500/10 overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-6 border-b border-slate-600/50"
          style={{ background: 'rgba(' + color + ', 0.1)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(' + color + ', 0.2)' }}
            >
              <span className="text-2xl" style={{ color }}>{icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-cinzel">{memory.title}</h2>
              <p className="text-sm text-slate-300 font-exo">
                {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)} Memory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
              >
                <span className="text-xl">✏️</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-700/50 transition-colors text-red-400"
              >
                <span className="text-xl">🗑️</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-200 text-lg leading-relaxed font-exo" style={{ whiteSpace: 'pre-wrap' }}>
              {memory.content}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-600/50">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 font-cinzel">Memory Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400">👤</span>
                  <div>
                    <p className="text-sm text-slate-400">Author</p>
                    <p className="text-sm text-white">{memory.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400">📅</span>
                  <div>
                    <p className="text-sm text-slate-400">Created</p>
                    <p className="text-sm text-white">{formatDate(memory.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400">📋</span>
                  <div>
                    <p className="text-sm text-slate-400">Type</p>
                    <p className="text-sm text-white">
                      {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {memory.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 font-cinzel">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600/30 text-sm text-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {memory.metadata && Object.keys(memory.metadata).length > 0 && (
            <div className="pt-6 border-t border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-3 font-cinzel">Additional Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(memory.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center">
                      <span className="text-slate-400">🏷️</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">{key}</p>
                      <p className="text-sm text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {memory.relatedMemories && memory.relatedMemories.length > 0 && (
            <div className="pt-6 border-t border-slate-600/50">
              <h3 className="text-lg font-semibold text-white mb-3 font-cinzel">Related Memories</h3>
              <div className="flex flex-wrap gap-2">
                {memory.relatedMemories.map(id => (
                  <span
                    key={id}
                    className="px-3 py-1 rounded-lg bg-slate-700/50 border border-slate-600/30 text-sm text-purple-300"
                  >
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-600/50">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Memory ID:</span>
              <code className="text-sm text-purple-400 bg-slate-700/50 px-3 py-1 rounded">
                {memory.id}
              </code>
              <button
                onClick={onCopy}
                className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-slate-700/50 transition-colors text-sm text-slate-300"
              >
                <span>📋</span>
                Copy
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
