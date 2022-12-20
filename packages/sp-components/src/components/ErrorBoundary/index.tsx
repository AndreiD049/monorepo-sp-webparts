import * as React from 'react';

type IErrorBoundaryState = {
    hasError: boolean;
}

export class ErrorBoundary extends React.Component<{}, IErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went very wrong.</h1>;
    }
    return this.props.children;
  }
}
