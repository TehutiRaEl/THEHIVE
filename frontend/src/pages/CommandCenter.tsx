import React, { useState } from 'react';
import SpaceNavigation from '../components/SpaceNavigation';
import KaiChatBox from '../components/KaiChatBox';
import TabNavigator from '../components/command-center/TabNavigator';
import ColonyZoomPanel from '../components/ColonyZoomPanel';
import MemoryGraph from '../components/MemoryGraph';
import HIVE from '../components/command-center/tabs/HIVE';
import DREAM from '../components/command-center/tabs/DREAM';
import ARCANE from '../components/command-center/tabs/ARCANE';
import WORLD from '../components/command-center/tabs/WORLD';
import SOUL from '../components/command-center/tabs/SOUL';
import GOVERN from '../components/command-center/tabs/GOVERN';
import MISSIONS from '../components/command-center/tabs/MISSIONS';
import API from '../components/command-center/tabs/API';
import FOUR_D from '../components/command-center/tabs/4D';
import ARENA from '../components/command-center/tabs/ARENA';
import WOW from '../components/command-center/tabs/WOW';
import NO_MANS_SKY from '../components/command-center/tabs/NO_MANS_SKY';
import SETTINGS from '../components/command-center/tabs/SETTINGS';

// Map tab IDs to components
const TAB_COMPONENTS: Record<string, React.FC> = {
  'hive': HIVE,
  'dream': DREAM,
  'arcane': ARCANE,
  'world': WORLD,
  'soul': SOUL,
  'govern': GOVERN,
  'missions': MISSIONS,
  'api': API,
  '4d': FOUR_D,
  'arena': ARENA,
  'wow': WOW,
  'no-mans-sky': NO_MANS_SKY,
  'settings': SETTINGS,
};

const CommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hive');
  const [showColonyPanel, setShowColonyPanel] = useState(false);
  const [showMemoryGraph, setShowMemoryGraph] = useState(false);

  const ActiveComponent = TAB_COMPONENTS[activeTab] || (() => <div>Tab content loading...</div>);

  return (
    <div className="command-center-container">
      <SpaceNavigation />
      
      {/* Main Content Area */}
      <div className="command-center-main">
        {/* Tab Navigation */}
        <TabNavigator 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />

        {/* Active Tab Content */}
        <div className="tab-content">
          <ActiveComponent />
          
          {/* Special modal triggers for WORLD and SOUL tabs */}
          {activeTab === 'world' && (
            <div className="tab-actions">
              <button onClick={() => setShowColonyPanel(true)} className="btn-primary">
                Open Colony View
              </button>
            </div>
          )}
          {activeTab === 'soul' && (
            <div className="tab-actions">
              <button onClick={() => setShowMemoryGraph(true)} className="btn-primary">
                Open Memory Graph
              </button>
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
