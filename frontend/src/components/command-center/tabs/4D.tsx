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
          <p>A four-dimensional cube projected into 3D</p>
        </header>

        <section className="visualization-section">
          <div className="tesseract-container">
            <TesseractRenderer />
          </div>
        </section>

        <section className="math-section">
          <h2>What this is</h2>
          <div className="math-grid">
            <div className="math-card">
              <h3>A real tesseract, computed in your browser</h3>
              <p>16 vertices and 32 edges of a four-dimensional cube, rotated in the six planes (XY, XZ, XW, YZ, YW, ZW) and projected down to 3D with w as depth.</p>
            </div>
            <div className="math-card">
              <h3>Controls that work</h3>
              <p>The panel on the picture changes the rotation speeds, colours and rotation modes live. Drag to orbit when Orbit Controls is on.</p>
            </div>
            <div className="math-card">
              <h3>Not live Hive data</h3>
              <p>This is a visualisation of the mathematics only. It is not connected to the Hive, to Kai El&apos;s memory or to any route.</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default FOUR_D;
