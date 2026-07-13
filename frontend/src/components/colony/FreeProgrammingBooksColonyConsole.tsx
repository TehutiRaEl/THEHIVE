import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import ColonyHeader from './ColonyHeader';
import ColonyConsole from './ColonyConsole';
import HealthDashboard from './HealthDashboard';

const FreeProgrammingBooksColonyConsole: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setActiveColony } = useUIStore();
  const [activeTab, setActiveTab] = useState<'console' | 'health' | 'archive'>('console');

  useEffect(() => {
    setActiveColony('free-programming-books');
  }, [setActiveColony]);

  const getTabClass = (tab: string) => {
    return 'tab-btn ' + (activeTab === tab ? 'active' : '');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'console':
        return (
          <ColonyConsole
            colonyId="free-programming-books"
            predefinedCommands={[
              { id: 'books', command: 'list books', description: 'List all available programming books' },
              { id: 'categories', command: 'show categories', description: 'Display book categories and topics' },
              { id: 'search', command: 'search books', description: 'Search for specific programming topics' },
              { id: 'collections', command: 'show collections', description: 'Display curated book collections' }
            ]}
          />
        );
      case 'health':
        return <HealthDashboard colonyId="free-programming-books" />;
      case 'archive':
        return (
          <div className="archive-panel">
            <h2>📖 free-programming-books Archive</h2>
            <p>Knowledge fork - Free programming books collection</p>
            <div className="archive-features">
              <div className="feature-card">
                <h3>Extensive Collection</h3>
                <p>Thousands of free programming books across all languages and topics</p>
              </div>
              <div className="feature-card">
                <h3>Organized Categories</h3>
                <p>Books organized by language, framework, and skill level</p>
              </div>
              <div className="feature-card">
                <h3>Regular Updates</h3>
                <p>Continuously updated with new releases and editions</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="colony-container fpb-colony">
      <ColonyHeader colonyId="free-programming-books" onBack={onBack} />
      
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
          className={getTabClass('archive')}
          onClick={() => setActiveTab('archive')}
        >
          📚 Archive
        </button>
      </div>

      <div className="colony-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default FreeProgrammingBooksColonyConsole;