import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSentry } from './services/sentry';

// No-op with no VITE_SENTRY_DSN set (see services/sentry.ts) — safe to call
// unconditionally at every app boot.
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
