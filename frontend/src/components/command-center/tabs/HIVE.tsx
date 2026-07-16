import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useHiveData } from '../../../hooks/useHiveData';

const HIVE: React.FC = () => {
  const hive = useHiveData();

  return (
    <div className="tab-container hive-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>🏰 HIVE — Main Dashboard</h1>
          <p>
            Central hub for Sovereign Hive operations
            <span
              style={{
                marginLeft: 12,
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                background: hive.online ? 'rgba(0,232,136,0.14)' : 'rgba(255,68,68,0.14)',
                color: hive.online ? '#00e888' : '#ff6b6b',
                border: `1px solid ${hive.online ? '#00e88855' : '#ff444455'}`,
              }}
            >
              {hive.loading ? '◍ connecting…' : hive.online ? '● live Queen' : '○ simulation / offline'}
            </span>
          </p>
        </header>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h2>System Overview</h2>
            <p><strong>Status:</strong> {hive.health?.status ?? (hive.online ? 'healthy' : '—')}</p>
            <p><strong>Version:</strong> {hive.health?.version ?? '—'}</p>
            <p><strong>Runtime:</strong> {hive.health?.runtime ?? '—'}</p>
            <p><strong>Sovereign memory:</strong> {hive.memoryBound ? '🧠 online' : 'not yet provisioned'}</p>
          </div>

          <div className="dashboard-card">
            <h2>Agents <span style={{ opacity: 0.6, fontSize: 13 }}>({hive.agents.length})</span></h2>
            {hive.agents.length === 0 ? (
              <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no agents reachable'}</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {hive.agents.map((a) => (
                  <li key={a.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>⬡ {a.name}</span>
                    {a.elo != null && <span style={{ opacity: 0.7 }}>{a.elo} ELO</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Arena <span style={{ opacity: 0.6, fontSize: 13 }}>({hive.challenges.length})</span></h2>
            {hive.challenges.length === 0 ? (
              <p style={{ opacity: 0.6 }}>no active challenges</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {hive.challenges.slice(0, 4).map((c) => (
                  <li key={c.id} style={{ padding: '4px 0', fontSize: 13 }}>
                    <strong>#{c.id}</strong> {c.challenger} vs {c.challenged}
                    <span style={{
                      marginLeft: 6, fontSize: 11,
                      color: c.status === 'completed' ? '#00e888' : '#ffbb33',
                    }}>
                      {c.status}{c.winner ? ` · ${c.winner} won` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Team</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>✅ Mistral — Frontend / UI</li>
              <li>✅ Claude — Backend / Harness</li>
              <li>✅ Grok — Strategy</li>
            </ul>
          </div>
        </section>

        <section className="recent-activity">
          <h2>Heartbeat — what the hive did on its own</h2>
          {hive.pulse.length === 0 ? (
            <p style={{ opacity: 0.6 }}>
              {hive.loading ? 'loading…' : 'no pulse yet — the cron fills this every 30 min'}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hive.pulse.slice(0, 6).map((p, i) => (
                <li key={i} style={{ padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ opacity: 0.55, fontSize: 12, marginRight: 8 }}>
                    {(p.ts || '').slice(5, 16).replace('T', ' ')}
                  </span>
                  <span style={{ fontSize: 13 }}>{p.detail}</span>
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

export default HIVE;
