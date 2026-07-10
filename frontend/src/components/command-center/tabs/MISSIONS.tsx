import React, { useState, useEffect } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';

interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  dueDate?: string;
}

const MISSIONS: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'pending'>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockMissions: Mission[] = [
      {
        id: 'm-001',
        name: 'Complete Command Center Tabs',
        description: 'Create all 13 SEE command center tab components',
        status: 'active',
        priority: 'critical',
        createdAt: '2026-07-09',
        dueDate: '2026-07-10'
      },
      {
        id: 'm-002',
        name: 'Implement Real 4D Math',
        description: 'Replace stubs in TesseractRenderer with real 4D geometry',
        status: 'completed',
        priority: 'high',
        createdAt: '2026-07-09',
        dueDate: '2026-07-11'
      },
      {
        id: 'm-003',
        name: 'Colony Console Components',
        description: 'Create ColonyHeader, ColonyConsole, HealthDashboard',
        status: 'completed',
        priority: 'high',
        createdAt: '2026-07-09',
        dueDate: '2026-07-11'
      },
      {
        id: 'm-004',
        name: 'Federation Intelligence',
        description: 'Create ConstitutionVisualizer, MemoryGraphEnhanced, MissionTimeline',
        status: 'completed',
        priority: 'medium',
        createdAt: '2026-07-09',
        dueDate: '2026-07-12'
      },
      {
        id: 'm-005',
        name: 'Documentation Cleanup',
        description: 'Remove all false claims from documentation',
        status: 'completed',
        priority: 'high',
        createdAt: '2026-07-09',
        dueDate: '2026-07-09'
      }
    ];
    
    setMissions(mockMissions);
    setLoading(false);
  }, []);

  const filteredMissions = filter === 'all'
    ? missions
    : missions.filter(m => m.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'active': return 'blue';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="tab-container missions-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🎯 MISSIONS - Task Management</h1>
          <p>Track and manage all Sovereign Hive missions</p>
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
              Pending ({missions.filter(m => m.status === 'pending').length})
            </button>
          </div>
          
          <div className="missions-actions">
            <button className="btn-primary">Create New Mission</button>
            <button className="btn-secondary">Bulk Actions</button>
          </div>
        </section>

        <section className="missions-list">
          {loading ? (
            <p>Loading missions...</p>
          ) : filteredMissions.length > 0 ? (
            <div className="mission-cards">
              {filteredMissions.map(mission => (
                <div key={mission.id} className="mission-card">
                  <div className="mission-header">
                    <h3>{mission.name}</h3>
                    <div className="mission-meta">
                      <span
                        className="mission-status"
                        style={{ backgroundColor: getStatusColor(mission.status) }}
                      >
                        {mission.status.toUpperCase()}
                      </span>
                      <span
                        className="mission-priority"
                        style={{ backgroundColor: getPriorityColor(mission.priority) }}
                      >
                        {mission.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="mission-description">{mission.description}</p>
                  <div className="mission-footer">
                    <span className="mission-date">
                      Created: {mission.createdAt}
                    </span>
                    {mission.dueDate && (
                      <span className="mission-due">
                        Due: {mission.dueDate}
                      </span>
                    )}
                    <div className="mission-actions">
                      <button className="btn-small">View</button>
                      <button className="btn-small">Edit</button>
                      <button className="btn-small danger">Delete</button>
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
              <p className="stat-value">{missions.length}</p>
            </div>
            <div className="stat-card">
              <h3>Active</h3>
              <p className="stat-value">{missions.filter(m => m.status === 'active').length}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-value">{missions.filter(m => m.status === 'completed').length}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-value">{missions.filter(m => m.status === 'pending').length}</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default MISSIONS;