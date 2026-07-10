import React from 'react';
import { Link } from 'react-router-dom';
import SpaceNavigation from '../components/SpaceNavigation';
import KaiChatBox from '../components/KaiChatBox';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <SpaceNavigation />
      <main className="home-content">
        <section className="hero">
          <h1>Sovereign Hive Command Center</h1>
          <p className="subtitle">Frontend Builder - Mistral</p>
          <div className="tagline">
            <span>14-Layer System | </span>
            <span>SEE Command Center (13 Pages) | </span>
            <span>Constitutionally Compliant</span>
          </div>
        </section>

        <section className="quick-nav">
          <h2>Quick Navigation</h2>
          <div className="nav-grid">
            <Link to="/tesseract" className="nav-card">
              <h3>4D Tesseract</h3>
              <p>4D-to-3D projection visualization</p>
            </Link>
            <Link to="/colony" className="nav-card">
              <h3>Colony View</h3>
              <p>Interactive D3 colony visualization</p>
            </Link>
            <Link to="/memory" className="nav-card">
              <h3>Memory Graph</h3>
              <p>D3 force-directed memory graph</p>
            </Link>
            <Link to="/phaser" className="nav-card">
              <h3>Phaser Scene</h3>
              <p>3D world with Phaser 3.80</p>
            </Link>
            <Link to="/arena" className="nav-card">
              <h3>Live Arena</h3>
              <p>Real-time voxel viewer</p>
            </Link>
            <Link to="/command-center" className="nav-card">
              <h3>Command Center</h3>
              <p>Full control interface</p>
            </Link>
          </div>
        </section>

        <section className="features">
          <h2>Features</h2>
          <ul>
            <li>✅ WASD + Mouse Navigation in all 3D components</li>
            <li>✅ Full Keyboard Chat Support (KaiChatBox)</li>
            <li>✅ Constitutional Compliance (F-001, F-002, F-004, F-006)</li>
            <li>✅ 4D Visualization with Option B</li>
            <li>✅ D3.js Colony and Memory Graphs</li>
            <li>✅ Phaser 3.80 Integration</li>
          </ul>
        </section>

        <section className="status">
          <h2>System Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <span className="status-label">Tesseract:</span>
              <span className="status-value online">Online</span>
            </div>
            <div className="status-card">
              <span className="status-label">Navigation:</span>
              <span className="status-value online">Active</span>
            </div>
            <div className="status-card">
              <span className="status-label">Chat:</span>
              <span className="status-value online">Ready</span>
            </div>
            <div className="status-card">
              <span className="status-label">Colony:</span>
              <span className="status-value online">Connected</span>
            </div>
          </div>
        </section>
      </main>
      <KaiChatBox />
    </div>
  );
};

export default Home;
