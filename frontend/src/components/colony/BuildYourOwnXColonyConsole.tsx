import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const BuildYourOwnXColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUIStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'workshop'>('console');

  useEffect(() => {
    setActiveColony('build-your-own-x');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="build-your-own-x"
            predefinedCommands={[
              { id: 'projects', command: 'list projects', description: 'List all build-your-own projects and guides' },
              { id: 'categories', command: 'show categories', description: 'Display project categories and types' },
              { id: 'search', command: 'search projects', description: 'Search for specific project types' },
              { id: 'contribute', command: 'contribute project', description: 'Submit a new project or guide' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="build-your-own-x" />;
      case 'workshop':
        return (
          <div className="workshop-panel">
            <h2>🛠️ build-your-own-x Workshop</h2>
            <p>Knowledge fork - Build your own X collection</p>
            <div className="workshop-features">
              <div className="feature-card">
                <h3>Project Guides</h3>
                <p>Step-by-step guides to build your own versions of popular software</p>
              </div>
              <div className="feature-card">
                <h3>Educational Resources</h3>
                <p>Learn by building complete systems from scratch</p>
              </div>
              <div className="feature-card">
                <h3>Community Contributions</h3>
                <p>User-submitted projects and implementations</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container byox-colony">
      <ColonyHeader colonyId="build-your-own-x" onBack={onBack} />
      
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
          className={getTabClass('workshop')}
          onClick={() => setActiveTab('workshop')}
        >
          🛠️ Workshop
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default BuildYourOwnXColonyConsole;