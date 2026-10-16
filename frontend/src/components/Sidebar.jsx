import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Award,
  FileCheck2,
  FileSpreadsheet,
  BarChart3,
  LogOut,
  FolderLock,
  Layers,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Student Profile', icon: UserCheck },
    { to: '/student/scholarships', label: 'Scholarships', icon: Award },
    { to: '/student/documents', label: 'Documents', icon: FileCheck2 },
    { to: '/student/applications', label: 'My Applications', icon: FileSpreadsheet },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/scholarships', label: 'Manage Scholarships', icon: Award },
    { to: '/admin/applications', label: 'Student Applications', icon: Layers },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="portal-sidebar">
      <div className="sidebar-user-card">
        <div className="avatar-circle">
          {isAdmin ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
        </div>
        <div className="user-details">
          <h4 className="user-fullname" title={user?.name}>
            {user?.name || 'User'}
          </h4>
          <span className="user-badge-pill">
            {isAdmin ? 'Portal Admin' : 'Registered Student'}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-title">
          {isAdmin ? 'ADMINISTRATIVE MENU' : 'STUDENT PORTAL'}
        </div>
        <ul className="sidebar-links-list">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} className="sidebar-icon" />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
