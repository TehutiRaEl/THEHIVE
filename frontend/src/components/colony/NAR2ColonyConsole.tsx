import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const NAR2ColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUiStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'workflows'>('console');

  useEffect(() => {
    setActiveColony('NAR2');
  }, [setActiveColony]);

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="NAR2"
            predefinedCommands={[
              { id: 'workflows', command: 'list workflows', description: 'List all available workflows' },
              { id: 'execute', command: 'execute workflow', description: 'Execute a specific workflow' },
              { id: 'processing', command: 'processing status', description: 'Show data processing status' },
              { id: 'automation', command: 'automation jobs', description: 'List active automation jobs' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="NAR2" />;
      case 'workflows':
        return (
          <div className="workflows-panel">
            <h2>🔥 NAR2 Workflows</h2>
            <p>Neural Architecture Repository 2 - Workflow execution and processing</p>
            <div className="workflow-cards">
              <div className="workflow-card">
                <h3>hive.yml</h3>
                <p>Primary hive coordination workflow</p>
              </div>
              <div className="workflow-card">
                <h3>nightly.yml</h3>
                <p>Nightly data processing and cleanup</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container nar2-colony">
      <ColonyHeader colonyId="NAR2" onBack={onBack} />
      
      <div className="colony-tabs">
        <button 
          className={`tab-btn ${activeTab === 'console' ? 'active' : ''}`}
          onClick={() => setActiveTab('console')}
        >
          💻 Console
        </button>
        <button 
          className={`tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          🏥 Health
        </button>
        <button 
          className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          📋 Workflows
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default NAR2ColonyConsole;