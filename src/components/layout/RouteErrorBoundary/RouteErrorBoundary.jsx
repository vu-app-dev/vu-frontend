import { Component, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import './RouteErrorBoundary.css';

function getErrorMessage(error) {
  if (!error) return 'This route could not be rendered.';
  return error.message || String(error);
}

function RouteErrorFallback({ error, scope, onRetry, onLeave }) {
  return (
    <div className="route-error">
      <EmptyState
        icon={<AlertTriangle size={24} />}
        title={`${scope} stopped unexpectedly`}
        description={getErrorMessage(error)}
        action={
          <div className="route-error__actions">
            <Button variant="primary" iconLeft={<RotateCcw size={14} />} onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="ghost" iconLeft={<ArrowLeft size={14} />} onClick={onLeave}>
              Back to Safe Page
            </Button>
          </div>
        }
      />
    </div>
  );
}

RouteErrorFallback.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.instanceOf(Error),
    PropTypes.shape({ message: PropTypes.string }),
  ]),
  scope: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
};

class RouteErrorBoundaryInner extends Component {
  static getDerivedStateFromError(error) {
    return { error };
  }

  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleLeave = () => {
    this.setState({ error: null });
    this.props.onLeave();
  };

  render() {
    if (this.state.error) {
      return (
        <RouteErrorFallback
          error={this.state.error}
          scope={this.props.scope}
          onRetry={this.handleRetry}
          onLeave={this.handleLeave}
        />
      );
    }

    return this.props.children;
  }
}

RouteErrorBoundaryInner.propTypes = {
  children: PropTypes.node.isRequired,
  onLeave: PropTypes.func.isRequired,
  resetKey: PropTypes.string.isRequired,
  scope: PropTypes.string.isRequired,
};

export function RouteErrorBoundary({ children, fallbackPath = '/candidates', scope = 'Page' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const resetKey = `${location.pathname}${location.search}${location.hash}`;

  const handleLeave = useCallback(() => {
    navigate(fallbackPath, { replace: true });
  }, [fallbackPath, navigate]);

  return (
    <RouteErrorBoundaryInner resetKey={resetKey} scope={scope} onLeave={handleLeave}>
      {children}
    </RouteErrorBoundaryInner>
  );
}

RouteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallbackPath: PropTypes.string,
  scope: PropTypes.string,
};
