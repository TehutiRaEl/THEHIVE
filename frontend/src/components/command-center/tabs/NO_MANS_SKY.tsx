import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import PhaserScene from '../../PhaserScene';
import PlannedControl from '../../PlannedControl';

const NO_MANS_SKY: React.FC = () => {
  return (
    <div className="tab-container no-mans-sky-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🚀 NO MAN`'S SKY - Space Exploration</h1>
          <p>Phaser 3.80 powered space exploration</p>
        </header>

        <section className="space-visualization">
          <div className="space-container">
            <PhaserScene />
          </div>
        </section>

        <section className="space-controls">
          <h2>Spacecraft Controls</h2>
          <div className="control-panel">
            <div className="control-group">
              <h3>Movement</h3>
              <div className="movement-buttons">
                <PlannedControl label="Thrust Forward" />
                <PlannedControl label="Thrust Backward" />
                <PlannedControl label="Thrust Left" />
                <PlannedControl label="Thrust Right" />
              </div>
            </div>

            <div className="control-group">
              <h3>Rotation</h3>
              <div className="rotation-buttons">
                <PlannedControl label="Pitch Up" />
                <PlannedControl label="Pitch Down" />
                <PlannedControl label="Yaw Left" />
                <PlannedControl label="Yaw Right" />
              </div>
            </div>

            <div className="control-group">
              <h3>Actions</h3>
              <div className="action-buttons">
                <PlannedControl label="Warp Jump" />
                <PlannedControl label="Scan" />
                <PlannedControl label="Mine" />
                <PlannedControl label="Dock" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-info">
          <h2>Space Exploration</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Technology</h3>
              <p>Phaser 3.80</p>
              <p>WebGL rendering</p>
            </div>
            <div className="info-card">
              <h3>Features</h3>
              <p>3D space environment</p>
              <p>Physics simulation</p>
              <p>Interactive objects</p>
            </div>
            <div className="info-card">
              <h3>Capabilities</h3>
              <p>Spacecraft control</p>
              <p>Resource collection</p>
              <p>Exploration</p>
            </div>
          </div>
        </section>

        <section className="space-stats">
          <h2>Spacecraft Status <span style={{ opacity: 0.5, fontSize: 12 }}>(demo values — not live telemetry)</span></h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Fuel</h3>
              <p className="stat-value">85%</p>
              <div className="stat-bar" style={{ width: '85%' }}></div>
            </div>
            <div className="stat-card">
              <h3>Shields</h3>
              <p className="stat-value">100%</p>
              <div className="stat-bar" style={{ width: '100%' }}></div>
            </div>
            <div className="stat-card">
              <h3>Hull</h3>
              <p className="stat-value">95%</p>
              <div className="stat-bar" style={{ width: '95%' }}></div>
            </div>
            <div className="stat-card">
              <h3>Cargo</h3>
              <p className="stat-value">45%</p>
              <div className="stat-bar" style={{ width: '45%' }}></div>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default NO_MANS_SKY;
