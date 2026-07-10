import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';

// SEE Command Center - 13 Pages
const TAB_DEFINITIONS = [
  { id: 'hive', label: 'HIVE', path: '/command-center/hive', icon: '🏰', description: 'Main dashboard' },
  { id: 'dream', label: 'DREAM', path: '/command-center/dream', icon: '💭', description: 'Vision and planning' },
  { id: 'arcane', label: 'ARCANE', path: '/command-center/arcane', icon: '🔮', description: 'Advanced features' },
  { id: 'world', label: 'WORLD', path: '/command-center/world', icon: '🌍', description: 'Global state' },
  { id: 'soul', label: 'SOUL', path: '/command-center/soul', icon: '❤️', description: 'Constitutional governance' },
  { id: 'govern', label: 'GOVERN', path: '/command-center/govern', icon: '🏛️', description: 'Administrative controls' },
  { id: 'missions', label: 'MISSIONS', path: '/command-center/missions', icon: '🎯', description: 'Task management' },
  { id: 'api', label: 'API', path: '/command-center/api', icon: '🔌', description: 'Integration endpoints' },
  { id: '4d', label: '4D', path: '/command-center/4d', icon: '🔲', description: 'Tesseract visualization' },
  { id: 'arena', label: 'ARENA', path: '/command-center/arena', icon: '⚔️', description: 'Competition' },
  { id: 'wow', label: 'WOW', path: '/command-center/wow', icon: '🎮', description: 'World of Warcraft' },
  { id: 'no-mans-sky', label: 'NO MAN`'S SKY', path: '/command-center/no-mans-sky', icon: '🚀', description: 'Space exploration' },
  { id: 'settings', label: 'SETTINGS', path: '/command-center/settings', icon: '⚙️', description: 'Configuration' },
];

interface TabNavigatorProps {
  className?: string;
  vertical?: boolean;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ className = '', vertical = false }) => {
  const { activeTab, setActiveTab } = useUiStore();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <nav className={`tab-navigator ${vertical ? 'vertical' : 'horizontal'} ${className}`}>
      {TAB_DEFINITIONS.map(tab => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) =>
            `tab-button ${isActive || activeTab === tab.id ? 'active' : ''}`
          }
          onClick={() => handleTabClick(tab.id)}
          title={tab.description}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default TabNavigator;

export { TAB_DEFINITIONS };
