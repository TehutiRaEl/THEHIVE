---
name: "memory-item"
title: "Memory Item Component"
type: "react"
---

import React from "react";
import { motion } from "framer-motion";
import { IconArchive as Archive, IconClock as Clock, IconUser as User, IconTag as Tag, IconCopy as Copy, IconShare as Share } from "nucleo-sharp";

interface MemoryItemProps {
  memory: {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    author: string;
    tags: string[];
    type: 'system' | 'user' | 'agent' | 'event';
  };
  onCopy?: () => void;
  onShare?: () => void;
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

export default function MemoryItem({ memory, onCopy, onShare }: MemoryItemProps) {
  const TypeIcon = typeIcons[memory.type] || Archive;
  const typeColor = typeColors[memory.type] || '#9333ea';

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
      className="rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-600/50 overflow-hidden"
    >
      <div
        className="flex items-center justify-between p-4 border-b border-slate-600/50"
        style={{
          background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}11)`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br"
            style={{
              background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
            }}
          >
            <TypeIcon className="h-6 w-6" style={{ color: typeColor }} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {memory.title}
            </h3>
            <p className="text-xs text-slate-300">
              {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)} Memory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onShare}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
          >
            <Share className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-slate-200" style={{ whiteSpace: 'pre-wrap' }}>
          {memory.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <User className="h-4 w-4" />
              <span className="text-sm">{memory.author}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
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