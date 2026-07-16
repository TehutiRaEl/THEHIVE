import { motion } from 'framer-motion';
import { Memory } from '../../types/memory';

interface MemoryItemProps {
  memory: Memory;
  onCopy?: () => void;
  onShare?: () => void;
}

export default function MemoryItem({ memory, onCopy, onShare }: MemoryItemProps) {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      className="rounded-xl bg-slate-800/50 border border-slate-600/50 overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-4 border-b border-slate-600/50"
        style={{ background: 'rgba(' + color + ', 0.1)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(' + color + ', 0.2)' }}
          >
            <span className="text-xl" style={{ color }}>{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-cinzel">{memory.title}</h3>
            <p className="text-xs text-slate-300 font-exo">
              {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)} Memory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
          >
            <span className="text-lg">📋</span>
          </button>
          <button
            onClick={onShare}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
          >
            <span className="text-lg">🔗</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-slate-200 font-exo" style={{ whiteSpace: 'pre-wrap' }}>
          {memory.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <span>👤</span>
              <span className="text-sm">{memory.author}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span>📅</span>
              <span className="text-sm">{formatDate(memory.timestamp)}</span>
            </div>
          </div>
          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {memory.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-xs text-slate-300 bg-slate-700/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">ID:</span>
          <code className="text-xs text-purple-400 bg-slate-700/50 px-2 py-0.5 rounded">
            {memory.id}
          </code>
        </div>
      </div>
    </motion.div>
  );
}
