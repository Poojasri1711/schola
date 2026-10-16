import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = ['student', 'admin'] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="denied-icon">🚫</div>
          <h2>403 - Access Denied</h2>
          <p>You do not have permission to access this page.</p>
          <a href={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="btn btn-primary">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export const AdminRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying administrator privileges..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <div className="denied-icon">🛡️</div>
          <h2>403 - Administrator Access Required</h2>
          <p>This section is restricted strictly to portal administrators.</p>
          <a href="/student/dashboard" className="btn btn-primary">
            Back to Student Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
