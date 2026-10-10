import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon-box">
          <HelpCircle size={48} className="text-primary" />
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-desc">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div className="not-found-actions">
          <Link to="/dashboard" className="btn btn-primary">
            <Home size={16} />
            <span>Go to Dashboard</span>
          </Link>
          <Link to="/login" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
