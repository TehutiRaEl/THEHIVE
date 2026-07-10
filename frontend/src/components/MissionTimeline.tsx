/**
 * MissionTimeline.tsx
 * Interactive timeline visualization of Sovereign Hive missions
 * Source: /v11/genesis/missions + status history
 */

import React, { useState, useMemo } from 'react';
import { useUiStore } from '../stores/uiStore';

interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'daily';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
  progress: number;
  startDate: string;
  endDate?: string;
  dueDate?: string;
  assignedAgent?: string;
  reward: { xp: number; gold: number };
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  history: MissionHistory[];
}

interface MissionHistory {
  date: string;
  status: string;
  progress: number;
  notes: string;
}

const STATUS_CONFIG = {
  pending: { color: '#666666', icon: '⏳', label: 'Pending' },
  'in-progress': { color: '#33B5E5', icon: '🔄', label: 'In Progress' },
  completed: { color: '#00C851', icon: '✅', label: 'Completed' },
  failed: { color: '#FF4444', icon: '❌', label: 'Failed' },
  paused: { color: '#FFBB33', icon: '⏸️', label: 'Paused' }
};

const TYPE_CONFIG = {
  main: { color: '#FFD700', icon: '🎯', label: 'Main Mission' },
  side: { color: '#33B5E5', icon: '🎮', label: 'Side Mission' },
  daily: { color: '#00C851', icon: '📅', label: 'Daily Mission' }
};

const PRIORITY_CONFIG = {
  low: { color: '#666666', label: 'Low' },
  medium: { color: '#FFBB33', label: 'Medium' },
  high: { color: '#FF4444', label: 'High' },
  critical: { color: '#FF0000', label: 'Critical' }
};

