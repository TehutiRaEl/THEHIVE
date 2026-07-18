import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import LiveArenaViewer from '../../LiveArenaViewer';
import PlannedControl from '../../PlannedControl';
import { useHiveData } from '../../../hooks/useHiveData';

const ARENA: React.FC = () => {
  const hive = useHiveData();
  const active = hive.challenges.filter((c) => c.status !== 'completed');
  // Root cause: LiveArenaViewer requires a challengeId to load any frames at
  // all — it was rendered with none, so the viewer sat permanently empty no
  // matter how much real arena data existed. Default to the most recent
  // challenge; clicking a row below re-targets the viewer at that one.
  const [viewedId, setViewedId] = useState<number | undefined>(hive.challenges[0]?.id);
  const effectiveId = viewedId ?? hive.challenges[0]?.id;
  return (
    <div className="tab-container arena-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>⚔️ ARENA - Competition</h1>
          <p>Real-time competitive environment visualization</p>
        </header>

        <section className="arena-visualization">
          <div className="arena-container">
            <LiveArenaViewer challengeId={effectiveId} autoPlay />
          </div>
        </section>

        <section className="arena-controls">
          <h2>Arena Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>View Mode</h3>
              <div className="view-buttons">
                <PlannedControl label="First Person" />
                <PlannedControl label="Third Person" />
                <PlannedControl label="Top Down" />
                <PlannedControl label="Isometric" />
              </div>
            </div>

            <div className="control-group">
              <h3>Projection</h3>
              <div className="projection-buttons">
                <PlannedControl label="2D" />
                <PlannedControl label="3D" />
                <PlannedControl label="Voxel" />
              </div>
            </div>

            <div className="control-group">
              <h3>Rendering</h3>
              <div className="render-buttons">
                <PlannedControl label="Wireframe" />
                <PlannedControl label="Solid" />
                <PlannedControl label="Textured" />
              </div>
            </div>
          </div>
        </section>

        <section className="arena-info">
          <h2>Arena Information</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Technology</h3>
              <p>Three.js + @react-three/fiber + @react-three/drei</p>
            </div>
            <div className="info-card">
              <h3>Features</h3>
              <p>Real-time data streaming</p>
              <p>Voxel-based rendering</p>
              <p>Interactive camera controls</p>
            </div>
            <div className="info-card">
              <h3>Data Source</h3>
              <p>/v11/arena/projection</p>
            </div>
          </div>
        </section>

        <section className="arena-stats">
          <h2>Live Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Agents</h3>
              <p className="stat-value">{hive.agents.length || '—'}</p>
            </div>
            <div className="stat-card">
              <h3>Total Challenges</h3>
              <p className="stat-value">{hive.challenges.length || '—'}</p>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <p className="stat-value">{active.length}</p>
            </div>
            <div className="stat-card">
              <h3>Queen</h3>
              <p className="stat-value" style={{ fontSize: 16 }}>
                {hive.loading ? '◍' : hive.online ? '● live' : '○ offline'}
              </p>
            </div>
          </div>
        </section>

        <section className="arena-challenges">
          <h2>Live Challenges — the arguments the hive is fighting over</h2>
          {hive.challenges.length === 0 ? (
            <p style={{ opacity: 0.6 }}>
              {hive.loading ? 'loading…' : 'no challenges yet — the heartbeat spawns one every 30 min'}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hive.challenges.slice(0, 8).map((c) => (
                <li
                  key={c.id}
                  onClick={() => setViewedId(c.id)}
                  title="View this challenge's projection above"
                  style={{
                    padding: '10px 12px', margin: '8px 0', borderRadius: 8, cursor: 'pointer',
                    background: c.id === effectiveId ? 'rgba(0,232,136,0.08)' : 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${c.status === 'completed' ? '#00e888' : '#ffbb33'}`,
                    outline: c.id === effectiveId ? '1px solid rgba(0,232,136,0.4)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <strong>#{c.id} · {c.challenger} vs {c.challenged}</strong>
                    <span style={{ color: c.status === 'completed' ? '#00e888' : '#ffbb33' }}>
                      {c.status}{c.winner ? ` · ${c.winner} prevailed` : ''}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85, fontStyle: 'italic' }}>“{c.proposition}”</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default ARENA;
