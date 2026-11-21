import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useHiveData } from '../../../hooks/useHiveData';

const GOVERN: React.FC = () => {
  const hive = useHiveData();
  return (
    <div className="tab-container govern-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>🏛️ GOVERN</h1>
          <p>The governance log and the Hive's live status
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? 'var(--legacy-ok)' : 'var(--legacy-bad)' }}>
              {hive.online ? '● live' : '○ offline'}
            </span>
          </p>
        </header>

        <section id="governance-log" className="governance-live">
          <h2>⚖ Governance Log <span style={{ opacity: 0.6, fontSize: 13 }}>(live from the Queen)</span></h2>
          {hive.governance.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no governance events yet'}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hive.governance.slice(0, 12).map((g, i) => (
                <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                  <span style={{ color: '#88aaff', fontWeight: 600 }}>{g.action}</span>
                  <span style={{ marginLeft: 8, color: 'var(--legacy-warn)', fontSize: 11 }}>{g.article}</span>
                  {g.ts && <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 11 }}>{(g.ts || '').slice(0, 19).replace('T', ' ')}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="status-section">
          <h2>System Status</h2>
          <table className="status-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Frontend</td>
                <td><span className="status-online">Online</span></td>
              </tr>
              <tr>
                <td>Edge Worker (/v11)</td>
                <td><span className={hive.online ? 'status-online' : 'status-offline'}>{hive.online ? 'Online' : 'Unreachable'}</span></td>
              </tr>
              <tr>
                <td>Vectorize memory</td>
                <td><span className={hive.memoryBound ? 'status-online' : 'status-offline'}>{hive.memoryBound ? 'Bound' : 'Not provisioned'}</span></td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default GOVERN;
