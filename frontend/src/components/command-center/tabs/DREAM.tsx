import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useHiveData } from '../../../hooks/useHiveData';

const DREAM: React.FC = () => {
  const hive = useHiveData();
  const dreaming = hive.challenges.filter(c => c.status === 'pending');
  return (
    <div className="tab-container dream-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>💭 DREAM - Vision and Planning</h1>
          <p>Strategic roadmap and future vision
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? '#00e888' : '#ff6b6b' }}>
              {hive.online ? '● live' : hive.loading ? '○ connecting…' : '○ offline'}
            </span>
          </p>
        </header>

        <section className="dreams-live">
          <h2>🌌 The Hive Dreaming <span style={{ opacity: 0.6, fontSize: 13 }}>(open propositions in the arena)</span></h2>
          {dreaming.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no open dreams — the next heartbeat will spawn one'}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {dreaming.slice(0, 6).map((c) => (
                <li key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 13, color: '#c9b8ff' }}>“{c.proposition}”</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{c.challenger} → {c.challenged} · #{c.id}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dreams-fallen">
          <h2>🥀 Hall of Fallen Ideas <span style={{ opacity: 0.6, fontSize: 13 }}>(dreams the hive let go)</span></h2>
          {hive.fallen.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'nothing has fallen yet — every idea still stands'}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hive.fallen.slice(0, 6).map((f) => (
                <li key={f.id} style={{ padding: '6px 0', fontSize: 12, opacity: 0.75 }}>
                  “{f.proposition || '(idea)'}” <span style={{ opacity: 0.5 }}>#{f.id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="vision-section">
          <h2>Sovereign Hive Vision</h2>
          <div className="vision-card">
            <h3>14-Layer System</h3>
            <p>A comprehensive architecture spanning from physical infrastructure to meta-layer self-modification.</p>
          </div>
          <div className="vision-card">
            <h3>SEE Command Center</h3>
            <p>13-page interface covering all aspects of hive operations.</p>
          </div>
          <div className="vision-card">
            <h3>Constitutional Governance</h3>
            <p>F-001 through F-006 principles ensuring ethical and autonomous operation.</p>
          </div>
        </section>

        <section className="roadmap-section">
          <h2>Development Roadmap</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker">✅</div>
              <div className="timeline-content">
                <h3>Phase 1-3: Foundation</h3>
                <p>Entry points, pages, components, documentation</p>
                <p><em>Completed: 2026-07-09</em></p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">🔄</div>
              <div className="timeline-content">
                <h3>Phase 4: Command Center</h3>
                <p>Tab navigation, colony components, 4D math</p>
                <p><em>In Progress</em></p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">⏳</div>
              <div className="timeline-content">
                <h3>Phase 5: Federation</h3>
                <p>Constitution visualizer, memory graph, mission timeline</p>
                <p><em>Planned</em></p>
              </div>
            </div>
          </div>
        </section>

        <section className="goals-section">
          <h2>Strategic Goals</h2>
          <ol>
            <li>Complete all 13 SEE command center tabs</li>
            <li>Implement real 4D tesseract visualization</li>
            <li>Integrate all colony consoles</li>
            <li>Achieve constitutional compliance</li>
            <li>Merge to main branch</li>
          </ol>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default DREAM;
