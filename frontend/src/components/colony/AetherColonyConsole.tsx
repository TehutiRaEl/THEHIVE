import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const AetherColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUIStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'commerce'>('console');

  useEffect(() => {
    setActiveColony('aether');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="aether"
            predefinedCommands={[
              { id: 'licensing', command: 'licensing status', description: 'Show current licensing status and active licenses' },
              { id: 'settlement', command: 'settlement report', description: 'Generate settlement and transaction report' },
              { id: 'commerce', command: 'commerce metrics', description: 'Show commerce and revenue metrics' },
              { id: 'stripe', command: 'stripe status', description: 'Check Stripe Connect integration status' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="aether" />;
      case 'commerce':
        return (
          <div className="commerce-panel">
            <h2>💰 aether Commerce Operations</h2>
            <p>Commerce colony — License Authority Server with Stripe Connect, JWT licensing, and SOUL ledger settlement</p>
            <div className="commerce-features">
              <div className="feature-card">
                <h3>License Authority</h3>
                <p>JWT-based licensing system with access control</p>
              </div>
              <div className="feature-card">
                <h3>Stripe Integration</h3>
                <p>Stripe Connect for payment processing and settlements</p>
              </div>
              <div className="feature-card">
                <h3>SOUL Ledger</h3>
                <p>Constitutional settlement and wealth tracking</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container aether-colony">
      <ColonyHeader colonyId="aether" onBack={onBack} />
      
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
          className={getTabClass('commerce')}
          onClick={() => setActiveTab('commerce')}
        >
          💰 Commerce
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AetherColonyConsole;