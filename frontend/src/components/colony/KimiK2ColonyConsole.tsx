import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const KimiK2ColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUiStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'security'>('console');

  useEffect(() => {
    setActiveColony('Kimi-K2');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="Kimi-K2"
            predefinedCommands={[
              { id: 'security', command: 'security status', description: 'Show security system status and alerts' },
              { id: 'protection', command: 'protection scan', description: 'Run system protection scan' },
              { id: 'defense', command: 'defense mode', description: 'Toggle defense protocols' },
              { id: 'threats', command: 'threat analysis', description: 'Analyze current threat landscape' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="Kimi-K2" />;
      case 'security':
        return (
          <div className="security-panel">
            <h2>🛡️ Kimi-K2 Security Operations</h2>
            <p>Kimi-K2 - Security and military operations</p>
            <div className="security-features">
              <div className="feature-card">
                <h3>System Security</h3>
                <p>Comprehensive security monitoring and threat detection</p>
              </div>
              <div className="feature-card">
                <h3>Protection Protocols</h3>
                <p>Active defense mechanisms and vulnerability shielding</p>
              </div>
              <div className="feature-card">
                <h3>Military Defense</h3>
                <p>Strategic defense planning and execution</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container kimi-colony">
      <ColonyHeader colonyId="Kimi-K2" onBack={onBack} />
      
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
          className={getTabClass('security')}
          onClick={() => setActiveTab('security')}
        >
          🛡️ Security
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default KimiK2ColonyConsole;