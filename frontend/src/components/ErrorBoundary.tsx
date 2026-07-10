import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          padding: '2rem',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.4)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontFamily: 'monospace',
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Component error</p>
          <pre style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.25rem 0.75rem',
              background: 'rgba(239,68,68,0.3)',
              border: '1px solid rgba(239,68,68,0.6)',
              borderRadius: '4px',
              color: '#fca5a5',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
