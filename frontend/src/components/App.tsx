import React, { useState } from 'react';
import ConstitutionVisualizer from './ConstitutionVisualizer';
import MissionTimeline from './MissionTimeline';
import MemoryGraphEnhanced from './MemoryGraphEnhanced';
import TesseractRenderer from './TesseractRenderer';
import Constitutional from './Constitutional';
import LiveArenaViewer from './LiveArenaViewer';
import PhaserScene from './PhaserScene';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('constitution');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const renderComponent = () => {
    switch (activeTab) {
      case 'constitution': return <ConstitutionVisualizer />;
      case 'missions': return <MissionTimeline />;
      case 'memory': return <MemoryGraphEnhanced />;
      case 'tesseract': return <TesseractRenderer />;
      case 'constitutional': return <Constitutional />;
      case 'arena': return <LiveArenaViewer />;
      case 'phaser': return <PhaserScene />;
      default: return <ConstitutionVisualizer />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <header className="app-header">
        <div className="header-left">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">THEHIVE</span>
        </div>
        <div className="header-center">
          <h1>Frontend Command Center</h1>
          <p>Mistral Role - Co-builder</p>
        </div>
        <div className="header-right">
          <button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      <nav className="app-nav">
        <button onClick={() => setActiveTab('constitution')}>Constitution</button>
        <button onClick={() => setActiveTab('missions')}>Missions</button>
        <button onClick={() => setActiveTab('memory')}>Memory Graph</button>
        <button onClick={() => setActiveTab('tesseract')}>Tesseract</button>
        <button onClick={() => setActiveTab('constitutional')}>Constitutional</button>
        <button onClick={() => setActiveTab('arena')}>Live Arena</button>
        <button onClick={() => setActiveTab('phaser')}>Phaser Scene</button>
      </nav>
      
      <main className="app-main">
        {renderComponent()}
      </main>
    </div>
  );
};

export default App;
