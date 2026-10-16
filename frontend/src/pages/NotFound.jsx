import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-card text-center">
        <div className="not-found-icon">
          <GraduationCap size={48} className="text-primary" />
        </div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-desc">
          The requested page does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary mt-4">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
