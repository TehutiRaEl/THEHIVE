import React, { useCallback, useEffect, useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useHiveData } from '../../../hooks/useHiveData';
import { colonies } from '../../../data/colonies';
import { API_BASE_URL } from '../../../utils/constants';

// The federation: THEHIVE (this Queen node) and the six colonies. Three honest sources:
//   - the roster, roles, layers and repos: src/data/colonies.ts (the Hive's own federation table)
//   - THEHIVE's own status and agent count: GET /v11/health and /v11/agents (via useHiveData)
//   - what the colonies have reported: GET /v11/colony/reports (rows a colony posted to the Queen)
// A colony's live health is NOT visible from a browser (the Worker cannot reach colony origins;
// it is checked by the colony-health GitHub workflow), and this page says so instead of showing a
// dot. Display only: no button here starts, scans or sends anything. Guarded by
// tests/unit/test_frontend_unreachable_tabs.py.

interface ColonyReport { id: number; ts: string; colony: string; kind?: string; body?: string }

const WOW: React.FC = () => {
  const hive = useHiveData();
  const [reports, setReports] = useState<{ loading: boolean; rows: ColonyReport[] | null; at: Date | null }>({ loading: true, rows: null, at: null });

  const load = useCallback(async () => {
    setReports((r) => ({ ...r, loading: true }));
    try {
      const r = await fetch(`${API_BASE_URL}/v11/colony/reports?limit=20`, { signal: AbortSignal.timeout(8000) });
      const d = r.ok ? await r.json() : null;
      setReports({ loading: false, rows: Array.isArray(d?.reports) ? d.reports : null, at: new Date() });
    } catch {
      setReports({ loading: false, rows: null, at: new Date() });
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const countFor = (name: string) => reports.rows?.filter((r) => r.colony === name).length;

  return (
    <div className="tab-container wow-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>🌐 Colonies - the federation</h1>
          <p>THEHIVE (the Queen node) and the six colonies, with what they have reported</p>
        </header>

        <section className="wow-colonies">
          <h2>Roster</h2>
          <div className="colonies-list">
            <div className="colony-card">
              <h3>THEHIVE</h3>
              <p className="colony-type">Queen node · this Command Center</p>
              <p className={hive.online ? 'status-online' : 'status-offline'}>
                Status: {hive.loading ? 'checking…' : hive.online ? '● answering' : '○ unreachable'}
              </p>
              <p className="colony-agents">Agents: {hive.online ? hive.agents.length : 'no data'}</p>
            </div>
            {colonies.map((c) => {
              const n = countFor(c.name);
              return (
                <div className="colony-card" key={c.id}>
                  <h3>{c.icon} {c.name}</h3>
                  <p className="colony-type">{c.role} · {c.language}</p>
                  <p style={{ fontSize: 12, opacity: 0.8 }}>{c.description}</p>
                  <p className="colony-status" style={{ opacity: 0.7 }}>
                    Live health: not visible from the browser (checked by the colony-health workflow)
                  </p>
                  <p className="colony-agents">
                    Reports to the Queen (latest 20 overall): {reports.rows === null ? 'no data' : n}
                  </p>
                  <a href={c.repoUrl} target="_blank" rel="noopener noreferrer">{c.repo} ↗</a>
                </div>
              );
            })}
          </div>
        </section>

        <section className="wow-quick-actions">
          <h2>
            Latest colony reports{' '}
            <button type="button" className="btn-secondary" onClick={load} disabled={reports.loading} style={{ marginLeft: 8 }}>
              {reports.loading ? 'Reading…' : 'Reload'}
            </button>
          </h2>
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Live from <code>GET /v11/colony/reports</code>{reports.at ? ` · read ${reports.at.toLocaleTimeString()}` : ''}. Display only.
          </p>
          {reports.loading && reports.rows === null ? (
            <p style={{ opacity: 0.7 }}>Reading…</p>
          ) : reports.rows === null ? (
            <p style={{ opacity: 0.8 }}>No data: the Hive did not answer for colony reports. Nothing is shown in its place.</p>
          ) : reports.rows.length === 0 ? (
            <p style={{ opacity: 0.8 }}>No colony has reported to the Queen yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {reports.rows.map((r) => (
                <li key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid rgb(var(--c-white) / 0.1)' }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{r.ts} · {r.colony}{r.kind ? ` · ${r.kind}` : ''}</div>
                  {r.body ? <div style={{ fontSize: 13 }}>{String(r.body).slice(0, 300)}</div> : null}
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

export default WOW;
