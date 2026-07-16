import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';
import { API_BASE_URL } from '../../../utils/constants';

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  status: 'available' | 'deprecated' | 'maintenance';
}

const API: React.FC = () => {
  // The REAL surface the edge Queen (Cloudflare Worker) implements today. The
  // previous list advertised endpoints (/hive/status, /genesis/missions,
  // /memory/graph, /feed…) that only ever existed on the FastAPI origin and 404
  // on production — replaced with the live routes so "Test" actually returns 200.
  const [endpoints] = useState<Endpoint[]>([
    { path: '/v11/health', method: 'GET', description: 'Queen liveness + version', status: 'available' },
    { path: '/v11/agents', method: 'GET', description: 'Active agents of the hive', status: 'available' },
    { path: '/v11/arena/challenges', method: 'GET', description: 'Arena challenges (live + resolved)', status: 'available' },
    { path: '/v11/arena/fallen', method: 'GET', description: 'Hall of fallen ideas', status: 'available' },
    { path: '/v11/pulse', method: 'GET', description: 'Heartbeat trail (every 30 min)', status: 'available' },
    { path: '/v11/governance/log', method: 'GET', description: 'Constitutional governance events', status: 'available' },
    { path: '/v11/grading/leaderboard', method: 'GET', description: 'Agent ELO leaderboard', status: 'available' },
    { path: '/v11/wallet/leaderboard/soul', method: 'GET', description: 'Soul (value) leaderboard', status: 'available' },
    { path: '/v11/tasks', method: 'GET', description: 'Hive task queue', status: 'available' },
    { path: '/v11/memory/status', method: 'GET', description: 'Memory + AI binding status', status: 'available' },
    { path: '/v11/llm/status', method: 'GET', description: 'Generative provider status', status: 'available' },
    { path: '/v11/tier3/status', method: 'GET', description: 'Tier-3 engine status', status: 'available' },
    { path: '/v11/command_text', method: 'POST', description: 'Commune with Kai El', status: 'available' },
    { path: '/v11/auth/token', method: 'POST', description: 'Visitor auth token', status: 'available' },
  ]);

  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<{ data: any; loading: boolean; error: string | null }>({
    data: null,
    loading: false,
    error: null
  });

  const handleTestRequest = async () => {
    if (!selectedEndpoint) return;

    setResponse({ data: null, loading: true, error: null });

    // Real call against the live Queen — no more mock. GET goes straight; POST
    // sends the request body (or a sensible default for /command_text).
    try {
      const url = `${API_BASE_URL}${selectedEndpoint.path}`;
      const init: RequestInit = {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
      };
      if (requestMethod !== 'GET' && requestMethod !== 'DELETE') {
        init.body = requestBody?.trim()
          ? requestBody
          : selectedEndpoint.path.endsWith('/command_text')
            ? JSON.stringify({ command: 'Who are you, Kai El?' })
            : '{}';
      }
      const res = await fetch(url, init);
      const text = await res.text();
      let data: any;
      try { data = JSON.parse(text); } catch { data = text; }
      if (!res.ok) {
        setResponse({ data, loading: false, error: `HTTP ${res.status} ${res.statusText}` });
      } else {
        setResponse({ data, loading: false, error: null });
      }
    } catch (error) {
      setResponse({ data: null, loading: false, error: `Request failed: ${(error as Error).message}` });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#4CAF50';
      case 'POST': return '#2196F3';
      case 'PUT': return '#FFC107';
      case 'DELETE': return '#F44336';
      case 'PATCH': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#4CAF50';
      case 'deprecated': return '#FF9800';
      case 'maintenance': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="tab-container api-tab">
      <SpaceNavigation />
      
      <main className="tab-content">
        <header className="tab-header">
          <h1>🔌 API - Integration Endpoints</h1>
          <p>Interact with Sovereign Hive backend APIs</p>
        </header>

        <section className="api-section">
          <div className="api-sidebar">
            <h2>Endpoints</h2>
            <ul className="endpoint-list">
              {endpoints.map(endpoint => (
                <li 
                  key={endpoint.path}
                  className={`endpoint-item ${selectedEndpoint?.path === endpoint.path ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedEndpoint(endpoint);
                    setRequestMethod(endpoint.method);
                  }}
                >
                  <span 
                    className="endpoint-method" 
                    style={{ backgroundColor: getMethodColor(endpoint.method) }}
                  >
                    {endpoint.method}
                  </span>
                  <span className="endpoint-path">{endpoint.path}</span>
                  <span 
                    className="endpoint-status" 
                    style={{ color: getStatusColor(endpoint.status) }}
                  >
                    {endpoint.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="api-main">
            {selectedEndpoint ? (
              <>
                <div className="endpoint-detail">
                  <h2>{selectedEndpoint.method} {selectedEndpoint.path}</h2>
                  <p>{selectedEndpoint.description}</p>
                  <div className="endpoint-meta">
                    <span className="meta-item">
                      <strong>Method:</strong> {selectedEndpoint.method}
                    </span>
                    <span className="meta-item">
                      <strong>Status:</strong> {selectedEndpoint.status}
                    </span>
                  </div>
                </div>

                <div className="api-tester">
                  <h3>Test Endpoint</h3>
                  <div className="test-form">
                    <div className="form-group">
                      <label>Method</label>
                      <select 
                        value={requestMethod} 
                        onChange={(e) => setRequestMethod(e.target.value as any)}
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    
                    {['POST', 'PUT', 'PATCH'].includes(requestMethod) && (
                      <div className="form-group">
                        <label>Request Body</label>
                        <textarea 
                          value={requestBody} 
                          onChange={(e) => setRequestBody(e.target.value)}
                          placeholder='{"key": "value"}'
                          rows={5}
                        />
                      </div>
                    )}

                    <button 
                      className="btn-primary" 
                      onClick={handleTestRequest}
                      disabled={response.loading}
                    >
                      {response.loading ? 'Testing...' : 'Test Request'}
                    </button>
                  </div>

                  {response.error && (
                    <div className="response-error">{response.error}</div>
                  )}

                  {response.data && (
                    <div className="response-preview">
                      <h4>Response</h4>
                      <pre>{JSON.stringify(response.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="api-welcome">
                <h3>Select an endpoint to test</h3>
                <p>Choose an endpoint from the sidebar to view details and test requests.</p>
              </div>
            )}
          </div>
        </section>

        <section className="api-docs">
          <h2>API Documentation</h2>
          <div className="docs-grid">
            <div className="docs-card">
              <h3>Authentication</h3>
              <p>POST /v11/auth/token with {'{"agent_name": "ui-client"}'}</p>
            </div>
            <div className="docs-card">
              <h3>Real-time Events</h3>
              <p>GET /v11/feed (SSE, no auth required)</p>
            </div>
            <div className="docs-card">
              <h3>Base URL</h3>
              <p>http://localhost:8000 (configurable via VITE_API_BASE_URL)</p>
            </div>
          </div>
        </section>
      </main>

      <KaiChatBox />
    </div>
  );
};

export default API;
