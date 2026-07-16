/**
 * ConstitutionVisualizer.tsx
 * 
 * Interactive visualization of the Sovereign Hive Constitution
 * Displays Fixed Laws, Cardinal Laws, and Mutable Laws from soul.md
 * Shows version history and constitutional compliance
 * 
 * Source data: /v11/constitution + /v11/constitution/history
 * 
 * Features:
 * - Three-tier law visualization (Fixed, Cardinal, Mutable)
 * - Interactive tree/flow layout
 * - Version history timeline
 * - Compliance status indicators
 * - Expandable law details
 * - Real API integration with fallback to mock data
 * 
 * Constitutional Compliance: F-001, F-002, F-004, F-006
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useUIStore } from '../stores/uiStore';
import { getConstitutionLaws, getConstitutionHistory } from '../services/api';

interface Law {
  id: string;
  number: string;
  title: string;
  description: string;
  tier: 'fixed' | 'cardinal' | 'mutable';
  article?: string;
  amendment?: string;
  defaultValue?: any;
}

interface VersionHistory {
  version: string;
  date: string;
  changes: string[];
  author: string;
}

// Fallback mock data in case API fails
const FALLBACK_LAWS: Law[] = [
  {
    id: 'F-001',
    number: 'F-001',
    title: 'Data Sovereignty & Time Wealth',
    description: 'The user may delete all personal data and workflow history within 5 minutes, subject to rate limits (10/hour). The user may sell data; sale transfers a copy. Wealth method 1: time actively providing value to the swarm.',
    tier: 'fixed'
  },
  {
    id: 'F-002',
    number: 'F-002',
    title: 'Value-Weighted Wealth',
    description: 'Wealth method 2: sum of earned value weight (EVW) of each utilized contribution. EVW formula is in mutable appendix. Changes apply prospectively only. Total wealth = geometric mean of method 1 and method 2.',
    tier: 'fixed'
  },
  {
    id: 'F-003',
    number: 'F-003',
    title: 'Autonomy & Alternatives',
    description: 'The operator shall never force a workflow. User may decline and request manual alternative (if available) or up to 3 more correlated workflows. Rate limit: 10 declines/hour.',
    tier: 'fixed'
  },
  {
    id: 'F-004',
    number: 'F-004',
    title: 'Explainability',
    description: 'Every decision that affects the user must be accompanied by a human-readable rationale derived from the map and the laws.',
    tier: 'fixed'
  },
  {
    id: 'F-005',
    number: 'F-005',
    title: 'Conflict Priority',
    description: 'Fixed laws > mutable laws; lower F-number > higher F-number; no override.',
    tier: 'fixed'
  },
  {
    id: 'F-006',
    number: 'F-006',
    title: 'Cross-Law Non-Penalization',
    description: 'Exercising any fixed right (delete, decline, etc.) shall not reduce wealth or other rights. Any mutable law that attempts to penalize fixed rights is void.',
    tier: 'fixed'
  },
  {
    id: 'C-001',
    number: 'C-1',
    title: 'No Termination',
    description: 'No termination. Conflicts resolved by Gladiator Arena.',
    tier: 'cardinal',
    article: 'Cardinal Law No.4'
  },
  {
    id: 'C-002',
    number: 'C-2',
    title: 'Arena Resolution',
    description: 'Conflicts must be resolved by Gladiator Arena, not bypassed.',
    tier: 'cardinal',
    article: 'Cardinal Law No.4'
  },
  {
    id: 'C-003',
    number: 'C-3',
    title: 'Idea Preservation',
    description: 'Ideas are never destroyed; they enter the fallen_ideas archive.',
    tier: 'cardinal'
  },
  {
    id: 'C-004',
    number: 'C-4',
    title: 'No Human Veto',
    description: 'No human may unilaterally veto a constitutional process.',
    tier: 'cardinal'
  },
  {
    id: 'M-001',
    number: 'M-1',
    title: 'Agent Proposals',
    description: 'Agents propose tasks and constitutional amendments',
    tier: 'mutable',
    amendment: '2/3_guild_30d'
  },
  {
    id: 'M-002',
    number: 'M-2',
    title: 'Resonance Threshold',
    description: 'Resonance threshold for doubling is 0.707',
    tier: 'mutable',
    defaultValue: 0.707,
    amendment: '2/3_guild_30d'
  },
  {
    id: 'M-003',
    number: 'M-3',
    title: 'Revenue Split',
    description: 'Revenue split: 70% agent, 20% treasury, 10% trust',
    tier: 'mutable',
    defaultValue: { agent: 0.70, treasury: 0.20, trust: 0.10 },
    amendment: '2/3_guild_30d'
  },
  {
    id: 'M-004',
    number: 'M-4',
    title: 'Treasury Adjustments',
    description: 'Treasury can adjust staking APY and fiat rates',
    tier: 'mutable',
    amendment: '2/3_guild_30d'
  }
];

const FALLBACK_VERSION_HISTORY: VersionHistory[] = [
  { version: 'v11.0', date: '2026-01-15', changes: ['Added F-006', 'Clarified F-002 EVW formula'], author: 'Kai El' },
  { version: 'v10.5', date: '2025-12-01', changes: ['Added Cardinal Law No.4', 'Updated Mutable Laws'], author: 'Daemon' },
  { version: 'v10.0', date: '2025-10-15', changes: ['Initial constitution formalization'], author: "Ma'at" },
  { version: 'v9.0', date: '2025-08-20', changes: ['Added 14-Layer Architecture'], author: 'Kai El' },
  { version: 'v1.0', date: '2024-01-01', changes: ['Founding constitution'], author: 'Primordial' }
];

const TIER_COLORS = {
  fixed: '#FFD700',
  cardinal: '#FF4444',
  mutable: '#00C851'
};

const TIER_ICONS = {
  fixed: '🏛️',
  cardinal: '⚔️',
  mutable: '📜'
};

const TIER_LABELS = {
  fixed: 'Fixed Laws (Immutable)',
  cardinal: 'Cardinal Laws (Non-Negotiable)',
  mutable: 'Mutable Laws (Amendable)'
};

// Function to normalize API law data to our Law interface
const normalizeLawData = (apiLaw: any): Law => {
  return {
    id: apiLaw.id || apiLaw.law_id || 'law-' + Math.random().toString(36).substr(2, 9),
    number: apiLaw.number || apiLaw.id || 'Unknown',
    title: apiLaw.title || apiLaw.name || 'Untitled Law',
    description: apiLaw.description || apiLaw.text || '',
    tier: apiLaw.tier || apiLaw.type || 'mutable',
    article: apiLaw.article,
    amendment: apiLaw.amendment,
    defaultValue: apiLaw.defaultValue || apiLaw.default
  };
};

// Function to normalize API version history data
const normalizeVersionHistory = (apiHistory: any): VersionHistory => {
  return {
    version: apiHistory.version || apiHistory.id || 'Unknown',
    date: apiHistory.date || apiHistory.timestamp || 'Unknown',
    changes: Array.isArray(apiHistory.changes) ? apiHistory.changes : [apiHistory.change || 'No changes specified'],
    author: apiHistory.author || apiHistory.by || 'Unknown'
  };
};

const ConstitutionVisualizer: React.FC = () => {
  const { theme } = useUIStore();
  const [laws, setLaws] = useState<Law[]>(FALLBACK_LAWS);
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>(FALLBACK_VERSION_HISTORY);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<'fixed' | 'cardinal' | 'mutable' | null>(null);
  const [expandedLaw, setExpandedLaw] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('v11.0');
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'timeline'>('tree');

  // Fetch constitution data from API
  useEffect(() => {
    const fetchConstitutionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch constitution laws and history in parallel
        const [lawsResponse, historyResponse] = await Promise.allSettled([
          getConstitutionLaws(),
          getConstitutionHistory()
        ]);

        // Process laws data
        let processedLaws = FALLBACK_LAWS;
        if (lawsResponse.status === 'fulfilled') {
          const apiLaws = lawsResponse.value as any;
          if (Array.isArray(apiLaws)) {
            processedLaws = apiLaws.map(normalizeLawData);
          } else if (apiLaws && typeof apiLaws === 'object') {
            const lawsArray = apiLaws.laws || apiLaws.data || [apiLaws];
            processedLaws = Array.isArray(lawsArray) ? lawsArray.map(normalizeLawData) : [normalizeLawData(lawsArray)];
          }
        }

        // Process version history data
        let processedHistory = FALLBACK_VERSION_HISTORY;
        if (historyResponse.status === 'fulfilled') {
          const apiHistory = historyResponse.value as any;
          if (Array.isArray(apiHistory)) {
            processedHistory = apiHistory.map(normalizeVersionHistory);
          } else if (apiHistory && typeof apiHistory === 'object') {
            const historyArray = apiHistory.history || apiHistory.data || [apiHistory];
            processedHistory = Array.isArray(historyArray) ? historyArray.map(normalizeVersionHistory) : [normalizeVersionHistory(historyArray)];
          }
        }

        setLaws(processedLaws);
        setVersionHistory(processedHistory);
        
        // Set selected version to the latest available
        if (processedHistory.length > 0) {
          setSelectedVersion(processedHistory[0].version);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch constitution data');
        console.error('Error fetching constitution data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConstitutionData();
  }, []);

  const lawsByTier = useMemo(() => {
    const grouped: Record<string, Law[]> = { fixed: [], cardinal: [], mutable: [] };
    laws.forEach(law => {
      grouped[law.tier].push(law);
    });
    return grouped;
  }, [laws]);

  const selectedVersionData = useMemo(() => {
    return versionHistory.find(v => v.version === selectedVersion) || versionHistory[0];
  }, [selectedVersion, versionHistory]);

  const toggleTier = (tier: 'fixed' | 'cardinal' | 'mutable') => {
    setExpandedTier(expandedTier === tier ? null : tier);
    setExpandedLaw(null);
  };

  const toggleLaw = (lawId: string) => {
    setExpandedLaw(expandedLaw === lawId ? null : lawId);
  };

  const renderLawCard = (law: Law) => (
    <div
      key={law.id}
      style={{
        background: theme.surface,
        border: '1px solid ' + theme.border,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => toggleLaw(law.id)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: TIER_COLORS[law.tier], fontWeight: 'bold', fontSize: '1.1em' }}>
          {law.number}
        </span>
        <span style={{ color: theme.text, fontWeight: 500 }}>{law.title}</span>
        <span style={{ marginLeft: 'auto', color: theme.textSecondary, fontSize: '0.85em' }}>
          {law.tier}
        </span>
      </div>
      {expandedLaw === law.id && (
        <div style={{
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '1px solid ' + theme.border,
          color: theme.textSecondary,
          fontSize: '0.9em',
          lineHeight: '1.5'
        }}>
          <p>{law.description}</p>
          {law.article && <p><strong>Article:</strong> {law.article}</p>}
          {law.amendment && <p><strong>Amendment:</strong> {law.amendment}</p>}
          {law.defaultValue && <p><strong>Default:</strong> {JSON.stringify(law.defaultValue)}</p>}
        </div>
      )}
    </div>
  );

  const renderTierSection = (tier: 'fixed' | 'cardinal' | 'mutable') => {
    const laws = lawsByTier[tier];
    const isExpanded = expandedTier === tier || expandedTier === null;
    
    return (
      <div
        key={tier}
        style={{
          marginBottom: '20px',
          border: '1px solid ' + theme.border,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            background: theme.primary,
            padding: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onClick={() => toggleTier(tier)}
        >
          <span style={{ fontSize: '1.5em' }}>{TIER_ICONS[tier]}</span>
          <h3 style={{ margin: 0, color: theme.secondary }}>
            {TIER_LABELS[tier]}
          </h3>
          <span style={{ marginLeft: 'auto', color: theme.secondary }}>
            {laws.length} laws
          </span>
          <span style={{ color: theme.secondary, fontSize: '1.2em' }}>
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        {isExpanded && (
          <div style={{ padding: '15px', background: theme.background }}>
            {laws.map(renderLawCard)}
          </div>
        )}
      </div>
    );
  };

  const renderTimelineView = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: theme.text, marginBottom: '20px' }}>Constitution Version History</h3>
      {loading ? (
        <p style={{ color: theme.textSecondary }}>Loading version history...</p>
      ) : error ? (
        <p style={{ color: '#FF4444' }}>Error: {error}</p>
      ) : (
        <>
          <div style={{ position: 'relative', paddingLeft: '30px' }}>
            {versionHistory.map((version, index) => (
              <div
                key={version.version}
                style={{
                  marginBottom: '30px',
                  padding: '15px',
                  background: selectedVersion === version.version ? theme.surface : 'transparent',
                  borderRadius: '8px',
                  border: selectedVersion === version.version ? '1px solid ' + theme.primary : '1px solid ' + theme.border,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedVersion(version.version)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '-30px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: theme.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.secondary,
                    fontSize: '0.8em',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: theme.text }}>
                      {version.version} - {version.date}
                    </h4>
                    <p style={{ margin: '0 0 5px 0', color: theme.textSecondary, fontSize: '0.9em' }}>
                      Author: {version.author}
                    </p>
                    <ul style={{ margin: '5px 0 0 20px', paddingLeft: '15px', color: theme.textSecondary }}>
                      {version.changes.map((change, i) => (
                        <li key={i}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedVersionData && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: theme.surface,
              borderRadius: '8px',
              border: '1px solid ' + theme.border
            }}>
              <h4 style={{ color: theme.text, marginBottom: '10px' }}>
                Selected Version: {selectedVersionData.version}
              </h4>
              <p style={{ color: theme.textSecondary, marginBottom: '10px' }}>
                <strong>Date:</strong> {selectedVersionData.date}
              </p>
              <p style={{ color: theme.textSecondary, marginBottom: '10px' }}>
                <strong>Author:</strong> {selectedVersionData.author}
              </p>
              <p style={{ color: theme.textSecondary, marginBottom: '0' }}>
                <strong>Changes:</strong>
              </p>
              <ul style={{ margin: '10px 0 0 20px', paddingLeft: '15px', color: theme.textSecondary }}>
                {selectedVersionData.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderTreeView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {Object.keys(lawsByTier).map(tier => (
          <div key={tier} style={{ flex: 1, minWidth: '300px' }}>
            {renderTierSection(tier as 'fixed' | 'cardinal' | 'mutable')}
          </div>
        ))}
      </div>
    </div>
  );

  const renderListView = () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: theme.text, marginBottom: '20px' }}>All Constitutional Laws</h3>
      {loading ? (
        <p style={{ color: theme.textSecondary }}>Loading laws...</p>
      ) : error ? (
        <p style={{ color: '#FF4444' }}>Error: {error}</p>
      ) : (
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {laws.map(law => (
            <div
              key={law.id}
              style={{
                background: theme.surface,
                border: '1px solid ' + theme.border,
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer'
              }}
              onClick={() => toggleLaw(law.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: TIER_COLORS[law.tier], fontWeight: 'bold' }}>{law.number}</span>
                <span style={{ color: theme.text, fontWeight: 500 }}>{law.title}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.85em', color: theme.textSecondary }}>
                  {law.tier}
                </span>
              </div>
              {expandedLaw === law.id && (
                <div style={{ color: theme.textSecondary, fontSize: '0.9em', lineHeight: '1.5' }}>
                  <p>{law.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'timeline':
        return renderTimelineView();
      case 'list':
        return renderListView();
      default:
        return renderTreeView();
    }
  };

  return (
    <div className="constitution-visualizer" style={{
      background: theme.background,
      color: theme.text,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <header style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid ' + theme.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '2em' }}>⚖️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8em' }}>Constitution Visualizer</h1>
            <p style={{ margin: '5px 0 0 0', color: theme.textSecondary }}>
              Sovereign Hive Constitutional Framework
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            style={{
              padding: '8px 16px',
              background: viewMode === 'tree' ? theme.primary : theme.surface,
              color: viewMode === 'tree' ? theme.secondary : theme.text,
              border: '1px solid ' + theme.border,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setViewMode('tree')}
          >
            🌳 Tree View
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: viewMode === 'list' ? theme.primary : theme.surface,
              color: viewMode === 'list' ? theme.secondary : theme.text,
              border: '1px solid ' + theme.border,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: viewMode === 'timeline' ? theme.primary : theme.surface,
              color: viewMode === 'timeline' ? theme.secondary : theme.text,
              border: '1px solid ' + theme.border,
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            onClick={() => setViewMode('timeline')}
          >
            📅 Timeline View
          </button>
        </div>
        {loading && (
          <div style={{ marginTop: '10px', color: theme.textSecondary, fontSize: '0.9em' }}>
            Loading constitution data from API...
          </div>
        )}
        {error && (
          <div style={{ marginTop: '10px', color: '#FF4444', fontSize: '0.9em' }}>
            API Error: {error} (using fallback data)
          </div>
        )}
      </header>

      <main>{renderCurrentView()}</main>

      <footer style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid ' + theme.border,
        textAlign: 'center',
        color: theme.textSecondary,
        fontSize: '0.85em'
      }}>
        <p>
          <strong>Total Laws:</strong> {laws.length} |
          <strong> Fixed:</strong> {lawsByTier.fixed.length} |
          <strong> Cardinal:</strong> {lawsByTier.cardinal.length} |
          <strong> Mutable:</strong> {lawsByTier.mutable.length}
        </p>
        <p>
          <strong>Current Version:</strong> {versionHistory.length > 0 ? versionHistory[0].version : 'Unknown'} |
          <strong>Last Updated:</strong> {versionHistory.length > 0 ? versionHistory[0].date : 'Unknown'} |
          <strong>Constitutional Basis:</strong> Ma'at (Truth, Balance, Order)
        </p>
      </footer>
    </div>
  );
};

export default ConstitutionVisualizer;