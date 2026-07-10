import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const FreeCodeCampColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUiStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'knowledge'>('console');

  useEffect(() => {
    setActiveColony('freeCodeCamp');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="freeCodeCamp"
            predefinedCommands={[
              { id: 'curriculum', command: 'show curriculum', description: 'Display available programming curriculum' },
              { id: 'resources', command: 'list resources', description: 'List educational resources and materials' },
              { id: 'progress', command: 'learning progress', description: 'Show learning progress and achievements' },
              { id: 'certifications', command: 'certifications status', description: 'Check certification and completion status' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="freeCodeCamp" />;
      case 'knowledge':
        return (
          <div className="knowledge-panel">
            <h2>📚 freeCodeCamp Knowledge Base</h2>
            <p>Knowledge fork - Free programming resources and curriculum</p>
            <div className="knowledge-features">
              <div className="feature-card">
                <h3>Comprehensive Curriculum</h3>
                <p>Full CS/math curriculum with hands-on projects</p>
              </div>
              <div className="feature-card">
                <h3>Interactive Learning</h3>
                <p>Interactive coding challenges and exercises</p>
              </div>
              <div className="feature-card">
                <h3>Community Resources</h3>
                <p>Access to community-contributed learning materials</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container fcc-colony">
      <ColonyHeader colonyId="freeCodeCamp" onBack={onBack} />
      
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
          className={getTabClass('knowledge')}
          onClick={() => setActiveTab('knowledge')}
        >
          📚 Knowledge
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FreeCodeCampColonyConsole;