import React from 'react';
import SpaceNavigation from '../components/SpaceNavigation';
import KaiChatBox from '../components/KaiChatBox';
import ColonyZoomPanel from '../components/ColonyZoomPanel';

const ColonyGraphPage: React.FC = () => {
  return (
    <div className="colony-graph-page">
      <SpaceNavigation />
      
      <main className="page-content">
        <header className="page-header">
          <h1>Colony Graph</h1>
          <p>Interactive D3 visualization of the Sovereign Hive colonies</p>
        </header>

        <section className="visualization-section">
          <div className="colony-container">
            <ColonyZoomPanel />
          </div>
        </section>

        <section className="colony-info">
          <h2>Colony Overview</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>THEHIVE</h3>
              <p>Primary colony - Command Center</p>
            </div>
            <div className="info-card">
              <h3>NAR2</h3>
              <p>Secondary colony - Research</p>
            </div>
            <div className="info-card">
              <h3>LocalAGI</h3>
              <p>Tertiary colony - Development</p>
            </div>
            <div className="info-card">
              <h3>automatisch</h3>
              <p>Automation colony</p>
            </div>
            <div className="info-card">
              <h3>4DBRAIN</h3>
              <p>4D Research colony</p>
            </div>
          </div>
        </section>

        <section className="colony-stats">
          <h2>Colony Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Colonies:</span>
              <span className="stat-value">10</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Agents:</span>
              <span className="stat-value">7</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Memory Nodes:</span>
              <span className="stat-value">42</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Health Status:</span>
              <span className="stat-value online">Optimal</span>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default ColonyGraphPage;
