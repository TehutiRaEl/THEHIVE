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
          <h1>🏛️ GOVERN - Administrative Controls</h1>
          <p>System administration and governance
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? '#00e888' : '#ff6b6b' }}>
              {hive.online ? '● live' : '○ offline'}
            </span>
          </p>
        </header>

        <section className="governance-live">
          <h2>⚖ Governance Log <span style={{ opacity: 0.6, fontSize: 13 }}>(live from the Queen)</span></h2>
          {hive.governance.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no governance events yet'}</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hive.governance.slice(0, 12).map((g, i) => (
                <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                  <span style={{ color: '#88aaff', fontWeight: 600 }}>{g.action}</span>
                  <span style={{ marginLeft: 8, color: '#ffbb33', fontSize: 11 }}>{g.article}</span>
                  {g.ts && <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 11 }}>{(g.ts || '').slice(0, 19).replace('T', ' ')}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-section">
          <h2>Administration</h2>
          <div className="admin-cards">
            <div className="admin-card">
              <h3>User Management</h3>
              <ul>
                <li>Add Agent</li>
                <li>Remove Agent</li>
                <li>Modify Permissions</li>
              </ul>
            </div>
            <div className="admin-card">
              <h3>System Settings</h3>
              <ul>
                <li>Configuration</li>
                <li>Environment Variables</li>
                <li>Feature Flags</li>
              </ul>
            </div>
            <div className="admin-card">
              <h3>Monitoring</h3>
              <ul>
                <li>System Health</li>
                <li>Performance Metrics</li>
                <li>Error Logs</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="governance-section">
          <h2>Governance</h2>
          <div className="governance-grid">
            <div className="governance-card">
              <h3>Constitutional Compliance</h3>
              <p>Monitor and enforce constitutional laws</p>
              <button>Run Compliance Check</button>
            </div>
            <div className="governance-card">
              <h3>Audit Log</h3>
              <p>Track all administrative actions</p>
              <button>View Audit Log</button>
            </div>
            <div className="governance-card">
              <h3>Vote Management</h3>
              <p>Conduct votes on constitutional matters</p>
              <button>Create Vote</button>
            </div>
          </div>
        </section>

        <section className="controls-section">
          <h2>System Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>System</h3>
              <button className="control-btn">Restart</button>
              <button className="control-btn">Shutdown</button>
              <button className="control-btn">Backup</button>
            </div>
            <div className="control-group">
              <h3>Agents</h3>
              <button className="control-btn">Start All</button>
              <button className="control-btn">Stop All</button>
              <button className="control-btn">Restart All</button>
            </div>
            <div className="control-group">
              <h3>Colonies</h3>
              <button className="control-btn">Sync All</button>
              <button className="control-btn">Health Check</button>
              <button className="control-btn">Update All</button>
            </div>
          </div>
        </section>

        <section className="status-section">
          <h2>System Status</h2>
          <table className="status-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Status</th>
                <th>Last Check</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Frontend</td>
                <td><span className="status-online">Online</span></td>
                <td>2026-07-10 00:10</td>
                <td><button>Restart</button></td>
              </tr>
              <tr>
                <td>Backend</td>
                <td><span className="status-online">Online</span></td>
                <td>2026-07-10 00:10</td>
                <td><button>Restart</button></td>
              </tr>
              <tr>
                <td>Database</td>
                <td><span className="status-online">Online</span></td>
                <td>2026-07-10 00:10</td>
                <td><button>Backup</button></td>
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
