---
name: "memory-details"
title: "Memory Details Component"
type: "react"
---

import React from "react";
import { motion } from "framer-motion";
import { IconX as X, IconArchive as Archive, IconClock as Clock, IconUser as User, IconTag as Tag, IconCopy as Copy, IconEdit as Edit, IconTrash as Trash } from "nucleo-sharp";

interface MemoryDetailsProps {
  memory: {
    id: string;
    title: string;
    content: string;
    timestamp: string;
    author: string;
    tags: string[];
    type: 'system' | 'user' | 'agent' | 'event';
    metadata?: Record<string, string>;
    relatedMemories?: string[];
  };
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

export default function MemoryDetails({ memory, onClose, onEdit, onDelete }: MemoryDetailsProps) {
  const TypeIcon = typeIcons[memory.type] || Archive;
  const typeColor = typeColors[memory.type] || '#9333ea';

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
        className="w-full max-w-3xl rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-slate-600/50 shadow-2xl shadow-purple-500/10 overflow-hidden"
      >
        <div
          className="flex items-center justify-between p-6 border-b border-slate-600/50"
          style={{
            background: `linear-gradient(135deg, ${typeColor}22, ${typeColor}11)`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br"
              style={{
                background: `linear-gradient(135deg, ${typeColor}44, ${typeColor}22)`,
              }}
            >
              <TypeIcon className="h-7 w-7" style={{ color: typeColor }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{memory.title}</h2>
              <p className="text-sm text-slate-300">
                {memory.type.charAt(0).toUpperCase() + memory.type.slice(1)} Memory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-700/50 transition-colors text-red-400"
            >
              <Trash className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-200 text-lg leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
              {memory.content}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-600/50">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Memory Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Author</p>
                    <p className="text-sm text-white">{memory.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-400">Created</p>
                    <p className="text-sm text-white">{formatDate(memory.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-slate-400" />
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
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
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
              <h3 className="text-lg font-semibold text-white mb-3">Additional Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(memory.metadata).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded bg-slate-700/50 flex items-center justify-center">
                      <Tag className="h-3.5 w-3.5 text-slate-400" />
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
              <h3 className="text-lg font-semibold text-white mb-3">Related Memories</h3>
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
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}