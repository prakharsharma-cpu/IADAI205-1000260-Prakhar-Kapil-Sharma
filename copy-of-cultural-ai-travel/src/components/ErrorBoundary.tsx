import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Something went wrong.';
      let details = '';

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore ${parsed.operationType} error: ${parsed.error}`;
            details = `Path: ${parsed.path || 'unknown'}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="p-8 bg-[#242731] rounded-3xl border border-red-500/30 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Unexpected Error</h2>
          <p className="text-gray-300 mb-2">{errorMessage}</p>
          {details && <p className="text-gray-500 text-sm mb-6">{details}</p>}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#d4f870] text-[#1a1c23] rounded-xl font-bold hover:bg-[#c2e65d] transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
