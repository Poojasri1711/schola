import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GraduationCap, Heart } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="main-layout-root">
      <Navbar />
      <main className="main-content-area">
        <Outlet />
      </main>
      <footer className="portal-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <GraduationCap size={20} className="footer-icon" />
              <span>ScholarshipHub</span>
            </div>
            <p className="footer-tagline">
              Empowering students through transparent, merit-based, and seamless financial aid.
            </p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/student/scholarships">Available Scholarships</Link></li>
              <li><Link to="/login">Student / Admin Sign In</Link></li>
              <li><Link to="/register">Student Registration</Link></li>
            </ul>
          </div>
          <div className="footer-security">
            <h4>Verification & Security</h4>
            <p>Role-Based Access Control, JWT Authentication, and Local Certificate Storage.</p>
            <span className="badge-tech">MERN Stack Mini Project</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ScholarshipHub - Scholarship Management Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
