import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Users,
  Award,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  BarChart3,
  ArrowRight,
  ShieldAlert,
  Search,
  CheckSquare,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        const [reportsRes, appsRes] = await Promise.all([
          api.get('/admin/reports'),
          api.get('/admin/applications'),
        ]);

        if (isMounted) {
          if (reportsRes.data.success) {
            setStats(reportsRes.data.stats);
          }
          if (appsRes.data.success) {
            setRecentApplications(appsRes.data.applications.slice(0, 6));
          }
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading administrative dashboard..." />;
  }

  return (
    <div className="admin-dashboard-root">
      {/* Header Banner */}
      <div className="dashboard-header-banner">
        <div>
          <h1 className="dashboard-title">Administrative Operations Control</h1>
          <p className="dashboard-subtitle">
            Overview of applicant verifications, scholarship schemes, and processing metrics.
          </p>
        </div>
        <div className="header-action-group">
          <Link to="/admin/applications" className="btn btn-primary">
            <Layers size={16} /> Process Applications
          </Link>
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-soft">
            <Users size={22} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <h3 className="stat-value">{stats?.totalStudents ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-indigo-soft">
            <Award size={22} className="text-indigo" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Scholarships</span>
            <h3 className="stat-value">{stats?.totalScholarships ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple-soft">
            <Layers size={22} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Applications</span>
            <h3 className="stat-value">{stats?.totalApplications ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-soft">
            <Clock size={22} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Applications</span>
            <h3 className="stat-value">{stats?.pendingApplications ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-cyan-soft">
            <Search size={22} className="text-cyan" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Under Review</span>
            <h3 className="stat-value">{stats?.underReviewApplications ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-soft">
            <CheckCircle2 size={22} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Approved Applications</span>
            <h3 className="stat-value">{stats?.approvedApplications ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-rose-soft">
            <XCircle size={22} className="text-rose" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Rejected Applications</span>
            <h3 className="stat-value">{stats?.rejectedApplications ?? 0}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-orange-soft">
            <FileText size={22} className="text-orange" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Documents</span>
            <h3 className="stat-value">{stats?.pendingDocuments ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="quick-actions-section mt-6">
        <h3 className="section-heading">Administrative Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/admin/scholarships" className="action-card">
            <div className="action-icon">
              <Award size={20} />
            </div>
            <div>
              <h4>Manage Scholarships</h4>
              <p>Create, Edit, Publish & Remove Schemes</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>

          <Link to="/admin/applications" className="action-card">
            <div className="action-icon">
              <CheckSquare size={20} />
            </div>
            <div>
              <h4>Verify Applications</h4>
              <p>Review Profiles, Documents & Decisions</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>

          <Link to="/admin/reports" className="action-card">
            <div className="action-icon">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4>System Analytics & Reports</h4>
              <p>Applications by Category, Scheme & Course</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* Recent Applications for Review */}
      <div className="dashboard-table-card mt-6">
        <div className="card-header flex-between">
          <div>
            <h3 className="card-title">Recent Student Applications</h3>
            <p className="card-subtitle">Pending reviews and latest application submissions</p>
          </div>
          <Link to="/admin/applications" className="card-header-link">
            View All Applications <ArrowRight size={14} />
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <EmptyState
            title="No applications submitted"
            description="Student applications will appear here as soon as registered students submit their forms."
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Scholarship Scheme</th>
                  <th>Submission Date</th>
                  <th>Eligibility</th>
                  <th>Documents</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="font-semibold text-dark">
                        {app.studentId?.name || 'Applicant'}
                      </div>
                      <div className="text-xs text-muted">
                        {app.studentId?.email || ''}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">
                        {app.scholarshipId?.scholarshipName || 'Scholarship'}
                      </div>
                      <div className="text-xs text-muted">
                        ₹{Number(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={app.eligibilityStatus} />
                    </td>
                    <td>
                      <StatusBadge status={app.documentVerificationStatus} />
                    </td>
                    <td>
                      <StatusBadge status={app.applicationStatus} />
                    </td>
                    <td>
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
