import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import ColonyZoomPanel from '../../ColonyZoomPanel';
import ColonyGrid from '../../ColonyCard/ColonyGrid';
import { useHiveData } from '../../../hooks/useHiveData';

const WORLD: React.FC = () => {
  const [showColonyPanel, setShowColonyPanel] = useState(false);
  const hive = useHiveData();

  return (
    <div className="tab-container world-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>🌍 WORLD - Global State</h1>
          <p>Real-time overview of the Sovereign Hive ecosystem
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? '#00e888' : '#ff6b6b' }}>
              {hive.online ? '● live' : hive.loading ? '○ connecting…' : '○ offline'}
            </span>
          </p>
        </header>

        <section className="world-overview">
          <h2>World Overview <span style={{ opacity: 0.6, fontSize: 13 }}>(live from the Queen)</span></h2>
          <div className="world-stats">
            <div className="stat-card">
              <h3>Colonies</h3>
              <p className="stat-value">10</p>
              <p className="stat-label">Federated</p>
            </div>
            <div className="stat-card">
              <h3>Agents</h3>
              <p className="stat-value">{hive.agents.length || '—'}</p>
              <p className="stat-label">Active</p>
            </div>
            <div className="stat-card">
              <h3>Arena</h3>
              <p className="stat-value">{hive.challenges.length || '—'}</p>
              <p className="stat-label">Challenges</p>
            </div>
            <div className="stat-card">
              <h3>Missions</h3>
              <p className="stat-value">{hive.tasks.length || '—'}</p>
              <p className="stat-label">Tasks</p>
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
          <h2>Colonies <span style={{ opacity: 0.6, fontSize: 13 }}>(federation roster, live status via /v11/debug/colony-ping)</span></h2>
          <ColonyGrid />
        </section>

        <section className="world-events">
          <h2>Recent World Events <span style={{ opacity: 0.6, fontSize: 13 }}>(live heartbeat)</span></h2>
          {hive.pulse.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'the hive has not pulsed yet — the heartbeat runs every 30 min'}</p>
          ) : (
            <ul className="event-list">
              {hive.pulse.slice(0, 8).map((p, i) => (
                <li className="event-item" key={i}>
                  <span className="event-time">{(p.ts || '').slice(0, 19).replace('T', ' ')}</span>
                  <span className="event-text">{p.detail || p.action}</span>
                </li>
              ))}
            </ul>
          )}
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
