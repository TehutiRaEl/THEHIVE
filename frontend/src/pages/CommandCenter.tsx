import React, { useState } from 'react';
import SpaceNavigation from '../components/SpaceNavigation';
import KaiChatBox from '../components/KaiChatBox';
import TesseractRenderer from '../components/TesseractRenderer';
import ColonyZoomPanel from '../components/ColonyZoomPanel';
import MemoryGraph from '../components/MemoryGraph';
import PhaserScene from '../components/PhaserScene';
import LiveArenaViewer from '../components/LiveArenaViewer';

// Tab configuration
const TABS = [
  { id: 'hive', label: 'HIVE', component: null },
  { id: 'dream', label: 'DREAM', component: null },
  { id: 'arcane', label: 'ARCANE', component: null },
  { id: 'world', label: 'WORLD', component: null },
  { id: 'soul', label: 'SOUL', component: null },
  { id: 'govern', label: 'GOVERN', component: null },
  { id: 'missions', label: 'MISSIONS', component: null },
  { id: 'api', label: 'API', component: null },
  { id: '4d', label: '4D', component: TesseractRenderer },
  { id: 'arena', label: 'ARENA', component: LiveArenaViewer },
  { id: 'wow', label: 'WOW', component: null },
  { id: 'no-mans-sky', label: 'NO MAN`'S SKY', component: PhaserScene },
  { id: 'settings', label: 'SETTINGS', component: null },
];

const CommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('4d');
  const [showColonyPanel, setShowColonyPanel] = useState(false);
  const [showMemoryGraph, setShowMemoryGraph] = useState(false);

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="command-center-container">
      <SpaceNavigation />
      
      {/* Main Content Area */}
      <div className="command-center-main">
        {/* Tab Navigation */}
        <nav className="tab-navigator">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Active Tab Content */}
        <div className="tab-content">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="tab-placeholder">
              <h2>{TABS.find(tab => tab.id === activeTab)?.label} Tab</h2>
              <p>Content coming soon...</p>
              {activeTab === 'world' && (
                <button onClick={() => setShowColonyPanel(true)}>
                  Open Colony View
                </button>
              )}
              {activeTab === 'soul' && (
                <button onClick={() => setShowMemoryGraph(true)}>
                  Open Memory Graph
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Colony Zoom Panel (Modal) */}
      {showColonyPanel && (
        <div className="modal-overlay" onClick={() => setShowColonyPanel(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowColonyPanel(false)}>
              &times;
            </button>
            <ColonyZoomPanel />
          </div>
        </div>
      )}

      {/* Memory Graph (Modal) */}
      {showMemoryGraph && (
        <div className="modal-overlay" onClick={() => setShowMemoryGraph(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowMemoryGraph(false)}>
              &times;
            </button>
            <MemoryGraph />
          </div>
        </div>
      )}

      <KaiChatBox />
    </div>
  );
};

export default CommandCenter;
