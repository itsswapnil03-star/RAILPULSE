import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] p-6">
          <div className="bg-white border border-[#E2E8F0] p-8 rounded-2xl shadow-xl max-w-lg text-center">
            <div className="w-16 h-16 bg-[#EF4444]/10 text-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">RailMind System Diagnostics</h2>
            <p className="text-sm text-[#505f76] mb-6">
              A temporary interface exception occurred. The platform has auto-recovered.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/control';
              }}
              className="px-6 py-2.5 bg-[#006591] text-white rounded-xl text-sm font-semibold hover:bg-[#00557a] transition-all"
            >
              Reload Control Room
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
