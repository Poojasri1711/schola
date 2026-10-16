import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  FileText,
  Award,
  BarChart2,
  Layers,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-box">
            <GraduationCap size={24} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">ScholarshipHub</span>
            <span className="brand-subtitle">Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav desktop-only">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link
                to="/student/scholarships"
                className={`nav-link ${
                  isActive('/student/scholarships') ? 'active' : ''
                }`}
              >
                Scholarships
              </Link>
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : isAdmin ? (
            <>
              <Link
                to="/admin/dashboard"
                className={`nav-link ${
                  isActive('/admin/dashboard') ? 'active' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/admin/scholarships"
                className={`nav-link ${
                  isActive('/admin/scholarships') ? 'active' : ''
                }`}
              >
                Scholarships
              </Link>
              <Link
                to="/admin/applications"
                className={`nav-link ${
                  isActive('/admin/applications') ? 'active' : ''
                }`}
              >
                Applications
              </Link>
              <Link
                to="/admin/reports"
                className={`nav-link ${
                  isActive('/admin/reports') ? 'active' : ''
                }`}
              >
                Reports
              </Link>

              <div className="user-profile-badge">
                <Shield size={16} className="text-primary" />
                <span className="user-name">{user.name}</span>
                <span className="role-tag admin">Admin</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/student/dashboard"
                className={`nav-link ${
                  isActive('/student/dashboard') ? 'active' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/student/scholarships"
                className={`nav-link ${
                  isActive('/student/scholarships') ? 'active' : ''
                }`}
              >
                Scholarships
              </Link>
              <Link
                to="/student/applications"
                className={`nav-link ${
                  isActive('/student/applications') ? 'active' : ''
                }`}
              >
                My Applications
              </Link>

              <div className="user-profile-badge">
                <User size={16} className="text-secondary" />
                <span className="user-name">{user.name}</span>
                <span className="role-tag student">Student</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Sign Out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu mobile-only">
          {!isAuthenticated ? (
            <div className="mobile-nav-links">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Home
              </Link>
              <Link
                to="/student/scholarships"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Scholarships
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-link highlight"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="mobile-nav-links">
              <div className="mobile-user-info">
                <strong>{user.name}</strong>
                <span className="text-muted">({user.role})</span>
              </div>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/scholarships"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Manage Scholarships
                  </Link>
                  <Link
                    to="/admin/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Student Applications
                  </Link>
                  <Link
                    to="/admin/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Reports
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/student/documents"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    My Documents
                  </Link>
                  <Link
                    to="/student/scholarships"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    Scholarships
                  </Link>
                  <Link
                    to="/student/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-link"
                  >
                    My Applications
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="mobile-logout-btn"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
