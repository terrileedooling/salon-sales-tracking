import { AlertCircle } from 'lucide-react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <AlertCircle size={24} />
      <div className="error-content">
        <h3>Something went wrong</h3>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-secondary">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;