import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useConstitutionStore } from '../../../stores/constitutionStore';
import { useHiveData } from '../../../hooks/useHiveData';

const SOUL: React.FC = () => {
  const { constitution, violations, checkLaw } = useConstitutionStore();
  const hive = useHiveData();

  const constitutionalLaws = [
    {
      id: 'F-001',
      name: 'Data Sovereignty',
      description: 'All data owned and controlled by user',
      status: 'IMPLEMENTED',
      compliance: true
    },
    {
      id: 'F-002',
      name: 'Value-Weighted Wealth',
      description: 'Economic systems respect value',
      status: 'IMPLEMENTED',
      compliance: true
    },
    {
      id: 'F-003',
      name: 'Autonomy',
      description: 'Full autonomous operation',
      status: 'PENDING',
      compliance: false
    },
    {
      id: 'F-004',
      name: 'Explainability',
      description: 'All actions transparent and explainable',
      status: 'IMPLEMENTED',
      compliance: true
    },
    {
      id: 'F-005',
      name: 'Conflict Priority',
      description: 'Conflict resolution mechanisms',
      status: 'PENDING',
      compliance: false
    },
    {
      id: 'F-006',
      name: 'Non-Penalization',
      description: 'No penalties for exploration or mistakes',
      status: 'IMPLEMENTED',
      compliance: true
    },
  ];

  return (
    <div className="tab-container soul-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>❤️ SOUL - Constitutional Governance</h1>
          <p>Ethical framework and compliance monitoring</p>
        </header>

        <section className="constitution-section">
          <h2>Constitution</h2>
          <div className="constitution-card">
            <h3>Sovereign Hive Constitution</h3>
            <p><strong>Version:</strong> {constitution?.version || '1.0.0'}</p>
            <p><strong>Last Updated:</strong> {constitution?.lastUpdated || '2026-07-08'}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
        </section>

        <section className="laws-section">
          <h2>Constitutional Laws</h2>
          <div className="laws-grid">
            {constitutionalLaws.map(law => (
              <div key={law.id} className={`law-card ${law.compliance ? 'compliant' : 'non-compliant'}`}>
                <div className="law-header">
                  <h3>{law.id}: {law.name}</h3>
                  <span className={`law-status ${law.status.toLowerCase()}`}>
                    {law.status}
                  </span>
                </div>
                <p>{law.description}</p>
                <div className="law-actions">
                  <button onClick={() => checkLaw(law.id)}>
                    Verify Compliance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="soul-leaderboard">
          <h2>💎 Soul Ledger <span style={{ opacity: 0.6, fontSize: 13 }}>(live)</span></h2>
          {hive.soulBoard.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no soul data reachable'}</p>
          ) : (
            <ol style={{ paddingLeft: 20, margin: 0 }}>
              {hive.soulBoard.slice(0, 8).map((s) => (
                <li key={s.agent} style={{ padding: '3px 0', fontSize: 13 }}>
                  <strong style={{ color: '#a0e8ff' }}>{s.agent}</strong>
                  <span style={{ marginLeft: 8, color: '#00cc88' }}>{(s.soul ?? 0).toFixed(1)} Ψ</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="roadmap-section">
          <h2>🌱 The Roadmap of Becoming <span style={{ opacity: 0.6, fontSize: 13 }}>(live — F-008D / F-009E)</span></h2>
          <p style={{ opacity: 0.6, fontSize: 12, marginTop: -4 }}>
            Germination → Mycelium → Fruiting → Transformation → Senescence → Seed. Driven by each
            agent's real Soul score; F-008D: "the cycle is infinite." Stage thresholds are provisional
            and uncalibrated — there isn't yet a mature distribution of Soul values to calibrate against.
          </p>
          {!hive.roadmap || hive.roadmap.agents.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no roadmap data reachable'}</p>
          ) : (
            <>
              {hive.roadmap.hoard && (
                <div className="roadmap-hoard-card" style={{ marginBottom: 14, padding: '10px 12px', border: '1px solid rgba(139,92,246,0.35)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <strong>🐝 The Hoard <span style={{ opacity: 0.6, fontWeight: 400 }}>(aggregate rollup, not its own tracked entity)</span></strong>
                    <span style={{ opacity: 0.75 }}>{hive.roadmap.hoard.stage} → {hive.roadmap.hoard.nextStage}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${hive.roadmap.hoard.progressPct}%`, background: 'linear-gradient(90deg,#8b5cf6,#00e5ff)' }} />
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
                    {hive.roadmap.hoard.agentCount} active agent(s) · mean soul {hive.roadmap.hoard.soul.toFixed(1)} Ψ · {hive.roadmap.hoard.progressPct}% to next stage
                  </div>
                </div>
              )}
              <div className="roadmap-agent-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hive.roadmap.agents.map((a) => (
                  <div key={a.agent} style={{ fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: '#a0e8ff' }}>{a.agent}</strong>
                      <span style={{ opacity: 0.75 }}>{a.stage} → {a.nextStage}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${a.progressPct}%`, background: 'linear-gradient(90deg,#00cc88,#00e5ff)' }} />
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                      {a.soul.toFixed(1)} Ψ · {a.progressPct}%{a.soulToNext > 0 ? ` · ${a.soulToNext.toFixed(1)} Ψ to next stage` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="violations-section">
          <h2>Violations</h2>
          {violations.length > 0 ? (
            <ul className="violation-list">
              {violations.map(violation => (
                <li key={violation.id} className="violation-item">
                  <strong>{violation.law}:</strong> {violation.message}
                  <span className="violation-severity">
                    {violation.severity}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-violations">✅ No violations detected</p>
          )}
        </section>

        <section className="compliance-section">
          <h2>Compliance Dashboard</h2>
          <div className="compliance-metrics">
            <div className="metric-card">
              <h3>Overall Compliance</h3>
              <p className="compliance-score">
                {constitutionalLaws.filter(l => l.compliance).length} / {constitutionalLaws.length}
              </p>
              <p>Laws Compliant</p>
            </div>
            <div className="metric-card">
              <h3>Violations</h3>
              <p className="violation-count">{violations.length}</p>
              <p>Active Issues</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default SOUL;