function generateMissionData(): Mission[] {
  return [
    { id: 'm-001', title: 'Implement Constitution Visualizer', description: 'Create interactive visualization of the Sovereign Hive constitution', type: 'main', status: 'completed', progress: 100, startDate: '2026-07-08', endDate: '2026-07-10', assignedAgent: 'Mistral', reward: { xp: 500, gold: 100 }, priority: 'high', tags: ['frontend', 'constitution'], history: [{ date: '2026-07-08', status: 'pending', progress: 0, notes: 'Mission created' }, { date: '2026-07-10', status: 'completed', progress: 100, notes: 'All features implemented' }] },
    { id: 'm-002', title: 'Enhanced Memory Graph', description: 'Create enhanced memory graph with philosophy node treatment', type: 'main', status: 'in-progress', progress: 65, startDate: '2026-07-09', dueDate: '2026-07-12', assignedAgent: 'Mistral', reward: { xp: 450, gold: 90 }, priority: 'high', tags: ['frontend', 'memory'], history: [{ date: '2026-07-09', status: 'pending', progress: 0, notes: 'Mission created' }, { date: '2026-07-10', status: 'in-progress', progress: 65, notes: 'Core graph implemented' }] },
    { id: 'm-003', title: 'Mission Timeline Component', description: 'Create interactive timeline visualization for tracking mission progress', type: 'main', status: 'pending', progress: 0, startDate: '2026-07-10', dueDate: '2026-07-13', assignedAgent: 'Mistral', reward: { xp: 400, gold: 80 }, priority: 'medium', tags: ['frontend', 'missions'], history: [{ date: '2026-07-10', status: 'pending', progress: 0, notes: 'Mission created' }] },
    { id: 'm-004', title: 'Tesseract 4D Implementation', description: 'Implement real 4D geometry and rotation matrices', type: 'main', status: 'completed', progress: 100, startDate: '2026-07-08', endDate: '2026-07-10', assignedAgent: 'Mistral', reward: { xp: 600, gold: 120 }, priority: 'high', tags: ['frontend', '4d', 'math'], history: [{ date: '2026-07-08', status: 'pending', progress: 0, notes: 'Stub created' }, { date: '2026-07-10', status: 'completed', progress: 100, notes: 'Full 4D geometry implemented' }] },
    { id: 'm-005', title: 'Colony Console Components', description: 'Create ColonyHeader, ColonyConsole, and HealthDashboard', type: 'main', status: 'completed', progress: 100, startDate: '2026-07-09', endDate: '2026-07-10', assignedAgent: 'Mistral', reward: { xp: 450, gold: 90 }, priority: 'high', tags: ['frontend', 'colony'], history: [{ date: '2026-07-09', status: 'pending', progress: 0, notes: 'Mission created' }, { date: '2026-07-10', status: 'completed', progress: 100, notes: 'All three components created' }] },
    { id: 'm-006', title: 'Command Center Infrastructure', description: 'Create TabNavigator and 13 SEE tab components', type: 'main', status: 'completed', progress: 100, startDate: '2026-07-08', endDate: '2026-07-09', assignedAgent: 'Mistral', reward: { xp: 800, gold: 150 }, priority: 'high', tags: ['frontend', 'command-center'], history: [{ date: '2026-07-08', status: 'pending', progress: 0, notes: 'Mission created' }, { date: '2026-07-09', status: 'completed', progress: 100, notes: 'All 14 components created' }] },
    { id: 'm-007', title: 'Entry Points Setup', description: 'Create main.tsx, App.tsx, and index.css entry points', type: 'main', status: 'completed', progress: 100, startDate: '2026-07-08', endDate: '2026-07-09', assignedAgent: 'Mistral', reward: { xp: 300, gold: 60 }, priority: 'critical', tags: ['frontend', 'entry-points'], history: [{ date: '2026-07-08', status: 'pending', progress: 0, notes: 'Mission created' }, { date: '2026-07-09', status: 'completed', progress: 100, notes: 'All entry points created' }] }
  ];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysRemaining(dueDate: string | undefined) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const MissionTimeline: React.FC = () => {
  const { theme } = useUiStore();
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'compact'>('horizontal');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showInProgress, setShowInProgress] = useState(true);
  const [showPending, setShowPending] = useState(true);

  const allMissions = generateMissionData();

  const filteredMissions = useMemo(() => {
    return allMissions.filter(mission => {
      if (!showCompleted && mission.status === 'completed') return false;
      if (!showInProgress && mission.status === 'in-progress') return false;
      if (!showPending && mission.status === 'pending') return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!mission.title.toLowerCase().includes(query) && !mission.description.toLowerCase().includes(query) && !mission.id.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [allMissions, showCompleted, showInProgress, showPending, searchQuery]);

  const missionStats = useMemo(() => {
    const stats = { total: filteredMissions.length, completed: 0, inProgress: 0, pending: 0, failed: 0, paused: 0 };
    filteredMissions.forEach(m => { stats[m.status as keyof typeof stats]++; });
    return stats;
  }, [filteredMissions]);

  const renderMissionCard = (mission: Mission) => {
    const statusConfig = STATUS_CONFIG[mission.status as keyof typeof STATUS_CONFIG];
    const typeConfig = TYPE_CONFIG[mission.type as keyof typeof TYPE_CONFIG];
    const priorityConfig = PRIORITY_CONFIG[mission.priority as keyof typeof PRIORITY_CONFIG];
    const daysRemaining = getDaysRemaining(mission.dueDate);

    return (
      <div key={mission.id} style={{ background: theme.surface, border: '2px solid ' + statusConfig.color, borderRadius: '12px', padding: '15px', marginBottom: '15px', cursor: 'pointer', boxShadow: expandedMission === mission.id ? '0 0 15px ' + statusConfig.color + '40' : 'none' }} onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.2em' }}>{typeConfig.icon}</span>
              <h4 style={{ margin: 0, color: theme.text }}>{mission.title}</h4>
              <span style={{ marginLeft: 'auto', padding: '2px 8px', background: statusConfig.color, color: '#000', borderRadius: '12px', fontSize: '0.75em', fontWeight: 'bold' }}>{statusConfig.icon} {statusConfig.label}</span>
            </div>
            <p style={{ margin: '0 0 10px 0', color: theme.textSecondary, fontSize: '0.9em' }}>{mission.description.length > 150 ? mission.description.substring(0, 150) + '...' : mission.description}</p>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: theme.textSecondary, fontSize: '0.85em' }}><strong>ID:</strong> {mission.id}</span>
              <span style={{ color: theme.textSecondary, fontSize: '0.85em' }}><strong>Priority:</strong> {priorityConfig.label}</span>
              {mission.assignedAgent && <span style={{ color: theme.textSecondary, fontSize: '0.85em' }}><strong>Agent:</strong> {mission.assignedAgent}</span>}
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ color: theme.textSecondary, fontSize: '0.85em' }}><strong>Start:</strong> {formatDate(mission.startDate)}</span>
              {mission.endDate && <span style={{ color: theme.textSecondary, fontSize: '0.85em' }}><strong>End:</strong> {formatDate(mission.endDate)}</span>}
              {mission.dueDate && <span style={{ color: daysRemaining && daysRemaining > 0 ? '#00C851' : '#FF4444', fontSize: '0.85em' }}><strong>Due:</strong> {formatDate(mission.dueDate)}{daysRemaining !== null && ' (' + (daysRemaining > 0 ? '+' + daysRemaining : daysRemaining) + ' days)'}</span>}
            </div>
            {expandedMission === mission.id && <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid ' + theme.border }}>
              <p style={{ margin: '0 0 10px 0', color: theme.text }}><strong>Description:</strong></p>
              <p style={{ margin: '0 0 15px 0', color: theme.textSecondary, fontSize: '0.9em' }}>{mission.description}</p>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', color: theme.text }}><strong>Progress:</strong></p>
                <div style={{ height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden', marginBottom: '5px' }}><div style={{ height: '100%', width: mission.progress + '%', background: statusConfig.color, borderRadius: '4px' }} /></div>
                <p style={{ margin: 0, color: theme.textSecondary, fontSize: '0.85em' }}>{mission.progress}% complete</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', color: theme.text }}><strong>Reward:</strong></p>
                <p style={{ margin: 0, color: theme.textSecondary }}>XP: {mission.reward.xp} | Gold: {mission.reward.gold}</p>
              </div>
              {mission.tags.length > 0 && <div style={{ marginBottom: '15px' }}><p style={{ margin: '0 0 5px 0', color: theme.text }}><strong>Tags:</strong></p><div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>{mission.tags.map(tag => <span key={tag} style={{ padding: '2px 8px', background: theme.primary, color: theme.secondaryColor, borderRadius: '12px', fontSize: '0.8em' }}>{tag}</span>)}</div></div>}
              {mission.history.length > 0 && <div><p style={{ margin: '0 0 10px 0', color: theme.text }}><strong>History:</strong></p><div style={{ maxHeight: '200px', overflowY: 'auto', background: theme.background, padding: '10px', borderRadius: '6px' }}>{mission.history.map((entry, index) => <div key={index} style={{ padding: '8px', marginBottom: '8px', background: theme.surface, borderRadius: '4px', borderLeft: '3px solid ' + (STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.color || '#666666') }}><p style={{ margin: '0 0 2px 0', color: theme.textSecondary, fontSize: '0.8em' }}>{formatDate(entry.date)}</p><p style={{ margin: '0 0 2px 0', color: theme.text, fontSize: '0.9em' }}>{entry.status} - {entry.progress}%</p><p style={{ margin: 0, color: theme.textSecondary, fontSize: '0.85em' }}>{entry.notes}</p></div>)}</div></div>}
            </div>}
          </div>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(' + statusConfig.color + ' ' + mission.progress + '%, ' + theme.border + ' ' + mission.progress + '%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.85em', fontWeight: 'bold', color: theme.text }}>{mission.progress}%</div>
        </div>
      </div>
    );
  };

  const renderHorizontalTimeline = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {filteredMissions.map(renderMissionCard)}
      </div>
    </div>
  );

  const renderVerticalTimeline = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ position: 'relative', paddingLeft: '40px' }}>
        {filteredMissions.map((mission, index) => {
          const statusConfig = STATUS_CONFIG[mission.status as keyof typeof STATUS_CONFIG];
          return <div key={mission.id} style={{ marginBottom: '40px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '-40px', width: '20px', height: '20px', borderRadius: '50%', background: statusConfig.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.7em', fontWeight: 'bold' }}>{index + 1}</div>
            <div style={{ position: 'absolute', left: '-20px', top: '20px', bottom: '-20px', width: '2px', background: statusConfig.color }} />
            <div style={{ marginLeft: '20px' }}>{renderMissionCard(mission)}</div>
          </div>;
        })}
      </div>
    </div>
  );

  const renderCompactView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
        {filteredMissions.map(mission => <div key={mission.id} style={{ background: theme.surface, border: '2px solid ' + (STATUS_CONFIG as any)[mission.status]?.color, borderRadius: '8px', padding: '12px', cursor: 'pointer' }} onClick={() => setExpandedMission(expandedMission === mission.id ? null : mission.id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span>{(TYPE_CONFIG as any)[mission.type]?.icon}</span>
            <h5 style={{ margin: 0, color: theme.text }}>{mission.title}</h5>
            <span style={{ marginLeft: 'auto', fontSize: '0.8em', color: theme.textSecondary }}>{mission.progress}%</span>
          </div>
          <div style={{ height: '4px', background: theme.border, borderRadius: '2px', overflow: 'hidden', marginBottom: '5px' }}><div style={{ height: '100%', width: mission.progress + '%', background: (STATUS_CONFIG as any)[mission.status]?.color }} /></div>
          <p style={{ margin: 0, color: theme.textSecondary, fontSize: '0.8em' }}>{formatDate(mission.startDate)} - {mission.assignedAgent || 'Unassigned'}</p>
        </div>)}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (layout) {
      case 'vertical': return renderVerticalTimeline();
      case 'compact': return renderCompactView();
      default: return renderHorizontalTimeline();
    }
  };

  return (
    <div className="mission-timeline" style={{ background: theme.background, color: theme.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px', borderBottom: '1px solid ' + theme.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2em' }}>🎯</span>
          <div><h1 style={{ margin: 0, fontSize: '1.8em' }}>Mission Timeline</h1><p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>Sovereign Hive Mission Tracking</p></div>
        </div>
      </header>
      <div style={{ display: 'flex', padding: '20px', gap: '20px', borderBottom: '1px solid ' + theme.border, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}><input type="text" placeholder="Search missions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px', background: theme.surface, border: '1px solid ' + theme.border, borderRadius: '6px', color: theme.text, fontSize: '1em' }} /></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ padding: '10px 16px', background: layout === 'horizontal' ? theme.primary : theme.surface, color: layout === 'horizontal' ? theme.secondaryColor : theme.text, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setLayout('horizontal')}>↔ Horizontal</button>
          <button style={{ padding: '10px 16px', background: layout === 'vertical' ? theme.primary : theme.surface, color: layout === 'vertical' ? theme.secondaryColor : theme.text, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setLayout('vertical')}>↕ Vertical</button>
          <button style={{ padding: '10px 16px', background: layout === 'compact' ? theme.primary : theme.surface, color: layout === 'compact' ? theme.secondaryColor : theme.text, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setLayout('compact')}>□ Compact</button>
        </div>
      </div>
      <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid ' + theme.border, display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label style={{ color: theme.textSecondary, fontSize: '0.9em' }}>Show:</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="checkbox" checked={showCompleted} onChange={() => setShowCompleted(!showCompleted)} style={{ accentColor: STATUS_CONFIG.completed.color }} /><span style={{ color: STATUS_CONFIG.completed.color, fontSize: '0.9em' }}>✅ Completed</span></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="checkbox" checked={showInProgress} onChange={() => setShowInProgress(!showInProgress)} style={{ accentColor: STATUS_CONFIG['in-progress'].color }} /><span style={{ color: STATUS_CONFIG['in-progress'].color, fontSize: '0.9em' }}>🔄 In Progress</span></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}><input type="checkbox" checked={showPending} onChange={() => setShowPending(!showPending)} style={{ accentColor: STATUS_CONFIG.pending.color }} /><span style={{ color: STATUS_CONFIG.pending.color, fontSize: '0.9em' }}>⏳ Pending</span></label>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button style={{ padding: '8px 16px', background: theme.surface, color: theme.text, border: '1px solid ' + theme.border, borderRadius: '6px', cursor: 'pointer' }} onClick={() => { setSearchQuery(''); setShowCompleted(true); setShowInProgress(true); setShowPending(true); }}>Clear Filters</button>
        </div>
      </div>
      <main style={{ flex: 1 }}>
        {filteredMissions.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}><p>No missions match the current filters</p></div> : renderCurrentView()}
      </main>
      <footer style={{ padding: '20px', borderTop: '1px solid ' + theme.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', color: theme.textSecondary, fontSize: '0.85em' }}>
        <div><p><strong>Total:</strong> {missionStats.total} | <strong style={{ color: '#00C851' }}>✅ {missionStats.completed}</strong> | <strong style={{ color: '#33B5E5' }}>🔄 {missionStats.inProgress}</strong> | <strong style={{ color: '#666666' }}>⏳ {missionStats.pending}</strong></p></div>
        <div><p><strong>Data Source:</strong> /v11/genesis/missions + status history</p></div>
      </footer>
    </div>
  );
};

export default MissionTimeline;