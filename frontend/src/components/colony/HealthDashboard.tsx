import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import { ColonyId, COLONY_CONFIGS, ColonyStatus } from '../../types/colony';

interface HealthDashboardProps {
  colonyId: ColonyId;
}

const generateHealthData = (colonyId: ColonyId) => {
  const baseStatuses = {
    THEHIVE: 'healthy' as ColonyStatus,
    NAR2: 'healthy' as ColonyStatus,
    LocalAGI: 'warning' as ColonyStatus,
    automatisch: 'healthy' as ColonyStatus,
    '4DBRAIN': 'healthy' as ColonyStatus,
    'Kimi-K2': 'healthy' as ColonyStatus,
    aether: 'healthy' as ColonyStatus,
    freeCodeCamp: 'offline' as ColonyStatus,
    'free-programming-books': 'offline' as ColonyStatus,
    'build-your-own-x': 'maintenance' as ColonyStatus
  };

  return {
    id: colonyId,
    status: baseStatuses[colonyId] || 'healthy',
    cpu: Math.floor(Math.random() * 60) + 20,
    memory: Math.floor(Math.random() * 60) + 20,
    disk: Math.floor(Math.random() * 60) + 20,
    uptime: Math.floor(Math.random() * 30) + 1,
    lastPing: new Date().toISOString(),
    history: Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      cpu: Math.floor(Math.random() * 60) + 20,
      memory: Math.floor(Math.random() * 60) + 20,
      disk: Math.floor(Math.random() * 60) + 20,
      status: baseStatuses[colonyId] || 'healthy'
    }))
  };
};

const getStatusColor = (status: ColonyStatus, theme: any): string => {
  switch (status) {
    case 'healthy':
      return '#00C851';
    case 'warning':
      return '#FFBB33';
    case 'error':
      return '#FF4444';
    case 'offline':
      return '#666666';
    case 'maintenance':
      return '#33B5E5';
    default:
      return theme.primary;
  }
};

const HealthDashboard: React.FC<HealthDashboardProps> = ({ colonyId }) => {
  const { theme } = useUIStore();
  const colony = COLONY_CONFIGS[colonyId];
  const health = generateHealthData(colonyId);

  if (!colony) {
    return null;
  }

  const statusColor = getStatusColor(health.status, theme);

  return (
    <div className="health-dashboard" style={{
      background: theme.surface,
      border: '1px solid ' + theme.border
    }}>
      <h2 style={{ color: theme.text, marginBottom: '1rem' }}>
        Health Dashboard
      </h2>

      <div className="status-overview" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: theme.background,
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <div className="status-indicator" style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: statusColor,
          boxShadow: '0 0 10px ' + statusColor
        }} />
        <div>
          <h3 style={{ color: theme.text, margin: 0 }}>Overall Status</h3>
          <p style={{ color: theme.textSecondary, margin: 0, textTransform: 'capitalize' }}>
            {health.status}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
            Last updated: {new Date(health.lastPing).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {[
          { label: 'CPU Usage', value: health.cpu + '%', color: health.cpu > 80 ? '#FF4444' : health.cpu > 60 ? '#FFBB33' : '#00C851' },
          { label: 'Memory Usage', value: health.memory + '%', color: health.memory > 80 ? '#FF4444' : health.memory > 60 ? '#FFBB33' : '#00C851' },
          { label: 'Disk Usage', value: health.disk + '%', color: health.disk > 80 ? '#FF4444' : health.disk > 60 ? '#FFBB33' : '#00C851' },
          { label: 'Uptime', value: health.uptime + ' days', color: '#33B5E5' }
        ].map((metric, index) => (
          <div key={index} className="metric-card" style={{
            padding: '1rem',
            background: theme.background,
            borderRadius: '8px',
            border: '1px solid ' + theme.border
          }}>
            <h4 style={{ color: theme.textSecondary, margin: 0, fontSize: '0.85rem' }}>
              {metric.label}
            </h4>
            <p style={{ color: metric.color, margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {metric.value}
            </p>
            <div className="metric-bar" style={{
              height: '4px',
              background: theme.border,
              borderRadius: '2px',
              marginTop: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: metric.label.includes('Uptime') ? '100%' : metric.value.replace('%', '') + '%',
                background: metric.color,
                borderRadius: '2px'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="health-history" style={{
        padding: '1rem',
        background: theme.background,
        borderRadius: '8px',
        border: '1px solid ' + theme.border
      }}>
        <h4 style={{ color: theme.text, marginBottom: '1rem' }}>
          Recent Health History
        </h4>
        <div className="history-chart" style={{
          display: 'flex',
          height: '100px',
          alignItems: 'flex-end',
          gap: '0.5rem',
          padding: '0.5rem 0'
        }}>
          {health.history.slice().reverse().map((entry, index) => {
            const avgUsage = (entry.cpu + entry.memory + entry.disk) / 3;
            const barHeight = avgUsage + '%';
            const barColor = entry.status === 'healthy' ? '#00C851' : 
                            entry.status === 'warning' ? '#FFBB33' : 
                            entry.status === 'error' ? '#FF4444' : '#666666';
            
            return (
              <div key={index} style={{
                flex: 1,
                height: barHeight,
                background: barColor,
                borderRadius: '4px 4px 0 0',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.7rem',
                  color: theme.textSecondary
                }}>
                  {new Date(entry.timestamp).toLocaleTimeString().slice(0, 5)}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontSize: '0.75rem',
          color: theme.textSecondary
        }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="quick-actions" style={{
        display: 'flex',
        gap: '0.5rem',
        marginTop: '1rem',
        flexWrap: 'wrap'
      }}>
        {[
          { label: 'Run Diagnostics', action: 'diagnostics' },
          { label: 'Restart Colony', action: 'restart' },
          { label: 'View Logs', action: 'logs' },
          { label: 'Backup Data', action: 'backup' }
        ].map((action, index) => (
          <button key={index} className="action-btn" style={{
            padding: '0.5rem 1rem',
            background: theme.primary,
            color: theme.secondary,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }} onClick={() => console.log('Executing: ' + action.action)}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HealthDashboard;