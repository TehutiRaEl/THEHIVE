import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import LiveArenaViewer from '../../LiveArenaViewer';

const ARENA: React.FC = () => {
  return (
    <div className="tab-container arena-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>⚔️ ARENA - Competition</h1>
          <p>Real-time competitive environment visualization</p>
        </header>

        <section className="arena-visualization">
          <div className="arena-container">
            <LiveArenaViewer />
          </div>
        </section>

        <section className="arena-controls">
          <h2>Arena Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>View Mode</h3>
              <div className="view-buttons">
                <button>First Person</button>
                <button>Third Person</button>
                <button>Top Down</button>
                <button>Isometric</button>
              </div>
            </div>
            
            <div className="control-group">
              <h3>Projection</h3>
              <div className="projection-buttons">
                <button>2D</button>
                <button>3D</button>
                <button>Voxel</button>
              </div>
            </div>

            <div className="control-group">
              <h3>Rendering</h3>
              <div className="render-buttons">
                <button>Wireframe</button>
                <button>Solid</button>
                <button>Textured</button>
              </div>
            </div>
          </div>
        </section>

        <section className="arena-info">
          <h2>Arena Information</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Technology</h3>
              <p>Three.js + @react-three/fiber + @react-three/drei</p>
            </div>
            <div className="info-card">
              <h3>Features</h3>
              <p>Real-time data streaming</p>
              <p>Voxel-based rendering</p>
              <p>Interactive camera controls</p>
            </div>
            <div className="info-card">
              <h3>Data Source</h3>
              <p>/v11/arena/projection</p>
            </div>
          </div>
        </section>

        <section className="arena-stats">
          <h2>Live Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Active Agents</h3>
              <p className="stat-value">7</p>
            </div>
            <div className="stat-card">
              <h3>Voxels Rendered</h3>
              <p className="stat-value">12,458</p>
            </div>
            <div className="stat-card">
              <h3>FPS</h3>
              <p className="stat-value">60</p>
            </div>
            <div className="stat-card">
              <h3>Latency</h3>
              <p className="stat-value">12ms</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default ARENA;
