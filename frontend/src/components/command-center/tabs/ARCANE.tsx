import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useHiveData } from '../../../hooks/useHiveData';

const ARCANE: React.FC = () => {
  const hive = useHiveData();
  const glyph = (on: boolean) => (on ? '🟢 bound' : '⚪ dormant');
  return (
    <div className="tab-container arcane-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>🔮 ARCANE - Live wiring status</h1>
          <p>Which of the Hive's engines are bound right now
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? 'var(--legacy-ok)' : 'var(--legacy-bad)' }}>
              {hive.online ? '● live' : hive.loading ? '○ connecting…' : '○ offline'}
            </span>
          </p>
        </header>

        <section className="arcane-live">
          <h2>🜂 Arcane Systems <span style={{ opacity: 0.6, fontSize: 13 }}>(live wiring status)</span></h2>
          <div className="capability-list">
            <div className="capability-item">
              <h3>Generative Voice (Workers AI)</h3>
              <p>{glyph(hive.aiBound)} · {hive.llm?.active_provider || 'unavailable'}</p>
            </div>
            <div className="capability-item">
              <h3>Sovereign Memory (Vectorize)</h3>
              <p>{glyph(hive.memoryBound)} · semantic recall {hive.memoryBound ? 'active' : 'awaiting index'}</p>
            </div>
            <div className="capability-item">
              <h3>Tier-3 Engines</h3>
              <p>{hive.tier3 ? '🟢 loaded' : '⚪ —'} · {(hive.tier3?.arena_renderer as { status?: string } | undefined)?.status || 'no status reported'}</p>
            </div>
            <div className="capability-item">
              <h3>Heartbeat</h3>
              <p>{hive.pulse.length ? `🟢 ${hive.pulse.length} pulses` : '⚪ awaiting first tick'}</p>
            </div>
          </div>
        </section>

      </main>

      <KaiChatBox />
    </div>
  );
};

export default ARCANE;
