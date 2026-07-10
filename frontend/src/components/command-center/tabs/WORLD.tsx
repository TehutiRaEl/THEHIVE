import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import ColonyZoomPanel from '../../ColonyZoomPanel';

const WORLD: React.FC = () => {
  const [showColonyPanel, setShowColonyPanel] = useState(false);

  return (
    <div className="tab-container world-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🌍 WORLD - Global State</h1>
          <p>Real-time overview of the Sovereign Hive ecosystem</p>
        </header>

        <section className="world-overview">
          <h2>World Overview</h2>
          <div className="world-stats">
            <div className="stat-card">
              <h3>Colonies</h3>
              <p className="stat-value">10</p>
              <p className="stat-label">Active</p>
            </div>
            <div className="stat-card">
              <h3>Agents</h3>
              <p className="stat-value">7</p>
              <p className="stat-label">Online</p>
            </div>
            <div className="stat-card">
              <h3>Memory Nodes</h3>
              <p className="stat-value">42</p>
              <p className="stat-label">Indexed</p>
            </div>
            <div className="stat-card">
              <h3>Missions</h3>
              <p className="stat-value">25</p>
              <p className="stat-label">Active</p>
            </div>
          </div>
        </section>

        <section className="world-visualization">
          <h2>Global Visualization</h2>
          <div className="visualization-actions">
            <button onClick={() => setShowColonyPanel(true)} className="btn-primary">
              View Colony Graph
            </button>
            <button className="btn-secondary">
              View Memory Graph
            </button>
            <button className="btn-secondary">
              View 4D Tesseract
            </button>
          </div>
        </section>

        <section className="world-map">
          <h2>Colony Map</h2>
          <div className="map-placeholder">
            <p>Interactive colony map - Click "View Colony Graph" above</p>
          </div>
        </section>

        <section className="world-events">
          <h2>Recent World Events</h2>
          <ul className="event-list">
            <li className="event-item">
              <span className="event-time">2026-07-09 22:28</span>
              <span className="event-text">Mistral added 3 core pages</span>
            </li>
            <li className="event-item">
              <span className="event-time">2026-07-09 22:00</span>
              <span className="event-text">Entry points created</span>
            </li>
            <li className="event-item">
              <span className="event-time">2026-07-08 20:15</span>
              <span className="event-text">Claude added scaffolding</span>
            </li>
          </ul>
        </section>

        {showColonyPanel && (
          <div className="modal-overlay" onClick={() => setShowColonyPanel(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowColonyPanel(false)}>
                &times;
              </button>
              <ColonyZoomPanel />
            </div>
          </div>
        )}
      </main>

      <KaiChatBox />
    </div>
  );
};

export default WORLD;
