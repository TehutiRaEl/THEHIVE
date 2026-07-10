import React, { useState } from 'react';
import SpaceNavigation from '../../SpaceNavigation';
import KaiChatBox from '../../KaiChatBox';

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  status: 'available' | 'deprecated' | 'maintenance';
}

const API: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { path: '/v11/auth/token', method: 'POST', description: 'Get authentication token', status: 'available' },
    { path: '/v11/hive/status', method: 'GET', description: 'Get hive status', status: 'available' },
    { path: '/v11/colony/capabilities', method: 'GET', description: 'Get colony capabilities', status: 'available' },
    { path: '/v11/memory/graph', method: 'GET', description: 'Get memory graph data', status: 'available' },
    { path: '/v11/genesis/missions', method: 'GET', description: 'Get missions', status: 'available' },
    { path: '/v11/constitution', method: 'GET', description: 'Get constitution', status: 'available' },
    { path: '/v11/feed', method: 'GET', description: 'SSE event feed', status: 'available' },
    { path: '/v11/arena/projection', method: 'GET', description: 'Get arena projection', status: 'available' },
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
    
    try {
      // Mock API call - replace with actual implementation
      const mockResponse = {
        success: true,
        data: { message: 'Mock response for ' + selectedEndpoint.path },
        timestamp: new Date().toISOString()
      };
      
      setResponse({ data: mockResponse, loading: false, error: null });
    } catch (error) {
      setResponse({ data: null, loading: false, error: 'Request failed' });
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
              <p>POST /v11/auth/token with {"agent_name": "ui-client"}</p>
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
