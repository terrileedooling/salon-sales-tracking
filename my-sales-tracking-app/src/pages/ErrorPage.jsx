import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const ErrorPage = () => {
  // Don't use useRouteError() if you're not using data router
  // or handle both cases
  const error = window.location.pathname;
  
  return (
    <div className="error-page">
      <div className="error-content">
        <AlertCircle size={64} className="error-icon" />
        <h1>Oops! Page Not Found</h1>
        <p className="error-message">
          The page "{error}" doesn't exist or you don't have permission to access it.
        </p>
        <p className="error-description">
          Please check the URL or navigate back to the dashboard.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;