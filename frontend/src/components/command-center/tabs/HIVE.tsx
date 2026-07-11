import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { useUIStore } from '../../../stores/uiStore';

const HIVE: React.FC = () => {
  const { isLoading } = useUIStore();
  // live hive metrics arrive with the API wiring batch; defaults render until then
  const [hiveData] = useState<{ status?: string; version?: string; uptime?: string } | null>(null);

  return (
    <div className="tab-container hive-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🏰 HIVE - Main Dashboard</h1>
          <p>Central hub for Sovereign Hive operations</p>
        </header>

        <section className="dashboard-grid">
          <div className="dashboard-card">
            <h2>System Overview</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <p><strong>Status:</strong> {hiveData?.status || 'Online'}</p>
                <p><strong>Version:</strong> {hiveData?.version || '1.0.0'}</p>
                <p><strong>Uptime:</strong> {hiveData?.uptime || '99.99%'}</p>
              </>
            )}
          </div>

          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <ul>
              <li><button>Initialize Hive</button></li>
              <li><button>Run Diagnostics</button></li>
              <li><button>View Logs</button></li>
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>Agent Status</h2>
            <ul>
              <li>✅ Mistral - Active (Frontend/UI)</li>
              <li>✅ Claude - Active (Backend)</li>
              <li>✅ Grok - Active (Strategy)</li>
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>Resource Usage</h2>
            <p>CPU: 45%</p>
            <p>Memory: 6.2GB / 16GB</p>
            <p>Storage: 245GB / 1TB</p>
          </div>
        </section>

        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <ul>
            <li>2026-07-09: Mistral added entry points (main.tsx, App.tsx, index.css)</li>
            <li>2026-07-09: Documentation sync completed</li>
            <li>2026-07-08: Batch 6 components created</li>
          </ul>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default HIVE;
