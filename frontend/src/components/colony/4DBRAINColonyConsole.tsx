import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const DBRAINColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUiStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'neural'>('console');

  useEffect(() => {
    setActiveColony('4DBRAIN');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="4DBRAIN"
            predefinedCommands={[
              { id: 'neural', command: 'neural status', description: 'Show neural network processing status' },
              { id: 'memory', command: 'memory scan', description: 'Scan memory systems and cache' },
              { id: 'learning', command: 'learning mode', description: 'Toggle learning and adaptation mode' },
              { id: 'tesseract', command: 'tesseract render', description: 'Render 4D tesseract visualization' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="4DBRAIN" />;
      case 'neural':
        return (
          <div className="neural-panel">
            <h2>🧠 4DBRAIN Neural Processing</h2>
            <p>4D Brain - Neural network processing and memory</p>
            <div className="neural-features">
              <div className="feature-card">
                <h3>Neural Processing</h3>
                <p>Advanced neural network computations and pattern recognition</p>
              </div>
              <div className="feature-card">
                <h3>Memory Systems</h3>
                <p>Long-term and short-term memory management</p>
              </div>
              <div className="feature-card">
                <h3>4D Visualization</h3>
                <p>Tesseract and hyperdimensional rendering</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container dbrain-colony">
      <ColonyHeader colonyId="4DBRAIN" onBack={onBack} />
      
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
          className={getTabClass('neural')}
          onClick={() => setActiveTab('neural')}
        >
          🧠 Neural
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DBRAINColonyConsole;