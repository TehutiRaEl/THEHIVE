import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const LocalAGIColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUIStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'cognitive'>('console');

  useEffect(() => {
    setActiveColony('LocalAGI');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="LocalAGI"
            predefinedCommands={[
              { id: 'cognitive', command: 'cognitive status', description: 'Show cognitive processing status' },
              { id: 'development', command: 'development mode', description: 'Toggle development mode' },
              { id: 'testing', command: 'run tests', description: 'Execute test suite' },
              { id: 'memory', command: 'memory cache', description: 'Manage memory cache' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="LocalAGI" />;
      case 'cognitive':
        return (
          <div className="cognitive-panel">
            <h2>🌿 LocalAGI Cognitive Processing</h2>
            <p>Local AI agent framework - Cognitive processing and development</p>
            <div className="cognitive-features">
              <div className="feature-card">
                <h3>Cognitive Processing</h3>
                <p>Advanced AI reasoning and decision making</p>
              </div>
              <div className="feature-card">
                <h3>Development Tools</h3>
                <p>AI-assisted development workflows</p>
              </div>
              <div className="feature-card">
                <h3>Testing Framework</h3>
                <p>Automated testing and validation</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container localagi-colony">
      <ColonyHeader colonyId="LocalAGI" onBack={onBack} />
      
      <div className="colony-tabs">
        <button
          className={getTabClass('console')}
          onClick={() => setActiveTab('console')}
        >
          💻 Console
        </button>
        <button
          className={getTabClass('health')}
          onClick={() => setActiveTab('health')}
        >
          🏥 Health
        </button>
        <button
          className={getTabClass('cognitive')}
          onClick={() => setActiveTab('cognitive')}
        >
          🧠 Cognitive
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default LocalAGIColonyConsole;