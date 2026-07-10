import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';

interface Setting {
  id: string;
  label: string;
  value: any;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
}

const SETTINGS: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'theme',
      label: 'Theme',
      value: 'dark',
      type: 'select',
      options: ['light', 'dark', 'system'],
      description: 'Application color theme'
    },
    {
      id: 'language',
      label: 'Language',
      value: 'en',
      type: 'select',
      options: ['en', 'es', 'fr', 'de'],
      description: 'Application language'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      value: true,
      type: 'boolean',
      description: 'Enable desktop notifications'
    },
    {
      id: 'sounds',
      label: 'Sound Effects',
      value: true,
      type: 'boolean',
      description: 'Enable UI sound effects'
    },
    {
      id: 'animation',
      label: 'Animations',
      value: true,
      type: 'boolean',
      description: 'Enable UI animations'
    },
    {
      id: 'maxResults',
      label: 'Max Results',
      value: 50,
      type: 'number',
      description: 'Maximum items to display per page'
    },
    {
      id: 'autoSave',
      label: 'Auto Save',
      value: true,
      type: 'boolean',
      description: 'Automatically save changes'
    },
  ]);

  const handleSettingChange = (id: string, newValue: any) => {
    setSettings(prev => 
      prev.map(s => s.id === id ? { ...s, value: newValue } : s)
    );
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    console.log('Settings saved:', settings);
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    // Reset to defaults
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings(prev => 
        prev.map(s => ({
          ...s,
          value: getDefaultValue(s.type, s.options)
        }))
      );
    }
  };

  const getDefaultValue = (type: string, options?: string[]) => {
    switch (type) {
      case 'boolean': return true;
      case 'number': return 0;
      case 'select': return options?.[0] || '';
      default: return '';
    }
  };

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="setting-input"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value) || 0)}
            className="setting-input"
          />
        );
      case 'boolean':
        return (
          <label className="setting-toggle">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="setting-input"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="tab-container settings-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>⚙️ SETTINGS - Configuration</h1>
          <p>Application and system configuration</p>
        </header>

        <section className="settings-section">
          <h2>Application Settings</h2>
          <div className="settings-grid">
            {settings.map(setting => (
              <div key={setting.id} className="setting-card">
                <div className="setting-header">
                  <h3>{setting.label}</h3>
                  <span className="setting-type">{setting.type}</span>
                </div>
                <p className="setting-description">{setting.description}</p>
                <div className="setting-input-container">
                  {renderSettingInput(setting)}
                </div>
              </div>
            ))}
          </div>

          <div className="settings-actions">
            <button className="btn-primary" onClick={handleSave}>
              Save Settings
            </button>
            <button className="btn-secondary" onClick={handleReset}>
              Reset to Defaults
            </button>
          </div>
        </section>

        <section className="system-section">
          <h2>System Information</h2>
          <div className="system-grid">
            <div className="system-card">
              <h3>Application</h3>
              <p><strong>Name:</strong> Sovereign Hive Command Center</p>
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> 2026-07-10</p>
            </div>
            <div className="system-card">
              <h3>Environment</h3>
              <p><strong>Mode:</strong> Development</p>
              <p><strong>API Base:</strong> http://localhost:8000</p>
              <p><strong>Debug:</strong> Enabled</p>
            </div>
            <div className="system-card">
              <h3>Dependencies</h3>
              <p><strong>React:</strong> 18.2.0</p>
              <p><strong>TypeScript:</strong> 5.2.2</p>
              <p><strong>Vite:</strong> 5.0.8</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>About</h2>
          <div className="about-card">
            <h3>Sovereign Hive Command Center</h3>
            <p>Frontend Builder - Mistral</p>
            <p>Branch: mistral/frontend-command-center</p>
            <p>© 2026 TehutiRaEl</p>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default SETTINGS;
