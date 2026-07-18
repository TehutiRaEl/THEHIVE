import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import PlannedControl from '../../PlannedControl';
import { useHiveData } from '../../../hooks/useHiveData';

const WOW: React.FC = () => {
  const hive = useHiveData();
  return (
    <div className="tab-container wow-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🎮 WOW - World of Warcraft</h1>
          <p>Colony exploration and WoW integration</p>
        </header>

        <section className="wow-overview">
          <h2>World of Warcraft Integration</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Purpose</h3>
              <p>Explore and manage colonies through a WoW-inspired interface</p>
            </div>
            <div className="overview-card">
              <h3>Features</h3>
              <p>Interactive colony maps</p>
              <p>Resource management</p>
              <p>Agent coordination</p>
            </div>
            <div className="overview-card">
              <h3>Technology</h3>
              <p>React + D3.js for visualization</p>
              <p>Real-time data updates</p>
            </div>
          </div>
        </section>

        <section className="wow-features">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Colony Map</h3>
              <p>Interactive 2D/3D colony visualization</p>
              <p>Zoom, pan, and rotate</p>
            </div>
            <div className="feature-card">
              <h3>Resource Tracking</h3>
              <p>Monitor colony resources in real-time</p>
              <p>Health, wealth, knowledge metrics</p>
            </div>
            <div className="feature-card">
              <h3>Agent Management</h3>
              <p>View and control colony agents</p>
              <p>Assign tasks and missions</p>
            </div>
            <div className="feature-card">
              <h3>Quest System</h3>
              <p>Define and track colony objectives</p>
              <p>Progress monitoring</p>
            </div>
          </div>
        </section>

        <section className="wow-colonies">
          <h2>Colonies</h2>
          <div className="colonies-list">
            <div className="colony-card">
              <h3>THEHIVE</h3>
              <p className="colony-type">Primary - Command Center</p>
              <p className={hive.online ? 'status-online' : 'status-offline'}>
                Status: {hive.loading ? 'checking…' : hive.online ? '✅ Online' : '○ unreachable'}
              </p>
              <p className="colony-agents">Agents: {hive.agents.length}</p>
              <PlannedControl label="Explore" />
            </div>
            {['NAR2', 'LocalAGI', 'automatisch'].map((name) => (
              <div className="colony-card" key={name}>
                <h3>{name}</h3>
                <p className="colony-type">Federation colony</p>
                <p className="colony-status" style={{ opacity: 0.6 }}>
                  Status: not visible from the browser — see the colony-health-monitor workflow
                </p>
                <PlannedControl label="Explore" />
              </div>
            ))}
          </div>
        </section>

        <section className="wow-quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <PlannedControl label="Scan All Colonies" />
            <PlannedControl label="Collect Resources" />
            <PlannedControl label="Send Agents" />
            <PlannedControl label="View Map" />
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default WOW;
