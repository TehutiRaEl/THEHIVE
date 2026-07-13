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
          <h1>🔮 ARCANE - Advanced Features</h1>
          <p>Magic system and special capabilities
            <span style={{ marginLeft: 10, fontSize: 12, color: hive.online ? '#00e888' : '#ff6b6b' }}>
              {hive.online ? '● live' : hive.loading ? '○ connecting…' : '○ offline'}
            </span>
          </p>
        </header>

        <section className="arcane-live">
          <h2>🜂 Arcane Systems <span style={{ opacity: 0.6, fontSize: 13 }}>(live wiring status)</span></h2>
          <div className="capability-list">
            <div className="capability-item">
              <h3>Generative Voice (Workers AI)</h3>
              <p>{glyph(hive.aiBound)} · {hive.llm?.active_provider || 'simulation'}</p>
            </div>
            <div className="capability-item">
              <h3>Sovereign Memory (Vectorize)</h3>
              <p>{glyph(hive.memoryBound)} · semantic recall {hive.memoryBound ? 'active' : 'awaiting index'}</p>
            </div>
            <div className="capability-item">
              <h3>Tier-3 Engines</h3>
              <p>{hive.tier3 ? '🟢 loaded' : '⚪ —'} · {(hive.tier3?.arena_renderer as any)?.status || 'edge voxel simulation'}</p>
            </div>
            <div className="capability-item">
              <h3>Heartbeat</h3>
              <p>{hive.pulse.length ? `🟢 ${hive.pulse.length} pulses` : '⚪ awaiting first tick'}</p>
            </div>
          </div>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <h2>4D Visualization</h2>
            <p>Tesseract rendering with Option B implementation</p>
            <p><strong>Status:</strong> Implemented (stub math)</p>
          </div>
          <div className="feature-card">
            <h2>D3 Graphs</h2>
            <p>Force-directed memory and colony visualization</p>
            <p><strong>Status:</strong> Implemented</p>
          </div>
          <div className="feature-card">
            <h2>Phaser Integration</h2>
            <p>3D world rendering with Phaser 3.80</p>
            <p><strong>Status:</strong> Implemented</p>
          </div>
          <div className="feature-card">
            <h2>Real-time Updates</h2>
            <p>WebSocket and SSE event streaming</p>
            <p><strong>Status:</strong> Service available</p>
          </div>
        </section>

        <section className="magic-section">
          <h2>Arcane Capabilities</h2>
          <div className="capability-list">
            <div className="capability-item">
              <h3>Tesseract Rotation</h3>
              <p>6-plane 4D rotations with isoclinic support</p>
            </div>
            <div className="capability-item">
              <h3>Memory Mapping</h3>
              <p>Graph-based knowledge representation</p>
            </div>
            <div className="capability-item">
              <h3>Colony Intelligence</h3>
              <p>D3-powered interactive colony graphs</p>
            </div>
            <div className="capability-item">
              <h3>Space Navigation</h3>
              <p>WASD + mouse controls in all 3D views</p>
            </div>
          </div>
        </section>

        <section className="spells-section">
          <h2>Available Spells (Features)</h2>
          <table className="spell-table">
            <thead>
              <tr>
                <th>Spell</th>
                <th>Element</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tesseract Render</td>
                <td>4D Geometry</td>
                <td>High</td>
                <td>✅ Active</td>
              </tr>
              <tr>
                <td>Colony Zoom</td>
                <td>D3 Visualization</td>
                <td>Medium</td>
                <td>✅ Active</td>
              </tr>
              <tr>
                <td>Memory Graph</td>
                <td>D3 Force Layout</td>
                <td>Medium</td>
                <td>✅ Active</td>
              </tr>
              <tr>
                <td>Space Nav</td>
                <td>Three.js</td>
                <td>Low</td>
                <td>✅ Active</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default ARCANE;
