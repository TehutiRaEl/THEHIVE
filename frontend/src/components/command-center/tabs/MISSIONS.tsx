import React, { useState, useEffect } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { getTasks } from '../../../services/api';

interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'proposed' | 'formalized';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  dueDate?: string;
  colonyId?: string;
  assignedTo?: string;
  progress?: number;
}

// Priority values for sorting
const PRIORITY_VALUES: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4
};

const MISSIONS: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'name'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await getTasks();
      const data = resp?.tasks ?? [];
      const transformedMissions: Mission[] = (Array.isArray(data) ? data : []).map((mission: any) => ({
        id: mission.id || `m-${Math.random().toString(36).substr(2, 4)}`,
        name: mission.name || mission.title || 'Untitled Mission',
        description: mission.description || mission.details || 'No description',
        status: mission.status || 'pending',
        priority: mission.priority || 'medium',
        createdAt: mission.created_at || mission.createdAt || new Date().toISOString(),
        dueDate: mission.due_date || mission.dueDate,
        colonyId: mission.colony_id || mission.colonyId,
        assignedTo: mission.assigned_to || mission.assignedTo,
        progress: mission.progress || 0
      }));
      if (transformedMissions.length === 0) {
        setMissions(getFallbackMissions());
      } else {
        setMissions(transformedMissions);
      }
    } catch (err) {
      setError('Failed to load missions. Using fallback data.');
      setMissions(getFallbackMissions());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(fetchMissions, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFallbackMissions = (): Mission[] => [
    { id: 'm-001', name: 'Complete Command Center Tabs', description: 'Create all 13 SEE command center tab components', status: 'active', priority: 'critical', createdAt: '2026-07-09', dueDate: '2026-07-10', progress: 100 },
    { id: 'm-002', name: 'Implement Real 4D Math', description: 'Replace stubs in TesseractRenderer', status: 'completed', priority: 'high', createdAt: '2026-07-09', dueDate: '2026-07-11', progress: 100 },
  ];

  const filteredMissions = missions.filter(mission => {
    const statusMatch = filter === 'all' || mission.status === filter;
    const priorityMatch = priorityFilter === 'all' || mission.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const sortedMissions = [...filteredMissions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
      case 'priority':
        const priorityA = PRIORITY_VALUES[a.priority] || 0;
        const priorityB = PRIORITY_VALUES[b.priority] || 0;
        return sortDirection === 'desc' ? priorityB - priorityA : priorityA - priorityB;
      case 'name':
        return sortDirection === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const handleAbandonMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    if (window.confirm(`Abandon "${mission.name}"? This cannot be undone.`)) {
      setMissions(missions.map(m => m.id === missionId ? { ...m, status: 'failed' as const } : m));
    }
  };

  const handleQuickStart = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) { alert('Mission not found'); return; }
    if (mission.status !== 'pending') { alert('Only pending missions can be quick started'); return; }
    setMissions(missions.map(m => m.id === missionId ? { ...m, status: 'active' as const } : m));
  };

  const handleBulkComplete = () => {
    if (selectedMissions.length === 0) { alert('Select at least one mission'); return; }
    if (window.confirm(`Complete ${selectedMissions.length} mission(s)?`)) {
      setMissions(missions.map(m => selectedMissions.includes(m.id) ? { ...m, status: 'completed' as const, progress: 100 } : m));
      setSelectedMissions([]);
    }
  };

  const toggleMissionSelection = (missionId: string) => {
    setSelectedMissions(prev => prev.includes(missionId) ? prev.filter(id => id !== missionId) : [...prev, missionId]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try { const date = new Date(dateString); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return dateString; }
  };

  return (
    <div className="tab-container missions-tab">
      <SpaceNavigation />
      <main className="tab-content">
        <header className="tab-header">
          <h1>MISSIONS</h1>
          <p>Track and manage all Sovereign Hive missions</p>
          {error && <div className="api-error">{error}</div>}
        </header>

        <section className="missions-controls">
          <div className="filter-bar">
            <div className="filter-group">
              <span>Status:</span>
              <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({missions.length})</button>
              <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
              <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>Completed</button>
              <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
            </div>
            <div className="filter-group">
              <span>Priority:</span>
              <button className={`filter-btn ${priorityFilter === 'all' ? 'active' : ''}`} onClick={() => setPriorityFilter('all')}>All</button>
              <button className={`filter-btn ${priorityFilter === 'critical' ? 'active' : ''}`} onClick={() => setPriorityFilter('critical')}>Critical</button>
              <button className={`filter-btn ${priorityFilter === 'high' ? 'active' : ''}`} onClick={() => setPriorityFilter('high')}>High</button>
              <button className={`filter-btn ${priorityFilter === 'medium' ? 'active' : ''}`} onClick={() => setPriorityFilter('medium')}>Medium</button>
              <button className={`filter-btn ${priorityFilter === 'low' ? 'active' : ''}`} onClick={() => setPriorityFilter('low')}>Low</button>
            </div>
          </div>
          <div className="sort-bar">
            <span>Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'name')}>
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="name">Name</option>
            </select>
            <button onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}>{sortDirection === 'desc' ? 'Desc' : 'Asc'}</button>
          </div>
          <div className="missions-actions">
            <button className="btn-primary" onClick={() => console.log('Create new mission')}>Create New Mission</button>
            <button className="btn-secondary" onClick={fetchMissions}>Refresh Data</button>
            <button className="btn-action" onClick={handleBulkComplete} disabled={selectedMissions.length === 0}>Bulk Complete ({selectedMissions.length})</button>
          </div>
        </section>

        <section className="missions-list">
          {loading ? <div>Loading...</div> : sortedMissions.length > 0 ? (
            <div className="mission-cards">
              {sortedMissions.map(mission => (
                <div key={mission.id} className={`mission-card ${selectedMissions.includes(mission.id) ? 'selected' : ''}`} onClick={() => toggleMissionSelection(mission.id)}>
                  <div className="mission-header">
                    <input type="checkbox" checked={selectedMissions.includes(mission.id)} onChange={(e) => { e.stopPropagation(); toggleMissionSelection(mission.id); }} />
                    <h3>{mission.name}</h3>
                    <div><span className={getStatusColor(mission.status)}>{mission.status}</span> <span className={getPriorityColor(mission.priority)}>{mission.priority}</span></div>
                  </div>
                  <p>{mission.description}</p>
                  {mission.progress !== undefined && <div className="progress-bar"><div className="progress-fill" style={{ width: `${mission.progress}%` }}></div></div>}
                  <div className="mission-footer">
                    <span>Created: {formatDate(mission.createdAt)}</span>
                    {mission.status === 'pending' && <button className="btn-small" onClick={(e) => { e.stopPropagation(); handleQuickStart(mission.id); }}>Quick Start</button>}
                    {mission.status !== 'completed' && mission.status !== 'failed' && <button className="btn-small" onClick={(e) => { e.stopPropagation(); handleAbandonMission(mission.id); }}>Abandon</button>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p>No missions found</p>}
        </section>
      </main>
      <KaiChatBox />
    </div>
  );
};

export default MISSIONS;