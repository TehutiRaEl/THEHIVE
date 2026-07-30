import { useState } from 'react';
import type { TabId } from '../../types';

interface NavItem {
  id: TabId | string;
  label: string;
  icon: string;
  wired: boolean; // false = shown honestly as not-yet-connected, not hidden
}

const PRIMARY: NavItem[] = [
  { id: 'proposals', label: 'Proposals', icon: '📋', wired: true },
  { id: 'updates', label: 'Updates', icon: '📣', wired: true },
  { id: 'settings', label: 'Settings', icon: '⚙', wired: true },
  { id: 'govern', label: 'Govern', icon: '🏛', wired: true },
  { id: 'constitution', label: 'Constitution', icon: '📜', wired: true },
  { id: 'hive', label: 'Hive', icon: '🐝', wired: true },
  { id: 'commune', label: 'Commune', icon: '💬', wired: true },
  { id: 'swarms', label: 'Swarms', icon: '🧠', wired: true },
  { id: 'arena', label: 'Arena', icon: '⚔', wired: true },
  { id: 'missions', label: 'Tasks', icon: '✓', wired: true },
];

const SECONDARY: NavItem[] = [
  { id: 'ml-status', label: 'Cloudflare Workers AI', icon: '☁', wired: true },
  { id: 'legal', label: 'Legal Learning', icon: '⚖', wired: true },
  { id: 'venture', label: 'Venture Planner', icon: '🚀', wired: true },
  { id: 'connectors', label: 'Connectors', icon: '🔌', wired: false },
  { id: 'sources', label: 'Upload Files', icon: '📁', wired: true },
  { id: 'skills', label: 'Active Skills', icon: '⚡', wired: true },
  { id: 'world', label: 'Projects', icon: '📂', wired: true },
  { id: 'training', label: 'Training', icon: '🎓', wired: false },
  { id: 'dream', label: 'Dream Logs', icon: '🌙', wired: true },
];

interface LeftNavProps {
  activeSection: string | null;
  onSelect: (id: string) => void;
  onCommune: () => void;
}

export default function LeftNav({ activeSection, onSelect, onCommune }: LeftNavProps) {
  const [commandValue, setCommandValue] = useState('');

  const renderItem = (item: NavItem) => {
    const isActive = activeSection === item.id;
    const accessibleName = !item.wired
      ? `${item.label} (not yet connected)`
      : item.label;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => (item.id === 'commune' ? onCommune() : onSelect(item.id))}
        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-left transition-all
        ${isActive
          ? 'bg-yale/40 text-cyan-neon shadow-neon-cyan border border-cyan-glow/40'
          : 'text-slate-300 hover:bg-white/5 hover:text-cyan-glow border border-transparent'}
        ${!item.wired ? 'opacity-50' : ''}`}
        title={!item.wired ? `${item.label} — not yet connected` : item.label}
        aria-label={accessibleName}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={!item.wired ? true : undefined}
      >
        <span className="w-4 text-center" aria-hidden="true">{item.icon}</span>
        <span className="truncate">{item.label}</span>
        {!item.wired && <span className="ml-auto text-[9px] text-slate-500">soon</span>}
      </button>
    );
  };

  return (
    <nav
      aria-label="Kai EL OS primary navigation"
      className="w-56 shrink-0 h-full flex flex-col bg-void-900 border-r border-white/5 py-3 px-2 gap-0.5 font-body"
    >
      <div className="flex flex-col gap-0.5 mb-3" role="group" aria-label="Primary sections">
        {PRIMARY.map(renderItem)}
      </div>
      <div className="h-px bg-white/10 mx-2 mb-3" role="separator" />
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto" role="group" aria-label="Secondary sections">
        {SECONDARY.map(renderItem)}
      </div>
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1 mb-2 px-1">
          <span className="text-cyan-glow text-xs" aria-hidden="true">✳</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500" id="leftnav-commands-label">
            Commands
          </span>
        </div>
        <input
          value={commandValue}
          onChange={(e) => setCommandValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && commandValue.trim()) {
              onCommune();
              setCommandValue('');
            }
          }}
          placeholder="chat box"
          aria-labelledby="leftnav-commands-label"
          aria-label="Command input — press Enter to open Commune"
          className="w-full bg-void-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-glow/50"
        />
      </div>
    </nav>
  );
}
