import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import RoadmapAvatar from '../../kai-os/RoadmapAvatar';
import { useHiveData } from '../../../hooks/useHiveData';

const SOUL: React.FC = () => {
  const hive = useHiveData();

  return (
    <div className="tab-container soul-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>❤️ SOUL - Constitutional Governance</h1>
          <p>Ethical framework and compliance monitoring</p>
        </header>

        <section className="constitution-section">
          <h2>The law</h2>
          <p style={{ opacity: 0.8, fontSize: 13 }}>
            The constitution, <code>soul.md</code> (F-001 to F-006), is shown live in the Constitution panel in the left
            menu. This page no longer carries its own copy of the laws, their statuses, or a compliance score: none of
            them were measured.
          </p>
        </section>

        <section className="soul-leaderboard">
          <h2>💎 Soul Ledger <span style={{ opacity: 0.6, fontSize: 13 }}>(arena points from /v11/wallet/leaderboard/soul; the SOUL economy is a later DAO phase, so treat these numbers as mock)</span></h2>
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
          <h2>🌱 The Roadmap of Becoming <span style={{ opacity: 0.6, fontSize: 13 }}>(driven by the arena-point ledger above, which is mock until the DAO phase)</span></h2>
          <p style={{ opacity: 0.6, fontSize: 12, marginTop: -4 }}>
            Germination → Mycelium → Fruiting → Transformation → Senescence → Seed. Driven by each
            agent's arena-point score. Stage thresholds are provisional and uncalibrated.
          </p>
          {!hive.roadmap || hive.roadmap.agents.length === 0 ? (
            <p style={{ opacity: 0.6 }}>{hive.loading ? 'loading…' : 'no roadmap data reachable'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {hive.roadmap.hoard && (
                <div>
                  <div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>
                    🐝 The Hoard — {hive.roadmap.hoard.agentCount} active agent(s), aggregate rollup (not its own tracked entity)
                  </div>
                  <RoadmapAvatar
                    entry={{ ...hive.roadmap.hoard, agent: 'The Hoard' }}
                    size="large"
                    emphasize
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {hive.roadmap.agents.map((a) => (
                  <RoadmapAvatar key={a.agent} entry={a} size="medium" />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default SOUL;
