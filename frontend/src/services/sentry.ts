import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry with configuration from environment variables.
//
// Task 4 (2026-08-02): genuine no-op with no VITE_SENTRY_DSN set — the only
// gate on every exported function below. Default PII collection is disabled
// (sendDefaultPii stays false/unset, and beforeSend strips request cookies/
// headers Sentry would otherwise attach) and the trace sample rate is
// conservative, not 100%, since this fires on real founder/visitor traffic.
// `frontend_surface` is tagged so events are attributable to the React
// Command Center (this file) vs. the legacy docs/command-center.html static
// page, which has no build step and so cannot import this module — see that
// file's own inline comment for its separate, manual wiring note.
export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      environment: import.meta.env.MODE || 'development',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      beforeSend(event) {
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
      initialScope: {
        tags: { frontend_surface: 'react-command-center' },
      },
    });
    console.log('Sentry initialized');
  } else {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
  }
};

// Capture error
export const captureError = (error: Error, context: Record<string, any> = {}) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { contexts: context });
  } else {
    console.error('Error:', error, context);
  }
};

// Capture message
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    switch (level) {
      case 'error':
        Sentry.captureMessage(message, 'error');
        break;
      case 'warning':
        Sentry.captureMessage(message, 'warning');
        break;
      default:
        Sentry.captureMessage(message, 'info');
    }
  } else {
    const levelUpper = level.toUpperCase();
    console.log(`[${levelUpper}] ${message}`);
  }
};

// Set user context
export const setSentryUser = (user: { id: string; name?: string; email?: string }) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      username: user.name,
      email: user.email,
    });
  }
};

// Set tag
export const setSentryTag = (key: string, value: string) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setTag(key, value);
  }
};

// Flush Sentry events (useful before page unload)
export const flushSentry = async () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    await Sentry.flush();
  }
};
