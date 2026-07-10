import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';

const WOW: React.FC = () => {
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
              <p className="colony-status">Status: ✅ Online</p>
              <p className="colony-agents">Agents: 3</p>
              <button>Explore</button>
            </div>
            <div className="colony-card">
              <h3>NAR2</h3>
              <p className="colony-type">Secondary - Research</p>
              <p className="colony-status">Status: ✅ Online</p>
              <p className="colony-agents">Agents: 2</p>
              <button>Explore</button>
            </div>
            <div className="colony-card">
              <h3>LocalAGI</h3>
              <p className="colony-type">Tertiary - Development</p>
              <p className="colony-status">Status: ✅ Online</p>
              <p className="colony-agents">Agents: 1</p>
              <button>Explore</button>
            </div>
            <div className="colony-card">
              <h3>automatisch</h3>
              <p className="colony-type">Automation</p>
              <p className="colony-status">Status: ✅ Online</p>
              <p className="colony-agents">Agents: 1</p>
              <button>Explore</button>
            </div>
          </div>
        </section>

        <section className="wow-quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button>Scan All Colonies</button>
            <button>Collect Resources</button>
            <button>Send Agents</button>
            <button>View Map</button>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default WOW;
