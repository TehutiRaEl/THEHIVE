import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import PlannedControl from '../../PlannedControl';
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

        <section id="governance-log" className="governance-live">
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
              <PlannedControl label="Run Compliance Check" />
            </div>
            <div className="governance-card">
              <h3>Audit Log</h3>
              <p>Track all administrative actions</p>
              <button onClick={() => document.getElementById('governance-log')?.scrollIntoView({ behavior: 'smooth' })}>
                View Audit Log
              </button>
            </div>
            <div className="governance-card">
              <h3>Vote Management</h3>
              <p>Conduct votes on constitutional matters</p>
              <PlannedControl label="Create Vote" />
            </div>
          </div>
        </section>

        <section className="controls-section">
          <h2>System Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>System</h3>
              <PlannedControl label="Restart" className="control-btn" />
              <PlannedControl label="Shutdown" className="control-btn" />
              <PlannedControl label="Backup" className="control-btn" />
            </div>
            <div className="control-group">
              <h3>Agents</h3>
              <PlannedControl label="Start All" className="control-btn" />
              <PlannedControl label="Stop All" className="control-btn" />
              <PlannedControl label="Restart All" className="control-btn" />
            </div>
            <div className="control-group">
              <h3>Colonies</h3>
              <PlannedControl label="Sync All" className="control-btn" />
              <PlannedControl label="Health Check" className="control-btn" />
              <PlannedControl label="Update All" className="control-btn" />
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
                <td>{new Date().toISOString().slice(0, 16).replace('T', ' ')}</td>
                <td><PlannedControl label="Restart" /></td>
              </tr>
              <tr>
                <td>Edge Worker (/v11)</td>
                <td><span className={hive.online ? 'status-online' : 'status-offline'}>{hive.online ? 'Online' : 'Unreachable'}</span></td>
                <td>{hive.loading ? 'checking…' : 'just now'}</td>
                <td><PlannedControl label="Restart" /></td>
              </tr>
              <tr>
                <td>Vectorize memory</td>
                <td><span className={hive.memoryBound ? 'status-online' : 'status-offline'}>{hive.memoryBound ? 'Bound' : 'Not provisioned'}</span></td>
                <td>{hive.loading ? 'checking…' : 'just now'}</td>
                <td><PlannedControl label="Backup" /></td>
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
