import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import TesseractRenderer from '../../TesseractRenderer';

const FOUR_D: React.FC = () => {
  return (
    <div className="tab-container 4d-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🔲 4D - Tesseract Visualization</h1>
          <p>4D-to-3D projection with Option B implementation</p>
        </header>

        <section className="visualization-section">
          <div className="tesseract-container">
            <TesseractRenderer />
          </div>
        </section>

        <section className="controls-section">
          <h2>4D Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>Rotation Planes</h3>
              <div className="plane-buttons">
                <button>XY Plane</button>
                <button>XZ Plane</button>
                <button>XW Plane</button>
                <button>YZ Plane</button>
                <button>YW Plane</button>
                <button>ZW Plane</button>
              </div>
            </div>
            
            <div className="control-group">
              <h3>Rotation Modes</h3>
              <div className="mode-buttons">
                <button>Single Rotation</button>
                <button>Double Rotation</button>
                <button>Isoclinic (α=β)</button>
              </div>
            </div>

            <div className="control-group">
              <h3>Projection Settings</h3>
              <div className="projection-controls">
                <label>
                  W-Depth Factor:
                  <input type="range" min="0" max="1" step="0.1" defaultValue="0.3" />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="math-section">
          <h2>Mathematical Specifications</h2>
          <div className="math-grid">
            <div className="math-card">
              <h3>4D Rotation Matrices</h3>
              <p>Rotations happen through 2D planes, not axes:</p>
              <ul>
                <li>XY plane rotation</li>
                <li>XZ plane rotation</li>
                <li>XW plane rotation</li>
                <li>YZ plane rotation</li>
                <li>YW plane rotation</li>
                <li>ZW plane rotation</li>
              </ul>
            </div>
            <div className="math-card">
              <h3>Projection</h3>
              <p>4D→3D: Treat w as depth (z + w*0.3)</p>
              <p>Custom shaders for efficient rendering</p>
            </div>
            <div className="math-card">
              <h3>Implementation</h3>
              <p>Option B: 4D-to-3D projection with custom shaders</p>
              <p>All 6 plane rotations implemented</p>
              <p>Isoclinic rotations with α=β</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>Information</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Implementation</h3>
              <p>Three.js + @react-three/fiber + @react-three/drei</p>
            </div>
            <div className="info-card">
              <h3>Features</h3>
              <p>WASD + mouse navigation supported</p>
              <p>All 5 movement modes from user images</p>
            </div>
            <div className="info-card">
              <h3>Status</h3>
              <p>✅ Option B implemented</p>
              <p>⚠️ Math needs real geometry (currently stubs)</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default FOUR_D;
