import React from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { API_BASE_URL } from '../../../utils/constants';
import {
  useDisplayPreferences,
  setTheme,
  setAnimations,
  resetDisplayPreferences,
  type ThemeChoice,
} from '../../../theme/preference';

// Settings that actually do something. Every control here changes the app the
// moment you touch it and is remembered in this browser. Controls for things the
// app does not have (language packs, desktop notifications, sound effects, a
// results-per-page limit, auto-save) were removed instead of being shown inert.
const THEME_OPTIONS: { id: ThemeChoice; label: string; hint: string }[] = [
  { id: 'system', label: 'System', hint: 'Follow this device’s light/dark setting' },
  { id: 'light', label: 'Light', hint: 'Light surfaces, dark text' },
  { id: 'dark', label: 'Dark', hint: 'The original dark look' },
];

const SETTINGS: React.FC = () => {
  const { theme, resolved, animations } = useDisplayPreferences();

  return (
    <div className="tab-container settings-tab">
      <SpaceNavigation />

      <main className="tab-content">
        <header className="tab-header">
          <h1>⚙️ SETTINGS - Configuration</h1>
          <p>Application and system configuration</p>
        </header>

        <section className="settings-section">
          <h2>Display</h2>
          <div className="settings-grid">
            <div className="setting-card">
              <div className="setting-header"><h3>Theme</h3></div>
              <p className="setting-description">
                Colour theme for the whole app. Currently showing the {resolved} theme.
              </p>
              <div className="setting-input-container" role="radiogroup" aria-label="Colour theme">
                {THEME_OPTIONS.map((o) => (
                  <label key={o.id} className="flex items-center gap-2 py-1 cursor-pointer" title={o.hint}>
                    <input
                      type="radio"
                      name="hive-theme"
                      checked={theme === o.id}
                      onChange={() => setTheme(o.id)}
                    />
                    <span>{o.label}</span>
                    <span className="opacity-60 text-xs">{o.hint}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="setting-card">
              <div className="setting-header"><h3>Animations</h3></div>
              <p className="setting-description">
                Turn off to stop pulsing, fading and sliding everywhere in the app.
              </p>
              <div className="setting-input-container">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={animations}
                    onChange={(e) => setAnimations(e.target.checked)}
                  />
                  <span>{animations ? 'On' : 'Off'}</span>
                </label>
              </div>
            </div>
          </div>
          <p className="setting-description" style={{ marginTop: 12 }}>
            Changes apply immediately and are remembered in this browser only.
          </p>
          <div className="settings-actions">
            <button
              className="btn-secondary"
              onClick={() => { if (window.confirm('Reset theme and animations to their defaults?')) resetDisplayPreferences(); }}
            >
              Reset to defaults
            </button>
          </div>
        </section>

        <section className="system-section">
          <h2>System Information</h2>
          <div className="system-grid">
            <div className="system-card">
              <h3>Environment</h3>
              <p><strong>Mode:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
              <p><strong>API Base:</strong> {API_BASE_URL || 'same-origin (/v11 on this Worker)'}</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>About</h2>
          <div className="about-card">
            <h3>Sovereign Hive Command Center</h3>
            <p>Frontend Builder - Mistral</p>
            <p>© 2026 TehutiRaEl</p>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default SETTINGS;
