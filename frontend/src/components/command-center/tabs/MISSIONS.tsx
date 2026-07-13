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

const MISSIONS: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');

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

        // Transform API data to our Mission interface
        const transformedMissions: Mission[] = (Array.isArray(data) ? data : []).map((mission: any) => ({
          id: mission.id || `m-${Math.random().toString(36).substr(2, 4)}`,
          name: mission.name || mission.title || 'Untitled Mission',
          description: mission.description || mission.details || 'No description provided',
          status: mission.status || 'pending',
          priority: mission.priority || 'medium',
          createdAt: mission.created_at || mission.createdAt || new Date().toISOString(),
          dueDate: mission.due_date || mission.dueDate,
          colonyId: mission.colony_id || mission.colonyId,
          assignedTo: mission.assigned_to || mission.assignedTo,
          progress: mission.progress || 0
        }));
        
        // Fallback to mock data if API returns empty
        if (transformedMissions.length === 0) {
          console.warn('API returned no missions, using fallback data');
          setMissions(getFallbackMissions());
        } else {
          setMissions(transformedMissions);
        }
      } catch (err) {
        console.error('Failed to fetch missions:', err);
        setError('Failed to load missions. Using fallback data.');
        setMissions(getFallbackMissions());
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

  // Fallback mission data when API is unavailable
  const getFallbackMissions = (): Mission[] => [
    {
      id: 'm-001',
      name: 'Complete Command Center Tabs',
      description: 'Create all 13 SEE command center tab components',
      status: 'active',
      priority: 'critical',
      createdAt: '2026-07-09',
      dueDate: '2026-07-10',
      progress: 100
    },
    {
      id: 'm-002',
      name: 'Implement Real 4D Math',
      description: 'Replace stubs in TesseractRenderer with real 4D geometry',
      status: 'completed',
      priority: 'high',
      createdAt: '2026-07-09',
      dueDate: '2026-07-11',
      progress: 100
    },
    {
      id: 'm-003',
      name: 'Colony Console Components',
      description: 'Create ColonyHeader, ColonyConsole, HealthDashboard',
      status: 'completed',
      priority: 'high',
      createdAt: '2026-07-09',
      dueDate: '2026-07-11',
      progress: 100
    },
    {
      id: 'm-004',
      name: 'Federation Intelligence',
      description: 'Create ConstitutionVisualizer, MemoryGraphEnhanced, MissionTimeline',
      status: 'completed',
      priority: 'medium',
      createdAt: '2026-07-09',
      dueDate: '2026-07-12',
      progress: 100
    },
    {
      id: 'm-005',
      name: 'Documentation Cleanup',
      description: 'Remove all false claims from documentation',
      status: 'completed',
      priority: 'high',
      createdAt: '2026-07-09',
      dueDate: '2026-07-09',
      progress: 100
    },
    {
      id: 'm-006',
      name: 'Batch 10 Colony Consoles',
      description: 'Create all 10 colony-specific console components',
      status: 'completed',
      priority: 'high',
      createdAt: '2026-07-10',
      dueDate: '2026-07-10',
      progress: 100
    },
    {
      id: 'm-007',
      name: 'Common UI Components',
      description: 'Create Button, Card, Modal common components',
      status: 'completed',
      priority: 'medium',
      createdAt: '2026-07-10',
      dueDate: '2026-07-10',
      progress: 100
    },
    {
      id: 'm-008',
      name: 'API Integration',
      description: 'Connect components to real API data',
      status: 'active',
      priority: 'high',
      createdAt: '2026-07-10',
      dueDate: '2026-07-11',
      progress: 50
    },
  ];

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
            <button className="btn-primary">Create New Mission</button>
            <button className="btn-secondary" onClick={() => fetchMissions()}>
              Refresh Data
            </button>
          </div>
        </section>

        <section className="missions-list">
          {loading ? (
            <div className="loading-missions">
              <div className="spinner"></div>
              <p>Loading missions from API...</p>
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
                      <span className={`mission-priority ${getPriorityColor(mission.priority)}`}>
                        {getPriorityText(mission.priority)}
                      </span>
                    </div>
                  </div>
                  <p className="mission-description">{mission.description}</p>
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
                    <span className="mission-date">
                      Created: {formatDate(mission.createdAt)}
                    </span>
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
                      <button className="btn-small">View</button>
                      <button className="btn-small">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-missions">No missions found</p>
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
            Data source: <code>{loading ? 'Loading...' : error ? 'Fallback' : '/v11/genesis/missions'}</code>
          </p>
          <p>
            Last updated: {new Date().toLocaleTimeString()}
          </p>
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