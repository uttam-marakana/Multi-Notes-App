import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("Error caught by boundary:", error, errorInfo);
    }

    // Here you could also log to an error reporting service
    // logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  return (
    <div
      className="error-fallback"
      style={{
        padding: "2rem",
        textAlign: "center",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-danger)",
        borderRadius: "0.5rem",
        margin: "2rem auto",
        maxWidth: "600px",
      }}
    >
      <h2 style={{ color: "var(--color-danger)", marginBottom: "1rem" }}>
        🚨 Something went wrong
      </h2>
      <p style={{ color: "var(--color-text)", marginBottom: "1.5rem" }}>
        We encountered an unexpected error. Please try refreshing the page.
      </p>

      {import.meta.env.DEV && (
        <details style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <summary style={{ cursor: "pointer", color: "var(--color-primary)" }}>
            Error Details (Development)
          </summary>
          <pre
            style={{
              backgroundColor: "var(--color-background)",
              padding: "1rem",
              borderRadius: "0.25rem",
              marginTop: "0.5rem",
              fontSize: "0.8rem",
              overflow: "auto",
              color: "var(--color-danger)",
            }}
          >
            {error && error.toString()}
          </pre>
        </details>
      )}

      <button
        onClick={resetError}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "0.25rem",
          cursor: "pointer",
          marginRight: "0.5rem",
        }}
      >
        Try Again
      </button>

      <button
        onClick={() => window.location.reload()}
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
      >
        Refresh Page
      </button>
    </div>
  );
};

export default ErrorBoundary;
