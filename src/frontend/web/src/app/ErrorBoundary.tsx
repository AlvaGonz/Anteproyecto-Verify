import React from "react";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <img
              src="/brand/isotipo/ISOTIPO WHITE.optimized.svg"
              alt="VeriFinca"
              className="h-25 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>
        </div>
        <div className="vf-card py-8 px-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-[var(--color-brand-accent)] mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-text-strong)] mb-2">
            Algo salió mal
          </h2>
          <p className="text-[var(--color-text-strong)] opacity-60 mb-6">
            Ha ocurrido un error inesperado en la aplicación.
            {import.meta.env.DEV && error && (
              <pre className="mt-4 text-left bg-gray-100 p-4 rounded overflow-auto text-xs text-red-800">
                {error.toString()}
              </pre>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={resetErrorBoundary}
              className="vf-btn-primary"
            >
              Intentar de nuevo
            </button>
            <Link to="/" className="vf-btn-secondary">
              <Home className="w-4 h-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ponytail: stdlib React.Component — no need for react-error-boundary dep
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />;
    }
    return this.props.children;
  }
}
