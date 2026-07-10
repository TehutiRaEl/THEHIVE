import React from 'react';
import { useUiStore } from '../../stores/uiStore';
import { ColonyId, COLONY_CONFIGS } from '../../types/colony';

interface ColonyHeaderProps {
  colonyId: ColonyId;
  onBack?: () => void;
}

const ColonyHeader: React.FC<ColonyHeaderProps> = ({ colonyId, onBack }) => {
  const { theme } = useUiStore();
  const colony = COLONY_CONFIGS[colonyId];

  if (!colony) {
    return null;
  }

  return (
    <header className="colony-header" style={{
      background: theme.surface,
      borderBottom: '1px solid ' + theme.border
    }}>
      <div className="colony-header-content">
        {onBack && (
          <button className="back-button" onClick={onBack} style={{ color: theme.text }}>
            Back
          </button>
        )}
        
        <div className="colony-info">
          <span className="colony-icon" style={{ fontSize: '2rem' }}>
            {colony.icon}
          </span>
          <div className="colony-details">
            <h1 className="colony-name" style={{ color: theme.text }}>
              {colony.name}
            </h1>
            <p className="colony-description" style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
              {colony.description}
            </p>
          </div>
        </div>

        <div className="colony-actions">
          <button className="colony-action-btn" style={{
            background: theme.primary,
            color: theme.secondaryColor
          }}>
            Settings
          </button>
          <button className="colony-action-btn" style={{
            background: theme.primary,
            color: theme.secondaryColor
          }}>
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
};

export default ColonyHeader;