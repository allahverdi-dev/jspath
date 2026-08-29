import { Component } from 'react';

/**
 * A failure inside one route must never take down the whole application.
 * `fallback` receives `{ error, reset }` so callers can render a recoverable UI.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfacing this is genuinely useful during development; in production it
    // gives a support-friendly trace in the user's own console.
    console.error('[jspath] render error:', error, info?.componentStack);
  }

  reset() {
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    const { fallback, children } = this.props;
    if (error) {
      return typeof fallback === 'function'
        ? fallback({ error, reset: this.reset })
        : (fallback ?? null);
    }
    return children;
  }
}
