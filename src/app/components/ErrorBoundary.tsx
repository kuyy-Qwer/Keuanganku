import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  handleResetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_terms_accepted');
    localStorage.removeItem('onboarding_tour_pending');
    localStorage.removeItem('wallet_setup');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b1326',
            color: '#dae2fd',
            padding: '2rem',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: '#131b2e',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid rgba(78, 222, 163, 0.15)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                style={{
                  fontSize: '48px',
                  marginBottom: '1rem',
                }}
              >
                ⚠️
              </div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                Oops! Something went wrong
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                Aplikasi mengalami error. Silakan coba salah satu solusi di bawah.
              </p>
            </div>

            {/* Error Details */}
            <div
              style={{
                backgroundColor: '#0b1326',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ffb4ab',
                maxHeight: '200px',
                overflow: 'auto',
              }}
            >
              <strong>Error:</strong>
              <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo && (
                <>
                  <strong>Stack:</strong>
                  <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={this.handleReset}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4edea3, #00b4a2)',
                  color: '#003824',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                🔄 Reload Aplikasi
              </button>

              <button
                onClick={this.handleResetOnboarding}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 180, 171, 0.25)',
                  background: 'rgba(255, 180, 171, 0.1)',
                  color: '#ffb4ab',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                🔧 Reset Onboarding & Reload
              </button>

              <button
                onClick={() => window.location.href = '/debug/onboarding'}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(78, 222, 163, 0.25)',
                  background: 'rgba(78, 222, 163, 0.1)',
                  color: '#4edea3',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                🛠️ Buka Debug Tools
              </button>
            </div>

            {/* Help Text */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: 'rgba(78, 222, 163, 0.05)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#94a3b8',
              }}
            >
              <strong style={{ color: '#4edea3' }}>💡 Tips:</strong>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Buka Console (F12) untuk melihat error detail</li>
                <li>Coba clear browser cache dan reload</li>
                <li>Gunakan debug tools untuk reset onboarding</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
