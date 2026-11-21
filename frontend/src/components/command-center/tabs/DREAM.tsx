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
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? 'var(--legacy-ok)' : 'var(--legacy-bad)' }}>
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

        <section className="roadmap-section">
          <h2>Development Roadmap</h2>
          {/* Was a hand-written timeline frozen at 2026-07-09 that disagreed with the
              real roadmap panel (task 30, 2026-08-04) — now the same live source
              (GET /v11/roadmap/development) instead of a second copy that can drift. */}
          {hive.developmentRoadmap ? (
            <div className="timeline">
              {hive.developmentRoadmap.inProgress.length === 0 ? (
                <div className="timeline-item">
                  <div className="timeline-marker">·</div>
                  <div className="timeline-content"><p>Nothing in progress right now.</p></div>
                </div>
              ) : hive.developmentRoadmap.inProgress.map((item) => (
                <div className="timeline-item" key={item.title}>
                  <div className="timeline-marker">🔄</div>
                  <div className="timeline-content">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <p><em>{item.statusLabel}</em></p>
                  </div>
                </div>
              ))}
              {hive.developmentRoadmap.snapshot.founderActionsOutstanding > 0 && (
                <div className="timeline-item">
                  <div className="timeline-marker">⏳</div>
                  <div className="timeline-content">
                    <p>{hive.developmentRoadmap.snapshot.founderActionsOutstanding} founder action(s) outstanding — see the full Roadmap panel for detail.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'roadmap unavailable — edge unreachable'}</p>
          )}
        </section>

      </main>

      <KaiChatBox />
    </div>
  );
};

export default DREAM;
