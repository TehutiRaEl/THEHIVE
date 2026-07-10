import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const AutomatischColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUiStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'automation'>('console');

  useEffect(() => {
    setActiveColony('automatisch');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="automatisch"
            predefinedCommands={[
              { id: 'automation', command: 'list automations', description: 'List all automation workflows' },
              { id: 'security', command: 'security scan', description: 'Run security vulnerability scan' },
              { id: 'coordination', command: 'coordination status', description: 'Show coordination system status' },
              { id: 'schedules', command: 'show schedules', description: 'Display scheduled automation jobs' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="automatisch" />;
      case 'automation':
        return (
          <div className="automation-panel">
            <h2>🤖 automatisch Automation</h2>
            <p>Automation workflow system - Security and coordination</p>
            <div className="automation-features">
              <div className="feature-card">
                <h3>Workflow Automation</h3>
                <p>Automated task execution and processing</p>
              </div>
              <div className="feature-card">
                <h3>Security Integration</h3>
                <p>Built-in security protocols and validation</p>
              </div>
              <div className="feature-card">
                <h3>System Coordination</h3>
                <p>Cross-system workflow coordination</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container automatisch-colony">
      <ColonyHeader colonyId="automatisch" onBack={onBack} />
      
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
          className={getTabClass('automation')}
          onClick={() => setActiveTab('automation')}
        >
          ⚡ Automation
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AutomatischColonyConsole;