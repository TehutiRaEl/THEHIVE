import React, { useState, useEffect } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import PlannedControl from '../../PlannedControl';
import { getTasks } from '../../../services/api';

interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'proposed' | 'formalized';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  createdAt?: string;
  dueDate?: string;
  colonyId?: string;
  assignedTo?: string;
  progress?: number;
}

// GET /v11/tasks returns one page (the Worker's default page size). A full page
// means there may be more tasks than are shown.
const TASK_PAGE_SIZE = 20;

const MISSIONS: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');
  // When /v11/tasks last answered. Shown as "Last updated" -- never the render time.
  const [lastLoadedAt, setLastLoadedAt] = useState<Date | null>(null);

  // Fetch real missions data from API
  const fetchMissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch real tasks from the edge Queen (/v11/tasks). The old
        // /genesis/missions endpoint existed only on the FastAPI origin, not on
        // the live Cloudflare Worker — it 404'd, which is why this tab was empty.
        const resp = await getTasks();
        const data = resp?.tasks ?? [];

        // Map each Hive task onto a card. Only fields the task really carries are
        // set: a missing priority, progress or created date stays missing and the
        // card shows nothing for it. Nothing is defaulted to a made-up value.
        const transformedMissions: Mission[] = (Array.isArray(data) ? data : []).map((mission: any, index: number) => ({
          id: mission.id != null ? String(mission.id) : `task-${index}`,
          name: mission.name || mission.title || 'Untitled task',
          description: mission.description || mission.details || '',
          status: mission.status || 'pending',
          priority: mission.priority || undefined,
          createdAt: mission.created_at || mission.createdAt || undefined,
          dueDate: mission.due_date || mission.dueDate,
          colonyId: mission.colony_id || mission.colonyId,
          assignedTo: mission.assigned_to || mission.assignedTo,
          progress: typeof mission.progress === 'number' ? mission.progress : undefined,
        }));

        // An empty queue is shown as empty. This tab used to fill itself with
        // eight invented sample missions here; that is gone (live data or "no data").
        setMissions(transformedMissions);
        setLastLoadedAt(new Date());
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Could not reach the Hive task list (/v11/tasks). Nothing is shown, rather than sample data.');
        setMissions([]);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchMissions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchMissions, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredMissions = filter === 'all'
    ? missions
    : missions.filter(m => m.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      case 'proposed': return 'bg-purple-500';
      case 'formalized': return 'bg-indigo-500';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      case 'proposed': return 'Proposed';
      case 'formalized': return 'Formalized';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="tab-container missions-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>MISSIONS - Task Management</h1>
          <p>Track and manage all Sovereign Hive missions</p>
          {error && <div className="api-error">{error}</div>}
        </header>

        <section className="missions-controls">
          <div className="filter-bar">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({missions.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({missions.filter(m => m.status === 'active').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({missions.filter(m => m.status === 'completed').length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({missions.filter(m => ['pending', 'proposed', 'formalized'].includes(m.status)).length})
            </button>
          </div>
          
          <div className="missions-actions">
            <PlannedControl label="Create New Mission" className="btn-primary" />
            <button className="btn-secondary" onClick={() => fetchMissions()}>
              Refresh Data
            </button>
          </div>
        </section>

        <section className="missions-list">
          {loading ? (
            <div className="loading-missions">
              <div className="spinner"></div>
              <p>Loading tasks from the Hive...</p>
            </div>
          ) : filteredMissions.length > 0 ? (
            <div className="mission-cards">
              {filteredMissions.map(mission => (
                <div key={mission.id} className="mission-card">
                  <div className="mission-header">
                    <h3>{mission.name}</h3>
                    <div className="mission-meta">
                      <span className={`mission-status ${getStatusColor(mission.status)}`}>
                        {getStatusText(mission.status)}
                      </span>
                      {mission.priority && (
                        <span className={`mission-priority ${getPriorityColor(mission.priority)}`}>
                          {getPriorityText(mission.priority)}
                        </span>
                      )}
                    </div>
                  </div>
                  {mission.description && <p className="mission-description">{mission.description}</p>}
                  <div className="mission-progress">
                    {mission.progress !== undefined && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${mission.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="mission-footer">
                    {mission.createdAt && (
                      <span className="mission-date">
                        Created: {formatDate(mission.createdAt)}
                      </span>
                    )}
                    {mission.dueDate && (
                      <span className="mission-due">
                        Due: {formatDate(mission.dueDate)}
                      </span>
                    )}
                    {mission.colonyId && (
                      <span className="mission-colony">
                        Colony: {mission.colonyId}
                      </span>
                    )}
                    <div className="mission-actions">
                      <PlannedControl label="View" className="btn-small" />
                      <PlannedControl label="Edit" className="btn-small" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-missions">
              {error
                ? 'No data: the Hive task list could not be reached.'
                : missions.length === 0
                  ? 'No data: the Hive task queue is empty.'
                  : 'No tasks match this filter.'}
            </p>
          )}
        </section>

        <section className="missions-stats">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Missions</h3>
              <p className="stat-value">
                {missions.length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Active</h3>
              <p className="stat-value">
                {missions.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-value">
                {missions.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-value">
                {missions.filter(m => ['pending', 'proposed', 'formalized'].includes(m.status)).length}
              </p>
            </div>
          </div>
        </section>

        <section className="api-info">
          <h3>API Status</h3>
          <p>
            Data source: <code>{loading ? 'Loading...' : error ? 'unavailable' : '/v11/tasks'}</code>
          </p>
          <p>
            Last updated: {lastLoadedAt ? lastLoadedAt.toLocaleTimeString() : 'no data yet'}
          </p>
          {missions.length >= TASK_PAGE_SIZE && (
            <p>
              Showing the latest {missions.length} tasks. Older tasks are not loaded, so these counts are not totals.
            </p>
          )}
          <p>
            Auto-refresh: Every 30 seconds
          </p>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default MISSIONS;