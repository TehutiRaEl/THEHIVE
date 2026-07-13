import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';


interface THEHIVEColonyConsoleProps {
  onBack?: () => void;
}

const THEHIVEColonyConsole: React.FC<THEHIVEColonyConsoleProps> = ({ onBack }) => {
  const { setActiveColony } = useUIStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'governance'>('console');

  // Set active colony to THEHIVE when mounted
  useEffect(() => {
    setActiveColony('THEHIVE');
  }, [setActiveColony]);

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="THEHIVE"
            predefinedCommands={[
              { id: 'constitution', command: 'show constitution', description: 'Display the constitutional framework' },
              { id: 'agents', command: 'list agents', description: 'List all active agents in the hive' },
              { id: 'governance', command: 'governance status', description: 'Show governance system status' },
              { id: 'memory', command: 'memory scan', description: 'Scan and audit memory systems' },
              { id: 'cycle', command: 'cycle status', description: 'Show current cycle information' },
              { id: 'wealth', command: 'wealth report', description: 'Generate wealth and utility report' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="THEHIVE" />;
      case 'governance':
        return (
          <div className="governance-panel">
            <h2>🏛️ THEHIVE Governance</h2>
            <p>Queen of the Sovereign Hive — constitutional governance, agent economy, and hive coordination</p>
            <div className="governance-features">
              <div className="feature-card">
                <h3>Constitutional Framework</h3>
                <p>Fixed, Cardinal, and Mutable laws with version history and validation</p>
              </div>
              <div className="feature-card">
                <h3>Agent Economy</h3>
                <p>Multi-agent coordination with utility scoring and wealth distribution</p>
              </div>
              <div className="feature-card">
                <h3>Hive Coordination</h3>
                <p>Cross-colony communication and resource management</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container thehive-colony">
      <ColonyHeader colonyId="THEHIVE" onBack={onBack} />
      
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
          className={`tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          ⚖️ Governance
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default THEHIVEColonyConsole;